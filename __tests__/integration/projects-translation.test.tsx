/**
 * Integration test for projects loading with proper translations
 * Tests complete project loading workflows for both English and Portuguese locales
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectsPageClient } from '@/components/ProjectsPageClient'
import { Project } from '@/types/project'

// Mock the translations utility
jest.mock('@/lib/translations', () => ({
  getTranslations: (locale: string) => {
    const translations = {
      en: {
        projects: {
          title: 'Projects',
          description: 'A showcase of AI solutions that push the boundaries of what\'s possible, from research prototypes to production systems serving millions',
          search: 'Search projects by title, description, or technology...',
          filterAll: 'All Technologies',
          showingAll: 'Showing all {{count}} projects',
          showingFiltered: 'Showing {{filtered}} of {{total}} projects',
          noResults: 'No projects found matching your search criteria.',
          tryDifferent: 'Try adjusting your search terms or filters.'
        }
      },
      'pt-BR': {
        projects: {
          title: 'Projetos',
          description: 'Uma vitrine de soluções de IA que expandem os limites do possível, desde protótipos de pesquisa até sistemas de produção atendendo milhões',
          search: 'Buscar projetos por título, descrição ou tecnologia...',
          filterAll: 'Todas as Tecnologias',
          showingAll: 'Mostrando todos os {{count}} projetos',
          showingFiltered: 'Mostrando {{filtered}} de {{total}} projetos',
          noResults: 'Nenhum projeto encontrado com seus critérios de busca.',
          tryDifferent: 'Tente ajustar seus termos de busca ou filtros.'
        }
      }
    }
    return translations[locale as keyof typeof translations] || translations.en
  }
}))

describe('Projects Translation Integration', () => {
  const mockEnglishProjects: Project[] = [
    {
      id: 'ai-sentiment-analyzer',
      title: 'AI Sentiment Analysis Tool',
      description: 'Advanced NLP tool for analyzing customer feedback sentiment with real-time processing capabilities.',
      tags: ['machine-learning', 'nlp', 'analytics'],
      category: 'AI/ML',
      featured: true,
      image: '/images/projects/sentiment-analysis.jpg',
      technologies: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      status: 'completed' as const,
      completionDate: '2024-03-15',
      githubUrl: 'https://github.com/user/sentiment-analysis',
      demoUrl: 'https://sentiment-demo.example.com'
    },
    {
      id: 'portfolio-website',
      title: 'Personal Portfolio Website',
      description: 'Modern, responsive portfolio built with Next.js and TypeScript, featuring internationalization and MDX blog.',
      tags: ['web-development', 'portfolio', 'typescript'],
      category: 'Web Development',
      featured: true,
      image: '/images/projects/portfolio.jpg',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'],
      status: 'completed' as const,
      completionDate: '2024-06-01',
      githubUrl: 'https://github.com/user/portfolio'
    }
  ]

  const mockPortugueseProjects: Project[] = [
    {
      id: 'analisador-sentimento-ia',
      title: 'Ferramenta de Análise de Sentimento com IA',
      description: 'Ferramenta avançada de PLN para analisar sentimento de feedback de clientes com capacidades de processamento em tempo real.',
      tags: ['aprendizado-de-maquina', 'pln', 'analise'],
      category: 'IA/ML',
      featured: true,
      image: '/images/projects/sentiment-analysis.jpg',
      technologies: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      status: 'completed' as const,
      completionDate: '2024-03-15',
      githubUrl: 'https://github.com/user/sentiment-analysis',
      demoUrl: 'https://sentiment-demo.example.com'
    },
    {
      id: 'site-portfolio',
      title: 'Site de Portfólio Pessoal',
      description: 'Portfólio moderno e responsivo construído com Next.js e TypeScript, apresentando internacionalização e blog MDX.',
      tags: ['desenvolvimento-web', 'portfolio', 'typescript'],
      category: 'Desenvolvimento Web',
      featured: true,
      image: '/images/projects/portfolio.jpg',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'],
      status: 'completed' as const,
      completionDate: '2024-06-01',
      githubUrl: 'https://github.com/user/portfolio'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('English locale project loading', () => {
    it('should display English project titles and descriptions correctly', () => {
      render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)

      // Check main page title and description
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText(/A showcase of AI solutions that push the boundaries/)).toBeInTheDocument()

      // Check individual projects are displayed with English content
      expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
      expect(screen.getByText(/Advanced NLP tool for analyzing customer feedback/)).toBeInTheDocument()
      
      expect(screen.getByText('Personal Portfolio Website')).toBeInTheDocument()
      expect(screen.getByText(/Modern, responsive portfolio built with Next.js/)).toBeInTheDocument()
    })

    it('should display English search and filter placeholders', () => {
      render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)

      // Check search input placeholder
      const searchInput = screen.getByPlaceholderText('Search projects by title, description, or technology...')
      expect(searchInput).toBeInTheDocument()

      // Check filter dropdown
      expect(screen.getByText('All Technologies')).toBeInTheDocument()
    })

    it('should filter English projects by technology tags', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)

      // Filter by machine-learning tag
      const filterSelect = screen.getByRole('combobox')
      await user.selectOptions(filterSelect, 'machine-learning')

      await waitFor(() => {
        expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
        expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
      })
    })

    it('should search English projects by text content', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)

      const searchInput = screen.getByPlaceholderText('Search projects by title, description, or technology...')
      await user.type(searchInput, 'sentiment')

      await waitFor(() => {
        expect(screen.getByText('AI Sentiment Analysis Tool')).toBeInTheDocument()
        expect(screen.queryByText('Personal Portfolio Website')).not.toBeInTheDocument()
      })
    })
  })

  describe('Portuguese locale project loading', () => {
    it('should display Portuguese project titles and descriptions correctly', () => {
      render(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)

      // Check main page title and description
      expect(screen.getByText('Projetos')).toBeInTheDocument()
      expect(screen.getByText(/Uma vitrine de soluções de IA que expandem os limites/)).toBeInTheDocument()

      // Check individual projects are displayed with Portuguese content
      expect(screen.getByText('Ferramenta de Análise de Sentimento com IA')).toBeInTheDocument()
      expect(screen.getByText(/Ferramenta avançada de PLN para analisar sentimento/)).toBeInTheDocument()
      
      expect(screen.getByText('Site de Portfólio Pessoal')).toBeInTheDocument()
      expect(screen.getByText(/Portfólio moderno e responsivo construído com Next.js/)).toBeInTheDocument()
    })

    it('should display Portuguese search and filter placeholders', () => {
      render(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)

      // Check search input placeholder
      const searchInput = screen.getByPlaceholderText('Buscar projetos por título, descrição ou tecnologia...')
      expect(searchInput).toBeInTheDocument()

      // Check filter dropdown
      expect(screen.getByText('Todas as Tecnologias')).toBeInTheDocument()
    })

    it('should filter Portuguese projects by technology tags', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)

      // Filter by aprendizado-de-maquina tag (Portuguese machine-learning)
      const filterSelect = screen.getByRole('combobox')
      await user.selectOptions(filterSelect, 'aprendizado-de-maquina')

      await waitFor(() => {
        expect(screen.getByText('Ferramenta de Análise de Sentimento com IA')).toBeInTheDocument()
        expect(screen.queryByText('Site de Portfólio Pessoal')).not.toBeInTheDocument()
      })
    })

    it('should search Portuguese projects by text content', async () => {
      const user = userEvent.setup()
      render(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)

      const searchInput = screen.getByPlaceholderText('Buscar projetos por título, descrição ou tecnologia...')
      await user.type(searchInput, 'sentimento')

      await waitFor(() => {
        expect(screen.getByText('Ferramenta de Análise de Sentimento com IA')).toBeInTheDocument()
        expect(screen.queryByText('Site de Portfólio Pessoal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Cross-locale project handling', () => {
    it('should handle empty project lists gracefully for both locales', () => {
      // Test English empty state
      const { rerender } = render(<ProjectsPageClient initialProjects={[]} locale="en" />)
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('All Technologies')).toBeInTheDocument()

      // Test Portuguese empty state
      rerender(<ProjectsPageClient initialProjects={[]} locale="pt-BR" />)
      expect(screen.getByText('Projetos')).toBeInTheDocument()
      expect(screen.getByText('Todas as Tecnologias')).toBeInTheDocument()
    })

    it('should maintain search functionality across different project sets', async () => {
      const user = userEvent.setup()
      
      // Test English projects search
      const { rerender } = render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)
      
      const englishSearchInput = screen.getByPlaceholderText('Search projects by title, description, or technology...')
      await user.type(englishSearchInput, 'portfolio')
      
      await waitFor(() => {
        expect(screen.getByText('Personal Portfolio Website')).toBeInTheDocument()
      })

      // Switch to Portuguese projects (component will have new state)
      rerender(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)
      
      const portugueseSearchInput = screen.getByPlaceholderText('Buscar projetos por título, descrição ou tecnologia...')
      // Clear the previous search and test Portuguese search
      await user.clear(portugueseSearchInput)
      await user.type(portugueseSearchInput, 'portfolio')
      
      await waitFor(() => {
        expect(screen.getByText('Site de Portfólio Pessoal')).toBeInTheDocument()
      })
    })

    it('should display technology tags correctly for both locales', () => {
      // Test English tags
      const { rerender } = render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)
      
      // English projects should show English technology tags
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument()
      
      // Switch to Portuguese
      rerender(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)
      
      // Portuguese projects should show Portuguese technology tags
      expect(screen.getByDisplayValue('Todas as Tecnologias')).toBeInTheDocument()
    })

    it('should handle projects with missing translations gracefully', () => {
      const mixedProjects = [
        {
          ...mockEnglishProjects[0],
          title: '', // Missing title should not break rendering
          description: '' // Missing description should not break rendering
        }
      ]

      render(<ProjectsPageClient initialProjects={mixedProjects} locale="en" />)
      
      // Page should still render with main title
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('All Technologies')).toBeInTheDocument()
    })
  })

  describe('Project accessibility across locales', () => {
    it('should provide proper accessibility for English projects', () => {
      render(<ProjectsPageClient initialProjects={mockEnglishProjects} locale="en" />)

      // Check for proper heading structure
      const mainHeading = screen.getByRole('heading', { name: 'Projects' })
      expect(mainHeading).toBeInTheDocument()

      // Check for search input accessibility
      const searchInput = screen.getByPlaceholderText('Search projects by title, description, or technology...')
      expect(searchInput).toHaveAttribute('type', 'text')

      // Check for filter dropdown accessibility
      const filterSelect = screen.getByRole('combobox')
      expect(filterSelect).toBeInTheDocument()
    })

    it('should provide proper accessibility for Portuguese projects', () => {
      render(<ProjectsPageClient initialProjects={mockPortugueseProjects} locale="pt-BR" />)

      // Check for proper heading structure
      const mainHeading = screen.getByRole('heading', { name: 'Projetos' })
      expect(mainHeading).toBeInTheDocument()

      // Check for search input accessibility
      const searchInput = screen.getByPlaceholderText('Buscar projetos por título, descrição ou tecnologia...')
      expect(searchInput).toHaveAttribute('type', 'text')

      // Check for filter dropdown accessibility
      const filterSelect = screen.getByRole('combobox')
      expect(filterSelect).toBeInTheDocument()
    })
  })
})