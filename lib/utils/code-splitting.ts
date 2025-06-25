/**
 * Code Splitting Utilities
 * 
 * Centralized utilities for managing lazy-loaded components and code splitting optimization
 */

import { lazy, LazyExoticComponent, ComponentType } from 'react';

// Performance monitoring for lazy loading
interface LoadingMetrics {
  componentName: string;
  loadStartTime: number;
  loadEndTime?: number;
  loadDuration?: number;
  success: boolean;
  error?: string;
}

class CodeSplittingManager {
  private metrics: LoadingMetrics[] = [];
  private preloadQueue: Set<string> = new Set();

  /**
   * Create a lazy-loaded component with performance monitoring
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    componentName: string,
    options: {
      preloadOnIdle?: boolean;
      preloadOnHover?: boolean;
      maxRetries?: number;
    } = {}
  ): LazyExoticComponent<T> {
    const {
      preloadOnIdle = false,
      preloadOnHover = false,
      maxRetries = 3
    } = options;

    // Create retry wrapper for the import function
    const retryableImport = this.createRetryableImport(
      importFunction,
      componentName,
      maxRetries
    );

    const LazyComponent = lazy(retryableImport);

    // Setup preloading strategies
    if (preloadOnIdle) {
      this.scheduleIdlePreload(componentName, retryableImport);
    }

    if (preloadOnHover) {
      this.setupHoverPreload(componentName, retryableImport);
    }

    return LazyComponent;
  }

  /**
   * Create a retryable import function with performance monitoring
   */
  private createRetryableImport<T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    componentName: string,
    maxRetries: number
  ) {
    return async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      let lastError: Error | null = null;

      // Start tracking
      const metric: LoadingMetrics = {
        componentName,
        loadStartTime: startTime,
        success: false,
      };

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Mark start for performance monitoring
          if (typeof performance !== 'undefined') {
            performance.mark(`lazy-load-start-${componentName}-${attempt}`);
          }

          const module = await importFunction();
          
          // Mark end and measure
          const endTime = performance.now();
          if (typeof performance !== 'undefined') {
            performance.mark(`lazy-load-end-${componentName}-${attempt}`);
            try {
              performance.measure(
                `lazy-load-${componentName}-${attempt}`,
                `lazy-load-start-${componentName}-${attempt}`,
                `lazy-load-end-${componentName}-${attempt}`
              );
            } catch (e) {
              // Performance measurement might fail in some environments
            }
          }

          // Update metrics
          metric.loadEndTime = endTime;
          metric.loadDuration = endTime - startTime;
          metric.success = true;

          this.metrics.push(metric);

          // Log success in development
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `✅ Lazy loaded ${componentName} in ${metric.loadDuration.toFixed(2)}ms`
            );
          }

          return module;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt === maxRetries) {
            // Final failure
            metric.success = false;
            metric.error = lastError.message;
            metric.loadEndTime = performance.now();
            metric.loadDuration = metric.loadEndTime - startTime;

            this.metrics.push(metric);

            // Log error in development
            if (process.env.NODE_ENV === 'development') {
              console.error(
                `❌ Failed to lazy load ${componentName} after ${maxRetries} attempts:`,
                lastError
              );
            }

            throw lastError;
          }

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }

      // This should never be reached, but TypeScript requires it
      throw lastError || new Error(`Failed to load ${componentName}`);
    };
  }

  /**
   * Schedule component preloading during CPU idle time
   */
  private scheduleIdlePreload(
    componentName: string,
    importFunction: () => Promise<any>
  ) {
    if (this.preloadQueue.has(componentName)) return;

    this.preloadQueue.add(componentName);

    const preload = () => {
      importFunction().catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to preload ${componentName}:`, error);
        }
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(preload, { timeout: 10000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preload, 2000);
    }
  }

  /**
   * Setup hover-based preloading for components
   */
  private setupHoverPreload(
    componentName: string,
    importFunction: () => Promise<any>
  ) {
    if (typeof window === 'undefined') return;

    // Find elements that might trigger this component
    const setupHoverListeners = () => {
      const triggers = document.querySelectorAll(
        `[data-preload="${componentName}"], [data-component="${componentName}"]`
      );

      triggers.forEach(trigger => {
        const handleHover = () => {
          if (!this.preloadQueue.has(componentName)) {
            this.preloadQueue.add(componentName);
            importFunction().catch(error => {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Failed to preload ${componentName} on hover:`, error);
              }
            });
          }
        };

        trigger.addEventListener('mouseenter', handleHover, { once: true });
        trigger.addEventListener('focusin', handleHover, { once: true });
      });
    };

    // Setup listeners when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupHoverListeners);
    } else {
      setupHoverListeners();
    }
  }

  /**
   * Preload specific components manually
   */
  async preloadComponent(componentName: string): Promise<void> {
    // This would need a registry of component import functions
    // For now, this is a placeholder for manual preloading
    console.log(`Manual preload requested for ${componentName}`);
  }

  /**
   * Get loading metrics for analysis
   */
  getMetrics(): LoadingMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);

    const avgLoadTime = successful.length > 0
      ? successful.reduce((sum, m) => sum + (m.loadDuration || 0), 0) / successful.length
      : 0;

    return {
      totalComponents: this.metrics.length,
      successfulLoads: successful.length,
      failedLoads: failed.length,
      averageLoadTime: avgLoadTime,
      successRate: this.metrics.length > 0 ? (successful.length / this.metrics.length) * 100 : 0,
    };
  }

  /**
   * Clear metrics (useful for testing)
   */
  clearMetrics(): void {
    this.metrics = [];
    this.preloadQueue.clear();
  }
}

