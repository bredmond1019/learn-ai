import { getAllProjects } from '@/lib/content/projects/projects';
import { ProjectsPageClient } from '@/components/ProjectsPageClient';

// Server component that fetches projects and passes to client component
export default async function ProjectsPage() {
  const projects = await getAllProjects();
  
  return <ProjectsPageClient initialProjects={projects} locale="en" />;
}