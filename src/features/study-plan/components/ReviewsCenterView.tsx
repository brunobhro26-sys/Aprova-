import React, { useState } from 'react';
import { StudyReviewItem } from '../../../types';
import { StudyPlanClient, StudyReviewsGrouped } from '../../../services/studyPlanClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

interface ReviewsCenterViewProps {
  reviews: StudyReviewsGrouped;
  onRefreshReviews: () => void;
  onStartReviewSession: (review: StudyReviewItem) => void;
}

export const ReviewsCenterView: React.FC<ReviewsCenterViewProps> = ({
  reviews,
  onRefreshReviews,
  onStartReviewSession
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hoje' | 'atrasadas' | 'proximas' | 'concluidas'>('hoje');

  // Interactive review modal
  const [activeReviewModal, setActiveReviewModal] = useState<{
    review: StudyReviewItem;
    questions: any[];
    currentIndex: number;
    answers: Record<string, string>;
    showResult: boolean;
    score: number;
  } | null>(null);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const handleOpenReview = async (review: StudyReviewItem) => {
    setIsLoadingQuestions(true);
    try {
      const data = await StudyPlanClient.getReviewQuestions(review.id);
      setActiveReviewModal({
        review: data.review,
        questions: data.questions || [],
        currentIndex: 0,
        answers: {},
        showResult: false,
        score: 0
      });
    } catch (err) {
      console.error('Error opening review questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectAlternative = (questionId: string, letter: string) => {
    if (!activeReviewModal) return;
    setActiveReviewModal({
      ...activeReviewModal,
      answers: {
        ...activeReviewModal.answers,
        [questionId]: letter
      }
    });
  };

  const handleFinishReviewQuestions = async () => {
    if (!activeReviewModal) return;
    const questions = activeReviewModal.questions;
    let correct = 0;

    questions.forEach((q) => {
      const selected = activeReviewModal.answers[q.id];
      const correctAlt = q.alternatives?.find((a: any) => a.isCorrect);
      if (selected && correctAlt && selected === correctAlt.letter) {
        correct++;
      }
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 80;

    // Send to backend SRS
    await StudyPlanClient.completeReview(activeReviewModal.review.id, score);

    setActiveReviewModal({
      ...activeReviewModal,
      showResult: true,
      score
    });

    onRefreshReviews();
  };

  const currentList = reviews[activeSubTab] || [];

  return (
    <div className="space-y-6">
      {/* Header & SRS Explanation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Central de Revisão Espaçada (SRS)
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Algoritmo inteligente de retenção que combate a Curva do Esquecimento. Intervalos programados em{' '}
            <strong>24 horas, 7 dias, 15 dias, 30 dias e 45 dias</strong>. Acertos expandem o intervalo; erros reduzem ou reiniciam o ciclo.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Hoje</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{reviews.hoje.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Atrasadas</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{reviews.atrasadas.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Concluídas</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{reviews.concluidas.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('hoje')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeSubTab === 'hoje'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Hoje ({reviews.hoje.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('atrasadas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeSubTab === 'atrasadas'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Atrasadas ({reviews.atrasadas.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('proximas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeSubTab === 'proximas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Próximas ({reviews.proximas.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('concluidas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeSubTab === 'concluidas'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Concluídas ({reviews.concluidas.length})
        </button>
      </div>

      {/* Review Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-70" />
            <h4 className="font-bold text-slate-900 dark:text-white">Nenhuma revisão nesta aba</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Excelente! Suas revisões estão em dia com a repetição espaçada.
            </p>
          </div>
        ) : (
          currentList.map((review) => {
            const isLate = activeSubTab === 'atrasadas';
            const isDone = review.status === 'completed';

            return (
              <Card
                key={review.id}
                className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      className={
                        isLate
                          ? 'bg-rose-500/20 text-rose-600 border-rose-500/30'
                          : isDone
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-700 border-amber-500/30'
                      }
                    >
                      {isLate ? 'Atrasada' : isDone ? 'Concluída' : `Etapa ${review.stage} • ${review.intervalDays}d`}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {review.scheduledDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      {review.subjectName || 'Disciplina'}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {review.topicName || 'Tópico Específico'}
                    </h4>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Questões recomendadas:</span>
                      <strong>{review.recommendedQuestionsCount || 5} questões</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo estimado:</span>
                      <strong>~15-20 min</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Facilidade (Ease Factor):</span>
                      <strong>{review.easeFactor || '2.5'}x</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center gap-2">
                  {!isDone ? (
                    <Button
                      size="sm"
                      onClick={() => handleOpenReview(review)}
                      className={`w-full font-bold gap-2 ${
                        isLate
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Revisar Agora
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                      <span>Retenção: {review.performanceScore || 85}%</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Interactive Quick Review Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Revisão Espaçada Ativa
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {activeReviewModal.review.topicName || 'Bateria de Revisão'}
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {!activeReviewModal.showResult ? (
                activeReviewModal.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400">
                      Nenhuma questão direta encontrada para este tópico. Você pode marcar a revisão como revisada.
                    </p>
                    <Button
                      onClick={() => handleFinishReviewQuestions()}
                      className="mt-4 bg-amber-600 text-white font-bold"
                    >
                      Confirmar Leitura e Concluir Revisão
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>
                        Questão {activeReviewModal.currentIndex + 1} de {activeReviewModal.questions.length}
                      </span>
                      <span>
                        {Object.keys(activeReviewModal.answers).length} respondidas
                      </span>
                    </div>

                    {(() => {
                      const q = activeReviewModal.questions[activeReviewModal.currentIndex];
                      const selected = activeReviewModal.answers[q.id];

                      return (
                        <div className="space-y-4">
                          <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            {q.statement}
                          </p>

                          <div className="space-y-2">
                            {q.alternatives?.map((alt: any) => (
                              <button
                                key={alt.letter}
                                type="button"
                                onClick={() => handleSelectAlternative(q.id, alt.letter)}
                                className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-start gap-3 ${
                                  selected === alt.letter
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                                  selected === alt.letter
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {alt.letter}
                                </span>
                                <span className="pt-0.5">{alt.text}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )
              ) : (
                /* Result Screen */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    Revisão Registrada!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto">
                    Desempenho nesta revisão: <strong>{activeReviewModal.score}%</strong>. O algoritmo SRS recalculou o intervalo para manter sua retenção máxima.
                  </p>
                  <Button
                    onClick={() => setActiveReviewModal(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                  >
                    Fechar e Continuar
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!activeReviewModal.showResult && activeReviewModal.questions.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeReviewModal.currentIndex === 0}
                  onClick={() =>
                    setActiveReviewModal({
                      ...activeReviewModal,
                      currentIndex: activeReviewModal.currentIndex - 1
                    })
                  }
                >
                  Anterior
                </Button>

                {activeReviewModal.currentIndex < activeReviewModal.questions.length - 1 ? (
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white font-bold"
                    onClick={() =>
                      setActiveReviewModal({
                        ...activeReviewModal,
                        currentIndex: activeReviewModal.currentIndex + 1
                      })
                    }
                  >
                    Próxima Questão
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleFinishReviewQuestions}
                  >
                    Finalizar Bateria e Salvar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
