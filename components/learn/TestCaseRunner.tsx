'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Zap,
  AlertTriangle,
  Code2
} from 'lucide-react';
import type { TestCase, TestCaseResult, ValidationContext } from './CodeValidation';

/**
 * Test Suite Types
 */
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  setup?: string; // Setup code to run before tests
  teardown?: string; // Cleanup code to run after tests
  timeout?: number; // Overall timeout for the suite
  retries?: number; // Number of retries for failing tests
}

export interface TestRunResult {
  suite: TestSuite;
  results: TestCaseResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    executionTime: number;
  };
  status: 'running' | 'completed' | 'error' | 'timeout';
  error?: string;
}

/**
 * Test Runner Props
 */
export interface TestCaseRunnerProps {
  testSuite: TestSuite;
  code: string;
  context: ValidationContext;
  onTestComplete?: (result: TestRunResult) => void;
  onTestCaseComplete?: (result: TestCaseResult) => void;
  autoRun?: boolean;
  showHiddenTests?: boolean;
  allowRetries?: boolean;
}

/**
 * Test Case Runner Component
 */
export default function TestCaseRunner({
  testSuite,
  code,
  context,
  onTestComplete,
  onTestCaseComplete,
  autoRun = false,
  showHiddenTests = false,
  allowRetries = true
}: TestCaseRunnerProps) {
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [showHidden, setShowHidden] = useState(showHiddenTests);

  // Filter visible test cases
  const visibleTests = testSuite.testCases.filter(test => showHidden || !test.hidden);
  const hiddenTestCount = testSuite.testCases.length - visibleTests.length;

  /**
   * Execute a single test case
   */
  const executeTestCase = useCallback(async (
    testCase: TestCase,
    codeToRun: string,
    testContext: ValidationContext
  ): Promise<TestCaseResult> => {
    const startTime = performance.now();

    try {
      // Create execution environment
      const result = await executeCodeSafely(codeToRun, testCase, testContext);
      const executionTime = performance.now() - startTime;

      // Check for timeout
      if (testCase.timeout && executionTime > testCase.timeout) {
        return {
          testCase,
          passed: false,
          actualOutput: result,
          executionTime,
          error: `Test timed out after ${testCase.timeout}ms`
        };
      }

      // Compare outputs
      const passed = compareTestOutputs(result, testCase.expectedOutput);

      return {
        testCase,
        passed,
        actualOutput: result,
        executionTime,
        error: passed ? undefined : `Expected ${JSON.stringify(testCase.expectedOutput)}, but got ${JSON.stringify(result)}`
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        testCase,
        passed: false,
        actualOutput: null,
        executionTime,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
    }
  }, []);

  /**
   * Run all test cases
   */
  const runTests = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setCurrentTestIndex(0);

    const startTime = performance.now();
    const results: TestCaseResult[] = [];
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // Run setup code if provided
      if (testSuite.setup) {
        try {
          await executeCodeSafely(testSuite.setup, null, context);
        } catch (error) {
          console.warn('Setup code failed:', error);
        }
      }

      // Run each test case
      for (let i = 0; i < testSuite.testCases.length; i++) {
        const testCase = testSuite.testCases[i];
        setCurrentTestIndex(i);

        try {
          const result = await executeTestCase(testCase, code, context);
          results.push(result);

          if (result.passed) {
            passed++;
          } else {
            failed++;
            
            // Retry logic
            if (allowRetries && testSuite.retries && testSuite.retries > 0) {
              for (let retry = 0; retry < testSuite.retries; retry++) {
                console.log(`Retrying test case ${testCase.id}, attempt ${retry + 1}`);
                const retryResult = await executeTestCase(testCase, code, context);
                
                if (retryResult.passed) {
                  results[results.length - 1] = retryResult;
                  failed--;
                  passed++;
                  break;
                }
              }
            }
          }

          // Call test case completion callback
          if (onTestCaseComplete) {
            onTestCaseComplete(results[results.length - 1]);
          }

          // Add small delay for UI updates
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          results.push({
            testCase,
            passed: false,
            actualOutput: null,
            executionTime: 0,
            error: error instanceof Error ? error.message : 'Test execution failed'
          });
          failed++;
        }
      }

      // Run teardown code if provided
      if (testSuite.teardown) {
        try {
          await executeCodeSafely(testSuite.teardown, null, context);
        } catch (error) {
          console.warn('Teardown code failed:', error);
        }
      }

      const executionTime = performance.now() - startTime;
      const finalResult: TestRunResult = {
        suite: testSuite,
        results,
        summary: {
          total: testSuite.testCases.length,
          passed,
          failed,
          skipped,
          executionTime
        },
        status: 'completed'
      };

      setTestResult(finalResult);
      
      if (onTestComplete) {
        onTestComplete(finalResult);
      }
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorResult: TestRunResult = {
        suite: testSuite,
        results,
        summary: {
          total: testSuite.testCases.length,
          passed,
          failed,
          skipped,
          executionTime
        },
        status: 'error',
        error: error instanceof Error ? error.message : 'Test suite execution failed'
      };

      setTestResult(errorResult);
      
      if (onTestComplete) {
        onTestComplete(errorResult);
      }
    } finally {
      setIsRunning(false);
      setCurrentTestIndex(-1);
    }
  }, [code, context, testSuite, executeTestCase, onTestComplete, onTestCaseComplete, isRunning, allowRetries]);

  /**
   * Reset test results
   */
  const resetTests = useCallback(() => {
    setTestResult(null);
    setCurrentTestIndex(-1);
  }, []);

  // Auto-run tests when code changes
  React.useEffect(() => {
    if (autoRun && code.trim()) {
      runTests();
    }
  }, [autoRun, code, runTests]);

  return (
    <div className="w-full space-y-4">
      {/* Test Suite Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{testSuite.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{testSuite.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {testSuite.testCases.length} test{testSuite.testCases.length === 1 ? '' : 's'}
            </Badge>
            {hiddenTestCount > 0 && (
              <Badge variant="secondary">
                {hiddenTestCount} hidden
              </Badge>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning || !code.trim()}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            
            <Button
              onClick={resetTests}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            {hiddenTestCount > 0 && (
              <Button
                onClick={() => setShowHidden(!showHidden)}
                variant="outline"
                size="sm"
              >
                {showHidden ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Hidden Tests
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Hidden Tests
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          {isRunning && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              Test {currentTestIndex + 1} of {testSuite.testCases.length}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-4">
            <Progress 
              value={((currentTestIndex + 1) / testSuite.testCases.length) * 100} 
              className="h-2"
            />
          </div>
        )}
      </Card>

      {/* Test Results Summary */}
      {testResult && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Test Results</h4>
            <Badge variant={testResult.summary.failed === 0 ? 'default' : 'destructive'}>
              {testResult.summary.passed}/{testResult.summary.total} passed
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{testResult.summary.passed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{testResult.summary.failed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{testResult.summary.skipped}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Skipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {testResult.summary.executionTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
            </div>
          </div>

          {/* Overall progress */}
          <Progress 
            value={(testResult.summary.passed / testResult.summary.total) * 100} 
            className="h-3"
          />
        </Card>
      )}

      {/* Individual Test Results */}
      {testResult && (
        <div className="space-y-2">
          <h4 className="font-medium">Test Cases</h4>
          {testResult.results
            .filter(result => showHidden || !result.testCase.hidden)
            .map((result, index) => (
              <TestCaseResultDisplay 
                key={result.testCase.id} 
                result={result} 
                index={index + 1}
                showDetails={!result.testCase.hidden || showHidden}
              />
            ))}
        </div>
      )}

      {/* Error display */}
      {testResult?.status === 'error' && testResult.error && (
        <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Test Suite Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{testResult.error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual Test Case Result Display
 */
interface TestCaseResultDisplayProps {
  result: TestCaseResult;
  index: number;
  showDetails?: boolean;
}

function TestCaseResultDisplay({ 
  result, 
  index, 
  showDetails = true 
}: TestCaseResultDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`p-4 ${
      result.passed 
        ? 'border-green-200 dark:border-green-800' 
        : 'border-red-200 dark:border-red-800'
    }`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {result.passed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <h5 className="font-medium">
              Test {index}: {result.testCase.description}
            </h5>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{result.executionTime.toFixed(2)}ms</span>
              <Badge variant="outline" className="text-xs">
                {result.testCase.weight} pts
              </Badge>
              {result.testCase.hidden && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {showDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && showDetails && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* Input/Output */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-sm font-medium mb-2">Input</h6>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                {JSON.stringify(result.testCase.input, null, 2)}
              </div>
            </div>
            <div>
              <h6 className="text-sm font-medium mb-2">Expected Output</h6>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                {JSON.stringify(result.testCase.expectedOutput, null, 2)}
              </div>
            </div>
          </div>

          {/* Actual output (if different) */}
          {!result.passed && (
            <div>
              <h6 className="text-sm font-medium mb-2">Actual Output</h6>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm font-mono">
                {JSON.stringify(result.actualOutput, null, 2)}
              </div>
            </div>
          )}

          {/* Error message */}
          {result.error && (
            <div>
              <h6 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">Error</h6>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm">
                {result.error}
              </div>
            </div>
          )}

          {/* Performance info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Execution time: {result.executionTime.toFixed(2)}ms</span>
            {result.testCase.timeout && (
              <span>Timeout: {result.testCase.timeout}ms</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Safe code execution utility
 */
async function executeCodeSafely(
  code: string,
  testCase: TestCase | null,
  context: ValidationContext
): Promise<any> {
  try {
    // Create a safe execution environment
    const safeGlobals = {
      console: {
        log: (...args: any[]) => args.join(' '),
        error: (...args: any[]) => args.join(' '),
        warn: (...args: any[]) => args.join(' ')
      },
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    };

    // Prepare the code to execute
    let codeToExecute = code;
    
    if (testCase && context.functionName) {
      // Call the function with test inputs
      const inputArgs = testCase.input.map(i => JSON.stringify(i)).join(', ');
      codeToExecute += `\n${context.functionName}(${inputArgs});`;
    }

    // Wrap in a function to capture return value
    const wrappedCode = `
      (function() {
        ${codeToExecute}
      })()
    `;

    // Use Function constructor for safer evaluation
    const func = new Function(...Object.keys(safeGlobals), `return ${wrappedCode}`);
    const result = func(...Object.values(safeGlobals));

    return result;
  } catch (error) {
    throw new Error(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compare test outputs utility
 */
function compareTestOutputs(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  
  // Handle arrays
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return actual.every((item, index) => compareTestOutputs(item, expected[index]));
  }
  
  // Handle objects
  if (typeof actual === 'object' && typeof expected === 'object' && actual !== null && expected !== null) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    
    if (actualKeys.length !== expectedKeys.length) return false;
    if (!actualKeys.every(key => expectedKeys.includes(key))) return false;
    
    return actualKeys.every(key => compareTestOutputs(actual[key], expected[key]));
  }
  
  // Handle numbers with precision
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-10;
  }
  
  return false;
}