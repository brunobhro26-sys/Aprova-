import { Router, Request, Response } from 'express';
import { AnalyticsService, PeriodFilter } from '../services/analytics/analyticsService.ts';

export const analyticsRouter = Router();

// Fallback userId helper
function getUserId(req: Request): string {
  return (req.query.userId as string) || (req.body.userId as string) || 'user-bruno-student';
}

// 1. Overview Indicators
analyticsRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const period = (req.query.period as PeriodFilter) || '30d';
    const start = req.query.startDate as string;
    const end = req.query.endDate as string;

    const data = await AnalyticsService.getOverview(userId, period, start, end);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch overview' });
  }
});

// 2. Evolution Timeline
analyticsRouter.get('/evolution', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const metric = (req.query.metric as 'accuracy' | 'questions' | 'hours' | 'simulations') || 'accuracy';
    const period = (req.query.period as PeriodFilter) || '30d';

    const data = await AnalyticsService.getEvolution(userId, metric, period);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching evolution:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch evolution' });
  }
});

// 3. Subjects Performance
analyticsRouter.get('/subjects', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const period = (req.query.period as PeriodFilter) || 'all';
    const sortBy = (req.query.sortBy as any) || 'accuracy_desc';

    const data = await AnalyticsService.getSubjectsPerformance(userId, period, sortBy);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching subjects performance:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch subjects performance' });
  }
});

// 4. Hierarchy Performance (Concurso -> Cargo -> Disciplina -> Assunto -> Tópico)
analyticsRouter.get('/hierarchy', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getHierarchyPerformance(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching hierarchy performance:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch hierarchy' });
  }
});

// 5. Heatmap
analyticsRouter.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getHeatmap(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch heatmap' });
  }
});

// 6. Error Analysis
analyticsRouter.get('/errors', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const period = (req.query.period as PeriodFilter) || 'all';

    const data = await AnalyticsService.getErrorsAnalysis(userId, period);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching errors analysis:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch error analysis' });
  }
});

// 7. Classify Mistake
analyticsRouter.post('/errors/classify', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { attemptId, questionId, category, notes, aiHypothesis } = req.body;

    if (!questionId || !category) {
      return res.status(400).json({ error: 'questionId e category são obrigatórios' });
    }

    const data = await AnalyticsService.classifyMistake(userId, attemptId, questionId, category, notes, aiHypothesis);
    res.json(data);
  } catch (error: any) {
    console.error('Error classifying mistake:', error);
    res.status(500).json({ error: error?.message || 'Failed to classify mistake' });
  }
});

// 8. Time Analysis
analyticsRouter.get('/time', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const period = (req.query.period as PeriodFilter) || '30d';

    const data = await AnalyticsService.getTimeAnalysis(userId, period);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching time analysis:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch time analysis' });
  }
});

// 9. Simulations Analysis
analyticsRouter.get('/simulations', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getSimulationsAnalysis(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching simulations analysis:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch simulations analysis' });
  }
});

// 10. Exam Boards Performance
analyticsRouter.get('/boards', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getBoardsPerformance(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching boards performance:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch boards performance' });
  }
});

// 11. Reports (Weekly & Monthly)
export const reportsRouter = Router();

reportsRouter.get('/weekly', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getReport(userId, 'weekly');
    res.json(data);
  } catch (error: any) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate weekly report' });
  }
});

reportsRouter.get('/monthly', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const data = await AnalyticsService.getReport(userId, 'monthly');
    res.json(data);
  } catch (error: any) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate monthly report' });
  }
});

reportsRouter.get('/export', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const format = (req.query.format as 'csv' | 'pdf') || 'csv';
    const period = (req.query.period as PeriodFilter) || '30d';

    const subjects = await AnalyticsService.getSubjectsPerformance(userId, period);
    const overview = await AnalyticsService.getOverview(userId, period);

    if (format === 'csv') {
      let csv = 'DISCIPLINA;CATEGORIA;QUESTOES_RESOLVIDAS;ACERTOS;ERROS;TAXA_ACERTO_PCT;TEMPO_MEDIO_SEG\n';
      subjects.forEach(s => {
        csv += `"${s.name}";"${s.category}";${s.questions};${s.correct};${s.wrong};${s.accuracy}%;${s.avgTimeSeconds}\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="desempenho_${period}_${userId}.csv"`);
      return res.send('\uFEFF' + csv);
    }

    res.json({
      exportType: 'pdf',
      overview,
      subjects,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: error?.message || 'Failed to export report' });
  }
});
