import React, { useState, useEffect, useRef } from 'react';
import { StudySessionItem } from '../../../types';
import { StudyPlanClient } from '../../../services/studyPlanClient';
import { Button } from '../../../components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Timer,
  Coffee,
  Sparkles,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface StudyTimerModalProps {
  session: StudySessionItem;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted: (updatedSession: StudySessionItem) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  session,
  isOpen,
  onClose,
  onSessionCompleted,
}) => {
  const [mode, setMode] = useState<'standard' | 'pomodoro'>('standard');
  const [pomodoroState, setPomodoroState] = useState<'study' | 'break'>('study');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Post-session feedback state
  const [difficultyRating, setDifficultyRating] = useState<'Fácil' | 'Normal' | 'Difícil'>('Normal');
  const [notes, setNotes] = useState('');
  const [questionsCount, setQuestionsCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Target seconds
  const targetSeconds = (session.duracaoPlanejada || 60) * 60;
  const pomodoroTargetSeconds = pomodoroState === 'study' ? 25 * 60 : 5 * 60;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'pomodoro' && prev + 1 >= pomodoroTargetSeconds) {
            // Toggle pomodoro state
            if (pomodoroState === 'study') {
              setPomodoroState('break');
              return 0;
            } else {
              setPomodoroState('study');
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, pomodoroState, pomodoroTargetSeconds]);

  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishClick = () => {
    setIsRunning(false);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const minutesSpent = Math.max(1, Math.round(seconds / 60));
      const completed = await StudyPlanClient.completeSession(session.id, {
        duracaoReal: minutesSpent,
        difficultyRating,
        observacoes: notes,
        questionsCount,
        correctQuestionsCount: correctCount
      });
      onSessionCompleted(completed);
      setShowFeedbackModal(false);
      onClose();
    } catch (err) {
      console.error('Error completing session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Cronômetro de Estudo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session.subjectName || 'Disciplina'} • {session.tipo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showFeedbackModal ? (
          <div className="p-6 space-y-6 flex flex-col items-center">
            {/* Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
              <button
                type="button"
                onClick={() => {
                  setMode('standard');
                  setPomodoroState('study');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'standard'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cronômetro Livre
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('pomodoro');
                  setPomodoroState('study');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                Modo Pomodoro (25/5 min)
              </button>
            </div>

            {/* Topic Badge */}
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {session.topicName || session.observacoes || 'Sessão de estudos focada'}
              </span>
              {mode === 'pomodoro' && (
                <p className="text-xs font-bold text-rose-500 mt-2 uppercase tracking-wider">
                  {pomodoroState === 'study' ? '🔥 Bloco de Foco (25 min)' : '☕ Intervalo de Descanso (5 min)'}
                </p>
              )}
            </div>

            {/* Timer Display */}
            <div className="relative flex flex-col items-center justify-center w-56 h-56 rounded-full border-4 border-blue-500/20 bg-blue-500/5 dark:bg-blue-900/10">
              <span className="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                {formatTime(seconds)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                Meta: {session.duracaoPlanejada} min
              </span>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3 w-full max-w-xs justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeconds(0)}
                disabled={isRunning}
                className="px-3"
                title="Zerar tempo"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
              </Button>

              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 gap-2 font-bold ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar Estudo
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {seconds > 0 ? 'Continuar' : 'Iniciar Estudo'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFinishClick}
                className="px-3 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                title="Finalizar sessão de estudos"
              >
                <CheckCircle2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Post-Study Feedback Survey (Prompt Requirement 15) */
          <form onSubmit={handleSubmitFeedback} className="p-6 space-y-5">
            <div className="text-center pb-2">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                Sessão Concluída!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tempo total registrado: {Math.max(1, Math.round(seconds / 60))} minutos
              </p>
            </div>

            {/* Difficulty Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Qual foi a dificuldade percebida?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Fácil', 'Normal', 'Difícil'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyRating(diff)}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      difficultyRating === diff
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Answered */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Questões resolvidas
                </label>
                <input
                  type="number"
                  min="0"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Questões acertadas
                </label>
                <input
                  type="number"
                  min="0"
                  max={questionsCount}
                  value={correctCount}
                  onChange={(e) => setCorrectCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Study Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                O que você estudou? (Anotações e resumo)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ex: Revisei associação mista de resistores e fiz 10 exercícios da Cesgranrio..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowFeedbackModal(false)}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar e Concluir'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
