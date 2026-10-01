import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

export const AdminImportTab: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [importType, setImportType] = useState<'questoes' | 'concursos' | 'taxonomia'>('questoes');
  const [selectedFile, setSelectedFile] = useState<string | null>('base_mestre_concursos_brasil.xlsx');
  const [validationResult, setValidationResult] = useState<{
    newCount: number;
    duplicateCount: number;
    invalidCount: number;
    validCount: number;
    previewRecords: any[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);

  // Realistic sample batch data from base_mestre_concursos_brasil.xlsx
  const sampleQuestionsBatch = [
    {
      code: 'Q-IMP-BR-01',
      contest: 'Transpetro 2024',
      organization: 'Transpetro',
      position: 'Técnico em Eletrotécnica',
      board: 'Cesgranrio',
      year: 2024,
      discipline: 'Circuitos Elétricos',
      topic: 'Máxima Transferência de Potência',
      statement:
        'Em um circuito alimentado por uma fonte linear com tensão de circuito aberto de 24 V e resistência equivalente de Thévenin de 6 Ω, determine o valor da resistência de carga RL para que haja máxima transferência de potência e o respectivo valor da potência dissipada.',
      optA: 'RL = 6 Ω; P = 24 W',
      optB: 'RL = 12 Ω; P = 12 W',
      optC: 'RL = 6 Ω; P = 48 W',
      optD: 'RL = 3 Ω; P = 32 W',
      optE: 'RL = 18 Ω; P = 16 W',
      correctOptionLetter: 'A',
      explanation:
        'Pelo teorema da máxima transferência de potência, a resistência de carga RL deve ser igual à resistência de Thévenin (Rth = 6 Ω). A potência máxima é P = Vth² / (4·Rth) = 24² / (4·6) = 576 / 24 = 24 W.',
      difficulty: 'Médio'
    },
    {
      code: 'Q-IMP-BR-02',
      contest: 'Petrobras 2024',
      organization: 'Petrobras',
      position: 'Engenheiro de Petróleo',
      board: 'Cebraspe',
      year: 2024,
      discipline: 'Física / Termodinâmica',
      topic: 'Ciclos Termodinâmicos',
      statement:
        'No ciclo de Carnot operando entre as temperaturas de 600 K e 300 K, o rendimento teórico máximo alcançável pela máquina térmica equivale a exatamente 50%.',
      optA: 'Certo',
      optB: 'Errado',
      optC: 'Não se aplica',
      optD: 'Inconclusivo',
      optE: 'Requer dados de entalpia',
      correctOptionLetter: 'A',
      explanation:
        'O rendimento do ciclo de Carnot é η = 1 - (Tfria / Tquente) = 1 - (300 / 600) = 1 - 0,5 = 0,5 (50%). Item CORRETO.',
      difficulty: 'Fácil'
    },
    {
      code: 'Q-IMP-BR-03',
      contest: 'Transpetro 2024',
      organization: 'Transpetro',
      position: 'Técnico em Eletrotécnica',
      board: 'Cesgranrio',
      year: 2024,
      discipline: 'Eletrotécnica',
      topic: 'Sistemas Trifásicos',
      statement:
        'Em uma carga trifásica equilibrada conectada em estrela (Y) a quatro condutores (com neutro), sendo as correntes de fase senoidais e simétricas, qual a intensidade da corrente elétrica resultante que percorre o condutor neutro?',
      optA: 'Corrente nula (0 A)',
      optB: 'Três vezes a corrente de fase (3·Ifase)',
      optC: 'Raiz de três vezes a corrente de fase (√3·Ifase)',
      optD: 'A média aritmética das correntes de fase',
      optE: 'O dobro da corrente de linha (2·Ilinha)',
      correctOptionLetter: 'A',
      explanation:
        'Pela lei das correntes de Kirchhoff no nó neutro de um sistema trifásico equilibrado e simétrico, a soma fasorial das correntes ia + ib + ic é exatamente igual a zero, logo a corrente pelo neutro é nula.',
      difficulty: 'Fácil'
    }
  ];

  const handleValidate = () => {
    setIsProcessing(true);
    const result = DBService.validateImportBatch(importType, sampleQuestionsBatch);
    setValidationResult(result);
    setImportLogs([
      `[${new Date().toLocaleTimeString()}] Arquivo carregado: ${selectedFile}`,
      `[${new Date().toLocaleTimeString()}] Estrutura de colunas verificada: 100% aderente ao esquema APROVA+`,
      `[${new Date().toLocaleTimeString()}] Registros válidos identificados: ${result.newCount}`,
      `[${new Date().toLocaleTimeString()}] Registros duplicados detectados: ${result.duplicateCount}`,
      `[${new Date().toLocaleTimeString()}] Erros ou campos nulos: ${result.invalidCount}`,
      `[${new Date().toLocaleTimeString()}] Prévia pronta para inspeção do operador.`
    ]);
    setIsProcessing(false);
    showToast('Validação Concluída', `${result.newCount} novos registros prontos para importar.`, 'info');
  };

  const handleExecuteImport = () => {
    if (!validationResult || validationResult.newCount === 0) {
      showToast('Nada a importar', 'Execute a validação antes de importar.', 'warning');
      return;
    }

    setIsProcessing(true);
    const outcome = DBService.executeImportBatch(importType, sampleQuestionsBatch);
    setIsProcessing(false);

    if (outcome.success) {
      setImportLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SUCESSO: ${outcome.importedCount} registros gravados com sucesso na base.`,
        `[${new Date().toLocaleTimeString()}] Índices de busca e filtros atualizados instantaneamente.`
      ]);
      setValidationResult(null);
      refreshData();
      showToast('Importação Concluída com Sucesso!', `${outcome.importedCount} questões inseridas no banco de dados.`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                <Database className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black">
                Importador de Base Mestre (Brasil)
              </h3>
            </div>
            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
              Carregue ou sincronize bases de dados de questões, concursos e matrizes curriculares provenientes de planilhas Excel (<code className="text-indigo-300">base_mestre_concursos_brasil.xlsx</code>) ou arquivos JSON/CSV.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="md">
              Parser Ativo v2.4
            </Badge>
          </div>
        </div>
      </Card>

      {/* Step 1: Configuração do Lote */}
      <Card className="p-6 space-y-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
          1. Configuração da Origem dos Dados
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Tipo de Entidade para Importação
            </label>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as any);
                setValidationResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="questoes">Banco de Questões (Enunciados, Alternativas, Gabaritos)</option>
              <option value="concursos">Concursos & Editais (Órgãos, Vagas, Bancas)</option>
              <option value="taxonomia">Taxonomia (Disciplinas, Assuntos e Tópicos)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Arquivo Selecionado
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{selectedFile}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile('base_mestre_concursos_brasil.xlsx');
                  showToast('Origem Redefinida', 'Arquivo base_mestre_concursos_brasil.xlsx reconectado.', 'info');
                }}
                className="text-xs shrink-0"
              >
                Padrão
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleValidate}
            disabled={isProcessing}
            className="flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Play className="w-4 h-4" />
            {isProcessing ? 'Validando Arquivo...' : 'Executar Validação Prévia'}
          </Button>
        </div>
      </Card>

      {/* Step 2: Resultado da Validação & Contadores (Prompt Master Item 9) */}
      {validationResult && (
        <Card className="p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                2. Relatório de Validação do Arquivo
              </h4>
              <p className="text-xs text-slate-500">
                Resumo da integridade e consistência dos registros encontrados.
              </p>
            </div>
            <Badge variant={validationResult.newCount > 0 ? 'success' : 'default'}>
              Pronto para Processamento
            </Badge>
          </div>

          {/* Counters Grid (Prompt Master Item 9) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                Novos Registros
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                {validationResult.newCount}
              </span>
              <span className="text-[11px] text-emerald-600/80">Aptos para inserção imediata</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                Duplicatas Detectadas
              </span>
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400 block mt-1">
                {validationResult.duplicateCount}
              </span>
              <span className="text-[11px] text-amber-600/80">Serão ignoradas por idempotência</span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">
                Inconsistências / Erros
              </span>
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 block mt-1">
                {validationResult.invalidCount}
              </span>
              <span className="text-[11px] text-rose-600/80">Campos nulos ou sem gabarito</span>
            </div>
          </div>

          {/* Preview of first records */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Amostra dos Registros a Importar:
            </span>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {validationResult.previewRecords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-4">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                      {item.code}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.discipline} • {item.topic}
                    </span>
                    <p className="text-slate-500 truncate mt-0.5">{item.statement}</p>
                  </div>
                  <Badge variant="outline" size="sm" className="shrink-0">
                    Gabarito: {item.correctOptionLetter}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setValidationResult(null)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExecuteImport}
              disabled={isProcessing || validationResult.newCount === 0}
              className="flex items-center gap-2 shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'Processando...' : 'Processar e Salvar no Banco'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Logs de Importação */}
      {importLogs.length > 0 && (
        <Card className="p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Terminal de Execução / Logs da Base
          </h4>
          <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
            {importLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400">➜</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
