'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Award, RefreshCw } from 'lucide-react';
import { useProgress } from '@/lib/progress';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { logQuizError } from '@/lib/error-logger';
import type { QuizResult, QuizAnswer } from '@/types/progress';

/**
 * Quiz Types
 */
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'ordering';
  question: string;
  points: number;
  explanation?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  options?: QuizOption[];
  correctAnswers?: string[];
  correctAnswer?: boolean;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  partialCredit?: boolean;
  items?: MatchingItem[];
  matches?: MatchingItem[];
  correctOrder?: string[];
  randomizeOptions?: boolean;
  randomizeItems?: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface MatchingItem {
  id: string;
  content: string;
  correctMatchId?: string;
}

export interface QuizConfig {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  allowRetries: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  timeLimit?: number; // in minutes
}

export interface QuizProps {
  config: QuizConfig;
  pathId: string;
  moduleId: string;
  sectionId: string;
  onComplete?: (result: QuizResult) => void;
  onRetry?: () => void;
}

/**
 * Quiz Component
 */
export default function Quiz({
  config,
  pathId,
  moduleId,
  sectionId,
  onComplete,
  onRetry
}: QuizProps) {
  const { updateProgress, addQuizResult } = useProgress(pathId, moduleId, sectionId);
  
  // Error handler for components
  const handleComponentError = useCallback((error: Error, questionId: string, questionType: string) => {
    logQuizError(error, {
      quizId: config.id,
      questionId,
      questionType,
      action: 'question_render'
    });
  }, [config.id]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config.timeLimit ? config.timeLimit * 60 : null
  );
  const [startTime] = useState(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [showExplanations, setShowExplanations] = useState(false);

  // Randomize questions if configured
  const [questions] = useState(() => {
    const questionsCopy = [...config.questions];
    if (config.randomizeQuestions) {
      return questionsCopy.sort(() => Math.random() - 0.5);
    }
    return questionsCopy;
  });

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  /**
   * Handle answer change
   */
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  /**
   * Navigate to next question
   */
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  /**
   * Navigate to previous question
   */
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  /**
   * Calculate quiz score with error handling
   */
  const calculateScore = useCallback((answers: Record<string, any>): QuizResult => {
    try {
      const questionResults: QuizAnswer[] = [];
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach(question => {
        try {
          const userAnswer = answers[question.id];
          let isCorrect = false;
          let points = 0;

          totalPoints += question.points;

          switch (question.type) {
            case 'multiple-choice':
              if (question.correctAnswers && userAnswer) {
                isCorrect = question.correctAnswers.includes(userAnswer);
                points = isCorrect ? question.points : 0;
              }
              break;

            case 'true-false':
              if (question.correctAnswer !== undefined) {
                isCorrect = userAnswer === question.correctAnswer;
                points = isCorrect ? question.points : 0;
              }
              break;

            case 'short-answer':
              if (question.acceptableAnswers && userAnswer) {
                const normalizedAnswer = question.caseSensitive 
                  ? userAnswer.trim() 
                  : userAnswer.trim().toLowerCase();
                
                const normalizedAcceptable = question.acceptableAnswers.map(ans => 
                  question.caseSensitive ? ans.trim() : ans.trim().toLowerCase()
                );

                isCorrect = normalizedAcceptable.includes(normalizedAnswer);
                points = isCorrect ? question.points : 0;

                // Partial credit for close answers
                if (!isCorrect && question.partialCredit) {
                  const partialMatch = normalizedAcceptable.some(ans => 
                    normalizedAnswer.includes(ans) || ans.includes(normalizedAnswer)
                  );
                  if (partialMatch) {
                    points = Math.floor(question.points * 0.5);
                  }
                }
              }
              break;

            case 'matching':
              if (question.items && userAnswer) {
                const correctMatches = question.items.filter(item => 
                  userAnswer[item.id] === item.correctMatchId
                ).length;
                const totalMatches = question.items.length;
                points = Math.floor((correctMatches / totalMatches) * question.points);
                isCorrect = correctMatches === totalMatches;
              }
              break;

            case 'ordering':
              if (question.correctOrder && userAnswer) {
                const correctOrder = question.correctOrder;
                const userOrder = userAnswer;
                isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
                points = isCorrect ? question.points : 0;
              }
              break;
          }

          earnedPoints += points;

          questionResults.push({
            questionId: question.id,
            answer: userAnswer,
            correct: isCorrect,
            points: points
          });
        } catch (error) {
          logQuizError(error as Error, {
            quizId: config.id,
            questionId: question.id,
            questionType: question.type,
            action: 'score_calculation',
            userAnswer: answers[question.id]
          });
          // Add a failed result for this question
          questionResults.push({
            questionId: question.id,
            answer: answers[question.id],
            correct: false,
            points: 0
          });
        }
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes

      return {
        quizId: config.id,
        score,
        passed: score >= config.passingScore,
        answers: questionResults,
        timeSpent,
        attempts,
        submittedAt: new Date().toISOString()
      };
    } catch (error) {
      logQuizError(error as Error, {
        quizId: config.id,
        action: 'calculate_score_critical_error'
      });
      // Return a default failed result
      return {
        quizId: config.id,
        score: 0,
        passed: false,
        answers: [],
        timeSpent: Math.round((Date.now() - startTime) / 1000 / 60),
        attempts,
        submittedAt: new Date().toISOString()
      };
    }
  }, [questions, config.id, config.passingScore, startTime, attempts]);

  /**
   * Submit quiz with error handling
   */
  const handleSubmit = useCallback(async () => {
    if (isSubmitted) return;

    try {
      const quizResult = calculateScore(answers);
      setResult(quizResult);
      setIsSubmitted(true);

      // Show explanations if configured
      if (config.showCorrectAnswers) {
        setShowExplanations(true);
      }

      // Save result to progress
      try {
        await addQuizResult(pathId, moduleId, sectionId, quizResult);
      } catch (error) {
        logQuizError(error as Error, {
          quizId: config.id,
          action: 'save_quiz_result'
        });
        // Continue even if saving fails - user can still see results
      }

      // Call completion callback
      if (onComplete) {
        try {
          onComplete(quizResult);
        } catch (error) {
          logQuizError(error as Error, {
            quizId: config.id,
            action: 'on_complete_callback'
          });
        }
      }
    } catch (error) {
      logQuizError(error as Error, {
        quizId: config.id,
        action: 'quiz_submission_critical_error'
      });
      // Create a minimal error result
      const errorResult: QuizResult = {
        quizId: config.id,
        score: 0,
        passed: false,
        answers: [],
        timeSpent: Math.round((Date.now() - startTime) / 1000 / 60),
        attempts,
        submittedAt: new Date().toISOString()
      };
      setResult(errorResult);
      setIsSubmitted(true);
    }
  }, [
    isSubmitted,
    calculateScore,
    answers,
    config.showCorrectAnswers,
    config.id,
    addQuizResult,
    pathId,
    moduleId,
    sectionId,
    onComplete,
    startTime,
    attempts
  ]);

  /**
   * Retry quiz
   */
  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(config.timeLimit ? config.timeLimit * 60 : null);
    setIsSubmitted(false);
    setResult(null);
    setAttempts(prev => prev + 1);
    setShowExplanations(false);

    if (onRetry) {
      onRetry();
    }
  }, [config.timeLimit, onRetry]);

  /**
   * Format time remaining
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results screen
  if (isSubmitted && result) {
    return (
      <ComponentErrorBoundary
        componentName="QuizResults"
        onError={(error, errorInfo) => {
          logQuizError(error, {
            quizId: config.id,
            action: 'results_display'
          });
        }}
      >
        <Card className="w-full max-w-4xl mx-auto p-6">
          <div className="text-center space-y-6">
            {/* Results Header */}
            <ComponentErrorBoundary
              componentName="QuizResultsHeader"
              onError={(error, errorInfo) => {
                logQuizError(error, {
                  quizId: config.id,
                  action: 'results_header_display'
                });
              }}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  {result.passed ? (
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-500" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {result.passed ? 'Congratulations!' : 'Keep Learning!'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {result.passed 
                      ? `You passed the quiz with a score of ${result.score}%`
                      : `You scored ${result.score}%. You need ${config.passingScore}% to pass.`
                    }
                  </p>
                </div>
              </div>
            </ComponentErrorBoundary>

            {/* Score Display */}
            <ComponentErrorBoundary
              componentName="QuizScoreDisplay"
              onError={(error, errorInfo) => {
                logQuizError(error, {
                  quizId: config.id,
                  action: 'score_display'
                });
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.answers.filter(a => a.correct).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.timeSpent}m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{attempts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Attempts</div>
                </div>
              </div>
            </ComponentErrorBoundary>

            {/* Actions */}
            <ComponentErrorBoundary
              componentName="QuizActions"
              onError={(error, errorInfo) => {
                logQuizError(error, {
                  quizId: config.id,
                  action: 'quiz_actions'
                });
              }}
            >
              <div className="flex justify-center gap-4">
                {config.allowRetries && !result.passed && (
                  <Button onClick={handleRetry} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Quiz
                  </Button>
                )}
                {showExplanations && (
                  <Button
                    onClick={() => setShowExplanations(!showExplanations)}
                    variant="outline"
                  >
                    {showExplanations ? 'Hide' : 'Show'} Explanations
                  </Button>
                )}
              </div>
            </ComponentErrorBoundary>

            {/* Explanations */}
            {showExplanations && (
              <ComponentErrorBoundary
                componentName="QuizExplanations"
                onError={(error, errorInfo) => {
                  logQuizError(error, {
                    quizId: config.id,
                    action: 'explanations_display'
                  });
                }}
              >
                <div className="mt-8 space-y-6 text-left">
                  <h3 className="text-lg font-semibold">Review & Explanations</h3>
                  {questions.map((question, index) => {
                    const answer = result.answers.find(a => a.questionId === question.id);
                    if (!answer) return null;

                    return (
                      <ComponentErrorBoundary
                        key={question.id}
                        componentName="QuizQuestionExplanation"
                        onError={(error, errorInfo) => {
                          logQuizError(error, {
                            quizId: config.id,
                            questionId: question.id,
                            action: 'question_explanation_display'
                          });
                        }}
                      >
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {answer.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">Question {index + 1}</h4>
                                <Badge variant={answer.correct ? 'default' : 'secondary'}>
                                  {answer.points} pts
                                </Badge>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {question.question}
                              </p>
                              {question.explanation && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </ComponentErrorBoundary>
                    );
                  })}
                </div>
              </ComponentErrorBoundary>
            )}
          </div>
        </Card>
      </ComponentErrorBoundary>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{config.title}</h2>
            {config.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {config.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeRemaining < 60 ? 'text-red-500' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <Badge variant="outline">
              {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress 
          value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
          className="w-full h-2"
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <ComponentErrorBoundary
          componentName="QuizQuestionRenderer"
          onError={(error, errorInfo) => {
            logQuizError(error, {
              quizId: config.id,
              questionId: currentQuestion.id,
              questionType: currentQuestion.type,
              action: 'question_render'
            });
          }}
        >
          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
            disabled={isSubmitted}
            onError={handleComponentError}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={isSubmitted}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Question Renderer Component
 */
interface QuestionRendererProps {
  question: QuizQuestion;
  answer: any;
  onAnswerChange: (questionId: string, answer: any) => void;
  disabled?: boolean;
  onError: (error: Error, questionId: string, questionType: string) => void;
}

function QuestionRenderer({ 
  question, 
  answer, 
  onAnswerChange, 
  disabled = false,
  onError
}: QuestionRendererProps) {
  const handleChange = useCallback((value: any) => {
    onAnswerChange(question.id, value);
  }, [question.id, onAnswerChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="mt-1">
          {question.points} pts
        </Badge>
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          {question.type === 'multiple-choice' && (
            <ComponentErrorBoundary
              componentName="MultipleChoiceQuestion"
              onError={(error, errorInfo) => {
                onError(error, question.id, 'multiple-choice');
              }}
            >
              <MultipleChoiceQuestion
                question={question}
                answer={answer}
                onChange={handleChange}
                disabled={disabled}
              />
            </ComponentErrorBoundary>
          )}
          
          {question.type === 'true-false' && (
            <ComponentErrorBoundary
              componentName="TrueFalseQuestion"
              onError={(error, errorInfo) => {
                onError(error, question.id, 'true-false');
              }}
            >
              <TrueFalseQuestion
                answer={answer}
                onChange={handleChange}
                disabled={disabled}
              />
            </ComponentErrorBoundary>
          )}
          
          {question.type === 'short-answer' && (
            <ComponentErrorBoundary
              componentName="ShortAnswerQuestion"
              onError={(error, errorInfo) => {
                onError(error, question.id, 'short-answer');
              }}
            >
              <ShortAnswerQuestion
                answer={answer}
                onChange={handleChange}
                disabled={disabled}
              />
            </ComponentErrorBoundary>
          )}
          
          {question.type === 'matching' && (
            <ComponentErrorBoundary
              componentName="MatchingQuestion"
              onError={(error, errorInfo) => {
                onError(error, question.id, 'matching');
              }}
            >
              <MatchingQuestion
                question={question}
                answer={answer}
                onChange={handleChange}
                disabled={disabled}
              />
            </ComponentErrorBoundary>
          )}
          
          {question.type === 'ordering' && (
            <ComponentErrorBoundary
              componentName="OrderingQuestion"
              onError={(error, errorInfo) => {
                onError(error, question.id, 'ordering');
              }}
            >
              <OrderingQuestion
                question={question}
                answer={answer}
                onChange={handleChange}
                disabled={disabled}
              />
            </ComponentErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple Choice Question Component
 */
function MultipleChoiceQuestion({ 
  question, 
  answer, 
  onChange, 
  disabled 
}: {
  question: QuizQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  try {
    const options = question.randomizeOptions && question.options
      ? [...question.options].sort(() => Math.random() - 0.5)
      : question.options || [];

    if (!options.length) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">No options available for this question.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {options.map((option) => {
          if (!option || !option.id || !option.text) {
            console.warn('Invalid option data:', option);
            return null;
          }
          
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                answer === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={answer === option.id}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="text-blue-600"
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    );
  } catch (error) {
    logQuizError(error as Error, {
      questionId: question.id,
      questionType: 'multiple-choice',
      action: 'render_multiple_choice'
    });
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Error loading multiple choice options.</p>
      </div>
    );
  }
}

/**
 * True/False Question Component
 */
function TrueFalseQuestion({ 
  answer, 
  onChange, 
  disabled 
}: {
  answer: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  try {
    return (
      <div className="space-y-2">
        {[true, false].map((value) => (
          <label
            key={value.toString()}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              answer === value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="true-false"
              checked={answer === value}
              onChange={() => onChange(value)}
              disabled={disabled}
              className="text-blue-600"
            />
            <span>{value ? 'True' : 'False'}</span>
          </label>
        ))}
      </div>
    );
  } catch (error) {
    logQuizError(error as Error, {
      questionType: 'true-false',
      action: 'render_true_false'
    });
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Error loading true/false options.</p>
      </div>
    );
  }
}

/**
 * Short Answer Question Component
 */
function ShortAnswerQuestion({ 
  answer, 
  onChange, 
  disabled 
}: {
  answer: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  try {
    return (
      <div>
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your answer..."
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
    );
  } catch (error) {
    logQuizError(error as Error, {
      questionType: 'short-answer',
      action: 'render_short_answer'
    });
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Error loading text input.</p>
      </div>
    );
  }
}

/**
 * Matching Question Component
 */
function MatchingQuestion({ 
  question, 
  answer, 
  onChange, 
  disabled 
}: {
  question: QuizQuestion;
  answer: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
}) {
  try {
    const items = question.randomizeItems && question.items
      ? [...question.items].sort(() => Math.random() - 0.5)
      : question.items || [];

    const matches = question.matches || [];

    if (!items.length || !matches.length) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">No matching items available for this question.</p>
        </div>
      );
    }

    const handleMatch = (itemId: string, matchId: string) => {
      try {
        const newAnswer = { ...answer, [itemId]: matchId };
        onChange(newAnswer);
      } catch (error) {
        logQuizError(error as Error, {
          questionId: question.id,
          questionType: 'matching',
          action: 'handle_match_selection'
        });
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Items</h4>
          <div className="space-y-2">
            {items.map((item) => {
              if (!item || !item.id || !item.content) {
                console.warn('Invalid item data:', item);
                return null;
              }
              
              return (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">{item.content}</div>
                  <select
                    value={answer?.[item.id] || ''}
                    onChange={(e) => handleMatch(item.id, e.target.value)}
                    disabled={disabled}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select a match...</option>
                    {matches.map((match) => {
                      if (!match || !match.id || !match.content) {
                        console.warn('Invalid match data:', match);
                        return null;
                      }
                      return (
                        <option key={match.id} value={match.id}>
                          {match.content}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Matches</h4>
          <div className="space-y-2">
            {matches.map((match) => {
              if (!match || !match.id || !match.content) {
                console.warn('Invalid match data:', match);
                return null;
              }
              
              return (
                <div key={match.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {match.content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logQuizError(error as Error, {
      questionId: question.id,
      questionType: 'matching',
      action: 'render_matching_question'
    });
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Error loading matching question.</p>
      </div>
    );
  }
}

/**
 * Ordering Question Component
 */
function OrderingQuestion({ 
  question, 
  answer, 
  onChange, 
  disabled 
}: {
  question: QuizQuestion;
  answer: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}) {
  try {
    const items = question.items || [];
    
    if (!items.length) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">No items available for ordering.</p>
        </div>
      );
    }
    
    const [currentOrder, setCurrentOrder] = useState<string[]>(
      answer || items.map(item => item.id)
    );

    const moveItem = (fromIndex: number, toIndex: number) => {
      try {
        const newOrder = [...currentOrder];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        setCurrentOrder(newOrder);
        onChange(newOrder);
      } catch (error) {
        logQuizError(error as Error, {
          questionId: question.id,
          questionType: 'ordering',
          action: 'move_ordering_item'
        });
      }
    };

    return (
      <div className="space-y-2">
        {currentOrder.map((itemId, index) => {
          const item = items.find(i => i.id === itemId);
          if (!item || !item.content) {
            console.warn('Invalid item data for ordering:', item);
            return null;
          }

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={disabled || index === 0}
                  className="h-6 w-6 p-0"
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveItem(index, Math.min(currentOrder.length - 1, index + 1))}
                  disabled={disabled || index === currentOrder.length - 1}
                  className="h-6 w-6 p-0"
                >
                  ↓
                </Button>
              </div>
              <div className="flex-1">
                <span className="font-medium">{index + 1}.</span> {item.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    logQuizError(error as Error, {
      questionId: question.id,
      questionType: 'ordering',
      action: 'render_ordering_question'
    });
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Error loading ordering question.</p>
      </div>
    );
  }
}