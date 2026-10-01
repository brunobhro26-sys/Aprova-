import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  Sliders,
  RotateCw,
  Search,
  Filter,
  Lock,
  Globe,
  Database,
  Cpu,
  AlertTriangle,
  Save,
  CheckCircle2
} from 'lucide-react';

export const AdminAuditSettingsTab: React.FC = () => {
  const { showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'auditoria' | 'parametros'>('auditoria');

  // Audit Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [loadingLogs, setLoadingLogs] = useState(true);

  // System Settings
  const [settings, setSettings] = useState<any[]>([]);
  const [freeQuestionsLimit, setFreeQuestionsLimit] = useState('15');
  const [freeAiPrompts, setFreeAiPrompts] = useState('5');
  const [maintenanceMode, setMaintenanceMode] = useState('false');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [allowSignups, setAllowSignups] = useState('true');
  const [bannerNotice, setBannerNotice] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await ApiService.getAdminAuditLogs({
        action: filterAction !== 'all' ? filterAction : undefined,
        entity: filterEntity !== 'all' ? filterEntity : undefined
      });
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadSettings = async () => {
    try {
      const list = await ApiService.getAdminSettings();
      setSettings(list || []);
      list.forEach((s: any) => {
        if (s.key === 'free_tier_daily_questions_limit') setFreeQuestionsLimit(s.value);
        if (s.key === 'free_tier_daily_ai_prompts') setFreeAiPrompts(s.value);
        if (s.key === 'maintenance_mode') setMaintenanceMode(s.value);
        if (s.key === 'maintenance_message') setMaintenanceMessage(s.value);
        if (s.key === 'allow_student_registration') setAllowSignups(s.value);
        if (s.key === 'system_notice_banner') setBannerNotice(s.value);
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [filterAction, filterEntity]);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await Promise.all([
        ApiService.updateAdminSetting('free_tier_daily_questions_limit', freeQuestionsLimit, 'Limite diário de questões gratuito', 'limits'),
        ApiService.updateAdminSetting('free_tier_daily_ai_prompts', freeAiPrompts, 'Limite diário de prompts IA gratuito', 'ai'),
        ApiService.updateAdminSetting('maintenance_mode', maintenanceMode, 'Modo de manutenção', 'system'),
        ApiService.updateAdminSetting('maintenance_message', maintenanceMessage, 'Mensagem de manutenção', 'system'),
        ApiService.updateAdminSetting('allow_student_registration', allowSignups, 'Permitir novos cadastros', 'system'),
        ApiService.updateAdminSetting('system_notice_banner', bannerNotice, 'Banner de comunicado superior', 'general')
      ]);
      showToast('Configurações Salvas', 'Os parâmetros do sistema foram atualizados com sucesso.', 'success');
      loadSettings();
      loadAuditLogs();
    } catch (err) {
      showToast('Erro', 'Falha ao salvar parâmetros do sistema.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const getActionBadge = (a: string) => {
    switch (a) {
      case 'CREATE':
        return <Badge variant="success" className="text-[10px]">Criação</Badge>;
      case 'UPDATE':
        return <Badge variant="primary" className="text-[10px]">Alteração</Badge>;
      case 'DELETE':
        return <Badge variant="danger" className="text-[10px]">Exclusão</Badge>;
      case 'STATUS_CHANGE':
        return <Badge variant="warning" className="text-[10px]">Status</Badge>;
      case 'ROLE_CHANGE':
        return <Badge variant="danger" className="text-[10px]">Permissão RBAC</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{a}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Auditoria, Segurança & Parâmetros do Sistema
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Acompanhe o log de atividades administrativas e configure cotas, limites globais e modo de manutenção.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              loadAuditLogs();
              loadSettings();
            }}
            className="p-2"
            title="Recarregar"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveSubTab('auditoria')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'auditoria'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Trilha de Auditoria ({logs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('parametros')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'parametros'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Configurações Globais do Sistema
        </button>
      </div>

      {/* SUB-TAB 1: TRILHA DE AUDITORIA */}
      {activeSubTab === 'auditoria' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">Filtrar por Ação:</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="all">Todas as Ações</option>
                  <option value="CREATE">Criação (CREATE)</option>
                  <option value="UPDATE">Alteração (UPDATE)</option>
                  <option value="STATUS_CHANGE">Mudança de Status</option>
                  <option value="ROLE_CHANGE">Mudança de Papel (RBAC)</option>
                  <option value="DELETE">Exclusão (DELETE)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1">Filtrar por Entidade:</label>
                <select
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="all">Todas as Entidades</option>
                  <option value="users">Usuários (users)</option>
                  <option value="plans">Planos (plans)</option>
                  <option value="subscriptions">Assinaturas (subscriptions)</option>
                  <option value="questions">Questões (questions)</option>
                  <option value="simulations">Simulados (simulations)</option>
                  <option value="system_settings">Configurações (system_settings)</option>
                  <option value="system_announcements">Comunicados (announcements)</option>
                  <option value="support_tickets">Suporte (support_tickets)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Audit Logs Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4">Ação</th>
                    <th className="py-3 px-4">Entidade</th>
                    <th className="py-3 px-4">Detalhes da Modificação</th>
                    <th className="py-3 px-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-700 dark:text-slate-300">
                        <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        Carregando registros de auditoria...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-700 dark:text-slate-300">
                        Nenhum registro de auditoria encontrado.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {log.userName || log.userId || 'Sistema'}
                          </span>
                          <span className="text-[10px] text-slate-700 dark:text-slate-300">{log.userEmail || ''}</span>
                        </td>
                        <td className="py-2.5 px-4">{getActionBadge(log.action)}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-indigo-700 dark:text-indigo-400">
                          {log.entity}
                        </td>
                        <td className="py-2.5 px-4 max-w-xs">
                          {log.previousValue && (
                            <div className="text-[11px] text-red-700 dark:text-red-400 line-through truncate">
                              De: {log.previousValue}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                            Para: {log.newValue || log.recordId}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SUB-TAB 2: CONFIGURAÇÕES GLOBAIS DO SISTEMA */}
      {activeSubTab === 'parametros' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Limites de Uso e Cotas da Camada Gratuita
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
              Defina os limites diários aplicados automaticamente para estudantes sem assinatura premium ativa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Limite Diário de Questões Resolvidas
                </label>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-3">
                  Número máximo de questões que um aluno gratuito pode responder por dia antes de atingir o paywall.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={freeQuestionsLimit}
                    onChange={(e) => setFreeQuestionsLimit(e.target.value)}
                    className="w-24 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">questões / dia</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Cota Diária de Interações com Assistente IA
                </label>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-3">
                  Número de prompts e explicações pedagógicas com inteligência artificial para o plano gratuito.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={freeAiPrompts}
                    onChange={(e) => setFreeAiPrompts(e.target.value)}
                    className="w-24 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">interações / dia</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Operação da Plataforma & Modo de Manutenção
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
              Controle a disponibilidade pública e mensagens para todos os alunos.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Modo de Manutenção do Sistema
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    Quando ativado, os alunos veem um aviso de manutenção. Apenas administradores continuam acessando.
                  </span>
                </div>
                <select
                  value={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.value)}
                  className={`p-2 rounded-lg font-bold border text-xs ${
                    maintenanceMode === 'true'
                      ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                  }`}
                >
                  <option value="false">Desativado (Normal)</option>
                  <option value="true">Ativado (Manutenção)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Mensagem Exibida aos Alunos em Manutenção
                </label>
                <input
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Ex: Estamos realizando melhorias de infraestrutura..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Permitir Novos Cadastros de Estudantes
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    Habilita ou congela novas inscrições públicas na plataforma.
                  </span>
                </div>
                <select
                  value={allowSignups}
                  onChange={(e) => setAllowSignups(e.target.value)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="true">Permitir Cadastros</option>
                  <option value="false">Bloquear Novos Cadastros</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Banner Informativo Superior (Dashboard do Aluno)
                </label>
                <input
                  type="text"
                  value={bannerNotice}
                  onChange={(e) => setBannerNotice(e.target.value)}
                  placeholder="Ex: Edital Transpetro 2026: novas questões comentadas inseridas no banco!"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Salvando Parâmetros...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
