/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ToastContainer } from './components/ui/ToastContainer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Feature Views
import { LandingPage } from './features/landing/LandingPage';
import { DashboardView } from './features/dashboard/DashboardView';
import { QuestionBankView } from './features/questions/QuestionBankView';
import { SimulationView } from './features/simulations/SimulationView';
import { DisciplinesView } from './features/disciplines/DisciplinesView';
import { StudyPlanView } from './features/study-plan/StudyPlanView';
import { ReviewsView } from './features/reviews/ReviewsView';
import { MistakesNotebookView } from './features/mistakes/MistakesNotebookView';
import { FavoritesView } from './features/favorites/FavoritesView';
import { AchievementsView } from './features/achievements/AchievementsView';
import { PerformanceView } from './features/performance/PerformanceView';
import { ProfileView } from './features/profile/ProfileView';
import { AdminPanel } from './features/admin/AdminPanel';
import { NotebooksView } from './features/notebooks/NotebooksView';
import { ExploreTaxonomyView } from './features/explore/ExploreTaxonomyView';
import { StudyAssistantView } from './features/assistant/StudyAssistantView';
import { ReportsView } from './features/reports/ReportsView';

// Modals
import { AuthModal } from './features/auth/AuthModal';
import { OnboardingModal } from './features/onboarding/OnboardingModal';
import { PricingModal } from './features/pricing/PricingModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NotFoundView } from './components/ui/NotFoundView';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, isSearchModalOpen, openSearchModal, closeSearchModal } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K or Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearchModal]);

  // If user is viewing the commercial Landing Page, render it cleanly
  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage />
        <AuthModal />
        <OnboardingModal />
        <PricingModal />
        <ToastContainer />
      </>
    );
  }

  // Otherwise, render full SaaS application layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen pb-24 lg:pb-0">
        {/* Top Navbar */}
        <Navbar
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'questions' && <QuestionBankView />}
          {activeTab === 'notebooks' && <NotebooksView />}
          {(activeTab === 'explore-concursos' ||
            activeTab === 'explore-orgaos' ||
            activeTab === 'explore-cargos' ||
            activeTab === 'explore-bancas' ||
            activeTab === 'explore-disciplinas') && <ExploreTaxonomyView />}
          {activeTab === 'simulations' && <SimulationView />}
          {activeTab === 'disciplines' && <DisciplinesView />}
          {activeTab === 'study-plan' && <StudyPlanView />}
          {activeTab === 'reviews' && <ReviewsView />}
          {activeTab === 'mistakes' && <MistakesNotebookView />}
          {activeTab === 'favorites' && <FavoritesView />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'performance' && <PerformanceView />}
          {activeTab === 'assistant' && <StudyAssistantView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'admin' && <AdminPanel />}
          {![
            'dashboard',
            'questions',
            'notebooks',
            'explore-concursos',
            'explore-orgaos',
            'explore-cargos',
            'explore-bancas',
            'explore-disciplinas',
            'simulations',
            'disciplines',
            'study-plan',
            'reviews',
            'mistakes',
            'favorites',
            'achievements',
            'performance',
            'assistant',
            'reports',
            'profile',
            'admin',
          ].includes(activeTab) && (
            <NotFoundView
              onBackToDashboard={() => setActiveTab('dashboard')}
              onOpenSearch={openSearchModal}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Prompt requirement: Início | Questões | Plano | Desempenho | Perfil) */}
      <MobileBottomNav />

      {/* Offline Status Bar Alert for Mobile & Desktop */}
      <OfflineIndicator />

      {/* Global Interactive Modals */}
      <AuthModal />
      <OnboardingModal />
      <PricingModal />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
