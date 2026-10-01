import { Router } from 'express';
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
  auditLogs,
  notifications
} from '../db/schema.ts';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { GamificationService } from '../services/gamificationService.ts';

export const gamificationRouter = Router();

// -------------------------------------------------------------
// 1. STATUS GERAL DO USUÁRIO (XP, NÍVEL, STREAK, ITENS EQUIPADOS)
// -------------------------------------------------------------
gamificationRouter.get('/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const userExp = await GamificationService.getUserExperience(userId);
    const levelInfo = await GamificationService.calculateLevel(userExp.totalXp);
    const [streakRec] = await db.select().from(studyStreaks).where(eq(studyStreaks.userId, userId));

    // Desbloqueadas vs Bloqueadas
    const allAchs = await db.select().from(achievements).where(eq(achievements.active, true));
    const userAchs = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));

    // Itens equipados
    const equipped = {
      title: userExp.equippedTitle,
      frame: userExp.equippedFrame,
      badge: userExp.equippedBadge,
      theme: userExp.equippedTheme,
    };

    res.json({
      userId,
      totalXp: userExp.totalXp,
      weeklyXp: userExp.weeklyXp,
      monthlyXp: userExp.monthlyXp,
      level: levelInfo,
      streak: {
        current: streakRec?.currentStreak || userExp.currentStreak || 0,
        longest: streakRec?.longestStreak || userExp.longestStreak || 0,
        lastActiveDate: streakRec?.lastActiveDate || null,
        freezeAvailable: streakRec?.freezeAvailable ?? true,
      },
      achievementsSummary: {
        total: allAchs.length,
        unlocked: userAchs.length,
      },
      privacy: {
        optInRanking: userExp.optInRanking,
        publicNickname: userExp.publicNickname,
        hideRealName: userExp.hideRealName,
      },
      equipped,
    });
  } catch (error) {
    console.error('Error fetching gamification status:', error);
    res.status(500).json({ error: 'Failed to fetch gamification status' });
  }
});

// -------------------------------------------------------------
// 2. CONQUISTAS E MEDALHAS
// -------------------------------------------------------------
gamificationRouter.get('/achievements', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const allAchs = await db
      .select()
      .from(achievements)
      .where(eq(achievements.active, true))
      .orderBy(achievements.category, achievements.orderIndex);

    const userAchs = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const userAchsMap = new Map<string, typeof userAchs[0]>();
    for (const ua of userAchs) {
      userAchsMap.set(ua.achievementId, ua);
    }

    const payload = allAchs.map((ach) => {
      const userRecord = userAchsMap.get(ach.id);
      const isUnlocked = !!userRecord;

      return {
        ...ach,
        unlocked: isUnlocked,
        unlockedAt: userRecord?.unlockedAt || null,
        progress: userRecord?.progress || (isUnlocked ? ach.criteriaValue : 0),
        isShared: userRecord?.isShared || false,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

gamificationRouter.post('/achievements/:id/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { id } = req.params;

    const [userAch] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, id)));

    if (!userAch) {
      return res.status(404).json({ error: 'Conquista ainda não desbloqueada.' });
    }

    const newShared = !userAch.isShared;
    const [updated] = await db
      .update(userAchievements)
      .set({ isShared: newShared, sharedAt: newShared ? new Date() : null })
      .where(eq(userAchievements.id, userAch.id))
      .returning();

    res.json({ success: true, isShared: updated.isShared });
  } catch (error) {
    console.error('Error sharing achievement:', error);
    res.status(500).json({ error: 'Failed to share achievement' });
  }
});

