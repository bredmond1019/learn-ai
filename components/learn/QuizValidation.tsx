'use client';

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import type { QuizQuestion, QuizConfig } from './Quiz';

/**
 * Validation Types
 */
export interface ValidationRule {
  id: string;
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  severity: 'error' | 'warning' | 'info';
  validator: (value: any, question: QuizQuestion) => boolean;
}

export interface ValidationResult {
  questionId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: string[];
}

export interface ValidationError {
  ruleId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Default validation rules
 */
const DEFAULT_VALIDATION_RULES: Record<string, ValidationRule> = {
  required: {
    id: 'required',
    type: 'required',
    message: 'This question requires an answer',
    severity: 'error',
    validator: (value) => value !== undefined && value !== null && value !== ''
  },
  
  multipleChoiceSelection: {
    id: 'multipleChoiceSelection',
    type: 'required',
    message: 'Please select an option',
    severity: 'error',
    validator: (value, question) => {
      if (question.type !== 'multiple-choice') return true;
      return typeof value === 'string' && value.length > 0;
    }
  },
  
  trueFalseSelection: {
    id: 'trueFalseSelection',
    type: 'required',
    message: 'Please select True or False',
    severity: 'error',
    validator: (value, question) => {
      if (question.type !== 'true-false') return true;
      return typeof value === 'boolean';
    }
  },
  
  shortAnswerLength: {
    id: 'shortAnswerLength',
    type: 'format',
    message: 'Answer should be between 1 and 500 characters',
    severity: 'warning',
    validator: (value, question) => {
      if (question.type !== 'short-answer') return true;
      if (!value) return false;
      return typeof value === 'string' && value.length >= 1 && value.length <= 500;
    }
  },
  
  matchingComplete: {
    id: 'matchingComplete',
    type: 'required',
    message: 'Please match all items',
    severity: 'error',
    validator: (value, question) => {
      if (question.type !== 'matching') return true;
      if (!value || !question.items) return false;
      
      return question.items.every(item => 
        value[item.id] && typeof value[item.id] === 'string'
      );
    }
  },
  
  orderingComplete: {
    id: 'orderingComplete',
    type: 'required',
    message: 'Please arrange all items in order',
    severity: 'error',
    validator: (value, question) => {
      if (question.type !== 'ordering') return true;
      if (!value || !Array.isArray(value) || !question.items) return false;
      
      return value.length === question.items.length &&
             question.items.every(item => value.includes(item.id));
    }
  }
};

/**
 * Quiz Validation Utilities
 */
export class QuizValidator {
  private rules: Record<string, ValidationRule>;
  
  constructor(customRules: ValidationRule[] = []) {
    this.rules = { ...DEFAULT_VALIDATION_RULES };
    
    // Add custom rules
    customRules.forEach(rule => {
      this.rules[rule.id] = rule;
    });
  }
  
