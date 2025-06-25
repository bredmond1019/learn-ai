import { Module, Section, Exercise, Quiz, QuizQuestion } from '@/types/module';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate module structure
export function validateModule(module: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if module has metadata wrapper structure
  if (!module.metadata) {
    errors.push('Module metadata is required');
    return { valid: false, errors, warnings };
  }

  const metadata = module.metadata;

  // Required fields in metadata
  if (!metadata.id) errors.push('Module ID is required');
  if (!metadata.title) errors.push('Module title is required');
  if (!metadata.description) errors.push('Module description is required');
  if (typeof metadata.order !== 'number') errors.push('Module order must be a number');
  if (!metadata.duration) errors.push('Module duration is required');
  if (!['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty)) {
    errors.push('Module difficulty must be beginner, intermediate, or advanced');
  }

  // Learning objectives (now in metadata)
  if (metadata.objectives) {
    if (!Array.isArray(metadata.objectives)) {
      errors.push('Learning objectives must be an array');
    } else if (metadata.objectives.length === 0) {
      warnings.push('Module should have at least one learning objective');
    }
  } else if (metadata.learningObjectives) {
    // Support both 'objectives' and 'learningObjectives' field names
    if (!Array.isArray(metadata.learningObjectives)) {
      errors.push('Learning objectives must be an array');
    } else if (metadata.learningObjectives.length === 0) {
      warnings.push('Module should have at least one learning objective');
    }
  } else {
    warnings.push('Module should have learning objectives');
  }

  // Sections (at module level, not in metadata)
  if (!Array.isArray(module.sections)) {
    errors.push('Module sections must be an array');
  } else {
    module.sections.forEach((section: any, index: number) => {
      const sectionValidation = validateSection(section);
      errors.push(...sectionValidation.errors.map(err => `Section ${index + 1}: ${err}`));
      warnings.push(...sectionValidation.warnings.map(warn => `Section ${index + 1}: ${warn}`));
    });
  }

  // Exercises (at module level, optional)
  if (module.exercises && Array.isArray(module.exercises)) {
    module.exercises.forEach((exercise: any, index: number) => {
      const exerciseValidation = validateExercise(exercise);
      errors.push(...exerciseValidation.errors.map(err => `Exercise ${index + 1}: ${err}`));
      warnings.push(...exerciseValidation.warnings.map(warn => `Exercise ${index + 1}: ${warn}`));
    });
  }

  // Resources (at module level, optional)
  if (module.resources && !Array.isArray(module.resources)) {
    errors.push('Module resources must be an array');
  }

  // Assessment criteria (at module level, optional)
  if (module.assessmentCriteria && typeof module.assessmentCriteria !== 'object') {
    errors.push('Assessment criteria must be an object');
  }

  // Additional metadata validation
  if (!metadata.type) warnings.push('Module type is recommended');
  if (!metadata.pathId) errors.push('Module pathId is required');
  if (!metadata.version) warnings.push('Module version is recommended');
  if (!metadata.lastUpdated) warnings.push('Module lastUpdated date is recommended');
  if (!metadata.author) warnings.push('Module author is recommended');

  // Tags (in metadata)
  if (!metadata.tags || !Array.isArray(metadata.tags)) {
    warnings.push('Consider adding tags for better discoverability');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate section structure
export function validateSection(section: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!section.id) errors.push('Section ID is required');
  if (!section.title) errors.push('Section title is required');
  if (!section.content) errors.push('Section content is required');
  if (typeof section.order !== 'number') errors.push('Section order must be a number');
  if (!['content', 'quiz', 'exercise'].includes(section.type)) {
    errors.push('Section type must be content, quiz, or exercise');
  }

  // Validate content structure
  if (section.content) {
    if (!section.content.type) {
      errors.push('Section content type is required');
    } else if (!['mdx', 'quiz', 'exercise'].includes(section.content.type)) {
      errors.push('Section content type must be mdx, quiz, or exercise');
    }

    // For MDX content
    if (section.content.type === 'mdx' && !section.content.source) {
      errors.push('MDX content must have a source');
    }

    // Code examples (optional)
    if (section.content.codeExamples && Array.isArray(section.content.codeExamples)) {
      section.content.codeExamples.forEach((example: any, index: number) => {
        if (!example.id) errors.push(`Code example ${index + 1}: ID is required`);
        if (!example.title) errors.push(`Code example ${index + 1}: Title is required`);
        if (!example.language) errors.push(`Code example ${index + 1}: Language is required`);
        if (!example.code) errors.push(`Code example ${index + 1}: Code is required`);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate exercise structure
export function validateExercise(exercise: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!exercise.id) errors.push('Exercise ID is required');
  if (!exercise.title) errors.push('Exercise title is required');
  if (!exercise.description) errors.push('Exercise description is required');
  if (!['coding', 'conceptual', 'project'].includes(exercise.type)) {
    errors.push('Exercise type must be coding, conceptual, or project');
  }
  if (!['easy', 'medium', 'hard'].includes(exercise.difficulty)) {
    errors.push('Exercise difficulty must be easy, medium, or hard');
  }
  if (!Array.isArray(exercise.instructions) || exercise.instructions.length === 0) {
    errors.push('Exercise must have at least one instruction');
  }

  // Validation rules (optional)
  if (exercise.validation && Array.isArray(exercise.validation)) {
    exercise.validation.forEach((rule: any, index: number) => {
      if (!['exact', 'contains', 'regex', 'function'].includes(rule.type)) {
        errors.push(`Validation rule ${index + 1}: Type must be exact, contains, regex, or function`);
      }
      if (!rule.value) errors.push(`Validation rule ${index + 1}: Value is required`);
      if (!rule.message) errors.push(`Validation rule ${index + 1}: Message is required`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate quiz structure
export function validateQuiz(quiz: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!quiz.id) errors.push('Quiz ID is required');
  if (!quiz.title) errors.push('Quiz title is required');
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  } else {
    quiz.questions.forEach((question: any, index: number) => {
      const questionValidation = validateQuizQuestion(question);
      errors.push(...questionValidation.errors.map(err => `Question ${index + 1}: ${err}`));
      warnings.push(...questionValidation.warnings.map(warn => `Question ${index + 1}: ${warn}`));
    });
  }

  if (typeof quiz.passingScore !== 'number' || quiz.passingScore < 0 || quiz.passingScore > 100) {
    errors.push('Quiz passing score must be a number between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate quiz question structure
export function validateQuizQuestion(question: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!question.id) errors.push('Question ID is required');
  if (!question.question) errors.push('Question text is required');
  if (!['multiple-choice', 'true-false', 'code-output'].includes(question.type)) {
    errors.push('Question type must be multiple-choice, true-false, or code-output');
  }
  if (!question.correctAnswer) errors.push('Correct answer is required');
  if (!question.explanation) errors.push('Question explanation is required');
  if (typeof question.points !== 'number' || question.points <= 0) {
    errors.push('Question points must be a positive number');
  }

  // Type-specific validation
  if (question.type === 'multiple-choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Multiple choice questions must have at least 2 options');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


// Validate learning path structure
export function validateLearningPath(path: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!path.id) errors.push('Learning path ID is required');
  if (!path.title) errors.push('Learning path title is required');
  if (!path.description) errors.push('Learning path description is required');
  if (!path.icon) warnings.push('Consider adding an icon for better visual representation');
  if (!path.color) warnings.push('Consider adding a color for better visual representation');
  if (!Array.isArray(path.modules) || path.modules.length === 0) {
    errors.push('Learning path must contain at least one module');
  }
  if (!path.totalDuration) errors.push('Total duration is required');
  if (!['beginner', 'intermediate', 'advanced'].includes(path.difficulty)) {
    errors.push('Learning path difficulty must be beginner, intermediate, or advanced');
  }
  if (!Array.isArray(path.outcomes) || path.outcomes.length === 0) {
    warnings.push('Consider adding learning outcomes for better clarity');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}