// Telemetry Service - Analytics and logging for parent dashboard
import { TelemetryEvent, TaskResult, SessionSummary } from '../types';
import { storageService } from './storageService';

interface TelemetryState {
  sessionStartTime: Date | null;
  currentIslandId: string | null;
  currentLevelId: string | null;
  taskResults: TaskResult[];
  events: TelemetryEvent[];
}

const state: TelemetryState = {
  sessionStartTime: null,
  currentIslandId: null,
  currentLevelId: null,
  taskResults: [],
  events: [],
};

export const telemetryService = {
  // Start a new learning session
  startSession: (islandId: string, levelId: string): void => {
    state.sessionStartTime = new Date();
    state.currentIslandId = islandId;
    state.currentLevelId = levelId;
    state.taskResults = [];
    
    telemetryService.logEvent({
      eventType: 'session_start',
      timestamp: new Date(),
      data: { islandId, levelId },
    });
  },

  // Record a task completion
  recordTaskResult: (result: TaskResult): void => {
    state.taskResults.push(result);
    
    telemetryService.logEvent({
      eventType: 'task_complete',
      timestamp: new Date(),
      data: {
        taskId: result.taskId,
        correct: result.correct,
        attempts: result.attempts,
        timeSpentMs: result.timeSpentMs,
      },
    });
  },

  // End the session and calculate summary
  endSession: (): SessionSummary | null => {
    if (!state.sessionStartTime || !state.currentIslandId || !state.currentLevelId) {
      return null;
    }

    const endTime = new Date();
    const timeSpentMs = endTime.getTime() - state.sessionStartTime.getTime();
    const timeSpentMinutes = timeSpentMs / 1000 / 60;

    const totalTasks = state.taskResults.length;
    const correctTasks = state.taskResults.filter(r => r.correct).length;
    const accuracy = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

    const summary: SessionSummary = {
      date: new Date().toISOString().split('T')[0],
      islandId: state.currentIslandId,
      levelId: state.currentLevelId,
      accuracy: Math.round(accuracy),
      tasksCompleted: totalTasks,
      timeSpentMinutes: Math.round(timeSpentMinutes * 10) / 10,
    };

    // Save to storage
    storageService.saveSessionSummary(summary);

    telemetryService.logEvent({
      eventType: 'session_end',
      timestamp: endTime,
      data: {
        ...summary,
        totalAttempts: state.taskResults.reduce((sum, r) => sum + r.attempts, 0),
      },
    });

    // Check for mastery (accuracy >= 85%)
    if (accuracy >= 85) {
      storageService.recordMasteryDay(state.currentIslandId);
    }

    // Reset state
    state.sessionStartTime = null;
    state.currentIslandId = null;
    state.currentLevelId = null;
    state.taskResults = [];

    return summary;
  },

  // Log a telemetry event
  logEvent: (event: TelemetryEvent): void => {
    state.events.push(event);
    
    // Keep only last 1000 events in memory
    if (state.events.length > 1000) {
      state.events = state.events.slice(-1000);
    }

    // In production, you might send this to an analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', event.eventType, event.data);
    }
  },

  // Get current session stats
  getCurrentSessionStats: (): {
    tasksCompleted: number;
    accuracy: number;
    timeSpentMinutes: number;
  } | null => {
    if (!state.sessionStartTime) {
      return null;
    }

    const timeSpentMs = new Date().getTime() - state.sessionStartTime.getTime();
    const totalTasks = state.taskResults.length;
    const correctTasks = state.taskResults.filter(r => r.correct).length;
    const accuracy = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

    return {
      tasksCompleted: totalTasks,
      accuracy: Math.round(accuracy),
      timeSpentMinutes: Math.round((timeSpentMs / 1000 / 60) * 10) / 10,
    };
  },

  // Calculate streak (consecutive days with sessions)
  calculateStreak: (): number => {
    const sessions = storageService.getSessionHistory();
    if (sessions.length === 0) return 0;

    // Get unique dates sorted descending
    const dateSet = new Set(sessions.map(s => s.date));
    const dates = Array.from(dateSet).sort().reverse();
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const sessionDate = new Date(dates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow starting streak from yesterday
        continue;
      } else {
        break;
      }
    }

    return streak;
  },

  // Get performance by category
  getPerformanceByCategory: (): Record<string, { sessions: number; avgAccuracy: number }> => {
    const sessions = storageService.getSessionHistory();
    const byCategory: Record<string, { total: number; accuracySum: number }> = {};

    sessions.forEach(session => {
      if (!byCategory[session.islandId]) {
        byCategory[session.islandId] = { total: 0, accuracySum: 0 };
      }
      byCategory[session.islandId].total++;
      byCategory[session.islandId].accuracySum += session.accuracy;
    });

    const result: Record<string, { sessions: number; avgAccuracy: number }> = {};
    Object.entries(byCategory).forEach(([category, data]) => {
      result[category] = {
        sessions: data.total,
        avgAccuracy: Math.round(data.accuracySum / data.total),
      };
    });

    return result;
  },

  // Get weekly summary
  getWeeklySummary: (): {
    daysActive: number;
    totalMinutes: number;
    tasksCompleted: number;
    averageAccuracy: number;
  } => {
    const sessions = storageService.getSessionHistory();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekSessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo);
    const uniqueDays = new Set(weekSessions.map(s => s.date)).size;

    return {
      daysActive: uniqueDays,
      totalMinutes: Math.round(weekSessions.reduce((sum, s) => sum + s.timeSpentMinutes, 0)),
      tasksCompleted: weekSessions.reduce((sum, s) => sum + s.tasksCompleted, 0),
      averageAccuracy: weekSessions.length > 0
        ? Math.round(weekSessions.reduce((sum, s) => sum + s.accuracy, 0) / weekSessions.length)
        : 0,
    };
  },
};
