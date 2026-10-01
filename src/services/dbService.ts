import {
  User,
  Question,
  QuestionAnswerRecord,
  MistakeRecord,
  FavoriteRecord,
  StudyPlanSession,
  ReviewItem,
  SimulationSession,
  SimulationConfig,
  Achievement,
  RankingUser,
  NotificationItem,
  PerformanceStats,
  QuestionComment,
  Organization,
  ExamContest,
  CareerPosition,
  ExamBoard,
  TaxonomyDiscipline,
  TaxonomySubject,
  TaxonomyTopic,
  Notebook,
  GlobalSearchResult
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEADERBOARD,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMMENTS_MAP,
  INITIAL_ORGANIZATIONS,
  INITIAL_CONTESTS,
  INITIAL_POSITIONS,
  INITIAL_BOARDS,
  INITIAL_TAXONOMY_DISCIPLINES,
  INITIAL_TAXONOMY_SUBJECTS,
  INITIAL_TAXONOMY_TOPICS,
  INITIAL_NOTEBOOKS,
  INITIAL_SPHERES,
  INITIAL_POWERS
} from '../database/seedData';

const STORAGE_KEYS = {
  USERS: 'aprova_plus_users',
  CURRENT_USER_ID: 'aprova_plus_current_user_id',
  QUESTIONS: 'aprova_plus_questions',
  ANSWERS: 'aprova_plus_answers',
  MISTAKES: 'aprova_plus_mistakes',
  FAVORITES: 'aprova_plus_favorites',
  STUDY_PLAN: 'aprova_plus_study_plan',
  REVIEWS: 'aprova_plus_reviews',
  SIMULATIONS: 'aprova_plus_simulations',
  ACTIVE_SIMULATION: 'aprova_plus_active_simulation',
  ACHIEVEMENTS: 'aprova_plus_achievements',
  COMMENTS: 'aprova_plus_comments',
  NOTIFICATIONS: 'aprova_plus_notifications',
  LEADERBOARD: 'aprova_plus_leaderboard',
  NOTEBOOKS: 'aprova_plus_notebooks',
  ORGANIZATIONS: 'aprova_plus_organizations',
  CONTESTS: 'aprova_plus_contests',
  POSITIONS: 'aprova_plus_positions',
  BOARDS: 'aprova_plus_boards',
  TAXONOMY_DISCIPLINES: 'aprova_plus_taxonomy_disciplines',
  TAXONOMY_SUBJECTS: 'aprova_plus_taxonomy_subjects',
  TAXONOMY_TOPICS: 'aprova_plus_taxonomy_topics',
};

// Default seed users
const DEFAULT_STUDENT: User = {
  id: 'user-student-demo',
  name: 'Bruno',
  email: 'brunobhro.26@gmail.com',
  role: 'STUDENT',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  targetContest: 'Transpetro',
  targetPosition: 'Técnico em Eletrotécnica',
  dailyGoal: 40,
  studyHoursPerDay: 3,
  studyDaysPerWeek: 5,
  prioritySubjects: ['Eletrotécnica', 'Circuitos Elétricos', 'Máquinas Elétricas', 'Língua Portuguesa'],
  levelStage: 'Intermediário',
  xp: 840,
  streakDays: 4,
  lastStudyDate: new Date().toISOString().split('T')[0],
  subscription: {
    tier: 'PREMIUM_MENSAL',
    status: 'ACTIVE',
    expiresAt: '2026-12-31'
  },
  privacyHideNameInRanking: false,
  createdAt: '2026-08-10'
};

const DEFAULT_ADMIN: User = {
  id: 'user-admin-demo',
  name: 'Administrador APROVA+',
  email: 'admin@aprova.com',
  role: 'ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  targetContest: 'Transpetro',
  targetPosition: 'Coordenação Pedagógica',
  dailyGoal: 50,
  xp: 3200,
  streakDays: 15,
  subscription: {
    tier: 'PREMIUM_ANUAL',
    status: 'ACTIVE',
  },
  privacyHideNameInRanking: false,
  createdAt: '2026-01-01'
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading from storage: ${key}`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to storage: ${key}`, err);
  }
}

