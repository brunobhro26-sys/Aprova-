import React from 'react';
import { StudyRecommendation, StudySessionItem } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Compass,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Play
} from 'lucide-react';

interface WhatToStudyWidgetProps {
  recommendation: StudyRecommendation | null;
  secondaryRecommendations: StudyRecommendation[];
  onStartSession: (rec: StudyRecommendation) => void;
  onSolveQuestions: (rec: StudyRecommendation) => void;
}

export const WhatToStudyWidget: React.FC<WhatToStudyWidgetProps> = ({
  recommendation,
  secondaryRecommendations,
  onStartSession,
  onSolveQuestions
}) => {
  if (!recommendation) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-none shadow-xl">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-blue-300 animate-spin" />
          <h3 className="font-bold text-lg">Calculando próxima recomendação inteligente...</h3>
        </div>
      </Card>
    );
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">Alta Prioridade</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Atenção</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Rotina</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary "O que estudar agora?" Card */}
      <Card className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-500/20 shadow-xl rounded-2xl">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                O Que Estudar Agora?
              </span>
              {getUrgencyBadge(recommendation.urgency)}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {recommendation.discipline} — {recommendation.topic}
              </h2>
              <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-blue-300" />
                Tempo sugerido: <strong className="text-white">{recommendation.suggestedDurationMinutes} min</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                Meta prática: <strong className="text-white">{recommendation.recommendedQuestionsCount} questões</strong>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              size="lg"
              onClick={() => onStartSession(recommendation)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Iniciar Estudo Agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSolveQuestions(recommendation)}
              className="border-white/20 text-white hover:bg-white/10 font-semibold gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Resolver Questões
            </Button>
          </div>
        </div>
      </Card>

      {/* Secondary Recommendations Accordion / List */}
      {secondaryRecommendations.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {secondaryRecommendations.slice(1, 3).map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {rec.discipline}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {rec.suggestedDurationMinutes} min
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {rec.reason}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartSession(rec)}
                className="shrink-0 text-blue-600 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title="Estudar este conteúdo"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
