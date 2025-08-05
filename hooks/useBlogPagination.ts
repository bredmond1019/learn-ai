'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { BlogPostMeta } from '@/lib/content/blog/mdx'

interface MonthGroup {
  monthYear: string
  posts: BlogPostMeta[]
  startsAt: number
  endsAt: number
}

interface PaginationState {
  posts: BlogPostMeta[]
  monthGroups: MonthGroup[]
  isLoading: boolean
  hasMore: boolean
  hasPrevious: boolean
  nextCursor?: string
  prevCursor?: string
  currentPage: number
  totalPages: number
  totalCount: number
  error?: string
}

export function useBlogPagination(locale: string, initialPosts: BlogPostMeta[] = []) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get cursor from URL
  const cursor = searchParams.get('cursor') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  
  const [state, setState] = useState<PaginationState>(() => {
    // Initialize with first 10 posts if no cursor
    const initialSlice = cursor ? [] : initialPosts.slice(0, 10)
    
    // Group initial posts by month
    const groups: Record<string, { posts: BlogPostMeta[], startsAt: number, endsAt: number }> = {}
    initialSlice.forEach((post, index) => {
      // Handle date-only strings by adding UTC time to prevent timezone shifts
      const dateString = post.date.includes('T') ? post.date : post.date + 'T00:00:00.000Z'
      const date = new Date(dateString)
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      
      if (!groups[monthYear]) {
        groups[monthYear] = { posts: [], startsAt: index, endsAt: index }
      }
      groups[monthYear].posts.push(post)
      groups[monthYear].endsAt = index
    })
    
    const monthGroups = Object.entries(groups).map(([monthYear, data]) => ({
      monthYear,
      posts: data.posts,
      startsAt: data.startsAt,
      endsAt: data.endsAt
    }))
    
    return {
      posts: initialSlice,
      monthGroups,
      isLoading: false,
      hasMore: initialPosts.length > 10,
      hasPrevious: false,
      currentPage: 1,
      totalPages: Math.ceil(initialPosts.length / 10),
      totalCount: initialPosts.length,
    }
  })

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (
    cursor?: string,
    direction: 'next' | 'prev' = 'next',
    replace = false
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const params = new URLSearchParams({
        locale,
        limit: '10',
        direction,
        ...(cursor && { cursor })
      })

      const response = await fetch(`/api/blog/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()

      setState(prev => {
        // If replacing, use new data directly
        if (replace) {
          return {
            ...prev,
            posts: data.posts,
            monthGroups: data.monthGroups,
            hasMore: data.pagination.hasMore,
            hasPrevious: data.pagination.hasPrevious,
            nextCursor: data.pagination.nextCursor,
            prevCursor: data.pagination.prevCursor,
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            totalCount: data.pagination.totalCount,
            isLoading: false,
          }
        }

        // Otherwise, merge posts and month groups
        const allPosts = [...prev.posts, ...data.posts]
        
        // Deduplicate posts by slug to avoid React key warnings
        const uniquePostsMap = new Map<string, BlogPostMeta>()
        allPosts.forEach(post => {
          uniquePostsMap.set(post.slug, post)
        })
        const uniquePosts = Array.from(uniquePostsMap.values())
        
        // Sort by date descending to maintain order
        uniquePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        // Rebuild month groups from unique posts
        const groups: Record<string, { posts: BlogPostMeta[], startsAt: number, endsAt: number }> = {}
        uniquePosts.forEach((post, index) => {
          // Handle date-only strings by adding UTC time to prevent timezone shifts
          const dateString = post.date.includes('T') ? post.date : post.date + 'T00:00:00.000Z'
          const date = new Date(dateString)
          const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
          
          if (!groups[monthYear]) {
            groups[monthYear] = { posts: [], startsAt: index, endsAt: index }
          }
          groups[monthYear].posts.push(post)
          groups[monthYear].endsAt = index
        })
        
        const mergedMonthGroups = Object.entries(groups).map(([monthYear, data]) => ({
          monthYear,
          posts: data.posts,
          startsAt: data.startsAt,
          endsAt: data.endsAt
        }))

        return {
          ...prev,
          posts: uniquePosts,
          monthGroups: mergedMonthGroups,
          hasMore: data.pagination.hasMore,
          hasPrevious: data.pagination.hasPrevious,
          nextCursor: data.pagination.nextCursor,
          prevCursor: data.pagination.prevCursor,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalCount: data.pagination.totalCount,
          isLoading: false,
        }
      })

      // Update URL with new cursor
      const newParams = new URLSearchParams(searchParams.toString())
      if (data.pagination.nextCursor) {
        newParams.set('cursor', data.pagination.nextCursor)
        newParams.set('page', data.pagination.currentPage.toString())
      } else {
        newParams.delete('cursor')
      }

      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load posts'
      }))
    }
  }, [locale, pathname, router, searchParams])

  // Load more posts (next page)
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      fetchPosts(state.nextCursor, 'next', false)
    }
  }, [state.hasMore, state.isLoading, state.nextCursor, fetchPosts])

  // Load previous posts
  const loadPrevious = useCallback(() => {
    if (state.hasPrevious && !state.isLoading) {
      fetchPosts(state.prevCursor, 'prev', true)
    }
  }, [state.hasPrevious, state.isLoading, state.prevCursor, fetchPosts])

  // Reset pagination
  const reset = useCallback(() => {
    // Only update URL if there are actually pagination params to remove
    if (searchParams.has('cursor') || searchParams.has('page')) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('cursor')
      newParams.delete('page')
      router.replace(`${pathname}?${newParams.toString()}`)
    }
    
    // Reset to initial state with first 10 posts
    const initialSlice = initialPosts.slice(0, 10)
    
    // Group initial posts by month
    const groups: Record<string, { posts: BlogPostMeta[], startsAt: number, endsAt: number }> = {}
    initialSlice.forEach((post, index) => {
      // Handle date-only strings by adding UTC time to prevent timezone shifts
      const dateString = post.date.includes('T') ? post.date : post.date + 'T00:00:00.000Z'
      const date = new Date(dateString)
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      
      if (!groups[monthYear]) {
        groups[monthYear] = { posts: [], startsAt: index, endsAt: index }
      }
      groups[monthYear].posts.push(post)
      groups[monthYear].endsAt = index
    })
    
    const monthGroups = Object.entries(groups).map(([monthYear, data]) => ({
      monthYear,
      posts: data.posts,
      startsAt: data.startsAt,
      endsAt: data.endsAt
    }))
    
    setState({
      posts: initialSlice,
      monthGroups,
      isLoading: false,
      hasMore: initialPosts.length > 10,
      hasPrevious: false,
      currentPage: 1,
      totalPages: Math.ceil(initialPosts.length / 10),
      totalCount: initialPosts.length,
    })
  }, [initialPosts, pathname, router, searchParams])

  // Load initial data if cursor is present in URL
  useEffect(() => {
    if (cursor && state.posts.length === 0 && initialPosts.length > 0) {
      fetchPosts(cursor, 'next', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]) // Only re-run if cursor changes

  return {
    posts: state.posts,
    monthGroups: state.monthGroups,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    hasPrevious: state.hasPrevious,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    error: state.error,
    loadMore,
    loadPrevious,
    reset,
  }
}