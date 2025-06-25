'use client';

import React from 'react';
import { Award, TrendingUp, Clock, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { QuizQuestion, QuizConfig } from './Quiz';
import type { QuizResult, QuizAnswer } from '@/types/progress';

/**
 * Scoring Configuration
 */
export interface ScoringConfig {
  basePoints: Record<string, number>; // Points by difficulty
  bonusMultipliers: {
    timeBonus: number; // Multiplier for completing quickly
    streakBonus: number; // Multiplier for consecutive correct answers
    firstAttemptBonus: number; // Bonus for getting it right on first try
  };
  penalties: {
    timePenalty: number; // Penalty for taking too long
    attemptPenalty: number; // Penalty for multiple attempts
  };
  weightings: {
    category: Record<string, number>; // Weight by question category
    type: Record<string, number>; // Weight by question type
  };
}

/**
 * Default scoring configuration
 */
const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  basePoints: {
    easy: 1,
    medium: 2,
    hard: 3
  },
  bonusMultipliers: {
    timeBonus: 0.2, // 20% bonus for fast completion
    streakBonus: 0.1, // 10% bonus per streak
    firstAttemptBonus: 0.25 // 25% bonus for first attempt
  },
  penalties: {
    timePenalty: 0.1, // 10% penalty for slow completion
    attemptPenalty: 0.15 // 15% penalty per additional attempt
  },
  weightings: {
    category: {
      concepts: 1.0,
      implementation: 1.2,
      advanced: 1.5,
      'best-practices': 1.1
    },
    type: {
      'multiple-choice': 1.0,
      'true-false': 0.8,
      'short-answer': 1.2,
      'code': 1.5,
      'matching': 1.1,
      'ordering': 1.1
    }
  }
};

/**
 * Detailed scoring breakdown
 */
