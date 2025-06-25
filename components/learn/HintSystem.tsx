'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Lock, 
  Unlock, 
  Target,
  Zap,
  BookOpen,
  Code,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Hint Types
 */
export interface Hint {
  id: string;
  level: number; // 1 = gentle nudge, 2 = more specific, 3 = solution hint
  title?: string;
  content: string;
  codeSnippet?: string;
  relatedConcepts?: string[];
  revealDelay?: number; // Seconds before hint becomes available
  cost?: number; // Points deducted for using this hint
  triggerConditions?: HintTrigger[];
  type: 'general' | 'syntax' | 'logic' | 'concept' | 'debugging' | 'optimization' | 'example';
}

export interface HintTrigger {
  type: 'time' | 'attempts' | 'errors' | 'custom';
  value: any;
  description?: string;
}

export interface HintUsage {
  hintId: string;
  usedAt: string;
  wasHelpful?: boolean;
  feedback?: string;
}

export interface HintSystemProps {
  hints: Hint[];
  exerciseId: string;
  onHintUsed?: (hint: Hint) => void;
  onHintFeedback?: (hintId: string, helpful: boolean, feedback?: string) => void;
  maxHintsPerLevel?: number;
  allowSkipLevels?: boolean;
  showProgress?: boolean;
  timeSpent?: number; // Seconds spent on exercise
  attempts?: number;
  errors?: number;
}

/**
 * Hint System Component
 */
