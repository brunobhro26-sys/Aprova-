import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DBService } from '../../services/dbService';
import { Mail, Lock, User, Target, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    openOnboarding,
    setActiveTab,
    refreshData,
    showToast,
    switchUser
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(
    authModalMode === 'register' ? 'register' : 'login'
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetContest, setTargetContest] = useState('Transpetro');
  const [targetPosition, setTargetPosition] = useState('Técnico em Eletrotécnica');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = DBService.login(email || 'aluno@aprova.com');
      if (user) {
        showToast('Login realizado com sucesso!', `Bem-vindo de volta, ${user.name}!`, 'success');
        closeAuthModal();
        setActiveTab('dashboard');
        refreshData();
      } else {
        setErrorMessage('E-mail ou senha incorretos. Use os botões de demonstração abaixo para acesso imediato.');
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('A senha deve conter no mínimo 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Você deve aceitar os termos de uso para continuar.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser = DBService.registerUser({
        name,
        email,
        targetContest,
        targetPosition
      });
      showToast('Conta criada com sucesso!', 'Vamos personalizar seu plano de estudos.', 'success');
      closeAuthModal();
      refreshData();
      // Launch Onboarding wizard immediately!
      openOnboarding();
    }, 500);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMessage('Informe um e-mail válido para recuperação.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Instruções enviadas', 'Verifique sua caixa de entrada para redefinir sua senha.', 'info');
      setMode('login');
    }, 500);
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
      title={
        mode === 'login'
          ? 'Entrar no APROVA+'
          : mode === 'register'
          ? 'Criar Conta Gratuita'
          : 'Recuperação de Senha'
      }
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Login Mode */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail cadastrado
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setMode('recovery')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
              Lembrar meu acesso neste dispositivo
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold"
            isLoading={isLoading}
          >
            Acessar Plataforma
          </Button>

          {/* Quick Demo Access for review */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
              Acesso Rápido para Avaliação
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                onClick={() => {
                  switchUser('student');
                  closeAuthModal();
                  setActiveTab('dashboard');
                }}
              >
                Aluno Demo
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Shield className="w-3.5 h-3.5 text-purple-500" />}
                onClick={() => {
                  switchUser('admin');
                  closeAuthModal();
                  setActiveTab('admin');
                }}
              >
                Admin Demo
              </Button>
            </div>
          </div>

          {/* Social login buttons (Google, Apple, Microsoft) */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 mb-2">Ou acesse com:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  switchUser('student');
                  closeAuthModal();
                  setActiveTab('dashboard');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="font-bold text-rose-500">G</span> Google
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('student');
                  closeAuthModal();
                  setActiveTab('dashboard');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                Apple
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('student');
                  closeAuthModal();
                  setActiveTab('dashboard');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                Microsoft
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Cadastre-se gratuitamente
            </button>
          </div>
        </form>
      )}

      {/* Register Mode */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bruno"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Concurso Foco
              </label>
              <select
                value={targetContest}
                onChange={(e) => setTargetContest(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Transpetro">Transpetro</option>
                <option value="Petrobras">Petrobras</option>
                <option value="Furnas">Furnas</option>
                <option value="Eletrobras">Eletrobras</option>
                <option value="Caixa Econômica">Caixa Econômica</option>
                <option value="Outro">Outro Concurso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo Desejado
              </label>
              <input
                type="text"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="Ex: Técnico em Eletrotécnica"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 dígitos"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5"
            />
            <label htmlFor="terms" className="ml-2 text-xs text-slate-600 dark:text-slate-400 leading-tight">
              Li e concordo com os Termos de Uso e Política de Privacidade da APROVA+.
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold"
            isLoading={isLoading}
          >
            Cadastrar e Personalizar Estudos
          </Button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Já possui uma conta?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Fazer login
            </button>
          </div>
        </form>
      )}

      {/* Password Recovery Mode */}
      {mode === 'recovery' && (
        <form onSubmit={handleRecovery} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Informe o e-mail associado à sua conta. Enviaremos um link seguro para você redefinir sua senha.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Enviar Link de Recuperação
          </Button>

          <div className="text-center text-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Voltar ao Login
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
