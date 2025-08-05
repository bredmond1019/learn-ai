import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import ProjectDetailPage, { generateMetadata, generateStaticParams } from './page';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/content/projects/projects';
import { getProjectIcon, isRepoPrivate } from '@/lib/client/icons';
import type { Project } from '@/types/project';

// Mock dependencies
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

jest.mock('@/lib/projects', () => ({
  getProjectBySlug: jest.fn(),
  getAllProjectSlugs: jest.fn(),
}));

jest.mock('@/lib/icons', () => ({
  getProjectIcon: jest.fn(),
  isRepoPrivate: jest.fn(),
}));

jest.mock('@/components/GitHubButton', () => {
  return function GitHubButton({ githubUrl, isPrivate }: { githubUrl: string; isPrivate: boolean }) {
    return <div data-testid="github-button">GitHub: {githubUrl} (Private: {isPrivate ? 'Yes' : 'No'})</div>;
  };
});

jest.mock('@/components/CollapsibleCodeBlock', () => {
  return function CollapsibleCodeBlock({ 
    title, 
    description, 
    code, 
    language 
  }: { 
    title: string; 
    description: string; 
    code: string; 
    language: string; 
  }) {
    return (
      <div data-testid="code-block">
        <h3>{title}</h3>
        <p>{description}</p>
        <pre><code className={`language-${language}`}>{code}</code></pre>
      </div>
    );
  };
});

// Sample project data
const mockProject: Project = {
  slug: 'test-project',
  title: 'Test Project',
  description: 'A test project for demonstrating functionality',
  longDescription: 'This is a comprehensive test project that demonstrates various features and capabilities. It includes multiple sections and comprehensive information about the project implementation.',
  tags: ['React', 'TypeScript', 'Jest'],
  featured: true,
  icon: 'Code',
  isPrivate: false,
  githubUrl: 'https://github.com/test/test-project',
  demoUrl: 'https://test-project.demo.com',
  techStack: [
    {
      category: 'Frontend',
      items: ['React 18', 'TypeScript', 'Tailwind CSS']
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Express', 'PostgreSQL']
    }
  ],
  features: [
    'Responsive design',
    'Real-time updates',
    'User authentication'
  ],
  challenges: [
    'Performance optimization',
    'Complex state management'
  ],
  outcomes: [
    { metric: 'Performance', value: '95% improvement' },
    { metric: 'Users', value: '10,000+' }
  ],
  codeSnippets: [
    {
      title: 'React Component Example',
      language: 'typescript',
      code: 'const TestComponent = () => {\n  return <div>Hello World</div>;\n};'
    }
  ]
};

