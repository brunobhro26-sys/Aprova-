import React, { useState } from 'react';
import { StudySessionItem } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { formatDate, addDays } from '../../../utils/dateUtils';

interface CalendarViewProps {
  sessions: StudySessionItem[];
  onStartSession: (session: StudySessionItem) => void;
  onQuickComplete: (sessionId: string) => void;
  onSessionDateChange: (sessionId: string, newDate: string) => void;
  onAddManualSession: (date: string) => void;
  onRecalculateWeek: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  onStartSession,
  onQuickComplete,
  onSessionDateChange,
  onAddManualSession,
  onRecalculateWeek
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);

  const todayStr = formatDate(new Date());

  // Week days calculation (starts on Monday or Sunday)
  const startOfWeek = new Date(currentDate);
  const dayIndex = startOfWeek.getDay(); // 0 = Sun
  startOfWeek.setDate(startOfWeek.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1)); // start on Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

  // Navigation handlers
  const handlePrev = () => {
    const daysToShift = viewMode === 'week' ? 7 : 30;
    setCurrentDate(addDays(currentDate, -daysToShift));
  };

  const handleNext = () => {
    const daysToShift = viewMode === 'week' ? 7 : 30;
    setCurrentDate(addDays(currentDate, daysToShift));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    e.dataTransfer.setData('text/plain', sessionId);
    setDraggedSessionId(sessionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('text/plain') || draggedSessionId;
    if (sessionId) {
      onSessionDateChange(sessionId, targetDateStr);
    }
    setDraggedSessionId(null);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Teoria':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300';
      case 'Questões':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
      case 'Revisão':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300';
      case 'Simulado':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300';
    }
  };

  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-4">
      {/* Calendar Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            {weekDays[0].toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} –{' '}
            {weekDays[6].toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reorganizar semana button */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRecalculateWeek}
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 gap-1.5 font-semibold text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replanejar Semana
          </Button>

          {/* View Mode Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid (7 Columns) with Drag and Drop */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((dayDate, idx) => {
          const dateStr = formatDate(dayDate);
          const isToday = dateStr === todayStr;
          const daySessions = sessions.filter((s) => s.data === dateStr);

          return (
            <div
              key={dateStr}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={`flex flex-col min-h-[360px] rounded-2xl border transition-all p-3 ${
                isToday
                  ? 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {dayNames[idx]}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5 ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onAddManualSession(dateStr)}
                  className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  title="Adicionar sessão neste dia"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Day Sessions List */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[480px]">
                {daySessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-xs">Descanso ou livre</span>
                  </div>
                ) : (
                  daySessions.map((session) => {
                    const isCompleted = session.status === 'Concluída';
                    const isDelayed = session.status === 'Atrasada';

                    return (
                      <div
                        key={session.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, session.id)}
                        className={`group relative p-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${getTypeStyle(
                          session.tipo
                        )} ${isCompleted ? 'opacity-80' : ''}`}
                      >
                        {/* Status Icon & Header */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/30">
                            {session.tipo}
                          </span>

                          <div className="flex items-center gap-1">
                            {isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {isDelayed && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1 rounded">
                                <AlertCircle className="w-3 h-3" /> Atrasada
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subject & Topic */}
                        <h4 className="text-xs font-bold line-clamp-1">
                          {session.subjectName || 'Geral'}
                        </h4>
                        <p className="text-[11px] opacity-80 line-clamp-1">
                          {session.topicName || session.observacoes || 'Sessão estruturada'}
                        </p>

                        {/* Time & Duration */}
                        <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-current/10">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {session.duracaoPlanejada} min
                          </span>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            {!isCompleted && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onStartSession(session)}
                                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                  title="Iniciar cronômetro"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onQuickComplete(session.id)}
                                  className="p-1 rounded bg-white dark:bg-slate-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-500/30"
                                  title="Marcar como concluída"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Legenda:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Teoria
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Questões
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Revisão
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Simulado
          </span>
        </div>

        <p className="italic">
          💡 Dica: Arraste qualquer bloco para outro dia para reagendar sua rotina.
        </p>
      </div>
    </div>
  );
};
