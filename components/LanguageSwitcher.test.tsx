import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock middleware to provide locales
jest.mock('../middleware', () => ({
  locales: ['en', 'pt-BR'],
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/en');
  });

  it('should display current language', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    const select = screen.getByRole('combobox', { name: /select language/i });
    expect(select).toHaveValue('en');
    expect(screen.getByText('EN - English')).toBeInTheDocument();
  });

  it('should show all available languages', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    expect(screen.getByText('EN - English')).toBeInTheDocument();
    expect(screen.getByText('PT - Português')).toBeInTheDocument();
  });

  it('should toggle between en/pt-BR', () => {
    // Start on English home page
    mockPathname.mockReturnValue('/en');
    const { rerender } = render(<LanguageSwitcher currentLocale="en" />);
    
    const select = screen.getByRole('combobox', { name: /select language/i });
    
    // Switch to Portuguese
    fireEvent.change(select, { target: { value: 'pt-BR' } });
    expect(mockPush).toHaveBeenCalledWith('/pt-BR');
    
    // Simulate being on Portuguese page now
    mockPathname.mockReturnValue('/pt-BR');
    rerender(<LanguageSwitcher currentLocale="pt-BR" />);
    
    // Switch back to English
    fireEvent.change(select, { target: { value: 'en' } });
    expect(mockPush).toHaveBeenCalledWith('/en');
  });

  it('should maintain route when switching languages', () => {
    // Test English about page to Portuguese
    mockPathname.mockReturnValue('/en/about');
    const { unmount } = render(<LanguageSwitcher currentLocale="en" />);
    
    const select = screen.getByRole('combobox', { name: /select language/i });
    fireEvent.change(select, { target: { value: 'pt-BR' } });
    
    expect(mockPush).toHaveBeenCalledWith('/pt-BR/sobre');
    
    // Clear previous calls and unmount previous component
    mockPush.mockClear();
    unmount();
    
    // Test Portuguese projects page to English
    mockPathname.mockReturnValue('/pt-BR/projetos');
    render(<LanguageSwitcher currentLocale="pt-BR" />);
    
    const newSelect = screen.getByRole('combobox', { name: /select language/i });
    fireEvent.change(newSelect, { target: { value: 'en' } });
    expect(mockPush).toHaveBeenCalledWith('/en/projects');
  });

  it('should handle nested routes', () => {
    // Test blog post route
    mockPathname.mockReturnValue('/en/blog/my-first-post');
    render(<LanguageSwitcher currentLocale="en" />);
    
    const select = screen.getByRole('combobox', { name: /select language/i });
    fireEvent.change(select, { target: { value: 'pt-BR' } });
    
    // Blog routes stay the same in both languages
    expect(mockPush).toHaveBeenCalledWith('/pt-BR/blog/my-first-post');
  });

  it('should not overlap with dropdown arrow (regression test)', () => {
    const { container } = render(<LanguageSwitcher currentLocale="en" />);
    
    const select = container.querySelector('select');
    expect(select).toHaveClass('pl-3', 'pr-8');
    
    // Check that arrow is positioned absolutely
    const arrowContainer = container.querySelector('.pointer-events-none');
    expect(arrowContainer).toHaveClass('absolute', 'inset-y-0', 'right-0');
  });
});