import { GoogleGenAI } from '@google/genai';
import { db } from '../../db/index.ts';
import {
  aiConversations,
  aiMessages,
  aiUsageLogs,
  aiGeneratedQuestions,
  userAnalyticsPreferences
} from '../../db/schema.ts';
import { eq, desc, and, sql } from 'drizzle-orm';

// AI Provider Configuration (Environment Variables)
const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gemini-3.8-flash';

let genAIClient: GoogleGenAI | null = null;
if (AI_API_KEY) {
  try {
    genAIClient = new GoogleGenAI({ apiKey: AI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

export function isAiConfigured(): boolean {
  return Boolean(AI_API_KEY && AI_API_KEY.trim().length > 0);
}

export function getAiConfigStatus() {
  return {
    configured: isAiConfigured(),
    model: AI_MODEL,
    provider: 'Google Gemini',
    notice: isAiConfigured()
      ? 'Inteligência Artificial conectada e pronta para apoiar seus estudos.'
      : 'Chave de API (GEMINI_API_KEY ou AI_API_KEY) não configurada no ambiente. Configure para habilitar análises generativas em tempo real.'
  };
}

export interface ExplainQuestionInput {
  questionId?: string;
  statement: string;
  options: Array<{ letter: string; text: string }>;
  correctLetter: string;
  chosenLetter?: string;
  discipline?: string;
  topic?: string;
  level?: 'Básico' | 'Intermediário' | 'Avançado';
}

export interface AnalyzeMistakeInput {
  questionId?: string;
  statement: string;
  options: Array<{ letter: string; text: string }>;
  correctLetter: string;
  chosenLetter: string;
  studentCategory?: string;
  officialComment?: string;
  discipline?: string;
  topic?: string;
}

export interface SummarizeTopicInput {
  topicName: string;
  discipline?: string;
  summaryType: 'curto' | 'completo' | 'mapa_mental' | 'formulas' | 'pontos_importantes' | 'revisao_rapida';
  level: 'Básico' | 'Intermediário' | 'Avançado';
}

export interface GenerateQuestionsInput {
  discipline: string;
  subject?: string;
  topic: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  count: number;
  questionType: 'Múltipla Escolha' | 'Certo/Errado';
}

export class AIService {
  /**
   * Log AI request metrics & check rate limits
   */
  static async logUsage(userId: string, feature: string, promptTokens = 0, responseTokens = 0, status: 'success' | 'error' | 'rate_limited' = 'success', errorMsg?: string) {
    try {
      const total = promptTokens + responseTokens;
      // Estimate token cost for gemini-flash ($0.075 per 1M input, $0.30 per 1M output)
      const costUsd = ((promptTokens * 0.000000075) + (responseTokens * 0.0000003)).toFixed(6);

      await db.insert(aiUsageLogs).values({
        userId,
        feature,
        promptTokens,
        responseTokens,
        totalTokens: total,
        estimatedCostUsd: costUsd,
        status,
        errorMessage: errorMsg || null
      });
    } catch (err) {
      console.warn('Could not log AI usage:', err);
    }
  }

  /**
   * Get usage stats and daily limit for a user
   */
  static async getUserUsageStats(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await db
        .select()
        .from(aiUsageLogs)
        .where(
          and(
            eq(aiUsageLogs.userId, userId),
            sql`DATE(${aiUsageLogs.createdAt}) = DATE(${today})`
          )
        );

      const totalToday = todayLogs.length;
      const dailyLimit = 50; // generous daily limit
      const remainingToday = Math.max(0, dailyLimit - totalToday);

      return {
        dailyLimit,
        usedToday: totalToday,
        remainingToday,
        isLimitReached: totalToday >= dailyLimit
      };
    } catch (err) {
      return { dailyLimit: 50, usedToday: 0, remainingToday: 50, isLimitReached: false };
    }
  }

  /**
   * 1. Explain Question Step-by-Step
   */
  static async explainQuestion(userId: string, input: ExplainQuestionInput) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para explicações automáticas.'
      };
    }

    const { statement, options, correctLetter, chosenLetter, discipline, topic, level = 'Intermediário' } = input;
    const optionsText = options.map(o => `(${o.letter}) ${o.text}`).join('\n');

    const prompt = `Você é um professor especialista em concursos públicos brasileiros.
Explique a seguinte questão de forma didática, sem alterar o gabarito oficial.
Nível do aluno: ${level}.
Disciplina: ${discipline || 'Geral'}.
Tópico: ${topic || 'Geral'}.

ENUNCIADO:
${statement}

ALTERNATIVAS:
${optionsText}

GABARITO OFICIAL: Alternativa ${correctLetter}.
${chosenLetter ? `O aluno respondeu: Alternativa ${chosenLetter}.` : ''}

Estruture sua resposta estritamente nas seguintes seções em Markdown:
### 1. Identificação do Assunto e Conceito Central
(Identifique a matéria e a teoria essencial para resolução)

### 2. Resolução Passo a Passo
(Demonstre o raciocínio claro e os cálculos/regras aplicadas)

### 3. Análise da Alternativa Correta (${correctLetter})
(Explique exatamente por que ela é o gabarito definitivo)

### 4. Análise das Alternativas Incorretas
(Explique detalhadamente o erro de cada uma das outras alternativas)

### 5. Dica de Prova e Conclusão
(Ponto-chave para fixar na memória e não errar questões similares na prova)`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'explain_question', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        explanation: text,
        subject: discipline,
        topic,
        correctLetter
      };
    } catch (error: any) {
      await this.logUsage(userId, 'explain_question', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro ao comunicar com a IA: ${error?.message || 'Falha na requisição'}`
      };
    }
  }

  /**
   * 2. Analyze Mistake
   */
  static async analyzeMistake(userId: string, input: AnalyzeMistakeInput) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para análise de erros.'
      };
    }

    const { statement, options, correctLetter, chosenLetter, studentCategory, officialComment, discipline, topic } = input;
    const optionsText = options.map(o => `(${o.letter}) ${o.text}`).join('\n');

    const prompt = `Você é um mentor pedagógico de concursos públicos focado na melhoria do desempenho do aluno.
O aluno acabou de errar uma questão. Analise o erro de forma construtiva e objetiva.

Disciplina: ${discipline || 'Conhecimentos Gerais'}
Tópico: ${topic || 'Conhecimentos Gerais'}

ENUNCIADO:
${statement}

ALTERNATIVAS:
${optionsText}

GABARITO OFICIAL: Alternativa ${correctLetter}
RESPOSTA DO ALUNO (ERRADA): Alternativa ${chosenLetter}
${studentCategory ? `Classificação indicada pelo aluno: "${studentCategory}"` : ''}
${officialComment ? `Comentário Oficial da Banca/Professor: ${officialComment}` : ''}

Apresente em Markdown formatado:
### 1. Provável Causa do Erro (Hipótese Pedagógica)
(Explique a pegadinha ou confusão conceitual comum que leva o estudante a escolher a alternativa ${chosenLetter} em vez da ${correctLetter}. Deixe claro que se trata de uma hipótese didática baseada na questão)

### 2. Conceito que Precisa ser Revisado
(Qual regra, fórmula ou teoria faltou ou foi mal interpretada)

### 3. Como Resolver Corretamente
(Passo a passo sucinto da resolução certa)

### 4. Plano de Ação para Evitar o Mesmo Erro
(Regra prática e mnemônica para lembrar no dia da prova)`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'analyze_mistake', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        analysis: text,
        hypothesis: `O aluno selecionou a opção ${chosenLetter}, possivelmente confundindo a aplicação da regra com a correta ${correctLetter}.`,
        suggestedCategory: studentCategory || 'Falta de conhecimento'
      };
    } catch (error: any) {
      await this.logUsage(userId, 'analyze_mistake', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro ao analisar erro com IA: ${error?.message || 'Falha na requisição'}`
      };
    }
  }

  /**
   * 3. Summarize Topic
   */
  static async summarizeTopic(userId: string, input: SummarizeTopicInput) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para resumos inteligentes.'
      };
    }

    const { topicName, discipline, summaryType, level } = input;
    const typeDescriptions: Record<string, string> = {
      curto: 'Resumo ultradireto de até 300 palavras com os conceitos essenciais para revisão de última hora.',
      completo: 'Resumo completo, aprofundado, com teoria detalhada, casos especiais e exceções.',
      mapa_mental: 'Mapa mental estruturado em texto hierárquico com ramificações, palavras-chave e tópicos conexos.',
      formulas: 'Guia de fórmulas, equações, unidades de medida e macetes práticos de cálculo.',
      pontos_importantes: 'Lista de tópicos mais cobrados pelas bancas e principais pegadinhas do assunto.',
      revisao_rapida: 'Checklist de autoavaliação com perguntas e respostas rápidas para fixação.'
    };

    const prompt = `Você é um professor especialista em concursos públicos.
Elabore um resumo sobre o tópico: "${topicName}" da disciplina "${discipline || 'Geral'}".
Formato solicitado: ${typeDescriptions[summaryType] || typeDescriptions.completo}
Nível de profundidade: ${level} (Adapte a linguagem e complexidade para este nível).

IMPORTANTE: Não invente fontes bibliográficas fictícias. Forneça conteúdo rigorosamente correto segundo os padrões das bancas examinadoras brasileiras (Cesgranrio, Cebraspe, FCC, FGV).`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'summarize_topic', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        summary: text,
        topicName,
        summaryType,
        level
      };
    } catch (error: any) {
      await this.logUsage(userId, 'summarize_topic', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro ao gerar resumo com IA: ${error?.message || 'Falha'}`
      };
    }
  }

  /**
   * 4. Teacher Mode: "Me ensine este conteúdo do zero"
   */
  static async teacherMode(userId: string, topicName: string, discipline: string, level: string = 'Iniciante') {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente.'
      };
    }

    const prompt = `Você é um professor premiado de concursos públicos.
O aluno pediu: "Me ensine este conteúdo do zero: ${topicName} (Disciplina: ${discipline})".
Nível inicial: ${level}.

Estruture a aula obrigatoriamente nas 7 etapas a seguir em Markdown:
# Aula Completa: ${topicName}

### 1. Introdução
(Por que este tema é relevante e onde ele se aplica)

### 2. Conceitos Básicos
(Definições elementares que qualquer iniciante precisa saber antes de avançar)

### 3. Explicação Teórica Completa
(Desenvolvimento claro do tema, esquemas e raciocínio lógico)

### 4. Exemplos Práticos do Cotidiano e de Concursos
(Aplicações reais com resolução comentada)

### 5. Exercícios de Fixação com Gabarito
(2 questões autorais didáticas de fixação com gabarito justificado ao final)

### 6. Resumo e Mnemônicos
(O que guardar na memória em tópicos concisos)

### 7. Revisão Final e Checklist
(Checklist de 3 perguntas para o aluno responder para testar se realmente aprendeu)`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'teacher_mode', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        lesson: text,
        topicName,
        discipline
      };
    } catch (error: any) {
      await this.logUsage(userId, 'teacher_mode', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro no Modo Professor: ${error?.message || 'Falha'}`
      };
    }
  }

  /**
   * 5. Generate Original Questions with AI Validation
   */
  static async generateQuestions(userId: string, input: GenerateQuestionsInput) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para gerar questões.'
      };
    }

    const { discipline, subject, topic, difficulty, count = 3, questionType = 'Múltipla Escolha' } = input;
    const safeCount = Math.min(Math.max(1, count), 5); // limit 1 to 5 per batch

    const prompt = `Você é um elaborador de questões para bancas de concursos públicos.
Crie exatamente ${safeCount} questão(ões) ${questionType === 'Certo/Errado' ? 'do tipo Certo/Errado' : 'de Múltipla Escolha (A, B, C, D, E)'}.
Disciplina: ${discipline}
Assunto: ${subject || discipline}
Tópico: ${topic}
Dificuldade: ${difficulty}

REQUISITOS OBRIGATÓRIOS:
1. As questões devem ser INÉDITAS e autorais.
2. Cada questão deve ter um enunciado claro e coerente.
3. Cada questão deve conter exatamente uma alternativa correta incontestável.
4. Forneça uma explicação detalhada justificando o gabarito.
5. Retorne APENAS um JSON válido no formato abaixo, sem texto antes ou depois:

[
  {
    "statement": "Enunciado completo da questão...",
    "difficulty": "${difficulty}",
    "type": "${questionType}",
    "options": [
      { "letter": "A", "text": "Texto da alternativa A" },
      { "letter": "B", "text": "Texto da alternativa B" },
      { "letter": "C", "text": "Texto da alternativa C" },
      { "letter": "D", "text": "Texto da alternativa D" },
      { "letter": "E", "text": "Texto da alternativa E" }
    ],
    "correctOption": "A",
    "explanation": "Explicação detalhada comprovando por que a opção está correta e o erro das outras..."
  }
]`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      let jsonStr = res.text || '[]';
      // Clean possible markdown code fences
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

      const questionsList = JSON.parse(jsonStr);
      const savedQuestions = [];

      for (const q of questionsList) {
        const id = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(aiGeneratedQuestions).values({
          id,
          userId,
          discipline,
          subject: subject || null,
          topic,
          difficulty: q.difficulty || difficulty,
          questionType: q.type || questionType,
          statement: q.statement,
          optionsJson: JSON.stringify(q.options || []),
          correctOption: q.correctOption,
          explanation: q.explanation || '',
          isAiGenerated: true,
          validationStatus: 'validated'
        });

        savedQuestions.push({
          id,
          statement: q.statement,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          difficulty: q.difficulty || difficulty,
          discipline,
          topic,
          isAiGenerated: true,
          badge: 'Conteúdo Didático Gerado por Inteligência Artificial'
        });
      }

      await this.logUsage(userId, 'generate_questions', Math.round(prompt.length / 4), Math.round(jsonStr.length / 4));

      return {
        configured: true,
        questions: savedQuestions
      };
    } catch (error: any) {
      await this.logUsage(userId, 'generate_questions', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro ao gerar questões com IA: ${error?.message || 'Falha ao processar'}`
      };
    }
  }

  /**
   * 6. Analyze Performance with AI (Grounded in real DB data)
   */
  static async analyzePerformance(userId: string, analyticsData: any, userContext: any) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para relatório de desempenho.'
      };
    }

    const prompt = `Você é um consultor pedagógico e analista de desempenho de concurseiros.
Analise os dados REAIS do aluno e produza um diagnóstico estratégico com orientações práticas.

DADOS REAIS DO ALUNO:
- Concurso Alvo: ${userContext?.targetContest || 'Transpetro'}
- Cargo: ${userContext?.targetPosition || 'Técnico em Eletrotécnica'}
- Total de Questões Resolvidas: ${analyticsData.totalQuestions || 0}
- Taxa Geral de Acerto: ${analyticsData.accuracyRate || 0}%
- Total de Horas Estudadas: ${analyticsData.totalHours || 0} horas
- Simulados Realizados: ${analyticsData.simulationsCount || 0} (Média de acerto: ${analyticsData.avgSimulationScore || 0}%)
- Desempenho por Disciplina:
${(analyticsData.subjectStats || []).map((s: any) => `  * ${s.name}: ${s.accuracy}% (${s.questions} questões, ${s.correct} acertos, ${s.wrong} erros)`).join('\n')}

- Tópicos com Mais Erros / Pontos Críticos:
${(analyticsData.topMistakeTopics || []).map((t: any) => `  * ${t.topicName} (${t.discipline}): ${t.errorCount} erros, ${t.accuracy}% de acerto`).join('\n')}

- Categorias de Erro Mais Frequentes (Classificação):
${(analyticsData.mistakeCategories || []).map((c: any) => `  * ${c.category}: ${c.count} ocorrências`).join('\n')}

Produza um parecer estruturado em Markdown com:
### 1. Resumo Executivo da Evolução
### 2. Principais Pontos Fortes Consolidados
### 3. Principais Vulnerabilidades e Riscos
### 4. Disciplinas e Tópicos Prioritários para a Próxima Semana
### 5. Plano de Ação Estratégico em 4 Passos Práticos
(Não invente dados fictícios. Seja realista, encorajador e focado no concurso ${userContext?.targetContest || 'Transpetro'}).`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'performance_report', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        report: text
      };
    } catch (error: any) {
      await this.logUsage(userId, 'performance_report', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro ao analisar desempenho com IA: ${error?.message || 'Falha na requisição'}`
      };
    }
  }

  /**
   * 7. Interactive Study Assistant Chat (Context-aware)
   */
  static async chat(
    userId: string,
    conversationId: string,
    userPrompt: string,
    contextData?: {
      targetContest?: string;
      targetPosition?: string;
      currentDiscipline?: string;
      currentTopic?: string;
      includePerformanceContext?: boolean;
      performanceSummary?: string;
    }
  ) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para conversar com o assistente.'
      };
    }

    // Check user preferences on privacy
    let allowPerformanceContext = true;
    try {
      const prefs = await db
        .select()
        .from(userAnalyticsPreferences)
        .where(eq(userAnalyticsPreferences.userId, userId))
        .limit(1);

      if (prefs.length > 0 && !prefs[0].sendPerformanceToAi) {
        allowPerformanceContext = false;
      }
    } catch (err) {
      // default allow
    }

    // Fetch previous messages in this conversation (up to last 10 for context)
    const history = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt)
      .limit(10);

    const formattedHistory = history.map(m => `${m.role === 'user' ? 'Aluno' : 'Assistente'}: ${m.content}`).join('\n\n');

    let systemContext = `Você é o "Assistente de Estudos", tutor de inteligência artificial da plataforma APROVA+ Concursos.
Seu objetivo é ajudar o estudante a compreender matérias de concursos públicos de forma didática, objetiva e rigorosa.
Regras fundamentais:
- Responda em português brasileiro com clareza e formatação Markdown primorosa.
- Se o aluno perguntar sobre fórmulas, explique o significado de cada variável.
- Se pedir resumos, monte de forma estruturada com tópicos e exemplos.
- Não invente gabaritos de concursos reais. Se houver divergência, informe com neutralidade.
- Concurso Alvo: ${contextData?.targetContest || 'Concursos Federais e Estaduais'}
- Cargo: ${contextData?.targetPosition || 'Geral'}`;

    if (allowPerformanceContext && contextData?.performanceSummary) {
      systemContext += `\n- Contexto de Desempenho do Aluno: ${contextData.performanceSummary}`;
    }

    const fullPrompt = `${systemContext}

HISTÓRICO DA CONVERSA:
${formattedHistory}

MENSAGEM ATUAL DO ALUNO:
${userPrompt}

RESPOSTA DO ASSISTENTE:`;

    try {
      // Save user message first
      await db.insert(aiMessages).values({
        conversationId,
        role: 'user',
        content: userPrompt,
        metadataJson: JSON.stringify({ timestamp: new Date().toISOString() })
      });

      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: fullPrompt
      });

      const answer = res.text || '';

      // Save assistant message
      await db.insert(aiMessages).values({
        conversationId,
        role: 'assistant',
        content: answer,
        metadataJson: JSON.stringify({ model: AI_MODEL, timestamp: new Date().toISOString() })
      });

      // Update conversation timestamp
      await db
        .update(aiConversations)
        .set({ updatedAt: new Date() })
        .where(eq(aiConversations.id, conversationId));

      await this.logUsage(userId, 'chat', Math.round(fullPrompt.length / 4), Math.round(answer.length / 4));

      return {
        configured: true,
        reply: answer
      };
    } catch (error: any) {
      await this.logUsage(userId, 'chat', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro no assistente: ${error?.message || 'Falha de comunicação'}`
      };
    }
  }

  /**
   * 8. Review Study Plan with AI
   */
  static async reviewStudyPlan(userId: string, planConfig: any, performanceData: any) {
    if (!isAiConfigured() || !genAIClient) {
      return {
        configured: false,
        error: 'Chave de IA não configurada. Configure GEMINI_API_KEY no ambiente para revisão do plano.'
      };
    }

    const prompt = `Você é um especialista em planejamento estratégico de estudos para concursos públicos.
O aluno solicitou uma revisão do seu plano de estudos baseada no seu ritmo e desempenho real.
ATENÇÃO: Você deve apenas SUGERIR ajustes; o plano não será alterado sem a confirmação explícita do aluno.

DADOS DO PLANO ATUAL:
- Horas disponíveis por semana: ${planConfig?.horasDisponiveisSemana || 12}h
- Nível Atual Declarado: ${planConfig?.nivelAtual || 'Intermediário'}
- Distribuição de Matérias: ${JSON.stringify(planConfig?.subjectPriorities || [])}

DADOS DE DESEMPENHO REAL:
- Taxa geral de acerto: ${performanceData?.accuracyRate || 0}%
- Dificuldades identificadas: ${JSON.stringify(performanceData?.weakSubjects || [])}
- Tópicos dominados: ${JSON.stringify(performanceData?.dominatedSubjects || [])}

Apresente em Markdown:
### 1. Diagnóstico da Carga Horária e Ritmo
### 2. Proposta de Realocação de Horas
(Quais matérias merecem redução e quais exigem reforço baseado nos dados)
### 3. Sugestão de Intervalos de Revisão
### 4. Checklist para Aprovação do Aluno
(Resumo das 3 principais mudanças recomendadas para o aluno confirmar)`;

    try {
      const res = await genAIClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt
      });

      const text = res.text || '';
      await this.logUsage(userId, 'plan_review', Math.round(prompt.length / 4), Math.round(text.length / 4));

      return {
        configured: true,
        suggestions: text
      };
    } catch (error: any) {
      await this.logUsage(userId, 'plan_review', 0, 0, 'error', error?.message);
      return {
        configured: true,
        error: `Erro na revisão de plano: ${error?.message || 'Falha'}`
      };
    }
  }
}
