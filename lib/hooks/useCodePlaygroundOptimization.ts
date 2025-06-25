'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CodePlaygroundOptimizationOptions {
  /**
   * Auto-load Monaco Editor after this delay (in ms)
   * Set to 0 to disable auto-loading
   */
  autoLoadDelay?: number;
  
  /**
   * Load Monaco on user interaction (hover, focus, etc.)
   */
  loadOnInteraction?: boolean;
  
  /**
   * Load Monaco when component becomes visible
   */
  loadOnVisible?: boolean;
  
  /**
   * Preload Monaco when CPU is idle
   */
  loadOnIdle?: boolean;
}

interface CodePlaygroundOptimization {
  shouldLoadEditor: boolean;
  triggerLoad: () => void;
  isEditorLoaded: boolean;
  setEditorLoaded: (loaded: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to optimize Monaco Editor loading in CodePlayground
 * 
 * This hook implements various strategies to lazy load Monaco Editor:
 * - Auto-load after delay
 * - Load on user interaction
 * - Load when visible (Intersection Observer)
 * - Load during CPU idle time
 */
export function useCodePlaygroundOptimization(
  options: CodePlaygroundOptimizationOptions = {}
): CodePlaygroundOptimization {
  const {
    autoLoadDelay = 2000, // 2 seconds default
    loadOnInteraction = true,
    loadOnVisible = true,
    loadOnIdle = true,
  } = options;

  const [shouldLoadEditor, setShouldLoadEditor] = useState(false);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredLoad = useRef(false);

  const triggerLoad = useCallback(() => {
    if (!hasTriggeredLoad.current) {
      hasTriggeredLoad.current = true;
      setShouldLoadEditor(true);
    }
  }, []);

  // Auto-load after delay
  useEffect(() => {
    if (autoLoadDelay > 0 && !hasTriggeredLoad.current) {
      const timer = setTimeout(() => {
        triggerLoad();
      }, autoLoadDelay);

      return () => clearTimeout(timer);
    }
  }, [autoLoadDelay, triggerLoad]);

  // Load on interaction (hover, focus, click)
  useEffect(() => {
    if (!loadOnInteraction || hasTriggeredLoad.current) return;

    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      triggerLoad();
    };

    // Add interaction listeners
    container.addEventListener('mouseenter', handleInteraction, { once: true });
    container.addEventListener('focusin', handleInteraction, { once: true });
    container.addEventListener('click', handleInteraction, { once: true });
    container.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      container.removeEventListener('mouseenter', handleInteraction);
      container.removeEventListener('focusin', handleInteraction);
      container.removeEventListener('click', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
    };
  }, [loadOnInteraction, triggerLoad]);

  // Load when visible (Intersection Observer)
  useEffect(() => {
    if (!loadOnVisible || hasTriggeredLoad.current) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          triggerLoad();
          observer.disconnect();
        }
      },
      {
        // Load when 10% of the component is visible
        threshold: 0.1,
        // Add some margin to trigger loading slightly before component is visible
        rootMargin: '50px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [loadOnVisible, triggerLoad]);

  // Load during CPU idle time
  useEffect(() => {
    if (!loadOnIdle || hasTriggeredLoad.current) return;

    // Check if browser supports requestIdleCallback
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        triggerLoad();
      }, {
        timeout: 5000, // Force load after 5 seconds even if not idle
      });

      return () => {
        window.cancelIdleCallback(idleCallback);
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timer = setTimeout(() => {
        triggerLoad();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loadOnIdle, triggerLoad]);

  return {
    shouldLoadEditor,
    triggerLoad,
    isEditorLoaded,
    setEditorLoaded: setIsEditorLoaded,
    containerRef,
  };
}

/**
 * Performance monitoring for Monaco Editor loading
 */
export function useMonacoPerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    loadStartTime?: number;
    loadEndTime?: number;
    loadDuration?: number;
    bundleSize?: number;
  }>({});

  const startLoadMeasurement = useCallback(() => {
    const startTime = performance.now();
    setMetrics(prev => ({ ...prev, loadStartTime: startTime }));
    
    // Mark the start of Monaco loading for performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark('monaco-load-start');
    }
  }, []);

  const endLoadMeasurement = useCallback(() => {
    const endTime = performance.now();
    setMetrics(prev => {
      const duration = prev.loadStartTime ? endTime - prev.loadStartTime : undefined;
      
      // Mark the end of Monaco loading
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark('monaco-load-end');
        
        try {
          performance.measure('monaco-load-duration', 'monaco-load-start', 'monaco-load-end');
        } catch (error) {
          console.warn('Failed to measure Monaco loading performance:', error);
        }
      }
      
      return {
        ...prev,
        loadEndTime: endTime,
        loadDuration: duration,
      };
    });
  }, []);

  const getBundleSize = useCallback(async () => {
    try {
      // Estimate Monaco Editor bundle size by checking loaded scripts
      const scripts = Array.from(document.scripts);
      const monacoScripts = scripts.filter(script => 
        script.src.includes('monaco') || script.src.includes('editor')
      );
      
      // This is an approximation - in a real implementation,
      // you might want to use webpack-bundle-analyzer or similar tools
      const estimatedSize = monacoScripts.length * 200; // Rough estimate in KB
      
      setMetrics(prev => ({ ...prev, bundleSize: estimatedSize }));
    } catch (error) {
      console.warn('Failed to estimate Monaco bundle size:', error);
    }
  }, []);

  return {
    metrics,
    startLoadMeasurement,
    endLoadMeasurement,
    getBundleSize,
  };
}