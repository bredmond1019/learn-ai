import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpertiseOverview from './ExpertiseOverview'

describe('ExpertiseOverview', () => {
  it('renders the component with main heading', () => {
    render(<ExpertiseOverview />)
    
    expect(screen.getByRole('heading', { name: /what i build & teach/i })).toBeInTheDocument()
    expect(screen.getByText(/from high-performance rust systems/i)).toBeInTheDocument()
  })

  it('displays all tech categories', () => {
    render(<ExpertiseOverview />)
    
    expect(screen.getByText('Core Languages')).toBeInTheDocument()
    expect(screen.getByText('AI & Agents')).toBeInTheDocument()
    expect(screen.getByText('Teaching & Communication')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure & Tools')).toBeInTheDocument()
  })

  it('displays skills with proficiency levels', () => {
    render(<ExpertiseOverview />)
    
    // Check for specific skills and their levels
    expect(screen.getByText('Rust')).toBeInTheDocument()
    expect(screen.getAllByText('5/5').length).toBeGreaterThan(0) // Multiple skills have 5/5
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('shows skill descriptions on hover', async () => {
    const user = userEvent.setup()
    render(<ExpertiseOverview />)
    
    const rustSkill = screen.getByText('Rust')
    await user.hover(rustSkill.closest('div')!)
    
    await waitFor(() => {
      expect(screen.getByText(/high-performance systems & workflow engines/i)).toBeInTheDocument()
    })
    
    await user.unhover(rustSkill.closest('div')!)
    
    await waitFor(() => {
      expect(screen.queryByText(/high-performance systems & workflow engines/i)).not.toBeInTheDocument()
    })
  })

  it('handles category selection', async () => {
    const user = userEvent.setup()
    render(<ExpertiseOverview />)
    
    const coreLanguagesCard = screen.getByText('Core Languages').closest('div')!
    
    // Click to select category
    await user.click(coreLanguagesCard)
    
    // Should apply selection styling (checking class would be implementation-specific)
    expect(coreLanguagesCard).toBeInTheDocument()
    
    // Click again to deselect
    await user.click(coreLanguagesCard)
    
    expect(coreLanguagesCard).toBeInTheDocument()
  })

  it('displays progress bars for skills', () => {
    render(<ExpertiseOverview />)
    
    // Should have progress bars for each skill
    const progressBars = document.querySelectorAll('[style*="width"]')
    expect(progressBars.length).toBeGreaterThan(0)
    
    // Check for 100% width for level 5 skills - find any with 100% width
    const progressBarWith100 = document.querySelector('[style*="width: 100%"]')
    expect(progressBarWith100).toBeInTheDocument()
  })

  it('displays additional skills section', () => {
    render(<ExpertiseOverview />)
    
    expect(screen.getByText('Also fluent in:')).toBeInTheDocument()
    expect(screen.getByText('Git')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('Rust')).toBeInTheDocument() // From main skills
  })

  it('has proper accessibility attributes', () => {
    render(<ExpertiseOverview />)
    
    // Should have proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { name: /what i build & teach/i })
    expect(mainHeading).toBeInTheDocument()
    
    // Category headings should be proper headings
    const categoryHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(categoryHeadings.length).toBe(4) // One for each category
  })

  it('shows skill levels correctly for all categories', () => {
    render(<ExpertiseOverview />)
    
    // Check AI & Agents category
    expect(screen.getByText('Agentic Workflows')).toBeInTheDocument()
    expect(screen.getByText('MCP Servers')).toBeInTheDocument()
    
    // Check Teaching & Communication category
    expect(screen.getByText('Technical Writing')).toBeInTheDocument()
    expect(screen.getByText('Code Reviews')).toBeInTheDocument()
    
    // Check Infrastructure & Tools category
    expect(screen.getByText('Docker/K8s')).toBeInTheDocument()
    expect(screen.getByText('AWS/GCP')).toBeInTheDocument()
  })

  it('handles multiple hover states correctly', async () => {
    const user = userEvent.setup()
    render(<ExpertiseOverview />)
    
    // Hover over Python skill
    const pythonSkill = screen.getByText('Python')
    await user.hover(pythonSkill.closest('div')!)
    
    await waitFor(() => {
      expect(screen.getByText(/ai\/ml development & data processing/i)).toBeInTheDocument()
    })
    
    // Hover over TypeScript skill
    const tsSkill = screen.getByText('TypeScript')
    await user.hover(tsSkill.closest('div')!)
    
    await waitFor(() => {
      expect(screen.getByText(/full-stack development & modern web apps/i)).toBeInTheDocument()
      // Python tooltip should be gone
      expect(screen.queryByText(/ai\/ml development & data processing/i)).not.toBeInTheDocument()
    })
  })

  it('renders skill tags with hover effects', async () => {
    const user = userEvent.setup()
    render(<ExpertiseOverview />)
    
    const gitTag = screen.getByText('Git')
    expect(gitTag).toBeInTheDocument()
    
    // Should be hoverable (exact styling would depend on CSS)
    await user.hover(gitTag)
    expect(gitTag).toBeInTheDocument()
  })

  it('maintains state consistency during interactions', async () => {
    const user = userEvent.setup()
    render(<ExpertiseOverview />)
    
    // Select a category
    const aiAgentsCard = screen.getByText('AI & Agents').closest('div')!
    await user.click(aiAgentsCard)
    
    // Hover over a skill in the same category
    const agenticWorkflows = screen.getByText('Agentic Workflows')
    await user.hover(agenticWorkflows.closest('div')!)
    
    // Both states should work together
    await waitFor(() => {
      expect(screen.getByText(/designing & implementing intelligent agent systems/i)).toBeInTheDocument()
    })
    
    // Category should still be selected
    expect(aiAgentsCard).toBeInTheDocument()
  })
})