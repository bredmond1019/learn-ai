/**
 * Progress Tracking Utilities
 * 
 * Client-side utilities for tracking user progress through learning modules.
 * Uses localStorage for persistence and provides hooks for React components.
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  PathProgress,
  ModuleProgress,
  SectionProgress,
  ProgressStatus,
  ProgressStorage,
  ProgressUpdateEvent,
  LearningStats,
  Achievement,
  UseProgressReturn,
  ExerciseResult,
  QuizResult,
} from '@/types/progress';

// Constants
const STORAGE_KEY = 'learning-progress';
const STORAGE_VERSION = '1.0.0';
const DEFAULT_USER_ID = 'default-user'; // In production, this would come from auth

/**
 * Initialize default progress storage
 */
const initializeStorage = (): ProgressStorage => ({
  version: STORAGE_VERSION,
  userId: DEFAULT_USER_ID,
  paths: {},
  stats: {
    userId: DEFAULT_USER_ID,
    totalTimeSpent: 0,
    modulesCompleted: 0,
    pathsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString(),
    achievements: [],
    averageScore: 0,
  },
  lastUpdated: new Date().toISOString(),
});

/**
 * Get progress data from localStorage
 */
export const getProgressStorage = (): ProgressStorage => {
  if (typeof window === 'undefined') {
    return initializeStorage();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initializeStorage();
    }

    const parsed = JSON.parse(stored) as ProgressStorage;
    
    // Handle version migrations if needed
    if (parsed.version !== STORAGE_VERSION) {
      // Migrate data if schema changes
      console.log('Migrating progress data from version', parsed.version, 'to', STORAGE_VERSION);
      // Add migration logic here when schema changes
    }

    return parsed;
  } catch (error) {
    console.error('Error reading progress storage:', error);
    return initializeStorage();
  }
};

/**
 * Save progress data to localStorage
 */
export const saveProgressStorage = (storage: ProgressStorage): void => {
  if (typeof window === 'undefined') return;

  try {
    storage.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error saving progress storage:', error);
  }
};

/**
 * Get or create path progress
 */
export const getPathProgress = (pathId: string): PathProgress => {
  const storage = getProgressStorage();
  
  if (!storage.paths[pathId]) {
    storage.paths[pathId] = {
      pathId,
      userId: storage.userId,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      moduleProgress: [],
      totalTimeSpent: 0,
      completionPercentage: 0,
    };
    saveProgressStorage(storage);
  }

  return storage.paths[pathId];
};

/**
 * Get or create module progress
 */
export const getModuleProgress = (pathId: string, moduleId: string): ModuleProgress => {
  const pathProgress = getPathProgress(pathId);
  
  let moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) {
    moduleProgress = {
      moduleId,
      pathId,
      status: 'not-started',
      sectionProgress: [],
      timeSpent: 0,
      attempts: 0,
      bookmarked: false,
    };
    pathProgress.moduleProgress.push(moduleProgress);
    
    const storage = getProgressStorage();
    storage.paths[pathId] = pathProgress;
    saveProgressStorage(storage);
  }

  return moduleProgress;
};

/**
 * Get or create section progress
 */
export const getSectionProgress = (
  pathId: string,
  moduleId: string,
  sectionId: string
): SectionProgress => {
  const moduleProgress = getModuleProgress(pathId, moduleId);
  
  let sectionProgress = moduleProgress.sectionProgress.find(s => s.sectionId === sectionId);
  
  if (!sectionProgress) {
    sectionProgress = {
      sectionId,
      moduleId,
      status: 'not-started',
      timeSpent: 0,
    };
    moduleProgress.sectionProgress.push(sectionProgress);
    
    const storage = getProgressStorage();
    const pathProgress = storage.paths[pathId];
    const modIndex = pathProgress.moduleProgress.findIndex(m => m.moduleId === moduleId);
    pathProgress.moduleProgress[modIndex] = moduleProgress;
    saveProgressStorage(storage);
  }

  return sectionProgress;
};

