import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/Navigation'

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

describe('Keyboard Navigation - All interactive elements are keyboard accessible', () => {
  it('should allow tab navigation through all navigation links', async () => {
    const user = userEvent.setup()
    
    render(<Navigation locale="en" />)
    
    // Get all navigation links specifically from desktop menu (first instance)
    const allHomeLinks = screen.getAllByRole('link', { name: /home/i })
    const allAboutLinks = screen.getAllByRole('link', { name: /about/i })
    const allProjectsLinks = screen.getAllByRole('link', { name: /projects/i })
    const allLearnLinks = screen.getAllByRole('link', { name: /learn/i })
    const allBlogLinks = screen.getAllByRole('link', { name: /blog/i })
    const allContactLinks = screen.getAllByRole('link', { name: /contact/i })
    
    // Use the first link which is from the desktop menu
    const homeLink = allHomeLinks[0]
    const aboutLink = allAboutLinks[0]
    const projectsLink = allProjectsLinks[0]
    const learnLink = allLearnLinks[0]
    const blogLink = allBlogLinks[0]
    const contactLink = allContactLinks[0]
    
    // Start tabbing from the brand link
    const brandLink = screen.getByRole('link', { name: /brandon j\. redmond/i })
    await user.click(brandLink)
    expect(brandLink).toHaveFocus()
    
    // Tab through each navigation link
    await user.tab()
    expect(homeLink).toHaveFocus()
    
    await user.tab()
    expect(aboutLink).toHaveFocus()
    
    await user.tab()
    expect(projectsLink).toHaveFocus()
    
    await user.tab()
    expect(learnLink).toHaveFocus()
    
    await user.tab()
    expect(blogLink).toHaveFocus()
    
    await user.tab()
    expect(contactLink).toHaveFocus()
  })

  it('should have visible focus indicators on interactive elements', async () => {
    const user = userEvent.setup()
    
    render(<Navigation locale="en" />)
    
    // Test that focused elements have visible focus indicators
    const brandLink = screen.getByRole('link', { name: /brandon j\. redmond/i })
    const homeLink = screen.getAllByRole('link', { name: /home/i })[0]
    
    // Focus the brand link and check for focus styles
    await user.click(brandLink)
    expect(brandLink).toHaveFocus()
    expect(brandLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary')
    
    // Tab to home link and verify focus styles
    await user.tab()
    expect(homeLink).toHaveFocus()
    expect(homeLink).toHaveClass('focus:outline-none')
    
    // Test mobile menu button focus indicators
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    await user.click(menuButton)
    expect(menuButton).toHaveFocus()
    expect(menuButton).toHaveClass('focus:ring-2', 'focus:ring-inset', 'focus:ring-primary')
  })
})