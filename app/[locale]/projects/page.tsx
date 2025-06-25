import { getAllProjects } from '@/lib/projects';
import { ProjectsPageClient } from '@/components/ProjectsPageClient';

interface Props {
  params: Promise<{ locale: string }>;
}

// Server component that fetches projects and passes to client component
export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const projects = await getAllProjects(locale);
  
  return <ProjectsPageClient initialProjects={projects} locale={locale} />;
}