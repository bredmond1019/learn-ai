/**
 * Production monitoring and error tracking setup
 * Integrates with external services for comprehensive observability
 */

import { env, isProduction } from '@/lib/core/environment/env';
import { logger } from './logger';

// Types for monitoring data
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  buildId?: string;
  [key: string]: any;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp?: string;
}

// Mock Sentry-like error tracking (replace with actual Sentry SDK)
class ErrorTracker {
  private initialized = false;

  init() {
    if (this.initialized || !env.SENTRY_DSN) return;

    try {
      // In a real implementation, you would initialize Sentry here:
      // Sentry.init({
      //   dsn: env.SENTRY_DSN,
      //   environment: env.NODE_ENV,
      //   release: env.DEPLOYMENT_VERSION,
      //   integrations: [
      //     new Sentry.Integrations.Http({ tracing: true }),
      //     new Sentry.Integrations.Express({ app }),
      //   ],
      //   tracesSampleRate: 0.1,
      // });

      this.initialized = true;
      logger.info('Error tracking initialized', {
        service: 'sentry',
        environment: env.NODE_ENV,
      });
    } catch (error) {
      logger.error('Failed to initialize error tracking', {}, error as Error);
    }
  }

  captureError(error: Error, context?: ErrorContext) {
    if (!this.initialized) {
      logger.error('Error tracker not initialized', { error: error.message });
      return;
    }

    try {
      // In a real implementation:
      // Sentry.withScope((scope) => {
      //   if (context) {
      //     Object.keys(context).forEach(key => {
      //       scope.setTag(key, context[key]);
      //     });
      //   }
      //   Sentry.captureException(error);
      // });

      // For now, just log the error with enhanced context
      logger.error('Application error captured', {
        ...context,
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      }, error);
    } catch (trackingError) {
      logger.error('Failed to capture error', {}, trackingError as Error);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (!this.initialized) {
      logger.info('Message capture (fallback)', { message, level, ...context });
      return;
    }

    try {
      // In a real implementation:
      // Sentry.withScope((scope) => {
      //   if (context) {
      //     Object.keys(context).forEach(key => {
      //       scope.setTag(key, context[key]);
      //     });
      //   }
      //   Sentry.captureMessage(message, level);
      // });

      logger.info('Message captured', {
        message,
        level,
        ...context,
      });
    } catch (trackingError) {
      logger.error('Failed to capture message', {}, trackingError as Error);
    }
  }

  setUserContext(user: { id: string; email?: string; username?: string }) {
    if (!this.initialized) return;

    try {
      // In a real implementation:
      // Sentry.setUser(user);
      
      logger.debug('User context set', { userId: user.id });
    } catch (error) {
      logger.error('Failed to set user context', {}, error as Error);
    }
  }
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private initialized = false;

  init() {
    if (this.initialized || !env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING) return;

    try {
      // Initialize performance monitoring
      if (typeof window !== 'undefined') {
        this.initClientSideMonitoring();
      } else {
        this.initServerSideMonitoring();
      }

      this.initialized = true;
      logger.info('Performance monitoring initialized');
    } catch (error) {
      logger.error('Failed to initialize performance monitoring', {}, error as Error);
    }
  }

  private initClientSideMonitoring() {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      this.observeWebVitals();
      
      // Monitor custom metrics
      this.observeNavigationTiming();
      this.observeResourceTiming();
    }
  }

  private initServerSideMonitoring() {
    // Server-side performance monitoring setup
    logger.debug('Server-side performance monitoring initialized');
  }

  private observeWebVitals() {
    // This would integrate with web-vitals library:
    // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    
    // getCLS(this.recordMetric.bind(this));
    // getFID(this.recordMetric.bind(this));
    // getFCP(this.recordMetric.bind(this));
    // getLCP(this.recordMetric.bind(this));
    // getTTFB(this.recordMetric.bind(this));
  }

  private observeNavigationTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    this.recordMetric({
      name: 'navigation.dom_content_loaded',
      value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      unit: 'ms',
      tags: { type: 'navigation' },
    });

