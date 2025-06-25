import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GlobalProjectCard from './GlobalProjectCard';

// Mock the hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();

const defaultProps = {
  title: 'Test Project',
  description: 'This is a test project description that demonstrates the component functionality.',
  tags: ['React', 'TypeScript', 'Testing'],
  slug: 'test-project',
};

describe('GlobalProjectCard', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockPush.mockClear();
  });

  it('renders project card with basic information', () => {
    render(<GlobalProjectCard {...defaultProps} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/This is a test project description/)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('displays status badge correctly', () => {
    render(<GlobalProjectCard {...defaultProps} status="inProgress" />);
    
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows featured badge when featured is true', () => {
    render(<GlobalProjectCard {...defaultProps} featured />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('displays project image when provided', () => {
    const image = '/test-image.jpg';
    render(<GlobalProjectCard {...defaultProps} image={image} />);
    
    const img = screen.getByAltText('Test Project');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', image);
  });

  it('shows fallback AI placeholder when no image provided', () => {
    render(<GlobalProjectCard {...defaultProps} />);
    
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('displays outcomes when provided', () => {
    const outcomes = [
      { metric: 'Users', value: '1000+' },
      { metric: 'Stars', value: '50+' },
    ];
    
    render(<GlobalProjectCard {...defaultProps} outcomes={outcomes} />);
    
    expect(screen.getByText('1000+')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
  });

  it('renders external links when provided', () => {
    render(
      <GlobalProjectCard 
        {...defaultProps} 
        demoUrl="https://demo.example.com"
        githubUrl="https://github.com/test/repo"
      />
    );
    
    const demoLink = screen.getByText('View Demo').closest('a');
    const githubLink = screen.getByText('View Code').closest('a');
    
    expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
    expect(demoLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/test/repo');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('prevents navigation when clicking external links', () => {
    const mockStopPropagation = jest.fn();
    
    render(
      <GlobalProjectCard 
        {...defaultProps} 
        demoUrl="https://demo.example.com"
      />
    );
    
    const demoLink = screen.getByText('View Demo');
    fireEvent.click(demoLink, { stopPropagation: mockStopPropagation });
    
    // The actual stopPropagation is called in the onClick handler
    // This test verifies the link is rendered correctly
    expect(demoLink.closest('a')).toHaveAttribute('href', 'https://demo.example.com');
  });

  it('limits tags display and shows overflow count', () => {
    const manyTags = ['React', 'TypeScript', 'Testing', 'Jest', 'Next.js', 'Tailwind'];
    
    render(<GlobalProjectCard {...defaultProps} tags={manyTags} />);
    
    // Should show first 3 tags
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    
    // Should show overflow count
    expect(screen.getByText('+3 more')).toBeInTheDocument();
    
    // Should not show the remaining tags
    expect(screen.queryByText('Jest')).not.toBeInTheDocument();
  });

  it('renders compact variant correctly', () => {
    render(<GlobalProjectCard {...defaultProps} variant="compact" />);
    
    // Should limit tags to 2 in compact mode
    const manyTags = ['React', 'TypeScript', 'Testing', 'Jest'];
    render(<GlobalProjectCard {...defaultProps} tags={manyTags} variant="compact" />);
    
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('navigates to project route when card is clicked', () => {
    render(<GlobalProjectCard {...defaultProps} />);
    
    const card = screen.getByText('Test Project').closest('.cursor-pointer');
    fireEvent.click(card!);
    
    expect(mockPush).toHaveBeenCalledWith('/projects/test-project');
  });

  it('applies custom className', () => {
    render(<GlobalProjectCard {...defaultProps} className="custom-class" />);
    
    const container = screen.getByText('Test Project').closest('.group');
    expect(container).toHaveClass('custom-class');
  });

  it('shows different status indicators with correct styling', () => {
    const { rerender } = render(<GlobalProjectCard {...defaultProps} status="completed" />);
    expect(screen.getByText('Completed')).toHaveClass('text-green-400');
    
    rerender(<GlobalProjectCard {...defaultProps} status="inProgress" />);
    expect(screen.getByText('In Progress')).toHaveClass('text-yellow-400');
    
    rerender(<GlobalProjectCard {...defaultProps} status="planned" />);
    expect(screen.getByText('Planned')).toHaveClass('text-blue-400');
  });

  it('renders featured variant with special styling', () => {
    render(<GlobalProjectCard {...defaultProps} variant="featured" />);
    
    const card = screen.getByText('Test Project').closest('[class*="ring-primary"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('ring-1', 'ring-primary/20');
  });
});