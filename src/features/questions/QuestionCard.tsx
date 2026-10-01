import React, { useState, useEffect } from 'react';
import { Question, QuestionOption, QuestionComment, Notebook } from '../../types';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { ApiService } from '../../services/apiService';
import { AIService } from '../../services/aiService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  CheckCircle2,
  XCircle,
  Star,
  AlertOctagon,
  MessageSquare,
  Flag,
  Share2,
  ThumbsUp,
  Send,
  HelpCircle,
  Sparkles,
  BarChart2,
  ChevronDown,
  ChevronUp,
  BookMarked,
  BookOpen,
  Plus,
  Bot
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  indexNumber?: number;
  onAnswerRecorded?: (isCorrect: boolean) => void;
  simulationMode?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  indexNumber,
  onAnswerRecorded,
  simulationMode = false
}) => {
  const { user, showToast, refreshData } = useApp();

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Notebook and AI States
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [userNotebooks, setUserNotebooks] = useState<Notebook[]>([]);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  // Load existing answers & favorite status
  useEffect(() => {
    setIsFavorite(DBService.isQuestionFavorite(user.id, question.id));
    setComments(DBService.getCommentsForQuestion(question.id));

    // Check if user has answered this before (if not in simulation mode)
    if (!simulationMode) {
      const userAnswers = DBService.getAnswersForUser(user.id);
      const prevAnswer = userAnswers.find((a) => a.questionId === question.id);
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selectedOption);
        setHasAnswered(true);
        setIsCorrect(prevAnswer.isCorrect);
        setShowExplanation(true);
      } else {
        setSelectedOption(null);
        setHasAnswered(false);
      }
    }
  }, [question.id, user.id, simulationMode]);

  // Keyboard navigation shortcuts: A-E or 1-5, Enter to respond
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in comment textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (!hasAnswered) {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          setSelectedOption(key as 'A' | 'B' | 'C' | 'D' | 'E');
        } else if (['1', '2', '3', '4', '5'].includes(key)) {
          const map: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
            '1': 'A',
            '2': 'B',
            '3': 'C',
            '4': 'D',
            '5': 'E'
          };
          setSelectedOption(map[key]);
        } else if (e.key === 'Enter' && selectedOption) {
          handleAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, selectedOption]);

  const handleAnswer = async () => {
    if (!selectedOption || hasAnswered) return;

    // Call real backend database API
    try {
      const apiResult = await ApiService.submitAttempt(question.id, selectedOption);
      setIsCorrect(apiResult.isCorrect);
    } catch (e) {
      console.warn('Backend attempt recorded via local fallback', e);
    }

    const result = DBService.recordAnswer(user.id, question.id, selectedOption);
    setHasAnswered(true);
    setIsCorrect(result.isCorrect);
    setShowExplanation(true);

    if (result.isCorrect) {
      showToast(
        'Resposta Correta! (+10 XP)',
        result.levelUp ? 'Parabéns, você subiu de nível!' : 'Ótimo raciocínio técnico!',
        'success'
      );
    } else {
      showToast(
        'Resposta Incorreta (+2 XP)',
        'A questão foi adicionada automaticamente ao seu Caderno de Erros para revisão.',
        'warning'
      );
    }

    if (onAnswerRecorded) {
      onAnswerRecorded(result.isCorrect);
    }
    refreshData();
  };

  const handleToggleFavorite = () => {
    const newStatus = DBService.toggleFavorite(user.id, question.id);
    setIsFavorite(newStatus);
    showToast(
      newStatus ? 'Questão Favoritada' : 'Removida dos Favoritos',
      newStatus ? 'Você pode acessá-la na aba Meus Favoritos.' : undefined,
      'info'
    );
  };

  const handleAddToMistakes = () => {
    // Manually force to mistakes if student wants extra focus
    DBService.recordAnswer(user.id, question.id, selectedOption || 'A');
    showToast('Adicionada ao Caderno de Erros', 'Questão marcada para revisão prioritária.', 'info');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const created = DBService.addComment(question.id, newCommentText.trim(), user);
    setComments((prev) => [created, ...prev]);
    setNewCommentText('');
    showToast('Comentário publicado!', 'Obrigado por contribuir com a comunidade.', 'success');
  };

  const handleLikeComment = (commentId: string) => {
    DBService.likeComment(question.id, commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportModalOpen(false);
    setReportReason('');
    showToast('Questão reportada', 'Nossa equipe pedagógica analisará o apontamento.', 'info');
  };

  return (
    <Card className="p-5 sm:p-7 space-y-5 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* 1. Header Metadados (Prompt 34: Disciplina | Assunto | Banca | Ano | Concurso) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          <Badge variant="primary" size="sm">
            {question.code}
          </Badge>
          <span className="text-slate-900 dark:text-white font-bold">{question.discipline}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-700 dark:text-slate-300">{question.topic}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500">{question.board}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500">{question.year}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500">{question.contest}</span>
        </div>

        <div className="flex items-center gap-2">
          {question.isDemonstrative && (
            <Badge variant="outline" size="sm" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800">
              Questão Demonstrativa
            </Badge>
          )}
          <Badge
            variant={
              question.difficulty === 'Fácil'
                ? 'success'
                : question.difficulty === 'Médio'
                ? 'primary'
                : 'danger'
            }
            size="sm"
          >
            {question.difficulty}
          </Badge>
        </div>
      </div>

      {/* 2. Enunciado da questão */}
      <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
        {indexNumber !== undefined && (
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 mr-2">
            #{indexNumber}.
          </span>
        )}
        {question.statement}
      </div>

      {/* Optional image if present */}
      {question.imageUrl && (
        <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
          <img src={question.imageUrl} alt="Ilustração da questão" className="w-full object-cover" />
        </div>
      )}

      {/* 3. Alternativas (A, B, C, D, E) */}
      <div className="space-y-2.5 pt-1">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          const isCorrectOption = question.correctOptionLetter === opt.letter;

          // Feedback styling after answering
          let optionStyle =
            'border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200';

          if (hasAnswered) {
            if (isCorrectOption) {
              optionStyle =
                'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20';
            } else if (isSelected && !isCorrectOption) {
              optionStyle =
                'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20';
            } else {
              optionStyle = 'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900';
            }
          } else if (isSelected) {
            optionStyle =
              'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30';
          }

          return (
            <div
              key={opt.id}
              onClick={() => {
                if (!hasAnswered) setSelectedOption(opt.letter);
              }}
              className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs transition-colors ${
                  hasAnswered && isCorrectOption
                    ? 'bg-emerald-500 text-white'
                    : hasAnswered && isSelected && !isCorrectOption
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.letter}
              </div>

              <div className="flex-1 pt-0.5 leading-snug">
                <span>{opt.text}</span>
              </div>

              {/* Community choice percentage once answered */}
              {hasAnswered && opt.percentageChosen !== undefined && (
                <div className="shrink-0 text-right text-[11px] font-bold text-slate-400 pl-2">
                  <span>{opt.percentageChosen}% dos alunos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Action bar: Responder + Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {!hasAnswered ? (
            <Button
              variant="primary"
              size="md"
              disabled={!selectedOption}
              onClick={handleAnswer}
              className="font-bold px-6 shadow-sm shadow-indigo-600/30"
            >
              Responder
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs ${
                  isCorrect
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VOCÊ ACERTOU!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>VOCÊ ERROU</span>
                  </>
                )}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Gabarito: <strong className="text-slate-900 dark:text-white">{question.correctOptionLetter}</strong>
              </span>
            </div>
          )}

          {/* Quick keyboard instruction tip */}
          {!hasAnswered && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 pl-2">
              (Dica: pressione teclas <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">A-E</kbd> e <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">Enter</kbd>)
            </span>
          )}
        </div>

        {/* Question interactive tools */}
        <div className="flex items-center gap-1 text-slate-500">
          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            title={isFavorite ? 'Remover dos favoritos' : 'Salvar como favorita'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Caderno de erros */}
          <button
            onClick={handleAddToMistakes}
            title="Adicionar ao Caderno de Erros"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </button>

          {/* Adicionar a Caderno Personalizado */}
          <button
            onClick={() => {
              setUserNotebooks(DBService.getNotebooks(user.id));
              setNotebookModalOpen(true);
            }}
            title="Adicionar a um Caderno"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Comments count */}
          <button
            onClick={() => setShowComments(!showComments)}
            title="Comentários dos usuários"
            className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>

          {/* Report */}
          <button
            onClick={() => setReportModalOpen(true)}
            title="Reportar erro na questão"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Comentário do Professor & Estatísticas após resposta (Item 34) */}
      {hasAnswered && (
        <div className="space-y-4 pt-3 animate-in fade-in duration-300">
          {/* Comentário do Professor Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  Comentário do Professor APROVA+
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Gabarito Oficial: {question.correctOptionLetter}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {question.explanation}
            </p>

            {/* Statistics pill (Item 9 & 34) */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs text-indigo-900 dark:text-indigo-300 font-semibold border-t border-indigo-200/50 dark:border-indigo-800/50">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>
                  <strong>{question.correctPercentage}%</strong> dos concurseiros acertaram esta questão.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setIsAiLoading(true);
                    const res = await AIService.explainQuestion(question);
                    setAiAnalysisText(res);
                    setIsAiLoading(false);
                  }}
                  className="flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  {isAiLoading ? 'Analisando...' : 'Explicar com IA'}
                </button>

                {!isCorrect && selectedOption && (
                  <button
                    onClick={async () => {
                      setIsAiLoading(true);
                      const res = await AIService.analyzeMistake(question, selectedOption);
                      setAiAnalysisText(res);
                      setIsAiLoading(false);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 shadow-xs"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    Por que errei? (IA)
                  </button>
                )}

                <button
                  onClick={() => setShowTheory(!showTheory)}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {showTheory ? 'Ocultar Teoria' : 'Teoria Relacionada'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Output Card */}
          {aiAnalysisText && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/30 shadow-lg space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 font-black text-indigo-400">
                  <Bot className="w-4 h-4" />
                  APROVA+ AI Assistant
                </span>
                <button
                  onClick={() => setAiAnalysisText(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fechar
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-slate-200">
                {aiAnalysisText}
              </div>
            </div>
          )}

          {/* Teoria Relacionada (Prompt Master 13) */}
          {showTheory && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
              <span className="font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Fundamentos Teóricos: {question.topic} ({question.discipline})
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {question.theorySummary ||
                  `O tópico "${question.topic}" integra o edital básico e específico de concursos públicos federais. É imprescindível dominar os teoremas constitutivos, convenções de sinais e metodologia de resolução rápida para economizar tempo na prova da banca ${question.board}.`}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tags:</span>
            {question.tags.map((tag, tIdx) => (
              <Badge key={tIdx} variant="outline" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 6. Seção de Comentários da Comunidade (Item 10) */}
      {showComments && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comentários dos Alunos e Professores ({comments.length})</span>
            </h4>
          </div>

          {/* New comment form */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Escreva seu macete ou dúvida sobre esta questão..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Publicar
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
            {comments.map((comm) => (
              <div
                key={comm.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {comm.userName}
                    </span>
                    {comm.isOfficial ? (
                      <Badge variant="success" size="sm">
                        Professor Oficial
                      </Badge>
                    ) : (
                      comm.userBadge && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {comm.userBadge}
                        </span>
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {comm.content}
                </p>

                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleLikeComment(comm.id)}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comm.likes} curtidas</span>
                  </button>
                  <span className="cursor-pointer hover:underline">Responder</span>
                  <span className="cursor-pointer hover:text-rose-500">Denunciar</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs space-y-3">
          <h5 className="font-bold text-rose-800 dark:text-rose-300">
            Reportar inconsistência na questão {question.code}
          </h5>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Descreva o problema encontrado (ex: erro no enunciado, divergência de gabarito, formatação incorreta)..."
            rows={2}
            className="w-full p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReport}
            >
              Enviar Notificação
            </Button>
          </div>
        </div>
      )}

      {/* Notebook Picker Modal (Prompt Master 18) */}
      <Modal
        isOpen={notebookModalOpen}
        onClose={() => setNotebookModalOpen(false)}
        title={`Adicionar ${question.code} ao Caderno`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selecione o caderno para o qual deseja enviar esta questão:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userNotebooks.map((nb) => {
              const alreadyIn = nb.questionIds.includes(question.id);
              return (
                <div
                  key={nb.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{nb.title}</h5>
                    <span className="text-[11px] text-slate-500">{nb.questionIds.length} questões</span>
                  </div>

                  {alreadyIn ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Já Adicionada
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        DBService.addQuestionToNotebook(nb.id, question.id);
                        setUserNotebooks(DBService.getNotebooks(user.id));
                        showToast('Adicionada ao Caderno', `Questão incluída em "${nb.title}".`, 'success');
                      }}
                      className="text-xs py-1 px-2.5 h-auto"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
              );
            })}

            {userNotebooks.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Você ainda não possui cadernos criados. Acesse a aba "Cadernos" no menu lateral para criar o seu primeiro.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setNotebookModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
