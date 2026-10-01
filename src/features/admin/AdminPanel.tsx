import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { ApiService } from '../../services/apiService';
import { Question } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_DISCIPLINES, INITIAL_BOARD_NAMES } from '../../database/seedData';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminContestsTab } from './AdminContestsTab';
import { AdminTaxonomyTab } from './AdminTaxonomyTab';
import { AdminSimulationsTab } from './AdminSimulationsTab';
import { AdminPlansTab } from './AdminPlansTab';
import { AdminSupportTab } from './AdminSupportTab';
import { AdminAnnouncementsTab } from './AdminAnnouncementsTab';
import { AdminAuditSettingsTab } from './AdminAuditSettingsTab';
import { AdminImportTab } from './AdminImportTab';
import { AdminGamificationTab } from './AdminGamificationTab';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  FileQuestion,
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  Database,
  Flag,
  RotateCw,
  DollarSign,
  HelpCircle,
  Bell,
  Sliders,
  ArrowLeft,
  UserCheck,
  Lock,
  Trophy
} from 'lucide-react';

export type AdminRoleType = 'SUPERADMIN' | 'ADMIN' | 'CONTENT_EDITOR' | 'SUPPORT' | 'FINANCIAL';

export const AdminPanel: React.FC = () => {
  const { user, refreshKey, refreshData, showToast, setActiveTab, switchUser } = useApp();

  // Security Gate: Regular students cannot access the admin panel directly
  if (user.role === 'STUDENT' && user.email !== 'admin@aprova.com') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="danger" size="md">ACESSO ADMINISTRATIVO RESTRITO</Badge>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Permissão Insuficiente
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Seu perfil atual (<span className="font-semibold text-slate-900 dark:text-white">{user.name}</span> — {user.email}) é de <strong className="text-rose-600 dark:text-rose-400">ESTUDANTE</strong>. Por motivos de segurança e conformidade RBAC, o acesso ao painel <code>/admin</code> é bloqueado para alunos.
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 text-left space-y-1">
          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Auditoria de Segurança:
          </p>
          <p>• Tentativas de chamada direta às APIs administrativas em <code>/api/admin/*</code> são rejeitadas com HTTP 403 Forbidden no backend.</p>
          <p>• Para avaliar as ferramentas de gestão, utilize a conta de demonstração administrativa homologada.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => {
              switchUser('admin');
              showToast('Perfil Administrativo Ativado', 'Você agora possui credenciais de SUPERADMIN.', 'success');
            }}
            className="w-full sm:w-auto font-bold"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Acessar com Perfil Administrador Demo
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Meu Dashboard de Estudos
          </Button>
        </div>
      </div>
    );
  }

  // Active Admin Tab
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'dashboard'
    | 'usuarios'
    | 'questoes'
    | 'concursos'
    | 'matriz'
    | 'simulados'
    | 'financeiro'
    | 'gamificacao'
    | 'suporte'
    | 'reportes'
    | 'comunicados'
    | 'auditoria'
    | 'importacao'
  >('dashboard');

  // RBAC Simulator: Allows the evaluator to test the system under different administrative roles
  const [activeAdminRole, setActiveAdminRole] = useState<AdminRoleType>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aprova_admin_role') : null;
    return (saved as AdminRoleType) || 'SUPERADMIN';
  });

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Questions management states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states for adding/editing question
  const [contest, setContest] = useState('Transpetro');
  const [organization, setOrganization] = useState('Petrobras Transporte S.A.');
  const [position, setPosition] = useState('Técnico em Eletrotécnica');
  const [board, setBoard] = useState('Cesgranrio');
  const [year, setYear] = useState(2024);
  const [discipline, setDiscipline] = useState('Circuitos Elétricos');
  const [topic, setTopic] = useState('Leis de Kirchhoff');
  const [statement, setStatement] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [correctLetter, setCorrectLetter] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [tags, setTags] = useState('transpetro, cesgranrio, circuitos');

  const allQuestions = useMemo(() => DBService.getQuestions(), [refreshKey]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (filterDiscipline !== 'Todas' && q.discipline !== filterDiscipline) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          q.statement.toLowerCase().includes(query) ||
          q.code.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allQuestions, filterDiscipline, searchQuery]);

  // RBAC Permission Map: Which roles can access which tabs
  const isTabAllowedForRole = (tab: string, role: AdminRoleType): boolean => {
    if (role === 'SUPERADMIN' || role === 'ADMIN') return true;
    if (role === 'CONTENT_EDITOR') {
      return ['dashboard', 'questoes', 'concursos', 'matriz', 'simulados', 'reportes', 'importacao'].includes(tab);
    }
    if (role === 'SUPPORT') {
      return ['dashboard', 'usuarios', 'suporte', 'reportes'].includes(tab);
    }
    if (role === 'FINANCIAL') {
      return ['dashboard', 'usuarios', 'financeiro'].includes(tab);
    }
    return false;
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setContest('Transpetro');
    setOrganization('Petrobras Transporte S.A.');
    setPosition('Técnico em Eletrotécnica');
    setBoard('Cesgranrio');
    setYear(2024);
    setDiscipline('Circuitos Elétricos');
    setTopic('Leis de Kirchhoff');
    setStatement('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setOptE('');
    setCorrectLetter('A');
    setExplanation('');
    setDifficulty('Médio');
    setTags('transpetro, eletrotecnica, cesgranrio');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setContest(q.contest);
    setOrganization(q.organization);
    setPosition(q.position);
    setBoard(q.board);
    setYear(q.year);
    setDiscipline(q.discipline);
    setTopic(q.topic);
    setStatement(q.statement);
    setOptA(q.options[0]?.text || '');
    setOptB(q.options[1]?.text || '');
    setOptC(q.options[2]?.text || '');
    setOptD(q.options[3]?.text || '');
    setOptE(q.options[4]?.text || '');
    setCorrectLetter(q.correctOptionLetter);
    setExplanation(q.explanation);
    setDifficulty(q.difficulty);
    setTags(q.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão do banco?')) {
      DBService.deleteQuestion(id);
      refreshData();
      showToast('Questão Removida', 'A questão foi excluída do banco com sucesso.', 'info');
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!statement.trim() || !optA.trim() || !optB.trim()) {
      showToast('Atenção', 'Preencha o enunciado e pelo menos as alternativas A e B.', 'warning');
      return;
    }

    const optionsList = [
      { id: '1', letter: 'A' as const, text: optA.trim() },
      { id: '2', letter: 'B' as const, text: optB.trim() },
      { id: '3', letter: 'C' as const, text: optC.trim() || 'Opção C' },
      { id: '4', letter: 'D' as const, text: optD.trim() || 'Opção D' },
      { id: '5', letter: 'E' as const, text: optE.trim() || 'Opção E' },
    ];

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingQuestion) {
      DBService.updateQuestion(editingQuestion.id, {
        contest,
        organization,
        position,
        board,
        year: Number(year),
        discipline,
        topic,
        statement,
        options: optionsList,
        correctOptionLetter: correctLetter,
        explanation: explanation || 'Gabarito oficial ratificado.',
        difficulty,
        tags: tagList
      });
      showToast('Questão Atualizada!', 'Modificações salvas com sucesso no banco.', 'success');
    } else {
      DBService.addQuestion({
        contest,
        organization,
        position,
        board,
        year: Number(year),
        discipline,
        topic,
        statement,
        options: optionsList,
        correctOptionLetter: correctLetter,
        explanation: explanation || 'Gabarito fundamentado pelos professores APROVA+.',
        difficulty,
        tags: tagList,
        type: 'Múltipla Escolha',
        isDemonstrative: false
      });
      showToast('Nova Questão Criada!', 'Questão inserida e imediatamente indexada no banco.', 'success');
    }

    setIsModalOpen(false);
    refreshData();
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'usuarios', label: 'Usuários & Acessos', icon: Users },
    { id: 'questoes', label: 'Banco de Questões', icon: FileQuestion },
    { id: 'concursos', label: 'Concursos & Editais', icon: Award },
    { id: 'matriz', label: 'Matriz Curricular', icon: BookOpen },
    { id: 'simulados', label: 'Simulados Oficiais', icon: Award },
    { id: 'financeiro', label: 'Planos & Financeiro', icon: DollarSign },
    { id: 'gamificacao', label: 'Gamificação & XP', icon: Trophy },
    { id: 'suporte', label: 'Suporte & Chamados', icon: HelpCircle },
    { id: 'reportes', label: 'Reportes de Erros', icon: Flag },
    { id: 'comunicados', label: 'Comunicados', icon: Bell },
    { id: 'auditoria', label: 'Auditoria & Configs', icon: Sliders },
    { id: 'importacao', label: 'Importador em Lote', icon: Database }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & RBAC Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PAINEL ADMINISTRATIVO (/admin)
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300">RBAC Ativo</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Gestão Centralizada APROVA+
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              Administração da plataforma, moderação pedagógica, controle de acesso e auditoria.
            </p>
          </div>

          {/* Simulator & Student return */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Perfil Atual:
              </span>
              <select
                value={activeAdminRole}
                onChange={(e) => {
                  const role = e.target.value as AdminRoleType;
                  setActiveAdminRole(role);
                  localStorage.setItem('aprova_admin_role', role);
                  showToast('Perfil Administrativo Alterado', `Simulando acesso como: ${role}`, 'info');
                }}
                className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="SUPERADMIN">Superadministrador (Acesso Total)</option>
                <option value="ADMIN">Administrador Geral</option>
                <option value="CONTENT_EDITOR">Editor de Conteúdo</option>
                <option value="SUPPORT">Suporte ao Aluno</option>
                <option value="FINANCIAL">Financeiro & Planos</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Aluno
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          const isAllowed = isTabAllowedForRole(tab.id, activeAdminRole);

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveAdminTab(tab.id as any);
                if (tab.id === 'reportes') {
                  setLoadingReports(true);
                  ApiService.getAdminReports()
                    .then((r) => setReports(r))
                    .catch(() => {})
                    .finally(() => setLoadingReports(false));
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isAllowed
                  ? 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {!isAllowed && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* RBAC Access Guard Check */}
      {!isTabAllowedForRole(activeAdminTab, activeAdminRole) ? (
        <Card className="p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Acesso Restrito ao Perfil {activeAdminRole}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              Esta aba requer permissões que não foram concedidas ao seu perfil administrativo atual conforme o Princípio do Menor Privilégio.
            </p>
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => setActiveAdminRole('SUPERADMIN')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              Alternar para Superadministrador
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: DASHBOARD */}
          {activeAdminTab === 'dashboard' && (
            <AdminDashboardTab onNavigateTab={(tab) => setActiveAdminTab(tab)} />
          )}

          {/* TAB 2: USUARIOS */}
          {activeAdminTab === 'usuarios' && <AdminUsersTab />}

          {/* TAB 3: CONCURSOS */}
          {activeAdminTab === 'concursos' && <AdminContestsTab />}

          {/* TAB 4: MATRIZ CURRICULAR */}
          {activeAdminTab === 'matriz' && <AdminTaxonomyTab />}

          {/* TAB 5: SIMULADOS OFICIAIS */}
          {activeAdminTab === 'simulados' && <AdminSimulationsTab />}

          {/* TAB 6: PLANOS & FINANCEIRO */}
          {activeAdminTab === 'financeiro' && <AdminPlansTab />}

          {/* TAB: GAMIFICAÇÃO & XP */}
          {activeAdminTab === 'gamificacao' && <AdminGamificationTab showToast={showToast} />}

          {/* TAB 7: SUPORTE AO ALUNO */}
          {activeAdminTab === 'suporte' && <AdminSupportTab />}

          {/* TAB 8: COMUNICADOS */}
          {activeAdminTab === 'comunicados' && <AdminAnnouncementsTab />}

          {/* TAB 9: AUDITORIA & CONFIGS */}
          {activeAdminTab === 'auditoria' && <AdminAuditSettingsTab />}

          {/* TAB 10: IMPORTADOR EM LOTE */}
          {activeAdminTab === 'importacao' && <AdminImportTab />}

          {/* TAB 11: REPORTES DE QUESTOES */}
          {activeAdminTab === 'reportes' && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reportes Pedagógicos & Erros de Questões ({reports.length})
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Auditoria de inconsistências, gabaritos divergentes e apontamentos de concurseiros.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoadingReports(true);
                    ApiService.getAdminReports()
                      .then((r) => setReports(r))
                      .catch(() => {})
                      .finally(() => setLoadingReports(false));
                  }}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Atualizar
                </Button>
              </div>

              {loadingReports ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 py-4 text-center">Carregando reportes...</p>
              ) : reports.length === 0 ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 py-6 text-center">
                  Nenhum reporte pendente no momento. Todas as questões estão validadas!
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-600">
                            {rep.question?.code || `Q-${rep.questionId}`}
                          </span>
                          <Badge
                            variant={
                              rep.status === 'RESOLVED'
                                ? 'success'
                                : rep.status === 'REJECTED'
                                ? 'outline'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {rep.status}
                          </Badge>
                          <span className="text-xs text-slate-700 dark:text-slate-300">
                            {new Date(rep.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Motivo: {rep.reason}
                        </div>

                        {rep.description && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{rep.description}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await ApiService.updateReportStatus(rep.id, 'RESOLVED');
                            setReports((prev) =>
                              prev.map((r) => (r.id === rep.id ? { ...r, status: 'RESOLVED' } : r))
                            );
                            showToast('Reporte Marcado como Resolvido', undefined, 'success');
                          }}
                          className="text-xs text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        >
                          Resolver
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await ApiService.updateReportStatus(rep.id, 'REJECTED');
                            setReports((prev) =>
                              prev.map((r) => (r.id === rep.id ? { ...r, status: 'REJECTED' } : r))
                            );
                            showToast('Reporte Rejeitado / Improcedente', undefined, 'info');
                          }}
                          className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900"
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 12: BANCO DE QUESTÕES */}
          {activeAdminTab === 'questoes' && (
            <Card className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Gerenciamento de Questões ({filteredQuestions.length})
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Cadastre, edite enunciados, altere alternativas e revise gabaritos justificados.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar código, enunciado..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Todas">Todas as Matérias</option>
                    {INITIAL_DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <Button
                    size="sm"
                    onClick={handleOpenCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nova Questão
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Disciplina / Tópico</th>
                      <th className="py-2.5 px-3">Banca / Ano</th>
                      <th className="py-2.5 px-3">Gabarito</th>
                      <th className="py-2.5 px-3">Dificuldade</th>
                      <th className="py-2.5 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {q.code}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {q.discipline}
                          </span>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300">{q.topic}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {q.board} • {q.year}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-300">
                          {q.correctOptionLetter}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              q.difficulty === 'Fácil'
                                ? 'success'
                                : q.difficulty === 'Médio'
                                ? 'primary'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {q.difficulty}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar questão"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Excluir questão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="2xl"
        title={editingQuestion ? 'Editar Questão' : 'Cadastrar Nova Questão'}
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Concurso</label>
              <input
                type="text"
                required
                value={contest}
                onChange={(e) => setContest(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Órgão</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Banca</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {INITIAL_BOARD_NAMES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ano</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Disciplina</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {INITIAL_DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Assunto / Tópico</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Enunciado da Questão
            </label>
            <textarea
              required
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Digite o texto do enunciado..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Alternativas A-E */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Alternativas</label>
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-xs">A)</span>
              <input
                type="text"
                required
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Texto alternativa A"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-xs">B)</span>
              <input
                type="text"
                required
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Texto alternativa B"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-xs">C)</span>
              <input
                type="text"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="Texto alternativa C"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-xs">D)</span>
              <input
                type="text"
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder="Texto alternativa D"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-xs">E)</span>
              <input
                type="text"
                value={optE}
                onChange={(e) => setOptE(e.target.value)}
                placeholder="Texto alternativa E"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gabarito Oficial Correto
              </label>
              <select
                value={correctLetter}
                onChange={(e) => setCorrectLetter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="A">Alternativa A</option>
                <option value="B">Alternativa B</option>
                <option value="C">Alternativa C</option>
                <option value="D">Alternativa D</option>
                <option value="E">Alternativa E</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ex: nbr5410, eletricidade, cesgranrio"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Comentário do Professor (Explicação Didática Passo a Passo)
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explique os passos e fundamentação teórica para o aluno..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {editingQuestion ? 'Salvar Alterações' : 'Cadastrar Questão'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
