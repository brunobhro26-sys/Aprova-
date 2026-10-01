import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  CreditCard,
  FileQuestion,
  Award,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Bell,
  Sparkles
} from 'lucide-react';

interface AdminDashboardTabProps {
  onNavigateTab: (tabKey: any) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateTab }) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminOverview(period);
      setData(res);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const summary = data?.summary || {
    totalUsers: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
    newUsersInPeriod: 0,
    activeSubscribers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    blockedUsers: 0,
    totalQuestions: 0,
    activeQuestions: 0,
    totalExams: 0,
    totalSimulationsCompleted: 0,
    mrr: 0,
    totalRevenue: 0,
    conversionRate: 0,
    pendingTicketsCount: 0,
    pendingReportsCount: 0
  };

  const charts = data?.charts || {
    planDistribution: [],
    registrationsEvolution: [],
    topDisciplines: []
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Visão Executiva & Operacional
            </span>
            <span className="text-xs text-slate-400">Dados reais sincronizados</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Painel de Controle APROVA+</h2>
          <p className="text-sm text-slate-300 mt-1">
            Acompanhe usuários, receita recorrente, conversão, volume de questões e métricas de desempenho em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : 'Todo o período'}
            </button>
          ))}
          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Total de Usuários</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : summary.totalUsers.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{summary.newUsersInPeriod} no período
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>Ativos (30d): <strong>{summary.activeUsers30d}</strong></span>
            <span>Bloqueados: <strong className="text-amber-800 dark:text-amber-300">{summary.blockedUsers}</strong></span>
          </div>
        </Card>

        {/* Assinantes & Conversão */}
        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Assinantes Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : summary.activeSubscribers}
            </span>
            <Badge variant="success" className="text-[11px] font-semibold">
              {summary.conversionRate}% conversão
            </Badge>
          </div>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>Premium: <strong>{summary.premiumUsers}</strong></span>
            <span>Gratuitos: <strong>{summary.freeUsers}</strong></span>
          </div>
        </Card>

        {/* MRR & Receita */}
        <Card className="p-5 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Receita Recorrente (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R$ {loading ? '...' : summary.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300">/mês</span>
          </div>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>Receita Total: <strong>R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </Card>

        {/* Questões & Simulados */}
        <Card className="p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Banco & Conteúdos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : summary.totalQuestions}
            </span>
            <span className="text-xs font-medium text-purple-800 dark:text-purple-300">questões ativas</span>
          </div>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>Concursos: <strong>{summary.totalExams}</strong></span>
            <span>Simulados feitos: <strong>{summary.totalSimulationsCompleted}</strong></span>
          </div>
        </Card>
      </div>

      {/* Pending Items Alert Strip */}
      {(summary.pendingTicketsCount > 0 || summary.pendingReportsCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Itens pendentes de moderação e suporte
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Existem <strong>{summary.pendingTicketsCount}</strong> chamados de suporte aguardando resposta e <strong>{summary.pendingReportsCount}</strong> reportes de erros em questões.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('suporte')}
              className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
            >
              Atender Chamados
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigateTab('reportes')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Ver Reportes ({summary.pendingReportsCount})
            </Button>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2 cols) */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Crescimento de Cadastros e Assinantes</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">Evolução mensal dos alunos registrados e pagantes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Total Alunos
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Assinantes
              </span>
            </div>
          </div>

          {/* Clean Interactive SVG Bar/Area Chart */}
          <div className="h-64 flex flex-col justify-end pt-4">
            <div className="flex items-end justify-between h-48 gap-4 px-2 border-b border-slate-200 dark:border-slate-800">
              {charts.registrationsEvolution.map((item: any, idx: number) => {
                const maxVal = Math.max(...charts.registrationsEvolution.map((e: any) => e.users), 1);
                const heightUsers = Math.max(15, Math.round((item.users / maxVal) * 100));
                const heightSubs = Math.max(10, Math.round((item.subscribers / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Bar 1: Users */}
                      <div
                        style={{ height: `${heightUsers}%` }}
                        className="w-1/2 max-w-[28px] bg-indigo-500/80 hover:bg-indigo-600 rounded-t-md transition-all relative flex flex-col justify-start items-center group-hover:shadow-lg"
                      >
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          {item.users}
                        </span>
                      </div>
                      {/* Bar 2: Subscribers */}
                      <div
                        style={{ height: `${heightSubs}%` }}
                        className="w-1/2 max-w-[28px] bg-emerald-500/80 hover:bg-emerald-600 rounded-t-md transition-all relative flex flex-col justify-start items-center group-hover:shadow-lg"
                      >
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          {item.subscribers}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Taxa de retenção mensal: <strong>92.4%</strong></span>
            <span>Ticket médio por assinante: <strong>R$ 48,20</strong></span>
          </div>
        </Card>

        {/* Plan Distribution (1 col) */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Distribuição por Plano</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">Base ativa segmentada</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {summary.totalUsers} total
              </Badge>
            </div>

            <div className="space-y-4 my-4">
              {charts.planDistribution.map((item: any, idx: number) => {
                const pct = summary.totalUsers > 0 ? Math.round((item.count / summary.totalUsers) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.count} <span className="text-slate-600 dark:text-slate-300 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium"
              onClick={() => onNavigateTab('financeiro')}
            >
              Gerenciar Planos e Assinaturas
            </Button>
          </div>
        </Card>
      </div>

      {/* Top Studied Disciplines & Fast Actions Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disciplinas mais estudadas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Disciplinas Mais Praticadas</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">Volume de resolução e taxa média de acertos</p>
            </div>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-3">
            {charts.topDisciplines.map((d: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {d.discipline}
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    {d.questionsCount} questões respondidas pelos alunos
                  </span>
                </div>
                <div className="text-right">
                  <Badge variant={d.accuracyRate >= 70 ? 'success' : d.accuracyRate >= 50 ? 'warning' : 'danger'}>
                    {d.accuracyRate}% acerto
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Ações Administrativas Rápidas</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">Acesso direto às operações rotineiras</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('questoes')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm group"
            >
              <FileQuestion className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Criar Nova Questão</div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300">Com gabarito e explicação</div>
            </button>

            <button
              onClick={() => onNavigateTab('simulados')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm group"
            >
              <Award className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Novo Simulado Oficial</div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300">Configurar prova e pesos</div>
            </button>

            <button
              onClick={() => onNavigateTab('comunicados')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm group"
            >
              <Bell className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Enviar Comunicado</div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300">Aviso geral ou segmentado</div>
            </button>

            <button
              onClick={() => onNavigateTab('auditoria')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm group"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Auditoria & Sistema</div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300">Logs e limites de cotas</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
