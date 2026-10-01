import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DBService } from '../../services/dbService';
import { INITIAL_DISCIPLINES } from '../../database/seedData';
import { Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, closeOnboarding, user, refreshData, setActiveTab, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [contest, setContest] = useState(user.targetContest || 'Transpetro');
  const [position, setPosition] = useState(user.targetPosition || 'Técnico em Eletrotécnica');
  const [dailyHours, setDailyHours] = useState(user.studyHoursPerDay || 3);
  const [daysPerWeek, setDaysPerWeek] = useState(user.studyDaysPerWeek || 5);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(
    user.prioritySubjects || ['Língua Portuguesa', 'Circuitos Elétricos', 'Eletrotécnica', 'Máquinas Elétricas']
  );
  const [levelStage, setLevelStage] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>(
    user.levelStage || 'Intermediário'
  );

  const toggleDiscipline = (disc: string) => {
    if (selectedDisciplines.includes(disc)) {
      if (selectedDisciplines.length > 1) {
        setSelectedDisciplines(selectedDisciplines.filter((d) => d !== disc));
      }
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  const handleFinish = () => {
    // 1. Update user profile
    DBService.updateUser({
      targetContest: contest,
      targetPosition: position,
      studyHoursPerDay: dailyHours,
      studyDaysPerWeek: daysPerWeek,
      prioritySubjects: selectedDisciplines,
      levelStage: levelStage
    });

    // 2. Generate customized study plan based on priority subjects and days
    const weekDays: ('Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo')[] = [
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
      'Domingo'
    ];

    // Clear old plan and rebuild
    const activeDays = weekDays.slice(0, daysPerWeek);
    const newSessions = activeDays.map((day, idx) => {
      const disc = selectedDisciplines[idx % selectedDisciplines.length];
      return {
        id: 'plan-custom-' + idx + '-' + Date.now(),
        dayOfWeek: day,
        discipline: disc,
        topic: `Tópicos Fundamentais de ${disc}`,
        hoursAllocated: Number(dailyHours),
        completed: false
      };
    });

    localStorage.setItem('aprova_plus_study_plan', JSON.stringify(newSessions));

    refreshData();
    closeOnboarding();
    setActiveTab('study-plan');
    showToast('Plano de estudos gerado!', 'Seu cronograma personalizado está pronto para guiar seus passos.', 'success');
  };

  return (
    <Modal
      isOpen={isOnboardingOpen}
      onClose={closeOnboarding}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Personalização do seu Plano de Estudos</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span>Etapa {step} de 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Concurso & Cargo */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Qual concurso você está preparando?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Isso direciona os filtros das bancas e simulados da plataforma.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['Transpetro', 'Petrobras', 'Furnas', 'Eletrobras', 'Eletronuclear', 'Caixa Econômica'].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContest(c)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      contest === c
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                )
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Qual o cargo que você deseja?
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ex: Técnico em Eletrotécnica"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Rotina de estudo */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Qual a sua disponibilidade de estudo?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vamos calcular a quantidade ideal de blocos diários de questões e revisões.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Quanto tempo você possui para estudar por dia?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDailyHours(h)}
                    className={`py-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      dailyHours === h
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {h === 4 ? '4h ou +' : `${h}h por dia`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Quantos dias por semana você consegue estudar?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`py-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      daysPerWeek === d
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Prioridades e Nível */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prioridades e Nível de Preparação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quais disciplinas você deseja priorizar no seu ciclo inicial?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {INITIAL_DISCIPLINES.map((disc) => {
                const isSelected = selectedDisciplines.includes(disc);
                return (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => toggleDiscipline(disc)}
                    className={`p-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{disc}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Qual seu nível atual de conhecimento para este concurso?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelStage(lvl)}
                    className={`py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      levelStage === lvl
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep(step + 1)}
            >
              Avançar
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleFinish}
              className="font-bold"
            >
              Gerar Meu Plano de Estudos
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
