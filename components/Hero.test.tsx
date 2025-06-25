import { render, screen } from '@testing-library/react';
import Hero from './Hero';

describe('Hero Component', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('From Teaching Math to Building AI Minds');
  });

  it('renders the description text', () => {
    render(<Hero />);
    const description = screen.getByText(/I help engineers and entrepreneurs build intelligent systems/i);
    expect(description).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    render(<Hero />);
    const projectsButton = screen.getByRole('button', { name: /Explore My Work/i });
    const learnButton = screen.getByRole('button', { name: /Learn Agentic AI/i });
    
    expect(projectsButton).toBeInTheDocument();
    expect(learnButton).toBeInTheDocument();
  });

  it('renders the correct button variants', () => {
    render(<Hero />);
    const projectsButton = screen.getByRole('button', { name: /Explore My Work/i });
    const learnButton = screen.getByRole('button', { name: /Learn Agentic AI/i });
    
    expect(projectsButton).toHaveClass('bg-primary');
    expect(learnButton).toHaveClass('bg-accent');
  });

  it('renders all three statistics', () => {
    render(<Hero />);
    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('Years Engineering')).toBeInTheDocument();
    
    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('MCP Servers Built')).toBeInTheDocument();
    
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('Students Taught')).toBeInTheDocument();
  });

  it('renders location badges', () => {
    render(<Hero />);
    expect(screen.getByText('São Paulo, Brazil')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    const { container } = render(<Hero />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('renders decorative background elements', () => {
    const { container } = render(<Hero />);
    const decorativeElements = container.querySelectorAll('.absolute');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });
});