import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(<Navigation locale="en" />);
    
    // Use getAllByText since items appear in both desktop and mobile menus
    expect(screen.getAllByText('Home')).toHaveLength(2);
    expect(screen.getAllByText('About')).toHaveLength(2);
    expect(screen.getAllByText('Projects')).toHaveLength(2);
    expect(screen.getAllByText('Learn')).toHaveLength(2);
    expect(screen.getAllByText('Blog')).toHaveLength(2);
    expect(screen.getAllByText('Contact')).toHaveLength(2);
  });


  it('renders brand name', () => {
    render(<Navigation locale="en" />);
    
    expect(screen.getByText('Brandon J. Redmond')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    render(<Navigation locale="en" />);
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    
    // Mobile menu should be hidden initially
    const mobileMenu = screen.getByRole('navigation').children[1]; // The second child is the mobile menu
    expect(mobileMenu).toHaveClass('hidden');
    
    // Click to open
    fireEvent.click(menuButton);
    expect(mobileMenu).toHaveClass('block');
    
    // Click to close
    fireEvent.click(menuButton);
    expect(mobileMenu).toHaveClass('hidden');
  });

  it('highlights active page', () => {
    render(<Navigation locale="en" />);
    
    const homeLinks = screen.getAllByText('Home');
    // Both desktop and mobile home links should have active styling
    expect(homeLinks[0]).toHaveClass('text-primary');
    expect(homeLinks[1]).toHaveClass('text-primary');
  });

  it('creates proper links', () => {
    render(<Navigation locale="en" />);
    
    const homeLink = screen.getAllByText('Home')[0].closest('a');
    const aboutLink = screen.getAllByText('About')[0].closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/en');
    expect(aboutLink).toHaveAttribute('href', '/en/about');
  });
});