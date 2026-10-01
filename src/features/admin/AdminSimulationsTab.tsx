import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Award,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  FileQuestion,
  RotateCw,
  TrendingUp,
  Sliders,
  Calendar
} from 'lucide-react';

export const AdminSimulationsTab: React.FC = () => {
  const { showToast } = useApp();
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(240);
  const [portuguesCount, setPortuguesCount] = useState(10);
  const [matematicaCount, setMatematicaCount] = useState(10);
  const [circuitosCount, setCircuitosCount] = useState(15);
  const [maquinasCount, setMaquinasCount] = useState(10);
  const [segurancaCount, setSegurancaCount] = useState(5);

  const loadSimulations = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminSimulations();
      setSimulations(res || []);
    } catch (err) {
      console.error('Error loading simulations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  const handleCreateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const distribution = {
      'Língua Portuguesa': Number(portuguesCount),
      'Matemática e Raciocínio Lógico': Number(matematicaCount),
      'Circuitos Elétricos': Number(circuitosCount),
      'Máquinas Elétricas': Number(maquinasCount),
      'Instalações Elétricas e Segurança': Number(segurancaCount)
    };

    const calculatedTotal = Object.values(distribution).reduce((a, b) => a + b, 0);

    const payload = {
      title,
      description,
      totalQuestions: calculatedTotal || totalQuestions,
      timeLimitMinutes: Number(timeLimitMinutes),
      isOfficial: true,
      distributionConfig: distribution
    };

    try {
      await ApiService.createAdminSimulation(payload);
      showToast('Sucesso', 'Simulado oficial criado com sucesso!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadSimulations();
    } catch (err) {
      showToast('Erro', 'Falha ao criar simulado oficial.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Gestão de Simulados Oficiais da Plataforma
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Cadastre simulados com regras oficiais de banca, cronômetro autoritativo, pesos por matéria e ranking geral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Criar Simulado Oficial
          </Button>
          <Button size="sm" variant="outline" onClick={loadSimulations} className="p-2" title="Recarregar">
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Grid of Official Simulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulations.map((sim) => {
          let distObj: Record<string, number> = {};
          try {
            distObj = typeof sim.distributionConfig === 'string' ? JSON.parse(sim.distributionConfig) : sim.distributionConfig || {};
          } catch {
            distObj = {};
          }

          return (
            <Card key={sim.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {sim.title}
                  </h3>
                  <Badge variant={sim.isOfficial ? 'primary' : 'outline'} className="text-[10px] shrink-0">
                    {sim.isOfficial ? 'Oficial' : 'Personalizado'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mb-4">
                  {sim.description || 'Simulado completo com questões comentadas no estilo da banca organizadora.'}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{sim.totalQuestions} questões</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{sim.timeLimitMinutes} min ({Math.round(sim.timeLimitMinutes / 60)}h)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{sim.participantsCount || 0} participantes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                    <span>Média: <strong>{sim.averageScore || 0}%</strong></span>
                  </div>
                </div>

                {/* Distribution preview */}
                {Object.keys(distObj).length > 0 && (
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                      Distribuição:
                    </div>
                    {Object.entries(distObj).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="truncate">{k}:</span>
                        <span className="font-mono">{v}q</span>
                      </div>
                    ))}
                    {Object.keys(distObj).length > 3 && (
                      <span className="text-[10px] text-slate-700 dark:text-slate-300">+{Object.keys(distObj).length - 3} outras disciplinas</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>Criado em: {new Date(sim.createdAt).toLocaleDateString('pt-BR')}</span>
                <Badge variant="success" className="text-[10px]">Publicado</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Simulation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Simulado Oficial"
      >
        <form onSubmit={handleCreateSimulation} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Título do Simulado</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Simulado Oficial Transpetro 2024 — Rodada 02"
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Descrição</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instruções para os candidatos, perfil da banca e nota de corte esperada..."
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Tempo de Prova (Minutos)</label>
              <input
                type="number"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Total de Questões</label>
              <input
                type="number"
                value={portuguesCount + matematicaCount + circuitosCount + maquinasCount + segurancaCount}
                disabled
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
              Composição da Prova (Questões por Disciplina):
            </label>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span>Língua Portuguesa:</span>
                <input
                  type="number"
                  min="0"
                  value={portuguesCount}
                  onChange={(e) => setPortuguesCount(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-200 dark:border-slate-700 rounded text-center text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Matemática / Raciocínio Lógico:</span>
                <input
                  type="number"
                  min="0"
                  value={matematicaCount}
                  onChange={(e) => setMatematicaCount(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-200 dark:border-slate-700 rounded text-center text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Circuitos Elétricos:</span>
                <input
                  type="number"
                  min="0"
                  value={circuitosCount}
                  onChange={(e) => setCircuitosCount(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-200 dark:border-slate-700 rounded text-center text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Máquinas Elétricas:</span>
                <input
                  type="number"
                  min="0"
                  value={maquinasCount}
                  onChange={(e) => setMaquinasCount(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-200 dark:border-slate-700 rounded text-center text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Instalações & Segurança (NR-10):</span>
                <input
                  type="number"
                  min="0"
                  value={segurancaCount}
                  onChange={(e) => setSegurancaCount(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-200 dark:border-slate-700 rounded text-center text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
              Publicar Simulado
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
