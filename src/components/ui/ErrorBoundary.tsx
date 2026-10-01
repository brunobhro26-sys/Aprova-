import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Structured error logging without leaking secrets to users
    console.error(`[APROVA+ Global Error Boundary caught ${this.state.errorId}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
                Instabilidade Temporária
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Ops! Algo inesperado aconteceu.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nosso sistema registrou o ocorrido com o identificador abaixo para auditoria técnica. Seus dados e progresso de estudos permanecem seguros.
              </p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] font-mono text-slate-600 dark:text-slate-400 select-all">
              Protocolo de Suporte: <strong className="text-slate-900 dark:text-white">{this.state.errorId}</strong>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Aplicação
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir para o Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
