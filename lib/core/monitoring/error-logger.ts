/**
 * Centralized Error Logging System
 * 
 * Provides comprehensive error logging with multiple reporters and rich context
 */

export interface ErrorContext {
  componentName?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  buildVersion?: string;
  environment?: string;
  [key: string]: any;
}

export interface QuizContext extends ErrorContext {
  quizId?: string;
  questionId?: string;
  questionType?: string;
  currentAnswers?: Record<string, any>;
  attemptNumber?: number;
  timeRemaining?: number;
}

export interface ErrorReport {
  id: string;
  error: Error;
  errorInfo?: React.ErrorInfo;
  context: ErrorContext;
  level: 'error' | 'warning' | 'info';
  tags: string[];
  fingerprint: string;
}

export interface ErrorReporter {
  name: string;
  report(errorReport: ErrorReport): Promise<void>;
}

/**
 * Console Error Reporter - For development and debugging
 */
class ConsoleReporter implements ErrorReporter {
  name = 'console';

  async report(errorReport: ErrorReport): Promise<void> {
    const { error, errorInfo, context, level, tags } = errorReport;
    
    const logMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
    
    console.group(`🚨 ${level.toUpperCase()}: ${error.message}`);
    console[logMethod]('Error:', error);
    
    if (errorInfo) {
      console[logMethod]('Component Stack:', errorInfo.componentStack);
    }
    
    if (error.stack) {
      console[logMethod]('Stack Trace:', error.stack);
    }
    
    console[logMethod]('Context:', context);
    console[logMethod]('Tags:', tags);
    console[logMethod]('Fingerprint:', errorReport.fingerprint);
    console.groupEnd();
  }
}

/**
 * Local Storage Reporter - For client-side persistence
 */
class LocalStorageReporter implements ErrorReporter {
  name = 'localStorage';
  private maxEntries = 50;
  private storageKey = 'learning-platform-errors';

