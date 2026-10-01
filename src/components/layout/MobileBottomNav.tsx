import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { LayoutDashboard, FileQuestion, CalendarDays, BarChart3, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Início', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'questions', label: 'Questões', icon: <FileQuestion className="w-5 h-5" /> },
    { id: 'study-plan', label: 'Estudar', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'performance', label: 'Desempenho', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Navegação Principal Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl transition-all"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-current={isActive ? 'page' : undefined}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Active Top indicator line */}
            {isActive && (
              <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm shadow-indigo-500/50" />
            )}

            <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
