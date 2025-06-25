'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Code, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Validation Types
 */
export interface ValidationRule {
  id: string;
  type: 'syntax' | 'output' | 'structure' | 'style' | 'security' | 'performance' | 'custom';
  description: string;
  severity: 'error' | 'warning' | 'info';
  validator: ValidatorFunction;
  errorMessage: string;
  successMessage: string;
  hint?: string;
  weight?: number; // For scoring
}

export interface ValidatorFunction {
  (code: string, context?: ValidationContext): Promise<ValidationResult> | ValidationResult;
}

export interface ValidationContext {
  language: string;
  exerciseId: string;
  testCases?: TestCase[];
  expectedOutput?: any;
  functionName?: string;
  imports?: string[];
  environment?: 'browser' | 'node' | 'deno';
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
  line?: number;
  column?: number;
  suggestion?: string;
  executionTime?: number;
}

export interface TestCase {
  id: string;
  description: string;
  input: any[];
  expectedOutput: any;
  hidden: boolean;
  weight: number;
  timeout?: number; // milliseconds
}

export interface CodeValidationResult {
  isValid: boolean;
  score: number;
  maxScore: number;
  results: Record<string, ValidationResult>;
  testResults: TestCaseResult[];
  summary: {
    errors: number;
    warnings: number;
    passed: number;
    failed: number;
  };
  executionOutput?: any;
  executionError?: string;
  suggestions: string[];
}

export interface TestCaseResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: any;
  executionTime: number;
  error?: string;
}

/**
 * Code Validation Engine
 */
export class CodeValidationEngine {
  private rules: Map<string, ValidationRule> = new Map();
  private defaultRules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    this.defaultRules = [
      // Syntax validation
      {
        id: 'typescript-syntax',
        type: 'syntax',
        description: 'TypeScript syntax validation',
        severity: 'error',
        validator: this.validateTypeScriptSyntax,
        errorMessage: 'Code contains syntax errors',
        successMessage: 'Code syntax is valid',
        weight: 10
      },
      {
        id: 'javascript-syntax',
        type: 'syntax',
        description: 'JavaScript syntax validation',
        severity: 'error',
        validator: this.validateJavaScriptSyntax,
        errorMessage: 'Code contains syntax errors',
        successMessage: 'Code syntax is valid',
        weight: 10
      },
      
      // Structure validation
      {
        id: 'function-exists',
        type: 'structure',
        description: 'Required function exists',
        severity: 'error',
        validator: this.validateFunctionExists,
        errorMessage: 'Required function is missing',
        successMessage: 'Required function found',
        weight: 15
      },
      {
        id: 'function-signature',
        type: 'structure',
        description: 'Function has correct signature',
        severity: 'error',
        validator: this.validateFunctionSignature,
        errorMessage: 'Function signature is incorrect',
        successMessage: 'Function signature is correct',
        weight: 10
      },
      
      // Output validation
      {
        id: 'return-value',
        type: 'output',
        description: 'Function returns expected value',
        severity: 'error',
        validator: this.validateReturnValue,
        errorMessage: 'Function does not return expected value',
        successMessage: 'Function returns correct value',
        weight: 20
      },
      
      // Style validation
      {
        id: 'code-style',
        type: 'style',
        description: 'Code follows style guidelines',
        severity: 'warning',
        validator: this.validateCodeStyle,
        errorMessage: 'Code style could be improved',
        successMessage: 'Code follows good style practices',
        weight: 5
      },
      
      // Security validation
      {
        id: 'no-eval',
        type: 'security',
        description: 'No use of eval() or similar dangerous functions',
        severity: 'error',
        validator: this.validateNoEval,
        errorMessage: 'Code uses dangerous eval() function',
        successMessage: 'No security issues detected',
        weight: 15
      },
      
      // Performance validation
      {
        id: 'no-infinite-loops',
        type: 'performance',
        description: 'No infinite loops detected',
        severity: 'error',
        validator: this.validateNoInfiniteLoops,
        errorMessage: 'Potential infinite loop detected',
        successMessage: 'No performance issues detected',
        weight: 10
      }
    ];

