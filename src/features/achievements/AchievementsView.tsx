import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  GamificationClient,
  GamificationStatus,
  AchievementItem,
  ChallengeItem,
  LeaderboardEntry,
  StudyGroupItem,
  VirtualRewardItem,
} from '../../services/gamificationClient';
import {
  Trophy,
  Zap,
  Flame,
  Award,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Share2,
  Users,
  Sparkles,
  Clock,
  Calendar,
  RefreshCw,
  Crown,
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Compass,
  Target,
  ArrowRight,
  TrendingUp,
  Tag,
  Palette,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { user, refreshData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'medals' | 'challenges' | 'ranking' | 'groups' | 'rewards'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Gamification Data States
  const [status, setStatus] = useState<GamificationStatus | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<StudyGroupItem[]>([]);
  const [rewards, setRewards] = useState<VirtualRewardItem[]>([]);

  // Filter & UI States
  const [medalsCategory, setMedalsCategory] = useState<'all' | 'constancy' | 'questions' | 'performance' | 'planning'>('all');
  const [rankingPeriod, setRankingPeriod] = useState<string>('all_time');
  const [selectedAchievementForShare, setSelectedAchievementForShare] = useState<AchievementItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Group Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
    focusExam: 'Transpetro 2026',
    avatarEmoji: '⚡',
    maxMembers: 20,
    collectiveGoalTitle: 'Resolver 500 questões esta semana',
    collectiveGoalTarget: 500,
  });

  // Privacy Edit Modal
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [hideNameToggle, setHideNameToggle] = useState(false);
  const [optInToggle, setOptInToggle] = useState(true);

  const loadAllGamificationData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, achsRes, chalsRes, lbRes, grpsRes, rewsRes] = await Promise.all([
        GamificationClient.getStatus(),
        GamificationClient.getAchievements(),
        GamificationClient.getChallenges(),
        GamificationClient.getLeaderboard(rankingPeriod),
        GamificationClient.getGroups(),
        GamificationClient.getRewards(),
      ]);

      setStatus(statusRes);
      setAchievements(achsRes);
      setChallenges(chalsRes);
      setLeaderboard(lbRes);
      setGroups(grpsRes);
      setRewards(rewsRes);

      setNicknameInput(statusRes.privacy.publicNickname || '');
      setHideNameToggle(statusRes.privacy.hideRealName);
      setOptInToggle(statusRes.privacy.optInRanking);
    } catch (err: any) {
      console.error('Error loading gamification data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllGamificationData();
  }, []);

  // Reload leaderboard when period changes
  const handleRankingPeriodChange = async (period: string) => {
    setRankingPeriod(period);
    try {
      const res = await GamificationClient.getLeaderboard(period);
      setLeaderboard(res);
    } catch (e) {
      console.error('Error fetching leaderboard for period:', period);
    }
  };

  // Claim Challenge
  const handleClaimChallenge = async (ch: ChallengeItem) => {
    try {
      const res = await GamificationClient.claimChallenge(ch.id, ch.periodKey);
      showToast('Recompensa Resgatada!', `+${res.xpAwarded} XP adicionados à sua jornada.`, 'success');
      loadAllGamificationData();
      refreshData();
    } catch (err: any) {
      showToast('Atenção', err.message || 'Falha ao resgatar recompensa', 'error');
    }
  };

  // Equip Reward
  const handleEquipReward = async (rew: VirtualRewardItem) => {
    try {
      await GamificationClient.equipReward(rew.id);
      showToast('Recompensa Equipada', `"${rew.name}" agora está ativo no seu perfil.`, 'success');
      loadAllGamificationData();
      refreshData();
    } catch (err: any) {
      showToast('Erro ao equipar', err.message, 'error');
    }
  };

  // Save Privacy Settings
  const handleSavePrivacy = async () => {
    try {
      await GamificationClient.updatePrivacy({
        optInRanking: optInToggle,
        publicNickname: nicknameInput.trim() || undefined,
        hideRealName: hideNameToggle,
      });
      showToast('Privacidade Atualizada', 'Suas preferências de ranking e exibição foram salvas.', 'success');
      setIsPrivacyModalOpen(false);
      loadAllGamificationData();
      refreshData();
    } catch (err: any) {
      showToast('Erro ao atualizar privacidade', err.message, 'error');
    }
  };

  // Create Study Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;
    try {
      await GamificationClient.createGroup(newGroupForm);
      showToast('Grupo Criado!', `Grupo "${newGroupForm.name}" pronto para receber concurseiros.`, 'success');
      setIsCreateGroupOpen(false);
      loadAllGamificationData();
    } catch (err: any) {
      showToast('Erro ao criar grupo', err.message, 'error');
    }
  };

  // Join Study Group
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    try {
      const res = await GamificationClient.joinGroup(inviteCodeInput.trim());
      showToast('Bem-vindo ao Grupo!', res.message || 'Você agora é membro do grupo de estudos.', 'success');
      setIsJoinGroupOpen(false);
      setInviteCodeInput('');
      loadAllGamificationData();
    } catch (err: any) {
      showToast('Não foi possível entrar', err.message, 'error');
    }
  };

  // Leave Group
  const handleLeaveGroup = async (groupId: string) => {
    try {
      await GamificationClient.leaveGroup(groupId);
      showToast('Grupo Deixado', 'Você saiu do grupo de estudos.', 'info');
      loadAllGamificationData();
    } catch (err: any) {
      showToast('Erro ao sair do grupo', err.message, 'error');
    }
  };

  // Streak Freeze
  const handleUseFreeze = async () => {
    try {
      await GamificationClient.useStreakFreeze();
      showToast('Escudo Ativado', 'Seu dia de ausência foi protegido sem quebra da sequência.', 'success');
      loadAllGamificationData();
    } catch (err: any) {
      showToast('Não foi possível ativar', err.message, 'error');
    }
  };

  const level = status?.level || {
    level: 4,
    name: 'Persistente',
    currentMin: 600,
    nextMax: 1000,
    xpNeeded: 160,
    progressPercentage: 60,
    badgeIcon: 'Flame',
    colorTheme: 'amber',
  };

  const filteredAchievements = achievements.filter((a) => {
    if (medalsCategory === 'all') return true;
    return a.category === medalsCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Gamificação & Conquistas
            </h1>
            <Badge variant="purple" size="sm">
              Nível {level.level} · {level.name}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Evolução real e constância nos estudos: ganhe XP por questões, simulados, revisões e metas alcançadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-xs"
            leftIcon={status?.privacy.hideRealName ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
          >
            {status?.privacy.hideRealName ? 'Modo Anônimo Ativo' : 'Privacidade & Apelido'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAllGamificationData}
            className="text-xs"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'Visão Geral & Nível', icon: Trophy },
          { id: 'medals', label: `Medalhas (${unlockedCount}/${achievements.length})`, icon: Award },
          { id: 'challenges', label: 'Desafios Diários & Semanais', icon: Target },
          { id: 'ranking', label: 'Quadro de Líderes', icon: Crown },
          { id: 'groups', label: 'Grupos de Estudo', icon: Users },
          { id: 'rewards', label: 'Recompensas & Perfil', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL & NÍVEL DE PROGRESSÃO */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Hero Card: Level & XP Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  <Trophy className="w-8 h-8 text-amber-100" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Graduação APROVA+
                    </span>
                    {status?.equipped.title && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 border border-white/10 font-semibold">
                        {status.equipped.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    Nível {level.level} — {level.name}
                  </h2>
                  <p className="text-xs text-indigo-200">
                    Você acumulou <strong className="text-white tabular-nums">{status?.totalXp || 840} XP</strong> com atividades legítimas de estudo.
                  </p>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="md:w-80 space-y-2">
                <div className="flex justify-between text-xs font-bold text-indigo-200">
                  <span>Nível {level.level}</span>
                  <span className="tabular-nums">{level.progressPercentage}% para Nível {level.level + 1}</span>
                </div>
                <div className="w-full bg-white/20 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${level.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-indigo-300 tabular-nums">
                  <span>{level.currentMin} XP</span>
                  <span>Faltam {level.xpNeeded} XP</span>
                  <span>{level.nextMax} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Streak Card */}
            <Card className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-medium">Sequência Atual</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {status?.streak.current || 4} dias
                </div>
                <span className="text-[11px] text-slate-400">Recorde: {status?.streak.longest || 12} dias</span>
              </div>
            </Card>

            {/* Weekly XP */}
            <Card className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-medium">XP Esta Semana</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  +{status?.weeklyXp || 220} XP
                </div>
                <span className="text-[11px] text-slate-400">Ritmo sustentável</span>
              </div>
            </Card>

            {/* Achievements Progress */}
            <Card className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-medium">Medalhas Conquistadas</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {unlockedCount} / {achievements.length}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {Math.round((unlockedCount / (achievements.length || 1)) * 100)}% desbloqueadas
                </span>
              </div>
            </Card>

            {/* Group Membership */}
            <Card className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-medium">Grupo de Estudos</span>
                <div className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {groups[0]?.name || 'Nenhum'}
                </div>
                <span className="text-[11px] text-slate-400">
                  {groups[0] ? `${groups[0].memberCount} membros ativos` : 'Ingresse com código'}
                </span>
              </div>
            </Card>
          </div>

          {/* Active Challenges Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Desafios em Andamento
              </h3>
              <button
                onClick={() => setActiveTab('challenges')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver todos os desafios <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {challenges.slice(0, 2).map((ch) => (
                <Card key={ch.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant={ch.type === 'daily' ? 'primary' : 'warning'} size="sm">
                          {ch.type === 'daily' ? 'Diário' : 'Semanal'}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{ch.expiresText}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {ch.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ch.description}
                      </p>
                    </div>

                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap tabular-nums">
                      +{ch.xpReward} XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 tabular-nums">
                      <span>Progresso: {ch.currentProgress} / {ch.targetCount}</span>
                      <span>{ch.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${ch.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: MEDALHAS & CONQUISTAS */}
      {/* ========================================================================= */}
      {activeTab === 'medals' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'constancy', label: 'Constância' },
                { id: 'questions', label: 'Questões' },
                { id: 'performance', label: 'Desempenho' },
                { id: 'planning', label: 'Planejamento' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMedalsCategory(c.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    medalsCategory === c.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-semibold tabular-nums">
              Exibindo {filteredAchievements.length} medalhas pedagógicas
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              return (
                <Card
                  key={ach.id}
                  className={`p-5 flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 dark:from-indigo-950/20 to-transparent'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs ${
                            isUnlocked
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isUnlocked ? <Trophy className="w-6 h-6 text-amber-300" /> : <Lock className="w-5 h-5" />}
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {ach.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            Categoria: {ach.category}
                          </span>
                        </div>
                      </div>

                      <Badge variant={ach.rarity === 'legendary' ? 'warning' : ach.rarity === 'epic' ? 'purple' : 'outline'} size="sm">
                        +{ach.xpReward} XP
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    {isUnlocked ? (
                      <>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Desbloqueada
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAchievementForShare(ach)}
                          className="text-xs h-7 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                        >
                          <Share2 className="w-3.5 h-3.5 mr-1" /> Compartilhar
                        </Button>
                      </>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Requer: {ach.criteriaType.replace('_', ' ')} ({ach.criteriaValue})
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: DESAFIOS DIÁRIOS E SEMANAIS */}
      {/* ========================================================================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Desafios Personalizados de Estudo
              </h3>
              <p className="text-xs text-slate-500">
                Metas equilibradas para manter seu ritmo de preparação sem sobrecarga.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((ch) => {
              const isReadyToClaim = ch.completed && !ch.rewardClaimed;

              return (
                <Card key={ch.id} className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={ch.type === 'daily' ? 'primary' : 'warning'} size="sm">
                          {ch.type === 'daily' ? 'Desafio Diário' : 'Desafio Semanal'}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{ch.expiresText}</span>
                      </div>

                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                        +{ch.xpReward} XP
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ch.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {ch.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                      <span>Progresso: {ch.currentProgress} de {ch.targetCount}</span>
                      <span>{ch.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ch.completed ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${ch.progressPercent}%` }}
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      {ch.rewardClaimed ? (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recompensa Coletada
                        </span>
                      ) : isReadyToClaim ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleClaimChallenge(ch)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" /> Resgatar +{ch.xpReward} XP
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Em andamento
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: QUADRO DE LÍDERES (RANKINGS OPCIONAIS) */}
      {/* ========================================================================= */}
      {activeTab === 'ranking' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quadro de Líderes Comunitário
              </h3>
              <p className="text-xs text-slate-500">
                Competição saudável e opcional entre estudantes da APROVA+.
              </p>
            </div>

            {/* Selector de Período */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {[
                { id: 'all_time', label: 'Geral' },
                { id: 'weekly', label: 'Semanal' },
                { id: 'monthly', label: 'Mensal' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleRankingPeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    rankingPeriod === p.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-300">
              {status?.privacy.hideRealName
                ? 'Você está participando com seu Apelido Público protegido.'
                : 'Seu nome ou apelido está visível no ranking.'}
            </span>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Configurar Privacidade
            </button>
          </div>

          {/* Leaderboard Table Card */}
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {leaderboard.map((item, idx) => {
                const rankPos = item.rank || idx + 1;
                const isCurrentUser = item.isCurrentUser;

                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 font-bold'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          rankPos === 1
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : rankPos === 2
                            ? 'bg-slate-300 text-slate-900'
                            : rankPos === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rankPos}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                        {item.displayName.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 dark:text-white font-bold">
                            {item.displayName}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="primary" size="sm">
                              Você
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.levelName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm block tabular-nums">
                        {item.score} XP
                      </span>
                      <span className="text-[10px] text-slate-400">acumulados</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: GRUPOS DE ESTUDO */}
      {/* ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grupos Privados de Estudo
              </h3>
              <p className="text-xs text-slate-500">
                Compartilhe metas coletivas, resolva questões em equipe e compare sua dedicação.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsJoinGroupOpen(true)}>
                <Lock className="w-3.5 h-3.5 mr-1" /> Ingressar com Código
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsCreateGroupOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Criar Grupo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((grp) => (
              <Card key={grp.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{grp.avatarEmoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {grp.name}
                      </h4>
                      <span className="text-xs text-slate-500">{grp.focusExam}</span>
                    </div>
                  </div>

                  {grp.isMember && (
                    <Badge variant="success" size="sm">
                      Membro Ativo
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {grp.description}
                </p>

                {/* Meta Coletiva */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{grp.collectiveGoalTitle || 'Meta Coletiva da Semana'}</span>
                    <span className="tabular-nums">{grp.collectiveGoalProgress} / {grp.collectiveGoalTarget} XP</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((grp.collectiveGoalProgress / (grp.collectiveGoalTarget || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Footer: Invite Code & Actions */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-slate-400">
                    Código: <strong className="text-indigo-600 dark:text-indigo-400">{grp.inviteCode}</strong>
                  </span>

                  {grp.isMember ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeaveGroup(grp.id)}
                      className="text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      Sair do Grupo
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInviteCodeInput(grp.inviteCode);
                        setIsJoinGroupOpen(true);
                      }}
                      className="text-xs"
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: RECOMPENSAS VIRTUAIS & CUSTOMIZAÇÃO DE PERFIL */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Catálogo de Recompensas Virtuais
            </h3>
            <p className="text-xs text-slate-500">
              Personalize seu perfil com molduras, títulos honoríficos e emblemas desbloqueados pela sua evolução.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((rew) => (
              <Card
                key={rew.id}
                className={`p-5 flex flex-col justify-between space-y-4 ${
                  rew.isEquipped
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {rew.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          {rew.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {rew.isEquipped && (
                      <Badge variant="primary" size="sm">
                        Equipado
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rew.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Requer Nível {rew.requiredLevel}
                  </span>

                  {rew.isUnlocked ? (
                    <Button
                      variant={rew.isEquipped ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleEquipReward(rew)}
                      className="text-xs h-7"
                    >
                      {rew.isEquipped ? 'Equipado' : 'Equipar no Perfil'}
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Bloqueado
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPARTILHAR CONQUISTA (SHARE CARD) */}
      {/* ========================================================================= */}
      {selectedAchievementForShare && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAchievementForShare(null)}
          title="Compartilhar Conquista"
        >
          <div className="space-y-4">
            {/* Visual Share Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white text-center space-y-3 shadow-lg border border-indigo-700/50">
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
                <Trophy className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-lg font-black text-amber-300">
                {selectedAchievementForShare.name}
              </h3>
              <p className="text-xs text-indigo-200">
                {selectedAchievementForShare.description}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
                <span>APROVA+ · Concursos</span>
                <span className="tabular-nums">+{selectedAchievementForShare.xpReward} XP</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Compartilhe sua evolução com seus colegas ou redes para inspirar constância.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🏆 Conquistei a medalha "${selectedAchievementForShare.name}" na plataforma APROVA+! Foco constante rumo à posse!`
                  );
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                  showToast('Copiado!', 'Mensagem copiada para a área de transferência.', 'success');
                }}
              >
                {copiedLink ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
                {copiedLink ? 'Copiado' : 'Copiar Texto'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedAchievementForShare(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAÇÃO DE PRIVACIDADE E APELIDO */}
      {/* ========================================================================= */}
      {isPrivacyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPrivacyModalOpen(false)}
          title="Privacidade & Exibição no Ranking"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Apelido Público (Opcional)
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Ex: Concurseiro Transpetro"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Este apelido será exibido no lugar do seu nome real no quadro de líderes.
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideNameToggle}
                  onChange={(e) => setHideNameToggle(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Ocultar meu nome real (aparecer como Anônimo ou com meu apelido)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optInToggle}
                  onChange={(e) => setOptInToggle(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Participar dos rankings comunitários da plataforma
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsPrivacyModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSavePrivacy}>
                Salvar Preferências
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR GRUPO DE ESTUDO */}
      {/* ========================================================================= */}
      {isCreateGroupOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateGroupOpen(false)}
          title="Criar Grupo Privado de Estudos"
        >
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nome do Grupo
              </label>
              <input
                type="text"
                value={newGroupForm.name}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                placeholder="Ex: Transpetro 2026 — Foco Eletrotécnica"
                required
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Concurso / Foco Principal
              </label>
              <input
                type="text"
                value={newGroupForm.focusExam}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, focusExam: e.target.value })}
                placeholder="Ex: Transpetro - Técnico em Eletrotécnica"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Descrição do Grupo
              </label>
              <textarea
                value={newGroupForm.description}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                placeholder="Regras, horários de estudo coletivo e foco em resolução de questões..."
                rows={2}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateGroupOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Criar Grupo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INGRESSAR EM GRUPO COM CÓDIGO */}
      {/* ========================================================================= */}
      {isJoinGroupOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsJoinGroupOpen(false)}
          title="Ingressar em Grupo Privado"
        >
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <p className="text-xs text-slate-500">
              Digite o código de convite fornecido pelo criador do grupo (ex: <strong>TRANSPETRO26</strong>).
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Código de Convite
              </label>
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Ex: TRANSPETRO26"
                required
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsJoinGroupOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Ingressar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
