import { Question, Achievement, RankingUser, NotificationItem } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // 1. Língua Portuguesa
  {
    id: 'q-port-01',
    code: 'Q-DEMO-01',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Língua Portuguesa',
    topic: 'Concordância Verbal e Nominal',
    subtopic: 'Casos Especiais com Partícula Se',
    statement: 'Considere a seguinte frase sobre os procedimentos técnicos industriais: "Trataram-se de questões prioritárias para a segurança operacional da refinaria." Quanto à norma-padrão da língua portuguesa, a frase apresenta desvio gramatical porque:',
    options: [
      { id: 'opt-1-a', letter: 'A', text: 'O verbo "tratar" é transitivo indireto com pronome apassivador e deveria concordar no singular com o termo preposicionado.', percentageChosen: 18 },
      { id: 'opt-1-b', letter: 'B', text: 'O termo "questões prioritárias" é sujeito paciente e deveria atrair o verbo para o plural sem preposição.', percentageChosen: 12 },
      { id: 'opt-1-c', letter: 'C', text: 'O pronome "se" atua como índice de indeterminação do sujeito, exigindo o verbo "tratar" flexionado obrigatoriamente na 3ª pessoa do singular ("Tratou-se de...").', percentageChosen: 62 },
      { id: 'opt-1-d', letter: 'D', text: 'A partícula "se" é parte integrante do verbo e obriga a concordância com o substantivo "refinaria".', percentageChosen: 5 },
      { id: 'opt-1-e', letter: 'E', text: 'O verbo deveria estar no infinitivo pessoal devido à locução adverbial que o antecede.', percentageChosen: 3 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Excelente! O verbo "tratar-se de" é transitivo indireto regido pela preposição "de". A partícula "se" funciona como índice de indeterminação do sujeito (IIS). Pela regra da norma culta, verbos transitivos indiretos com IIS devem permanecer invariavelmente na 3ª pessoa do singular. A forma correta é: "Tratou-se de questões prioritárias...".',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Concordância', 'Sintaxe', 'Partícula SE', 'Gramática'],
    isDemonstrative: true,
    timesAnswered: 840,
    correctPercentage: 62
  },
  {
    id: 'q-port-02',
    code: 'Q-DEMO-02',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Língua Portuguesa',
    topic: 'Crase',
    subtopic: 'Casos Obrigatórios e Proibidos',
    statement: 'Assinale a opção em que o uso do acento grave indicativo de crase está empregado em estrita conformidade com a norma-padrão:',
    options: [
      { id: 'opt-2-a', letter: 'A', text: 'O engenheiro comunicou à toda equipe a necessidade de inspeção do transformador.', percentageChosen: 14 },
      { id: 'opt-2-b', letter: 'B', text: 'Os técnicos começaram à desmontar o painel secundário sem desligar o disjuntor geral.', percentageChosen: 8 },
      { id: 'opt-2-c', letter: 'C', text: 'A manutenção preventiva obedeceu à risca todos os critérios estabelecidos nas normas ABNT.', percentageChosen: 71 },
      { id: 'opt-2-d', letter: 'D', text: 'O supervisor referiu-se à ela com respeito durante a reunião de alinhamento semanal.', percentageChosen: 4 },
      { id: 'opt-2-e', letter: 'E', text: 'Os cabos de alimentação foram dispostos lado à lado na esteira suspensa.', percentageChosen: 3 }
    ],
    correctOptionLetter: 'C',
    explanation: 'A expressão "à risca" é uma locução adverbial feminina de modo, devendo receber acento grave indicativo de crase. Nos outros itens há proibições de crase: antes de pronome indefinido ("toda"), antes de verbo ("desmontar"), antes de pronome pessoal ("ela") e entre palavras repetidas ("lado a lado").',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Crase', 'Ortografia', 'Regência'],
    isDemonstrative: true,
    timesAnswered: 1120,
    correctPercentage: 71
  },
  {
    id: 'q-port-03',
    code: 'Q-DEMO-03',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Língua Portuguesa',
    topic: 'Coesão e Coerência',
    subtopic: 'Conjunções Coordenativas e Subordinativas',
    statement: '"A planta de bombeamento operou em capacidade máxima durante todo o final de semana, CONQUANTO houvesse oscilações de pressão nos dutos submarinos." O conectivo destacado estabelece no período uma relação de:',
    options: [
      { id: 'opt-3-a', letter: 'A', text: 'Causa e efeito imediato.', percentageChosen: 11 },
      { id: 'opt-3-b', letter: 'B', text: 'Concessão, equivalendo semântica e gramaticalmente a "embora".', percentageChosen: 68 },
      { id: 'opt-3-c', letter: 'C', text: 'Conformidade, expressando acordo com parâmetros técnicos.', percentageChosen: 9 },
      { id: 'opt-3-d', letter: 'D', text: 'Condição necessária para o funcionamento contínuo.', percentageChosen: 7 },
      { id: 'opt-3-e', letter: 'E', text: 'Consequência direta do acúmulo de fluido nas linhas.', percentageChosen: 5 }
    ],
    correctOptionLetter: 'B',
    explanation: '"Conquanto" é uma conjunção subordinativa concessiva clássica em bancas como Cesgranrio e FCC. Expressa um fato que se opõe à oração principal sem, contudo, impedi-la, equivalendo a "embora", "ainda que", "posto que".',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Conjunções', 'Concessão', 'Morfossintaxe'],
    isDemonstrative: true,
    timesAnswered: 760,
    correctPercentage: 68
  },

  // 2. Matemática
  {
    id: 'q-mat-01',
    code: 'Q-DEMO-04',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Matemática',
    topic: 'Razão, Proporção e Regra de Três',
    subtopic: 'Regra de Três Composta',
    statement: 'Em um terminal de armazenamento, 6 bombas idênticas operando simultaneamente durante 8 horas diárias transferem 3.600 m³ de combustível em 5 dias. Para transferir 5.400 m³ do mesmo combustível em 6 dias, trabalhando 10 horas diárias, quantas bombas idênticas serão necessárias?',
    options: [
      { id: 'opt-4-a', letter: 'A', text: '4 bombas.', percentageChosen: 8 },
      { id: 'opt-4-b', letter: 'B', text: '5 bombas.', percentageChosen: 15 },
      { id: 'opt-4-c', letter: 'C', text: '6 bombas.', percentageChosen: 65 },
      { id: 'opt-4-d', letter: 'D', text: '7 bombas.', percentageChosen: 9 },
      { id: 'opt-4-e', letter: 'E', text: '8 bombas.', percentageChosen: 3 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Regra de três composta:\nBombas (B) | Horas/dia (H) | Dias (D) | Volume (V em m³)\n6 bombas | 8 h/d | 5 dias | 3600 m³\nX bombas | 10 h/d | 6 dias | 5400 m³\nMontando a proporção em relação a B:\n6 / X = (10 / 8) * (6 / 5) * (3600 / 5400)\n6 / X = (5/4) * (6/5) * (2/3)\n6 / X = (6/4) * (2/3) = (3/2) * (2/3) = 1\nLogo, X = 6 bombas.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Regra de Três Composta', 'Aritmética', 'Proporção'],
    isDemonstrative: true,
    timesAnswered: 950,
    correctPercentage: 65
  },
  {
    id: 'q-mat-02',
    code: 'Q-DEMO-05',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Matemática',
    topic: 'Progressão Aritmética e Geométrica',
    subtopic: 'Soma dos Termos de PG',
    statement: 'Um sistema de monitoramento detectou que a vibração de um motor elétrico decresce a cada amortecimento segundo uma PG de razão q = 1/2. Se a amplitude inicial foi de 16 mm, qual é a soma teórica infinita de todas as amplitudes até o repouso absoluto?',
    options: [
      { id: 'opt-5-a', letter: 'A', text: '24 mm', percentageChosen: 12 },
      { id: 'opt-5-b', letter: 'B', text: '28 mm', percentageChosen: 9 },
      { id: 'opt-5-c', letter: 'C', text: '32 mm', percentageChosen: 72 },
      { id: 'opt-5-d', letter: 'D', text: '48 mm', percentageChosen: 5 },
      { id: 'opt-5-e', letter: 'E', text: '64 mm', percentageChosen: 2 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Soma da PG infinita: S = a1 / (1 - q).\nCom a1 = 16 e q = 1/2:\nS = 16 / (1 - 1/2) = 16 / 0,5 = 32 mm.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['PG', 'Álgebra', 'Soma Infinita'],
    isDemonstrative: true,
    timesAnswered: 1040,
    correctPercentage: 72
  },
  {
    id: 'q-mat-03',
    code: 'Q-DEMO-06',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Matemática',
    topic: 'Análise Combinatória e Probabilidade',
    subtopic: 'Probabilidade Condicional',
    statement: 'Em um lote de 20 disjuntores industriais, 4 apresentam leve defeito de calibração térmica e 16 estão perfeitos. Se 2 disjuntores forem retirados sucessivamente ao acaso e sem reposição, qual é a probabilidade de que ambos sejam perfeitos?',
    options: [
      { id: 'opt-6-a', letter: 'A', text: '12 / 19', percentageChosen: 60 },
      { id: 'opt-6-b', letter: 'B', text: '16 / 25', percentageChosen: 21 },
      { id: 'opt-6-c', letter: 'C', text: '4 / 5', percentageChosen: 10 },
      { id: 'opt-6-d', letter: 'D', text: '3 / 19', percentageChosen: 6 },
      { id: 'opt-6-e', letter: 'E', text: '1 / 5', percentageChosen: 3 }
    ],
    correctOptionLetter: 'A',
    explanation: 'P(1º perfeito) = 16/20 = 4/5.\nP(2º perfeito | 1º perfeito) = 15/19.\nP(ambos) = (16/20) * (15/19) = (4/5) * (15/19) = (4 * 3) / 19 = 12/19 ≈ 63,16%.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Probabilidade', 'Combinatória'],
    isDemonstrative: true,
    timesAnswered: 780,
    correctPercentage: 60
  },

  // 3. Física
  {
    id: 'q-fis-01',
    code: 'Q-DEMO-07',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Física',
    topic: 'Eletromagnetismo',
    subtopic: 'Lei de Faraday-Lenz',
    statement: 'Uma espira condutora circular com área de 0,2 m² está imersa perpendicularmente em um campo magnético uniforme cuja intensidade varia linearmente de 0,5 T para 1,5 T em um intervalo de tempo de 0,1 segundo. De acordo com a Lei de Faraday, o módulo da força eletromotriz (fem) induzida na espira é de:',
    options: [
      { id: 'opt-7-a', letter: 'A', text: '0,5 V', percentageChosen: 8 },
      { id: 'opt-7-b', letter: 'B', text: '1,0 V', percentageChosen: 14 },
      { id: 'opt-7-c', letter: 'C', text: '2,0 V', percentageChosen: 67 },
      { id: 'opt-7-d', letter: 'D', text: '4,0 V', percentageChosen: 8 },
      { id: 'opt-7-e', letter: 'E', text: '20,0 V', percentageChosen: 3 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Lei de Faraday: |ε| = |ΔΦ / Δt|.\nVariação do fluxo: ΔΦ = A * ΔB = 0,2 m² * (1,5 T - 0,5 T) = 0,2 * 1,0 = 0,2 Wb.\nFem induzida: |ε| = 0,2 Wb / 0,1 s = 2,0 V.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Indução Eletromagnética', 'Lei de Faraday', 'Física Clássica'],
    isDemonstrative: true,
    timesAnswered: 890,
    correctPercentage: 67
  },
  {
    id: 'q-fis-02',
    code: 'Q-DEMO-08',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Física',
    topic: 'Termodinâmica',
    subtopic: 'Efeito Joule e Calorimetria',
    statement: 'Um resistor elétrico de aquecimento com resistência de 10 Ω é percorrido por uma corrente contínua de 5 A durante 40 segundos para aquecer um recipiente adiabático contendo 500 g de água (calor específico da água c = 1 cal/g°C; adote 1 cal = 4,0 J). A elevação de temperatura observada na água é de:',
    options: [
      { id: 'opt-8-a', letter: 'A', text: '2,5 °C', percentageChosen: 11 },
      { id: 'opt-8-b', letter: 'B', text: '5,0 °C', percentageChosen: 69 },
      { id: 'opt-8-c', letter: 'C', text: '10,0 °C', percentageChosen: 13 },
      { id: 'opt-8-d', letter: 'D', text: '15,0 °C', percentageChosen: 5 },
      { id: 'opt-8-e', letter: 'E', text: '20,0 °C', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Energia dissipada pelo Efeito Joule: E = R * I² * t = 10 * (5)² * 40 = 10 * 25 * 40 = 10.000 Joules.\nConvertendo para calorias: Q = 10.000 J / 4,0 J/cal = 2.500 cal.\nCalorimetria: Q = m * c * ΔT => 2.500 = 500 * 1 * ΔT => ΔT = 2.500 / 500 = 5,0 °C.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Efeito Joule', 'Calorimetria', 'Termologia'],
    isDemonstrative: true,
    timesAnswered: 670,
    correctPercentage: 69
  },
  {
    id: 'q-fis-03',
    code: 'Q-DEMO-09',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Física',
    topic: 'Ondulatória',
    subtopic: 'Ressonância e Velocidade de Propagação',
    statement: 'Em ensaios de ultrassom industrial para detecção de trincas em dutos metálicos, utiliza-se uma onda com frequência de 2,5 MHz. Sabendo que a velocidade do som no aço do duto é de 5.000 m/s, o comprimento de onda dessa radiação acústica no meio é:',
    options: [
      { id: 'opt-9-a', letter: 'A', text: '0,2 mm', percentageChosen: 12 },
      { id: 'opt-9-b', letter: 'B', text: '2,0 mm', percentageChosen: 74 },
      { id: 'opt-9-c', letter: 'C', text: '5,0 mm', percentageChosen: 8 },
      { id: 'opt-9-d', letter: 'D', text: '12,5 mm', percentageChosen: 4 },
      { id: 'opt-9-e', letter: 'E', text: '20,0 mm', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Equação fundamental da ondulatória: v = λ * f => λ = v / f.\nv = 5.000 m/s; f = 2,5 * 10⁶ Hz.\nλ = 5.000 / (2,5 * 10⁶) = 2 * 10⁻³ m = 2,0 mm.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Ondulatória', 'Ultrassom', 'Frequência'],
    isDemonstrative: true,
    timesAnswered: 810,
    correctPercentage: 74
  },

  // 4. Química
  {
    id: 'q-qui-01',
    code: 'Q-DEMO-10',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Química',
    topic: 'Eletroquímica e Corrosão',
    subtopic: 'Proteção Catódica por Ânodo de Sacrifício',
    statement: 'Em tubulações enterradas de transporte de hidrocarbonetos e tanques de armazenamento, a proteção catódica galvânica é fundamental para prevenir a corrosão do aço (ferro). Para atuar eficientemente como ânodo de sacrifício conectado diretamente à estrutura de ferro (E° Fe²⁺/Fe = -0,44 V), deve-se utilizar um metal que possua:',
    options: [
      { id: 'opt-10-a', letter: 'A', text: 'Maior potencial de redução que o ferro, como o cobre (E° Cu²⁺/Cu = +0,34 V).', percentageChosen: 16 },
      { id: 'opt-10-b', letter: 'B', text: 'Menor potencial de redução (ou maior potencial de oxidação) que o ferro, como o zinco (E° Zn²⁺/Zn = -0,76 V) ou magnésio.', percentageChosen: 73 },
      { id: 'opt-10-c', letter: 'C', text: 'Total inércia galvânica com potencial nulo em relação ao eletrodo padrão de hidrogênio.', percentageChosen: 6 },
      { id: 'opt-10-d', letter: 'D', text: 'Ponto de fusão inferior ao do petróleo transportado na linha.', percentageChosen: 3 },
      { id: 'opt-10-e', letter: 'E', text: 'Capacidade de formar óxidos solúveis no solo ácido.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Na proteção catódica por ânodo galvânico (sacrifício), o metal escolhido precisa ter maior tendência a se oxidar do que a estrutura protegida (Fe). Portanto, deve possuir potencial padrão de redução menor que o do ferro (ex.: Zinco E° = -0,76 V ou Magnésio E° = -2,37 V), sacrificando-se e fornecendo elétrons para manter o ferro na forma reduzida.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Eletroquímica', 'Corrosão', 'Proteção Catódica'],
    isDemonstrative: true,
    timesAnswered: 910,
    correctPercentage: 73
  },
  {
    id: 'q-qui-02',
    code: 'Q-DEMO-11',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Química',
    topic: 'Química Orgânica e Combustíveis',
    subtopic: 'Gás Sulfídrico (H2S) e Dessulfurização',
    statement: 'Durante a movimentação de petróleos pesados e gasodutos, o gás sulfídrico (H₂S) é monitorado rigorosamente devido à sua alta toxicidade e ação corrosiva. Em relação às propriedades químicas do H₂S, assinale a afirmativa correta:',
    options: [
      { id: 'opt-11-a', letter: 'A', text: 'É um gás inodoro, que não reage com superfícies de cobre ou prata.', percentageChosen: 9 },
      { id: 'opt-11-b', letter: 'B', text: 'Possui caráter ácido moderado em solução aquosa e forma sulfetos metálicos insolúveis que aceleram o desgaste e fragilização por hidrogênio.', percentageChosen: 66 },
      { id: 'opt-11-c', letter: 'C', text: 'Apresenta caráter fortemente básico, atuando como neutralizador natural do ácido clorídrico.', percentageChosen: 13 },
      { id: 'opt-11-d', letter: 'D', text: 'É um gás nobre condensável a temperaturas ambientes com baixa reatividade.', percentageChosen: 7 },
      { id: 'opt-11-e', letter: 'E', text: 'Sua combustão completa produz apenas água líquida sem emissão de dióxido de enxofre.', percentageChosen: 5 }
    ],
    correctOptionLetter: 'B',
    explanation: 'O sulfeto de hidrogênio (H₂S) é um hidrácido tóxico que, em meio aquoso, causa severa corrosão em aços carbono (fenômeno de Sulfide Stress Cracking / fragilização por hidrogênio) e ataca prontamente contatos elétricos de cobre e prata formando sulfetos escuros e resistivos.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Gás Sulfídrico', 'Corrosão Química', 'Gases Industriais'],
    isDemonstrative: true,
    timesAnswered: 620,
    correctPercentage: 66
  },
  {
    id: 'q-qui-03',
    code: 'Q-DEMO-12',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Química',
    topic: 'Baterias e Acumuladores Industriais',
    subtopic: 'Eletrólito em Baterias Chumbo-Ácido',
    statement: 'Em subestações elétricas, os sistemas de corrente contínua essenciais (125 Vcc) utilizam bancos de baterias estacionárias chumbo-ácido. O eletrólito utilizado nessas baterias é:',
    options: [
      { id: 'opt-12-a', letter: 'A', text: 'Uma solução aquosa de hidróxido de potássio (KOH).', percentageChosen: 14 },
      { id: 'opt-12-b', letter: 'B', text: 'Ácido nítrico concentrado estabilizado.', percentageChosen: 6 },
      { id: 'opt-12-c', letter: 'C', text: 'Uma solução diluída de ácido sulfúrico (H₂SO₄), cuja densidade diminui durante a descarga da bateria.', percentageChosen: 75 },
      { id: 'opt-12-d', letter: 'D', text: 'Salmoura saturada de cloreto de sódio com inibidores de oxigênio.', percentageChosen: 3 },
      { id: 'opt-12-e', letter: 'E', text: 'Óleo mineral isolante aditivado com antioxidante fenólico.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'C',
    explanation: 'As baterias chumbo-ácido utilizam solução de ácido sulfúrico (H₂SO₄) e água destilada como eletrólito. Durante a descarga, os íons sulfato reagem com as placas formando sulfato de chumbo (PbSO₄) e água, diminuindo a densidade do eletrólito (fato medido por densímetros para avaliar o estado de carga).',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Baterias Industriais', 'Chumbo-Ácido', 'Eletroquímica'],
    isDemonstrative: true,
    timesAnswered: 870,
    correctPercentage: 75
  },

  // 5. Eletrotécnica
  {
    id: 'q-eletro-test-01',
    code: 'Q-TRANSPETRO-01',
    contest: 'Transpetro',
    organization: 'Transpetro',
    position: 'Técnico em Eletrotécnica',
    board: 'CESGRANRIO',
    year: 2024,
    discipline: 'Eletrotécnica',
    subject: 'Circuitos Elétricos',
    topic: 'Associação de Resistores',
    subtopic: 'Resistores em Paralelo e Divisores de Corrente',
    statement: 'Em um circuito elétrico industrial de corrente contínua a bordo de um navio da Transpetro, três resistores ôhmicos com resistências nominais de 10 Ω, 20 Ω e 30 Ω estão conectados em paralelo. O conjunto é alimentado por uma fonte de tensão constante de 60 V. A resistência equivalente do circuito e a corrente total drenada da fonte são, respectivamente:',
    options: [
      { id: 'alt-q1-a', letter: 'A', text: 'Req = 60 Ω e Itotal = 1,0 A', percentageChosen: 12 },
      { id: 'alt-q1-b', letter: 'B', text: 'Req = 20 Ω e Itotal = 3,0 A', percentageChosen: 8 },
      { id: 'alt-q1-c', letter: 'C', text: 'Req = 5,45 Ω (60/11 Ω) e Itotal = 11 A', percentageChosen: 68 },
      { id: 'alt-q1-d', letter: 'D', text: 'Req = 6,0 Ω e Itotal = 10 A', percentageChosen: 7 },
      { id: 'alt-q1-e', letter: 'E', text: 'Req = 2,5 Ω e Itotal = 24 A', percentageChosen: 5 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Para resistores em paralelo: 1/Req = 1/R1 + 1/R2 + 1/R3 = 1/10 + 1/20 + 1/30 = (6 + 3 + 2)/60 = 11/60 Ω⁻¹. Logo: Req = 60/11 Ω ≈ 5,45 Ω. Pela 1ª Lei de Ohm: Itotal = V / Req = 60 / (60/11) = 11 A. Alternativa correta: C.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Circuitos Elétricos', 'Associação de Resistores', 'Lei de Ohm'],
    isDemonstrative: true,
    timesAnswered: 420,
    correctPercentage: 68
  },
  {
    id: 'q-ele-01',
    code: 'Q-DEMO-13',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletrotécnica',
    topic: 'Potência e Fator de Potência',
    subtopic: 'Triângulo de Potências e Correção de FP',
    statement: 'Uma carga trifásica equilibrada instalada em uma refinaria consome 120 kW com fator de potência indutivo igual a 0,60 atrasado. Deseja-se corrigir o fator de potência dessa carga para 0,80 atrasado através da instalação de um banco de capacitores em derivação. Considerando tan(arccos 0,60) = 1,333 e tan(arccos 0,80) = 0,750, a potência reativa capacitiva (Qc) necessária do banco é:',
    options: [
      { id: 'opt-13-a', letter: 'A', text: '40 kvar', percentageChosen: 9 },
      { id: 'opt-13-b', letter: 'B', text: '70 kvar', percentageChosen: 68 },
      { id: 'opt-13-c', letter: 'C', text: '90 kvar', percentageChosen: 14 },
      { id: 'opt-13-d', letter: 'D', text: '110 kvar', percentageChosen: 6 },
      { id: 'opt-13-e', letter: 'E', text: '160 kvar', percentageChosen: 3 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Qc = P * (tan θ1 - tan θ2).\nθ1 = arccos(0,6) => tan θ1 = 1,333.\nθ2 = arccos(0,8) => tan θ2 = 0,750.\nQc = 120 kW * (1,333 - 0,750) = 120 * 0,5833 = 70 kvar.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Fator de Potência', 'Banco de Capacitores', 'Eletrotécnica'],
    isDemonstrative: true,
    timesAnswered: 1150,
    correctPercentage: 68
  },
  {
    id: 'q-ele-02',
    code: 'Q-DEMO-14',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletrotécnica',
    topic: 'Transformadores de Instrumentação',
    subtopic: 'Transformadores de Corrente (TC)',
    statement: 'Durante a operação de manutenção em um cubículo de média tensão (13,8 kV), um eletrotécnico precisa desconectar o relé de proteção ligado ao secundário de um Transformador de Corrente (TC) com o primário energizado e conduzindo corrente de carga. O procedimento técnico obrigatório antes de abrir o circuito secundário do relé é:',
    options: [
      { id: 'opt-14-a', letter: 'A', text: 'Curto-circuitar os terminais secundários do TC através de chave de aferição ou bloco terminal próprio.', percentageChosen: 81 },
      { id: 'opt-14-b', letter: 'B', text: 'Conectar um resistor de alto valor em série com o secundário.', percentageChosen: 7 },
      { id: 'opt-14-c', letter: 'C', text: 'Aterrar apenas uma das fases do circuito primário com chave seccionadora.', percentageChosen: 4 },
      { id: 'opt-14-d', letter: 'D', text: 'Deixar o secundário em circuito aberto para cessar o fluxo magnético.', percentageChosen: 5 },
      { id: 'opt-14-e', letter: 'E', text: 'Injetar corrente contínua inversa para desmagnetizar o núcleo.', percentageChosen: 3 }
    ],
    correctOptionLetter: 'A',
    explanation: 'NUNCA se deve abrir o secundário de um TC com o primário energizado! Ao abrir o secundário, a força magnetomotriz secundária cessa e toda a corrente primária atua como corrente de magnetização, gerando tensões extremamente elevadas (ordem de quilovolts) nos terminais secundários por saturação profunda do núcleo, o que destrói o isolamento e acarreta risco mortal de arco elétrico e choque. O secundário deve ser SEMPRE curto-circuitado antes do manuseio.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Transformadores de Corrente', 'Segurança', 'Proteção'],
    isDemonstrative: true,
    timesAnswered: 1420,
    correctPercentage: 81
  },
  {
    id: 'q-ele-03',
    code: 'Q-DEMO-15',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletrotécnica',
    topic: 'Sistemas Trifásicos',
    subtopic: 'Conexão Estrela e Triângulo',
    statement: 'Um gerador síncrono trifásico simétrico opera ligado em estrela (Y) aterrado com tensão de linha eficaz igual a 380 V. A tensão de fase (fase-neutro) e a defasagem angular entre tensões de fase consecutivas são, respectivamente:',
    options: [
      { id: 'opt-15-a', letter: 'A', text: '220 V e 60°', percentageChosen: 13 },
      { id: 'opt-15-b', letter: 'B', text: '220 V e 120°', percentageChosen: 77 },
      { id: 'opt-15-c', letter: 'C', text: '380 V e 120°', percentageChosen: 5 },
      { id: 'opt-15-d', letter: 'D', text: '127 V e 90°', percentageChosen: 3 },
      { id: 'opt-15-e', letter: 'E', text: '220 V e 180°', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Na conexão estrela equilibrada, Vfase = Vlinha / √3 = 380 / 1,732 ≈ 220 V. O sistema trifásico equilibrado possui três tensões de fase simétricas defasadas no tempo de 120° elétricos entre si.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Sistemas Trifásicos', 'Conexão Estrela', 'Fasores'],
    isDemonstrative: true,
    timesAnswered: 1290,
    correctPercentage: 77
  },

  // 6. Eletricidade Básica
  {
    id: 'q-eleb-01',
    code: 'Q-DEMO-16',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletricidade',
    topic: 'Leis Fundamentais e Associação de Resistores',
    subtopic: 'Resistência Equivalente Mista',
    statement: 'Três resistores de valores R1 = 30 Ω, R2 = 60 Ω e R3 = 20 Ω estão associados da seguinte forma: R1 e R2 estão em paralelo entre si, e essa associação paralela está ligada em série com R3. Ao aplicar uma tensão contínua total de 120 V aos terminais da associação mista, a corrente total drenada da fonte é de:',
    options: [
      { id: 'opt-16-a', letter: 'A', text: '1,5 A', percentageChosen: 8 },
      { id: 'opt-16-b', letter: 'B', text: '2,0 A', percentageChosen: 11 },
      { id: 'opt-16-c', letter: 'C', text: '3,0 A', percentageChosen: 74 },
      { id: 'opt-16-d', letter: 'D', text: '4,0 A', percentageChosen: 5 },
      { id: 'opt-16-e', letter: 'E', text: '6,0 A', percentageChosen: 2 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Paralelo R1 e R2: Rp = (30 * 60) / (30 + 60) = 1800 / 90 = 20 Ω.\nSérie com R3: Req = Rp + R3 = 20 + 20 = 40 Ω.\nCorrente total pela 1ª Lei de Ohm: I = V / Req = 120 V / 40 Ω = 3,0 A.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Associação de Resistores', 'Lei de Ohm', 'Eletricidade Básica'],
    isDemonstrative: true,
    timesAnswered: 1380,
    correctPercentage: 74
  },
  {
    id: 'q-eleb-02',
    code: 'Q-DEMO-17',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletricidade',
    topic: 'Segunda Lei de Ohm e Condutividade',
    subtopic: 'Influência de Comprimento e Seção',
    statement: 'Um cabo de cobre maciço de comprimento L e área de seção transversal S apresenta uma resistência ôhmica de 4 Ω a 20 °C. Se outro condutor do mesmo material for fabricado com comprimento igual a 3L e área de seção 2S, qual será a sua nova resistência à mesma temperatura?',
    options: [
      { id: 'opt-17-a', letter: 'A', text: '3 Ω', percentageChosen: 9 },
      { id: 'opt-17-b', letter: 'B', text: '6 Ω', percentageChosen: 71 },
      { id: 'opt-17-c', letter: 'C', text: '8 Ω', percentageChosen: 12 },
      { id: 'opt-17-d', letter: 'D', text: '12 Ω', percentageChosen: 6 },
      { id: 'opt-17-e', letter: 'E', text: '24 Ω', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: '2ª Lei de Ohm: R = ρ * (L / S).\nR_novo = ρ * (3L / 2S) = (3/2) * [ρ * (L/S)] = 1,5 * R_inicial.\nComo R_inicial = 4 Ω: R_novo = 1,5 * 4 = 6 Ω.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['2ª Lei de Ohm', 'Resistividade'],
    isDemonstrative: true,
    timesAnswered: 1090,
    correctPercentage: 71
  },
  {
    id: 'q-eleb-03',
    code: 'Q-DEMO-18',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletricidade',
    topic: 'Capacitância e Dielétricos',
    subtopic: 'Associação de Capacitores em Série',
    statement: 'Dois capacitores eletrolíticos industriais de 20 µF e 30 µF são ligados em série a uma fonte de alimentação estabilizada de 100 Vcc. A capacitância equivalente da série e a carga total fornecida pela fonte são, respectivamente:',
    options: [
      { id: 'opt-18-a', letter: 'A', text: '12 µF e 1.200 µC', percentageChosen: 69 },
      { id: 'opt-18-b', letter: 'B', text: '50 µF e 5.000 µC', percentageChosen: 19 },
      { id: 'opt-18-c', letter: 'C', text: '25 µF e 2.500 µC', percentageChosen: 7 },
      { id: 'opt-18-d', letter: 'D', text: '10 µF e 1.000 µC', percentageChosen: 3 },
      { id: 'opt-18-e', letter: 'E', text: '6 µF e 600 µC', percentageChosen: 2 }
    ],
    correctOptionLetter: 'A',
    explanation: 'Em série: Ceq = (C1 * C2) / (C1 + C2) = (20 * 30) / (20 + 30) = 600 / 50 = 12 µF.\nA carga total Q = Ceq * V = 12 µF * 100 V = 1.200 µC.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Capacitores', 'Eletrostática', 'Carga Elétrica'],
    isDemonstrative: true,
    timesAnswered: 890,
    correctPercentage: 69
  },

  // 7. Circuitos Elétricos
  {
    id: 'q-circ-01',
    code: 'Q-DEMO-19',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Circuitos Elétricos',
    topic: 'Teoremas de Redes Elétricas',
    subtopic: 'Teorema de Thévenin',
    statement: 'Ao determinar o circuito equivalente de Thévenin entre dois terminais A e B de uma rede linear contendo resistores e fontes independentes de tensão e corrente, deve-se proceder da seguinte maneira para o cálculo da resistência de Thévenin (Rth):',
    options: [
      { id: 'opt-19-a', letter: 'A', text: 'Substituir as fontes de tensão independentes por circuitos abertos e as fontes de corrente por curto-circuitos.', percentageChosen: 15 },
      { id: 'opt-19-b', letter: 'B', text: 'Manter todas as fontes ativas com carga máxima conectada aos terminais.', percentageChosen: 6 },
      { id: 'opt-19-c', letter: 'C', text: 'Desativar as fontes independentes: substituir fontes de tensão por curto-circuitos (tensão nula) e fontes de corrente por circuitos abertos (corrente nula).', percentageChosen: 76 },
      { id: 'opt-19-d', letter: 'D', text: 'Apenas desligar os resistores em paralelo da rede.', percentageChosen: 2 },
      { id: 'opt-19-e', letter: 'E', text: 'Inverter a polaridade de todas as fontes de corrente.', percentageChosen: 1 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Para encontrar Rth de uma rede com fontes independentes, "matam-se" (desativam-se) as fontes: fonte ideal de tensão V = 0 corresponde a um curto-circuito (fio condutor sem resistência); fonte ideal de corrente I = 0 corresponde a um circuito aberto (ramo desconectado). Calcula-se então a resistência vista pelos terminais A e B.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Thévenin', 'Norton', 'Teoremas de Redes'],
    isDemonstrative: true,
    timesAnswered: 1340,
    correctPercentage: 76
  },
  {
    id: 'q-circ-02',
    code: 'Q-DEMO-20',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Circuitos Elétricos',
    topic: 'Circuitos de Corrente Alternada (RLC)',
    subtopic: 'Ressonância Série',
    statement: 'Em um circuito RLC série alimentado por uma fonte senoidal de frequência variável, a ressonância série ocorre quando a reatância indutiva (XL) se iguala à reatância capacitiva (XC). Sob condição de ressonância série, a impedância total do circuito é:',
    options: [
      { id: 'opt-20-a', letter: 'A', text: 'Puramente indutiva e máxima.', percentageChosen: 8 },
      { id: 'opt-20-b', letter: 'B', text: 'Puramente capacitiva e nula.', percentageChosen: 6 },
      { id: 'opt-20-c', letter: 'C', text: 'Puramente resistiva e mínima, resultando na máxima corrente de linha.', percentageChosen: 78 },
      { id: 'opt-20-d', letter: 'D', text: 'Infinita, bloqueando totalmente a corrente da fonte.', percentageChosen: 5 },
      { id: 'opt-20-e', letter: 'E', text: 'Complexa com ângulo de fase igual a 45° adiantado.', percentageChosen: 3 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Z = R + j(XL - XC). Na ressonância série, XL = XC, logo a parte reativa se anula (j0). A impedância resultante é mínima e puramente resistiva Z = R, com ângulo de fase nulo (fator de potência unitário) e corrente máxima I = V / R.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['RLC Série', 'Ressonância', 'Fasores'],
    isDemonstrative: true,
    timesAnswered: 1250,
    correctPercentage: 78
  },
  {
    id: 'q-circ-03',
    code: 'Q-DEMO-21',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Circuitos Elétricos',
    topic: 'Leis de Kirchhoff',
    subtopic: 'Análise Nodal',
    statement: 'Em um nó de um circuito elétrico industrial convergem 4 correntes: I1 = 8 A e I2 = 5 A estão entrando no nó; I3 = 6 A está saindo do nó. Aplicando a 1ª Lei de Kirchhoff (Lei dos Nós / Conservação da Carga), a quarta corrente I4 deve ser:',
    options: [
      { id: 'opt-21-a', letter: 'A', text: '7 A saindo do nó.', percentageChosen: 79 },
      { id: 'opt-21-b', letter: 'B', text: '7 A entrando no nó.', percentageChosen: 11 },
      { id: 'opt-21-c', letter: 'C', text: '19 A saindo do nó.', percentageChosen: 5 },
      { id: 'opt-21-d', letter: 'D', text: '3 A entrando no nó.', percentageChosen: 3 },
      { id: 'opt-21-e', letter: 'E', text: '1 A saindo do nó.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'A',
    explanation: 'Pela Lei dos Nós: Σ I_entram = Σ I_saem.\n8 + 5 = 6 + I4 => 13 = 6 + I4 => I4 = 7 A (saindo do nó).',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Kirchhoff', 'Leis dos Nós', 'Circuitos'],
    isDemonstrative: true,
    timesAnswered: 980,
    correctPercentage: 79
  },

  // 8. Máquinas Elétricas
  {
    id: 'q-maq-01',
    code: 'Q-DEMO-22',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Máquinas Elétricas',
    topic: 'Motores de Indução Trifásicos (MIT)',
    subtopic: 'Escorregamento e Velocidade Síncrona',
    statement: 'Um motor de indução trifásico de 4 polos, 60 Hz, aciona uma bomba centrífuga em um duto de derivados. Em regime nominal de operação com plena carga, o escorregamento medido no rotor é de s = 4% (0,04). A velocidade síncrona do campo girante e a velocidade mecânica real no eixo do motor são, respectivamente:',
    options: [
      { id: 'opt-22-a', letter: 'A', text: '3.600 rpm e 3.456 rpm', percentageChosen: 14 },
      { id: 'opt-22-b', letter: 'B', text: '1.800 rpm e 1.728 rpm', percentageChosen: 73 },
      { id: 'opt-22-c', letter: 'C', text: '1.800 rpm e 1.800 rpm', percentageChosen: 7 },
      { id: 'opt-22-d', letter: 'D', text: '1.200 rpm e 1.152 rpm', percentageChosen: 4 },
      { id: 'opt-22-e', letter: 'E', text: '900 rpm e 864 rpm', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Velocidade síncrona: Ns = 120 * f / P = (120 * 60) / 4 = 1.800 rpm.\nVelocidade mecânica nominal: N = Ns * (1 - s) = 1.800 * (1 - 0,04) = 1.800 * 0,96 = 1.728 rpm.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['MIT', 'Escorregamento', 'Velocidade Síncrona'],
    isDemonstrative: true,
    timesAnswered: 1390,
    correctPercentage: 73
  },
  {
    id: 'q-maq-02',
    code: 'Q-DEMO-23',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Máquinas Elétricas',
    topic: 'Transformadores de Potência',
    subtopic: 'Ensaios a Vazio e em Curto-Circuito',
    statement: 'Nos ensaios de rotina de um transformador de potência trifásico de 500 kVA (13,8 kV / 380 V), realiza-se o ensaio a vazio (circuito aberto) e o ensaio de curto-circuito. Esses ensaios têm como objetivo principal determinar, respectivamente:',
    options: [
      { id: 'opt-23-a', letter: 'A', text: 'Perdas por efeito Joule nos enrolamentos (cobre) e perdas no núcleo magnético (ferro).', percentageChosen: 18 },
      { id: 'opt-23-b', letter: 'B', text: 'Perdas no núcleo magnético por histerese e correntes de Foucault (ferro), e perdas nos enrolamentos por efeito Joule (cobre).', percentageChosen: 71 },
      { id: 'opt-23-c', letter: 'C', text: 'Relação de transformação e isolamento dielétrico de buchas.', percentageChosen: 6 },
      { id: 'opt-23-d', letter: 'D', text: 'Capacitância parasita e indutância mútua das carcaças.', percentageChosen: 3 },
      { id: 'opt-23-e', letter: 'E', text: 'Rendimento mecânico e velocidade crítica de vibração.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'No ensaio a vazio (alimentado com tensão nominal), a corrente é mínima (apenas corrente de magnetização), medindo-se as perdas no núcleo (perdas no ferro: histerese e Foucault). No ensaio de curto-circuito (com corrente nominal), a tensão aplicada é baixa, logo as perdas no núcleo são desprezíveis e medem-se com precisão as perdas por efeito Joule nos condutores (perdas no cobre / R_eq).',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Transformadores', 'Ensaios', 'Perdas no Cobre', 'Perdas no Ferro'],
    isDemonstrative: true,
    timesAnswered: 1120,
    correctPercentage: 71
  },
  {
    id: 'q-maq-03',
    code: 'Q-DEMO-24',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Máquinas Elétricas',
    topic: 'Métodos de Partida de Motores',
    subtopic: 'Partida Estrela-Triângulo (Y-Δ)',
    statement: 'A chave de partida estrela-triângulo é um método amplamente empregado para reduzir o pico de corrente de partida (Ip) de motores de indução. Ao dar a partida na configuração estrela (Y) em comparação com a partida direta em triângulo (Δ), a corrente de linha e o conjugado (torque) de partida são reduzidos a:',
    options: [
      { id: 'opt-24-a', letter: 'A', text: '1/2 (50%) dos valores nominais.', percentageChosen: 19 },
      { id: 'opt-24-b', letter: 'B', text: '1/√3 (aproximadamente 58%) dos valores em triângulo.', percentageChosen: 18 },
      { id: 'opt-24-c', letter: 'C', text: '1/3 (aproximadamente 33,3%) dos valores correspondentes da partida direta em triângulo.', percentageChosen: 59 },
      { id: 'opt-24-d', letter: 'D', text: '1/4 (25%) devido à duplicação dos enrolamentos.', percentageChosen: 3 },
      { id: 'opt-24-e', letter: 'E', text: '1/√2 (aproximadamente 70,7%) do valor de pico.', percentageChosen: 1 }
    ],
    correctOptionLetter: 'C',
    explanation: 'Na conexão estrela (Y), a tensão em cada enrolamento cai para Vlinha/√3. Como a corrente de fase diminui por um fator de 1/√3 e a corrente de linha em estrela é igual à de fase (enquanto em triângulo é √3 vezes maior), a corrente de linha total cai por um fator de (√3 * √3) = 3 (ou seja, 1/3). O conjugado varia proporcionalmente ao quadrado da tensão nos enrolamentos: (1/√3)² = 1/3.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['Partida de Motores', 'Estrela-Triângulo', 'Acionamentos'],
    isDemonstrative: true,
    timesAnswered: 890,
    correctPercentage: 59
  },

  // 9. Instalações Elétricas
  {
    id: 'q-inst-01',
    code: 'Q-DEMO-25',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Instalações Elétricas',
    topic: 'Norma NBR 5410',
    subtopic: 'Esquemas de Aterramento (TN, TT, IT)',
    statement: 'A norma ABNT NBR 5410 padroniza esquemas de aterramento para instalações elétricas de baixa tensão. No esquema TN-S, a relação funcional entre o condutor neutro (N) e o condutor de proteção (PE) é definida por:',
    options: [
      { id: 'opt-25-a', letter: 'A', text: 'Condutores neutro e de proteção combinados em um único condutor (PEN) em toda a instalação.', percentageChosen: 13 },
      { id: 'opt-25-b', letter: 'B', text: 'Condutores neutro (N) e de proteção (PE) rigorosamente separados ao longo de toda a instalação elétrica.', percentageChosen: 79 },
      { id: 'opt-25-c', letter: 'C', text: 'O neutro isolado da terra e as massas aterradas por eletrodos independentes.', percentageChosen: 4 },
      { id: 'opt-25-d', letter: 'D', text: 'Uso obrigatório de relé de fuga à terra sem qualquer condutor de neutro.', percentageChosen: 2 },
      { id: 'opt-25-e', letter: 'E', text: 'O neutro aterrado apenas nos aparelhos de consumo final.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'No esquema TN, a fonte possui ponto diretamente aterrado (T) e as massas são ligadas a esse ponto através de condutor de proteção (N). No arranjo TN-S ("S" = Separated), as funções de neutro (N) e condutor de proteção (PE) são exercidas por condutores totalmente distintos e separados por toda a extensão do circuito.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['NBR 5410', 'Aterramento', 'TN-S', 'Instalações'],
    isDemonstrative: true,
    timesAnswered: 1310,
    correctPercentage: 79
  },
  {
    id: 'q-inst-02',
    code: 'Q-DEMO-26',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Instalações Elétricas',
    topic: 'Dimensionamento de Condutores',
    subtopic: 'Critério da Queda de Tensão Admissível',
    statement: 'Conforme preceitua a NBR 5410, para circuitos terminais alimentados diretamente a partir de um quadro de distribuição principal sem subestação própria, o limite máximo percentual de queda de tensão admissível entre a origem da instalação e o ponto de utilização é de:',
    options: [
      { id: 'opt-26-a', letter: 'A', text: '2%', percentageChosen: 8 },
      { id: 'opt-26-b', letter: 'B', text: '4%', percentageChosen: 68 },
      { id: 'opt-26-c', letter: 'C', text: '7%', percentageChosen: 16 },
      { id: 'opt-26-d', letter: 'D', text: '10%', percentageChosen: 5 },
      { id: 'opt-26-e', letter: 'E', text: '12%', percentageChosen: 3 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Pela NBR 5410 (item 6.2.7), em instalações alimentadas diretamente por rede de distribuição pública em BT, a queda de tensão entre a origem e qualquer ponto de utilização não deve ultrapassar 4% para iluminação e circuitos terminais em geral (ou 7% quando supridas por subestação ou gerador próprio).',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['NBR 5410', 'Queda de Tensão', 'Dimensionamento'],
    isDemonstrative: true,
    timesAnswered: 940,
    correctPercentage: 68
  },
  {
    id: 'q-inst-03',
    code: 'Q-DEMO-27',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Instalações Elétricas',
    topic: 'Atmosferas Explosivas (Áreas Classificadas)',
    subtopic: 'Equipamentos Ex e Níveis de Proteção (EPL)',
    statement: 'Em terminais dutoviários e plataformas de transporte de derivados de petróleo onde há presença contínua ou por longos períodos de misturas inflamáveis de gás ou vapor com o ar em operação normal, essa área é classificada normativamente (ABNT NBR IEC 60079) como:',
    options: [
      { id: 'opt-27-a', letter: 'A', text: 'Zona 0', percentageChosen: 74 },
      { id: 'opt-27-b', letter: 'B', text: 'Zona 1', percentageChosen: 18 },
      { id: 'opt-27-c', letter: 'C', text: 'Zona 2', percentageChosen: 5 },
      { id: 'opt-27-d', letter: 'D', text: 'Zona 20', percentageChosen: 2 },
      { id: 'opt-27-e', letter: 'E', text: 'Zona 22', percentageChosen: 1 }
    ],
    correctOptionLetter: 'A',
    explanation: 'Classificação para gases e vapores: Zona 0 é a área na qual uma atmosfera explosiva de gás está presente continuamente ou por longos períodos (frequente no interior de tanques). Zona 1: provável de ocorrer em operação normal. Zona 2: pouco provável e apenas por curtos períodos. Zonas 20/21/22 aplicam-se a poeiras combustíveis.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Áreas Classificadas', 'Zona 0', 'NBR IEC 60079', 'Petróleo e Gás'],
    isDemonstrative: true,
    timesAnswered: 1180,
    correctPercentage: 74
  },

  // 10. Segurança do Trabalho
  {
    id: 'q-seg-01',
    code: 'Q-DEMO-28',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Segurança do Trabalho',
    topic: 'Norma Regulamentadora NR-10',
    subtopic: 'Desenergização Elétrica Conforme NR-10',
    statement: 'Segundo a Norma Regulamentadora NR-10 (Segurança em Instalações e Serviços em Eletricidade), somente serão consideradas desenergizadas as instalações elétricas liberadas para trabalho mediante os procedimentos apropriados, obedecida a uma sequência estrita. O primeiro e o último passo dessa sequência obrigatória de desenergização são, respectivamente:',
    options: [
      { id: 'opt-28-a', letter: 'A', text: 'Constatação da ausência de tensão e instalação de aterramento temporário.', percentageChosen: 12 },
      { id: 'opt-28-b', letter: 'B', text: 'Seccionamento e instalação de sinalização de impedimento de reenergização.', percentageChosen: 75 },
      { id: 'opt-28-c', letter: 'C', text: 'Impedimento de reenergização e colocação de tapete isolante.', percentageChosen: 6 },
      { id: 'opt-28-d', letter: 'D', text: 'Desligamento do disjuntor geral e remoção dos fusíveis de proteção.', percentageChosen: 5 },
      { id: 'opt-28-e', letter: 'E', text: 'Aterramento da carcaça e preenchimento de ordem de serviço.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Sequência oficial do item 10.5.1 da NR-10:\na) Seccionamento;\nb) Impedimento de reenergização;\nc) Constatação da ausência de tensão;\nd) Instalação de aterramento temporário com equipotencialização dos condutores dos circuitos;\ne) Proteção dos elementos energizados existentes na zona controlada;\nf) Instalação da sinalização de impedimento de reenergização.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['NR-10', 'Desenergização', 'Segurança do Trabalho'],
    isDemonstrative: true,
    timesAnswered: 1540,
    correctPercentage: 75
  },
  {
    id: 'q-seg-02',
    code: 'Q-DEMO-29',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Segurança do Trabalho',
    topic: 'Equipamentos de Proteção (EPI e EPC)',
    subtopic: 'NR-6 e Proteção contra Arco Elétrico (NFPA 70E)',
    statement: 'Ao realizar intervenções em cubículos de distribuição com risco potencial de explosão por arco voltaico (arc flash), o técnico em eletrotécnica deve obrigatoriamente utilizar vestimentas com classificação de ATPV (Arc Thermal Performance Value). O ATPV representa:',
    options: [
      { id: 'opt-29-a', letter: 'A', text: 'A condutividade elétrica máxima admissível no tecido sob chuva.', percentageChosen: 5 },
      { id: 'opt-29-b', letter: 'B', text: 'O valor da energia térmica incidente máxima (cal/cm²) suportada pelo tecido antes de causar 50% de probabilidade de queimadura de 2º grau.', percentageChosen: 72 },
      { id: 'opt-29-c', letter: 'C', text: 'A espessura em milímetros do revestimento retardante de chamas.', percentageChosen: 14 },
      { id: 'opt-29-d', letter: 'D', text: 'A rigidez dielétrica para suportar toques acidentais em tensões superiores a 1.000 V.', percentageChosen: 7 },
      { id: 'opt-29-e', letter: 'E', text: 'A quantidade de vezes que o uniforme pode ser lavado sem perder a garantia.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'O ATPV (Arc Thermal Performance Value), expresso em cal/cm², indica a capacidade de atenuação da energia incidente gerada pelo arco elétrico até o limiar de 50% de probabilidade de queimadura de segundo grau no corpo do trabalhador. Vestimentas para eletricistas com risco de arco devem ter ATPV compatível com o estudo de energia incidente do painel.',
    difficulty: 'Médio',
    type: 'Múltipla Escolha',
    tags: ['ATPV', 'Arco Elétrico', 'NR-10', 'EPI'],
    isDemonstrative: true,
    timesAnswered: 870,
    correctPercentage: 72
  },
  {
    id: 'q-seg-03',
    code: 'Q-DEMO-30',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Segurança do Trabalho',
    topic: 'NR-33 e Espaços Confinados',
    subtopic: 'Medidas de Entrada e Permissão de Trabalho (PET)',
    statement: 'Para manutenções elétricas em galerias subterrâneas de cabos, caixas de passagem visitáveis e tanques que caracterizam Espaço Confinado (conforme NR-33), assinale a exigência mandatória que deve ser cumprida ANTES do ingresso de qualquer trabalhador no ambiente:',
    options: [
      { id: 'opt-30-a', letter: 'A', text: 'Realização de avaliação atmosférica (oxigênio, gases inflamáveis e tóxicos) com detector calibrado e emissão da Permissão de Entrada e Trabalho (PET).', percentageChosen: 88 },
      { id: 'opt-30-b', letter: 'B', text: 'Apenas a presença de um extintor de água pressurizada na entrada da galeria.', percentageChosen: 4 },
      { id: 'opt-30-c', letter: 'C', text: 'Ventilação natural por pelo menos 15 minutos sem necessidade de monitoramento contínuo.', percentageChosen: 5 },
      { id: 'opt-30-d', letter: 'D', text: 'Dispensar o vigia externo caso o trabalhador possua curso técnico concluído.', percentageChosen: 2 },
      { id: 'opt-30-e', letter: 'E', text: 'Isolamento acústico da tubulação adjacente.', percentageChosen: 1 }
    ],
    correctOptionLetter: 'A',
    explanation: 'A NR-33 estabelece como requisito mandatório a avaliação e monitoramento contínuo da atmosfera pré-entrada (verificando níveis de O₂, inflamabilidade LEL e contaminantes tóxicos como H₂S e CO), além da formalização e assinatura da Permissão de Entrada e Trabalho (PET) com vigia permanente posicionado no exterior.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['NR-33', 'Espaço Confinado', 'PET', 'Segurança Operacional'],
    isDemonstrative: true,
    timesAnswered: 1290,
    correctPercentage: 88
  },

  // 11. Extra bonus practical questions to exceed 30 and ensure thorough depth
  {
    id: 'q-inst-04',
    code: 'Q-DEMO-31',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Instalações Elétricas',
    topic: 'Dispositivos de Proteção (DR e DPS)',
    subtopic: 'Dispositivo Diferencial-Residual (DR)',
    statement: 'Um Dispositivo Diferencial-Residual (DR) de alta sensibilidade com corrente nominal de atuação IΔn = 30 mA é instalado em um quadro elétrico. Esse dispositivo tem como finalidade primordial proteger as pessoas contra:',
    options: [
      { id: 'opt-31-a', letter: 'A', text: 'Sobretensões de manobra e descargas atmosféricas indiretas.', percentageChosen: 8 },
      { id: 'opt-31-b', letter: 'B', text: 'Sobrecargas térmicas contínuas decorrentes do excesso de aparelhos conectados.', percentageChosen: 12 },
      { id: 'opt-31-c', letter: 'C', text: 'Choques elétricos por contato direto ou indireto através de fuga de corrente para a terra.', percentageChosen: 76 },
      { id: 'opt-31-d', letter: 'D', text: 'Curto-circuitos fase-fase francos no interior do painel.', percentageChosen: 3 },
      { id: 'opt-31-e', letter: 'E', text: 'Variações harmônicas de tensão provocadas por inversores de frequência.', percentageChosen: 1 }
    ],
    correctOptionLetter: 'C',
    explanation: 'O DR atua detectando a diferença entre a corrente que sai pelas fases e a que retorna pelo neutro (corrente diferencial-residual). Quando essa diferença atinge ou supera 30 mA (limite de fibrilação ventricular), o circuito é interrompido quase instantaneamente, salvaguardando a vida humana contra choques por contatos diretos e indiretos.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['DR', 'Segurança Elétrica', 'NBR 5410'],
    isDemonstrative: true,
    timesAnswered: 1110,
    correctPercentage: 76
  },
  {
    id: 'q-ele-04',
    code: 'Q-DEMO-32',
    contest: 'Transpetro',
    organization: 'Petrobras Transporte S.A.',
    position: 'Técnico em Eletrotécnica',
    board: 'Cesgranrio (Simulada)',
    year: 2024,
    discipline: 'Eletrotécnica',
    topic: 'Comandos Elétricos e Chaves de Manobra',
    subtopic: 'Intertravamento Elétrico de Contatores',
    statement: 'Em um circuito de comando elétrico para reversão de sentido de rotação de um motor trifásico, são utilizados dois contatores de potência, K1 (sentido horário) e K2 (sentido anti-horário). O intertravamento elétrico por contatos auxiliares NF (normalmente fechados) é projetado para:',
    options: [
      { id: 'opt-32-a', letter: 'A', text: 'Aumentar a velocidade de aceleração mecânica da carga.', percentageChosen: 4 },
      { id: 'opt-32-b', letter: 'B', text: 'Impedir a energização simultânea das bobinas de K1 e K2, evitando um curto-circuito bifásico franco entre as linhas.', percentageChosen: 86 },
      { id: 'opt-32-c', letter: 'C', text: 'Garantir o desligamento do relé térmico em caso de assimetria de tensão.', percentageChosen: 5 },
      { id: 'opt-32-d', letter: 'D', text: 'Fornecer alimentação de selo para o botão de emergência.', percentageChosen: 3 },
      { id: 'opt-32-e', letter: 'E', text: 'Comutar a tensão de comando de 220 Vca para 24 Vcc.', percentageChosen: 2 }
    ],
    correctOptionLetter: 'B',
    explanation: 'Na reversão de rotação, duas fases de alimentação são trocadas entre os contatores. Caso K1 e K2 fossem acionados ao mesmo tempo, ocorreria um curto-circuito direto entre as duas fases invertidas. O contato auxiliar NF de K1 no ramo da bobina de K2 (e vice-versa) garante que uma bobina nunca possa ser energizada enquanto a outra estiver atracada.',
    difficulty: 'Fácil',
    type: 'Múltipla Escolha',
    tags: ['Comandos Elétricos', 'Intertravamento', 'Contatores'],
    isDemonstrative: true,
    timesAnswered: 1350,
    correctPercentage: 86
  }
];

export const INITIAL_DISCIPLINES = [
  'Língua Portuguesa',
  'Matemática',
  'Física',
  'Química',
  'Eletrotécnica',
  'Eletricidade',
  'Circuitos Elétricos',
  'Máquinas Elétricas',
  'Instalações Elétricas',
  'Segurança do Trabalho'
];

export const INITIAL_ORGANIZATION_NAMES = [
  'Petrobras Transporte S.A. (Transpetro)',
  'Petróleo Brasileiro S.A. (Petrobras)',
  'Furnas Centrais Elétricas',
  'Eletrobras Chesf',
  'Eletronuclear'
];

export const INITIAL_BOARD_NAMES = [
  'Cesgranrio',
  'Cebraspe',
  'FCC',
  'FGV',
  'Vunesp'
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Primeira Questão',
    description: 'Responda sua primeira questão na plataforma.',
    iconName: 'Sparkles',
    xpReward: 50,
    category: 'questoes',
    requirement: 1
  },
  {
    id: 'ach-2',
    title: 'Foco Inicial (10 Questões)',
    description: 'Resolva 10 questões no banco de questões.',
    iconName: 'Zap',
    xpReward: 100,
    category: 'questoes',
    requirement: 10
  },
  {
    id: 'ach-3',
    title: 'Centurião dos Estudos (100 Questões)',
    description: 'Resolva 100 questões com dedicação e disciplina.',
    iconName: 'ShieldAlert',
    xpReward: 250,
    category: 'questoes',
    requirement: 100
  },
  {
    id: 'ach-4',
    title: 'Mestre Concurseiro (500 Questões)',
    description: 'Supere a impressionante marca de 500 questões resolvidas.',
    iconName: 'Crown',
    xpReward: 700,
    category: 'questoes',
    requirement: 500
  },
  {
    id: 'ach-5',
    title: 'Constância de Campeão (7 Dias)',
    description: 'Mantenha uma sequência ininterrupta de 7 dias estudando.',
    iconName: 'Flame',
    xpReward: 200,
    category: 'dias',
    requirement: 7
  },
  {
    id: 'ach-6',
    title: 'Hábito de Aço (30 Dias)',
    description: 'Mantenha sua sequência ativa por 30 dias seguidos.',
    iconName: 'CalendarCheck',
    xpReward: 500,
    category: 'dias',
    requirement: 30
  },
  {
    id: 'ach-7',
    title: 'Batismo de Fogo (Primeiro Simulado)',
    description: 'Finalize seu primeiro simulado completo cronometrado.',
    iconName: 'Timer',
    xpReward: 150,
    category: 'simulados',
    requirement: 1
  },
  {
    id: 'ach-8',
    title: 'Estrategista dos Simulados',
    description: 'Conclua 5 simulados completos e analise seus resultados.',
    iconName: 'Target',
    xpReward: 350,
    category: 'simulados',
    requirement: 5
  },
  {
    id: 'ach-9',
    title: 'Revisor Implacável',
    description: 'Complete 10 revisões do seu caderno de erros e pendências.',
    iconName: 'Repeat',
    xpReward: 200,
    category: 'revisoes',
    requirement: 10
  }
];

export const INITIAL_LEADERBOARD: RankingUser[] = [
  {
    id: 'user-top-1',
    name: 'Carlos Eduardo Mendes',
    xp: 4250,
    level: 'Nível 5 — Especialista',
    questionsSolved: 482,
    accuracyRate: 84.5,
    targetContest: 'Transpetro',
    position: 1
  },
  {
    id: 'user-top-2',
    name: 'Mariana Souza Farias',
    xp: 3890,
    level: 'Nível 4 — Avançado',
    questionsSolved: 412,
    accuracyRate: 81.2,
    targetContest: 'Transpetro',
    position: 2
  },
  {
    id: 'user-top-3',
    name: 'Rodrigo Lima Santos',
    xp: 3410,
    level: 'Nível 4 — Avançado',
    questionsSolved: 365,
    accuracyRate: 78.9,
    targetContest: 'Transpetro',
    position: 3
  },
  {
    id: 'user-top-4',
    name: 'Beatriz Almeida Costa',
    xp: 2980,
    level: 'Nível 3 — Preparado',
    questionsSolved: 310,
    accuracyRate: 76.4,
    targetContest: 'Petrobras',
    position: 4
  },
  {
    id: 'user-top-5',
    name: 'Felipe Ramos Carvalho',
    xp: 2650,
    level: 'Nível 3 — Preparado',
    questionsSolved: 285,
    accuracyRate: 74.8,
    targetContest: 'Transpetro',
    position: 5
  },
  {
    id: 'user-top-6',
    name: 'Aline Oliveira Dias',
    xp: 2210,
    level: 'Nível 2 — Estudante',
    questionsSolved: 230,
    accuracyRate: 72.1,
    targetContest: 'Furnas',
    position: 6
  },
  {
    id: 'user-top-7',
    name: 'Thiago Nogueira Pinheiro',
    xp: 1850,
    level: 'Nível 2 — Estudante',
    questionsSolved: 195,
    accuracyRate: 70.5,
    targetContest: 'Transpetro',
    position: 7
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Meta Diária de Questões',
    message: 'Você tem uma meta de 40 questões para hoje. Mantenha o ritmo rumo à aprovação!',
    type: 'info',
    read: false,
    createdAt: 'Hoje às 08:30'
  },
  {
    id: 'notif-2',
    title: 'Sequência em Chamas!',
    message: 'Você está há 3 dias mantendo sua sequência ininterrupta. Parabéns!',
    type: 'success',
    read: false,
    createdAt: 'Ontem às 21:15'
  },
  {
    id: 'notif-3',
    title: 'Revisão Recomendada',
    message: 'Você possui 2 tópicos recomendados para revisão com base no seu histórico de erros.',
    type: 'warning',
    read: true,
    createdAt: 'Há 2 dias'
  }
];

export const INITIAL_COMMENTS_MAP: Record<string, any[]> = {
  'q-port-01': [
    {
      id: 'c-1',
      questionId: 'q-port-01',
      userName: 'Prof. Alberto Vieira',
      userRole: 'Professor Oficial',
      userBadge: 'Professor APROVA+',
      content: 'Atenção concurseiros da Cesgranrio: verbo VTI + partícula SE = SE como Índice de Indeterminação do Sujeito. Verbo sempre no singular! Macete de prova infalível.',
      createdAt: '12 de Setembro, 2024',
      likes: 42,
      isOfficial: true
    },
    {
      id: 'c-2',
      questionId: 'q-port-01',
      userName: 'Camila Santos',
      userRole: 'Estudante',
      userBadge: 'Nível 4',
      content: 'Errei essa questão há duas semanas por falta de atenção na preposição "de". Agora nunca mais esqueço: tratou-se de questões!',
      createdAt: '15 de Setembro, 2024',
      likes: 18,
      isOfficial: false
    }
  ],
  'q-ele-01': [
    {
      id: 'c-3',
      questionId: 'q-ele-01',
      userName: 'Eng. Marcus Tavares',
      userRole: 'Especialista em Elétrica',
      userBadge: 'Professor APROVA+',
      content: 'A fórmula Qc = P * (tan θ1 - tan θ2) cai em quase TODAS as provas de Técnico em Eletrotécnica da Cesgranrio e Petrobras/Transpetro. Guardem no resumo de cabeceira!',
      createdAt: '5 de Outubro, 2024',
      likes: 67,
      isOfficial: true
    }
  ]
};

// -------------------------------------------------------------
// Base Mestre Concursos Brasil — Taxonomia Relacional Inicial
// (Referência ao arquivo base_mestre_concursos_brasil.xlsx)
// -------------------------------------------------------------
export const INITIAL_SPHERES = [
  { id: 'sph-fed', name: 'Federal' as const, description: 'Órgãos e empresas de abrangência nacional da União' },
  { id: 'sph-est', name: 'Estadual' as const, description: 'Órgãos dos governos estaduais das 27 unidades federativas' },
  { id: 'sph-dis', name: 'Distrital' as const, description: 'Estruturas administrativas do Distrito Federal' },
  { id: 'sph-mun', name: 'Municipal' as const, description: 'Prefeituras, Câmaras Municipais e autarquias locais' }
];

export const INITIAL_POWERS = [
  { id: 'pow-exe', name: 'Executivo', category: 'Poder' as const },
  { id: 'pow-leg', name: 'Legislativo', category: 'Poder' as const },
  { id: 'pow-jud', name: 'Judiciário', category: 'Poder' as const },
  { id: 'pow-mp', name: 'Ministério Público', category: 'Instituição' as const },
  { id: 'pow-def', name: 'Defensoria Pública', category: 'Instituição' as const },
  { id: 'pow-tc', name: 'Tribunais de Contas', category: 'Instituição' as const },
  { id: 'pow-fa', name: 'Forças Armadas', category: 'Instituição' as const },
  { id: 'pow-seg', name: 'Segurança Pública', category: 'Instituição' as const },
  { id: 'pow-emp', name: 'Empresas Públicas e Sociedades de Economia Mista', category: 'Empresa' as const }
];

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-transpetro',
    name: 'Petrobras Transporte S.A.',
    acronym: 'Transpetro',
    sphere: 'Federal' as const,
    power: 'Empresas Públicas e Sociedades de Economia Mista',
    type: 'Sociedade de Economia Mista' as const,
    description: 'Maior armadora da América Latina e principal subsidiária de logística da Petrobras.',
    websiteUrl: 'https://transpetro.com.br'
  },
  {
    id: 'org-petrobras',
    name: 'Petróleo Brasileiro S.A.',
    acronym: 'Petrobras',
    sphere: 'Federal' as const,
    power: 'Empresas Públicas e Sociedades de Economia Mista',
    type: 'Sociedade de Economia Mista' as const,
    description: 'Empresa estatal de energia, líder em exploração e refino em águas profundas.',
    websiteUrl: 'https://petrobras.com.br'
  },
  {
    id: 'org-inss',
    name: 'Instituto Nacional do Seguro Social',
    acronym: 'INSS',
    sphere: 'Federal' as const,
    power: 'Executivo',
    type: 'Autarquia' as const,
    description: 'Autarquia federal responsável pela operacionalização dos direitos previdenciários no Brasil.',
    websiteUrl: 'https://gov.br/inss'
  },
  {
    id: 'org-rfb',
    name: 'Receita Federal do Brasil',
    acronym: 'Receita Federal',
    sphere: 'Federal' as const,
    power: 'Executivo',
    type: 'Órgão' as const,
    description: 'Secretaria especial responsável pela arrecadação tributária e fiscalização aduaneira da União.',
    websiteUrl: 'https://gov.br/receitafederal'
  },
  {
    id: 'org-bb',
    name: 'Banco do Brasil S.A.',
    acronym: 'Banco do Brasil',
    sphere: 'Federal' as const,
    power: 'Empresas Públicas e Sociedades de Economia Mista',
    type: 'Sociedade de Economia Mista' as const,
    description: 'Primeira instituição bancária do Brasil, líder no agronegócio e varejo financeiro.',
    websiteUrl: 'https://bb.com.br'
  },
  {
    id: 'org-caixa',
    name: 'Caixa Econômica Federal',
    acronym: 'Caixa',
    sphere: 'Federal' as const,
    power: 'Empresas Públicas e Sociedades de Economia Mista',
    type: 'Empresa Pública' as const,
    description: 'Banco público federal focado em programas sociais, habitação e desenvolvimento urbano.',
    websiteUrl: 'https://caixa.gov.br'
  },
  {
    id: 'org-pf',
    name: 'Polícia Federal',
    acronym: 'PF',
    sphere: 'Federal' as const,
    power: 'Segurança Pública',
    type: 'Órgão' as const,
    description: 'Órgão permanente de segurança pública subordinado ao Ministério da Justiça.',
    websiteUrl: 'https://gov.br/pf'
  },
  {
    id: 'org-prf',
    name: 'Polícia Rodoviária Federal',
    acronym: 'PRF',
    sphere: 'Federal' as const,
    power: 'Segurança Pública',
    type: 'Órgão' as const,
    description: 'Força policial ostensiva com atribuição sobre todas as rodovias e estradas federais.',
    websiteUrl: 'https://gov.br/prf'
  },
  {
    id: 'org-tcu',
    name: 'Tribunal de Contas da União',
    acronym: 'TCU',
    sphere: 'Federal' as const,
    power: 'Tribunais de Contas',
    type: 'Tribunal' as const,
    description: 'Órgão de controle externo que auxilia o Congresso Nacional na fiscalização contábil e orçamentária.',
    websiteUrl: 'https://tcu.gov.br'
  },
  {
    id: 'org-correios',
    name: 'Empresa Brasileira de Correios e Telégrafos',
    acronym: 'Correios',
    sphere: 'Federal' as const,
    power: 'Empresas Públicas e Sociedades de Economia Mista',
    type: 'Empresa Pública' as const,
    description: 'Líder no segmento logístico e encomendas postais em todo o território nacional.',
    websiteUrl: 'https://correios.com.br'
  }
];

export const INITIAL_CONTESTS = [
  {
    id: 'cont-transpetro-2023',
    title: 'Processo Seletivo Público Transpetro 2023/2024',
    organizationId: 'org-transpetro',
    organizationName: 'Transpetro',
    year: 2024,
    board: 'Cesgranrio',
    status: 'Encerrado' as const,
    sphere: 'Federal' as const,
    vacancies: 1656,
    positionsCount: 42
  },
  {
    id: 'cont-petrobras-2024',
    title: 'Processo Seletivo Público Petrobras Nível Técnico 2024',
    organizationId: 'org-petrobras',
    organizationName: 'Petrobras',
    year: 2024,
    board: 'Cebraspe',
    status: 'Encerrado' as const,
    sphere: 'Federal' as const,
    vacancies: 6412,
    positionsCount: 26
  },
  {
    id: 'cont-inss-2025',
    title: 'Concurso Público INSS — Técnico e Analista do Seguro Social',
    organizationId: 'org-inss',
    organizationName: 'INSS',
    year: 2025,
    board: 'Cebraspe',
    status: 'Previsto' as const,
    sphere: 'Federal' as const,
    vacancies: 1574,
    positionsCount: 2
  },
  {
    id: 'cont-rfb-2023',
    title: 'Concurso Público Receita Federal do Brasil — Auditor e Analista Tributário',
    organizationId: 'org-rfb',
    organizationName: 'Receita Federal',
    year: 2023,
    board: 'FGV',
    status: 'Encerrado' as const,
    sphere: 'Federal' as const,
    vacancies: 699,
    positionsCount: 2
  },
  {
    id: 'cont-bb-2023',
    title: 'Concurso Banco do Brasil — Escriturário / Agente Comercial e TI',
    organizationId: 'org-bb',
    organizationName: 'Banco do Brasil',
    year: 2023,
    board: 'Cesgranrio',
    status: 'Encerrado' as const,
    sphere: 'Federal' as const,
    vacancies: 6000,
    positionsCount: 2
  },
  {
    id: 'cont-caixa-2024',
    title: 'Concurso Caixa Econômica Federal — Técnico Bancário Novo e TI',
    organizationId: 'org-caixa',
    organizationName: 'Caixa',
    year: 2024,
    board: 'Cesgranrio',
    status: 'Encerrado' as const,
    sphere: 'Federal' as const,
    vacancies: 4050,
    positionsCount: 2
  },
  {
    id: 'cont-pf-2025',
    title: 'Concurso Polícia Federal — Agente, Escrivão e Delegado',
    organizationId: 'org-pf',
    organizationName: 'Polícia Federal',
    year: 2025,
    board: 'Cebraspe',
    status: 'Previsto' as const,
    sphere: 'Federal' as const,
    vacancies: 2000,
    positionsCount: 4
  }
];

export const INITIAL_POSITIONS = [
  {
    id: 'pos-tec-eletro',
    title: 'Técnico em Eletrotécnica',
    careerArea: 'Técnica e Engenharia' as const,
    schoolingLevel: 'Técnico' as const,
    salaryEstimated: 'R$ 6.842,00 a R$ 11.200,00',
    organizationName: 'Transpetro / Petrobras'
  },
  {
    id: 'pos-tec-adm',
    title: 'Técnico Administrativo',
    careerArea: 'Administrativa' as const,
    schoolingLevel: 'Médio' as const,
    salaryEstimated: 'R$ 4.500,00 a R$ 7.900,00',
    organizationName: 'Transpetro / Correios / Universidades'
  },
  {
    id: 'pos-tec-inss',
    title: 'Técnico do Seguro Social',
    careerArea: 'Administrativa' as const,
    schoolingLevel: 'Superior' as const,
    salaryEstimated: 'R$ 6.596,52 + benefícios',
    organizationName: 'INSS'
  },
  {
    id: 'pos-aud-rfb',
    title: 'Auditor-Fiscal da Receita Federal',
    careerArea: 'Fiscal' as const,
    schoolingLevel: 'Superior' as const,
    salaryEstimated: 'R$ 22.921,71 inicial',
    organizationName: 'Receita Federal'
  },
  {
    id: 'pos-ag-pol-fed',
    title: 'Agente de Polícia Federal',
    careerArea: 'Policial' as const,
    schoolingLevel: 'Superior' as const,
    salaryEstimated: 'R$ 13.644,48',
    organizationName: 'Polícia Federal'
  },
  {
    id: 'pos-esc-bb',
    title: 'Escriturário (Agente Comercial)',
    careerArea: 'Bancária' as const,
    schoolingLevel: 'Médio' as const,
    salaryEstimated: 'R$ 3.622,23 + VA/VR + PLR',
    organizationName: 'Banco do Brasil'
  },
  {
    id: 'pos-eng-ele',
    title: 'Engenheiro Elétrico / Eletrônico',
    careerArea: 'Técnica e Engenharia' as const,
    schoolingLevel: 'Superior' as const,
    salaryEstimated: 'R$ 13.800,00 a R$ 19.500,00',
    organizationName: 'Petrobras / Transpetro'
  }
];

export const INITIAL_BOARDS = [
  {
    id: 'brd-cesgranrio',
    name: 'Fundação Cesgranrio',
    acronym: 'Cesgranrio',
    styleDescription: 'Foco em textos objetivos, fórmulas diretas e estilo tradicional de múltipla escolha de A a E. Tradicional em concursos Petrobras, Transpetro, Banco do Brasil e Caixa.',
    websiteUrl: 'https://cesgranrio.org.br'
  },
  {
    id: 'brd-cebraspe',
    name: 'Centro Brasileiro de Pesquisa em Avaliação e Seleção e de Promoção de Eventos',
    acronym: 'Cebraspe',
    styleDescription: 'Famosa pelo modelo Certo ou Errado onde uma questão errada anula uma certa, além de enunciados densos e interdisciplinares.',
    websiteUrl: 'https://cebraspe.org.br'
  },
  {
    id: 'brd-fgv',
    name: 'Fundação Getulio Vargas',
    acronym: 'FGV',
    styleDescription: 'Famosa por provas extremamente exigentes de Língua Portuguesa com semântica profunda e interpretações sofisticadas, além de fortes cobranças em Direito e Finanças.',
    websiteUrl: 'https://conhecimento.fgv.br/concursos'
  },
  {
    id: 'brd-fcc',
    name: 'Fundação Carlos Chagas',
    acronym: 'FCC',
    styleDescription: 'Conhecida pela literalidade de leis e normas técnicas, questões muito bem estruturadas e previsíveis no padrão de cobrança.',
    websiteUrl: 'https://concursosfcc.com.br'
  },
  {
    id: 'brd-vunesp',
    name: 'Fundação Vunesp',
    acronym: 'Vunesp',
    styleDescription: 'Muito tradicional em São Paulo e tribunais, enunciados claros e respeito estrito ao edital.',
    websiteUrl: 'https://vunesp.com.br'
  },
  {
    id: 'brd-ibfc',
    name: 'Instituto Brasileiro de Formação e Capacitação',
    acronym: 'IBFC',
    styleDescription: 'Cobrança direta de conceitos e definições, com questões de múltipla escolha bem segmentadas.',
    websiteUrl: 'https://ibfc.org.br'
  },
  {
    id: 'brd-aocp',
    name: 'Instituto AOCP',
    acronym: 'AOCP',
    styleDescription: 'Muito atuante em carreiras policiais e empresas estaduais, com boa clareza no padrão de correção.',
    websiteUrl: 'https://institutoaocp.org.br'
  }
];

export const INITIAL_TAXONOMY_DISCIPLINES = [
  { id: 'disc-port', name: 'Língua Portuguesa', code: 'PORT', questionCount: 420 },
  { id: 'disc-mat', name: 'Matemática', code: 'MAT', questionCount: 380 },
  { id: 'disc-fis', name: 'Física', code: 'FIS', questionCount: 290 },
  { id: 'disc-ele', name: 'Eletricidade', code: 'ELET', questionCount: 310 },
  { id: 'disc-circ', name: 'Circuitos Elétricos', code: 'CIRC', questionCount: 450 },
  { id: 'disc-eletrot', name: 'Eletrotécnica', code: 'ELETROT', questionCount: 520 },
  { id: 'disc-maq', name: 'Máquinas Elétricas', code: 'MAQ', questionCount: 340 },
  { id: 'disc-pot', name: 'Eletrônica de Potência', code: 'POT', questionCount: 210 },
  { id: 'disc-inst', name: 'Instalações Elétricas', code: 'INST', questionCount: 360 },
  { id: 'disc-seg', name: 'Segurança do Trabalho', code: 'SEG', questionCount: 280 }
];

export const INITIAL_TAXONOMY_SUBJECTS = [
  { id: 'subj-circ-thev', disciplineId: 'disc-circ', disciplineName: 'Circuitos Elétricos', name: 'Teorema de Thévenin e Norton' },
  { id: 'subj-circ-kirch', disciplineId: 'disc-circ', disciplineName: 'Circuitos Elétricos', name: 'Leis de Kirchhoff e Análise Nodal' },
  { id: 'subj-circ-rlc', disciplineId: 'disc-circ', disciplineName: 'Circuitos Elétricos', name: 'Circuitos RLC em Corrente Alternada' },
  { id: 'subj-eletrot-fp', disciplineId: 'disc-eletrot', disciplineName: 'Eletrotécnica', name: 'Correção do Fator de Potência' },
  { id: 'subj-eletrot-tri', disciplineId: 'disc-eletrot', disciplineName: 'Eletrotécnica', name: 'Sistemas Trifásicos Equilibrados' },
  { id: 'subj-maq-mit', disciplineId: 'disc-maq', disciplineName: 'Máquinas Elétricas', name: 'Motores de Indução Trifásicos (MIT)' },
  { id: 'subj-maq-trafo', disciplineId: 'disc-maq', disciplineName: 'Máquinas Elétricas', name: 'Transformadores de Potência' },
  { id: 'subj-port-conc', disciplineId: 'disc-port', disciplineName: 'Língua Portuguesa', name: 'Concordância Verbal e Nominal' },
  { id: 'subj-port-crase', disciplineId: 'disc-port', disciplineName: 'Língua Portuguesa', name: 'Crase' },
  { id: 'subj-mat-prop', disciplineId: 'disc-mat', disciplineName: 'Matemática', name: 'Razão, Proporção e Porcentagem' }
];

export const INITIAL_TAXONOMY_TOPICS = [
  { id: 'top-1', subjectId: 'subj-circ-thev', subjectName: 'Teorema de Thévenin e Norton', name: 'Cálculo de Tensão e Resistência Equivalente' },
  { id: 'top-2', subjectId: 'subj-circ-kirch', subjectName: 'Leis de Kirchhoff e Análise Nodal', name: 'Lei dos Nós e das Malhas' },
  { id: 'top-3', subjectId: 'subj-eletrot-fp', subjectName: 'Correção do Fator de Potência', name: 'Cálculo da Potência Reativa dos Bancos de Capacitores' },
  { id: 'top-4', subjectId: 'subj-maq-mit', subjectName: 'Motores de Indução Trifásicos (MIT)', name: 'Escorregamento e Velocidade Síncrona' },
  { id: 'top-5', subjectId: 'subj-port-conc', subjectName: 'Concordância Verbal e Nominal', name: 'Partícula SE como Apassivadora ou Indeterminação' }
];

export const INITIAL_NOTEBOOKS = [
  {
    id: 'noteb-1',
    userId: 'user-student-demo',
    title: 'Caderno — Eletrotécnica Transpetro',
    description: 'Questões mais difíceis e recorrentes para revisão da prova Cesgranrio.',
    targetContest: 'Transpetro',
    questionIds: ['q-circ-01', 'q-ele-01', 'q-circ-03'],
    createdAt: '15/09/2026',
    updatedAt: '22/09/2026'
  },
  {
    id: 'noteb-2',
    userId: 'user-student-demo',
    title: 'Caderno — Português Cesgranrio',
    description: 'Casos complexos de crase, regência e conectivos da banca.',
    targetContest: 'Transpetro',
    questionIds: ['q-port-01', 'q-port-02', 'q-port-03'],
    createdAt: '18/09/2026',
    updatedAt: '20/09/2026'
  }
];

