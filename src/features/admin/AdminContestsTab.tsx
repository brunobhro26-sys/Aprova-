import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { ApiService } from '../../services/apiService';
import { ExamContest, Organization, ExamBoard } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Award,
  Plus,
  Building2,
  Layers,
  Trash2,
  Edit2,
  Calendar,
  Users
} from 'lucide-react';

export const AdminContestsTab: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [contests, setContests] = useState<ExamContest[]>(() => DBService.getContests());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [orgName, setOrgName] = useState('Transpetro');
  const [board, setBoard] = useState('Cesgranrio');
  const [year, setYear] = useState(2024);
  const [sphere, setSphere] = useState<'Federal' | 'Estadual' | 'Municipal' | 'Distrital'>('Federal');
  const [status, setStatus] = useState<ExamContest['status']>('Inscrições Abertas');
  const [vacancies, setVacancies] = useState<number>(207);

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const orgId = `org-${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const created = DBService.addContest({
      title,
      organizationId: orgId,
      organizationName: orgName,
      board,
      year: Number(year),
      sphere,
      status,
      vacancies: Number(vacancies),
      positionsCount: 1
    });

    // Sync to PostgreSQL backend
    ApiService.createExam({
      name: title,
      organizationId: orgId,
      year: Number(year),
      status: status || 'Publicado',
      vacanciesCount: Number(vacancies)
    }).catch((err) => console.warn('Sync to Cloud SQL exams:', err));

    setContests(DBService.getContests());
    setIsModalOpen(false);
    setTitle('');
    showToast('Concurso Cadastrado', `"${created.title}" foi inserido na base mestre.`, 'success');
  };

  const handleDeleteContest = (id: string, name: string) => {
    if (confirm(`Excluir concurso "${name}"?`)) {
      DBService.deleteContest(id);
      ApiService.deleteExam(id).catch((err) => console.warn('Sync exam delete:', err));
      setContests(DBService.getContests());
      showToast('Concurso removido', 'Registro excluído.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Gestão de Concursos & Editais
          </h3>
          <p className="text-xs text-slate-500">
            Cadastre novos editais, defina bancas, número de vagas e acompanhe o status no portal.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Cadastrar Concurso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map((c) => (
          <Card key={c.id} className="p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {c.sphere} • {c.year}
                </span>
                <button
                  onClick={() => handleDeleteContest(c.id, c.title)}
                  className="text-slate-400 hover:text-rose-500 transition"
                  title="Excluir concurso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {c.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Órgão: <strong className="text-slate-700 dark:text-slate-300">{c.organizationName}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Banca: <strong className="text-slate-700 dark:text-slate-300">{c.board}</strong> • Vagas: {c.vacancies}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Badge
                variant={
                  c.status === 'Inscrições Abertas'
                    ? 'success'
                    : c.status === 'Edital Publicado'
                    ? 'primary'
                    : 'warning'
                }
                size="sm"
              >
                {c.status}
              </Badge>
              <span className="text-[11px] text-slate-400">ID: {c.id.slice(0, 8)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Novo Concurso */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Concurso"
      >
        <form onSubmit={handleCreateContest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Título do Concurso / Edital *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Concurso Transpetro 2025"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Órgão / Empresa
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ex: Transpetro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Banca Organizadora
              </label>
              <input
                type="text"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                placeholder="Ex: Fundação Cesgranrio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Ano
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Esfera
              </label>
              <select
                value={sphere}
                onChange={(e) => setSphere(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value="Federal">Federal</option>
                <option value="Estadual">Estadual</option>
                <option value="Municipal">Municipal</option>
                <option value="Distrital">Distrital</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value="Inscrições Abertas">Inscrições Abertas</option>
                <option value="Edital Publicado">Edital Publicado</option>
                <option value="Previsto">Previsto</option>
                <option value="Encerrado">Encerrado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Número Total de Vagas
            </label>
            <input
              type="number"
              value={vacancies}
              onChange={(e) => setVacancies(Number(e.target.value))}
              placeholder="Ex: 207"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
