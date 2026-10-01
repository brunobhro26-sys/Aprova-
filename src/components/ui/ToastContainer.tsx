import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/30',
          warning: 'border-amber-500/30',
          error: 'border-rose-500/30',
          info: 'border-indigo-500/30'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border ${borders[toast.type || 'info']} rounded-xl shadow-lg shadow-slate-950/10 text-slate-800 dark:text-slate-100 transition-all duration-300 animate-in slide-in-from-bottom-3`}
          >
            {icons[toast.type || 'info']}
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
