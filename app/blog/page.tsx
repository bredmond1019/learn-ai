import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { Section } from '@/components/Section'
import { BlogCardServer } from '@/components/BlogCardServer'
import { getAllPostsMeta } from '@/lib/content/blog/mdx.server'

export const metadata: Metadata = {
  title: 'Blog | Brandon - AI Engineer',
  description: 'Thoughts on AI engineering, machine learning, and building intelligent systems.',
}

// Define categories and their associated keywords/tags
const categories = {
  'agent-architecture': {
    name: '🤖 Agent Architecture & Memory',
    description: 'Advanced patterns for building stateful, intelligent AI agents',
    keywords: ['agent', 'memory', 'architecture', 'stateful', '12-factor', 'intelligent']
  },
  'mcp-advanced': {
    name: '🔌 Model Context Protocol (MCP)',
    description: 'MCP servers, integrations, and professional implementations',
    keywords: ['mcp', 'model context protocol', 'server', 'integration', 'workflow']
  },
  'business-strategy': {
    name: '💼 Business Strategy & ROI',
    description: 'Strategic insights for executives and business leaders',
    keywords: ['business', 'roi', 'strategy', 'executive', 'enterprise', 'small-medium', 'integration']
  },
  'ai-fundamentals': {
    name: '📚 AI Engineering Fundamentals',
    description: 'Core concepts and practical implementations',
    keywords: ['fundamentals', 'basics', 'prompt engineering', 'ai-powered', 'pure python', 'vector', 'building']
  },
  'production-ops': {
    name: '🚀 Production & MLOps',
    description: 'Deployment, operations, and production systems',
    keywords: ['mlops', 'production', 'deployment', 'knowledge graph', 'documentation', 'operations']
  },
  'ethics-ux': {
    name: '🌍 Ethics, UX & Society',
    description: 'Responsible AI design and societal impact',
    keywords: ['ethics', 'ux', 'society', 'everyday', 'dark patterns', 'responsible', 'design']
  }
}

function categorizePost(post: any) {
  const title = post.title.toLowerCase()
  const tags = post.tags?.map((t: string) => t.toLowerCase()) || []
  const allText = `${title} ${tags.join(' ')}`

  // Check each category and calculate match scores
  const scores: Record<string, number> = {}
  
  Object.entries(categories).forEach(([key, category]) => {
    let score = 0
    category.keywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        score += keyword.length // Longer keywords get higher weight
      }
    })
    scores[key] = score
  })

  // Special case adjustments for better categorization
  if (allText.includes('agent') && (allText.includes('memory') || allText.includes('architecture') || allText.includes('12-factor'))) {
    scores['agent-architecture'] += 20
  }
  
  if (allText.includes('mcp') || allText.includes('model context protocol')) {
    scores['mcp-advanced'] += 30
  }
  
  if (allText.includes('business') || allText.includes('roi') || allText.includes('executive') || allText.includes('enterprise')) {
    scores['business-strategy'] += 25
  }
  
  if (allText.includes('ethics') || allText.includes('ux') || allText.includes('dark pattern') || allText.includes('everyday')) {
    scores['ethics-ux'] += 25
  }

  // Find category with highest score
  let bestCategory = 'ai-fundamentals'
  let highestScore = 0
  
  Object.entries(scores).forEach(([key, score]) => {
    if (score > highestScore) {
      highestScore = score
      bestCategory = key
    }
  })
  
  return bestCategory
}

export default async function BlogPage() {
  const posts = getAllPostsMeta()
  
  // Categorize posts
  const categorizedPosts: Record<string, any[]> = {
    'agent-architecture': [],
    'mcp-advanced': [],
    'business-strategy': [],
    'ai-fundamentals': [],
    'production-ops': [],
    'ethics-ux': []
  }
  
  posts.forEach(post => {
    const category = categorizePost(post)
    categorizedPosts[category].push(post)
  })

  // Find featured posts (those with featured: true in frontmatter)
  const featuredPosts = posts.filter(post => post.featured).slice(0, 3)

  return (
    <div>
      <Section spacing="lg">
        <Container size="lg">
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-300">
              Exploring AI engineering, machine learning, and the future of intelligent systems.
            </p>
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                📝 <strong className="text-gray-300">{posts.length}</strong> articles
              </span>
              <span className="flex items-center gap-2">
                📚 <strong className="text-gray-300">{Object.keys(categories).length}</strong> categories
              </span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                    ⭐ Featured Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPosts.map((post) => (
                      <div key={post.slug} className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30"></div>
                        <div className="relative">
                          <BlogCardServer post={post} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Navigation */}
              <nav className="mb-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Browse by Category
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categories).map(([key, category]) => {
                    const postCount = categorizedPosts[key].length
                    if (postCount === 0) return null
                    
                    return (
                      <a
                        key={key}
                        href={`#${key}`}
                        className="group flex flex-col gap-1 p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-gray-100 group-hover:text-white">
                            {category.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded">
                            {postCount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">
                          {category.description}
                        </p>
                      </a>
                    )
                  })}
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