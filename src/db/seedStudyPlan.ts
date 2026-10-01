import { db } from './index.ts';
import {
  subjects,
  subjectsTopics,
  topics,
  questions,
  questionAlternatives,
  studyGoals,
  studyAvailability,
  studyReviews,
  studyGoalsMetrics,
  questionAttempts,
  boards,
  exams,
  positions
} from './schema.ts';
import { eq, sql } from 'drizzle-orm';
import { StudyPlanService, formatDate, addDays } from '../services/studyPlanAlgorithm.ts';

export async function seedStudyPlanModule() {
  console.log('Seeding Study Plan Module, Física, Química and Test Goal...');

  // 1. Ensure Física and Química subjects exist
  await db
    .insert(subjects)
    .values([
      { id: 'sub-fisica', name: 'Física', category: 'Básica', active: true },
      { id: 'sub-quimica', name: 'Química', category: 'Básica', active: true },
    ])
    .onConflictDoNothing();

  // 2. Ensure subjects_topics for Física and Química
  await db
    .insert(subjectsTopics)
    .values([
      { id: 'stopic-mecanica', subjectId: 'sub-fisica', name: 'Mecânica e Eletromagnetismo', active: true },
      { id: 'stopic-termoquimica', subjectId: 'sub-quimica', name: 'Química Geral e Termoquímica', active: true },
    ])
    .onConflictDoNothing();

  // 3. Ensure topics
  await db
    .insert(topics)
    .values([
      { id: 'topic-cinematica-leis-newton', subjectTopicId: 'stopic-mecanica', name: 'Cinemática e Leis de Newton', active: true },
      { id: 'topic-eletrostatica-campo', subjectTopicId: 'stopic-mecanica', name: 'Eletrostática e Campo Elétrico', active: true },
      { id: 'topic-estequiometria', subjectTopicId: 'stopic-termoquimica', name: 'Estequiometria e Soluções', active: true },
      { id: 'topic-reacoes-redox', subjectTopicId: 'stopic-termoquimica', name: 'Reações de Oxirredução e Pilhas', active: true },
    ])
    .onConflictDoNothing();

  // 4. Ensure questions for Física and Química
  const sampleQuestions = [
    {
      id: 'q-fis-01',
      code: 'Q-FIS-01',
      statement: 'Um corpo de massa 10 kg repousa sobre uma superfície horizontal sem atrito. Aplica-se sobre ele uma força constante horizontal de 50 N. Qual é a aceleração adquirida pelo corpo segundo a 2ª Lei de Newton?',
      year: 2024,
      boardId: 'board-cesgranrio',
      subjectId: 'sub-fisica',
      topicId: 'topic-cinematica-leis-newton',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'Pela 2ª Lei de Newton: F = m * a => a = F / m = 50 N / 10 kg = 5,0 m/s².',
      bibliographicReference: 'HALLIDAY, D.; RESNICK, R. Fundamentos de Física - Mecânica. 10ª Ed.',
      alternatives: [
        { letter: 'A', text: '2,5 m/s²', isCorrect: false },
        { letter: 'B', text: '5,0 m/s²', isCorrect: true },
        { letter: 'C', text: '10,0 m/s²', isCorrect: false },
        { letter: 'D', text: '25,0 m/s²', isCorrect: false },
        { letter: 'E', text: '50,0 m/s²', isCorrect: false },
      ]
    },
    {
      id: 'q-quim-01',
      code: 'Q-QUIM-01',
      statement: 'Em uma pilha eletroquímica de Daniell formada por eletrodos de Zinco (Zn) e Cobre (Cu), o polo negativo e o polo positivo são representados, respectivamente, pelo:',
      year: 2023,
      boardId: 'board-cesgranrio',
      subjectId: 'sub-quimica',
      topicId: 'topic-reacoes-redox',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'Na pilha de Daniell, o zinco tem menor potencial de redução, sofrendo oxidação no ânodo (polo negativo). O cobre sofre redução no cátodo (polo positivo). Portanto: Ânodo de Zn e Cátodo de Cu.',
      bibliographicReference: 'ATKINS, P.; JONES, L. Princípios de Química. 5ª Ed.',
      alternatives: [
        { letter: 'A', text: 'Ânodo de Zn (oxidação) e Cátodo de Cu (redução)', isCorrect: true },
        { letter: 'B', text: 'Cátodo de Zn e Ânodo de Cu', isCorrect: false },
        { letter: 'C', text: 'Cátodo de Cu e Ponte Salina', isCorrect: false },
        { letter: 'D', text: 'Ânodo de Cu e Cátodo de Zn', isCorrect: false },
        { letter: 'E', text: 'Ambos funcionam como cátodos alternados', isCorrect: false },
      ]
    }
  ];

  for (const q of sampleQuestions) {
    const existingQ = await db.select().from(questions).where(eq(questions.id, q.id));
    if (existingQ.length === 0) {
      await db.insert(questions).values({
        id: q.id,
        code: q.code,
        statement: q.statement,
        year: q.year,
        boardId: q.boardId,
        subjectId: q.subjectId,
        topicId: q.topicId,
        difficulty: q.difficulty,
        type: q.type,
        explanation: q.explanation,
        bibliographicReference: q.bibliographicReference,
        status: 'approved',
        active: true
      });

      for (let i = 0; i < q.alternatives.length; i++) {
        const alt = q.alternatives[i];
        await db.insert(questionAlternatives).values({
          id: `alt-${q.id}-${alt.letter.toLowerCase()}`,
          questionId: q.id,
          letter: alt.letter,
          text: alt.text,
          isCorrect: alt.isCorrect,
          orderIndex: i
        });
      }
    }
  }

  // 5. User Bruno test target goal:
  // Requirement 58:
  // "Criar um usuário de teste.
  // Criar objetivo: Transpetro — Técnico em Eletrotécnica
  // Data fictícia de teste: 120 dias no futuro a partir da execução
  // Disponibilidade: 2 horas por dia, 6 dias por semana
  // Disciplinas: Português, Matemática, Física, Química, Eletrotécnica"
  const userId = 'user-bruno-student';
  const goalId = 'goal-transpetro-eletrotecnica';
  const today = new Date();
  const examDate = formatDate(addDays(today, 120)); // Exactly 120 days in future

  const existingGoal = await db.select().from(studyGoals).where(eq(studyGoals.id, goalId));
  if (existingGoal.length === 0) {
    await db.insert(studyGoals).values({
      id: goalId,
      userId,
      examId: 'exam-transpetro-2026',
      positionId: 'pos-eletrotecnica',
      nome: 'Transpetro — Técnico em Eletrotécnica',
      dataInicio: formatDate(today),
      dataProva: examDate,
      prioridade: 'Principal',
      status: 'Ativo',
      nivelAtual: 'Intermediário',
      horasDisponiveisSemana: '12',
      observacoes: 'Objetivo principal focado no concurso público da Transpetro 2026.'
    });
  } else {
    // Ensure 120 days is up to date
    await db
      .update(studyGoals)
      .set({
        dataProva: examDate,
        prioridade: 'Principal',
        status: 'Ativo',
        horasDisponiveisSemana: '12'
      })
      .where(eq(studyGoals.id, goalId));
  }

  // 6. Availability slots (2h/day, 6 days/week)
  await db.delete(studyAvailability).where(eq(studyAvailability.goalId, goalId));
  await db.insert(studyAvailability).values([
    { id: `avail-${goalId}-seg-1`, userId, goalId, dayOfWeek: 'Segunda', startTime: '06:00', endTime: '07:00', minutes: 60, notes: 'Manhã' },
    { id: `avail-${goalId}-seg-2`, userId, goalId, dayOfWeek: 'Segunda', startTime: '19:00', endTime: '20:00', minutes: 60, notes: 'Noite' },
    { id: `avail-${goalId}-ter-1`, userId, goalId, dayOfWeek: 'Terça', startTime: '19:00', endTime: '21:00', minutes: 120, notes: 'Noite' },
    { id: `avail-${goalId}-qua-1`, userId, goalId, dayOfWeek: 'Quarta', startTime: '06:00', endTime: '07:00', minutes: 60, notes: 'Manhã' },
    { id: `avail-${goalId}-qua-2`, userId, goalId, dayOfWeek: 'Quarta', startTime: '19:00', endTime: '20:00', minutes: 60, notes: 'Noite' },
    { id: `avail-${goalId}-qui-1`, userId, goalId, dayOfWeek: 'Quinta', startTime: '19:00', endTime: '21:00', minutes: 120, notes: 'Noite' },
    { id: `avail-${goalId}-sex-1`, userId, goalId, dayOfWeek: 'Sexta', startTime: '19:00', endTime: '21:00', minutes: 120, notes: 'Noite' },
    { id: `avail-${goalId}-sab-1`, userId, goalId, dayOfWeek: 'Sábado', startTime: '09:00', endTime: '11:00', minutes: 120, notes: 'Manhã' },
  ]);

  // 7. Simulated historical performance (Requirement 59):
  // "Eletrotécnica: 55%
  // Matemática: 65%
  // Português: 85%"
  // We insert realistic attempts for Bruno
  const existingAttempts = await db
    .select()
    .from(questionAttempts)
    .where(eq(questionAttempts.userId, userId));

  if (existingAttempts.length < 15) {
    // Eletrotécnica questions (e.g. 11 attempts: 6 correct, 5 wrong ~ 55%)
    const eletroQs = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, 'sub-eletrotecnica'))
      .limit(10);

    let eletroIdx = 0;
    for (const q of eletroQs) {
      const isCorrect = eletroIdx % 2 === 0 || eletroIdx === 6; // ~55%
      await db.insert(questionAttempts).values({
        userId,
        questionId: q.id,
        selectedOptionLetter: isCorrect ? 'A' : 'B',
        isCorrect,
        timeSpentSeconds: 75,
        attemptNumber: 1
      });
      eletroIdx++;
    }

    // Matemática questions (e.g. 5 attempts: 3 correct, 2 wrong ~ 60-65%)
    const matQs = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, 'sub-matematica'))
      .limit(5);

    let matIdx = 0;
    for (const q of matQs) {
      const isCorrect = matIdx !== 1 && matIdx !== 3; // 3 of 5 = 60%
      await db.insert(questionAttempts).values({
        userId,
        questionId: q.id,
        selectedOptionLetter: isCorrect ? 'A' : 'C',
        isCorrect,
        timeSpentSeconds: 90,
        attemptNumber: 1
      });
      matIdx++;
    }

    // Português questions (e.g. 5 attempts: 4 correct, 1 wrong = 80-85%)
    const portQs = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, 'sub-portugues'))
      .limit(5);

    let portIdx = 0;
    for (const q of portQs) {
      const isCorrect = portIdx !== 2; // 4 of 5 = 80-85%
      await db.insert(questionAttempts).values({
        userId,
        questionId: q.id,
        selectedOptionLetter: isCorrect ? 'B' : 'E',
        isCorrect,
        timeSpentSeconds: 65,
        attemptNumber: 1
      });
      portIdx++;
    }
  }

  // 8. Test Reviews (Requirement 60):
  // "Criar:
  // revisão vencida;
  // revisão de hoje;
  // revisão futura.
  // Verificar se aparecem corretamente na central de revisões."
  await db.delete(studyReviews).where(eq(studyReviews.userId, userId));

  const yesterdayStr = formatDate(addDays(today, -1));
  const todayStr = formatDate(today);
  const futureStr = formatDate(addDays(today, 7));

  await db.insert(studyReviews).values([
    // 1. Revisão Vencida / Atrasada (Circuitos Elétricos - Associação de Resistores)
    {
      id: `rev-overdue-${userId}`,
      userId,
      goalId,
      subjectId: 'sub-eletrotecnica',
      topicId: 'topic-associacao-resistores',
      stage: 1,
      scheduledDate: yesterdayStr,
      status: 'pending',
      intervalDays: 1,
      easeFactor: '2.3',
      recommendedQuestionsCount: 5
    },
    // 2. Revisão de Hoje (Lei de Ohm e Teoremas de Redes)
    {
      id: `rev-today-${userId}`,
      userId,
      goalId,
      subjectId: 'sub-eletrotecnica',
      topicId: 'topic-lei-ohm',
      stage: 2,
      scheduledDate: todayStr,
      status: 'pending',
      intervalDays: 7,
      easeFactor: '2.5',
      recommendedQuestionsCount: 5
    },
    // 3. Revisão Futura (Crase e Regência)
    {
      id: `rev-future-${userId}`,
      userId,
      goalId,
      subjectId: 'sub-portugues',
      topicId: 'topic-regras-crase',
      stage: 3,
      scheduledDate: futureStr,
      status: 'pending',
      intervalDays: 15,
      easeFactor: '2.6',
      recommendedQuestionsCount: 5
    },
    // 4. Uma revisão já concluída (para histórico na aba Concluídas)
    {
      id: `rev-done-${userId}`,
      userId,
      goalId,
      subjectId: 'sub-matematica',
      topicId: 'topic-porcentagem',
      stage: 1,
      scheduledDate: formatDate(addDays(today, -3)),
      completedDate: formatDate(addDays(today, -3)),
      status: 'completed',
      intervalDays: 1,
      easeFactor: '2.5',
      performanceScore: 90,
      recommendedQuestionsCount: 5
    }
  ]);

  // 9. Generate automatic plan sessions if not already generated
  await StudyPlanService.generateStudyPlan({
    userId,
    goalId,
    examId: 'exam-transpetro-2026',
    positionId: 'pos-eletrotecnica',
    dataProva: examDate,
    horasDisponiveisSemana: 12,
    nivelAtual: 'Intermediário',
    weekendMode: 'reduced',
    restDays: ['Domingo'],
    disciplinesConfig: [
      { subjectId: 'sub-eletrotecnica', weight: 5, enabled: true },
      { subjectId: 'sub-matematica', weight: 4, enabled: true },
      { subjectId: 'sub-portugues', weight: 3, enabled: true },
      { subjectId: 'sub-fisica', weight: 3, enabled: true },
      { subjectId: 'sub-quimica', weight: 2, enabled: true },
    ],
    diagnosticResults: {
      'sub-eletrotecnica': 55,
      'sub-matematica': 65,
      'sub-portugues': 85,
      'sub-fisica': 60,
      'sub-quimica': 50,
    }
  });

  console.log('Study Plan module seeded successfully with test goal, reviews, metrics and sessions.');
}
