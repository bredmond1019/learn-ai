'use client';

import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

// Lazy load the Quiz component
const Quiz = lazy(() => import('./Quiz'));

interface LazyQuizProps {
  config: any;
  pathId: string;
  moduleId: string;
  sectionId: string;
  onComplete?: (result: any) => void;
  onRetry?: () => void;
}

// Loading skeleton for Quiz
const QuizLoadingSkeleton = ({ 
  onManualLoad 
}: { 
  onManualLoad?: () => void;
}) => (
  <Card className="p-8">
    <div className="space-y-6">
      {/* Quiz Header Skeleton */}
      <div className="text-center space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
      
      {/* Progress Bar Skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {/* Question Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        
        {/* Answer Options Skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex justify-between pt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </div>
      
      {/* Manual Load Option */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <ClockIcon className="h-4 w-4 inline mr-1" />
          Loading interactive quiz...
        </p>
        {onManualLoad && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManualLoad}
            className="text-xs"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Load Quiz Now
          </Button>
        )}
      </div>
    </div>
  </Card>
);

// Error fallback for Quiz loading
const QuizErrorFallback = ({ 
  error, 
  onRetry 
}: { 
  error: Error;
  onRetry: () => void;
}) => (
  <Card className="p-8 border-red-200 dark:border-red-800">
    <div className="text-center space-y-4">
      <div className="text-red-500">
        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Quiz Failed to Load
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          The quiz component couldn't be loaded. This might be due to a network issue.
        </p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <p className="text-xs text-gray-500">
            Error: {error.message}
          </p>
        </div>
      </div>
    </div>
  </Card>
);

// Error boundary for Quiz component
class QuizErrorBoundary extends React.Component<
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
        <QuizErrorFallback 
          error={this.state.error} 
          onRetry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

const LazyQuiz: React.FC<LazyQuizProps> = (props) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Auto-load after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 500); // Load quiz after 500ms

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(null);
    setRetryKey(prev => prev + 1);
    setShouldLoad(true);
  };

  if (error) {
    return <QuizErrorFallback error={error} onRetry={handleRetry} />;
  }

  if (!shouldLoad) {
    return <QuizLoadingSkeleton onManualLoad={() => setShouldLoad(true)} />;
  }

  return (
    <Suspense 
      key={retryKey}
      fallback={<QuizLoadingSkeleton />}
    >
      <QuizErrorBoundary onError={setError}>
        <Quiz {...props} />
      </QuizErrorBoundary>
    </Suspense>
  );
};

export default LazyQuiz;
export type { LazyQuizProps };