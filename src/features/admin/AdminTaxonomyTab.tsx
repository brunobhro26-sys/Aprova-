import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { TaxonomyDiscipline, TaxonomySubject, TaxonomyTopic } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  BookOpen,
  Layers,
  ListTree,
  Plus,
  Edit2,
  Trash2,
  MoveRight,
  Search,
  CheckCircle2
} from 'lucide-react';

export const AdminTaxonomyTab: React.FC = () => {
  const { showToast, refreshData } = useApp();

  const [disciplines, setDisciplines] = useState<TaxonomyDiscipline[]>(() =>
    DBService.getTaxonomyDisciplines()
  );
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    disciplines[0]?.id || ''
  );
  const [subjects, setSubjects] = useState<TaxonomySubject[]>(() =>
    DBService.getTaxonomySubjects(selectedDisciplineId)
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [topics, setTopics] = useState<TaxonomyTopic[]>(() =>
    DBService.getTaxonomyTopics(selectedSubjectId)
  );

  // Modals state
  const [newDisciplineModal, setNewDisciplineModal] = useState(false);
  const [newDisciplineName, setNewDisciplineName] = useState('');

  const [newSubjectModal, setNewSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [newTopicModal, setNewTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [moveTopicModal, setMoveTopicModal] = useState<TaxonomyTopic | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState('');

  // Handle discipline selection change
  const handleSelectDiscipline = (dId: string) => {
    setSelectedDisciplineId(dId);
    const subList = DBService.getTaxonomySubjects(dId);
    setSubjects(subList);
    if (subList.length > 0) {
      setSelectedSubjectId(subList[0].id);
      setTopics(DBService.getTaxonomyTopics(subList[0].id));
    } else {
      setSelectedSubjectId('');
      setTopics([]);
    }
  };

  // Handle subject selection change
  const handleSelectSubject = (sId: string) => {
    setSelectedSubjectId(sId);
    setTopics(DBService.getTaxonomyTopics(sId));
  };

  // Add Discipline
  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisciplineName.trim()) return;
    const added = DBService.addTaxonomyDiscipline({
      name: newDisciplineName,
      code: newDisciplineName.slice(0, 3).toUpperCase(),
      questionCount: 0
    });
    setDisciplines(DBService.getTaxonomyDisciplines());
    setNewDisciplineName('');
    setNewDisciplineModal(false);
    showToast('Disciplina criada', `"${added.name}" adicionada à matriz curricular.`, 'success');
  };

  // Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedDisciplineId) return;
    const currentDisc = disciplines.find((d) => d.id === selectedDisciplineId);
    const added = DBService.addTaxonomySubject({
      disciplineId: selectedDisciplineId,
      disciplineName: currentDisc?.name || 'Geral',
      name: newSubjectName
    });
    setSubjects(DBService.getTaxonomySubjects(selectedDisciplineId));
    setNewSubjectName('');
    setNewSubjectModal(false);
    showToast('Assunto criado', `"${added.name}" adicionado.`, 'success');
  };

  // Add Topic
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubjectId) return;
    const currentSub = subjects.find((s) => s.id === selectedSubjectId);
    const added = DBService.addTaxonomyTopic({
      subjectId: selectedSubjectId,
      subjectName: currentSub?.name || 'Geral',
      name: newTopicName
    });
    setTopics(DBService.getTaxonomyTopics(selectedSubjectId));
    setNewTopicName('');
    setNewTopicModal(false);
    showToast('Tópico criado', `"${added.name}" adicionado com sucesso.`, 'success');
  };

  // Move Topic between Subjects (Prompt Master Item 32)
  const handleConfirmMoveTopic = () => {
    if (!moveTopicModal || !targetSubjectId) return;
    const success = DBService.moveTopic(moveTopicModal.id, targetSubjectId);
    if (success) {
      setTopics(DBService.getTaxonomyTopics(selectedSubjectId));
      setMoveTopicModal(null);
      showToast('Tópico Movido!', 'O tópico foi remanejado para o novo assunto selecionado.', 'success');
    }
  };

  const handleDeleteTopic = (topicId: string, name: string) => {
    if (confirm(`Excluir tópico "${name}"?`)) {
      DBService.deleteTaxonomyTopic(topicId);
      setTopics(DBService.getTaxonomyTopics(selectedSubjectId));
      showToast('Tópico removido', 'Registro excluído da matriz.', 'info');
    }
  };

  const allSubjects = DBService.getTaxonomySubjects();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Matriz Curricular: Disciplinas, Assuntos & Tópicos
          </h3>
          <p className="text-xs text-slate-500">
            Estrutura hierárquica oficial de conteúdos programáticos com suporte a realocação dinâmica de tópicos.
          </p>
        </div>
      </div>

      {/* 3-Column Hierarchy Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Disciplinas */}
        <Card className="p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              1. Disciplinas ({disciplines.length})
            </span>
            <Button
              size="sm"
              onClick={() => setNewDisciplineModal(true)}
              className="text-xs py-1 px-2.5 h-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nova
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pt-2 space-y-1">
            {disciplines.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDiscipline(d.id)}
                className={`w-full text-left p-2.5 rounded-xl transition text-xs font-semibold flex items-center justify-between ${
                  selectedDisciplineId === d.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{d.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedDisciplineId === d.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {d.code || 'DISC'}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Column 2: Assuntos */}
        <Card className="p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              2. Assuntos ({subjects.length})
            </span>
            <Button
              size="sm"
              onClick={() => setNewSubjectModal(true)}
              disabled={!selectedDisciplineId}
              className="text-xs py-1 px-2.5 h-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pt-2 space-y-1">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSubject(s.id)}
                className={`w-full text-left p-2.5 rounded-xl transition text-xs font-semibold flex items-center justify-between ${
                  selectedSubjectId === s.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{s.name}</span>
              </button>
            ))}

            {subjects.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum assunto cadastrado nesta disciplina.
              </div>
            )}
          </div>
        </Card>

        {/* Column 3: Tópicos com Mover Tópico (Item 32) */}
        <Card className="p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ListTree className="w-4 h-4" />
              3. Tópicos ({topics.length})
            </span>
            <Button
              size="sm"
              onClick={() => setNewTopicModal(true)}
              disabled={!selectedSubjectId}
              className="text-xs py-1 px-2.5 h-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pt-2 space-y-2">
            {topics.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {t.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setMoveTopicModal(t);
                      setTargetSubjectId(selectedSubjectId);
                    }}
                    title="Mover tópico para outro assunto"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(t.id, t.name)}
                    title="Excluir tópico"
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {topics.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum tópico cadastrado neste assunto.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal: Nova Disciplina */}
      <Modal
        isOpen={newDisciplineModal}
        onClose={() => setNewDisciplineModal(false)}
        title="Cadastrar Nova Disciplina"
      >
        <form onSubmit={handleAddDiscipline} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Nome da Disciplina *
            </label>
            <input
              type="text"
              value={newDisciplineName}
              onChange={(e) => setNewDisciplineName(e.target.value)}
              placeholder="Ex: Direito Administrativo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setNewDisciplineModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Novo Assunto */}
      <Modal
        isOpen={newSubjectModal}
        onClose={() => setNewSubjectModal(false)}
        title="Cadastrar Novo Assunto"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Nome do Assunto *
            </label>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Ex: Atos Administrativos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setNewSubjectModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Novo Tópico */}
      <Modal
        isOpen={newTopicModal}
        onClose={() => setNewTopicModal(false)}
        title="Cadastrar Novo Tópico"
      >
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Nome do Tópico *
            </label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Ex: Revogação e Anulação de Atos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setNewTopicModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Mover Tópico (Item 32) */}
      {moveTopicModal && (
        <Modal
          isOpen={!!moveTopicModal}
          onClose={() => setMoveTopicModal(null)}
          title={`Mover Tópico: ${moveTopicModal.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Selecione o novo assunto de destino para reclassificar o tópico{' '}
              <strong className="text-slate-900 dark:text-white">"{moveTopicModal.name}"</strong>:
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Assunto de Destino
              </label>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                {allSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.disciplineName} ➜ {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setMoveTopicModal(null)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmMoveTopic} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmar Realocação
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