export class DBService {
  // Init database on start
  static init() {
    let users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    let updatedUsers = false;
    if (users.length === 0) {
      users = [DEFAULT_STUDENT, DEFAULT_ADMIN];
      setStorage(STORAGE_KEYS.USERS, users);
    } else {
      users = users.map((u) => {
        if (u.id === 'user-student-demo' && (u.name.includes('Lucas') || u.email === 'aluno@aprova.com')) {
          updatedUsers = true;
          return { ...u, name: 'Bruno', email: 'brunobhro.26@gmail.com' };
        }
        return u;
      });
      if (updatedUsers) {
        setStorage(STORAGE_KEYS.USERS, users);
      }
    }
    if (!getStorage<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null)) {
      setStorage(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_STUDENT.id);
    }
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    if (questions.length === 0) {
      setStorage(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    }
    const achievements = getStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
    if (achievements.length === 0) {
      setStorage(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
    }
    const comments = getStorage<Record<string, QuestionComment[]>>(STORAGE_KEYS.COMMENTS, {});
    if (Object.keys(comments).length === 0) {
      setStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS_MAP);
    }
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (notifications.length === 0) {
      setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    const plan = getStorage<StudyPlanSession[]>(STORAGE_KEYS.STUDY_PLAN, []);
    if (plan.length === 0) {
      this.generateDefaultStudyPlan(DEFAULT_STUDENT.id);
    }
    const reviews = getStorage<ReviewItem[]>(STORAGE_KEYS.REVIEWS, []);
    if (reviews.length === 0) {
      setStorage(STORAGE_KEYS.REVIEWS, [
        {
          id: 'rev-1',
          discipline: 'Circuitos Elétricos',
          topic: 'Teorema de Thévenin e Norton',
          reason: 'Baixo rendimento recente (38% de acerto)',
          status: 'HOJE',
          dueDate: new Date().toISOString().split('T')[0],
          questionIds: ['q-circ-01', 'q-circ-02']
        },
        {
          id: 'rev-2',
          discipline: 'Eletrotécnica',
          topic: 'Correção de Fator de Potência',
          reason: 'Revisão espaçada recomendada (Ciclo de 7 dias)',
          status: 'PENDENTE',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          questionIds: ['q-ele-01']
        }
      ]);
    }
    // Notebooks initialization
    const notebooks = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, []);
    if (notebooks.length === 0) {
      setStorage(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    }
    // Organizations initialization
    const organizations = getStorage<Organization[]>(STORAGE_KEYS.ORGANIZATIONS, []);
    if (organizations.length === 0) {
      setStorage(STORAGE_KEYS.ORGANIZATIONS, INITIAL_ORGANIZATIONS);
    }
    // Contests initialization
    const contests = getStorage<ExamContest[]>(STORAGE_KEYS.CONTESTS, []);
    if (contests.length === 0) {
      setStorage(STORAGE_KEYS.CONTESTS, INITIAL_CONTESTS);
    }
    // Positions initialization
    const positions = getStorage<CareerPosition[]>(STORAGE_KEYS.POSITIONS, []);
    if (positions.length === 0) {
      setStorage(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS);
    }
    // Boards initialization
    const boards = getStorage<ExamBoard[]>(STORAGE_KEYS.BOARDS, []);
    if (boards.length === 0) {
      setStorage(STORAGE_KEYS.BOARDS, INITIAL_BOARDS);
    }
    // Taxonomy Disciplines, Subjects, Topics
    const taxDisciplines = getStorage<TaxonomyDiscipline[]>(STORAGE_KEYS.TAXONOMY_DISCIPLINES, []);
    if (taxDisciplines.length === 0) {
      setStorage(STORAGE_KEYS.TAXONOMY_DISCIPLINES, INITIAL_TAXONOMY_DISCIPLINES);
    }
    const taxSubjects = getStorage<TaxonomySubject[]>(STORAGE_KEYS.TAXONOMY_SUBJECTS, []);
    if (taxSubjects.length === 0) {
      setStorage(STORAGE_KEYS.TAXONOMY_SUBJECTS, INITIAL_TAXONOMY_SUBJECTS);
    }
    const taxTopics = getStorage<TaxonomyTopic[]>(STORAGE_KEYS.TAXONOMY_TOPICS, []);
    if (taxTopics.length === 0) {
      setStorage(STORAGE_KEYS.TAXONOMY_TOPICS, INITIAL_TAXONOMY_TOPICS);
    }
  }

  // Auth & User methods
  static getCurrentUser(): User {
    this.init();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, [DEFAULT_STUDENT]);
    const currentId = getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_STUDENT.id);
    const user = users.find((u) => u.id === currentId);
    return user || DEFAULT_STUDENT;
  }

  static setCurrentUser(userId: string): void {
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static updateUser(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx >= 0) {
      users[idx] = updated;
    } else {
      users.push(updated);
    }
    setStorage(STORAGE_KEYS.USERS, users);
    return updated;
  }

  static registerUser(payload: {
    name: string;
    email: string;
    targetContest: string;
    targetPosition?: string;
  }): User {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: payload.name,
      email: payload.email,
      role: 'STUDENT',
      targetContest: payload.targetContest || 'Transpetro',
      targetPosition: payload.targetPosition || 'Técnico em Eletrotécnica',
      dailyGoal: 40,
      xp: 50,
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      subscription: {
        tier: 'GRATUITO',
        status: 'ACTIVE'
      },
      privacyHideNameInRanking: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    this.generateDefaultStudyPlan(newUser.id);
    return newUser;
  }

  static login(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, [DEFAULT_STUDENT, DEFAULT_ADMIN]);
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        ((normalized === 'aluno@aprova.com' || normalized === 'brunobhro.26@gmail.com') && u.id === 'user-student-demo')
    );
    if (user) {
      setStorage(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      return user;
    }
    return null;
  }

  // Questions query
  static getQuestions(): Question[] {
    return getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  }

  static getQuestionById(id: string): Question | undefined {
    const questions = this.getQuestions();
    return questions.find((q) => q.id === id);
  }

  static getAnswersForUser(userId: string): QuestionAnswerRecord[] {
    const all = getStorage<QuestionAnswerRecord[]>(STORAGE_KEYS.ANSWERS, []);
    return all.filter((a) => a.userId === userId);
  }

  static getMistakesForUser(userId: string): MistakeRecord[] {
    const all = getStorage<MistakeRecord[]>(STORAGE_KEYS.MISTAKES, []);
    return all.filter((m) => m.userId === userId && !m.resolved);
  }

  static getFavoritesForUser(userId: string): FavoriteRecord[] {
    const all = getStorage<FavoriteRecord[]>(STORAGE_KEYS.FAVORITES, []);
    return all.filter((f) => f.userId === userId);
  }

  static isQuestionFavorite(userId: string, questionId: string): boolean {
    const favorites = this.getFavoritesForUser(userId);
    return favorites.some((f) => f.questionId === questionId);
  }

  static toggleFavorite(userId: string, questionId: string, notes?: string): boolean {
    const all = getStorage<FavoriteRecord[]>(STORAGE_KEYS.FAVORITES, []);
    const existingIndex = all.findIndex((f) => f.userId === userId && f.questionId === questionId);
    let isFav = false;
    if (existingIndex >= 0) {
      all.splice(existingIndex, 1);
      isFav = false;
    } else {
      all.push({
        id: 'fav-' + Date.now(),
        userId,
        questionId,
        savedAt: new Date().toISOString(),
        notes
      });
      isFav = true;
    }
    setStorage(STORAGE_KEYS.FAVORITES, all);
    return isFav;
  }

  // Answer a question
  static recordAnswer(
    userId: string,
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D' | 'E',
    simulationId?: string
  ): { isCorrect: boolean; xpEarned: number; newTotalXp: number; levelUp: boolean } {
    const question = this.getQuestionById(questionId);
    if (!question) throw new Error('Questão não encontrada');

    const isCorrect = question.correctOptionLetter === selectedOption;
    const allAnswers = getStorage<QuestionAnswerRecord[]>(STORAGE_KEYS.ANSWERS, []);

    const newRecord: QuestionAnswerRecord = {
      id: 'ans-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      questionId,
      selectedOption,
      isCorrect,
      answeredAt: new Date().toISOString(),
      simulationId
    };
    allAnswers.push(newRecord);
    setStorage(STORAGE_KEYS.ANSWERS, allAnswers);

    // Update mistakes notebook
    const mistakes = getStorage<MistakeRecord[]>(STORAGE_KEYS.MISTAKES, []);
    const existingMistakeIndex = mistakes.findIndex(
      (m) => m.userId === userId && m.questionId === questionId
    );

    if (!isCorrect) {
      if (existingMistakeIndex >= 0) {
        mistakes[existingMistakeIndex].failedCount += 1;
        mistakes[existingMistakeIndex].lastFailedDate = new Date().toISOString();
        mistakes[existingMistakeIndex].resolved = false;
      } else {
        mistakes.push({
          id: 'mistake-' + Date.now(),
          userId,
          questionId,
          failedCount: 1,
          lastFailedDate: new Date().toISOString(),
          resolved: false
        });
      }
      setStorage(STORAGE_KEYS.MISTAKES, mistakes);
    } else if (existingMistakeIndex >= 0) {
      // If answered correctly in mistake mode, mark as resolved
      mistakes[existingMistakeIndex].resolved = true;
      setStorage(STORAGE_KEYS.MISTAKES, mistakes);
    }

    // Award XP
    const user = this.getCurrentUser();
    const oldLevel = this.getLevelFromXp(user.xp);
    const xpGained = isCorrect ? 10 : 2; // +10 for correct, +2 for effort
    const newXp = user.xp + xpGained;

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streakDays;
    if (user.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (!user.lastStudyDate) {
        newStreak = 1;
      }
    }

    this.updateUser({
      xp: newXp,
      streakDays: newStreak,
      lastStudyDate: today
    });

    const newLevel = this.getLevelFromXp(newXp);
    const levelUp = newLevel.name !== oldLevel.name;

    this.checkAchievements(userId);

    return {
      isCorrect,
      xpEarned: xpGained,
      newTotalXp: newXp,
      levelUp
    };
  }

  // Remove mistake record manually
  static removeMistake(userId: string, questionId: string) {
    const mistakes = getStorage<MistakeRecord[]>(STORAGE_KEYS.MISTAKES, []);
    const filtered = mistakes.filter((m) => !(m.userId === userId && m.questionId === questionId));
    setStorage(STORAGE_KEYS.MISTAKES, filtered);
  }

  // Comments
  static getCommentsForQuestion(questionId: string): QuestionComment[] {
    const all = getStorage<Record<string, QuestionComment[]>>(STORAGE_KEYS.COMMENTS, {});
    return all[questionId] || [];
  }

  static addComment(questionId: string, content: string, user: User): QuestionComment {
    const all = getStorage<Record<string, QuestionComment[]>>(STORAGE_KEYS.COMMENTS, {});
    const list = all[questionId] || [];
    const newComment: QuestionComment = {
      id: 'comm-' + Date.now(),
      questionId,
      userName: user.name,
      userRole: user.role === 'ADMIN' ? 'Professor Oficial' : 'Estudante',
      userBadge: user.role === 'ADMIN' ? 'Equipe APROVA+' : this.getLevelFromXp(user.xp).name,
      content,
      createdAt: 'Agora mesmo',
      likes: 0,
      isOfficial: user.role === 'ADMIN'
    };
    list.unshift(newComment);
    all[questionId] = list;
    setStorage(STORAGE_KEYS.COMMENTS, all);
    return newComment;
  }

  static likeComment(questionId: string, commentId: string): void {
    const all = getStorage<Record<string, QuestionComment[]>>(STORAGE_KEYS.COMMENTS, {});
    const list = all[questionId] || [];
    const comment = list.find((c) => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      setStorage(STORAGE_KEYS.COMMENTS, all);
    }
  }

  // Gamification & Levels
  static getLevelFromXp(xp: number): {
    name: string;
    levelNumber: number;
    currentMin: number;
    nextMax: number;
    progressPercentage: number;
  } {
    if (xp < 300) {
      return {
        name: 'Nível 1 — Iniciante',
        levelNumber: 1,
        currentMin: 0,
        nextMax: 300,
        progressPercentage: Math.min(100, Math.round((xp / 300) * 100))
      };
    }
    if (xp < 900) {
      return {
        name: 'Nível 2 — Estudante',
        levelNumber: 2,
        currentMin: 300,
        nextMax: 900,
        progressPercentage: Math.min(100, Math.round(((xp - 300) / 600) * 100))
      };
    }
    if (xp < 2000) {
      return {
        name: 'Nível 3 — Preparado',
        levelNumber: 3,
        currentMin: 900,
        nextMax: 2000,
        progressPercentage: Math.min(100, Math.round(((xp - 900) / 1100) * 100))
      };
    }
    if (xp < 4000) {
      return {
        name: 'Nível 4 — Avançado',
        levelNumber: 4,
        currentMin: 2000,
        nextMax: 4000,
        progressPercentage: Math.min(100, Math.round(((xp - 2000) / 2000) * 100))
      };
    }
    return {
      name: 'Nível 5 — Especialista',
      levelNumber: 5,
      currentMin: 4000,
      nextMax: 8000,
      progressPercentage: Math.min(100, Math.round(((xp - 4000) / 4000) * 100))
    };
  }

  static getAchievements(userId: string): Achievement[] {
    const list = getStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
    const answers = this.getAnswersForUser(userId);
    const user = this.getCurrentUser();
    const simulations = this.getSimulations(userId);
    const solvedCount = answers.length;

    return list.map((ach) => {
      let isUnlocked = false;
      if (ach.category === 'questoes' && solvedCount >= ach.requirement) isUnlocked = true;
      if (ach.category === 'dias' && user.streakDays >= ach.requirement) isUnlocked = true;
      if (ach.category === 'simulados' && simulations.filter((s) => s.isFinished).length >= ach.requirement) {
        isUnlocked = true;
      }
      return {
        ...ach,
        unlockedAt: isUnlocked ? 'Desbloqueado' : undefined
      };
    });
  }

  static checkAchievements(userId: string): void {
    // updates unlock state
    const achs = this.getAchievements(userId);
    setStorage(STORAGE_KEYS.ACHIEVEMENTS, achs);
  }

  static getLeaderboard(
    type: 'geral' | 'semanal' | 'mensal' | 'concurso' = 'geral',
    contestFilter?: string
  ): RankingUser[] {
    const currentUser = this.getCurrentUser();
    const baseList = [...INITIAL_LEADERBOARD];

    const currentInBoard: RankingUser = {
      id: currentUser.id,
      name: currentUser.privacyHideNameInRanking ? 'Estudante Anônimo' : currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      xp: currentUser.xp,
      level: this.getLevelFromXp(currentUser.xp).name,
      questionsSolved: this.getAnswersForUser(currentUser.id).length + 32,
      accuracyRate: 74.2,
      targetContest: currentUser.targetContest || 'Transpetro',
      position: 0,
      isCurrentUser: true
    };

    let fullList = [...baseList, currentInBoard];

    if (type === 'concurso' && contestFilter) {
      fullList = fullList.filter(
        (u) => u.targetContest.toLowerCase() === contestFilter.toLowerCase()
      );
    }

    // Sort by XP descending
    fullList.sort((a, b) => b.xp - a.xp);
    return fullList.map((user, idx) => ({
      ...user,
      position: idx + 1
    }));
  }

  // Simulations
  static createSimulation(userId: string, config: SimulationConfig): SimulationSession {
    const allQuestions = this.getQuestions();
    let filtered = allQuestions;

    if (config.disciplines && config.disciplines.length > 0) {
      filtered = filtered.filter((q) => config.disciplines.includes(q.discipline));
    }
    if (config.difficulty && config.difficulty !== 'Todas') {
      filtered = filtered.filter((q) => q.difficulty === config.difficulty);
    }

    // If not enough questions, repeat or pad
    let selectedIds: string[] = [];
    const pool = [...filtered];
    for (let i = 0; i < config.questionCount; i++) {
      if (pool.length === 0) {
        pool.push(...filtered);
      }
      const randIdx = Math.floor(Math.random() * pool.length);
      selectedIds.push(pool[randIdx].id);
      pool.splice(randIdx, 1);
    }

    const newSim: SimulationSession = {
      id: 'sim-' + Date.now(),
      userId,
      config,
      questionIds: selectedIds,
      answers: {},
      flaggedQuestionIds: [],
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      isFinished: false
    };

    setStorage(STORAGE_KEYS.ACTIVE_SIMULATION, newSim);
    return newSim;
  }

  static getActiveSimulation(): SimulationSession | null {
    return getStorage<SimulationSession | null>(STORAGE_KEYS.ACTIVE_SIMULATION, null);
  }

  static saveSimulationProgress(simulation: SimulationSession): void {
    setStorage(STORAGE_KEYS.ACTIVE_SIMULATION, simulation);
  }

  static finishSimulation(simulationId: string): SimulationSession | null {
    const sim = this.getActiveSimulation();
    if (!sim || sim.id !== simulationId) return null;

    const allQuestions = this.getQuestions();
    let correctCount = 0;

    sim.questionIds.forEach((qId) => {
      const q = allQuestions.find((item) => item.id === qId);
      const chosen = sim.answers[qId];
      if (q && chosen && chosen === q.correctOptionLetter) {
        correctCount += 1;
      }
    });

    sim.isFinished = true;
    sim.finishedAt = new Date().toISOString();
    sim.score = correctCount;
    sim.percentage = Math.round((correctCount / sim.questionIds.length) * 100);

    // Save to historical simulations
    const history = getStorage<SimulationSession[]>(STORAGE_KEYS.SIMULATIONS, []);
    history.unshift(sim);
    setStorage(STORAGE_KEYS.SIMULATIONS, history);

    // Clear active
    setStorage(STORAGE_KEYS.ACTIVE_SIMULATION, null);

    // Award +100 XP for simulation completion
    const user = this.getCurrentUser();
    this.updateUser({
      xp: user.xp + 100
    });

    return sim;
  }

  static getSimulations(userId: string): SimulationSession[] {
    const list = getStorage<SimulationSession[]>(STORAGE_KEYS.SIMULATIONS, []);
    return list.filter((s) => s.userId === userId);
  }

  // Study Plan
  static generateDefaultStudyPlan(userId: string): StudyPlanSession[] {
    const plan: StudyPlanSession[] = [
      {
        id: 'plan-1',
        dayOfWeek: 'Segunda',
        discipline: 'Língua Portuguesa',
        topic: 'Concordância e Crase',
        hoursAllocated: 1.5,
        completed: true
      },
      {
        id: 'plan-2',
        dayOfWeek: 'Segunda',
        discipline: 'Matemática',
        topic: 'Razão, Proporção e Regra de Três',
        hoursAllocated: 1.5,
        completed: false
      },
      {
        id: 'plan-3',
        dayOfWeek: 'Terça',
        discipline: 'Física',
        topic: 'Eletromagnetismo e Indução',
        hoursAllocated: 1.5,
        completed: false
      },
      {
        id: 'plan-4',
        dayOfWeek: 'Terça',
        discipline: 'Circuitos Elétricos',
        topic: 'Teorema de Thévenin e Norton',
        hoursAllocated: 2.0,
        completed: false
      },
      {
        id: 'plan-5',
        dayOfWeek: 'Quarta',
        discipline: 'Eletrotécnica',
        topic: 'Fator de Potência e Potência Trifásica',
        hoursAllocated: 2.0,
        completed: false
      },
      {
        id: 'plan-6',
        dayOfWeek: 'Quinta',
        discipline: 'Máquinas Elétricas',
        topic: 'Motores de Indução Trifásicos (MIT)',
        hoursAllocated: 2.0,
        completed: false
      },
      {
        id: 'plan-7',
        dayOfWeek: 'Sexta',
        discipline: 'Instalações Elétricas',
        topic: 'NBR 5410 e Esquemas de Aterramento',
        hoursAllocated: 1.5,
        completed: false
      },
      {
        id: 'plan-8',
        dayOfWeek: 'Sexta',
        discipline: 'Segurança do Trabalho',
        topic: 'NR-10 e NR-33',
        hoursAllocated: 1.5,
        completed: false
      },
      {
        id: 'plan-9',
        dayOfWeek: 'Sábado',
        discipline: 'Simulados e Revisões',
        topic: 'Simulado Geral Semanal (50 Questões)',
        hoursAllocated: 3.0,
        completed: false
      }
    ];
    setStorage(STORAGE_KEYS.STUDY_PLAN, plan);
    return plan;
  }

  static getStudyPlan(userId?: string): StudyPlanSession[] {
    return getStorage<StudyPlanSession[]>(STORAGE_KEYS.STUDY_PLAN, []);
  }

  static toggleStudyPlanSession(sessionId: string): void {
    const list = getStorage<StudyPlanSession[]>(STORAGE_KEYS.STUDY_PLAN, []);
    const item = list.find((s) => s.id === sessionId);
    if (item) {
      item.completed = !item.completed;
      setStorage(STORAGE_KEYS.STUDY_PLAN, list);
    }
  }

  static addStudyPlanSession(session: Omit<StudyPlanSession, 'id'>): void {
    const list = getStorage<StudyPlanSession[]>(STORAGE_KEYS.STUDY_PLAN, []);
    list.push({
      ...session,
      id: 'session-' + Date.now()
    });
    setStorage(STORAGE_KEYS.STUDY_PLAN, list);
  }

  static removeStudyPlanSession(sessionId: string): void {
    const list = getStorage<StudyPlanSession[]>(STORAGE_KEYS.STUDY_PLAN, []);
    setStorage(
      STORAGE_KEYS.STUDY_PLAN,
      list.filter((s) => s.id !== sessionId)
    );
  }

  // Reviews
  static getReviews(): ReviewItem[] {
    return getStorage<ReviewItem[]>(STORAGE_KEYS.REVIEWS, []);
  }

  static completeReview(reviewId: string): void {
    const list = getStorage<ReviewItem[]>(STORAGE_KEYS.REVIEWS, []);
    const item = list.find((r) => r.id === reviewId);
    if (item) {
      item.status = 'CONCLUÍDA';
      setStorage(STORAGE_KEYS.REVIEWS, list);
      // Award +20 XP
      const user = this.getCurrentUser();
      this.updateUser({ xp: user.xp + 20 });
    }
  }

  // Performance Stats Calculation
  static getPerformanceStats(userId: string): PerformanceStats {
    const answers = this.getAnswersForUser(userId);
    const questions = this.getQuestions();
    const user = this.getCurrentUser();
    const simulations = this.getSimulations(userId);

    const totalAnswered = answers.length;
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;
    const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // Today's answered
    const today = new Date().toISOString().split('T')[0];
    const todayAnswers = answers.filter((a) => a.answeredAt.startsWith(today));

    // Group by discipline
    const discMap: Record<string, { answered: number; correct: number }> = {};
    answers.forEach((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q) {
        if (!discMap[q.discipline]) {
          discMap[q.discipline] = { answered: 0, correct: 0 };
        }
        discMap[q.discipline].answered += 1;
        if (ans.isCorrect) {
          discMap[q.discipline].correct += 1;
        }
      }
    });

    const accuracyByDiscipline = Object.keys(discMap).map((discipline) => {
      const item = discMap[discipline];
      return {
        discipline,
        answered: item.answered,
        correct: item.correct,
        percentage: Math.round((item.correct / item.answered) * 100)
      };
    });

    // If answers list is small, provide default realistic discipline numbers for demonstration
    if (accuracyByDiscipline.length === 0) {
      accuracyByDiscipline.push(
        { discipline: 'Língua Portuguesa', answered: 42, correct: 33, percentage: 78 },
        { discipline: 'Matemática', answered: 35, correct: 22, percentage: 64 },
        { discipline: 'Física', answered: 28, correct: 20, percentage: 72 },
        { discipline: 'Eletricidade', answered: 45, correct: 36, percentage: 81 },
        { discipline: 'Circuitos Elétricos', answered: 38, correct: 26, percentage: 68 },
        { discipline: 'Máquinas Elétricas', answered: 30, correct: 22, percentage: 73 },
        { discipline: 'Instalações Elétricas', answered: 25, correct: 19, percentage: 76 },
        { discipline: 'Segurança do Trabalho', answered: 32, correct: 28, percentage: 87 }
      );
    }

    // Historical 7-day evolution
    const historyDays = [
      { date: 'Segunda', dayLabel: 'Seg', questionsCount: 35, accuracy: 68 },
      { date: 'Terça', dayLabel: 'Ter', questionsCount: 42, accuracy: 71 },
      { date: 'Quarta', dayLabel: 'Qua', questionsCount: 38, accuracy: 74 },
      { date: 'Quinta', dayLabel: 'Qui', questionsCount: 45, accuracy: 76 },
      { date: 'Sexta', dayLabel: 'Sex', questionsCount: 29, accuracy: 72 },
      { date: 'Sábado', dayLabel: 'Sáb', questionsCount: 52, accuracy: 80 },
      { date: 'Domingo', dayLabel: 'Dom', questionsCount: todayAnswers.length || 32, accuracy: 75 }
    ];

    return {
      totalAnswered: totalAnswered + 243, // Seeded base for demo realism
      totalCorrect: totalCorrect + 182,
      totalWrong: totalWrong + 61,
      accuracyRate: Math.round(((totalCorrect + 182) / (totalAnswered + 243)) * 100),
      studyTimeMinutes: 840, // 14 hours
      averageTimePerQuestionSeconds: 58,
      streakDays: user.streakDays,
      simulationsCompleted: simulations.filter((s) => s.isFinished).length + 3,
      todayQuestionsAnswered: todayAnswers.length > 0 ? todayAnswers.length : 32,
      dailyGoal: user.dailyGoal || 40,
      accuracyByDiscipline,
      historyDays
    };
  }

  // Subscription upgrade
  static upgradeSubscription(userId: string, tier: 'MENSAL' | 'SEMESTRAL' | 'ANUAL' | string): void {
    const tierMap: Record<string, any> = {
      MENSAL: 'PREMIUM_MENSAL',
      SEMESTRAL: 'PREMIUM_SEMESTRAL',
      ANUAL: 'PREMIUM_ANUAL'
    };
    this.updateUser({
      subscription: {
        tier: tierMap[tier] || 'PREMIUM_MENSAL',
        status: 'ACTIVE',
        expiresAt: '2027-12-31'
      }
    });
  }

  // Simulations for user
  static getSimulationsForUser(userId: string): any[] {
    const stored = getStorage<any[]>(`aprova_plus_sim_results_${userId}`, []);
    if (stored.length === 0) {
      return [
        {
          id: 'sim-seed-1',
          title: 'Simulado Diagnóstico — Transpetro Eletrotécnica',
          contest: 'Transpetro',
          position: 'Técnico em Eletrotécnica',
          board: 'Cesgranrio',
          totalQuestions: 10,
          correctCount: 8,
          wrongCount: 2,
          unansweredCount: 0,
          scorePercentage: 80,
          timeLimitMinutes: 30,
          timeSpentMinutes: 18,
          completedAt: '20/09/2026',
          disciplineResults: [
            { discipline: 'Circuitos Elétricos', total: 4, correct: 3, percentage: 75 },
            { discipline: 'Eletrotécnica', total: 3, correct: 3, percentage: 100 },
            { discipline: 'Língua Portuguesa', total: 3, correct: 2, percentage: 66 }
          ]
        }
      ];
    }
    return stored;
  }

  static saveSimulationResult(userId: string, simResult: any): void {
    const list = this.getSimulationsForUser(userId);
    list.unshift(simResult);
    setStorage(`aprova_plus_sim_results_${userId}`, list);
  }

  // Reviews for user
  static getReviewsForUser(userId: string): any[] {
    const stored = getStorage<any[]>(`aprova_plus_reviews_${userId}`, []);
    if (stored.length === 0) {
      return [
        {
          id: 'rev-1',
          discipline: 'Circuitos Elétricos',
          topic: 'Teorema de Thévenin e Norton',
          status: 'HOJE',
          scheduledDate: 'Hoje',
          errorCount: 3
        },
        {
          id: 'rev-2',
          discipline: 'Eletrotécnica',
          topic: 'Correção de Fator de Potência',
          status: 'PENDENTE',
          scheduledDate: 'Amanhã',
          errorCount: 2
        },
        {
          id: 'rev-3',
          discipline: 'Máquinas Elétricas',
          topic: 'Motores de Indução Trifásicos',
          status: 'ATRASADA',
          scheduledDate: 'Ontem',
          errorCount: 4
        }
      ];
    }
    return stored;
  }

  // Leaderboards for all tabs
  static getLeaderboards(): Record<string, any[]> {
    const base = this.getLeaderboard('geral');
    return {
      geral: base,
      semanal: base.map((u, i) => ({ ...u, xp: Math.round(u.xp * 0.4), rank: i + 1 })),
      mensal: base.map((u, i) => ({ ...u, xp: Math.round(u.xp * 0.8), rank: i + 1 })),
      concurso: base.filter((u) => u.targetContest === 'Transpetro').map((u, i) => ({ ...u, rank: i + 1 }))
    };
  }

  // Study Plan helpers
  static toggleStudySessionCompleted(sessionId: string): any[] {
    const list = getStorage<any[]>(STORAGE_KEYS.STUDY_PLAN, []);
    const item = list.find((s) => s.id === sessionId);
    if (item) {
      item.completed = !item.completed;
      setStorage(STORAGE_KEYS.STUDY_PLAN, list);
    }
    return list;
  }

  static deleteStudySession(sessionId: string): any[] {
    const list = getStorage<any[]>(STORAGE_KEYS.STUDY_PLAN, []);
    const filtered = list.filter((s) => s.id !== sessionId);
    setStorage(STORAGE_KEYS.STUDY_PLAN, filtered);
    return filtered;
  }

  static addStudySession(session: any): any[] {
    const list = getStorage<any[]>(STORAGE_KEYS.STUDY_PLAN, []);
    list.push(session);
    setStorage(STORAGE_KEYS.STUDY_PLAN, list);
    return list;
  }

  // Admin Question CRUD
  static addQuestion(question: Omit<Question, 'id' | 'code' | 'timesAnswered' | 'correctPercentage'>): Question {
    const list = this.getQuestions();
    const newCode = `Q-ADM-${list.length + 1}`;
    const newQ: Question = {
      ...question,
      id: 'q-custom-' + Date.now(),
      code: newCode,
      timesAnswered: 0,
      correctPercentage: 0,
      isDemonstrative: true
    };
    list.unshift(newQ);
    setStorage(STORAGE_KEYS.QUESTIONS, list);
    return newQ;
  }

  static updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const list = this.getQuestions();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.QUESTIONS, list);
    return list[idx];
  }

  static deleteQuestion(id: string): boolean {
    const list = this.getQuestions();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.QUESTIONS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Notebooks Management (Prompt Master 18)
  // -----------------------------------------------------------
  static getNotebooks(userId: string): Notebook[] {
    this.init();
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    return all.filter((n) => n.userId === userId);
  }

  static getNotebookById(id: string): Notebook | undefined {
    this.init();
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    return all.find((n) => n.id === id);
  }

  static createNotebook(
    userId: string,
    data: { title: string; description?: string; targetContest?: string; initialQuestionIds?: string[] }
  ): Notebook {
    this.init();
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    const today = new Date().toLocaleDateString('pt-BR');
    const newNotebook: Notebook = {
      id: 'noteb-' + Date.now(),
      userId,
      title: data.title,
      description: data.description || 'Caderno de questões personalizadas',
      targetContest: data.targetContest || 'Geral',
      questionIds: data.initialQuestionIds || [],
      createdAt: today,
      updatedAt: today
    };
    all.unshift(newNotebook);
    setStorage(STORAGE_KEYS.NOTEBOOKS, all);
    return newNotebook;
  }

  static updateNotebook(id: string, updates: Partial<Notebook>): Notebook | null {
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    const idx = all.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toLocaleDateString('pt-BR') };
    setStorage(STORAGE_KEYS.NOTEBOOKS, all);
    return all[idx];
  }

  static deleteNotebook(id: string): boolean {
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    const filtered = all.filter((n) => n.id !== id);
    if (filtered.length !== all.length) {
      setStorage(STORAGE_KEYS.NOTEBOOKS, filtered);
      return true;
    }
    return false;
  }

  static addQuestionToNotebook(notebookId: string, questionId: string): boolean {
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    const nb = all.find((n) => n.id === notebookId);
    if (!nb) return false;
    if (!nb.questionIds.includes(questionId)) {
      nb.questionIds.push(questionId);
      nb.updatedAt = new Date().toLocaleDateString('pt-BR');
      setStorage(STORAGE_KEYS.NOTEBOOKS, all);
      return true;
    }
    return false;
  }

  static removeQuestionFromNotebook(notebookId: string, questionId: string): boolean {
    const all = getStorage<Notebook[]>(STORAGE_KEYS.NOTEBOOKS, INITIAL_NOTEBOOKS);
    const nb = all.find((n) => n.id === notebookId);
    if (!nb) return false;
    const initialLen = nb.questionIds.length;
    nb.questionIds = nb.questionIds.filter((qId) => qId !== questionId);
    if (nb.questionIds.length !== initialLen) {
      nb.updatedAt = new Date().toLocaleDateString('pt-BR');
      setStorage(STORAGE_KEYS.NOTEBOOKS, all);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Taxonomy: Spheres & Powers (Prompt Master 5 & 6)
  // -----------------------------------------------------------
  static getSpheres() {
    return INITIAL_SPHERES;
  }

  static getPowers() {
    return INITIAL_POWERS;
  }

  // -----------------------------------------------------------
  // Taxonomy: Organizations (Órgãos e Empresas)
  // -----------------------------------------------------------
  static getOrganizations(): Organization[] {
    this.init();
    return getStorage<Organization[]>(STORAGE_KEYS.ORGANIZATIONS, INITIAL_ORGANIZATIONS);
  }

  static addOrganization(org: Omit<Organization, 'id'>): Organization {
    const list = this.getOrganizations();
    const newOrg: Organization = {
      ...org,
      id: 'org-' + Date.now()
    };
    list.unshift(newOrg);
    setStorage(STORAGE_KEYS.ORGANIZATIONS, list);
    return newOrg;
  }

  static updateOrganization(id: string, updates: Partial<Organization>): Organization | null {
    const list = this.getOrganizations();
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.ORGANIZATIONS, list);
    return list[idx];
  }

  static deleteOrganization(id: string): boolean {
    const list = this.getOrganizations();
    const filtered = list.filter((o) => o.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.ORGANIZATIONS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Taxonomy: Contests (Concursos)
  // -----------------------------------------------------------
  static getContests(): ExamContest[] {
    this.init();
    return getStorage<ExamContest[]>(STORAGE_KEYS.CONTESTS, INITIAL_CONTESTS);
  }

  static addContest(contest: Omit<ExamContest, 'id'>): ExamContest {
    const list = this.getContests();
    const newContest: ExamContest = {
      ...contest,
      id: 'cont-' + Date.now()
    };
    list.unshift(newContest);
    setStorage(STORAGE_KEYS.CONTESTS, list);
    return newContest;
  }

  static updateContest(id: string, updates: Partial<ExamContest>): ExamContest | null {
    const list = this.getContests();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.CONTESTS, list);
    return list[idx];
  }

  static deleteContest(id: string): boolean {
    const list = this.getContests();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.CONTESTS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Taxonomy: Positions (Cargos)
  // -----------------------------------------------------------
  static getPositions(): CareerPosition[] {
    this.init();
    return getStorage<CareerPosition[]>(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS);
  }

  static addPosition(pos: Omit<CareerPosition, 'id'>): CareerPosition {
    const list = this.getPositions();
    const newPos: CareerPosition = {
      ...pos,
      id: 'pos-' + Date.now()
    };
    list.unshift(newPos);
    setStorage(STORAGE_KEYS.POSITIONS, list);
    return newPos;
  }

  static updatePosition(id: string, updates: Partial<CareerPosition>): CareerPosition | null {
    const list = this.getPositions();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.POSITIONS, list);
    return list[idx];
  }

  static deletePosition(id: string): boolean {
    const list = this.getPositions();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.POSITIONS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Taxonomy: Boards (Bancas)
  // -----------------------------------------------------------
  static getBoards(): ExamBoard[] {
    this.init();
    return getStorage<ExamBoard[]>(STORAGE_KEYS.BOARDS, INITIAL_BOARDS);
  }

  static addBoard(board: Omit<ExamBoard, 'id'>): ExamBoard {
    const list = this.getBoards();
    const newBoard: ExamBoard = {
      ...board,
      id: 'brd-' + Date.now()
    };
    list.unshift(newBoard);
    setStorage(STORAGE_KEYS.BOARDS, list);
    return newBoard;
  }

  static updateBoard(id: string, updates: Partial<ExamBoard>): ExamBoard | null {
    const list = this.getBoards();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.BOARDS, list);
    return list[idx];
  }

  static deleteBoard(id: string): boolean {
    const list = this.getBoards();
    const filtered = list.filter((b) => b.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.BOARDS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Taxonomy: Disciplines, Subjects & Topics (Prompt Master 32)
  // -----------------------------------------------------------
  static getTaxonomyDisciplines(): TaxonomyDiscipline[] {
    this.init();
    return getStorage<TaxonomyDiscipline[]>(STORAGE_KEYS.TAXONOMY_DISCIPLINES, INITIAL_TAXONOMY_DISCIPLINES);
  }

  static addTaxonomyDiscipline(d: Omit<TaxonomyDiscipline, 'id'>): TaxonomyDiscipline {
    const list = this.getTaxonomyDisciplines();
    const newD: TaxonomyDiscipline = { ...d, id: 'disc-' + Date.now() };
    list.push(newD);
    setStorage(STORAGE_KEYS.TAXONOMY_DISCIPLINES, list);
    return newD;
  }

  static updateTaxonomyDiscipline(id: string, updates: Partial<TaxonomyDiscipline>): TaxonomyDiscipline | null {
    const list = this.getTaxonomyDisciplines();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.TAXONOMY_DISCIPLINES, list);
    return list[idx];
  }

  static deleteTaxonomyDiscipline(id: string): boolean {
    const list = this.getTaxonomyDisciplines();
    const filtered = list.filter((d) => d.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.TAXONOMY_DISCIPLINES, filtered);
      return true;
    }
    return false;
  }

  static getTaxonomySubjects(disciplineId?: string): TaxonomySubject[] {
    this.init();
    const list = getStorage<TaxonomySubject[]>(STORAGE_KEYS.TAXONOMY_SUBJECTS, INITIAL_TAXONOMY_SUBJECTS);
    if (disciplineId) {
      return list.filter((s) => s.disciplineId === disciplineId);
    }
    return list;
  }

  static addTaxonomySubject(s: Omit<TaxonomySubject, 'id'>): TaxonomySubject {
    const list = this.getTaxonomySubjects();
    const newS: TaxonomySubject = { ...s, id: 'subj-' + Date.now() };
    list.push(newS);
    setStorage(STORAGE_KEYS.TAXONOMY_SUBJECTS, list);
    return newS;
  }

  static updateTaxonomySubject(id: string, updates: Partial<TaxonomySubject>): TaxonomySubject | null {
    const list = this.getTaxonomySubjects();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.TAXONOMY_SUBJECTS, list);
    return list[idx];
  }

  static deleteTaxonomySubject(id: string): boolean {
    const list = this.getTaxonomySubjects();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.TAXONOMY_SUBJECTS, filtered);
      return true;
    }
    return false;
  }

  static getTaxonomyTopics(subjectId?: string): TaxonomyTopic[] {
    this.init();
    const list = getStorage<TaxonomyTopic[]>(STORAGE_KEYS.TAXONOMY_TOPICS, INITIAL_TAXONOMY_TOPICS);
    if (subjectId) {
      return list.filter((t) => t.subjectId === subjectId);
    }
    return list;
  }

  static addTaxonomyTopic(t: Omit<TaxonomyTopic, 'id'>): TaxonomyTopic {
    const list = this.getTaxonomyTopics();
    const newT: TaxonomyTopic = { ...t, id: 'top-' + Date.now() };
    list.push(newT);
    setStorage(STORAGE_KEYS.TAXONOMY_TOPICS, list);
    return newT;
  }

  static updateTaxonomyTopic(id: string, updates: Partial<TaxonomyTopic>): TaxonomyTopic | null {
    const list = this.getTaxonomyTopics();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage(STORAGE_KEYS.TAXONOMY_TOPICS, list);
    return list[idx];
  }

  static moveTopic(topicId: string, newSubjectId: string): boolean {
    const list = this.getTaxonomyTopics();
    const subjects = this.getTaxonomySubjects();
    const topic = list.find((t) => t.id === topicId);
    const targetSubject = subjects.find((s) => s.id === newSubjectId);
    if (!topic || !targetSubject) return false;
    topic.subjectId = newSubjectId;
    topic.subjectName = targetSubject.name;
    setStorage(STORAGE_KEYS.TAXONOMY_TOPICS, list);
    return true;
  }

  static deleteTaxonomyTopic(id: string): boolean {
    const list = this.getTaxonomyTopics();
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length !== list.length) {
      setStorage(STORAGE_KEYS.TAXONOMY_TOPICS, filtered);
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------
  // Topic Mastery Map (Prompt Master 15: Dominado / Em desenvolvimento / Precisa revisar)
  // -----------------------------------------------------------
  static getTopicMasteryMap(userId: string) {
    const questions = this.getQuestions();
    const answers = this.getAnswersForUser(userId);

    // Group questions by discipline and topic
    const map: Record<string, Record<string, { total: number; correct: number }>> = {};

    questions.forEach((q) => {
      if (!map[q.discipline]) map[q.discipline] = {};
      if (!map[q.discipline][q.topic]) map[q.discipline][q.topic] = { total: 0, correct: 0 };
    });

    answers.forEach((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q && map[q.discipline] && map[q.discipline][q.topic]) {
        map[q.discipline][q.topic].total += 1;
        if (ans.isCorrect) {
          map[q.discipline][q.topic].correct += 1;
        }
      }
    });

    // Provide baseline demonstration figures if student has just begun
    const results = Object.keys(map).map((discipline) => {
      const topics = Object.keys(map[discipline]).map((topicName) => {
        const stats = map[discipline][topicName];
        let pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        let total = stats.total;

        // Baseline realistic percentages if total answers is 0 for rich demo
        if (total === 0) {
          if (discipline === 'Circuitos Elétricos') {
            pct = 82;
            total = 18;
          } else if (discipline === 'Máquinas Elétricas') {
            pct = 68;
            total = 14;
          } else if (discipline === 'Instalações Elétricas') {
            pct = 48;
            total = 21;
          } else if (discipline === 'Eletrotécnica') {
            pct = 76;
            total = 25;
          } else if (discipline === 'Língua Portuguesa') {
            pct = 79;
            total = 32;
          } else {
            pct = 65;
            total = 10;
          }
        }

        let status: 'Dominado' | 'Em desenvolvimento' | 'Precisa revisar' = 'Em desenvolvimento';
        if (pct >= 75) status = 'Dominado';
        else if (pct < 50) status = 'Precisa revisar';

        return {
          name: topicName,
          percentage: pct,
          totalSolved: total,
          status
        };
      });

      return {
        discipline,
        topics
      };
    });

    return results;
  }

  // -----------------------------------------------------------
  // Global Search System (Prompt Master 33)
  // -----------------------------------------------------------
  static globalSearch(query: string): GlobalSearchResult[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    // Search Contests
    const contests = this.getContests();
    contests.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.organizationName.toLowerCase().includes(q)) {
        results.push({
          category: 'Concursos',
          id: c.id,
          title: c.title,
          subtitle: `${c.board} • ${c.year} • ${c.sphere}`,
          badge: c.status,
          filterKey: 'contest',
          filterValue: c.organizationName
        });
      }
    });

    // Search Positions
    const positions = this.getPositions();
    positions.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.careerArea.toLowerCase().includes(q)) {
        results.push({
          category: 'Cargos',
          id: p.id,
          title: p.title,
          subtitle: `${p.schoolingLevel} • ${p.careerArea} • ${p.organizationName || 'Diversos Órgãos'}`,
          badge: p.careerArea,
          filterKey: 'position',
          filterValue: p.title
        });
      }
    });

    // Search Boards
    const boards = this.getBoards();
    boards.forEach((b) => {
      if (b.name.toLowerCase().includes(q) || b.acronym.toLowerCase().includes(q)) {
        results.push({
          category: 'Bancas',
          id: b.id,
          title: b.name,
          subtitle: b.styleDescription.slice(0, 75) + '...',
          badge: b.acronym,
          filterKey: 'board',
          filterValue: b.acronym
        });
      }
    });

    // Search Disciplines & Subjects
    const disciplines = this.getTaxonomyDisciplines();
    disciplines.forEach((d) => {
      if (d.name.toLowerCase().includes(q)) {
        results.push({
          category: 'Disciplinas',
          id: d.id,
          title: d.name,
          subtitle: `${d.questionCount || 250}+ questões catalogadas`,
          badge: d.code || 'MATÉRIA',
          filterKey: 'discipline',
          filterValue: d.name
        });
      }
    });

    const subjects = this.getTaxonomySubjects();
    subjects.forEach((s) => {
      if (s.name.toLowerCase().includes(q)) {
        results.push({
          category: 'Assuntos',
          id: s.id,
          title: s.name,
          subtitle: `Disciplina: ${s.disciplineName}`,
          badge: s.disciplineName,
          filterKey: 'subject',
          filterValue: s.name
        });
      }
    });

    // Search Questions (by code, statement, topic)
    const questions = this.getQuestions();
    questions.forEach((qu) => {
      if (
        qu.code.toLowerCase().includes(q) ||
        qu.topic.toLowerCase().includes(q) ||
        qu.statement.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Questões',
          id: qu.id,
          title: `${qu.code} — ${qu.topic}`,
          subtitle: qu.statement.slice(0, 90) + '...',
          badge: `${qu.board} ${qu.year}`,
          filterKey: 'questionId',
          filterValue: qu.id
        });
      }
    });

    return results.slice(0, 20); // Cap top 20 relevant results
  }

  // -----------------------------------------------------------
  // Base Data Import Validation & Execution (Prompt Master 9)
  // -----------------------------------------------------------
  static validateImportBatch(type: string, records: any[]) {
    let newCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    const previewRecords: any[] = [];

    if (!Array.isArray(records) || records.length === 0) {
      return {
        newCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        validCount: 0,
        previewRecords: []
      };
    }

    if (type === 'questoes') {
      const existing = this.getQuestions();
      records.forEach((rec, idx) => {
        if (!rec.statement || !rec.correctOptionLetter) {
          invalidCount += 1;
        } else if (existing.some((q) => q.code === rec.code || q.statement.trim() === rec.statement.trim())) {
          duplicateCount += 1;
        } else {
          newCount += 1;
          if (previewRecords.length < 5) previewRecords.push(rec);
        }
      });
    } else if (type === 'concursos') {
      const existing = this.getContests();
      records.forEach((rec) => {
        if (!rec.title) invalidCount++;
        else if (existing.some((c) => c.title.toLowerCase() === rec.title.toLowerCase())) duplicateCount++;
        else {
          newCount++;
          if (previewRecords.length < 5) previewRecords.push(rec);
        }
      });
    } else {
      // General taxonomy item
      newCount = records.length;
      previewRecords.push(...records.slice(0, 5));
    }

    return {
      newCount,
      duplicateCount,
      invalidCount,
      validCount: newCount,
      previewRecords
    };
  }

  static executeImportBatch(type: string, records: any[]): { success: boolean; importedCount: number } {
    if (!Array.isArray(records)) return { success: false, importedCount: 0 };

    if (type === 'questoes') {
      const existing = this.getQuestions();
      let added = 0;
      records.forEach((rec) => {
        if (rec.statement && rec.correctOptionLetter) {
          existing.unshift({
            id: 'q-imp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            code: rec.code || `Q-IMP-${existing.length + 1}`,
            contest: rec.contest || 'Concurso Nacional',
            organization: rec.organization || 'Órgão Público',
            position: rec.position || 'Geral',
            board: rec.board || 'Cesgranrio',
            year: Number(rec.year) || 2024,
            discipline: rec.discipline || 'Conhecimentos Gerais',
            topic: rec.topic || 'Geral',
            statement: rec.statement,
            options: rec.options || [
              { id: 'opt-a', letter: 'A', text: rec.optA || 'Opção A' },
              { id: 'opt-b', letter: 'B', text: rec.optB || 'Opção B' },
              { id: 'opt-c', letter: 'C', text: rec.optC || 'Opção C' },
              { id: 'opt-d', letter: 'D', text: rec.optD || 'Opção D' },
              { id: 'opt-e', letter: 'E', text: rec.optE || 'Opção E' }
            ],
            correctOptionLetter: rec.correctOptionLetter,
            explanation: rec.explanation || 'Gabarito fundamentado pelos professores APROVA+.',
            difficulty: rec.difficulty || 'Médio',
            type: 'Múltipla Escolha',
            tags: rec.tags || ['Importada', 'Excel'],
            isDemonstrative: false,
            timesAnswered: 0,
            correctPercentage: 0
          });
          added += 1;
        }
      });
      setStorage(STORAGE_KEYS.QUESTIONS, existing);
      return { success: true, importedCount: added };
    }

    return { success: true, importedCount: records.length };
  }

  // Reset to default
  static resetDemoData(): void {
    localStorage.clear();
    this.init();
  }
}
