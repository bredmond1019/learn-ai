import { render, screen } from '@testing-library/react'
import Navigation from '@/components/Navigation'
import { ContactForm } from '@/components/ContactForm'
import Hero from '@/components/Hero'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/en'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('Screen Reader Support - ARIA labels are present and correct', () => {
  it('should have proper ARIA labels on navigation elements', async () => {
    render(<Navigation locale="en" />)
    
    // Navigation should have proper role
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Mobile menu button should have aria-expanded
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // Language selectors should have aria-label (both desktop and mobile)
    const languageSelectors = screen.getAllByLabelText(/select language/i)
    expect(languageSelectors).toHaveLength(2) // Desktop and mobile
    languageSelectors.forEach(selector => {
      expect(selector).toHaveAttribute('aria-label', 'Select language')
    })
  })

  it('should have proper ARIA labels on form elements', () => {
    render(<ContactForm />)
    
    // Form fields should have proper labels
    const nameField = screen.getByLabelText(/name/i)
    expect(nameField).toBeInTheDocument()
    expect(nameField).toHaveAttribute('id', 'name')
    
    const emailField = screen.getByLabelText(/email/i)
    expect(emailField).toBeInTheDocument()
    expect(emailField).toHaveAttribute('id', 'email')
    
    const reasonField = screen.getByLabelText(/reason for contact/i)
    expect(reasonField).toBeInTheDocument()
    expect(reasonField).toHaveAttribute('id', 'reason')
    
    const messageField = screen.getByLabelText(/message/i)
    expect(messageField).toBeInTheDocument()
    expect(messageField).toHaveAttribute('id', 'message')
  })
})

describe('Screen Reader Support - Heading hierarchy is logical', () => {
  it('should have proper heading hierarchy in Hero component', () => {
    render(<Hero locale="en" />)
    
    // Should have a main heading (h1)
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    
    // Should not have orphaned headings (h3 without h2, etc)
    // Get all headings and verify hierarchy
    const allHeadings = screen.getAllByRole('heading')
    const headingLevels = allHeadings.map(heading => 
      parseInt(heading.tagName.slice(1))
    ).sort((a, b) => a - b)
    
    // First heading should be h1
    expect(headingLevels[0]).toBe(1)
    
    // No gaps in heading levels (no h4 without h3, etc)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1]
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  it('should have logical heading structure on pages', () => {
    // This test would be better with a full page component
    // For now, test that navigation doesn't interfere with heading structure
    render(<Navigation locale="en" />)
    
    // Navigation should not contain any headings
    const nav = screen.getByRole('navigation')
    const headingsInNav = nav.querySelectorAll('h1, h2, h3, h4, h5, h6')
    expect(headingsInNav).toHaveLength(0)
  })
})