'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Target, 
  Zap, 
  Trophy, 
  Medal, 
  Crown, 
  Shield, 
  Flame,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Code,
  CheckCircle,
  Lock,
  Unlock,
  Gift
} from 'lucide-react';
import type { Achievement, LearningStats } from '@/types/progress';

/**
 * Achievement Categories and Criteria
 */
export interface AchievementCriteria {
  id: string;
  category: 'progress' | 'performance' | 'engagement' | 'social' | 'special';
  type: 'milestone' | 'streak' | 'score' | 'time' | 'frequency' | 'mastery';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: {
    color: string;
    background: string;
    border: string;
  };
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  hidden?: boolean; // Secret achievements
  repeatable?: boolean;
  prerequisites?: string[]; // Other achievement IDs required
}

export interface AchievementRequirement {
  type: 'modules_completed' | 'paths_completed' | 'streak_days' | 'score_average' | 
        'time_spent' | 'quiz_perfect' | 'hints_minimal' | 'first_try' | 'speed_completion' |
        'consecutive_perfects' | 'help_others' | 'custom';
  value: number;
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
  description?: string;
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'unlock' | 'customization';
  value: any;
  description: string;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: string;
  currentStreak?: number;
}

/**
 * Default Achievement Definitions
 */
export const DEFAULT_ACHIEVEMENTS: AchievementCriteria[] = [
  // Progress Achievements
  {
    id: 'first-steps',
    category: 'progress',
    type: 'milestone',
    title: 'First Steps',
    description: 'Complete your first learning module',
    icon: CheckCircle,
    badge: { color: 'text-green-600', background: 'bg-green-100', border: 'border-green-200' },
    requirements: [{ type: 'modules_completed', value: 1 }],
    rewards: [{ type: 'points', value: 100, description: '100 bonus points' }],
    difficulty: 'bronze'
  },
  {
    id: 'module-master',
    category: 'progress',
    type: 'milestone',
    title: 'Module Master',
    description: 'Complete 10 learning modules',
    icon: BookOpen,
    badge: { color: 'text-blue-600', background: 'bg-blue-100', border: 'border-blue-200' },
    requirements: [{ type: 'modules_completed', value: 10 }],
    rewards: [{ type: 'points', value: 500, description: '500 bonus points' }],
    difficulty: 'silver'
  },
  {
    id: 'path-pioneer',
    category: 'progress',
    type: 'milestone',
    title: 'Path Pioneer',
    description: 'Complete your first learning path',
    icon: Target,
    badge: { color: 'text-purple-600', background: 'bg-purple-100', border: 'border-purple-200' },
    requirements: [{ type: 'paths_completed', value: 1 }],
    rewards: [{ type: 'points', value: 1000, description: '1000 bonus points' }],
    difficulty: 'gold'
  },
  {
    id: 'learning-legend',
    category: 'progress',
    type: 'milestone',
    title: 'Learning Legend',
    description: 'Complete 5 learning paths',
    icon: Crown,
    badge: { color: 'text-yellow-600', background: 'bg-yellow-100', border: 'border-yellow-200' },
    requirements: [{ type: 'paths_completed', value: 5 }],
    rewards: [
      { type: 'points', value: 5000, description: '5000 bonus points' },
      { type: 'title', value: 'Learning Legend', description: 'Exclusive title' }
    ],
    difficulty: 'legendary'
  },

  // Streak Achievements
  {
    id: 'week-warrior',
    category: 'engagement',
    type: 'streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    badge: { color: 'text-red-600', background: 'bg-red-100', border: 'border-red-200' },
    requirements: [{ type: 'streak_days', value: 7 }],
    rewards: [{ type: 'points', value: 300, description: '300 bonus points' }],
    difficulty: 'bronze',
    repeatable: true
  },
  {
    id: 'month-master',
    category: 'engagement',
    type: 'streak',
    title: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: Shield,
    badge: { color: 'text-orange-600', background: 'bg-orange-100', border: 'border-orange-200' },
    requirements: [{ type: 'streak_days', value: 30 }],
    rewards: [
      { type: 'points', value: 1500, description: '1500 bonus points' },
      { type: 'badge', value: 'streak-master', description: 'Streak Master badge' }
    ],
    difficulty: 'gold',
    repeatable: true
  },

  // Performance Achievements
  {
    id: 'perfectionist',
    category: 'performance',
    type: 'score',
    title: 'Perfectionist',
    description: 'Achieve a perfect score on 5 quizzes',
    icon: Star,
    badge: { color: 'text-yellow-600', background: 'bg-yellow-100', border: 'border-yellow-200' },
    requirements: [{ type: 'quiz_perfect', value: 5 }],
    rewards: [{ type: 'points', value: 750, description: '750 bonus points' }],
    difficulty: 'silver'
  },
  {
    id: 'speed-demon',
    category: 'performance',
    type: 'time',
    title: 'Speed Demon',
    description: 'Complete 10 exercises in under 2 minutes each',
    icon: Zap,
    badge: { color: 'text-blue-600', background: 'bg-blue-100', border: 'border-blue-200' },
    requirements: [{ type: 'speed_completion', value: 10 }],
    rewards: [{ type: 'points', value: 500, description: '500 bonus points' }],
    difficulty: 'silver'
  },
  {
    id: 'high-achiever',
    category: 'performance',
    type: 'score',
    title: 'High Achiever',
    description: 'Maintain an average score of 90% or higher',
    icon: TrendingUp,
    badge: { color: 'text-green-600', background: 'bg-green-100', border: 'border-green-200' },
    requirements: [{ type: 'score_average', value: 90 }],
    rewards: [{ type: 'points', value: 1000, description: '1000 bonus points' }],
    difficulty: 'gold'
  },

  // Mastery Achievements
  {
    id: 'hint-free',
    category: 'performance',
    type: 'mastery',
    title: 'Hint-Free Hero',
    description: 'Complete 5 exercises without using any hints',
    icon: Medal,
    badge: { color: 'text-purple-600', background: 'bg-purple-100', border: 'border-purple-200' },
    requirements: [{ type: 'hints_minimal', value: 0 }],
    rewards: [{ type: 'points', value: 600, description: '600 bonus points' }],
    difficulty: 'silver'
  },
  {
    id: 'first-try-ace',
    category: 'performance',
    type: 'mastery',
    title: 'First Try Ace',
    description: 'Complete 10 exercises correctly on the first attempt',
    icon: Trophy,
    badge: { color: 'text-gold-600', background: 'bg-gold-100', border: 'border-gold-200' },
    requirements: [{ type: 'first_try', value: 10 }],
    rewards: [{ type: 'points', value: 800, description: '800 bonus points' }],
    difficulty: 'gold'
  },

  // Time-based Achievements
  {
    id: 'time-investor',
    category: 'engagement',
    type: 'time',
    title: 'Time Investor',
    description: 'Spend 50 hours learning',
    icon: Clock,
    badge: { color: 'text-blue-600', background: 'bg-blue-100', border: 'border-blue-200' },
    requirements: [{ type: 'time_spent', value: 50 * 60 }], // 50 hours in minutes
    rewards: [{ type: 'points', value: 2000, description: '2000 bonus points' }],
    difficulty: 'gold'
  },

  // Special/Hidden Achievements
  {
    id: 'night-owl',
    category: 'special',
    type: 'frequency',
    title: 'Night Owl',
    description: 'Complete learning sessions between 10 PM and 6 AM for 5 consecutive days',
    icon: Award,
    badge: { color: 'text-indigo-600', background: 'bg-indigo-100', border: 'border-indigo-200' },
    requirements: [{ type: 'custom', value: 5 }],
    rewards: [
      { type: 'points', value: 400, description: '400 bonus points' },
      { type: 'title', value: 'Night Owl', description: 'Night Owl title' }
    ],
    difficulty: 'silver',
    hidden: true
  },
  {
    id: 'comeback-kid',
    category: 'special',
    type: 'frequency',
    title: 'Comeback Kid',
    description: 'Return to learning after a 30-day break',
    icon: Gift,
    badge: { color: 'text-pink-600', background: 'bg-pink-100', border: 'border-pink-200' },
    requirements: [{ type: 'custom', value: 1 }],
    rewards: [{ type: 'points', value: 500, description: '500 welcome back points' }],
    difficulty: 'bronze',
    hidden: true
  }
];

