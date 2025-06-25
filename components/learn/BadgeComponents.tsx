'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Star, 
  Trophy, 
  Medal, 
  Crown, 
  Shield, 
  Flame,
  Target,
  Zap,
  CheckCircle,
  Clock,
  BookOpen,
  Code,
  TrendingUp,
  Users,
  Gift,
  Sparkles,
  Heart
} from 'lucide-react';

/**
 * Badge Types and Definitions
 */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'achievement' | 'skill' | 'progress' | 'special' | 'seasonal';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: React.ComponentType<{ className?: string }>;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    border: string;
    glow?: string;
  };
  animation?: 'pulse' | 'bounce' | 'glow' | 'rotate' | 'none';
  shape: 'circle' | 'shield' | 'star' | 'diamond' | 'hexagon';
  size: 'sm' | 'md' | 'lg' | 'xl';
  earnedAt?: string;
  requirements?: string;
}

/**
 * Predefined Badge Styles
 */
const BADGE_STYLES = {
  rarity: {
    common: {
      primary: 'text-gray-600',
      secondary: 'text-gray-500',
      background: 'bg-gray-100',
      border: 'border-gray-300',
      glow: ''
    },
    uncommon: {
      primary: 'text-green-600',
      secondary: 'text-green-500',
      background: 'bg-green-100',
      border: 'border-green-300',
      glow: 'shadow-green-200'
    },
    rare: {
      primary: 'text-blue-600',
      secondary: 'text-blue-500',
      background: 'bg-blue-100',
      border: 'border-blue-300',
      glow: 'shadow-blue-200'
    },
    epic: {
      primary: 'text-purple-600',
      secondary: 'text-purple-500',
      background: 'bg-purple-100',
      border: 'border-purple-300',
      glow: 'shadow-purple-200'
    },
    legendary: {
      primary: 'text-yellow-600',
      secondary: 'text-yellow-500',
      background: 'bg-yellow-100',
      border: 'border-yellow-300',
      glow: 'shadow-yellow-200 shadow-lg'
    }
  },
  category: {
    achievement: { icon: Trophy, label: 'Achievement' },
    skill: { icon: Star, label: 'Skill' },
    progress: { icon: Target, label: 'Progress' },
    special: { icon: Gift, label: 'Special' },
    seasonal: { icon: Sparkles, label: 'Seasonal' }
  }
};

/**
 * Default Badge Definitions
 */
export const DEFAULT_BADGES: BadgeDefinition[] = [
  // Achievement Badges
  {
    id: 'first-module',
    name: 'First Steps',
    description: 'Completed first learning module',
    category: 'achievement',
    rarity: 'common',
    icon: CheckCircle,
    colors: BADGE_STYLES.rarity.common,
    shape: 'circle',
    size: 'md',
    animation: 'none'
  },
  {
    id: 'perfect-score',
    name: 'Perfectionist',
    description: 'Achieved perfect score on quiz',
    category: 'achievement',
    rarity: 'uncommon',
    icon: Star,
    colors: BADGE_STYLES.rarity.uncommon,
    shape: 'star',
    size: 'md',
    animation: 'glow'
  },
  {
    id: 'speed-completion',
    name: 'Speed Demon',
    description: 'Completed exercise under time limit',
    category: 'achievement',
    rarity: 'rare',
    icon: Zap,
    colors: BADGE_STYLES.rarity.rare,
    shape: 'diamond',
    size: 'md',
    animation: 'pulse'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintained 30-day learning streak',
    category: 'achievement',
    rarity: 'epic',
    icon: Flame,
    colors: BADGE_STYLES.rarity.epic,
    shape: 'shield',
    size: 'lg',
    animation: 'bounce'
  },
  {
    id: 'learning-legend',
    name: 'Learning Legend',
    description: 'Completed all learning paths',
    category: 'achievement',
    rarity: 'legendary',
    icon: Crown,
    colors: BADGE_STYLES.rarity.legendary,
    shape: 'hexagon',
    size: 'xl',
    animation: 'glow'
  },

  // Skill Badges
  {
    id: 'javascript-master',
    name: 'JavaScript Master',
    description: 'Mastered JavaScript fundamentals',
    category: 'skill',
    rarity: 'rare',
    icon: Code,
    colors: BADGE_STYLES.rarity.rare,
    shape: 'circle',
    size: 'md',
    animation: 'none'
  },
  {
    id: 'algorithm-expert',
    name: 'Algorithm Expert',
    description: 'Solved 50 algorithm challenges',
    category: 'skill',
    rarity: 'epic',
    icon: TrendingUp,
    colors: BADGE_STYLES.rarity.epic,
    shape: 'diamond',
    size: 'lg',
    animation: 'pulse'
  },

  // Progress Badges
  {
    id: 'module-marathon',
    name: 'Module Marathon',
    description: 'Completed 10 modules in one week',
    category: 'progress',
    rarity: 'uncommon',
    icon: Target,
    colors: BADGE_STYLES.rarity.uncommon,
    shape: 'circle',
    size: 'md',
    animation: 'none'
  },
  {
    id: 'time-investment',
    name: 'Time Investor',
    description: 'Spent 100 hours learning',
    category: 'progress',
    rarity: 'rare',
    icon: Clock,
    colors: BADGE_STYLES.rarity.rare,
    shape: 'shield',
    size: 'md',
    animation: 'none'
  },

  // Special Badges
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined during beta period',
    category: 'special',
    rarity: 'legendary',
    icon: Gift,
    colors: BADGE_STYLES.rarity.legendary,
    shape: 'star',
    size: 'lg',
    animation: 'glow'
  },
  {
    id: 'community-helper',
    name: 'Community Helper',
    description: 'Helped 10 fellow learners',
    category: 'special',
    rarity: 'epic',
    icon: Heart,
    colors: BADGE_STYLES.rarity.epic,
    shape: 'circle',
    size: 'md',
    animation: 'pulse'
  }
];

