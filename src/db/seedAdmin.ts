import { db } from './index.ts';
import {
  plans,
  subscriptions,
  paymentTransactions,
  systemSettings,
  systemAnnouncements,
  supportTickets,
  users,
  auditLogs,
  simulations,
  questions
} from './schema.ts';
import { eq, sql } from 'drizzle-orm';

export async function seedAdminModule() {
  console.log('Seeding Admin & Platform Management module...');

  try {
    // 1. Planos de Assinatura
    const defaultPlans = [
      {
        id: 'plan-free',
        name: 'Gratuito',
        code: 'GRATUITO',
        description: 'Ideal para iniciar os estudos e conhecer a plataforma.',
        price: '0.00',
        billingCycle: 'free',
        featuresJson: JSON.stringify([
          '15 questões resolvidas por dia',
          '5 consultas ao Assistente IA por dia',
          'Acesso a provas anteriores',
          'Estatísticas básicas de acertos'
        ]),
        dailyQuestionsLimit: 15,
        dailyAiQuota: 5,
        unlimitedSimulations: false,
        active: true
      },
      {
        id: 'plan-monthly',
        name: 'Premium Mensal',
        code: 'PREMIUM_MENSAL',
        description: 'Acesso completo com cobrança mensal flexível.',
        price: '39.90',
        billingCycle: 'monthly',
        featuresJson: JSON.stringify([
          'Questões ilimitadas sem restrições',
          'Simulados oficiais e rankings em tempo real',
          'Assistente IA pedagógico avançado',
          'Caderno de erros automático com diagnóstico',
          'Plano de estudos dinâmico adaptativo',
          'Filtros avançados e mapas de calor de domínio'
        ]),
        dailyQuestionsLimit: 9999,
        dailyAiQuota: 100,
        unlimitedSimulations: true,
        active: true
      },
      {
        id: 'plan-annual',
        name: 'Premium Anual',
        code: 'PREMIUM_ANUAL',
        description: 'Melhor custo-benefício para quem estuda a médio e longo prazo.',
        price: '349.00',
        billingCycle: 'yearly',
        featuresJson: JSON.stringify([
          'Tudo do Premium Mensal',
          'Economia de mais de 27%',
          'Simulados autorais comentados',
          'Resumos teóricos e mapas mentais em PDF',
          'Exportação de relatórios de desempenho',
          'Suporte prioritário pedagógico'
        ]),
        dailyQuestionsLimit: 9999,
        dailyAiQuota: 200,
        unlimitedSimulations: true,
        active: true
      },
      {
        id: 'plan-lifetime',
        name: 'Vitalício Concurseiro',
        code: 'VITALICIO',
        description: 'Acesso definitivo até a sua posse no concurso dos sonhos.',
        price: '799.00',
        billingCycle: 'lifetime',
        featuresJson: JSON.stringify([
          'Acesso vitalício sem renovação',
          'Todos os concursos atuais e futuros',
          'Cota máxima do Assistente IA',
          'Mentoria de planejamento de estudos com IA',
          'Acesso antecipado a novos recursos'
        ]),
        dailyQuestionsLimit: 9999,
        dailyAiQuota: 500,
        unlimitedSimulations: true,
        active: true
      }
    ];

    for (const p of defaultPlans) {
      await db.insert(plans).values(p).onConflictDoNothing();
    }

    // 2. Configurações Globais do Sistema (System Settings)
    const defaultSettings = [
      {
        key: 'free_tier_daily_questions_limit',
        value: '15',
        category: 'limits',
        description: 'Limite diário de questões para usuários no plano Gratuito'
      },
      {
        key: 'free_tier_daily_ai_prompts',
        value: '5',
        category: 'ai',
        description: 'Quantidade diária de interações com o assistente IA para plano Gratuito'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        category: 'system',
        description: 'Ativa tela de manutenção para todos os alunos não administradores'
      },
      {
        key: 'maintenance_message',
        value: 'Estamos realizando atualizações técnicas no banco de dados. Retornaremos em instantes.',
        category: 'system',
        description: 'Mensagem exibida aos usuários durante modo manutenção'
      },
      {
        key: 'allow_student_registration',
        value: 'true',
        category: 'system',
        description: 'Permite novos cadastros de estudantes na plataforma'
      },
      {
        key: 'system_notice_banner',
        value: 'Novo edital Transpetro 2026: questões e tópicos já atualizados no banco!',
        category: 'general',
        description: 'Aviso em destaque no topo do dashboard dos alunos'
      }
    ];

    for (const s of defaultSettings) {
      await db.insert(systemSettings).values(s).onConflictDoNothing();
    }

    // 3. Usuários com Perfis Administrativos e Estudantes (RBAC)
    const adminUsers = [
      {
        id: 'user-superadmin',
        uid: 'uid-superadmin',
        name: 'Roberto Valente (Super Admin)',
        email: 'superadmin@aprova.com',
        role: 'SUPERADMIN',
        plan: 'VITALICIO',
        status: 'ACTIVE',
        targetContest: 'Geral',
        targetPosition: 'Administração Geral',
        dailyGoal: 50,
        streakDays: 30,
        xp: 3500
      },
      {
        id: 'user-editor-01',
        uid: 'uid-editor-01',
        name: 'Profa. Mariana Salles (Editora)',
        email: 'editor@aprova.com',
        role: 'CONTENT_EDITOR',
        plan: 'PREMIUM_ANUAL',
        status: 'ACTIVE',
        targetContest: 'Transpetro',
        targetPosition: 'Técnico em Eletrotécnica',
        dailyGoal: 30,
        streakDays: 14,
        xp: 1800
      },
      {
        id: 'user-support-01',
        uid: 'uid-support-01',
        name: 'Lucas Ferreira (Suporte)',
        email: 'suporte@aprova.com',
        role: 'SUPPORT',
        plan: 'PREMIUM_MENSAL',
        status: 'ACTIVE',
        targetContest: 'Geral',
        targetPosition: 'Atendimento',
        dailyGoal: 20,
        streakDays: 10,
        xp: 950
      },
      {
        id: 'user-financial-01',
        uid: 'uid-financial-01',
        name: 'Juliana Costa (Financeiro)',
        email: 'financeiro@aprova.com',
        role: 'FINANCIAL',
        plan: 'PREMIUM_ANUAL',
        status: 'ACTIVE',
        targetContest: 'Geral',
        targetPosition: 'Controladoria',
        dailyGoal: 20,
        streakDays: 5,
        xp: 720
      },
      {
        id: 'user-student-carlos',
        uid: 'uid-student-carlos',
        name: 'Carlos Eduardo Nogueira',
        email: 'carlos.eletro@gmail.com',
        role: 'STUDENT',
        plan: 'PREMIUM_ANUAL',
        status: 'ACTIVE',
        targetContest: 'Transpetro',
        targetPosition: 'Técnico em Eletrotécnica',
        dailyGoal: 50,
        streakDays: 12,
        xp: 2150
      },
      {
        id: 'user-student-aline',
        uid: 'uid-student-aline',
        name: 'Aline Beatriz Mendonça',
        email: 'aline.mendonca@gmail.com',
        role: 'STUDENT',
        plan: 'GRATUITO',
        status: 'ACTIVE',
        targetContest: 'Transpetro',
        targetPosition: 'Técnico em Eletrotécnica',
        dailyGoal: 25,
        streakDays: 3,
        xp: 410
      },
      {
        id: 'user-student-marcos-blocked',
        uid: 'uid-student-marcos',
        name: 'Marcos Vinícius Prado',
        email: 'marcos.prado@exemplo.com',
        role: 'STUDENT',
        plan: 'GRATUITO',
        status: 'BLOCKED',
        blockedReason: 'Violação dos termos de uso: compartilhamento automatizado de credenciais.',
        targetContest: 'Transpetro',
        targetPosition: 'Técnico em Eletrotécnica',
        dailyGoal: 15,
        streakDays: 0,
        xp: 120
      }
    ];

    for (const u of adminUsers) {
      await db.insert(users).values(u).onConflictDoNothing();
    }

    // 4. Assinaturas (Subscriptions)
    const now = new Date();
    const subs = [
      {
        id: 'sub-bruno-01',
        userId: 'user-bruno-student',
        planId: 'plan-monthly',
        status: 'active',
        pricePaid: '39.90',
        billingCycle: 'monthly',
        startDate: new Date(now.getTime() - 25 * 86400000),
        endDate: new Date(now.getTime() + 5 * 86400000),
        autoRenew: true
      },
      {
        id: 'sub-carlos-01',
        userId: 'user-student-carlos',
        planId: 'plan-annual',
        status: 'active',
        pricePaid: '349.00',
        billingCycle: 'yearly',
        startDate: new Date(now.getTime() - 90 * 86400000),
        endDate: new Date(now.getTime() + 275 * 86400000),
        autoRenew: true
      },
      {
        id: 'sub-superadmin-01',
        userId: 'user-superadmin',
        planId: 'plan-lifetime',
        status: 'active',
        pricePaid: '799.00',
        billingCycle: 'lifetime',
        startDate: new Date(now.getTime() - 180 * 86400000),
        endDate: null,
        autoRenew: false
      }
    ];

    for (const sub of subs) {
      await db.insert(subscriptions).values(sub).onConflictDoNothing();
    }

    // 5. Transações Financeiras (Payment Transactions)
    const transactions = [
      {
        id: 'tx-001',
        userId: 'user-bruno-student',
        subscriptionId: 'sub-bruno-01',
        planName: 'Premium Mensal',
        amount: '39.90',
        paymentMethod: 'PIX',
        status: 'paid',
        transactionCode: 'PIX-BRU-8492048',
        paidAt: new Date(now.getTime() - 25 * 86400000)
      },
      {
        id: 'tx-002',
        userId: 'user-student-carlos',
        subscriptionId: 'sub-carlos-01',
        planName: 'Premium Anual',
        amount: '349.00',
        paymentMethod: 'CREDIT_CARD',
        status: 'paid',
        transactionCode: 'CC-CAR-1938472',
        paidAt: new Date(now.getTime() - 90 * 86400000)
      },
      {
        id: 'tx-003',
        userId: 'user-superadmin',
        subscriptionId: 'sub-superadmin-01',
        planName: 'Vitalício Concurseiro',
        amount: '799.00',
        paymentMethod: 'PIX',
        status: 'paid',
        transactionCode: 'PIX-SUP-9920145',
        paidAt: new Date(now.getTime() - 180 * 86400000)
      }
    ];

    for (const tx of transactions) {
      await db.insert(paymentTransactions).values(tx).onConflictDoNothing();
    }

    // 6. Comunicados da Plataforma (System Announcements)
    const announcements = [
      {
        id: 'ann-01',
        title: 'Atualização do Conteúdo Programático — Transpetro 2026',
        message: 'Incluímos 45 novas questões inéditas comentadas sobre NR-10 e Sistemas Elétricos de Potência.',
        type: 'info',
        targetAudience: 'all',
        isPublished: true,
        createdByUserId: 'user-editor-01'
      },
      {
        id: 'ann-02',
        title: 'Novo recurso: Gerador de Simulados Autorais',
        message: 'Agora você pode gerar simulados personalizados filtrando por tempo de prova e peso de disciplinas.',
        type: 'success',
        targetAudience: 'premium',
        isPublished: true,
        createdByUserId: 'user-superadmin'
      }
    ];

    for (const ann of announcements) {
      await db.insert(systemAnnouncements).values(ann).onConflictDoNothing();
    }

    // 7. Chamados de Suporte (Support Tickets)
    const tickets = [
      {
        id: 'ticket-01',
        userId: 'user-bruno-student',
        subject: 'Dúvida na fundamentação da questão Q-1002 (Teorema de Thévenin)',
        category: 'erro_questao',
        priority: 'medium',
        status: 'resolved',
        message: 'Na questão Q-1002, a resistência equivalente foi calculada como 10 Ohms, mas gostaria de confirmar se a fonte de tensão foi curto-circuitada.',
        adminReply: 'Olá Bruno! A fonte de tensão independente foi curto-circuitada conforme o teorema de Thévenin padrão. O comentário do professor foi atualizado com o diagrama passo a passo.',
        assignedToUserId: 'user-editor-01',
        resolvedAt: new Date(now.getTime() - 2 * 86400000)
      },
      {
        id: 'ticket-02',
        userId: 'user-student-aline',
        subject: 'Como funciona a renovação do plano Premium?',
        category: 'financeiro',
        priority: 'low',
        status: 'in_analysis',
        message: 'Gostaria de saber se o pagamento por PIX possui renovação automática ou se preciso pagar a chave todo mês.',
        adminReply: 'Olá Aline, o pagamento via PIX é pontual e você só renova se desejar!',
        assignedToUserId: 'user-support-01'
      },
      {
        id: 'ticket-03',
        userId: 'user-student-carlos',
        subject: 'Sugestão: Adicionar atalhos de teclado nas questões (1 a 5)',
        category: 'sugestao',
        priority: 'medium',
        status: 'pending',
        message: 'Seria muito produtivo poder responder alternativas A-E usando as teclas 1 a 5 ou A a E durante a resolução rápida.',
        assignedToUserId: 'user-support-01'
      }
    ];

    for (const t of tickets) {
      await db.insert(supportTickets).values(t).onConflictDoNothing();
    }

    // 8. Trilha de Auditoria Inicial (Audit Logs)
    const initialLogs = [
      {
        userId: 'user-superadmin',
        action: 'CREATE',
        entity: 'plans',
        recordId: 'plan-monthly',
        newValue: 'Plano Premium Mensal ativado com valor R$ 39,90',
        ipAddress: '177.136.240.10'
      },
      {
        userId: 'user-editor-01',
        action: 'UPDATE',
        entity: 'questions',
        recordId: 'Q-1002',
        previousValue: 'Gabarito preliminar sem comentário detalhado',
        newValue: 'Adicionada resolução justificada com cálculo passo a passo',
        ipAddress: '189.40.112.55'
      },
      {
        userId: 'user-superadmin',
        action: 'UPDATE',
        entity: 'users',
        recordId: 'user-student-marcos-blocked',
        previousValue: 'Status: ACTIVE',
        newValue: 'Status: BLOCKED | Motivo: Violação dos termos de uso',
        ipAddress: '177.136.240.10'
      }
    ];

    for (const l of initialLogs) {
      await db.insert(auditLogs).values(l).onConflictDoNothing();
    }

    // 9. Garantir que exista um Simulado Oficial da plataforma cadastrado
    const officialSim = {
      id: 'sim-oficial-transpetro-2024',
      title: 'Simulado Nacional APROVA+ — Transpetro 2024 (Eletrotécnica)',
      description: 'Prova completa com 50 questões no padrão CESGRANRIO com nota de corte e ranking geral.',
      totalQuestions: 50,
      timeLimitMinutes: 240,
      isOfficial: true,
      distributionConfig: JSON.stringify({
        'Língua Portuguesa': 10,
        'Matemática e Raciocínio Lógico': 10,
        'Circuitos Elétricos': 15,
        'Máquinas Elétricas': 10,
        'Instalações Elétricas e Segurança': 5
      }),
      createdByUserId: 'user-superadmin'
    };
    await db.insert(simulations).values(officialSim).onConflictDoNothing();

    console.log('Admin Module seeded successfully.');
  } catch (err) {
    console.error('Error seeding Admin module:', err);
  }
}