export interface ScoringBreakdown {
  baseScore: number;
  bonusPoints: number;
  penaltyPoints: number;
  weightedScore: number;
  finalScore: number;
  maxPossibleScore: number;
  percentage: number;
  breakdown: {
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
    streakBonus: number;
    attemptBonus: number;
    categoryWeights: Record<string, number>;
    typeWeights: Record<string, number>;
  };
  performance: {
    grade: string;
    level: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

/**
 * Advanced Quiz Scorer
 */
export class QuizScorer {
  private config: ScoringConfig;
  
  constructor(customConfig?: Partial<ScoringConfig>) {
    this.config = {
      ...DEFAULT_SCORING_CONFIG,
      ...customConfig,
      basePoints: { ...DEFAULT_SCORING_CONFIG.basePoints, ...customConfig?.basePoints },
      bonusMultipliers: { ...DEFAULT_SCORING_CONFIG.bonusMultipliers, ...customConfig?.bonusMultipliers },
      penalties: { ...DEFAULT_SCORING_CONFIG.penalties, ...customConfig?.penalties },
      weightings: {
        category: { ...DEFAULT_SCORING_CONFIG.weightings.category, ...customConfig?.weightings?.category },
        type: { ...DEFAULT_SCORING_CONFIG.weightings.type, ...customConfig?.weightings?.type }
      }
    };
  }
  
  /**
   * Calculate detailed score breakdown
   */
  calculateDetailedScore(
    questions: QuizQuestion[],
    answers: QuizAnswer[],
    timeSpent: number, // minutes
    attempts: number = 1,
    timeLimit?: number // minutes
  ): ScoringBreakdown {
    // Calculate base scores
    let totalBasePoints = 0;
    let earnedBasePoints = 0;
    let correctAnswers = 0;
    let streak = 0;
    let maxStreak = 0;
    const categoryScores: Record<string, { earned: number; total: number }> = {};
    const typeScores: Record<string, { earned: number; total: number }> = {};
    
    questions.forEach((question, index) => {
      const answer = answers.find(a => a.questionId === question.id);
      const difficulty = question.difficulty || 'medium';
      const category = question.category || 'general';
      const type = question.type;
      
      const basePoints = this.config.basePoints[difficulty] || this.config.basePoints.medium;
      const categoryWeight = this.config.weightings.category[category] || 1.0;
      const typeWeight = this.config.weightings.type[type] || 1.0;
      
      const weightedPoints = basePoints * categoryWeight * typeWeight;
      
      totalBasePoints += weightedPoints;
      
      // Initialize category/type tracking
      if (!categoryScores[category]) {
        categoryScores[category] = { earned: 0, total: 0 };
      }
      if (!typeScores[type]) {
        typeScores[type] = { earned: 0, total: 0 };
      }
      
      categoryScores[category].total += weightedPoints;
      typeScores[type].total += weightedPoints;
      
      if (answer?.correct) {
        earnedBasePoints += weightedPoints;
        correctAnswers++;
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        
        categoryScores[category].earned += weightedPoints;
        typeScores[type].earned += weightedPoints;
      } else {
        streak = 0;
      }
    });
    
    // Calculate bonuses
    let bonusPoints = 0;
    
    // Time bonus (for completing quickly)
    if (timeLimit && timeSpent < timeLimit * 0.75) {
      const timeBonus = earnedBasePoints * this.config.bonusMultipliers.timeBonus;
      bonusPoints += timeBonus;
    }
    
    // Streak bonus
    if (maxStreak > 2) {
      const streakBonus = earnedBasePoints * this.config.bonusMultipliers.streakBonus * Math.min(maxStreak - 2, 5);
      bonusPoints += streakBonus;
    }
    
    // First attempt bonus
    if (attempts === 1) {
      const firstAttemptBonus = earnedBasePoints * this.config.bonusMultipliers.firstAttemptBonus;
      bonusPoints += firstAttemptBonus;
    }
    
    // Calculate penalties
    let penaltyPoints = 0;
    
    // Time penalty (for taking too long)
    if (timeLimit && timeSpent > timeLimit * 1.25) {
      const timePenalty = earnedBasePoints * this.config.penalties.timePenalty;
      penaltyPoints += timePenalty;
    }
    
    // Attempt penalty
    if (attempts > 1) {
      const attemptPenalty = earnedBasePoints * this.config.penalties.attemptPenalty * (attempts - 1);
      penaltyPoints += attemptPenalty;
    }
    
    // Calculate final scores
    const weightedScore = earnedBasePoints + bonusPoints - penaltyPoints;
    const finalScore = Math.max(0, Math.round(weightedScore));
    const percentage = Math.round((finalScore / totalBasePoints) * 100);
    
    // Determine grade and performance level
    const { grade, level } = this.calculateGrade(percentage);
    const { strengths, weaknesses, recommendations } = this.analyzePerformance(
      categoryScores,
      typeScores,
      percentage,
      timeSpent,
      attempts
    );
    
    return {
      baseScore: Math.round(earnedBasePoints),
      bonusPoints: Math.round(bonusPoints),
      penaltyPoints: Math.round(penaltyPoints),
      weightedScore: Math.round(weightedScore),
      finalScore,
      maxPossibleScore: Math.round(totalBasePoints),
      percentage,
      breakdown: {
        correctAnswers,
        totalQuestions: questions.length,
        timeBonus: timeLimit && timeSpent < timeLimit * 0.75 ? Math.round(earnedBasePoints * this.config.bonusMultipliers.timeBonus) : 0,
        streakBonus: maxStreak > 2 ? Math.round(earnedBasePoints * this.config.bonusMultipliers.streakBonus * Math.min(maxStreak - 2, 5)) : 0,
        attemptBonus: attempts === 1 ? Math.round(earnedBasePoints * this.config.bonusMultipliers.firstAttemptBonus) : 0,
        categoryWeights: Object.fromEntries(
          Object.entries(categoryScores).map(([cat, scores]) => [
            cat,
            scores.total > 0 ? Math.round((scores.earned / scores.total) * 100) : 0
          ])
        ),
        typeWeights: Object.fromEntries(
          Object.entries(typeScores).map(([type, scores]) => [
            type,
            scores.total > 0 ? Math.round((scores.earned / scores.total) * 100) : 0
          ])
        )
      },
      performance: {
        grade,
        level,
        strengths,
        weaknesses,
        recommendations
      }
    };
  }
  
  /**
   * Calculate grade from percentage
   */
  private calculateGrade(percentage: number): { grade: string; level: 'excellent' | 'good' | 'average' | 'below-average' | 'poor' } {
    if (percentage >= 95) return { grade: 'A+', level: 'excellent' };
    if (percentage >= 90) return { grade: 'A', level: 'excellent' };
    if (percentage >= 85) return { grade: 'A-', level: 'excellent' };
    if (percentage >= 80) return { grade: 'B+', level: 'good' };
    if (percentage >= 75) return { grade: 'B', level: 'good' };
    if (percentage >= 70) return { grade: 'B-', level: 'good' };
    if (percentage >= 65) return { grade: 'C+', level: 'average' };
    if (percentage >= 60) return { grade: 'C', level: 'average' };
    if (percentage >= 55) return { grade: 'C-', level: 'average' };
    if (percentage >= 50) return { grade: 'D+', level: 'below-average' };
    if (percentage >= 45) return { grade: 'D', level: 'below-average' };
    return { grade: 'F', level: 'poor' };
  }
  
  /**
   * Analyze performance and provide insights
   */
  private analyzePerformance(
    categoryScores: Record<string, { earned: number; total: number }>,
    typeScores: Record<string, { earned: number; total: number }>,
    percentage: number,
    timeSpent: number,
    attempts: number
  ): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze category performance
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const categoryPercentage = scores.total > 0 ? (scores.earned / scores.total) * 100 : 0;
      if (categoryPercentage >= 80) {
        strengths.push(`Strong performance in ${category} questions`);
      } else if (categoryPercentage < 60) {
        weaknesses.push(`Needs improvement in ${category} concepts`);
        recommendations.push(`Review ${category} materials and practice more questions`);
      }
    });
    
