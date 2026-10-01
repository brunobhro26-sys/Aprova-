import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileQuestion,
  Target,
  BarChart3,
  CalendarDays,
  RotateCcw,
  Trophy,
  ShieldCheck,
  ChevronDown,
  Layers,
  HelpCircle,
  Clock,
  Compass,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, openAuthModal, openPaywall } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Stats numbers easily editable in code as required by item 4 of prompt
  const stats = [
    { value: '+50.000', label: 'Questões no Banco', sub: 'Comentadas e categorizadas' },
    { value: '+500', label: 'Concursos Mapeados', sub: 'Editais federais, estaduais e municipais' },
    { value: '+100', label: 'Disciplinas & Assuntos', sub: 'Da teoria à prática de prova' },
    { value: '+10.000', label: 'Alunos Aprovados', sub: 'Evoluindo diariamente com o método' },
  ];

  const benefits = [
    {
      icon: <FileQuestion className="w-6 h-6 text-indigo-500" />,
      title: 'Milhares de Questões',
      description: 'Questões com gabarito comentado, estatísticas de acerto da comunidade e comentários de professores especialistas.'
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-500" />,
      title: 'Simulados Personalizados',
      description: 'Crie simulados por banca, concurso, cargo e tempo real de prova. Treine exatamente sob as condições do grande dia.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      title: 'Estatísticas Detalhadas',
      description: 'Gráficos de evolução, taxa de acerto por matéria, tempo médio por questão e identificação precisa dos seus pontos fracos.'
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-amber-500" />,
      title: 'Plano de Estudos Inteligente',
      description: 'Cronograma gerado a partir da sua rotina disponível e data da prova, equilibrando teoria, questões e simulados.'
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-rose-500" />,
      title: 'Revisão & Caderno de Erros',
      description: 'Revisão espaçada automatizada e caderno exclusivo de erros para você nunca mais errar a mesma pegadinha em prova.'
    },
    {
      icon: <Trophy className="w-6 h-6 text-purple-500" />,
      title: 'Gamificação & Ranking',
      description: 'Acumule XP, suba de nível, conquiste medalhas e compare seu desempenho no ranking geral ou específico do seu concurso.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Escolha seu Concurso',
      desc: 'Defina seu foco: Transpetro, Petrobras, Tribunais, Bancários ou Carreiras Policiais. O sistema se molda ao seu edital.'
    },
    {
      step: '02',
      title: 'Resolva Questões Reais',
      desc: 'Filtre por banca, cargo e assunto. Pratique com atalhos de teclado e receba retorno imediato em cada alternativa.'
    },
    {
      step: '03',
      title: 'Analise seus Erros',
      desc: 'Acesse o comentário detalhado do professor e envie questões com falha diretamente para o seu Caderno de Erros.'
    },
    {
      step: '04',
      title: 'Acompanhe sua Evolução',
      desc: 'Monitore sua curva de acertos, cumpra a meta diária e chegue ao topo do ranking com confiança inabalável.'
    }
  ];

  const faqs = [
    {
      q: 'A plataforma oferece questões comentadas por professores?',
      a: 'Sim! Todas as questões contêm fundamentação pedagógica detalhada com explicação passo a passo, além de espaço colaborativo de debate entre estudantes.'
    },
    {
      q: 'Como funciona o Caderno de Erros automático?',
      a: 'Toda vez que você errar uma questão em um treino ou simulado, ela é arquivada automaticamente no seu Caderno de Erros para que você possa refazê-la mais tarde até consolidar o conteúdo.'
    },
    {
      q: 'Posso usar a plataforma no celular?',
      a: 'Sim, o APROVA+ é 100% responsivo para smartphone, tablet e desktop, incluindo barra de navegação inferior tátil e atalhos rápidos.'
    },
    {
      q: 'O que o plano gratuito inclui?',
      a: 'O plano gratuito permite resolver até 20 questões diárias, acessar estatísticas básicas e testar simulados essenciais sem compromisso financeiro.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Landing Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo showTagline size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#como-funciona" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Como funciona
            </a>
            <button
              onClick={() => setActiveTab('questions')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Banco de Questões
            </button>
            <a href="#beneficios" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Recursos
            </a>
            <a href="#planos" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAuthModal('login')}
            >
              Entrar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAuthModal('register')}
            >
              Criar conta grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Foco no Concurso Transpetro • Técnico em Eletrotécnica & Mais</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Estude de forma inteligente.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
              Evolua todos os dias.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A plataforma completa para sua aprovação: resolva milhares de questões comentadas,
            crie simulados personalizados, execute revisões automáticas e domine o seu edital.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setActiveTab('dashboard')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-lg shadow-indigo-600/30 font-bold"
            >
              Começar agora
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setActiveTab('questions')}
              className="w-full sm:w-auto font-bold"
            >
              Conhecer a plataforma
            </Button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sem necessidade de cartão para começar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Banco com gabarito fundamentado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cronograma sob medida para sua rotina</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section (Easily editable numbers) */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {item.value}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works (4 Steps) */}
      <section id="como-funciona" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">Método Comprovado</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Como funciona o APROVA+
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Desenvolvemos uma esteira de estudos orientada a resultados práticos para garantir sua evolução contínua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <Card key={idx} className="p-6 relative overflow-hidden group hover:border-indigo-400 transition-all">
                <div className="text-4xl font-black text-slate-100 dark:text-slate-800 group-hover:text-indigo-500/10 transition-colors">
                  {st.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Cards Section */}
      <section id="beneficios" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="success" className="mb-3">Ecossistema Completo</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Tudo o que você precisa em um único lugar
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Esqueça planilhas confusas e pilhas de papel. O APROVA+ centraliza toda a sua jornada preparatória.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <Card key={idx} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans & Pricing Section */}
      <section id="planos" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3">Planos e Assinatura</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Invista no seu futuro de servidor público
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Escolha a modalidade ideal para o seu ritmo de estudos. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gratuito */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gratuito</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para dar os primeiros passos</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 0</span>
                  <span className="text-xs text-slate-500 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>20 questões por dia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dashboard de métricas básico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 simulado por semana</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span>Sem caderno de erros</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => setActiveTab('dashboard')}
              >
                Plano Atual
              </Button>
            </Card>

            {/* Mensal */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mensal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sem fidelidade</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 29,90</span>
                  <span className="text-xs text-slate-500 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Questões ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Simulados ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Caderno de erros completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Plano de estudos automático</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="primary"
                className="mt-6 w-full"
                onClick={openPaywall}
              >
                Assinar Mensal
              </Button>
            </Card>

            {/* Semestral */}
            <Card className="p-6 flex flex-col justify-between border-indigo-300 dark:border-indigo-700">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Semestral</h3>
                  <Badge variant="primary" size="sm">Mais Vendido</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Economia de 20%</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">R$ 24,90</span>
                  <span className="text-xs text-slate-500 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Todos os recursos do Mensal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Revisão espaçada por algoritmo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Exportação de resumos em PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Suporte prioritário a dúvidas</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="primary"
                className="mt-6 w-full shadow-md shadow-indigo-600/30"
                onClick={openPaywall}
              >
                Assinar Semestral
              </Button>
            </Card>

            {/* Anual */}
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-b from-indigo-50/40 dark:from-indigo-950/30 to-transparent">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anual</h3>
                  <Badge variant="success" size="sm">Melhor Valor</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Foco até a posse</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 19,90</span>
                  <span className="text-xs text-slate-500 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Acesso total por 12 meses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Garantia de atualização pós-edital</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Acesso aos novos simulados semanais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Mentoria e ranking VIP</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="success"
                className="mt-6 w-full"
                onClick={openPaywall}
              >
                Assinar Anual
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Perguntas Frequentes</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Tire suas dúvidas sobre o APROVA+
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" />
          <p>© 2026 APROVA+ Tecnologia Educacional. Todos os direitos reservados. Questões demonstrativas.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white">Termos de Uso</span>
            <span className="cursor-pointer hover:text-white">Privacidade</span>
            <span className="cursor-pointer hover:text-white">Segurança</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
