import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectsPageClient } from './ProjectsPageClient'
import { Project } from '@/types/project'

// Mock project data
const mockProjects: Project[] = [
  {
    slug: 'test-project-1',
    title: 'AI Testing System',
    description: 'A comprehensive AI testing platform',
    longDescription: 'A detailed description of the AI testing system...',
    tags: ['AI', 'Testing', 'Python'],
    featured: true,
    techStack: [
      { category: 'Languages', items: ['Python', 'TypeScript'] }
    ],
    features: ['Feature 1', 'Feature 2'],
    challenges: ['Challenge 1', 'Challenge 2'],
    outcomes: [
      { metric: 'Accuracy', value: '98%' }
    ]
  },
  {
    slug: 'test-project-2',
    title: 'Machine Learning Pipeline',
    description: 'End-to-end ML pipeline for data processing',
    longDescription: 'A detailed description of the ML pipeline...',
    tags: ['Machine Learning', 'Python', 'AWS'],
    featured: false,
    techStack: [
      { category: 'Languages', items: ['Python'] }
    ],
    features: ['Feature A', 'Feature B'],
    challenges: ['Challenge A', 'Challenge B'],
    outcomes: [
      { metric: 'Performance', value: '99%' }
    ]
  },
  {
    slug: 'test-project-3',
    title: 'React Dashboard',
    description: 'Interactive dashboard built with React',
    longDescription: 'A detailed description of the React dashboard...',
    tags: ['React', 'TypeScript', 'Dashboard'],
    featured: false,
    techStack: [
      { category: 'Frontend', items: ['React', 'TypeScript'] }
    ],
    features: ['Interactive Charts', 'Real-time Updates'],
    challenges: ['Performance Optimization', 'State Management'],
    outcomes: [
      { metric: 'Load Time', value: '<2s' }
    ]
  }
]

describe('ProjectsPageClient', () => {
  beforeEach(() => {
    // Reset any existing state
    jest.clearAllMocks()
  })

  it('renders all projects by default', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    expect(screen.getByText('AI Testing System')).toBeInTheDocument()
    expect(screen.getByText('Machine Learning Pipeline')).toBeInTheDocument()
    expect(screen.getByText('React Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Showing all 3 projects')).toBeInTheDocument()
  })

  it('filters projects by search term', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'React' } })
    
    await waitFor(() => {
      expect(screen.getByText('React Dashboard')).toBeInTheDocument()
      expect(screen.queryByText('AI Testing System')).not.toBeInTheDocument()
      expect(screen.queryByText('Machine Learning Pipeline')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 projects')).toBeInTheDocument()
    })
  })

  it('filters projects by tag', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const filterSelect = screen.getByDisplayValue('All Technologies')
    fireEvent.change(filterSelect, { target: { value: 'Python' } })
    
    await waitFor(() => {
      expect(screen.getByText('AI Testing System')).toBeInTheDocument()
      expect(screen.getByText('Machine Learning Pipeline')).toBeInTheDocument()
      expect(screen.queryByText('React Dashboard')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 2 of 3 projects')).toBeInTheDocument()
    })
  })

  it('combines search and filter correctly', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    const filterSelect = screen.getByDisplayValue('All Technologies')
    
    fireEvent.change(searchInput, { target: { value: 'AI' } })
    fireEvent.change(filterSelect, { target: { value: 'Python' } })
    
    await waitFor(() => {
      expect(screen.getByText('AI Testing System')).toBeInTheDocument()
      expect(screen.queryByText('Machine Learning Pipeline')).not.toBeInTheDocument()
      expect(screen.queryByText('React Dashboard')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 projects')).toBeInTheDocument()
    })
  })

  it('shows no results message when no projects match filters', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'NonexistentProject' } })
    
    await waitFor(() => {
      expect(screen.getByText('No projects found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search term or filter to find more projects.')).toBeInTheDocument()
      expect(screen.getByText('View all projects')).toBeInTheDocument()
    })
  })

  it('clears filters when clear button is clicked', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'React' } })
    
    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument()
    })
    
    const clearButton = screen.getByText('Clear filters')
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('Showing all 3 projects')).toBeInTheDocument()
      expect(screen.queryByText('Clear filters')).not.toBeInTheDocument()
    })
  })

  it('resets filters when "View all projects" is clicked from no results', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'NonexistentProject' } })
    
    await waitFor(() => {
      expect(screen.getByText('No projects found')).toBeInTheDocument()
    })
    
    const viewAllButton = screen.getByText('View all projects')
    fireEvent.click(viewAllButton)
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('Showing all 3 projects')).toBeInTheDocument()
      expect(screen.getByText('AI Testing System')).toBeInTheDocument()
    })
  })

  it('renders featured badge for featured projects', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    // Check that featured project has the featured badge
    const featuredProject = screen.getByText('AI Testing System').closest('a')
    expect(featuredProject).toContainElement(screen.getByText('Featured'))
    
    // Check that non-featured projects don't have the badge
    const nonFeaturedProject = screen.getByText('Machine Learning Pipeline').closest('a')
    expect(nonFeaturedProject).not.toContainElement(screen.queryByText('Featured'))
  })

  it('shows correct tag filtering options', () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const filterSelect = screen.getByDisplayValue('All Technologies')
    
    // Check that all unique tags are available as options
    expect(filterSelect).toContainHTML('<option value="AI">AI</option>')
    expect(filterSelect).toContainHTML('<option value="AWS">AWS</option>')
    expect(filterSelect).toContainHTML('<option value="Dashboard">Dashboard</option>')
    expect(filterSelect).toContainHTML('<option value="Machine Learning">Machine Learning</option>')
    expect(filterSelect).toContainHTML('<option value="Python">Python</option>')
    expect(filterSelect).toContainHTML('<option value="React">React</option>')
    expect(filterSelect).toContainHTML('<option value="Testing">Testing</option>')
    expect(filterSelect).toContainHTML('<option value="TypeScript">TypeScript</option>')
  })

  it('handles empty projects list gracefully', () => {
    render(<ProjectsPageClient initialProjects={[]} />)
    
    expect(screen.getByText('Showing all 0 projects')).toBeInTheDocument()
    expect(screen.getByText('No projects found')).toBeInTheDocument()
  })

  it('searches in project description', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'dashboard' } })
    
    await waitFor(() => {
      expect(screen.getByText('React Dashboard')).toBeInTheDocument()
      expect(screen.queryByText('AI Testing System')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 projects')).toBeInTheDocument()
    })
  })

  it('searches in project tags', async () => {
    render(<ProjectsPageClient initialProjects={mockProjects} />)
    
    const searchInput = screen.getByPlaceholderText(/search projects/i)
    fireEvent.change(searchInput, { target: { value: 'aws' } })
    
    await waitFor(() => {
      expect(screen.getByText('Machine Learning Pipeline')).toBeInTheDocument()
      expect(screen.queryByText('AI Testing System')).not.toBeInTheDocument()
      expect(screen.queryByText('React Dashboard')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 projects')).toBeInTheDocument()
    })
  })
})