/**
 * Badge Component Props
 */
export interface BadgeComponentProps {
  badge: BadgeDefinition;
  showTooltip?: boolean;
  interactive?: boolean;
  earned?: boolean;
  onClick?: (badge: BadgeDefinition) => void;
}

/**
 * Main Badge Component
 */
export function BadgeComponent({
  badge,
  showTooltip = true,
  interactive = false,
  earned = true,
  onClick
}: BadgeComponentProps) {
  const IconComponent = badge.icon;
  
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' };
      case 'md': return { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-sm' };
      case 'lg': return { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-base' };
      case 'xl': return { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-lg' };
      default: return { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-sm' };
    }
  };

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      case 'shield': return 'rounded-lg rounded-b-full';
      case 'star': return 'rounded-lg transform rotate-45';
      case 'diamond': return 'rounded-lg transform rotate-45';
      case 'hexagon': return 'rounded-lg';
      case 'heart': return 'rounded-full';
      default: return 'rounded-full';
    }
  };

  const getAnimationClasses = (animation?: string) => {
    switch (animation) {
      case 'pulse': return 'animate-pulse';
      case 'bounce': return 'animate-bounce';
      case 'glow': return 'animate-pulse shadow-lg';
      case 'rotate': return 'animate-spin';
      default: return '';
    }
  };

  const sizeClasses = getSizeClasses(badge.size);
  const shapeClasses = getShapeClasses(badge.shape);
  const animationClasses = earned ? getAnimationClasses(badge.animation) : '';

  return (
    <div className="relative group">
      <div
        className={`
          ${sizeClasses.container}
          ${shapeClasses}
          ${badge.colors.background}
          ${badge.colors.border}
          ${earned ? badge.colors.glow : 'opacity-50 grayscale'}
          ${animationClasses}
          ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          border-2 flex items-center justify-center relative overflow-hidden
        `}
        onClick={() => interactive && onClick?.(badge)}
      >
        {/* Background gradient for legendary badges */}
        {badge.rarity === 'legendary' && earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300 opacity-50" />
        )}
        
        {/* Icon */}
        <IconComponent 
          className={`${sizeClasses.icon} ${badge.colors.primary} relative z-10`} 
        />

        {/* Rarity indicator */}
        {badge.rarity === 'legendary' && earned && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="font-medium">{badge.name}</div>
            <div className="text-gray-300">{badge.description}</div>
            {badge.earnedAt && (
              <div className="text-gray-400 text-xs mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Badge Grid Component
 */
export interface BadgeGridProps {
  badges: BadgeDefinition[];
  earnedBadges?: string[];
  onBadgeClick?: (badge: BadgeDefinition) => void;
  filter?: {
    category?: string;
    rarity?: string;
    earned?: boolean;
  };
  columns?: number;
}

export function BadgeGrid({
  badges,
  earnedBadges = [],
  onBadgeClick,
  filter,
  columns = 6
}: BadgeGridProps) {
  const filteredBadges = React.useMemo(() => {
    let filtered = badges;

    if (filter?.category && filter.category !== 'all') {
      filtered = filtered.filter(b => b.category === filter.category);
    }

    if (filter?.rarity && filter.rarity !== 'all') {
      filtered = filtered.filter(b => b.rarity === filter.rarity);
    }

    if (filter?.earned !== undefined) {
      filtered = filtered.filter(b => 
        filter.earned ? earnedBadges.includes(b.id) : !earnedBadges.includes(b.id)
      );
    }

    return filtered;
  }, [badges, filter, earnedBadges]);

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {filteredBadges.map(badge => (
        <div key={badge.id} className="flex justify-center">
          <BadgeComponent
            badge={badge}
            earned={earnedBadges.includes(badge.id)}
            interactive={!!onBadgeClick}
            onClick={onBadgeClick}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Badge Collection Component
 */
export interface BadgeCollectionProps {
  badges: BadgeDefinition[];
  earnedBadges: string[];
  onBadgeClick?: (badge: BadgeDefinition) => void;
  showFilters?: boolean;
  showStats?: boolean;
}

export function BadgeCollection({
  badges,
  earnedBadges,
  onBadgeClick,
  showFilters = true,
  showStats = true
}: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedRarity, setSelectedRarity] = React.useState<string>('all');
  const [showEarnedOnly, setShowEarnedOnly] = React.useState(false);

  const stats = React.useMemo(() => {
    const total = badges.length;
    const earned = earnedBadges.length;
    const byRarity = badges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const earnedByRarity = badges
      .filter(b => earnedBadges.includes(b.id))
      .reduce((acc, badge) => {
        acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return { total, earned, byRarity, earnedByRarity };
  }, [badges, earnedBadges]);

  const categories = ['all', ...Array.from(new Set(badges.map(b => b.category)))];
  const rarities = ['all', ...Array.from(new Set(badges.map(b => b.rarity)))];

  return (
    <div className="space-y-6">
      {/* Stats */}
      {showStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Badge Collection</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.earned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
            </div>
            {Object.entries(stats.byRarity).map(([rarity, total]) => (
              <div key={rarity} className="text-center">
                <div className="text-2xl font-bold">
                  {stats.earnedByRarity[rarity] || 0} / {total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {rarity}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rarity</label>
              <div className="flex flex-wrap gap-2">
                {rarities.map(rarity => (
                  <Badge
                    key={rarity}
                    variant={selectedRarity === rarity ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedRarity(rarity)}
                  >
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Earned Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="earned-only"
                checked={showEarnedOnly}
                onChange={(e) => setShowEarnedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="earned-only" className="text-sm font-medium">
                Earned only
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Badge Grid */}
      <Card className="p-6">
        <BadgeGrid
          badges={badges}
          earnedBadges={earnedBadges}
          onBadgeClick={onBadgeClick}
          filter={{
            category: selectedCategory,
            rarity: selectedRarity,
            earned: showEarnedOnly ? true : undefined
          }}
        />
      </Card>
    </div>
  );
}

/**
 * Badge Showcase Component (for highlighting recent badges)
 */
export interface BadgeShowcaseProps {
  recentBadges: BadgeDefinition[];
  onViewAll?: () => void;
}

export function BadgeShowcase({ recentBadges, onViewAll }: BadgeShowcaseProps) {
  if (recentBadges.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Badges</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All
          </button>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recentBadges.slice(0, 5).map(badge => (
          <div key={badge.id} className="flex-shrink-0">
            <BadgeComponent badge={badge} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Utility function to create a badge definition
 */
export function createBadge(
  id: string,
  name: string,
  description: string,
  category: BadgeDefinition['category'],
  rarity: BadgeDefinition['rarity'],
  icon: React.ComponentType<{ className?: string }>,
  options: Partial<BadgeDefinition> = {}
): BadgeDefinition {
  return {
    id,
    name,
    description,
    category,
    rarity,
    icon,
    colors: BADGE_STYLES.rarity[rarity],
    shape: 'circle',
    size: 'md',
    animation: 'none',
    ...options
  };
}