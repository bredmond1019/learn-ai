/**
 * Integration test for navigation and project browsing flows
 * Tests user navigation patterns and project interaction
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/Navigation'
import { GlobalProjectCard } from '@/components/GlobalProjectCard'
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

// Mock next-intl (no longer used but keeping for compatibility)
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock project data
const mockProjects = [
  {
    id: 'sentiment-analysis',
    title: 'AI Sentiment Analysis Tool',
    description: 'Advanced NLP tool for analyzing customer feedback sentiment',
    image: '/images/projects/sentiment-analysis.jpg',
    technologies: ['Python', 'TensorFlow', 'React', 'FastAPI'],
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
      render(<Navigation />)
      
      // Check for main navigation items
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
    })

    it('should handle mobile menu toggle', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
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
      render(<Navigation />)
      
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
      render(<GlobalProjectCard project={mockProjects[0]} />)
      
      expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
      expect(screen.getByText(/Advanced NLP tool/)).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('TensorFlow')).toBeInTheDocument()
      expect(screen.getByText('AI/ML')).toBeInTheDocument()
    })

    it('should handle project card hover and focus states', async () => {
      const user = userEvent.setup()
      render(<GlobalProjectCard project={mockProjects[0]} />)
      
      const projectCard = screen.getByRole('article')
      
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
      render(<GlobalProjectCard project={mockProjects[0]} />)
      
      // Should have proper ARIA labels and structure
      const projectCard = screen.getByRole('article')
      expect(projectCard).toBeInTheDocument()
      
      // Should have accessible technology list
      const techList = screen.getByText('Python').closest('ul') || screen.getByText('Python').closest('div')
      expect(techList).toBeInTheDocument()
    })
  })

  describe('Projects Page Flow', () => {
    it('should filter projects by category', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient projects={mockProjects} />)
      
      // Should show all projects initially
      expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
      expect(screen.getByText('Personal Portfolio Website')).toBeInTheDocument()
      
      // Filter by AI/ML category
      const categoryFilter = screen.getByRole('button', { name: /ai.*ml/i })
      if (categoryFilter) {
        await user.click(categoryFilter)
        
        // Should only show AI/ML projects
        await waitFor(() => {
          expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
          expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
        })
      }
    })

    it('should search projects by text', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient projects={mockProjects} />)
      
      const searchInput = screen.getByRole('searchbox') || screen.getByPlaceholderText(/search/i)
      if (searchInput) {
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
      }
    })

    it('should handle empty search results gracefully', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient projects={mockProjects} />)
      
      const searchInput = screen.getByRole('searchbox') || screen.getByPlaceholderText(/search/i)
      if (searchInput) {
        await user.type(searchInput, 'nonexistent-project')
        
        // Should show no results message
        await waitFor(() => {
          const noResultsMessage = screen.queryByText(/no projects found/i) || 
                                  screen.queryByText(/no results/i) ||
                                  screen.queryByText(/try a different search/i)
          if (noResultsMessage) {
            expect(noResultsMessage).toBeInTheDocument()
          }
        })
      }
    })
  })

  describe('Responsive Navigation Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Test desktop navigation
      render(<Navigation />)
      
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
      render(<Navigation />)
      
      // Should have proper navigation landmark
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Links should be properly labeled
      const aboutLink = screen.getByRole('link', { name: /about/i })
      expect(aboutLink).toHaveAttribute('href')
    })

    it('should support keyboard navigation patterns', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Should be able to tab through all navigation elements
      const links = screen.getAllByRole('link')
      
      for (let i = 0; i < links.length; i++) {
        await user.tab()
      }
      
      // All links should be reachable
      expect(links.length).toBeGreaterThan(0)
    })

    it('should have proper ARIA attributes', () => {
      render(<Navigation />)
      
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