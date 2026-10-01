import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import {
  users,
  questionAttempts,
  studySessions,
  studyGoals,
  studyStreaks,
  userExperience,
  questionNotes,
  auditLogs
} from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

export const lgpdRouter = Router();

// -------------------------------------------------------------------------
// 1. EXPORTAÇÃO INTEGRAL DE DADOS PESSOAIS (DIREITO À PORTABILIDADE - ART. 18 LGPD)
// -------------------------------------------------------------------------
lgpdRouter.get('/export', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
    const attempts = await db.select().from(questionAttempts).where(eq(questionAttempts.userId, userId)).limit(500);
    const sessions = await db.select().from(studySessions).where(eq(studySessions.userId, userId)).limit(200);
    const goals = await db.select().from(studyGoals).where(eq(studyGoals.userId, userId));
    const streaks = await db.select().from(studyStreaks).where(eq(studyStreaks.userId, userId));
    const exp = await db.select().from(userExperience).where(eq(userExperience.userId, userId));
    const notes = await db.select().from(questionNotes).where(eq(questionNotes.userId, userId));

    const exportData = {
      plataforma: 'APROVA+ Concursos Públicos',
      dataExportacao: new Date().toISOString(),
      leiAplicavel: 'Lei Geral de Proteção de Dados (Lei 13.709/2018 - LGPD)',
      titular: {
        id: userRecord?.id,
        nome: userRecord?.name,
        email: userRecord?.email,
        cargoAlvo: userRecord?.targetPosition,
        concursoAlvo: userRecord?.targetContest,
        plano: userRecord?.plan,
        dataCadastro: userRecord?.createdAt,
      },
      dadosEstudo: {
        totalQuestoesRespondidas: attempts.length,
        respostasHistorico: attempts,
        sessoesCronometradas: sessions,
        metasEstabelecidas: goals,
        sequenciaConstancia: streaks,
        experienciaEGamificacao: exp,
        anotacoesPedagogicas: notes,
      }
    };

    // Registrar auditoria
    await db.insert(auditLogs).values({
      userId,
      action: 'UPDATE',
      entity: 'users_lgpd_export',
      recordId: userId,
      previousValue: null,
      newValue: 'Exportação de dados pessoais executada com sucesso',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="aprova_plus_meus_dados_${userId}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting user data under LGPD:', error);
    res.status(500).json({ error: 'Falha ao gerar arquivo de portabilidade de dados' });
  }
});

// -------------------------------------------------------------------------
// 2. SOLICITAÇÃO DE EXCLUSÃO DE CONTA E ANONIMIZAÇÃO (ART. 18, VI LGPD)
// -------------------------------------------------------------------------
lgpdRouter.post('/delete-account', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { confirmPhrase, reason } = req.body;

    if (confirmPhrase !== 'EXCLUIR MINHA CONTA') {
      return res.status(400).json({
        error: 'Confirmação inválida. Digite exatamente "EXCLUIR MINHA CONTA" para prosseguir.'
      });
    }

    // Sinalizar solicitação de exclusão no registro do usuário
    await db
      .update(users)
      .set({
        deletedRequested: true,
        status: 'INACTIVE',
        blockedReason: `Solicitação voluntária de exclusão LGPD em ${new Date().toISOString()}. Motivo: ${reason || 'Não informado'}`,
      })
      .where(eq(users.id, userId));

    // Registrar no log de auditoria
    await db.insert(auditLogs).values({
      userId,
      action: 'DELETE',
      entity: 'users',
      recordId: userId,
      previousValue: 'ACTIVE',
      newValue: 'DELETED_REQUESTED_ANONYMIZED',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Sua solicitação de exclusão e anonimização de dados foi registrada com sucesso conforme as diretrizes da LGPD.'
    });
  } catch (error) {
    console.error('Error processing account deletion request:', error);
    res.status(500).json({ error: 'Falha ao processar exclusão de conta' });
  }
});
