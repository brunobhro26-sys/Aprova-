import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/apiService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowRight,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart2,
  Layers,
  Sliders,
  Check,
  BookOpen,
  ArrowLeft,
  Share2,
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface ActiveSessionData {
  sessionId: string;
  simulationTitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: any[];
  answers: Record<string, string>; // questionId -> selected letter
  markedForReview: Record<string, boolean>; // questionId -> boolean
  timeSpentSeconds: Record<string, number>;
  currentIndex: number;
  expiresAt?: string;
  startTime: number;
}

export const SimulationView: React.FC = () => {
  const { user, showToast, refreshData, setActiveTab } = useApp();

  // Mode: 'list' | 'config' | 'taking' | 'result'
  const [viewState, setViewState] = useState<'list' | 'config' | 'taking' | 'result'>('list');

  // Available Official Simulations, History, and Taxonomy from Backend
  const [availableSimulations, setAvailableSimulations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsTopics, setSubjectsTopics] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Active Session in progress
  const [activeSession, setActiveSession] = useState<ActiveSessionData | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isMobileMatrixOpen, setIsMobileMatrixOpen] = useState(false);

  // Finished Result Data
  const [resultData, setResultData] = useState<{
    session: any;
    summary: any;
    subjectBreakdown: any[];
    topicBreakdown: any[];
    questions?: any[];
  } | null>(null);
  const [resultFilter, setResultFilter] = useState<'all' | 'correct' | 'wrong' | 'blank'>('all');

  // Multi-mode Simulation Configurator (Prompt 11, Requisitos 12, 13 e 14)
  const [simMode, setSimMode] = useState<'free' | 'contest' | 'discipline' | 'custom'>('free');
  const [configTitle, setConfigTitle] = useState('Simulado Livre APROVA+');
  const [selectedCount, setSelectedCount] = useState<number>(20);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // minutes
  const [filterContest, setFilterContest] = useState('Todos');
  const [filterOrg, setFilterOrg] = useState('Todos');
  const [filterPosition, setFilterPosition] = useState('Todos');
  const [filterBoard, setFilterBoard] = useState('Todas');
  const [filterDiscipline, setFilterDiscipline] = useState('Todas');
  const [filterSubjectTopic, setFilterSubjectTopic] = useState('Todos');
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterYear, setFilterYear] = useState('Todos');
  const [previewData, setPreviewData] = useState<{
    requested: number;
    available: number;
    canStart: boolean;
    hasEnough: boolean;
    message: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isStartingEngine, setIsStartingEngine] = useState(false);
  const [insufficientPromptCount, setInsufficientPromptCount] = useState<number | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load initial simulations, history and taxonomy from database
  const loadSimulationsData = async () => {
    try {
      setLoadingInitial(true);
      const [sims, hist, eList, oList, pList, bList, sList, stList] = await Promise.all([
        ApiService.getSimulations().catch(() => []),
        ApiService.getSimulationHistory().catch(() => []),
        ApiService.getExams().catch(() => []),
        ApiService.getOrganizations().catch(() => []),
        ApiService.getPositions().catch(() => []),
        ApiService.getBoards().catch(() => []),
        ApiService.getSubjects().catch(() => []),
        ApiService.getSubjectsTopics().catch(() => [])
      ]);
      setAvailableSimulations(sims || []);
      setHistory(hist || []);
      setExams(eList || []);
      setOrganizations(oList || []);
      setPositions(pList || []);
      setBoards(bList || []);
      setSubjects(sList || []);
      setSubjectsTopics(stList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadSimulationsData();

    // Check if there is an active simulation stored in localStorage
    const savedLocal = localStorage.getItem('aprova_plus_active_session');
    if (savedLocal) {
      try {
        const parsed: ActiveSessionData = JSON.parse(savedLocal);
        // Validar e sincronizar com o servidor em tempo real (Requisito 17)
        if (parsed.sessionId) {
          ApiService.getSimulationSession(parsed.sessionId)
            .then((serverData) => {
              if (serverData?.session?.status === 'in_progress') {
                const diff = serverData.session.remainingSeconds || 0;
                if (diff > 0) {
                  // Mapear respostas salvas no PostgreSQL
                  const answersMap: Record<string, string> = {};
                  const markedMap: Record<string, boolean> = {};
                  (serverData.answers || []).forEach((a: any) => {
                    if (a.selectedOptionLetter) answersMap[a.questionId] = a.selectedOptionLetter;
                    if (a.isMarkedForReview) markedMap[a.questionId] = true;
                  });
                  setActiveSession({
                    ...parsed,
                    answers: answersMap,
                    markedForReview: markedMap,
                    questions: serverData.questions || parsed.questions,
                    expiresAt: serverData.session.expiresAt,
                  });
                  setTimeRemainingSeconds(diff);
                  setViewState('taking');
                  return;
                }
              }
              // Se já foi finalizado ou expirou, limpar
              localStorage.removeItem('aprova_plus_active_session');
            })
            .catch(() => {
              // Fallback local se estiver offline
              if (parsed.expiresAt) {
                const diffSeconds = Math.max(
                  0,
                  Math.floor((new Date(parsed.expiresAt).getTime() - Date.now()) / 1000)
                );
                if (diffSeconds > 0) {
                  setActiveSession(parsed);
                  setTimeRemainingSeconds(diffSeconds);
                  setViewState('taking');
                } else {
                  localStorage.removeItem('aprova_plus_active_session');
                }
              }
            });
        }
      } catch (e) {
        localStorage.removeItem('aprova_plus_active_session');
      }
    }
  }, []);

  // 2. Timer management when in 'taking' state
  useEffect(() => {
    if (viewState === 'taking' && activeSession) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, activeSession?.sessionId]);

  // Sync session state to localStorage
  useEffect(() => {
    if (activeSession && viewState === 'taking') {
      localStorage.setItem('aprova_plus_active_session', JSON.stringify(activeSession));
    }
  }, [activeSession, viewState]);

  // Format MM:SS or HH:MM:SS
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Start an Official Simulation
  const handleStartOfficial = async (sim: any) => {
    try {
      setLoadingInitial(true);
      const res = await ApiService.startSimulation({
        simulationId: sim.id,
        title: sim.title,
        totalQuestions: sim.totalQuestions,
        timeLimitMinutes: sim.timeLimitMinutes,
        distributionConfig: sim.distributionConfig
      });

      const initialAnswers: Record<string, string> = {};
      const initialMarked: Record<string, boolean> = {};

      const sessionData: ActiveSessionData = {
        sessionId: res.session.id,
        simulationTitle: sim.title,
        totalQuestions: res.questions.length,
        timeLimitMinutes: sim.timeLimitMinutes,
        questions: res.questions,
        answers: initialAnswers,
        markedForReview: initialMarked,
        timeSpentSeconds: {},
        currentIndex: 0,
        expiresAt: res.session.expiresAt,
        startTime: Date.now()
      };

      const remainingSecs = Math.max(
        0,
        Math.floor((new Date(res.session.expiresAt).getTime() - Date.now()) / 1000)
      );

      setActiveSession(sessionData);
      setTimeRemainingSeconds(remainingSecs > 0 ? remainingSecs : sim.timeLimitMinutes * 60);
      setViewState('taking');
      showToast('Simulado Iniciado!', 'Boa prova! Mantenha a concentração.', 'info');
    } catch (e: any) {
      console.error(e);
      showToast('Erro ao iniciar simulado', e.message || 'Verifique sua conexão', 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  // Check preview whenever configurator filters or selected count change
  const handleCheckPreview = async (overrideCount?: number) => {
    try {
      setIsPreviewLoading(true);
      const countToCheck = overrideCount !== undefined ? overrideCount : selectedCount;
      const res = await ApiService.previewSimulation({
        requestedCount: countToCheck,
        examId: filterContest !== 'Todos' ? filterContest : undefined,
        organizationId: filterOrg !== 'Todos' ? filterOrg : undefined,
        positionId: filterPosition !== 'Todos' ? filterPosition : undefined,
        boardId: filterBoard !== 'Todas' ? filterBoard : undefined,
        subjectId: filterDiscipline !== 'Todas' ? filterDiscipline : undefined,
        difficulty: filterDifficulty !== 'Todas' ? filterDifficulty : undefined,
        year: filterYear !== 'Todos' ? Number(filterYear) : undefined,
      });
      setPreviewData(res);
      return res;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (viewState === 'config') {
      handleCheckPreview();
    }
  }, [
    viewState,
    simMode,
    selectedCount,
    filterContest,
    filterOrg,
    filterPosition,
    filterBoard,
    filterDiscipline,
    filterDifficulty,
    filterYear
  ]);

  // Start Simulation from Configurator Engine
  const handleStartEngine = async (overrideCount?: number) => {
    try {
      setIsStartingEngine(true);
      const countToUse = overrideCount !== undefined ? overrideCount : selectedCount;

      let generatedTitle = configTitle.trim();
      if (!generatedTitle || generatedTitle === 'Simulado Livre APROVA+' || generatedTitle === 'Simulado Personalizado Transpetro') {
        if (simMode === 'contest' && filterContest !== 'Todos') {
          const ex = exams.find((e) => e.id === filterContest || e.name === filterContest);
          generatedTitle = `Simulado ${ex?.name || 'Concurso'}`;
        } else if (simMode === 'discipline' && filterDiscipline !== 'Todas') {
          const sub = subjects.find((s) => s.id === filterDiscipline || s.name === filterDiscipline);
          generatedTitle = `Simulado Foco em ${sub?.name || 'Disciplina'}`;
        } else if (simMode === 'free') {
          generatedTitle = `Simulado Livre (${countToUse} Questões)`;
        } else {
          generatedTitle = `Simulado Personalizado (${countToUse} Questões)`;
        }
      }

      const res = await ApiService.startSimulation({
        title: generatedTitle,
        totalQuestions: countToUse,
        timeLimitMinutes: selectedDuration,
        examId: filterContest !== 'Todos' ? filterContest : undefined,
        organizationId: filterOrg !== 'Todos' ? filterOrg : undefined,
        positionId: filterPosition !== 'Todos' ? filterPosition : undefined,
        boardId: filterBoard !== 'Todas' ? filterBoard : undefined,
        subjectId: filterDiscipline !== 'Todas' ? filterDiscipline : undefined,
        difficulty: filterDifficulty !== 'Todas' ? filterDifficulty : undefined,
        year: filterYear !== 'Todos' ? Number(filterYear) : undefined,
      });

      const sessionData: ActiveSessionData = {
        sessionId: res.session.id,
        simulationTitle: generatedTitle,
        totalQuestions: res.questions.length,
        timeLimitMinutes: selectedDuration,
        questions: res.questions,
        answers: {},
        markedForReview: {},
        timeSpentSeconds: {},
        currentIndex: 0,
        expiresAt: res.session.expiresAt,
        startTime: Date.now()
      };

      const remainingSecs = Math.max(
        0,
        Math.floor((new Date(res.session.expiresAt).getTime() - Date.now()) / 1000)
      );

      setActiveSession(sessionData);
      setTimeRemainingSeconds(remainingSecs > 0 ? remainingSecs : selectedDuration * 60);
      setViewState('taking');
      setInsufficientPromptCount(null);
      showToast('Simulado Iniciado!', `${res.questions.length} questões carregadas com sucesso. Boa prova!`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast('Erro ao iniciar simulado', e.message || 'Verifique sua conexão', 'error');
    } finally {
      setIsStartingEngine(false);
    }
  };

  // Select Option with Instant Auto-save to Server
  const handleSelectOption = async (letter: string) => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[activeSession.currentIndex];
    if (!currentQ) return;

    const newAnswers = { ...activeSession.answers, [currentQ.id]: letter };
    setActiveSession({
      ...activeSession,
      answers: newAnswers
    });

    // Auto-save in background to PostgreSQL server
    try {
      await ApiService.saveSimulationAnswer(activeSession.sessionId, {
        questionId: currentQ.id,
        selectedOptionLetter: letter,
        isMarkedForReview: activeSession.markedForReview[currentQ.id] || false
      });
    } catch (err) {
      console.warn('Auto-save answer failed, stored locally in memory:', err);
    }
  };

  // Toggle Marked for Review
  const handleToggleMarkReview = async () => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[activeSession.currentIndex];
    if (!currentQ) return;

    const currentMarked = Boolean(activeSession.markedForReview[currentQ.id]);
    const newMarked = !currentMarked;

    const updatedMarked = {
      ...activeSession.markedForReview,
      [currentQ.id]: newMarked
    };

    setActiveSession({
      ...activeSession,
      markedForReview: updatedMarked
    });

    try {
      await ApiService.saveSimulationAnswer(activeSession.sessionId, {
        questionId: currentQ.id,
        selectedOptionLetter: activeSession.answers[currentQ.id] || null,
        isMarkedForReview: newMarked
      });
    } catch (err) {
      // ignore
    }
  };

  // Clear answer for current question
  const handleClearAnswer = async () => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[activeSession.currentIndex];
    if (!currentQ) return;

    const newAnswers = { ...activeSession.answers };
    delete newAnswers[currentQ.id];

    setActiveSession({
      ...activeSession,
      answers: newAnswers
    });

    try {
      await ApiService.saveSimulationAnswer(activeSession.sessionId, {
        questionId: currentQ.id,
        selectedOptionLetter: null,
        isMarkedForReview: activeSession.markedForReview[currentQ.id] || false
      });
    } catch (e) {
      // ignore
    }
  };

  // Auto finish when time expires
  const handleAutoFinish = async () => {
    if (!activeSession) return;
    showToast('Tempo Esgotado!', 'Finalizando sua prova automaticamente...', 'warning');
    await executeFinish();
  };

  // Finish Simulation execution
  const executeFinish = async () => {
    if (!activeSession) return;
    try {
      setIsFinishing(true);
      const finishRes = await ApiService.finishSimulation(activeSession.sessionId);

      // Clean local storage
      localStorage.removeItem('aprova_plus_active_session');

      // Set result data
      setResultData({
        session: finishRes.session,
        summary: finishRes.summary,
        subjectBreakdown: finishRes.subjectBreakdown,
        topicBreakdown: finishRes.topicBreakdown,
        questions: activeSession.questions
      });

      setViewState('result');
      setFinishModalOpen(false);
      refreshData();
      showToast('Simulado Finalizado!', 'Confira seu relatório de desempenho.', 'success');
      loadSimulationsData();
    } catch (err: any) {
      showToast('Erro ao finalizar simulado', err.message || 'Tente novamente', 'error');
    } finally {
      setIsFinishing(false);
    }
  };

  // View Past Simulation Result
  const handleViewPastResult = async (sessionItem: any) => {
    try {
      setLoadingInitial(true);
      const res = await ApiService.getSimulationResult(sessionItem.id);
      setResultData({
        session: res.session,
        summary: {
          totalQuestions: res.session.totalQuestions,
          totalCorrect: res.session.totalCorrect,
          totalWrong: res.session.totalWrong,
          totalBlank: res.session.totalBlank,
          scorePercentage: res.session.scorePercentage,
          timeSpentSeconds: res.session.timeSpentSeconds
        },
        subjectBreakdown: res.subjectBreakdown,
        topicBreakdown: res.topicBreakdown,
        questions: res.questions
      });
      setViewState('result');
    } catch (err) {
      showToast('Erro ao carregar resultado do simulado', undefined, 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  // =========================================================================
  // VIEW: TAKING SIMULATION (Real Exam Environment)
  // =========================================================================
  if (viewState === 'taking' && activeSession) {
    const currentQ = activeSession.questions[activeSession.currentIndex];
    const totalQ = activeSession.questions.length;
    const answeredCount = Object.keys(activeSession.answers).length;
    const markedCount = Object.values(activeSession.markedForReview).filter(Boolean).length;
    const isCurrentMarked = Boolean(activeSession.markedForReview[currentQ?.id]);
    const currentSelection = activeSession.answers[currentQ?.id];

    // Is time critically low (less than 5 minutes)
    const isLowTime = timeRemainingSeconds < 300;

    return (
      <div className="max-w-6xl mx-auto space-y-4 pb-20">
        {/* Top Floating Control Bar */}
        <div className="sticky top-2 z-30 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-white truncate">
              {activeSession.simulationTitle}
            </span>
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
              Questão {activeSession.currentIndex + 1} de {totalQ}
            </Badge>

            {/* Mobile matrix trigger button (Prompt 8) */}
            <button
              onClick={() => setIsMobileMatrixOpen(true)}
              className="sm:hidden px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
              title="Abrir régua de questões"
            >
              <span>{activeSession.currentIndex + 1}/{totalQ}</span>
              <span className="text-[10px]">📋</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Timer Banner */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                isLowTime
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Finish Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => setFinishModalOpen(true)}
              className="font-bold shadow-xs text-xs px-2.5 sm:px-3"
            >
              <span className="hidden sm:inline">Entregar Prova</span>
              <span className="sm:hidden">Entregar</span>
            </Button>
          </div>
        </div>

        {/* Main Grid: Question Content (Left) + Quick Navigator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question Resolution Card (Left 8-9 cols) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                    {currentQ?.code || `Q-${currentQ?.id}`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentQ?.board?.name || 'CESGRANRIO'} • {currentQ?.year || 2024}
                  </span>
                  <Badge variant="outline" size="sm">
                    {currentQ?.difficulty || 'Médio'}
                  </Badge>
                </div>

                {/* Mark for Review Button */}
                <button
                  onClick={handleToggleMarkReview}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isCurrentMarked
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-current' : ''}`} />
                  <span>{isCurrentMarked ? 'Marcada p/ Revisão' : 'Marcar p/ Revisão'}</span>
                </button>
              </div>

              {/* Taxonomy Breadcrumb */}
              <div className="text-xs text-slate-500 flex items-center flex-wrap gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {currentQ?.subject?.name || 'Disciplina Geral'}
                </span>
                <span>→</span>
                <span>{currentQ?.subjectTopic?.name || 'Assunto'}</span>
                {currentQ?.topic?.name && (
                  <>
                    <span>→</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {currentQ?.topic?.name}
                    </span>
                  </>
                )}
              </div>

              {/* Enunciado */}
              <div className="text-base md:text-lg leading-relaxed text-slate-900 dark:text-slate-100 pt-2">
                {currentQ?.statement}
              </div>

              {/* Optional Diagram / Image */}
              {currentQ?.imageUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center">
                  <img
                    src={currentQ?.imageUrl}
                    alt="Diagrama do Simulado"
                    className="max-h-72 object-contain rounded"
                  />
                </div>
              )}

              {/* Alternatives Selection (No gabarito shown in exam mode) */}
              <div className="space-y-3 pt-4">
                {(currentQ?.alternatives || []).map((alt: any) => {
                  const letter = alt.letter;
                  const isSelected = currentSelection === letter;

                  return (
                    <div
                      key={letter}
                      onClick={() => handleSelectOption(letter)}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="flex-1 pt-1 text-sm md:text-base leading-relaxed">
                        {alt.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bar inside Card */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAnswer}
                  disabled={!currentSelection}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Limpar Resposta
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeSession.currentIndex === 0}
                    onClick={() =>
                      setActiveSession({
                        ...activeSession,
                        currentIndex: Math.max(0, activeSession.currentIndex - 1)
                      })
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={activeSession.currentIndex === totalQ - 1}
                    onClick={() =>
                      setActiveSession({
                        ...activeSession,
                        currentIndex: Math.min(totalQ - 1, activeSession.currentIndex + 1)
                      })
                    }
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Navigator Grid (Right 3-4 cols) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Régua de Questões
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {answeredCount}/{totalQ} respondidas
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                />
              </div>

              {/* Number Matrix */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {activeSession.questions.map((q, idx) => {
                  const isCurrent = idx === activeSession.currentIndex;
                  const isAnswered = Boolean(activeSession.answers[q.id]);
                  const isFlagged = Boolean(activeSession.markedForReview[q.id]);

                  let btnClass =
                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                  if (isCurrent) {
                    btnClass = 'ring-2 ring-primary-500 font-extrabold border-primary-500';
                  }

                  if (isAnswered) {
                    btnClass += ' bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() =>
                        setActiveSession({
                          ...activeSession,
                          currentIndex: idx
                        })
                      }
                      className={`h-9 rounded-lg text-xs font-semibold border flex items-center justify-center relative transition-all ${btnClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" />
                  <span>Respondida ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                  <span>Em branco ({totalQ - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Marcada p/ revisão ({markedCount})</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Prompt 8 Requirement 6: Mobile Question Matrix Drawer */}
        {isMobileMatrixOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
            <div
              onClick={() => setIsMobileMatrixOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <div className="relative z-10 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    Régua de Questões
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {answeredCount} de {totalQ} respondidas • {markedCount} marcadas
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMatrixOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Matrix Grid */}
              <div className="grid grid-cols-5 gap-2.5 py-4 overflow-y-auto max-h-[50vh]">
                {activeSession.questions.map((q, idx) => {
                  const isCurrent = idx === activeSession.currentIndex;
                  const isAnswered = Boolean(activeSession.answers[q.id]);
                  const isFlagged = Boolean(activeSession.markedForReview[q.id]);

                  let btnClass =
                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                  if (isCurrent) {
                    btnClass = 'ring-2 ring-primary-500 font-extrabold border-primary-500';
                  }
                  if (isAnswered) {
                    btnClass += ' bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveSession({
                          ...activeSession,
                          currentIndex: idx
                        });
                        setIsMobileMatrixOpen(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold border flex flex-col items-center justify-center relative transition-all ${btnClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsMobileMatrixOpen(false)}
                  className="flex-1 font-bold text-xs"
                >
                  Fechar Régua
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => {
                    setIsMobileMatrixOpen(false);
                    setFinishModalOpen(true);
                  }}
                  className="font-bold text-xs"
                >
                  Entregar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Finalizar Simulado Confirm */}
        <Modal
          isOpen={finishModalOpen}
          onClose={() => setFinishModalOpen(false)}
          title="Entregar e Finalizar Simulado"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Você respondeu <strong>{answeredCount}</strong> de <strong>{totalQ}</strong> questões.
            </p>

            {totalQ - answeredCount > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Atenção: Existem <strong>{totalQ - answeredCount} questão(ões)</strong> em branco
                  sem resposta registrada.
                </span>
              </div>
            )}

            {markedCount > 0 && (
              <p className="text-xs text-slate-500">
                Você possui {markedCount} questão(ões) marcada(s) para revisão.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFinishModalOpen(false)}
                disabled={isFinishing}
              >
                Voltar à Prova
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={executeFinish}
                disabled={isFinishing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isFinishing ? 'Calculando Gabarito...' : 'Confirmar e Finalizar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // =========================================================================
  // VIEW: RESULT & PERFORMANCE REPORT
  // =========================================================================
  if (viewState === 'result' && resultData) {
    const summary = resultData.summary;
    const scorePct = summary.scorePercentage || 0;
    const isPassing = scorePct >= 70;

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewState('list')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Simulados
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setViewState('config');
            }}
          >
            Novo Simulado
          </Button>
        </div>

        {/* Big Score Card */}
        <Card
          className={`p-6 md:p-8 rounded-2xl border text-center space-y-4 shadow-sm ${
            isPassing
              ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
              : 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-800'
          }`}
        >
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xs mx-auto">
            <Award
              className={`w-10 h-10 ${
                isPassing ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isPassing ? 'Parabéns! Excelente Desempenho!' : 'Simulado Concluído!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isPassing
                ? 'Sua pontuação está acima da nota de corte estimada para as vagas diretas.'
                : 'Analise os tópicos com maior taxa de erro e revise as questões erradas abaixo.'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Aproveitamento</span>
              <span
                className={`text-2xl font-black ${
                  isPassing ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {scorePct}%
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Acertos</span>
              <span className="text-2xl font-black text-emerald-600">
                {summary.totalCorrect}/{summary.totalQuestions}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Erros</span>
              <span className="text-2xl font-black text-rose-600">
                {summary.totalWrong}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block">Em Branco</span>
              <span className="text-2xl font-black text-slate-400">
                {summary.totalBlank}
              </span>
            </div>
          </div>
        </Card>

        {/* Desempenho por Disciplina */}
        {resultData.subjectBreakdown?.length > 0 && (
          <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-600" />
              Desempenho Detalhado por Disciplina
            </h3>

            <div className="space-y-4">
              {resultData.subjectBreakdown.map((sb) => (
                <div key={sb.subjectId} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{sb.subjectName}</span>
                    <span className="text-slate-500">
                      {sb.correct}/{sb.total} acertos ({sb.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        sb.percentage >= 70
                          ? 'bg-emerald-500'
                          : sb.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${sb.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Gabarito e Revisão Questão a Questão */}
        <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gabarito Completo & Comentários das Questões
              </h3>
              <p className="text-xs text-slate-500">
                Revise suas respostas com a fundamentação oficial dos professores.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setResultFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  resultFilter === 'all'
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Todas ({resultData.questions?.length || 0})
              </button>
              <button
                onClick={() => setResultFilter('wrong')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  resultFilter === 'wrong'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Erradas ({summary.totalWrong})
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {(resultData.questions || []).map((q, idx) => {
              const correctAlt = (q.alternatives || []).find((a: any) => a.isCorrect);
              const correctLetter = correctAlt?.letter || 'B';

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary-600">
                      Questão {idx + 1} • {q.code || `Q-${q.id}`}
                    </span>
                    <Badge variant="outline" size="sm">
                      {q.difficulty || 'Médio'}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {q.statement}
                  </p>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      Gabarito Oficial: Alternativa ({correctLetter})
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW: LIST OF SIMULATIONS & BUILDER
  // =========================================================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Simulados de Concurso
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Treine em condições reais de prova com cronômetro regressivo, gabarito e análise de erros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewState === 'config' ? (
            <Button variant="outline" size="sm" onClick={() => setViewState('list')}>
              Ver Simulados Disponíveis
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setViewState('config')}
              className="flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              Montar Simulado Personalizado
            </Button>
          )}
        </div>
      </div>

      {/* VIEW: CONFIG FORM (Prompt 11, Requisitos 12, 13 e 14) */}
      {viewState === 'config' && (
        <Card className="p-6 md:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Configurador do Motor de Simulados
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Personalize quantidade, modalidade e filtros pedagógicos com verificação de acervo em tempo real.
            </p>
          </div>

          {/* 1. Modalidades de Simulado (Requisito 12) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Modalidade do Simulado:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'free', label: 'Simulado Livre', desc: 'Todo o acervo do banco' },
                { id: 'contest', label: 'Por Concurso', desc: 'Foco no edital e banca' },
                { id: 'discipline', label: 'Por Disciplina', desc: 'Foco em matéria / assunto' },
                { id: 'custom', label: 'Personalizado', desc: 'Combinação avançada livre' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSimMode(m.id as any);
                    if (m.id === 'free') {
                      setFilterContest('Todos');
                      setFilterDiscipline('Todas');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simMode === m.id
                      ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-900 dark:text-primary-100 shadow-xs ring-1 ring-primary-500'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block">{m.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Quantidade de Questões (Prompt 11: 5, 10, 20, 30, 50) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Quantidade de Questões:
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 30, 50].map((countVal) => (
                <button
                  key={countVal}
                  type="button"
                  onClick={() => setSelectedCount(countVal)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCount === countVal
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {countVal} questões
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tempo Limite */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Tempo Limite de Prova:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { min: 15, label: '15 minutos (Sprint)' },
                { min: 30, label: '30 minutos (Padrão)' },
                { min: 60, label: '60 minutos (1 hora)' },
                { min: 120, label: '120 minutos (2 horas)' },
              ].map((t) => (
                <button
                  key={t.min}
                  type="button"
                  onClick={() => setSelectedDuration(t.min)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedDuration === t.min
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Filtros Específicos por Modalidade */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Filtros Pedagógicos:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Concurso (Concurso, Custom) */}
              {(simMode === 'contest' || simMode === 'custom') && (
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Concurso
                  </label>
                  <select
                    value={filterContest}
                    onChange={(e) => setFilterContest(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todos">Todos os Concursos</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Banca (Concurso, Custom) */}
              {(simMode === 'contest' || simMode === 'custom') && (
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Banca Examinadora
                  </label>
                  <select
                    value={filterBoard}
                    onChange={(e) => setFilterBoard(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todas">Todas as Bancas</option>
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.sigla})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Disciplina (Discipline, Custom) */}
              {(simMode === 'discipline' || simMode === 'custom') && (
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Disciplina
                  </label>
                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todas">Todas as Disciplinas</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dificuldade (Todos os modos) */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Todas">Qualquer Dificuldade</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              {/* Ano */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Ano da Questão
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Todos">Todos os Anos</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Prévia de Disponibilidade em Tempo Real (Requisito 13) */}
          <div className="pt-1">
            {isPreviewLoading ? (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-3 text-xs text-slate-500">
                <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                <span>Verificando acervo real no banco de dados PostgreSQL...</span>
              </div>
            ) : previewData ? (
              previewData.available === 0 ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Nenhuma questão encontrada</strong>
                    <span>Não há questões publicadas cadastradas com estes filtros específicos. Altere os filtros acima para prosseguir.</span>
                  </div>
                </div>
              ) : previewData.available < selectedCount ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Acervo parcial disponível</strong>
                      <p className="mt-0.5">
                        Você solicitou <strong>{selectedCount} questões</strong>. Encontramos apenas{' '}
                        <strong>{previewData.available} questões disponíveis</strong> com os filtros selecionados.
                      </p>
                    </div>
                  </div>

                  {/* 3 Opções Exigidas no Requisito 13 */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartEngine(previewData.available)}
                      disabled={isStartingEngine}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      {isStartingEngine ? 'Iniciando...' : `Iniciar com ${previewData.available} questões`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterDifficulty('Todas');
                        setFilterYear('Todos');
                        setFilterBoard('Todas');
                      }}
                    >
                      Ampliar filtros
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setViewState('list')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{previewData.available} questões publicadas</strong> prontas para geração do caderno.
                    </span>
                  </div>
                  <Badge variant="success" size="sm">Acervo Suficiente</Badge>
                </div>
              )
            ) : null}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewState('list')}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isStartingEngine || !previewData || previewData.available === 0}
              onClick={() => handleStartEngine()}
              className="font-bold px-6 bg-primary-600 text-white shadow-md shadow-primary-600/30"
            >
              {isStartingEngine ? 'Gerando Caderno...' : `Iniciar Simulado (${selectedCount} questões)`}
            </Button>
          </div>
        </Card>
      )}

      {/* VIEW: OFFICIAL SIMULATIONS LIST */}
      {viewState === 'list' && (
        <div className="space-y-8">
          {/* Official Sim Banner */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm" className="bg-primary-500 text-white font-bold">
                SIMULADO OFICIAL RECOMENDADO
              </Badge>
              <span className="text-xs text-indigo-200">Banca Cesgranrio</span>
            </div>

            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl md:text-2xl font-black">
                Simulado Transpetro — Técnico em Eletrotécnica (CESGRANRIO)
              </h2>
              <p className="text-xs md:text-sm text-indigo-100 leading-relaxed">
                Prova completa estruturada com 20 questões reais do banco de dados: 5 de Português, 5 de Matemática e 10 de Eletrotécnica. Cronômetro regressivo com contagem oficial de 30 minutos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-indigo-200">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>20 Questões Oficiais</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>30 Minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary-400" />
                <span>Feedback & Análise Imediatos</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const official = availableSimulations.find((s) => s.isOfficial) || {
                    id: 'sim-transpetro-01',
                    title: 'Simulado Oficial Transpetro 2024 - CESGRANRIO',
                    totalQuestions: 20,
                    timeLimitMinutes: 30,
                    distributionConfig: {
                      'sub-portugues': 5,
                      'sub-matematica': 5,
                      'sub-eletrotecnica': 10
                    }
                  };
                  handleStartOfficial(official);
                }}
                className="bg-white text-primary-900 hover:bg-slate-100 font-bold px-8 shadow-lg"
              >
                <Play className="w-4 h-4 fill-current mr-2" />
                Iniciar Simulado Oficial
              </Button>
            </div>
          </div>

          {/* Histórico de Simulados Realizados */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Histórico de Simulados Realizados
            </h3>

            {loadingInitial ? (
              <p className="text-xs text-slate-500 py-4">Carregando histórico...</p>
            ) : history.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhum simulado finalizado ainda
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Inicie o Simulado Oficial acima para testar sua velocidade e avaliar sua taxa de acertos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => handleViewPastResult(h)}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-primary-400 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(h.finishedAt || h.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge
                        variant={h.scorePercentage >= 70 ? 'success' : 'warning'}
                        size="sm"
                      >
                        {h.scorePercentage || 0}% de acerto
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {h.simulation?.title || 'Simulado Realizado'}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>
                        {h.totalCorrect} de {h.totalQuestions} acertadas
                      </span>
                      <span className="text-primary-600 font-semibold flex items-center gap-1">
                        Ver Relatório <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
