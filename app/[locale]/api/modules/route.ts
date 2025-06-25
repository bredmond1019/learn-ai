import { NextRequest, NextResponse } from 'next/server';
import { getAllLearningPaths, getModulesForPath } from '@/lib/modules.server';
import { apiCache, cacheKeys } from '@/lib/cache-manager';

// GET /api/modules - Get all modules or modules for a specific path
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathSlug = searchParams.get('path');
    const cacheKey = cacheKeys.api.modules(pathSlug || undefined);
    
    // Try to get from cache first
    const cached = apiCache.get(cacheKey);
    if (cached !== null) {
      return NextResponse.json(cached);
    }

    let responseData;

    if (pathSlug) {
      // Get modules for specific path
      const modules = await getModulesForPath(pathSlug);
      
      responseData = {
        success: true,
        data: modules,
        count: modules.length,
      };
    } else {
      // Get all learning paths with their modules
      const paths = await getAllLearningPaths();
      const pathsWithModules = await Promise.all(
        paths.map(async (path) => ({
          ...path,
          modules: await getModulesForPath(path.id),
        }))
      );

      responseData = {
        success: true,
        data: pathsWithModules,
        count: pathsWithModules.length,
      };
    }

    // Cache the response
    apiCache.set(cacheKey, responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch modules',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}