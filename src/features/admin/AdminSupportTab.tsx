import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Search,
  User,
  Mail,
  Send,
  Sparkles
} from 'lucide-react';

export const AdminSupportTab: React.FC = () => {
  const { showToast } = useApp();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [targetStatus, setTargetStatus] = useState('resolved');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAdminTickets(filterStatus);
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const handleOpenReply = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setTargetStatus(ticket.status === 'resolved' ? 'resolved' : 'resolved');
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      await ApiService.replyAdminTicket(selectedTicket.id, replyText, targetStatus);
      showToast('Resposta Enviada', 'Chamado de suporte atualizado com sucesso.', 'success');
      setIsReplyModalOpen(false);
      loadTickets();
    } catch (err) {
      showToast('Erro', 'Falha ao responder chamado de suporte.', 'error');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <Badge variant="danger" className="text-[10px]">Urgente</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[10px]">Alta</Badge>;
      case 'medium':
        return <Badge variant="primary" className="text-[10px]">Média</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Baixa</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'resolved':
        return <Badge variant="success" className="text-[10px]">Resolvido</Badge>;
      case 'in_analysis':
        return <Badge variant="warning" className="text-[10px]">Em Análise</Badge>;
      default:
        return <Badge variant="danger" className="text-[10px]">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Central de Atendimento e Suporte ao Aluno
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Responda solicitações, dúvidas conceituais de questões, problemas de assinatura e sugestões da comunidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="in_analysis">Em Análise</option>
            <option value="resolved">Resolvidos</option>
          </select>

          <Button size="sm" variant="outline" onClick={loadTickets} className="p-2" title="Recarregar">
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-700 dark:text-slate-300">
            <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Carregando chamados...
          </div>
        ) : tickets.length === 0 ? (
          <Card className="p-8 text-center text-slate-700 dark:text-slate-300">
            Nenhum chamado de suporte encontrado com os filtros selecionados.
          </Card>
        ) : (
          tickets.map((t) => (
            <Card key={t.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(t.status)}
                    {getPriorityBadge(t.priority)}
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      #{t.id}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {t.category.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t.subject}
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{t.message}"
                  </p>

                  {t.adminReply && (
                    <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200">
                      <span className="font-semibold block text-[11px] text-indigo-800 dark:text-indigo-300 mb-0.5">
                        Resposta da Equipe APROVA+:
                      </span>
                      {t.adminReply}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-600 dark:text-slate-300" /> {t.userName}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3 h-3 text-slate-600 dark:text-slate-300" /> {t.userEmail}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Aberto em: {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    onClick={() => handleOpenReply(t)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.adminReply ? 'Editar Resposta' : 'Responder Chamado'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={`Atendimento de Chamado #${selectedTicket?.id || ''}`}
      >
        <form onSubmit={handleSendReply} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 block mb-1">
              Aluno: <strong>{selectedTicket?.userName}</strong> ({selectedTicket?.userEmail})
            </label>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <span className="font-bold block mb-1">{selectedTicket?.subject}</span>
              <p>{selectedTicket?.message}</p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Resposta do Atendente / Professor:
            </label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Digite a orientação pedagógica, resolução técnica ou esclarecimento financeiro..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Atualizar Status do Chamado:
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="resolved">Resolvido (Finalizar atendimento)</option>
              <option value="in_analysis">Em Análise (Aguardando verificação pedagógica)</option>
              <option value="pending">Pendente</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsReplyModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Enviar Resposta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
