import { Project } from '@/types/project';
import fs from 'fs';
import path from 'path';
import { projectsCache, cacheKeys } from './cache-manager';


const CONTENT_BASE = path.join(process.cwd(), 'content');

// Get projects directory
function getProjectsDirectory(): string {
  return path.join(CONTENT_BASE, 'projects', 'published');
}

// Ensure projects directory exists
function ensureProjectsDirectory() {
  const dir = getProjectsDirectory();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const cacheKey = cacheKeys.projects.allProjects();
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  ensureProjectsDirectory();
  const dir = getProjectsDirectory();
  
  try {
    const fileNames = fs.readdirSync(dir);
    const projects = fileNames
      .filter(fileName => fileName.endsWith('.json'))
      .map(fileName => {
        const filePath = path.join(dir, fileName);
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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const cacheKey = cacheKeys.projects.project(slug);
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  try {
    const dir = getProjectsDirectory();
    const filePath = path.join(dir, `${slug}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
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

export async function getFeaturedProjects(): Promise<Project[]> {
  const cacheKey = cacheKeys.projects.featuredProjects();
  const cached = projectsCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const allProjects = await getAllProjects();
  const featured = allProjects.filter(project => project.featured);
  
  projectsCache.set(cacheKey, featured);
  return featured;
}

export async function getProjectNavigation(
  currentSlug: string
): Promise<{
  previous: Project | null;
  next: Project | null;
}> {
  const allProjects = await getAllProjects();
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
  limit: number = 3
): Promise<Project[]> {
  const allProjects = await getAllProjects();
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
export function getAllProjectSlugs(): string[] {
  ensureProjectsDirectory();
  const dir = getProjectsDirectory();
  
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace(/\.json$/, ''));
  } catch (error) {
    console.error('Error reading project slugs:', error);
    return [];
  }
}