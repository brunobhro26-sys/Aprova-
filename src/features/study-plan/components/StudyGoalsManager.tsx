import React, { useState } from 'react';
import { StudyGoal } from '../../../types';
import { StudyPlanClient } from '../../../services/studyPlanClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Target,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  PauseCircle
} from 'lucide-react';

interface StudyGoalsManagerProps {
  goals: StudyGoal[];
  onRefreshGoals: () => void;
  onSelectGoal?: (goal: StudyGoal) => void;
  onOpenNewWizard: () => void;
}

export const StudyGoalsManager: React.FC<StudyGoalsManagerProps> = ({
  goals,
  onRefreshGoals,
  onSelectGoal,
  onOpenNewWizard
}) => {
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSetPrincipal = async (id: string) => {
    try {
      await StudyPlanClient.setPrincipalGoal(id);
      onRefreshGoals();
    } catch (err) {
      console.error('Error setting principal goal:', err);
    }
  };

  const handleToggleStatus = async (goal: StudyGoal) => {
    try {
      const nextStatus = goal.status === 'Ativo' ? 'Pausado' : 'Ativo';
      await StudyPlanClient.updateGoal(goal.id, { status: nextStatus });
      onRefreshGoals();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este objetivo?')) return;
    try {
      await StudyPlanClient.deleteGoal(id);
      onRefreshGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const calculateDaysRemaining = (examDateStr?: string) => {
    if (!examDateStr) return null;
    const examDate = new Date(examDateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Meus Objetivos de Concurso
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie múltiplos concursos com foco no seu Objetivo Principal
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenNewWizard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Novo Objetivo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isPrincipal = goal.prioridade === 'Principal';
          const daysLeft = calculateDaysRemaining(goal.dataProva);

          return (
            <Card
              key={goal.id}
              className={`p-5 relative overflow-hidden transition-all border ${
                isPrincipal
                  ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/10 ring-1 ring-blue-500/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Principal Banner */}
              {isPrincipal && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Objetivo Principal
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      goal.status === 'Ativo'
                        ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                        : goal.status === 'Pausado'
                        ? 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                        : 'bg-slate-500/20 text-slate-600 border-slate-500/30'
                    }
                  >
                    {goal.status}
                  </Badge>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Nível {goal.nivelAtual}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                    {goal.nome}
                  </h4>
                  {goal.positionName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cargo: {goal.positionName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      Carga Horária
                    </span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {goal.horasDisponiveisSemana}h / semana
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      Prova
                    </span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {daysLeft !== null && daysLeft > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {daysLeft} dias restantes
                        </span>
                      ) : (
                        'A definir'
                      )}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    {!isPrincipal && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrincipal(goal.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        Tornar Principal
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(goal)}
                      className="text-xs text-slate-600 dark:text-slate-400"
                    >
                      {goal.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Excluir objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