/**
 * Achievement System Props
 */
export interface AchievementSystemProps {
  stats: LearningStats;
  achievements: Achievement[];
  onAchievementClaimed?: (achievement: Achievement) => void;
  showProgress?: boolean;
  compact?: boolean;
}

/**
 * Achievement System Component
 */
export default function AchievementSystem({
  stats,
  achievements,
  onAchievementClaimed,
  showProgress = true,
  compact = false
}: AchievementSystemProps) {
  const [achievementProgress, setAchievementProgress] = useState<Record<string, AchievementProgress>>({});
  const [filter, setFilter] = useState<'all' | 'earned' | 'available' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate progress for all achievements
  useEffect(() => {
    const progress: Record<string, AchievementProgress> = {};

    DEFAULT_ACHIEVEMENTS.forEach(criteria => {
      const isEarned = achievements.some(a => a.id === criteria.id);
      const progressData = calculateAchievementProgress(criteria, stats);

      progress[criteria.id] = {
        achievementId: criteria.id,
        progress: progressData.current,
        maxProgress: progressData.required,
        completed: isEarned,
        completedAt: achievements.find(a => a.id === criteria.id)?.earnedAt
      };
    });

    setAchievementProgress(progress);
  }, [stats, achievements]);

  // Filter achievements based on current filter and category
  const filteredAchievements = React.useMemo(() => {
    let filtered = DEFAULT_ACHIEVEMENTS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filter by status
    switch (filter) {
      case 'earned':
        filtered = filtered.filter(a => achievementProgress[a.id]?.completed);
        break;
      case 'available':
        filtered = filtered.filter(a => 
          !achievementProgress[a.id]?.completed && 
          achievementProgress[a.id]?.progress > 0
        );
        break;
      case 'locked':
        filtered = filtered.filter(a => 
          !achievementProgress[a.id]?.completed && 
          achievementProgress[a.id]?.progress === 0
        );
        break;
    }

    // Hide secret achievements unless earned
    filtered = filtered.filter(a => 
      !a.hidden || achievementProgress[a.id]?.completed
    );

    return filtered;
  }, [selectedCategory, filter, achievementProgress]);

  const categories = ['all', 'progress', 'performance', 'engagement', 'social', 'special'];
  const earnedCount = Object.values(achievementProgress).filter(p => p.completed).length;
  const totalCount = DEFAULT_ACHIEVEMENTS.filter(a => !a.hidden).length;

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Achievements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {earnedCount} / {totalCount} earned
              </p>
            </div>
          </div>
          <Progress value={(earnedCount / totalCount) * 100} className="w-24 h-2" />
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Achievement System Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold">Achievements</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your learning milestones and unlock rewards
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-600">{earnedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              of {totalCount} earned
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((earnedCount / totalCount) * 100)}%</span>
            </div>
            <Progress value={(earnedCount / totalCount) * 100} className="h-3" />
          </div>
        )}
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'earned', 'available', 'locked'].map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant={filter === status ? 'default' : 'outline'}
                  onClick={() => setFilter(status as any)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            criteria={achievement}
            progress={achievementProgress[achievement.id]}
            onClaim={onAchievementClaimed}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No achievements found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try a different filter or category to see more achievements.
          </p>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual Achievement Card Component
 */
interface AchievementCardProps {
  criteria: AchievementCriteria;
  progress?: AchievementProgress;
  onClaim?: (achievement: Achievement) => void;
}

function AchievementCard({ criteria, progress, onClaim }: AchievementCardProps) {
  const IconComponent = criteria.icon;
  const isCompleted = progress?.completed || false;
  const canClaim = isCompleted && onClaim;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'platinum': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'legendary': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${
      isCompleted 
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
        : 'hover:shadow-md'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${criteria.badge.background} ${criteria.badge.border} border`}>
          <IconComponent className={`w-6 h-6 ${criteria.badge.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{criteria.title}</h3>
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {criteria.description}
          </p>

          {/* Progress Bar */}
          {progress && !isCompleted && (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.progress} / {progress.maxProgress}</span>
              </div>
              <Progress 
                value={(progress.progress / progress.maxProgress) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`text-xs ${getDifficultyColor(criteria.difficulty)}`}>
              {criteria.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {criteria.category}
            </Badge>
            {criteria.hidden && (
              <Badge variant="secondary" className="text-xs">
                Hidden
              </Badge>
            )}
          </div>

          {/* Rewards */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Rewards
            </h4>
            {criteria.rewards.map((reward, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                {reward.description}
              </div>
            ))}
          </div>

          {/* Completion Date */}
          {isCompleted && progress?.completedAt && (
            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
              Earned {new Date(progress.completedAt).toLocaleDateString()}
            </div>
          )}

          {/* Claim Button */}
          {canClaim && (
            <Button
              size="sm"
              className="w-full mt-3"
              onClick={() => onClaim({
                id: criteria.id,
                type: criteria.type as any,
                title: criteria.title,
                description: criteria.description,
                earnedAt: new Date().toISOString()
              })}
            >
              <Gift className="w-4 h-4 mr-2" />
              Claim Reward
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Calculate achievement progress based on current stats
 */
function calculateAchievementProgress(
  criteria: AchievementCriteria,
  stats: LearningStats
): { current: number; required: number } {
  const requirement = criteria.requirements[0]; // Simplified - taking first requirement

  switch (requirement.type) {
    case 'modules_completed':
      return { current: stats.modulesCompleted, required: requirement.value };
    case 'paths_completed':
      return { current: stats.pathsCompleted, required: requirement.value };
    case 'streak_days':
      return { current: stats.currentStreak, required: requirement.value };
    case 'score_average':
      return { current: stats.averageScore, required: requirement.value };
    case 'time_spent':
      return { current: stats.totalTimeSpent, required: requirement.value };
    default:
      return { current: 0, required: requirement.value };
  }
}