  /**
   * Validate a single question answer
   */
  validateQuestion(question: QuizQuestion, answer: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: string[] = [];
    
    // Apply relevant validation rules
    Object.values(this.rules).forEach(rule => {
      try {
        const isValid = rule.validator(answer, question);
        
        if (!isValid) {
          const error: ValidationError = {
            ruleId: rule.id,
            message: rule.message,
            severity: rule.severity
          };
          
          if (rule.severity === 'error') {
            errors.push(error);
          } else if (rule.severity === 'warning') {
            warnings.push(error);
          }
        }
      } catch (error) {
        console.error(`Validation rule ${rule.id} failed:`, error);
      }
    });
    
    // Add question-specific suggestions
    this.addSuggestions(question, answer, suggestions);
    
    return {
      questionId: question.id,
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Validate all quiz answers
   */
  validateQuiz(config: QuizConfig, answers: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    config.questions.forEach(question => {
      const answer = answers[question.id];
      results[question.id] = this.validateQuestion(question, answer);
    });
    
    return results;
  }
  
  /**
   * Check if quiz is ready for submission
   */
  canSubmitQuiz(config: QuizConfig, answers: Record<string, any>): {
    canSubmit: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  } {
    const validationResults = this.validateQuiz(config, answers);
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    Object.values(validationResults).forEach(result => {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });
    
    return {
      canSubmit: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  /**
   * Add question-specific suggestions
   */
  private addSuggestions(question: QuizQuestion, answer: any, suggestions: string[]): void {
    switch (question.type) {
      case 'short-answer':
        if (answer && typeof answer === 'string') {
          if (answer.length < 10) {
            suggestions.push('Consider providing a more detailed answer');
          }
          if (!/^[A-Z]/.test(answer.trim())) {
            suggestions.push('Consider starting your answer with a capital letter');
          }
        }
        break;
        
      case 'multiple-choice':
        if (!answer && question.options) {
          suggestions.push(`Choose from ${question.options.length} available options`);
        }
        break;
        
      case 'matching':
        if (answer && question.items) {
          const matchedCount = Object.keys(answer).length;
          const totalCount = question.items.length;
          if (matchedCount < totalCount) {
            suggestions.push(`${totalCount - matchedCount} items still need to be matched`);
          }
        }
        break;
        
      case 'ordering':
        if (answer && Array.isArray(answer) && question.items) {
          if (answer.length !== question.items.length) {
            suggestions.push('Make sure all items are included in your ordering');
          }
        }
        break;
    }
  }
  
  /**
   * Add custom validation rule
   */
  addRule(rule: ValidationRule): void {
    this.rules[rule.id] = rule;
  }
  
  /**
   * Remove validation rule
   */
  removeRule(ruleId: string): void {
    delete this.rules[ruleId];
  }
}

/**
 * Validation Display Component
 */
interface ValidationDisplayProps {
  result: ValidationResult;
  compact?: boolean;
  showSuggestions?: boolean;
}

export function ValidationDisplay({ 
  result, 
  compact = false, 
  showSuggestions = true 
}: ValidationDisplayProps) {
  if (result.isValid && result.warnings.length === 0 && result.suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-2 ${compact ? 'text-sm' : ''}`}>
      {/* Errors */}
      {result.errors.map((error, index) => (
        <div
          key={`error-${index}`}
          className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300"
        >
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error.message}</span>
        </div>
      ))}
      
      {/* Warnings */}
      {result.warnings.map((warning, index) => (
        <div
          key={`warning-${index}`}
          className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{warning.message}</span>
        </div>
      ))}
      
      {/* Suggestions */}
      {showSuggestions && result.suggestions.map((suggestion, index) => (
        <div
          key={`suggestion-${index}`}
          className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-700 dark:text-blue-300"
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{suggestion}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Quiz Validation Summary Component
 */
interface QuizValidationSummaryProps {
  config: QuizConfig;
  answers: Record<string, any>;
  validator: QuizValidator;
  onQuestionFocus?: (questionId: string) => void;
}

export function QuizValidationSummary({
  config,
  answers,
  validator,
  onQuestionFocus
}: QuizValidationSummaryProps) {
  const { canSubmit, errors, warnings } = validator.canSubmitQuiz(config, answers);
  const validationResults = validator.validateQuiz(config, answers);
  
  const answeredQuestions = Object.keys(answers).filter(
    questionId => answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== ''
  ).length;
  
  const totalQuestions = config.questions.length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;
  
  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Quiz Progress</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {answeredQuestions} of {totalQuestions} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Validation Status */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          <h4 className="font-medium">
            {canSubmit ? 'Review Before Submitting' : 'Required Actions'}
          </h4>
          
          {/* Question-specific issues */}
          {config.questions.map(question => {
            const result = validationResults[question.id];
            if (result.isValid && result.warnings.length === 0) return null;
            
            return (
              <div
                key={question.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  result.errors.length > 0
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                }`}
                onClick={() => onQuestionFocus?.(question.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Question {config.questions.indexOf(question) + 1}</span>
                  <div className="flex items-center gap-1">
                    {result.errors.length > 0 && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {result.warnings.length > 0 && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <ValidationDisplay result={result} compact showSuggestions={false} />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Submit Status */}
      <div className={`p-3 rounded-lg border ${
        canSubmit
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
      }`}>
        <div className="flex items-center gap-2">
          {canSubmit ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium">
            {canSubmit
              ? 'Ready to submit quiz'
              : `${errors.length} required field${errors.length === 1 ? '' : 's'} remaining`
            }
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Real-time validation hook
 */
export function useQuizValidation(
  config: QuizConfig,
  answers: Record<string, any>,
  customRules: ValidationRule[] = []
) {
  const [validator] = React.useState(() => new QuizValidator(customRules));
  const [validationResults, setValidationResults] = React.useState<Record<string, ValidationResult>>({});
  
  // Update validation results when answers change
  React.useEffect(() => {
    const results = validator.validateQuiz(config, answers);
    setValidationResults(results);
  }, [config, answers, validator]);
  
  const canSubmit = React.useMemo(() => {
    return validator.canSubmitQuiz(config, answers);
  }, [config, answers, validator]);
  
  return {
    validator,
    validationResults,
    canSubmit: canSubmit.canSubmit,
    errors: canSubmit.errors,
    warnings: canSubmit.warnings,
    validateQuestion: (question: QuizQuestion, answer: any) => 
      validator.validateQuestion(question, answer)
  };
}