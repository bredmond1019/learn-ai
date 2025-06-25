'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Code, 
  BookOpen, 
  Lightbulb, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Copy,
  Play,
  RotateCcw,
  FileText,
  Zap,
  TrendingUp
} from 'lucide-react';

/**
 * Solution Types
 */
export interface Solution {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  keyPoints: string[];
  complexity?: {
    time: string;
    space: string;
  };
  alternativeApproaches?: AlternativeSolution[];
  relatedConcepts?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface AlternativeSolution {
  id: string;
  title: string;
  code: string;
  explanation: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  whenToUse: string;
}

export interface SolutionRevealConfig {
  requireConfirmation: boolean;
  penalties: {
    scoreReduction: number; // Percentage of score to deduct
    pointCost: number; // Fixed points to deduct
  };
  unlockConditions?: {
    timeSpent?: number; // Minimum seconds spent
    attemptsRequired?: number; // Minimum attempts
    hintsUsed?: number; // Minimum hints used
  };
  showWarning: boolean;
  allowCopy: boolean;
  allowExecution: boolean;
}

/**
 * Solution Reveal Props
 */
export interface SolutionRevealProps {
  solution: Solution;
  config: SolutionRevealConfig;
  timeSpent: number;
  attempts: number;
  hintsUsed: number;
  currentScore?: number;
  onSolutionRevealed?: (solution: Solution, penalty: number) => void;
  onCodeCopied?: (code: string) => void;
  onCodeExecuted?: (code: string) => void;
  onRestartExercise?: () => void;
  isLocked?: boolean;
}

/**
 * Solution Reveal Component
 */
export default function SolutionReveal({
  solution,
  config,
  timeSpent,
  attempts,
  hintsUsed,
  currentScore,
  onSolutionRevealed,
  onCodeCopied,
  onCodeExecuted,
  onRestartExercise,
  isLocked = false
}: SolutionRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * Check if solution can be unlocked
   */
  const canUnlock = React.useMemo(() => {
    if (isLocked) return false;
    
    const conditions = config.unlockConditions;
    if (!conditions) return true;

    const meetsTimeRequirement = !conditions.timeSpent || timeSpent >= conditions.timeSpent;
    const meetsAttemptsRequirement = !conditions.attemptsRequired || attempts >= conditions.attemptsRequired;
    const meetsHintsRequirement = !conditions.hintsUsed || hintsUsed >= conditions.hintsUsed;

    return meetsTimeRequirement && meetsAttemptsRequirement && meetsHintsRequirement;
  }, [isLocked, config.unlockConditions, timeSpent, attempts, hintsUsed]);

  /**
   * Calculate penalty for revealing solution
   */
  const calculatePenalty = useCallback(() => {
    let penalty = 0;
    
    if (config.penalties.pointCost > 0) {
      penalty += config.penalties.pointCost;
    }
    
    if (config.penalties.scoreReduction > 0 && currentScore) {
      penalty += Math.round(currentScore * (config.penalties.scoreReduction / 100));
    }
    
    return penalty;
  }, [config.penalties, currentScore]);

  /**
   * Reveal solution
   */
  const revealSolution = useCallback(() => {
    if (!canUnlock) return;

    if (config.requireConfirmation && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsRevealed(true);
    setShowConfirmation(false);

    const penalty = calculatePenalty();
    
    if (onSolutionRevealed) {
      onSolutionRevealed(solution, penalty);
    }
  }, [canUnlock, config.requireConfirmation, showConfirmation, calculatePenalty, onSolutionRevealed, solution]);

  /**
   * Copy code to clipboard
   */
  const copyCode = useCallback(async (code: string) => {
    if (!config.allowCopy) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (onCodeCopied) {
        onCodeCopied(code);
      }
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [config.allowCopy, onCodeCopied]);

  /**
   * Execute code
   */
  const executeCode = useCallback((code: string) => {
    if (!config.allowExecution) return;
    
    if (onCodeExecuted) {
      onCodeExecuted(code);
    }
  }, [config.allowExecution, onCodeExecuted]);

  /**
   * Get unlock requirements text
   */
  const getUnlockRequirements = () => {
    const conditions = config.unlockConditions;
    if (!conditions) return null;

    const requirements: string[] = [];
    
    if (conditions.timeSpent && timeSpent < conditions.timeSpent) {
      requirements.push(`Spend ${conditions.timeSpent - timeSpent} more seconds on the exercise`);
    }
    
    if (conditions.attemptsRequired && attempts < conditions.attemptsRequired) {
      requirements.push(`Make ${conditions.attemptsRequired - attempts} more attempt${conditions.attemptsRequired - attempts === 1 ? '' : 's'}`);
    }
    
    if (conditions.hintsUsed && hintsUsed < conditions.hintsUsed) {
      requirements.push(`Use ${conditions.hintsUsed - hintsUsed} more hint${conditions.hintsUsed - hintsUsed === 1 ? '' : 's'}`);
    }

    return requirements;
  };

  // Show confirmation dialog
  if (showConfirmation) {
    return (
      <Card className="p-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Reveal Solution?
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              This action cannot be undone. You will lose points for viewing the solution.
            </p>
          </div>

          {/* Penalty information */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Penalty Information</h4>
            <div className="space-y-2 text-sm">
              {config.penalties.pointCost > 0 && (
                <div className="flex justify-between">
                  <span>Fixed penalty:</span>
                  <span className="font-medium text-red-600">-{config.penalties.pointCost} points</span>
                </div>
              )}
              {config.penalties.scoreReduction > 0 && currentScore && (
                <div className="flex justify-between">
                  <span>Score reduction ({config.penalties.scoreReduction}%):</span>
                  <span className="font-medium text-red-600">
                    -{Math.round(currentScore * (config.penalties.scoreReduction / 100))} points
                  </span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total penalty:</span>
                <span className="text-red-600">-{calculatePenalty()} points</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={revealSolution}
              variant="destructive"
            >
              Reveal Solution
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show locked state
  if (!canUnlock) {
    const requirements = getUnlockRequirements();
    
    return (
      <Card className="p-6 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              Solution Locked
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Complete the requirements below to unlock the solution.
            </p>
          </div>

          {requirements && requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Requirements</h4>
              <ul className="space-y-1 text-sm text-left">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current progress */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Your Progress</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{Math.floor(timeSpent)}</div>
                <div className="text-xs text-gray-500">Seconds</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{attempts}</div>
                <div className="text-xs text-gray-500">Attempts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{hintsUsed}</div>
                <div className="text-xs text-gray-500">Hints Used</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Show solution reveal button
  if (!isRevealed) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Eye className="w-12 h-12 text-blue-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">View Solution</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Need help? View the complete solution with detailed explanations.
            </p>
          </div>

          {config.showWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium">Penalty Warning</p>
                  <p>Viewing the solution will reduce your score by {calculatePenalty()} points.</p>
                </div>
              </div>
            </div>
          )}

          <Button onClick={revealSolution} size="lg">
            <Eye className="w-4 h-4 mr-2" />
            Reveal Solution
          </Button>
        </div>
      </Card>
    );
  }

  // Show revealed solution
  return (
    <div className="space-y-6">
      {/* Solution Header */}
      <Card className="p-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Unlock className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Solution Revealed: {solution.title}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Study the solution and learn from the approach
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {solution.difficulty}
            </Badge>
            <Badge variant="outline">
              {solution.language}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Solution Content */}
      <Tabs value="solution" className="w-full" onValueChange={() => {}}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="solution" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Solution
          </TabsTrigger>
          <TabsTrigger value="explanation" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Alternatives
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Main Solution Tab */}
        <TabsContent value="solution" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Complete Solution</h4>
              <div className="flex items-center gap-2">
                {config.allowCopy && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(solution.code)}
                    disabled={copied}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
                {config.allowExecution && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => executeCode(solution.code)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{solution.code}</code>
              </pre>
            </div>
          </Card>
        </TabsContent>

        {/* Explanation Tab */}
        <TabsContent value="explanation" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-medium mb-4">How It Works</h4>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: solution.explanation }} />
            </div>
          </Card>

          {/* Key Points */}
          {solution.keyPoints.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Key Points</h4>
              <ul className="space-y-2">
                {solution.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* Alternative Solutions Tab */}
        <TabsContent value="alternatives" className="space-y-4">
          {solution.alternativeApproaches && solution.alternativeApproaches.length > 0 ? (
            <>
              {solution.alternativeApproaches.map((alt, index) => (
                <Card key={alt.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{alt.title}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAlternative(
                        selectedAlternative === alt.id ? null : alt.id
                      )}
                    >
                      {selectedAlternative === alt.id ? 'Hide' : 'Show'} Code
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {alt.explanation}
                  </p>

                  {selectedAlternative === alt.id && (
                    <div className="space-y-3">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>{alt.code}</code>
                        </pre>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">Pros</h5>
                          <ul className="space-y-1">
                            {alt.tradeoffs.pros.map((pro, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-500 mt-1">+</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Cons</h5>
                          <ul className="space-y-1">
                            {alt.tradeoffs.cons.map((con, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-red-500 mt-1">-</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">When to Use</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{alt.whenToUse}</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No alternative solutions available for this exercise.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {/* Complexity Analysis */}
          {solution.complexity && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Complexity Analysis</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Time Complexity</h5>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <code className="text-lg font-mono">{solution.complexity.time}</code>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Space Complexity</h5>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <code className="text-lg font-mono">{solution.complexity.space}</code>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Related Concepts */}
          {solution.relatedConcepts && solution.relatedConcepts.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Related Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {solution.relatedConcepts.map((concept, index) => (
                  <Badge key={index} variant="outline">
                    {concept}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Tags */}
          {solution.tags && solution.tags.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {solution.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card className="p-4">
        <div className="flex justify-center gap-4">
          <Button onClick={onRestartExercise} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </div>
      </Card>
    </div>
  );
}