/**
 * Update section progress
 */
export const updateSectionProgress = (
  pathId: string,
  moduleId: string,
  sectionId: string,
  updates: Partial<SectionProgress>
): void => {
  const storage = getProgressStorage();
  const pathProgress = storage.paths[pathId];
  const moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) return;

  const sectionIndex = moduleProgress.sectionProgress.findIndex(s => s.sectionId === sectionId);
  if (sectionIndex === -1) return;

  moduleProgress.sectionProgress[sectionIndex] = {
    ...moduleProgress.sectionProgress[sectionIndex],
    ...updates,
  };

  // Update module status if needed
  updateModuleStatus(moduleProgress);
  
  // Update path completion percentage
  updatePathCompletion(pathProgress);

  saveProgressStorage(storage);
};

/**
 * Update module status based on section progress
 */
const updateModuleStatus = (moduleProgress: ModuleProgress): void => {
  const sections = moduleProgress.sectionProgress;
  
  if (sections.length === 0) {
    moduleProgress.status = 'not-started';
    return;
  }

  const allCompleted = sections.every(s => s.status === 'completed');
  const anyStarted = sections.some(s => s.status !== 'not-started');

  if (allCompleted) {
    moduleProgress.status = 'completed';
    moduleProgress.completedAt = new Date().toISOString();
  } else if (anyStarted) {
    moduleProgress.status = 'in-progress';
  } else {
    moduleProgress.status = 'not-started';
  }

  moduleProgress.lastAccessedAt = new Date().toISOString();
};

/**
 * Update path completion percentage
 */
const updatePathCompletion = (pathProgress: PathProgress): void => {
  const totalModules = pathProgress.moduleProgress.length;
  if (totalModules === 0) {
    pathProgress.completionPercentage = 0;
    return;
  }

  const completedModules = pathProgress.moduleProgress.filter(
    m => m.status === 'completed'
  ).length;

  pathProgress.completionPercentage = Math.round((completedModules / totalModules) * 100);
  pathProgress.lastAccessedAt = new Date().toISOString();

  if (pathProgress.completionPercentage === 100 && !pathProgress.completedAt) {
    pathProgress.completedAt = new Date().toISOString();
  }
};

/**
 * Add time spent to progress tracking
 */
export const addTimeSpent = (
  pathId: string,
  moduleId: string,
  sectionId: string,
  minutes: number
): void => {
  const storage = getProgressStorage();
  const pathProgress = storage.paths[pathId];
  const moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) return;

  const sectionProgress = moduleProgress.sectionProgress.find(s => s.sectionId === sectionId);
  if (!sectionProgress) return;

  // Update time at all levels
  sectionProgress.timeSpent += minutes;
  moduleProgress.timeSpent += minutes;
  pathProgress.totalTimeSpent += minutes;
  storage.stats.totalTimeSpent += minutes;

  // Update last active date for streak calculation
  const today = new Date().toISOString().split('T')[0];
  const lastActive = storage.stats.lastActiveDate.split('T')[0];
  
  if (today !== lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActive === yesterdayStr) {
      storage.stats.currentStreak += 1;
      storage.stats.longestStreak = Math.max(
        storage.stats.currentStreak,
        storage.stats.longestStreak
      );
    } else {
      storage.stats.currentStreak = 1;
    }
  }
  
  storage.stats.lastActiveDate = new Date().toISOString();
  saveProgressStorage(storage);
};

/**
 * Mark a section as complete
 */
export const markSectionComplete = (
  pathId: string,
  moduleId: string,
  sectionId: string,
  score?: number
): void => {
  updateSectionProgress(pathId, moduleId, sectionId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    score,
  });

  // Check for achievements
  checkAchievements(pathId, moduleId, sectionId);
};

/**
 * Add exercise result
 */
