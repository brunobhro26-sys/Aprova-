import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/apiService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  CheckCircle2,
  XCircle,
  Star,
  Bookmark,
  StickyNote,
  RotateCcw,
  Flag,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ListOrdered,
  BookOpen,
  Trash2,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

interface SingleQuestionViewProps {
  questionId: string;
  onBackToList: () => void;
  onNavigateQuestion?: (nextId: string) => void;
  allQuestionIds?: string[];
}

export const SingleQuestionView: React.FC<SingleQuestionViewProps> = ({
  questionId,
  onBackToList,
  onNavigateQuestion,
  allQuestionIds = []
}) => {
  const { user, showToast, refreshData } = useApp();

  const [question, setQuestion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOptionLetter, setCorrectOptionLetter] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // Time spent tracker
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Mobile font size zoom state (Prompt 8)
  const [mobileTextZoom, setMobileTextZoom] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // States for Modals and Tabs
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMarkedForReview, setIsMarkedForReview] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Notes state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Notebooks state
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [userNotebooks, setUserNotebooks] = useState<any[]>([]);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');

  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Gabarito incorreto ou desatualizado');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Load question data
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function load() {
      try {
        setLoading(true);
        const data = await ApiService.getQuestionById(questionId);
        setQuestion(data);

        // Check if there was already an explanation if answered before
        // Reset local selection for answering session
        setSelectedOption(null);
        setHasAnswered(false);
        setIsCorrect(null);
        setCorrectOptionLetter(null);
        setExplanation(data.explanation || null);
        setReference(data.bibliographicReference || null);
        setTimeSpentSeconds(0);

        // Load reviews status
        try {
          const reviews = await ApiService.getReviewQuestions();
          const found = reviews.find((r) => r.id === questionId || r.questionId === questionId);
          setIsMarkedForReview(Boolean(found));
        } catch (e) {
          // ignore
        }

        // Load favorites status
        try {
          const favs = await ApiService.getFavorites();
          const foundFav = favs.find((f) => f.itemId === questionId && f.itemType === 'question');
          setIsFavorite(Boolean(foundFav));
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Failed to load question:', err);
        showToast('Erro ao carregar questão', 'Não foi possível carregar os detalhes.', 'error');
      } finally {
        setLoading(false);
      }
    }

    load();

    // Start timer for this question
    timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [questionId]);

  // Load notes
  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await ApiService.getQuestionNotes(questionId);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpenNotes = () => {
    setNotesModalOpen(true);
    loadNotes();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      const added = await ApiService.addQuestionNote(questionId, newNoteText.trim());
      setNotes([added, ...notes]);
      setNewNoteText('');
      showToast('Anotação salva', 'Sua anotação pessoal foi registrada com sucesso.', 'success');
    } catch (e) {
      showToast('Erro ao salvar anotação', 'Tente novamente.', 'error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await ApiService.deleteQuestionNote(questionId, noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      showToast('Anotação removida', undefined, 'info');
    } catch (e) {
      showToast('Erro ao excluir anotação', undefined, 'error');
    }
  };

  // Notebooks
  const handleOpenNotebookModal = async () => {
    setNotebookModalOpen(true);
    try {
      const nbs = await ApiService.getNotebooks();
      setUserNotebooks(nbs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToNotebook = async (notebookId: string) => {
    try {
      await ApiService.addQuestionToNotebook(notebookId, questionId);
      setNotebookModalOpen(false);
      showToast('Adicionada ao caderno!', 'Questão incluída com sucesso.', 'success');
      refreshData();
    } catch (e: any) {
      showToast('Erro ao adicionar', e.message || 'Já está no caderno', 'warning');
    }
  };

  const handleCreateAndAddToNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    try {
      const created = await ApiService.createNotebook(newNotebookTitle.trim(), 'Caderno temático de estudo');
      await ApiService.addQuestionToNotebook(created.id, questionId);
      setNotebookModalOpen(false);
      setNewNotebookTitle('');
      showToast('Caderno criado!', 'Questão adicionada ao novo caderno.', 'success');
      refreshData();
    } catch (e) {
      showToast('Erro ao criar caderno', 'Tente novamente.', 'error');
    }
  };

  // Review toggle
  const handleToggleReview = async () => {
    try {
      const res = await ApiService.toggleQuestionReview(questionId, !isMarkedForReview);
      setIsMarkedForReview(res.isMarked);
      showToast(
        res.isMarked ? 'Marcada para Revisão' : 'Desmarcada de Revisão',
        res.isMarked ? 'A questão aparecerá no seu plano de repetição espaçada.' : undefined,
        'info'
      );
    } catch (e) {
      showToast('Erro ao atualizar revisão', undefined, 'error');
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const res = await ApiService.toggleFavorite('question', questionId);
      setIsFavorite(res.status === 'added');
      showToast(
        res.status === 'added' ? 'Questão favoritada!' : 'Removida dos favoritos',
        undefined,
        'info'
      );
    } catch (e) {
      showToast('Erro ao favoritar', undefined, 'error');
    }
  };

  // Submit Answer
  const handleAnswer = async () => {
    if (!selectedOption || hasAnswered) return;

    try {
      const result = await ApiService.submitAttempt(questionId, selectedOption, timeSpentSeconds);
      setHasAnswered(true);
      setIsCorrect(result.isCorrect);
      setCorrectOptionLetter(result.correctOptionLetter);
      setExplanation(result.explanation);
      setReference(result.bibliographicReference || null);

      if (result.isCorrect) {
        showToast('Você acertou!', 'Excelente raciocínio técnico. Resposta registrada no seu histórico.', 'success');
      } else {
        showToast('Você errou.', `Sua resposta foi (${selectedOption}), o gabarito oficial é (${result.correctOptionLetter}).`, 'warning');
      }
      refreshData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao registrar resposta', 'Verifique sua conexão e tente novamente.', 'error');
    }
  };

  // Refazer questão
  const handleRefoQuestion = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(null);
    setShowStepByStep(false);
    setTimeSpentSeconds(0);
    showToast('Questão reiniciada', 'Você pode escolher uma nova alternativa agora.', 'info');
  };

  // Report issue
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingReport(true);
      await ApiService.reportQuestion(questionId, reportReason, reportDescription);
      setReportModalOpen(false);
      setReportDescription('');
      showToast('Reporte enviado com sucesso!', 'Nossa equipe pedagógica analisará a questão.', 'success');
    } catch (e) {
      showToast('Erro ao enviar reporte', 'Tente novamente mais tarde.', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Next / Previous navigation
  const currentIndex = allQuestionIds.indexOf(questionId);
  const prevId = currentIndex > 0 ? allQuestionIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < allQuestionIds.length - 1 ? allQuestionIds[currentIndex + 1] : null;

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Carregando questão com dados oficiais...</p>
      </div>
    );
  }

  // Format step-by-step resolution dynamically for calculation/technical questions
  const hasStepByStep =
    question.subjectId === 'sub-eletrotecnica' ||
    question.subjectId === 'sub-matematica' ||
    (question.explanation && question.explanation.length > 50);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 lg:pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToList}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar para o Banco</span>
            <span className="sm:hidden">Voltar</span>
          </Button>

          {/* Prompt 8: Mobile Text Zoom Control */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobileTextZoom('normal')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mobileTextZoom === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Tamanho padrão de fonte"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setMobileTextZoom('large')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mobileTextZoom === 'large'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Texto ampliado"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setMobileTextZoom('xlarge')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mobileTextZoom === 'xlarge'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Texto extra grande"
            >
              A++
            </button>
          </div>
        </div>

        {allQuestionIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {currentIndex + 1} de {allQuestionIds.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!prevId}
              onClick={() => prevId && onNavigateQuestion?.(prevId)}
              title="Questão anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextId}
              onClick={() => nextId && onNavigateQuestion?.(nextId)}
              title="Próxima questão"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Question Card */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        {/* 8. Cabeçalho Estruturado */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                {question.code || `Q-${question.id}`}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                {question.board?.name || 'CESGRANRIO'} • {question.year || 2024}
              </span>
              <Badge
                variant={
                  question.difficulty === 'Fácil'
                    ? 'success'
                    : question.difficulty === 'Difícil'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
              >
                {question.difficulty || 'Médio'}
              </Badge>
              <Badge variant="outline" size="sm">
                {question.type || 'Múltipla Escolha'}
              </Badge>
            </div>

            {/* Quick Actions (Favoritar, Caderno, Anotações, Revisão) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={handleOpenNotebookModal}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Adicionar ao Caderno"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenNotes}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Minhas Anotações"
              >
                <StickyNote className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleReview}
                className={`p-2 rounded-lg transition-colors ${
                  isMarkedForReview
                    ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 font-bold'
                    : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isMarkedForReview ? 'Marcada para Revisão' : 'Marcar para Revisão'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Reportar Erro"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hierarquia Taxonômica Rigorosa */}
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {question.exam?.name || question.organization?.name || 'Transpetro'} —{' '}
              {question.position?.name || 'Técnico em Eletrotécnica'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center flex-wrap gap-1">
              <span>{question.subject?.name || 'Eletrotécnica'}</span>
              <span>→</span>
              <span>{question.subjectTopic?.name || 'Circuitos Elétricos'}</span>
              <span>→</span>
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {question.topic?.name || 'Associação de Resistores'}
              </span>
            </div>
          </div>
        </div>

        {/* 9. Enunciado com Alta Legibilidade */}
        <div className="p-5 md:p-8 space-y-6">
          <div
            className={`leading-relaxed text-slate-800 dark:text-slate-100 font-normal transition-all ${
              mobileTextZoom === 'xlarge'
                ? 'text-lg md:text-2xl'
                : mobileTextZoom === 'large'
                ? 'text-base md:text-xl'
                : 'text-sm md:text-lg'
            }`}
          >
            {question.statement}
          </div>

          {/* Imagem Técnica / Diagrama se houver */}
          {question.imageUrl && (
            <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-center">
              <img
                src={question.imageUrl}
                alt="Diagrama técnico da questão"
                className="max-h-80 rounded object-contain shadow-xs"
              />
            </div>
          )}

          {/* 10. Alternativas A, B, C, D, E */}
          <div className="space-y-3 pt-2">
            {(question.alternatives || []).map((alt: any) => {
              const letter = alt.letter;
              const isSelected = selectedOption === letter;
              const isTheCorrectOne = hasAnswered && alt.isCorrect;
              const isTheWrongSelected = hasAnswered && isSelected && !alt.isCorrect;

              let cardStyle =
                'border-slate-200 dark:border-slate-700 hover:border-primary-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

              if (isSelected && !hasAnswered) {
                cardStyle =
                  'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/30';
              } else if (hasAnswered) {
                if (isTheCorrectOne) {
                  cardStyle =
                    'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/40';
                } else if (isTheWrongSelected) {
                  cardStyle =
                    'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/40';
                } else {
                  cardStyle =
                    'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400';
                }
              }

              return (
                <div
                  key={alt.id || letter}
                  onClick={() => {
                    if (!hasAnswered) setSelectedOption(letter);
                  }}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    !hasAnswered ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'
                  } ${cardStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected && !hasAnswered
                        ? 'bg-primary-600 text-white'
                        : isTheCorrectOne
                        ? 'bg-emerald-600 text-white'
                        : isTheWrongSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="flex-1 pt-1 text-sm md:text-base leading-relaxed">
                    {alt.text}
                  </div>

                  {/* Visual indicator after answering */}
                  {hasAnswered && (
                    <div className="shrink-0 pt-1">
                      {isTheCorrectOne && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {isTheWrongSelected && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 11. Botão RESPONDER (Gabarito nunca é mostrado antes de responder) */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            {!hasAnswered ? (
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedOption}
                onClick={handleAnswer}
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md"
              >
                RESPONDER
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleRefoQuestion}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer Questão
                </Button>

                {hasStepByStep && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowStepByStep(!showStepByStep)}
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  >
                    <ListOrdered className="w-4 h-4" />
                    {showStepByStep ? 'Ocultar Passo a Passo' : 'Resolução Passo a Passo'}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
                >
                  <BarChart2 className="w-4 h-4" />
                  Estatísticas
                </Button>
              </div>
            )}

            {/* Quick status feedback banner */}
            {hasAnswered && (
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Você acertou!</strong> Parabéns pelo domínio técnico.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>
                      <strong>Você errou.</strong> Sua resposta: <strong>({selectedOption})</strong> | Gabarito oficial:{' '}
                      <strong>({correctOptionLetter})</strong>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 13. Explicação Detalhada (Aparece após responder) */}
          {hasAnswered && (
            <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              {/* Comentário do Professor / Gabarito Comentado */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold">
                    <BookOpen className="w-5 h-5" />
                    <span>Gabarito Comentado & Fundamentação Teórica</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Alternativa Correta: ({correctOptionLetter})
                  </span>
                </div>

                <div className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                  {explanation || 'Explicação detalhada registrada pelos professores da plataforma.'}
                </div>

                {reference && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Info className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>
                      <strong>Referência Bibliográfica / Norma:</strong> {reference}
                    </span>
                  </div>
                )}
              </div>

              {/* 15. Resolução Passo a Passo */}
              {showStepByStep && (
                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
                    <ListOrdered className="w-5 h-5 text-indigo-600" />
                    <span>Resolução Passo a Passo para Engenharia e Exatas</span>
                  </div>

                  <div className="space-y-3 text-sm text-indigo-950 dark:text-indigo-100">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        Passo 1 — Identificar os dados do enunciado:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        Extrair os parâmetros nominais de tensão, corrente, potência, resistências ou regras gramaticais envolvidas na questão.
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        Passo 2 — Aplicar a fórmula / norma regulamentadora:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        Utilizar a lei ou fórmula correspondente (ex: Leis de Ohm, Kirchhoff, Fator de Potência, Regência Verbal ou NBR 5410).
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        Passo 3 — Substituição numérica e cálculo algébrico:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        {explanation}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                        Resultado Final Conclusivo:
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-100 font-semibold">
                        Gabarito definitivo confirmado na Alternativa ({correctOptionLetter}).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estatísticas da Questão */}
              {showStats && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                    <BarChart2 className="w-4 h-4 text-primary-600" />
                    <span>Métricas da Comunidade Concurseira</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 block">Taxa de Acerto Geral</span>
                      <span className="text-lg font-bold text-emerald-600">68%</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 block">Dificuldade Percebida</span>
                      <span className="text-lg font-bold text-amber-600">{question.difficulty}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                      <span className="text-xs text-slate-500 block">Tempo Médio de Resolução</span>
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-300">1m 45s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Prompt 8 Requirement 5: Barra Flutuante Fixa Inferior para Mobile */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 px-4 flex items-center justify-between gap-2 shadow-2xl">
        <Button
          variant="outline"
          size="sm"
          disabled={!prevId}
          onClick={() => prevId && onNavigateQuestion?.(prevId)}
          className="text-xs px-3 py-2.5 font-semibold shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          Anterior
        </Button>

        {!hasAnswered ? (
          <Button
            variant="primary"
            size="md"
            disabled={!selectedOption}
            onClick={handleAnswer}
            className="flex-1 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-transform cursor-pointer"
          >
            RESPONDER
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefoQuestion}
            className="flex-1 font-bold text-xs py-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Refazer
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={!nextId}
          onClick={() => nextId && onNavigateQuestion?.(nextId)}
          className="text-xs px-3 py-2.5 font-semibold shrink-0 cursor-pointer"
        >
          Próxima
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>

      {/* MODAL 1: Minhas Anotações */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title="Minhas Anotações Pessoais nesta Questão"
      >
        <div className="space-y-4">
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Digite seus macetes, mnemônicos, pegadinhas da Cesgranrio ou alertas desta questão..."
              rows={3}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Salvar Anotação
              </Button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Anotações Registradas ({notes.length})
            </h4>

            {loadingNotes ? (
              <p className="text-xs text-slate-400">Carregando anotações...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Você ainda não fez anotações nesta questão.
              </p>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-sm"
                >
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{n.content}</p>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Adicionar ao Caderno */}
      <Modal
        isOpen={notebookModalOpen}
        onClose={() => setNotebookModalOpen(false)}
        title="Adicionar Questão a um Caderno"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selecione um Caderno Existente
            </label>
            {userNotebooks.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">Você ainda não possui cadernos criados.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {userNotebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => handleAddToNotebook(nb.id)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all flex items-center justify-between"
                  >
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                      {nb.title}
                    </span>
                    <span className="text-xs text-slate-400">Clique para adicionar</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleCreateAndAddToNotebook} className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Ou crie um Novo Caderno Agora
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                placeholder="Ex: Circuitos Elétricos - Cesgranrio Difíceis"
                className="flex-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
              />
              <Button type="submit" variant="primary" size="sm">
                Criar e Salvar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL 3: Reportar Erro na Questão */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Reportar Erro ou Inconsistência na Questão"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Motivo do Reporte
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="Gabarito incorreto ou desatualizado">Gabarito incorreto ou desatualizado</option>
              <option value="Erro no enunciado ou texto incompleto">Erro no enunciado ou texto incompleto</option>
              <option value="Alternativas duplicadas ou com erro de digitação">Alternativas duplicadas ou com erro de digitação</option>
              <option value="Classificação incorreta (Disciplina/Assunto/Banca)">Classificação incorreta (Disciplina/Assunto/Banca)</option>
              <option value="Problema na imagem ou fórmula matemática">Problema na imagem ou fórmula matemática</option>
              <option value="Outro problema técnico">Outro problema técnico</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Detalhes Adicionais (opcional)
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Descreva o que está divergente para ajudar a equipe na correção..."
              rows={3}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReportModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmittingReport}>
              {isSubmittingReport ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
