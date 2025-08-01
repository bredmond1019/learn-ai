import { NextRequest, NextResponse } from 'next/server'
import { getAllPostsMeta } from '@/lib/mdx.server'
import { BlogPostMeta } from '@/lib/mdx'

interface PaginationParams {
  cursor?: string
  limit?: number
  direction?: 'next' | 'prev'
  locale?: string
}

interface MonthGroup {
  monthYear: string
  posts: BlogPostMeta[]
  startsAt: number
  endsAt: number
}

interface PaginatedResponse {
  posts: BlogPostMeta[]
  pagination: {
    hasMore: boolean
    hasPrevious: boolean
    nextCursor?: string
    prevCursor?: string
    totalCount: number
    currentPage: number
    totalPages: number
  }
  monthGroups: MonthGroup[]
}

function groupPostsByMonth(posts: BlogPostMeta[]): MonthGroup[] {
  const groups: Record<string, { posts: BlogPostMeta[], startsAt: number, endsAt: number }> = {}
  
  posts.forEach((post, index) => {
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
  
  return Object.entries(groups).map(([monthYear, data]) => ({
    monthYear,
    posts: data.posts,
    startsAt: data.startsAt,
    endsAt: data.endsAt
  }))
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cursor = searchParams.get('cursor') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const direction = (searchParams.get('direction') || 'next') as 'next' | 'prev'
    const locale = searchParams.get('locale') || 'en'

    // Get all posts sorted by date (newest first)
    const allPosts = getAllPostsMeta(locale)
    const totalCount = allPosts.length
    const totalPages = Math.ceil(totalCount / limit)

    // Find cursor position if provided
    let startIndex = 0
    if (cursor) {
      const cursorIndex = allPosts.findIndex(post => post.date === cursor)
      if (cursorIndex === -1) {
        // If exact cursor not found, find the closest date
        const cursorDate = new Date(cursor).getTime()
        startIndex = allPosts.findIndex(post => {
          const postDate = new Date(post.date).getTime()
          return direction === 'next' ? postDate < cursorDate : postDate > cursorDate
        })
        if (startIndex === -1) startIndex = direction === 'next' ? totalCount : 0
      } else {
        startIndex = direction === 'next' ? cursorIndex + 1 : Math.max(0, cursorIndex - limit)
      }
    }

    // Calculate page boundaries with month completion logic
    let endIndex = Math.min(startIndex + limit, totalCount)
    let adjustedStartIndex = startIndex
    
    // Check if we're splitting a month at the end
    if (endIndex < totalCount) {
      const lastPostInPage = allPosts[endIndex - 1]
      const nextPost = allPosts[endIndex]
      
      if (lastPostInPage && nextPost) {
        const lastPostDateString = lastPostInPage.date.includes('T') ? lastPostInPage.date : lastPostInPage.date + 'T00:00:00.000Z'
        const nextPostDateString = nextPost.date.includes('T') ? nextPost.date : nextPost.date + 'T00:00:00.000Z'
        const lastPostMonth = new Date(lastPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        const nextPostMonth = new Date(nextPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        
        // If we're splitting a month, include all posts from that month
        if (lastPostMonth === nextPostMonth) {
          while (endIndex < totalCount) {
            const currentPostDateString = allPosts[endIndex].date.includes('T') ? allPosts[endIndex].date : allPosts[endIndex].date + 'T00:00:00.000Z'
            const currentPostMonth = new Date(currentPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
            if (currentPostMonth !== lastPostMonth) break
            endIndex++
          }
        }
      }
    }
    
    // Check if we're splitting a month at the beginning (for previous navigation)
    if (adjustedStartIndex > 0) {
      const firstPostInPage = allPosts[adjustedStartIndex]
      const prevPost = allPosts[adjustedStartIndex - 1]
      
      if (firstPostInPage && prevPost) {
        const firstPostDateString = firstPostInPage.date.includes('T') ? firstPostInPage.date : firstPostInPage.date + 'T00:00:00.000Z'
        const prevPostDateString = prevPost.date.includes('T') ? prevPost.date : prevPost.date + 'T00:00:00.000Z'
        const firstPostMonth = new Date(firstPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        const prevPostMonth = new Date(prevPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        
        // If we're splitting a month, include all posts from that month
        if (firstPostMonth === prevPostMonth) {
          while (adjustedStartIndex > 0) {
            const currentPostDateString = allPosts[adjustedStartIndex - 1].date.includes('T') ? allPosts[adjustedStartIndex - 1].date : allPosts[adjustedStartIndex - 1].date + 'T00:00:00.000Z'
            const currentPostMonth = new Date(currentPostDateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
            if (currentPostMonth !== firstPostMonth) break
            adjustedStartIndex--
          }
        }
      }
    }

    // Get the posts for this page
    const posts = allPosts.slice(adjustedStartIndex, endIndex)
    
    // Generate month groups for the returned posts
    const monthGroups = groupPostsByMonth(posts)
    
    // Calculate pagination metadata
    const hasMore = endIndex < totalCount
    const hasPrevious = adjustedStartIndex > 0
    const currentPage = Math.floor(adjustedStartIndex / limit) + 1
    
    const response: PaginatedResponse = {
      posts,
      pagination: {
        hasMore,
        hasPrevious,
        nextCursor: hasMore ? allPosts[endIndex - 1]?.date : undefined,
        prevCursor: hasPrevious ? allPosts[adjustedStartIndex]?.date : undefined,
        totalCount,
        currentPage,
        totalPages
      },
      monthGroups
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in blog posts API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}