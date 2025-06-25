// Module structure TypeScript interfaces

// Main module structure matching the actual JSON format
export interface Module {
  metadata: ModuleMetadata;
  sections: Section[];
  resources?: Resource[];
  exercises?: Exercise[];
  assessmentCriteria?: AssessmentCriteria;
}

// Module metadata matching the actual JSON structure
export interface ModuleMetadata {
  id: string;
  pathId: string;
  title: string;
  description: string;
  duration: string;
  type: 'concept' | 'theory' | 'project' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  prerequisites?: string[];
  objectives: string[];
  tags: string[];
  version: string;
  lastUpdated: string;
  author: string;
  estimatedCompletionTime?: number;
}

// Section structure matching actual JSON
export interface Section {
  id: string;
  title: string;
  type: 'content' | 'quiz' | 'exercise';
  order: number;
  estimatedDuration?: string;
  content: SectionContent;
}

// Section content structure
export interface SectionContent {
  type: 'mdx' | 'quiz' | 'exercise';
  source?: string; // For MDX content
  codeExamples?: CodeExample[];
  
  // For quiz sections
  title?: string;
  description?: string;
  questions?: QuizQuestion[];
  passingScore?: number;
  allowRetries?: boolean;
  showCorrectAnswers?: boolean;
  randomizeQuestions?: boolean;
  
  // For exercise sections
  exerciseType?: 'coding' | 'conceptual' | 'project';
  difficulty?: 'easy' | 'medium' | 'hard';
  instructions?: string[];
  startingCode?: string;
  solution?: string;
  hints?: string[];
  validation?: ValidationRule[];
}

export interface CodeExample {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  highlightLines?: number[];
  runnable?: boolean;
}

export interface CodeTemplate {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  variables?: TemplateVariable[];
  readOnlyRanges?: ReadOnlyRange[];
}

export interface ReadOnlyRange {
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
}

export interface TemplateVariable {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'documentation' | 'guide' | 'reference' | 'tool' | 'paper' | 'tutorial';
  url: string;
  description: string;
  required: boolean;
}

export interface AssessmentCriteria {
  minimumScore: number;
  requiredSections: string[];
  timeTracking: boolean;
  completionCertificate: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'conceptual' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  startingCode?: string;
  solution?: string;
  hints?: string[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'exact' | 'contains' | 'regex' | 'function';
  value: string;
  message: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'code-output';
  question: string;
  points: number;
  options?: QuizOption[];
  correctAnswer?: boolean; // For true-false
  correctAnswers?: string[]; // For multiple-choice
  randomizeOptions?: boolean;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  explanation?: string;
}

// Learning path interfaces
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  level?: string; // Some paths use 'level' instead of 'difficulty'
  duration: string;
  totalDuration: string;
  version: string;
  lastUpdated: string;
  author: string;
  topics: string[];
  prerequisites: string[];
  outcomes: string[];
  modules: string[]; // module IDs
  resources?: Resource[];
  tags: string[];
}

// Progress tracking interfaces
export interface ModuleProgress {
  moduleId: string;
  userId: string;
  completed: boolean;
  completedSections: string[];
  exercisesCompleted: string[];
  quizScore?: number;
  lastAccessedAt: string;
  timeSpent: number; // in minutes
}

// Legacy interfaces for backwards compatibility
export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

// For components that expect the old structure
export interface LegacyModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningObjectives: string[];
  sections: Section[];
  exercises?: Exercise[];
  quiz?: Quiz;
  metadata: ModuleMetadata;
}