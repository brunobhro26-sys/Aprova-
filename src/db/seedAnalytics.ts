import { db } from './index.ts';
import {
  questionAttempts,
  simulationSessions,
  mistakeClassifications,
  userAnalyticsPreferences,
  aiConversations,
  aiMessages,
  questions
} from './schema.ts';
import { eq, sql } from 'drizzle-orm';

export async function seedAnalyticsModule() {
  console.log('Seeding Analytics Module for real performance evaluation...');

  const userId = 'user-bruno-student';

  // 1. Ensure user analytics preferences
  await db
    .insert(userAnalyticsPreferences)
    .values({
      userId,
      consentAiPersonalization: true,
      sendPerformanceToAi: true,
      masteryMinQuestions: 5,
      masteryAccuracyThreshold: 75,
      notificationsEmail: true,
      notificationsApp: true,
      updatedAt: new Date()
    })
    .onConflictDoNothing();

  // 2. Ensure 3 realistic simulations in simulation_sessions with progressive scores:
  // Simulado 1: 58% (3 weeks ago)
  // Simulado 2: 65% (1.5 weeks ago)
  // Simulado 3: 72% (3 days ago)
  const now = new Date();
  const sim1Date = new Date(now.getTime() - 21 * 86400000);
  const sim2Date = new Date(now.getTime() - 11 * 86400000);
  const sim3Date = new Date(now.getTime() - 3 * 86400000);

  await db
    .insert(simulationSessions)
    .values([
      {
        id: 'sim-sess-transpetro-01',
        userId,
        simulationId: 'sim-transpetro-01',
        title: 'Simulado 1 — Transpetro (Diagnóstico)',
        timeLimitMinutes: 180,
        totalQuestions: 50,
        totalAnswered: 50,
        totalCorrect: 29,
        totalWrong: 21,
        totalBlank: 0,
        scorePercentage: '58.0',
        timeSpentSeconds: 7200,
        status: 'completed',
        startedAt: sim1Date,
        finishedAt: sim1Date,
        createdAt: sim1Date
      },
      {
        id: 'sim-sess-transpetro-02',
        userId,
        simulationId: 'sim-transpetro-02',
        title: 'Simulado 2 — Transpetro (Evolução Técnica)',
        timeLimitMinutes: 210,
        totalQuestions: 60,
        totalAnswered: 60,
        totalCorrect: 39,
        totalWrong: 21,
        totalBlank: 0,
        scorePercentage: '65.0',
        timeSpentSeconds: 8400,
        status: 'completed',
        startedAt: sim2Date,
        finishedAt: sim2Date,
        createdAt: sim2Date
      },
      {
        id: 'sim-sess-transpetro-03',
        userId,
        simulationId: 'sim-transpetro-03',
        title: 'Simulado 3 — Reta Final Transpetro',
        timeLimitMinutes: 240,
        totalQuestions: 60,
        totalAnswered: 60,
        totalCorrect: 43,
        totalWrong: 17,
        totalBlank: 0,
        scorePercentage: '72.0',
        timeSpentSeconds: 7900,
        status: 'completed',
        startedAt: sim3Date,
        finishedAt: sim3Date,
        createdAt: sim3Date
      }
    ])
    .onConflictDoNothing();

  // 3. Check if there are at least 40 question attempts
  const countRes = await db.execute(sql`SELECT count(*) as count FROM question_attempts WHERE user_id = ${userId}`);
  const currentCount = Number(countRes.rows[0]?.count || 0);

  if (currentCount < 40) {
    console.log('Seeding progressive question attempts across the last 4 weeks...');
    // Seed attempts across subjects: Português, Matemática, Física, Química, Eletrotécnica
    const attemptsToInsert = [
      // Week 1 (25-28 days ago) - accuracy ~52%
      { questionId: 'q-port-02', isCorrect: true, selected: 'B', seconds: 55, daysAgo: 26 },
      { questionId: 'q-port-03', isCorrect: false, selected: 'A', seconds: 70, daysAgo: 26 },
      { questionId: 'q-mat-01', isCorrect: true, selected: 'B', seconds: 95, daysAgo: 25 },
      { questionId: 'q-mat-02', isCorrect: false, selected: 'C', seconds: 110, daysAgo: 25 },
      { questionId: 'q-fis-01', isCorrect: false, selected: 'D', seconds: 120, daysAgo: 24 },
      { questionId: 'q-quim-01', isCorrect: true, selected: 'C', seconds: 65, daysAgo: 24 },
      { questionId: 'q-ele-02', isCorrect: false, selected: 'A', seconds: 80, daysAgo: 23 },
      { questionId: 'q-ele-03', isCorrect: true, selected: 'A', seconds: 75, daysAgo: 23 },

      // Week 2 (18-21 days ago) - accuracy ~60%
      { questionId: 'q-port-04', isCorrect: true, selected: 'A', seconds: 50, daysAgo: 20 },
      { questionId: 'q-port-05', isCorrect: true, selected: 'C', seconds: 48, daysAgo: 20 },
      { questionId: 'q-mat-03', isCorrect: false, selected: 'B', seconds: 105, daysAgo: 19 },
      { questionId: 'q-mat-04', isCorrect: true, selected: 'D', seconds: 88, daysAgo: 19 },
      { questionId: 'q-ele-04', isCorrect: false, selected: 'B', seconds: 90, daysAgo: 18 },
      { questionId: 'q-ele-05', isCorrect: true, selected: 'A', seconds: 70, daysAgo: 18 },
      { questionId: 'q-ele-06', isCorrect: true, selected: 'C', seconds: 82, daysAgo: 17 },

      // Week 3 (10-14 days ago) - accuracy ~65%
      { questionId: 'q-port-transpetro-01', isCorrect: true, selected: 'C', seconds: 45, daysAgo: 14 },
      { questionId: 'q-mat-05', isCorrect: true, selected: 'A', seconds: 92, daysAgo: 13 },
      { questionId: 'q-ele-07', isCorrect: true, selected: 'A', seconds: 78, daysAgo: 12 },
      { questionId: 'q-ele-08', isCorrect: false, selected: 'B', seconds: 85, daysAgo: 12 },
      { questionId: 'q-ele-09', isCorrect: true, selected: 'A', seconds: 60, daysAgo: 11 },
      { questionId: 'q-ele-10', isCorrect: true, selected: 'B', seconds: 65, daysAgo: 10 },

      // Week 4 (recent 1-6 days ago) - accuracy ~75%
      { questionId: 'q-eletro-test-01', isCorrect: true, selected: 'A', seconds: 55, daysAgo: 6 },
      { questionId: 'q-port-02', isCorrect: true, selected: 'B', seconds: 40, daysAgo: 5 },
      { questionId: 'q-port-03', isCorrect: true, selected: 'D', seconds: 45, daysAgo: 5 },
      { questionId: 'q-mat-01', isCorrect: true, selected: 'B', seconds: 75, daysAgo: 4 },
      { questionId: 'q-mat-02', isCorrect: true, selected: 'A', seconds: 80, daysAgo: 4 },
      { questionId: 'q-fis-01', isCorrect: true, selected: 'C', seconds: 85, daysAgo: 3 },
      { questionId: 'q-quim-01', isCorrect: true, selected: 'C', seconds: 50, daysAgo: 2 },
      { questionId: 'q-ele-02', isCorrect: false, selected: 'B', seconds: 90, daysAgo: 1 },
      { questionId: 'q-ele-03', isCorrect: true, selected: 'A', seconds: 65, daysAgo: 1 },
      { questionId: 'q-ele-05', isCorrect: true, selected: 'A', seconds: 58, daysAgo: 0 }
    ];

    for (const a of attemptsToInsert) {
      const date = new Date(now.getTime() - a.daysAgo * 86400000);
      try {
        await db.insert(questionAttempts).values({
          userId,
          questionId: a.questionId,
          selectedOptionLetter: a.selected,
          isCorrect: a.isCorrect,
          timeSpentSeconds: a.seconds,
          answeredAt: date
        });
      } catch (err) {
        // ignore duplicate
      }
    }
  }

  // 4. Seed sample mistake classifications for wrong questions
  const wrongAttempts = await db.execute(sql`
    SELECT qa.id, qa.question_id
    FROM question_attempts qa
    LEFT JOIN mistake_classifications mc ON mc.attempt_id = qa.id
    WHERE qa.user_id = ${userId} AND qa.is_correct = false AND mc.id IS NULL
    LIMIT 10
  `);

  const categories = [
    { cat: 'falta_conhecimento', note: 'Conteúdo teórico não estudado a fundo.' },
    { cat: 'interpretacao', note: 'Má interpretação do comando da questão.' },
    { cat: 'desatencao', note: 'Não leu o termo "EXCETO" na pergunta.' },
    { cat: 'calculo', note: 'Pequeno erro na simplificação de fração.' },
    { cat: 'confusao_conceitos', note: 'Confundiu reatância indutiva com capacitiva.' }
  ];

  for (let i = 0; i < (wrongAttempts.rows || []).length; i++) {
    const row: any = wrongAttempts.rows[i];
    const cat = categories[i % categories.length];
    await db.insert(mistakeClassifications).values({
      userId,
      questionId: row.question_id,
      attemptId: Number(row.id),
      category: cat.cat,
      isAiSuggested: true,
      aiHypothesisNote: cat.note,
      notes: 'Registrado durante ciclo de revisão.',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // 5. Seed a default AI Conversation for immediate onboarding
  const existingConv = await db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).limit(1);
  if (existingConv.length === 0) {
    const convId = 'conv-init-transpetro-01';
    await db.insert(aiConversations).values({
      id: convId,
      userId,
      title: 'Tira-Dúvidas: Eletrotécnica & Concursos',
      mode: 'general',
      contextJson: JSON.stringify({ targetContest: 'Transpetro', position: 'Técnico em Eletrotécnica' }),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await db.insert(aiMessages).values([
      {
        conversationId: convId,
        role: 'assistant',
        content: `Olá, Bruno! Eu sou o seu **Assistente de Estudos com Inteligência Artificial**.\n\nEstou conectado ao seu concurso **Transpetro — Técnico em Eletrotécnica** e posso te ajudar a:\n- **Explicar qualquer questão** com raciocínio passo a passo;\n- **Analisar seus erros** e identificar se foram por interpretação, conceito ou cálculo;\n- **Gerar resumos inteligentes**, mapas mentais e listas de fórmulas;\n- **Ensinar conteúdos do zero** através do Modo Professor;\n- **Gerar novas questões didáticas autorais** para fixar os assuntos em que você mais tem dificuldade.\n\nO que você gostaria de estudar ou tirar dúvida hoje?`,
        metadataJson: JSON.stringify({ model: 'gemini-3.8-flash' }),
        createdAt: new Date()
      }
    ]);
  }

  console.log('Analytics Module & real sample history seeded successfully.');
}
