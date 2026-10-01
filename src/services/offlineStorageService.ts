/**
 * Offline Storage & Synchronization Service
 * Manages local offline caching of questions, answer queueing,
 * and resilient state sync when network connectivity returns.
 */

export interface QueuedAnswer {
  id: string;
  questionId: string;
  selectedLetter: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: number;
}

export interface PomodoroSessionState {
  isActive: boolean;
  isPaused: boolean;
  timeRemainingSeconds: number;
  totalDurationMinutes: number;
  mode: 'study' | 'short_break' | 'long_break';
  completedCycles: number;
  subjectName?: string;
  topicName?: string;
  lastUpdatedTimestamp: number;
}

const OFFLINE_ANSWERS_KEY = 'aprova_offline_answers_queue';
const POMODORO_STATE_KEY = 'aprova_pomodoro_active_state';
const LAST_STUDY_STATE_KEY = 'aprova_last_study_checkpoint';

export class OfflineStorageService {
  // Queue answer when offline
  static queueAnswer(answer: Omit<QueuedAnswer, 'id' | 'timestamp'>): void {
    try {
      const currentQueue = this.getQueuedAnswers();
      const newEntry: QueuedAnswer = {
        ...answer,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now()
      };
      currentQueue.push(newEntry);
      localStorage.setItem(OFFLINE_ANSWERS_KEY, JSON.stringify(currentQueue));
      console.log(`[OfflineStorage] Saved offline answer for Q-${answer.questionId}. Queue size: ${currentQueue.length}`);
    } catch (err) {
      console.error('Failed to queue offline answer:', err);
    }
  }

  // Retrieve queued answers
  static getQueuedAnswers(): QueuedAnswer[] {
    try {
      const raw = localStorage.getItem(OFFLINE_ANSWERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Clear queued answers after successful sync
  static clearQueue(): void {
    localStorage.removeItem(OFFLINE_ANSWERS_KEY);
  }

  // Flush sync queue to server
  static async syncQueuedAnswers(): Promise<number> {
    const queue = this.getQueuedAnswers();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remainingQueue: QueuedAnswer[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(`/api/questions/${item.questionId}/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedOptionLetter: item.selectedLetter,
            timeSpentSeconds: item.timeSpentSeconds
          })
        });

        if (res.ok) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      } catch (err) {
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(OFFLINE_ANSWERS_KEY, JSON.stringify(remainingQueue));
    return syncedCount;
  }

  // Save Pomodoro / Active Study Session state
  static savePomodoroState(state: PomodoroSessionState): void {
    try {
      localStorage.setItem(POMODORO_STATE_KEY, JSON.stringify({
        ...state,
        lastUpdatedTimestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to save Pomodoro state:', err);
    }
  }

  // Load Pomodoro state (accounting for elapsed background time)
  static loadPomodoroState(): PomodoroSessionState | null {
    try {
      const raw = localStorage.getItem(POMODORO_STATE_KEY);
      if (!raw) return null;
      const parsed: PomodoroSessionState = JSON.parse(raw);

      // If active and not paused, subtract elapsed time while in background
      if (parsed.isActive && !parsed.isPaused && parsed.lastUpdatedTimestamp) {
        const elapsedSeconds = Math.floor((Date.now() - parsed.lastUpdatedTimestamp) / 1000);
        parsed.timeRemainingSeconds = Math.max(0, parsed.timeRemainingSeconds - elapsedSeconds);
      }

      return parsed;
    } catch {
      return null;
    }
  }

  // Clear Pomodoro state
  static clearPomodoroState(): void {
    localStorage.removeItem(POMODORO_STATE_KEY);
  }

  // Save last study checkpoint for "Continuar de onde parou"
  static saveLastStudyCheckpoint(checkpoint: {
    type: 'question' | 'session' | 'simulation';
    title: string;
    discipline?: string;
    topic?: string;
    questionId?: string;
    sessionId?: string;
  }): void {
    try {
      localStorage.setItem(LAST_STUDY_STATE_KEY, JSON.stringify({
        ...checkpoint,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to save study checkpoint:', err);
    }
  }

  // Get last study checkpoint
  static getLastStudyCheckpoint(): {
    type: 'question' | 'session' | 'simulation';
    title: string;
    discipline?: string;
    topic?: string;
    questionId?: string;
    sessionId?: string;
    timestamp: number;
  } | null {
    try {
      const raw = localStorage.getItem(LAST_STUDY_STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
