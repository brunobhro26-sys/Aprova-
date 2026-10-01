import {
  StudyGoal,
  StudyAvailability,
  StudySessionItem,
  StudyReviewItem,
  StudyGoalMetric,
  TopicProgress,
  StudyRecommendation
} from '../types';

export interface PlanConfig {
  horasDisponiveisSemana: number;
  nivelAtual: 'Iniciante' | 'Básico' | 'Intermediário' | 'Avançado';
  weekendMode: 'normal' | 'reduced' | 'rest';
  restDays: string[];
  subjectPriorities?: Array<{
    subjectId: string;
    subjectName: string;
    weight: number;
    accuracy: number;
    priorityScore: number;
  }>;
}

export interface StudyPlanData {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  version: number;
  status: string;
  configJson?: string;
  createdAt: string;
}

export interface StudyReviewsGrouped {
  hoje: StudyReviewItem[];
  atrasadas: StudyReviewItem[];
  proximas: StudyReviewItem[];
  concluidas: StudyReviewItem[];
  totalCount: number;
}

export interface DisciplineProgressItem {
  subjectId: string;
  subjectName: string;
  category: string;
  totalTopics: number;
  studiedTopics: number;
  dominatedTopics: number;
  percentage: number;
}

export interface StudyProgressData {
  disciplineProgress: DisciplineProgressItem[];
  topicDomainMap: Array<{
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    status: 'Não estudado' | 'Em desenvolvimento' | 'Precisa revisar' | 'Dominado';
    accuracy: number;
    attempted: number;
    correct: number;
  }>;
}

export interface StudyMetricsResponse {
  metrics: StudyGoalMetric[];
  summary: {
    weeklyHoursStudied: number;
    weeklyHoursTarget: number;
    streakDays: number;
    totalSessionsCompleted: number;
  };
}

const API_BASE = '/api';

export class StudyPlanClient {
  // GOALS
  static async getGoals(): Promise<StudyGoal[]> {
    const res = await fetch(`${API_BASE}/study-goals`);
    if (!res.ok) throw new Error('Falha ao carregar objetivos');
    return res.json();
  }

  static async createGoal(goal: Partial<StudyGoal>): Promise<StudyGoal> {
    const res = await fetch(`${API_BASE}/study-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    if (!res.ok) throw new Error('Falha ao criar objetivo');
    return res.json();
  }

  static async updateGoal(id: string, data: Partial<StudyGoal>): Promise<StudyGoal> {
    const res = await fetch(`${API_BASE}/study-goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao atualizar objetivo');
    return res.json();
  }

  static async deleteGoal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/study-goals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir objetivo');
  }

  static async setPrincipalGoal(id: string): Promise<StudyGoal> {
    const res = await fetch(`${API_BASE}/study-goals/${id}/set-principal`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao definir objetivo principal');
    return res.json();
  }

  // AVAILABILITY
  static async getAvailability(goalId?: string): Promise<StudyAvailability[]> {
    const url = goalId ? `${API_BASE}/study-availability?goalId=${goalId}` : `${API_BASE}/study-availability`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar disponibilidade');
    return res.json();
  }

  static async saveAvailability(goalId: string, slots: Partial<StudyAvailability>[]): Promise<StudyAvailability[]> {
    const res = await fetch(`${API_BASE}/study-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, slots })
    });
    if (!res.ok) throw new Error('Falha ao salvar disponibilidade');
    return res.json();
  }

  // SESSIONS
  static async getSessions(params?: { goalId?: string; startDate?: string; endDate?: string }): Promise<StudySessionItem[]> {
    const query = new URLSearchParams();
    if (params?.goalId) query.set('goalId', params.goalId);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/study-sessions?${query.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar sessões de estudo');
    return res.json();
  }

  static async createSession(session: Partial<StudySessionItem>): Promise<StudySessionItem> {
    const res = await fetch(`${API_BASE}/study-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Falha ao agendar sessão');
    return res.json();
  }

  static async updateSession(id: string, data: Partial<StudySessionItem>): Promise<StudySessionItem> {
    const res = await fetch(`${API_BASE}/study-sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao atualizar sessão');
    return res.json();
  }

  static async deleteSession(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/study-sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir sessão');
  }

  static async completeSession(
    id: string,
    feedback: {
      duracaoReal: number;
      difficultyRating?: 'Fácil' | 'Normal' | 'Difícil';
      observacoes?: string;
      questionsCount?: number;
      correctQuestionsCount?: number;
    }
  ): Promise<StudySessionItem> {
    const res = await fetch(`${API_BASE}/study-sessions/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    if (!res.ok) throw new Error('Falha ao finalizar sessão');
    return res.json();
  }

  // REVIEWS & SPACED REPETITION
  static async getReviews(): Promise<StudyReviewsGrouped> {
    const res = await fetch(`${API_BASE}/study-reviews`);
    if (!res.ok) throw new Error('Falha ao carregar revisões');
    return res.json();
  }

  static async completeReview(id: string, score: number): Promise<any> {
    const res = await fetch(`${API_BASE}/study-reviews/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    });
    if (!res.ok) throw new Error('Falha ao completar revisão');
    return res.json();
  }

  static async getReviewQuestions(reviewId: string): Promise<{ review: StudyReviewItem; questions: any[] }> {
    const res = await fetch(`${API_BASE}/study-reviews/${reviewId}/questions`);
    if (!res.ok) throw new Error('Falha ao carregar questões da revisão');
    return res.json();
  }

  // PLAN GENERATION & RECALCULATION
  static async getStudyPlan(goalId?: string): Promise<{ plan: StudyPlanData | null; config: PlanConfig }> {
    const url = goalId ? `${API_BASE}/study-plan?goalId=${goalId}` : `${API_BASE}/study-plan`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar plano de estudos');
    return res.json();
  }

  static async generatePlan(payload: {
    goalId: string;
    examId?: string;
    positionId?: string;
    dataProva?: string;
    horasDisponiveisSemana: number;
    nivelAtual?: string;
    weekendMode?: string;
    restDays?: string[];
    disciplinesConfig?: Array<{ subjectId: string; weight: number; enabled: boolean }>;
    diagnosticResults?: Record<string, number>;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/study-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao gerar plano');
    }
    return res.json();
  }

  static async recalculatePlan(goalId: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/study-plan/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao replanejar');
    }
    return res.json();
  }

  static async getPlanHistory(goalId?: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/study-plan/history`);
    if (!res.ok) throw new Error('Falha ao carregar histórico');
    return res.json();
  }

  // METRICS & PROGRESS
  static async getMetrics(): Promise<StudyMetricsResponse> {
    const res = await fetch(`${API_BASE}/study-metrics`);
    if (!res.ok) throw new Error('Falha ao carregar métricas');
    return res.json();
  }

  static async getStudyProgress(): Promise<StudyProgressData> {
    const res = await fetch(`${API_BASE}/study-progress`);
    if (!res.ok) throw new Error('Falha ao carregar progresso');
    return res.json();
  }

  // RECOMMENDATIONS
  static async getRecommendations(goalId?: string): Promise<{
    whatToStudyNow: StudyRecommendation;
    recommendations: StudyRecommendation[];
  }> {
    const url = goalId ? `${API_BASE}/recommendations?goalId=${goalId}` : `${API_BASE}/recommendations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar recomendações');
    return res.json();
  }
}
