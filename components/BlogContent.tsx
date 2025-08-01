'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { BlogCardServer } from './BlogCardServer'
import { BlogContentDate } from './BlogContentDate'
import { BlogPostMeta } from '@/lib/mdx'

type FilterType = 'category' | 'date'

interface BlogContentProps {
  posts: BlogPostMeta[]
  categories: Record<string, any>
  featuredPosts: BlogPostMeta[]
  locale: string
  translations: Record<string, any>
}


// Categorize post function (extracted from page.tsx)
function categorizePost(post: BlogPostMeta, categories: Record<string, any>) {
  const title = post.title.toLowerCase()
  const tags = post.tags?.map((t: string) => t.toLowerCase()) || []
  const allText = `${title} ${tags.join(' ')}`

  // Check each category and calculate match scores
  const scores: Record<string, number> = {}
  
  Object.entries(categories).forEach(([key, category]) => {
    let score = 0
    category.keywords.forEach((keyword: string) => {
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

export function BlogContent({ posts, categories, featuredPosts, locale, translations }: BlogContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get filter type from URL, default to 'category'
  const filterFromUrl = searchParams.get('filter') as FilterType | null
  const [filterType, setFilterType] = useState<FilterType>(filterFromUrl || 'category')
  
  const t = (key: string) => translations[key] || key
  
  // Update URL when filter changes
  const updateFilter = (newFilter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', newFilter)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setFilterType(newFilter)
  }
  
  // Sync state with URL changes
  useEffect(() => {
    const urlFilter = searchParams.get('filter') as FilterType | null
    if (urlFilter && (urlFilter === 'category' || urlFilter === 'date')) {
      setFilterType(urlFilter)
    }
  }, [searchParams])

  // Categorize posts for category view
  const categorizedPosts: Record<string, BlogPostMeta[]> = {
    'agent-architecture': [],
    'mcp-advanced': [],
    'business-strategy': [],
    'ai-fundamentals': [],
    'production-ops': [],
    'ethics-ux': []
  }
  
  posts.forEach(post => {
    const category = categorizePost(post, categories)
    categorizedPosts[category].push(post)
  })

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-8 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-400">{t('blog.viewFilter')}:</span>
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter('category')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('blog.filterByCategory')}
          </button>
          <button
            onClick={() => updateFilter('date')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('blog.filterByDate')}
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('blog.noResults')}</p>
        </div>
      ) : (
        <>
          {/* Featured Posts (shown in both views) */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                ⭐ {t('blog.featuredArticles')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <div key={post.slug} className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 h-full"></div>
                    <div className="relative h-full">
                      <BlogCardServer post={post} locale={locale} filter={filterType} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Category View */}
          {filterType === 'category' && (
            <>
              {/* Quick Navigation */}
              <nav className="mb-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {t('blog.browseByCategory')}
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

              {/* Blog Post Sections by Category */}
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
                          <BlogCardServer key={post.slug} post={post} locale={locale} filter={filterType} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </>
          )}

          {/* Date View */}
          {filterType === 'date' && (
            <BlogContentDate 
              posts={posts}
              locale={locale}
              translations={translations}
            />
          )}
        </>
      )}
    </>
  )
}