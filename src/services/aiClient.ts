// Client-side Study Assistant & AI Integration Service

export interface AIStatus {
  configured: boolean;
  model: string;
  provider: string;
  notice: string;
}

export interface AIUsageStats {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  isLimitReached: boolean;
}

export interface ExplainQuestionResponse {
  configured: boolean;
  explanation?: string;
  subject?: string;
  topic?: string;
  correctLetter?: string;
  error?: string;
}

export interface AnalyzeMistakeResponse {
  configured: boolean;
  analysis?: string;
  hypothesis?: string;
  suggestedCategory?: string;
  error?: string;
}

export interface SummarizeTopicResponse {
  configured: boolean;
  summary?: string;
  topicName?: string;
  summaryType?: string;
  level?: string;
  error?: string;
}

export interface TeacherModeResponse {
  configured: boolean;
  lesson?: string;
  topicName?: string;
  discipline?: string;
  error?: string;
}

export interface AIGeneratedQuestion {
  id: string;
  statement: string;
  options: Array<{ letter: string; text: string }>;
  correctOption: string;
  explanation: string;
  difficulty: string;
  discipline: string;
  topic: string;
  isAiGenerated: boolean;
  badge: string;
}

export interface GenerateQuestionsResponse {
  configured: boolean;
  questions?: AIGeneratedQuestion[];
  error?: string;
}

export interface ChatMessage {
  id?: number | string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadataJson?: string;
  createdAt?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  mode: string;
  contextJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAIPreferences {
  userId: string;
  consentAiPersonalization: boolean;
  sendPerformanceToAi: boolean;
  masteryMinQuestions: number;
  masteryAccuracyThreshold: number;
}

export const AIClient = {
  async getStatus(): Promise<AIStatus> {
    const res = await fetch('/api/ai/status');
    if (!res.ok) throw new Error('Falha ao obter status da IA');
    return res.json();
  },

  async getUsageStats(userId: string): Promise<AIUsageStats> {
    const res = await fetch(`/api/ai/usage-stats?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao obter cotas de IA');
    return res.json();
  },

  async explainQuestion(userId: string, data: {
    questionId?: string;
    statement: string;
    options: Array<{ letter: string; text: string }>;
    correctLetter: string;
    chosenLetter?: string;
    discipline?: string;
    topic?: string;
    level?: 'Básico' | 'Intermediário' | 'Avançado';
  }): Promise<ExplainQuestionResponse> {
    const res = await fetch('/api/ai/explain-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    return res.json();
  },

  async analyzeMistake(userId: string, data: {
    questionId?: string;
    statement: string;
    options?: Array<{ letter: string; text: string }>;
    correctLetter: string;
    chosenLetter: string;
    studentCategory?: string;
    officialComment?: string;
    discipline?: string;
    topic?: string;
  }): Promise<AnalyzeMistakeResponse> {
    const res = await fetch('/api/ai/analyze-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    return res.json();
  },

  async summarizeTopic(userId: string, data: {
    topicName: string;
    discipline?: string;
    summaryType: 'curto' | 'completo' | 'mapa_mental' | 'formulas' | 'pontos_importantes' | 'revisao_rapida';
    level?: 'Básico' | 'Intermediário' | 'Avançado';
  }): Promise<SummarizeTopicResponse> {
    const res = await fetch('/api/ai/summarize-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    return res.json();
  },

  async teacherMode(userId: string, topicName: string, discipline?: string, level?: string): Promise<TeacherModeResponse> {
    const res = await fetch('/api/ai/teacher-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, topicName, discipline, level })
    });
    return res.json();
  },

  async generateQuestions(userId: string, data: {
    discipline: string;
    subject?: string;
    topic: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    count?: number;
    questionType?: 'Múltipla Escolha' | 'Certo/Errado';
  }): Promise<GenerateQuestionsResponse> {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    return res.json();
  },

  async analyzePerformance(userId: string, analyticsData: any, userContext: any) {
    const res = await fetch('/api/ai/analyze-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, analyticsData, userContext })
    });
    return res.json();
  },

  async reviewStudyPlan(userId: string, planConfig: any, performanceData: any) {
    const res = await fetch('/api/ai/review-study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planConfig, performanceData })
    });
    return res.json();
  },

  async chat(userId: string, conversationId: string | null, prompt: string, contextData?: any) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversationId, prompt, contextData })
    });
    return res.json();
  },

  async getConversations(userId: string): Promise<AIConversation[]> {
    const res = await fetch(`/api/ai/conversations?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao listar conversas');
    return res.json();
  },

  async createConversation(userId: string, title?: string, mode?: string, context?: any): Promise<AIConversation> {
    const res = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, mode, context })
    });
    return res.json();
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(conversationId)}/messages`);
    if (!res.ok) throw new Error('Falha ao carregar mensagens');
    return res.json();
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getPreferences(userId: string): Promise<UserAIPreferences> {
    const res = await fetch(`/api/ai/preferences?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Falha ao carregar preferências de IA');
    return res.json();
  },

  async savePreferences(userId: string, prefs: Partial<UserAIPreferences>): Promise<{ success: boolean }> {
    const res = await fetch('/api/ai/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...prefs })
    });
    return res.json();
  }
};
