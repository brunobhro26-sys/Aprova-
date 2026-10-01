import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  CreditCard,
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  Edit2,
  Trash2,
  RotateCw,
  Clock,
  Sparkles,
  HelpCircle,
  Layers
} from 'lucide-react';

export const AdminPlansTab: React.FC = () => {
  const { showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'planos' | 'assinaturas' | 'transacoes'>('planos');

  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan Edit/Create Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [planPrice, setPlanPrice] = useState('39.90');
  const [planCycle, setPlanCycle] = useState('monthly');
  const [planDescription, setPlanDescription] = useState('');
  const [planQuestionsLimit, setPlanQuestionsLimit] = useState(9999);
  const [planAiQuota, setPlanAiQuota] = useState(100);
  const [planSimulations, setPlanSimulations] = useState(true);
  const [planFeatures, setPlanFeatures] = useState('Questões ilimitadas\nSimulados oficiais\nAssistente IA');

  // Cancel Sub Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingSub, setCancelingSub] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s, t] = await Promise.all([
        ApiService.getAdminPlans(),
        ApiService.getAdminSubscriptions(),
        ApiService.getAdminTransactions()
      ]);
      setPlans(p || []);
      setSubscriptions(s || []);
      setTransactions(t || []);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanCode('');
    setPlanPrice('49.90');
    setPlanCycle('monthly');
    setPlanDescription('Acesso completo aos recursos da plataforma.');
    setPlanQuestionsLimit(9999);
    setPlanAiQuota(100);
    setPlanSimulations(true);
    setPlanFeatures('Questões ilimitadas\nSimulados com ranking\nAssistente de IA');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: any) => {
    setEditingPlan(p);
    setPlanName(p.name);
    setPlanCode(p.code);
    setPlanPrice(String(p.price));
    setPlanCycle(p.billingCycle);
    setPlanDescription(p.description || '');
    setPlanQuestionsLimit(p.dailyQuestionsLimit || 9999);
    setPlanAiQuota(p.dailyAiQuota || 100);
    setPlanSimulations(Boolean(p.unlimitedSimulations));
    try {
      const parsed = typeof p.featuresJson === 'string' ? JSON.parse(p.featuresJson) : p.featuresJson;
      setPlanFeatures(Array.isArray(parsed) ? parsed.join('\n') : '');
    } catch {
      setPlanFeatures('');
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const featuresList = planFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: planName,
      code: planCode || planName.toUpperCase().replace(/\s+/g, '_'),
      description: planDescription,
      price: planPrice,
      billingCycle: planCycle,
      dailyQuestionsLimit: Number(planQuestionsLimit),
      dailyAiQuota: Number(planAiQuota),
      unlimitedSimulations: planSimulations,
      featuresJson: featuresList
    };

    try {
      if (editingPlan) {
        await ApiService.updateAdminPlan(editingPlan.id, payload);
        showToast('Sucesso', 'Plano atualizado com sucesso.', 'success');
      } else {
        await ApiService.createAdminPlan(payload);
        showToast('Sucesso', 'Novo plano criado com sucesso.', 'success');
      }
      setIsPlanModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Erro', 'Falha ao salvar plano.', 'error');
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelingSub) return;
    try {
      await ApiService.cancelAdminSubscription(cancelingSub.id, cancelReason);
      showToast('Assinatura Cancelada', 'A assinatura foi cancelada administrativamente.', 'success');
      setIsCancelModalOpen(false);
      setCancelingSub(null);
      setCancelReason('');
      loadData();
    } catch (err) {
      showToast('Erro', 'Falha ao cancelar assinatura.', 'error');
    }
  };

  const handleExportTransactionsCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Usuario', 'Email', 'Plano', 'Valor', 'Metodo', 'Status', 'Codigo', 'Data'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.userName || ''}"`,
      `"${t.userEmail || ''}"`,
      `"${t.planName || ''}"`,
      `"${t.amount}"`,
      `"${t.paymentMethod}"`,
      `"${t.status}"`,
      `"${t.transactionCode || ''}"`,
      `"${new Date(t.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `transacoes_financeiras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportado', 'Relatório financeiro exportado.', 'success');
  };

  const totalRevenue = transactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Gestão Financeira, Planos & Assinaturas
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Administre a política de preços, ciclos de cobrança, assinaturas recorrentes e histórico de transações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'planos' && (
            <Button size="sm" onClick={handleOpenCreatePlan} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Criar Novo Plano
            </Button>
          )}
          {activeSubTab === 'transacoes' && (
            <Button size="sm" variant="outline" onClick={handleExportTransactionsCSV} className="text-xs flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={loadData} className="p-2" title="Recarregar">
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-700 dark:text-slate-300 block">Receita Bruta Total</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Pagamentos aprovados</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-xs text-slate-700 dark:text-slate-300 block">Assinantes Ativos</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {activeSubsCount}
          </span>
          <span className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">Base recorrente</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs text-slate-700 dark:text-slate-300 block">Planos Disponíveis</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {plans.length}
          </span>
          <span className="text-[11px] text-purple-800 dark:text-purple-300 font-medium">Modelos de monetização</span>
        </Card>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveSubTab('planos')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'planos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Planos de Acesso ({plans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('assinaturas')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'assinaturas'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Assinaturas de Usuários ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('transacoes')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'transacoes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Transações Financeiras ({transactions.length})
        </button>
      </div>

      {/* Sub-tab 1: Planos */}
      {activeSubTab === 'planos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            let features: string[] = [];
            try {
              features = typeof p.featuresJson === 'string' ? JSON.parse(p.featuresJson) : p.featuresJson || [];
            } catch {
              features = [];
            }

            return (
              <Card key={p.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">{p.name}</span>
                    <Badge variant={p.active ? 'success' : 'outline'} className="text-[10px]">
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 mb-3">{p.code}</div>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      R$ {Number(p.price).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 ml-1">
                      /{p.billingCycle === 'monthly' ? 'mês' : p.billingCycle === 'yearly' ? 'ano' : p.billingCycle === 'lifetime' ? 'vitalício' : 'grátis'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">{p.description}</p>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 mb-4 text-xs">
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold mb-1">Limites:</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      • {p.dailyQuestionsLimit >= 9999 ? 'Questões ilimitadas' : `${p.dailyQuestionsLimit} questões/dia`}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      • {p.dailyAiQuota} interações IA/dia
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      • {p.unlimitedSimulations ? 'Simulados ilimitados' : 'Simulados restritos'}
                    </div>
                  </div>

                  {features.length > 0 && (
                    <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-700 dark:text-slate-300">
                      {features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {features.length > 3 && (
                        <span className="text-[10px] text-slate-700 dark:text-slate-300 block">+{features.length - 3} outros benefícios</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>{p.subscribersCount || 0}</strong> assinantes
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditPlan(p)}
                    className="text-xs h-7 px-2.5 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sub-tab 2: Assinaturas */}
      {activeSubTab === 'assinaturas' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Valor Pago</th>
                  <th className="py-3 px-4">Ciclo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Início</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{s.userName || 'Aluno'}</div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300">{s.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{s.planName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      R$ {Number(s.pricePaid || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 capitalize">{s.billingCycle}</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.status === 'active' ? 'success' : 'danger'}>
                        {s.status === 'active' ? 'Ativa' : 'Cancelada'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{new Date(s.startDate).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4">
                      {s.endDate ? new Date(s.endDate).toLocaleDateString('pt-BR') : 'Vitalício'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCancelingSub(s);
                            setIsCancelModalOpen(true);
                          }}
                          className="text-xs h-7 px-2 text-red-800 dark:text-red-300 border-red-200 hover:bg-red-50"
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Sub-tab 3: Transações */}
      {activeSubTab === 'transacoes' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Código / ID</th>
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {t.transactionCode || t.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{t.userName}</div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300">{t.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{t.planName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      R$ {Number(t.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {t.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={t.status === 'paid' ? 'success' : 'warning'}>
                        {t.status === 'paid' ? 'Aprovado' : t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {new Date(t.paidAt || t.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Plan Create/Edit Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Editar Plano de Assinatura' : 'Criar Novo Plano de Acesso'}
      >
        <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Nome do Plano</label>
              <input
                type="text"
                required
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Pro Intensivo"
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Código Único</label>
              <input
                type="text"
                required
                disabled={!!editingPlan}
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value.toUpperCase())}
                placeholder="Ex: PRO_INTENSIVO"
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Ciclo de Cobrança</label>
              <select
                value={planCycle}
                onChange={(e) => setPlanCycle(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
                <option value="lifetime">Vitalício</option>
                <option value="free">Gratuito</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Limite Questões/Dia</label>
              <input
                type="number"
                value={planQuestionsLimit}
                onChange={(e) => setPlanQuestionsLimit(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Cota IA Diária</label>
              <input
                type="number"
                value={planAiQuota}
                onChange={(e) => setPlanAiQuota(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Descrição Comercial</label>
            <input
              type="text"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Benefícios e Recursos (1 por linha)</label>
            <textarea
              rows={3}
              value={planFeatures}
              onChange={(e) => setPlanFeatures(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="simCheck"
              checked={planSimulations}
              onChange={(e) => setPlanSimulations(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="simCheck" className="text-slate-700 dark:text-slate-300 cursor-pointer">
              Simulados Oficiais Ilimitados
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Salvar Plano
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancelar Assinatura de Aluno"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            Tem certeza que deseja cancelar a assinatura de <strong>{cancelingSub?.userName}</strong> ({cancelingSub?.planName})?
          </p>
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Motivo do Cancelamento (Registrado em Auditoria):
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Solicitação do cliente, estorno acordado, etc."
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button size="sm" onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700 text-white">
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
