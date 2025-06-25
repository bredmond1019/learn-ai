/**
 * Progress Tracking Type Definitions
 * 
 * This file defines the type system for tracking user progress through
 * learning modules, including completion status, time tracking, and 
 * achievement data.
 */

/**
 * User progress data for a learning path
 */
export interface PathProgress {
  pathId: string;
  userId: string;
  startedAt: string; // ISO date string
  lastAccessedAt: string; // ISO date string
  completedAt?: string; // ISO date string
  moduleProgress: ModuleProgress[];
  totalTimeSpent: number; // Minutes
  completionPercentage: number; // 0-100
}

/**
 * Module progress tracking
 */
export interface ModuleProgress {
  moduleId: string;
  pathId: string;
  status: ProgressStatus;
  startedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  lastAccessedAt?: string; // ISO date string
  sectionProgress: SectionProgress[];
  score?: number; // Overall module score (0-100)
  timeSpent: number; // Minutes
  attempts: number;
  bookmarked: boolean;
}

/**
 * Section progress tracking
 */
export interface SectionProgress {
  sectionId: string;
  moduleId: string;
  status: ProgressStatus;
  startedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  timeSpent: number; // Minutes
  attempts?: number;
  score?: number; // Section score (0-100)
  exerciseResults?: ExerciseResult[];
  quizResults?: QuizResult[];
  interactionData?: InteractionData;
}

/**
 * Progress status enum
 */
export type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

/**
 * Exercise result tracking
 */
export interface ExerciseResult {
  exerciseId: string;
  status: ProgressStatus;
  passed: boolean;
  submittedCode?: string;
  validationResults?: ValidationResult[];
  hintsUsed: string[]; // Hint IDs
  timeSpent: number; // Minutes
  attempts: number;
  submittedAt?: string; // ISO date string
}

/**
 * Validation result
 */
export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
}

/**
 * Quiz result tracking
 */
export interface QuizResult {
  quizId: string;
  score: number; // 0-100
  passed: boolean;
  answers: QuizAnswer[];
  timeSpent: number; // Minutes
  attempts: number;
  submittedAt: string; // ISO date string
}

/**
 * Quiz answer record
 */
export interface QuizAnswer {
  questionId: string;
  answer: any; // Type depends on question type
  correct: boolean;
  points: number;
  timeSpent?: number; // Seconds per question
}

/**
 * Interaction data for tracking user behavior
 */
export interface InteractionData {
  codeExecutions?: number;
  hintsRevealed?: number;
  videoWatchTime?: number; // Seconds
  resourcesAccessed?: string[]; // Resource IDs
  notes?: string; // User notes
}

/**
 * Achievement/milestone tracking
 */
export interface Achievement {
  id: string;
  type: 'module' | 'path' | 'streak' | 'score' | 'custom';
  title: string;
  description: string;
  earnedAt: string; // ISO date string
  metadata?: Record<string, any>;
}

/**
 * User learning statistics
 */
export interface LearningStats {
  userId: string;
  totalTimeSpent: number; // Minutes
  modulesCompleted: number;
  pathsCompleted: number;
  currentStreak: number; // Days
  longestStreak: number; // Days
  lastActiveDate: string; // ISO date string
  achievements: Achievement[];
  averageScore: number; // 0-100
  preferredLearningTime?: string; // e.g., "morning", "evening"
}

/**
 * Progress update event
 */
export interface ProgressUpdateEvent {
  type: 'section-started' | 'section-completed' | 'exercise-completed' | 
        'quiz-completed' | 'module-completed' | 'path-completed' | 
        'achievement-earned' | 'time-update';
  timestamp: string; // ISO date string
  userId: string;
  data: {
    pathId?: string;
    moduleId?: string;
    sectionId?: string;
    exerciseId?: string;
    quizId?: string;
    achievementId?: string;
    timeSpent?: number;
    score?: number;
    metadata?: Record<string, any>;
  };
}

/**
 * Progress storage schema
 */
export interface ProgressStorage {
  version: string; // Schema version for migrations
  userId: string;
  paths: Record<string, PathProgress>; // Keyed by pathId
  stats: LearningStats;
  lastUpdated: string; // ISO date string
}

/**
 * Progress API response types
 */
export interface ProgressSummary {
  userId: string;
  activePaths: PathProgressSummary[];
  completedPaths: PathProgressSummary[];
  recentActivity: ProgressUpdateEvent[];
  stats: LearningStats;
}

export interface PathProgressSummary {
  pathId: string;
  title: string;
  completionPercentage: number;
  lastAccessedAt: string;
  nextModule?: {
    moduleId: string;
    title: string;
  };
}

/**
 * Progress tracking hooks return types
 */
export interface UseProgressReturn {
  // Progress data
  pathProgress: PathProgress | null;
  moduleProgress: ModuleProgress | null;
  sectionProgress: SectionProgress | null;
  stats: LearningStats | null;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  updateProgress: (event: ProgressUpdateEvent) => Promise<void>;
  markSectionComplete: (sectionId: string, score?: number) => Promise<void>;
  markModuleComplete: (moduleId: string) => Promise<void>;
  updateTimeSpent: (minutes: number) => Promise<void>;
  resetProgress: (scope: 'section' | 'module' | 'path') => Promise<void>;
  addQuizResult: (pathId: string, moduleId: string, sectionId: string, result: QuizResult) => Promise<void>;
}

/**
 * Progress calculation utilities
 */
export interface ProgressCalculation {
  calculateModuleProgress: (moduleProgress: ModuleProgress) => number;
  calculatePathProgress: (pathProgress: PathProgress) => number;
  estimateTimeRemaining: (progress: ModuleProgress | PathProgress) => number;
  getNextSection: (moduleProgress: ModuleProgress) => string | null;
  getNextModule: (pathProgress: PathProgress) => string | null;
}