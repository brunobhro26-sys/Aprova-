import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Target, Clock, Shield, Sparkles, CheckCircle2, Lock, Trophy, Flame, Download, Trash2, ShieldAlert, FileText } from 'lucide-react';
import { PWAInstallButton } from '../../components/pwa/PWAInstallButton';
import { GamificationClient, GamificationStatus } from '../../services/gamificationClient';

export const ProfileView: React.FC = () => {
  const { user, refreshData, openPaywall, showToast, setActiveTab, logout } = useApp();

  const [name, setName] = useState(user.name);
  const [targetContest, setTargetContest] = useState(user.targetContest || 'Transpetro');
  const [targetPosition, setTargetPosition] = useState(user.targetPosition || 'Técnico em Eletrotécnica');
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal || 40);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(user.studyHoursPerDay || 3);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(user.studyDaysPerWeek || 5);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [gamifStatus, setGamifStatus] = useState<GamificationStatus | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/lgpd/export');
      if (!res.ok) throw new Error('Falha ao exportar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aprova_plus_dados_${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Dados Exportados com Sucesso!', 'Arquivo JSON baixado conforme Artigo 18 da LGPD.', 'success');
    } catch {
      showToast('Erro ao exportar', 'Não foi possível gerar seu arquivo de dados.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Para confirmar a solicitação de exclusão e anonimização dos seus dados conforme a LGPD, digite exatamente: EXCLUIR MINHA CONTA');
    if (confirmation !== 'EXCLUIR MINHA CONTA') {
      showToast('Operação Cancelada', 'A confirmação não conferiu.', 'info');
      return;
    }
    try {
      const res = await fetch('/api/lgpd/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPhrase: confirmation, reason: 'Solicitação pelo painel do aluno' })
      });
      if (res.ok) {
        showToast('Conta Sinalizada para Exclusão', 'Seus dados foram desativados e anonimizados.', 'warning');
        setTimeout(() => logout(), 2000);
      }
    } catch {
      showToast('Erro', 'Falha ao processar solicitação de exclusão.', 'error');
    }
  };

  useEffect(() => {
    GamificationClient.getStatus()
      .then((res) => setGamifStatus(res))
      .catch((err) => console.error('Error loading gamification status in profile:', err));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    DBService.updateUser({
      name,
      targetContest,
      targetPosition,
      dailyGoal: Number(dailyGoal),
      studyHoursPerDay: Number(studyHoursPerDay),
      studyDaysPerWeek: Number(studyDaysPerWeek)
    });

    setTimeout(() => {
      setIsSaving(false);
      refreshData();
      showToast('Perfil Atualizado!', 'Suas preferências e metas foram salvas.', 'success');
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Meu Perfil & Preferências
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ajuste seu foco de edital, meta diária de resolução e dados de cadastro.
        </p>
      </div>

      {/* PWA Mobile Installation Banner (Prompt 8) */}
      <PWAInstallButton variant="banner" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="p-6 text-center space-y-4 md:col-span-1">
          {/* Avatar with optional equipped frame */}
          <div className="relative inline-block mx-auto">
            <div
              className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white text-3xl font-black flex items-center justify-center shadow-lg ${
                gamifStatus?.equipped.frame === 'frame_gold'
                  ? 'ring-4 ring-amber-400 ring-offset-2'
                  : gamifStatus?.equipped.frame === 'frame_silver'
                  ? 'ring-4 ring-slate-300 ring-offset-2'
                  : gamifStatus?.equipped.frame === 'frame_bronze'
                  ? 'ring-4 ring-amber-700 ring-offset-2'
                  : gamifStatus?.equipped.frame === 'frame_transpetro'
                  ? 'ring-4 ring-emerald-500 ring-offset-2'
                  : ''
              }`}
            >
              {user.name.charAt(0)}
            </div>
            {gamifStatus?.equipped.badge && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-xs">
                ⚡
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {user.name}
              </h3>
            </div>
            {gamifStatus?.equipped.title && (
              <span className="inline-block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800 mt-0.5">
                {gamifStatus.equipped.title}
              </span>
            )}
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>

            <div className="mt-2.5 flex justify-center gap-1.5 flex-wrap">
              <Badge variant="purple" size="sm">
                Nível {gamifStatus?.level.level || 4} · {gamifStatus?.level.name || 'Persistente'}
              </Badge>
              <Badge variant="success" size="sm">
                {gamifStatus?.totalXp || 840} XP
              </Badge>
            </div>
          </div>

          {/* Gamification Streak & Stats Mini Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5" /> Sequência de Dias:
              </span>
              <span className="tabular-nums text-slate-900 dark:text-white">{gamifStatus?.streak.current || 4} dias</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Maior sequência histórica:</span>
              <span className="font-bold tabular-nums">{gamifStatus?.streak.longest || 12} dias</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('achievements')}
              className="w-full text-xs font-semibold mt-1"
            >
              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" /> Ver Conquistas & Medalhas
            </Button>
          </div>

          {/* Subscription banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>Status do Plano:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{user.subscription.status}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {user.subscription.tier === 'GRATUITO'
                ? 'Plano Gratuito: 20 questões diárias permitidas.'
                : 'Acesso Pro Ilimitado liberado.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={openPaywall}
              className="w-full text-xs font-semibold"
            >
              {user.subscription.tier === 'GRATUITO' ? 'Fazer Upgrade p/ Pro' : 'Gerenciar Assinatura'}
            </Button>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="p-6 md:col-span-2">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Informações do Aluno & Metas
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Concurso Alvo
                </label>
                <input
                  type="text"
                  value={targetContest}
                  onChange={(e) => setTargetContest(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo Desejado
                </label>
                <input
                  type="text"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meta Diária (Questões)
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Horas / Dia
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={studyHoursPerDay}
                  onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dias / Semana
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={studyDaysPerWeek}
                  onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="font-bold"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>

        {/* Prompt 10 Requirement 17: Proteção de Dados e LGPD */}
        <Card className="p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Privacidade, LGPD & Seus Direitos
              </h3>
            </div>
            <Badge variant="default" size="sm">Lei 13.709/2018</Badge>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            A APROVA+ respeita rigorosamente a privacidade dos seus dados de preparação. Seus registros pedagógicos, simulados e transações são mantidos de forma criptografada e sob seu controle integral.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Exportar Meus Dados (Portabilidade)
                </span>
                <span className="text-[11px] text-slate-500">Baixar arquivo JSON com todo o histórico</span>
              </div>
              <Download className="w-4 h-4 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                  Solicitar Anonimização / Exclusão
                </span>
                <span className="text-[11px] text-rose-500/80">Direito ao esquecimento e desativação</span>
              </div>
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
