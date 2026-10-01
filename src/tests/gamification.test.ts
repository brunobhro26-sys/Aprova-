import { GamificationService } from '../services/gamificationService.ts';
import { seedGamificationModule } from '../db/seedGamification.ts';
import { db } from '../db/index.ts';
import { users, xpTransactions, studyStreaks, userExperience } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

async function runGamificationTests() {
  console.log('🧪 Iniciando Bateria de Testes de Gamificação (Prompt 9)...');
  let passed = 0;
  let failed = 0;

  // Garantir que os dados foram carregados
  try {
    // Verificar se já possui níveis
    const [existingLvl] = await db.select().from(userExperience).limit(1);
    if (!existingLvl) {
      await seedGamificationModule();
    }
  } catch (e) {
    console.warn('Seed já aplicado ou dispensado:', e);
  }

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Teste de Configuração de Pontuação
    console.log('\n--- 1. Teste de Cálculo de Pontuação (XP) ---');
    const xpSession = await GamificationService.getActivityScore('study_session');
    assert(xpSession === 20, 'Sessão de estudo de 25 min deve conceder 20 XP');

    const xpQuestion = await GamificationService.getActivityScore('question_correct');
    assert(xpQuestion === 5, 'Questão acertada deve conceder 5 XP');

    const xpSimulation = await GamificationService.getActivityScore('simulation_completed');
    assert(xpSimulation === 40, 'Simulado concluído deve conceder 40 XP');

    const xpReview = await GamificationService.getActivityScore('review_completed');
    assert(xpReview === 15, 'Revisão espaçada deve conceder 15 XP');

    const xpDailyGoal = await GamificationService.getActivityScore('daily_goal');
    assert(xpDailyGoal === 30, 'Meta diária deve conceder 30 XP');

    // 2. Teste de Progressão de Níveis
    console.log('\n--- 2. Teste de Progressão e Níveis (User Levels) ---');
    const lvl0 = await GamificationService.calculateLevel(0);
    assert(lvl0.level === 1 && lvl0.name === 'Iniciante', '0 XP deve ser Nível 1 (Iniciante)');

    const lvl100 = await GamificationService.calculateLevel(100);
    assert(lvl100.level === 2 && lvl100.name === 'Aprendiz', '100 XP deve ser Nível 2 (Aprendiz)');

    const lvl350 = await GamificationService.calculateLevel(350);
    assert(lvl350.level === 3 && lvl350.name === 'Dedicado', '350 XP deve ser Nível 3 (Dedicado)');

    const lvl840 = await GamificationService.calculateLevel(840);
    assert(lvl840.level === 4 && lvl840.name === 'Persistente', '840 XP deve ser Nível 4 (Persistente)');

    const lvl5500 = await GamificationService.calculateLevel(5500);
    assert(lvl5500.level === 10 && lvl5500.name === 'Mestre da Preparação', '5500 XP deve ser Nível 10 (Mestre da Preparação)');

    // 3. Teste de Prevenção de Pontuação Duplicada (Idempotência)
    console.log('\n--- 3. Teste de Idempotência e Proteção contra Duplicidade ---');
    const testUserId = 'user-bruno-student';
    const testEntityId = `test-q-idemp-${Date.now()}`;

    // Primeira concessão
    const res1 = await GamificationService.awardXp({
      userId: testUserId,
      activityType: 'question_correct',
      entityType: 'question',
      entityId: testEntityId,
      description: 'Teste de questão única 1',
    });
    assert(res1.awarded === true, 'Primeira tentativa de pontuar deve ser aceita');

    // Segunda concessão com mesma entidade (deve ser rejeitada pela chave de idempotência)
    const res2 = await GamificationService.awardXp({
      userId: testUserId,
      activityType: 'question_correct',
      entityType: 'question',
      entityId: testEntityId,
      description: 'Tentativa duplicada da mesma questão',
    });
    assert(res2.awarded === false && res2.xp === 0, 'Segunda tentativa para mesma atividade deve ser ignorada com idempotência');

    // 4. Teste de Sequência de Estudos (Streaks)
    console.log('\n--- 4. Teste de Sequência de Estudos (Streaks) ---');
    const todayStr = new Date().toISOString().split('T')[0];
    const streakResult = await GamificationService.recordDailyStudyActivity(testUserId, todayStr);
    assert(streakResult.currentStreak >= 1, 'Sequência deve registrar pelo menos 1 dia ativo');

    // Repetir no mesmo dia não deve inflar o streak
    const streakResultSameDay = await GamificationService.recordDailyStudyActivity(testUserId, todayStr);
    assert(streakResultSameDay.currentStreak === streakResult.currentStreak, 'Atividades adicionais no mesmo dia não devem duplicar o streak');

    // 5. Teste de Perfil e Privacidade
    console.log('\n--- 5. Teste de Perfil e Privacidade de Ranking ---');
    const expProfile = await GamificationService.getUserExperience(testUserId);
    assert(expProfile.totalXp > 0, 'Perfil de experiência deve conter XP acumulado consistente');
    assert(typeof expProfile.optInRanking === 'boolean', 'Opção de opt-in no ranking deve ser booleana');

    console.log(`\n========================================`);
    console.log(`RESULTADO DOS TESTES: ${passed} PASSOU, ${failed} FALHOU`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro inesperado durante execução dos testes:', error);
    process.exit(1);
  }
}

runGamificationTests();
