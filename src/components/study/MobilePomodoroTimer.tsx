import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { OfflineStorageService, PomodoroSessionState } from '../../services/offlineStorageService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Brain,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Volume2
} from 'lucide-react';

export const MobilePomodoroTimer: React.FC = () => {
  const { showToast } = useApp();

  // Load initial state from offline storage or default
  const [timerState, setTimerState] = useState<PomodoroSessionState>(() => {
    const saved = OfflineStorageService.loadPomodoroState();
    if (saved && saved.isActive) return saved;
    return {
      isActive: false,
      isPaused: true,
      timeRemainingSeconds: 25 * 60,
      totalDurationMinutes: 25,
      mode: 'study',
      completedCycles: 0,
      subjectName: 'Circuitos Elétricos',
      topicName: 'Leis de Kirchhoff',
      lastUpdatedTimestamp: Date.now()
    };
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(timerState.subjectName || 'Circuitos Elétricos');

  // Interval timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isActive && !timerState.isPaused) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (prev.timeRemainingSeconds <= 1) {
            // Cycle finished
            const nextMode = prev.mode === 'study' ? 'short_break' : 'study';
            const nextSeconds = nextMode === 'study' ? 25 * 60 : 5 * 60;
            const completed = prev.mode === 'study' ? prev.completedCycles + 1 : prev.completedCycles;

            // Mobile vibration alert if supported
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch {}
            }

            const updated: PomodoroSessionState = {
              ...prev,
              isPaused: true,
              mode: nextMode,
              timeRemainingSeconds: nextSeconds,
              totalDurationMinutes: nextSeconds / 60,
              completedCycles: completed,
              lastUpdatedTimestamp: Date.now()
            };

            OfflineStorageService.savePomodoroState(updated);
            showToast(
              prev.mode === 'study' ? '🎉 Bloco de Estudo Concluído!' : '⏰ Pausa Finalizada!',
              prev.mode === 'study' ? 'Hora de respirar por 5 minutos. Descanse os olhos!' : 'Vamos voltar ao foco para mais um ciclo produtivo.',
              'success'
            );

            return updated;
          }

          const updated: PomodoroSessionState = {
            ...prev,
            timeRemainingSeconds: prev.timeRemainingSeconds - 1,
            lastUpdatedTimestamp: Date.now()
          };
          OfflineStorageService.savePomodoroState(updated);
          return updated;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isActive, timerState.isPaused]);

  const handleStartPomodoro = () => {
    const updated: PomodoroSessionState = {
      ...timerState,
      isActive: true,
      isPaused: false,
      subjectName: selectedDiscipline,
      lastUpdatedTimestamp: Date.now()
    };
    setTimerState(updated);
    OfflineStorageService.savePomodoroState(updated);
    showToast('Pomodoro Iniciado', `Foco total em: ${selectedDiscipline}`, 'info');
  };

  const handleTogglePause = () => {
    const updated: PomodoroSessionState = {
      ...timerState,
      isPaused: !timerState.isPaused,
      lastUpdatedTimestamp: Date.now()
    };
    setTimerState(updated);
    OfflineStorageService.savePomodoroState(updated);
  };

  const handleReset = () => {
    const defaultDuration = timerState.mode === 'study' ? 25 * 60 : 5 * 60;
    const updated: PomodoroSessionState = {
      ...timerState,
      isPaused: true,
      timeRemainingSeconds: defaultDuration,
      lastUpdatedTimestamp: Date.now()
    };
    setTimerState(updated);
    OfflineStorageService.savePomodoroState(updated);
  };

  const handleSwitchMode = (mode: 'study' | 'short_break' | 'long_break') => {
    const minutes = mode === 'study' ? 25 : mode === 'short_break' ? 5 : 15;
    const updated: PomodoroSessionState = {
      ...timerState,
      mode,
      isPaused: true,
      timeRemainingSeconds: minutes * 60,
      totalDurationMinutes: minutes,
      lastUpdatedTimestamp: Date.now()
    };
    setTimerState(updated);
    OfflineStorageService.savePomodoroState(updated);
  };

  const handleFinishSession = () => {
    OfflineStorageService.clearPomodoroState();
    setTimerState({
      isActive: false,
      isPaused: true,
      timeRemainingSeconds: 25 * 60,
      totalDurationMinutes: 25,
      mode: 'study',
      completedCycles: 0,
      subjectName: selectedDiscipline,
      lastUpdatedTimestamp: Date.now()
    });
    setIsExpanded(false);
    showToast('Sessão Registrada', 'O tempo estudado foi computado na sua meta diária.', 'success');
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If timer is not active, don't show floating pill unless expanded
  if (!timerState.isActive && !isExpanded) {
    return null;
  }

  return (
    <>
      {/* Floating Pill when minimized */}
      {!isExpanded && timerState.isActive && (
        <div
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 z-40 bg-slate-900/90 dark:bg-indigo-950/90 text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-indigo-500/50 backdrop-blur-md flex items-center gap-3 cursor-pointer hover:scale-105 transition-all"
        >
          <div className="relative flex items-center justify-center">
            <div className={`w-2.5 h-2.5 rounded-full ${timerState.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3 text-indigo-400" />
              {timerState.mode === 'study' ? 'Foco Pomodoro' : 'Pausa'}
            </span>
            <span className="text-base font-black font-mono leading-none tracking-tight">
              {formatTime(timerState.timeRemainingSeconds)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePause();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {timerState.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      )}

      {/* Expanded Modal / Sheet */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm p-6 shadow-2xl border-indigo-500/30 text-center relative animate-scale-up">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* Mode selection tabs */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              <button
                onClick={() => handleSwitchMode('study')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timerState.mode === 'study'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Foco (25m)
              </button>
              <button
                onClick={() => handleSwitchMode('short_break')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timerState.mode === 'short_break'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pausa (5m)
              </button>
              <button
                onClick={() => handleSwitchMode('long_break')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timerState.mode === 'long_break'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Longa (15m)
              </button>
            </div>

            {/* Big Countdown Timer */}
            <div className="my-4">
              <div className="text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {formatTime(timerState.timeRemainingSeconds)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center gap-1">
                <span>Ciclos completados hoje:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">🔥 {timerState.completedCycles}</span>
              </p>
            </div>

            {/* Discipline selector */}
            <div className="mb-6 text-left">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Matéria em Estudo:
              </label>
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                disabled={timerState.isActive && !timerState.isPaused}
                className="w-full text-xs font-semibold p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Circuitos Elétricos">Circuitos Elétricos (Transpetro)</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
                <option value="Matemática e Raciocínio Lógico">Matemática e Raciocínio Lógico</option>
                <option value="Máquinas Elétricas">Máquinas Elétricas</option>
                <option value="Segurança e NR-10">Segurança e NR-10</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reiniciar ciclo"
                className="p-3 rounded-2xl"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              {!timerState.isActive ? (
                <Button
                  size="md"
                  onClick={handleStartPomodoro}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <Play className="w-5 h-5 fill-current" /> Iniciar Foco
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={handleTogglePause}
                  className={`font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all ${
                    timerState.isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                  }`}
                >
                  {timerState.isPaused ? (
                    <>
                      <Play className="w-5 h-5 fill-current" /> Retomar
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 fill-current" /> Pausar
                    </>
                  )}
                </Button>
              )}

              {timerState.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFinishSession}
                  title="Concluir sessão"
                  className="p-3 rounded-2xl text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
