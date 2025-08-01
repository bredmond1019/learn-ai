'use client'

import { BlogCardServer } from './BlogCardServer'
import { BlogPostMeta } from '@/lib/mdx'
import { useBlogPagination } from '@/hooks/useBlogPagination'

interface BlogContentDateProps {
  posts: BlogPostMeta[]
  locale: string
  translations: Record<string, any>
}

export function BlogContentDate({ posts, locale, translations }: BlogContentDateProps) {
  const t = (key: string) => translations[key] || key

  // Use pagination hook for date view
  const {
    posts: paginatedPosts,
    monthGroups,
    isLoading,
    hasMore,
    totalCount,
    loadMore,
    error
  } = useBlogPagination(locale, posts)

  return (
    <div className="space-y-12">
      {/* Use monthGroups from pagination */}
      {monthGroups.map(group => (
        <section key={group.monthYear}>
          <h2 className="text-2xl font-bold text-gray-100 mb-6 pb-2 border-b border-gray-700">
            {group.monthYear}
          </h2>
          <div className="flex flex-col gap-6">
            {group.posts.map((post) => (
              <BlogCardServer key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}

      {/* Load More button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('blog.loadMore') || 'Load More Articles'}
          </button>
        </div>
      )}

      {/* Show total count */}
      {!hasMore && paginatedPosts.length > 0 && (
        <div className="text-center py-4 text-gray-400">
          {(t('blog.showingAll') || 'Showing all {{count}} articles').replace('{{count}}', totalCount.toString())}
        </div>
      )}
    </div>
  )
}