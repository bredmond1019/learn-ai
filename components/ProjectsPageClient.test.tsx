import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsPageClient } from './ProjectsPageClient';

// Mock dependencies
jest.mock('@/lib/translations', () => ({
  getTranslations: jest.fn(),
}));

jest.mock('@/components/Section', () => ({
  __esModule: true,
  default: ({ children, spacing, className }: { children: React.ReactNode; spacing?: string; className?: string }) => (
    <div data-testid="section" data-spacing={spacing} className={className}>{children}</div>
  ),
}));

jest.mock('@/components/Container', () => ({
  __esModule: true,
  default: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="container" data-size={size}>{children}</div>
  ),
}));

jest.mock('@/components/ProjectCard', () => ({
  __esModule: true,
  default: ({ title, slug, locale }: { title: string; slug: string; locale: string }) => (
    <div data-testid="project-card" data-slug={slug} data-locale={locale}>
      <h3>{title}</h3>
    </div>
  ),
}));

import { getTranslations } from '@/lib/translations';
const mockGetTranslations = getTranslations as jest.MockedFunction<typeof getTranslations>;

// Mock translations
const mockTranslations = {
  projects: {
    title: 'Projects',
    description: 'Explore my portfolio of AI and engineering projects',
    search: 'Search projects...',
    filterAll: 'All Categories',
    showingAll: 'Showing all {{count}} projects',
    showingFiltered: 'Showing {{filtered}} of {{total}} projects',
    clearFilters: 'Clear filters',
    noResults: 'No projects found',
    noResultsSubtitle: 'Try adjusting your search or filters',
    viewAll: 'View all projects',
    interestedInCollaboration: 'Interested in collaboration?',
    collaborationText: 'Let\'s discuss your project and how we can work together.',
    discussProject: 'Let\'s discuss your project',
  },
};

// Mock projects data
const mockProjects = [
  {
    slug: 'ai-chatbot',
    title: 'AI Chatbot Platform',
    description: 'Advanced conversational AI system with natural language processing',
    tags: ['AI', 'Machine Learning', 'React'],
    featured: true,
    image: '/images/ai-chatbot.png',
    technologies: ['Python', 'React', 'OpenAI'],
    status: 'completed'
  },
  {
    slug: 'mlops-pipeline',
    title: 'MLOps Pipeline',
    description: 'Automated machine learning deployment pipeline for scalable AI systems',
    tags: ['MLOps', 'DevOps', 'Python'],
    featured: false,
    image: '/images/mlops.png',
    technologies: ['Docker', 'Kubernetes', 'Python'],
    status: 'in-progress'
  },
  {
    slug: 'data-visualization',
    title: 'Data Visualization Dashboard',
    description: 'Interactive analytics dashboard for business intelligence',
    tags: ['Data Science', 'Visualization', 'React'],
    featured: true,
    image: '/images/dashboard.png',
    technologies: ['React', 'D3.js', 'Python'],
    status: 'completed'
  },
  {
    slug: 'blockchain-dapp',
    title: 'Blockchain DApp',
    description: 'Decentralized application built on Ethereum blockchain',
    tags: ['Blockchain', 'Ethereum', 'React'],
    featured: false,
    image: '/images/blockchain.png',
    technologies: ['Solidity', 'React', 'Web3'],
    status: 'completed'
  },
];

describe('ProjectsPageClient', () => {
  beforeEach(() => {
    mockGetTranslations.mockReturnValue(mockTranslations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display projects for current locale', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />);
    
    // Check that all projects are displayed
    expect(screen.getByText('AI Chatbot Platform')).toBeInTheDocument();
    expect(screen.getByText('MLOps Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Data Visualization Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Blockchain DApp')).toBeInTheDocument();
    
    // Check project cards have correct locale
    const projectCards = screen.getAllByTestId('project-card');
    expect(projectCards).toHaveLength(4);
    projectCards.forEach(card => {
      expect(card).toHaveAttribute('data-locale', 'en');
    });
  });

  it('should filter by category correctly', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />);
    
    // Find the filter dropdown
    const filterSelect = screen.getByRole('combobox');
    expect(filterSelect).toBeInTheDocument();
    
    // Filter by 'AI' category
    fireEvent.change(filterSelect, { target: { value: 'AI' } });
    
    // Should show only projects with 'AI' tag
    expect(screen.getByText('AI Chatbot Platform')).toBeInTheDocument();
    expect(screen.queryByText('MLOps Pipeline')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Visualization Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Blockchain DApp')).not.toBeInTheDocument();
  });

  it('should display project cards with correct data', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />);
    
    const projectCards = screen.getAllByTestId('project-card');
    expect(projectCards).toHaveLength(4);
    
    // Check that cards have correct slug and locale attributes
    expect(projectCards[0]).toHaveAttribute('data-slug', 'ai-chatbot');
    expect(projectCards[0]).toHaveAttribute('data-locale', 'en');
    expect(projectCards[1]).toHaveAttribute('data-slug', 'mlops-pipeline');
    expect(projectCards[2]).toHaveAttribute('data-slug', 'data-visualization');
    expect(projectCards[3]).toHaveAttribute('data-slug', 'blockchain-dapp');
  });

  it('should handle empty state when no projects exist', () => {
    render(<ProjectsPageClient initialProjects={[]} locale="en" />);
    
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
  });
});