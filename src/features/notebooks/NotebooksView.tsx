import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Notebook, Question } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  BookMarked,
  Plus,
  Play,
  Trash2,
  Edit3,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

export const NotebooksView: React.FC = () => {
  const { user, showToast, setActiveTab, setInitialQuestionFilter } = useApp();
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => DBService.getNotebooks(user.id));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContest, setNewContest] = useState(user.targetContest || 'Transpetro');

  const allQuestions = DBService.getQuestions();

  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Título obrigatório', 'Dê um nome para o seu caderno.', 'warning');
      return;
    }

    const created = DBService.createNotebook(user.id, {
      title: newTitle,
      description: newDescription,
      targetContest: newContest
    });

    setNotebooks(DBService.getNotebooks(user.id));
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    showToast('Caderno criado!', `O caderno "${created.title}" foi criado com sucesso.`, 'success');
  };

  const handleDeleteNotebook = (id: string, title: string) => {
    if (confirm(`Deseja realmente excluir o caderno "${title}"?`)) {
      DBService.deleteNotebook(id);
      setNotebooks(DBService.getNotebooks(user.id));
      if (selectedNotebook?.id === id) setSelectedNotebook(null);
      showToast('Caderno removido', 'O caderno foi excluído.', 'info');
    }
  };

  const handleRemoveQuestion = (notebookId: string, questionId: string) => {
    DBService.removeQuestionFromNotebook(notebookId, questionId);
    setNotebooks(DBService.getNotebooks(user.id));
    if (selectedNotebook) {
      setSelectedNotebook(DBService.getNotebookById(notebookId) || null);
    }
    showToast('Questão removida', 'A questão foi removida deste caderno.', 'info');
  };

  const handleSolveNotebook = (notebook: Notebook) => {
    if (notebook.questionIds.length === 0) {
      showToast('Caderno vazio', 'Adicione questões a este caderno antes de iniciar a resolução.', 'warning');
      return;
    }
    setInitialQuestionFilter({
      notebookId: notebook.id
    });
    setActiveTab('questions');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <BookMarked className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Meus Cadernos de Questões
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Organize suas listas personalizadas de estudo, separe questões estratégicas e resolva cadernos temáticos.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Novo Caderno
        </Button>
      </div>

      {/* Grid of Notebooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {notebooks.map((nb) => {
          const count = nb.questionIds.length;
          return (
            <Card
              key={nb.id}
              className="p-6 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {nb.targetContest || 'Geral'}
                  </span>
                  <button
                    onClick={() => handleDeleteNotebook(nb.id, nb.title)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                    title="Excluir caderno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {nb.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {nb.description || 'Sem descrição informada.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
                    {count} {count === 1 ? 'questão' : 'questões'}
                  </span>
                  <span>Atualizado: {nb.updatedAt}</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Button
                  onClick={() => handleSolveNotebook(nb)}
                  className="flex-1 flex items-center justify-center gap-2 text-xs py-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resolver Caderno
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedNotebook(nb)}
                  className="text-xs py-2 px-3"
                  title="Ver questões do caderno"
                >
                  Ver Questões
                </Button>
              </div>
            </Card>
          );
        })}

        {notebooks.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Você ainda não criou nenhum caderno
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Crie cadernos para agrupar questões de matérias específicas, questões difíceis ou focadas na sua banca organizadora.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar meu Primeiro Caderno
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Criar Caderno */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Caderno de Questões"
      >
        <form onSubmit={handleCreateNotebook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Título do Caderno *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex.: Caderno — Eletrotécnica Cesgranrio"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Concurso / Foco Alvo
            </label>
            <input
              type="text"
              value={newContest}
              onChange={(e) => setNewContest(e.target.value)}
              placeholder="Ex.: Transpetro, Petrobras, INSS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Descrição ou Objetivo
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Ex.: Questões sobre circuitos e leis de Kirchhoff para revisar antes da prova."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Salvar Caderno
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ver Questões do Caderno */}
      {selectedNotebook && (
        <Modal
          isOpen={!!selectedNotebook}
          onClose={() => setSelectedNotebook(null)}
          title={`Questões: ${selectedNotebook.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total no caderno:</span>
                <span className="ml-2 font-black text-indigo-600 dark:text-indigo-400">
                  {selectedNotebook.questionIds.length} questões
                </span>
              </div>
              <Button
                onClick={() => {
                  setSelectedNotebook(null);
                  handleSolveNotebook(selectedNotebook);
                }}
                className="flex items-center gap-1.5 text-xs py-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Resolver Agora
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {selectedNotebook.questionIds.map((qId) => {
                const q = allQuestions.find((item) => item.id === qId);
                if (!q) return null;
                return (
                  <div
                    key={qId}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {q.code}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {q.discipline} • {q.topic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                        {q.statement}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(selectedNotebook.id, q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition shrink-0"
                      title="Remover deste caderno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {selectedNotebook.questionIds.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma questão adicionada neste caderno ainda. Adicione questões enquanto resolve no Banco de Questões!
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
