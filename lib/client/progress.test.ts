/**
 * Unit tests for progress tracking utilities
 */

import { renderHook, act } from '@testing-library/react';
import {
  getProgressStorage,
  saveProgressStorage,
  getPathProgress,
  getModuleProgress,
  getSectionProgress,
  updateSectionProgress,
  addTimeSpent,
  markSectionComplete,
  addExerciseResult,
  addQuizResult,
  resetProgress,
  useProgress,
  calculateModuleProgress,
  calculatePathProgress,
  getNextSection,
  getNextModule,
} from './progress';
import type {
  ProgressStorage,
  PathProgress,
  ModuleProgress,
  SectionProgress,
  ExerciseResult,
  QuizResult,
} from '@/types/progress';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Progress Tracking Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getProgressStorage', () => {
    it('should initialize storage with default values', () => {
      const storage = getProgressStorage();

      expect(storage.version).toBe('1.0.0');
      expect(storage.userId).toBe('default-user');
      expect(storage.paths).toEqual({});
      expect(storage.stats.totalTimeSpent).toBe(0);
      expect(storage.stats.modulesCompleted).toBe(0);
      expect(storage.stats.achievements).toEqual([]);
    });

    it('should load existing storage from localStorage', () => {
      const existingStorage: ProgressStorage = {
        version: '1.0.0',
        userId: 'test-user',
        paths: {
          'path-1': {
            pathId: 'path-1',
            userId: 'test-user',
            startedAt: '2024-01-01T00:00:00Z',
            lastAccessedAt: '2024-01-01T00:00:00Z',
            moduleProgress: [],
            totalTimeSpent: 30,
            completionPercentage: 50,
          },
        },
        stats: {
          userId: 'test-user',
          totalTimeSpent: 30,
          modulesCompleted: 1,
          pathsCompleted: 0,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: '2024-01-01T00:00:00Z',
          achievements: [],
          averageScore: 85,
        },
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      localStorageMock.setItem('learning-progress', JSON.stringify(existingStorage));
      const storage = getProgressStorage();

      expect(storage.paths['path-1']).toBeDefined();
      expect(storage.paths['path-1'].totalTimeSpent).toBe(30);
      expect(storage.stats.modulesCompleted).toBe(1);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('learning-progress', 'invalid-json');
      const storage = getProgressStorage();

      expect(storage.version).toBe('1.0.0');
      expect(storage.paths).toEqual({});
    });
  });

  describe('saveProgressStorage', () => {
    it('should save storage to localStorage', () => {
      const storage = getProgressStorage();
      storage.stats.totalTimeSpent = 60;
      
      saveProgressStorage(storage);

      const saved = JSON.parse(localStorageMock.getItem('learning-progress') as string);
      expect(saved.stats.totalTimeSpent).toBe(60);
      expect(saved.lastUpdated).toBeDefined();
    });
  });

  describe('getPathProgress', () => {
    it('should create new path progress if not exists', () => {
      const pathProgress = getPathProgress('new-path');

      expect(pathProgress.pathId).toBe('new-path');
      expect(pathProgress.userId).toBe('default-user');
      expect(pathProgress.moduleProgress).toEqual([]);
      expect(pathProgress.totalTimeSpent).toBe(0);
      expect(pathProgress.completionPercentage).toBe(0);
    });

    it('should return existing path progress', () => {
      const pathProgress = getPathProgress('path-1');
      pathProgress.totalTimeSpent = 45;
      
      const storage = getProgressStorage();
      storage.paths['path-1'] = pathProgress;
      saveProgressStorage(storage);

      const retrieved = getPathProgress('path-1');
      expect(retrieved.totalTimeSpent).toBe(45);
    });
  });

  describe('getModuleProgress', () => {
    it('should create new module progress if not exists', () => {
      const moduleProgress = getModuleProgress('path-1', 'module-1');

      expect(moduleProgress.moduleId).toBe('module-1');
      expect(moduleProgress.pathId).toBe('path-1');
      expect(moduleProgress.status).toBe('not-started');
      expect(moduleProgress.sectionProgress).toEqual([]);
      expect(moduleProgress.timeSpent).toBe(0);
      expect(moduleProgress.bookmarked).toBe(false);
    });

    it('should return existing module progress', () => {
      const moduleProgress = getModuleProgress('path-1', 'module-1');
      moduleProgress.timeSpent = 30;
      
      const storage = getProgressStorage();
      const pathProgress = storage.paths['path-1'];
      pathProgress.moduleProgress[0] = moduleProgress;
      saveProgressStorage(storage);

      const retrieved = getModuleProgress('path-1', 'module-1');
      expect(retrieved.timeSpent).toBe(30);
    });
  });

  describe('getSectionProgress', () => {
    it('should create new section progress if not exists', () => {
      const sectionProgress = getSectionProgress('path-1', 'module-1', 'section-1');

      expect(sectionProgress.sectionId).toBe('section-1');
      expect(sectionProgress.moduleId).toBe('module-1');
      expect(sectionProgress.status).toBe('not-started');
      expect(sectionProgress.timeSpent).toBe(0);
    });
  });

  describe('updateSectionProgress', () => {
    it('should update section progress and module status', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      getSectionProgress('path-1', 'module-1', 'section-2');

      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
        completedAt: '2024-01-01T00:00:00Z',
        score: 90,
      });

      const storage = getProgressStorage();
      const moduleProgress = storage.paths['path-1'].moduleProgress[0];
      const sectionProgress = moduleProgress.sectionProgress[0];

      expect(sectionProgress.status).toBe('completed');
      expect(sectionProgress.score).toBe(90);
      expect(moduleProgress.status).toBe('in-progress');
    });

    it('should mark module as completed when all sections are completed', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      getSectionProgress('path-1', 'module-1', 'section-2');

      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
      });
      updateSectionProgress('path-1', 'module-1', 'section-2', {
        status: 'completed',
      });

      const storage = getProgressStorage();
      const moduleProgress = storage.paths['path-1'].moduleProgress[0];

      expect(moduleProgress.status).toBe('completed');
      expect(moduleProgress.completedAt).toBeDefined();
    });

    it('should update path completion percentage', () => {
      // Create 2 modules with 2 sections each
      getSectionProgress('path-1', 'module-1', 'section-1');
      getSectionProgress('path-1', 'module-1', 'section-2');
      getSectionProgress('path-1', 'module-2', 'section-1');
      getSectionProgress('path-1', 'module-2', 'section-2');

      // Complete all sections in module 1
      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
      });
      updateSectionProgress('path-1', 'module-1', 'section-2', {
        status: 'completed',
      });

      const storage = getProgressStorage();
      const pathProgress = storage.paths['path-1'];

      expect(pathProgress.completionPercentage).toBe(50); // 1 of 2 modules completed
    });
  });

  describe('addTimeSpent', () => {
    it('should add time at all levels', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      addTimeSpent('path-1', 'module-1', 'section-1', 15);

      const storage = getProgressStorage();
      const pathProgress = storage.paths['path-1'];
      const moduleProgress = pathProgress.moduleProgress[0];
      const sectionProgress = moduleProgress.sectionProgress[0];

      expect(sectionProgress.timeSpent).toBe(15);
      expect(moduleProgress.timeSpent).toBe(15);
      expect(pathProgress.totalTimeSpent).toBe(15);
      expect(storage.stats.totalTimeSpent).toBe(15);
    });

    it('should update learning streak', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const storage = getProgressStorage();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      storage.stats.lastActiveDate = yesterday.toISOString();
      storage.stats.currentStreak = 3;
      saveProgressStorage(storage);

      addTimeSpent('path-1', 'module-1', 'section-1', 10);

      const updatedStorage = getProgressStorage();
      expect(updatedStorage.stats.currentStreak).toBe(4);
      expect(updatedStorage.stats.longestStreak).toBeGreaterThanOrEqual(4);
    });

    it('should reset streak if more than one day gap', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const storage = getProgressStorage();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      storage.stats.lastActiveDate = twoDaysAgo.toISOString();
      storage.stats.currentStreak = 5;
      saveProgressStorage(storage);

      addTimeSpent('path-1', 'module-1', 'section-1', 10);

      const updatedStorage = getProgressStorage();
      expect(updatedStorage.stats.currentStreak).toBe(1);
    });
  });

  describe('markSectionComplete', () => {
    it('should mark section as complete and check achievements', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      markSectionComplete('path-1', 'module-1', 'section-1', 95);

      const storage = getProgressStorage();
      const sectionProgress = storage.paths['path-1'].moduleProgress[0].sectionProgress[0];

      expect(sectionProgress.status).toBe('completed');
      expect(sectionProgress.completedAt).toBeDefined();
      expect(sectionProgress.score).toBe(95);
    });

    it('should award first module achievement', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      markSectionComplete('path-1', 'module-1', 'section-1');

      const storage = getProgressStorage();
      const moduleProgress = storage.paths['path-1'].moduleProgress[0];
      
      if (moduleProgress.status === 'completed') {
        const achievements = storage.stats.achievements;
        expect(achievements.some(a => a.id === 'first-module')).toBe(true);
      }
    });
  });

  describe('addExerciseResult', () => {
    it('should add exercise result to section', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const exerciseResult: ExerciseResult = {
        exerciseId: 'exercise-1',
        status: 'completed',
        passed: true,
        submittedCode: 'console.log("Hello");',
        hintsUsed: ['hint-1'],
        timeSpent: 10,
        attempts: 2,
        submittedAt: '2024-01-01T00:00:00Z',
      };

      addExerciseResult('path-1', 'module-1', 'section-1', exerciseResult);

      const storage = getProgressStorage();
      const sectionProgress = storage.paths['path-1'].moduleProgress[0].sectionProgress[0];

      expect(sectionProgress.exerciseResults).toHaveLength(1);
      expect(sectionProgress.exerciseResults![0].exerciseId).toBe('exercise-1');
      expect(sectionProgress.exerciseResults![0].passed).toBe(true);
    });

    it('should update existing exercise result', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const firstResult: ExerciseResult = {
        exerciseId: 'exercise-1',
        status: 'in-progress',
        passed: false,
        hintsUsed: [],
        timeSpent: 5,
        attempts: 1,
      };

      const secondResult: ExerciseResult = {
        exerciseId: 'exercise-1',
        status: 'completed',
        passed: true,
        hintsUsed: ['hint-1'],
        timeSpent: 15,
        attempts: 2,
      };

      addExerciseResult('path-1', 'module-1', 'section-1', firstResult);
      addExerciseResult('path-1', 'module-1', 'section-1', secondResult);

      const storage = getProgressStorage();
      const sectionProgress = storage.paths['path-1'].moduleProgress[0].sectionProgress[0];

      expect(sectionProgress.exerciseResults).toHaveLength(1);
      expect(sectionProgress.exerciseResults![0].passed).toBe(true);
      expect(sectionProgress.exerciseResults![0].attempts).toBe(2);
    });
  });

  describe('addQuizResult', () => {
    it('should add quiz result and update average score', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const quizResult: QuizResult = {
        quizId: 'quiz-1',
        score: 85,
        passed: true,
        answers: [
          { questionId: 'q1', answer: 'A', correct: true, points: 10 },
          { questionId: 'q2', answer: 'B', correct: false, points: 0 },
        ],
        timeSpent: 5,
        attempts: 1,
        submittedAt: '2024-01-01T00:00:00Z',
      };

      addQuizResult('path-1', 'module-1', 'section-1', quizResult);

      const storage = getProgressStorage();
      const sectionProgress = storage.paths['path-1'].moduleProgress[0].sectionProgress[0];

      expect(sectionProgress.quizResults).toHaveLength(1);
      expect(sectionProgress.quizResults![0].score).toBe(85);
      expect(storage.stats.averageScore).toBe(85);
    });

    it('should calculate average score across multiple quizzes', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      getSectionProgress('path-1', 'module-1', 'section-2');
      
      const quiz1: QuizResult = {
        quizId: 'quiz-1',
        score: 80,
        passed: true,
        answers: [],
        timeSpent: 5,
        attempts: 1,
        submittedAt: '2024-01-01T00:00:00Z',
      };

      const quiz2: QuizResult = {
        quizId: 'quiz-2',
        score: 90,
        passed: true,
        answers: [],
        timeSpent: 5,
        attempts: 1,
        submittedAt: '2024-01-01T00:00:00Z',
      };

      addQuizResult('path-1', 'module-1', 'section-1', quiz1);
      addQuizResult('path-1', 'module-1', 'section-2', quiz2);

      const storage = getProgressStorage();
      expect(storage.stats.averageScore).toBe(85); // (80 + 90) / 2
    });
  });

  describe('resetProgress', () => {
    it('should reset section progress', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
        score: 90,
        timeSpent: 20,
      });

      resetProgress('section', 'path-1', 'module-1', 'section-1');

      const storage = getProgressStorage();
      const sectionProgress = storage.paths['path-1'].moduleProgress[0].sectionProgress[0];

      expect(sectionProgress.status).toBe('not-started');
      expect(sectionProgress.timeSpent).toBe(0);
      expect(sectionProgress.score).toBeUndefined();
    });

    it('should reset module progress', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      getSectionProgress('path-1', 'module-1', 'section-2');
      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
      });

      resetProgress('module', 'path-1', 'module-1');

      const storage = getProgressStorage();
      const moduleProgress = storage.paths['path-1'].moduleProgress[0];

      expect(moduleProgress.status).toBe('not-started');
      expect(moduleProgress.sectionProgress).toEqual([]);
      expect(moduleProgress.timeSpent).toBe(0);
    });

    it('should reset path progress', () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      resetProgress('path', 'path-1');

      const storage = getProgressStorage();
      expect(storage.paths['path-1']).toBeUndefined();
    });
  });

  describe('useProgress hook', () => {
    it('should load progress data', async () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const { result } = renderHook(() => 
        useProgress('path-1', 'module-1', 'section-1')
      );

      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.pathProgress).toBeDefined();
      expect(result.current.moduleProgress).toBeDefined();
      expect(result.current.sectionProgress).toBeDefined();
      expect(result.current.stats).toBeDefined();
    });

    it('should update progress through hook', async () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const { result } = renderHook(() => 
        useProgress('path-1', 'module-1', 'section-1')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateProgress({
          type: 'section-started',
          timestamp: new Date().toISOString(),
          userId: 'default-user',
          data: {
            pathId: 'path-1',
            moduleId: 'module-1',
            sectionId: 'section-1',
          },
        });
      });

      expect(result.current.sectionProgress?.status).toBe('in-progress');
    });

    it('should mark section complete through hook', async () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const { result } = renderHook(() => 
        useProgress('path-1', 'module-1', 'section-1')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.markSectionComplete('section-1', 95);
      });

      expect(result.current.sectionProgress?.status).toBe('completed');
      expect(result.current.sectionProgress?.score).toBe(95);
    });

    it('should update time spent through hook', async () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      
      const { result } = renderHook(() => 
        useProgress('path-1', 'module-1', 'section-1')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateTimeSpent(10);
      });

      expect(result.current.sectionProgress?.timeSpent).toBe(10);
    });

    it('should reset progress through hook', async () => {
      getSectionProgress('path-1', 'module-1', 'section-1');
      updateSectionProgress('path-1', 'module-1', 'section-1', {
        status: 'completed',
        timeSpent: 20,
      });
      
      const { result } = renderHook(() => 
        useProgress('path-1', 'module-1', 'section-1')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.resetProgress('section');
      });

      expect(result.current.sectionProgress?.status).toBe('not-started');
      expect(result.current.sectionProgress?.timeSpent).toBe(0);
    });
  });

  describe('Utility functions', () => {
    it('should calculate module progress percentage', () => {
      const moduleProgress: ModuleProgress = {
        moduleId: 'module-1',
        pathId: 'path-1',
        status: 'in-progress',
        sectionProgress: [
          { sectionId: 's1', moduleId: 'module-1', status: 'completed', timeSpent: 10 },
          { sectionId: 's2', moduleId: 'module-1', status: 'completed', timeSpent: 10 },
          { sectionId: 's3', moduleId: 'module-1', status: 'not-started', timeSpent: 0 },
        ],
        timeSpent: 20,
        attempts: 1,
        bookmarked: false,
      };

      const progress = calculateModuleProgress(moduleProgress);
      expect(progress).toBe(67); // 2 of 3 sections completed
    });

    it('should calculate path progress percentage', () => {
      const pathProgress: PathProgress = {
        pathId: 'path-1',
        userId: 'user-1',
        startedAt: '2024-01-01T00:00:00Z',
        lastAccessedAt: '2024-01-01T00:00:00Z',
        moduleProgress: [
          { moduleId: 'm1', pathId: 'path-1', status: 'completed', sectionProgress: [], timeSpent: 30, attempts: 1, bookmarked: false },
          { moduleId: 'm2', pathId: 'path-1', status: 'in-progress', sectionProgress: [], timeSpent: 15, attempts: 1, bookmarked: false },
          { moduleId: 'm3', pathId: 'path-1', status: 'not-started', sectionProgress: [], timeSpent: 0, attempts: 0, bookmarked: false },
        ],
        totalTimeSpent: 45,
        completionPercentage: 0,
      };

      const progress = calculatePathProgress(pathProgress);
      expect(progress).toBe(33); // 1 of 3 modules completed
    });

    it('should get next section to work on', () => {
      const moduleProgress: ModuleProgress = {
        moduleId: 'module-1',
        pathId: 'path-1',
        status: 'in-progress',
        sectionProgress: [
          { sectionId: 's1', moduleId: 'module-1', status: 'completed', timeSpent: 10 },
          { sectionId: 's2', moduleId: 'module-1', status: 'in-progress', timeSpent: 5 },
          { sectionId: 's3', moduleId: 'module-1', status: 'not-started', timeSpent: 0 },
        ],
        timeSpent: 15,
        attempts: 1,
        bookmarked: false,
      };

      const nextSection = getNextSection(moduleProgress);
      expect(nextSection).toBe('s2'); // In-progress takes priority
    });

    it('should get next module to work on', () => {
      const pathProgress: PathProgress = {
        pathId: 'path-1',
        userId: 'user-1',
        startedAt: '2024-01-01T00:00:00Z',
        lastAccessedAt: '2024-01-01T00:00:00Z',
        moduleProgress: [
          { moduleId: 'm1', pathId: 'path-1', status: 'completed', sectionProgress: [], timeSpent: 30, attempts: 1, bookmarked: false },
          { moduleId: 'm2', pathId: 'path-1', status: 'not-started', sectionProgress: [], timeSpent: 0, attempts: 0, bookmarked: false },
        ],
        totalTimeSpent: 30,
        completionPercentage: 50,
      };

      const nextModule = getNextModule(pathProgress);
      expect(nextModule).toBe('m2');
    });
  });
});