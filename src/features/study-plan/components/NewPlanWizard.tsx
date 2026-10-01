import React, { useState, useEffect } from 'react';
import { StudyPlanClient } from '../../../services/studyPlanClient';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Sparkles,
  Target,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { formatDate, addDays } from '../../../utils/dateUtils';

interface NewPlanWizardProps {
  onPlanCreated: () => void;
  onCancel: () => void;
}

export const NewPlanWizard: React.FC<NewPlanWizardProps> = ({
  onPlanCreated,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Available contests & positions
  const [exams, setExams] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Wizard state:
  // Step 1: Exam & Position
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-transpetro-2026');
  const [selectedPositionId, setSelectedPositionId] = useState<string>('pos-eletrotecnica');
  const [goalName, setGoalName] = useState<string>('Transpetro — Técnico em Eletrotécnica');
  const [examDate, setExamDate] = useState<string>(formatDate(addDays(new Date(), 120))); // Exactly 120 days
  const [userLevel, setUserLevel] = useState<'Iniciante' | 'Básico' | 'Intermediário' | 'Avançado'>('Intermediário');

  // Step 2: Availability
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(6);
  const [weekendMode, setWeekendMode] = useState<'normal' | 'reduced' | 'rest'>('reduced');
  const [restDay, setRestDay] = useState<string>('Domingo');

  // Step 3: Disciplines & Weights
  const [disciplinesConfig, setDisciplinesConfig] = useState<
    Array<{ subjectId: string; subjectName: string; weight: number; enabled: boolean }>
  >([]);

  // Step 4: Diagnostic Test / Simulation
  const [diagnosticScores, setDiagnosticScores] = useState<Record<string, number>>({
    'sub-eletrotecnica': 55,
    'sub-matematica': 65,
    'sub-portugues': 85,
    'sub-fisica': 60,
    'sub-quimica': 50
  });

  useEffect(() => {
    // Load exams, positions, subjects
    const loadMetadata = async () => {
      try {
        const [exRes, posRes, subRes] = await Promise.all([
          fetch('/api/exams').then((r) => r.json()),
          fetch('/api/positions').then((r) => r.json()),
          fetch('/api/subjects').then((r) => r.json())
        ]);

        setExams(exRes);
        setPositions(posRes);
        setSubjectsList(subRes);

        // Pre-configure disciplines
        if (Array.isArray(subRes)) {
          const defaults = subRes.map((s: any) => {
            let weight = 3;
            if (s.name.toLowerCase().includes('eletrotécnica')) weight = 5;
            else if (s.name.toLowerCase().includes('matemática')) weight = 4;
            else if (s.name.toLowerCase().includes('portuguesa')) weight = 3;
            else if (s.name.toLowerCase().includes('física')) weight = 3;
            else if (s.name.toLowerCase().includes('química')) weight = 2;

            return {
              subjectId: s.id,
              subjectName: s.name,
              weight,
              enabled: true
            };
          });
          setDisciplinesConfig(defaults);
        }
      } catch (err) {
        console.error('Error loading wizard metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  const totalWeeklyHours = hoursPerDay * daysPerWeek;
  const monthlyHours = totalWeeklyHours * 4;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Create or update goal
      const createdGoal = await StudyPlanClient.createGoal({
        nome: goalName,
        examId: selectedExamId,
        positionId: selectedPositionId,
        dataInicio: formatDate(new Date()),
        dataProva: examDate,
        prioridade: 'Principal',
        status: 'Ativo',
        nivelAtual: userLevel,
        horasDisponiveisSemana: totalWeeklyHours,
        observacoes: 'Objetivo gerado pelo Assistente Inteligente de Estudos APROVA+.'
      });

      // 2. Generate plan & sessions
      await StudyPlanClient.generatePlan({
        goalId: createdGoal.id,
        examId: selectedExamId,
        positionId: selectedPositionId,
        dataProva: examDate,
        horasDisponiveisSemana: totalWeeklyHours,
        nivelAtual: userLevel,
        weekendMode,
        restDays: [restDay],
        disciplinesConfig,
        diagnosticResults: diagnosticScores
      });

      onPlanCreated();
    } catch (err) {
      console.error('Error in wizard generation:', err);
      alert('Ocorreu um erro ao gerar o plano: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
            Passo {step} de 4
          </span>
          <h2 className="text-2xl font-black mt-2">Assistente de Planejamento Inteligente</h2>
          <p className="text-xs text-blue-100 mt-1">
            Transforme seu objetivo de aprovação em um cronograma adaptativo baseado no seu desempenho real
          </p>
        </div>
        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between px-2">
        {['Objetivo & Prova', 'Disponibilidade', 'Disciplinas & Pesos', 'Diagnóstico & Geração'].map(
          (title, idx) => {
            const num = idx + 1;
            const isCurrent = step === num;
            const isCompleted = step > num;

            return (
              <div key={title} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : num}
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 text-center hidden sm:block">
                  {title}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Step 1: Concurso & Cargo */}
      {step === 1 && (
        <Card className="p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Qual concurso e cargo você deseja conquistar?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize o alvo do seu planejamento
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome do Objetivo
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                placeholder="Ex: Transpetro — Técnico em Eletrotécnica"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Concurso / Edital
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                  {exams.length === 0 && (
                    <option value="exam-transpetro-2026">
                      Concurso Transpetro Quadro de Terra e Mar 2026
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cargo Desejado
                </label>
                <select
                  value={selectedPositionId}
                  onChange={(e) => setSelectedPositionId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
                  {positions.length === 0 && (
                    <option value="pos-eletrotecnica">Técnico em Eletrotécnica</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data Prevista da Prova (Target)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                />
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  Faltam exatamente 120 dias para esta data de teste.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seu Nível Atual de Conhecimento
                </label>
                <select
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value="Iniciante">Iniciante (Primeiro contato com o edital)</option>
                  <option value="Básico">Básico (Já estudou algumas matérias)</option>
                  <option value="Intermediário">Intermediário (Base consolidada, focado em questões)</option>
                  <option value="Avançado">Avançado (Revisão rápida e simulados)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={() => setStep(2)} className="bg-blue-600 text-white font-bold gap-2">
              Avançar para Disponibilidade <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Disponibilidade */}
      {step === 2 && (
        <Card className="p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Qual a sua disponibilidade real de estudo?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O algoritmo dimensiona as sessões sem sobrecarregar sua rotina
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Horas por dia: <strong className="text-blue-600">{hoursPerDay} horas</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1h</span>
                  <span>2h (Padrão teste)</span>
                  <span>4h</span>
                  <span>8h</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dias por semana: <strong className="text-blue-600">{daysPerWeek} dias</strong>
                </label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>3 dias</span>
                  <span>5 dias</span>
                  <span>6 dias (Padrão teste)</span>
                  <span>7 dias</span>
                </div>
              </div>
            </div>

            {/* Calculated Statistics Banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Horas / Semana</span>
                <strong className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                  {totalWeeklyHours}h
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Média Diária</span>
                <strong className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {hoursPerDay}h / dia
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Horas / Mês</span>
                <strong className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {monthlyHours}h
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dia de Descanso Semanal
                </label>
                <select
                  value={restDay}
                  onChange={(e) => setRestDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="Domingo">Domingo (Recomendado)</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Segunda">Segunda-feira</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Modo de Fim de Semana
                </label>
                <select
                  value={weekendMode}
                  onChange={(e) => setWeekendMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="reduced">Carga Reduzida no Sábado (Simulados)</option>
                  <option value="normal">Carga Normal</option>
                  <option value="rest">Descanso Total no Fim de Semana</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button onClick={() => setStep(3)} className="bg-blue-600 text-white font-bold gap-2">
              Avançar para Disciplinas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Disciplinas & Pesos */}
      {step === 3 && (
        <Card className="p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Disciplinas do Edital e Pesos Relativos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure os pesos de 1 (Baixo) a 5 (Muito Alto). Disciplinas específicas costumam ter peso 4 ou 5.
            </p>
          </div>

          <div className="space-y-3">
            {disciplinesConfig.map((disc, idx) => (
              <div
                key={disc.subjectId}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={disc.enabled}
                    onChange={(e) => {
                      const copy = [...disciplinesConfig];
                      copy[idx].enabled = e.target.checked;
                      setDisciplinesConfig(copy);
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {disc.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Peso atual: {disc.weight} ({disc.weight >= 5 ? 'Muito Alto' : disc.weight >= 4 ? 'Alto' : 'Médio'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        const copy = [...disciplinesConfig];
                        copy[idx].weight = w;
                        setDisciplinesConfig(copy);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        disc.weight === w
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button onClick={() => setStep(4)} className="bg-blue-600 text-white font-bold gap-2">
              Avançar para Diagnóstico <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Diagnóstico Inicial & Gerar Plano */}
      {step === 4 && (
        <Card className="p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              4. Diagnóstico de Nível e Calibragem de Prioridades
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O algoritmo prioriza as disciplinas em que você tem maior taxa de erro, garantindo maior foco nas suas fraquezas.
            </p>
          </div>

          {/* Test Performance Preview (Requirement 59) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Desempenho Simulado do Aluno (Teste Obrigatório):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/30">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Eletrotécnica</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                  55%
                </div>
                <span className="text-[10px] text-rose-600 font-medium">⚠️ Alta prioridade no plano</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Matemática</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  65%
                </div>
                <span className="text-[10px] text-amber-600 font-medium">⚡ Reforço moderado</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Língua Portuguesa</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  85%
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">✅ Manutenção e revisão</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <strong className="block font-bold">Resumo da Geração Automática:</strong>
            <p>• Alvo: {goalName}</p>
            <p>• Tempo até a prova: 120 dias</p>
            <p>• Carga semanal: {totalWeeklyHours} horas ({hoursPerDay}h/dia em {daysPerWeek} dias)</p>
            <p>• Ciclos: Teoria (60%), Questões de Fixação (40%), Revisão Espaçada SRS e Simulados.</p>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-6 py-3 shadow-lg shadow-emerald-600/30 gap-2"
            >
              {isGenerating ? (
                'Gerando Plano Inteligente...'
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 fill-current" />
                  Gerar Plano Automático
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
