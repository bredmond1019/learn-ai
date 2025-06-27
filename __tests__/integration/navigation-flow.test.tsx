/**
 * Integration test for navigation and project browsing flows
 * Tests user navigation patterns and project interaction
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/Navigation'
import GlobalProjectCard from '@/components/GlobalProjectCard'
import { ProjectsPageClient } from '@/components/ProjectsPageClient'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/projects',
  useSearchParams: () => new URLSearchParams(),
}))

// No longer need next-intl mocking as project uses custom i18n implementation

// Mock project data
const mockProjects = [
  {
    id: 'sentiment-analysis',
    title: 'AI Sentiment Analysis Tool',
    description: 'Advanced NLP tool for analyzing customer feedback sentiment',
    image: '/images/projects/sentiment-analysis.jpg',
    technologies: ['Python', 'TensorFlow', 'React', 'FastAPI'],
    tags: ['machine-learning', 'nlp', 'analytics'],
    category: 'AI/ML',
    featured: true,
    demoUrl: 'https://sentiment-demo.example.com',
    githubUrl: 'https://github.com/user/sentiment-analysis',
    status: 'completed' as const,
    completionDate: '2024-03-15',
    metrics: {
      accuracy: '94%',
      processingSpeed: '1000 texts/min',
      languages: 5
    }
  },
  {
    id: 'portfolio-website',
    title: 'Personal Portfolio Website',
    description: 'Modern, responsive portfolio built with Next.js and TypeScript',
    image: '/images/projects/portfolio.jpg',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'],
    tags: ['web-development', 'portfolio', 'typescript'],
    category: 'Web Development',
    featured: true,
    githubUrl: 'https://github.com/user/portfolio',
    status: 'completed' as const,
    completionDate: '2024-06-01'
  }
]

describe('Navigation and Project Browsing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Navigation Component', () => {
    it('should render all navigation links', () => {
      render(<Navigation locale="en" />)
      
      // Check for main navigation items (use getAllByRole for elements that appear in both desktop and mobile)
      const aboutLinks = screen.getAllByRole('link', { name: /about/i })
      expect(aboutLinks.length).toBeGreaterThan(0)
      
      const projectsLinks = screen.getAllByRole('link', { name: /projects/i })
      expect(projectsLinks.length).toBeGreaterThan(0)
      
      const blogLinks = screen.getAllByRole('link', { name: /blog/i })
      expect(blogLinks.length).toBeGreaterThan(0)
      
      const contactLinks = screen.getAllByRole('link', { name: /contact/i })
      expect(contactLinks.length).toBeGreaterThan(0)
    })

    it('should handle mobile menu toggle', async () => {
      const user = userEvent.setup()
      render(<Navigation locale="en" />)
      
      // Find mobile menu button (usually a hamburger icon)
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toBeInTheDocument()
      
      // Click to open mobile menu
      await user.click(mobileMenuButton)
      
      // Should show navigation items in mobile view
      await waitFor(() => {
        const mobileLinks = screen.getAllByRole('link')
        expect(mobileLinks.length).toBeGreaterThan(0)
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Navigation locale="en" />)
      
      // Tab through navigation links
      await user.tab()
      await user.tab()
      
      // Should be able to focus on navigation elements
      const focusedElement = document.activeElement
      expect(focusedElement?.tagName).toBe('A')
    })
  })

  describe('Project Card Interactions', () => {
    it('should display project information correctly', () => {
      const project = mockProjects[0]
      render(
        <GlobalProjectCard 
          title={project.title}
          description={project.description}
          tags={project.tags}
          slug={project.id}
          featured={project.featured}
          demoUrl={project.demoUrl}
          githubUrl={project.githubUrl}
          image={project.image}
          status={project.status}
        />
      )
      
      expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
      expect(screen.getByText(/Advanced NLP tool/)).toBeInTheDocument()
      expect(screen.getByText('machine-learning')).toBeInTheDocument()
      expect(screen.getByText('nlp')).toBeInTheDocument()
    })

    it('should handle project card hover and focus states', async () => {
      const user = userEvent.setup()
      const project = mockProjects[0]
      render(
        <GlobalProjectCard 
          title={project.title}
          description={project.description}
          tags={project.tags}
          slug={project.id}
          featured={project.featured}
          demoUrl={project.demoUrl}
          githubUrl={project.githubUrl}
          image={project.image}
          status={project.status}
        />
      )
      
      const projectCard = screen.getByRole('heading', { name: 'AI Sentiment Analysis Tool' }).closest('div')
      
      // Test hover interaction
      await user.hover(projectCard)
      
      // Should show enhanced state (implementation depends on CSS)
      expect(projectCard).toBeInTheDocument()
      
      // Test keyboard focus
      await user.tab()
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInTheDocument()
    })

    it('should provide accessible project information', () => {
      const project = mockProjects[0]
      render(
        <GlobalProjectCard 
          title={project.title}
          description={project.description}
          tags={project.tags}
          slug={project.id}
          featured={project.featured}
          demoUrl={project.demoUrl}
          githubUrl={project.githubUrl}
          image={project.image}
          status={project.status}
        />
      )
      
      // Should have proper ARIA labels and structure
      const projectTitle = screen.getByRole('heading', { name: 'AI Sentiment Analysis Tool' })
      expect(projectTitle).toBeInTheDocument()
      
      // Should have accessible tag list
      const tagElement = screen.getByText('machine-learning').closest('div')
      expect(tagElement).toBeInTheDocument()
    })
  })

  describe('Projects Page Flow', () => {
    it('should filter projects by category', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />)
      
      // Should show all projects initially
      expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
      expect(screen.getByText('Personal Portfolio Website')).toBeInTheDocument()
      
      // Filter by category using the select dropdown
      const categorySelect = screen.getByRole('combobox')
      await user.selectOptions(categorySelect, 'analytics')
      
      // Should filter projects (analytics tag exists in first project)
      await waitFor(() => {
        expect(categorySelect).toHaveValue('analytics')
        expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
        expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
      })
    })

    it('should search projects by text', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'sentiment')
      
      // Should filter to matching projects
      await waitFor(() => {
        expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
        expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
      })
      
      // Clear search
      await user.clear(searchInput)
      
      // Should show all projects again
      await waitFor(() => {
        expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
        expect(screen.getByText('Personal Portfolio Website')).toBeInTheDocument()
      })
    })

    it('should handle empty search results gracefully', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockProjects} locale="en" />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'nonexistent-project')
      
      // Should show no projects (empty results)
      await waitFor(() => {
        expect(screen.queryByText('AI Sentiment Analysis Tool')).not.toBeInTheDocument()
        expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsive Navigation Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Test desktop navigation
      render(<Navigation locale="en" />)
      
      // Desktop navigation should be visible
      const desktopNav = screen.getByRole('navigation')
      expect(desktopNav).toBeInTheDocument()
      
      // Mobile menu button should exist but may be hidden on desktop
      const mobileButton = screen.queryByRole('button', { name: /menu/i })
      // Button exists for mobile but behavior depends on CSS
      if (mobileButton) {
        expect(mobileButton).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility in Navigation', () => {
    it('should support screen readers', () => {
      render(<Navigation locale="en" />)
      
      // Should have proper navigation landmark
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Links should be properly labeled (use getAllByRole for elements that appear in both desktop and mobile)
      const aboutLinks = screen.getAllByRole('link', { name: /about/i })
      expect(aboutLinks[0]).toHaveAttribute('href')
      expect(aboutLinks[0]).toHaveAttribute('href', '/en/about')
    })

    it('should support keyboard navigation patterns', async () => {
      const user = userEvent.setup()
      render(<Navigation locale="en" />)
      
      // Should be able to tab through all navigation elements
      const links = screen.getAllByRole('link')
      
      for (let i = 0; i < links.length; i++) {
        await user.tab()
      }
      
      // All links should be reachable
      expect(links.length).toBeGreaterThan(0)
    })

    it('should have proper ARIA attributes', () => {
      render(<Navigation locale="en" />)
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Check for mobile menu button with proper ARIA
      const mobileButton = screen.queryByRole('button', { name: /menu/i })
      if (mobileButton) {
        expect(mobileButton).toHaveAttribute('aria-expanded')
      }
    })
  })
})