import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { Module, LearningPath } from '@/types/module';
import { modulesCache, cacheKeys } from './cache-manager';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'learn', 'paths');

// Get content directory based on locale
function getContentDir(locale?: string): string {
  if (locale && locale !== 'en') {
    return path.join(CONTENT_DIR, locale);
  }
  return CONTENT_DIR;
}

// Cache module loading for performance
export const getModule = cache(async (pathSlug: string, moduleId: string, locale?: string): Promise<Module | null> => {
  const cacheKey = locale ? `${cacheKeys.modules.module(pathSlug, moduleId)}-${locale}` : cacheKeys.modules.module(pathSlug, moduleId);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      // Check for locale-specific JSON first, fallback to English
      let jsonModulesDir = locale && locale !== 'en' 
        ? path.join(getContentDir(locale), pathSlug, 'modules')
        : path.join(CONTENT_DIR, pathSlug, 'modules');
      
      // Check if locale directory exists
      const localeDirExists = locale && locale !== 'en' && await fs.access(jsonModulesDir).then(() => true).catch(() => false);
      
      // If locale directory doesn't exist, use English
      if (!localeDirExists && locale && locale !== 'en') {
        jsonModulesDir = path.join(CONTENT_DIR, pathSlug, 'modules');
      }
      
      const mdxModulesDir = locale && locale !== 'en' 
        ? path.join(getContentDir(locale), pathSlug, 'modules')
        : jsonModulesDir;
      
      const files = await fs.readdir(jsonModulesDir);
      
      // Look for a file that contains the moduleId (handles numeric prefixes)
      const moduleFile = files.find(file => {
        // Match files like "01-introduction-to-mcp.json"
        const filePattern = new RegExp(`\\d+-${moduleId}\\.json$`);
        return filePattern.test(file);
      });
      
      if (!moduleFile) {
        throw new Error(`Module file not found for ${moduleId}`);
      }
      
      const modulePath = path.join(jsonModulesDir, moduleFile);
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
              
              // For locales, look for MDX in locale-specific directory
              let mdxPath = path.join(mdxModulesDir, mdxFile);
              
              // Check if the MDX modules directory exists and has the file
              const mdxDirExists = await fs.access(mdxModulesDir).then(() => true).catch(() => false);
              const mdxFileExists = mdxDirExists && await fs.access(mdxPath).then(() => true).catch(() => false);
              
              // Fallback to English if locale file doesn't exist
              if (!mdxFileExists) {
                mdxPath = path.join(jsonModulesDir, mdxFile);
              }
              
              const mdxContent = await fs.readFile(mdxPath, 'utf-8');
              
              // Extract section content if anchor is specified
              let sectionContent = mdxContent;
              const anchor = section.content.source.split('#')[1];
              if (anchor) {
                // Extract the specific section based on anchor
                // This regex captures the section header and all content until the next ## header or end of file
                const sectionRegex = new RegExp(`(## .*\\{#${anchor}\\}[\\s\\S]*?)(?=\\n## |$)`, 'i');
                const match = mdxContent.match(sectionRegex);
                if (match) {
                  sectionContent = match[1];
                } else {
                  // If no match found, don't fall back to full content, instead provide empty content
                  sectionContent = `## ${section.title}\n\nContent for section ${anchor} not found.`;
                }
              }
              
              // Clean up the content for consistent rendering
              let cleanedContent = sectionContent;
              
              // Remove frontmatter if present
              cleanedContent = cleanedContent.replace(/^---\n([\s\S]*?)\n---\n/, '');
              
              // Remove import statements (but preserve component usage)
              cleanedContent = cleanedContent.replace(/^import\s+.*$/gm, '');
              
              // Remove anchor tags from headers
              cleanedContent = cleanedContent.replace(/\s*\{#[^}]+\}/g, '');
              
              // Update the source with the cleaned content
              section.content = {
                ...section.content,
                source: cleanedContent
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
export const getModulesForPath = cache(async (pathSlug: string, locale?: string): Promise<Module[]> => {
  const cacheKey = locale ? `${cacheKeys.modules.pathModules(pathSlug)}-${locale}` : cacheKeys.modules.pathModules(pathSlug);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      // Always read module JSON files from English directory
      const pathDir = path.join(CONTENT_DIR, pathSlug, 'modules');
      const files = await fs.readdir(pathDir);
      
      const moduleFiles = files.filter(file => file.endsWith('.json'));
      const modules = await Promise.all(
        moduleFiles.map(async (file) => {
          // Extract moduleId from filename like "01-introduction-to-mcp.json"
          const parts = file.replace('.json', '').split('-');
          const moduleId = parts.slice(1).join('-'); // Remove number prefix
          return getModule(pathSlug, moduleId, locale);
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
export const getLearningPath = cache(async (pathSlug: string, locale?: string): Promise<LearningPath | null> => {
  const cacheKey = locale ? `${cacheKeys.modules.learningPath(pathSlug)}-${locale}` : cacheKeys.modules.learningPath(pathSlug);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      const contentDir = getContentDir(locale);
      let metadataPath = path.join(contentDir, pathSlug, 'metadata.json');
      
      // Fallback to English if locale metadata doesn't exist
      if (locale && locale !== 'en' && !await fs.access(metadataPath).then(() => true).catch(() => false)) {
        metadataPath = path.join(CONTENT_DIR, pathSlug, 'metadata.json');
      }
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content) as LearningPath;
    } catch (error) {
      console.error(`Failed to load learning path ${pathSlug}:`, error);
      return null;
    }
  });
});

// Get all available learning paths
export const getAllLearningPaths = cache(async (locale?: string): Promise<LearningPath[]> => {
  const cacheKey = locale ? `${cacheKeys.modules.allPaths()}-${locale}` : cacheKeys.modules.allPaths();
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    try {
      const contentDir = getContentDir(locale);
      let dirs: string[] = [];
      
      // Try locale directory first
      if (await fs.access(contentDir).then(() => true).catch(() => false)) {
        dirs = await fs.readdir(contentDir);
      }
      
      // If no locale directory or empty, fallback to English
      if (dirs.length === 0 && locale !== 'en') {
        dirs = await fs.readdir(CONTENT_DIR);
      }
      const paths = await Promise.all(
        dirs.map(async (dir) => {
          const dirPath = locale && dirs.length > 0 ? path.join(getContentDir(locale), dir) : path.join(CONTENT_DIR, dir);
          const stats = await fs.stat(dirPath);
          if (stats.isDirectory()) {
            return getLearningPath(dir, locale);
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
export const validateModuleId = async (pathSlug: string, moduleId: string, locale?: string): Promise<boolean> => {
  try {
    const module = await getModule(pathSlug, moduleId, locale);
    return module !== null;
  } catch {
    return false;
  }
};

// Get module neighbors (previous and next)
export const getModuleNeighbors = cache(async (pathSlug: string, moduleId: string, locale?: string): Promise<{ previous: Module | null; next: Module | null }> => {
  const cacheKey = locale ? `${cacheKeys.modules.neighbors(pathSlug, moduleId)}-${locale}` : cacheKeys.modules.neighbors(pathSlug, moduleId);
  
  return await modulesCache.getOrSet(cacheKey, async () => {
    const modules = await getModulesForPath(pathSlug, locale);
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