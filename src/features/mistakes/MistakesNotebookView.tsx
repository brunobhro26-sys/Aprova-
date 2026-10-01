import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuestionCard } from '../questions/QuestionCard';
import {
  AlertOctagon,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Play
} from 'lucide-react';

export const MistakesNotebookView: React.FC = () => {
  const { user, refreshKey, refreshData, showToast, setActiveTab, setInitialQuestionFilter } = useApp();

  const [activePracticeMode, setActivePracticeMode] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('Todas');

  const mistakes = useMemo(() => DBService.getMistakesForUser(user.id), [user.id, refreshKey]);
  const allQuestions = useMemo(() => DBService.getQuestions(), [refreshKey]);

  // Combine mistake records with full question details
  const enrichedMistakes = useMemo(() => {
    return mistakes
      .map((m) => {
        const q = allQuestions.find((item) => item.id === m.questionId);
        return {
          ...m,
          question: q
        };
      })
      .filter((m) => m.question !== undefined);
  }, [mistakes, allQuestions]);

  const filtered = useMemo(() => {
    if (filterDiscipline === 'Todas') return enrichedMistakes;
    return enrichedMistakes.filter((m) => m.question?.discipline === filterDiscipline);
  }, [enrichedMistakes, filterDiscipline]);

  const handleRemoveMistake = (questionId: string) => {
    DBService.removeMistake(user.id, questionId);
    refreshData();
    showToast('Questão Removida', 'Item retirado do Caderno de Erros.', 'info');
  };

  const handleStartReviewAll = () => {
    setInitialQuestionFilter({ mistakesOnly: true });
    setActiveTab('questions');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Caderno de Erros
            </h1>
            <Badge variant="danger" size="sm">
              {mistakes.length} pendentes
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Todas as questões erradas são armazenadas aqui para você reestudar e zerar suas lacunas.
          </p>
        </div>

        {mistakes.length > 0 && (
          <Button
            variant="danger"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleStartReviewAll}
            className="font-bold shadow-md shadow-rose-600/20"
          >
            Revisar Meus Erros
          </Button>
        )}
      </div>

      {/* Info card */}
      <Card className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 leading-snug">
            <strong>O segredo dos primeiros colocados:</strong> refazer cada questão errada até o raciocínio correto se tornar automático. Quando você acertar uma questão em um novo treino, ela pode ser arquivada.
          </p>
        </div>
      </Card>

      {/* View Switch: List mode vs Direct Question Cards */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActivePracticeMode(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              !activePracticeMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Visualização em Tabela
          </button>
          <button
            onClick={() => setActivePracticeMode(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activePracticeMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Modo Resolução Direta
          </button>
        </div>

        <span className="text-slate-400 font-medium">
          {filtered.length} erros listados
        </span>
      </div>

      {/* Table Mode */}
      {!activePracticeMode ? (
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              if (!item.question) return null;
              return (
                <Card key={item.id} className="p-4 sm:p-5 hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="danger" size="sm">
                          {item.failedCount || 1}x com erro
                        </Badge>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.question.discipline}
                        </span>
                        <span className="text-xs text-slate-400">• {item.question.topic}</span>
                        <span className="text-xs text-slate-400">• {item.question.board} {item.question.year}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.question.statement}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Último erro registrado: {item.lastFailedDate}</span>
                        <span>• Gabarito oficial: {item.question.correctOptionLetter}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setInitialQuestionFilter({ discipline: item.question?.discipline });
                          setActiveTab('questions');
                        }}
                      >
                        Refazer Questão
                      </Button>
                      <button
                        onClick={() => handleRemoveMistake(item.questionId)}
                        className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Já dominei (remover)
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Seu Caderno de Erros está zerado!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Parabéns! Você resolveu ou removeu todas as questões pendentes. Continue praticando para se manter afiado.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('questions')}>
                Ir para o Banco de Questões
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Direct Question Resolution Mode */
        <div className="space-y-6">
          {filtered.map((item, idx) => {
            if (!item.question) return null;
            return (
              <QuestionCard
                key={item.id}
                question={item.question}
                indexNumber={idx + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
