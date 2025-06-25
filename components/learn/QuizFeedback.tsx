'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Award, 
  RefreshCw, 
  BookOpen, 
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { ScoreDisplay, type ScoringBreakdown } from './QuizScoring';
import type { QuizQuestion, QuizConfig } from './Quiz';
import type { QuizResult } from '@/types/progress';

/**
 * Feedback Types
 */
export interface QuestionFeedback {
  questionId: string;
  isCorrect: boolean;
  userAnswer: any;
  correctAnswer: any;
  explanation?: string;
  hints?: string[];
  relatedConcepts?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent?: number;
  attempts?: number;
}

export interface QuizFeedback {
  overall: {
    passed: boolean;
    score: number;
    grade: string;
    level: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
    timeSpent: number;
    attempts: number;
  };
  questions: QuestionFeedback[];
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  scoringBreakdown?: ScoringBreakdown;
}

/**
 * Quiz Feedback Props
 */
export interface QuizFeedbackProps {
  config: QuizConfig;
  result: QuizResult;
  questions: QuizQuestion[];
  onRetry?: () => void;
  onContinue?: () => void;
  onReviewMaterial?: () => void;
  showDetailedFeedback?: boolean;
  allowRetry?: boolean;
}

/**
 * Main Quiz Feedback Component
 */
