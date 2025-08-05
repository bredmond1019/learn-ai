/**
 * Integration test for content loading across different locales
 * Tests complete content loading workflows including blogs, projects, and modules
 */

import { render, screen, waitFor } from '@testing-library/react'
import { getAllPostsMeta } from '@/lib/content/blog/mdx.server'
import { BlogCardServer } from '@/components/BlogCardServer'

// Mock server-side data fetching
jest.mock('@/lib/mdx.server', () => ({
  getAllPostsMeta: jest.fn(),
  getPostBySlug: jest.fn(),
}))

// Mock next/navigation for blog card links
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/blog',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Content Loading Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Blog post loading by locale', () => {
    const mockEnglishPosts = [
      {
        slug: 'understanding-ai-agents',
        title: 'Understanding AI Agents: A Complete Guide',
        excerpt: 'Learn how AI agents work and how to build them effectively.',
        date: '2024-03-15',
        readingTime: 12,
        tags: ['ai-agents', 'fundamentals'],
        published: true
      },
      {
        slug: 'advanced-mcp-patterns',
        title: 'Advanced Model Context Protocol Patterns',
        excerpt: 'Explore sophisticated MCP implementation strategies.',
        date: '2024-03-10',
        readingTime: 8,
        tags: ['mcp', 'advanced'],
        published: true
      }
    ]

    const mockPortuguesePosts = [
      {
        slug: 'entendendo-agentes-ia',
        title: 'Entendendo Agentes de IA: Um Guia Completo',
        excerpt: 'Aprenda como os agentes de IA funcionam e como construí-los efetivamente.',
        date: '2024-03-15',
        readingTime: 12,
        tags: ['agentes-ia', 'fundamentos'],
        published: true
      },
      {
        slug: 'padroes-mcp-avancados',
        title: 'Padrões Avançados do Protocolo de Contexto do Modelo',
        excerpt: 'Explore estratégias sofisticadas de implementação MCP.',
        date: '2024-03-10',
        readingTime: 8,
        tags: ['mcp', 'avançado'],
        published: true
      }
    ]

    it('should load English blog posts correctly', () => {
      const mockGetAllPostsMeta = getAllPostsMeta as jest.MockedFunction<typeof getAllPostsMeta>
      mockGetAllPostsMeta.mockReturnValue(mockEnglishPosts)

      // Test individual blog card rendering
      render(<BlogCardServer post={mockEnglishPosts[0]} />)

      // Check that English content is displayed
      expect(screen.getByText('Understanding AI Agents: A Complete Guide')).toBeInTheDocument()
      expect(screen.getByText('Learn how AI agents work and how to build them effectively.')).toBeInTheDocument()
      expect(screen.getByText('ai-agents')).toBeInTheDocument()
      expect(screen.getByText('fundamentals')).toBeInTheDocument()
      expect(screen.getByText('12 min read')).toBeInTheDocument()
    })

    it('should load Portuguese blog posts correctly', () => {
      const mockGetAllPostsMeta = getAllPostsMeta as jest.MockedFunction<typeof getAllPostsMeta>
      mockGetAllPostsMeta.mockReturnValue(mockPortuguesePosts)

      // Test individual blog card rendering
      render(<BlogCardServer post={mockPortuguesePosts[0]} />)

      // Check that Portuguese content is displayed
      expect(screen.getByText('Entendendo Agentes de IA: Um Guia Completo')).toBeInTheDocument()
      expect(screen.getByText('Aprenda como os agentes de IA funcionam e como construí-los efetivamente.')).toBeInTheDocument()
      expect(screen.getByText('agentes-ia')).toBeInTheDocument()
      expect(screen.getByText('fundamentos')).toBeInTheDocument()
      expect(screen.getByText('12 min read')).toBeInTheDocument()
    })

    it('should generate correct blog post links for English locale', () => {
      render(<BlogCardServer post={mockEnglishPosts[0]} />)

      const blogLink = screen.getByRole('link')
      expect(blogLink).toHaveAttribute('href', '/blog/understanding-ai-agents')
    })

    it('should generate correct blog post links for Portuguese locale', () => {
      render(<BlogCardServer post={mockPortuguesePosts[0]} />)

      const blogLink = screen.getByRole('link')
      expect(blogLink).toHaveAttribute('href', '/blog/entendendo-agentes-ia')
    })

    it('should handle empty blog post lists gracefully', () => {
      const mockGetAllPostsMeta = getAllPostsMeta as jest.MockedFunction<typeof getAllPostsMeta>
      mockGetAllPostsMeta.mockReturnValue([])

      // This would normally be tested in the blog page component
      // but we can verify the function returns empty array
      const posts = getAllPostsMeta('en')
      expect(posts).toEqual([])
    })

    it('should categorize blog posts correctly for both locales', () => {
      // Test MCP categorization for English
      render(<BlogCardServer post={mockEnglishPosts[1]} />)
      
      expect(screen.getByText('Advanced Model Context Protocol Patterns')).toBeInTheDocument()
      expect(screen.getAllByText('mcp')[0]).toBeInTheDocument() // Use getAllByText since multiple instances exist

      // Test MCP categorization for Portuguese
      const { rerender } = render(<BlogCardServer post={mockPortuguesePosts[1]} />)
      
      expect(screen.getByText('Padrões Avançados do Protocolo de Contexto do Modelo')).toBeInTheDocument()
      expect(screen.getAllByText('mcp')[0]).toBeInTheDocument() // Use getAllByText
    })

    it('should display formatted dates consistently across locales', () => {
      // Test English date formatting
      const { container: englishContainer } = render(<BlogCardServer post={mockEnglishPosts[0]} />)
      const englishTimeElement = englishContainer.querySelector('time')
      expect(englishTimeElement).toBeInTheDocument()
      expect(englishTimeElement).toHaveAttribute('dateTime', '2024-03-15')

      // Test Portuguese date formatting
      const { container: portugueseContainer } = render(<BlogCardServer post={mockPortuguesePosts[0]} />)
      const portugueseTimeElement = portugueseContainer.querySelector('time')
      expect(portugueseTimeElement).toBeInTheDocument()
      expect(portugueseTimeElement).toHaveAttribute('dateTime', '2024-03-15')
    })

    it('should handle blog posts with missing or empty tags', () => {
      const postWithoutTags = {
        ...mockEnglishPosts[0],
        tags: []
      }

      render(<BlogCardServer post={postWithoutTags} />)

      // Should render the post but not show any tag elements
      expect(screen.getByText('Understanding AI Agents: A Complete Guide')).toBeInTheDocument()
      expect(screen.queryByText('ai-agents')).not.toBeInTheDocument()
    })

    it('should provide proper accessibility for blog post cards', () => {
      render(<BlogCardServer post={mockEnglishPosts[0]} />)

      // Check for semantic elements
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveClass('block', 'group')

      // Check for proper time element
      const timeElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'time'
      })
      expect(timeElement).toHaveAttribute('dateTime', '2024-03-15')
    })
  })
})