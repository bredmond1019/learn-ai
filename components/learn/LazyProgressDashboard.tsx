'use client';

import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Lazy load the ProgressDashboard component
const ProgressDashboard = lazy(() => import('./ProgressDashboard'));

interface LazyProgressDashboardProps {
  // Add props based on ProgressDashboard component
  userId?: string;
  pathId?: string;
  className?: string;
}

// Loading skeleton for ProgressDashboard
const ProgressDashboardSkeleton = ({ 
  onManualLoad 
}: { 
  onManualLoad?: () => void;
}) => (
  <div className="space-y-6">
    {/* Dashboard Header Skeleton */}
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      </div>
    </Card>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
          </div>
        </Card>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </Card>
    </div>

    {/* Recent Activity Skeleton */}
    <Card className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Manual Load Option */}
    <div className="text-center pt-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        <ChartBarIcon className="h-4 w-4 inline mr-1" />
        Loading progress dashboard...
      </p>
      {onManualLoad && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onManualLoad}
          className="text-xs"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Load Dashboard Now
        </Button>
      )}
    </div>
  </div>
);

// Error fallback for ProgressDashboard
const ProgressDashboardErrorFallback = ({ 
  error, 
  onRetry 
}: { 
  error: Error;
  onRetry: () => void;
}) => (
  <Card className="p-8 border-red-200 dark:border-red-800">
    <div className="text-center space-y-4">
      <div className="text-red-500">
        <ChartBarIcon className="h-12 w-12 mx-auto" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Dashboard Failed to Load
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          The progress dashboard couldn't be loaded. Your progress data is safe.
        </p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry Dashboard
          </Button>
          <p className="text-xs text-gray-500">
            Error: {error.message}
          </p>
        </div>
      </div>
    </div>
  </Card>
);

// Error boundary for ProgressDashboard
class ProgressDashboardErrorBoundary extends React.Component<
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
        <ProgressDashboardErrorFallback 
          error={this.state.error} 
          onRetry={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

const LazyProgressDashboard: React.FC<LazyProgressDashboardProps> = (props) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Load when component becomes visible
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
        rootMargin: '50px',
      }
    );

    const container = document.getElementById('progress-dashboard-container');
    if (container) {
      observer.observe(container);
    }

    // Fallback: load after 2 seconds if not visible
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);

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
    return <ProgressDashboardErrorFallback error={error} onRetry={handleRetry} />;
  }

  return (
    <div id="progress-dashboard-container">
      {shouldLoad ? (
        <Suspense 
          key={retryKey}
          fallback={<ProgressDashboardSkeleton />}
        >
          <ProgressDashboardErrorBoundary onError={setError}>
            <ProgressDashboard {...props} />
          </ProgressDashboardErrorBoundary>
        </Suspense>
      ) : (
        <ProgressDashboardSkeleton onManualLoad={() => setShouldLoad(true)} />
      )}
    </div>
  );
};

export default LazyProgressDashboard;
export type { LazyProgressDashboardProps };