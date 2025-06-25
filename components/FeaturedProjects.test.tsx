import { render, screen } from '@testing-library/react'
import FeaturedProjects from './FeaturedProjects'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('FeaturedProjects', () => {
  it('renders the component with main heading', () => {
    render(<FeaturedProjects />)
    
    expect(screen.getByRole('heading', { name: /featured projects/i })).toBeInTheDocument()
    expect(screen.getByText(/showcasing ai solutions/i)).toBeInTheDocument()
  })

  it('displays all featured projects', () => {
    render(<FeaturedProjects />)
    
    // Check for specific project titles
    expect(screen.getByText('AI-Powered Document Intelligence System')).toBeInTheDocument()
    expect(screen.getByText('Real-time Anomaly Detection Platform')).toBeInTheDocument()
    expect(screen.getByText('Conversational AI Customer Support Agent')).toBeInTheDocument()
  })

  it('shows project descriptions', () => {
    render(<FeaturedProjects />)
    
    expect(screen.getByText(/built an enterprise-grade document processing system/i)).toBeInTheDocument()
    expect(screen.getByText(/developed a scalable ml platform/i)).toBeInTheDocument()
    expect(screen.getByText(/created an advanced chatbot/i)).toBeInTheDocument()
  })

  it('displays technology tags for projects', () => {
    render(<FeaturedProjects />)
    
    // Check for various technologies
    expect(screen.getByText('PyTorch')).toBeInTheDocument()
    expect(screen.getByText('Computer Vision')).toBeInTheDocument()
    expect(screen.getByText('TensorFlow')).toBeInTheDocument()
    expect(screen.getByText('Apache Kafka')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
  })

  it('includes a call-to-action button', () => {
    render(<FeaturedProjects />)
    
    const viewAllButton = screen.getByRole('link', { name: /view all projects/i })
    expect(viewAllButton).toBeInTheDocument()
    expect(viewAllButton).toHaveAttribute('href', '/projects')
  })

  it('renders projects in a grid layout', () => {
    render(<FeaturedProjects />)
    
    // Should have 3 project links (each project is a link)
    const projectLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.startsWith('/projects/')
    )
    expect(projectLinks).toHaveLength(3)
  })

  it('shows impressive metrics in descriptions', () => {
    render(<FeaturedProjects />)
    
    // Check for specific metrics mentioned in descriptions
    expect(screen.getByText(/98% accuracy/i)).toBeInTheDocument()
    expect(screen.getByText(/1m\+ events\/second/i)).toBeInTheDocument()
    expect(screen.getByText(/40% while maintaining 95%/i)).toBeInTheDocument()
  })

  it('has proper heading hierarchy', () => {
    render(<FeaturedProjects />)
    
    // Main heading should be h2
    const mainHeading = screen.getByRole('heading', { name: /featured projects/i })
    expect(mainHeading.tagName).toBe('H2')
  })

  it('includes AI/ML focused technologies', () => {
    render(<FeaturedProjects />)
    
    // Should highlight AI/ML stack - check for visible ones
    expect(screen.getByText('Computer Vision')).toBeInTheDocument()
    expect(screen.getByText('Time Series')).toBeInTheDocument()
    expect(screen.getByText('RAG')).toBeInTheDocument()
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
  })

  it('shows cloud and infrastructure technologies', () => {
    render(<FeaturedProjects />)
    
    // Check for visible cloud/infrastructure tech
    expect(screen.getByText('TensorFlow')).toBeInTheDocument()
    expect(screen.getByText('Apache Kafka')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
  })

  it('demonstrates full-stack capabilities', () => {
    render(<FeaturedProjects />)
    
    // Should show diverse technology stack
    expect(screen.getByText('PyTorch')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
    
    // Check for "+2 more" indicators (there are multiple)
    expect(screen.getAllByText('+2 more').length).toBeGreaterThan(0)
  })

  it('has accessible structure', () => {
    render(<FeaturedProjects />)
    
    // Should have proper link to projects page
    const projectsLink = screen.getByRole('link', { name: /view all projects/i })
    expect(projectsLink).toHaveAttribute('href', '/projects')
    
    // Should have descriptive text
    const description = screen.getByText(/showcasing ai solutions/i)
    expect(description).toBeInTheDocument()
  })

  it('emphasizes business impact', () => {
    render(<FeaturedProjects />)
    
    // Should mention business value and metrics
    expect(screen.getByText(/drive real business value/i)).toBeInTheDocument()
    expect(screen.getByText(/reducing support ticket volume/i)).toBeInTheDocument()
    expect(screen.getByText(/critical infrastructure monitoring/i)).toBeInTheDocument()
  })
})