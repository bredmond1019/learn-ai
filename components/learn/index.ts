export { default as ModuleViewer } from './ModuleViewer';
export { default as ModuleNavigation } from './ModuleNavigation';
export { default as CodePlayground } from './CodePlayground';

// Interactive Learning Features
export { default as Quiz } from './Quiz';
export { ValidationDisplay, QuizValidationSummary, useQuizValidation } from './QuizValidation';
export { QuizScorer, ScoreDisplay } from './QuizScoring';
export { default as QuizFeedback } from './QuizFeedback';

// Exercise Features
export { CodeValidationEngine, ValidationDisplay as CodeValidationDisplay } from './CodeValidation';
export { default as TestCaseRunner } from './TestCaseRunner';
export { default as HintSystem } from './HintSystem';
export { default as SolutionReveal } from './SolutionReveal';

// Achievement System
export { default as AchievementSystem, DEFAULT_ACHIEVEMENTS } from './AchievementSystem';
export { 
  BadgeComponent, 
  BadgeGrid, 
  BadgeCollection, 
  BadgeShowcase,
  DEFAULT_BADGES,
  createBadge 
} from './BadgeComponents';

// Notifications
export { 
  NotificationProvider, 
  NotificationBell, 
  ToastContainer,
  useNotifications,
  createAchievementNotification,
  createProgressNotification,
  createReminderNotification,
  createCelebrationNotification
} from './NotificationSystem';

// Progress Dashboard
export { default as ProgressDashboard } from './ProgressDashboard';