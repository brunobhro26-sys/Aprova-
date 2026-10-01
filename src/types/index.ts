export type UserRole = 'STUDENT' | 'ADMIN';

export type SubscriptionTier = 'GRATUITO' | 'PREMIUM_MENSAL' | 'PREMIUM_SEMESTRAL' | 'PREMIUM_ANUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  targetContest?: string;
  targetPosition?: string;
  dailyGoal: number; // e.g. 40 questions
  studyHoursPerDay?: number;
  studyDaysPerWeek?: number;
  prioritySubjects?: string[];
  levelStage?: 'Iniciante' | 'Intermediário' | 'Avançado';
  xp: number;
  streakDays: number;
  lastStudyDate?: string;
  subscription: {
    tier: SubscriptionTier;
    status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
    expiresAt?: string;
  };
  privacyHideNameInRanking?: boolean;
  hideFromRanking?: boolean;
  createdAt: string;
}

export type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';
export type QuestionType = 'Múltipla Escolha' | 'Certo/Errado';

export interface QuestionOption {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  percentageChosen?: number; // for community statistics
}

export interface QuestionComment {
  id: string;
  questionId: string;
  userName: string;
  userRole?: string;
  userBadge?: string;
  content: string;
  createdAt: string;
  likes: number;
  isOfficial?: boolean;
  replies?: QuestionComment[];
}

export interface Question {
  id: string;
  code: string; // e.g. "Q-1042"
  sphere?: 'Federal' | 'Estadual' | 'Distrital' | 'Municipal';
  power?: string;
  organizationId?: string;
  organization: string; // e.g. "Petrobras Transportes S.A."
  contestId?: string;
  contest: string; // e.g. "Transpetro"
  positionId?: string;
  position: string; // e.g. "Técnico em Eletrotécnica"
  boardId?: string;
  board: string; // e.g. "Cesgranrio", "Cebraspe", "FCC"
  year: number;
  disciplineId?: string;
  discipline: string; // e.g. "Circuitos Elétricos"
  subjectId?: string;
  subject?: string; // Assunto, ex: "Circuitos Elétricos"
  subjectTopicId?: string;
  topicId?: string;
  topic: string; // e.g. "Associação de Resistores"
  subtopicId?: string;
  subtopic?: string;
  statement: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctOptionLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  theorySummary?: string; // Summary of underlying theory
  difficulty: QuestionDifficulty;
  type: QuestionType;
  tags: string[];
  isDemonstrative: boolean; // stamped as demonstrative
  timesAnswered: number;
  correctPercentage: number;
}

// -------------------------------------------------------------
// Relational Taxonomy Entities (Prompt Master 4 & 5)
// -------------------------------------------------------------
export interface Sphere {
  id: string;
  name: 'Federal' | 'Estadual' | 'Distrital' | 'Municipal';
  description?: string;
}

export interface Power {
  id: string;
  name: string; // e.g. "Executivo", "Judiciário", "Legislativo", "Sociedade de Economia Mista", etc.
  category: 'Poder' | 'Empresa' | 'Instituição';
}

export interface Organization {
  id: string;
  name: string; // e.g. "Petrobras", "INSS", "Receita Federal"
  acronym: string; // e.g. "PETRO", "RFB"
  sphere: 'Federal' | 'Estadual' | 'Distrital' | 'Municipal';
  power: string;
  type: 'Órgão' | 'Empresa Pública' | 'Sociedade de Economia Mista' | 'Autarquia' | 'Fundação' | 'Agência Reguladora' | 'Tribunal' | 'Universidade';
  websiteUrl?: string;
  description?: string;
}

export interface ExamContest {
  id: string;
  title: string; // e.g. "Concurso Transpetro 2023"
  organizationId: string;
  organizationName: string;
  year: number;
  board: string;
  status: 'Previsto' | 'Edital Publicado' | 'Inscrições Abertas' | 'Encerrado';
  sphere: 'Federal' | 'Estadual' | 'Distrital' | 'Municipal';
  vacancies?: number;
  positionsCount?: number;
}

