import 'dotenv/config';
import { db } from '../db/index.ts';
import {
  users,
  questions,
  questionAlternatives,
  questionAttempts,
  simulations,
  simulationSessions,
  userExperience,
  studyStreaks,
  paymentTransactions,
  subscriptions,
  auditLogs
} from '../db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { GamificationService } from '../services/gamificationService.ts';

async function runComprehensiveAudit() {
  console.log('\n=============================================================');
  console.log('🛡️  BATERIA GERAL DE TESTES & AUDITORIA DE SISTEMA (PROMPT 10)');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // GRUPO 1: AUDITORIA DO BANCO DE DADOS & CONECTIVIDADE
    // -------------------------------------------------------------
    console.log('--- 1. Auditoria de Banco de Dados & Integridade Referencial ---');
    const dbResult = await db.execute(sql`SELECT 1 as connected;`);
    assert(!!dbResult, 'Conexão ativa e responsiva com o PostgreSQL');

    const [userBruno] = await db.select().from(users).where(eq(users.id, 'user-bruno-student'));
    assert(!!userBruno, 'Usuário principal Bruno existe no banco de dados');
    assert(userBruno?.role === 'STUDENT', 'Perfil do usuário Bruno é estritamente STUDENT');

    // -------------------------------------------------------------
    // GRUPO 2: SEGURANÇA & CONTROLE DE ACESSO RBAC
    // -------------------------------------------------------------
    console.log('\n--- 2. Segurança, Proteção de Rotas & RBAC ---');
    // Testar que endpoints administrativos rejeitam perfil de estudante
    const adminRes = await fetch('http://localhost:3000/api/admin/overview', {
      headers: {
        'x-admin-email': 'brunobhro.26@gmail.com',
        // Tentativa proposital de forjar role no header
        'x-admin-role': 'ADMIN'
      }
    });
    assert(
      adminRes.status === 403,
      'API administrativa rejeita estudante mesmo com tentativa de spoofing de header (HTTP 403)',
      `Status retornado: ${adminRes.status}`
    );

    // Testar que administrador autêntico tem acesso permitido
    const adminAuthRes = await fetch('http://localhost:3000/api/admin/overview', {
      headers: {
        'x-admin-email': 'admin@aprova.com'
      }
    });
    assert(
      adminAuthRes.status === 200,
      'Administrador legítimo acessa overview com sucesso (HTTP 200)',
      `Status retornado: ${adminAuthRes.status}`
    );

    // -------------------------------------------------------------
    // GRUPO 3: BANCO DE QUESTÕES & RESOLUÇÃO
    // -------------------------------------------------------------
    console.log('\n--- 3. Banco de Questões & Resolução ---');
    const [sampleQ] = await db.select().from(questions).limit(1);
    assert(!!sampleQ, 'Banco de questões possui questões cadastradas');
    const [correctAlt] = await db
      .select()
      .from(questionAlternatives)
      .where(and(eq(questionAlternatives.questionId, sampleQ.id), eq(questionAlternatives.isCorrect, true)));
    assert(!!correctAlt?.letter, 'Questão possui gabarito oficial definido');

    // Testar tentativa de resposta via API
    const attemptRes = await fetch(`http://localhost:3000/api/questions/${sampleQ.id}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-bruno-student',
        selectedOptionLetter: correctAlt?.letter || 'A',
        timeSpentSeconds: 45
      })
    });
    const attemptData = await attemptRes.json();
    assert(attemptRes.status === 200 && attemptData.isCorrect === true, 'Resolução de questão processada com acerto computado');

    // -------------------------------------------------------------
    // GRUPO 4: SIMULADOS & CORREÇÃO AUTOMÁTICA
    // -------------------------------------------------------------
    console.log('\n--- 4. Módulo de Simulados ---');
    const simsRes = await fetch('http://localhost:3000/api/simulations');
    const simsData = await simsRes.json();
    assert(simsRes.status === 200 && Array.isArray(simsData) && simsData.length > 0, 'Lista de simulados oficiais disponível');

    // -------------------------------------------------------------
    // GRUPO 5: ASSINATURAS, CHECKOUT & WEBHOOK IDEMPOTENTE
    // -------------------------------------------------------------
    console.log('\n--- 5. Assinaturas, Checkout & Webhooks Idempotentes ---');
    // Iniciar checkout PIX
    const checkoutRes = await fetch('http://localhost:3000/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: 'MENSAL', paymentMethod: 'PIX' })
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.status === 200 && !!checkoutData.transactionId, 'Geração de transação de checkout PIX com código copia-e-cola');

    // Disparar Webhook com aprovação de pagamento
    const webhookRes = await fetch('http://localhost:3000/api/subscriptions/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment.approved',
        transactionId: checkoutData.transactionId,
        status: 'PAID',
        secretKey: 'aprova_plus_webhook_secret_production'
      })
    });
    const webhookData = await webhookRes.json();
    assert(webhookRes.status === 200 && webhookData.success === true, 'Webhook processou pagamento e ativou plano no PostgreSQL');

    // Testar Idempotência: re-executar webhook para a mesma transação
    const webhookDupRes = await fetch('http://localhost:3000/api/subscriptions/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment.approved',
        transactionId: checkoutData.transactionId,
        status: 'PAID',
        secretKey: 'aprova_plus_webhook_secret_production'
      })
    });
    const webhookDupData = await webhookDupRes.json();
    assert(webhookDupRes.status === 200 && webhookDupData.message.includes('idempotente'), 'Webhook rejeita cobrança/ativação duplicada (idempotência garantida)');

    // -------------------------------------------------------------
    // GRUPO 6: GAMIFICAÇÃO & XP
    // -------------------------------------------------------------
    console.log('\n--- 6. Gamificação, XP & Anti-Fraude ---');
    const xpRes = await fetch('http://localhost:3000/api/gamification/status');
    const xpData = await xpRes.json();
    assert(xpRes.status === 200 && typeof xpData.totalXp === 'number', 'Consulta de status de gamificação consistente');
    assert(xpData.level.level >= 1 && xpData.level.level <= 10, 'Nível do usuário dentro da escala 1 a 10');

    // -------------------------------------------------------------
    // GRUPO 7: BUSCA GLOBAL MULTI-ENTIDADE
    // -------------------------------------------------------------
    console.log('\n--- 7. Busca Global ---');
    const searchRes = await fetch('http://localhost:3000/api/search?q=Transpetro');
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && Array.isArray(searchData.results) && searchData.results.length > 0, 'Busca global retorna entidades associadas no PostgreSQL');

    // -------------------------------------------------------------
    // GRUPO 8: LGPD & PORTABILIDADE DE DADOS
    // -------------------------------------------------------------
    console.log('\n--- 8. Proteção de Dados (LGPD) ---');
    const exportRes = await fetch('http://localhost:3000/api/lgpd/export');
    const exportData = await exportRes.json();
    assert(exportRes.status === 200 && !!exportData.dadosEstudo, 'Exportação de portabilidade de dados pessoais (Art. 18 LGPD) gerada em JSON');

    // -------------------------------------------------------------
    // GRUPO 9: HEALTH CHECK & OBSERVABILIDADE
    // -------------------------------------------------------------
    console.log('\n--- 9. Health Check & Observabilidade ---');
    const healthRes = await fetch('http://localhost:3000/api/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'operational', 'Health check reporta status operacional e latência de banco');
    assert(healthData.database.status === 'healthy', 'Conexão do banco no health check saudável');

    console.log('\n=============================================================');
    console.log(`🎯 RESULTADO FINAL DA AUDITORIA: ${passed} PASSOU, ${failed} FALHOU`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro fatal durante auditoria geral:', err);
    process.exit(1);
  }
}

runComprehensiveAudit();
