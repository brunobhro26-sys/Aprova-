import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  CreditCard,
  Award,
  FileText,
  AlertTriangle,
  RotateCw,
  Mail,
  UserCheck
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { showToast } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status Change Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'BLOCKED'>('BLOCKED');

  // Role Change Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('STUDENT');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminUsers({
        search,
        plan: filterPlan !== 'all' ? filterPlan : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        role: filterRole !== 'all' ? filterRole : undefined
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Erro', 'Não foi possível carregar os usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, filterPlan, filterStatus, filterRole]);

  const handleOpenDetails = async (u: any) => {
    setSelectedUser(u);
    setIsDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const details = await ApiService.getUserDetails(u.id);
      setUserDetails(details);
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    try {
      await ApiService.updateUserStatus(selectedUser.id, targetStatus, blockReason);
      showToast(
        'Status Atualizado',
        `Usuário ${targetStatus === 'BLOCKED' ? 'bloqueado' : 'desbloqueado'} com sucesso.`,
        'success'
      );
      setIsBlockModalOpen(false);
      setIsDetailModalOpen(false);
      setBlockReason('');
      fetchUsers();
    } catch (err) {
      showToast('Erro', 'Falha ao alterar status do usuário', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await ApiService.updateUserRole(selectedUser.id, newRole);
      showToast('Papel Atualizado', `Perfil do usuário alterado para ${newRole}.`, 'success');
      setIsRoleModalOpen(false);
      setIsDetailModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast('Erro', 'Falha ao alterar permissões do usuário', 'error');
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('Aviso', 'Não há usuários para exportar', 'warning');
      return;
    }

    const headers = ['ID', 'Nome', 'Email', 'Papel', 'Plano', 'Status', 'Ofensiva_Dias', 'XP', 'Concurso_Alvo', 'Cadastrado_Em'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.plan || ''}"`,
      `"${u.status || ''}"`,
      u.streakDays || 0,
      u.xp || 0,
      `"${u.targetContest || ''}"`,
      `"${new Date(u.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `usuarios_aprova_plus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportação concluída', 'Relatório CSV de usuários gerado com sucesso.', 'success');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <Badge variant="danger" className="text-[10px]">Superadmin</Badge>;
      case 'ADMIN':
        return <Badge variant="primary" className="text-[10px]">Administrador</Badge>;
      case 'CONTENT_EDITOR':
        return <Badge variant="warning" className="text-[10px]">Editor Conteúdo</Badge>;
      case 'SUPPORT':
        return <Badge variant="primary" className="text-[10px]">Suporte</Badge>;
      case 'FINANCIAL':
        return <Badge variant="success" className="text-[10px]">Financeiro</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Aluno</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'PREMIUM_ANUAL':
        return <Badge variant="success" className="text-[10px]">Premium Anual</Badge>;
      case 'PREMIUM_MENSAL':
        return <Badge variant="primary" className="text-[10px]">Premium Mensal</Badge>;
      case 'VITALICIO':
        return <Badge variant="warning" className="text-[10px]">Vitalício</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Gratuito</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and CSV export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Gestão de Usuários e Permissões
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Administre contas, controle de acesso baseado em funções (RBAC) e status cadastral em conformidade com a LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
          <Button
            size="sm"
            onClick={fetchUsers}
            variant="outline"
            className="p-2"
            title="Recarregar"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Filter Plan */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Planos</option>
            <option value="GRATUITO">Gratuito</option>
            <option value="PREMIUM_MENSAL">Premium Mensal</option>
            <option value="PREMIUM_ANUAL">Premium Anual</option>
            <option value="VITALICIO">Vitalício</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="BLOCKED">Bloqueado</option>
            <option value="INACTIVE">Inativo</option>
          </select>

          {/* Filter Role (RBAC) */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="all">Todas as Funções (RBAC)</option>
            <option value="STUDENT">Aluno</option>
            <option value="SUPERADMIN">Superadministrador</option>
            <option value="ADMIN">Administrador</option>
            <option value="CONTENT_EDITOR">Editor de Conteúdo</option>
            <option value="SUPPORT">Suporte</option>
            <option value="FINANCIAL">Financeiro</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Usuário / E-mail</th>
                <th className="py-3 px-4">Papel (RBAC)</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Concurso Alvo</th>
                <th className="py-3 px-4 text-center">Atividade</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-700 dark:text-slate-300">
                    <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Carregando base de usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-700 dark:text-slate-300">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {u.name}
                        {u.role === 'SUPERADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4">{getPlanBadge(u.plan)}</td>
                    <td className="py-3 px-4">
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : u.status === 'BLOCKED' ? (
                        <span className="inline-flex items-center gap-1 text-red-800 dark:text-red-300 font-medium" title={u.blockedReason || ''}>
                          <XCircle className="w-3.5 h-3.5" /> Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{u.targetContest || 'Geral'}</span>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 block">{u.targetPosition || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{u.xp || 0} XP</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300">🔥 {u.streakDays || 0} dias</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetails(u)}
                        className="text-xs h-7 px-2.5 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Ficha do Usuário: ${selectedUser?.name || ''}`}
        maxWidth="2xl"
      >
        {selectedUser && (
          <div className="space-y-5 text-xs">
            {/* Header Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(selectedUser.role)}
                  {getPlanBadge(selectedUser.plan)}
                  <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-slate-700 dark:text-slate-300">
                <div>ID: <span className="font-mono text-[11px]">{selectedUser.id}</span></div>
                <div>Cadastro: {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Blocked reason banner if blocked */}
            {selectedUser.status === 'BLOCKED' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <strong>Conta Bloqueada:</strong> {selectedUser.blockedReason || 'Motivo não informado.'}
                </div>
              </div>
            )}

            {/* Metrics & Study Progress */}
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-500" />
                Desempenho Pedagógico
              </h5>
              {loadingDetails ? (
                <div className="text-center py-4 text-slate-700 dark:text-slate-300">Carregando métricas...</div>
              ) : userDetails ? (
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-700 dark:text-slate-300 block text-[11px]">Respondidas</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {userDetails.stats?.totalAnswered || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-700 dark:text-slate-300 block text-[11px]">Acertos</span>
                    <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                      {userDetails.stats?.totalCorrect || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-700 dark:text-slate-300 block text-[11px]">Taxa Acerto</span>
                    <span className="text-base font-bold text-indigo-800 dark:text-indigo-300">
                      {userDetails.stats?.accuracyRate || 0}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-slate-700 dark:text-slate-300 block text-[11px]">Ofensiva</span>
                    <span className="text-base font-bold text-amber-800 dark:text-amber-300">
                      🔥 {userDetails.stats?.streakDays || 0}d
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Financial History */}
            {userDetails?.transactions?.length > 0 && (
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Transações & Pagamentos
                </h5>
                <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-1.5 px-3">Plano</th>
                        <th className="py-1.5 px-3">Valor</th>
                        <th className="py-1.5 px-3">Método</th>
                        <th className="py-1.5 px-3">Status</th>
                        <th className="py-1.5 px-3">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {userDetails.transactions.map((tx: any) => (
                        <tr key={tx.id}>
                          <td className="py-1.5 px-3 font-medium">{tx.planName}</td>
                          <td className="py-1.5 px-3">R$ {tx.amount}</td>
                          <td className="py-1.5 px-3">{tx.paymentMethod}</td>
                          <td className="py-1.5 px-3"><Badge variant="success" className="text-[9px]">{tx.status}</Badge></td>
                          <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Administrative Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewRole(selectedUser.role);
                    setIsRoleModalOpen(true);
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Alterar Papel (RBAC)
                </Button>

                {selectedUser.status === 'BLOCKED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTargetStatus('ACTIVE');
                      setIsBlockModalOpen(true);
                    }}
                    className="text-xs text-emerald-800 dark:text-emerald-300 border-emerald-300 flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Desbloquear Conta
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTargetStatus('BLOCKED');
                      setIsBlockModalOpen(true);
                    }}
                    className="text-xs text-red-800 dark:text-red-300 border-red-300 flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Bloquear Conta
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Block / Unblock Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title={targetStatus === 'BLOCKED' ? 'Confirmar Bloqueio de Usuário' : 'Desbloquear Usuário'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            Você está prestes a {targetStatus === 'BLOCKED' ? 'bloquear o acesso de' : 'reativar a conta de'}{' '}
            <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
          </p>

          {targetStatus === 'BLOCKED' && (
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Justificativa do Bloqueio (Obrigatório para Auditoria):
              </label>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Violação de diretrizes, contestação de pagamento, tentativa de fraude..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" onClick={() => setIsBlockModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateStatus}
              disabled={targetStatus === 'BLOCKED' && !blockReason.trim()}
              className={targetStatus === 'BLOCKED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
            >
              Confirmar {targetStatus === 'BLOCKED' ? 'Bloqueio' : 'Desbloqueio'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Change Modal (RBAC) */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Alterar Papel Administrativo (RBAC)"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            Selecione o nível de permissão concedido a <strong>{selectedUser?.name}</strong>. Esta ação é auditada.
          </p>

          <div className="space-y-2">
            {[
              { role: 'STUDENT', label: 'Aluno (Padrão)', desc: 'Acesso às áreas de estudo, simulados e cadernos.' },
              { role: 'SUPPORT', label: 'Suporte', desc: 'Acesso a chamados de suporte, reportes e consulta de usuários.' },
              { role: 'CONTENT_EDITOR', label: 'Editor de Conteúdo', desc: 'Gerenciamento do banco de questões, disciplinas e concursos.' },
              { role: 'FINANCIAL', label: 'Financeiro', desc: 'Gerenciamento de planos, assinaturas e pagamentos.' },
              { role: 'ADMIN', label: 'Administrador', desc: 'Gerenciamento geral da plataforma com privilégios elevados.' },
              { role: 'SUPERADMIN', label: 'Superadministrador', desc: 'Acesso irrestrito a todas as configurações e banco de dados.' }
            ].map((r) => (
              <label
                key={r.role}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  newRole === r.role
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  value={r.role}
                  checked={newRole === r.role}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{r.label}</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">{r.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleUpdateRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Salvar Alteração
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
