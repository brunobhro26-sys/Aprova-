import assert from 'node:assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runPrompt11Tests() {
  console.log('================================================================');
  console.log('INICIANDO BATERIA DE TESTES AUTOMATIZADOS — PROMPT 11');
  console.log('Auditoria do Banco de Questões e Motor de Simulados APROVA+');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}`);
      console.error('   Motivo:', err.message);
      throw err;
    }
  }

  // --- SEÇÃO 1: BANCO DE QUESTÕES REAL & SEGURANÇA ---
  await testCase('1.1. Diagnóstico administrativo retorna métricas reais do PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/api/questions/diagnostics`);
    assert.strictEqual(res.status, 200, 'Status deve ser 200');
    const data = await res.json();
    assert(data.totalQuestions >= 50, 'Deve possuir mais de 50 questões cadastradas');
    assert(data.published >= 40, 'Deve possuir pelo menos 40 questões publicadas');
    assert(data.quality?.isHealthy === true, 'Banco de dados deve ser íntegro (sem questões órfãs)');
    assert(Array.isArray(data.bySubject), 'Deve retornar lista de matérias');
    assert(data.bySubject.length >= 8, 'Deve cobrir pelo menos 8 disciplinas');
  });

  await testCase('1.2. GET /api/questions retorna somente PUBLISHED para usuários comuns', async () => {
    const res = await fetch(`${BASE_URL}/api/questions?limit=100`);
    assert.strictEqual(res.status, 200, 'Status deve ser 200');
    const data = await res.json();
    assert(Array.isArray(data.questions), 'Payload deve conter array de questões');
    assert(data.total > 0, 'Total deve ser maior que zero');
    for (const q of data.questions) {
      assert.strictEqual(q.status, 'PUBLISHED', 'Estudantes só podem visualizar status PUBLISHED');
    }
  });

  await testCase('1.3. Ocultação do gabarito (isCorrect) nas alternativas antes da resolução', async () => {
    const res = await fetch(`${BASE_URL}/api/questions?limit=10`);
    const data = await res.json();
    const sample = data.questions[0];
    assert(sample, 'Deve haver ao menos 1 questão');
    assert(Array.isArray(sample.alternatives), 'Questão deve ter alternativas');
    for (const alt of sample.alternatives) {
      assert.strictEqual(alt.isCorrect, undefined, 'isCorrect NÃO deve ser exposto no payload público');
    }
  });

  await testCase('1.4. Paginação real no backend respeita page e limit', async () => {
    const resPage1 = await fetch(`${BASE_URL}/api/questions?page=1&limit=5`);
    const dataPage1 = await resPage1.json();
    assert.strictEqual(dataPage1.questions.length, 5, 'Page 1 deve retornar 5 questões');
    assert.strictEqual(dataPage1.page, 1, 'Página deve ser 1');
    assert.strictEqual(dataPage1.limit, 5, 'Limite deve ser 5');

    const resPage2 = await fetch(`${BASE_URL}/api/questions?page=2&limit=5`);
    const dataPage2 = await resPage2.json();
    assert.strictEqual(dataPage2.questions.length, 5, 'Page 2 deve retornar 5 questões');
    assert.strictEqual(dataPage2.page, 2, 'Página deve ser 2');

    // Verificar se os IDs da página 1 e página 2 não coincidem
    const idsPage1 = dataPage1.questions.map((q: any) => q.id);
    const idsPage2 = dataPage2.questions.map((q: any) => q.id);
    for (const id of idsPage2) {
      assert(!idsPage1.includes(id), 'IDs da página 2 não devem repetir IDs da página 1');
    }
  });

  await testCase('1.5. Filtragem por disciplina real no banco de dados', async () => {
    const res = await fetch(`${BASE_URL}/api/questions?discipline=L%C3%ADngua%20Portuguesa&limit=50`);
    const data = await res.json();
    assert(data.questions.length > 0, 'Deve encontrar questões de Língua Portuguesa');
    for (const q of data.questions) {
      assert.strictEqual(q.subjectId, 'sub-portugues', 'Todas as questões retornadas devem ser de Português');
    }
  });

  let sampleQuestionId = '';
  await testCase('1.6. Consulta de questão individual (GET /api/questions/:id)', async () => {
    const listRes = await fetch(`${BASE_URL}/api/questions?limit=1`);
    const listData = await listRes.json();
    sampleQuestionId = listData.questions[0].id;

    const res = await fetch(`${BASE_URL}/api/questions/${sampleQuestionId}`);
    assert.strictEqual(res.status, 200, 'Status deve ser 200');
    const question = await res.json();
    assert.strictEqual(question.id, sampleQuestionId, 'ID deve corresponder');
    assert(question.statement.length > 10, 'Enunciado deve ser consistente');
    assert(question.alternatives.length >= 4, 'Deve conter pelo menos 4 alternativas');
  });

  await testCase('1.7. Resolução de questão com correção e gabarito no backend', async () => {
    const attemptRes = await fetch(`${BASE_URL}/api/questions/${sampleQuestionId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedOptionLetter: 'A',
        timeSpentSeconds: 18
      })
    });
    assert.strictEqual(attemptRes.status, 200, 'Submissão de resposta deve retornar 200');
    const result = await attemptRes.json();
    assert(typeof result.isCorrect === 'boolean', 'isCorrect deve ser booleano');
    assert(['A', 'B', 'C', 'D', 'E'].includes(result.correctOptionLetter), 'Gabarito oficial deve ser retornado');
    assert(result.explanation && result.explanation.length > 5, 'Explicação detalhada deve ser retornada após envio');
  });

  // --- SEÇÃO 2: MOTOR DE GERAÇÃO E SNAPSHOT DE SIMULADOS ---
  await testCase('2.1. Preview de disponibilidade informa quantidade real e alerta de déficit', async () => {
    // Caso 1: Quantidade suficiente
    const previewSuf = await fetch(`${BASE_URL}/api/simulations/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedCount: 10 })
    });
    const dataSuf = await previewSuf.json();
    assert(dataSuf.hasEnough === true, 'Deve ter acervo suficiente para 10 questões gerais');
    assert(dataSuf.available >= 10, 'Disponível deve ser >= 10');

    // Caso 2: Quantidade insuficiente com filtro restritivo
    const previewIns = await fetch(`${BASE_URL}/api/simulations/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedCount: 50, subjectId: 'sub-informatica' })
    });
    const dataIns = await previewIns.json();
    assert(dataIns.hasEnough === false, 'Informática não possui 50 questões');
    assert(dataIns.available < 50, 'Disponível deve ser menor que 50');
    assert(dataIns.message.includes('Encontramos apenas'), 'Mensagem clara de déficit exigida no Prompt');
  });

  let createdSessionId = '';
  let simulationQuestions: any[] = [];

  await testCase('2.2. Início do simulado cria snapshot imutável no banco com cronômetro do servidor', async () => {
    const startRes = await fetch(`${BASE_URL}/api/simulations/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Simulado Oficial Teste Automatizado',
        totalQuestions: 5,
        timeLimitMinutes: 20
      })
    });
    assert.strictEqual(startRes.status, 201, 'Status de criação deve ser 201');
    const startData = await startRes.json();
    assert(startData.session?.id, 'Deve criar sessão de simulado');
    assert.strictEqual(startData.questions.length, 5, 'Deve carregar exatamente 5 questões');

    createdSessionId = startData.session.id;
    simulationQuestions = startData.questions;

    // Verificar se nenhuma alternativa vazou isCorrect
    for (const q of simulationQuestions) {
      for (const a of q.alternatives) {
        assert.strictEqual(a.isCorrect, undefined, 'Gabarito não pode vazar durante o simulado');
      }
    }
  });

  await testCase('2.3. Auto-save de respostas e marcação para revisão em tempo real', async () => {
    // Responder questão 0
    const q0 = simulationQuestions[0];
    const ansRes0 = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: q0.id,
        selectedOptionLetter: 'C',
        isMarkedForReview: false,
        timeSpentSeconds: 30
      })
    });
    assert.strictEqual(ansRes0.status, 200, 'Auto-save da resposta deve retornar 200');

    // Responder questão 1 e marcar para revisão
    const q1 = simulationQuestions[1];
    const ansRes1 = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: q1.id,
        selectedOptionLetter: 'B',
        isMarkedForReview: true,
        timeSpentSeconds: 45
      })
    });
    assert.strictEqual(ansRes1.status, 200, 'Marcação para revisão deve retornar 200');
  });

  await testCase('2.4. Sincronização e retomada ao recarregar a página (Requisito 17 & 24)', async () => {
    const syncRes = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}`);
    assert.strictEqual(syncRes.status, 200, 'Deve permitir retomar sessão');
    const syncData = await syncRes.json();
    assert.strictEqual(syncData.session.status, 'in_progress', 'Status deve permanecer in_progress');
    assert(syncData.session.remainingSeconds > 0, 'Cronômetro do servidor deve ser positivo');

    // Verificar se as respostas gravadas foram devolvidas
    const savedQ0 = syncData.answers.find((a: any) => a.questionId === simulationQuestions[0].id);
    const savedQ1 = syncData.answers.find((a: any) => a.questionId === simulationQuestions[1].id);
    assert.strictEqual(savedQ0?.selectedOptionLetter, 'C', 'Resposta da Q0 preservada');
    assert.strictEqual(savedQ1?.selectedOptionLetter, 'B', 'Resposta da Q1 preservada');
    assert.strictEqual(savedQ1?.isMarkedForReview, true, 'Flag de revisão da Q1 preservada');
  });

  await testCase('2.5. Finalização e correção server-side (Requisito 21 & 22)', async () => {
    const finishRes = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(finishRes.status, 200, 'Finalização deve retornar 200');
    const finishData = await finishRes.json();
    assert.strictEqual(finishData.session.status, 'completed', 'Sessão deve ser marcada como completed');
    assert(finishData.summary, 'Deve retornar resumo de notas');
    assert.strictEqual(finishData.summary.totalQuestions, 5, 'Total de questões deve ser 5');
    assert.strictEqual(
      finishData.summary.totalCorrect + finishData.summary.totalWrong + finishData.summary.totalBlank,
      5,
      'Soma de acertos + erros + brancos deve ser igual a 5'
    );
  });

  await testCase('2.6. Idempotência contra finalização duplicada (Requisito 25)', async () => {
    const dupRes = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(dupRes.status, 200, 'Finalização repetida deve ser idempotente');
    const dupData = await dupRes.json();
    assert.strictEqual(dupData.session.status, 'completed', 'Status permanece completed sem erro fatal');
  });

  await testCase('2.7. Consulta ao resultado completo com gabarito comentado e desempenho', async () => {
    const resultRes = await fetch(`${BASE_URL}/api/simulations/sessions/${createdSessionId}/result`);
    assert.strictEqual(resultRes.status, 200, 'Resultado deve retornar 200');
    const resultData = await resultRes.json();
    assert(resultData.session, 'Deve retornar objeto session');
    assert(Array.isArray(resultData.questions), 'Deve retornar lista com as 5 questões');
    assert.strictEqual(resultData.questions.length, 5, 'Deve conter as 5 questões originais do snapshot');

    // Cada questão deve agora ter a resposta do usuário e o gabarito oficial com explicação
    for (const q of resultData.questions) {
      assert(q.correctOptionLetter, 'Gabarito oficial deve estar presente no resultado');
      assert(q.explanation, 'Explicação fundamentada deve estar presente');
    }
  });

  await testCase('2.8. Histórico de simulados registra a tentativa concluída (Requisito 23)', async () => {
    const histRes = await fetch(`${BASE_URL}/api/simulations/history`);
    assert.strictEqual(histRes.status, 200, 'Histórico deve retornar 200');
    const historyList = await histRes.json();
    assert(Array.isArray(historyList), 'Histórico deve ser um array');
    const found = historyList.find((h: any) => h.id === createdSessionId);
    assert(found, 'A sessão finalizada deve constar no histórico oficial do aluno');
    assert.strictEqual(found.status, 'completed', 'Status no histórico deve ser completed');
  });

  console.log('\n================================================================');
  console.log(`BATERIA FINALIZADA COM SUCESSO: ${passedTests}/${totalTests} TESTES APROVADOS!`);
  console.log('================================================================\n');
}

runPrompt11Tests().catch((e) => {
  console.error('Falha nos testes automatizados:', e);
  process.exit(1);
});
