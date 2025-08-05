import { Project } from '@/types/project';
import fs from 'fs';
import path from 'path';
import { projectsCache, cacheKeys } from '@/lib/core/caching/cache-manager';


const CONTENT_BASE = path.join(process.cwd(), 'content');

// Get projects directory
function getProjectsDirectory(locale?: string): string {
  const basePath = path.join(CONTENT_BASE, 'projects', 'published');
  if (locale && locale !== 'en') {
    return path.join(basePath, locale);
  }
  return basePath;
}

// Ensure projects directory exists
function ensureProjectsDirectory(locale?: string) {
  const dir = getProjectsDirectory(locale);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function getAllProjects(locale?: string): Promise<Project[]> {
  const cacheKey = locale ? `${cacheKeys.projects.allProjects()}-${locale}` : cacheKeys.projects.allProjects();
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  ensureProjectsDirectory(locale);
  const dir = getProjectsDirectory(locale);
  
  try {
    let fileNames: string[] = [];
    
    // Try locale-specific directory first
    if (fs.existsSync(dir)) {
      fileNames = fs.readdirSync(dir);
    }
    
    // If no files in locale directory or it's English, use base directory
    if (fileNames.length === 0 && locale !== 'en') {
      const fallbackDir = getProjectsDirectory();
      if (fs.existsSync(fallbackDir)) {
        fileNames = fs.readdirSync(fallbackDir);
      }
    }
    
    const projects = fileNames
      .filter(fileName => fileName.endsWith('.json'))
      .map(fileName => {
        let filePath = path.join(dir, fileName);
        
        // If file doesn't exist in locale directory, try fallback
        if (!fs.existsSync(filePath) && locale !== 'en') {
          const fallbackPath = path.join(getProjectsDirectory(), fileName);
          if (fs.existsSync(fallbackPath)) {
            filePath = fallbackPath;
          }
        }
        
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const project = JSON.parse(fileContents) as Project;
        return project;
      });
    
    // Sort by featured first, then alphabetically
    const sortedProjects = projects.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
    
    projectsCache.set(cacheKey, sortedProjects);
    return sortedProjects;
  } catch (error) {
    console.error('Error reading projects directory:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string, locale?: string): Promise<Project | null> {
  const cacheKey = locale ? `${cacheKeys.projects.project(slug)}-${locale}` : cacheKeys.projects.project(slug);
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  try {
    const dir = getProjectsDirectory(locale);
    let filePath = path.join(dir, `${slug}.json`);
    
    // Check locale-specific file first
    if (!fs.existsSync(filePath) && locale && locale !== 'en') {
      // Try fallback to English
      const fallbackPath = path.join(getProjectsDirectory(), `${slug}.json`);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return null;
      }
    } else if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const project = JSON.parse(fileContents) as Project;
    
    projectsCache.set(cacheKey, project);
    return project;
  } catch (error) {
    console.error(`Error reading project ${slug}:`, error);
    return null;
  }
}

export async function getFeaturedProjects(locale?: string): Promise<Project[]> {
  const cacheKey = locale ? `${cacheKeys.projects.featuredProjects()}-${locale}` : cacheKeys.projects.featuredProjects();
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const allProjects = await getAllProjects(locale);
  const featured = allProjects.filter(project => project.featured);
  
  projectsCache.set(cacheKey, featured);
  return featured;
}

export async function getProjectNavigation(
  currentSlug: string,
  locale?: string
): Promise<{
  previous: Project | null;
  next: Project | null;
}> {
  const allProjects = await getAllProjects(locale);
  const currentIndex = allProjects.findIndex(project => project.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }
  
  return {
    previous: currentIndex > 0 ? allProjects[currentIndex - 1] : null,
    next: currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null,
  };
}

export async function getRelatedProjects(
  currentSlug: string,
  limit: number = 3,
  locale?: string
): Promise<Project[]> {
  const allProjects = await getAllProjects(locale);
  const currentProject = allProjects.find(project => project.slug === currentSlug);
  
  if (!currentProject) {
    return [];
  }
  
  // Find projects with similar tags
  const relatedProjects = allProjects
    .filter(project => project.slug !== currentSlug)
    .map(project => {
      const commonTags = project.tags.filter(tag => 
        currentProject.tags.includes(tag)
      ).length;
      return { project, commonTags };
    })
    .filter(({ commonTags }) => commonTags > 0)
    .sort((a, b) => b.commonTags - a.commonTags)
    .slice(0, limit)
    .map(({ project }) => project);
  
  // If we don't have enough related projects, fill with other projects
  if (relatedProjects.length < limit) {
    const additionalProjects = allProjects
      .filter(project => 
        project.slug !== currentSlug && 
        !relatedProjects.find(related => related.slug === project.slug)
      )
      .slice(0, limit - relatedProjects.length);
    
    relatedProjects.push(...additionalProjects);
  }
  
  return relatedProjects;
}

// Get all project slugs
export function getAllProjectSlugs(locale?: string): string[] {
  ensureProjectsDirectory(locale);
  const dir = getProjectsDirectory(locale);
  
  try {
    let files: string[] = [];
    
    // Get files from locale directory
    if (fs.existsSync(dir)) {
      files = fs.readdirSync(dir);
    }
    
    // If no files or it's not English, also get files from base directory
    if ((files.length === 0 || locale !== 'en') && locale) {
      const baseDir = getProjectsDirectory();
      if (fs.existsSync(baseDir)) {
        const baseFiles = fs.readdirSync(baseDir);
        // Merge unique slugs
        const baseSlugs = baseFiles
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace(/\.json$/, ''));
        const localeSlugs = files
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace(/\.json$/, ''));
        return [...new Set([...localeSlugs, ...baseSlugs])];
      }
    }
    
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace(/\.json$/, ''));
  } catch (error) {
    console.error('Error reading project slugs:', error);
    return [];
  }
}