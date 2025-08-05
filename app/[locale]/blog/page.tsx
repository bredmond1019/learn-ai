import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { Section } from '@/components/Section'
import { BlogContent } from '@/components/BlogContent'
import { getAllPostsMeta } from '@/lib/content/blog/mdx.server'
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


export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllPostsMeta(locale)
  const t = createTranslator(locale as any)

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
                📝 <strong className="text-gray-300">{posts.length}</strong> {t('blog.articlesCount')}
              </span>
              <span className="flex items-center gap-2">
                📚 <strong className="text-gray-300">{Object.keys(categories).length}</strong> {t('blog.categoriesCount')}
              </span>
            </div>
          </div>

          <BlogContent 
            posts={posts}
            categories={categories}
            featuredPosts={featuredPosts}
            locale={locale}
            translations={{
              'blog.viewFilter': t('blog.viewFilter'),
              'blog.filterByCategory': t('blog.filterByCategory'),
              'blog.filterByDate': t('blog.filterByDate'),
              'blog.noResults': t('blog.noResults'),
              'blog.featuredArticles': t('blog.featuredArticles'),
              'blog.browseByCategory': t('blog.browseByCategory'),
              'blog.loadMore': t('blog.loadMore'),
              'blog.showingAll': t('blog.showingAll'),
            }}
          />
        </Container>
      </Section>
    </div>
  )
}