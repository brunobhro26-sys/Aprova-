import { db } from './index.ts';
import {
  subjects,
  subjectsTopics,
  topics,
  questions,
  questionAlternatives,
  simulations,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedFullQuestionBank() {
  console.log('Seeding subjects and topics...');

  // Ensure subjects
  await db.insert(subjects).values([
    { id: 'sub-portugues', name: 'Língua Portuguesa', category: 'Básica' },
    { id: 'sub-matematica', name: 'Matemática e Raciocínio Lógico', category: 'Básica' },
    { id: 'sub-eletrotecnica', name: 'Eletrotécnica', category: 'Específica' },
  ]).onConflictDoNothing();

  // Ensure subject_topics
  await db.insert(subjectsTopics).values([
    { id: 'stopic-circuitos', subjectId: 'sub-eletrotecnica', name: 'Circuitos Elétricos' },
    { id: 'stopic-maquinas', subjectId: 'sub-eletrotecnica', name: 'Máquinas Elétricas' },
    { id: 'stopic-instalacoes', subjectId: 'sub-eletrotecnica', name: 'Instalações Elétricas Industriais' },
    { id: 'stopic-sintaxe', subjectId: 'sub-portugues', name: 'Sintaxe e Concordância' },
    { id: 'stopic-crase', subjectId: 'sub-portugues', name: 'Crase e Regência' },
    { id: 'stopic-pontuacao', subjectId: 'sub-portugues', name: 'Pontuação e Coesão' },
    { id: 'stopic-aritmetica', subjectId: 'sub-matematica', name: 'Aritmética e Álgebra' },
    { id: 'stopic-probabilidade', subjectId: 'sub-matematica', name: 'Probabilidade e Estatística' },
  ]).onConflictDoNothing();

  // Ensure topics
  await db.insert(topics).values([
    { id: 'topic-associacao-resistores', subjectTopicId: 'stopic-circuitos', name: 'Associação de Resistores' },
    { id: 'topic-lei-ohm', subjectTopicId: 'stopic-circuitos', name: 'Lei de Ohm e Teoremas de Redes' },
    { id: 'topic-sistemas-trifasicos', subjectTopicId: 'stopic-circuitos', name: 'Sistemas Trifásicos e Potência' },
    { id: 'topic-transformadores', subjectTopicId: 'stopic-maquinas', name: 'Transformadores de Potência e Instrumentação' },
    { id: 'topic-motores-inducao', subjectTopicId: 'stopic-maquinas', name: 'Motores de Indução Trifásicos' },
    { id: 'topic-particula-se', subjectTopicId: 'stopic-sintaxe', name: 'Partícula Se e Concordância' },
    { id: 'topic-regras-crase', subjectTopicId: 'stopic-crase', name: 'Casos Obrigatórios e Proibidos da Crase' },
    { id: 'topic-regencia-verbal', subjectTopicId: 'stopic-crase', name: 'Regência Verbal e Nominal' },
    { id: 'topic-uso-virgula', subjectTopicId: 'stopic-pontuacao', name: 'Emprego da Vírgula' },
    { id: 'topic-regra-de-tres', subjectTopicId: 'stopic-aritmetica', name: 'Regra de Três Composta' },
    { id: 'topic-porcentagem', subjectTopicId: 'stopic-aritmetica', name: 'Porcentagem e Variação Percentual' },
    { id: 'topic-progressoes', subjectTopicId: 'stopic-aritmetica', name: 'Progressões Aritméticas e Geométricas' },
    { id: 'topic-combinatoria', subjectTopicId: 'stopic-probabilidade', name: 'Análise Combinatória' },
    { id: 'topic-probabilidade-cond', subjectTopicId: 'stopic-probabilidade', name: 'Probabilidade Condicional' },
  ]).onConflictDoNothing();

  console.log('Seeding 20+ real questions with alternatives...');

  const questionsData = [
    // --- LÍNGUA PORTUGUESA (5 QUESTÕES) ---
    {
      id: 'q-port-02',
      code: 'Q-PORT-02',
      statement: 'Assinale a opção em que o uso do acento grave indicativo de crase está empregado em estrita conformidade com a norma-padrão:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-portugues',
      subjectTopicId: 'stopic-crase',
      topicId: 'topic-regras-crase',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'A expressão adverbial feminina "à risca" exige crase obrigatória. Nas demais alternativas ocorrem proibições: antes de pronome indefinido ("à toda"), verbo no infinitivo ("à desmontar"), pronome reto ("à ela") e palavras repetidas ("lado à lado").',
      bibliographicReference: 'Cegalla, D. P. Novíssima Gramática da Língua Portuguesa.',
      alternatives: [
        { letter: 'A', text: 'O engenheiro comunicou à toda equipe a necessidade de inspeção do transformador.', isCorrect: false },
        { letter: 'B', text: 'Os técnicos começaram à desmontar o painel secundário sem desligar o disjuntor geral.', isCorrect: false },
        { letter: 'C', text: 'A manutenção preventiva obedeceu à risca todos os critérios estabelecidos nas normas ABNT.', isCorrect: true },
        { letter: 'D', text: 'O supervisor referiu-se à ela com respeito durante a reunião de alinhamento semanal.', isCorrect: false },
        { letter: 'E', text: 'Os cabos de alimentação foram dispostos lado à lado na esteira suspensa.', isCorrect: false },
      ]
    },
    {
      id: 'q-port-03',
      code: 'Q-PORT-03',
      statement: 'No que concerne à regência verbal, assinale a oração redigida de acordo com a norma-padrão da Língua Portuguesa:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-portugues',
      subjectTopicId: 'stopic-crase',
      topicId: 'topic-regencia-verbal',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'O verbo aspirar no sentido de almejar/pretender é transitivo indireto e rege a preposição "a": aspirar ao cargo. Logo, a alternativa D está correta.',
      bibliographicReference: 'Bechara, Evanildo. Moderna Gramática Portuguesa.',
      alternatives: [
        { letter: 'A', text: 'O candidato visava o posto de técnico sênior desde a contratação.', isCorrect: false },
        { letter: 'B', text: 'O procedimento técnico implica em rigoroso controle térmico.', isCorrect: false },
        { letter: 'C', text: 'Prefiro mais os relatórios digitais do que os impressos.', isCorrect: false },
        { letter: 'D', text: 'Todos os técnicos aspiravam ao cargo de chefia de turno.', isCorrect: true },
        { letter: 'E', text: 'O inspetor assistiu o documentário sobre normas de segurança.', isCorrect: false },
      ]
    },
    {
      id: 'q-port-04',
      code: 'Q-PORT-04',
      statement: 'Assinale a alternativa em que a pontuação da frase atende rigorosamente às exigências gramaticais vigentes:',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-portugues',
      subjectTopicId: 'stopic-pontuacao',
      topicId: 'topic-uso-virgula',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'A oração subordinada adverbial antecipada ("Concluída a manutenção preventiva,") deve ser isolada por vírgula.',
      bibliographicReference: 'Cunha & Cintra. Nova Gramática do Português Contemporâneo.',
      alternatives: [
        { letter: 'A', text: 'Os novos disjuntores, chegaram com atraso no almoxarifado central.', isCorrect: false },
        { letter: 'B', text: 'Concluída a manutenção preventiva, o operador rearmou o circuito principal.', isCorrect: true },
        { letter: 'C', text: 'O chefe de manutenção disse, que o ensaio foi bem-sucedido.', isCorrect: false },
        { letter: 'D', text: 'A calibração dos relés exigiu, muita atenção dos técnicos presentes.', isCorrect: false },
        { letter: 'E', text: 'Durante a tempestade os cabos romperam-se, no poste.', isCorrect: false },
      ]
    },
    {
      id: 'q-port-05',
      code: 'Q-PORT-05',
      statement: 'Identifique o período em que o pronome relativo foi empregado em estrita conformidade com a regência do verbo:',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-portugues',
      subjectTopicId: 'stopic-sintaxe',
      topicId: 'topic-particula-se',
      difficulty: 'Difícil',
      type: 'Múltipla Escolha',
      explanation: 'Quem precisa, precisa de algo ("precisamos"). Logo: "As peças de que mais precisávamos...".',
      bibliographicReference: 'Cegalla, D. P. Novíssima Gramática da Língua Portuguesa.',
      alternatives: [
        { letter: 'A', text: 'O equipamento que o técnico desconfiava foi enviado para análise.', isCorrect: false },
        { letter: 'B', text: 'A sala cujo o painel elétrico foi instalado possui climatização dedicada.', isCorrect: false },
        { letter: 'C', text: 'As peças de que mais precisávamos para o navio chegaram no porto ontem.', isCorrect: true },
        { letter: 'D', text: 'A diretriz na qual todos concordaram foi publicada no boletim.', isCorrect: false },
        { letter: 'E', text: 'O navio onde estivemos a bordo semana passada partiu rumo a Santos.', isCorrect: false },
      ]
    },

    // --- MATEMÁTICA E RACIOCÍNIO LÓGICO (5 QUESTÕES) ---
    {
      id: 'q-mat-01',
      code: 'Q-MAT-01',
      statement: 'Em um terminal marítimo, 6 bombas idênticas operando simultaneamente durante 8 horas diárias transferem 3.600 m³ de óleo combustível em 5 dias. Para transferir 5.400 m³ do mesmo combustível em 6 dias, trabalhando 10 horas diárias, quantas bombas idênticas serão necessárias?',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-matematica',
      subjectTopicId: 'stopic-aritmetica',
      topicId: 'topic-regra-de-tres',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'Regra de três composta: 6 / x = (10 / 8) * (6 / 5) * (3600 / 5400) = (5/4) * (6/5) * (2/3) = (30/20) * (2/3) = (3/2) * (2/3) = 1. Portanto, x = 6 bombas.',
      bibliographicReference: 'Iezzi, G. Fundamentos de Matemática Elementar.',
      alternatives: [
        { letter: 'A', text: '4 bombas', isCorrect: false },
        { letter: 'B', text: '5 bombas', isCorrect: false },
        { letter: 'C', text: '6 bombas', isCorrect: true },
        { letter: 'D', text: '7 bombas', isCorrect: false },
        { letter: 'E', text: '8 bombas', isCorrect: false },
      ]
    },
    {
      id: 'q-mat-02',
      code: 'Q-MAT-02',
      statement: 'O consumo mensal de energia de um conjunto de motores industriais sofreu um aumento de 20% em janeiro. Em fevereiro, devido a medidas de eficiência energética, houve uma redução de 15% em relação a janeiro. Em relação ao consumo inicial anterior a janeiro, o consumo final de fevereiro representa:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-matematica',
      subjectTopicId: 'stopic-aritmetica',
      topicId: 'topic-porcentagem',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'Fator de aumento = 1,20. Fator de redução = 0,85. Variação acumulada = 1,20 * 0,85 = 1,02, o que representa um acréscimo líquido de 2%.',
      bibliographicReference: 'Morgado, A. C. Matemática Comercial e Financeira.',
      alternatives: [
        { letter: 'A', text: 'Redução de 5%', isCorrect: false },
        { letter: 'B', text: 'Aumento de 2%', isCorrect: true },
        { letter: 'C', text: 'Aumento de 5%', isCorrect: false },
        { letter: 'D', text: 'Estabilidade (0% de variação)', isCorrect: false },
        { letter: 'E', text: 'Redução de 2%', isCorrect: false },
      ]
    },
    {
      id: 'q-mat-03',
      code: 'Q-MAT-03',
      statement: 'Um sistema de amortecimento hidráulico dissipa oscilações elétricas tal que as amplitudes decrescem em progressão geométrica com razão q = 1/2. Se a amplitude inicial foi de 16 mm, qual é o valor da soma dos termos dessa série infinita de amplitudes?',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-matematica',
      subjectTopicId: 'stopic-aritmetica',
      topicId: 'topic-progressoes',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'Soma da PG infinita: S = a1 / (1 - q) = 16 / (1 - 0,5) = 16 / 0,5 = 32 mm.',
      bibliographicReference: 'Iezzi, G. Sequências, Matrizes e Determinantes.',
      alternatives: [
        { letter: 'A', text: '24 mm', isCorrect: false },
        { letter: 'B', text: '28 mm', isCorrect: false },
        { letter: 'C', text: '32 mm', isCorrect: true },
        { letter: 'D', text: '48 mm', isCorrect: false },
        { letter: 'E', text: '64 mm', isCorrect: false },
      ]
    },
    {
      id: 'q-mat-04',
      code: 'Q-MAT-04',
      statement: 'Em um lote de 20 disjuntores para painel de comando, 4 apresentam leve defeito de calibração térmica e 16 estão perfeitos. Se 2 disjuntores forem retirados ao acaso, sucessivamente e sem reposição, qual a probabilidade de que ambos estejam perfeitos?',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-matematica',
      subjectTopicId: 'stopic-probabilidade',
      topicId: 'topic-probabilidade-cond',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'P = (16/20) * (15/19) = (4/5) * (15/19) = 60/95 = 12/19.',
      bibliographicReference: 'Morgado, A. C. Análise Combinatória e Probabilidade.',
      alternatives: [
        { letter: 'A', text: '12 / 19', isCorrect: true },
        { letter: 'B', text: '16 / 25', isCorrect: false },
        { letter: 'C', text: '3 / 5', isCorrect: false },
        { letter: 'D', text: '15 / 19', isCorrect: false },
        { letter: 'E', text: '8 / 19', isCorrect: false },
      ]
    },
    {
      id: 'q-mat-05',
      code: 'Q-MAT-05',
      statement: 'Uma equipe de manutenção da Transpetro é composta por 8 técnicos eletricistas e 6 instrumentistas. Para uma missão de emergência a bordo, deve-se formar uma comissão de 4 profissionais, contendo exatamente 2 eletricistas e 2 instrumentistas. De quantas maneiras distintas essa comissão pode ser formada?',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-matematica',
      subjectTopicId: 'stopic-probabilidade',
      topicId: 'topic-combinatoria',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'C(8,2) * C(6,2) = [ (8*7)/(2*1) ] * [ (6*5)/(2*1) ] = 28 * 15 = 420 maneiras.',
      bibliographicReference: 'Morgado, A. C. Análise Combinatória e Probabilidade.',
      alternatives: [
        { letter: 'A', text: '210', isCorrect: false },
        { letter: 'B', text: '360', isCorrect: false },
        { letter: 'C', text: '420', isCorrect: true },
        { letter: 'D', text: '840', isCorrect: false },
        { letter: 'E', text: '1001', isCorrect: false },
      ]
    },

    // --- ELETROTÉCNICA (10 QUESTÕES) ---
    // (q-eletro-test-01 já existe)
    {
      id: 'q-ele-02',
      code: 'Q-ELE-02',
      statement: 'Uma carga trifásica equilibrada consome 120 kW com fator de potência indutivo 0,60 atrasado conectada a uma rede de 440 V / 60 Hz. Deseja-se corrigir o fator de potência para 0,80 atrasado através de um banco de capacitores em derivação. Sabendo que tan(arccos 0,6) = 1,333 e tan(arccos 0,8) = 0,750, a potência reativa capacitiva (Qc) necessária do banco é:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-circuitos',
      topicId: 'topic-sistemas-trifasicos',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'Qc = P * [tan(θ1) - tan(θ2)] = 120 kW * [1,333 - 0,750] = 120 * 0,5833 = 70 kvar.',
      bibliographicReference: 'Mamede Filho, J. Instalações Elétricas Industriais.',
      alternatives: [
        { letter: 'A', text: '40 kvar', isCorrect: false },
        { letter: 'B', text: '70 kvar', isCorrect: true },
        { letter: 'C', text: '90 kvar', isCorrect: false },
        { letter: 'D', text: '110 kvar', isCorrect: false },
        { letter: 'E', text: '160 kvar', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-03',
      code: 'Q-ELE-03',
      statement: 'Durante a intervenção de manutenção em um cubículo de média tensão (13,8 kV), um eletrotécnico precisa desconectar o relé de proteção ligado ao enrolamento secundário de um Transformador de Corrente (TC) com o primário energizado e em carga. O procedimento técnico de segurança mandatório antes de abrir o circuito é:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-maquinas',
      topicId: 'topic-transformadores',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'O secundário de um TC NUNCA deve ser aberto em carga, pois cessando a força magnetomotriz desmagnetizante secundária, toda a corrente primária atua magnetizando o núcleo gerando sobretensões perigosíssimas de quilovolts. Logo, deve-se curto-circuitar previamente os bornes secundários.',
      bibliographicReference: 'NBR 5410 / NR-10 Segurança em Instalações e Serviços em Eletricidade.',
      alternatives: [
        { letter: 'A', text: 'Curto-circuitar os terminais secundários do TC através de chave de aferição ou bloco de teste.', isCorrect: true },
        { letter: 'B', text: 'Conectar um resistor de 10 kΩ em série com o relé.', isCorrect: false },
        { letter: 'C', text: 'Aterrar apenas uma das fases do circuito primário.', isCorrect: false },
        { letter: 'D', text: 'Deixar o circuito secundário em aberto para zerar o fluxo magnético.', isCorrect: false },
        { letter: 'E', text: 'Injetar corrente contínua inversa para desmagnetizar o núcleo.', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-04',
      code: 'Q-ELE-04',
      statement: 'Um motor de indução trifásico de 4 polos, 60 Hz, opera com rotação nominal de 1.746 rpm sob carga total. O escorregamento percentual (s) deste motor em condições nominais de operação é de:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-maquinas',
      topicId: 'topic-motores-inducao',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'Velocidade síncrona: Ns = (120 * f) / P = (120 * 60) / 4 = 1.800 rpm. Escorregamento: s = (Ns - N) / Ns = (1800 - 1746) / 1800 = 54 / 1800 = 0,03 = 3,0%.',
      bibliographicReference: 'Fitzgerald, A. E. Máquinas Elétricas.',
      alternatives: [
        { letter: 'A', text: '1,5%', isCorrect: false },
        { letter: 'B', text: '2,5%', isCorrect: false },
        { letter: 'C', text: '3,0%', isCorrect: true },
        { letter: 'D', text: '4,5%', isCorrect: false },
        { letter: 'E', text: '5,0%', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-05',
      code: 'Q-ELE-05',
      statement: 'Pelo Teorema da Máxima Transferência de Potência, para que uma fonte linear com tensão de circuito aberto Vth = 48 V e resistência interna Rth = 8 Ω forneça a maior potência útil possível a uma carga puramente resistiva RL, o valor de RL e a potência dissipada na carga devem ser:',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-circuitos',
      topicId: 'topic-lei-ohm',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'RL = Rth = 8 Ω. Pmax = Vth² / (4 * Rth) = (48)² / (4 * 8) = 2304 / 32 = 72 W.',
      bibliographicReference: 'Boylestad, R. L. Introdução à Análise de Circuitos.',
      alternatives: [
        { letter: 'A', text: 'RL = 8 Ω e Pmax = 72 W', isCorrect: true },
        { letter: 'B', text: 'RL = 4 Ω e Pmax = 144 W', isCorrect: false },
        { letter: 'C', text: 'RL = 16 Ω e Pmax = 36 W', isCorrect: false },
        { letter: 'D', text: 'RL = 8 Ω e Pmax = 144 W', isCorrect: false },
        { letter: 'E', text: 'RL = 0 Ω e Pmax = 288 W', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-06',
      code: 'Q-ELE-06',
      statement: 'Em um sistema trifásico simétrico e equilibrado a quatro condutores ligado em estrela (Y) com neutro, alimentando uma carga resistiva equilibrada, a intensidade da corrente resultante que flui pelo condutor neutro (In) é:',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-circuitos',
      topicId: 'topic-sistemas-trifasicos',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'Pela Lei das Correntes de Kirchhoff, In = Ia + Ib + Ic. Como as tensões e impedâncias são equilibradas e defasadas em 120°, a soma fasorial das três correntes de fase é identicamente nula (In = 0 A).',
      bibliographicReference: 'Edminister, J. A. Circuitos Elétricos - Schaum.',
      alternatives: [
        { letter: 'A', text: 'Igual a zero (0 A)', isCorrect: true },
        { letter: 'B', text: 'Três vezes a corrente de fase (3 * Ifase)', isCorrect: false },
        { letter: 'C', text: 'Raiz de 3 vezes a corrente de linha (√3 * Ilinha)', isCorrect: false },
        { letter: 'D', text: 'A média aritmética das três correntes de fase', isCorrect: false },
        { letter: 'E', text: 'O dobro da corrente de fase (2 * Ifase)', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-07',
      code: 'Q-ELE-07',
      statement: 'De acordo com a norma NBR 5410 para instalações elétricas de baixa tensão, no esquema de aterramento do tipo TN-S:',
      year: 2023,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2023',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-instalacoes',
      topicId: 'topic-transformadores',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'No esquema TN-S (Terre-Neutre Séparé), o condutor neutro (N) e o condutor de proteção (PE) são separados ao longo de toda a instalação elétrica.',
      bibliographicReference: 'ABNT NBR 5410:2004 - Instalações Elétricas de Baixa Tensão.',
      alternatives: [
        { letter: 'A', text: 'As funções de neutro e de proteção são combinadas em um único condutor (PEN) em toda a instalação.', isCorrect: false },
        { letter: 'B', text: 'O condutor neutro e o condutor de proteção são distintos e separados em toda a instalação.', isCorrect: true },
        { letter: 'C', text: 'Todas as massas metálicas são ligadas a eletrodos de terra independentes do neutro da alimentação.', isCorrect: false },
        { letter: 'D', text: 'O neutro da fonte é isolado da terra ou aterrado por alta impedância.', isCorrect: false },
        { letter: 'E', text: 'O dispositivo diferencial-residual (DR) é estritamente proibido de ser utilizado.', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-08',
      code: 'Q-ELE-08',
      statement: 'Um transformador monofásico ideal de 10 kVA com relação de transformação 440 V / 220 V opera com carga plena nominal no secundário com fator de potência unitário. As correntes nominais primária (I1) e secundária (I2) são, respectivamente:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-maquinas',
      topicId: 'topic-transformadores',
      difficulty: 'Fácil',
      type: 'Múltipla Escolha',
      explanation: 'S = V * I => I1 = 10.000 VA / 440 V ≈ 22,73 A. I2 = 10.000 VA / 220 V = 45,45 A.',
      bibliographicReference: 'Fitzgerald, A. E. Máquinas Elétricas.',
      alternatives: [
        { letter: 'A', text: 'I1 = 45,45 A e I2 = 22,73 A', isCorrect: false },
        { letter: 'B', text: 'I1 = 22,73 A e I2 = 45,45 A', isCorrect: true },
        { letter: 'C', text: 'I1 = 10,0 A e I2 = 20,0 A', isCorrect: false },
        { letter: 'D', text: 'I1 = 20,0 A e I2 = 10,0 A', isCorrect: false },
        { letter: 'E', text: 'I1 = 30,0 A e I2 = 60,0 A', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-09',
      code: 'Q-ELE-09',
      statement: 'Em um circuito RLC série alimentado por fonte senoidal, a condição de ressonância série ocorre quando a frequência angular da fonte é tal que:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-circuitos',
      topicId: 'topic-lei-ohm',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'Na ressonância série: XL = XC => ωL = 1 / (ωC) => ω = 1 / √(LC). A impedância é puramente resistiva e mínima (Z = R), a corrente é máxima e o fator de potência é unitário.',
      bibliographicReference: 'Boylestad, R. L. Introdução à Análise de Circuitos.',
      alternatives: [
        { letter: 'A', text: 'A reatância indutiva é igual em módulo à reatância capacitiva (XL = XC), tornando a impedância mínima e puramente resistiva.', isCorrect: true },
        { letter: 'B', text: 'A impedância total atinge valor infinito e a corrente se anula.', isCorrect: false },
        { letter: 'C', text: 'O fator de potência é puramente indutivo com defasagem de 90° atrasado.', isCorrect: false },
        { letter: 'D', text: 'A reatância indutiva se anula independentemente da capacitância.', isCorrect: false },
        { letter: 'E', text: 'A corrente fica em quadratura de 90° adiantada em relação à tensão.', isCorrect: false },
      ]
    },
    {
      id: 'q-ele-10',
      code: 'Q-ELE-10',
      statement: 'Dois resistores ôhmicos com resistências nominais de 40 Ω e 60 Ω são associados em paralelo. Em seguida, essa associação em paralelo é ligada em série com um resistor de 16 Ω. O conjunto é submetido a uma tensão constante de 80 V. A potência total dissipada por efeito Joule no circuito completo é:',
      year: 2024,
      boardId: 'board-cesgranrio',
      examId: 'exam-transpetro-2026',
      organizationId: 'org-transpetro',
      positionId: 'pos-eletrotecnica',
      subjectId: 'sub-eletrotecnica',
      subjectTopicId: 'stopic-circuitos',
      topicId: 'topic-associacao-resistores',
      difficulty: 'Médio',
      type: 'Múltipla Escolha',
      explanation: 'Req(paralelo) = (40 * 60) / (40 + 60) = 2400 / 100 = 24 Ω. Req(total) = 24 + 16 = 40 Ω. Potência total: P = V² / Req = 80² / 40 = 6400 / 40 = 160 W.',
      bibliographicReference: 'Edminister, J. A. Circuitos Elétricos - Schaum.',
      alternatives: [
        { letter: 'A', text: '80 W', isCorrect: false },
        { letter: 'B', text: '120 W', isCorrect: false },
        { letter: 'C', text: '160 W', isCorrect: true },
        { letter: 'D', text: '200 W', isCorrect: false },
        { letter: 'E', text: '240 W', isCorrect: false },
      ]
    },
  ];

  for (const q of questionsData) {
    const { alternatives, ...qFields } = q;
    await db.insert(questions).values(qFields).onConflictDoNothing();

    for (let i = 0; i < alternatives.length; i++) {
      const alt = alternatives[i];
      await db.insert(questionAlternatives).values({
        id: `alt-${q.id}-${alt.letter.toLowerCase()}`,
        questionId: q.id,
        letter: alt.letter,
        text: alt.text,
        isCorrect: alt.isCorrect,
        orderIndex: i,
        percentageChosen: alt.isCorrect ? 68 : 8,
      }).onConflictDoNothing();
    }
  }

  // Create an Official Simulation definition: "Simulado Oficial Transpetro 2024 - Técnico em Eletrotécnica"
  await db.insert(simulations).values({
    id: 'sim-transpetro-2024-eletro',
    title: 'Simulado Transpetro — Técnico em Eletrotécnica (CESGRANRIO)',
    description: 'Simulado padrão 20 questões: 5 Língua Portuguesa, 5 Matemática e 10 Eletrotécnica. Tempo máximo: 30 minutos.',
    examId: 'exam-transpetro-2026',
    positionId: 'pos-eletrotecnica',
    boardId: 'board-cesgranrio',
    totalQuestions: 20,
    timeLimitMinutes: 30,
    isOfficial: true,
    distributionConfig: JSON.stringify({
      'Língua Portuguesa': 5,
      'Matemática e Raciocínio Lógico': 5,
      'Eletrotécnica': 10
    }),
    createdByUserId: 'user-bruno-student',
  }).onConflictDoNothing();

  console.log('Seeding completed successfully!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedFullQuestionBank()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
