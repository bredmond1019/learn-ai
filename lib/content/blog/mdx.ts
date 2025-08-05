// Client-safe exports for MDX functionality
// All server-side operations are in mdx.server.ts

// Re-export types that are safe for client use
export type { BlogPost, BlogPostMeta } from '@/lib/types/blog'

// Re-export client-safe utilities
export { formatDate } from '@/lib/utils/date'

// Calculate reading time (approximately 200 words per minute)
export function calculateReadingTime(content: string): number {
  if (!content.trim()) {
    return 0
  }
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

// Generate a slug from a title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}