    // Register default rules
    this.defaultRules.forEach(rule => this.addRule(rule));
  }

  /**
   * Add validation rule
   */
  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove validation rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get validation rule
   */
  getRule(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Validate code against all rules
   */
  async validateCode(
    code: string,
    context: ValidationContext,
    enabledRules?: string[]
  ): Promise<CodeValidationResult> {
    const results: Record<string, ValidationResult> = {};
    const suggestions: string[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let errors = 0;
    let warnings = 0;

    // Determine which rules to run
    const rulesToRun = enabledRules 
      ? Array.from(this.rules.values()).filter(rule => enabledRules.includes(rule.id))
      : Array.from(this.rules.values());

    // Run validation rules
    for (const rule of rulesToRun) {
      try {
        const result = await rule.validator(code, context);
        results[rule.id] = result;

        maxScore += rule.weight || 1;
        if (result.passed) {
          totalScore += rule.weight || 1;
        } else {
          if (rule.severity === 'error') {
            errors++;
          } else if (rule.severity === 'warning') {
            warnings++;
          }
        }

        // Add suggestions
        if (result.suggestion) {
          suggestions.push(result.suggestion);
        }
        if (rule.hint && !result.passed) {
          suggestions.push(rule.hint);
        }
      } catch (error) {
        console.error(`Validation rule ${rule.id} failed:`, error);
        results[rule.id] = {
          passed: false,
          message: 'Validation rule failed to execute',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
        errors++;
      }
    }

    // Run test cases if provided
    const testResults: TestCaseResult[] = [];
    let testsPassed = 0;
    let testsFailed = 0;

    if (context.testCases && context.testCases.length > 0) {
      for (const testCase of context.testCases) {
        try {
          const testResult = await this.runTestCase(code, testCase, context);
          testResults.push(testResult);
          
          if (testResult.passed) {
            testsPassed++;
            totalScore += testCase.weight;
          } else {
            testsFailed++;
          }
          maxScore += testCase.weight;
        } catch (error) {
          testResults.push({
            testCase,
            passed: false,
            actualOutput: null,
            executionTime: 0,
            error: error instanceof Error ? error.message : 'Test execution failed'
          });
          testsFailed++;
          maxScore += testCase.weight;
        }
      }
    }

    return {
      isValid: errors === 0,
      score: totalScore,
      maxScore,
      results,
      testResults,
      summary: {
        errors,
        warnings,
        passed: testsPassed,
        failed: testsFailed
      },
      suggestions: [...new Set(suggestions)] // Remove duplicates
    };
  }

  /**
   * Run a single test case
   */
  private async runTestCase(
    code: string,
    testCase: TestCase,
    context: ValidationContext
  ): Promise<TestCaseResult> {
    const startTime = performance.now();

    try {
      // Create execution environment
      const executionResult = await this.executeCode(code, testCase.input, context);
      const executionTime = performance.now() - startTime;

      // Check timeout
      if (testCase.timeout && executionTime > testCase.timeout) {
        return {
          testCase,
          passed: false,
          actualOutput: executionResult,
          executionTime,
          error: `Test timed out after ${testCase.timeout}ms`
        };
      }

      // Compare output
      const passed = this.compareOutputs(executionResult, testCase.expectedOutput);

      return {
        testCase,
        passed,
        actualOutput: executionResult,
        executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        testCase,
        passed: false,
        actualOutput: null,
        executionTime,
        error: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }

  /**
   * Execute code safely
   */
  private async executeCode(
    code: string,
    input: any[],
    context: ValidationContext
  ): Promise<any> {
    // This is a simplified execution - in production, you'd use a sandboxed environment
    try {
      // Create a safe execution context
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

      // Wrap code in a function to capture return value
      const wrappedCode = `
        (function() {
          ${code}
          ${context.functionName ? `return ${context.functionName}(${input.map(i => JSON.stringify(i)).join(', ')});` : ''}
        })()
      `;

      // Use Function constructor for safer evaluation than eval
      const func = new Function(...Object.keys(safeGlobals), `return ${wrappedCode}`);
      const result = func(...Object.values(safeGlobals));

      return result;
    } catch (error) {
      throw new Error(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare expected and actual outputs
   */
  private compareOutputs(actual: any, expected: any): boolean {
    if (actual === expected) return true;
    
    // Handle arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((item, index) => this.compareOutputs(item, expected[index]));
    }
    
    // Handle objects
    if (typeof actual === 'object' && typeof expected === 'object' && actual !== null && expected !== null) {
      const actualKeys = Object.keys(actual).sort();
      const expectedKeys = Object.keys(expected).sort();
      
      if (actualKeys.length !== expectedKeys.length) return false;
      if (!actualKeys.every(key => expectedKeys.includes(key))) return false;
      
      return actualKeys.every(key => this.compareOutputs(actual[key], expected[key]));
    }
    
    // Handle numbers with precision
    if (typeof actual === 'number' && typeof expected === 'number') {
      return Math.abs(actual - expected) < 1e-10;
    }
    
    return false;
  }

  // Validation rule implementations
  private validateTypeScriptSyntax = (code: string): ValidationResult => {
    try {
      // Simple syntax check - in production, use TypeScript compiler API
      new Function(code);
      return {
        passed: true,
        message: 'TypeScript syntax is valid'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'TypeScript syntax error',
        details: error instanceof Error ? error.message : 'Unknown syntax error',
        suggestion: 'Check for missing semicolons, brackets, or type annotations'
      };
    }
  };

  private validateJavaScriptSyntax = (code: string): ValidationResult => {
    try {
      new Function(code);
      return {
        passed: true,
        message: 'JavaScript syntax is valid'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'JavaScript syntax error',
        details: error instanceof Error ? error.message : 'Unknown syntax error',
        suggestion: 'Check for missing semicolons, brackets, or parentheses'
      };
    }
  };

  private validateFunctionExists = (code: string, context?: ValidationContext): ValidationResult => {
    if (!context?.functionName) {
      return { passed: true, message: 'No function name specified' };
    }

    const functionRegex = new RegExp(`(function\\s+${context.functionName}|const\\s+${context.functionName}\\s*=|let\\s+${context.functionName}\\s*=|var\\s+${context.functionName}\\s*=)`);
    
    if (functionRegex.test(code)) {
      return {
        passed: true,
        message: `Function ${context.functionName} found`
      };
    }

    return {
      passed: false,
      message: `Function ${context.functionName} not found`,
      suggestion: `Make sure to define a function named '${context.functionName}'`
    };
  };

  private validateFunctionSignature = (code: string, context?: ValidationContext): ValidationResult => {
    // This would need more sophisticated parsing in production
    return {
      passed: true,
      message: 'Function signature validation skipped'
    };
  };

  private validateReturnValue = async (code: string, context?: ValidationContext): Promise<ValidationResult> => {
    if (!context?.expectedOutput || !context?.functionName) {
      return { passed: true, message: 'No expected output specified' };
    }

    try {
      const result = await this.executeCode(code, [], context);
      const passed = this.compareOutputs(result, context.expectedOutput);
      
      return {
        passed,
        message: passed ? 'Function returns expected value' : 'Function does not return expected value',
        details: passed ? undefined : `Expected: ${JSON.stringify(context.expectedOutput)}, Got: ${JSON.stringify(result)}`,
        suggestion: passed ? undefined : 'Check your return statement and logic'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Failed to execute function',
        details: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  };

  private validateCodeStyle = (code: string): ValidationResult => {
    const issues: string[] = [];

    // Check for consistent indentation
    const lines = code.split('\n');
    const indentPattern = /^(\s*)/;
    let hasInconsistentIndent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      
      const match = line.match(indentPattern);
      if (match && match[1].includes('\t') && match[1].includes(' ')) {
        hasInconsistentIndent = true;
        break;
      }
    }

    if (hasInconsistentIndent) {
      issues.push('Mixed tabs and spaces for indentation');
    }

    // Check for semicolons
    if (!/;\s*$/.test(code.trim()) && !code.includes('=>')) {
      issues.push('Missing semicolons');
    }

    // Check for meaningful variable names
    if (/\b[a-z]\b/.test(code)) {
      issues.push('Consider using more descriptive variable names');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Code style is good' : 'Code style issues found',
      details: issues.join(', '),
      suggestion: issues.length > 0 ? 'Follow consistent coding style guidelines' : undefined
    };
  };

  private validateNoEval = (code: string): ValidationResult => {
    const dangerousFunctions = ['eval', 'Function', 'setTimeout', 'setInterval'];
    const found = dangerousFunctions.filter(func => code.includes(func));

    return {
      passed: found.length === 0,
      message: found.length === 0 ? 'No dangerous functions used' : 'Dangerous functions detected',
      details: found.length > 0 ? `Found: ${found.join(', ')}` : undefined,
      suggestion: found.length > 0 ? 'Avoid using eval() and similar dangerous functions' : undefined
    };
  };

  private validateNoInfiniteLoops = (code: string): ValidationResult => {
    // Simple check for potential infinite loops
    const infiniteLoopPatterns = [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /while\s*\(\s*1\s*\)/
    ];

    const hasInfiniteLoop = infiniteLoopPatterns.some(pattern => pattern.test(code));

    return {
      passed: !hasInfiniteLoop,
      message: hasInfiniteLoop ? 'Potential infinite loop detected' : 'No infinite loops detected',
      suggestion: hasInfiniteLoop ? 'Make sure your loops have proper exit conditions' : undefined
    };
  };
}

/**
 * Validation Results Display Component
 */
interface ValidationDisplayProps {
  result: CodeValidationResult;
  compact?: boolean;
}

export function ValidationDisplay({ result, compact = false }: ValidationDisplayProps) {
  const getStatusIcon = (passed: boolean, severity: 'error' | 'warning' | 'info' = 'error') => {
    if (passed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {getStatusIcon(result.isValid)}
          <span className="font-medium">
            {result.isValid ? 'Valid' : 'Issues Found'}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Score: {result.score}/{result.maxScore}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Code className="w-5 h-5" />
            Validation Results
          </h3>
          <Badge variant={result.isValid ? 'default' : 'destructive'}>
            {result.score}/{result.maxScore} points
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">{result.summary.errors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{result.summary.warnings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{result.summary.passed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tests Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{result.summary.failed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tests Failed</div>
          </div>
        </div>
      </Card>

      {/* Validation Rules Results */}
      {Object.keys(result.results).length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Validation Rules</h4>
          <div className="space-y-2">
            {Object.entries(result.results).map(([ruleId, validationResult]) => (
              <div
                key={ruleId}
                className={`p-3 border rounded-lg ${
                  validationResult.passed
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(validationResult.passed)}
                  <div className="flex-1">
                    <div className="font-medium">{ruleId}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {validationResult.message}
                    </div>
                    {validationResult.details && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {validationResult.details}
                      </div>
                    )}
                    {validationResult.suggestion && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        💡 {validationResult.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Test Results */}
      {result.testResults.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Test Cases</h4>
          <div className="space-y-2">
            {result.testResults.map((testResult, index) => (
              <div
                key={testResult.testCase.id}
                className={`p-3 border rounded-lg ${
                  testResult.passed
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(testResult.passed)}
                  <div className="flex-1">
                    <div className="font-medium">Test {index + 1}: {testResult.testCase.description}</div>
                    {!testResult.testCase.hidden && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Expected: {JSON.stringify(testResult.testCase.expectedOutput)}
                        {!testResult.passed && (
                          <div>Actual: {JSON.stringify(testResult.actualOutput)}</div>
                        )}
                      </div>
                    )}
                    {testResult.error && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Error: {testResult.error}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Execution time: {testResult.executionTime.toFixed(2)}ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </h4>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}