export default function HintSystem({
  hints,
  exerciseId,
  onHintUsed,
  onHintFeedback,
  maxHintsPerLevel = 3,
  allowSkipLevels = false,
  showProgress = true,
  timeSpent = 0,
  attempts = 0,
  errors = 0
}: HintSystemProps) {
  const [usedHints, setUsedHints] = useState<HintUsage[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [availableHints, setAvailableHints] = useState<Hint[]>([]);
  const [expandedHint, setExpandedHint] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Sort hints by level and filter available ones
  const sortedHints = React.useMemo(() => {
    return hints.sort((a, b) => a.level - b.level);
  }, [hints]);

  // Group hints by level
  const hintsByLevel = React.useMemo(() => {
    return sortedHints.reduce((acc, hint) => {
      if (!acc[hint.level]) acc[hint.level] = [];
      acc[hint.level].push(hint);
      return acc;
    }, {} as Record<number, Hint[]>);
  }, [sortedHints]);

  // Calculate available hints based on conditions
  useEffect(() => {
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;

    const available = sortedHints.filter(hint => {
      // Check if already used
      if (usedHints.some(usage => usage.hintId === hint.id)) {
        return true; // Keep used hints visible
      }

      // Check level progression
      if (!allowSkipLevels && hint.level > currentLevel) {
        return false;
      }

      // Check reveal delay
      if (hint.revealDelay && elapsedSeconds < hint.revealDelay) {
        return false;
      }

      // Check trigger conditions
      if (hint.triggerConditions) {
        const meetsConditions = hint.triggerConditions.every(trigger => {
          switch (trigger.type) {
            case 'time':
              return timeSpent >= trigger.value;
            case 'attempts':
              return attempts >= trigger.value;
            case 'errors':
              return errors >= trigger.value;
            default:
              return true;
          }
        });
        
        if (!meetsConditions) {
          return false;
        }
      }

      return true;
    });

    setAvailableHints(available);
  }, [
    sortedHints, 
    usedHints, 
    currentLevel, 
    allowSkipLevels, 
    timeSpent, 
    attempts, 
    errors, 
    startTime
  ]);

  /**
   * Use a hint
   */
  const useHint = useCallback((hint: Hint) => {
    const usage: HintUsage = {
      hintId: hint.id,
      usedAt: new Date().toISOString()
    };

    setUsedHints(prev => [...prev, usage]);
    setExpandedHint(hint.id);

    // Progress to next level if all hints at current level are used
    const currentLevelHints = hintsByLevel[currentLevel] || [];
    const usedCurrentLevel = usedHints.filter(u => 
      currentLevelHints.some(h => h.id === u.hintId)
    ).length + 1; // +1 for the hint we just used

    if (usedCurrentLevel >= Math.min(currentLevelHints.length, maxHintsPerLevel)) {
      setCurrentLevel(prev => prev + 1);
    }

    if (onHintUsed) {
      onHintUsed(hint);
    }
  }, [currentLevel, hintsByLevel, maxHintsPerLevel, usedHints, onHintUsed]);

  /**
   * Provide feedback on hint
   */
  const provideFeedback = useCallback((hintId: string, helpful: boolean, feedback?: string) => {
    setUsedHints(prev => prev.map(usage => 
      usage.hintId === hintId 
        ? { ...usage, wasHelpful: helpful, feedback }
        : usage
    ));

    if (onHintFeedback) {
      onHintFeedback(hintId, helpful, feedback);
    }
  }, [onHintFeedback]);

  /**
   * Get hint status
   */
  const getHintStatus = useCallback((hint: Hint): 'available' | 'used' | 'locked' | 'delayed' => {
    const isUsed = usedHints.some(usage => usage.hintId === hint.id);
    if (isUsed) return 'used';

    const isAvailable = availableHints.some(h => h.id === hint.id);
    if (!isAvailable) {
      if (hint.revealDelay && timeSpent < hint.revealDelay) {
        return 'delayed';
      }
      return 'locked';
    }

    return 'available';
  }, [usedHints, availableHints, timeSpent]);

  /**
   * Get time until hint is available
   */
  const getTimeUntilAvailable = useCallback((hint: Hint): number => {
    if (!hint.revealDelay) return 0;
    return Math.max(0, hint.revealDelay - timeSpent);
  }, [timeSpent]);

  const maxLevel = Math.max(...Object.keys(hintsByLevel).map(Number));

  return (
    <div className="w-full space-y-4">
      {/* Hint System Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Hints</h3>
          </div>
          <Badge variant="outline">
            {usedHints.length} used
          </Badge>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {currentLevel} of {maxLevel}</span>
              <span>
                {usedHints.filter(u => 
                  (hintsByLevel[currentLevel] || []).some(h => h.id === u.hintId)
                ).length} / {Math.min((hintsByLevel[currentLevel] || []).length, maxHintsPerLevel)} hints used
              </span>
            </div>
            <Progress 
              value={(currentLevel / maxLevel) * 100} 
              className="h-2"
            />
          </div>
        )}
      </Card>

      {/* Hints by Level */}
      {Object.entries(hintsByLevel).map(([level, levelHints]) => (
        <HintLevelSection
          key={level}
          level={parseInt(level)}
          hints={levelHints}
          currentLevel={currentLevel}
          usedHints={usedHints}
          expandedHint={expandedHint}
          onHintUse={useHint}
          onHintExpand={setExpandedHint}
          onFeedback={provideFeedback}
          getHintStatus={getHintStatus}
          getTimeUntilAvailable={getTimeUntilAvailable}
          maxHintsPerLevel={maxHintsPerLevel}
        />
      ))}

      {/* Progress Summary */}
      {usedHints.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Hint Usage Summary
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{usedHints.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hints Used</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {usedHints.filter(h => h.wasHelpful === true).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Helpful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{currentLevel}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {usedHints.reduce((sum, hint) => {
                  const hintData = hints.find(h => h.id === hint.hintId);
                  return sum + (hintData?.cost || 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Points Used</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Hint Level Section Component
 */
interface HintLevelSectionProps {
  level: number;
  hints: Hint[];
  currentLevel: number;
  usedHints: HintUsage[];
  expandedHint: string | null;
  onHintUse: (hint: Hint) => void;
  onHintExpand: (hintId: string | null) => void;
  onFeedback: (hintId: string, helpful: boolean, feedback?: string) => void;
  getHintStatus: (hint: Hint) => 'available' | 'used' | 'locked' | 'delayed';
  getTimeUntilAvailable: (hint: Hint) => number;
  maxHintsPerLevel: number;
}

function HintLevelSection({
  level,
  hints,
  currentLevel,
  usedHints,
  expandedHint,
  onHintUse,
  onHintExpand,
  onFeedback,
  getHintStatus,
  getTimeUntilAvailable,
  maxHintsPerLevel
}: HintLevelSectionProps) {
  const levelNames = {
    1: 'Gentle Nudges',
    2: 'Specific Guidance',
    3: 'Solution Hints',
    4: 'Advanced Tips'
  };

  const usedInLevel = usedHints.filter(u => hints.some(h => h.id === u.hintId)).length;
  const isLevelComplete = usedInLevel >= Math.min(hints.length, maxHintsPerLevel);
  const isLevelActive = level <= currentLevel;

  return (
    <Card className={`p-4 ${!isLevelActive ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isLevelComplete 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : isLevelActive
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}>
            {isLevelComplete ? <CheckCircle className="w-4 h-4" /> : level}
          </div>
          <div>
            <h4 className="font-medium">Level {level}: {levelNames[level as keyof typeof levelNames] || 'Additional Hints'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {usedInLevel} / {Math.min(hints.length, maxHintsPerLevel)} hints used
            </p>
          </div>
        </div>
        
        {!isLevelActive && (
          <Lock className="w-4 h-4 text-gray-400" />
        )}
      </div>

      <div className="space-y-2">
        {hints.slice(0, maxHintsPerLevel).map(hint => (
          <HintCard
            key={hint.id}
            hint={hint}
            status={getHintStatus(hint)}
            timeUntilAvailable={getTimeUntilAvailable(hint)}
            isExpanded={expandedHint === hint.id}
            isUsed={usedHints.some(u => u.hintId === hint.id)}
            usage={usedHints.find(u => u.hintId === hint.id)}
            onUse={() => onHintUse(hint)}
            onExpand={() => onHintExpand(expandedHint === hint.id ? null : hint.id)}
            onFeedback={onFeedback}
            disabled={!isLevelActive}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * Individual Hint Card Component
 */
interface HintCardProps {
  hint: Hint;
  status: 'available' | 'used' | 'locked' | 'delayed';
  timeUntilAvailable: number;
  isExpanded: boolean;
  isUsed: boolean;
  usage?: HintUsage;
  onUse: () => void;
  onExpand: () => void;
  onFeedback: (hintId: string, helpful: boolean, feedback?: string) => void;
  disabled: boolean;
}

function HintCard({
  hint,
  status,
  timeUntilAvailable,
  isExpanded,
  isUsed,
  usage,
  onUse,
  onExpand,
  onFeedback,
  disabled
}: HintCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const getHintIcon = () => {
    switch (hint.type) {
      case 'syntax': return <Code className="w-4 h-4" />;
      case 'concept': return <BookOpen className="w-4 h-4" />;
      case 'debugging': return <AlertCircle className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'example': return <Eye className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10';
      case 'used': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10';
      case 'locked': return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
      case 'delayed': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10';
    }
  };

  const canUse = status === 'available' && !disabled;
  const canExpand = (status === 'used' || canUse) && !disabled;

  return (
    <div className={`border rounded-lg ${getStatusColor()}`}>
      <div 
        className={`p-3 ${canExpand ? 'cursor-pointer' : ''} transition-colors hover:bg-opacity-70`}
        onClick={canExpand ? onExpand : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getHintIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {hint.title && (
                  <h5 className="font-medium">{hint.title}</h5>
                )}
                <Badge variant="outline" className="text-xs">
                  {hint.type}
                </Badge>
                {hint.cost && hint.cost > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    -{hint.cost} pts
                  </Badge>
                )}
              </div>
              
              {!isExpanded && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {status === 'locked' && 'Complete previous level to unlock'}
                  {status === 'delayed' && `Available in ${Math.ceil(timeUntilAvailable)}s`}
                  {status === 'available' && 'Click to reveal hint'}
                  {status === 'used' && 'Hint used - click to review'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'delayed' && (
              <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                <Clock className="w-3 h-3" />
                {Math.ceil(timeUntilAvailable)}s
              </div>
            )}
            
            {status === 'locked' && (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            
            {status === 'used' && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            
            {canUse && (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onUse(); }}>
                Use Hint
              </Button>
            )}
            
            {canExpand && (
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t">
          <div className="pt-3 space-y-3">
            {/* Hint content */}
            <div>
              <p className="text-sm">{hint.content}</p>
            </div>

            {/* Code snippet */}
            {hint.codeSnippet && (
              <div>
                <h6 className="text-sm font-medium mb-2">Code Example</h6>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                  {hint.codeSnippet}
                </div>
              </div>
            )}

            {/* Related concepts */}
            {hint.relatedConcepts && hint.relatedConcepts.length > 0 && (
              <div>
                <h6 className="text-sm font-medium mb-2">Related Concepts</h6>
                <div className="flex flex-wrap gap-1">
                  {hint.relatedConcepts.map((concept, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback section for used hints */}
            {isUsed && !usage?.wasHelpful && !showFeedback && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Was this hint helpful?</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onFeedback(hint.id, true)}
                >
                  Yes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onFeedback(hint.id, false)}
                >
                  No
                </Button>
              </div>
            )}

            {/* Feedback display */}
            {usage?.wasHelpful !== undefined && (
              <div className="text-sm">
                <span className={`${usage.wasHelpful ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  You marked this hint as {usage.wasHelpful ? 'helpful' : 'not helpful'}
                </span>
                {usage.feedback && (
                  <div className="mt-1 text-gray-600 dark:text-gray-400">
                    Feedback: {usage.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}