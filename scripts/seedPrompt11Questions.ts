import { db } from '../src/db/index.ts';
import { questions, questionAlternatives } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding original questions for Prompt 11...');

  const items = [
    {
      q: {
        id: 'q-rl-03',
        code: 'Q-RL-03',
        statement: 'Considere a seguinte proposição condicional: "Se o candidato revisa o edital, então ele obtém a aprovação". De acordo com a lógica proposicional, assinale a opção que apresenta uma proposição logicamente equivalente:',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-raciocinio-logico',
        difficulty: 'Médio',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'A condicional P -> Q é logicamente equivalente à sua contrapositiva (~Q -> ~P): "Se o candidato não obtém a aprovação, então ele não revisa o edital".',
        bibliographicReference: 'Cabral, Luiz Cláudio. Raciocínio Lógico Passo a Passo.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Se o candidato obtém a aprovação, então ele revisa o edital.', isCorrect: false },
        { letter: 'B', text: 'Se o candidato não obtém a aprovação, então ele não revisa o edital.', isCorrect: true },
        { letter: 'C', text: 'O candidato revisa o edital e não obtém a aprovação.', isCorrect: false },
        { letter: 'D', text: 'Ou o candidato revisa o edital ou obtém a aprovação.', isCorrect: false },
        { letter: 'E', text: 'Se o candidato não revisa o edital, então ele não obtém a aprovação.', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-rl-04',
        code: 'Q-RL-04',
        statement: 'A negação lógica da afirmação "Todos os servidores do setor técnico possuem certificação de segurança NR-10" é dada por:',
        year: 2024,
        boardId: 'board-fgv',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-raciocinio-logico',
        difficulty: 'Fácil',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'A negação de "Todo A é B" é "Pelo menos um A não é B" (quantificador existencial com negação do predicado).',
        bibliographicReference: 'Alencar, Edgar de. Iniciação à Lógica Matemática.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Nenhum servidor do setor técnico possui certificação de segurança NR-10.', isCorrect: false },
        { letter: 'B', text: 'Pelo menos um servidor do setor técnico não possui certificação de segurança NR-10.', isCorrect: true },
        { letter: 'C', text: 'Todos os servidores do setor técnico não possuem certificação.', isCorrect: false },
        { letter: 'D', text: 'Alguns servidores possuem certificação e outros servidores não possuem.', isCorrect: false },
        { letter: 'E', text: 'Nenhum servidor trabalha sem a certificação correspondente.', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-rl-05',
        code: 'Q-RL-05',
        statement: 'Em um grupo de 80 técnicos industriais, 50 dominam a operação de sistemas SCADA e 45 dominam a programação de CLP. Sabendo que 5 técnicos não dominam nenhuma dessas ferramentas, quantos técnicos dominam simultaneamente SCADA e CLP?',
        year: 2024,
        boardId: 'board-cebraspe',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-raciocinio-logico',
        difficulty: 'Médio',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'Técnicos que dominam pelo menos uma ferramenta = 80 - 5 = 75. n(A U B) = n(A) + n(B) - n(A ∩ B) => 75 = 50 + 45 - Interseção => Interseção = 95 - 75 = 20 técnicos.',
        bibliographicReference: 'Iezzi, Gelson. Fundamentos de Matemática Elementar.',
        active: true,
      },
      alts: [
        { letter: 'A', text: '15 técnicos', isCorrect: false },
        { letter: 'B', text: '20 técnicos', isCorrect: true },
        { letter: 'C', text: '25 técnicos', isCorrect: false },
        { letter: 'D', text: '30 técnicos', isCorrect: false },
        { letter: 'E', text: '35 técnicos', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-inf-03',
        code: 'Q-INF-03',
        statement: 'No contexto de redes e segurança da informação corporativa, o protocolo responsável por fornecer conexão criptografada fim a fim na camada de transporte da Web (HTTPS) é o:',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-informatica',
        difficulty: 'Fácil',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'O TLS (Transport Layer Security) e seu predecessor SSL provêm confidencialidade e integridade no tráfego HTTPS.',
        bibliographicReference: 'Tanenbaum, Andrew S. Redes de Computadores.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'FTP (File Transfer Protocol)', isCorrect: false },
        { letter: 'B', text: 'TLS / SSL (Transport Layer Security)', isCorrect: true },
        { letter: 'C', text: 'SNMP (Simple Network Management Protocol)', isCorrect: false },
        { letter: 'D', text: 'DHCP (Dynamic Host Configuration Protocol)', isCorrect: false },
        { letter: 'E', text: 'Telnet', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-inf-04',
        code: 'Q-INF-04',
        statement: 'No sistema operacional Linux, qual utilitário de linha de comando monitora dinamicamente em tempo real os processos em execução, exibindo uso de CPU, memória RAM e carga média?',
        year: 2024,
        boardId: 'board-cebraspe',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-informatica',
        difficulty: 'Fácil',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'O comando "top" fornece uma visão dinâmica e em tempo real dos processos ativos do sistema operacional.',
        bibliographicReference: 'Nemeth, E. Manual de Administração do Sistema Linux.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'ls -la', isCorrect: false },
        { letter: 'B', text: 'top', isCorrect: true },
        { letter: 'C', text: 'grep -r', isCorrect: false },
        { letter: 'D', text: 'chmod 755', isCorrect: false },
        { letter: 'E', text: 'df -h', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-dir-const-05',
        code: 'Q-CONST-05',
        statement: 'Nos termos do art. 37, § 6º da CF/88, as pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos causados por seus agentes com base na teoria da:',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-direito-constitucional',
        difficulty: 'Médio',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'A CF/88 adota a responsabilidade civil objetiva sob a modalidade do risco administrativo, assegurado o direito de regresso contra o agente em caso de dolo ou culpa.',
        bibliographicReference: 'Constituição Federal de 1988, art. 37, § 6º.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Culpa exclusiva da vítima em qualquer circunstância.', isCorrect: false },
        { letter: 'B', text: 'Responsabilidade objetiva na modalidade do risco administrativo.', isCorrect: true },
        { letter: 'C', text: 'Responsabilidade subjetiva com presunção de ausência de dano.', isCorrect: false },
        { letter: 'D', text: 'Risco integral sem admitir excludentes de nexo de causalidade.', isCorrect: false },
        { letter: 'E', text: 'Responsabilidade unicamente subsidiária após processo penal transitado em julgado.', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-dir-adm-05',
        code: 'Q-ADM-05',
        statement: 'Nos termos da Lei nº 14.133/2021, a modalidade de licitação obrigatória para a aquisição de bens e serviços comuns, cujo critério de julgamento poderá ser menor preço ou maior desconto, denomina-se:',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-direito-administrativo',
        difficulty: 'Fácil',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'O pregão é a modalidade de licitação obrigatória para a aquisição de bens e serviços comuns na Nova Lei de Licitações (art. 6º, XLI da Lei 14.133/2021).',
        bibliographicReference: 'Lei Federal 14.133/2021.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Concorrência', isCorrect: false },
        { letter: 'B', text: 'Pregão', isCorrect: true },
        { letter: 'C', text: 'Concurso', isCorrect: false },
        { letter: 'D', text: 'Diálogo Competitivo', isCorrect: false },
        { letter: 'E', text: 'Leilão', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-adm-pub-03',
        code: 'Q-PUB-03',
        statement: 'No modelo de Administração Pública Gerencial, a governança pública orienta-se precipuamente pelo controle a posteriori de resultados, contrapondo-se fundamentalmente ao modelo:',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-administracao-publica',
        difficulty: 'Médio',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'O modelo gerencial visa superar a lentidão e rigidez do modelo burocrático weberiano voltado exclusivamente ao cumprimento estrito de regras e processos formais.',
        bibliographicReference: 'Bresser-Pereira, Luiz Carlos. Reforma do Estado para a Cidadania.',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Patrimonialista arcaico', isCorrect: false },
        { letter: 'B', text: 'Burocrático weberiano', isCorrect: true },
        { letter: 'C', text: 'Democrático participativo', isCorrect: false },
        { letter: 'D', text: 'Anárquico descentralizado', isCorrect: false },
        { letter: 'E', text: 'Liberal concorrencial', isCorrect: false },
      ]
    },
    {
      q: {
        id: 'q-gerais-03',
        code: 'Q-GERAIS-03',
        statement: 'A transição energética global preconizada nos acordos climáticos busca substituir fontes fósseis por energias limpas e renováveis. No Brasil, qual das seguintes fontes tem apresentado a maior taxa de crescimento na geração distribuída na década de 2020?',
        year: 2024,
        boardId: 'board-cesgranrio',
        examId: 'exam-transpetro-2026',
        organizationId: 'org-transpetro',
        positionId: 'pos-eletrotecnica',
        subjectId: 'sub-conhecimentos-gerais',
        difficulty: 'Fácil',
        type: 'Múltipla Escolha',
        status: 'PUBLISHED',
        explanation: 'A energia solar fotovoltaica, especialmente no modelo de geração distribuída, tem sido a fonte de mais rápida expansão na matriz elétrica brasileira.',
        bibliographicReference: 'EPE - Balanço Energético Nacional (BEN).',
        active: true,
      },
      alts: [
        { letter: 'A', text: 'Termoelétrica a carvão mineral', isCorrect: false },
        { letter: 'B', text: 'Energia Solar Fotovoltaica', isCorrect: true },
        { letter: 'C', text: 'Termonuclear', isCorrect: false },
        { letter: 'D', text: 'Óleo diesel pesado', isCorrect: false },
        { letter: 'E', text: 'Gás de xisto', isCorrect: false },
      ]
    }
  ];

  let added = 0;
  for (const item of items) {
    const [existing] = await db.select().from(questions).where(eq(questions.id, item.q.id));
    if (!existing) {
      await db.insert(questions).values(item.q);
      for (let i = 0; i < item.alts.length; i++) {
        const alt = item.alts[i];
        await db.insert(questionAlternatives).values({
          id: `alt-${item.q.id}-${alt.letter.toLowerCase()}`,
          questionId: item.q.id,
          letter: alt.letter,
          text: alt.text,
          isCorrect: alt.isCorrect,
          orderIndex: i,
          percentageChosen: alt.isCorrect ? 65 : 8,
        });
      }
      added++;
    }
  }

  console.log(`Successfully added ${added} new questions.`);
  process.exit(0);
}

seed();
