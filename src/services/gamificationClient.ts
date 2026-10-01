import { getAuth } from 'firebase/auth';

export interface GamificationStatus {
  userId: string;
  totalXp: number;
  weeklyXp: number;
  monthlyXp: number;
  level: {
    level: number;
    name: string;
    description: string;
    badgeIcon: string;
    colorTheme: string;
    currentMin: number;
    nextMax: number;
    xpNeeded: number;
    progressPercentage: number;
  };
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
    freezeAvailable: boolean;
  };
  achievementsSummary: {
    total: number;
    unlocked: number;
  };
  privacy: {
    optInRanking: boolean;
    publicNickname: string | null;
    hideRealName: boolean;
  };
  equipped: {
    title?: string | null;
    frame?: string | null;
    badge?: string | null;
    theme?: string | null;
  };
}

export interface AchievementItem {
  id: string;
  category: 'constancy' | 'questions' | 'performance' | 'planning';
  name: string;
  description: string;
  icon: string;
  criteriaType: string;
  criteriaValue: number;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  isShared: boolean;
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  criteriaType: string;
  targetCount: number;
  xpReward: number;
  badgeRewardIcon?: string;
  periodKey: string;
  currentProgress: number;
  completed: boolean;
  rewardClaimed: boolean;
  claimedAt: string | null;
  expiresText: string;
  progressPercent: number;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  isCurrentUser: boolean;
  rank: number;
  displayName: string;
  score: number;
  levelName: string;
  isAnonymous: boolean;
}

export interface StudyGroupItem {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  avatarEmoji: string;
  focusExam: string | null;
  isPrivate: boolean;
  maxMembers: number;
  collectiveXp: number;
  collectiveGoalTarget: number;
  collectiveGoalProgress: number;
  collectiveGoalTitle: string | null;
  isMember: boolean;
  userRole: string | null;
  contributedXp: number;
  memberCount: number;
  members: Array<{
    userId: string;
    name: string;
    role: string;
    contributedXp: number;
  }>;
}

export interface VirtualRewardItem {
  id: string;
  name: string;
  description: string;
  type: 'avatar_frame' | 'profile_title' | 'badge' | 'color_theme' | 'achievement_card';
  itemKey: string;
  requiredLevel: number;
  xpCost: number;
  icon: string;
  previewData?: string;
  isUnlocked: boolean;
  isEquipped: boolean;
  canEquip: boolean;
}

export class GamificationClient {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async getStatus(): Promise<GamificationStatus> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/status', { headers });
    if (!res.ok) throw new Error('Falha ao carregar status de gamificação');
    return res.json();
  }

  static async getAchievements(): Promise<AchievementItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/achievements', { headers });
    if (!res.ok) throw new Error('Falha ao carregar conquistas');
    return res.json();
  }

  static async toggleShareAchievement(id: string): Promise<{ success: boolean; isShared: boolean }> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/achievements/${id}/share`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error('Falha ao alterar compartilhamento');
    return res.json();
  }

  static async getChallenges(): Promise<ChallengeItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/challenges', { headers });
    if (!res.ok) throw new Error('Falha ao carregar desafios');
    return res.json();
  }

  static async claimChallenge(id: string, periodKey: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/challenges/${id}/claim`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ periodKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao resgatar recompensa');
    }
    return res.json();
  }

  static async getStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    freezeAvailable: boolean;
    freezeUsedCount: number;
    history: string[];
  }> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/streak', { headers });
    if (!res.ok) throw new Error('Falha ao carregar sequência');
    return res.json();
  }

  static async useStreakFreeze(): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/streak/freeze', {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao ativar proteção de sequência');
    }
    return res.json();
  }

  static async getLeaderboard(period: string = 'all_time'): Promise<LeaderboardEntry[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/leaderboard?period=${period}`, { headers });
    if (!res.ok) throw new Error('Falha ao carregar ranking');
    return res.json();
  }

  static async updatePrivacy(data: {
    optInRanking?: boolean;
    publicNickname?: string;
    hideRealName?: boolean;
  }): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/privacy', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar configurações de privacidade');
    return res.json();
  }

  static async getGroups(): Promise<StudyGroupItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/groups', { headers });
    if (!res.ok) throw new Error('Falha ao carregar grupos de estudo');
    return res.json();
  }

  static async createGroup(data: any): Promise<StudyGroupItem> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/groups', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao criar grupo');
    }
    return res.json();
  }

  static async joinGroup(inviteCode: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/groups/join', {
      method: 'POST',
      headers,
      body: JSON.stringify({ inviteCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao ingressar no grupo');
    }
    return res.json();
  }

  static async leaveGroup(groupId: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/groups/${groupId}/leave`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error('Falha ao sair do grupo');
    return res.json();
  }

  static async getRewards(): Promise<VirtualRewardItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/rewards', { headers });
    if (!res.ok) throw new Error('Falha ao carregar recompensas virtuais');
    return res.json();
  }

  static async equipReward(id: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/rewards/${id}/equip`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error('Falha ao equipar recompensa');
    return res.json();
  }

  static async getAdminOverview(): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/admin/overview', { headers });
    if (!res.ok) throw new Error('Falha ao carregar visão geral administrativa');
    return res.json();
  }

  static async updateAdminSetting(key: string, value: string, description?: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`/api/gamification/admin/settings/${key}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ value, description }),
    });
    if (!res.ok) throw new Error('Falha ao atualizar configuração');
    return res.json();
  }

  static async createAdminChallenge(data: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/gamification/admin/challenges', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar desafio');
    return res.json();
  }
}
