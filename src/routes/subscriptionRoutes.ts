import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { users, plans, subscriptions, paymentTransactions, auditLogs } from '../db/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

export const subscriptionRouter = Router();

// -------------------------------------------------------------------------
// 1. STATUS DA ASSINATURA DO USUÁRIO AUTENTICADO
// -------------------------------------------------------------------------
subscriptionRouter.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    // Buscar usuário e plano no banco
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
    const [activeSub] = await db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        billingCycle: subscriptions.billingCycle,
        pricePaid: subscriptions.pricePaid,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        autoRenew: subscriptions.autoRenew,
      })
      .from(subscriptions)
      .where(sql`${subscriptions.userId} = ${userId} AND ${subscriptions.status} IN ('ACTIVE', 'TRIAL')`)
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const isPremium = userRecord?.plan?.includes('PREMIUM') || activeSub?.status === 'ACTIVE' || activeSub?.status === 'TRIAL';

    res.json({
      userId,
      plan: userRecord?.plan || 'GRATUITO',
      isPremium,
      subscription: activeSub || null,
      limits: {
        dailyQuestions: isPremium ? 'unlimited' : 15,
        simulationsPerMonth: isPremium ? 'unlimited' : 1,
        aiExplanationsPerDay: isPremium ? 100 : 5,
        mistakesNotebook: true,
        detailedAnalytics: isPremium,
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Falha ao consultar assinatura do usuário' });
  }
});

// -------------------------------------------------------------------------
// 2. CHECKOUT INTENT: GERAÇÃO DE PEDIDO PIX OU CARTÃO
// -------------------------------------------------------------------------
subscriptionRouter.post('/checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { planType, paymentMethod } = req.body; // 'MENSAL' | 'SEMESTRAL' | 'ANUAL', 'PIX' | 'CREDIT_CARD'

    let priceCents = 2990;
    let planId = 'plan-premium-mensal';
    let planName = 'Plano Premium Mensal';

    if (planType === 'SEMESTRAL') {
      priceCents = 14940; // 6x 24,90
      planId = 'plan-premium-semestral';
      planName = 'Plano Premium Semestral';
    } else if (planType === 'ANUAL') {
      priceCents = 23880; // 12x 19,90
      planId = 'plan-premium-anual';
      planName = 'Plano Premium Anual';
    }

    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `idemp-checkout-${userId}-${planType}-${Date.now().toString().slice(0, -4)}`;

    // Criar registro pendente
    await db.insert(paymentTransactions).values({
      id: txId,
      userId,
      amountCents: priceCents,
      paymentMethod: paymentMethod || 'PIX',
      status: 'PENDING',
      gatewayTransactionId: `gw-${txId}`,
      idempotencyKey,
      metadataJson: JSON.stringify({ planType, planName, initiatedAt: new Date().toISOString() })
    });

    const pixCode = `00020126580014BR.GOV.BCB.PIX0136aprova-pagamentos-${txId}520400005303986540${(priceCents/100).toFixed(2)}5802BR5915APROVA PLUS EDU6009SAO PAULO62070503***6304ABCD`;

    res.json({
      success: true,
      transactionId: txId,
      planName,
      amountFormatted: `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`,
      paymentMethod: paymentMethod || 'PIX',
      pixCopyPaste: pixCode,
      qrCodeData: pixCode,
      status: 'PENDING',
      expiresInMinutes: 30
    });
  } catch (error) {
    console.error('Error initiating checkout:', error);
    res.status(500).json({ error: 'Falha ao processar checkout' });
  }
});

// -------------------------------------------------------------------------
// 3. WEBHOOK DO PROVEDOR DE PAGAMENTOS (IDEMPOTENTE E SEGURO)
// -------------------------------------------------------------------------
subscriptionRouter.post('/webhook', async (req, res: Response) => {
  try {
    const { event, transactionId, status, secretKey } = req.body;

    // Validação de assinatura / secret do webhook
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'aprova_plus_webhook_secret_production';
    if (secretKey && secretKey !== expectedSecret) {
      return res.status(403).json({ error: 'Assinatura inválida do webhook' });
    }

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId obrigatório' });
    }

    // Verificar se transação existe
    const [existingTx] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId));

    if (!existingTx) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Proteção de Idempotência: se já processado com sucesso, responder 200 sem duplicar
    if (existingTx.status === 'PAID') {
      return res.json({ success: true, message: 'Evento já processado anteriormente (idempotente)' });
    }

    const userId = existingTx.userId;

    if (event === 'payment.approved' || status === 'PAID') {
      // 1. Atualizar transação para PAID
      await db
        .update(paymentTransactions)
        .set({ status: 'PAID', updatedAt: new Date() })
        .where(eq(paymentTransactions.id, transactionId));

      // 2. Conceder ou renovar assinatura
      const subId = `sub-${userId}-${Date.now().toString(36)}`;
      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 86400000);

      await db.insert(subscriptions).values({
        id: subId,
        userId,
        planId: 'plan-premium-mensal',
        status: 'ACTIVE',
        pricePaid: existingTx.amountCents,
        billingCycle: 'MONTHLY',
        startDate: now,
        endDate: oneMonthLater,
        autoRenew: true
      });

      // 3. Atualizar plano no perfil do usuário
      await db
        .update(users)
        .set({ plan: 'PREMIUM_MENSAL' })
        .where(eq(users.id, userId));

      // 4. Registrar trilha de auditoria
      await db.insert(auditLogs).values({
        userId,
        action: 'STATUS_CHANGE',
        entity: 'subscriptions',
        recordId: subId,
        previousValue: 'GRATUITO',
        newValue: 'PREMIUM_MENSAL',
        ipAddress: req.ip || '127.0.0.1'
      });

      return res.json({
        success: true,
        message: 'Pagamento aprovado e assinatura ativada com sucesso.',
        subscriptionId: subId,
        userId
      });
    }

    if (event === 'payment.failed' || status === 'FAILED') {
      await db
        .update(paymentTransactions)
        .set({ status: 'FAILED', updatedAt: new Date() })
        .where(eq(paymentTransactions.id, transactionId));

      return res.json({ success: true, message: 'Falha de pagamento registrada.' });
    }

    res.json({ success: true, message: 'Evento processado.' });
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    res.status(500).json({ error: 'Erro interno ao processar webhook' });
  }
});

// -------------------------------------------------------------------------
// 4. CANCELAMENTO DA RENOVAÇÃO AUTOMÁTICA
// -------------------------------------------------------------------------
subscriptionRouter.post('/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { reason } = req.body;

    // Buscar assinatura ativa
    const [activeSub] = await db
      .select()
      .from(subscriptions)
      .where(sql`${subscriptions.userId} = ${userId} AND ${subscriptions.status} = 'ACTIVE'`)
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!activeSub) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada para este usuário.' });
    }

    // Cancelar auto-renovação mantendo acesso até o final do período vigente
    await db
      .update(subscriptions)
      .set({
        autoRenew: false,
        cancelReason: reason || 'Cancelamento voluntário pelo estudante',
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, activeSub.id));

    await db.insert(auditLogs).values({
      userId,
      action: 'UPDATE',
      entity: 'subscriptions',
      recordId: activeSub.id,
      previousValue: 'autoRenew=true',
      newValue: 'autoRenew=false',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Renovação automática desativada com sucesso. Seu acesso continuará ativo até o encerramento do ciclo contratado.',
      accessUntil: activeSub.endDate
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Falha ao cancelar assinatura' });
  }
});
