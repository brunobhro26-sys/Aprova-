import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  AIClient,
  AIStatus,
  AIUsageStats,
  ChatMessage,
  AIConversation,
  UserAIPreferences,
  AIGeneratedQuestion
} from '../../services/aiClient';
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  GraduationCap,
  History,
  Shield,
  Key,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';

type AssistantTab = 'chat' | 'teacher' | 'summary' | 'questions-gen' | 'history' | 'privacy';

export const StudyAssistantView: React.FC = () => {
  const { user, setActiveTab, setInitialQuestionFilter } = useApp();

  const [activeTab, setActiveTabLocal] = useState<AssistantTab>('chat');
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [preferences, setPreferences] = useState<UserAIPreferences | null>(null);

  // Chat State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Teacher Mode State
  const [teacherTopic, setTeacherTopic] = useState('Sistemas Trifásicos e Potência');
  const [teacherDiscipline, setTeacherDiscipline] = useState('Eletrotécnica');
  const [teacherLevel, setTeacherLevel] = useState('Iniciante');
  const [teacherOutput, setTeacherOutput] = useState<string | null>(null);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);

  // Summary State
  const [summaryTopic, setSummaryTopic] = useState('Lei de Ohm e Circuitos Elétricos');
  const [summaryType, setSummaryType] = useState<any>('completo');
  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Generated Questions State
  const [genDiscipline, setGenDiscipline] = useState('Eletrotécnica');
  const [genTopic, setGenTopic] = useState('Transformadores de Potência');
  const [genDifficulty, setGenDifficulty] = useState<any>('Médio');
  const [genCount, setGenCount] = useState(3);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const [statusRes, usageRes, prefsRes, convRes] = await Promise.all([
          AIClient.getStatus(),
          AIClient.getUsageStats(user.id),
          AIClient.getPreferences(user.id),
          AIClient.getConversations(user.id)
        ]);

        if (isMounted) {
          setAiStatus(statusRes);
          setUsageStats(usageRes);
          setPreferences(prefsRes);
          setConversations(convRes);

          if (convRes.length > 0) {
            setCurrentConversationId(convRes[0].id);
            const msgs = await AIClient.getMessages(convRes[0].id);
            setMessages(msgs);
          }
        }
      } catch (err) {
        console.error('Error loading AI assistant data:', err);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Switch Conversation
  const handleSelectConversation = async (convId: string) => {
    setCurrentConversationId(convId);
    try {
      const msgs = await AIClient.getMessages(convId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading conversation messages:', err);
    }
  };

  // Create New Conversation
  const handleCreateNewConversation = async () => {
    try {
      const newConv = await AIClient.createConversation(
        user.id,
        `Estudo ${new Date().toLocaleDateString('pt-BR')}`,
        'general'
      );
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([
        {
          role: 'assistant',
          content: `Olá! Nova conversa iniciada. Estou pronto para tirar dúvidas sobre **${user.targetContest || 'Transpetro'}** e matérias de concurso. O que gostaria de estudar?`
        }
      ]);
    } catch (err) {
      alert('Erro ao criar nova conversa.');
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string) => {
    try {
      await AIClient.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (currentConversationId === convId) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      alert('Erro ao excluir conversa.');
    }
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isSending) return;

    setInputPrompt('');
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await AIClient.chat(user.id, currentConversationId, prompt, {
        targetContest: user.targetContest,
        targetPosition: user.targetPosition,
        includePerformanceContext: preferences?.sendPerformanceToAi
      });

      if (res.conversationId && res.conversationId !== currentConversationId) {
        setCurrentConversationId(res.conversationId);
      }

      if (res.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.reply! }]);
      } else if (res.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `⚠️ ${res.error}` }
        ]);
      }

      // Refresh usage stats
      const updatedStats = await AIClient.getUsageStats(user.id);
      setUsageStats(updatedStats);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Erro ao enviar mensagem: ${err?.message || 'Falha de conexão'}` }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Execute Teacher Mode
  const handleRunTeacherMode = async () => {
    if (!teacherTopic || isTeacherLoading) return;
    setIsTeacherLoading(true);
    try {
      const res = await AIClient.teacherMode(user.id, teacherTopic, teacherDiscipline, teacherLevel);
      if (res.lesson) {
        setTeacherOutput(res.lesson);
      } else {
        setTeacherOutput(`⚠️ ${res.error || 'Não foi possível gerar a aula.'}`);
      }
    } catch (err: any) {
      setTeacherOutput(`Erro: ${err?.message}`);
    } finally {
      setIsTeacherLoading(false);
    }
  };

  // Execute Summary
  const handleRunSummary = async () => {
    if (!summaryTopic || isSummaryLoading) return;
    setIsSummaryLoading(true);
    try {
      const res = await AIClient.summarizeTopic(user.id, {
        topicName: summaryTopic,
        discipline: teacherDiscipline,
        summaryType,
        level: 'Intermediário'
      });
      if (res.summary) {
        setSummaryOutput(res.summary);
      } else {
        setSummaryOutput(`⚠️ ${res.error || 'Não foi possível gerar o resumo.'}`);
      }
    } catch (err: any) {
      setSummaryOutput(`Erro: ${err?.message}`);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Execute Question Generator
  const handleGenerateQuestions = async () => {
    if (!genTopic || isGenLoading) return;
    setIsGenLoading(true);
    try {
      const res = await AIClient.generateQuestions(user.id, {
        discipline: genDiscipline,
        topic: genTopic,
        difficulty: genDifficulty,
        count: genCount,
        questionType: 'Múltipla Escolha'
      });
      if (res.questions) {
        setGeneratedQuestions(res.questions);
      } else {
        alert(res.error || 'Falha ao gerar questões autorais.');
      }
    } catch (err: any) {
      alert(`Erro: ${err?.message}`);
    } finally {
      setIsGenLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-violet-800/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assistente de Estudos Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tutor de Inteligência Artificial para Concursos
          </h1>
          <p className="text-violet-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Tire dúvidas conceituais, entenda por que errou cada questão, aprenda tópicos complexos do zero e receba resumos sob medida.
          </p>
        </div>

        {/* AI Quotas / Status Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-2 shrink-0 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-violet-200 font-semibold">Cota Diária de IA:</span>
            <Badge variant={usageStats?.isLimitReached ? 'danger' : 'success'} size="sm">
              {usageStats?.usedToday || 0} / {usageStats?.dailyLimit || 50}
            </Badge>
          </div>
          <div className="text-[11px] text-slate-300">
            Modelo: <strong className="text-white">{aiStatus?.model || 'gemini-3.8-flash'}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{aiStatus?.configured ? 'Online & Conectado' : 'Modo Demonstrativo'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold scrollbar-none">
        {[
          { id: 'chat', label: 'Tira-Dúvidas Interativo', icon: <Bot className="w-4 h-4 text-violet-500" /> },
          { id: 'teacher', label: 'Modo Professor ("Do Zero")', icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
          { id: 'summary', label: 'Resumos Inteligentes', icon: <BookOpen className="w-4 h-4 text-cyan-500" /> },
          { id: 'questions-gen', label: 'Gerador de Questões Didáticas', icon: <FileQuestion className="w-4 h-4 text-indigo-500" /> },
          { id: 'history', label: 'Histórico de Conversas', icon: <History className="w-4 h-4 text-amber-500" /> },
          { id: 'privacy', label: 'Privacidade & Consentimento', icon: <Shield className="w-4 h-4 text-rose-500" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabLocal(tab.id as AssistantTab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. CHAT TIRA-DÚVIDAS (Requirement 29) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Sidebar: Suggested Prompts & Conversations */}
          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <Button
                variant="primary"
                size="sm"
                className="w-full font-bold bg-violet-600 hover:bg-violet-700 text-white"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateNewConversation}
              >
                Nova Conversa
              </Button>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                Sugestões Rápidas:
              </div>

              <div className="space-y-1.5">
                {[
                  'Como calcular a potência aparente e o fator de potência?',
                  'Explique a diferença entre ligação Estrela e Triângulo.',
                  'Quais as pegadinhas mais comuns da Cesgranrio em Eletrotécnica?',
                  'Dicas para memorizar o uso da crase antes de pronomes.'
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="w-full text-left p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-300 transition-colors line-clamp-2 cursor-pointer border border-slate-200/60 dark:border-slate-800"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </Card>

            {/* Conversations list */}
            <Card className="p-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Conversas Recentes
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {conversations.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      currentConversationId === c.id
                        ? 'bg-violet-100 dark:bg-violet-950/60 font-bold text-violet-900 dark:text-violet-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate flex-1">{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(c.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Main Area */}
          <div className="lg:col-span-3 flex flex-col h-[500px] sm:h-[650px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">
                    Olá, como posso ajudar nos seus estudos hoje?
                  </h3>
                  <p className="text-xs max-w-sm">
                    Envie uma dúvida teórica, peça um exemplo de concurso ou solicite uma explicação detalhada.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-violet-600 text-white'
                      }`}
                    >
                      {msg.role === 'user' ? user.name[0] : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Bot className="w-4 h-4 animate-spin text-violet-500" />
                  <span>Assistente pensando e estruturando a resposta didática...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Faça uma pergunta sobre o concurso, formule um conceito, tire uma dúvida..."
                className="flex-1 text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
              <Button
                variant="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isSending}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl h-10 px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MODO PROFESSOR ("Do Zero") (Requirement 30) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'teacher' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                Modo Professor: "Me ensine este conteúdo do zero"
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Uma aula completa e estruturada em 7 etapas didáticas: Introdução, Conceitos Básicos, Explicação Teórica, Exemplos de Concursos, Exercícios de Fixação, Resumo/Mnemônicos e Revisão Final.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Disciplina:
                </label>
                <input
                  type="text"
                  value={teacherDiscipline}
                  onChange={e => setTeacherDiscipline(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tópico a ser ensinado:
                </label>
                <input
                  type="text"
                  value={teacherTopic}
                  onChange={e => setTeacherTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Seu Nível Atual:
                </label>
                <select
                  value={teacherLevel}
                  onChange={e => setTeacherLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="Iniciante">Iniciante (Do zero absoluto)</option>
                  <option value="Intermediário">Intermediário (Revisão e aprofundamento)</option>
                  <option value="Avançado">Avançado (Foco em pegadinhas e exceções)</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleRunTeacherMode}
              disabled={isTeacherLoading}
              leftIcon={isTeacherLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            >
              {isTeacherLoading ? 'Preparando a Aula Completa...' : 'Iniciar Aula do Zero'}
            </Button>
          </Card>

          {teacherOutput && (
            <Card className="p-6 sm:p-8 space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <Badge variant="success" size="sm">
                  Aula Estruturada pelo Modo Professor
                </Badge>
                <span className="text-xs text-slate-400">Tópico: {teacherTopic}</span>
              </div>

              <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {teacherOutput}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. RESUMOS INTELIGENTES (Requirement 30) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-500" />
                Resumos Inteligentes sob Medida
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gere sínteses otimizadas para reta final, mapas mentais textuais ou fichas de fórmulas e macetes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tópico para Resumir:
                </label>
                <input
                  type="text"
                  value={summaryTopic}
                  onChange={e => setSummaryTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Formato do Resumo:
                </label>
                <select
                  value={summaryType}
                  onChange={e => setSummaryType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="curto">Resumo Ultracurto (Até 300 palavras)</option>
                  <option value="completo">Resumo Completo e Aprofundado</option>
                  <option value="mapa_mental">Mapa Mental Hierárquico</option>
                  <option value="formulas">Guia de Fórmulas e Equações</option>
                  <option value="pontos_importantes">Pontos Mais Cobrados e Pegadinhas</option>
                  <option value="revisao_rapida">Checklist de Perguntas Rápidas</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              onClick={handleRunSummary}
              disabled={isSummaryLoading}
              leftIcon={isSummaryLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isSummaryLoading ? 'Sintetizando Conteúdo...' : 'Gerar Resumo Inteligente'}
            </Button>
          </Card>

          {summaryOutput && (
            <Card className="p-6 sm:p-8 space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <Badge variant="primary" size="sm">
                  Síntese de Estudo
                </Badge>
                <span className="text-xs text-slate-400">Formato: {summaryType}</span>
              </div>

              <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {summaryOutput}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. GERADOR DE QUESTÕES DIDÁTICAS IA (Requirement 30) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'questions-gen' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-indigo-500" />
                Gerador de Questões Didáticas Autorais
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gere novas questões inéditas com gabarito justificado e validação técnica da IA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Disciplina:
                </label>
                <input
                  type="text"
                  value={genDiscipline}
                  onChange={e => setGenDiscipline(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tópico:
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dificuldade:
                </label>
                <select
                  value={genDifficulty}
                  onChange={e => setGenDifficulty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantidade (1 a 5):
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={genCount}
                  onChange={e => setGenCount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              onClick={handleGenerateQuestions}
              disabled={isGenLoading}
              leftIcon={isGenLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isGenLoading ? 'Elaborando Questões Inéditas...' : 'Gerar Questões com IA'}
            </Button>
          </Card>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              {generatedQuestions.map((q, qIdx) => {
                const isAnswerRevealed = revealedAnswers[q.id];

                return (
                  <Card key={q.id || qIdx} className="p-6 space-y-4 bg-white dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">
                          Questão Inédita #{qIdx + 1}
                        </Badge>
                        <Badge variant="primary" size="sm">
                          {q.badge}
                        </Badge>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {q.discipline} • {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.statement}
                    </p>

                    <div className="space-y-2 pt-2">
                      {q.options.map(opt => (
                        <div
                          key={opt.letter}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-3 transition-colors ${
                            isAnswerRevealed && opt.letter === q.correctOption
                              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
                            {opt.letter}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRevealedAnswers(prev => ({
                            ...prev,
                            [q.id]: !prev[q.id]
                          }))
                        }
                      >
                        {isAnswerRevealed ? 'Ocultar Gabarito' : 'Ver Gabarito & Resolução'}
                      </Button>
                    </div>

                    {isAnswerRevealed && (
                      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs space-y-2">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300">
                          Gabarito Oficial: Alternativa ({q.correctOption})
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. HISTÓRICO DE CONVERSAS (Requirement 38) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Histórico de Conversas com o Assistente
              </h3>
              <p className="text-xs text-slate-500">
                Todas as sessões de estudo são salvas de forma segura no banco de dados.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleCreateNewConversation}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Conversa
            </Button>
          </div>

          <div className="space-y-2">
            {conversations.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:border-violet-500 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {c.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Criada em {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleSelectConversation(c.id);
                      setActiveTabLocal('chat');
                    }}
                  >
                    Reabrir Conversa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => handleDeleteConversation(c.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. PRIVACIDADE & CONSENTIMENTO (Requirement 41) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'privacy' && (
        <Card className="p-6 space-y-6 max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Privacidade, Transparência & Dados do Usuário
            </h3>
            <p className="text-xs text-slate-500">
              Controle quais informações da sua preparação podem ser usadas para alimentar o Assistente de Estudos.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Compartilhar resumo de desempenho pedagógico com a IA
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Permite que o assistente conheça suas matérias fortes e fracas para recomendar questões e prioridades personalizadas.
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences?.sendPerformanceToAi ?? true}
                onChange={async e => {
                  const updated = { ...preferences, sendPerformanceToAi: e.target.checked } as UserAIPreferences;
                  setPreferences(updated);
                  await AIClient.savePreferences(user.id, { sendPerformanceToAi: e.target.checked });
                }}
                className="mt-1 w-5 h-5 text-violet-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Autorizar personalização de sugestões e hipóteses de erro
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gera hipóteses didáticas automáticas para os erros registrados nas resoluções.
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences?.consentAiPersonalization ?? true}
                onChange={async e => {
                  const updated = { ...preferences, consentAiPersonalization: e.target.checked } as UserAIPreferences;
                  setPreferences(updated);
                  await AIClient.savePreferences(user.id, { consentAiPersonalization: e.target.checked });
                }}
                className="mt-1 w-5 h-5 text-violet-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <strong>Garantia de Segurança & Confidencialidade:</strong>
            <p className="text-[11px] leading-relaxed">
              Senhas, dados cadastrais confidenciais, documentos e informações de pagamento NUNCA são transmitidos para os modelos de IA. Apenas enunciados de questões de concursos e tópicos de estudo são processados para fins exclusivamente pedagógicos.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