export default function QuizFeedback({
  config,
  result,
  questions,
  onRetry,
  onContinue,
  onReviewMaterial,
  showDetailedFeedback = true,
  allowRetry = true
}: QuizFeedbackProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Generate comprehensive feedback
  const feedback: QuizFeedback = React.useMemo(() => 
    generateFeedback(config, result, questions), [config, result, questions]
  );

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const getResultIcon = () => {
    if (feedback.overall.passed) {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
    return <XCircle className="w-16 h-16 text-red-500" />;
  };

  const getResultMessage = () => {
    if (feedback.overall.passed) {
      switch (feedback.overall.level) {
        case 'excellent':
          return 'Outstanding! You have mastered this material.';
        case 'good':
          return 'Great work! You have a solid understanding.';
        default:
          return 'Good job! You passed the quiz.';
      }
    } else {
      return 'Keep learning! Review the material and try again.';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Results Header */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {getResultIcon()}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {feedback.overall.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {getResultMessage()}
            </p>
          </div>

          {/* Score Display */}
          {feedback.scoringBreakdown ? (
            <ScoreDisplay 
              breakdown={feedback.scoringBreakdown} 
              compact={false}
              showDetails={showDetailedFeedback}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{feedback.overall.score}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.answers.filter(a => a.correct).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{feedback.overall.timeSpent}m</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{feedback.overall.attempts}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Attempts</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {allowRetry && !feedback.overall.passed && onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
            )}
            
            {onContinue && feedback.overall.passed && (
              <Button onClick={onContinue} variant="default">
                Continue Learning
              </Button>
            )}
            
            {onReviewMaterial && (
              <Button onClick={onReviewMaterial} variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Review Material
              </Button>
            )}
            
            <Button
              onClick={() => setShowAllDetails(!showAllDetails)}
              variant="outline"
            >
              {showAllDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </Card>

      {/* Performance Insights */}
      {showDetailedFeedback && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Insights
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            {feedback.insights.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {feedback.insights.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {feedback.insights.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {feedback.insights.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {feedback.insights.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {feedback.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Question-by-Question Review */}
      {(showDetailedFeedback || showAllDetails) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Question Review
            </h3>
            <Badge variant="outline">
              {feedback.questions.filter(q => q.isCorrect).length} / {feedback.questions.length} correct
            </Badge>
          </div>

          <div className="space-y-4">
            {feedback.questions.map((questionFeedback, index) => {
              const question = questions.find(q => q.id === questionFeedback.questionId);
              if (!question) return null;

              const isExpanded = expandedQuestion === question.id;

              return (
                <div key={question.id} className="border rounded-lg overflow-hidden">
                  {/* Question Header */}
                  <div
                    className={`p-4 cursor-pointer transition-colors ${
                      questionFeedback.isCorrect
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    }`}
                    onClick={() => toggleQuestionExpansion(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {questionFeedback.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <Badge 
                              variant={questionFeedback.difficulty === 'hard' ? 'destructive' : 
                                     questionFeedback.difficulty === 'medium' ? 'default' : 'secondary'}
                            >
                              {questionFeedback.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {question.points} pts
                            </Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {question.question}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Details */}
                  {isExpanded && (
                    <div className="p-4 border-t bg-white dark:bg-gray-800">
                      <QuestionFeedbackDetail
                        question={question}
                        feedback={questionFeedback}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      {feedback.insights.nextSteps.length > 0 && (showDetailedFeedback || showAllDetails) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Next Steps
          </h3>
          <ul className="space-y-3">
            {feedback.insights.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/**
 * Question Feedback Detail Component
 */
function QuestionFeedbackDetail({
  question,
  feedback
}: {
  question: QuizQuestion;
  feedback: QuestionFeedback;
}) {
  const renderAnswer = (answer: any, label: string, isCorrect?: boolean) => {
    const colorClass = isCorrect === true ? 'text-green-600 dark:text-green-400' :
                      isCorrect === false ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400';
    
    return (
      <div className={`p-3 border rounded ${colorClass} ${
        isCorrect === true ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
        isCorrect === false ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' :
        'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
      }`}>
        <div className="font-medium mb-1">{label}</div>
        <div>{formatAnswer(answer, question.type)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Answers */}
      <div className="grid md:grid-cols-2 gap-4">
        {renderAnswer(feedback.userAnswer, 'Your Answer', feedback.isCorrect)}
        {!feedback.isCorrect && renderAnswer(feedback.correctAnswer, 'Correct Answer', true)}
      </div>

      {/* Explanation */}
      {feedback.explanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Explanation</h5>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            {feedback.explanation}
          </p>
        </div>
      )}

      {/* Hints */}
      {feedback.hints && feedback.hints.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Hints</h5>
          <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
            {feedback.hints.map((hint, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Concepts */}
      {feedback.relatedConcepts && feedback.relatedConcepts.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Related Concepts</h5>
          <div className="flex flex-wrap gap-2">
            {feedback.relatedConcepts.map((concept, index) => (
              <Badge key={index} variant="outline" className="text-purple-600 dark:text-purple-400">
                {concept}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Performance Stats */}
      {(feedback.timeSpent || feedback.attempts) && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {feedback.timeSpent && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Time: {feedback.timeSpent}s</span>
            </div>
          )}
          {feedback.attempts && feedback.attempts > 1 && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span>Attempts: {feedback.attempts}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Generate comprehensive feedback from quiz results
 */
function generateFeedback(
  config: QuizConfig,
  result: QuizResult,
  questions: QuizQuestion[]
): QuizFeedback {
  const questionFeedbacks: QuestionFeedback[] = questions.map(question => {
    const answer = result.answers.find(a => a.questionId === question.id);
    
    return {
      questionId: question.id,
      isCorrect: answer?.correct || false,
      userAnswer: answer?.answer,
      correctAnswer: getCorrectAnswer(question),
      explanation: question.explanation,
      hints: generateHintsForQuestion(question, answer?.correct || false),
      relatedConcepts: question.category ? [question.category] : [],
      difficulty: question.difficulty || 'medium',
      timeSpent: answer?.timeSpent,
      attempts: 1 // This would come from exercise tracking
    };
  });

  // Generate insights
  const correctCount = questionFeedbacks.filter(q => q.isCorrect).length;
  const totalCount = questionFeedbacks.length;
  const percentage = (correctCount / totalCount) * 100;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  // Analyze performance by category
  const categoryPerformance: Record<string, { correct: number; total: number }> = {};
  questions.forEach(question => {
    const category = question.category || 'general';
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { correct: 0, total: 0 };
    }
    categoryPerformance[category].total++;
    
    const feedback = questionFeedbacks.find(f => f.questionId === question.id);
    if (feedback?.isCorrect) {
      categoryPerformance[category].correct++;
    }
  });

  // Generate category-based insights
  Object.entries(categoryPerformance).forEach(([category, perf]) => {
    const categoryPercentage = (perf.correct / perf.total) * 100;
    if (categoryPercentage >= 80) {
      strengths.push(`Strong understanding of ${category.replace('-', ' ')} concepts`);
    } else if (categoryPercentage < 60) {
      weaknesses.push(`Needs improvement in ${category.replace('-', ' ')} topics`);
      recommendations.push(`Review ${category.replace('-', ' ')} materials and practice more questions`);
    }
  });

  // General performance insights
  if (percentage >= 90) {
    strengths.push('Excellent overall performance');
    nextSteps.push('Consider exploring advanced topics in this subject');
  } else if (percentage >= 70) {
    strengths.push('Good overall understanding demonstrated');
    nextSteps.push('Focus on improving weaker areas identified above');
  } else {
    recommendations.push('Review the course material thoroughly before retaking');
    nextSteps.push('Spend additional time on practice exercises');
  }

  // Time-based insights
  if (result.timeSpent < 5) {
    strengths.push('Efficient completion time');
  } else if (result.timeSpent > 20) {
    recommendations.push('Practice answering questions more quickly to improve time management');
  }

  // Difficulty-based insights
  const hardQuestions = questionFeedbacks.filter(q => q.difficulty === 'hard');
  const hardCorrect = hardQuestions.filter(q => q.isCorrect).length;
  if (hardQuestions.length > 0 && hardCorrect / hardQuestions.length >= 0.8) {
    strengths.push('Excellent performance on challenging questions');
  }

  // Add general next steps
  if (result.passed) {
    nextSteps.push('Continue to the next module or learning path');
    if (percentage < 90) {
      nextSteps.push('Review any concepts you found challenging');
    }
  } else {
    nextSteps.push('Review the learning materials for this topic');
    nextSteps.push('Practice with similar exercises');
    nextSteps.push('Retake the quiz when you feel ready');
  }

  return {
    overall: {
      passed: result.passed,
      score: result.score,
      grade: getGradeFromScore(result.score),
      level: getPerformanceLevel(result.score),
      timeSpent: result.timeSpent,
      attempts: result.attempts
    },
    questions: questionFeedbacks,
    insights: {
      strengths,
      weaknesses,
      recommendations,
      nextSteps
    }
  };
}

/**
 * Get correct answer for a question
 */
function getCorrectAnswer(question: QuizQuestion): any {
  switch (question.type) {
    case 'multiple-choice':
      return question.correctAnswers?.[0] || null;
    case 'true-false':
      return question.correctAnswer;
    case 'short-answer':
      return question.acceptableAnswers?.[0] || null;
    case 'matching':
      return question.items?.reduce((acc, item) => {
        if (item.correctMatchId) {
          acc[item.id] = item.correctMatchId;
        }
        return acc;
      }, {} as Record<string, string>) || {};
    case 'ordering':
      return question.correctOrder || [];
    default:
      return null;
  }
}

/**
 * Generate hints for a question based on whether it was answered correctly
 */
function generateHintsForQuestion(question: QuizQuestion, isCorrect: boolean): string[] {
  if (isCorrect) return [];

  const hints: string[] = [];
  
  switch (question.type) {
    case 'multiple-choice':
      hints.push('Read each option carefully and eliminate obviously wrong answers');
      hints.push('Look for keywords in the question that might appear in the correct answer');
      break;
    case 'true-false':
      hints.push('Look for absolute words like "always" or "never" which often indicate false statements');
      hints.push('Consider if there are any exceptions to the statement');
      break;
    case 'short-answer':
      hints.push('Think about the key concepts related to this topic');
      hints.push('Consider using specific terminology from the learning materials');
      break;
    case 'matching':
      hints.push('Read all items and matches before making any connections');
      hints.push('Start with the matches you are most confident about');
      break;
    case 'ordering':
      hints.push('Think about the logical sequence or chronological order');
      hints.push('Consider dependencies between items');
      break;
  }

  if (question.category) {
    hints.push(`Review the ${question.category.replace('-', ' ')} section of the materials`);
  }

  return hints;
}

/**
 * Format answer for display
 */
function formatAnswer(answer: any, questionType: string): string {
  if (answer === null || answer === undefined) return 'No answer provided';
  
  switch (questionType) {
    case 'multiple-choice':
      return typeof answer === 'string' ? `Option ${answer.toUpperCase()}` : String(answer);
    case 'true-false':
      return answer ? 'True' : 'False';
    case 'short-answer':
      return String(answer);
    case 'matching':
      if (typeof answer === 'object') {
        return Object.entries(answer)
          .map(([key, value]) => `${key} → ${value}`)
          .join(', ');
      }
      return String(answer);
    case 'ordering':
      if (Array.isArray(answer)) {
        return answer.map((item, index) => `${index + 1}. ${item}`).join(', ');
      }
      return String(answer);
    default:
      return String(answer);
  }
}

/**
 * Get grade from score
 */
function getGradeFromScore(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Get performance level from score
 */
function getPerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'below-average' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  if (score >= 45) return 'below-average';
  return 'poor';
}