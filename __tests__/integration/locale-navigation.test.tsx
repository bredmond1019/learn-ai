/**
 * Integration test for locale-aware navigation flows
 * Tests user navigation patterns while maintaining locale consistency
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/Navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

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

  describe('Language switching persistence', () => {
    it('should switch from English to Portuguese and maintain correct route mapping', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/about')
      
      render(<LanguageSwitcher currentLocale="en" />)

      // Find the language switcher select element
      const languageSelect = screen.getByLabelText('Select language')
      expect(languageSelect).toHaveValue('en')

      // Switch to Portuguese
      await user.selectOptions(languageSelect, 'pt-BR')

      // Verify router.push was called with correct Portuguese route mapping
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt-BR/sobre')
      })
    })

    it('should switch from Portuguese to English and maintain correct route mapping', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt-BR/projetos')
      
      render(<LanguageSwitcher currentLocale="pt-BR" />)

      const languageSelect = screen.getByLabelText('Select language')
      expect(languageSelect).toHaveValue('pt-BR')

      // Switch to English
      await user.selectOptions(languageSelect, 'en')

      // Verify router.push was called with correct English route mapping
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/projects')
      })
    })

    it('should handle language switching from complex nested routes', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/learn/paths/ai-basics/modules/introduction')
      
      render(<LanguageSwitcher currentLocale="en" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Switch to Portuguese - nested routes are preserved but only root path gets mapped
      // Current implementation only maps exact path matches, so nested paths aren't translated
      await user.selectOptions(languageSelect, 'pt-BR')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt-BR/learn/paths/ai-basics/modules/introduction')
      })
    })

    it('should handle language switching from home page', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en')
      
      render(<LanguageSwitcher currentLocale="en" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Switch to Portuguese from home page
      await user.selectOptions(languageSelect, 'pt-BR')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt-BR')
      })
    })

    it('should handle language switching for blog routes', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt-BR/blog/ai-fundamentals')
      
      render(<LanguageSwitcher currentLocale="pt-BR" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Switch to English - blog route stays the same in both languages
      await user.selectOptions(languageSelect, 'en')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/blog/ai-fundamentals')
      })
    })

    it('should display correct language labels and options', () => {
      render(<LanguageSwitcher currentLocale="en" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Check that both language options are available
      expect(screen.getByRole('option', { name: 'EN - English' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'PT - Português' })).toBeInTheDocument()
      
      // Check current selection
      expect(languageSelect).toHaveValue('en')
    })
  })

  describe('Deep link handling with locale prefix', () => {
    it('should correctly render navigation for English deep links', () => {
      mockUsePathname.mockReturnValue('/en/projects/ai-chatbot')
      
      render(<Navigation locale="en" />)

      // Check that navigation renders correctly for deep link
      expect(screen.getAllByText('Projects')[0]).toHaveClass('text-primary')
      expect(screen.getAllByText('Home')[0]).not.toHaveClass('text-primary')
      expect(screen.getAllByText('About')[0]).not.toHaveClass('text-primary')
    })

    it('should correctly render navigation for Portuguese deep links', () => {
      mockUsePathname.mockReturnValue('/pt-BR/projetos/sistema-ai')
      
      render(<Navigation locale="pt-BR" />)

      // Check that navigation renders correctly for Portuguese deep link
      expect(screen.getAllByText('Projetos')[0]).toHaveClass('text-primary')
      expect(screen.getAllByText('Início')[0]).not.toHaveClass('text-primary')
      expect(screen.getAllByText('Sobre')[0]).not.toHaveClass('text-primary')
    })

    it('should handle navigation state for learn module deep links', () => {
      mockUsePathname.mockReturnValue('/en/learn/paths/ai-systems-intro/modules/fundamentals')
      
      render(<Navigation locale="en" />)

      // Learn section should be active for deep module links
      expect(screen.getAllByText('Learn')[0]).toHaveClass('text-primary')
      expect(screen.getAllByText('Blog')[0]).not.toHaveClass('text-primary')
    })

    it('should handle navigation state for Portuguese learn module deep links', () => {
      mockUsePathname.mockReturnValue('/pt-BR/aprender/paths/intro-ai/modules/conceitos-basicos')
      
      render(<Navigation locale="pt-BR" />)

      // Aprender section should be active for deep module links
      expect(screen.getAllByText('Aprender')[0]).toHaveClass('text-primary')
      expect(screen.getAllByText('Blog')[0]).not.toHaveClass('text-primary')
    })

    it('should handle blog post deep links with locale prefix', () => {
      mockUsePathname.mockReturnValue('/en/blog/understanding-large-language-models')
      
      render(<Navigation locale="en" />)

      // Blog section should be active
      expect(screen.getAllByText('Blog')[0]).toHaveClass('text-primary')
      expect(screen.getAllByText('Learn')[0]).not.toHaveClass('text-primary')
    })

    it('should correctly initialize language switcher for deep links', () => {
      mockUsePathname.mockReturnValue('/pt-BR/contato')
      
      render(<LanguageSwitcher currentLocale="pt-BR" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Language switcher should be set to Portuguese
      expect(languageSelect).toHaveValue('pt-BR')
      
      // Options should be available
      expect(screen.getByRole('option', { name: 'EN - English' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'PT - Português' })).toBeInTheDocument()
    })

    it('should generate correct new URLs when switching language from deep links', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/about')
      
      render(<LanguageSwitcher currentLocale="en" />)

      const languageSelect = screen.getByLabelText('Select language')
      
      // Switch to Portuguese from about page deep link
      await user.selectOptions(languageSelect, 'pt-BR')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt-BR/sobre')
      })
    })
  })
})