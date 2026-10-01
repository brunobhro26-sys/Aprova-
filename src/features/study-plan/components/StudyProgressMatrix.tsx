import React from 'react';
import { StudyProgressData } from '../../../services/studyPlanClient';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface StudyProgressMatrixProps {
  progressData: StudyProgressData;
}

export const StudyProgressMatrix: React.FC<StudyProgressMatrixProps> = ({ progressData }) => {
  const { disciplineProgress, topicDomainMap } = progressData;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dominado':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Dominado</Badge>;
      case 'Em desenvolvimento':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Em estudo</Badge>;
      case 'Precisa revisar':
        return <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30">Precisa Revisar</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-500 border-slate-500/30">Não estudado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Disciplines Completion Cards */}
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Cobertura por Disciplina do Edital
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Percentual de tópicos cobertos e taxa de retenção por matéria
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplineProgress.map((disc) => (
            <Card key={disc.subjectId} className="p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {disc.category}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {disc.subjectName}
                  </h4>
                </div>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {disc.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${disc.percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>
                  <strong>{disc.studiedTopics}</strong> de {disc.totalTopics} tópicos estudados
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {disc.dominatedTopics} dominados
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Topics Domain Map Matrix */}
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Mapa de Domínio por Tópico (Diagnóstico Real)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Classificação calculada pelo percentual de acerto real e repetição espaçada
        </p>

        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Disciplina</th>
                  <th className="p-3.5">Tópico do Conteúdo Programático</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Questões Feitas</th>
                  <th className="p-3.5 text-right">% Acerto Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {topicDomainMap.map((topic) => (
                  <tr
                    key={topic.topicId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-3.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {topic.subjectName}
                    </td>
                    <td className="p-3.5 text-slate-900 dark:text-white font-semibold">
                      {topic.topicName}
                    </td>
                    <td className="p-3.5 text-center">{getStatusBadge(topic.status)}</td>
                    <td className="p-3.5 text-center text-xs font-mono">
                      {topic.attempted} ({topic.correct} corretas)
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold">
                      {topic.attempted > 0 ? (
                        <span
                          className={
                            topic.accuracy >= 75
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : topic.accuracy >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {topic.accuracy}%
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
