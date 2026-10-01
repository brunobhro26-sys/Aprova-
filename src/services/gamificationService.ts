import { db } from '../db/index.ts';
import {
  userExperience,
  userLevels,
  xpTransactions,
  achievements,
  userAchievements,
  challenges,
  userChallenges,
  studyStreaks,
  leaderboards,
  leaderboardEntries,
  studyGroups,
  studyGroupMembers,
  virtualRewards,
  userRewards,
  gamificationSettings,
  users,
  notifications
} from '../db/schema.ts';
import { eq, and, sql, desc, sum, gte } from 'drizzle-orm';

export interface AwardXpOptions {
  userId: string;
  activityType:
    | 'study_session'
    | 'question_correct'
    | 'review_completed'
    | 'daily_goal'
    | 'simulation_completed'
    | 'weekly_plan'
    | 'streak_7_days'
    | 'challenge_completed'
    | 'admin_adjustment';
  entityType?: string;
  entityId?: string;
  customAmount?: number;
  description?: string;
  ipAddress?: string;
}

export class GamificationService {
  /**
   * Obtém a configuração de pontuação para o tipo de atividade
   */
  static async getActivityScore(activityType: string, customAmount?: number): Promise<number> {
    if (customAmount && customAmount > 0) return customAmount;

    const keyMap: Record<string, string> = {
      study_session: 'xp_study_session_25min',
      question_correct: 'xp_question_correct',
      review_completed: 'xp_review_completed',
      daily_goal: 'xp_daily_goal',
      simulation_completed: 'xp_simulation_completed',
      weekly_plan: 'xp_weekly_plan_completed',
      streak_7_days: 'xp_streak_7_days',
    };

    const settingKey = keyMap[activityType];
    if (settingKey) {
      const [setting] = await db
        .select()
        .from(gamificationSettings)
        .where(eq(gamificationSettings.key, settingKey));
      if (setting && !isNaN(Number(setting.value))) {
        return Number(setting.value);
      }
    }

    const defaultFallbacks: Record<string, number> = {
      study_session: 20,
      question_correct: 5,
      review_completed: 15,
      daily_goal: 30,
      simulation_completed: 40,
      weekly_plan: 100,
      streak_7_days: 50,
      challenge_completed: 25,
      admin_adjustment: 10,
    };

    return defaultFallbacks[activityType] || 10;
  }

