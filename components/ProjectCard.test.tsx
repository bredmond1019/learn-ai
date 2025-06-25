import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';

const mockProject = {
  title: 'Test Project',
  description: 'This is a test project description',
  tags: ['React', 'TypeScript', 'AI'],
  slug: 'test-project',
};

describe('ProjectCard Component', () => {
  it('renders the project title', () => {
    render(<ProjectCard {...mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders the project description', () => {
    render(<ProjectCard {...mockProject} />);
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
  });

  it('renders all tags when there are 3 or fewer', () => {
    render(<ProjectCard {...mockProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows overflow indicator when there are more than 3 tags', () => {
    const projectWithManyTags = {
      ...mockProject,
      tags: ['React', 'TypeScript', 'AI', 'ML', 'Python'],
    };
    render(<ProjectCard {...projectWithManyTags} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('shows featured badge when featured is true', () => {
    render(<ProjectCard {...mockProject} featured={true} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not show featured badge when featured is false', () => {
    render(<ProjectCard {...mockProject} featured={false} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('creates correct link to project detail page', () => {
    render(<ProjectCard {...mockProject} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/test-project');
  });

  it('applies interactive card variant', () => {
    const { container } = render(<ProjectCard {...mockProject} />);
    const card = container.querySelector('.transition-all');
    expect(card).toBeInTheDocument();
  });

  it('renders placeholder image when no image provided', () => {
    const { container } = render(<ProjectCard {...mockProject} />);
    const placeholder = container.querySelector('.bg-gradient-to-br');
    expect(placeholder).toBeInTheDocument();
  });

  it('renders actual image when image prop is provided', () => {
    render(<ProjectCard {...mockProject} image="/test-image.jpg" />);
    const image = screen.getByAltText('Test Project');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('has hover effect arrow element', () => {
    const { container } = render(<ProjectCard {...mockProject} />);
    const arrow = container.querySelector('svg');
    expect(arrow).toBeInTheDocument();
  });
});