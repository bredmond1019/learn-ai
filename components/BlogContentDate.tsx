'use client'

import { BlogCardServer } from './BlogCardServer'
import { BlogPostMeta } from '@/lib/mdx'
import { useBlogPagination } from '@/hooks/useBlogPagination'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

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

  // Use infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    rootMargin: '400px', // Start loading 400px before reaching the sentinel
  })

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

      {/* Infinite scroll sentinel - placed before loading indicator to ensure visibility */}
      {hasMore && (
        <div 
          ref={sentinelRef} 
          className="h-20 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Visual indicator for debugging - remove in production */}
          <span className="text-xs text-gray-500">
            {isLoading ? 'Loading more posts...' : 'Scroll here to load more'}
          </span>
        </div>
      )}

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

      {/* Load More button - kept as fallback for users who prefer manual control */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
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