// Client-side Analytics & Reports API Service
export type PeriodFilter = 'today' | '7d' | '30d' | '90d' | '6m' | '12m' | 'all' | 'custom';

export interface OverviewData {
  period: PeriodFilter;
  indicators: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracyRate: number;
    totalHours: number;
    streakDays: number;
    simulationsCount: number;
    avgSimulationScore: number;
    planProgress: number;
  };
  comparison: {
    diffQuestions: number;
    diffAccuracy: number;
    diffHours: number;
    hasEnoughData: boolean;
  };
  todayAnalysis: {
    todayQuestions: number;
    todayAccuracy: number;
    todayHours: number;
    pendingReviews: number;
    recommendedReview: string;
  };
  priorityToday: {
    discipline: string;
    topic: string;
    reason: string;
    suggestedDurationMinutes: number;
    actionText: string;
  };
  completionForecast: {
    totalTopics: number;
    completedTopics: number;
    percentageCompleted: number;
    forecastText: string;
    disclaimer: string;
  };
}

export interface SubjectStat {
  subjectId: string;
  name: string;
  category: string;
  questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgTimeSeconds: number;
}

export interface TopicHierarchyItem {
  examId: string;
  examName: string;
  positionId: string;
  positionName: string;
  subjectId: string;
  subjectName: string;
  subjectTopicId: string;
  subjectTopicName: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
  avgTimeSeconds: number;
  lastActivity: string;
  nextReview: string;
  masteryStatus: 'DOMINADO' | 'EM DESENVOLVIMENTO' | 'PRECISA REVISAR' | 'NÃO ESTUDADO';
}

export interface HierarchyData {
  exam: { id: string; name: string };
  position: { id: string; name: string };
  topics: TopicHierarchyItem[];
  strengths: Array<{
    topicId: string;
    topicName: string;
    subjectName: string;
    accuracy: number;
    questionsCount: number;
    message: string;
  }>;
  weaknesses: Array<{
    topicId: string;
    topicName: string;
    subjectName: string;
    subjectTopicName: string;
    accuracy: number;
    wrongCount: number;
    lastActivity: string;
    recommendation: string;
    actionText: string;
  }>;
}

export interface HeatmapDiscipline {
  disciplineName: string;
  topics: Array<{
    topicId: string;
    topicName: string;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    accuracyRate: number;
    avgTimeSeconds: number;
    lastActivity: string;
    nextReview: string;
    masteryStatus: string;
    color: 'green' | 'yellow' | 'red' | 'gray';
  }>;
}

export interface ErrorQuestionItem {
  attemptId: number;
  questionId: string;
  code: string;
  statement: string;
  selectedOption: string;
  correctOption: string;
  discipline: string;
  topic: string;
  board: string;
  timeSpentSeconds: number;
  answeredAt: string;
  manualCategory: string;
  aiHypothesis: string | null;
}

export interface ErrorsData {
  totalErrors: number;
  wrongQuestions: ErrorQuestionItem[];
  errorSubjects: Array<{ name: string; errorCount: number }>;
  errorTopics: Array<{ topicId: string; topicName: string; discipline: string; errorCount: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
}

export interface TimeAnalysisData {
  period: PeriodFilter;
  indicators: {
    totalStudyHours: number;
    avgTimePerQuestionSeconds: number;
    questionsPerHour: number;
    hoursPerWeek: number;
    averageReviewMinutes: number;
  };
  disciplineTimes: Array<{
    discipline: string;
    questionsCount: number;
    avgSeconds: number;
    totalHours: number;
  }>;
}

export interface SimulationItem {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  timeSpentMinutes: number;
  date: string;
}

export interface SimulationsData {
  count: number;
  avgScore: number;
  bestScore: number;
  latestScore: number;
  simulations: SimulationItem[];
}

export interface BoardStat {
  boardId: string;
  name: string;
  sigla: string;
  questions: number;
  correct: number;
  accuracy: number;
  avgTimeSeconds: number;
  isReliableSample: boolean;
}

export interface ReportData {
  id: string;
  type: 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  questionsAnswered: number;
  accuracyRate: number;
  sessionsCompleted: number;
  simulationsCount: number;
  goalsReached: number;
  reviewsCompleted: number;
  strengths: any[];
  difficulties: any[];
  subjectBreakdown: SubjectStat[];
  strategicRecommendations: string[];
}

export const AnalyticsClient = {
  async getOverview(userId: string, period: PeriodFilter = '30d', customStart?: string, customEnd?: string): Promise<OverviewData> {
    const params = new URLSearchParams({ userId, period });
    if (customStart) params.append('startDate', customStart);
    if (customEnd) params.append('endDate', customEnd);
    const res = await fetch(`/api/analytics/overview?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar indicadores');
    return res.json();
  },

  async getEvolution(userId: string, metric: 'accuracy' | 'questions' | 'hours' | 'simulations' = 'accuracy', period: PeriodFilter = '30d') {
    const params = new URLSearchParams({ userId, metric, period });
    const res = await fetch(`/api/analytics/evolution?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar evolução');
    return res.json();
  },

  async getSubjects(userId: string, period: PeriodFilter = 'all', sortBy: string = 'accuracy_desc'): Promise<SubjectStat[]> {
    const params = new URLSearchParams({ userId, period, sortBy });
    const res = await fetch(`/api/analytics/subjects?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar desempenho por disciplina');
    return res.json();
  },

  async getHierarchy(userId: string): Promise<HierarchyData> {
    const res = await fetch(`/api/analytics/hierarchy?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao carregar mapa de desempenho');
    return res.json();
  },

  async getHeatmap(userId: string): Promise<{ disciplines: HeatmapDiscipline[] }> {
    const res = await fetch(`/api/analytics/heatmap?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao carregar mapa de calor');
    return res.json();
  },

  async getErrors(userId: string, period: PeriodFilter = 'all'): Promise<ErrorsData> {
    const res = await fetch(`/api/analytics/errors?userId=${encodeURIComponent(userId)}&period=${period}`);
    if (!res.ok) throw new Error('Falha ao carregar análise de erros');
    return res.json();
  },

  async classifyMistake(userId: string, attemptId: number, questionId: string, category: string, notes?: string, aiHypothesis?: string) {
    const res = await fetch('/api/analytics/errors/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, attemptId, questionId, category, notes, aiHypothesis })
    });
    if (!res.ok) throw new Error('Falha ao classificar erro');
    return res.json();
  },

  async getTimeAnalysis(userId: string, period: PeriodFilter = '30d'): Promise<TimeAnalysisData> {
    const res = await fetch(`/api/analytics/time?userId=${encodeURIComponent(userId)}&period=${period}`);
    if (!res.ok) throw new Error('Falha ao carregar análise de tempo');
    return res.json();
  },

  async getSimulations(userId: string): Promise<SimulationsData> {
    const res = await fetch(`/api/analytics/simulations?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao carregar análise de simulados');
    return res.json();
  },

  async getBoards(userId: string): Promise<BoardStat[]> {
    const res = await fetch(`/api/analytics/boards?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao carregar bancas examinadoras');
    return res.json();
  },

  async getReport(userId: string, type: 'weekly' | 'monthly' = 'weekly'): Promise<ReportData> {
    const res = await fetch(`/api/reports/${type}?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`Falha ao gerar relatório ${type}`);
    return res.json();
  },

  getExportCsvUrl(userId: string, period: PeriodFilter = '30d'): string {
    return `/api/reports/export?userId=${encodeURIComponent(userId)}&format=csv&period=${period}`;
  }
};
