import { Question, PerformanceStats, Notebook, ExamContest, TaxonomySubject } from '../types';

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const adminRole = typeof window !== 'undefined' ? localStorage.getItem('aprova_admin_role') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as any) || {}),
    };
    if (adminRole) {
      headers['x-admin-role'] = adminRole;
    }
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // 1. Concursos
  static async getExams(): Promise<any[]> {
    return this.request<any[]>('/api/exams');
  }

  static async createExam(payload: any): Promise<any> {
    return this.request<any>('/api/exams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateExam(id: string, payload: any): Promise<any> {
    return this.request<any>(`/api/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteExam(id: string): Promise<any> {
    return this.request<any>(`/api/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // 2. Bancas
  static async getBoards(): Promise<any[]> {
    return this.request<any[]>('/api/boards');
  }

  static async createBoard(payload: any): Promise<any> {
    return this.request<any>('/api/boards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 3. Órgãos
  static async getOrganizations(): Promise<any[]> {
    return this.request<any[]>('/api/organizations');
  }

  static async createOrganization(payload: any): Promise<any> {
    return this.request<any>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 4. Cargos
  static async getPositions(): Promise<any[]> {
    return this.request<any[]>('/api/positions');
  }

  static async createPosition(payload: any): Promise<any> {
    return this.request<any>('/api/positions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 5. Disciplinas, Assuntos e Tópicos
  static async getSubjects(): Promise<any[]> {
    return this.request<any[]>('/api/subjects');
  }

  static async getSubjectsTopics(subjectId?: string): Promise<any[]> {
    const q = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<any[]>(`/api/subjects-topics${q}`);
  }

  static async getTopics(subjectTopicId?: string): Promise<any[]> {
    const q = subjectTopicId ? `?subjectTopicId=${encodeURIComponent(subjectTopicId)}` : '';
    return this.request<any[]>(`/api/topics${q}`);
  }

  // 6. Questões
  static async getQuestions(filters: Record<string, any> = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<any>(`/api/questions${queryString}`);
  }

  static async getQuestionDiagnostics(): Promise<{
    totalQuestions: number;
    published: number;
    draft: number;
    review: number;
    archived: number;
    bySubject: { id: string; name: string; count: number }[];
    byBoard: { id: string; name: string; count: number }[];
    byDifficulty: { difficulty: string; count: number }[];
    quality: { withoutAlternatives: number; withoutCorrectAnswer: number; isHealthy: boolean };
    simulations: { total: number; completed: number; inProgress: number };
  }> {
    return this.request<any>('/api/questions/diagnostics');
  }

  static async getQuestionById(id: string): Promise<any> {
    return this.request<any>(`/api/questions/${id}`);
  }

  static async createQuestion(payload: any): Promise<any> {
    return this.request<any>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateQuestion(id: string, payload: any): Promise<any> {
    return this.request<any>(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async updateQuestionStatus(id: string, status: string): Promise<any> {
    return this.request<any>(`/api/questions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  static async deleteQuestion(id: string): Promise<any> {
    return this.request<any>(`/api/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // 7. Resolução de Questão
  static async submitAttempt(
    questionId: string,
    selectedOptionLetter: string,
    timeSpentSeconds: number = 0
  ): Promise<{
    attempt: any;
    isCorrect: boolean;
    correctOptionLetter: string;
    explanation: string;
    bibliographicReference?: string;
  }> {
    return this.request<{
      attempt: any;
      isCorrect: boolean;
      correctOptionLetter: string;
      explanation: string;
      bibliographicReference?: string;
    }>(`/api/questions/${questionId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionLetter, timeSpentSeconds }),
    });
  }

  // 8. Questões Erradas
  static async getWrongQuestions(): Promise<any[]> {
    return this.request<any[]>('/api/questions/wrong');
  }

  // 9. Desempenho e Mapa de Domínio
  static async getPerformance(): Promise<{
    totalAnswered: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    avgTimePerQuestion: number;
    domainMap: Array<{
      topicId: string;
      total: number;
      correct: number;
      percentage: number;
      status: 'DOMINADO' | 'EM DESENVOLVIMENTO' | 'PRECISA REVISAR';
    }>;
  }> {
    return this.request<any>('/api/performance');
  }

  // 10. Cadernos
  static async getNotebooks(): Promise<any[]> {
    return this.request<any[]>('/api/notebooks');
  }

  static async createNotebook(title: string, description?: string, color?: string): Promise<any> {
    return this.request<any>('/api/notebooks', {
      method: 'POST',
      body: JSON.stringify({ title, description, color }),
    });
  }

  static async addQuestionToNotebook(notebookId: string, questionId: string): Promise<any> {
    return this.request<any>(`/api/notebooks/${notebookId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    });
  }

  // 11. Favoritos
  static async getFavorites(): Promise<any[]> {
    return this.request<any[]>('/api/favorites');
  }

  static async toggleFavorite(itemType: 'question' | 'topic' | 'exam' | 'position', itemId: string): Promise<any> {
    return this.request<any>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ itemType, itemId }),
    });
  }

  // 12. Busca Global
  static async globalSearch(query: string): Promise<{ results: any[] }> {
    return this.request<{ results: any[] }>(`/api/search?q=${encodeURIComponent(query)}`);
  }

  // 13. Importação Inteligente
  static async importData(rows: any[], mode: 'preview' | 'commit' = 'preview'): Promise<any> {
    return this.request<any>('/api/import', {
      method: 'POST',
      body: JSON.stringify({ rows, mode }),
    });
  }

  // 14. Anotações Pessoais das Questões
  static async getQuestionNotes(questionId: string): Promise<any[]> {
    return this.request<any[]>(`/api/questions/${questionId}/notes`);
  }

  static async addQuestionNote(questionId: string, content: string): Promise<any> {
    return this.request<any>(`/api/questions/${questionId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  static async deleteQuestionNote(questionId: string, noteId: string): Promise<any> {
    return this.request<any>(`/api/questions/${questionId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // 15. Reportar Questão
  static async reportQuestion(questionId: string, reason: string, description?: string): Promise<any> {
    return this.request<any>(`/api/questions/${questionId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  }

  static async getAdminReports(): Promise<any[]> {
    return this.request<any[]>('/api/admin/reports');
  }

  static async updateReportStatus(reportId: string, status: string): Promise<any> {
    return this.request<any>(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // 16. Revisão Espaçada / Marcadas para Revisar
  static async toggleQuestionReview(questionId: string, isMarked?: boolean): Promise<any> {
    return this.request<any>(`/api/questions/${questionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ isMarked }),
    });
  }

  static async getReviewQuestions(): Promise<any[]> {
    return this.request<any[]>('/api/questions/reviews');
  }

  // 17. Simulados e Sessões
  static async getSimulations(): Promise<any[]> {
    return this.request<any[]>('/api/simulations');
  }

  static async createSimulation(payload: any): Promise<any> {
    return this.request<any>('/api/simulations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async previewSimulation(payload: {
    requestedCount?: number;
    distributionConfig?: Record<string, number> | string;
    examId?: string;
    organizationId?: string;
    boardId?: string;
    positionId?: string;
    subjectId?: string;
    difficulty?: string;
    year?: number;
  }): Promise<{
    requested: number;
    available: number;
    canStart: boolean;
    hasEnough: boolean;
    message: string;
  }> {
    return this.request<any>('/api/simulations/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async startSimulation(payload: {
    simulationId?: string;
    title?: string;
    totalQuestions?: number;
    timeLimitMinutes?: number;
    distributionConfig?: Record<string, number>;
    examId?: string;
    organizationId?: string;
    boardId?: string;
    positionId?: string;
    subjectId?: string;
    difficulty?: string;
    year?: number;
  }): Promise<{ session: any; questions: any[] }> {
    return this.request<{ session: any; questions: any[] }>('/api/simulations/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getSimulationSession(sessionId: string): Promise<{
    session: any;
    answers: any[];
    questions: any[];
  }> {
    return this.request<any>(`/api/simulations/sessions/${sessionId}`);
  }

  static async saveSimulationAnswer(
    sessionId: string,
    payload: {
      questionId: string;
      selectedOptionLetter?: string | null;
      isMarkedForReview?: boolean;
      timeSpentSeconds?: number;
    }
  ): Promise<any> {
    return this.request<any>(`/api/simulations/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async finishSimulation(sessionId: string): Promise<{
    session: any;
    summary: {
      totalQuestions: number;
      totalCorrect: number;
      totalWrong: number;
      totalBlank: number;
      scorePercentage: number;
      timeSpentSeconds: number;
    };
    subjectBreakdown: Array<{
      subjectId: string;
      subjectName: string;
      total: number;
      correct: number;
      wrong: number;
      percentage: number;
    }>;
    topicBreakdown: Array<{
      topicId: string;
      topicName: string;
      total: number;
      correct: number;
      wrong: number;
      percentage: number;
    }>;
  }> {
    return this.request<any>(`/api/simulations/sessions/${sessionId}/finish`, {
      method: 'POST',
    });
  }

  static async getSimulationHistory(): Promise<any[]> {
    return this.request<any[]>('/api/simulations/history');
  }

  static async getSimulationResult(sessionId: string): Promise<{
    session: any;
    subjectBreakdown: any[];
    topicBreakdown: any[];
    questions: any[];
  }> {
    return this.request<any>(`/api/simulations/sessions/${sessionId}/result`);
  }

  // =========================================================================
  // ADMIN & PLATFORM MANAGEMENT SUITE
  // =========================================================================

  static async getAdminOverview(period = '30d'): Promise<any> {
    return this.request<any>(`/api/admin/overview?period=${period}`);
  }

  static async getAdminUsers(params?: { search?: string; plan?: string; status?: string; role?: string }): Promise<{ total: number; users: any[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.plan) q.append('plan', params.plan);
    if (params?.status) q.append('status', params.status);
    if (params?.role) q.append('role', params.role);
    return this.request<{ total: number; users: any[] }>(`/api/admin/users?${q.toString()}`);
  }

  static async getUserDetails(id: string): Promise<any> {
    return this.request<any>(`/api/admin/users/${id}/details`);
  }

  static async updateUserStatus(id: string, status: string, blockedReason?: string): Promise<any> {
    return this.request<any>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, blockedReason })
    });
  }

  static async updateUserRole(id: string, role: string): Promise<any> {
    return this.request<any>(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  static async getAdminPlans(): Promise<any[]> {
    return this.request<any[]>('/api/admin/plans');
  }

  static async createAdminPlan(payload: any): Promise<any> {
    return this.request<any>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async updateAdminPlan(id: string, payload: any): Promise<any> {
    return this.request<any>(`/api/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  static async getAdminSubscriptions(): Promise<any[]> {
    return this.request<any[]>('/api/admin/subscriptions');
  }

  static async cancelAdminSubscription(id: string, reason: string): Promise<any> {
    return this.request<any>(`/api/admin/subscriptions/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  static async getAdminTransactions(): Promise<any[]> {
    return this.request<any[]>('/api/admin/transactions');
  }

  static async getAdminSimulations(): Promise<any[]> {
    return this.request<any[]>('/api/admin/simulations');
  }

  static async createAdminSimulation(payload: any): Promise<any> {
    return this.request<any>('/api/admin/simulations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async getAdminAnnouncements(): Promise<any[]> {
    return this.request<any[]>('/api/admin/announcements');
  }

  static async createAdminAnnouncement(payload: any): Promise<any> {
    return this.request<any>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async deleteAdminAnnouncement(id: string): Promise<any> {
    return this.request<any>(`/api/admin/announcements/${id}`, {
      method: 'DELETE'
    });
  }

  static async getAdminTickets(status = 'all'): Promise<any[]> {
    return this.request<any[]>(`/api/admin/tickets?status=${status}`);
  }

  static async replyAdminTicket(id: string, adminReply: string, status = 'resolved'): Promise<any> {
    return this.request<any>(`/api/admin/tickets/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ adminReply, status })
    });
  }

  static async getAdminAuditLogs(params?: { entity?: string; action?: string }): Promise<any[]> {
    const q = new URLSearchParams();
    if (params?.entity) q.append('entity', params.entity);
    if (params?.action) q.append('action', params.action);
    return this.request<any[]>(`/api/admin/audit-logs?${q.toString()}`);
  }

  static async getAdminSettings(): Promise<any[]> {
    return this.request<any[]>('/api/admin/settings');
  }

  static async updateAdminSetting(key: string, value: string, description?: string, category?: string): Promise<any> {
    return this.request<any>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value, description, category })
    });
  }
}
