/**
 * Caching Layer Manager
 * 
 * Centralized caching system for content, API responses, and module data
 * Provides performance optimization through intelligent caching strategies
 */

import { cache } from 'react';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  strategy: 'lru' | 'fifo' | 'static'; // Cache eviction strategy
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// Cache statistics for monitoring
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  constructor(
    private config: CacheConfig,
    private name: string = 'DefaultCache'
  ) {}

  /**
   * Get cached data or return null if not found/expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data;
  }

  /**
   * Set cached data with optional custom TTL
   */
  set(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const ttl = customTtl ?? this.config.ttl;

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictEntries(1);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, customTtl);
    return data;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.evictions += this.cache.size;
  }

  /**
   * Evict entries based on strategy
   */
  private evictEntries(count: number): void {
    const entries = Array.from(this.cache.entries());
    
    let toEvict: string[] = [];

    switch (this.config.strategy) {
      case 'lru':
        // Evict least recently used
        toEvict = entries
          .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
          .slice(0, count)
          .map(([key]) => key);
        break;
      
      case 'fifo':
        // Evict first in, first out
        toEvict = entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, count)
          .map(([key]) => key);
        break;
      
      case 'static':
        // Don't evict - let cache grow (useful for static content)
        return;
    }

    for (const key of toEvict) {
      this.cache.delete(key);
      this.stats.evictions++;
    }

    this.stats.size = this.cache.size;
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { name: string } {
    return {
      ...this.stats,
      name: this.name,
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.stats.size = this.cache.size;
    this.stats.evictions += cleaned;
    
    return cleaned;
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }
}

// Cache configurations for different content types
const CACHE_CONFIGS = {
  // Blog posts - medium TTL, high capacity
  blog: {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 100,
    strategy: 'lru' as const,
  },
  
  // Projects - long TTL, medium capacity
  projects: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 50,
    strategy: 'lru' as const,
  },
  
  // Learning modules - short TTL, high capacity (frequently accessed)
  modules: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 200,
    strategy: 'lru' as const,
  },
  
  // API responses - very short TTL, medium capacity
  api: {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 100,
    strategy: 'fifo' as const,
  },
  
  // Static content - very long TTL, unlimited size
  static: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 1000,
    strategy: 'static' as const,
  },
  
  // MDX parsed content - medium TTL, high capacity
  mdx: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 150,
    strategy: 'lru' as const,
  },
} as const;

// Create specialized cache managers
export const blogCache = new CacheManager<any>(CACHE_CONFIGS.blog, 'BlogCache');
export const projectsCache = new CacheManager<any>(CACHE_CONFIGS.projects, 'ProjectsCache');
export const modulesCache = new CacheManager<any>(CACHE_CONFIGS.modules, 'ModulesCache');
export const apiCache = new CacheManager<any>(CACHE_CONFIGS.api, 'ApiCache');
export const staticCache = new CacheManager<any>(CACHE_CONFIGS.static, 'StaticCache');
export const mdxCache = new CacheManager<any>(CACHE_CONFIGS.mdx, 'MDXCache');

// Cache manager registry for monitoring
const cacheManagers = [
  blogCache,
  projectsCache,
  modulesCache,
  apiCache,
  staticCache,
  mdxCache,
];

/**
 * Get aggregated cache statistics
 */
export function getCacheStats() {
  return cacheManagers.map(cache => cache.getStats());
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  cacheManagers.forEach(cache => cache.clear());
}

/**
 * Cleanup expired entries in all caches
 */
export function cleanupAllCaches(): { [key: string]: number } {
  const results: { [key: string]: number } = {};
  
  cacheManagers.forEach(cache => {
    const stats = cache.getStats();
    results[stats.name] = cache.cleanup();
  });
  
  return results;
}

/**
 * Performance monitoring hook for cache usage
 */
export function useCacheMonitoring() {
  // Only enable in development
  if (process.env.NODE_ENV === 'development') {
    // Setup periodic cleanup (every 5 minutes)
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        const cleaned = cleanupAllCaches();
        const totalCleaned = Object.values(cleaned).reduce((sum, count) => sum + count, 0);
        
        if (totalCleaned > 0) {
          console.log('🧹 Cache cleanup:', cleaned);
        }
      }, 5 * 60 * 1000);
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  blog: {
    post: (slug: string) => `blog:post:${slug}`,
    allPosts: () => `blog:all`,
    postsMeta: () => `blog:meta`,
    recentPosts: (limit: number) => `blog:recent:${limit}`,
    postsByTag: (tag: string) => `blog:tag:${tag}`,
    allTags: () => `blog:tags`,
  },
  
  projects: {
    project: (slug: string) => `projects:project:${slug}`,
    allProjects: () => `projects:all`,
    featuredProjects: () => `projects:featured`,
    navigation: (slug: string) => `projects:nav:${slug}`,
    related: (slug: string, limit: number) => `projects:related:${slug}:${limit}`,
  },
  
  modules: {
    module: (pathSlug: string, moduleId: string) => `modules:module:${pathSlug}:${moduleId}`,
    pathModules: (pathSlug: string) => `modules:path:${pathSlug}`,
    learningPath: (pathSlug: string) => `modules:learning-path:${pathSlug}`,
    allPaths: () => 'modules:all-paths',
    neighbors: (pathSlug: string, moduleId: string) => `modules:neighbors:${pathSlug}:${moduleId}`,
  },
  
  api: {
    response: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
    modules: (pathSlug?: string) => `api:modules${pathSlug ? `:${pathSlug}` : ''}`,
    progress: (userId: string) => `api:progress:${userId}`,
  },
  
  mdx: {
    parsed: (source: string) => `mdx:parsed:${Buffer.from(source).toString('base64').slice(0, 32)}`,
    frontmatter: (source: string) => `mdx:frontmatter:${Buffer.from(source).toString('base64').slice(0, 32)}`,
  },
} as const;

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Expose cache debugging utilities
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cacheDebug = {
      getStats: getCacheStats,
      clearAll: clearAllCaches,
      cleanup: cleanupAllCaches,
      caches: {
        blog: blogCache,
        projects: projectsCache,
        modules: modulesCache,
        api: apiCache,
        static: staticCache,
        mdx: mdxCache,
      },
    };
  }
}

// React cache wrapper for server components
export const createCachedLoader = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheManager: CacheManager<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
) => {
  return cache(async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    return await cacheManager.getOrSet(
      key,
      () => fn(...args),
      ttl
    );
  });
};