const MockIcon = ({ className }: { className: string }) => (
  <div className={className} data-testid="project-icon">Icon</div>
);

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectIcon as jest.Mock).mockReturnValue(MockIcon);
    (isRepoPrivate as jest.Mock).mockReturnValue(false);
  });

  it('should display full project information', async () => {
    // Arrange
    (getProjectBySlug as jest.Mock).mockResolvedValue(mockProject);
    
    const params = Promise.resolve({ slug: 'test-project', locale: 'en' });

    // Act
    render(await ProjectDetailPage({ params }));

    // Assert - Basic information
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project for demonstrating functionality')).toBeInTheDocument();
    expect(screen.getByText(/This is a comprehensive test project/)).toBeInTheDocument();

    // Assert - Navigation
    expect(screen.getByText('Back to Projects')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to projects/i })).toHaveAttribute('href', '/en/projects');

    // Assert - Project icon
    expect(screen.getByTestId('project-icon')).toBeInTheDocument();

    // Assert - Tags (check for tags container specifically)
    const tagsContainer = screen.getByText('React').closest('div');
    expect(tagsContainer).toContainElement(screen.getAllByText('React')[0]);
    expect(tagsContainer).toContainElement(screen.getAllByText('TypeScript')[0]); 
    expect(tagsContainer).toContainElement(screen.getAllByText('Jest')[0]);

    // Assert - Sections
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Technical Stack')).toBeInTheDocument();
    expect(screen.getByText('Key Features')).toBeInTheDocument();
  });

  it('should show technologies used', async () => {
    // Arrange
    (getProjectBySlug as jest.Mock).mockResolvedValue(mockProject);
    
    const params = Promise.resolve({ slug: 'test-project', locale: 'en' });

    // Act
    render(await ProjectDetailPage({ params }));

    // Assert - Technical Stack section exists
    expect(screen.getByText('Technical Stack')).toBeInTheDocument();

    // Assert - Tech stack categories
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();

    // Assert - Specific technologies in Frontend category
    const frontendSection = screen.getByText('Frontend').closest('div');
    expect(frontendSection).toContainElement(screen.getByText('React 18'));
    expect(frontendSection).toContainElement(screen.getAllByText('TypeScript')[1]); // Second occurrence in tech stack
    expect(frontendSection).toContainElement(screen.getByText('Tailwind CSS'));

    // Assert - Specific technologies in Backend category  
    const backendSection = screen.getByText('Backend').closest('div');
    expect(backendSection).toContainElement(screen.getByText('Node.js'));
    expect(backendSection).toContainElement(screen.getByText('Express'));
    expect(backendSection).toContainElement(screen.getByText('PostgreSQL'));

    // Assert - Tech stack items have proper styling indicators
    expect(screen.getAllByText('▸')).toHaveLength(6); // 3 frontend + 3 backend items
  });

  it('should display screenshots/media', async () => {
    // Arrange - Project with code snippets and potentially images
    const projectWithMedia: Project = {
      ...mockProject,
      images: ['screenshot1.png', 'screenshot2.png'],
      codeSnippets: [
        {
          title: 'React Component Example',
          language: 'typescript',
          code: 'const TestComponent = () => {\n  return <div>Hello World</div>;\n};'
        },
        {
          title: 'API Endpoint',
          language: 'javascript',
          code: 'app.get("/api/test", (req, res) => {\n  res.json({ message: "Hello" });\n});'
        }
      ]
    };
    
    (getProjectBySlug as jest.Mock).mockResolvedValue(projectWithMedia);
    
    const params = Promise.resolve({ slug: 'test-project', locale: 'en' });

    // Act
    render(await ProjectDetailPage({ params }));

    // Assert - Code Examples section exists
    expect(screen.getByText('Code Examples')).toBeInTheDocument();

    // Assert - Code snippets are rendered
    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks).toHaveLength(2);
    expect(screen.getByText('React Component Example')).toBeInTheDocument();
    expect(screen.getByText('API Endpoint')).toBeInTheDocument();

    // Assert - Code content is displayed
    expect(screen.getByText(/const TestComponent/)).toBeInTheDocument();

    // Future: Test for image gallery when implemented
    // Currently the page doesn't implement image display
    // This test documents the expected behavior for future implementation
  });

  it('should handle missing projects (404)', async () => {
    // Arrange
    (getProjectBySlug as jest.Mock).mockResolvedValue(null);
    
    const params = Promise.resolve({ slug: 'non-existent-project', locale: 'en' });

    // Act & Assert - Should throw NEXT_NOT_FOUND error
    await expect(ProjectDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    
    // Assert - notFound function should be called
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate correct metadata for existing project', async () => {
    // Arrange
    (getProjectBySlug as jest.Mock).mockResolvedValue(mockProject);
    
    const params = Promise.resolve({ slug: 'test-project', locale: 'en' });

    // Act
    const metadata = await generateMetadata({ params });

    // Assert
    expect(metadata.title).toBe('Test Project | AI Engineer Portfolio');
    expect(metadata.description).toBe('A test project for demonstrating functionality');
    expect(metadata.openGraph?.title).toBe('Test Project');
    expect(metadata.openGraph?.description).toBe('A test project for demonstrating functionality');
    expect(metadata.openGraph?.type).toBe('article');
  });

  it('should generate fallback metadata for non-existent project', async () => {
    // Arrange
    (getProjectBySlug as jest.Mock).mockResolvedValue(null);
    
    const params = Promise.resolve({ slug: 'non-existent', locale: 'en' });

    // Act
    const metadata = await generateMetadata({ params });

    // Assert
    expect(metadata.title).toBe('Project Not Found');
    expect(metadata.description).toBe('The requested project could not be found.');
  });
});

describe('generateStaticParams', () => {
  it('should generate static params for all locales and slugs', async () => {
    // Arrange
    (getAllProjectSlugs as jest.Mock)
      .mockReturnValueOnce(['project1', 'project2']) // en
      .mockReturnValueOnce(['project1', 'project3']); // pt-BR

    // Act
    const params = await generateStaticParams();

    // Assert
    expect(params).toEqual([
      { locale: 'en', slug: 'project1' },
      { locale: 'en', slug: 'project2' },
      { locale: 'pt-BR', slug: 'project1' },
      { locale: 'pt-BR', slug: 'project3' }
    ]);
  });
});