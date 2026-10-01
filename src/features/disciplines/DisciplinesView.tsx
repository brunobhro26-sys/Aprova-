import React from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { INITIAL_DISCIPLINES } from '../../database/seedData';
import { BookOpen, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export const DisciplinesView: React.FC = () => {
  const { setActiveTab, setInitialQuestionFilter } = useApp();
  const allQuestions = DBService.getQuestions();

  const disciplineDetails = INITIAL_DISCIPLINES.map((disc) => {
    const questionsInDisc = allQuestions.filter((q) => q.discipline === disc);
    const topics = Array.from(new Set(questionsInDisc.map((q) => q.topic)));
    return {
      name: disc,
      questionCount: questionsInDisc.length,
      topicsCount: topics.length,
      topicsList: topics
    };
  });

  const handleSelectDiscipline = (disc: string) => {
    setInitialQuestionFilter({ discipline: disc });
    setActiveTab('questions');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Catálogo de Disciplinas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Navegue pelas 10 disciplinas completas do edital de Técnico em Eletrotécnica e Conhecimentos Gerais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disciplineDetails.map((disc, idx) => (
          <Card
            key={idx}
            className="p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
            onClick={() => handleSelectDiscipline(disc.name)}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary" size="sm">
                  {disc.questionCount} questões
                </Badge>
                <span className="text-[11px] font-semibold text-slate-400">
                  {disc.topicsCount} tópicos
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                {disc.name}
              </h3>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {disc.topicsList.slice(0, 3).map((top, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {top}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Praticar Questões</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