// -------------------------------------------------------------
// 3. DESAFIOS DIÁRIOS E SEMANAIS
// -------------------------------------------------------------
gamificationRouter.get('/challenges', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const now = new Date();
    const dailyKey = now.toISOString().split('T')[0];
    const currentWeekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
    const weeklyKey = `${now.getFullYear()}-W${currentWeekNumber}`;

    const allChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.active, true));

    const userChals = await db
      .select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId));

    const userChalMap = new Map<string, typeof userChals[0]>();
    for (const uc of userChals) {
      userChalMap.set(`${uc.challengeId}:${uc.periodKey}`, uc);
    }

    const payload = allChallenges.map((ch) => {
      const periodKey = ch.type === 'daily' ? dailyKey : weeklyKey;
      const uc = userChalMap.get(`${ch.id}:${periodKey}`);

      const currentProgress = uc?.currentProgress || 0;
      const completed = uc?.completed || currentProgress >= ch.targetCount;
      const rewardClaimed = uc?.rewardClaimed || false;

      // Calcular prazo amigável
      let expiresText = 'Termina hoje às 23:59';
      if (ch.type === 'weekly') {
        const daysToSunday = (7 - now.getDay()) % 7;
        expiresText = `Termina em ${daysToSunday} ${daysToSunday === 1 ? 'dia' : 'dias'}`;
      }

      return {
        ...ch,
        periodKey,
        currentProgress,
        completed,
        rewardClaimed,
        claimedAt: uc?.claimedAt || null,
        expiresText,
        progressPercent: Math.min(100, Math.round((currentProgress / ch.targetCount) * 100)),
      };
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

gamificationRouter.post('/challenges/:id/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { id } = req.params;
    const { periodKey } = req.body;

    const [ch] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!ch) return res.status(404).json({ error: 'Desafio não encontrado' });

    const [userChal] = await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, id),
          eq(userChallenges.periodKey, periodKey || 'current')
        )
      );

    if (!userChal || !userChal.completed) {
      return res.status(400).json({ error: 'Desafio ainda não foi concluído.' });
    }

    if (userChal.rewardClaimed) {
      return res.status(400).json({ error: 'Recompensa deste desafio já foi resgatada.' });
    }

    // Conceder XP do desafio via serviço centralizado com idempotência
    const awardResult = await GamificationService.awardXp({
      userId,
      activityType: 'challenge_completed',
      entityType: 'challenge',
      entityId: `${id}-${userChal.periodKey}`,
      customAmount: ch.xpReward,
      description: `Recompensa por concluir desafio: ${ch.title}`,
    });

    // Marcar como resgatado
    await db
      .update(userChallenges)
      .set({ rewardClaimed: true, claimedAt: new Date() })
      .where(eq(userChallenges.id, userChal.id));

    res.json({
      success: true,
      xpAwarded: awardResult.xp,
      newTotalXp: awardResult.newTotalXp,
      levelUp: awardResult.levelUp,
    });
  } catch (error) {
    console.error('Error claiming challenge reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// -------------------------------------------------------------
// 4. SEQUÊNCIA DE ESTUDOS (STREAK & CALENDÁRIO)
// -------------------------------------------------------------
gamificationRouter.get('/streak', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    let [streakRec] = await db.select().from(studyStreaks).where(eq(studyStreaks.userId, userId));
    if (!streakRec) {
      streakRec = await GamificationService.recordDailyStudyActivity(userId);
    }

    let history: string[] = [];
    try {
      history = JSON.parse(streakRec.historyJson || '[]');
    } catch (e) {
      history = [];
    }

    res.json({
      currentStreak: streakRec.currentStreak,
      longestStreak: streakRec.longestStreak,
      lastActiveDate: streakRec.lastActiveDate,
      freezeAvailable: streakRec.freezeAvailable,
      freezeUsedCount: streakRec.freezeUsedCount,
      history,
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

gamificationRouter.post('/streak/freeze', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const [streakRec] = await db.select().from(studyStreaks).where(eq(studyStreaks.userId, userId));
    if (!streakRec || !streakRec.freezeAvailable) {
      return res.status(400).json({ error: 'Escudo de proteção de sequência indisponível ou já utilizado.' });
    }

    await db
      .update(studyStreaks)
      .set({
        freezeAvailable: false,
        freezeUsedCount: sql`${studyStreaks.freezeUsedCount} + 1`,
      })
      .where(eq(studyStreaks.userId, userId));

    res.json({ success: true, message: 'Proteção de sequência ativada com sucesso!' });
  } catch (error) {
    console.error('Error using freeze:', error);
    res.status(500).json({ error: 'Failed to use streak freeze' });
  }
});

// -------------------------------------------------------------
// 5. RANKINGS E QUADRO DE LÍDERES
// -------------------------------------------------------------
gamificationRouter.get('/leaderboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const period = String(req.query.period || 'all_time'); // weekly, monthly, all_time, questions, goals

    // Buscar leaderboard correspondente
    const [lb] = await db
      .select()
      .from(leaderboards)
      .where(eq(leaderboards.period, period.includes('time') ? 'all_time' : period));

    const lbId = lb ? lb.id : 'lb-alltime';

    const entries = await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.leaderboardId, lbId))
      .orderBy(leaderboardEntries.rank);

    // Identificar usuário corrente e aplicar anonimização conforme privacidade
    const formatted = entries.map((e) => {
      const isCurrent = e.userId === userId || e.userId === 'user-bruno-student';
      let displayName = e.userName;

      if (e.isAnonymous) {
        displayName = e.publicNickname || 'Concurseiro Anônimo';
      } else if (e.publicNickname) {
        displayName = e.publicNickname;
      }

      return {
        id: e.id,
        userId: isCurrent ? userId : 'hidden-id',
        isCurrentUser: isCurrent,
        rank: e.rank,
        displayName: isCurrent && e.isAnonymous ? `${displayName} (Você)` : displayName,
        score: e.score,
        levelName: e.levelName || 'Dedicado',
        isAnonymous: e.isAnonymous,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

gamificationRouter.post('/privacy', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { optInRanking, publicNickname, hideRealName } = req.body;

    const [updated] = await db
      .update(userExperience)
      .set({
        optInRanking: optInRanking !== undefined ? optInRanking : true,
        publicNickname: publicNickname !== undefined ? publicNickname : null,
        hideRealName: hideRealName !== undefined ? hideRealName : false,
        updatedAt: new Date(),
      })
      .where(eq(userExperience.userId, userId))
      .returning();

    // Atualizar entradas de leaderboard existentes do usuário
    await db
      .update(leaderboardEntries)
      .set({
        isAnonymous: updated.hideRealName || !updated.optInRanking,
        publicNickname: updated.publicNickname,
      })
      .where(eq(leaderboardEntries.userId, userId));

    res.json({ success: true, privacy: updated });
  } catch (error) {
    console.error('Error updating privacy:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// -------------------------------------------------------------
// 6. GRUPOS DE ESTUDO
// -------------------------------------------------------------
gamificationRouter.get('/groups', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    // Buscar todos os grupos ativos
    const allGroups = await db.select().from(studyGroups).where(eq(studyGroups.active, true));

    // Membresias do usuário
    const userMemberships = await db
      .select()
      .from(studyGroupMembers)
      .where(eq(studyGroupMembers.userId, userId));

    const membershipMap = new Map<string, typeof userMemberships[0]>();
    for (const m of userMemberships) {
      membershipMap.set(m.groupId, m);
    }

    const payload = await Promise.all(
      allGroups.map(async (g) => {
        const mem = membershipMap.get(g.id);
        const membersList = await db
          .select({
            id: studyGroupMembers.id,
            userId: studyGroupMembers.userId,
            role: studyGroupMembers.role,
            contributedXp: studyGroupMembers.contributedXp,
            name: users.name,
          })
          .from(studyGroupMembers)
          .leftJoin(users, eq(studyGroupMembers.userId, users.id))
          .where(eq(studyGroupMembers.groupId, g.id));

        return {
          ...g,
          isMember: !!mem,
          userRole: mem?.role || null,
          contributedXp: mem?.contributedXp || 0,
          memberCount: membersList.length,
          members: membersList.map((m) => ({
            userId: m.userId,
            name: m.userId === userId ? 'Você' : (m.name || 'Estudante'),
            role: m.role,
            contributedXp: m.contributedXp,
          })),
        };
      })
    );

    res.json(payload);
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ error: 'Failed to fetch study groups' });
  }
});

gamificationRouter.post('/groups', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { name, description, focusExam, avatarEmoji, isPrivate, maxMembers, collectiveGoalTitle, collectiveGoalTarget } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome do grupo é obrigatório' });
    }

    const inviteCode = `GRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const groupId = `group-${Date.now()}`;

    const [createdGroup] = await db
      .insert(studyGroups)
      .values({
        id: groupId,
        name: name.trim(),
        description: description || null,
        inviteCode,
        creatorUserId: userId,
        avatarEmoji: avatarEmoji || '📚',
        focusExam: focusExam || null,
        isPrivate: isPrivate !== false,
        maxMembers: Number(maxMembers || 20),
        collectiveXp: 0,
        collectiveGoalTarget: Number(collectiveGoalTarget || 1000),
        collectiveGoalProgress: 0,
        collectiveGoalTitle: collectiveGoalTitle || 'Resolver 200 questões em conjunto',
        active: true,
      })
      .returning();

    // Adiciona o criador como owner
    await db.insert(studyGroupMembers).values({
      id: `sgm-${Date.now()}-${userId}`,
      groupId,
      userId,
      role: 'owner',
      contributedXp: 0,
    });

    res.status(201).json(createdGroup);
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ error: 'Failed to create study group' });
  }
});

gamificationRouter.post('/groups/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { inviteCode } = req.body;

    if (!inviteCode) return res.status(400).json({ error: 'Código de convite obrigatório' });

    const [group] = await db
      .select()
      .from(studyGroups)
      .where(sql`UPPER(${studyGroups.inviteCode}) = ${inviteCode.trim().toUpperCase()}`);

    if (!group) return res.status(404).json({ error: 'Grupo não encontrado com este código de convite.' });

    // Verificar se já é membro
    const [existing] = await db
      .select()
      .from(studyGroupMembers)
      .where(and(eq(studyGroupMembers.groupId, group.id), eq(studyGroupMembers.userId, userId)));

    if (existing) {
      return res.status(400).json({ error: 'Você já é membro deste grupo de estudos.' });
    }

    // Verificar limite de membros
    const currentMembers = await db
      .select()
      .from(studyGroupMembers)
      .where(eq(studyGroupMembers.groupId, group.id));

    if (currentMembers.length >= group.maxMembers) {
      return res.status(400).json({ error: 'Este grupo atingiu a capacidade máxima de integrantes.' });
    }

    await db.insert(studyGroupMembers).values({
      id: `sgm-${Date.now()}-${userId}`,
      groupId: group.id,
      userId,
      role: 'member',
      contributedXp: 0,
    });

    res.json({ success: true, message: `Você entrou no grupo "${group.name}"!`, group });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

gamificationRouter.post('/groups/:id/leave', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { id } = req.params;

    await db
      .delete(studyGroupMembers)
      .where(and(eq(studyGroupMembers.groupId, id), eq(studyGroupMembers.userId, userId)));

    res.json({ success: true, message: 'Você saiu do grupo.' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// -------------------------------------------------------------
// 7. RECOMPENSAS VIRTUAIS & CUSTOMIZAÇÃO DE PERFIL
// -------------------------------------------------------------
gamificationRouter.get('/rewards', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;

    const userExp = await GamificationService.getUserExperience(userId);
    const catalog = await db.select().from(virtualRewards).where(eq(virtualRewards.active, true));
    const userOwned = await db.select().from(userRewards).where(eq(userRewards.userId, userId));

    const ownedMap = new Map<string, typeof userOwned[0]>();
    for (const o of userOwned) {
      ownedMap.set(o.rewardId, o);
    }

    const payload = catalog.map((r) => {
      const ownedRecord = ownedMap.get(r.id);
      const isLevelEligible = userExp.currentLevel >= r.requiredLevel;
      const isUnlocked = !!ownedRecord || isLevelEligible;

      return {
        ...r,
        isUnlocked,
        isEquipped: ownedRecord?.isEquipped || false,
        canEquip: isUnlocked,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

gamificationRouter.post('/rewards/:id/equip', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.user?.uid || 'user-bruno-student';
    const userId = rawUserId === 'uid-bruno-student' ? 'user-bruno-student' : rawUserId;
    const { id } = req.params;

    const [reward] = await db.select().from(virtualRewards).where(eq(virtualRewards.id, id));
    if (!reward) return res.status(404).json({ error: 'Recompensa não encontrada' });

    // Garantir que usuário possui o item no inventário
    const [existingOwned] = await db
      .select()
      .from(userRewards)
      .where(and(eq(userRewards.userId, userId), eq(userRewards.rewardId, id)));

    if (!existingOwned) {
      await db.insert(userRewards).values({
        id: `urew-${Date.now()}-${reward.itemKey}`,
        userId,
        rewardId: reward.id,
        isEquipped: true,
      });
    }

    // Desequipar itens do mesmo tipo
    const sameTypeRewards = await db
      .select()
      .from(virtualRewards)
      .where(eq(virtualRewards.type, reward.type));

    const sameTypeIds = sameTypeRewards.map((r) => r.id);

    for (const rid of sameTypeIds) {
      await db
        .update(userRewards)
        .set({ isEquipped: rid === reward.id })
        .where(and(eq(userRewards.userId, userId), eq(userRewards.rewardId, rid)));
    }

    // Atualizar userExperience com o item equipado
    const updateField: any = {};
    if (reward.type === 'profile_title') updateField.equippedTitle = reward.name.replace('Título: ', '');
    if (reward.type === 'avatar_frame') updateField.equippedFrame = reward.itemKey;
    if (reward.type === 'badge') updateField.equippedBadge = reward.itemKey;
    if (reward.type === 'color_theme') updateField.equippedTheme = reward.itemKey;

    await db
      .update(userExperience)
      .set({ ...updateField, updatedAt: new Date() })
      .where(eq(userExperience.userId, userId));

    res.json({ success: true, message: `Item "${reward.name}" equipado com sucesso!` });
  } catch (error) {
    console.error('Error equipping reward:', error);
    res.status(500).json({ error: 'Failed to equip reward' });
  }
});

// -------------------------------------------------------------
// 8. PAINEL ADMINISTRATIVO DA GAMIFICAÇÃO
// -------------------------------------------------------------
gamificationRouter.get('/admin/overview', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Métricas gerais de gamificação
    const [totalTxResult] = await db.select({ totalXpAwarded: sum(xpTransactions.amount), count: count() }).from(xpTransactions);
    const [totalStudentsResult] = await db.select({ total: count() }).from(userExperience);
    const [activeChallengesResult] = await db.select({ total: count() }).from(challenges);
    const [totalAchievementsResult] = await db.select({ total: count() }).from(achievements);

    // Níveis dos usuários
    const levelDistribution = await db
      .select({
        level: userExperience.currentLevel,
        count: count(),
      })
      .from(userExperience)
      .groupBy(userExperience.currentLevel);

    // Últimas transações auditáveis de XP
    const recentTransactions = await db
      .select({
        id: xpTransactions.id,
        userId: xpTransactions.userId,
        amount: xpTransactions.amount,
        activityType: xpTransactions.activityType,
        description: xpTransactions.description,
        createdAt: xpTransactions.createdAt,
        userName: users.name,
      })
      .from(xpTransactions)
      .leftJoin(users, eq(xpTransactions.userId, users.id))
      .orderBy(desc(xpTransactions.createdAt))
      .limit(15);

    // Parâmetros do sistema
    const settings = await db.select().from(gamificationSettings);

    res.json({
      summary: {
        totalXpAwarded: Number(totalTxResult?.totalXpAwarded || 0),
        totalTransactions: Number(totalTxResult?.count || 0),
        totalGamifiedStudents: Number(totalStudentsResult?.total || 0),
        activeChallenges: Number(activeChallengesResult?.total || 0),
        totalAchievements: Number(totalAchievementsResult?.total || 0),
      },
      levelDistribution,
      recentTransactions,
      settings,
    });
  } catch (error) {
    console.error('Error fetching admin gamification overview:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

gamificationRouter.get('/admin/settings', requireAuth, async (_req, res) => {
  try {
    const list = await db.select().from(gamificationSettings);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

gamificationRouter.put('/admin/settings/:key', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const adminId = req.user?.uid || 'user-admin';

    const [updated] = await db
      .update(gamificationSettings)
      .set({
        value: String(value),
        description: description || undefined,
        updatedByUserId: adminId,
        updatedAt: new Date(),
      })
      .where(eq(gamificationSettings.key, key))
      .returning();

    // Registro em audit_logs
    await db.insert(auditLogs).values({
      userId: adminId,
      action: 'UPDATE',
      entity: 'gamification_settings',
      recordId: key,
      newValue: JSON.stringify(updated),
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating gamification setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

gamificationRouter.post('/admin/challenges', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, type, criteriaType, targetCount, xpReward, badgeRewardIcon } = req.body;
    const adminId = req.user?.uid || 'user-admin';

    if (!title || !criteriaType || !targetCount || !xpReward) {
      return res.status(400).json({ error: 'Título, critério, meta e XP são obrigatórios.' });
    }

    const id = `chal-${Date.now()}`;
    const [created] = await db
      .insert(challenges)
      .values({
        id,
        title,
        description: description || '',
        type: type || 'daily',
        criteriaType,
        targetCount: Number(targetCount),
        xpReward: Number(xpReward),
        badgeRewardIcon: badgeRewardIcon || 'Target',
        active: true,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: adminId,
      action: 'CREATE',
      entity: 'challenges',
      recordId: id,
      newValue: JSON.stringify(created),
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});
