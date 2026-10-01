import { db } from './index.ts';
import { eq } from 'drizzle-orm';
import {
  userLevels,
  achievements,
  challenges,
  leaderboards,
  leaderboardEntries,
  studyGroups,
  studyGroupMembers,
  virtualRewards,
  gamificationSettings,
  userExperience,
  userAchievements,
  userChallenges,
  userRewards,
  studyStreaks,
  xpTransactions,
  users
} from './schema.ts';
import { Pool } from 'pg';

export async function ensureGamificationTables() {
  // As tabelas são gerenciadas de forma declarativa e segura via CloudSQL UpdateSchema
}

export async function seedGamificationModule() {
  console.log('Seeding Gamification, Levels, Badges, Challenges & Groups...');

  try {
    await ensureGamificationTables();

    // 1. Níveis de Progressão (Prompt 9: 1 a 10)
    const levelsData = [
      { level: 1, name: 'Iniciante', requiredXp: 0, badgeIcon: 'Compass', description: 'O primeiro passo na preparação para aprovação.', perks: 'Acesso ao quadro de conquistas e metas diárias.', colorTheme: 'slate' },
      { level: 2, name: 'Aprendiz', requiredXp: 100, badgeIcon: 'BookOpen', description: 'Construindo o hábito de resolver questões diariamente.', perks: 'Desbloqueio de moldura inicial de avatar.', colorTheme: 'indigo' },
      { level: 3, name: 'Dedicado', requiredXp: 300, badgeIcon: 'Target', description: 'Estudo constante com foco em fixação de conteúdo.', perks: 'Participação nos grupos de estudo e desafios semanais.', colorTheme: 'blue' },
      { level: 4, name: 'Persistente', requiredXp: 600, badgeIcon: 'Flame', description: 'Superando erros e mantendo sequências de dias.', perks: 'Recurso de congelamento de sequência protetivo.', colorTheme: 'amber' },
      { level: 5, name: 'Determinado', requiredXp: 1000, badgeIcon: 'ShieldCheck', description: 'Domínio consolidado das disciplinas básicas do edital.', perks: 'Desbloqueio de título de perfil exclusivo.', colorTheme: 'teal' },
      { level: 6, name: 'Estrategista', requiredXp: 1500, badgeIcon: 'Brain', description: 'Análise minuciosa de métricas e caderno de erros.', perks: 'Acesso a ranking por disciplina especializada.', colorTheme: 'violet' },
      { level: 7, name: 'Especialista', requiredXp: 2200, badgeIcon: 'Award', description: 'Alta precisão em simulados e questões de bancas.', perks: 'Emblema dourado de Especialista no perfil.', colorTheme: 'purple' },
      { level: 8, name: 'Avançado', requiredXp: 3000, badgeIcon: 'Zap', description: 'Preparação competitiva em alto rendimento.', perks: 'Criação de desafios para grupos de estudo.', colorTheme: 'rose' },
      { level: 9, name: 'Elite dos Estudos', requiredXp: 4000, badgeIcon: 'Star', description: 'Entre os estudantes com maior constância e acertos.', perks: 'Moldura de Avatar Elite Luminosa.', colorTheme: 'amber' },
      { level: 10, name: 'Mestre da Preparação', requiredXp: 5500, badgeIcon: 'Crown', description: 'Pronto para gabaritar a prova do concurso almejado.', perks: 'Título supremo de Mestre e Tema Áureo de Perfil.', colorTheme: 'yellow' },
    ];

    for (const lvl of levelsData) {
      await db.insert(userLevels).values(lvl).onConflictDoNothing();
    }

    // 2. Parâmetros e Regras de Gamificação
    const defaultSettings = [
      { key: 'xp_study_session_25min', value: '20', category: 'scoring', description: 'Pontos XP por sessão pomodoro de 25 minutos concluída' },
      { key: 'xp_question_correct', value: '5', category: 'scoring', description: 'Pontos XP por questão acertada' },
      { key: 'xp_review_completed', value: '15', category: 'scoring', description: 'Pontos XP por revisão espaçada concluída' },
      { key: 'xp_daily_goal', value: '30', category: 'scoring', description: 'Pontos XP ao cumprir a meta do dia' },
      { key: 'xp_simulation_completed', value: '40', category: 'scoring', description: 'Pontos XP ao finalizar um simulado' },
      { key: 'xp_weekly_plan_completed', value: '100', category: 'scoring', description: 'Pontos XP ao concluir o plano semanal de estudos' },
      { key: 'xp_streak_7_days', value: '50', category: 'scoring', description: 'Pontos XP bônus por atingir 7 dias consecutivos de constância' },
      { key: 'daily_xp_cap', value: '300', category: 'limits', description: 'Limite diário de ganho de XP para evitar sobrecarga ou abuso' },
      { key: 'rankings_enabled', value: 'true', category: 'ranking', description: 'Permite participação em quadros de líderes públicos' },
      { key: 'streak_min_questions', value: '5', category: 'streak', description: 'Quantidade mínima de questões para validar dia de streak' },
    ];

    for (const st of defaultSettings) {
      await db.insert(gamificationSettings).values(st).onConflictDoNothing();
    }

    // 3. Conquistas e Medalhas (Prompt 9: 4 Categorias)
    const achievementsList = [
      // Constância
      { id: 'ach-first-day', category: 'constancy', name: 'Primeiro Passo', description: 'Completou seu primeiro dia de estudos na APROVA+.', icon: 'Flag', criteriaType: 'streak_days', criteriaValue: 1, xpReward: 25, rarity: 'common', orderIndex: 1 },
      { id: 'ach-streak-3', category: 'constancy', name: 'Ritmo Constante', description: 'Manteve 3 dias consecutivos de estudos.', icon: 'Flame', criteriaType: 'streak_days', criteriaValue: 3, xpReward: 50, rarity: 'common', orderIndex: 2 },
      { id: 'ach-streak-7', category: 'constancy', name: 'Semana de Ferro', description: 'Alcançou 7 dias ininterruptos de dedicação.', icon: 'Zap', criteriaType: 'streak_days', criteriaValue: 7, xpReward: 100, rarity: 'rare', orderIndex: 3 },
      { id: 'ach-streak-30', category: 'constancy', name: 'Hábito Inquebrável', description: '30 dias de constância absoluta rumo à posse.', icon: 'ShieldAlert', criteriaType: 'streak_days', criteriaValue: 30, xpReward: 300, rarity: 'epic', orderIndex: 4 },
      { id: 'ach-sessions-100', category: 'constancy', name: 'Centurião do Foco', description: 'Concluiu 100 sessões de estudo com foco pleno.', icon: 'Clock', criteriaType: 'sessions_completed', criteriaValue: 100, xpReward: 250, rarity: 'epic', orderIndex: 5 },

      // Questões
      { id: 'ach-q-first', category: 'questions', name: 'Batismo de Fogo', description: 'Resolveu sua primeira questão no banco de questões.', icon: 'CheckCircle', criteriaType: 'questions_solved', criteriaValue: 1, xpReward: 15, rarity: 'common', orderIndex: 6 },
      { id: 'ach-q-100', category: 'questions', name: 'Treinamento Prático', description: 'Respondeu a 100 questões com seriedade.', icon: 'HelpCircle', criteriaType: 'questions_solved', criteriaValue: 100, xpReward: 80, rarity: 'common', orderIndex: 7 },
      { id: 'ach-q-500', category: 'questions', name: 'Calejado pelas Bancas', description: 'Resolveu 500 questões no estilo de prova.', icon: 'Layers', criteriaType: 'questions_solved', criteriaValue: 500, xpReward: 200, rarity: 'rare', orderIndex: 8 },
      { id: 'ach-q-1000', category: 'questions', name: 'Milhar Concurseiro', description: 'Completou a marca de 1.000 questões analisadas.', icon: 'Award', criteriaType: 'questions_solved', criteriaValue: 1000, xpReward: 400, rarity: 'epic', orderIndex: 9 },
      { id: 'ach-q-correct-100', category: 'questions', name: 'Mente Afiada', description: 'Acertou 100 questões com precisão cirúrgica.', icon: 'Crosshair', criteriaType: 'questions_correct', criteriaValue: 100, xpReward: 100, rarity: 'rare', orderIndex: 10 },

      // Desempenho
      { id: 'ach-sim-70', category: 'performance', name: 'Na Linha de Corte', description: 'Atingiu 70% de acertos em um simulado completo.', icon: 'BarChart', criteriaType: 'simulation_score', criteriaValue: 70, xpReward: 70, rarity: 'common', orderIndex: 11 },
      { id: 'ach-sim-80', category: 'performance', name: 'Zona de Classificação', description: 'Alcançou 80% de rendimento em um simulado.', icon: 'TrendingUp', criteriaType: 'simulation_score', criteriaValue: 80, xpReward: 150, rarity: 'rare', orderIndex: 12 },
      { id: 'ach-sim-90', category: 'performance', name: 'Pódio do Concurso', description: 'Conquistou impressionantes 90% ou mais em simulado.', icon: 'Star', criteriaType: 'simulation_score', criteriaValue: 90, xpReward: 300, rarity: 'legendary', orderIndex: 13 },
      { id: 'ach-mistakes-review', category: 'performance', name: 'Aprender com o Erro', description: 'Concluiu uma sessão de revisão no Caderno de Erros.', icon: 'RotateCcw', criteriaType: 'review_mistakes', criteriaValue: 1, xpReward: 50, rarity: 'common', orderIndex: 14 },
      { id: 'ach-perf-improve', category: 'performance', name: 'Evolução Notável', description: 'Subiu de faixa de domínio (precisa revisar para dominado).', icon: 'Sparkles', criteriaType: 'domain_mastery', criteriaValue: 1, xpReward: 80, rarity: 'rare', orderIndex: 15 },

      // Planejamento
      { id: 'ach-goal-first', category: 'planning', name: 'Meta Cumprida', description: 'Concluiu com sucesso a primeira meta diária planejada.', icon: 'CheckSquare', criteriaType: 'daily_goals', criteriaValue: 1, xpReward: 30, rarity: 'common', orderIndex: 16 },
      { id: 'ach-week-complete', category: 'planning', name: 'Semana Perfeita', description: 'Completou todas as metas do cronograma semanal.', icon: 'Calendar', criteriaType: 'weekly_plans', criteriaValue: 1, xpReward: 120, rarity: 'rare', orderIndex: 17 },
      { id: 'ach-goals-30', category: 'planning', name: 'Mestre da Disciplina', description: 'Cumpriu 30 metas diárias estabelecidas no plano.', icon: 'CheckCheck', criteriaType: 'daily_goals', criteriaValue: 30, xpReward: 250, rarity: 'epic', orderIndex: 18 },
      { id: 'ach-plan-finish', category: 'planning', name: 'Edital Vencido', description: 'Finalizou 100% de um plano de estudos com ciclo completo.', icon: 'Trophy', criteriaType: 'plan_completion', criteriaValue: 1, xpReward: 500, rarity: 'legendary', orderIndex: 19 },
    ];

    for (const ach of achievementsList) {
      await db.insert(achievements).values(ach).onConflictDoNothing();
    }

    // 4. Desafios Diários e Semanais
    const challengesList = [
      // Diários
      { id: 'chal-daily-study-30', title: 'Foco Diário de 30 Min', description: 'Estude ativamente por 30 minutos hoje no cronômetro.', type: 'daily', criteriaType: 'study_time', targetCount: 30, xpReward: 25, badgeRewardIcon: 'Clock' },
      { id: 'chal-daily-questions-20', title: 'Maratona de 20 Questões', description: 'Resolva 20 questões de qualquer disciplina.', type: 'daily', criteriaType: 'solve_questions', targetCount: 20, xpReward: 30, badgeRewardIcon: 'CheckCircle2' },
      { id: 'chal-daily-review-wrong', title: 'Revisão de Erros', description: 'Revise 5 questões que errou anteriormente.', type: 'daily', criteriaType: 'review_wrong', targetCount: 5, xpReward: 20, badgeRewardIcon: 'RotateCcw' },
      { id: 'chal-daily-session', title: 'Concluir 1 Sessão', description: 'Finalize um bloco completo de estudos ou pomodoro.', type: 'daily', criteriaType: 'complete_session', targetCount: 1, xpReward: 15, badgeRewardIcon: 'Target' },
      { id: 'chal-daily-two-subjects', title: 'Diversificação', description: 'Estude tópicos de duas disciplinas distintas hoje.', type: 'daily', criteriaType: 'study_different_subjects', targetCount: 2, xpReward: 25, badgeRewardIcon: 'Layers' },

      // Semanais
      { id: 'chal-weekly-5days', title: 'Constância Semanal', description: 'Estude em pelo menos 5 dias diferentes nesta semana.', type: 'weekly', criteriaType: 'study_days_count', targetCount: 5, xpReward: 60, badgeRewardIcon: 'Calendar' },
      { id: 'chal-weekly-questions-100', title: 'Centena de Ouro', description: 'Resolva 100 questões ao longo da semana.', type: 'weekly', criteriaType: 'solve_questions', targetCount: 100, xpReward: 80, badgeRewardIcon: 'HelpCircle' },
      { id: 'chal-weekly-sessions-5', title: 'Ciclo de 5 Sessões', description: 'Conclua 5 sessões de estudo guiadas pelo plano.', type: 'weekly', criteriaType: 'complete_session', targetCount: 5, xpReward: 50, badgeRewardIcon: 'Zap' },
      { id: 'chal-weekly-simulation', title: 'Desafio Simulado', description: 'Realize e finalize pelo menos 1 simulado completo.', type: 'weekly', criteriaType: 'complete_simulation', targetCount: 1, xpReward: 50, badgeRewardIcon: 'Award' },
    ];

    for (const ch of challengesList) {
      await db.insert(challenges).values(ch).onConflictDoNothing();
    }

    // 5. Leaderboards Oficiais
    const defaultLeaderboards = [
      { id: 'lb-weekly', code: 'weekly_xp', name: 'Ranking Semanal de XP', period: 'weekly', description: 'Pontos acumulados de segunda a domingo' },
      { id: 'lb-monthly', code: 'monthly_xp', name: 'Ranking Mensal de XP', period: 'monthly', description: 'Pontos acumulados no mês vigente' },
      { id: 'lb-alltime', code: 'all_time_xp', name: 'Ranking Geral Histórico', period: 'all_time', description: 'Classificação global de dedicação acumulada' },
      { id: 'lb-questions', code: 'questions_solved', name: 'Mestres das Questões', period: 'monthly', description: 'Quem resolveu mais questões neste mês' },
      { id: 'lb-goals', code: 'goals_completed', name: 'Campeões de Metas', period: 'monthly', description: 'Maior índice de metas do plano cumpridas' },
    ];

    for (const lb of defaultLeaderboards) {
      await db.insert(leaderboards).values(lb).onConflictDoNothing();
    }

    // 6. Catálogo de Recompensas Virtuais
    const rewardsCatalog = [
      // Molduras de Avatar
      { id: 'rew-frame-bronze', name: 'Moldura Bronze do Conhecimento', description: 'Borda com acabamento bronzeado para iniciantes dedicados.', type: 'avatar_frame', itemKey: 'frame_bronze', requiredLevel: 2, xpCost: 0, icon: 'Shield', previewData: JSON.stringify({ border: 'border-amber-700', shadow: 'shadow-amber-900/20' }) },
      { id: 'rew-frame-silver', name: 'Moldura Prata da Constância', description: 'Reflete disciplina e foco inabalável nos estudos.', type: 'avatar_frame', itemKey: 'frame_silver', requiredLevel: 4, xpCost: 0, icon: 'ShieldCheck', previewData: JSON.stringify({ border: 'border-slate-300 dark:border-slate-400', shadow: 'shadow-slate-400/30' }) },
      { id: 'rew-frame-gold', name: 'Moldura Ouro Especialista', description: 'Acabamento reluzente para estudantes em nível de aprovação.', type: 'avatar_frame', itemKey: 'frame_gold', requiredLevel: 7, xpCost: 0, icon: 'Award', previewData: JSON.stringify({ border: 'border-amber-400', shadow: 'shadow-amber-400/40' }) },
      { id: 'rew-frame-transpetro', name: 'Moldura Petróleo & Energia', description: 'Em honra aos aspirantes às carreiras técnicas da Transpetro e Petrobras.', type: 'avatar_frame', itemKey: 'frame_transpetro', requiredLevel: 5, xpCost: 0, icon: 'Zap', previewData: JSON.stringify({ border: 'border-emerald-500', shadow: 'shadow-emerald-500/40' }) },

      // Títulos de Perfil
      { id: 'rew-title-focado', name: 'Título: Foco Absoluto', description: 'Exibe o título "Foco Absoluto" ao lado do seu nome no ranking e perfil.', type: 'profile_title', itemKey: 'title_foco_absoluto', requiredLevel: 3, xpCost: 0, icon: 'Tag', previewData: 'Foco Absoluto' },
      { id: 'rew-title-estrategista', name: 'Título: Estrategista de Provas', description: 'Para quem analisa minuciosamente bancas e editais.', type: 'profile_title', itemKey: 'title_estrategista', requiredLevel: 6, xpCost: 0, icon: 'Tag', previewData: 'Estrategista de Provas' },
      { id: 'rew-title-futuro-aprovado', name: 'Título: Futuro Concursado', description: 'Declaração pública de compromisso com a vaga.', type: 'profile_title', itemKey: 'title_futuro_concursado', requiredLevel: 1, xpCost: 0, icon: 'Tag', previewData: 'Futuro Concursado' },
      { id: 'rew-title-transpetro', name: 'Título: Aspirante Transpetro', description: 'Destinado a quem estuda para o edital Transpetro 2023/2026.', type: 'profile_title', itemKey: 'title_aspirante_transpetro', requiredLevel: 4, xpCost: 0, icon: 'Tag', previewData: 'Aspirante Transpetro' },

      // Emblemas de Perfil
      { id: 'rew-badge-coruja', name: 'Emblema Coruja Noturna', description: 'Símbolo clássico da sabedoria e sessões focadas.', type: 'badge', itemKey: 'badge_coruja', requiredLevel: 2, xpCost: 0, icon: 'Eye', previewData: '🦉' },
      { id: 'rew-badge-raio', name: 'Emblema Eletrotécnico', description: 'Homenagem aos estudos de circuitos e máquinas elétricas.', type: 'badge', itemKey: 'badge_eletro', requiredLevel: 3, xpCost: 0, icon: 'Zap', previewData: '⚡' },
      { id: 'rew-badge-inquebravel', name: 'Emblema Escudo Inabalável', description: 'Conquistado por estudantes com alta resiliência.', type: 'badge', itemKey: 'badge_escudo', requiredLevel: 5, xpCost: 0, icon: 'Shield', previewData: '🛡️' },

      // Temas de Visualização
      { id: 'rew-theme-emerald', name: 'Tema Esmeralda da Posse', description: 'Acentua elementos com verde esmeralda suave de prosperidade.', type: 'color_theme', itemKey: 'theme_emerald', requiredLevel: 4, xpCost: 0, icon: 'Palette', previewData: 'emerald' },
      { id: 'rew-theme-midnight', name: 'Tema Safira Noturna', description: 'Tons de azul índigo profundo para sessões sem fadiga visual.', type: 'color_theme', itemKey: 'theme_midnight', requiredLevel: 6, xpCost: 0, icon: 'Palette', previewData: 'midnight' },
    ];

    for (const rew of rewardsCatalog) {
      await db.insert(virtualRewards).values(rew).onConflictDoNothing();
    }

    // 7. Grupos de Estudo Oficiais e Comunitários
    const sampleGroups = [
      {
        id: 'group-transpetro-eletro',
        name: 'Transpetro 2026 — Foco Eletrotécnica',
        description: 'Grupo dedicado à resolução diária de questões de circuitos, máquinas elétricas e português Cesgranrio.',
        inviteCode: 'TRANSPETRO26',
        creatorUserId: 'user-admin-demo',
        avatarEmoji: '⚡',
        focusExam: 'Transpetro - Técnico em Eletrotécnica',
        isPrivate: true,
        maxMembers: 30,
        collectiveXp: 3840,
        collectiveGoalTarget: 5000,
        collectiveGoalProgress: 3840,
        collectiveGoalTitle: 'Meta do Grupo: Resolver 1.000 questões esta semana',
        active: true,
      },
      {
        id: 'group-portugues-cesgranrio',
        name: 'Gabaritando Português Cesgranrio',
        description: 'Estudo focado em interpretação de texto, crase, concordância e regência da banca Cesgranrio.',
        inviteCode: 'PORTCESG',
        creatorUserId: 'user-admin-demo',
        avatarEmoji: '📖',
        focusExam: 'Concursos Nacionais e Federais',
        isPrivate: true,
        maxMembers: 25,
        collectiveXp: 2150,
        collectiveGoalTarget: 3000,
        collectiveGoalProgress: 2150,
        collectiveGoalTitle: 'Revisar 20 textos comentados de provas anteriores',
        active: true,
      },
      {
        id: 'group-madrugadores-concurso',
        name: 'Clube dos Madrugadores da Posse',
        description: 'Constância matinal das 5h às 7h para quem trabalha e estuda com disciplina rígida.',
        inviteCode: 'MADRUGADA5',
        creatorUserId: 'user-admin-demo',
        avatarEmoji: '🌅',
        focusExam: 'Geral - Carreiras Técnicas',
        isPrivate: true,
        maxMembers: 20,
        collectiveXp: 1890,
        collectiveGoalTarget: 2500,
        collectiveGoalProgress: 1890,
        collectiveGoalTitle: 'Completar 10 sessões pomodoro matinais',
        active: true,
      },
    ];

    for (const g of sampleGroups) {
      await db.insert(studyGroups).values(g).onConflictDoNothing();
    }

    // 8. Inicializar Experiência do Estudante Principal Bruno (user-bruno-student / uid-bruno-student)
    const targetUserId = 'user-bruno-student';
    const altUserId = 'uid-bruno-student';

    for (const uid of [targetUserId, altUserId]) {
      // Garantir existência do usuário
      const [existingUser] = await db.select().from(users).where(eq(users.id, uid));
      if (!existingUser) continue;

      // Inserir ou atualizar userExperience
      await db.insert(userExperience).values({
        userId: uid,
        totalXp: 840, // Nível 4 (Persistente)
        currentLevel: 4,
        weeklyXp: 220,
        monthlyXp: 640,
        currentStreak: 4,
        longestStreak: 12,
        optInRanking: true,
        publicNickname: 'Bruno Concurseiro',
        hideRealName: false,
        equippedTitle: 'Futuro Concursado',
        equippedFrame: 'frame_bronze',
        equippedBadge: 'badge_eletro',
        equippedTheme: 'default',
        notificationsEnabled: true,
      }).onConflictDoNothing();

      // Inserir Streak
      await db.insert(studyStreaks).values({
        id: `streak-${uid}`,
        userId: uid,
        currentStreak: 4,
        longestStreak: 12,
        lastActiveDate: new Date().toISOString().split('T')[0],
        freezeAvailable: true,
        freezeUsedCount: 0,
        historyJson: JSON.stringify([
          new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
        ]),
      }).onConflictDoNothing();

      // Inserir algumas conquistas já desbloqueadas para demonstrar o visual
      const unlockedAchs = [
        { id: `uach-${uid}-first-day`, userId: uid, achievementId: 'ach-first-day', progress: 1, isShared: false },
        { id: `uach-${uid}-streak-3`, userId: uid, achievementId: 'ach-streak-3', progress: 3, isShared: true },
        { id: `uach-${uid}-q-first`, userId: uid, achievementId: 'ach-q-first', progress: 1, isShared: false },
        { id: `uach-${uid}-q-100`, userId: uid, achievementId: 'ach-q-100', progress: 100, isShared: false },
        { id: `uach-${uid}-sim-70`, userId: uid, achievementId: 'ach-sim-70', progress: 74, isShared: false },
        { id: `uach-${uid}-goal-first`, userId: uid, achievementId: 'ach-goal-first', progress: 1, isShared: false },
      ];
      for (const ua of unlockedAchs) {
        await db.insert(userAchievements).values(ua).onConflictDoNothing();
      }

      // Adicionar Bruno ao grupo da Transpetro
      await db.insert(studyGroupMembers).values({
        id: `sgm-${uid}-transpetro`,
        groupId: 'group-transpetro-eletro',
        userId: uid,
        role: 'member',
        contributedXp: 480,
      }).onConflictDoNothing();

      // Desbloquear algumas recompensas virtuais no inventário de Bruno
      await db.insert(userRewards).values([
        { id: `urew-${uid}-frame-bronze`, userId: uid, rewardId: 'rew-frame-bronze', isEquipped: true },
        { id: `urew-${uid}-title-futuro`, userId: uid, rewardId: 'rew-title-futuro-aprovado', isEquipped: true },
        { id: `urew-${uid}-badge-eletro`, userId: uid, rewardId: 'rew-badge-raio', isEquipped: true },
      ]).onConflictDoNothing();

      // Inserir transações de exemplo de XP auditáveis
      const sampleTxs = [
        { id: `tx-${uid}-01`, userId: uid, amount: 20, activityType: 'study_session', entityType: 'study_session', entityId: 'sess-01', idempotencyKey: `idemp-sess-01-${uid}`, description: 'Concluiu sessão de 25 min em Eletrotécnica' },
        { id: `tx-${uid}-02`, userId: uid, amount: 15, activityType: 'question_correct', entityType: 'question', entityId: 'q-batch-01', idempotencyKey: `idemp-q-01-${uid}`, description: 'Acertou 3 questões consecutivas em Circuitos' },
        { id: `tx-${uid}-03`, userId: uid, amount: 40, activityType: 'simulation_completed', entityType: 'simulation', entityId: 'sim-transpetro-01', idempotencyKey: `idemp-sim-01-${uid}`, description: 'Concluiu simulado preparatório Transpetro' },
        { id: `tx-${uid}-04`, userId: uid, amount: 30, activityType: 'daily_goal', entityType: 'study_goal', entityId: 'goal-01', idempotencyKey: `idemp-goal-01-${uid}`, description: 'Bateu a meta de estudos do cronograma diário' },
      ];
      for (const tx of sampleTxs) {
        await db.insert(xpTransactions).values(tx).onConflictDoNothing();
      }
    }

    // 9. Popular Entradas do Quadro de Líderes (Leaderboard Entries) com dados simulados realistas de estudantes da comunidade
    const communityRankings = [
      { userId: 'user-aluno-marina', userName: 'Marina Silveira', publicNickname: 'Marina Transpetro Top1', score: 1420, levelName: 'Estrategista', rank: 1, isAnonymous: false },
      { userId: 'user-aluno-carlos', userName: 'Carlos Eduardo Mendes', publicNickname: 'Carlos Eng', score: 1280, levelName: 'Estrategista', rank: 2, isAnonymous: false },
      { userId: 'user-aluno-patricia', userName: 'Patrícia Alencar', publicNickname: 'Paty Concurseira', score: 980, levelName: 'Determinado', rank: 3, isAnonymous: false },
      { userId: targetUserId, userName: 'Bruno Henrique', publicNickname: 'Bruno Concurseiro', score: 840, levelName: 'Persistente', rank: 4, isAnonymous: false },
      { userId: 'user-aluno-rodrigo', userName: 'Rodrigo Vasconcelos', publicNickname: 'Rodrigo V.', score: 720, levelName: 'Persistente', rank: 5, isAnonymous: false },
      { userId: 'user-aluno-anomimo-1', userName: 'Lucas Ferreira', publicNickname: 'Concurseiro Anônimo #42', score: 650, levelName: 'Persistente', rank: 6, isAnonymous: true },
      { userId: 'user-aluno-fernanda', userName: 'Fernanda Lima', publicNickname: 'Nanda Estudos', score: 580, levelName: 'Dedicado', rank: 7, isAnonymous: false },
      { userId: 'user-aluno-gabriel', userName: 'Gabriel Sampaio', publicNickname: 'Gabriel Técnico', score: 490, levelName: 'Dedicado', rank: 8, isAnonymous: false },
      { userId: 'user-aluno-juliana', userName: 'Juliana Prado', publicNickname: 'Ju_Transpetro', score: 420, levelName: 'Dedicado', rank: 9, isAnonymous: false },
      { userId: 'user-aluno-tiago', userName: 'Tiago Antunes', publicNickname: 'Tiago Eletro', score: 380, levelName: 'Dedicado', rank: 10, isAnonymous: false },
    ];

    // Garantir que os usuários da comunidade existem na tabela users para respeitar chave estrangeira
    for (const entry of communityRankings) {
      await db.insert(users).values({
        id: entry.userId,
        uid: entry.userId,
        name: entry.userName,
        email: `${entry.userId}@exemplo.com`,
        role: 'STUDENT',
        status: 'ACTIVE',
        xp: entry.score,
        streakDays: Math.floor(entry.score / 150),
      }).onConflictDoNothing();
    }

    for (const lb of defaultLeaderboards) {
      for (const entry of communityRankings) {
        await db.insert(leaderboardEntries).values({
          id: `lbe-${lb.id}-${entry.userId}`,
          leaderboardId: lb.id,
          userId: entry.userId,
          userName: entry.userName,
          publicNickname: entry.publicNickname,
          avatarUrl: null,
          score: entry.score,
          rank: entry.rank,
          isAnonymous: entry.isAnonymous,
          levelName: entry.levelName,
          periodKey: 'current',
        }).onConflictDoNothing();
      }
    }

    console.log('Gamification Module seeded successfully.');
  } catch (err) {
    console.error('Error seeding Gamification module:', err);
  }
}
