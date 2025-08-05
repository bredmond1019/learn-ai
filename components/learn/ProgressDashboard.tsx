'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  Zap, 
  Calendar,
  BarChart,
  PieChart,
  Activity,
  Star,
  Trophy,
  Flame,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useProgress } from '@/lib/client/progress';
import type { 
  PathProgress, 
  ModuleProgress, 
  LearningStats, 
  Achievement 
} from '@/types/progress';

/**
 * Dashboard Data Types
 */
export interface DashboardData {
  stats: LearningStats;
  paths: PathProgress[];
  recentActivity: ActivityItem[];
  achievements: Achievement[];
  streakData: StreakData;
  timeDistribution: TimeDistribution[];
  performanceMetrics: PerformanceMetrics;
}

export interface ActivityItem {
  id: string;
  type: 'module_completed' | 'quiz_passed' | 'exercise_solved' | 'path_started' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: string;
  streakHistory: Array<{ date: string; active: boolean }>;
}

export interface TimeDistribution {
  category: string;
  minutes: number;
  percentage: number;
  color: string;
}

export interface PerformanceMetrics {
  averageScore: number;
  scoreHistory: Array<{ date: string; score: number }>;
  completionRate: number;
  timeEfficiency: number;
  difficultyProgression: Array<{ level: string; completed: number; total: number }>;
}

/**
 * Progress Dashboard Props
 */
export interface ProgressDashboardProps {
  userId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  showDetailed?: boolean;
  onPathSelect?: (pathId: string) => void;
  onModuleSelect?: (pathId: string, moduleId: string) => void;
}

/**
 * Main Progress Dashboard Component
 */