// Create singleton instance
export const codeSplittingManager = new CodeSplittingManager();

/**
 * Pre-configured lazy component creators for common patterns
 */
export const createLazyLearningComponent = <T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  componentName: string
) => {
  return codeSplittingManager.createLazyComponent(importFunction, componentName, {
    preloadOnIdle: true,
    preloadOnHover: true,
    maxRetries: 3,
  });
};

export const createLazyDashboardComponent = <T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  componentName: string
) => {
  return codeSplittingManager.createLazyComponent(importFunction, componentName, {
    preloadOnIdle: false, // Dashboards are usually navigated to intentionally
    preloadOnHover: true,
    maxRetries: 2,
  });
};

export const createLazyUtilityComponent = <T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  componentName: string
) => {
  return codeSplittingManager.createLazyComponent(importFunction, componentName, {
    preloadOnIdle: true, // Utilities can be preloaded
    preloadOnHover: false,
    maxRetries: 2,
  });
};

/**
 * Bundle analyzer helper - logs component loading stats
 */
export const logBundleStats = () => {
  if (process.env.NODE_ENV === 'development') {
    const summary = codeSplittingManager.getPerformanceSummary();
    console.group('📦 Code Splitting Performance Summary');
    console.log('Total Components:', summary.totalComponents);
    console.log('Success Rate:', `${summary.successRate.toFixed(1)}%`);
    console.log('Average Load Time:', `${summary.averageLoadTime.toFixed(2)}ms`);
    console.log('Failed Loads:', summary.failedLoads);
    console.groupEnd();

    // Detailed metrics
    const metrics = codeSplittingManager.getMetrics();
    if (metrics.length > 0) {
      console.table(metrics);
    }
  }
};

/**
 * Hook for accessing code splitting metrics in development
 */
export const useCodeSplittingMetrics = () => {
  const getMetrics = () => codeSplittingManager.getMetrics();
  const getSummary = () => codeSplittingManager.getPerformanceSummary();
  
  return {
    getMetrics,
    getSummary,
    logStats: logBundleStats,
  };
};

// Expose global debug utilities in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).codeSplittingDebug = {
    getMetrics: () => codeSplittingManager.getMetrics(),
    getSummary: () => codeSplittingManager.getPerformanceSummary(),
    logStats: logBundleStats,
    clearMetrics: () => codeSplittingManager.clearMetrics(),
  };
}