export const addExerciseResult = (
  pathId: string,
  moduleId: string,
  sectionId: string,
  result: ExerciseResult
): void => {
  const storage = getProgressStorage();
  const pathProgress = storage.paths[pathId];
  const moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) return;

  const sectionProgress = moduleProgress.sectionProgress.find(s => s.sectionId === sectionId);
  if (!sectionProgress) return;

  if (!sectionProgress.exerciseResults) {
    sectionProgress.exerciseResults = [];
  }

  // Update or add exercise result
  const existingIndex = sectionProgress.exerciseResults.findIndex(
    r => r.exerciseId === result.exerciseId
  );

  if (existingIndex >= 0) {
    sectionProgress.exerciseResults[existingIndex] = result;
  } else {
    sectionProgress.exerciseResults.push(result);
  }

  saveProgressStorage(storage);
};

/**
 * Add quiz result
 */
export const addQuizResult = (
  pathId: string,
  moduleId: string,
  sectionId: string,
  result: QuizResult
): void => {
  const storage = getProgressStorage();
  const pathProgress = storage.paths[pathId];
  const moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) return;

  const sectionProgress = moduleProgress.sectionProgress.find(s => s.sectionId === sectionId);
  if (!sectionProgress) return;

  if (!sectionProgress.quizResults) {
    sectionProgress.quizResults = [];
  }

  sectionProgress.quizResults.push(result);

  // Update average score
  const allScores = storage.paths[pathId].moduleProgress
    .flatMap(m => m.sectionProgress)
    .flatMap(s => s.quizResults || [])
    .map(q => q.score);

  if (allScores.length > 0) {
    storage.stats.averageScore = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    );
  }

  saveProgressStorage(storage);
};

/**
 * Check and award achievements
 */
const checkAchievements = (pathId: string, moduleId: string, sectionId: string): void => {
  const storage = getProgressStorage();
  const pathProgress = storage.paths[pathId];
  const moduleProgress = pathProgress.moduleProgress.find(m => m.moduleId === moduleId);
  
  if (!moduleProgress) return;

  const achievements: Achievement[] = [];

  // First module completion
  if (storage.stats.modulesCompleted === 0 && moduleProgress.status === 'completed') {
    achievements.push({
      id: 'first-module',
      type: 'module',
      title: 'First Steps',
      description: 'Completed your first learning module!',
      earnedAt: new Date().toISOString(),
    });
  }

  // Module completion
  if (moduleProgress.status === 'completed') {
    storage.stats.modulesCompleted += 1;
    achievements.push({
      id: `module-${moduleId}`,
      type: 'module',
      title: 'Module Master',
      description: `Completed module: ${moduleId}`,
      earnedAt: new Date().toISOString(),
      metadata: { moduleId },
    });
  }

  // Path completion
  if (pathProgress.completionPercentage === 100) {
    storage.stats.pathsCompleted += 1;
    achievements.push({
      id: `path-${pathId}`,
      type: 'path',
      title: 'Path Complete',
      description: `Completed learning path: ${pathId}`,
      earnedAt: new Date().toISOString(),
      metadata: { pathId },
    });
  }

  // Streak achievements
  if (storage.stats.currentStreak === 7) {
    achievements.push({
      id: 'week-streak',
      type: 'streak',
      title: 'Week Warrior',
      description: '7-day learning streak!',
      earnedAt: new Date().toISOString(),
    });
  }

  if (storage.stats.currentStreak === 30) {
    achievements.push({
      id: 'month-streak',
      type: 'streak',
      title: 'Dedicated Learner',
      description: '30-day learning streak!',
      earnedAt: new Date().toISOString(),
    });
  }

  // Add new achievements
  achievements.forEach(achievement => {
    if (!storage.stats.achievements.find(a => a.id === achievement.id)) {
      storage.stats.achievements.push(achievement);
    }
  });

  saveProgressStorage(storage);
};

/**
 * Reset progress for a specific scope
 */