    this.recordMetric({
      name: 'navigation.load_complete',
      value: navigation.loadEventEnd - navigation.loadEventStart,
      unit: 'ms',
      tags: { type: 'navigation' },
    });
  }

  private observeResourceTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      this.recordMetric({
        name: 'resource.load_time',
        value: resource.responseEnd - resource.requestStart,
        unit: 'ms',
        tags: {
          type: 'resource',
          resourceType: resource.initiatorType,
          url: resource.name,
        },
      });
    });
  }

  recordMetric(metric: PerformanceMetric) {
    const enrichedMetric: PerformanceMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString(),
    };

    this.metrics.push(enrichedMetric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    logger.debug('Performance metric recorded', enrichedMetric);

    // Send to external service if configured
    this.sendToExternalService(enrichedMetric);
  }

  private sendToExternalService(metric: PerformanceMetric) {
    // This would send metrics to services like:
    // - DataDog
    // - New Relic
    // - Grafana
    // - Custom metrics endpoint
    
    try {
      // Example: Send to custom metrics endpoint
      if (isProduction() && typeof fetch !== 'undefined') {
        fetch('/api/metrics/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        }).catch(error => {
          logger.error('Failed to send metric to external service', {}, error);
        });
      }
    } catch (error) {
      logger.error('Failed to send performance metric', {}, error as Error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Create singleton instances
const errorTracker = new ErrorTracker();
const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring
export function initializeMonitoring() {
  try {
    errorTracker.init();
    performanceMonitor.init();
    
    logger.info('Monitoring services initialized', {
      errorTracking: !!env.SENTRY_DSN,
      performanceMonitoring: env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
    });
  } catch (error) {
    logger.error('Failed to initialize monitoring', {}, error as Error);
  }
}

// Export monitoring utilities
export const monitoring = {
  // Error tracking
  captureError: (error: Error, context?: ErrorContext) => {
    errorTracker.captureError(error, context);
  },
  
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => {
    errorTracker.captureMessage(message, level, context);
  },
  
  setUserContext: (user: { id: string; email?: string; username?: string }) => {
    errorTracker.setUserContext(user);
  },
  
  // Performance monitoring
  recordMetric: (metric: PerformanceMetric) => {
    performanceMonitor.recordMetric(metric);
  },
  
  getMetrics: () => performanceMonitor.getMetrics(),
  
  clearMetrics: () => performanceMonitor.clearMetrics(),
  
  // Utility functions
  measureAsync: async <T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> => {
    const start = Date.now();
    try {
      const result = await fn();
      performanceMonitor.recordMetric({
        name,
        value: Date.now() - start,
        unit: 'ms',
        tags,
      });
      return result;
    } catch (error) {
      performanceMonitor.recordMetric({
        name,
        value: Date.now() - start,
        unit: 'ms',
        tags: { ...tags, error: 'true' },
      });
      throw error;
    }
  },
  
  measureSync: <T>(name: string, fn: () => T, tags?: Record<string, string>): T => {
    const start = Date.now();
    try {
      const result = fn();
      performanceMonitor.recordMetric({
        name,
        value: Date.now() - start,
        unit: 'ms',
        tags,
      });
      return result;
    } catch (error) {
      performanceMonitor.recordMetric({
        name,
        value: Date.now() - start,
        unit: 'ms',
        tags: { ...tags, error: 'true' },
      });
      throw error;
    }
  },
};

// React hook for client-side monitoring
export function useMonitoring() {
  return {
    captureError: monitoring.captureError,
    recordMetric: monitoring.recordMetric,
    measureAsync: monitoring.measureAsync,
  };
}

// Higher-order function for API route monitoring
export function withMonitoring<T extends (...args: any[]) => any>(
  handler: T,
  operationName?: string
): T {
  return (async (...args: any[]) => {
    const start = Date.now();
    const operation = operationName || handler.name || 'api_request';
    
    try {
      const result = await handler(...args);
      
      performanceMonitor.recordMetric({
        name: `api.${operation}.duration`,
        value: Date.now() - start,
        unit: 'ms',
        tags: { success: 'true' },
      });
      
      return result;
    } catch (error) {
      performanceMonitor.recordMetric({
        name: `api.${operation}.duration`,
        value: Date.now() - start,
        unit: 'ms',
        tags: { success: 'false' },
      });
      
      errorTracker.captureError(error as Error, {
        operation,
        duration: Date.now() - start,
      });
      
      throw error;
    }
  }) as T;
}