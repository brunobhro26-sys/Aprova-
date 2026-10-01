import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuestionCard } from '../questions/QuestionCard';
import { Star, FileQuestion, ArrowRight } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { user, refreshKey, setActiveTab, setInitialQuestionFilter } = useApp();

  const favorites = useMemo(() => DBService.getFavoritesForUser(user.id), [user.id, refreshKey]);
  const allQuestions = useMemo(() => DBService.getQuestions(), [refreshKey]);

  const favoriteQuestions = useMemo(() => {
    return favorites
      .map((fav) => allQuestions.find((q) => q.id === fav.questionId))
      .filter((q) => q !== undefined);
  }, [favorites, allQuestions]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Questões Favoritas
            </h1>
            <Badge variant="warning" size="sm">
              {favoriteQuestions.length} salvas
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Questões marcadas com estrela para consulta rápida, memorização de fórmulas e revisões de véspera.
          </p>
        </div>

        {favoriteQuestions.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setInitialQuestionFilter({ favoritesOnly: true });
              setActiveTab('questions');
            }}
          >
            Treinar Todas as Favoritas
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {favoriteQuestions.length > 0 ? (
          favoriteQuestions.map((q, idx) => (
            <QuestionCard key={q!.id} question={q!} indexNumber={idx + 1} />
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Star className="w-10 h-10 text-amber-400 fill-amber-400/20 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Nenhuma questão favoritada ainda
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ao resolver questões no banco, clique no ícone de estrela (⭐) para salvar questões desafiadoras ou ricas em teoria.
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('questions')}>
              Explorar Banco de Questões
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
