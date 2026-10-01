import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  StudyGoal,
  StudySessionItem,
  StudyReviewItem,
  StudyRecommendation
} from '../../types';
import {
  StudyPlanClient,
  StudyReviewsGrouped,
  StudyMetricsResponse,
  StudyProgressData
} from '../../services/studyPlanClient';
import { WhatToStudyWidget } from './components/WhatToStudyWidget';
import { CalendarView } from './components/CalendarView';
import { StudyGoalsManager } from './components/StudyGoalsManager';
import { StudyTimerModal } from './components/StudyTimerModal';
import { ReviewsCenterView } from './components/ReviewsCenterView';
import { StudyGoalsMetricsView } from './components/StudyGoalsMetricsView';
import { StudyProgressMatrix } from './components/StudyProgressMatrix';
import { NewPlanWizard } from './components/NewPlanWizard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Compass,
  Calendar as CalendarIcon,
  ListTodo,
  RotateCcw,
  Target,
  BarChart3,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  History,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export type StudyPlanSubTab =
  | 'meu-plano'
  | 'calendario'
  | 'sessoes'
  | 'revisoes'
  | 'metas'
  | 'progresso'
  | 'novo';

export const StudyPlanView: React.FC = () => {
  const { user, showToast, setActiveTab, setInitialQuestionFilter } = useApp();

  const [currentSubTab, setCurrentSubTab] = useState<StudyPlanSubTab>('meu-plano');
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [sessions, setSessions] = useState<StudySessionItem[]>([]);
  const [reviews, setReviews] = useState<StudyReviewsGrouped>({
    hoje: [],
    atrasadas: [],
    proximas: [],
    concluidas: [],
    totalCount: 0
  });
  const [recommendation, setRecommendation] = useState<StudyRecommendation | null>(null);
  const [secondaryRecs, setSecondaryRecs] = useState<StudyRecommendation[]>([]);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [metricsData, setMetricsData] = useState<StudyMetricsResponse>({
    metrics: [],
    summary: {
      weeklyHoursStudied: 0,
      weeklyHoursTarget: 12,
      streakDays: 4,
      totalSessionsCompleted: 0
    }
  });
  const [progressData, setProgressData] = useState<StudyProgressData>({
    disciplineProgress: [],
    topicDomainMap: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Active Timer Session
  const [timerSession, setTimerSession] = useState<StudySessionItem | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Load all study plan data from backend
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        goalsRes,
        sessionsRes,
        reviewsRes,
        recsRes,
        metricsRes,
        progressRes,
        historyRes
      ] = await Promise.all([
        StudyPlanClient.getGoals(),
        StudyPlanClient.getSessions(),
        StudyPlanClient.getReviews(),
        StudyPlanClient.getRecommendations(),
        StudyPlanClient.getMetrics(),
        StudyPlanClient.getStudyProgress(),
        StudyPlanClient.getPlanHistory()
      ]);

      setGoals(goalsRes);
      setSessions(sessionsRes);
      setReviews(reviewsRes);
      if (recsRes) {
        setRecommendation(recsRes.whatToStudyNow);
        setSecondaryRecs(recsRes.recommendations || []);
      }
      setMetricsData(metricsRes);
      setProgressData(progressRes);
      setPlanHistory(historyRes);
    } catch (err) {
      console.error('Error loading study plan data:', err);
      showToast('Erro ao carregar', 'Não foi possível sincronizar o plano de estudos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Timer Handlers
  const handleStartTimerFromSession = (session: StudySessionItem) => {
    setTimerSession(session);
    setIsTimerOpen(true);
  };

  const handleStartTimerFromRecommendation = (rec: StudyRecommendation) => {
    // Find or create temporary session for this recommendation
    const existing = sessions.find((s) => s.topicId === rec.topicId && s.status !== 'Concluída');
    if (existing) {
      setTimerSession(existing);
    } else {
      const tempSession: StudySessionItem = {
        id: `sess-temp-${Date.now()}`,
        userId: user.id,
        tipo: 'Questões',
        data: formatDate(new Date()),
        duracaoPlanejada: rec.suggestedDurationMinutes || 50,
        duracaoReal: 0,
        status: 'Planejada',
        subjectName: rec.discipline,
        topicName: rec.topic,
        topicId: rec.topicId,
        observacoes: rec.reason
      };
      setTimerSession(tempSession);
    }
    setIsTimerOpen(true);
  };

  const handleSolveQuestionsFromRecommendation = (rec: StudyRecommendation) => {
    setInitialQuestionFilter({
      discipline: rec.discipline
    });
    setActiveTab('questions');
  };

  const handleSessionCompleted = (updated: StudySessionItem) => {
    showToast('Parabéns!', 'Sessão de estudos concluída com sucesso.', 'success');
    loadAllData();
  };

  const handleQuickComplete = async (sessionId: string) => {
    try {
      await StudyPlanClient.completeSession(sessionId, {
        duracaoReal: 60,
        difficultyRating: 'Normal',
        observacoes: 'Sessão concluída rapidamente pelo calendário.'
      });
      showToast('Sessão Concluída', 'Registro atualizado no cronograma!', 'success');
      loadAllData();
    } catch (err) {
      console.error('Error in quick complete:', err);
    }
  };

  // Drag-and-drop session date change
  const handleSessionDateChange = async (sessionId: string, newDate: string) => {
    try {
      await StudyPlanClient.updateSession(sessionId, { data: newDate });
      showToast('Sessão Reagendada', `Movida com sucesso para ${newDate}.`, 'info');
      // Optimistic update
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, data: newDate } : s))
      );
    } catch (err) {
      console.error('Error updating session date:', err);
      loadAllData();
    }
  };

  // Manual session creation
  const handleAddManualSession = async (date: string) => {
    try {
      await StudyPlanClient.createSession({
        data: date,
        tipo: 'Questões',
        duracaoPlanejada: 60,
        horaInicio: '19:00',
        horaFim: '20:00',
        observacoes: 'Sessão de prática adicional adicionada manualmente.'
      });
      showToast('Sessão Adicionada', `Nova sessão agendada para ${date}.`, 'success');
      loadAllData();
    } catch (err) {
      console.error('Error adding session:', err);
    }
  };

  // Reorganizar semana (Replanning)
  const handleRecalculateWeek = async () => {
    const principalGoal = goals.find((g) => g.prioridade === 'Principal') || goals[0];
    if (!principalGoal) return;

    try {
      const res = await StudyPlanClient.recalculatePlan(
        principalGoal.id,
        'Replanejamento da semana acionado pelo usuário no calendário'
      );
      showToast(
        'Semana Reorganizada!',
        `${res.reallocatedCount || 0} sessões atrasadas foram redistribuídas sem perder seu histórico.`,
        'success'
      );
      loadAllData();
    } catch (err) {
      console.error('Error recalculating plan:', err);
      showToast('Erro no replanejamento', (err as Error).message, 'error');
    }
  };

  const principalGoal = goals.find((g) => g.prioridade === 'Principal') || goals[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Plano de Estudos Inteligente
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {principalGoal
              ? `Foco ativo: ${principalGoal.nome} • Carga: ${principalGoal.horasDisponiveisSemana}h semanais`
              : 'Seu cronograma adaptativo de preparação para concursos'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {recommendation && (
            <Button
              size="sm"
              onClick={() => handleStartTimerFromRecommendation(recommendation)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Estudar Agora
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentSubTab('novo')}
            className="border-slate-200 dark:border-slate-700 font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Plano
          </Button>
        </div>
      </div>

      {/* Subpage Navigation Bar (Prompt Requirement 3) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        <button
          type="button"
          onClick={() => setCurrentSubTab('meu-plano')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'meu-plano'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Meu Plano & Recomendações
        </button>

        <button
          type="button"
          onClick={() => setCurrentSubTab('calendario')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'calendario'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Calendário & Horários
        </button>

        <button
          type="button"
          onClick={() => setCurrentSubTab('sessoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'sessoes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Sessões ({sessions.length})
        </button>

        <button
          type="button"
          onClick={() => setCurrentSubTab('revisoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'revisoes'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Revisões SRS ({reviews.hoje.length + reviews.atrasadas.length})
        </button>

        <button
          type="button"
          onClick={() => setCurrentSubTab('metas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'metas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Metas & Horas
        </button>

        <button
          type="button"
          onClick={() => setCurrentSubTab('progresso')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentSubTab === 'progresso'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Progresso do Edital
        </button>
      </div>

      {/* SUBPAGE 1: MEU PLANO (Dashboard & O que estudar agora) */}
      {currentSubTab === 'meu-plano' && (
        <div className="space-y-6">
          {/* Primary Recommendation Widget */}
          <WhatToStudyWidget
            recommendation={recommendation}
            secondaryRecommendations={secondaryRecs}
            onStartSession={handleStartTimerFromRecommendation}
            onSolveQuestions={handleSolveQuestionsFromRecommendation}
          />

          {/* Quick Metrics Bar */}
          <StudyGoalsMetricsView
            metricsData={metricsData}
            onRefreshMetrics={loadAllData}
          />

          {/* Study Goals List */}
          <StudyGoalsManager
            goals={goals}
            onRefreshGoals={loadAllData}
            onOpenNewWizard={() => setCurrentSubTab('novo')}
          />

          {/* Replanning History section */}
          {planHistory.length > 0 && (
            <Card className="p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Histórico de Replanejamento Semanal
                </h4>
              </div>

              <div className="space-y-2">
                {planHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.reason}
                      </span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                      Auditado
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBPAGE 2: CALENDÁRIO */}
      {currentSubTab === 'calendario' && (
        <CalendarView
          sessions={sessions}
          onStartSession={handleStartTimerFromSession}
          onQuickComplete={handleQuickComplete}
          onSessionDateChange={handleSessionDateChange}
          onAddManualSession={handleAddManualSession}
          onRecalculateWeek={handleRecalculateWeek}
        />
      )}

      {/* SUBPAGE 3: SESSÕES DE ESTUDO */}
      {currentSubTab === 'sessoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Todas as Sessões Programadas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhe e execute cada bloco de teoria, questões ou revisão
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => handleAddManualSession(formatDate(new Date()))}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Sessão
            </Button>
          </div>

          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Disciplina & Conteúdo</th>
                    <th className="p-3.5 text-center">Duração</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {sessions.slice(0, 30).map((session) => {
                    const isDone = session.status === 'Concluída';
                    const isDelayed = session.status === 'Atrasada';

                    return (
                      <tr
                        key={session.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-3.5 text-xs font-mono font-bold text-slate-500">
                          {session.data}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {session.tipo}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {session.subjectName || 'Geral'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {session.topicName || session.observacoes || 'Conteúdo estruturado'}
                          </div>
                        </td>
                        <td className="p-3.5 text-center text-xs font-mono">
                          {session.duracaoPlanejada} min
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge
                            className={
                              isDone
                                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                                : isDelayed
                                ? 'bg-rose-500/20 text-rose-600 border-rose-500/30'
                                : 'bg-slate-500/20 text-slate-600 border-slate-500/30'
                            }
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          {!isDone ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartTimerFromSession(session)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Iniciar
                            </Button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Concluída
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SUBPAGE 4: CENTRAL DE REVISÕES */}
      {currentSubTab === 'revisoes' && (
        <ReviewsCenterView
          reviews={reviews}
          onRefreshReviews={loadAllData}
          onStartReviewSession={(rev) => {
            // Can launch questions directly
            setActiveTab('questions');
          }}
        />
      )}

      {/* SUBPAGE 5: METAS */}
      {currentSubTab === 'metas' && (
        <StudyGoalsMetricsView
          metricsData={metricsData}
          onRefreshMetrics={loadAllData}
        />
      )}

      {/* SUBPAGE 6: PROGRESSO DO EDITAL */}
      {currentSubTab === 'progresso' && (
        <StudyProgressMatrix progressData={progressData} />
      )}

      {/* SUBPAGE 7: NOVO PLANO WIZARD */}
      {currentSubTab === 'novo' && (
        <NewPlanWizard
          onPlanCreated={() => {
            showToast('Sucesso!', 'Plano de estudos gerado com sucesso!', 'success');
            setCurrentSubTab('meu-plano');
            loadAllData();
          }}
          onCancel={() => setCurrentSubTab('meu-plano')}
        />
      )}

      {/* Real-time Study Timer Modal */}
      {timerSession && (
        <StudyTimerModal
          session={timerSession}
          isOpen={isTimerOpen}
          onClose={() => {
            setIsTimerOpen(false);
            setTimerSession(null);
          }}
          onSessionCompleted={handleSessionCompleted}
        />
      )}
    </div>
  );
};
