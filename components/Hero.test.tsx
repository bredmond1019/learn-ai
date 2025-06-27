import { render, screen } from '@testing-library/react';
import Hero from './Hero';

describe('Hero Component', () => {
  const defaultLocale = 'en';

  it('renders the main heading', () => {
    render(<Hero locale={defaultLocale} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('From Teaching Math to Building AI Minds');
  });

  it('renders the description text', () => {
    render(<Hero locale={defaultLocale} />);
    const description = screen.getByText(/I help engineers and entrepreneurs build intelligent systems/i);
    expect(description).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    render(<Hero locale={defaultLocale} />);
    const projectsButton = screen.getByRole('button', { name: /Explore My Work/i });
    const learnButton = screen.getByRole('button', { name: /Learn Agentic AI/i });
    
    expect(projectsButton).toBeInTheDocument();
    expect(learnButton).toBeInTheDocument();
  });

  it('renders the correct button variants', () => {
    render(<Hero locale={defaultLocale} />);
    const projectsButton = screen.getByRole('button', { name: /Explore My Work/i });
    const learnButton = screen.getByRole('button', { name: /Learn Agentic AI/i });
    
    expect(projectsButton).toHaveClass('bg-primary');
    expect(learnButton).toHaveClass('bg-accent');
  });

  it('renders all three statistics', () => {
    render(<Hero locale={defaultLocale} />);
    expect(screen.getByText('5+')).toBeInTheDocument();
    expect(screen.getByText('Years Engineering')).toBeInTheDocument();
    
    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('MCP Servers Built')).toBeInTheDocument();
    
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('Students Taught')).toBeInTheDocument();
  });

  it('renders location badges', () => {
    render(<Hero locale={defaultLocale} />);
    expect(screen.getByText('São Paulo, Brazil')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    const { container } = render(<Hero locale={defaultLocale} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('renders decorative background elements', () => {
    const { container } = render(<Hero locale={defaultLocale} />);
    const decorativeElements = container.querySelectorAll('.absolute');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  describe('Internationalization', () => {
    it('should render with English locale', () => {
      render(<Hero locale="en" />);
      
      // Verify English translations
      expect(screen.getByText('From Teaching Math to')).toBeInTheDocument();
      expect(screen.getByText('Building AI Minds')).toBeInTheDocument();
      expect(screen.getByText('I help engineers and entrepreneurs build intelligent systems that solve real problems')).toBeInTheDocument();
      expect(screen.getByText('Explore My Work')).toBeInTheDocument();
      expect(screen.getByText('Learn Agentic AI')).toBeInTheDocument();
      expect(screen.getByText('Years Engineering')).toBeInTheDocument();
      expect(screen.getByText('MCP Servers Built')).toBeInTheDocument();
      expect(screen.getByText('Students Taught')).toBeInTheDocument();
    });

    it('should render with Portuguese locale', () => {
      render(<Hero locale="pt-BR" />);
      
      // Verify Portuguese translations
      expect(screen.getByText('De Ensinar Matemática a')).toBeInTheDocument();
      expect(screen.getByText('Construir Mentes de IA')).toBeInTheDocument();
      expect(screen.getByText('Ajudo engenheiros e empreendedores a construir sistemas inteligentes que resolvem problemas reais')).toBeInTheDocument();
      expect(screen.getByText('Explore Meu Trabalho')).toBeInTheDocument();
      expect(screen.getByText('Aprenda IA Agêntica')).toBeInTheDocument();
      expect(screen.getByText('Anos de Engenharia')).toBeInTheDocument();
      expect(screen.getByText('Servidores MCP Construídos')).toBeInTheDocument();
      expect(screen.getByText('Estudantes Ensinados')).toBeInTheDocument();
      expect(screen.getByText('São Paulo, Brasil')).toBeInTheDocument();
      expect(screen.getByText('Nova York, EUA')).toBeInTheDocument();
    });

    it('should render profile image with proper optimization', () => {
      const { container } = render(<Hero locale="en" />);
      
      // Check for optimized image component
      const imageContainer = container.querySelector('.relative.aspect-square.rounded-full');
      expect(imageContainer).toBeInTheDocument();
      
      // Check for blur placeholder
      const blurPlaceholder = container.querySelector('.animate-pulse');
      expect(blurPlaceholder).toBeInTheDocument();
      
      // Check for Next.js optimized image
      const img = container.querySelector('img[alt*="Brandon J. Redmond"]');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('srcset');
      expect(img).toHaveAttribute('sizes');
      
      // Check for proper object positioning
      expect(img).toHaveStyle('object-fit: cover');
      expect(img).toHaveStyle('object-position: 60% 60%');
    });

    it('should display statistics with translated labels', () => {
      // Test English statistics
      const { rerender } = render(<Hero locale="en" />);
      expect(screen.getByText('5+')).toBeInTheDocument();
      expect(screen.getByText('Years Engineering')).toBeInTheDocument();
      expect(screen.getByText('10+')).toBeInTheDocument();
      expect(screen.getByText('MCP Servers Built')).toBeInTheDocument();
      expect(screen.getByText('100+')).toBeInTheDocument();
      expect(screen.getByText('Students Taught')).toBeInTheDocument();
      
      // Test Portuguese statistics
      rerender(<Hero locale="pt-BR" />);
      expect(screen.getByText('5+')).toBeInTheDocument();
      expect(screen.getByText('Anos de Engenharia')).toBeInTheDocument();
      expect(screen.getByText('10+')).toBeInTheDocument();
      expect(screen.getByText('Servidores MCP Construídos')).toBeInTheDocument();
      expect(screen.getByText('100+')).toBeInTheDocument();
      expect(screen.getByText('Estudantes Ensinados')).toBeInTheDocument();
    });
  });
});