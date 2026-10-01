import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlanClient, StudyReviewsGrouped } from '../../services/studyPlanClient';
import { ReviewsCenterView } from '../study-plan/components/ReviewsCenterView';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ReviewsView: React.FC = () => {
  const { setActiveTab, setInitialQuestionFilter, showToast } = useApp();
  const [reviews, setReviews] = useState<StudyReviewsGrouped>({
    hoje: [],
    atrasadas: [],
    proximas: [],
    concluidas: [],
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await StudyPlanClient.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <ReviewsCenterView
        reviews={reviews}
        onRefreshReviews={loadReviews}
        onStartReviewSession={(rev) => {
          setInitialQuestionFilter({
            discipline: rev.subjectName,
            mistakesOnly: true
          });
          setActiveTab('questions');
          showToast('Iniciando Revisão', `Praticando questões de ${rev.subjectName}.`, 'info');
        }}
      />
    </div>
  );
};
