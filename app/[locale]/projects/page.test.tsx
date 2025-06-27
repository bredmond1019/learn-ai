import { render, screen } from '@testing-library/react';
import ProjectsPage from './page';
import { getAllProjects } from '@/lib/projects';

// Mock the dependencies
jest.mock('@/lib/projects', () => ({
  getAllProjects: jest.fn(),
}));

jest.mock('@/components/ProjectsPageClient', () => ({
  ProjectsPageClient: ({ initialProjects, locale }: { initialProjects: any[]; locale: string }) => (
    <div data-testid="projects-page-client">
      <div data-testid="projects-locale">{locale}</div>
      <div data-testid="projects-count">{initialProjects.length}</div>
      {initialProjects.map((project) => (
        <div key={project.slug} data-testid="project-item" data-slug={project.slug}>
          {project.title}
        </div>
      ))}
    </div>
  ),
}));

const mockGetAllProjects = getAllProjects as jest.MockedFunction<typeof getAllProjects>;

// Mock projects data
const mockProjects = [
  {
    slug: 'ai-chatbot',
    title: 'AI Chatbot Platform',
    description: 'Advanced conversational AI system',
    tags: ['AI', 'Machine Learning', 'React'],
    featured: true,
    image: '/images/ai-chatbot.png',
    technologies: ['Python', 'React', 'OpenAI'],
    status: 'completed'
  },
  {
    slug: 'mlops-pipeline',
    title: 'MLOps Pipeline',
    description: 'Automated ML deployment pipeline',
    tags: ['MLOps', 'DevOps', 'Python'],
    featured: false,
    image: '/images/mlops.png',
    technologies: ['Docker', 'Kubernetes', 'Python'],
    status: 'in-progress'
  },
  {
    slug: 'data-visualization',
    title: 'Data Visualization Dashboard',
    description: 'Interactive analytics dashboard',
    tags: ['Data Science', 'Visualization', 'React'],
    featured: true,
    image: '/images/dashboard.png',
    technologies: ['React', 'D3.js', 'Python'],
    status: 'completed'
  },
];

describe('ProjectsPage', () => {
  beforeEach(() => {
    mockGetAllProjects.mockResolvedValue(mockProjects);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load projects for current locale', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await ProjectsPage({ params }));
    
    // Check that getAllProjects was called with the correct locale
    expect(mockGetAllProjects).toHaveBeenCalledWith('en');
    
    // Check that ProjectsPageClient receives the correct locale
    expect(screen.getByTestId('projects-locale')).toHaveTextContent('en');
  });

  it('should pass projects data to client component', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await ProjectsPage({ params }));
    
    // Check that all projects are passed to the client component
    expect(screen.getByTestId('projects-count')).toHaveTextContent('3');
    
    // Check that project items are rendered
    const projectItems = screen.getAllByTestId('project-item');
    expect(projectItems).toHaveLength(3);
    expect(screen.getByText('AI Chatbot Platform')).toBeInTheDocument();
    expect(screen.getByText('MLOps Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Data Visualization Dashboard')).toBeInTheDocument();
  });

  it('should handle Portuguese locale', async () => {
    const params = Promise.resolve({ locale: 'pt-BR' });
    render(await ProjectsPage({ params }));
    
    // Check that getAllProjects was called with Portuguese locale
    expect(mockGetAllProjects).toHaveBeenCalledWith('pt-BR');
    expect(screen.getByTestId('projects-locale')).toHaveTextContent('pt-BR');
  });

  it('should handle empty projects array', async () => {
    mockGetAllProjects.mockResolvedValue([]);
    
    const params = Promise.resolve({ locale: 'en' });
    render(await ProjectsPage({ params }));
    
    expect(screen.getByTestId('projects-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('project-item')).not.toBeInTheDocument();
  });

  it('should render ProjectsPageClient component', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await ProjectsPage({ params }));
    
    expect(screen.getByTestId('projects-page-client')).toBeInTheDocument();
  });
});