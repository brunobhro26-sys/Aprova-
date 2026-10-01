import React, { useState } from 'react';
import { StudyGoalMetric } from '../../../types';
import { StudyMetricsResponse, StudyPlanClient } from '../../../services/studyPlanClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Target,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';

interface StudyGoalsMetricsViewProps {
  metricsData: StudyMetricsResponse;
  onRefreshMetrics: () => void;
}

export const StudyGoalsMetricsView: React.FC<StudyGoalsMetricsViewProps> = ({
  metricsData,
  onRefreshMetrics
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'daily_questions' | 'weekly_hours' | 'monthly_questions' | 'subject_questions'>('daily_questions');
  const [newTarget, setNewTarget] = useState(30);
  const [newPeriod, setNewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSaving, setIsSaving] = useState(false);

  const { metrics, summary } = metricsData;

  const handleCreateMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      await fetch('/api/study-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          type: newType,
          targetValue: newTarget,
          period: newPeriod
        })
      });
      setIsAddModalOpen(false);
      setNewTitle('');
      onRefreshMetrics();
    } catch (err) {
      console.error('Error creating metric:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <Card className="p-5 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Ofensiva (Streak)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.streakDays}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
              dias seguidos
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Mantenha o ritmo diário para consolidar o hábito de aprovação!
          </p>
        </Card>

        {/* Weekly Hours Card */}
        <Card className="p-5 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Horas na Semana
            </span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.weeklyHoursStudied}h
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
              / {summary.weeklyHoursTarget}h meta
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((summary.weeklyHoursStudied / summary.weeklyHoursTarget) * 100))}%`
              }}
            />
          </div>
        </Card>

        {/* Sessions Completed */}
        <Card className="p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Sessões Concluídas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.totalSessionsCompleted}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
              sessões realizadas
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Tempo real auditado e sincronizado no cronograma.
          </p>
        </Card>

        {/* Goal Count */}
        <Card className="p-5 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Metas Ativas
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.length}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
              metas em monitoramento
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Desafio constante para manter consistência e evolução.
          </p>
        </Card>
      </div>

      {/* Metrics List Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Suas Metas e Desafios
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe em tempo real o atingimento dos seus compromissos de estudo
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Criar Nova Meta
        </Button>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const pct = Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 100));
          const isDone = pct >= 100;

          return (
            <Card
              key={metric.id}
              className={`p-5 border transition-all ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        metric.period === 'daily'
                          ? 'bg-blue-500/20 text-blue-600 border-blue-500/30'
                          : metric.period === 'weekly'
                          ? 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30'
                          : 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                      }
                    >
                      {metric.period === 'daily'
                        ? 'Diária'
                        : metric.period === 'weekly'
                        ? 'Semanal'
                        : 'Mensal'}
                    </Badge>
                    {isDone && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Meta Atingida!
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                    {metric.title}
                  </h4>
                </div>

                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDone ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Atual: {metric.currentValue}</span>
                  <span>Alvo: {metric.targetValue}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Metric Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              Nova Meta de Estudo
            </h3>

            <form onSubmit={handleCreateMetric} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Meta
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  placeholder="Ex: Resolver 40 questões por dia"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Periodicidade
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Alvo
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Meta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