  /**
   * Concede XP com idempotência, limites diários e auditoria
   */
  static async awardXp(options: AwardXpOptions): Promise<{
    awarded: boolean;
    xp: number;
    newTotalXp: number;
    levelUp?: { oldLevel: number; newLevel: number; levelName: string } | null;
    unlockedAchievements: any[];
    reason?: string;
  }> {
    const { userId, activityType, entityType, entityId, customAmount, description, ipAddress } = options;

    const cleanUserId = userId === 'uid-bruno-student' ? 'user-bruno-student' : userId;

    // 1. Idempotência: Verificar se já existe transação para esta entidade/atividade
    const idempotencyKey = entityId
      ? `idemp-${cleanUserId}-${activityType}-${entityId}`
      : `idemp-${cleanUserId}-${activityType}-${Date.now()}`;

    const [existingTx] = await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.idempotencyKey, idempotencyKey));

    if (existingTx) {
      const [userExp] = await db.select().from(userExperience).where(eq(userExperience.userId, cleanUserId));
      return {
        awarded: false,
        xp: 0,
        newTotalXp: userExp?.totalXp || 0,
        unlockedAchievements: [],
        reason: 'Atividade já pontuada anteriormente (idempotência respeitada)',
      };
    }

    // 2. Verificar Limite Diário de XP (anti-abuso e equilíbrio de estudos)
    const [capSetting] = await db
      .select()
      .from(gamificationSettings)
      .where(eq(gamificationSettings.key, 'daily_xp_cap'));
    const dailyCap = capSetting && !isNaN(Number(capSetting.value)) ? Number(capSetting.value) : 300;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayTxs = await db
      .select({ totalToday: sum(xpTransactions.amount) })
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, cleanUserId),
          gte(xpTransactions.createdAt, startOfToday)
        )
      );

    const currentTodayXp = Number(todayTxs[0]?.totalToday || 0);
    const rawXpToAward = await this.getActivityScore(activityType, customAmount);

    let xpToAward = rawXpToAward;
    if (currentTodayXp >= dailyCap && activityType !== 'admin_adjustment') {
      return {
        awarded: false,
        xp: 0,
        newTotalXp: (await this.getUserExperience(cleanUserId)).totalXp,
        unlockedAchievements: [],
        reason: `Limite diário de ${dailyCap} XP atingido para hoje. Continue estudando com tranquilidade!`,
      };
    }

    if (currentTodayXp + xpToAward > dailyCap && activityType !== 'admin_adjustment') {
      xpToAward = Math.max(0, dailyCap - currentTodayXp);
    }

    if (xpToAward <= 0) {
      return {
        awarded: false,
        xp: 0,
        newTotalXp: (await this.getUserExperience(cleanUserId)).totalXp,
        unlockedAchievements: [],
        reason: 'Limite diário alcançado.',
      };
    }

    // 3. Registrar transação de XP
    const txId = `tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const txDesc = description || `Atividade de ${activityType.replace('_', ' ')} concluída`;

    await db.insert(xpTransactions).values({
      id: txId,
      userId: cleanUserId,
      amount: xpToAward,
      activityType,
      entityType: entityType || null,
      entityId: entityId || null,
      idempotencyKey,
      description: txDesc,
      metadataJson: JSON.stringify({ rawAward: rawXpToAward, adjusted: xpToAward }),
      ipAddress: ipAddress || null,
    });

    // 4. Atualizar registro em userExperience
    let userExp = await this.getUserExperience(cleanUserId);
    const oldLevel = userExp.currentLevel;
    const newTotalXp = userExp.totalXp + xpToAward;
    const newWeeklyXp = userExp.weeklyXp + xpToAward;
    const newMonthlyXp = userExp.monthlyXp + xpToAward;

    // Calcular novo nível
    const newLevelInfo = await this.calculateLevel(newTotalXp);
    const newLevel = newLevelInfo.level;

    await db
      .update(userExperience)
      .set({
        totalXp: newTotalXp,
        currentLevel: newLevel,
        weeklyXp: newWeeklyXp,
        monthlyXp: newMonthlyXp,
        updatedAt: new Date(),
      })
      .where(eq(userExperience.userId, cleanUserId));

    // Sincronizar campo xp na tabela users
    await db
      .update(users)
      .set({ xp: newTotalXp })
      .where(eq(users.id, cleanUserId));

    // 5. Se subiu de nível, criar notificação amigável
    let levelUpData = null;
    if (newLevel > oldLevel) {
      levelUpData = { oldLevel, newLevel, levelName: newLevelInfo.name };
      await db.insert(notifications).values({
        id: `notif-lvl-${Date.now()}`,
        userId: cleanUserId,
        title: `Parabéns! Você alcançou o Nível ${newLevel} (${newLevelInfo.name})!`,
        message: `Sua dedicação constante nos estudos rendeu uma nova graduação: ${newLevelInfo.description || ''}`,
        type: 'achievement',
        read: false,
      });
    }

    // 6. Contribuir com XP para grupos de estudo dos quais o usuário é membro
    try {
      const userGroupMemberships = await db
        .select()
        .from(studyGroupMembers)
        .where(eq(studyGroupMembers.userId, cleanUserId));

      for (const gm of userGroupMemberships) {
        await db
          .update(studyGroupMembers)
          .set({ contributedXp: gm.contributedXp + xpToAward })
          .where(eq(studyGroupMembers.id, gm.id));

        await db
          .update(studyGroups)
          .set({
            collectiveXp: sql`${studyGroups.collectiveXp} + ${xpToAward}`,
            collectiveGoalProgress: sql`LEAST(${studyGroups.collectiveGoalTarget}, ${studyGroups.collectiveGoalProgress} + ${xpToAward})`,
            updatedAt: new Date(),
          })
          .where(eq(studyGroups.id, gm.groupId));
      }
    } catch (e) {
      console.error('Non-fatal error updating group XP:', e);
    }

    // 7. Atualizar Desafios aplicáveis (semanais e diários)
    await this.updateChallengeProgress(cleanUserId, activityType);

    // 8. Verificar desbloqueio de conquistas
    const unlockedAchievements = await this.checkAchievements(cleanUserId);

    return {
      awarded: true,
      xp: xpToAward,
      newTotalXp,
      levelUp: levelUpData,
      unlockedAchievements,
    };
  }

  /**
   * Obtém ou inicializa o perfil de experiência do usuário
   */
  static async getUserExperience(userId: string) {
    const cleanUserId = userId === 'uid-bruno-student' ? 'user-bruno-student' : userId;

    const [existing] = await db
      .select()
      .from(userExperience)
      .where(eq(userExperience.userId, cleanUserId));

    if (existing) return existing;

    // Buscar xp da tabela users se existir
    const [u] = await db.select().from(users).where(eq(users.id, cleanUserId));
    const initialXp = u?.xp || 0;
    const initialLevelInfo = await this.calculateLevel(initialXp);

    const [created] = await db
      .insert(userExperience)
      .values({
        userId: cleanUserId,
        totalXp: initialXp,
        currentLevel: initialLevelInfo.level,
        weeklyXp: Math.floor(initialXp * 0.3),
        monthlyXp: Math.floor(initialXp * 0.7),
        currentStreak: u?.streakDays || 1,
        longestStreak: Math.max(u?.streakDays || 1, 7),
        optInRanking: true,
        publicNickname: u?.name ? `${u.name.split(' ')[0]} Concurseiro` : 'Estudante APROVA+',
        hideRealName: false,
        equippedTheme: 'default',
      })
      .returning();

    return created;
  }

  /**
   * Calcula o nível com base no XP acumulado
   */
  static async calculateLevel(xp: number) {
    const allLevels = await db
      .select()
      .from(userLevels)
      .where(eq(userLevels.active, true))
      .orderBy(userLevels.level);

    if (allLevels.length === 0) {
      return { level: 1, name: 'Iniciante', requiredXp: 0, nextRequiredXp: 100, progressPercentage: 50 };
    }

    let current = allLevels[0];
    let next = allLevels[1] || allLevels[0];

    for (let i = 0; i < allLevels.length; i++) {
      if (xp >= allLevels[i].requiredXp) {
        current = allLevels[i];
        next = allLevels[i + 1] || null;
      } else {
        break;
      }
    }

    const minXp = current.requiredXp;
    const maxXp = next ? next.requiredXp : current.requiredXp + 1500;
    const progressPercentage = maxXp > minXp
      ? Math.min(100, Math.max(0, Math.round(((xp - minXp) / (maxXp - minXp)) * 100)))
      : 100;

    return {
      level: current.level,
      name: current.name,
      description: current.description,
      badgeIcon: current.badgeIcon,
      colorTheme: current.colorTheme,
      currentMin: minXp,
      nextMax: maxXp,
      xpNeeded: Math.max(0, maxXp - xp),
      progressPercentage,
    };
  }

  /**
   * Atualiza a sequência (streak) de estudos respeitando fuso horário e evitando duplicidades
   */
  static async recordDailyStudyActivity(userId: string, dateStr?: string) {
    const cleanUserId = userId === 'uid-bruno-student' ? 'user-bruno-student' : userId;
    const today = dateStr || new Date().toISOString().split('T')[0];

    let [streakRecord] = await db
      .select()
      .from(studyStreaks)
      .where(eq(studyStreaks.userId, cleanUserId));

    if (!streakRecord) {
      const [created] = await db
        .insert(studyStreaks)
        .values({
          id: `streak-${cleanUserId}`,
          userId: cleanUserId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          historyJson: JSON.stringify([today]),
        })
        .returning();
      streakRecord = created;
    } else {
      if (streakRecord.lastActiveDate === today) {
        // Já contabilizou atividade para hoje
        return streakRecord;
      }

      const lastDate = streakRecord.lastActiveDate ? new Date(streakRecord.lastActiveDate) : null;
      const todayDate = new Date(today);

      let newStreak = streakRecord.currentStreak;
      let history: string[] = [];
      try {
        history = JSON.parse(streakRecord.historyJson || '[]');
      } catch (e) {
        history = [];
      }

      if (lastDate) {
        const diffMs = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Dia seguinte consecutivo: incrementa
          newStreak += 1;
        } else if (diffDays > 1) {
          // Mais de 1 dia de intervalo: verificar se o congelador de streak salvou
          if (diffDays === 2 && streakRecord.freezeAvailable) {
            // Usa o freeze protetor
            newStreak += 1;
            await db
              .update(studyStreaks)
              .set({
                freezeAvailable: false,
                freezeUsedCount: sql`${studyStreaks.freezeUsedCount} + 1`,
              })
              .where(eq(studyStreaks.userId, cleanUserId));
          } else {
            newStreak = 1; // Reinicia suavemente sem punição agressiva
          }
        }
      } else {
        newStreak = 1;
      }

      if (!history.includes(today)) {
        history.push(today);
      }

      const newLongest = Math.max(streakRecord.longestStreak, newStreak);

      const [updated] = await db
        .update(studyStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          historyJson: JSON.stringify(history.slice(-60)), // mantém últimos 60 dias
          updatedAt: new Date(),
        })
        .where(eq(studyStreaks.userId, cleanUserId))
        .returning();

      streakRecord = updated;

      // Sincronizar em userExperience e users
      await db
        .update(userExperience)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          updatedAt: new Date(),
        })
        .where(eq(userExperience.userId, cleanUserId));

      await db
        .update(users)
        .set({ streakDays: newStreak })
        .where(eq(users.id, cleanUserId));

      // Se completou 7 dias consecutivos, concede XP bônus de constância
      if (newStreak % 7 === 0) {
        await this.awardXp({
          userId: cleanUserId,
          activityType: 'streak_7_days',
          entityType: 'streak',
          entityId: `streak-${newStreak}-${today}`,
          description: `Marco de Constância: ${newStreak} dias consecutivos estudando!`,
        });
      }
    }

    return streakRecord;
  }

  /**
   * Atualiza progresso de desafios diários e semanais
   */
  static async updateChallengeProgress(userId: string, activityType: string, count: number = 1) {
    const cleanUserId = userId === 'uid-bruno-student' ? 'user-bruno-student' : userId;
    const now = new Date();
    const dailyKey = now.toISOString().split('T')[0];
    const currentWeekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
    const weeklyKey = `${now.getFullYear()}-W${currentWeekNumber}`;

    const activeChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.active, true));

    for (const ch of activeChallenges) {
      let matches = false;
      if (activityType === 'question_correct' && ch.criteriaType === 'solve_questions') matches = true;
      if (activityType === 'study_session' && (ch.criteriaType === 'complete_session' || ch.criteriaType === 'study_time')) matches = true;
      if (activityType === 'review_completed' && ch.criteriaType === 'review_wrong') matches = true;
      if (activityType === 'simulation_completed' && ch.criteriaType === 'complete_simulation') matches = true;
      if (activityType === 'streak_7_days' && ch.criteriaType === 'study_days_count') matches = true;

      if (!matches) continue;

      const periodKey = ch.type === 'daily' ? dailyKey : weeklyKey;

      const [userChal] = await db
        .select()
        .from(userChallenges)
        .where(
          and(
            eq(userChallenges.userId, cleanUserId),
            eq(userChallenges.challengeId, ch.id),
            eq(userChallenges.periodKey, periodKey)
          )
        );

      if (!userChal) {
        const isComplete = count >= ch.targetCount;
        await db.insert(userChallenges).values({
          id: `uchal-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          userId: cleanUserId,
          challengeId: ch.id,
          periodKey,
          currentProgress: count,
          targetProgress: ch.targetCount,
          completed: isComplete,
          completedAt: isComplete ? new Date() : null,
          rewardClaimed: false,
        });
      } else if (!userChal.completed) {
        const nextProg = userChal.currentProgress + count;
        const isComplete = nextProg >= userChal.targetProgress;
        await db
          .update(userChallenges)
          .set({
            currentProgress: nextProg,
            completed: isComplete,
            completedAt: isComplete ? new Date() : null,
          })
          .where(eq(userChallenges.id, userChal.id));

        if (isComplete) {
          await db.insert(notifications).values({
            id: `notif-chal-${Date.now()}`,
            userId: cleanUserId,
            title: `Desafio Concluído: ${ch.title}`,
            message: `Você cumpriu o desafio e liberou ${ch.xpReward} XP de recompensa!`,
            type: 'achievement',
            read: false,
          });
        }
      }
    }
  }

  /**
   * Verifica critérios e desbloqueia medalhas de conquistas
   */
  static async checkAchievements(userId: string): Promise<any[]> {
    const cleanUserId = userId === 'uid-bruno-student' ? 'user-bruno-student' : userId;

    const allAchievements = await db.select().from(achievements).where(eq(achievements.active, true));
    const userAchs = await db.select().from(userAchievements).where(eq(userAchievements.userId, cleanUserId));
    const unlockedIds = new Set(userAchs.map((u) => u.achievementId));

    const newlyUnlocked: any[] = [];

    // Obter dados do usuário para verificar critérios
    const [uExp] = await db.select().from(userExperience).where(eq(userExperience.userId, cleanUserId));
    const [streakRec] = await db.select().from(studyStreaks).where(eq(studyStreaks.userId, cleanUserId));

    const currentStreak = streakRec?.currentStreak || uExp?.currentStreak || 0;

    // Contar tentativas de questões
    const attempts = await db.select().from(sql`question_attempts`).where(sql`user_id = ${cleanUserId}`);
    const questionsSolved = attempts.length;
    const questionsCorrect = attempts.filter((a: any) => a.is_correct || a.isCorrect).length;

    for (const ach of allAchievements) {
      if (unlockedIds.has(ach.id)) continue;

      let meets = false;
      let currentVal = 0;

      switch (ach.criteriaType) {
        case 'streak_days':
          currentVal = currentStreak;
          meets = currentStreak >= ach.criteriaValue;
          break;
        case 'questions_solved':
          currentVal = questionsSolved;
          meets = questionsSolved >= ach.criteriaValue;
          break;
        case 'questions_correct':
          currentVal = questionsCorrect;
          meets = questionsCorrect >= ach.criteriaValue;
          break;
        case 'daily_goals':
          currentVal = 1;
          meets = true; // se chamado após cumprir meta
          break;
        case 'sessions_completed':
          currentVal = 5;
          meets = false;
          break;
      }

      if (meets) {
        const uachId = `uach-${Date.now()}-${ach.id}`;
        const [unlocked] = await db
          .insert(userAchievements)
          .values({
            id: uachId,
            userId: cleanUserId,
            achievementId: ach.id,
            progress: ach.criteriaValue,
            isShared: false,
          })
          .returning();

        newlyUnlocked.push({ ...ach, ...unlocked });

        // Criar notificação para o usuário
        await db.insert(notifications).values({
          id: `notif-ach-${Date.now()}-${ach.id}`,
          userId: cleanUserId,
          title: `Nova Conquista Desbloqueada: ${ach.name}!`,
          message: `${ach.description} (+${ach.xpReward} XP concedidos)`,
          type: 'achievement',
          read: false,
        });
      }
    }

    return newlyUnlocked;
  }
}
