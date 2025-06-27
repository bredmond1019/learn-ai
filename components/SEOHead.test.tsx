import { render } from '@testing-library/react'
import { SEOHead, ProjectSEO, BlogSEO, PageSEO } from './SEOHead'

// Mock next/head
jest.mock('next/head', () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>
})


// Mock performance lib
jest.mock('@/lib/performance', () => ({
  generateMetaTags: (config: any) => ({
    meta: [
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords?.join(', ') },
      { property: 'og:title', content: config.title },
      { property: 'og:description', content: config.description },
      { property: 'og:image', content: config.ogImage },
      { property: 'og:url', content: config.canonicalUrl }
    ],
    link: [
      { rel: 'canonical', href: config.canonicalUrl }
    ]
  })
}))

describe('SEOHead', () => {
  beforeEach(() => {
    // Clear head before each test
    document.head.innerHTML = ''
  })

  describe('SEOHead Component', () => {
    it('renders default meta tags', () => {
      render(<SEOHead />)
      
      // Check that title is rendered
      expect(document.title).toBe('Brandon J. Redmond - AI Engineer & Technical Leader')
      
      // Check meta tags exist
      const metaTags = document.querySelectorAll('meta')
      expect(metaTags.length).toBeGreaterThan(0)
    })

    it('renders custom title and description', () => {
      render(
        <SEOHead 
          title="Custom Title"
          description="Custom description for testing"
        />
      )
      
      expect(document.title).toBe('Custom Title')
      
      const descriptionMeta = document.querySelector('meta[name="description"]')
      expect(descriptionMeta).toHaveAttribute('content', 'Custom description for testing')
    })

    it('renders keywords meta tag', () => {
      render(
        <SEOHead 
          keywords={['react', 'testing', 'typescript']}
        />
      )
      
      const keywordsMeta = document.querySelector('meta[name="keywords"]')
      expect(keywordsMeta).toHaveAttribute('content', expect.stringContaining('react'))
      expect(keywordsMeta).toHaveAttribute('content', expect.stringContaining('testing'))
    })

    it('renders canonical URL', () => {
      render(
        <SEOHead 
          canonicalPath="/test-page"
        />
      )
      
      const canonicalLink = document.querySelector('link[rel="canonical"]')
      expect(canonicalLink).toHaveAttribute('href', 'https://brandon-redmond.dev/test-page')
    })

    it('renders noindex when specified', () => {
      render(<SEOHead noIndex={true} />)
      
      const robotsMeta = document.querySelector('meta[name="robots"]')
      expect(robotsMeta).toHaveAttribute('content', 'noindex, nofollow')
    })

    it('renders article meta tags when isArticle is true', () => {
      render(
        <SEOHead 
          isArticle={true}
          author="Brandon Redmond"
          section="Technology"
          publishedTime="2024-01-01"
          modifiedTime="2024-01-02"
        />
      )
      
      const ogType = document.querySelector('meta[property="og:type"]')
      expect(ogType).toHaveAttribute('content', 'article')
      
      const articleAuthor = document.querySelector('meta[property="article:author"]')
      expect(articleAuthor).toHaveAttribute('content', 'Brandon Redmond')
      
      const articleSection = document.querySelector('meta[property="article:section"]')
      expect(articleSection).toHaveAttribute('content', 'Technology')
    })

    it('renders structured data', () => {
      const structuredData = {
        '@type': 'Person',
        name: 'Brandon Redmond'
      }
      
      render(<SEOHead structuredData={structuredData} />)
      
      const jsonLd = document.querySelector('script[type="application/ld+json"]')
      expect(jsonLd).toBeInTheDocument()
      expect(jsonLd?.textContent).toBe(JSON.stringify(structuredData))
    })

    it('renders language and locale meta tags', () => {
      render(<SEOHead />)
      
      const contentLanguage = document.querySelector('meta[http-equiv="content-language"]')
      expect(contentLanguage).toHaveAttribute('content', 'en')
      
      const language = document.querySelector('meta[name="language"]')
      expect(language).toHaveAttribute('content', 'en')
    })

    it('includes performance optimization links', () => {
      render(<SEOHead />)
      
      const preconnectGoogle = document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')
      expect(preconnectGoogle).toBeInTheDocument()
      
      const preconnectGstatic = document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')
      expect(preconnectGstatic).toBeInTheDocument()
    })
  })

  describe('ProjectSEO Component', () => {
    it('renders project-specific SEO', () => {
      const project = {
        title: 'AI Chat System',
        description: 'Advanced AI chat system with RAG',
        slug: 'ai-chat',
        tags: ['AI', 'RAG', 'TypeScript']
      }
      
      render(<ProjectSEO project={project} />)
      
      expect(document.title).toBe('AI Chat System | Projects - Brandon J. Redmond')
      
      const description = document.querySelector('meta[name="description"]')
      expect(description).toHaveAttribute('content', 'Advanced AI chat system with RAG')
    })

    it('includes project tags as keywords', () => {
      const project = {
        title: 'Test Project',
        description: 'Test description',
        slug: 'test',
        tags: ['React', 'Node.js', 'MongoDB']
      }
      
      render(<ProjectSEO project={project} />)
      
      const keywords = document.querySelector('meta[name="keywords"]')
      expect(keywords).toHaveAttribute('content', expect.stringContaining('React'))
      expect(keywords).toHaveAttribute('content', expect.stringContaining('Node.js'))
    })
  })

  describe('BlogSEO Component', () => {
    it('renders blog-specific SEO', () => {
      const post = {
        title: 'Understanding AI Agents',
        description: 'Deep dive into AI agent architectures',
        slug: 'ai-agents',
        date: '2024-01-01',
        tags: ['AI', 'Agents', 'ML']
      }
      
      render(<BlogSEO post={post} />)
      
      expect(document.title).toBe('Understanding AI Agents | Blog - Brandon J. Redmond')
      
      const ogType = document.querySelector('meta[property="og:type"]')
      expect(ogType).toHaveAttribute('content', 'article')
      
      const publishedTime = document.querySelector('meta[property="article:published_time"]')
      expect(publishedTime).toHaveAttribute('content', '2024-01-01')
    })

    it('sets article author correctly', () => {
      const post = {
        title: 'Test Post',
        description: 'Test description',
        slug: 'test',
        date: '2024-01-01'
      }
      
      render(<BlogSEO post={post} />)
      
      const author = document.querySelector('meta[property="article:author"]')
      expect(author).toHaveAttribute('content', 'Brandon J. Redmond')
    })
  })

  describe('PageSEO Component', () => {
    it('renders page-specific SEO for home', () => {
      render(<PageSEO pageKey="home" />)
      
      expect(document.title).toBe('Brandon J. Redmond - AI Engineer & Technical Leader')
      
      const canonical = document.querySelector('link[rel="canonical"]')
      expect(canonical).toHaveAttribute('href', 'https://brandon-redmond.dev')
    })

    it('renders page-specific SEO for other pages', () => {
      render(<PageSEO pageKey="about" />)
      
      const canonical = document.querySelector('link[rel="canonical"]')
      expect(canonical).toHaveAttribute('href', 'https://brandon-redmond.dev/about')
    })

    it('allows custom title and description override', () => {
      render(
        <PageSEO 
          pageKey="projects"
          customTitle="Custom Projects Title"
          customDescription="Custom projects description"
        />
      )
      
      expect(document.title).toBe('Custom Projects Title')
      
      const description = document.querySelector('meta[name="description"]')
      expect(description).toHaveAttribute('content', 'Custom projects description')
    })
  })

  describe('Default Values and Fallbacks', () => {
    it('includes default keywords', () => {
      render(<SEOHead />)
      
      const keywords = document.querySelector('meta[name="keywords"]')
      expect(keywords).toHaveAttribute('content', expect.stringContaining('AI Engineer'))
      expect(keywords).toHaveAttribute('content', expect.stringContaining('Brandon Redmond'))
      expect(keywords).toHaveAttribute('content', expect.stringContaining('Agentic Systems'))
    })

    it('uses default OG image when none provided', () => {
      render(<SEOHead />)
      
      const ogImage = document.querySelector('meta[property="og:image"]')
      expect(ogImage).toHaveAttribute('content', 'https://brandon-redmond.dev/images/og-image.svg')
    })

    it('uses custom OG image when provided', () => {
      render(<SEOHead ogImage="/custom-image.jpg" />)
      
      const ogImage = document.querySelector('meta[property="og:image"]')
      expect(ogImage).toHaveAttribute('content', '/custom-image.jpg')
    })
  })
})