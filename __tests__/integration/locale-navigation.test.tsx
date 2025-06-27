/**
 * Integration test for locale-aware navigation flows
 * Tests user navigation patterns while maintaining locale consistency
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/Navigation'

// Mock next/navigation with more sophisticated mocking for integration tests
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Locale Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/en')
  })

  describe('Navigation locale persistence', () => {
    it('should maintain English locale when navigating between pages', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en')
      
      render(<Navigation locale="en" />)

      // Navigate to About page
      const aboutLink = screen.getAllByText('About')[0] // Get desktop version
      await user.click(aboutLink)

      // Verify the href maintains locale
      expect(aboutLink.closest('a')).toHaveAttribute('href', '/en/about')

      // Navigate to Projects page
      const projectsLink = screen.getAllByText('Projects')[0]
      await user.click(projectsLink)
      
      expect(projectsLink.closest('a')).toHaveAttribute('href', '/en/projects')

      // Navigate to Learn page
      const learnLink = screen.getAllByText('Learn')[0]
      await user.click(learnLink)
      
      expect(learnLink.closest('a')).toHaveAttribute('href', '/en/learn')

      // Navigate to Blog page
      const blogLink = screen.getAllByText('Blog')[0]
      await user.click(blogLink)
      
      expect(blogLink.closest('a')).toHaveAttribute('href', '/en/blog')

      // Navigate to Contact page
      const contactLink = screen.getAllByText('Contact')[0]
      await user.click(contactLink)
      
      expect(contactLink.closest('a')).toHaveAttribute('href', '/en/contact')
    })

    it('should maintain Portuguese locale when navigating between pages', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt-BR')
      
      render(<Navigation locale="pt-BR" />)

      // Navigate to About page (should use Portuguese route)
      const aboutLink = screen.getAllByText('Sobre')[0]
      await user.click(aboutLink)
      
      expect(aboutLink.closest('a')).toHaveAttribute('href', '/pt-BR/sobre')

      // Navigate to Projects page (should use Portuguese route)
      const projectsLink = screen.getAllByText('Projetos')[0]
      await user.click(projectsLink)
      
      expect(projectsLink.closest('a')).toHaveAttribute('href', '/pt-BR/projetos')

      // Navigate to Learn page (should use Portuguese route)
      const learnLink = screen.getAllByText('Aprender')[0]
      await user.click(learnLink)
      
      expect(learnLink.closest('a')).toHaveAttribute('href', '/pt-BR/aprender')

      // Navigate to Blog page
      const blogLink = screen.getAllByText('Blog')[0]
      await user.click(blogLink)
      
      expect(blogLink.closest('a')).toHaveAttribute('href', '/pt-BR/blog')

      // Navigate to Contact page (should use Portuguese route)
      const contactLink = screen.getAllByText('Contato')[0]
      await user.click(contactLink)
      
      expect(contactLink.closest('a')).toHaveAttribute('href', '/pt-BR/contato')
    })

    it('should highlight active route correctly for current locale', () => {
      // Test English locale active state
      mockUsePathname.mockReturnValue('/en/about')
      const { rerender } = render(<Navigation locale="en" />)
      
      const aboutLinks = screen.getAllByText('About')
      const aboutLink = aboutLinks[0]
      
      // Should have active styling (text-primary class)
      expect(aboutLink).toHaveClass('text-primary')

      // Test Portuguese locale active state
      mockUsePathname.mockReturnValue('/pt-BR/sobre')
      rerender(<Navigation locale="pt-BR" />)
      
      const sobreLinks = screen.getAllByText('Sobre')
      const sobreLink = sobreLinks[0]
      
      // Should have active styling
      expect(sobreLink).toHaveClass('text-primary')
    })

    it('should handle home page navigation for both locales', async () => {
      const user = userEvent.setup()
      
      // Test English locale home
      const { rerender } = render(<Navigation locale="en" />)
      const homeLinks = screen.getAllByText('Brandon J. Redmond')
      const homeLink = homeLinks[0] // Get the first instance (header logo)
      
      expect(homeLink.closest('a')).toHaveAttribute('href', '/en')

      // Test Portuguese locale home  
      rerender(<Navigation locale="pt-BR" />)
      
      const homePortugueseLinks = screen.getAllByText('Brandon J. Redmond')
      const homePortugueseLink = homePortugueseLinks[0] // Get the first instance
      
      expect(homePortugueseLink.closest('a')).toHaveAttribute('href', '/pt-BR')
    })
  })
})