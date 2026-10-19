import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Question } from '../types';
import { DBService } from '../services/dbService';

export type NavigationTab =
  | 'landing'
  | 'dashboard'
  | 'questions'
  | 'notebooks'
  | 'simulations'
  | 'disciplines'
  | 'study-plan'
  | 'reviews'
  | 'mistakes'
  | 'favorites'
  | 'achievements'
  | 'performance'
  | 'assistant'
  | 'reports'
  | 'profile'
  | 'admin'
  | 'explore-concursos'
  | 'explore-orgaos'
  | 'explore-cargos'
  | 'explore-bancas'
  | 'explore-disciplinas';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: User;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: 'normal' | 'large' | 'larger';
  setFontSize: (size: 'normal' | 'large' | 'larger') => void;
  cycleFontSize: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  refreshData: () => void;
  refreshKey: number;
  initialQuestionFilter: {
    discipline?: string;
    mistakesOnly?: boolean;
    favoritesOnly?: boolean;
    contest?: string;
    notebookId?: string;
    subject?: string;
    board?: string;
  } | null;
  setInitialQuestionFilter: (filter: {
    discipline?: string;
    mistakesOnly?: boolean;
    favoritesOnly?: boolean;
    contest?: string;
    notebookId?: string;
    subject?: string;
    board?: string;
  } | null) => void;
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  activeNotebookId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  switchUser: (type: 'student' | 'admin') => void;
  logout: () => void;
}

const getInitialTabFromPath = (): NavigationTab => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/banco-de-questoes') || path.startsWith('/questoes')) return 'questions';
  if (path.startsWith('/simulados')) return 'simulations';
  if (path.startsWith('/meus-cadernos') || path.startsWith('/cadernos')) return 'notebooks';
  if (path.startsWith('/disciplinas')) return 'disciplines';
  if (path.startsWith('/plano-de-estudos')) return 'study-plan';
  if (path.startsWith('/revisoes')) return 'reviews';
  if (path.startsWith('/caderno-de-erros') || path.startsWith('/erros')) return 'mistakes';
  if (path.startsWith('/favoritos')) return 'favorites';
  if (path.startsWith('/desempenho')) return 'performance';
  if (path.startsWith('/relatorios')) return 'reports';
  if (path.startsWith('/conquistas')) return 'achievements';
  if (path.startsWith('/perfil')) return 'profile';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/concursos')) return 'explore-concursos';
  if (path.startsWith('/dashboard')) return 'dashboard';
  return 'dashboard';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => DBService.getCurrentUser());
  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => getInitialTabFromPath());
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Synchronize on browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aprova_plus_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Font size for accessibility
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  // Modals
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  // Question bank filter hand-off
  const [initialQuestionFilter, setInitialQuestionFilter] = useState<{
    discipline?: string;
    mistakesOnly?: boolean;
    favoritesOnly?: boolean;
    contest?: string;
    notebookId?: string;
    subject?: string;
    board?: string;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aprova_plus_dark_mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('larger');
    else setFontSize('normal');
  };

  const refreshData = () => {
    setUser(DBService.getCurrentUser());
    setRefreshKey((k) => k + 1);
  };

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync URL in address bar seamlessly
    try {
      const tabPaths: Partial<Record<NavigationTab, string>> = {
        dashboard: '/dashboard',
        questions: '/banco-de-questoes',
        simulations: '/simulados',
        notebooks: '/meus-cadernos',
        disciplines: '/disciplinas',
        'study-plan': '/plano-de-estudos',
        reviews: '/revisoes',
        mistakes: '/caderno-de-erros',
        favorites: '/favoritos',
        performance: '/desempenho',
        reports: '/relatorios',
        achievements: '/conquistas',
        profile: '/perfil',
        admin: '/admin',
        'explore-concursos': '/concursos',
      };
      const newPath = tabPaths[tab] || '/dashboard';
      if (window.location.pathname !== newPath) {
        window.history.pushState({ tab }, '', newPath);
      }
    } catch (e) {
      // ignore
    }
  };

  const openPaywall = () => setIsPaywallOpen(true);
  const closePaywall = () => setIsPaywallOpen(false);

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const switchUser = (type: 'student' | 'admin') => {
    if (type === 'admin') {
      const admin = DBService.login('admin@aprova.com');
      if (admin) {
        setUser(admin);
        showToast('Perfil alternado!', 'Você agora está acessando como Administrador da APROVA+.', 'success');
      }
    } else {
      const student = DBService.login('brunobhro.26@gmail.com') || DBService.login('aluno@aprova.com');
      if (student) {
        setUser(student);
        showToast('Perfil alternado!', `Você agora está acessando como Aluno (${student.name}).`, 'info');
      }
    }
    refreshData();
  };

  const logout = () => {
    setActiveTab('landing');
    showToast('Sessão encerrada', 'Você saiu da sua conta.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        fontSize,
        setFontSize,
        cycleFontSize,
        toasts,
        showToast,
        removeToast,
        refreshData,
        refreshKey,
        initialQuestionFilter,
        setInitialQuestionFilter,
        isPaywallOpen,
        openPaywall,
        closePaywall,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
        activeNotebookId,
        setActiveNotebookId,
        switchUser,
        logout
      }}
    >
      <div
        className={`min-h-screen ${
          fontSize === 'large'
            ? 'text-[17px]'
            : fontSize === 'larger'
            ? 'text-[18px]'
            : 'text-[15px]'
        }`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
