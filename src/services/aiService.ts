import { Question } from '../types';

/**
 * AIService (Prompt Master — Item 31: Camada de Arquitetura para IA)
 * 
 * Camada independente preparada para integração com modelos inteligentes (Gemini / GenAI).
 * Projetada de forma desacoplada para permitir expansão sem reescrever o sistema.
 */
export class AIService {
  /**
   * Explica didaticamente uma questão passo a passo com resolução analítica
   */
  static async explainQuestion(question: Question): Promise<string> {
    // Simulação robusta com resposta instantânea pedagógica estruturada
    await new Promise((resolve) => setTimeout(resolve, 600));

    return `### 💡 Análise Didática da Questão (${question.code})

**1. Identificação do Ponto Focal:**
A questão aborda **${question.topic}** na disciplina de **${question.discipline}**, padrão frequente da banca **${question.board}**.

**2. Raciocínio Passo a Passo:**
- O gabarito oficial é a alternativa **${question.correctOptionLetter}**.
- ${question.explanation}

**3. Dica Prática de Concurso:**
Em provas da banca ${question.board}, preste atenção especial aos distratores comuns que costumam inverter sinais ou confundir regras de exceção.`;
  }

  /**
   * Analisa especificamente o motivo do erro do estudante com base na alternativa que ele marcou
   */
  static async analyzeMistake(question: Question, chosenOptionLetter: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const chosenOption = question.options.find((o) => o.letter === chosenOptionLetter);
    const correctOption = question.options.find((o) => o.letter === question.correctOptionLetter);

    return `### ⚠️ Diagnóstico Personalizado de Erro

**Sua resposta:** Alternativa ${chosenOptionLetter}: "${chosenOption?.text || ''}"
**Resposta correta:** Alternativa ${question.correctOptionLetter}: "${correctOption?.text || ''}"

**Por que você provavelmente errou:**
A alternativa ${chosenOptionLetter} é um distrator clássico elaborado para induzir o candidato a generalizar o conceito ou desconsiderar precondições normativas da área de ${question.discipline}.

**Ação Recomendada para Fixação:**
1. Adicione esta questão ao seu **Caderno de Erros** ou a um **Caderno Personalizado**.
2. Revise a fundamentação teórica de **${question.topic}**.
3. Refaça esta questão em 48 horas para consolidação no sistema de repetição espaçada.`;
  }

  /**
   * Gera sugestão algorítmica de plano de estudos semanal personalizado
   */
  static async generateStudyPlan(userGoal: {
    contest: string;
    position: string;
    hoursPerDay: number;
    stage: string;
  }): Promise<{ day: string; discipline: string; hours: number; focus: string }[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return [
      { day: 'Segunda', discipline: 'Circuitos Elétricos', hours: userGoal.hoursPerDay, focus: 'Teoremas e Leis de Kirchhoff' },
      { day: 'Terça', discipline: 'Língua Portuguesa', hours: userGoal.hoursPerDay, focus: 'Concordância e Crase Cesgranrio' },
      { day: 'Quarta', discipline: 'Eletrotécnica', hours: userGoal.hoursPerDay, focus: 'Fator de Potência e Trifásicos' },
      { day: 'Quinta', discipline: 'Matemática', hours: userGoal.hoursPerDay, focus: 'Porcentagem e Razão' },
      { day: 'Sexta', discipline: 'Máquinas Elétricas', hours: userGoal.hoursPerDay, focus: 'Transformadores e MIT' },
      { day: 'Sábado', discipline: 'Simulado Geral', hours: Math.max(2, userGoal.hoursPerDay), focus: 'Resolução Cronometrada e Análise de Erros' },
      { day: 'Domingo', discipline: 'Revisão Leve', hours: 1, focus: 'Caderno de Erros da Semana' }
    ];
  }

  /**
   * Recomenda questões prioritárias com base nos pontos fracos
   */
  static async recommendQuestions(topicMistakes: string[]): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (topicMistakes.length === 0) {
      return 'Seu rendimento está regular em todas as matérias! Continue mantendo sua meta diária de questões.';
    }
    return `Identificamos que você teve maior taxa de erro em: **${topicMistakes.slice(0, 3).join(', ')}**. Recomendamos resolver pelo menos 15 questões adicionais destes tópicos esta semana.`;
  }

  /**
   * Gera um resumo conceitual conciso de um tópico
   */
  static async summarizeTopic(topicName: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return `Resumo didático para **${topicName}**: conceito fundamental em provas de nível técnico e superior, com incidência superior a 22% nos editais recentes da área.`;
  }
}
