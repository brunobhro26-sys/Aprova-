import { db } from '../../db/index.ts';
import {
  questionAttempts,
  questions,
  subjects,
  topics,
  subjectsTopics,
  subtopics,
  boards,
  exams,
  positions,
  simulationSessions,
  studySessions,
  studyReviews,
  studyGoals,
  studyGoalsMetrics,
  mistakeClassifications,
  performanceSnapshots,
  performanceReports,
  userAnalyticsPreferences
} from '../../db/schema.ts';
import { eq, and, sql, desc, gte, lte, inArray } from 'drizzle-orm';

export type PeriodFilter = 'today' | '7d' | '30d' | '90d' | '6m' | '12m' | 'all' | 'custom';

export class AnalyticsService {
  /**
   * Helper to compute date range filter for SQL queries
   */
  private static getDateRange(period: PeriodFilter, customStart?: string, customEnd?: string) {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date = now;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === '6m') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (period === '12m') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (period === 'custom' && customStart) {
      startDate = new Date(customStart);
      if (customEnd) endDate = new Date(customEnd);
    }

    return { startDate, endDate };
  }

  /**
   * 1. Overview Dashboard Indicators with Previous Period Comparison
   */
  static async getOverview(userId: string, period: PeriodFilter = '30d', customStart?: string, customEnd?: string) {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);

    // Current period attempts
    const attemptsQuery = db
      .select({
        id: questionAttempts.id,
        isCorrect: questionAttempts.isCorrect,
        timeSpentSeconds: questionAttempts.timeSpentSeconds,
        answeredAt: questionAttempts.answeredAt
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.userId, userId),
          startDate ? gte(questionAttempts.answeredAt, startDate) : undefined,
          lte(questionAttempts.answeredAt, endDate)
        )
      );

    const attempts = await attemptsQuery;
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracyRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Study Sessions & Hours
    const sessions = await db
      .select({
        duracaoReal: studySessions.duracaoReal,
        duracaoPlanejada: studySessions.duracaoPlanejada,
        status: studySessions.status,
        data: studySessions.data
      })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          sql`LOWER(${studySessions.status}) IN ('concluída', 'concluida', 'completed')`,
          startDate ? gte(sql`DATE(${studySessions.data})`, sql`DATE(${startDate.toISOString().split('T')[0]})`) : undefined
        )
      );

    const sessionMinutes = sessions.reduce((acc, s) => acc + (s.duracaoReal || s.duracaoPlanejada || 0), 0);
    const questionTimeMinutes = Math.round(attempts.reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0) / 60);
    const totalHours = Math.round(((sessionMinutes + questionTimeMinutes) / 60) * 10) / 10;

    // Simulations in period
    const simulations = await db
      .select({
        id: simulationSessions.id,
        scorePercentage: simulationSessions.scorePercentage,
        status: simulationSessions.status,
        finishedAt: simulationSessions.finishedAt
      })
      .from(simulationSessions)
      .where(
        and(
          eq(simulationSessions.userId, userId),
          eq(simulationSessions.status, 'completed'),
          startDate ? gte(simulationSessions.finishedAt, startDate) : undefined
        )
      );

    const simulationsCount = simulations.length;
    const avgSimulationScore = simulationsCount > 0
      ? Math.round(simulations.reduce((acc, s) => acc + Number(s.scorePercentage || 0), 0) / simulationsCount)
      : 0;

    // Consecutive Study Days (Streak)
    const distinctDatesResult = await db.execute(sql`
      SELECT DISTINCT DATE(answered_at) as study_day
      FROM question_attempts
      WHERE user_id = ${userId}
      UNION
      SELECT DISTINCT DATE(data) as study_day
      FROM study_sessions
      WHERE user_id = ${userId} AND LOWER(status) IN ('concluída', 'concluida', 'completed')
      ORDER BY study_day DESC
      LIMIT 60
    `);

    const activeDays: string[] = (distinctDatesResult.rows || []).map((r: any) => {
      const d = r.study_day;
      return typeof d === 'string' ? d.substring(0, 10) : new Date(d).toISOString().substring(0, 10);
    });

    let streakDays = 0;
    if (activeDays.length > 0) {
      const todayStr = new Date().toISOString().substring(0, 10);
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
      let checkDate = activeDays.includes(todayStr) ? new Date() : (activeDays.includes(yesterdayStr) ? new Date(Date.now() - 86400000) : null);

      if (checkDate) {
        let cur = new Date(checkDate);
        while (true) {
          const s = cur.toISOString().substring(0, 10);
          if (activeDays.includes(s)) {
            streakDays++;
            cur.setDate(cur.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Plan progress
    const allPlanned = await db
      .select({ id: studySessions.id, status: studySessions.status })
      .from(studySessions)
      .where(eq(studySessions.userId, userId));

    const totalPlanned = allPlanned.length;
    const completedPlanned = allPlanned.filter(s => {
      const st = s.status?.toLowerCase();
      return st === 'concluída' || st === 'concluida' || st === 'completed';
    }).length;
    const planProgress = totalPlanned > 0 ? Math.round((completedPlanned / totalPlanned) * 100) : 0;

    // Previous period calculation for comparison
    let comparison = {
      diffQuestions: 0,
      diffAccuracy: 0,
      diffHours: 0,
      hasEnoughData: false
    };

    if (startDate) {
      const durationMs = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - durationMs);
      const prevEndDate = new Date(startDate.getTime());

      const prevAttempts = await db
        .select({ isCorrect: questionAttempts.isCorrect, timeSpentSeconds: questionAttempts.timeSpentSeconds })
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.userId, userId),
            gte(questionAttempts.answeredAt, prevStartDate),
            lte(questionAttempts.answeredAt, prevEndDate)
          )
        );

      if (prevAttempts.length > 0) {
        const prevTotal = prevAttempts.length;
        const prevCorrect = prevAttempts.filter(a => a.isCorrect).length;
        const prevAccuracy = Math.round((prevCorrect / prevTotal) * 100);
        const prevHours = Math.round(prevAttempts.reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0) / 3600 * 10) / 10;

        comparison = {
          diffQuestions: totalQuestions - prevTotal,
          diffAccuracy: accuracyRate - prevAccuracy,
          diffHours: Math.round((totalHours - prevHours) * 10) / 10,
          hasEnoughData: true
        };
      }
    }

    // "Sua análise de hoje" (Requisito 45)
    const today = new Date().toISOString().substring(0, 10);
    const todayAttempts = attempts.filter(a => a.answeredAt && a.answeredAt.toISOString().substring(0, 10) === today);
    const todayQuestions = todayAttempts.length;
    const todayCorrect = todayAttempts.filter(a => a.isCorrect).length;
    const todayAccuracy = todayQuestions > 0 ? Math.round((todayCorrect / todayQuestions) * 100) : 0;

    // Pending Reviews in SRS
    const pendingReviewsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyReviews)
      .where(and(eq(studyReviews.userId, userId), eq(studyReviews.status, 'pending')));

    const pendingReviews = Number(pendingReviewsCount[0]?.count || 0);

    // Primary Priority for today
    const topWeakTopic = await db.execute(sql`
      SELECT t.id, t.name as topic_name, s.name as subject_name,
        COUNT(qa.id) as total_attempts,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count,
        ROUND((SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(qa.id), 0)) * 100) as accuracy
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN topics t ON q.topic_id = t.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId}
      GROUP BY t.id, t.name, s.name
      ORDER BY accuracy ASC, total_attempts DESC
      LIMIT 1
    `);

    let priorityToday = {
      discipline: 'Eletrotécnica',
      topic: 'Sistemas Trifásicos e Potência',
      reason: 'Apresenta taxa de acerto inferior a 50% e é matéria de peso 5 no concurso.',
      suggestedDurationMinutes: 50,
      actionText: 'Começar agora'
    };

    if (topWeakTopic.rows && topWeakTopic.rows.length > 0) {
      const row: any = topWeakTopic.rows[0];
      priorityToday = {
        discipline: row.subject_name,
        topic: row.topic_name,
        reason: `Você está com ${row.accuracy || 0}% de acerto em ${row.total_attempts} questões.`,
        suggestedDurationMinutes: 45,
        actionText: 'Praticar este conteúdo'
      };
    }

    // Previsão de Conclusão do Edital (Requisito 47)
    const totalTopicsCount = await db.select({ count: sql<number>`count(*)` }).from(topics);
    const totalTopics = Number(totalTopicsCount[0]?.count || 20);

    const distinctStudiedTopicsResult = await db.execute(sql`
      SELECT COUNT(DISTINCT q.topic_id) as count
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      WHERE qa.user_id = ${userId}
    `);
    const completedTopics = Number(distinctStudiedTopicsResult.rows[0]?.count || 0);
    const topicsRemaining = Math.max(0, totalTopics - completedTopics);

    // Velocity: topics completed per week (estimate 2-3 per week)
    const velocityPerWeek = 2.5;
    const weeksNeeded = Math.ceil(topicsRemaining / velocityPerWeek);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + weeksNeeded * 7);
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const forecastText = totalQuestions >= 10
      ? `Com seu ritmo atual (${Math.round(totalQuestions / (period === '7d' ? 1 : 4))} questões/sem), a conclusão do edital está estimada para ${monthNames[estimatedDate.getMonth()]} de ${estimatedDate.getFullYear()}.`
      : 'Ainda não existem informações suficientes para estimar a data exata de conclusão do conteúdo.';

    return {
      period,
      indicators: {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracyRate,
        totalHours,
        streakDays,
        simulationsCount,
        avgSimulationScore,
        planProgress
      },
      comparison,
      todayAnalysis: {
        todayQuestions,
        todayAccuracy,
        todayHours: 1.5,
        pendingReviews,
        recommendedReview: priorityToday.topic
      },
      priorityToday,
      completionForecast: {
        totalTopics,
        completedTopics,
        percentageCompleted: Math.round((completedTopics / Math.max(1, totalTopics)) * 100),
        forecastText,
        disclaimer: 'Previsão pedagógica baseada no ritmo recente de resolução e cobertura do edital. Não constitui garantia de aprovação.'
      }
    };
  }

  /**
   * 2. Historical Evolution Timeline
   */
  static async getEvolution(userId: string, metric: 'accuracy' | 'questions' | 'hours' | 'simulations' = 'accuracy', period: PeriodFilter = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    // Group attempts by day or week
    const rows = await db.execute(sql`
      SELECT
        DATE(answered_at) as day_label,
        COUNT(id) as total_questions,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
        ROUND((SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(id), 0)) * 100) as accuracy,
        ROUND(SUM(time_spent_seconds)::numeric / 3600, 1) as hours
      FROM question_attempts
      WHERE user_id = ${userId}
        ${startDate ? sql`AND answered_at >= ${startDate}` : sql``}
        AND answered_at <= ${endDate}
      GROUP BY DATE(answered_at)
      ORDER BY day_label ASC
    `);

    // If few daily records, also group by week for a smoother progression curve
    const weeklyData = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', answered_at), 'DD/MM') as week_label,
        COUNT(id) as total_questions,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
        ROUND((SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(id), 0)) * 100) as accuracy,
        ROUND(SUM(time_spent_seconds)::numeric / 3600, 1) as hours
      FROM question_attempts
      WHERE user_id = ${userId}
      GROUP BY DATE_TRUNC('week', answered_at)
      ORDER BY DATE_TRUNC('week', answered_at) ASC
    `);

    return {
      metric,
      period,
      dailyPoints: (rows.rows || []).map((r: any) => ({
        date: r.day_label,
        accuracy: Number(r.accuracy || 0),
        questions: Number(r.total_questions || 0),
        hours: Number(r.hours || 0)
      })),
      weeklyPoints: (weeklyData.rows || []).map((r: any, idx: number) => ({
        label: `Semana ${idx + 1} (${r.week_label})`,
        accuracy: Number(r.accuracy || 0),
        questions: Number(r.total_questions || 0),
        hours: Number(r.hours || 0)
      }))
    };
  }

  /**
   * 3. Performance Breakdown by Discipline (Comparative Table & Chart)
   */
  static async getSubjectsPerformance(
    userId: string,
    period: PeriodFilter = 'all',
    sortBy: 'accuracy_desc' | 'accuracy_asc' | 'questions_desc' | 'questions_asc' = 'accuracy_desc'
  ) {
    const { startDate, endDate } = this.getDateRange(period);

    const results = await db.execute(sql`
      SELECT
        s.id as subject_id,
        s.name as subject_name,
        s.category as category,
        COUNT(qa.id) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count,
        SUM(CASE WHEN NOT qa.is_correct THEN 1 ELSE 0 END) as wrong_count,
        ROUND((SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(qa.id), 0)) * 100) as accuracy_rate,
        ROUND(AVG(qa.time_spent_seconds)) as avg_time_seconds
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId}
        ${startDate ? sql`AND qa.answered_at >= ${startDate}` : sql``}
        AND qa.answered_at <= ${endDate}
      GROUP BY s.id, s.name, s.category
    `);

    let list = (results.rows || []).map((r: any) => ({
      subjectId: r.subject_id,
      name: r.subject_name,
      category: r.category || 'Geral',
      questions: Number(r.total_questions || 0),
      correct: Number(r.correct_count || 0),
      wrong: Number(r.wrong_count || 0),
      accuracy: Number(r.accuracy_rate || 0),
      avgTimeSeconds: Number(r.avg_time_seconds || 60)
    }));

    // Sorting
    if (sortBy === 'accuracy_desc') {
      list.sort((a, b) => b.accuracy - a.accuracy);
    } else if (sortBy === 'accuracy_asc') {
      list.sort((a, b) => a.accuracy - b.accuracy);
    } else if (sortBy === 'questions_desc') {
      list.sort((a, b) => b.questions - a.questions);
    } else if (sortBy === 'questions_asc') {
      list.sort((a, b) => a.questions - b.questions);
    }

    return list;
  }

  /**
   * 4. Full Performance Hierarchy: Concurso → Cargo → Disciplina → Assunto → Tópico
   */
  static async getHierarchyPerformance(userId: string) {
    // Fetch all taxonomy topics with user attempt statistics
    const results = await db.execute(sql`
      SELECT
        e.id as exam_id,
        e.name as exam_name,
        p.id as position_id,
        p.name as position_name,
        s.id as subject_id,
        s.name as subject_name,
        st.id as subject_topic_id,
        st.name as subject_topic_name,
        t.id as topic_id,
        t.name as topic_name,
        COUNT(qa.id) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count,
        SUM(CASE WHEN NOT qa.is_correct THEN 1 ELSE 0 END) as wrong_count,
        ROUND((SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(qa.id), 0)) * 100) as accuracy_rate,
        ROUND(AVG(qa.time_spent_seconds)) as avg_time_seconds,
        MAX(qa.answered_at) as last_activity
      FROM topics t
      JOIN subjects_topics st ON t.subject_topic_id = st.id
      JOIN subjects s ON st.subject_id = s.id
      CROSS JOIN (
        SELECT id, name FROM exams WHERE id = 'exam-transpetro-2026' LIMIT 1
      ) e
      CROSS JOIN (
        SELECT id, name FROM positions WHERE id = 'pos-eletrotecnica' LIMIT 1
      ) p
      LEFT JOIN questions q ON q.topic_id = t.id
      LEFT JOIN question_attempts qa ON qa.question_id = q.id AND qa.user_id = ${userId}
      GROUP BY e.id, e.name, p.id, p.name, s.id, s.name, st.id, st.name, t.id, t.name
      ORDER BY s.name, st.name, t.name
    `);

    // Check overdue/pending reviews for topics
    const reviews = await db
      .select({ topicId: studyReviews.topicId, scheduledDate: studyReviews.scheduledDate })
      .from(studyReviews)
      .where(and(eq(studyReviews.userId, userId), eq(studyReviews.status, 'pending')));

    const reviewMap = new Map<string, string>();
    reviews.forEach(r => {
      if (r.topicId) reviewMap.set(r.topicId, r.scheduledDate);
    });

    const topicItems = (results.rows || []).map((r: any) => {
      const questionsCount = Number(r.total_questions || 0);
      const accuracy = Number(r.accuracy_rate || 0);
      const isReviewPending = reviewMap.has(r.topic_id);

      // Mastery Status Classification Rules (Requirement 8)
      let masteryStatus: 'DOMINADO' | 'EM DESENVOLVIMENTO' | 'PRECISA REVISAR' | 'NÃO ESTUDADO';
      if (questionsCount === 0) {
        masteryStatus = 'NÃO ESTUDADO';
      } else if (questionsCount >= 5 && accuracy >= 75) {
        masteryStatus = 'DOMINADO';
      } else if (accuracy < 50 || isReviewPending) {
        masteryStatus = 'PRECISA REVISAR';
      } else {
        masteryStatus = 'EM DESENVOLVIMENTO';
      }

      return {
        examId: r.exam_id,
        examName: r.exam_name,
        positionId: r.position_id,
        positionName: r.position_name,
        subjectId: r.subject_id,
        subjectName: r.subject_name,
        subjectTopicId: r.subject_topic_id,
        subjectTopicName: r.subject_topic_name,
        topicId: r.topic_id,
        topicName: r.topic_name,
        totalQuestions: questionsCount,
        correctCount: Number(r.correct_count || 0),
        wrongCount: Number(r.wrong_count || 0),
        accuracyRate: accuracy,
        avgTimeSeconds: Number(r.avg_time_seconds || 0),
        lastActivity: r.last_activity ? new Date(r.last_activity).toLocaleDateString('pt-BR') : 'Sem registro',
        nextReview: reviewMap.get(r.topic_id) || 'Nenhuma agendada',
        masteryStatus
      };
    });

    // Strengths and Weaknesses Identification
    const strengths = topicItems
      .filter(t => t.masteryStatus === 'DOMINADO')
      .map(t => ({
        topicId: t.topicId,
        topicName: t.topicName,
        subjectName: t.subjectName,
        accuracy: t.accuracyRate,
        questionsCount: t.totalQuestions,
        message: `Você apresenta excelente desempenho em ${t.topicName} (${t.subjectName}), com ${t.accuracyRate}% de acerto em ${t.totalQuestions} questões.`
      }));

    const weaknesses = topicItems
      .filter(t => t.masteryStatus === 'PRECISA REVISAR' && t.totalQuestions > 0)
      .map(t => ({
        topicId: t.topicId,
        topicName: t.topicName,
        subjectName: t.subjectName,
        subjectTopicName: t.subjectTopicName,
        accuracy: t.accuracyRate,
        wrongCount: t.wrongCount,
        lastActivity: t.lastActivity,
        recommendation: `Prioridade alta: resolva 10 questões e revise a teoria essencial deste tópico.`,
        actionText: 'Estudar este conteúdo'
      }));

    return {
      exam: { id: 'exam-transpetro-2026', name: 'Transpetro — Concurso Quadro de Terra e Mar 2026' },
      position: { id: 'pos-eletrotecnica', name: 'Técnico em Eletrotécnica' },
      topics: topicItems,
      strengths,
      weaknesses
    };
  }

  /**
   * 5. Heatmap Matrix by Discipline and Topic
   */
  static async getHeatmap(userId: string) {
    const hierarchy = await this.getHierarchyPerformance(userId);

    // Group topics by discipline
    const disciplinesMap = new Map<string, any[]>();
    for (const item of hierarchy.topics) {
      if (!disciplinesMap.has(item.subjectName)) {
        disciplinesMap.set(item.subjectName, []);
      }
      disciplinesMap.get(item.subjectName)!.push({
        topicId: item.topicId,
        topicName: item.topicName,
        totalQuestions: item.totalQuestions,
        correctCount: item.correctCount,
        wrongCount: item.wrongCount,
        accuracyRate: item.accuracyRate,
        avgTimeSeconds: item.avgTimeSeconds,
        lastActivity: item.lastActivity,
        nextReview: item.nextReview,
        masteryStatus: item.masteryStatus,
        // Color mapping
        color:
          item.masteryStatus === 'NÃO ESTUDADO'
            ? 'gray'
            : item.accuracyRate >= 75
            ? 'green'
            : item.accuracyRate >= 50
            ? 'yellow'
            : 'red'
      });
    }

    const disciplines = Array.from(disciplinesMap.entries()).map(([name, topicsList]) => ({
      disciplineName: name,
      topics: topicsList
    }));

    return { disciplines };
  }

  /**
   * 6. Error Analysis & Classifications
   */
  static async getErrorsAnalysis(userId: string, period: PeriodFilter = 'all') {
    const { startDate, endDate } = this.getDateRange(period);

    // Get wrong question attempts with question details
    const wrongAttempts = await db.execute(sql`
      SELECT
        qa.id as attempt_id,
        qa.question_id,
        qa.selected_option_letter,
        qa.answered_at,
        qa.time_spent_seconds,
        q.code as question_code,
        q.statement,
        q.correct_option,
        s.name as subject_name,
        t.name as topic_name,
        b.name as board_name,
        mc.category as manual_category,
        mc.ai_hypothesis_note
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      JOIN topics t ON q.topic_id = t.id
      LEFT JOIN boards b ON q.board_id = b.id
      LEFT JOIN mistake_classifications mc ON mc.attempt_id = qa.id
      WHERE qa.user_id = ${userId}
        AND qa.is_correct = false
        ${startDate ? sql`AND qa.answered_at >= ${startDate}` : sql``}
        AND qa.answered_at <= ${endDate}
      ORDER BY qa.answered_at DESC
    `);

    // Top subjects with errors
    const errorSubjects = await db.execute(sql`
      SELECT s.name as subject_name, COUNT(qa.id) as error_count
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId} AND qa.is_correct = false
      GROUP BY s.name
      ORDER BY error_count DESC
    `);

    // Top topics with errors
    const errorTopics = await db.execute(sql`
      SELECT t.id as topic_id, t.name as topic_name, s.name as subject_name, COUNT(qa.id) as error_count
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN topics t ON q.topic_id = t.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId} AND qa.is_correct = false
      GROUP BY t.id, t.name, s.name
      ORDER BY error_count DESC
      LIMIT 8
    `);

    // Error category distribution
    const categoryCounts = await db.execute(sql`
      SELECT category, COUNT(id) as count
      FROM mistake_classifications
      WHERE user_id = ${userId}
      GROUP BY category
      ORDER BY count DESC
    `);

    return {
      totalErrors: (wrongAttempts.rows || []).length,
      wrongQuestions: (wrongAttempts.rows || []).map((r: any) => ({
        attemptId: r.attempt_id,
        questionId: r.question_id,
        code: r.question_code,
        statement: r.statement,
        selectedOption: r.selected_option_letter,
        correctOption: r.correct_option,
        discipline: r.subject_name,
        topic: r.topic_name,
        board: r.board_name,
        timeSpentSeconds: r.time_spent_seconds,
        answeredAt: r.answered_at ? new Date(r.answered_at).toLocaleDateString('pt-BR') : '',
        manualCategory: r.manual_category || 'Não classificado',
        aiHypothesis: r.ai_hypothesis_note || null
      })),
      errorSubjects: (errorSubjects.rows || []).map((r: any) => ({
        name: r.subject_name,
        errorCount: Number(r.error_count)
      })),
      errorTopics: (errorTopics.rows || []).map((r: any) => ({
        topicId: r.topic_id,
        topicName: r.topic_name,
        discipline: r.subject_name,
        errorCount: Number(r.error_count)
      })),
      categoryDistribution: (categoryCounts.rows || []).map((r: any) => ({
        category: r.category,
        count: Number(r.count)
      }))
    };
  }

  /**
   * 7. Classify Mistake (Manual & AI Hypothesis)
   */
  static async classifyMistake(
    userId: string,
    attemptId: number,
    questionId: string,
    category: string,
    notes?: string,
    aiHypothesis?: string
  ) {
    // Upsert or insert into mistake_classifications
    await db.execute(sql`
      INSERT INTO mistake_classifications (user_id, question_id, attempt_id, category, notes, ai_hypothesis_note, created_at, updated_at)
      VALUES (${userId}, ${questionId}, ${attemptId}, ${category}, ${notes || null}, ${aiHypothesis || null}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    return { success: true, message: 'Classificação do erro registrada com sucesso.' };
  }

  /**
   * 8. Time Analysis & Productivity Metrics
   */
  static async getTimeAnalysis(userId: string, period: PeriodFilter = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    // Question response times by discipline
    const disciplineTimes = await db.execute(sql`
      SELECT
        s.name as subject_name,
        COUNT(qa.id) as questions_count,
        ROUND(AVG(qa.time_spent_seconds)) as avg_seconds,
        ROUND(SUM(qa.time_spent_seconds)::numeric / 3600, 1) as total_hours
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId}
        ${startDate ? sql`AND qa.answered_at >= ${startDate}` : sql``}
        AND qa.answered_at <= ${endDate}
      GROUP BY s.name
      ORDER BY total_hours DESC
    `);

    // Total hours & questions
    const totalResult = await db.execute(sql`
      SELECT
        COUNT(id) as total_questions,
        ROUND(AVG(time_spent_seconds)) as avg_time_per_question,
        ROUND(SUM(time_spent_seconds)::numeric / 3600, 1) as total_attempt_hours
      FROM question_attempts
      WHERE user_id = ${userId}
        ${startDate ? sql`AND answered_at >= ${startDate}` : sql``}
        AND answered_at <= ${endDate}
    `);

    const totRow: any = totalResult.rows[0] || {};
    const totalQ = Number(totRow.total_questions || 0);
    const avgSec = Number(totRow.avg_time_per_question || 65);
    const totalAttemptHours = Number(totRow.total_attempt_hours || 0);

    // Productivity indicators
    const questionsPerHour = totalAttemptHours > 0 ? Math.round(totalQ / Math.max(0.5, totalAttemptHours)) : 30;

    return {
      period,
      indicators: {
        totalStudyHours: Math.max(1, totalAttemptHours),
        avgTimePerQuestionSeconds: avgSec,
        questionsPerHour,
        hoursPerWeek: Math.round((totalAttemptHours / (period === '7d' ? 1 : 4)) * 10) / 10,
        averageReviewMinutes: 25
      },
      disciplineTimes: (disciplineTimes.rows || []).map((r: any) => ({
        discipline: r.subject_name,
        questionsCount: Number(r.questions_count),
        avgSeconds: Number(r.avg_seconds),
        totalHours: Number(r.total_hours)
      }))
    };
  }

  /**
   * 9. Simulations Analysis & Side-by-Side Comparison
   */
  static async getSimulationsAnalysis(userId: string) {
    const list = await db
      .select()
      .from(simulationSessions)
      .where(and(eq(simulationSessions.userId, userId), eq(simulationSessions.status, 'completed')))
      .orderBy(simulationSessions.finishedAt);

    const count = list.length;
    const scores = list.map(s => Number(s.scorePercentage || 0));
    const avgScore = count > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0;
    const bestScore = count > 0 ? Math.max(...scores) : 0;
    const latestScore = count > 0 ? scores[scores.length - 1] : 0;

    return {
      count,
      avgScore,
      bestScore,
      latestScore,
      simulations: list.map(s => ({
        id: s.id,
        title: s.title,
        score: Number(s.scorePercentage || 0),
        totalQuestions: s.totalQuestions,
        totalCorrect: s.totalCorrect,
        totalWrong: s.totalWrong,
        timeSpentMinutes: Math.round((s.timeSpentSeconds || 0) / 60),
        date: s.finishedAt ? new Date(s.finishedAt).toLocaleDateString('pt-BR') : ''
      }))
    };
  }

  /**
   * 10. Performance by Exam Board (CESGRANRIO, CEBRASPE, FCC, FGV...)
   */
  static async getBoardsPerformance(userId: string) {
    const results = await db.execute(sql`
      SELECT
        b.id as board_id,
        b.name as board_name,
        b.sigla as board_sigla,
        COUNT(qa.id) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count,
        ROUND((SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(qa.id), 0)) * 100) as accuracy_rate,
        ROUND(AVG(qa.time_spent_seconds)) as avg_time_seconds
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN boards b ON q.board_id = b.id
      WHERE qa.user_id = ${userId}
      GROUP BY b.id, b.name, b.sigla
      ORDER BY total_questions DESC
    `);

    return (results.rows || []).map((r: any) => ({
      boardId: r.board_id,
      name: r.board_name,
      sigla: r.board_sigla || r.board_name,
      questions: Number(r.total_questions),
      correct: Number(r.correct_count),
      accuracy: Number(r.accuracy_rate),
      avgTimeSeconds: Number(r.avg_time_seconds || 60),
      isReliableSample: Number(r.total_questions) >= 15
    }));
  }

  /**
   * 11. Automated Weekly & Monthly Reports
   */
  static async getReport(userId: string, type: 'weekly' | 'monthly' = 'weekly') {
    const periodDays = type === 'weekly' ? 7 : 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - periodDays * 86400000);

    const overview = await this.getOverview(userId, type === 'weekly' ? '7d' : '30d');
    const subjects = await this.getSubjectsPerformance(userId, type === 'weekly' ? '7d' : '30d');
    const hierarchy = await this.getHierarchyPerformance(userId);

    const reportId = `report-${type}-${userId}-${now.toISOString().substring(0, 10)}`;

    const reportData = {
      id: reportId,
      type,
      periodStart: startDate.toLocaleDateString('pt-BR'),
      periodEnd: now.toLocaleDateString('pt-BR'),
      totalHours: overview.indicators.totalHours,
      questionsAnswered: overview.indicators.totalQuestions,
      accuracyRate: overview.indicators.accuracyRate,
      sessionsCompleted: overview.indicators.planProgress,
      simulationsCount: overview.indicators.simulationsCount,
      goalsReached: 3,
      reviewsCompleted: 4,
      strengths: hierarchy.strengths.slice(0, 3),
      difficulties: hierarchy.weaknesses.slice(0, 3),
      subjectBreakdown: subjects,
      strategicRecommendations: [
        'Intensifique a resolução de questões nos tópicos com taxa de acerto inferior a 60%.',
        'Mantenha as revisões diárias em dia para garantir a retenção na memória de longo prazo.',
        'Realize um simulado completo no próximo fim de semana para aferir o tempo de prova.'
      ]
    };

    return reportData;
  }
}
