import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { GamificationClient } from '../../services/gamificationClient';
import {
  Trophy,
  Zap,
  Target,
  Sliders,
  ShieldCheck,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface AdminGamificationTabProps {
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminGamificationTab: React.FC<AdminGamificationTabProps> = ({ showToast }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  const [isEditingSetting, setIsEditingSetting] = useState<any>(null);
  const [settingValue, setSettingValue] = useState('');

  // Form novo desafio
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'daily',
    criteriaType: 'solve_questions',
    targetCount: 15,
    xpReward: 25,
    badgeRewardIcon: 'Target',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await GamificationClient.getAdminOverview();
      setData(res);
    } catch (err: any) {
      showToast('Erro ao carregar', err.message || 'Falha ao buscar dados', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSetting = async () => {
    if (!isEditingSetting) return;
    try {
      await GamificationClient.updateAdminSetting(
        isEditingSetting.key,
        settingValue,
        isEditingSetting.description
      );
      showToast('Configuração Atualizada', `Chave ${isEditingSetting.key} salva com sucesso.`, 'success');
      setIsEditingSetting(null);
      loadData();
    } catch (err: any) {
      showToast('Erro ao salvar', err.message, 'error');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.title) {
      showToast('Atenção', 'Título é obrigatório', 'info');
      return;
    }
    try {
      await GamificationClient.createAdminChallenge(newChallenge);
      showToast('Desafio Criado', 'Novo desafio registrado com sucesso.', 'success');
      setIsNewChallengeOpen(false);
      setNewChallenge({
        title: '',
        description: '',
        type: 'daily',
        criteriaType: 'solve_questions',
        targetCount: 15,
        xpReward: 25,
        badgeRewardIcon: 'Target',
      });
      loadData();
    } catch (err: any) {
      showToast('Erro ao criar desafio', err.message, 'error');
    }
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Carregando gestão da gamificação...
      </div>
    );
  }

  const summary = data?.summary || {};
  const settings = data?.settings || [];
  const recentTransactions = data?.recentTransactions || [];
  const levelDistribution = data?.levelDistribution || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Gestão da Gamificação & Motivação
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regras de pontuação, limites anti-abuso, desafios e auditoria de XP da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Atualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsNewChallengeOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Novo Desafio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-medium block">Total de XP Concedido</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {summary.totalXpAwarded?.toLocaleString('pt-BR') || 0} XP
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Em atividades legítimas</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-medium block">Transações de Pontuação</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {summary.totalTransactions || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">100% auditadas com idempotência</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-medium block">Alunos Gamificados</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {summary.totalGamifiedStudents || 0}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Com níveis e histórico</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-medium block">Desafios & Conquistas</span>
          <div className="text-2xl font-black text-amber-500 mt-1 tabular-nums">
            {summary.activeChallenges || 0} / {summary.totalAchievements || 0}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Desafios ativos e medalhas</span>
        </Card>
      </div>

      {/* Regras e Parâmetros de Pontuação (Prompt 9: Regras Configuráveis pelo Administrador) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Parâmetros de Pontuação e Limites Diários
            </h3>
            <p className="text-xs text-slate-500">
              Altere a pontuação sugerida para sessões, simulados, questões e defina o teto de segurança diário.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Chave / Parâmetro</th>
                <th className="p-3">Descrição da Atividade</th>
                <th className="p-3 text-right">Valor Atual</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {settings.map((st: any) => (
                <tr key={st.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {st.key}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {st.description || 'Configuração de pontuação'}
                  </td>
                  <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {st.value} {st.key.includes('xp') ? 'XP' : ''}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingSetting(st);
                        setSettingValue(st.value);
                      }}
                      className="text-xs h-7 px-2"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grid: Distribuição de Níveis + Auditoria Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Nível */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Distribuição de Níveis
          </h3>
          <div className="space-y-2 text-xs">
            {levelDistribution.length === 0 ? (
              <p className="text-slate-400">Nenhum estudante registrado ainda.</p>
            ) : (
              levelDistribution.map((ld: any) => (
                <div key={ld.level} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Nível {ld.level}
                  </span>
                  <Badge variant="outline" size="sm">
                    {ld.count} {ld.count === 1 ? 'estudante' : 'estudantes'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Trilha de Auditoria Recente de XP */}
        <Card className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Auditoria de Transações de XP Recentes
            </h3>
            <span className="text-[11px] text-slate-400">Últimos registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Data / Hora</th>
                  <th className="p-2.5">Estudante</th>
                  <th className="p-2.5">Atividade</th>
                  <th className="p-2.5 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 text-slate-400 tabular-nums">
                      {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                      {tx.userName || tx.userId}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">
                      {tx.description}
                    </td>
                    <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{tx.amount} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal: Editar Parâmetro */}
      {isEditingSetting && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditingSetting(null)}
          title={`Configurar: ${isEditingSetting.key}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {isEditingSetting.description}
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Valor da Pontuação ou Limite
              </label>
              <input
                type="text"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingSetting(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveSetting}>
                Salvar Alteração
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Criar Novo Desafio */}
      {isNewChallengeOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewChallengeOpen(false)}
          title="Criar Novo Desafio Personalizado"
        >
          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Título do Desafio
              </label>
              <input
                type="text"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="Ex: Maratona de 30 Questões Cesgranrio"
                required
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Descrição Pedagógica
              </label>
              <textarea
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="Resolva 30 questões de qualquer disciplina hoje..."
                rows={2}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Periodicidade
                </label>
                <select
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tipo de Critério
                </label>
                <select
                  value={newChallenge.criteriaType}
                  onChange={(e) => setNewChallenge({ ...newChallenge, criteriaType: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="solve_questions">Resolver Questões</option>
                  <option value="complete_session">Concluir Sessões</option>
                  <option value="study_time">Tempo de Estudo (min)</option>
                  <option value="review_wrong">Revisar Erros</option>
                  <option value="complete_simulation">Fazer Simulado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meta Quantitativa
                </label>
                <input
                  type="number"
                  min="1"
                  value={newChallenge.targetCount}
                  onChange={(e) => setNewChallenge({ ...newChallenge, targetCount: Number(e.target.value) })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recompensa em XP
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newChallenge.xpReward}
                  onChange={(e) => setNewChallenge({ ...newChallenge, xpReward: Number(e.target.value) })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewChallengeOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Criar Desafio
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
