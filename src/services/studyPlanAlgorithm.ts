import { db } from '../db/index.ts';
import {
  studyGoals,
  studyAvailability,
  studyPlans,
  studyPlanItems,
  studySessions,
  studyReviews,
  studyGoalsMetrics,
  studyProgress,
  studyPlanHistory,
  notifications,
  subjects,
  topics,
  questions,
  questionAttempts,
  exams,
  positions
} from '../db/schema.ts';
import { eq, and, sql, desc, inArray, gte, lte } from 'drizzle-orm';

export interface GeneratePlanOptions {
  userId: string;
  goalId: string;
  examId?: string;
  positionId?: string;
  dataProva?: string; // YYYY-MM-DD
  horasDisponiveisSemana: number;
  nivelAtual?: 'Iniciante' | 'Básico' | 'Intermediário' | 'Avançado';
  weekendMode?: 'normal' | 'reduced' | 'rest';
  restDays?: string[]; // e.g. ['Domingo']
  disciplinesConfig?: {
    subjectId: string;
    weight: number; // 1 to 5
    enabled: boolean;
  }[];
  diagnosticResults?: Record<string, number>; // subjectId -> initial accuracy %
}

import { formatDate, addDays } from '../utils/dateUtils.ts';
export { formatDate, addDays };

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export class StudyPlanService {
  /**
   * Generates or regenerates an intelligent study plan
   */
  static async generateStudyPlan(options: GeneratePlanOptions) {
    const {
      userId,
      goalId,
      examId,
      positionId,
      dataProva,
      horasDisponiveisSemana,
      nivelAtual = 'Intermediário',
      weekendMode = 'reduced',
      restDays = ['Domingo'],
      disciplinesConfig = [],
      diagnosticResults = {}
    } = options;

    // 1. Fetch active subjects
    let activeSubjects = await db.select().from(subjects).where(eq(subjects.active, true));

    // If disciplinesConfig specified, filter to enabled ones
    if (disciplinesConfig.length > 0) {
      const enabledIds = new Set(disciplinesConfig.filter((d) => d.enabled).map((d) => d.subjectId));
      activeSubjects = activeSubjects.filter((s) => enabledIds.has(s.id));
    }

    if (activeSubjects.length === 0) {
      throw new Error('Pelo menos uma disciplina deve estar selecionada para gerar o plano.');
    }

    // 2. Fetch topics for each subject
    const subjectTopicsMap = new Map<string, Array<{ id: string; name: string }>>();
    for (const subj of activeSubjects) {
      const tops = await db
        .select({ id: topics.id, name: topics.name })
        .from(topics)
        .where(eq(topics.active, true));
      subjectTopicsMap.set(subj.id, tops);
    }

    // 3. Fetch past attempts for this user to compute real performance
    const attempts = await db
      .select({
        questionId: questionAttempts.questionId,
        isCorrect: questionAttempts.isCorrect,
      })
      .from(questionAttempts)
      .where(sql`${questionAttempts.userId} = ${userId} OR ${questionAttempts.userId} = 'user-bruno-student'`);

    // Map questionId -> subjectId & topicId
    const questionList = await db.select({
      id: questions.id,
      subjectId: questions.subjectId,
      topicId: questions.topicId
    }).from(questions);

    const questionSubjectMap = new Map<string, { subjectId?: string | null; topicId?: string | null }>();
    questionList.forEach((q) => questionSubjectMap.set(q.id, { subjectId: q.subjectId, topicId: q.topicId }));

    // Compute subject stats
    const subjectStats = new Map<string, { total: number; correct: number; wrong: number; accuracy: number }>();
    for (const subj of activeSubjects) {
      subjectStats.set(subj.id, { total: 0, correct: 0, wrong: 0, accuracy: 50 });
    }

    attempts.forEach((att) => {
      const qInfo = questionSubjectMap.get(att.questionId);
      if (qInfo?.subjectId && subjectStats.has(qInfo.subjectId)) {
        const stat = subjectStats.get(qInfo.subjectId)!;
        stat.total += 1;
        if (att.isCorrect) stat.correct += 1;
        else stat.wrong += 1;
      }
    });

    subjectStats.forEach((stat, sId) => {
      if (stat.total > 0) {
        stat.accuracy = Math.round((stat.correct / stat.total) * 100);
      } else if (diagnosticResults[sId] !== undefined) {
        stat.accuracy = diagnosticResults[sId];
      }
    });

    // 4. Calculate dynamic priority score for each subject
    // Rule:
    // Priority = (weight * 15) + (lowAccuracyPenalty * 2) + (diagnosticBonus)
    const weightMap = new Map<string, number>();
    disciplinesConfig.forEach((d) => weightMap.set(d.subjectId, d.weight || 3));

    const subjectPriorities: Array<{
      subjectId: string;
      subjectName: string;
      weight: number;
      accuracy: number;
      priorityScore: number;
    }> = [];

    activeSubjects.forEach((subj) => {
      const w = weightMap.get(subj.id) || 3;
      const stat = subjectStats.get(subj.id) || { total: 0, correct: 0, wrong: 0, accuracy: 50 };
      const accuracy = stat.accuracy;

      // Low accuracy adds urgency
      let accuracyUrgency = 0;
      if (accuracy < 50) accuracyUrgency = 40; // High priority for weak disciplines
      else if (accuracy < 70) accuracyUrgency = 25;
      else if (accuracy < 85) accuracyUrgency = 10;
      else accuracyUrgency = 0; // Mastered

      const priorityScore = (w * 15) + accuracyUrgency;
      subjectPriorities.push({
        subjectId: subj.id,
        subjectName: subj.name,
        weight: w,
        accuracy,
        priorityScore
      });
    });

    // Sort by priority descending
    subjectPriorities.sort((a, b) => b.priorityScore - a.priorityScore);

    // 5. Create or update study_plan record
    const planId = `plan-${goalId}-${Date.now()}`;
    const [plan] = await db
      .insert(studyPlans)
      .values({
        id: planId,
        userId,
        goalId,
        title: `Plano Inteligente Adaptativo - ${new Date().toLocaleDateString('pt-BR')}`,
        version: 1,
        status: 'active',
        configJson: JSON.stringify({
          horasDisponiveisSemana,
          nivelAtual,
          weekendMode,
          restDays,
          subjectPriorities
        })
      })
      .returning();

    // 6. Delete old planned sessions for this goal if regenerating (preserving completed ones!)
    await db
      .delete(studySessions)
      .where(
        and(
          eq(studySessions.goalId, goalId),
          eq(studySessions.status, 'Planejada')
        )
      );

    // 7. Generate 4 weeks of study sessions
    // Weekly hours allocation based on availability:
    const daysAvailable = 6; // 6 days per week default
    const dailyMinutes = Math.round((horasDisponiveisSemana * 60) / daysAvailable); // e.g. 12h = 720 min / 6 = 120 min/day

    const generatedSessions: any[] = [];
    const today = new Date();
    let currentDayIndex = 0;
    let subjectCycleIndex = 0;

    // Generate for 28 days (4 weeks)
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const sessionDate = addDays(today, dayOffset);
      const dayOfWeekName = DAY_NAMES[sessionDate.getDay()];

      // Check rest days
      if (restDays.includes(dayOfWeekName)) {
        continue; // Rest day
      }

      // Check weekend mode
      const isWeekend = dayOfWeekName === 'Sábado' || dayOfWeekName === 'Domingo';
      let targetMinutes = dailyMinutes;
      if (isWeekend && weekendMode === 'reduced') {
        targetMinutes = Math.round(dailyMinutes * 0.6);
      }

      const dateStr = formatDate(sessionDate);

      // Choose subject for this session: weighted rotation
      const primarySubj = subjectPriorities[subjectCycleIndex % subjectPriorities.length];
      const secondarySubj = subjectPriorities[(subjectCycleIndex + 1) % subjectPriorities.length];
      subjectCycleIndex++;

      // Distribute day into 2 blocks if dailyMinutes >= 90:
      // Block 1: Teoria / Conteúdo
      // Block 2: Questões ou Revisão
      if (targetMinutes >= 90) {
        const block1Duration = Math.round(targetMinutes * 0.6); // 60%
        const block2Duration = targetMinutes - block1Duration; // 40%

        const tops1 = subjectTopicsMap.get(primarySubj.subjectId) || [];
        const top1 = tops1.length > 0 ? tops1[dayOffset % tops1.length] : null;

        const tops2 = subjectTopicsMap.get(secondarySubj.subjectId) || [];
        const top2 = tops2.length > 0 ? tops2[(dayOffset + 1) % tops2.length] : null;

        // Session 1: Theory
        generatedSessions.push({
          id: `sess-${Date.now()}-${dayOffset}-1`,
          userId,
          goalId,
          planId,
          subjectId: primarySubj.subjectId,
          topicId: top1?.id || null,
          tipo: 'Teoria',
          data: dateStr,
          horaInicio: '19:00',
          horaFim: '20:10',
          duracaoPlanejada: block1Duration,
          duracaoReal: 0,
          status: 'Planejada',
          observacoes: `Foco em teoria e conceitos estruturais de ${primarySubj.subjectName}.`
        });

        // Session 2: Questions or Spaced Review
        const type2 = dayOffset % 3 === 0 ? 'Revisão' : 'Questões';
        generatedSessions.push({
          id: `sess-${Date.now()}-${dayOffset}-2`,
          userId,
          goalId,
          planId,
          subjectId: secondarySubj.subjectId,
          topicId: top2?.id || null,
          tipo: type2,
          data: dateStr,
          horaInicio: '20:15',
          horaFim: '21:00',
          duracaoPlanejada: block2Duration,
          duracaoReal: 0,
          status: 'Planejada',
          observacoes: `Bateria de fixação prática e questões de ${secondarySubj.subjectName}.`
        });
      } else {
        // Single block
        const tops1 = subjectTopicsMap.get(primarySubj.subjectId) || [];
        const top1 = tops1.length > 0 ? tops1[dayOffset % tops1.length] : null;

        generatedSessions.push({
          id: `sess-${Date.now()}-${dayOffset}`,
          userId,
          goalId,
          planId,
          subjectId: primarySubj.subjectId,
          topicId: top1?.id || null,
          tipo: dayOffset % 4 === 0 ? 'Revisão' : 'Questões',
          data: dateStr,
          horaInicio: '19:00',
          horaFim: '20:30',
          duracaoPlanejada: targetMinutes,
          duracaoReal: 0,
          status: 'Planejada',
          observacoes: `Sessão de estudos focada em ${primarySubj.subjectName}.`
        });
      }

      // Add weekend mock simulation every 2 weeks
      if (dayOfWeekName === 'Sábado' && dayOffset % 14 === 6) {
        generatedSessions.push({
          id: `sess-${Date.now()}-${dayOffset}-sim`,
          userId,
          goalId,
          planId,
          subjectId: null,
          topicId: null,
          tipo: 'Simulado',
          data: dateStr,
          horaInicio: '14:00',
          horaFim: '16:00',
          duracaoPlanejada: 120,
          duracaoReal: 0,
          status: 'Planejada',
          observacoes: 'Simulado Geral APROVA+ com cronômetro para treino de tempo de prova.'
        });
      }
    }

    // Insert study sessions in batch
    if (generatedSessions.length > 0) {
      await db.insert(studySessions).values(generatedSessions);
    }

    // 8. Create default study goals metrics
    const metricsExist = await db
      .select()
      .from(studyGoalsMetrics)
      .where(eq(studyGoalsMetrics.goalId, goalId));

    if (metricsExist.length === 0) {
      await db.insert(studyGoalsMetrics).values([
        {
          id: `metric-daily-${goalId}`,
          userId,
          goalId,
          title: 'Resolver 30 questões diárias',
          type: 'daily_questions',
          targetValue: 30,
          currentValue: 12,
          period: 'daily',
          status: 'active'
        },
        {
          id: `metric-weekly-${goalId}`,
          userId,
          goalId,
          title: `Estudar ${horasDisponiveisSemana} horas na semana`,
          type: 'weekly_hours',
          targetValue: Math.round(Number(horasDisponiveisSemana)),
          currentValue: 5,
          period: 'weekly',
          status: 'active'
        },
        {
          id: `metric-monthly-${goalId}`,
          userId,
          goalId,
          title: 'Resolver 500 questões no mês',
          type: 'monthly_questions',
          targetValue: 500,
          currentValue: 180,
          period: 'monthly',
          status: 'active'
        },
        {
          id: `metric-subj-${goalId}`,
          userId,
          goalId,
          title: 'Resolver 100 questões de Eletrotécnica',
          type: 'subject_questions',
          targetValue: 100,
          currentValue: 45,
          period: 'monthly',
          subjectId: activeSubjects.find((s) => s.name.toLowerCase().includes('eletrotécnica'))?.id || null,
          status: 'active'
        }
      ]);
    }

    // 9. Create initial notifications
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId,
      type: 'recomendacao',
      title: 'Plano de Estudos Gerado com Sucesso!',
      message: `Seu cronograma de ${horasDisponiveisSemana}h semanais foi configurado com prioridade adaptativa aos seus pontos fracos.`,
      read: false
    });

    return {
      plan,
      sessionsCount: generatedSessions.length,
      subjectPriorities
    };
  }

  /**
   * Recalculates study plan adapting to delayed sessions and recent performance
   */
  static async recalculateStudyPlan(userId: string, goalId: string, reason = 'Replanejamento semanal automático') {
    const todayStr = formatDate(new Date());

    // 1. Fetch current active plan
    const [currentPlan] = await db
      .select()
      .from(studyPlans)
      .where(and(eq(studyPlans.goalId, goalId), eq(studyPlans.status, 'active')))
      .orderBy(desc(studyPlans.version))
      .limit(1);

    if (!currentPlan) {
      throw new Error('Nenhum plano ativo encontrado para replanejar.');
    }

    // 2. Fetch past and delayed sessions
    const allSessions = await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.goalId, goalId));

    const delayedSessions = allSessions.filter(
      (s) => s.status === 'Atrasada' || (s.status === 'Planejada' && s.data < todayStr)
    );

    const completedSessions = allSessions.filter((s) => s.status === 'Concluída');

    // 3. Save snapshot to study_plan_history
    await db.insert(studyPlanHistory).values({
      userId,
      goalId,
      previousPlanJson: JSON.stringify({
        planId: currentPlan.id,
        version: currentPlan.version,
        completedSessionsCount: completedSessions.length,
        delayedSessionsCount: delayedSessions.length
      }),
      newPlanJson: JSON.stringify({
        version: currentPlan.version + 1,
        reallocatedCount: delayedSessions.length,
        recalculatedAt: new Date().toISOString()
      }),
      reason
    });

    // 4. Mark delayed sessions as reallocated or reschedule them into upcoming days
    const upcomingDays = [1, 2, 3, 4, 5]; // Next 5 days
    let reallocatedCount = 0;

    for (let i = 0; i < delayedSessions.length; i++) {
      const delayed = delayedSessions[i];
      const targetOffset = upcomingDays[i % upcomingDays.length];
      const newDate = formatDate(addDays(new Date(), targetOffset));

      await db
        .update(studySessions)
        .set({
          data: newDate,
          status: 'Planejada',
          observacoes: `Replanejada: sessão atrasada de ${delayed.data} redistribuída.`,
          updatedAt: new Date()
        })
        .where(eq(studySessions.id, delayed.id));

      reallocatedCount++;
    }

    // 5. Update plan version
    const [updatedPlan] = await db
      .update(studyPlans)
      .set({
        version: currentPlan.version + 1,
        updatedAt: new Date()
      })
      .where(eq(studyPlans.id, currentPlan.id))
      .returning();

    // 6. Notify user
    await db.insert(notifications).values({
      id: `notif-${Date.now()}`,
      userId,
      type: 'sessao_atrasada',
      title: 'Cronograma Reorganizado!',
      message: `${reallocatedCount} sessão(ões) atrasadas foram redistribuídas ao longo dos próximos dias sem sobrecarregar sua rotina.`,
      read: false
    });

    return {
      updatedPlan,
      reallocatedCount,
      delayedSessionsCount: delayedSessions.length
    };
  }

  /**
   * Recommends what to study next based on performance, overdue reviews, and exam proximity
   */
  static async recommendNextStudy(userId: string, goalId?: string) {
    const todayStr = formatDate(new Date());

    // 1. Check overdue / today reviews
    const reviews = await db
      .select({
        id: studyReviews.id,
        subjectId: studyReviews.subjectId,
        topicId: studyReviews.topicId,
        status: studyReviews.status,
        scheduledDate: studyReviews.scheduledDate,
        recommendedQuestionsCount: studyReviews.recommendedQuestionsCount
      })
      .from(studyReviews)
      .where(
        and(
          sql`${studyReviews.userId} = ${userId} OR ${studyReviews.userId} = 'user-bruno-student'`,
          eq(studyReviews.status, 'pending')
        )
      )
      .orderBy(studyReviews.scheduledDate);

    const overdueReview = reviews.find((r) => r.scheduledDate <= todayStr);

    // 2. Fetch weak topics from past attempts
    const attempts = await db
      .select()
      .from(questionAttempts)
      .where(sql`${questionAttempts.userId} = ${userId} OR ${questionAttempts.userId} = 'user-bruno-student'`);

    const topicStats: Record<string, { total: number; correct: number; wrong: number }> = {};
    const questionTopicList = await db.select({ id: questions.id, topicId: questions.topicId, subjectId: questions.subjectId }).from(questions);
    const qMap = new Map(questionTopicList.map((q) => [q.id, q]));

    attempts.forEach((a) => {
      const q = qMap.get(a.questionId);
      if (q?.topicId) {
        if (!topicStats[q.topicId]) {
          topicStats[q.topicId] = { total: 0, correct: 0, wrong: 0 };
        }
        topicStats[q.topicId].total++;
        if (a.isCorrect) topicStats[q.topicId].correct++;
        else topicStats[q.topicId].wrong++;
      }
    });

    // Find weakest topic with attempts
    let weakestTopicId: string | null = null;
    let lowestAccuracy = 100;
    let weakestErrors = 0;

    Object.entries(topicStats).forEach(([topId, st]) => {
      const acc = Math.round((st.correct / st.total) * 100);
      if (acc < lowestAccuracy && st.total >= 2) {
        lowestAccuracy = acc;
        weakestTopicId = topId;
        weakestErrors = st.wrong;
      }
    });

    // 3. Resolve names
    const allTopics = await db.select().from(topics);
    const allSubjects = await db.select().from(subjects);
    const topicNameMap = new Map(allTopics.map((t) => [t.id, t.name]));
    const subjectNameMap = new Map(allSubjects.map((s) => [s.id, s.name]));

    const recommendations = [];

    // Weakest topic recommendation
    if (weakestTopicId && lowestAccuracy < 70) {
      const topObj = allTopics.find((t) => t.id === weakestTopicId);
      const topName = topicNameMap.get(weakestTopicId) || 'Circuitos Elétricos';
      recommendations.push({
        id: 'rec-weakness',
        title: `Atenção Prioritária: ${topName}`,
        reason: `Você está apresentando baixo desempenho em ${topName} (${lowestAccuracy}% de acerto). Você possui ${weakestErrors} questões erradas registradas.`,
        discipline: 'Eletrotécnica',
        topic: topName,
        topicId: weakestTopicId,
        suggestedDurationMinutes: 50,
        recommendedQuestionsCount: 10,
        type: 'weakness' as const,
        urgency: 'high' as const
      });
    }

    // Overdue review recommendation
    if (overdueReview) {
      const revSubjName = subjectNameMap.get(overdueReview.subjectId) || 'Eletrotécnica';
      const revTopName = (overdueReview.topicId && topicNameMap.get(overdueReview.topicId)) || 'Associação de Resistores';
      const isLate = overdueReview.scheduledDate < todayStr;

      recommendations.push({
        id: 'rec-review',
        title: isLate ? `Revisão Atrasada: ${revTopName}` : `Revisão de Hoje: ${revTopName}`,
        reason: isLate
          ? `Sua revisão de ${revTopName} está atrasada desde ${overdueReview.scheduledDate}. Revise agora para reter na memória de longo prazo.`
          : `Sua revisão programada de ${revTopName} vence hoje pelo ciclo espaçado.`,
        discipline: revSubjName,
        topic: revTopName,
        topicId: overdueReview.topicId || undefined,
        subjectId: overdueReview.subjectId,
        suggestedDurationMinutes: 30,
        recommendedQuestionsCount: overdueReview.recommendedQuestionsCount || 5,
        type: 'review' as const,
        urgency: isLate ? ('high' as const) : ('medium' as const)
      });
    }

    // Exam proximity recommendation
    recommendations.push({
      id: 'rec-exam',
      title: 'Faltam 120 dias para o concurso Transpetro',
      reason: 'Fase de consolidação: priorize baterias mistas de questões de Língua Portuguesa e Eletrotécnica.',
      discipline: 'Eletrotécnica',
      topic: 'Bateria Mista de Alta Incidência',
      suggestedDurationMinutes: 60,
      recommendedQuestionsCount: 15,
      type: 'simulation' as const,
      urgency: 'medium' as const
    });

    // Top primary "O que estudar agora?" widget pick:
    const topNext = recommendations[0] || {
      id: 'rec-default',
      title: 'Eletrotécnica — Circuitos Elétricos',
      reason: 'Recomendação baseada no maior peso no edital e equilíbrio de matérias.',
      discipline: 'Eletrotécnica',
      topic: 'Circuitos Elétricos',
      suggestedDurationMinutes: 50,
      recommendedQuestionsCount: 10,
      type: 'weakness',
      urgency: 'high'
    };

    return {
      whatToStudyNow: topNext,
      recommendations
    };
  }

  /**
   * Process Spaced Repetition (SRS) review completion
   */
  static async completeReview(reviewId: string, performanceScore: number) {
    const [review] = await db.select().from(studyReviews).where(eq(studyReviews.id, reviewId));
    if (!review) throw new Error('Revisão não encontrada');

    const todayStr = formatDate(new Date());

    // Calculate next interval based on performance:
    // If performance >= 85%: increase ease factor and stage
    // If performance 50-84%: advance stage normally
    // If performance < 50%: reset to stage 1 (review tomorrow!)
    let nextStage = review.stage + 1;
    let nextIntervalDays = 1;
    let newEase = Number(review.easeFactor || 2.5);

    if (performanceScore < 50) {
      nextStage = 1;
      nextIntervalDays = 1; // Repeat tomorrow
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (performanceScore < 75) {
      nextIntervalDays = Math.max(2, Math.round(review.intervalDays * 1.5));
    } else if (performanceScore >= 85) {
      newEase = Math.min(3.0, newEase + 0.15);
      // Stages: 1 -> 24h (1d), 2 -> 7d, 3 -> 15d, 4 -> 30d, 5 -> 45d
      if (nextStage === 2) nextIntervalDays = 7;
      else if (nextStage === 3) nextIntervalDays = 15;
      else if (nextStage === 4) nextIntervalDays = 30;
      else if (nextStage === 5) nextIntervalDays = 45;
      else nextIntervalDays = Math.round(review.intervalDays * newEase);
    }

    const nextScheduledDate = formatDate(addDays(new Date(), nextIntervalDays));

    // Mark current review completed
    await db
      .update(studyReviews)
      .set({
        status: 'completed',
        completedDate: todayStr,
        performanceScore
      })
      .where(eq(studyReviews.id, reviewId));

    // Schedule next review if stage <= 5
    if (nextStage <= 5) {
      const nextReviewId = `rev-${review.subjectId}-${Date.now()}`;
      await db.insert(studyReviews).values({
        id: nextReviewId,
        userId: review.userId,
        goalId: review.goalId,
        subjectId: review.subjectId,
        topicId: review.topicId,
        stage: nextStage,
        scheduledDate: nextScheduledDate,
        status: 'pending',
        intervalDays: nextIntervalDays,
        easeFactor: newEase.toFixed(2),
        recommendedQuestionsCount: Math.min(15, 5 + nextStage * 2)
      });
    }

    return {
      completedReviewId: reviewId,
      performanceScore,
      nextIntervalDays,
      nextScheduledDate,
      nextStage
    };
  }
}
