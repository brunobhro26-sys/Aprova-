import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Zap,
  Moon,
  Sun,
  Type,
  Bell,
  Check,
  Shield,
  UserCheck,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Search
} from 'lucide-react';
import { DBService } from '../../services/dbService';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const {
    user,
    darkMode,
    toggleDarkMode,
    fontSize,
    cycleFontSize,
    switchUser,
    openPaywall,
    setActiveTab,
    openSearchModal,
    showToast
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const levelInfo = DBService.getLevelFromXp(user.xp);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Abrir menu lateral"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand logo on mobile */}
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        {/* Target Contest Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Foco atual:</span>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <span>{user.targetContest || 'Transpetro'}</span>
            <span className="text-indigo-400 dark:text-indigo-500">•</span>
            <span className="font-normal">{user.targetPosition || 'Técnico em Eletrotécnica'}</span>
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search shortcut button */}
        <button
          onClick={openSearchModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-colors cursor-pointer"
          title="Pesquisa Global de Concursos, Órgãos, Cargos e Questões (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline font-medium">Buscar...</span>
          <kbd className="hidden md:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Streak counter */}
        <div
          title={`Sequência ativa: ${user.streakDays} dias consecutivos de estudo!`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-xs font-bold"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{user.streakDays} {user.streakDays === 1 ? 'dia' : 'dias'}</span>
        </div>

        {/* XP & Level pill */}
        <button
          onClick={() => setActiveTab('achievements')}
          className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold hover:bg-emerald-100 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
          <span>{user.xp} XP</span>
          <span className="text-emerald-400 font-normal hidden md:inline">| {levelInfo.name.split('—')[0]}</span>
        </button>

        {/* Font size toggle for accessibility */}
        <button
          onClick={cycleFontSize}
          title={`Ajustar tamanho da fonte: ${fontSize}`}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {fontSize === 'larger' ? 'A++' : fontSize === 'large' ? 'A+' : 'A'}
          </span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Notificações</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">
                  Marcar como lidas
                </span>
              </div>
              <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    🎯 Meta do dia: 40 questões
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Você resolveu 32 de 40 questões hoje. Faltam apenas 8 para cumprir a meta!
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    🔥 Sequência de 3 dias
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Parabéns pela dedicação diária. O segredo da aprovação é a constância.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    🔄 Revisão recomendada
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Revisar Teoremas de Circuitos Elétricos hoje para consolidar o aprendizado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown & quick switch */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {user.name}
                {user.role === 'ADMIN' && (
                  <Shield className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {user.role === 'ADMIN' ? 'Administrador' : user.subscription.tier.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={user.subscription.tier === 'GRATUITO' ? 'default' : 'success'} size="sm">
                    {user.subscription.tier === 'GRATUITO' ? 'Plano Gratuito' : 'Plano Premium Ativo'}
                  </Badge>
                  {user.subscription.tier === 'GRATUITO' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openPaywall();
                      }}
                      className="text-[11px] text-indigo-600 font-bold hover:underline"
                    >
                      Assinar Pro
                    </button>
                  )}
                </div>
              </div>

              {/* Fast switch student / admin for grading & demonstration */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Modo de Demonstração
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      switchUser('student');
                      setShowUserMenu(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-left flex items-center justify-between text-xs font-semibold ${
                      user.role === 'STUDENT'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Aluno</span>
                    {user.role === 'STUDENT' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUser('admin');
                      setShowUserMenu(false);
                      setActiveTab('admin');
                    }}
                    className={`px-2 py-1.5 rounded-lg text-left flex items-center justify-between text-xs font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Admin</span>
                    {user.role === 'ADMIN' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-xs space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setActiveTab('profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  Meu Perfil e Configurações
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    openPaywall();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Planos e Assinatura
                </button>
                <button
                  onClick={() => {
                    DBService.resetDemoData();
                    window.location.reload();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Restaurar Dados Padrão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
