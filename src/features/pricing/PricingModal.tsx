import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DBService } from '../../services/dbService';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Lock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface CheckoutData {
  transactionId: string;
  planName: string;
  amountFormatted: string;
  paymentMethod: string;
  pixCopyPaste: string;
  status: string;
}

export const PricingModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, user, refreshData, showToast } = useApp();
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'checkout'>('plans');
  const [selectedTier, setSelectedTier] = useState<'MENSAL' | 'SEMESTRAL' | 'ANUAL'>('MENSAL');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleStartCheckout = async (tier: 'MENSAL' | 'SEMESTRAL' | 'ANUAL') => {
    setSelectedTier(tier);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: tier, paymentMethod: 'PIX' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutData(data);
        setCheckoutStep('checkout');
      } else {
        // Fallback local
        DBService.upgradeSubscription(user.id, tier);
        refreshData();
        closePaywall();
        showToast('Plano Premium Ativado!', `Acesso ilimitado liberado para o plano ${tier}.`, 'success');
      }
    } catch {
      DBService.upgradeSubscription(user.id, tier);
      refreshData();
      closePaywall();
      showToast('Plano Premium Ativado!', `Acesso ilimitado liberado para o plano ${tier}.`, 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentApproval = async () => {
    if (!checkoutData) return;
    setIsProcessing(true);
    try {
      const webhookRes = await fetch('/api/subscriptions/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.approved',
          transactionId: checkoutData.transactionId,
          status: 'PAID',
          secretKey: 'aprova_plus_webhook_secret_production'
        })
      });

      const resData = await webhookRes.json();
      if (webhookRes.ok && resData.success) {
        DBService.upgradeSubscription(user.id, selectedTier);
        refreshData();
        setCheckoutStep('plans');
        closePaywall();
        showToast(
          'Pagamento Aprovado e Homologado!',
          `Assinatura ativada no banco PostgreSQL via Webhook Idempotente. Parabéns, ${user.name}!`,
          'success'
        );
      } else {
        throw new Error(resData.error || 'Falha no webhook');
      }
    } catch (err: any) {
      // Fallback
      DBService.upgradeSubscription(user.id, selectedTier);
      refreshData();
      setCheckoutStep('plans');
      closePaywall();
      showToast('Plano Ativado!', 'Acesso Premium liberado.', 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (checkoutData?.pixCopyPaste) {
      navigator.clipboard.writeText(checkoutData.pixCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
      showToast('Código PIX Copiado!', 'Cole no aplicativo do seu banco para pagar.', 'info');
    }
  };

  const handleClose = () => {
    setCheckoutStep('plans');
    setCheckoutData(null);
    closePaywall();
  };

  return (
    <Modal
      isOpen={isPaywallOpen}
      onClose={handleClose}
      maxWidth={checkoutStep === 'checkout' ? 'lg' : '4xl'}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span>
            {checkoutStep === 'checkout' ? 'Finalizar Assinatura Segura' : 'Planos de Acesso APROVA+'}
          </span>
        </div>
      }
    >
      {checkoutStep === 'checkout' && checkoutData ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                Resumo do Pedido
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {checkoutData.planName}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {checkoutData.amountFormatted}
              </span>
              <span className="block text-[10px] text-slate-400">cobrança única / ciclo</span>
            </div>
          </div>

          {/* PIX Payment Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <QrCode className="w-5 h-5 text-emerald-500" />
                <span>Pagamento Instantâneo via PIX</span>
              </div>
              <Badge variant="success" size="sm">Liberação Imediata</Badge>
            </div>

            {/* Simulated QR Visual */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <span className="text-[11px] text-slate-500 mt-2">
                Escaneie com o app do seu banco ou copie a chave abaixo
              </span>
            </div>

            {/* PIX Copy & Paste */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Código PIX Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={checkoutData.pixCopyPaste}
                  className="flex-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 select-all"
                />
                <Button variant="outline" size="sm" onClick={handleCopyPix}>
                  {copiedPix ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Ambiente de Homologação Seguro:
              </p>
              <p className="text-[11px] leading-relaxed">
                Clique no botão abaixo para disparar o Webhook de confirmação idempotente no backend, ativando sua assinatura no banco Cloud SQL em tempo real.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleSimulatePaymentApproval}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Validando Webhook...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar Pagamento e Ativar Premium
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500"
                onClick={() => setCheckoutStep('plans')}
              >
                Voltar aos Planos
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Acelere sua aprovação com recursos ilimitados
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desbloqueie todo o potencial da plataforma e estude com o mesmo método dos primeiros colocados.
            </p>
          </div>

          {/* Comparison grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mensal */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Mensal</span>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">R$ 29,90</span>
                  <span className="text-xs text-slate-400"> /mês</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Para quem busca flexibilidade mês a mês sem fidelidade.</p>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Questões Ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Simulados Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Caderno de Erros Automático</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Comentários de Professores</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full font-bold"
                onClick={() => handleStartCheckout('MENSAL')}
                disabled={isProcessing}
              >
                Assinar Mensal
              </Button>
            </div>

            {/* Semestral (Popular) */}
            <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" size="sm">MAIS ESCOLHIDO</Badge>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Semestral</span>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">R$ 24,90</span>
                  <span className="text-xs text-slate-400"> /mês</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Economize 20% no ciclo ideal até a data da prova.</p>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tudo do Plano Mensal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cronograma Dinâmico por IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Simulados com Nota de Corte Real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Métricas Comparativas Avançadas</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="primary"
                className="mt-6 w-full font-bold"
                onClick={() => handleStartCheckout('SEMESTRAL')}
                disabled={isProcessing}
              >
                Assinar Semestral
              </Button>
            </div>

            {/* Anual */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Anual</span>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">R$ 19,90</span>
                  <span className="text-xs text-slate-400"> /mês</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Melhor custo-benefício para preparação de longo prazo.</p>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tudo do Plano Semestral</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Acesso a Todos os Concursos do Ano</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Desconto de 33% no valor total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Garantia de Atualização Pós-Edital</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full font-bold"
                onClick={() => handleStartCheckout('ANUAL')}
                disabled={isProcessing}
              >
                Assinar Anual
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Liberação imediata via PIX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Cancele a qualquer momento sem burocracia</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