export interface CareerPosition {
  id: string;
  title: string; // e.g. "Técnico em Eletrotécnica"
  careerArea: 'Técnica e Engenharia' | 'Administrativa' | 'Fiscal' | 'Policial' | 'Jurídica' | 'Bancária' | 'Saúde' | 'Educação' | 'TI';
  schoolingLevel: 'Médio' | 'Técnico' | 'Superior';
  salaryEstimated?: string;
  organizationName?: string;
}

export interface ExamBoard {
  id: string;
  name: string; // e.g. "Fundação Cesgranrio"
  acronym: string; // e.g. "Cesgranrio"
  styleDescription: string;
  websiteUrl?: string;
}

export interface TaxonomyDiscipline {
  id: string;
  name: string; // e.g. "Circuitos Elétricos"
  code?: string;
  questionCount?: number;
}

export interface TaxonomySubject {
  id: string;
  disciplineId: string;
  disciplineName: string;
  name: string; // e.g. "Teoremas de Thévenin e Norton"
}

export interface TaxonomyTopic {
  id: string;
  subjectId: string;
  subjectName: string;
  name: string; // e.g. "Cálculo de Tensão e Resistência Equivalente"
}

export interface Notebook {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetContest?: string;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GlobalSearchResult {
  category: 'Concursos' | 'Cargos' | 'Bancas' | 'Disciplinas' | 'Assuntos' | 'Questões';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  filterKey?: string;
  filterValue?: string;
}

export interface QuestionAnswerRecord {
  id: string;
  userId: string;
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E';
  isCorrect: boolean;
  answeredAt: string;
  simulationId?: string;
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  userId: string;
  failedCount: number;
  timesFailed?: number;
  lastFailedDate: string;
  resolved: boolean;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  questionId: string;
  savedAt: string;
  notes?: string;
}

export interface StudyPlanSession {
  id: string;
  dayOfWeek: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
  discipline: string;
  topic: string;
  hoursAllocated: number;
  completed: boolean;
}

export type StudySession = StudyPlanSession;

export interface ReviewItem {
  id: string;
  discipline: string;
  topic: string;
  reason?: string;
  status: 'PENDENTE' | 'HOJE' | 'ATRASADA' | 'CONCLUÍDA' | 'CONCLUIDA';
  dueDate?: string;
  scheduledDate?: string;
  errorCount?: number;
  questionIds?: string[];
}

export interface SimulationDisciplineResult {
  discipline: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface Simulation {
  id: string;
  title: string;
  contest: string;
  position: string;
  board: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercentage: number;
  timeLimitMinutes: number;
  timeSpentMinutes: number;
  completedAt: string;
  disciplineResults: SimulationDisciplineResult[];
}

export interface SimulationConfig {
  title: string;
  contest: string;
  position: string;
  board: string;
  questionCount: number;
  durationMinutes: number;
  disciplines: string[];
  difficulty?: QuestionDifficulty | 'Todas';
}

export interface SimulationSession {
  id: string;
  userId: string;
  config: SimulationConfig;
  questionIds: string[];
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>; // questionId -> letter
  flaggedQuestionIds: string[];
  startedAt: string;
  finishedAt?: string;
  timeSpentSeconds: number;
  isFinished: boolean;
  score?: number; // total correct
  percentage?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  icon?: string;
  xpReward: number;
  category: 'questoes' | 'dias' | 'simulados' | 'revisoes';
  requirement: number;
  unlockedAt?: string;
  unlocked?: boolean;
}

export interface RankingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: string;
  questionsSolved: number;
  accuracyRate: number;
  targetContest: string;
  position: number;
  isCurrentUser?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  read: boolean;
  createdAt: string;
}

export interface PerformanceStats {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: number;
  studyTimeMinutes: number;
  averageTimePerQuestionSeconds?: number;
  streakDays: number;
  simulationsCompleted: number;
  todayQuestionsAnswered: number;
  dailyGoal: number;
  accuracyByDiscipline: {
    discipline: string;
    answered: number;
    correct: number;
    percentage: number;
  }[];
  historyDays: {
    date: string;
    dayLabel: string;
    questionsCount: number;
    accuracy: number;
  }[];
}

// =========================================================================
// PROMPT 4 TYPES: SISTEMA INTELIGENTE DE PLANEJAMENTO DE ESTUDOS
// =========================================================================

export type StudyGoalStatus = 'Ativo' | 'Pausado' | 'Concluído' | 'Cancelado';
export type StudyGoalPriority = 'Principal' | 'Secundário';
export type StudyLevel = 'Iniciante' | 'Básico' | 'Intermediário' | 'Avançado';
export type SessionType = 'Teoria' | 'Questões' | 'Revisão' | 'Simulado' | 'Correção' | 'Exercícios' | 'Aula';
export type SessionStatus = 'Planejada' | 'Em andamento' | 'Concluída' | 'Cancelada' | 'Atrasada';
export type SessionDifficulty = 'Fácil' | 'Normal' | 'Difícil';
export type TopicProgressStatus = 'Não iniciado' | 'Em estudo' | 'Estudado' | 'Revisando' | 'Dominado';

export interface StudyGoal {
  id: string;
  userId: string;
  examId?: string;
  positionId?: string;
  nome: string;
  dataInicio: string;
  dataProva?: string;
  prioridade: StudyGoalPriority;
  status: StudyGoalStatus;
  nivelAtual: StudyLevel;
  horasDisponiveisSemana: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  examName?: string;
  positionName?: string;
}

export interface StudyAvailability {
  id: string;
  userId: string;
  goalId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  minutes: number;
  notes?: string;
  createdAt?: string;
}

export interface StudySessionItem {
  id: string;
  userId: string;
  goalId?: string;
  planId?: string;
  subjectId?: string;
  topicId?: string;
  tipo: SessionType;
  data: string; // YYYY-MM-DD
  horaInicio?: string;
  horaFim?: string;
  duracaoPlanejada: number; // minutes
  duracaoReal: number; // minutes
  status: SessionStatus;
  difficultyRating?: SessionDifficulty;
  observacoes?: string;
  questionsCount?: number;
  correctQuestionsCount?: number;
  completedAt?: string;
  createdAt?: string;
  subjectName?: string;
  topicName?: string;
}

export interface StudyReviewItem {
  id: string;
  userId: string;
  goalId?: string;
  subjectId: string;
  topicId?: string;
  stage: number;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'delayed';
  intervalDays: number;
  easeFactor: number;
  performanceScore?: number;
  recommendedQuestionsCount: number;
  subjectName?: string;
  topicName?: string;
  errorCount?: number;
}

export interface StudyGoalMetric {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  type: 'daily_questions' | 'weekly_hours' | 'monthly_questions' | 'subject_questions';
  targetValue: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  subjectId?: string;
  subjectName?: string;
  status: 'active' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface TopicProgress {
  id: string;
  userId: string;
  goalId?: string;
  subjectId: string;
  topicId: string;
  status: TopicProgressStatus;
  accuracyPercentage: number;
  questionsAttempted: number;
  questionsCorrect: number;
  masteryScore: number;
  subjectName?: string;
  topicName?: string;
}

export interface StudyRecommendation {
  id: string;
  title: string;
  reason: string;
  discipline: string;
  topic: string;
  topicId?: string;
  subjectId?: string;
  suggestedDurationMinutes: number;
  recommendedQuestionsCount: number;
  type: 'weakness' | 'review' | 'simulation' | 'streak' | 'stale';
  urgency: 'high' | 'medium' | 'low';
}

