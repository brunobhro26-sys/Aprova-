import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCw,
  Users,
  Send
} from 'lucide-react';

export const AdminAnnouncementsTab: React.FC = () => {
  const { showToast } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetAudience, setTargetAudience] = useState('all');

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAdminAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      await ApiService.createAdminAnnouncement({
        title,
        message,
        type,
        targetAudience,
        isPublished: true
      });
      showToast('Publicado', 'Comunicado divulgado para os alunos.', 'success');
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      loadAnnouncements();
    } catch (err) {
      showToast('Erro', 'Falha ao publicar comunicado.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteAdminAnnouncement(id);
      showToast('Removido', 'Comunicado excluído.', 'info');
      loadAnnouncements();
    } catch (err) {
      showToast('Erro', 'Falha ao excluir comunicado.', 'error');
    }
  };

  const getTypeBadge = (t: string) => {
    switch (t) {
      case 'urgent':
        return <Badge variant="danger" className="text-[10px]">Urgente</Badge>;
      case 'warning':
        return <Badge variant="warning" className="text-[10px]">Aviso</Badge>;
      case 'success':
        return <Badge variant="success" className="text-[10px]">Sucesso</Badge>;
      default:
        return <Badge variant="primary" className="text-[10px]">Informativo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Gestão de Notificações e Comunicados
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Publique avisos de novos editais, retificações, manutenção da infraestrutura e comunicados direcionados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Comunicado
          </Button>
          <Button size="sm" variant="outline" onClick={loadAnnouncements} className="p-2" title="Recarregar">
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getTypeBadge(ann.type)}
                  <Badge variant="outline" className="text-[10px] capitalize">
                    Público: {ann.targetAudience === 'all' ? 'Todos os alunos' : ann.targetAudience}
                  </Badge>
                </div>
                <button
                  onClick={() => handleDelete(ann.id)}
                  title="Excluir comunicado"
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {ann.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
              <span>Publicado em: {new Date(ann.createdAt).toLocaleDateString('pt-BR')}</span>
              <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-3 h-3" /> No Ar
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Novo Comunicado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publicar Comunicado aos Alunos"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Título do Comunicado</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Retificação do Edital Transpetro 2026 — Novas Questões Cadastradas"
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Tipo de Mensagem</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="info">Informativo (Azul)</option>
                <option value="success">Sucesso / Novidade (Verde)</option>
                <option value="warning">Alerta / Aviso (Amarelo)</option>
                <option value="urgent">Urgente (Vermelho)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Público-Alvo</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="all">Todos os Alunos</option>
                <option value="premium">Apenas Alunos Premium</option>
                <option value="free">Apenas Alunos Gratuitos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Mensagem Completa</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva as instruções, novidades ou avisos pedagógicos aos estudantes..."
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Publicar Agora
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
