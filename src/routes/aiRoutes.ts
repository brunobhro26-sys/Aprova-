import { Router, Request, Response } from 'express';
import { AIService, getAiConfigStatus } from '../services/ai/aiService.ts';
import { db } from '../db/index.ts';
import { aiConversations, aiMessages, userAnalyticsPreferences } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

export const aiRouter = Router();

function getUserId(req: Request): string {
  return (req.query.userId as string) || (req.body.userId as string) || 'user-bruno-student';
}

// 1. AI Configuration & Model Status
aiRouter.get('/status', (_req: Request, res: Response) => {
  res.json(getAiConfigStatus());
});

// 2. User AI Usage Quota & Statistics
aiRouter.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const stats = await AIService.getUserUsageStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch AI usage stats' });
  }
});

// 3. Explain Question
aiRouter.post('/explain-question', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { questionId, statement, options, correctLetter, chosenLetter, discipline, topic, level } = req.body;

    if (!statement || !options || !correctLetter) {
      return res.status(400).json({ error: 'statement, options e correctLetter são obrigatórios' });
    }

    const result = await AIService.explainQuestion(userId, {
      questionId,
      statement,
      options,
      correctLetter,
      chosenLetter,
      discipline,
      topic,
      level
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in explain-question:', error);
    res.status(500).json({ error: error?.message || 'Failed to explain question' });
  }
});

// 4. Analyze Mistake
aiRouter.post('/analyze-mistake', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { questionId, statement, options, correctLetter, chosenLetter, studentCategory, officialComment, discipline, topic } = req.body;

    if (!statement || !correctLetter || !chosenLetter) {
      return res.status(400).json({ error: 'statement, correctLetter e chosenLetter são obrigatórios' });
    }

    const result = await AIService.analyzeMistake(userId, {
      questionId,
      statement,
      options: options || [],
      correctLetter,
      chosenLetter,
      studentCategory,
      officialComment,
      discipline,
      topic
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in analyze-mistake:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze mistake' });
  }
});

// 5. Summarize Topic
aiRouter.post('/summarize-topic', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicName, discipline, summaryType, level } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: 'topicName é obrigatório' });
    }

    const result = await AIService.summarizeTopic(userId, {
      topicName,
      discipline,
      summaryType: summaryType || 'completo',
      level: level || 'Intermediário'
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in summarize-topic:', error);
    res.status(500).json({ error: error?.message || 'Failed to summarize topic' });
  }
});

// 6. Teacher Mode ("Me ensine este conteúdo do zero")
aiRouter.post('/teacher-mode', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topicName, discipline, level } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: 'topicName é obrigatório' });
    }

    const result = await AIService.teacherMode(userId, topicName, discipline || 'Geral', level || 'Iniciante');
    res.json(result);
  } catch (error: any) {
    console.error('Error in teacher-mode:', error);
    res.status(500).json({ error: error?.message || 'Failed teacher mode' });
  }
});

// 7. Generate Original Questions with AI
aiRouter.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { discipline, subject, topic, difficulty, count, questionType } = req.body;

    if (!discipline || !topic) {
      return res.status(400).json({ error: 'discipline e topic são obrigatórios' });
    }

    const result = await AIService.generateQuestions(userId, {
      discipline,
      subject,
      topic,
      difficulty: difficulty || 'Médio',
      count: count || 3,
      questionType: questionType || 'Múltipla Escolha'
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in generate-questions:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate questions' });
  }
});

// 8. Analyze Performance with AI
aiRouter.post('/analyze-performance', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { analyticsData, userContext } = req.body;

    const result = await AIService.analyzePerformance(userId, analyticsData || {}, userContext || {});
    res.json(result);
  } catch (error: any) {
    console.error('Error in analyze-performance:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze performance' });
  }
});

// 9. Review Study Plan
aiRouter.post('/review-study-plan', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { planConfig, performanceData } = req.body;

    const result = await AIService.reviewStudyPlan(userId, planConfig, performanceData);
    res.json(result);
  } catch (error: any) {
    console.error('Error in review-study-plan:', error);
    res.status(500).json({ error: error?.message || 'Failed to review study plan' });
  }
});

// 10. Chat with Study Assistant
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { conversationId, prompt, contextData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt é obrigatório' });
    }

    let convId = conversationId;
    if (!convId) {
      // Create new conversation
      convId = `conv-${Date.now()}`;
      await db.insert(aiConversations).values({
        id: convId,
        userId,
        title: prompt.slice(0, 40) + '...',
        mode: 'general',
        contextJson: JSON.stringify(contextData || {})
      });
    }

    const result = await AIService.chat(userId, convId, prompt, contextData);
    res.json({ ...result, conversationId: convId });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error?.message || 'Failed to chat' });
  }
});

// 11. List Conversations
aiRouter.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const list = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt));

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch conversations' });
  }
});

// 12. Create Conversation
aiRouter.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, mode, context } = req.body;

    const id = `conv-${Date.now()}`;
    await db.insert(aiConversations).values({
      id,
      userId,
      title: title || 'Nova Conversa de Estudos',
      mode: mode || 'general',
      contextJson: JSON.stringify(context || {})
    });

    res.json({ id, title: title || 'Nova Conversa de Estudos', mode: mode || 'general' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create conversation' });
  }
});

// 13. Get Messages of a Conversation
aiRouter.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, id))
      .orderBy(aiMessages.createdAt);

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch messages' });
  }
});

// 14. Delete Conversation
aiRouter.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(aiConversations).where(eq(aiConversations.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to delete conversation' });
  }
});

// 15. User Analytics & AI Preferences (Privacy Settings)
aiRouter.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const prefs = await db
      .select()
      .from(userAnalyticsPreferences)
      .where(eq(userAnalyticsPreferences.userId, userId))
      .limit(1);

    if (prefs.length === 0) {
      return res.json({
        userId,
        consentAiPersonalization: true,
        sendPerformanceToAi: true,
        masteryMinQuestions: 5,
        masteryAccuracyThreshold: 75
      });
    }

    res.json(prefs[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch preferences' });
  }
});

aiRouter.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { consentAiPersonalization, sendPerformanceToAi, masteryMinQuestions, masteryAccuracyThreshold } = req.body;

    await db
      .insert(userAnalyticsPreferences)
      .values({
        userId,
        consentAiPersonalization: consentAiPersonalization !== false,
        sendPerformanceToAi: sendPerformanceToAi !== false,
        masteryMinQuestions: masteryMinQuestions || 5,
        masteryAccuracyThreshold: masteryAccuracyThreshold || 75,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userAnalyticsPreferences.userId,
        set: {
          consentAiPersonalization: consentAiPersonalization !== false,
          sendPerformanceToAi: sendPerformanceToAi !== false,
          masteryMinQuestions: masteryMinQuestions || 5,
          masteryAccuracyThreshold: masteryAccuracyThreshold || 75,
          updatedAt: new Date()
        }
      });

    res.json({ success: true, message: 'Preferências salvas com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to update preferences' });
  }
});
