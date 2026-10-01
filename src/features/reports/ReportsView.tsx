import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AnalyticsClient, ReportData } from '../../services/analyticsClient';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
  TrendingUp,
  FileQuestion,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { user } = useApp();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      try {
        setIsLoading(true);
        const data = await AnalyticsClient.getReport(user.id, reportType);
        if (isMounted) setReport(data);
      } catch (err) {
        console.error('Error loading report:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [user.id, reportType]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const url = AnalyticsClient.getExportCsvUrl(user.id, reportType === 'weekly' ? '7d' : '30d');
    window.location.href = url;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Relatórios Periódicos de Aprendizagem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Síntese estruturada da sua preparação para o concurso {user.targetContest || 'Transpetro'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mensal
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
          >
            Exportar CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrintPdf}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <Card className="p-8 sm:p-12 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg print:border-none print:shadow-none print:p-0">
        {/* Report Top Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              APROVA+ Concursos • Relatório Pedagógico Oficial
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Relatório {reportType === 'weekly' ? 'Semanal' : 'Mensal'} de Evolução
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Aluno: <strong>{user.name}</strong> • Concurso: <strong>{user.targetContest || 'Transpetro'} ({user.targetPosition || 'Técnico em Eletrotécnica'})</strong>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Período avaliado:</div>
            <strong className="text-slate-900 dark:text-white">
              {report?.periodStart} até {report?.periodEnd}
            </strong>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Horas Estudadas</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{report?.totalHours ?? 0}h</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Questões Respondidas</span>
            <span className="text-2xl font-black text-blue-600">{report?.questionsAnswered ?? 0}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Taxa de Acerto</span>
            <span className="text-2xl font-black text-emerald-600">{report?.accuracyRate ?? 0}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Simulados Realizados</span>
            <span className="text-2xl font-black text-indigo-600">{report?.simulationsCount ?? 0}</span>
          </div>
        </div>

        {/* Principais Conquistas & Dificuldades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conquistas */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Principais Avanços no Período
            </h4>
            <div className="space-y-2 text-xs">
              {(report?.strengths || []).map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                  <strong>{s.topicName}</strong>: {s.message}
                </div>
              ))}
              {(!report?.strengths || report.strengths.length === 0) && (
                <div className="text-slate-400 text-xs italic">Continue resolvendo questões para consolidar novos avanços.</div>
              )}
            </div>
          </div>

          {/* Dificuldades */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Principais Pontos de Atenção (Dificuldades)
            </h4>
            <div className="space-y-2 text-xs">
              {(report?.difficulties || []).map((d, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
                  <strong>{d.subjectName} → {d.topicName}</strong>: Taxa de {d.accuracy}%. {d.recommendation}
                </div>
              ))}
              {(!report?.difficulties || report.difficulties.length === 0) && (
                <div className="text-slate-400 text-xs italic">Nenhum tópico com dificuldade crítica registrado no período.</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Disciplinas */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Desempenho Consolidado por Matéria
          </h4>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Disciplina</th>
                <th className="p-2.5 text-center">Questões</th>
                <th className="p-2.5 text-center">Acertos</th>
                <th className="p-2.5 text-center">Erros</th>
                <th className="p-2.5 text-center">Taxa de Acerto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(report?.subjectBreakdown || []).map(s => (
                <tr key={s.subjectId}>
                  <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="p-2.5 text-center">{s.questions}</td>
                  <td className="p-2.5 text-center text-emerald-600 font-bold">{s.correct}</td>
                  <td className="p-2.5 text-center text-rose-500">{s.wrong}</td>
                  <td className="p-2.5 text-center font-extrabold">{s.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recomendações Estratégicas para o Próximo Período */}
        <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 space-y-3">
          <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Recomendações Estratégicas para os Próximos Dias
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-5">
            {(report?.strategicRecommendations || []).map((rec, idx) => (
              <li key={idx} className="leading-relaxed">{rec}</li>
            ))}
          </ul>
        </div>

        {/* Disclaimer Rodapé */}
        <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
          Relatório gerado automaticamente pela plataforma APROVA+ Concursos com base nas atividades reais do estudante. Não compartilha dados sensíveis de pagamento ou credenciais.
        </div>
      </Card>
    </div>
  );
};
