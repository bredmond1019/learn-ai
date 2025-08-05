'use client';

import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon as AlertTriangleIcon, ArrowPathIcon as RefreshCwIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logComponentError } from '@/lib/core/monitoring/error-logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  componentName?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error using our centralized logging system
    logComponentError(
      error,
      this.props.componentName || 'ErrorBoundary',
      errorInfo,
      {
        level: this.props.level || 'component',
        hasCustomFallback: !!this.props.fallback,
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on error level
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          level={this.props.level || 'component'}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  level: 'page' | 'component' | 'critical';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  level,
}) => {
  const getErrorMessage = () => {
    switch (level) {
      case 'critical':
        return {
          title: 'Oops! Something went wrong',
          message: 'We encountered a critical issue. Please refresh the page, and if the problem persists, contact our support team.',
          showDetails: false,
          actions: ['refresh', 'home', 'contact'],
        };
      case 'page':
        return {
          title: 'Page temporarily unavailable',
          message: 'This page is experiencing technical difficulties. You can try refreshing or navigate to another section.',
          showDetails: process.env.NODE_ENV === 'development',
          actions: ['refresh', 'retry', 'back'],
        };
      case 'component':
      default:
        return {
          title: 'Feature temporarily unavailable',
          message: 'This feature is experiencing a temporary issue. You can try again or continue with other parts of the platform.',
          showDetails: process.env.NODE_ENV === 'development',
          actions: ['retry', 'continue'],
        };
    }
  };

  const errorConfig = getErrorMessage();

  return (
    <Card className="p-6 border-red-200 dark:border-red-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertTriangleIcon className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            {errorConfig.title}
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {errorConfig.message}
          </p>
          
          {errorConfig.showDetails && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 rounded border">
                <p className="text-xs font-mono text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
                {errorInfo && (
                  <pre className="mt-2 text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    <strong>Component Stack:</strong>
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
            {errorConfig.actions.includes('retry') && (
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCwIcon className="h-4 w-4" />
                <span>Try Again</span>
              </Button>
            )}
            
            {errorConfig.actions.includes('refresh') && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCwIcon className="h-4 w-4" />
                <span>Refresh Page</span>
              </Button>
            )}
            
            {errorConfig.actions.includes('home') && (
              <Button
                onClick={() => window.location.href = '/'}
                variant="default"
                size="sm"
              >
                Go to Homepage
              </Button>
            )}
            
            {errorConfig.actions.includes('back') && (
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="sm"
              >
                Go Back
              </Button>
            )}
            
            {errorConfig.actions.includes('contact') && (
              <Button
                onClick={() => window.location.href = '/contact'}
                variant="outline"
                size="sm"
              >
                Contact Support
              </Button>
            )}
            
            {errorConfig.actions.includes('continue') && (
              <Button
                onClick={() => {
                  // Scroll to next section or continue with page
                  const nextSection = document.querySelector('[data-next-section]');
                  if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onReset();
                  }
                }}
                variant="default"
                size="sm"
              >
                Continue Learning
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Convenience wrapper components for different error levels
export const PageErrorBoundary: React.FC<{ 
  children: ReactNode; 
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}> = ({ children, onError, componentName }) => (
  <ErrorBoundary level="page" onError={onError} componentName={componentName}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode; 
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}> = ({ children, onError, componentName }) => (
  <ErrorBoundary level="component" onError={onError} componentName={componentName}>
    {children}
  </ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ 
  children: ReactNode; 
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}> = ({ children, onError, componentName }) => (
  <ErrorBoundary level="critical" onError={onError} componentName={componentName}>
    {children}
  </ErrorBoundary>
);

// Specialized Quiz Error Boundary with quiz-specific recovery options
export const QuizErrorBoundary: React.FC<{ 
  children: ReactNode; 
  quizId?: string;
  onRetry?: () => void;
  onSkipQuestion?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void 
}> = ({ children, quizId, onRetry, onSkipQuestion, onError }) => (
  <ErrorBoundary 
    level="component" 
    componentName="Quiz"
    onError={onError}
    fallback={
      <Card className="p-6 border-orange-200 dark:border-orange-800">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertTriangleIcon className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              Quiz temporarily unavailable
            </h3>
            <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
              There was an issue loading this quiz question. Don't worry - your progress is saved.
            </p>
            
            <div className="mt-4 flex flex-wrap gap-3">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  <span>Retry Question</span>
                </Button>
              )}
              
              {onSkipQuestion && (
                <Button
                  onClick={onSkipQuestion}
                  variant="outline"
                  size="sm"
                >
                  Skip This Question
                </Button>
              )}
              
              <Button
                onClick={() => window.location.href = '/learn'}
                variant="default"
                size="sm"
              >
                Back to Learning
              </Button>
            </div>
          </div>
        </div>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;