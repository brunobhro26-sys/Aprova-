import { pgTable, serial, text, integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tipos de Concurso (Concurso Público, Processo Seletivo, Empresa Pública, etc.)
export const contestTypes = pgTable('contest_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Esferas (Federal, Estadual, Municipal, Distrital)
export const spheres = pgTable('spheres', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sigla: text('sigla'),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 3. Poderes e Categorias (Executivo, Legislativo, Judiciário, Empresa Pública, Autarquia, etc.)
export const powersCategories = pgTable('powers_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type'), // Direta, Indireta, Poder, etc.
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 4. Órgãos e Empresas (Petrobras, Transpetro, INSS, Caixa, Receita Federal, etc.)
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sigla: text('sigla'),
  contestTypeId: text('contest_type_id').references(() => contestTypes.id),
  sphereId: text('sphere_id').references(() => spheres.id),
  powerCategoryId: text('power_category_id').references(() => powersCategories.id),
  state: text('state'),
  city: text('city'),
  description: text('description'),
  websiteUrl: text('website_url'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Concursos (Exams - Transpetro 2023, Transpetro 2026, etc.)
export const exams = pgTable('exams', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  sigla: text('sigla'),
  year: integer('year').notNull(),
  edital: text('edital'),
  publishedAt: text('published_at'),
  examDate: text('exam_date'),
  status: text('status').notNull().default('Publicado'), // Planejado, Publicado, Inscrições Abertas, etc.
  description: text('description'),
  officialLink: text('official_link'),
  initialSalary: text('initial_salary'),
  vacanciesCount: integer('vacancies_count').default(0),
  reservePool: boolean('reserve_pool').default(true),
  sourceUrl: text('source_url'),
  sourceName: text('source_name'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Cargos (Positions - Técnico em Eletrotécnica, Engenheiro, etc.)
export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  level: text('level'), // Superior, Médio, Técnico, Fundamental
  education: text('education'),
  area: text('area'),
  specialty: text('specialty'),
  description: text('description'),
  salary: text('salary'),
  sourceUrl: text('source_url'),
  sourceName: text('source_name'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Relacionamento Concurso ↔ Cargo
export const examPositions = pgTable('exam_positions', {
  id: serial('id').primaryKey(),
  examId: text('exam_id').references(() => exams.id).notNull(),
  positionId: text('position_id').references(() => positions.id).notNull(),
  vacancies: integer('vacancies').default(0),
  salary: text('salary'),
});

// 8. Bancas Examinadoras (CESGRANRIO, CEBRASPE, FCC, FGV, etc.)
export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sigla: text('sigla'),
  website: text('website'),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 9. Disciplinas (Subjects - Língua Portuguesa, Eletrotécnica, Matemática, etc.)
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sigla: text('sigla'),
  description: text('description'),
  category: text('category'), // Geral, Específica, Básica
  active: boolean('active').default(true).notNull(),
});

// 10. Assuntos (Subject Topics - Circuitos Elétricos, Álgebra, etc.)
export const subjectsTopics = pgTable('subjects_topics', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 11. Tópicos (Topics - Associação de Resistores, Lei de Ohm, etc.)
export const topics = pgTable('topics', {
  id: text('id').primaryKey(),
  subjectTopicId: text('subject_topic_id').references(() => subjectsTopics.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 12. Subtópicos (Subtopics)
export const subtopics = pgTable('subtopics', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
});

// 13. Matriz Curricular: Concurso ↔ Cargo ↔ Conteúdo Programático
export const examPositionSyllabus = pgTable('exam_position_syllabus', {
  id: serial('id').primaryKey(),
  examId: text('exam_id').references(() => exams.id).notNull(),
  positionId: text('position_id').references(() => positions.id).notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  subjectTopicId: text('subject_topic_id').references(() => subjectsTopics.id),
  topicId: text('topic_id').references(() => topics.id),
});

// 14. Questões (Questions)
export const questions = pgTable('questions', {
  id: text('id').primaryKey(),
  code: text('code'),
  statement: text('statement').notNull(),
  year: integer('year').notNull(),
  boardId: text('board_id').references(() => boards.id).notNull(),
  examId: text('exam_id').references(() => exams.id),
  organizationId: text('organization_id').references(() => organizations.id),
  positionId: text('position_id').references(() => positions.id),
  subjectId: text('subject_id').references(() => subjects.id),
  subjectTopicId: text('subject_topic_id').references(() => subjectsTopics.id),
  topicId: text('topic_id').references(() => topics.id),
  subtopicId: text('subtopic_id').references(() => subtopics.id),
  difficulty: text('difficulty').notNull().default('Médio'), // Fácil, Médio, Difícil
  type: text('type').notNull().default('Múltipla Escolha'), // Múltipla Escolha, Certo/Errado, Discursiva
  source: text('source'),
  sourceUrl: text('source_url'),
  sourceName: text('source_name'),
  status: text('status').notNull().default('approved'),
  explanation: text('explanation'),
  bibliographicReference: text('bibliographic_reference'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 15. Alternativas das Questões
export const questionAlternatives = pgTable('question_alternatives', {
  id: text('id').primaryKey(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  letter: text('letter').notNull(), // A, B, C, D, E ou Certo, Errado
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  percentageChosen: integer('percentage_chosen').default(0),
});

// 16. Usuários (Users)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or local ID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('STUDENT'), // STUDENT, ADMIN, SUPERADMIN, CONTENT_EDITOR, SUPPORT, FINANCIAL
  photoUrl: text('photo_url'),
  plan: text('plan').default('PREMIUM_MENSAL'), // GRATUITO, PREMIUM_MENSAL, PREMIUM_ANUAL, VITALICIO
  status: text('status').default('ACTIVE'), // ACTIVE, BLOCKED, INACTIVE
  blockedReason: text('blocked_reason'),
  deletedRequested: boolean('deleted_requested').default(false).notNull(),
  targetContest: text('target_contest').default('Transpetro'),
  targetPosition: text('target_position').default('Técnico em Eletrotécnica'),
  dailyGoal: integer('daily_goal').default(40),
  studyHoursPerDay: integer('study_hours_per_day').default(3),
  xp: integer('xp').default(840),
  streakDays: integer('streak_days').default(4),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
});

// 17. Tentativas / Respostas do Aluno (Question Attempts)
export const questionAttempts = pgTable('question_attempts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  selectedOptionLetter: text('selected_option_letter').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
});

// 18. Favoritos (Questões, Assuntos, Concursos, Cargos)
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  itemType: text('item_type').notNull(), // question, topic, exam, position
  itemId: text('item_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 19. Cadernos de Estudo Personalizados (Notebooks)
export const notebooks = pgTable('notebooks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').default('indigo'),
  questionCount: integer('question_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 20. Questões do Caderno
export const notebookQuestions = pgTable('notebook_questions', {
  id: serial('id').primaryKey(),
  notebookId: text('notebook_id').references(() => notebooks.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// 21. Logs de Auditoria Administrativa (Audit Logs)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, IMPORT
  entity: text('entity').notNull(), // organization, exam, position, board, question, etc.
  recordId: text('record_id').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 22. Anotações Pessoais das Questões (Question Notes)
export const questionNotes = pgTable('question_notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 23. Relatório de Erros / Problemas em Questões (Question Reports)
export const questionReports = pgTable('question_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  reason: text('reason').notNull(), // Gabarito incorreto, Enunciado incorreto, etc.
  description: text('description'),
  status: text('status').default('pending').notNull(), // pending, resolved, dismissed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 24. Revisão Espaçada e Questões para Revisar (Question Reviews)
export const questionReviews = pgTable('question_reviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  isMarked: boolean('is_marked').default(true).notNull(),
  repetitionCount: integer('repetition_count').default(0).notNull(),
  correctStreak: integer('correct_streak').default(0).notNull(),
  lastReviewedAt: timestamp('last_reviewed_at'),
  nextReviewAt: timestamp('next_review_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 25. Configuração / Modelos de Simulados (Simulations)
export const simulations = pgTable('simulations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  examId: text('exam_id').references(() => exams.id),
  positionId: text('position_id').references(() => positions.id),
  boardId: text('board_id').references(() => boards.id),
  totalQuestions: integer('total_questions').notNull(),
  timeLimitMinutes: integer('time_limit_minutes').default(60),
  isOfficial: boolean('is_official').default(false).notNull(),
  distributionConfig: text('distribution_config'), // JSON string: { "Português": 5, ... }
  createdByUserId: text('created_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 26. Sessões de Simulado em Execução / Finalizadas (Simulation Sessions)
export const simulationSessions = pgTable('simulation_sessions', {
  id: text('id').primaryKey(),
  simulationId: text('simulation_id').references(() => simulations.id),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeLimitMinutes: integer('time_limit_minutes').default(60),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Server authoritative deadline
  finishedAt: timestamp('finished_at'),
  status: text('status').default('in_progress').notNull(), // 'in_progress', 'completed', 'abandoned'
  scorePercentage: numeric('score_percentage').default('0'),
  totalAnswered: integer('total_answered').default(0).notNull(),
  totalCorrect: integer('total_correct').default(0).notNull(),
  totalWrong: integer('total_wrong').default(0).notNull(),
  totalBlank: integer('total_blank').default(0).notNull(),
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 27. Respostas Individuais do Simulado (Simulation Answers)
export const simulationAnswers = pgTable('simulation_answers', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').references(() => simulationSessions.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  orderIndex: integer('order_index').notNull(),
  selectedOptionLetter: text('selected_option_letter'),
  isMarkedForReview: boolean('is_marked_for_review').default(false).notNull(),
  isCorrect: boolean('is_correct'),
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
  answeredAt: timestamp('answered_at'),
});

// =========================================================================
// PROMPT 4: SISTEMA INTELIGENTE DE PLANEJAMENTO DE ESTUDOS
// =========================================================================

// 28. Objetivos do Aluno (Study Goals)
export const studyGoals = pgTable('study_goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  examId: text('exam_id').references(() => exams.id),
  positionId: text('position_id').references(() => positions.id),
  nome: text('nome').notNull(),
  dataInicio: text('data_inicio').notNull(), // ISO YYYY-MM-DD
  dataProva: text('data_prova'), // ISO YYYY-MM-DD
  prioridade: text('prioridade').default('Principal').notNull(), // 'Principal' | 'Secundário'
  status: text('status').default('Ativo').notNull(), // 'Ativo' | 'Pausado' | 'Concluído' | 'Cancelado'
  nivelAtual: text('nivel_atual').default('Intermediário').notNull(), // 'Iniciante' | 'Básico' | 'Intermediário' | 'Avançado'
  horasDisponiveisSemana: numeric('horas_disponiveis_semana').default('12').notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 29. Disponibilidade de Estudo por Dia (Study Availability)
export const studyAvailability = pgTable('study_availability', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  dayOfWeek: text('day_of_week').notNull(), // 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
  startTime: text('start_time').notNull(), // e.g. "06:00"
  endTime: text('end_time').notNull(), // e.g. "07:00"
  minutes: integer('minutes').default(60).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 30. Planos de Estudo (Study Plans)
export const studyPlans = pgTable('study_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  version: integer('version').default(1).notNull(),
  status: text('status').default('active').notNull(), // 'active', 'archived', 'replanned'
  configJson: text('config_json'), // Serialized options (weekend mode, weights, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 31. Itens do Plano de Estudo (Study Plan Items)
export const studyPlanItems = pgTable('study_plan_items', {
  id: serial('id').primaryKey(),
  planId: text('plan_id').references(() => studyPlans.id, { onDelete: 'cascade' }).notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topicId: text('topic_id').references(() => topics.id),
  weekNumber: integer('week_number').default(1).notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  plannedMinutes: integer('planned_minutes').default(60).notNull(),
  type: text('type').default('Teoria').notNull(), // 'Teoria', 'Questões', 'Revisão', 'Simulado'
  priorityScore: numeric('priority_score').default('50'),
  orderIndex: integer('order_index').default(0).notNull(),
});

// 32. Sessões de Estudo (Study Sessions)
export const studySessions = pgTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  planId: text('plan_id').references(() => studyPlans.id),
  subjectId: text('subject_id').references(() => subjects.id),
  topicId: text('topic_id').references(() => topics.id),
  tipo: text('tipo').notNull(), // 'Teoria' | 'Questões' | 'Revisão' | 'Simulado' | 'Correção' | 'Exercícios' | 'Aula'
  data: text('data').notNull(), // YYYY-MM-DD
  horaInicio: text('hora_inicio'), // e.g. "19:00"
  horaFim: text('hora_fim'), // e.g. "20:00"
  duracaoPlanejada: integer('duracao_planejada').default(60).notNull(), // in minutes
  duracaoReal: integer('duracao_real').default(0).notNull(), // in minutes
  status: text('status').default('Planejada').notNull(), // 'Planejada' | 'Em andamento' | 'Concluída' | 'Cancelada' | 'Atrasada'
  difficultyRating: text('difficulty_rating'), // 'Fácil' | 'Normal' | 'Difícil'
  observacoes: text('observacoes'),
  questionsCount: integer('questions_count').default(0),
  correctQuestionsCount: integer('correct_questions_count').default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 33. Revisões Espaçadas (Study Reviews)
export const studyReviews = pgTable('study_reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topicId: text('topic_id').references(() => topics.id),
  stage: integer('stage').default(1).notNull(), // 1 (24h), 2 (7d), 3 (15d), 4 (30d), 5 (45d)
  scheduledDate: text('scheduled_date').notNull(), // YYYY-MM-DD
  completedDate: text('completed_date'), // YYYY-MM-DD
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'delayed'
  intervalDays: integer('interval_days').default(1).notNull(),
  easeFactor: numeric('ease_factor').default('2.5').notNull(),
  performanceScore: integer('performance_score'), // 0 - 100
  recommendedQuestionsCount: integer('recommended_questions_count').default(5),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 34. Metas do Aluno (Study Goals Metrics)
export const studyGoalsMetrics = pgTable('study_goals_metrics', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'daily_questions' | 'weekly_hours' | 'monthly_questions' | 'subject_questions'
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0).notNull(),
  period: text('period').default('weekly').notNull(), // 'daily' | 'weekly' | 'monthly'
  subjectId: text('subject_id').references(() => subjects.id),
  status: text('status').default('active').notNull(), // 'active' | 'completed'
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 35. Progresso por Tópico (Study Progress)
export const studyProgress = pgTable('study_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  status: text('status').default('Não iniciado').notNull(), // 'Não iniciado' | 'Em estudo' | 'Estudado' | 'Revisando' | 'Dominado'
  accuracyPercentage: integer('accuracy_percentage').default(0).notNull(),
  questionsAttempted: integer('questions_attempted').default(0).notNull(),
  questionsCorrect: integer('questions_correct').default(0).notNull(),
  masteryScore: integer('mastery_score').default(0).notNull(), // 0 to 100
  lastStudiedAt: timestamp('last_studied_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 36. Conteúdos Teóricos (Study Contents)
export const studyContents = pgTable('study_contents', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topicId: text('topic_id').references(() => topics.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  estimatedTimeMinutes: integer('estimated_time_minutes').default(30).notNull(),
  source: text('source'),
  status: text('status').default('published').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 37. Notificações do Sistema (Notifications)
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'sessao_proxima' | 'revisao' | 'meta' | 'sessao_atrasada' | 'prova_proxima' | 'conquista' | 'recomendacao'
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  metadataJson: text('metadata_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 38. Histórico de Replanejamento (Study Plan History)
export const studyPlanHistory = pgTable('study_plan_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  goalId: text('goal_id').references(() => studyGoals.id, { onDelete: 'cascade' }),
  previousPlanJson: text('previous_plan_json').notNull(),
  newPlanJson: text('new_plan_json').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 39. Snapshots Diários/Semanais de Desempenho (Performance Snapshots)
export const performanceSnapshots = pgTable('performance_snapshots', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  periodType: text('period_type').default('day').notNull(), // day, week, month
  questionsAnswered: integer('questions_answered').default(0).notNull(),
  questionsCorrect: integer('questions_correct').default(0).notNull(),
  accuracyRate: numeric('accuracy_rate').default('0').notNull(),
  studyTimeSeconds: integer('study_time_seconds').default(0).notNull(),
  simulationsCount: integer('simulations_count').default(0).notNull(),
  streakDays: integer('streak_days').default(0).notNull(),
  metadataJson: text('metadata_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 40. Relatórios Estruturados de Desempenho (Performance Reports)
export const performanceReports = pgTable('performance_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'weekly' | 'monthly'
  periodStart: text('period_start').notNull(), // YYYY-MM-DD
  periodEnd: text('period_end').notNull(), // YYYY-MM-DD
  totalHours: numeric('total_hours').default('0').notNull(),
  questionsAnswered: integer('questions_answered').default(0).notNull(),
  accuracyRate: numeric('accuracy_rate').default('0').notNull(),
  sessionsCompleted: integer('sessions_completed').default(0).notNull(),
  goalsReached: integer('goals_reached').default(0).notNull(),
  reviewsCompleted: integer('reviews_completed').default(0).notNull(),
  strengthsJson: text('strengths_json'),
  difficultiesJson: text('difficulties_json'),
  recommendationsJson: text('recommendations_json'),
  fullReportJson: text('full_report_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 41. Conversas com Assistente de Estudos IA (AI Conversations)
export const aiConversations = pgTable('ai_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  mode: text('mode').default('general').notNull(), // general, question_explanation, mistake_analysis, topic_summary, teacher_mode, plan_review
  contextJson: text('context_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 42. Mensagens do Assistente IA (AI Messages)
export const aiMessages = pgTable('ai_messages', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id').references(() => aiConversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // user, assistant, system
  content: text('content').notNull(),
  metadataJson: text('metadata_json'), // tokens, isHypothesis, model, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 43. Logs de Uso e Custos de IA (AI Usage Logs)
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  feature: text('feature').notNull(), // explain_question, analyze_mistake, summarize_topic, generate_questions, chat, performance_report
  promptTokens: integer('prompt_tokens').default(0),
  responseTokens: integer('response_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  estimatedCostUsd: text('estimated_cost_usd'),
  status: text('status').default('success').notNull(), // success, error, rate_limited
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 44. Questões Geradas por IA com Validação (AI Generated Questions)
export const aiGeneratedQuestions = pgTable('ai_generated_questions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  discipline: text('discipline').notNull(),
  subject: text('subject'),
  topic: text('topic').notNull(),
  difficulty: text('difficulty').notNull(), // Fácil, Médio, Difícil
  questionType: text('question_type').default('Múltipla Escolha').notNull(),
  statement: text('statement').notNull(),
  optionsJson: text('options_json').notNull(),
  correctOption: text('correct_option').notNull(),
  explanation: text('explanation').notNull(),
  isAiGenerated: boolean('is_ai_generated').default(true).notNull(),
  validationStatus: text('validation_status').default('validated').notNull(), // validated, flagged_for_review
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 45. Recomendações Inteligentes e Insights (AI Recommendations)
export const aiRecommendations = pgTable('ai_recommendations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  reason: text('reason').notNull(),
  discipline: text('discipline').notNull(),
  topic: text('topic').notNull(),
  actionType: text('action_type').notNull(), // practice, review, simulation, theory
  priority: text('priority').default('medium').notNull(), // high, medium, low
  metadataJson: text('metadata_json'),
  isDismissed: boolean('is_dismissed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 46. Preferências de Análise e Consentimento de IA (User Analytics Preferences)
export const userAnalyticsPreferences = pgTable('user_analytics_preferences', {
  userId: text('user_id').primaryKey().references(() => users.id),
  consentAiPersonalization: boolean('consent_ai_personalization').default(true).notNull(),
  sendPerformanceToAi: boolean('send_performance_to_ai').default(true).notNull(),
  masteryMinQuestions: integer('mastery_min_questions').default(5).notNull(),
  masteryAccuracyThreshold: integer('mastery_accuracy_threshold').default(75).notNull(),
  notificationsEmail: boolean('notifications_email').default(true).notNull(),
  notificationsApp: boolean('notifications_app').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 47. Insights e Pontos Fortes/Fracos (Study Insights)
export const studyInsights = pgTable('study_insights', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // strength, weakness, productivity, streak, forecast
  title: text('title').notNull(),
  description: text('description').notNull(),
  metricValue: text('metric_value'),
  urgency: text('urgency').default('info').notNull(), // info, warning, positive
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 48. Classificação Manual e Hipótese de Erros (Mistake Classifications)
export const mistakeClassifications = pgTable('mistake_classifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  attemptId: integer('attempt_id'),
  category: text('category').notNull(), // falta_conhecimento, interpretacao, desatencao, calculo, confusao_conceitos, tempo, chute, outro
  isAiSuggested: boolean('is_ai_suggested').default(false).notNull(),
  aiHypothesisNote: text('ai_hypothesis_note'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relacionamentos Drizzle
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  sphere: one(spheres, { fields: [organizations.sphereId], references: [spheres.id] }),
  powerCategory: one(powersCategories, { fields: [organizations.powerCategoryId], references: [powersCategories.id] }),
  contestType: one(contestTypes, { fields: [organizations.contestTypeId], references: [contestTypes.id] }),
  exams: many(exams),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  organization: one(organizations, { fields: [exams.organizationId], references: [organizations.id] }),
  examPositions: many(examPositions),
  questions: many(questions),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  examPositions: many(examPositions),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  board: one(boards, { fields: [questions.boardId], references: [boards.id] }),
  exam: one(exams, { fields: [questions.examId], references: [exams.id] }),
  organization: one(organizations, { fields: [questions.organizationId], references: [organizations.id] }),
  position: one(positions, { fields: [questions.positionId], references: [positions.id] }),
  subject: one(subjects, { fields: [questions.subjectId], references: [subjects.id] }),
  subjectTopic: one(subjectsTopics, { fields: [questions.subjectTopicId], references: [subjectsTopics.id] }),
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  subtopic: one(subtopics, { fields: [questions.subtopicId], references: [subtopics.id] }),
  alternatives: many(questionAlternatives),
  attempts: many(questionAttempts),
}));

export const questionAlternativesRelations = relations(questionAlternatives, ({ one }) => ({
  question: one(questions, { fields: [questionAlternatives.questionId], references: [questions.id] }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  topics: many(subjectsTopics),
  questions: many(questions),
}));

export const subjectsTopicsRelations = relations(subjectsTopics, ({ one, many }) => ({
  subject: one(subjects, { fields: [subjectsTopics.subjectId], references: [subjects.id] }),
  subTopics: many(topics),
  questions: many(questions),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subjectTopic: one(subjectsTopics, { fields: [topics.subjectTopicId], references: [subjectsTopics.id] }),
  subtopics: many(subtopics),
  questions: many(questions),
}));

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
  user: one(users, { fields: [notebooks.userId], references: [users.id] }),
  questions: many(notebookQuestions),
}));

// =========================================================================
// PROMPT 7: PAINEL ADMINISTRATIVO COMPLETO E GESTÃO DA PLATAFORMA
// =========================================================================

// 49. Planos de Assinatura (Plans)
export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(), // GRATUITO, PREMIUM_MENSAL, PREMIUM_ANUAL, VITALICIO
  description: text('description'),
  price: numeric('price').default('0').notNull(),
  billingCycle: text('billing_cycle').default('monthly').notNull(), // monthly, yearly, lifetime, free
  featuresJson: text('features_json'), // JSON array of features
  dailyQuestionsLimit: integer('daily_questions_limit').default(15),
  dailyAiQuota: integer('daily_ai_quota').default(5),
  unlimitedSimulations: boolean('unlimited_simulations').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 50. Assinaturas de Usuários (Subscriptions)
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  planId: text('plan_id').references(() => plans.id).notNull(),
  status: text('status').default('active').notNull(), // active, canceled, expired, past_due, trialing
  pricePaid: numeric('price_paid').default('0').notNull(),
  billingCycle: text('billing_cycle').default('monthly').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  cancelReason: text('cancel_reason'),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 51. Transações Financeiras (Payment Transactions)
export const paymentTransactions = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  planName: text('plan_name').notNull(),
  amount: numeric('amount').notNull(),
  paymentMethod: text('payment_method').default('PIX').notNull(), // PIX, CREDIT_CARD, BOLETO
  status: text('status').default('paid').notNull(), // paid, pending, failed, refunded
  transactionCode: text('transaction_code'),
  paidAt: timestamp('paid_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 52. Parâmetros e Configurações Globais do Sistema (System Settings)
export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  category: text('category').default('general').notNull(), // general, limits, ai, maintenance
  description: text('description'),
  updatedByUserId: text('updated_by_user_id').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 53. Comunicados e Notificações Globais da Plataforma (System Announcements)
export const systemAnnouncements = pgTable('system_announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info').notNull(), // info, warning, success, urgent
  targetAudience: text('target_audience').default('all').notNull(), // all, premium, free, student
  isPublished: boolean('is_published').default(true).notNull(),
  scheduledFor: timestamp('scheduled_for'),
  expiresAt: timestamp('expires_at'),
  createdByUserId: text('created_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 54. Solicitações de Suporte e Atendimento (Support Tickets)
export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  category: text('category').default('duvida').notNull(), // duvida, erro_questao, financeiro, sistema, sugestao
  priority: text('priority').default('medium').notNull(), // low, medium, high, urgent
  status: text('status').default('pending').notNull(), // pending, in_analysis, resolved, dismissed
  message: text('message').notNull(),
  adminReply: text('admin_reply'),
  assignedToUserId: text('assigned_to_user_id').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relacionamentos adicionais
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, { fields: [paymentTransactions.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [paymentTransactions.subscriptionId], references: [subscriptions.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
}));

// =============================================================
// PROMPT 9: GAMIFICAÇÃO, RANKINGS, CONQUISTAS E MOTIVAÇÃO
// =============================================================

// 55. Níveis de Progressão Configuráveis (User Levels)
export const userLevels = pgTable('user_levels', {
  level: integer('level').primaryKey(),
  name: text('name').notNull(), // Iniciante, Aprendiz, Dedicado, etc.
  requiredXp: integer('required_xp').notNull(),
  badgeIcon: text('badge_icon').notNull().default('Trophy'),
  description: text('description'),
  perks: text('perks'),
  colorTheme: text('color_theme').default('indigo'),
  active: boolean('active').default(true).notNull(),
});

// 56. Experiência e Perfil Gamificado do Usuário (User Experience)
export const userExperience = pgTable('user_experience', {
  userId: text('user_id').primaryKey().references(() => users.id),
  totalXp: integer('total_xp').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  weeklyXp: integer('weekly_xp').default(0).notNull(),
  monthlyXp: integer('monthly_xp').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  optInRanking: boolean('opt_in_ranking').default(true).notNull(),
  publicNickname: text('public_nickname'),
  hideRealName: boolean('hide_real_name').default(false).notNull(),
  equippedTitle: text('equipped_title'),
  equippedFrame: text('equipped_frame'),
  equippedBadge: text('equipped_badge'),
  equippedTheme: text('equipped_theme').default('default'),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 57. Transações e Auditoria de XP (Xp Transactions com Idempotência)
export const xpTransactions = pgTable('xp_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  activityType: text('activity_type').notNull(), // study_session, question_correct, review_completed, daily_goal, simulation_completed, weekly_plan, streak_7_days, challenge_completed, admin_adjustment
  entityType: text('entity_type'), // question, simulation, study_session, study_goal, challenge, admin
  entityId: text('entity_id'),
  idempotencyKey: text('idempotency_key').unique().notNull(),
  description: text('description').notNull(),
  metadataJson: text('metadata_json'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 58. Conquistas e Medalhas (Achievements)
export const achievements = pgTable('achievements', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // constancy, questions, performance, planning
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('Trophy'),
  criteriaType: text('criteria_type').notNull(), // streak_days, sessions_completed, questions_solved, questions_correct, simulation_score, review_mistakes, daily_goals, weekly_plans
  criteriaValue: integer('criteria_value').notNull(),
  xpReward: integer('xp_reward').default(50).notNull(),
  rarity: text('rarity').default('common').notNull(), // common, rare, epic, legendary
  orderIndex: integer('order_index').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 59. Conquistas Desbloqueadas pelos Usuários (User Achievements)
export const userAchievements = pgTable('user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  achievementId: text('achievement_id').references(() => achievements.id).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  progress: integer('progress').default(0).notNull(),
  isShared: boolean('is_shared').default(false).notNull(),
  sharedAt: timestamp('shared_at'),
});

// 60. Desafios Diários e Semanais (Challenges)
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // daily, weekly
  criteriaType: text('criteria_type').notNull(), // study_time, solve_questions, review_wrong, complete_session, study_different_subjects, study_days_count, complete_simulation
  targetCount: integer('target_count').notNull(),
  xpReward: integer('xp_reward').notNull(),
  badgeRewardIcon: text('badge_reward_icon'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 61. Progresso Individual de Desafios (User Challenges)
export const userChallenges = pgTable('user_challenges', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  challengeId: text('challenge_id').references(() => challenges.id).notNull(),
  periodKey: text('period_key').notNull(), // YYYY-MM-DD para diário ou YYYY-Wxx para semanal
  currentProgress: integer('current_progress').default(0).notNull(),
  targetProgress: integer('target_progress').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  rewardClaimed: boolean('reward_claimed').default(false).notNull(),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 62. Sequência de Dias Estudados (Study Streaks)
export const studyStreaks = pgTable('study_streaks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: text('last_active_date'), // YYYY-MM-DD
  freezeAvailable: boolean('freeze_available').default(true).notNull(),
  freezeUsedCount: integer('freeze_used_count').default(0).notNull(),
  frozenDatesJson: text('frozen_dates_json'),
  historyJson: text('history_json'), // array of dates
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 63. Configurações de Rankings (Leaderboards)
export const leaderboards = pgTable('leaderboards', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // weekly_xp, monthly_xp, all_time_xp, questions_solved, goals_completed, etc.
  name: text('name').notNull(),
  period: text('period').notNull(), // weekly, monthly, all_time, discipline
  disciplineId: text('discipline_id'),
  active: boolean('active').default(true).notNull(),
  description: text('description'),
});

// 64. Entradas e Histórico de Rankings (Leaderboard Entries)
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: text('id').primaryKey(),
  leaderboardId: text('leaderboard_id').references(() => leaderboards.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  userName: text('user_name').notNull(),
  publicNickname: text('public_nickname'),
  avatarUrl: text('avatar_url'),
  score: integer('score').notNull(),
  rank: integer('rank').notNull(),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  levelName: text('level_name'),
  periodKey: text('period_key').default('current').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 65. Grupos de Estudo Privados (Study Groups)
export const studyGroups = pgTable('study_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').notNull().unique(),
  creatorUserId: text('creator_user_id').references(() => users.id).notNull(),
  avatarEmoji: text('avatar_emoji').default('📚').notNull(),
  focusExam: text('focus_exam'),
  isPrivate: boolean('is_private').default(true).notNull(),
  maxMembers: integer('max_members').default(20).notNull(),
  collectiveXp: integer('collective_xp').default(0).notNull(),
  collectiveGoalTarget: integer('collective_goal_target').default(500),
  collectiveGoalProgress: integer('collective_goal_progress').default(0),
  collectiveGoalTitle: text('collective_goal_title'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 66. Membros de Grupos de Estudo (Study Group Members)
export const studyGroupMembers = pgTable('study_group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => studyGroups.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(), // owner, admin, member
  contributedXp: integer('contributed_xp').default(0).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 67. Catálogo de Recompensas Virtuais (Virtual Rewards)
export const virtualRewards = pgTable('virtual_rewards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // avatar_frame, profile_title, badge, color_theme, achievement_card
  itemKey: text('item_key').notNull().unique(),
  requiredLevel: integer('required_level').default(1).notNull(),
  requiredAchievementId: text('required_achievement_id'),
  xpCost: integer('xp_cost').default(0).notNull(),
  icon: text('icon').notNull().default('Sparkles'),
  previewData: text('preview_data'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 68. Recompensas Desbloqueadas e Equipadas do Usuário (User Rewards)
export const userRewards = pgTable('user_rewards', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  rewardId: text('reward_id').references(() => virtualRewards.id).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  isEquipped: boolean('is_equipped').default(false).notNull(),
});

// 69. Parâmetros Globais de Gamificação (Gamification Settings)
export const gamificationSettings = pgTable('gamification_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  category: text('category').default('scoring').notNull(), // scoring, limits, ranking, streak, general
  description: text('description'),
  updatedByUserId: text('updated_by_user_id').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relacionamentos Gamificação
export const userExperienceRelations = relations(userExperience, ({ one }) => ({
  user: one(users, { fields: [userExperience.userId], references: [users.id] }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, { fields: [xpTransactions.userId], references: [users.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, { fields: [userChallenges.userId], references: [users.id] }),
  challenge: one(challenges, { fields: [userChallenges.challengeId], references: [challenges.id] }),
}));

export const studyGroupMembersRelations = relations(studyGroupMembers, ({ one }) => ({
  group: one(studyGroups, { fields: [studyGroupMembers.groupId], references: [studyGroups.id] }),
  user: one(users, { fields: [studyGroupMembers.userId], references: [users.id] }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, { fields: [userRewards.userId], references: [users.id] }),
  reward: one(virtualRewards, { fields: [userRewards.rewardId], references: [virtualRewards.id] }),
}));


