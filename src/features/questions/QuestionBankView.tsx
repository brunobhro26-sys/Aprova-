import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/apiService';
import { SingleQuestionView } from './SingleQuestionView';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Filter,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  Star,
  Bookmark,
  Shuffle,
  ArrowRight,
  BookOpen,
  Calendar,
  Building,
  Briefcase,
  HelpCircle,
  Eye,
  Check
} from 'lucide-react';

export const QuestionBankView: React.FC = () => {
  const { user, showToast, refreshKey, initialQuestionFilter, setInitialQuestionFilter } = useApp();

  // Mode: list or single question resolution (/questoes/[id])
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Raw Database Data from Cloud SQL API
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Taxonomy Lists for Dependent Filters
  const [exams, setExams] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsTopics, setSubjectsTopics] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // User relations
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userWrongIds, setUserWrongIds] = useState<string[]>([]);

  // Filter States (Prompt 3 Requirements)
  const [contestFilter, setContestFilter] = useState('Todos');
  const [orgFilter, setOrgFilter] = useState('Todos');
  const [positionFilter, setPositionFilter] = useState('Todos');
  const [boardFilter, setBoardFilter] = useState('Todas');
  const [yearFilter, setYearFilter] = useState('Todos');
  const [disciplineFilter, setDisciplineFilter] = useState('Todas');
  const [subjectTopicFilter, setSubjectTopicFilter] = useState('Todos');
  const [topicFilter, setTopicFilter] = useState('Todos');
  const [difficultyFilter, setDifficultyFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'unsolved' | 'solved' | 'correct' | 'wrong' | 'favorites' | 'reviews'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<
    'recent' | 'oldest' | 'difficulty_desc' | 'difficulty_asc' | 'random'
  >('recent');

  // UI States
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Notebook quick modal
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [targetQuestionIdForNotebook, setTargetQuestionIdForNotebook] = useState<string | null>(null);
  const [notebooksList, setNotebooksList] = useState<any[]>([]);
  const [newNotebookName, setNewNotebookName] = useState('');

  // Initial Load from API
  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      const [
        qData,
        eData,
        oData,
        pData,
        bData,
        sData,
        stData,
        tData,
        favData,
        revData,
        wrongData
      ] = await Promise.all([
        ApiService.getQuestions({ limit: 1000 }),
        ApiService.getExams().catch(() => []),
        ApiService.getOrganizations().catch(() => []),
        ApiService.getPositions().catch(() => []),
        ApiService.getBoards().catch(() => []),
        ApiService.getSubjects().catch(() => []),
        ApiService.getSubjectsTopics().catch(() => []),
        ApiService.getTopics().catch(() => []),
        ApiService.getFavorites().catch(() => []),
        ApiService.getReviewQuestions().catch(() => []),
        ApiService.getWrongQuestions().catch(() => [])
      ]);

      const questionsList = Array.isArray(qData) ? qData : (qData?.questions || []);
      setQuestions(questionsList);
      setExams(eData || []);
      setOrganizations(oData || []);
      setPositions(pData || []);
      setBoards(bData || []);
      setSubjects(sData || []);
      setSubjectsTopics(stData || []);
      setTopics(tData || []);
      setUserFavorites(favData || []);
      setUserReviews(revData || []);
      setUserWrongIds((wrongData || []).map((w: any) => w.id));
    } catch (err) {
      console.error('Error fetching questions bank:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, [refreshKey]);

  // Handle external filter triggers (from other views or dashboard)
  useEffect(() => {
    if (initialQuestionFilter) {
      if (initialQuestionFilter.discipline) setDisciplineFilter(initialQuestionFilter.discipline);
      if (initialQuestionFilter.board) setBoardFilter(initialQuestionFilter.board);
      if (initialQuestionFilter.contest) setContestFilter(initialQuestionFilter.contest);
      if (initialQuestionFilter.mistakesOnly) setStatusFilter('wrong');
      if (initialQuestionFilter.favoritesOnly) setStatusFilter('favorites');
      setInitialQuestionFilter(null);
    }
  }, [initialQuestionFilter, setInitialQuestionFilter]);

  // --------------------------------------------------------------------------
  // 4. FILTROS INTELIGENTES (Dependent Cascade Filters)
  // --------------------------------------------------------------------------
  // Dependent Positions: Only positions related to selected contest
  const dependentPositions = useMemo(() => {
    if (contestFilter === 'Todos') return positions;
    const selectedExam = exams.find((e) => e.name === contestFilter || e.id === contestFilter);
    if (!selectedExam) return positions;
    // Return all positions for this exam or positions present in questions for this exam
    const examQuestions = questions.filter((q) => q.examId === selectedExam.id);
    const posIds = new Set(examQuestions.map((q) => q.positionId).filter(Boolean));
    const matched = positions.filter((p) => posIds.has(p.id));
    return matched.length > 0 ? matched : positions;
  }, [contestFilter, exams, positions, questions]);

  // Dependent Subjects: Only subjects related to selected position/contest
  const dependentSubjects = useMemo(() => {
    if (positionFilter === 'Todos' && contestFilter === 'Todos') return subjects;
    return subjects;
  }, [positionFilter, contestFilter, subjects]);

  // Dependent Assuntos (SubjectsTopics): When subject is chosen, show only its topics
  const dependentSubjectsTopics = useMemo(() => {
    if (disciplineFilter === 'Todas') return subjectsTopics;
    const selectedSubj = subjects.find(
      (s) => s.name === disciplineFilter || s.id === disciplineFilter
    );
    if (!selectedSubj) return subjectsTopics;
    return subjectsTopics.filter((st) => st.subjectId === selectedSubj.id);
  }, [disciplineFilter, subjects, subjectsTopics]);

  // Dependent Tópicos (Topics): When Assunto (subjectTopic) is chosen, show only its sub-topics
  const dependentTopics = useMemo(() => {
    if (subjectTopicFilter === 'Todos') {
      if (disciplineFilter !== 'Todas') {
        const allowedStIds = new Set(dependentSubjectsTopics.map((st) => st.id));
        return topics.filter((t) => allowedStIds.has(t.subjectTopicId));
      }
      return topics;
    }
    const selectedSt = subjectsTopics.find(
      (st) => st.name === subjectTopicFilter || st.id === subjectTopicFilter
    );
    if (!selectedSt) return topics;
    return topics.filter((t) => t.subjectTopicId === selectedSt.id);
  }, [subjectTopicFilter, disciplineFilter, dependentSubjectsTopics, subjectsTopics, topics]);

  // Reset Filters
  const handleClearFilters = () => {
    setContestFilter('Todos');
    setOrgFilter('Todos');
    setPositionFilter('Todos');
    setBoardFilter('Todas');
    setYearFilter('Todos');
    setDisciplineFilter('Todas');
    setSubjectTopicFilter('Todos');
    setTopicFilter('Todos');
    setDifficultyFilter('Todas');
    setTypeFilter('Todos');
    setStatusFilter('all');
    setSearchQuery('');
    setSortOption('recent');
    setCurrentPage(1);
  };

  // --------------------------------------------------------------------------
  // 3 & 5. FILTERING & SEARCH PIPELINE
  // --------------------------------------------------------------------------
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Concurso
      if (contestFilter !== 'Todos') {
        const examMatch = exams.find((e) => e.name === contestFilter || e.id === contestFilter);
        if (examMatch && q.examId !== examMatch.id) return false;
      }

      // 2. Órgão / Empresa
      if (orgFilter !== 'Todos') {
        const orgMatch = organizations.find((o) => o.name === orgFilter || o.id === orgFilter);
        if (orgMatch && q.organizationId !== orgMatch.id) return false;
      }

      // 3. Cargo
      if (positionFilter !== 'Todos') {
        const posMatch = positions.find((p) => p.name === positionFilter || p.id === positionFilter);
        if (posMatch && q.positionId !== posMatch.id) return false;
      }

      // 4. Banca
      if (boardFilter !== 'Todas') {
        const bMatch = boards.find(
          (b) => b.name === boardFilter || b.sigla === boardFilter || b.id === boardFilter
        );
        if (bMatch && q.boardId !== bMatch.id) return false;
      }

      // 5. Ano
      if (yearFilter !== 'Todos' && String(q.year) !== yearFilter) {
        return false;
      }

      // 6. Disciplina
      if (disciplineFilter !== 'Todas') {
        const sMatch = subjects.find((s) => s.name === disciplineFilter || s.id === disciplineFilter);
        if (sMatch && q.subjectId !== sMatch.id) return false;
      }

      // 7. Assunto (SubjectTopic)
      if (subjectTopicFilter !== 'Todos') {
        const stMatch = subjectsTopics.find(
          (st) => st.name === subjectTopicFilter || st.id === subjectTopicFilter
        );
        if (stMatch && q.subjectTopicId !== stMatch.id) return false;
      }

      // 8. Tópico
      if (topicFilter !== 'Todos') {
        const tMatch = topics.find((t) => t.name === topicFilter || t.id === topicFilter);
        if (tMatch && q.topicId !== tMatch.id) return false;
      }

      // 9. Dificuldade
      if (difficultyFilter !== 'Todas' && q.difficulty !== difficultyFilter) {
        return false;
      }

      // 10. Tipo
      if (typeFilter !== 'Todos' && q.type !== typeFilter) {
        return false;
      }

      // 11. Status do Usuário
      const isFav = userFavorites.some(
        (f) => f.itemId === q.id && f.itemType === 'question'
      );
      const isRev = userReviews.some((r) => r.id === q.id || r.questionId === q.id);
      const isWrong = userWrongIds.includes(q.id);

      if (statusFilter === 'favorites' && !isFav) return false;
      if (statusFilter === 'reviews' && !isRev) return false;
      if (statusFilter === 'wrong' && !isWrong) return false;

      // 12. Pesquisa Textual (Enunciado, Código, Explicação, Termo Técnico)
      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const inStatement = q.statement?.toLowerCase().includes(qLower);
        const inCode = q.code?.toLowerCase().includes(qLower);
        const inExplanation = q.explanation?.toLowerCase().includes(qLower);
        const inAlternatives = (q.alternatives || []).some((a: any) =>
          a.text?.toLowerCase().includes(qLower)
        );
        if (!inStatement && !inCode && !inExplanation && !inAlternatives) {
          return false;
        }
      }

      return true;
    });
  }, [
    questions,
    contestFilter,
    orgFilter,
    positionFilter,
    boardFilter,
    yearFilter,
    disciplineFilter,
    subjectTopicFilter,
    topicFilter,
    difficultyFilter,
    typeFilter,
    statusFilter,
    searchQuery,
    exams,
    organizations,
    positions,
    boards,
    subjects,
    subjectsTopics,
    topics,
    userFavorites,
    userReviews,
    userWrongIds
  ]);

  // --------------------------------------------------------------------------
  // 6. ORDENAÇÃO
  // --------------------------------------------------------------------------
  const sortedQuestions = useMemo(() => {
    const list = [...filteredQuestions];
    switch (sortOption) {
      case 'oldest':
        return list.sort((a, b) => (a.year || 0) - (b.year || 0));
      case 'difficulty_desc':
        return list.sort((a, b) => {
          const map: Record<string, number> = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
          return (map[b.difficulty] || 2) - (map[a.difficulty] || 2);
        });
      case 'difficulty_asc':
        return list.sort((a, b) => {
          const map: Record<string, number> = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
          return (map[a.difficulty] || 2) - (map[b.difficulty] || 2);
        });
      case 'random':
        return list.sort(() => Math.random() - 0.5);
      case 'recent':
      default:
        return list.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
  }, [filteredQuestions, sortOption]);

  // --------------------------------------------------------------------------
  // 7. PAGINAÇÃO
  // --------------------------------------------------------------------------
  const totalPages = Math.ceil(sortedQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedQuestions.slice(start, start + pageSize);
  }, [sortedQuestions, currentPage, pageSize]);

  // Active filters count for mobile indicator (Prompt 8)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (contestFilter !== 'Todos') count++;
    if (orgFilter !== 'Todos') count++;
    if (positionFilter !== 'Todos') count++;
    if (boardFilter !== 'Todas') count++;
    if (yearFilter !== 'Todos') count++;
    if (disciplineFilter !== 'Todas') count++;
    if (subjectTopicFilter !== 'Todos') count++;
    if (topicFilter !== 'Todos') count++;
    if (difficultyFilter !== 'Todas') count++;
    if (typeFilter !== 'Todos') count++;
    if (statusFilter !== 'all') count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [
    contestFilter,
    orgFilter,
    positionFilter,
    boardFilter,
    yearFilter,
    disciplineFilter,
    subjectTopicFilter,
    topicFilter,
    difficultyFilter,
    typeFilter,
    statusFilter,
    searchQuery
  ]);

  // Quick Action: Questão Aleatória
  const handleRandomQuestion = () => {
    if (sortedQuestions.length === 0) {
      showToast('Nenhuma questão disponível', 'Tente relaxar os filtros aplicados.', 'info');
      return;
    }
    const randomIndex = Math.floor(Math.random() * sortedQuestions.length);
    setActiveQuestionId(sortedQuestions[randomIndex].id);
  };

  // Quick Action: Favoritar na listagem
  const handleQuickFavorite = async (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await ApiService.toggleFavorite('question', qId);
      if (res.status === 'added') {
        setUserFavorites((prev) => [...prev, { itemType: 'question', itemId: qId }]);
        showToast('Adicionada aos favoritos!', undefined, 'success');
      } else {
        setUserFavorites((prev) => prev.filter((f) => f.itemId !== qId));
        showToast('Removida dos favoritos', undefined, 'info');
      }
    } catch (e) {
      showToast('Erro ao favoritar', undefined, 'error');
    }
  };

  // Quick Action: Abrir modal de Caderno
  const handleOpenNotebook = async (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetQuestionIdForNotebook(qId);
    setNotebookModalOpen(true);
    try {
      const nbs = await ApiService.getNotebooks();
      setNotebooksList(nbs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToNotebook = async (nbId: string) => {
    if (!targetQuestionIdForNotebook) return;
    try {
      await ApiService.addQuestionToNotebook(nbId, targetQuestionIdForNotebook);
      setNotebookModalOpen(false);
      showToast('Adicionada ao caderno!', undefined, 'success');
    } catch (e: any) {
      showToast('Aviso', e.message || 'Questão já incluída no caderno', 'warning');
    }
  };

  const handleCreateAndSaveNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim() || !targetQuestionIdForNotebook) return;
    try {
      const created = await ApiService.createNotebook(newNotebookName.trim());
      await ApiService.addQuestionToNotebook(created.id, targetQuestionIdForNotebook);
      setNotebookModalOpen(false);
      setNewNotebookName('');
      showToast('Caderno criado e questão adicionada!', undefined, 'success');
    } catch (e) {
      showToast('Erro ao criar caderno', undefined, 'error');
    }
  };

  // If a single question is selected, render the dedicated screen /questoes/[id]
  if (activeQuestionId) {
    return (
      <SingleQuestionView
        questionId={activeQuestionId}
        onBackToList={() => {
          setActiveQuestionId(null);
          loadDatabaseData(); // refresh attempts and favorites
        }}
        onNavigateQuestion={(nextId) => setActiveQuestionId(nextId)}
        allQuestionIds={sortedQuestions.map((q) => q.id)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 2. Top Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Banco de Questões
            </h1>
            <Badge variant="primary" size="md" className="font-bold">
              {filteredQuestions.length} questões encontradas
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Encontre, filtre com inteligência e resolva questões reais de concursos com gabarito fundamentado.
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomQuestion}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            <Shuffle className="w-4 h-4" />
            Questão Aleatória
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.innerWidth < 640) {
                setIsMobileFilterDrawerOpen(true);
              } else {
                setFiltersOpen(!filtersOpen);
              }
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="sm:hidden">
              Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </span>
            <span className="hidden sm:inline">
              {filtersOpen ? 'Recolher Filtros' : 'Mostrar Filtros'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* 3 & 4. Painel de Filtros Inteligentes e Combináveis */}
      {filtersOpen && (
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
          {/* 5. Barra de Pesquisa Textual */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Pesquise por palavras, Lei de Ohm, NBR 5410, termos técnicos ou conteúdo do enunciado..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider mr-2 text-[10px]">
              Status:
            </span>
            {[
              { id: 'all', label: 'Todas as Questões' },
              { id: 'wrong', label: 'Caderno de Erros (Erradas)' },
              { id: 'favorites', label: 'Favoritas ⭐' },
              { id: 'reviews', label: 'Para Revisar 🔄' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st.id
                    ? 'bg-primary-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Grid de Filtros Dependentes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Concurso */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Concurso
              </label>
              <select
                value={contestFilter}
                onChange={(e) => {
                  setContestFilter(e.target.value);
                  setPositionFilter('Todos');
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todos">Todos os Concursos</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Órgão / Empresa */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Órgão / Empresa
              </label>
              <select
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todos">Todos os Órgãos</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cargo (Dependente do Concurso) */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Cargo
              </label>
              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todos">Todos os Cargos</option>
                {dependentPositions.map((pos) => (
                  <option key={pos.id} value={pos.name}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Banca */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Banca Organizadora
              </label>
              <select
                value={boardFilter}
                onChange={(e) => {
                  setBoardFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todas">Todas as Bancas</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} {b.sigla ? `(${b.sigla})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Disciplina */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Disciplina
              </label>
              <select
                value={disciplineFilter}
                onChange={(e) => {
                  setDisciplineFilter(e.target.value);
                  setSubjectTopicFilter('Todos');
                  setTopicFilter('Todos');
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todas">Todas as Disciplinas</option>
                {dependentSubjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assunto (Dependente da Disciplina) */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Assunto
              </label>
              <select
                value={subjectTopicFilter}
                onChange={(e) => {
                  setSubjectTopicFilter(e.target.value);
                  setTopicFilter('Todos');
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todos">Todos os Assuntos</option>
                {dependentSubjectsTopics.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tópico (Dependente do Assunto) */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tópico Específico
              </label>
              <select
                value={topicFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todos">Todos os Tópicos</option>
                {dependentTopics.map((top) => (
                  <option key={top.id} value={top.name}>
                    {top.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dificuldade */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Dificuldade
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Todas">Todas as Dificuldades</option>
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Rodapé de Ordenação */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Ordenar por:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="recent">Mais recentes (Ano decrescente)</option>
                <option value="oldest">Mais antigas (Ano crescente)</option>
                <option value="difficulty_desc">Maior dificuldade</option>
                <option value="difficulty_asc">Menor dificuldade</option>
                <option value="random">Aleatório</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Página {currentPage} de {totalPages} ({filteredQuestions.length} questões)
            </span>
          </div>
        </div>
      )}

      {/* Prompt 8 Requirement 5: Painel de Filtros em Formato de Gaveta / Janela Inferior (Mobile Bottom Sheet) */}
      {isMobileFilterDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative z-10 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Top Indicator & Header */}
            <div className="pt-3 px-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Filtros de Questões
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Body */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Pesquisa Textual */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pesquisar no Enunciado
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Ex: Lei de Ohm, NBR 5410, potência..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Situação
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Todas as Questões' },
                    { id: 'wrong', label: 'Caderno de Erros ❌' },
                    { id: 'favorites', label: 'Favoritas ⭐' },
                    { id: 'reviews', label: 'Para Revisar 🔄' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setStatusFilter(st.id as any);
                        setCurrentPage(1);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                        statusFilter === st.id
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dependent Selects */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Concurso
                  </label>
                  <select
                    value={contestFilter}
                    onChange={(e) => {
                      setContestFilter(e.target.value);
                      setPositionFilter('Todos');
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todos">Todos os Concursos</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.name}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cargo
                  </label>
                  <select
                    value={positionFilter}
                    onChange={(e) => {
                      setPositionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todos">Todos os Cargos</option>
                    {dependentPositions.map((pos) => (
                      <option key={pos.id} value={pos.name}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Disciplina
                  </label>
                  <select
                    value={disciplineFilter}
                    onChange={(e) => {
                      setDisciplineFilter(e.target.value);
                      setSubjectTopicFilter('Todos');
                      setTopicFilter('Todos');
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todas">Todas as Disciplinas</option>
                    {dependentSubjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Banca
                  </label>
                  <select
                    value={boardFilter}
                    onChange={(e) => {
                      setBoardFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Todas">Todas as Bancas</option>
                    {boards.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dificuldade
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Todas', 'Fácil', 'Médio', 'Difícil'].map((dif) => (
                      <button
                        key={dif}
                        type="button"
                        onClick={() => {
                          setDifficultyFilter(dif);
                          setCurrentPage(1);
                        }}
                        className={`p-2 rounded-lg font-semibold text-center ${
                          difficultyFilter === dif
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dif}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ordenar Resultados
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="recent">Mais recentes (Ano decrescente)</option>
                    <option value="oldest">Mais antigas (Ano crescente)</option>
                    <option value="difficulty_desc">Maior dificuldade</option>
                    <option value="difficulty_asc">Menor dificuldade</option>
                    <option value="random">Aleatório</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Sticky Action Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Limpar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsMobileFilterDrawerOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="font-bold flex-1 text-xs bg-indigo-600 text-white py-2.5 shadow-md shadow-indigo-600/30"
              >
                Ver {filteredQuestions.length} Questões
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt 8: Mobile Floating Filter Action Pill */}
      <div className="sm:hidden fixed bottom-20 right-4 z-20">
        <button
          onClick={() => setIsMobileFilterDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/40 text-xs font-bold border border-indigo-400/30 cursor-pointer active:scale-95 transition-transform"
          aria-label="Abrir gaveta de filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Questões */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="text-sm text-slate-500">Consultando banco de dados PostgreSQL...</p>
        </div>
      ) : paginatedQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhuma questão encontrada com estes filtros
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Experimente limpar ou ampliar os filtros de disciplina, concurso ou banca para encontrar mais itens.
          </p>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Limpar todos os filtros
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedQuestions.map((q) => {
            const isFav = userFavorites.some(
              (f) => f.itemId === q.id && f.itemType === 'question'
            );
            const isWrong = userWrongIds.includes(q.id);

            return (
              <div
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 transition-all cursor-pointer group"
              >
                {/* Cabeçalho da Questão */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      {q.code || `Q-${q.id.slice(0, 8)}`}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {q.year || '2024'} • {boards.find((b) => b.id === q.boardId)?.sigla || boards.find((b) => b.id === q.boardId)?.name || 'CESGRANRIO'}
                    </span>
                    <Badge
                      variant={
                        q.difficulty === 'Fácil'
                          ? 'success'
                          : q.difficulty === 'Difícil'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {q.difficulty || 'Médio'}
                    </Badge>
                    {isWrong && (
                      <Badge variant="danger" size="sm" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Caderno de Erros
                      </Badge>
                    )}
                  </div>

                  {/* Ações Rápidas na listagem */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleQuickFavorite(q.id, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={(e) => handleOpenNotebook(q.id, e)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Adicionar ao Caderno"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hierarquia */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center flex-wrap gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {exams.find((e) => e.id === q.examId)?.name || organizations.find((o) => o.id === q.organizationId)?.name || 'Concurso Público'} — {positions.find((p) => p.id === q.positionId)?.name || 'Geral'}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {subjects.find((s) => s.id === q.subjectId)?.name || 'Disciplina Geral'}
                  </span>
                  {(q.subjectTopicId || q.topicId) && (
                    <>
                      <span>→</span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {subjectsTopics.find((st) => st.id === q.subjectTopicId)?.name || topics.find((t) => t.id === q.topicId)?.name || 'Assunto'}
                      </span>
                    </>
                  )}
                </div>

                {/* Enunciado Preview */}
                <p className="text-sm md:text-base text-slate-800 dark:text-slate-100 line-clamp-3 leading-relaxed mb-4 group-hover:text-primary-900 dark:group-hover:text-primary-100 transition-colors">
                  {q.statement}
                </p>

                {/* Rodapé com botão Resolver */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400">
                    {(q.alternatives || []).length} alternativas disponíveis
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 font-semibold group-hover:shadow-sm"
                  >
                    <span>Resolver Questão</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* MODAL: Adicionar ao Caderno */}
      <Modal
        isOpen={notebookModalOpen}
        onClose={() => setNotebookModalOpen(false)}
        title="Adicionar Questão ao Caderno"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Cadernos Disponíveis
            </label>
            {notebooksList.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">Nenhum caderno criado até o momento.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {notebooksList.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => handleSaveToNotebook(nb.id)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all flex items-center justify-between"
                  >
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                      {nb.title}
                    </span>
                    <span className="text-xs text-slate-400">Adicionar</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleCreateAndSaveNotebook} className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Criar Novo Caderno
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Ex: Questões Chave Transpetro"
                className="flex-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
              />
              <Button type="submit" variant="primary" size="sm">
                Criar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