    // Analyze question type performance
    Object.entries(typeScores).forEach(([type, scores]) => {
      const typePercentage = scores.total > 0 ? (scores.earned / scores.total) * 100 : 0;
      if (typePercentage >= 80) {
        strengths.push(`Excellent at ${type.replace('-', ' ')} questions`);
      } else if (typePercentage < 60) {
        weaknesses.push(`Difficulty with ${type.replace('-', ' ')} questions`);
        recommendations.push(`Practice more ${type.replace('-', ' ')} style questions`);
      }
    });
    
    // Analyze time management
    if (timeSpent < 5) {
      strengths.push('Efficient time management');
    } else if (timeSpent > 15) {
      weaknesses.push('Time management could be improved');
      recommendations.push('Practice answering questions more quickly');
    }
    
    // Analyze attempts
    if (attempts === 1) {
      strengths.push('Completed successfully on first attempt');
    } else if (attempts > 2) {
      recommendations.push('Consider reviewing material before attempting quizzes');
    }
    
    // Overall performance recommendations
    if (percentage >= 90) {
      recommendations.push('Excellent work! Consider helping others or exploring advanced topics');
    } else if (percentage >= 70) {
      recommendations.push('Good understanding shown. Focus on areas for improvement');
    } else if (percentage >= 50) {
      recommendations.push('Review the material and retake the quiz to improve understanding');
    } else {
      recommendations.push('Spend more time with the learning materials before retaking');
    }
    
    return { strengths, weaknesses, recommendations };
  }
  
  /**
   * Get scoring configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }
  
  /**
   * Update scoring configuration
   */
  updateConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Score Display Component
 */
interface ScoreDisplayProps {
  breakdown: ScoringBreakdown;
  compact?: boolean;
  showDetails?: boolean;
}

export function ScoreDisplay({ breakdown, compact = false, showDetails = true }: ScoreDisplayProps) {
  const getGradeColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'average': return 'text-yellow-600 dark:text-yellow-400';
      case 'below-average': return 'text-orange-600 dark:text-orange-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getGradeColor(breakdown.performance.level)}`}>
            {breakdown.performance.grade}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {breakdown.percentage}%
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {breakdown.breakdown.correctAnswers} / {breakdown.breakdown.totalQuestions}
            </span>
            <Badge variant="outline" className="text-xs">
              {breakdown.finalScore} pts
            </Badge>
          </div>
          <Progress value={breakdown.percentage} className="h-2" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold mb-2 ${getGradeColor(breakdown.performance.level)}`}>
          {breakdown.performance.grade}
        </div>
        <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          {breakdown.percentage}% ({breakdown.finalScore} / {breakdown.maxPossibleScore} points)
        </div>
        <Progress value={breakdown.percentage} className="h-3 max-w-md mx-auto" />
      </div>
      
      {/* Score Breakdown */}
      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{breakdown.baseScore}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Base Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{breakdown.bonusPoints}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bonus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">-{breakdown.penaltyPoints}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Penalty</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{breakdown.finalScore}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Final</div>
          </div>
        </div>
      )}
      
      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          {/* Bonus Breakdown */}
          {(breakdown.breakdown.timeBonus > 0 || breakdown.breakdown.streakBonus > 0 || breakdown.breakdown.attemptBonus > 0) && (
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Bonus Points
              </h3>
              <div className="space-y-2 text-sm">
                {breakdown.breakdown.timeBonus > 0 && (
                  <div className="flex justify-between">
                    <span>Time Bonus:</span>
                    <span className="font-medium text-green-600">+{breakdown.breakdown.timeBonus}</span>
                  </div>
                )}
                {breakdown.breakdown.streakBonus > 0 && (
                  <div className="flex justify-between">
                    <span>Streak Bonus:</span>
                    <span className="font-medium text-green-600">+{breakdown.breakdown.streakBonus}</span>
                  </div>
                )}
                {breakdown.breakdown.attemptBonus > 0 && (
                  <div className="flex justify-between">
                    <span>First Attempt Bonus:</span>
                    <span className="font-medium text-green-600">+{breakdown.breakdown.attemptBonus}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Category Performance */}
          {Object.keys(breakdown.breakdown.categoryWeights).length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Performance by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(breakdown.breakdown.categoryWeights).map(([category, percentage]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{category.replace('-', ' ')}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Performance Insights */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Insights
            </h3>
            
            {breakdown.performance.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                <ul className="text-sm space-y-1">
                  {breakdown.performance.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {breakdown.performance.weaknesses.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Areas for Improvement</h4>
                <ul className="text-sm space-y-1">
                  {breakdown.performance.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {breakdown.performance.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Recommendations</h4>
                <ul className="text-sm space-y-1">
                  {breakdown.performance.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}