export default function ProgressDashboard({
  userId,
  timeRange = 'month',
  showDetailed = true,
  onPathSelect,
  onModuleSelect
}: ProgressDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { stats } = useProgress('', ''); // Get overall stats

  // Mock data - in production, this would come from API
  const dashboardData: DashboardData = useMemo(() => ({
    stats: stats || {
      userId: userId || 'default',
      totalTimeSpent: 1250, // minutes
      modulesCompleted: 23,
      pathsCompleted: 3,
      currentStreak: 7,
      longestStreak: 15,
      lastActiveDate: new Date().toISOString(),
      achievements: [],
      averageScore: 87
    },
    paths: [], // Would be populated from API
    recentActivity: generateMockActivity(),
    achievements: [], // Would be populated from API
    streakData: {
      current: 7,
      longest: 15,
      lastActivity: new Date().toISOString(),
      streakHistory: generateStreakHistory()
    },
    timeDistribution: [
      { category: 'Concepts', minutes: 450, percentage: 36, color: '#3B82F6' },
      { category: 'Exercises', minutes: 380, percentage: 30, color: '#10B981' },
      { category: 'Quizzes', minutes: 250, percentage: 20, color: '#F59E0B' },
      { category: 'Projects', minutes: 170, percentage: 14, color: '#EF4444' }
    ],
    performanceMetrics: {
      averageScore: 87,
      scoreHistory: generateScoreHistory(),
      completionRate: 0.92,
      timeEfficiency: 0.85,
      difficultyProgression: [
        { level: 'Beginner', completed: 15, total: 15 },
        { level: 'Intermediate', completed: 8, total: 12 },
        { level: 'Advanced', completed: 2, total: 8 }
      ]
    }
  }), [stats, userId]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            {dashboardData.streakData.current} day streak
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Modules Completed"
          value={dashboardData.stats.modulesCompleted}
          change={+3}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Paths Completed"
          value={dashboardData.stats.pathsCompleted}
          change={+1}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Time Spent"
          value={formatTime(dashboardData.stats.totalTimeSpent)}
          change={+12}
          color="purple"
        />
        <StatCard
          icon={Trophy}
          label="Average Score"
          value={`${dashboardData.stats.averageScore}%`}
          change={+5}
          color="yellow"
        />
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learning Streak */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Learning Streak
                </h3>
                <Badge variant="outline">
                  {dashboardData.streakData.current} days
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {dashboardData.streakData.current}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current streak
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Best: {dashboardData.streakData.longest} days
                  </div>
                </div>
                
                <StreakCalendar streakData={dashboardData.streakData} />
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </div>

          {/* Time Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Time Distribution
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {dashboardData.timeDistribution.map(item => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.category}</span>
                      <span className="font-medium">{formatTime(item.minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500 w-10">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <PieChart className="w-full h-full text-gray-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {formatTime(dashboardData.stats.totalTimeSpent)}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Learning Paths */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Learning Paths</h3>
              <div className="space-y-4">
                {/* Mock learning paths */}
                <PathProgressItem
                  path={{
                    pathId: 'mcp-fundamentals',
                    userId: 'user',
                    title: 'MCP Fundamentals',
                    completionPercentage: 75,
                    currentModule: 'Building Tools',
                    totalModules: 8,
                    completedModules: 6
                  }}
                  onSelect={onPathSelect}
                />
                <PathProgressItem
                  path={{
                    pathId: 'agentic-workflows',
                    userId: 'user',
                    title: 'Agentic AI Workflows',
                    completionPercentage: 45,
                    currentModule: 'Agent Architecture',
                    totalModules: 10,
                    completedModules: 4
                  }}
                  onSelect={onPathSelect}
                />
                <PathProgressItem
                  path={{
                    pathId: 'production-ai',
                    userId: 'user',
                    title: 'Production AI Systems',
                    completionPercentage: 20,
                    currentModule: 'Getting Started',
                    totalModules: 12,
                    completedModules: 2
                  }}
                  onSelect={onPathSelect}
                />
              </div>
            </Card>

            {/* Difficulty Progression */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Difficulty Progression</h3>
              <div className="space-y-4">
                {dashboardData.performanceMetrics.difficultyProgression.map(level => (
                  <div key={level.level}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{level.level}</span>
                      <span>{level.completed}/{level.total}</span>
                    </div>
                    <Progress 
                      value={(level.completed / level.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Weekly Progress
            </h3>
            <WeeklyProgressChart />
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Score Trends */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Score Trends</h3>
              <ScoreTrendChart scores={dashboardData.performanceMetrics.scoreHistory} />
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <MetricItem
                  label="Completion Rate"
                  value={`${Math.round(dashboardData.performanceMetrics.completionRate * 100)}%`}
                  description="Exercises completed successfully"
                  color="green"
                />
                <MetricItem
                  label="Time Efficiency"
                  value={`${Math.round(dashboardData.performanceMetrics.timeEfficiency * 100)}%`}
                  description="Average time vs. expected time"
                  color="blue"
                />
                <MetricItem
                  label="Average Score"
                  value={`${dashboardData.performanceMetrics.averageScore}%`}
                  description="Mean score across all quizzes"
                  color="purple"
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <AchievementProgress achievements={dashboardData.achievements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {change > 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+{change}</span>
                </>
              ) : change < 0 ? (
                <>
                  <ArrowDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">{change}</span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">0</span>
                </>
              )}
              <span className="text-gray-500">this week</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({ activity }: { activity: ActivityItem }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'module_completed': return CheckCircle;
      case 'quiz_passed': return Star;
      case 'exercise_solved': return Zap;
      case 'path_started': return PlayCircle;
      case 'achievement_earned': return Trophy;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'module_completed': return 'text-green-500';
      case 'quiz_passed': return 'text-yellow-500';
      case 'exercise_solved': return 'text-blue-500';
      case 'path_started': return 'text-purple-500';
      case 'achievement_earned': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const Icon = getIcon(activity.type);
  const timeAgo = formatTimeAgo(activity.timestamp);

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <Icon className={`w-4 h-4 mt-0.5 ${getColor(activity.type)}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{activity.title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {activity.description}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {timeAgo}
        </div>
      </div>
    </div>
  );
}

/**
 * Path Progress Item Component
 */
interface PathProgressItemProps {
  path: {
    pathId: string;
    userId: string;
    title: string;
    completionPercentage: number;
    currentModule: string;
    totalModules: number;
    completedModules: number;
  };
  onSelect?: (pathId: string) => void;
}

function PathProgressItem({ path, onSelect }: PathProgressItemProps) {
  return (
    <div 
      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={() => onSelect?.(path.pathId)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{path.title}</h4>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Current: {path.currentModule}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{path.completedModules} / {path.totalModules} modules</span>
          <span>{path.completionPercentage}%</span>
        </div>
        <Progress value={path.completionPercentage} className="h-2" />
      </div>
    </div>
  );
}

/**
 * Metric Item Component
 */
interface MetricItemProps {
  label: string;
  value: string;
  description: string;
  color: 'green' | 'blue' | 'purple';
}

function MetricItem({ label, value, description, color }: MetricItemProps) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}

/**
 * Streak Calendar Component
 */
function StreakCalendar({ streakData }: { streakData: StreakData }) {
  const today = new Date();
  const daysToShow = 7;
  const days = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return (
    <div className="flex justify-between">
      {days.map((day, index) => {
        const isActive = index < streakData.current;
        const isToday = day.toDateString() === today.toDateString();
        
        return (
          <div
            key={day.toISOString()}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isActive 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            } ${isToday ? 'ring-2 ring-orange-300' : ''}`}
          >
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Score Trend Chart Component (simplified)
 */
function ScoreTrendChart({ scores }: { scores: Array<{ date: string; score: number }> }) {
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  
  return (
    <div className="space-y-4">
      <div className="h-32 flex items-end justify-between gap-1">
        {scores.slice(-10).map((score, index) => (
          <div
            key={index}
            className="bg-blue-500 rounded-t min-w-4 flex-1"
            style={{ 
              height: `${((score.score - minScore) / (maxScore - minScore)) * 100}%` 
            }}
          />
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Last 10 quiz scores
      </div>
    </div>
  );
}

/**
 * Weekly Progress Chart Component (simplified)
 */
function WeeklyProgressChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const minutes = [45, 60, 30, 80, 55, 25, 90]; // Mock data

  return (
    <div className="space-y-4">
      <div className="h-32 flex items-end justify-between gap-2">
        {days.map((day, index) => (
          <div key={day} className="flex-1 flex flex-col items-center">
            <div
              className="bg-green-500 rounded-t w-full min-h-2"
              style={{ height: `${(minutes[index] / Math.max(...minutes)) * 100}%` }}
            />
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {day}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Learning time this week (minutes)
      </div>
    </div>
  );
}

/**
 * Achievement Progress Component
 */
function AchievementProgress({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Achievements</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning milestones and unlock new badges
        </p>
      </div>
      
      <Card className="p-6">
        <p className="text-center text-gray-500 dark:text-gray-500">
          Achievement system integration coming soon...
        </p>
      </Card>
    </div>
  );
}

/**
 * Utility Functions
 */
function generateMockActivity(): ActivityItem[] {
  return [
    {
      id: '1',
      type: 'module_completed',
      title: 'Completed MCP Basics',
      description: 'Finished the introduction module with 95% score',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      type: 'achievement_earned',
      title: 'First Steps Achievement',
      description: 'Completed your first learning module',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '3',
      type: 'quiz_passed',
      title: 'TypeScript Fundamentals Quiz',
      description: 'Scored 88% on the quiz',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      id: '4',
      type: 'exercise_solved',
      title: 'Function Implementation',
      description: 'Solved the array manipulation exercise',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: '5',
      type: 'path_started',
      title: 'Started Agentic Workflows',
      description: 'Began the advanced learning path',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];
}

function generateStreakHistory(): Array<{ date: string; active: boolean }> {
  const history = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString(),
      active: i < 7 // Mock streak data
    });
  }
  
  return history;
}

function generateScoreHistory(): Array<{ date: string; score: number }> {
  const history = [];
  const today = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString(),
      score: Math.floor(Math.random() * 20) + 80 // Scores between 80-100
    });
  }
  
  return history;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}