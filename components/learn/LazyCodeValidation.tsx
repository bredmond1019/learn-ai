'use client';

import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

// Temporary stub component for code validation
const CodeValidation = lazy(() => Promise.resolve({ 
  default: ({ code, language, onValidationComplete, className }: LazyCodeValidationProps) => (
    <div className={className}>
      <p>Code validation not implemented yet</p>
    </div>
  )
}));

interface LazyCodeValidationProps {
  // Add props based on CodeValidation component
  code?: string;
  language?: string;
  onValidationComplete?: (result: any) => void;
  className?: string;
}

// Loading skeleton for CodeValidation
const CodeValidationSkeleton = ({ 
  onManualLoad 
}: { 
  onManualLoad?: () => void;
}) => (
  <Card className="p-6">
    <div className="space-y-6">
      {/* Validation Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </div>

      {/* Code Input Skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Validation Rules Skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Cases Skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-3 border rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Area Skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Manual Load Option */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <CodeBracketIcon className="h-4 w-4 inline mr-1" />
          Loading code validation engine...
        </p>
        {onManualLoad && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManualLoad}
            className="text-xs"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Load Validator Now
          </Button>
        )}
      </div>
    </div>
  </Card>
);

// Error fallback for CodeValidation
const CodeValidationErrorFallback = ({ 
  error, 
  onRetry 
}: { 
  error: Error;
  onRetry: () => void;
}) => (
  <Card className="p-8 border-red-200 dark:border-red-800">
    <div className="text-center space-y-4">
      <div className="text-red-500">
        <CodeBracketIcon className="h-12 w-12 mx-auto" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Code Validator Failed to Load
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          The code validation component couldn't be loaded. You can still write and run code manually.
        </p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry Validator
          </Button>
          <p className="text-xs text-gray-500">
            Error: {error.message}
          </p>
        </div>
      </div>
    </div>
  </Card>
);

// Error boundary for CodeValidation
class CodeValidationErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <CodeValidationErrorFallback 
          error={this.state.error} 
          onRetry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

const LazyCodeValidation: React.FC<LazyCodeValidationProps> = (props) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Load when component becomes visible or on user interaction
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Load when close to viewport
      }
    );

    const container = document.getElementById('code-validation-container');
    if (container) {
      observer.observe(container);
      
      // Also load on user interaction with container
      const handleInteraction = () => {
        setShouldLoad(true);
        observer.disconnect();
      };
      
      container.addEventListener('mouseenter', handleInteraction, { once: true });
      container.addEventListener('focusin', handleInteraction, { once: true });
      
      return () => {
        observer.disconnect();
        container.removeEventListener('mouseenter', handleInteraction);
        container.removeEventListener('focusin', handleInteraction);
      };
    }

    // Fallback: load after 3 seconds if not triggered
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setRetryKey(prev => prev + 1);
    setShouldLoad(true);
  };

  if (error) {
    return <CodeValidationErrorFallback error={error} onRetry={handleRetry} />;
  }

  return (
    <div id="code-validation-container">
      {shouldLoad ? (
        <Suspense 
          key={retryKey}
          fallback={<CodeValidationSkeleton />}
        >
          <CodeValidationErrorBoundary onError={setError}>
            <CodeValidation {...props} />
          </CodeValidationErrorBoundary>
        </Suspense>
      ) : (
        <CodeValidationSkeleton onManualLoad={() => setShouldLoad(true)} />
      )}
    </div>
  );
};

export default LazyCodeValidation;
export type { LazyCodeValidationProps };