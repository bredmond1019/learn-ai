'use client';

import { useEffect, useState } from 'react';

interface CacheStats {
  name: string;
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

interface CacheMonitoringData {
  stats: CacheStats[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface CacheMonitoringHook extends CacheMonitoringData {
  refresh: () => Promise<void>;
  clearCache: (cacheType?: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Hook for monitoring cache performance and managing cache operations
 */
export function useCacheMonitoring(): CacheMonitoringHook {
  const [data, setData] = useState<CacheMonitoringData>({
    stats: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchStats = async (): Promise<void> => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/cache?action=stats');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch cache stats');
      }
      
      setData(prev => ({
        ...prev,
        stats: result.data,
        loading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const clearCache = async (cacheType?: string): Promise<void> => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
          cache: cacheType,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to clear cache');
      }
      
      // Refresh stats after clearing
      await fetchStats();
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const cleanup = async (): Promise<void> => {
    try {
      const response = await fetch('/api/cache?action=cleanup');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to cleanup cache');
      }
      
      // Refresh stats after cleanup
      await fetchStats();
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Auto-refresh stats periodically in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      fetchStats();
      
      const interval = setInterval(fetchStats, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  return {
    ...data,
    refresh: fetchStats,
    clearCache,
    cleanup,
  };
}

/**
 * Hook for cache performance metrics and optimization suggestions
 */
export function useCachePerformance() {
  const { stats } = useCacheMonitoring();
  
  const performance = {
    totalHits: stats.reduce((sum, cache) => sum + cache.hits, 0),
    totalMisses: stats.reduce((sum, cache) => sum + cache.misses, 0),
    totalSize: stats.reduce((sum, cache) => sum + cache.size, 0),
    averageHitRate: stats.length > 0 
      ? stats.reduce((sum, cache) => sum + cache.hitRate, 0) / stats.length 
      : 0,
  };
  
  const suggestions = [];
  
  // Performance analysis and suggestions
  if (performance.averageHitRate < 70) {
    suggestions.push({
      type: 'warning',
      message: 'Low cache hit rate detected. Consider increasing cache TTL or reviewing cache key strategies.',
    });
  }
  
  if (performance.totalSize > 500) {
    suggestions.push({
      type: 'info',
      message: 'Large cache size detected. Consider running cleanup or reducing cache capacity.',
    });
  }
  
  const highEvictionCaches = stats.filter(cache => cache.evictions > 10);
  if (highEvictionCaches.length > 0) {
    suggestions.push({
      type: 'warning',
      message: `High eviction rate in: ${highEvictionCaches.map(c => c.name).join(', ')}. Consider increasing cache size.`,
    });
  }
  
  return {
    performance,
    suggestions,
    bestPerforming: stats.reduce((best, cache) => 
      cache.hitRate > (best?.hitRate || 0) ? cache : best, 
      null as CacheStats | null
    ),
    worstPerforming: stats.reduce((worst, cache) => 
      cache.hitRate < (worst?.hitRate || 100) ? cache : worst,
      null as CacheStats | null
    ),
  };
}

/**
 * Hook for development cache debugging
 */
export function useCacheDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Access global debug utilities if available
      const globalDebug = (globalThis as any).cacheDebug;
      if (globalDebug) {
        setDebugInfo({
          available: true,
          getStats: globalDebug.getStats,
          clearAll: globalDebug.clearAll,
          cleanup: globalDebug.cleanup,
          caches: Object.keys(globalDebug.caches),
        });
      }
    }
  }, []);
  
  const logCacheStats = () => {
    if (debugInfo?.getStats) {
      console.table(debugInfo.getStats());
    }
  };
  
  const inspectCache = (cacheType: string) => {
    if (debugInfo?.caches && debugInfo.caches[cacheType]) {
      const cache = debugInfo.caches[cacheType];
      console.group(`📊 ${cacheType} Cache Details`);
      console.log('Keys:', cache.getKeys());
      console.log('Stats:', cache.getStats());
      console.groupEnd();
    }
  };
  
  return {
    available: !!debugInfo,
    logCacheStats,
    inspectCache,
    clearAll: debugInfo?.clearAll || (() => {}),
    cleanup: debugInfo?.cleanup || (() => {}),
    cacheTypes: debugInfo?.caches || [],
  };
}