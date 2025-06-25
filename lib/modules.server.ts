import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { Module, LearningPath } from '@/types/module';
import { modulesCache, cacheKeys } from './cache-manager';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'learn', 'paths');

// Cache module loading for performance
export const getModule = cache(async (pathSlug: string, moduleId: string): Promise<Module | null> => {
  const cacheKey = cacheKeys.modules.module(pathSlug, moduleId);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      // Try to find the module file with number prefix
      const modulesDir = path.join(CONTENT_DIR, pathSlug, 'modules');
      const files = await fs.readdir(modulesDir);
      
      // Look for a file that ends with the moduleId
      const moduleFile = files.find(file => 
        file.endsWith(`${moduleId}.json`) && file.includes('-')
      );
      
      if (!moduleFile) {
        throw new Error(`Module file not found for ${moduleId}`);
      }
      
      const modulePath = path.join(modulesDir, moduleFile);
      const moduleContent = await fs.readFile(modulePath, 'utf-8');
      const module = JSON.parse(moduleContent) as Module;
      
      // Load MDX content for sections that reference MDX files
      for (const section of module.sections) {
        if (section.content?.type === 'mdx' && section.content.source) {
          // Check if source is a file reference (contains .mdx)
          if (section.content.source.includes('.mdx')) {
            try {
              // Extract just the filename without anchors
              const mdxFile = section.content.source.split('#')[0];
              const mdxPath = path.join(modulesDir, mdxFile);
              const mdxContent = await fs.readFile(mdxPath, 'utf-8');
              
              // Update the source with the actual content
              section.content = {
                ...section.content,
                source: mdxContent
              };
            } catch (error) {
              console.error(`Failed to load MDX content for section ${section.id}:`, error);
              // Keep the original source reference if file not found
            }
          }
          // If source doesn't contain .mdx, it's probably already the content
        }
      }
      
      return module;
    } catch (error) {
      console.error(`Failed to load module ${moduleId} from path ${pathSlug}:`, error);
      return null;
    }
  });
});

// Get all modules for a learning path
export const getModulesForPath = cache(async (pathSlug: string): Promise<Module[]> => {
  const cacheKey = cacheKeys.modules.pathModules(pathSlug);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      const pathDir = path.join(CONTENT_DIR, pathSlug, 'modules');
      const files = await fs.readdir(pathDir);
      
      const moduleFiles = files.filter(file => file.endsWith('.json'));
      const modules = await Promise.all(
        moduleFiles.map(async (file) => {
          // Extract moduleId from filename like "01-introduction-to-mcp.json"
          const parts = file.replace('.json', '').split('-');
          const moduleId = parts.slice(1).join('-'); // Remove number prefix
          return getModule(pathSlug, moduleId);
        })
      );
      
      return modules
        .filter((module): module is Module => module !== null)
        .sort((a, b) => a.metadata.order - b.metadata.order);
    } catch (error) {
      console.error(`Failed to load modules for path ${pathSlug}:`, error);
      return [];
    }
  });
});

// Get learning path metadata
export const getLearningPath = cache(async (pathSlug: string): Promise<LearningPath | null> => {
  const cacheKey = cacheKeys.modules.learningPath(pathSlug);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      const metadataPath = path.join(CONTENT_DIR, pathSlug, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content) as LearningPath;
    } catch (error) {
      console.error(`Failed to load learning path ${pathSlug}:`, error);
      return null;
    }
  });
});

// Get all available learning paths
export const getAllLearningPaths = cache(async (): Promise<LearningPath[]> => {
  const cacheKey = cacheKeys.modules.allPaths();
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      const dirs = await fs.readdir(CONTENT_DIR);
      const paths = await Promise.all(
        dirs.map(async (dir) => {
          const stats = await fs.stat(path.join(CONTENT_DIR, dir));
          if (stats.isDirectory()) {
            return getLearningPath(dir);
          }
          return null;
        })
      );
      
      return paths.filter((path): path is LearningPath => path !== null);
    } catch (error) {
      console.error('Failed to load learning paths:', error);
      return [];
    }
  });
});

// Validate module ID exists for a given path
export const validateModuleId = async (pathSlug: string, moduleId: string): Promise<boolean> => {
  try {
    const module = await getModule(pathSlug, moduleId);
    return module !== null;
  } catch {
    return false;
  }
};

// Get module neighbors (previous and next)
export const getModuleNeighbors = cache(async (pathSlug: string, moduleId: string): Promise<{ previous: Module | null; next: Module | null }> => {
  const cacheKey = cacheKeys.modules.neighbors(pathSlug, moduleId);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    const modules = await getModulesForPath(pathSlug);
    const currentIndex = modules.findIndex(m => m.metadata.id === moduleId);
    
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }
    
    return {
      previous: currentIndex > 0 ? modules[currentIndex - 1] : null,
      next: currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null,
    };
  });
});