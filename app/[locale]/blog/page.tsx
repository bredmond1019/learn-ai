import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { Section } from '@/components/Section'
import { BlogCardServer } from '@/components/BlogCardServer'
import { getAllPostsMeta } from '@/lib/mdx.server'
import { createTranslator } from '@/lib/translations'

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = createTranslator(locale as any)
  
  return {
    title: `${t('blog.title')} | ${t('meta.title')}`,
    description: t('blog.subtitle'),
  }
}

// Define categories and their associated keywords/tags
const categories = {
  'mcp-advanced': {
    name: 'Model Context Protocol (MCP)',
    description: 'Advanced MCP implementations, architectures, and use cases',
    keywords: ['mcp', 'model context protocol', 'agentic ai', 'distributed', 'workflow']
  },
  'ai-fundamentals': {
    name: 'AI Engineering Fundamentals',
    description: 'Core concepts and practices for building AI systems',
    keywords: ['fundamentals', 'basics', 'prompt engineering', 'ai-powered applications', 'pure python']
  },
  'production-ops': {
    name: 'Production & Operations',
    description: 'Deployment, MLOps, and operational aspects of AI systems',
    keywords: ['mlops', 'production', 'deployment', 'knowledge graph', 'documentation']
  }
}

function categorizePost(post: any) {
  const title = post.title.toLowerCase()
  const tags = post.tags?.map((t: string) => t.toLowerCase()) || []
  const allText = `${title} ${tags.join(' ')}`

  // Check for MCP category
  if (allText.includes('mcp') || allText.includes('model context protocol')) {
    return 'mcp-advanced'
  }
  
  // Check for Production/Operations
  if (allText.includes('mlops') || allText.includes('production') || 
      allText.includes('knowledge graph') || allText.includes('documentation')) {
    return 'production-ops'
  }
  
  // Default to fundamentals
  return 'ai-fundamentals'
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllPostsMeta(locale)
  const t = createTranslator(locale as any)
  
  // Categorize posts
  const categorizedPosts: Record<string, any[]> = {
    'mcp-advanced': [],
    'ai-fundamentals': [],
    'production-ops': []
  }
  
  posts.forEach(post => {
    const category = categorizePost(post)
    categorizedPosts[category].push(post)
  })

  return (
    <div>
      <Section spacing="lg">
        <Container size="lg">
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-gray-300">
              {t('blog.subtitle')}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('blog.noResults')}</p>
            </div>
          ) : (
            <>
              {/* Quick Navigation */}
              <nav className="mb-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Jump to Section
                </h2>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(categories).map(([key, category]) => (
                    <a
                      key={key}
                      href={`#${key}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="text-gray-100">{category.name}</span>
                      <span className="text-sm text-gray-400">
                        ({categorizedPosts[key].length})
                      </span>
                    </a>
                  ))}
                </div>
              </nav>

              {/* Blog Post Sections */}
              <div className="space-y-16">
                {Object.entries(categories).map(([key, category]) => {
                  const postsInCategory = categorizedPosts[key]
                  if (postsInCategory.length === 0) return null

                  return (
                    <section key={key} id={key} className="scroll-mt-20">
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-100 mb-3">
                          {category.name}
                        </h2>
                        <p className="text-lg text-gray-400">
                          {category.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {postsInCategory.map((post) => (
                          <BlogCardServer key={post.slug} post={post} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  )
}