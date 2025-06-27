import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('Navigation', () => {
  beforeEach(() => {
    // Reset mock to default value before each test
    mockUsePathname.mockReturnValue('/en');
  });

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

  describe('Internationalization', () => {
    it('should render navigation links for current locale', () => {
      // Test English locale
      const { rerender } = render(<Navigation locale="en" />);
      
      // Check all navigation items are in English
      expect(screen.getAllByText('Home')).toHaveLength(2);
      expect(screen.getAllByText('About')).toHaveLength(2);
      expect(screen.getAllByText('Projects')).toHaveLength(2);
      expect(screen.getAllByText('Learn')).toHaveLength(2);
      expect(screen.getAllByText('Blog')).toHaveLength(2);
      expect(screen.getAllByText('Contact')).toHaveLength(2);
      
      // Check links include English locale
      const enHomeLink = screen.getAllByText('Home')[0].closest('a');
      const enAboutLink = screen.getAllByText('About')[0].closest('a');
      const enProjectsLink = screen.getAllByText('Projects')[0].closest('a');
      expect(enHomeLink).toHaveAttribute('href', '/en');
      expect(enAboutLink).toHaveAttribute('href', '/en/about');
      expect(enProjectsLink).toHaveAttribute('href', '/en/projects');
      
      // Test Portuguese locale
      rerender(<Navigation locale="pt-BR" />);
      
      // Check all navigation items are in Portuguese
      expect(screen.getAllByText('Início')).toHaveLength(2);
      expect(screen.getAllByText('Sobre')).toHaveLength(2);
      expect(screen.getAllByText('Projetos')).toHaveLength(2);
      expect(screen.getAllByText('Aprender')).toHaveLength(2);
      expect(screen.getAllByText('Blog')).toHaveLength(2);
      expect(screen.getAllByText('Contato')).toHaveLength(2);
      
      // Check links include Portuguese locale with translated routes
      const ptHomeLink = screen.getAllByText('Início')[0].closest('a');
      const ptAboutLink = screen.getAllByText('Sobre')[0].closest('a');
      const ptProjectsLink = screen.getAllByText('Projetos')[0].closest('a');
      expect(ptHomeLink).toHaveAttribute('href', '/pt-BR');
      expect(ptAboutLink).toHaveAttribute('href', '/pt-BR/sobre');
      expect(ptProjectsLink).toHaveAttribute('href', '/pt-BR/projetos');
    });

    it('should highlight active route', () => {
      // Test home page active
      mockUsePathname.mockReturnValue('/en');
      const { rerender } = render(<Navigation locale="en" />);
      let homeLinks = screen.getAllByText('Home');
      let aboutLinks = screen.getAllByText('About');
      expect(homeLinks[0]).toHaveClass('text-primary');
      expect(aboutLinks[0]).not.toHaveClass('text-primary');
      
      // Test about page active
      mockUsePathname.mockReturnValue('/en/about');
      rerender(<Navigation locale="en" />);
      homeLinks = screen.getAllByText('Home');
      aboutLinks = screen.getAllByText('About');
      expect(homeLinks[0]).not.toHaveClass('text-primary');
      expect(aboutLinks[0]).toHaveClass('text-primary');
      
      // Test Portuguese routes
      mockUsePathname.mockReturnValue('/pt-BR/sobre');
      rerender(<Navigation locale="pt-BR" />);
      const inicioLinks = screen.getAllByText('Início');
      const sobreLinks = screen.getAllByText('Sobre');
      expect(inicioLinks[0]).not.toHaveClass('text-primary');
      expect(sobreLinks[0]).toHaveClass('text-primary');
      
      // Test nested routes (e.g., /en/blog/post-1)
      mockUsePathname.mockReturnValue('/en/blog/my-first-post');
      rerender(<Navigation locale="en" />);
      const blogLinks = screen.getAllByText('Blog');
      expect(blogLinks[0]).toHaveClass('text-primary');
    });
  });
});