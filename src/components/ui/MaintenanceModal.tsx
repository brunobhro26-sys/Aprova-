import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Wrench, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Wrench className="w-5 h-5" />
          <span>Janela de Manutenção Programada</span>
        </div>
      }
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            APROVA+ Operando em Alta Disponibilidade
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            As atualizações de bancas, sincronização de cadernos e correções de simulados são executadas com zero downtime. Seus registros estão preservados e sincronizados com a nuvem Cloud SQL.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-left space-y-1.5 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Banco de Dados Cloud SQL: Conectado</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Serviço de IA Gemini: Operacional</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sincronização PWA Offline: Pronta</span>
          </div>
        </div>
        <div className="pt-2">
          <Button variant="primary" className="w-full font-bold" onClick={onClose}>
            Entendido, Continuar Estudos
          </Button>
        </div>
      </div>
    </Modal>
  );
};