export const resetProgress = (
  scope: 'section' | 'module' | 'path',
  pathId: string,
  moduleId?: string,
  sectionId?: string
): void => {
  const storage = getProgressStorage();

  switch (scope) {
    case 'section':
      if (!moduleId || !sectionId) return;
      const moduleProgress = storage.paths[pathId]?.moduleProgress.find(
        m => m.moduleId === moduleId
      );
      if (moduleProgress) {
        const sectionIndex = moduleProgress.sectionProgress.findIndex(
          s => s.sectionId === sectionId
        );
        if (sectionIndex >= 0) {
          moduleProgress.sectionProgress[sectionIndex] = {
            sectionId,
            moduleId,
            status: 'not-started',
            timeSpent: 0,
          };
        }
      }
      break;

    case 'module':
      if (!moduleId) return;
      const modIndex = storage.paths[pathId]?.moduleProgress.findIndex(
        m => m.moduleId === moduleId
      );
      if (modIndex >= 0) {
        storage.paths[pathId].moduleProgress[modIndex] = {
          moduleId,
          pathId,
          status: 'not-started',
          sectionProgress: [],
          timeSpent: 0,
          attempts: 0,
          bookmarked: false,
        };
      }
      break;

    case 'path':
      delete storage.paths[pathId];
      break;
  }

  saveProgressStorage(storage);
};

/**
 * React hook for progress tracking
 */
