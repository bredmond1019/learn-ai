import { NextRequest, NextResponse } from 'next/server';
import { 
  getCacheStats, 
  clearAllCaches, 
  cleanupAllCaches,
  blogCache,
  projectsCache,
  modulesCache,
  apiCache,
  staticCache,
  mdxCache
} from '@/lib/cache-manager';

// GET /api/cache - Get cache statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });

      case 'cleanup':
        const cleanupResults = cleanupAllCaches();
        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed',
          data: cleanupResults,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Cache API endpoints',
          endpoints: {
            stats: '/api/cache?action=stats',
            cleanup: '/api/cache?action=cleanup',
            clear: 'POST /api/cache (with action=clear)',
          },
        });
    }
  } catch (error) {
    console.error('Error in cache API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cache operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/cache - Cache management operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cache: cacheType, key } = body;

    switch (action) {
      case 'clear':
        if (cacheType) {
          // Clear specific cache
          const cacheMap = {
            blog: blogCache,
            projects: projectsCache,
            modules: modulesCache,
            api: apiCache,
            static: staticCache,
            mdx: mdxCache,
          };

          const cache = cacheMap[cacheType as keyof typeof cacheMap];
          if (!cache) {
            return NextResponse.json(
              { success: false, error: `Unknown cache type: ${cacheType}` },
              { status: 400 }
            );
          }

          if (key) {
            // Clear specific key
            const deleted = cache.delete(key);
            return NextResponse.json({
              success: true,
              message: `Cache key ${deleted ? 'deleted' : 'not found'}`,
              cache: cacheType,
              key,
            });
          } else {
            // Clear entire cache
            cache.clear();
            return NextResponse.json({
              success: true,
              message: `${cacheType} cache cleared`,
              cache: cacheType,
            });
          }
        } else {
          // Clear all caches
          clearAllCaches();
          return NextResponse.json({
            success: true,
            message: 'All caches cleared',
          });
        }

      case 'invalidate':
        // Invalidate specific patterns or keys
        if (!cacheType || !key) {
          return NextResponse.json(
            { success: false, error: 'Cache type and key required for invalidation' },
            { status: 400 }
          );
        }

        const cacheMap = {
          blog: blogCache,
          projects: projectsCache,
          modules: modulesCache,
          api: apiCache,
          static: staticCache,
          mdx: mdxCache,
        };

        const cache = cacheMap[cacheType as keyof typeof cacheMap];
        if (!cache) {
          return NextResponse.json(
            { success: false, error: `Unknown cache type: ${cacheType}` },
            { status: 400 }
          );
        }

        // For pattern-based invalidation, we'd need to implement pattern matching
        // For now, just delete the specific key
        const deleted = cache.delete(key);
        
        return NextResponse.json({
          success: true,
          message: `Cache key ${deleted ? 'invalidated' : 'not found'}`,
          cache: cacheType,
          key,
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in cache POST operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cache operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cache - Clear all caches (alternative endpoint)
export async function DELETE() {
  try {
    clearAllCaches();
    return NextResponse.json({
      success: true,
      message: 'All caches cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear caches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}