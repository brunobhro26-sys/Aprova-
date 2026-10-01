import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AnalyticsClient, PeriodFilter, OverviewData, SubjectStat } from '../../services/analyticsClient';
import {
  CheckCircle2,
  TrendingUp,
  Clock,
  Flame,
  Target,
  FileQuestion,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bot,
  Calendar,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart2,
  BookOpen,
  Trophy,
  Crown
} from 'lucide-react';
import { GamificationClient, GamificationStatus, ChallengeItem } from '../../services/gamificationClient';

export const DashboardView: React.FC = () => {
  const { user, setActiveTab, setInitialQuestionFilter } = useApp();

  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [evolutionMetric, setEvolutionMetric] = useState<'accuracy' | 'questions' | 'hours' | 'simulations'>('accuracy');
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [subjectsSortBy, setSubjectsSortBy] = useState<string>('accuracy_desc');
  const [isLoading, setIsLoading] = useState(true);

  // Gamification Integration (Prompt 9 Requirement 11)
  const [gamifStatus, setGamifStatus] = useState<GamificationStatus | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<ChallengeItem[]>([]);

  // Load real indicators from Cloud SQL
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [overviewRes, evolutionRes, subjectsRes, gamifRes, chalsRes] = await Promise.all([
          AnalyticsClient.getOverview(user.id, period, customStart, customEnd),
          AnalyticsClient.getEvolution(user.id, evolutionMetric, period),
          AnalyticsClient.getSubjects(user.id, period, subjectsSortBy),
          GamificationClient.getStatus().catch(() => null),
          GamificationClient.getChallenges().catch(() => []),
        ]);

        if (isMounted) {
          setOverview(overviewRes);
          setEvolutionData(evolutionRes);
          setSubjects(subjectsRes);
          if (gamifRes) setGamifStatus(gamifRes);
          if (chalsRes) setActiveChallenges(chalsRes);
        }
      } catch (err) {
        console.error('Error loading dashboard analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user.id, period, customStart, customEnd, evolutionMetric, subjectsSortBy]);

  const targetContestName = user.targetContest || 'Transpetro';
  const targetPositionName = user.targetPosition || 'Técnico em Eletrotécnica';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 2. Top Header Greeting (Requirement 2 & Prompt 8 Mobile Hub) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 rounded-3xl shadow-lg border border-indigo-800/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/10">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Concurso: {targetContestName} — {targetPositionName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-base font-medium max-w-xl">
            Sua rotina diária para a aprovação no concurso. Mantenha o ritmo e alcance sua meta!
          </p>
        </div>

        {/* Action: Continuar de onde parou (Prompt 8) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          <Button
            variant="success"
            size="md"
            leftIcon={<ArrowRight className="w-4 h-4 text-slate-950" />}
            onClick={() => {
              if (overview?.priorityToday) {
                setInitialQuestionFilter({
                  discipline: overview.priorityToday.discipline,
                  subject: overview.priorityToday.topic
                });
              }
              setActiveTab('questions');
            }}
            className="w-full sm:w-auto font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 py-2.5 px-4 cursor-pointer"
          >
            Continuar de Onde Parou
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Bot className="w-4 h-4 text-violet-300" />}
            onClick={() => setActiveTab('assistant')}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold"
          >
            Assistente IA
          </Button>
        </div>
      </div>

      {/* Prompt 9: Barra de Motivação e Gamificação (Nível, XP, Streak, Desafio Ativo) */}
      {gamifStatus && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0">
              <Trophy className="w-6 h-6 text-amber-200" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Nível {gamifStatus.level.level} · {gamifStatus.level.name}
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                  {gamifStatus.totalXp} XP
                </span>
                {gamifStatus.equipped.title && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-800">
                    {gamifStatus.equipped.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-36 sm:w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gamifStatus.level.progressPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  Faltam {gamifStatus.level.xpNeeded} XP para Nível {gamifStatus.level.level + 1}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Streak flame */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="tabular-nums">{gamifStatus.streak.current} dias de constância</span>
            </div>

            {/* Active Challenge Preview */}
            {activeChallenges.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate max-w-[200px]">{activeChallenges[0].title}:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {activeChallenges[0].currentProgress}/{activeChallenges[0].targetCount}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('achievements')}
              className="text-xs h-8 cursor-pointer"
            >
              Ver Conquistas & Rankings <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Prompt 8 Requirement 4: Ações Rápidas Mobile & Desktop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          <span>Ações Rápidas de Estudo</span>
          <span className="text-[10px] text-indigo-500 font-semibold">Toque para iniciar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Iniciar sessão de estudo */}
          <button
            onClick={() => setActiveTab('study-plan')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Iniciar Sessão
              </span>
              <span className="text-[10px] text-slate-400">Cronômetro / Pomodoro</span>
            </div>
          </button>

          {/* 2. Resolver questões */}
          <button
            onClick={() => setActiveTab('questions')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileQuestion className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Resolver Questões
              </span>
              <span className="text-[10px] text-slate-400">Banco comentado</span>
            </div>
          </button>

          {/* 3. Iniciar simulado */}
          <button
            onClick={() => setActiveTab('simulations')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Iniciar Simulado
              </span>
              <span className="text-[10px] text-slate-400">Com cronômetro real</span>
            </div>
          </button>

          {/* 4. Revisar erros */}
          <button
            onClick={() => setActiveTab('mistakes')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Revisar Erros
              </span>
              <span className="text-[10px] text-slate-400">Caderno de erros</span>
            </div>
          </button>

          {/* 5. Consultar plano de estudos */}
          <button
            onClick={() => setActiveTab('study-plan')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Plano de Estudos
              </span>
              <span className="text-[10px] text-slate-400">Metas & cronograma</span>
            </div>
          </button>

          {/* 6. Acessar o assistente de IA */}
          <button
            onClick={() => setActiveTab('assistant')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-violet-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Assistente de IA
              </span>
              <span className="text-[10px] text-slate-400">Tira-dúvidas e resumos</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Period Filter (Requirement 4) */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>Filtrar período:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'today', label: 'Hoje' },
              { id: '7d', label: 'Últimos 7 dias' },
              { id: '30d', label: 'Últimos 30 dias' },
              { id: '90d', label: 'Últimos 90 dias' },
              { id: '6m', label: 'Últimos 6 meses' },
              { id: '12m', label: 'Últimos 12 meses' },
              { id: 'all', label: 'Todo o período' },
              { id: 'custom', label: 'Personalizado' }
            ] as Array<{ id: PeriodFilter; label: string }>
          ).map(p => (
            <button
              key={p.id}
              onClick={() => {
                setPeriod(p.id);
                if (p.id === 'custom') setIsCustomOpen(true);
                else setIsCustomOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === p.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Custom Date Range Picker */}
      {isCustomOpen && (
        <Card className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <label>Data Início:</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Data Fim:</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <Button size="sm" variant="primary" onClick={() => setPeriod('custom')}>
              Aplicar Intervalo
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Key Indicators Cards (Requirement 3) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Questões resolvidas */}
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Questões Resolvidas</span>
            <FileQuestion className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {overview?.indicators.totalQuestions ?? 0}
          </div>
          {overview?.comparison.hasEnoughData ? (
            <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1.5 ${overview.comparison.diffQuestions >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {overview.comparison.diffQuestions >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{overview.comparison.diffQuestions >= 0 ? `+${overview.comparison.diffQuestions}` : overview.comparison.diffQuestions} vs anterior</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-1.5">Dados reais do banco</div>
          )}
        </Card>

        {/* Card 2: Taxa de acerto */}
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Taxa de Acerto</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {overview?.indicators.accuracyRate ?? 0}%
          </div>
          {overview?.comparison.hasEnoughData ? (
            <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1.5 ${overview.comparison.diffAccuracy >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {overview.comparison.diffAccuracy >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{overview.comparison.diffAccuracy >= 0 ? `+${overview.comparison.diffAccuracy}%` : `${overview.comparison.diffAccuracy}%`} vs anterior</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-1.5">{overview?.indicators.correctAnswers ?? 0} acertos</div>
          )}
        </Card>

        {/* Card 3: Horas estudadas */}
        <Card className="p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Horas Estudadas</span>
            <Clock className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {overview?.indicators.totalHours ?? 0}h
          </div>
          {overview?.comparison.hasEnoughData ? (
            <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1.5 ${overview.comparison.diffHours >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {overview.comparison.diffHours >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{overview.comparison.diffHours >= 0 ? `+${overview.comparison.diffHours}h` : `${overview.comparison.diffHours}h`} vs anterior</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-1.5">Sessões & questões</div>
          )}
        </Card>

        {/* Card 4: Dias consecutivos (Streak) */}
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Dias Consecutivos</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
            {overview?.indicators.streakDays ?? 0}
            <span className="text-xs font-normal text-slate-400">dias</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">Atividade real contínua</div>
        </Card>

        {/* Card 5: Simulados realizados */}
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Simulados</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {overview?.indicators.simulationsCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">
            Média: {overview?.indicators.avgSimulationScore ?? 0}%
          </div>
        </Card>

        {/* Card 6: Progresso do plano */}
        <Card className="p-4 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Progresso do Plano</span>
            <Calendar className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {overview?.indicators.planProgress ?? 0}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overview?.indicators.planProgress || 0)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* 45 & 46: Sua Análise de Hoje & Sua Prioridade de Hoje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 45: Sua Análise de Hoje */}
        <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sua Análise de Hoje
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
              <span>Questões resolvidas hoje:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {overview?.todayAnalysis.todayQuestions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
              <span>Aproveitamento hoje:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {overview?.todayAnalysis.todayAccuracy || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
              <span>Revisões inteligentes pendentes:</span>
              <span className="font-bold text-amber-500">
                {overview?.todayAnalysis.pendingReviews || 0} agendadas
              </span>
            </div>
          </div>
        </Card>

        {/* 46: Sua Prioridade de Hoje */}
        <Card className="p-5 border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sua Prioridade de Hoje
              </h3>
            </div>
            <Badge variant="warning" size="sm">
              Atenção Recomendada
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              {overview?.priorityToday.discipline} → {overview?.priorityToday.topic}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {overview?.priorityToday.reason}
            </p>
            <div className="text-[11px] text-slate-500">
              Duração sugerida: {overview?.priorityToday.suggestedDurationMinutes} minutos
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold"
                onClick={() => {
                  setInitialQuestionFilter({
                    discipline: overview?.priorityToday.discipline,
                    subject: overview?.priorityToday.topic
                  });
                  setActiveTab('questions');
                }}
              >
                {overview?.priorityToday.actionText || 'Começar agora'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Gráfico de Evolução (Line/Bar with switchers) (Requirement 5) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Evolução Temporal do Desempenho
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhamento cronológico calculado com base nos registros do banco de dados.
            </p>
          </div>

          {/* Metric switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'accuracy', label: 'Taxa de Acerto' },
                { id: 'questions', label: 'Questões Resolvidas' },
                { id: 'hours', label: 'Horas Estudadas' },
                { id: 'simulations', label: 'Simulados' }
              ] as Array<{ id: 'accuracy' | 'questions' | 'hours' | 'simulations'; label: string }>
            ).map(m => (
              <button
                key={m.id}
                onClick={() => setEvolutionMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  evolutionMetric === m.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Line/Bar Representation with Real Data Points */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(evolutionData?.weeklyPoints || []).map((pt: any, idx: number) => {
              const val =
                evolutionMetric === 'accuracy'
                  ? `${pt.accuracy}%`
                  : evolutionMetric === 'questions'
                  ? `${pt.questions} quest.`
                  : `${pt.hours}h`;

              const pct =
                evolutionMetric === 'accuracy'
                  ? pt.accuracy
                  : evolutionMetric === 'questions'
                  ? Math.min(100, Math.round((pt.questions / 30) * 100))
                  : Math.min(100, Math.round((pt.hours / 10) * 100));

              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">{pt.label}</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{val}</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('performance')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ver Mapa de Desempenho Completo
            </Button>
          </div>
        </div>
      </Card>

      {/* 6. Desempenho por Disciplina (Comparative Table) (Requirement 6) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Desempenho Comparativo por Disciplina
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribuição detalhada de aproveitamento por matéria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Ordenar por:</span>
            <select
              value={subjectsSortBy}
              onChange={e => setSubjectsSortBy(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
            >
              <option value="accuracy_desc">Maior taxa de acerto</option>
              <option value="accuracy_asc">Menor taxa de acerto</option>
              <option value="questions_desc">Maior quantidade de questões</option>
              <option value="questions_asc">Menor quantidade de questões</option>
            </select>
          </div>
        </div>

        {/* Comparative Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Disciplina</th>
                <th className="p-3 text-center">Questões</th>
                <th className="p-3 text-center">Acertos</th>
                <th className="p-3 text-center">Erros</th>
                <th className="p-3 text-center">Taxa de Acerto</th>
                <th className="p-3 text-right rounded-r-lg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map(sub => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {sub.name}
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {sub.questions}
                  </td>
                  <td className="p-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    {sub.correct}
                  </td>
                  <td className="p-3 text-center font-semibold text-rose-500">
                    {sub.wrong}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{sub.accuracy}%</span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sub.accuracy >= 75 ? 'bg-emerald-500' : sub.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${sub.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInitialQuestionFilter({ discipline: sub.name });
                        setActiveTab('questions');
                      }}
                    >
                      Praticar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 47. Previsão de Conclusão do Edital (Requirement 47) */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-300">
              <Compass className="w-3.5 h-3.5" />
              <span>Previsão Pedagógica de Conclusão do Conteúdo</span>
            </div>
            <h3 className="text-xl font-black">
              {overview?.completionForecast.forecastText}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {overview?.completionForecast.disclaimer}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 text-center min-w-[180px]">
            <span className="text-3xl font-black text-emerald-400 block">
              {overview?.completionForecast.percentageCompleted || 0}%
            </span>
            <span className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider">
              {overview?.completionForecast.completedTopics} de {overview?.completionForecast.totalTopics} tópicos estudados
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
