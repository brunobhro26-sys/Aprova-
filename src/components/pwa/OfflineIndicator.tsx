import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 flex items-center justify-between gap-3 rounded-2xl bg-amber-600 text-white px-4 py-2.5 shadow-xl border border-amber-500/50 backdrop-blur-md animate-fade-in">
      <div className="flex items-center gap-2.5 text-xs font-semibold">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <span className="block font-bold">Sem conexão de rede (Modo Offline)</span>
          <span className="text-[11px] text-amber-100 font-normal">
            Seu progresso está sendo salvo localmente e será sincronizado quando você voltar a ficar online.
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full tracking-wider">
          Offline
        </span>
      </div>
    </div>
  );
};