  async report(errorReport: ErrorReport): Promise<void> {
    try {
      const existingErrors = this.getStoredErrors();
      const newErrors = [
        {
          id: errorReport.id,
          message: errorReport.error.message,
          stack: errorReport.error.stack,
          componentStack: errorReport.errorInfo?.componentStack,
          context: errorReport.context,
          level: errorReport.level,
          tags: errorReport.tags,
          fingerprint: errorReport.fingerprint,
          timestamp: new Date().toISOString(),
        },
        ...existingErrors.slice(0, this.maxEntries - 1),
      ];

      localStorage.setItem(this.storageKey, JSON.stringify(newErrors));
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError);
    }
  }

  private getStoredErrors(): any[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getRecentErrors(): any[] {
    return this.getStoredErrors();
  }

  clearErrors(): void {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Remote Error Reporter - For production error reporting
 * This is a stub implementation that can be extended with actual services
 */
class RemoteReporter implements ErrorReporter {
  name = 'remote';
  private endpoint: string;
  private apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async report(errorReport: ErrorReport): Promise<void> {
    // In production, this would send to services like Sentry, LogRocket, etc.
    try {
      const payload = {
        message: errorReport.error.message,
        stack: errorReport.error.stack,
        componentStack: errorReport.errorInfo?.componentStack,
        context: errorReport.context,
        level: errorReport.level,
        tags: errorReport.tags,
        fingerprint: errorReport.fingerprint,
        timestamp: new Date().toISOString(),
      };

      // Stub implementation - replace with actual service calls
      if (process.env.NODE_ENV === 'development') {
        console.log('Would send to remote:', this.endpoint, payload);
      } else {
        // await fetch(this.endpoint, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${this.apiKey}`,
        //   },
        //   body: JSON.stringify(payload),
        // });
      }
    } catch (reportError) {
      console.warn('Failed to send error to remote service:', reportError);
    }
  }
}

/**
 * Main Error Logger Class
 */
class ErrorLogger {
  private reporters: ErrorReporter[] = [];
  private sessionId: string;
  private defaultContext: ErrorContext = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupDefaultReporters();
    this.setupDefaultContext();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupDefaultReporters(): void {
    // Always add console reporter
    this.addReporter(new ConsoleReporter());

    // Add localStorage reporter for client-side persistence
    if (typeof window !== 'undefined') {
      this.addReporter(new LocalStorageReporter());
    }

    // Add remote reporter in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
      this.addReporter(new RemoteReporter(
        process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT,
        process.env.NEXT_PUBLIC_ERROR_REPORTING_API_KEY || ''
      ));
    }
  }

  private setupDefaultContext(): void {
    this.defaultContext = {
      sessionId: this.sessionId,
      environment: process.env.NODE_ENV || 'development',
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      this.defaultContext.url = window.location.href;
      this.defaultContext.userAgent = navigator.userAgent;
    }
  }

  addReporter(reporter: ErrorReporter): void {
    this.reporters.push(reporter);
  }

  removeReporter(reporterName: string): void {
    this.reporters = this.reporters.filter(r => r.name !== reporterName);
  }

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    const errorString = `${error.name}:${error.message}:${context.componentName || 'unknown'}`;
    return btoa(errorString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Log a general error
   */
  async logError(
    error: Error,
    context: ErrorContext = {},
    errorInfo?: React.ErrorInfo,
    level: 'error' | 'warning' | 'info' = 'error'
  ): Promise<void> {
    const mergedContext = { ...this.defaultContext, ...context };
    const fingerprint = this.generateFingerprint(error, mergedContext);
    
    const errorReport: ErrorReport = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error,
      errorInfo,
      context: mergedContext,
      level,
      tags: [level, mergedContext.componentName || 'unknown'].filter(Boolean),
      fingerprint,
    };

    // Report to all configured reporters
    const reportPromises = this.reporters.map(reporter => 
      reporter.report(errorReport).catch(reportError => 
        console.warn(`Reporter ${reporter.name} failed:`, reportError)
      )
    );

    await Promise.all(reportPromises);
  }

  /**
   * Log a quiz-specific error with additional context
   */
  async logQuizError(
    error: Error,
    quizContext: QuizContext,
    errorInfo?: React.ErrorInfo,
    level: 'error' | 'warning' | 'info' = 'error'
  ): Promise<void> {
    const enhancedContext: QuizContext = {
      ...quizContext,
      componentName: quizContext.componentName || 'Quiz',
    };

    const tags = [
      level,
      'quiz',
      quizContext.questionType || 'unknown-question-type',
      quizContext.quizId || 'unknown-quiz',
    ].filter(Boolean);

    const mergedContext = { ...this.defaultContext, ...enhancedContext };
    const fingerprint = this.generateFingerprint(error, mergedContext);
    
    const errorReport: ErrorReport = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error,
      errorInfo,
      context: mergedContext,
      level,
      tags,
      fingerprint,
    };

    // Report to all configured reporters
    const reportPromises = this.reporters.map(reporter => 
      reporter.report(errorReport).catch(reportError => 
        console.warn(`Reporter ${reporter.name} failed:`, reportError)
      )
    );

    await Promise.all(reportPromises);
  }

  /**
   * Log a component rendering error
   */
  async logComponentError(
    error: Error,
    componentName: string,
    errorInfo?: React.ErrorInfo,
    additionalContext: ErrorContext = {}
  ): Promise<void> {
    await this.logError(
      error,
      {
        componentName,
        ...additionalContext,
      },
      errorInfo,
      'error'
    );
  }

  /**
   * Get recent errors from localStorage reporter
   */
  getRecentErrors(): any[] {
    const localStorageReporter = this.reporters.find(
      r => r.name === 'localStorage'
    ) as LocalStorageReporter;
    
    return localStorageReporter ? localStorageReporter.getRecentErrors() : [];
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    const localStorageReporter = this.reporters.find(
      r => r.name === 'localStorage'
    ) as LocalStorageReporter;
    
    if (localStorageReporter) {
      localStorageReporter.clearErrors();
    }
  }

  /**
   * Get session information
   */
  getSessionInfo(): { sessionId: string; context: ErrorContext } {
    return {
      sessionId: this.sessionId,
      context: this.defaultContext,
    };
  }
}

// Create and export singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = errorLogger.logError.bind(errorLogger);
export const logQuizError = errorLogger.logQuizError.bind(errorLogger);
export const logComponentError = errorLogger.logComponentError.bind(errorLogger);

// Export types for external use
export type { ErrorLogger };