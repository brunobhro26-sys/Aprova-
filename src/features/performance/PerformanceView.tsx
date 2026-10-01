import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  AnalyticsClient,
  HierarchyData,
  HeatmapDiscipline,
  ErrorsData,
  TimeAnalysisData,
  SimulationsData,
  BoardStat,
  PeriodFilter
} from '../../services/analyticsClient';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  FileQuestion,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Grid,
  AlertOctagon,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Filter,
  Bot,
  HelpCircle,
  BookOpen
} from 'lucide-react';

type SubTab =
  | 'visao-geral'
  | 'dominio'
  | 'heatmap'
  | 'assuntos-topicos'
  | 'erros'
  | 'tempo'
  | 'simulados'
  | 'bancas';

export const PerformanceView: React.FC = () => {
  const { user, setActiveTab, setInitialQuestionFilter } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('visao-geral');
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [heatmap, setHeatmap] = useState<{ disciplines: HeatmapDiscipline[] } | null>(null);
  const [errorsData, setErrorsData] = useState<ErrorsData | null>(null);
  const [timeData, setTimeData] = useState<TimeAnalysisData | null>(null);
  const [simulationsData, setSimulationsData] = useState<SimulationsData | null>(null);
  const [boardsData, setBoardsData] = useState<BoardStat[]>([]);

  const [selectedTopicDetail, setSelectedTopicDetail] = useState<any | null>(null);
  const [selectedSimIds, setSelectedSimIds] = useState<string[]>([]);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Record<string, boolean>>({});
  const [classificationModal, setClassificationModal] = useState<{
    attemptId: number;
    questionId: string;
    code: string;
    statement: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('falta_conhecimento');
  const [categoryNotes, setCategoryNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all required data
  useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      try {
        setIsLoading(true);
        const [hierRes, heatRes, errRes, timeRes, simRes, boardsRes] = await Promise.all([
          AnalyticsClient.getHierarchy(user.id),
          AnalyticsClient.getHeatmap(user.id),
          AnalyticsClient.getErrors(user.id, period),
          AnalyticsClient.getTimeAnalysis(user.id, period),
          AnalyticsClient.getSimulations(user.id),
          AnalyticsClient.getBoards(user.id)
        ]);

        if (isMounted) {
          setHierarchy(hierRes);
          setHeatmap(heatRes);
          setErrorsData(errRes);
          setTimeData(timeRes);
          setSimulationsData(simRes);
          setBoardsData(boardsRes);

          // Select first two simulations for comparison if available
          if (simRes.simulations.length >= 2) {
            setSelectedSimIds([simRes.simulations[0].id, simRes.simulations[simRes.simulations.length - 1].id]);
          }
        }
      } catch (err) {
        console.error('Error loading performance data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [user.id, period]);

  const toggleDisciplineExpand = (name: string) => {
    setExpandedDisciplines(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveClassification = async () => {
    if (!classificationModal) return;
    try {
      await AnalyticsClient.classifyMistake(
        user.id,
        classificationModal.attemptId,
        classificationModal.questionId,
        selectedCategory,
        categoryNotes
      );
      // Refresh errors
      const updated = await AnalyticsClient.getErrors(user.id, period);
      setErrorsData(updated);
      setClassificationModal(null);
    } catch (err) {
      alert('Erro ao salvar classificação.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Controle de Desempenho & Análise
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Concurso: <span className="font-bold text-slate-700 dark:text-slate-300">{hierarchy?.exam.name || 'Transpetro'}</span> • Cargo: <span className="font-bold text-slate-700 dark:text-slate-300">{hierarchy?.position.name || 'Técnico em Eletrotécnica'}</span>
          </p>
        </div>

        {/* Global Period Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(
            [
              { id: '7d', label: '7d' },
              { id: '30d', label: '30d' },
              { id: '90d', label: '90d' },
              { id: 'all', label: 'Tudo' }
            ] as Array<{ id: PeriodFilter; label: string }>
          ).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                period === p.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold scrollbar-none">
        {[
          { id: 'visao-geral', label: 'Mapa de Desempenho', icon: <Layers className="w-4 h-4" /> },
          { id: 'dominio', label: 'Mapa de Domínio', icon: <Award className="w-4 h-4 text-emerald-500" /> },
          { id: 'heatmap', label: 'Mapa de Calor', icon: <Grid className="w-4 h-4 text-amber-500" /> },
          { id: 'assuntos-topicos', label: 'Assuntos & Tópicos', icon: <BookOpen className="w-4 h-4 text-cyan-500" /> },
          { id: 'erros', label: 'Análise de Erros', icon: <AlertOctagon className="w-4 h-4 text-rose-500" /> },
          { id: 'tempo', label: 'Tempo & Produtividade', icon: <Clock className="w-4 h-4 text-violet-500" /> },
          { id: 'simulados', label: 'Simulados & Comparativo', icon: <Target className="w-4 h-4 text-indigo-500" /> },
          { id: 'bancas', label: 'Por Banca Examinadora', icon: <Users className="w-4 h-4 text-slate-500" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as SubTab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MAPA DE DESEMPENHO (Hierarquia Completa) (Requirement 7) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'visao-geral' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Badge variant="success" size="sm">
                  Matriz Curricular Estruturada
                </Badge>
                <h3 className="text-xl sm:text-2xl font-black">
                  Hierarquia do Edital: {hierarchy?.exam.name}
                </h3>
                <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
                  Navegue pela árvore de conhecimento: Concurso → Cargo → Disciplina → Assunto → Tópico. Todas as métricas são apuradas diretamente das resoluções de questões.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
                <div className="text-center">
                  <span className="text-3xl font-black text-emerald-400 block">
                    {hierarchy?.topics.filter(t => t.masteryStatus === 'DOMINADO').length || 0}
                  </span>
                  <span className="text-[10px] text-indigo-200 font-semibold uppercase">Dominados</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <span className="text-3xl font-black text-amber-300 block">
                    {hierarchy?.topics.filter(t => t.masteryStatus === 'EM DESENVOLVIMENTO').length || 0}
                  </span>
                  <span className="text-[10px] text-indigo-200 font-semibold uppercase">Em Desenv.</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <span className="text-3xl font-black text-rose-400 block">
                    {hierarchy?.topics.filter(t => t.masteryStatus === 'PRECISA REVISAR').length || 0}
                  </span>
                  <span className="text-[10px] text-indigo-200 font-semibold uppercase">Revisar</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Hierarchy Tree */}
          <div className="space-y-3">
            {Array.from(new Set(hierarchy?.topics.map(t => t.subjectName) || [])).map(subjName => {
              const subjTopics = hierarchy?.topics.filter(t => t.subjectName === subjName) || [];
              const isExpanded = expandedDisciplines[subjName] !== false; // expanded by default

              return (
                <Card key={subjName} className="overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    onClick={() => toggleDisciplineExpand(subjName)}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {subjName}
                      </h4>
                      <Badge variant="outline" size="sm">
                        {subjTopics.length} tópicos
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-500">
                        {subjTopics.reduce((acc, t) => acc + t.totalQuestions, 0)} questões
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjTopics.map(t => (
                        <div
                          key={t.topicId}
                          onClick={() => setSelectedTopicDetail(t)}
                          className="p-3.5 pl-11 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <span>{t.topicName}</span>
                              <span className="text-[10px] text-slate-400">({t.subjectTopicName})</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Última atividade: {t.lastActivity} • Revisão: {t.nextReview}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              t.masteryStatus === 'DOMINADO'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : t.masteryStatus === 'EM DESENVOLVIMENTO'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : t.masteryStatus === 'PRECISA REVISAR'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {t.masteryStatus}
                            </span>

                            <div className="text-right min-w-[70px]">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {t.totalQuestions > 0 ? `${t.accuracyRate}%` : '—'}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {t.totalQuestions} quest.
                              </span>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInitialQuestionFilter({ discipline: t.subjectName, subject: t.topicName });
                                setActiveTab('questions');
                              }}
                            >
                              Treinar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MAPA DE DOMÍNIO (Requirement 8) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'dominio' && (
        <div className="space-y-6">
          <Card className="p-4 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Regras de Classificação Automática:</span>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                <li><strong className="text-emerald-600">DOMINADO:</strong> Mínimo de 5 questões respondidas e taxa de acerto ≥ 75%.</li>
                <li><strong className="text-amber-600">EM DESENVOLVIMENTO:</strong> 1 a 4 questões ou aproveitamento entre 50% e 74%.</li>
                <li><strong className="text-rose-600">PRECISA REVISAR:</strong> Aproveitamento &lt; 50% ou revisão pendente no SRS.</li>
                <li><strong className="text-slate-500">NÃO ESTUDADO:</strong> Nenhuma questão resolvida até o momento.</li>
              </ul>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: Dominado */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">DOMINADO</span>
                <Badge variant="success" size="sm">
                  {hierarchy?.topics.filter(t => t.masteryStatus === 'DOMINADO').length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {hierarchy?.topics.filter(t => t.masteryStatus === 'DOMINADO').map(t => (
                  <Card key={t.topicId} className="p-3 border-l-4 border-l-emerald-500 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{t.topicName}</div>
                    <div className="text-[10px] text-slate-500">{t.subjectName}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-black text-emerald-600">{t.accuracyRate}% acerto</span>
                      <span className="text-slate-400">{t.totalQuestions} quest.</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Column 2: Em Desenvolvimento */}
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300">EM DESENVOLVIMENTO</span>
                <Badge variant="warning" size="sm">
                  {hierarchy?.topics.filter(t => t.masteryStatus === 'EM DESENVOLVIMENTO').length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {hierarchy?.topics.filter(t => t.masteryStatus === 'EM DESENVOLVIMENTO').map(t => (
                  <Card key={t.topicId} className="p-3 border-l-4 border-l-amber-500 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{t.topicName}</div>
                    <div className="text-[10px] text-slate-500">{t.subjectName}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-black text-amber-600">{t.accuracyRate}% acerto</span>
                      <span className="text-slate-400">{t.totalQuestions} quest.</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Column 3: Precisa Revisar */}
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <span className="text-xs font-black text-rose-800 dark:text-rose-300">PRECISA REVISAR</span>
                <Badge variant="danger" size="sm">
                  {hierarchy?.topics.filter(t => t.masteryStatus === 'PRECISA REVISAR').length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {hierarchy?.topics.filter(t => t.masteryStatus === 'PRECISA REVISAR').map(t => (
                  <Card key={t.topicId} className="p-3 border-l-4 border-l-rose-500 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{t.topicName}</div>
                    <div className="text-[10px] text-slate-500">{t.subjectName}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-black text-rose-600">{t.accuracyRate}% acerto</span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setInitialQuestionFilter({ discipline: t.subjectName, subject: t.topicName });
                          setActiveTab('questions');
                        }}
                      >
                        Reforçar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Column 4: Não Estudado */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">NÃO ESTUDADO</span>
                <Badge variant="outline" size="sm">
                  {hierarchy?.topics.filter(t => t.masteryStatus === 'NÃO ESTUDADO').length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {hierarchy?.topics.filter(t => t.masteryStatus === 'NÃO ESTUDADO').map(t => (
                  <Card key={t.topicId} className="p-3 border-l-4 border-l-slate-400 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{t.topicName}</div>
                    <div className="text-[10px] text-slate-500">{t.subjectName}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 italic">0 questões</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInitialQuestionFilter({ discipline: t.subjectName, subject: t.topicName });
                          setActiveTab('questions');
                        }}
                      >
                        Iniciar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MAPA DE CALOR (Heatmap) (Requirement 9) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'heatmap' && (
        <div className="space-y-6">
          <Card className="p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Legenda de Cores do Mapa:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Verde (≥ 75% alto)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Amarelo (50-74% médio)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Vermelho (&lt; 50% baixo)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400" /> Cinza (Sem dados)</div>
            </div>
          </Card>

          <div className="space-y-4">
            {(heatmap?.disciplines || []).map(disc => (
              <Card key={disc.disciplineName} className="p-5">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
                  {disc.disciplineName}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {disc.topics.map(t => {
                    const bgColor =
                      t.color === 'green'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : t.color === 'yellow'
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold'
                        : t.color === 'red'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                    return (
                      <button
                        key={t.topicId}
                        onClick={() => setSelectedTopicDetail(t)}
                        className={`p-3 rounded-xl text-left cursor-pointer transition-transform hover:scale-[1.02] flex flex-col justify-between min-h-[90px] ${bgColor}`}
                      >
                        <span className="text-[11px] font-bold line-clamp-2 leading-tight">
                          {t.topicName}
                        </span>
                        <div className="flex items-center justify-between text-[10px] mt-2 opacity-90">
                          <span>{t.totalQuestions > 0 ? `${t.accuracyRate}%` : 'Sem dados'}</span>
                          <span>{t.totalQuestions} q.</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ANÁLISE POR ASSUNTO & TÓPICO (Requirements 10, 11, 12, 13) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'assuntos-topicos' && (
        <div className="space-y-6">
          {/* 12 & 13: Pontos Fortes e Pontos Fracos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pontos Fortes (Requirement 12) */}
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Seus Pontos Fortes Consolidados
                </h3>
              </div>
              <div className="space-y-2.5">
                {(hierarchy?.strengths || []).map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200">{s.topicName}</div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{s.message}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pontos Fracos / Conteúdos que precisam de atenção (Requirement 13) */}
            <Card className="p-5 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Conteúdos que Precisam de Atenção
                </h3>
              </div>
              <div className="space-y-2.5">
                {(hierarchy?.weaknesses || []).map((w, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 text-xs flex flex-col justify-between gap-2">
                    <div>
                      <div className="font-bold text-rose-900 dark:text-rose-200">{w.subjectName} → {w.topicName}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Aproveitamento: <strong className="text-rose-600">{w.accuracy}%</strong> ({w.wrongCount} erros).
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{w.recommendation}</div>
                    </div>
                    <div className="text-right pt-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setInitialQuestionFilter({ discipline: w.subjectName, subject: w.topicName });
                          setActiveTab('questions');
                        }}
                      >
                        Estudar este conteúdo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Full Topics Table */}
          <Card className="p-6">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Tabela Analítica por Tópico e Subtópico
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-lg">Disciplina & Assunto</th>
                    <th className="p-3">Tópico</th>
                    <th className="p-3 text-center">Questões</th>
                    <th className="p-3 text-center">Acertos</th>
                    <th className="p-3 text-center">Taxa</th>
                    <th className="p-3 text-center">Domínio</th>
                    <th className="p-3 text-right rounded-r-lg">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(hierarchy?.topics || []).map(t => (
                    <tr key={t.topicId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{t.subjectName}</div>
                        <div className="text-[10px] text-slate-400">{t.subjectTopicName}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {t.topicName}
                      </td>
                      <td className="p-3 text-center font-bold">{t.totalQuestions}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{t.correctCount}</td>
                      <td className="p-3 text-center">
                        <span className="font-extrabold text-sm">{t.totalQuestions > 0 ? `${t.accuracyRate}%` : '—'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            t.masteryStatus === 'DOMINADO'
                              ? 'success'
                              : t.masteryStatus === 'EM DESENVOLVIMENTO'
                              ? 'warning'
                              : t.masteryStatus === 'PRECISA REVISAR'
                              ? 'danger'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {t.masteryStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInitialQuestionFilter({ discipline: t.subjectName, subject: t.topicName });
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ANÁLISE DE ERROS (Requirements 14 & 15) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'erros' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-rose-500">
              <span className="text-xs text-slate-500 block">Total de Questões Erradas</span>
              <span className="text-2xl font-black text-rose-600">{errorsData?.totalErrors || 0}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Registradas nas resoluções</span>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500">
              <span className="text-xs text-slate-500 block">Disciplina com Mais Erros</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {errorsData?.errorSubjects[0]?.name || 'Nenhuma'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {errorsData?.errorSubjects[0]?.errorCount || 0} erros registrados
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs text-slate-500 block">Tópico Crítico com Mais Erros</span>
              <span className="text-lg font-black text-slate-900 dark:text-white truncate block">
                {errorsData?.errorTopics[0]?.topicName || 'Nenhum'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {errorsData?.errorTopics[0]?.errorCount || 0} erros registrados
              </span>
            </Card>
          </div>

          {/* Categories distribution */}
          <Card className="p-5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Classificação Cognitiva dos Erros (Autoavaliação e Hipótese IA)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(errorsData?.categoryDistribution || []).map(cat => (
                <div key={cat.category} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    {cat.category.replace('_', ' ')}
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Wrong Questions List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Histórico de Questões Erradas com Classificação
              </h4>
              <Badge variant="outline" size="sm">
                {errorsData?.wrongQuestions.length || 0} questões listadas
              </Badge>
            </div>

            <div className="space-y-3">
              {(errorsData?.wrongQuestions || []).map(q => (
                <div
                  key={q.attemptId}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors bg-white dark:bg-slate-900 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="sm">
                        {q.code}
                      </Badge>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{q.discipline}</span>
                      <span className="text-slate-400">• {q.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{q.answeredAt}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setClassificationModal({
                            attemptId: q.attemptId,
                            questionId: q.questionId,
                            code: q.code,
                            statement: q.statement
                          })
                        }
                      >
                        Classificar Erro
                      </Button>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {q.statement}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-3">
                      <span>Sua resposta: <strong className="text-rose-600">({q.selectedOption})</strong></span>
                      <span>Gabarito correto: <strong className="text-emerald-600">({q.correctOption})</strong></span>
                      <span>Tempo: {q.timeSpentSeconds}s</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        Categoria: {q.manualCategory}
                      </span>
                      {q.aiHypothesis && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-medium">
                          Hipótese IA: {q.aiHypothesis}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ANÁLISE DE TEMPO & PRODUTIVIDADE (Requirements 16 & 17) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'tempo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Horas Totais</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {timeData?.indicators.totalStudyHours || 0}h
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Tempo de estudo medido</span>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Tempo Médio / Questão</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {timeData?.indicators.avgTimePerQuestionSeconds || 60}s
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Ideal: 90s a 150s</span>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Questões por Hora</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {timeData?.indicators.questionsPerHour || 30}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Ritmo de resolução</span>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Horas por Semana</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {timeData?.indicators.hoursPerWeek || 0}h
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Média semanal</span>
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Tempo de Estudo e Resolução por Disciplina
            </h4>

            <div className="space-y-3">
              {(timeData?.disciplineTimes || []).map(dt => (
                <div key={dt.discipline} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">{dt.discipline}</span>
                    <span className="text-slate-400 text-[11px]">
                      {dt.questionsCount} questões resolvidas • Tempo médio: {dt.avgSeconds}s / questão
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{dt.totalHours}h</span>
                    <span className="text-[10px] text-slate-400 block">Tempo total dedicado</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. ANÁLISE DE SIMULADOS & COMPARATIVO (Requirements 18 & 19) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'simulados' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Total de Simulados</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{simulationsData?.count || 0}</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Média Geral</span>
              <span className="text-2xl font-black text-indigo-600">{simulationsData?.avgScore || 0}%</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Melhor Resultado</span>
              <span className="text-2xl font-black text-emerald-600">{simulationsData?.bestScore || 0}%</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400 block mb-1">Último Simulado</span>
              <span className="text-2xl font-black text-violet-600">{simulationsData?.latestScore || 0}%</span>
            </Card>
          </div>

          {/* Side by side comparison (Requirement 19) */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Comparação Lado a Lado entre Simulados
                </h4>
                <p className="text-xs text-slate-500">Selecione simulados para avaliar a evolução percentual e o tempo de execução.</p>
              </div>

              <div className="text-xs text-slate-500">
                Selecione os checkboxes na lista abaixo
              </div>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {(simulationsData?.simulations || [])
                .filter(s => selectedSimIds.includes(s.id))
                .map(s => (
                  <Card key={s.id} className="p-4 border-2 border-indigo-500/40 bg-indigo-50/20 dark:bg-indigo-950/20 text-xs space-y-2">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">{s.title}</div>
                    <div className="text-slate-400 text-[11px]">{s.date}</div>
                    <div className="text-2xl font-black text-emerald-600 pt-1">{s.score}%</div>
                    <div className="space-y-1 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between"><span>Acertos:</span><strong>{s.totalCorrect} de {s.totalQuestions}</strong></div>
                      <div className="flex justify-between"><span>Erros:</span><strong className="text-rose-500">{s.totalWrong}</strong></div>
                      <div className="flex justify-between"><span>Tempo Total:</span><strong>{s.timeSpentMinutes} min</strong></div>
                    </div>
                  </Card>
                ))}
            </div>

            {/* List with Checkbox */}
            <h5 className="font-semibold text-xs text-slate-400 mb-2 uppercase">Todos os simulados concluídos:</h5>
            <div className="space-y-2">
              {(simulationsData?.simulations || []).map(s => {
                const isSelected = selectedSimIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSimIds(selectedSimIds.filter(id => id !== s.id));
                      } else {
                        setSelectedSimIds([...selectedSimIds, s.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 cursor-pointer"
                      />
                      <span className="font-bold text-slate-900 dark:text-white">{s.title}</span>
                      <span className="text-slate-400 text-[11px]">({s.date})</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-sm text-emerald-600">{s.score}%</span>
                      <span className="text-slate-400">{s.timeSpentMinutes} min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. DESEMPENHO POR BANCA (Requirement 20) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'bancas' && (
        <div className="space-y-6">
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            <strong>Critério Estatístico de Validade:</strong> Não é recomendável concluir que o aluno está preparado para uma banca específica com base em poucas questões (&lt; 15 questões resolvidas).
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boardsData.map(b => (
              <Card key={b.boardId} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-slate-900 dark:text-white">{b.sigla}</h4>
                  <Badge variant={b.isReliableSample ? 'success' : 'warning'} size="sm">
                    {b.isReliableSample ? 'Amostra Válida' : 'Amostra Inicial'}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{b.accuracy}%</span>
                  <span className="text-xs text-slate-400">{b.questions} questões respondidas</span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>Acertos:</span>
                    <strong>{b.correct} de {b.questions}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo médio / questão:</span>
                    <strong>{b.avgTimeSeconds}s</strong>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setInitialQuestionFilter({ board: b.sigla });
                    setActiveTab('questions');
                  }}
                >
                  Resolver Questões da {b.sigla}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Topic Detail Drawer Modal */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">
                Detalhes do Tópico
              </Badge>
              <button
                onClick={() => setSelectedTopicDetail(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {selectedTopicDetail.topicName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Disciplina: {selectedTopicDetail.subjectName || 'Geral'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Questões Resolvidas</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedTopicDetail.totalQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Taxa de Acerto</span>
                <span className="text-lg font-bold text-emerald-600">{selectedTopicDetail.accuracyRate}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Acertos / Erros</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedTopicDetail.correctCount} acertos / {selectedTopicDetail.wrongCount} erros
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Tempo Médio</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedTopicDetail.avgTimeSeconds || 60}s
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <div>Última atividade: <strong>{selectedTopicDetail.lastActivity || 'Sem registro'}</strong></div>
              <div>Próxima revisão no SRS: <strong>{selectedTopicDetail.nextReview || 'Nenhuma agendada'}</strong></div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedTopicDetail(null)}
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setInitialQuestionFilter({
                    discipline: selectedTopicDetail.subjectName,
                    subject: selectedTopicDetail.topicName
                  });
                  setSelectedTopicDetail(null);
                  setActiveTab('questions');
                }}
              >
                Praticar Questões
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Mistake Classification Modal (Requirement 15) */}
      {classificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="danger" size="sm">
                Classificar Causa do Erro
              </Badge>
              <button
                onClick={() => setClassificationModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 block">{classificationModal.code}</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mt-1">
                {classificationModal.statement}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Selecione o motivo principal do seu erro:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'falta_conhecimento', label: 'Falta de conhecimento' },
                  { id: 'interpretacao', label: 'Interpretação do texto' },
                  { id: 'desatencao', label: 'Desatenção / Pegadinha' },
                  { id: 'calculo', label: 'Erro de cálculo' },
                  { id: 'confusao_conceitos', label: 'Confusão entre conceitos' },
                  { id: 'tempo', label: 'Falta de tempo' },
                  { id: 'chute', label: 'Chute' },
                  { id: 'outro', label: 'Outro motivo' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Anotação pessoal (opcional):
              </label>
              <textarea
                value={categoryNotes}
                onChange={e => setCategoryNotes(e.target.value)}
                rows={2}
                placeholder="Ex.: Não percebi a palavra 'EXCETO' no enunciado..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setClassificationModal(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleSaveClassification}
              >
                Salvar Classificação
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
