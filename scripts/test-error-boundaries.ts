/**
 * Error Boundary Testing Script
 * 
 * This script provides utilities for testing error boundaries
 * by intentionally triggering component failures in development
 */

interface ErrorTestCase {
  name: string;
  description: string;
  triggerFunction: () => void;
  expectedBehavior: string;
  component: string;
}

/**
 * Collection of error test cases
 */
export const errorTestCases: ErrorTestCase[] = [
  {
    name: 'Quiz Rendering Error',
    description: 'Simulates a quiz component rendering failure',
    component: 'Quiz',
    triggerFunction: () => {
      // Inject malformed quiz data
      const event = new CustomEvent('test-quiz-error', {
        detail: { 
          type: 'rendering',
          error: new Error('Mock quiz rendering error: Invalid question data structure') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'Quiz error boundary should catch error, display quiz-specific fallback with retry options'
  },
  
  {
    name: 'MDX Content Parsing Error',
    description: 'Simulates MDX content parsing failure in ModuleViewer',
    component: 'ModuleViewer',
    triggerFunction: () => {
      const event = new CustomEvent('test-mdx-error', {
        detail: { 
          type: 'parsing',
          error: new Error('Mock MDX parsing error: Malformed frontmatter') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'ModuleViewer error boundary should catch error, display component fallback with content recovery options'
  },
  
  {
    name: 'Code Block Syntax Highlighting Error',
    description: 'Simulates syntax highlighter failure',
    component: 'CodeBlock',
    triggerFunction: () => {
      const event = new CustomEvent('test-codeblock-error', {
        detail: { 
          type: 'syntax-highlighting',
          error: new Error('Mock syntax highlighting error: Unsupported language') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'CodeBlock error boundary should catch error, display code as plain text with copy functionality preserved'
  },
  
  {
    name: 'Quiz Scoring Calculation Error',
    description: 'Simulates error in quiz scoring logic',
    component: 'Quiz',
    triggerFunction: () => {
      const event = new CustomEvent('test-scoring-error', {
        detail: { 
          type: 'calculation',
          error: new Error('Mock scoring error: Division by zero in partial credit calculation') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'Quiz should handle scoring errors gracefully, provide manual score review option'
  },
  
  {
    name: 'Progress Save Error',
    description: 'Simulates failure to save user progress',
    component: 'ProgressTracker',
    triggerFunction: () => {
      const event = new CustomEvent('test-progress-error', {
        detail: { 
          type: 'save-failure',
          error: new Error('Mock progress save error: Network timeout') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'System should show progress save failure warning, offer retry or continue without saving'
  },
  
  {
    name: 'Network Request Error',
    description: 'Simulates network failure when loading content',
    component: 'ContentLoader',
    triggerFunction: () => {
      const event = new CustomEvent('test-network-error', {
        detail: { 
          type: 'network',
          error: new Error('Mock network error: Failed to fetch module content') 
        }
      });
      window.dispatchEvent(event);
    },
    expectedBehavior: 'Content loader should show network error message with retry and offline mode options'
  },
];

/**
 * Utility functions for error testing
 */
export class ErrorBoundaryTester {
  private isTestMode = false;
  private activeTests: Set<string> = new Set();

  /**
   * Enable test mode (only works in development)
   */
  enableTestMode(): boolean {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Error boundary testing only available in development mode');
      return false;
    }
    
    this.isTestMode = true;
    this.setupTestEventListeners();
    console.log('🧪 Error boundary test mode enabled');
    return true;
  }

  /**
   * Disable test mode
   */
  disableTestMode(): void {
    this.isTestMode = false;
    this.activeTests.clear();
    this.removeTestEventListeners();
    console.log('✅ Error boundary test mode disabled');
  }

  /**
   * Run a specific test case
   */
  runTest(testName: string): boolean {
    if (!this.isTestMode) {
      console.error('Test mode must be enabled first');
      return false;
    }

    const testCase = errorTestCases.find(test => test.name === testName);
    if (!testCase) {
      console.error(`Test case "${testName}" not found`);
      return false;
    }

    console.group(`🧪 Running test: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Component: ${testCase.component}`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    
    try {
      this.activeTests.add(testName);
      testCase.triggerFunction();
      console.log('✅ Test triggered successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to trigger test:', error);
      return false;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Run all test cases sequentially
   */
  async runAllTests(): Promise<void> {
    if (!this.isTestMode) {
      console.error('Test mode must be enabled first');
      return;
    }

    console.log('🧪 Running all error boundary tests...');
    
    for (const testCase of errorTestCases) {
      console.log(`\n▶️ Running: ${testCase.name}`);
      this.runTest(testCase.name);
      
      // Wait 2 seconds between tests to observe results
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ All tests completed');
  }

  /**
   * Get list of available tests
   */
  getAvailableTests(): string[] {
    return errorTestCases.map(test => test.name);
  }

  /**
   * Get test case details
   */
  getTestDetails(testName: string): ErrorTestCase | null {
    return errorTestCases.find(test => test.name === testName) || null;
  }

  /**
   * Setup event listeners for test events
   */
  private setupTestEventListeners(): void {
    // Listen for test events and inject errors into components
    window.addEventListener('test-quiz-error', this.handleQuizError as EventListener);
    window.addEventListener('test-mdx-error', this.handleMDXError as EventListener);
    window.addEventListener('test-codeblock-error', this.handleCodeBlockError as EventListener);
    window.addEventListener('test-scoring-error', this.handleScoringError as EventListener);
    window.addEventListener('test-progress-error', this.handleProgressError as EventListener);
    window.addEventListener('test-network-error', this.handleNetworkError as EventListener);
  }

  /**
   * Remove event listeners
   */
  private removeTestEventListeners(): void {
    window.removeEventListener('test-quiz-error', this.handleQuizError as EventListener);
    window.removeEventListener('test-mdx-error', this.handleMDXError as EventListener);
    window.removeEventListener('test-codeblock-error', this.handleCodeBlockError as EventListener);
    window.removeEventListener('test-scoring-error', this.handleScoringError as EventListener);
    window.removeEventListener('test-progress-error', this.handleProgressError as EventListener);
    window.removeEventListener('test-network-error', this.handleNetworkError as EventListener);
  }

  /**
   * Error handlers for different test scenarios
   */
  private handleQuizError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate quiz component failure
    setTimeout(() => {
      throw error;
    }, 100);
  };

  private handleMDXError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate MDX parsing failure
    const mdxComponent = document.querySelector('[data-mdx-content]');
    if (mdxComponent) {
      // Trigger error in MDX component
      setTimeout(() => {
        throw error;
      }, 100);
    }
  };

  private handleCodeBlockError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate code block rendering failure
    setTimeout(() => {
      throw error;
    }, 100);
  };

  private handleScoringError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate scoring calculation failure
    setTimeout(() => {
      throw error;
    }, 100);
  };

  private handleProgressError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate progress save failure
    console.error('Simulated progress save error:', error);
  };

  private handleNetworkError = (event: CustomEvent) => {
    const { error } = event.detail;
    // Simulate network failure
    console.error('Simulated network error:', error);
  };
}

/**
 * Create global instance for browser console access
 */
export const errorBoundaryTester = new ErrorBoundaryTester();

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).errorBoundaryTester = errorBoundaryTester;
  (window as any).testErrorBoundaries = {
    enable: () => errorBoundaryTester.enableTestMode(),
    disable: () => errorBoundaryTester.disableTestMode(),
    run: (testName: string) => errorBoundaryTester.runTest(testName),
    runAll: () => errorBoundaryTester.runAllTests(),
    list: () => errorBoundaryTester.getAvailableTests(),
    details: (testName: string) => errorBoundaryTester.getTestDetails(testName),
  };
  
  console.log(`
🧪 Error Boundary Testing Available!

Usage in browser console:
  testErrorBoundaries.enable()     - Enable test mode
  testErrorBoundaries.list()       - List available tests
  testErrorBoundaries.run('Quiz Rendering Error') - Run specific test
  testErrorBoundaries.runAll()     - Run all tests
  testErrorBoundaries.disable()    - Disable test mode

Available tests:
${errorTestCases.map(test => `  - ${test.name}`).join('\n')}
  `);
}

/**
 * Manual testing instructions
 */
export const testingInstructions = `
# Error Boundary Testing Instructions

## Setup
1. Open the application in development mode
2. Open browser console
3. Run: testErrorBoundaries.enable()

## Running Tests

### Individual Tests
- testErrorBoundaries.run('Quiz Rendering Error')
- testErrorBoundaries.run('MDX Content Parsing Error')
- testErrorBoundaries.run('Code Block Syntax Highlighting Error')

### All Tests
- testErrorBoundaries.runAll()

## Expected Behaviors

### Quiz Rendering Error
✅ Should display quiz error boundary with:
- User-friendly error message
- "Retry Question" button
- "Skip This Question" button
- "Back to Learning" button
- Error logged to console and localStorage

### MDX Content Parsing Error
✅ Should display component error boundary with:
- "Feature temporarily unavailable" message
- "Try Again" button
- Continue with other features option
- Error logged with MDX context

### Code Block Error
✅ Should display fallback content:
- Plain text version of code
- Copy functionality still working
- Error logged with code language context

## Verification Checklist

For each test:
- [ ] Error boundary catches the error (no white screen)
- [ ] User-friendly error message displayed
- [ ] Appropriate recovery actions available
- [ ] Error logged with proper context
- [ ] User can continue using other parts of the app
- [ ] Progress/state preserved where possible

## Cleanup
- testErrorBoundaries.disable()
`;

console.log('Error boundary testing utilities loaded. Run testingInstructions for more details.');