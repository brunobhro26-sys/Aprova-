import React from 'react';
import { Button } from './Button';
import { Compass, ArrowLeft, LayoutDashboard, Search } from 'lucide-react';

interface NotFoundViewProps {
  onBackToDashboard?: () => void;
  onOpenSearch?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onBackToDashboard,
  onOpenSearch,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            Erro 404
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Página Não Encontrada
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            O módulo ou recurso que você tentou acessar não foi localizado ou foi movido na plataforma APROVA+.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onBackToDashboard && (
            <Button
              variant="primary"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto font-bold"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          )}
          {onOpenSearch && (
            <Button
              variant="outline"
              onClick={onOpenSearch}
              className="w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Conteúdo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
