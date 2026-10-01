import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileQuestion,
  Target,
  BookOpen,
  CalendarDays,
  RotateCcw,
  AlertOctagon,
  Star,
  Trophy,
  BarChart3,
  User,
  ShieldAlert,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  BookMarked,
  Compass,
  Bot,
  FileText
} from 'lucide-react';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, activeTab, setActiveTab, openPaywall, logout } = useApp();

  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'assistant', label: 'Assistente IA', icon: <Bot className="w-4 h-4 text-violet-500" />, badge: 'Novo' },
    { id: 'questions', label: 'Banco de Questões', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'notebooks', label: 'Meus Cadernos', icon: <BookMarked className="w-4 h-4 text-indigo-500" /> },
    { id: 'simulations', label: 'Simulados', icon: <Target className="w-4 h-4" /> },
    { id: 'explore-concursos', label: 'Concursos Brasil', icon: <Compass className="w-4 h-4 text-cyan-500" /> },
    { id: 'disciplines', label: 'Disciplinas & Matriz', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'study-plan', label: 'Plano de Estudos', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'reviews', label: 'Revisões Inteligentes', icon: <RotateCcw className="w-4 h-4" />, badge: 'Hoje' },
    { id: 'mistakes', label: 'Caderno de Erros', icon: <AlertOctagon className="w-4 h-4 text-rose-500" /> },
    { id: 'favorites', label: 'Favoritos', icon: <Star className="w-4 h-4 text-amber-500" /> },
    { id: 'performance', label: 'Desempenho & Métricas', icon: <BarChart3 className="w-4 h-4 text-emerald-500" /> },
    { id: 'reports', label: 'Relatórios de Evolução', icon: <FileText className="w-4 h-4 text-blue-500" /> },
    { id: 'achievements', label: 'Conquistas & Ranking', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
    { id: 'profile', label: 'Meu Perfil', icon: <User className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Logo showTagline />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin panel link */}
          <div className="pt-3">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Gestão
            </div>
            <button
              onClick={() => handleSelectTab('admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Painel Admin (/admin)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Premium Upgrade Promotion Banner */}
        <div className="p-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border border-indigo-800/50 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>APROVA+ PREMIUM</span>
              </div>
              <p className="text-[11px] text-indigo-200 leading-snug">
                Desbloqueie simulados ilimitados, caderno de erros avançado e cronograma inteligente.
              </p>
              <button
                onClick={openPaywall}
                className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Conhecer Planos
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>

        {/* Footer controls: Configurações, Ajuda, Sair */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
          <button
            onClick={() => handleSelectTab('profile')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
          <button
            onClick={() => {
              handleSelectTab('landing');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ajuda & FAQ</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