export const useProgress = (
  pathId: string,
  moduleId?: string,
  sectionId?: string
): UseProgressReturn => {
  const [pathProgress, setPathProgress] = useState<PathProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load progress data
  useEffect(() => {
    try {
      setIsLoading(true);
      const storage = getProgressStorage();
      
      setStats(storage.stats);
      
      if (pathId) {
        const path = getPathProgress(pathId);
        setPathProgress(path);
        
        if (moduleId) {
          const module = getModuleProgress(pathId, moduleId);
          setModuleProgress(module);
          
          if (sectionId) {
            const section = getSectionProgress(pathId, moduleId, sectionId);
            setSectionProgress(section);
          }
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [pathId, moduleId, sectionId]);

  // Update progress handler
  const updateProgress = useCallback(async (event: ProgressUpdateEvent) => {
    try {
      // Handle different event types
      switch (event.type) {
        case 'section-started':
          if (event.data.pathId && event.data.moduleId && event.data.sectionId) {
            updateSectionProgress(
              event.data.pathId,
              event.data.moduleId,
              event.data.sectionId,
              { status: 'in-progress', startedAt: event.timestamp }
            );
          }
          break;

        case 'section-completed':
          if (event.data.pathId && event.data.moduleId && event.data.sectionId) {
            markSectionComplete(
              event.data.pathId,
              event.data.moduleId,
              event.data.sectionId,
              event.data.score
            );
          }
          break;

        case 'time-update':
          if (event.data.pathId && event.data.moduleId && event.data.sectionId && event.data.timeSpent) {
            addTimeSpent(
              event.data.pathId,
              event.data.moduleId,
              event.data.sectionId,
              event.data.timeSpent
            );
          }
          break;
      }

      // Reload data
      const storage = getProgressStorage();
      setStats(storage.stats);
      if (pathId) setPathProgress(getPathProgress(pathId));
      if (pathId && moduleId) setModuleProgress(getModuleProgress(pathId, moduleId));
      if (pathId && moduleId && sectionId) {
        setSectionProgress(getSectionProgress(pathId, moduleId, sectionId));
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [pathId, moduleId, sectionId]);

  // Mark section complete handler
  const markSectionCompleteHandler = useCallback(async (sectionId: string, score?: number) => {
    if (!pathId || !moduleId) return;
    
    await updateProgress({
      type: 'section-completed',
      timestamp: new Date().toISOString(),
      userId: DEFAULT_USER_ID,
      data: { pathId, moduleId, sectionId, score },
    });
  }, [pathId, moduleId, updateProgress]);

  // Mark module complete handler
  const markModuleCompleteHandler = useCallback(async (moduleId: string) => {
    if (!pathId) return;
    
    await updateProgress({
      type: 'module-completed',
      timestamp: new Date().toISOString(),
      userId: DEFAULT_USER_ID,
      data: { pathId, moduleId },
    });
  }, [pathId, updateProgress]);

  // Update time spent handler
  const updateTimeSpentHandler = useCallback(async (minutes: number) => {
    if (!pathId || !moduleId || !sectionId) return;
    
    await updateProgress({
      type: 'time-update',
      timestamp: new Date().toISOString(),
      userId: DEFAULT_USER_ID,
      data: { pathId, moduleId, sectionId, timeSpent: minutes },
    });
  }, [pathId, moduleId, sectionId, updateProgress]);

  // Reset progress handler
  const resetProgressHandler = useCallback(async (scope: 'section' | 'module' | 'path') => {
    if (!pathId) return;
    
    resetProgress(scope, pathId, moduleId, sectionId);
    
    // Reload data
    const storage = getProgressStorage();
    setStats(storage.stats);
    if (pathId) setPathProgress(getPathProgress(pathId));
    if (pathId && moduleId) setModuleProgress(getModuleProgress(pathId, moduleId));
    if (pathId && moduleId && sectionId) {
      setSectionProgress(getSectionProgress(pathId, moduleId, sectionId));
    }
  }, [pathId, moduleId, sectionId]);

  // Add quiz result handler
  const addQuizResultHandler = useCallback(async (pId: string, mId: string, sId: string, result: QuizResult) => {
    addQuizResult(pId, mId, sId, result);
    
    // Reload data
    const storage = getProgressStorage();
    setStats(storage.stats);
    if (pathId) setPathProgress(getPathProgress(pathId));
    if (pathId && moduleId) setModuleProgress(getModuleProgress(pathId, moduleId));
    if (pathId && moduleId && sectionId) {
      setSectionProgress(getSectionProgress(pathId, moduleId, sectionId));
    }
  }, [pathId, moduleId, sectionId]);

  return {
    pathProgress,
    moduleProgress,
    sectionProgress,
    stats,
    isLoading,
    error,
    updateProgress,
    markSectionComplete: markSectionCompleteHandler,
    markModuleComplete: markModuleCompleteHandler,
    updateTimeSpent: updateTimeSpentHandler,
    resetProgress: resetProgressHandler,
    addQuizResult: addQuizResultHandler,
  };
};

/**
 * Calculate module completion percentage
 */
export const calculateModuleProgress = (moduleProgress: ModuleProgress): number => {
  if (moduleProgress.sectionProgress.length === 0) return 0;
  
  const completedSections = moduleProgress.sectionProgress.filter(
    s => s.status === 'completed'
  ).length;
  
  return Math.round((completedSections / moduleProgress.sectionProgress.length) * 100);
};

/**
 * Calculate path completion percentage
 */
export const calculatePathProgress = (pathProgress: PathProgress): number => {
  if (pathProgress.moduleProgress.length === 0) return 0;
  
  const completedModules = pathProgress.moduleProgress.filter(
    m => m.status === 'completed'
  ).length;
  
  return Math.round((completedModules / pathProgress.moduleProgress.length) * 100);
};

/**
 * Get next section to work on
 */
export const getNextSection = (moduleProgress: ModuleProgress): string | null => {
  const nextSection = moduleProgress.sectionProgress.find(
    s => s.status === 'not-started' || s.status === 'in-progress'
  );
  
  return nextSection?.sectionId || null;
};

/**
 * Get next module to work on
 */
export const getNextModule = (pathProgress: PathProgress): string | null => {
  const nextModule = pathProgress.moduleProgress.find(
    m => m.status === 'not-started' || m.status === 'in-progress'
  );
  
  return nextModule?.moduleId || null;
};