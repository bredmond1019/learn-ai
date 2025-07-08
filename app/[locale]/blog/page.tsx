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
  'agent-architecture': {
    name: '🤖 Agent Architecture & Memory',
    nameTranslations: {
      'pt-BR': '🤖 Arquitetura de Agentes e Memória'
    },
    description: 'Advanced patterns for building stateful, intelligent AI agents',
    descriptionTranslations: {
      'pt-BR': 'Padrões avançados para construir agentes de IA inteligentes e com estado'
    },
    keywords: ['agent', 'memory', 'architecture', 'stateful', '12-factor', 'intelligent',
               // Portuguese keywords
               'agente', 'agentes', 'memória', 'arquitetura', 'estado', 'stateful', '12-fatores', 'inteligente', 'inteligentes']
  },
  'mcp-advanced': {
    name: '🔌 Model Context Protocol (MCP)',
    nameTranslations: {
      'pt-BR': '🔌 Protocolo de Contexto de Modelo (MCP)'
    },
    description: 'MCP servers, integrations, and professional implementations',
    descriptionTranslations: {
      'pt-BR': 'Servidores MCP, integrações e implementações profissionais'
    },
    keywords: ['mcp', 'model context protocol', 'server', 'integration', 'workflow',
               // Portuguese keywords
               'protocolo de contexto de modelo', 'servidor', 'servidores', 'integração', 'fluxo de trabalho', 'sistema de workflow']
  },
  'business-strategy': {
    name: '💼 Business Strategy & ROI',
    nameTranslations: {
      'pt-BR': '💼 Estratégia de Negócios e ROI'
    },
    description: 'Strategic insights for executives and business leaders',
    descriptionTranslations: {
      'pt-BR': 'Insights estratégicos para executivos e líderes empresariais'
    },
    keywords: ['business', 'roi', 'strategy', 'executive', 'enterprise', 'small-medium', 'integration',
               // Portuguese keywords
               'negócio', 'negócios', 'estratégia', 'executivo', 'empresarial', 'empresa', 'pequeno', 'médio', 'pme', 'integração', 'transformando', 'futuro', 'importantes', 'carreira']
  },
  'ai-fundamentals': {
    name: '📚 AI Engineering Fundamentals',
    nameTranslations: {
      'pt-BR': '📚 Fundamentos de Engenharia de IA'
    },
    description: 'Core concepts and practical implementations',
    descriptionTranslations: {
      'pt-BR': 'Conceitos fundamentais e implementações práticas'
    },
    keywords: ['fundamentals', 'basics', 'prompt engineering', 'ai-powered', 'pure python', 'vector', 'building',
               // Portuguese keywords
               'fundamentos', 'básico', 'engenharia de prompts', 'python puro', 'vetor', 'vetorial', 'vetoriais', 'construindo', 'aplicações', 'guia prático']
  },
  'production-ops': {
    name: '🚀 Production & MLOps',
    nameTranslations: {
      'pt-BR': '🚀 Produção e MLOps'
    },
    description: 'Deployment, operations, and production systems',
    descriptionTranslations: {
      'pt-BR': 'Implantação, operações e sistemas de produção'
    },
    keywords: ['mlops', 'production', 'deployment', 'knowledge graph', 'documentation', 'operations',
               // Portuguese keywords
               'produção', 'implantação', 'implantando', 'grafo de conhecimento', 'grafos de conhecimento', 'documentação', 'operações', 'escala']
  },
  'ethics-ux': {
    name: '🌍 Ethics, UX & Society',
    nameTranslations: {
      'pt-BR': '🌍 Ética, UX e Sociedade'
    },
    description: 'Responsible AI design and societal impact',
    descriptionTranslations: {
      'pt-BR': 'Design responsável de IA e impacto social'
    },
    keywords: ['ethics', 'ux', 'society', 'everyday', 'dark patterns', 'responsible', 'design',
               // Portuguese keywords
               'ética', 'dia a dia', 'dia', 'rotina', 'padrões escuros', 'responsável', 'responsáveis', 'design', 'sociedade', 'social']
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

  // Special case adjustments for better categorization (including Portuguese)
  if ((allText.includes('agent') || allText.includes('agente')) && 
      (allText.includes('memory') || allText.includes('memória') || 
       allText.includes('architecture') || allText.includes('arquitetura') || 
       allText.includes('12-factor') || allText.includes('12-fatores'))) {
    scores['agent-architecture'] += 20
  }
  
  if (allText.includes('mcp') || allText.includes('model context protocol') || 
      allText.includes('protocolo de contexto de modelo')) {
    scores['mcp-advanced'] += 30
  }
  
  if (allText.includes('business') || allText.includes('negócio') || allText.includes('negócios') ||
      allText.includes('roi') || allText.includes('executive') || allText.includes('executivo') ||
      allText.includes('enterprise') || allText.includes('empresarial') || allText.includes('empresa')) {
    scores['business-strategy'] += 25
  }
  
  if (allText.includes('ethics') || allText.includes('ética') || 
      allText.includes('ux') || allText.includes('dark pattern') || allText.includes('padrões escuros') ||
      allText.includes('everyday') || allText.includes('dia a dia') || allText.includes('dia')) {
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

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllPostsMeta(locale)
  const t = createTranslator(locale as any)
  
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

  // Find featured posts (same articles featured on home page)
  const featuredSlugs = ['ai-for-everyday-person', 'ai-for-small-medium-business', 'why-ai-engineers-matter']
  const featuredPosts = featuredSlugs
    .map(slug => posts.find(post => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => post !== undefined) // Type guard to ensure no undefined values

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
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                📝 <strong className="text-gray-300">{posts.length}</strong> {locale === 'pt-BR' ? t('blog.articlesCount') : 'articles'}
              </span>
              <span className="flex items-center gap-2">
                📚 <strong className="text-gray-300">{Object.keys(categories).length}</strong> {locale === 'pt-BR' ? t('blog.categoriesCount') : 'categories'}
              </span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('blog.noResults')}</p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                    ⭐ {locale === 'pt-BR' ? t('blog.featuredArticles') : 'Featured Articles'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPosts.map((post) => (
                      <div key={post.slug} className="relative h-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 h-full"></div>
                        <div className="relative h-full">
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
                  {locale === 'pt-BR' ? t('blog.browseByCategory') : 'Browse by Category'}
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
                            {locale === 'pt-BR' && category.nameTranslations?.['pt-BR'] 
                              ? category.nameTranslations['pt-BR'] 
                              : category.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded">
                            {postCount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">
                          {locale === 'pt-BR' && category.descriptionTranslations?.['pt-BR'] 
                            ? category.descriptionTranslations['pt-BR'] 
                            : category.description}
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
                          {locale === 'pt-BR' && category.nameTranslations?.['pt-BR'] 
                            ? category.nameTranslations['pt-BR'] 
                            : category.name}
                        </h2>
                        <p className="text-lg text-gray-400">
                          {locale === 'pt-BR' && category.descriptionTranslations?.['pt-BR'] 
                            ? category.descriptionTranslations['pt-BR'] 
                            : category.description}
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