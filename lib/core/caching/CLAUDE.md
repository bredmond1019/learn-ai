# Cache Management System Documentation

This module provides a high-performance, multi-namespace caching system using an LRU (Least Recently Used) eviction strategy.

## Overview

The cache manager provides:
- Multiple isolated cache namespaces
- LRU eviction with configurable size
- TTL (Time To Live) support
- Lazy initialization
- TypeScript generics for type safety
- Cached loader pattern

## Core Components

### `cache-manager.ts`
Central cache management system with pre-configured namespaces.

**Pre-configured Caches:**
```typescript
// Blog content cache
export const blogCache = createCache<any>('blog', {
  max: 100,
  ttl: 1000 * 60 * 60 // 1 hour
})

// Learning modules cache  
export const modulesCache = createCache<Module>('modules', {
  max: 50,
  ttl: 1000 * 60 * 30 // 30 minutes
})

// Projects cache
export const projectsCache = createCache<Project[]>('projects', {
  max: 20,
  ttl: 1000 * 60 * 60 // 1 hour
})

// MDX compilation cache
export const mdxCache = createCache<any>('mdx', {
  max: 200,
  ttl: 1000 * 60 * 60 * 24 // 24 hours
})

// API response cache
export const apiCache = createCache<any>('api', {
  max: 100,
  ttl: 1000 * 60 // 1 minute
})
```

### Cache Configuration

```typescript
interface CacheOptions {
  max: number    // Maximum entries (LRU eviction)
  ttl?: number   // Time to live in milliseconds
}
```

## Usage Patterns

### Basic Cache Operations

```typescript
import { blogCache } from '@/lib/core/caching/cache-manager'

// Set value
await blogCache.set('post:my-slug', postData)

// Get value
const post = await blogCache.get('post:my-slug')

// Delete value
await blogCache.delete('post:my-slug')

// Clear namespace
await blogCache.clear()

// Get cache stats
const stats = blogCache.getStats()
```

### Cached Loader Pattern

```typescript
import { createCachedLoader } from '@/lib/core/caching/cache-manager'

// Create a cached version of any async function
const cachedFetch = createCachedLoader(
  blogCache,
  async (slug: string) => {
    // Expensive operation
    return await fetchBlogPost(slug)
  },
  (slug) => `post:${slug}` // Cache key generator
)

// Use it - automatically caches
const post = await cachedFetch('my-post')
```

### Cache Key Patterns

```typescript
export const cacheKeys = {
  blog: {
    post: (slug: string, locale?: string) => 
      locale ? `post:${slug}:${locale}` : `post:${slug}`,
    list: (locale?: string) => 
      locale ? `posts:${locale}` : 'posts',
    tags: (locale?: string) => 
      locale ? `tags:${locale}` : 'tags'
  },
  modules: {
    module: (pathSlug: string, moduleId: string) => 
      `${pathSlug}:${moduleId}`,
    path: (pathSlug: string) => 
      `path:${pathSlug}`,
    list: () => 'paths:all'
  },
  projects: {
    all: (locale?: string) => 
      locale ? `all:${locale}` : 'all',
    single: (slug: string, locale?: string) => 
      locale ? `${slug}:${locale}` : slug,
    category: (category: string, locale?: string) => 
      locale ? `cat:${category}:${locale}` : `cat:${category}`
  }
}
```

## Implementation Details

### LRU Algorithm
The cache uses the `lru-cache` package which implements:
- O(1) get operations
- O(1) set operations  
- Automatic eviction of least recently used items
- Efficient memory usage

### TTL Management
- Items expire based on creation time
- Expired items are lazily removed on access
- No background timers for efficiency

### Type Safety
```typescript
// Type-safe cache creation
const userCache = createCache<User>('users', { max: 1000 })

// TypeScript knows the type
const user = await userCache.get('user:123') // user is User | null
```

## Performance Optimization

### Cache Warming
```typescript
// Pre-populate cache during startup
async function warmCache() {
  const posts = await fetchAllPosts()
  for (const post of posts) {
    await blogCache.set(
      cacheKeys.blog.post(post.slug),
      post
    )
  }
}
```

### Batch Operations
```typescript
// Efficient batch loading
async function loadPosts(slugs: string[]) {
  const results = []
  const missing = []
  
  // Check cache first
  for (const slug of slugs) {
    const cached = await blogCache.get(slug)
    if (cached) {
      results.push(cached)
    } else {
      missing.push(slug)
    }
  }
  
  // Fetch missing in batch
  if (missing.length > 0) {
    const fetched = await fetchPosts(missing)
    for (const post of fetched) {
      await blogCache.set(post.slug, post)
      results.push(post)
    }
  }
  
  return results
}
```

### Cache Invalidation

```typescript
// Invalidate related entries
async function invalidatePost(slug: string) {
  // Clear specific post
  await blogCache.delete(cacheKeys.blog.post(slug))
  
  // Clear post lists
  await blogCache.delete(cacheKeys.blog.list())
  await blogCache.delete(cacheKeys.blog.list('pt-BR'))
  
  // Clear tag aggregations
  await blogCache.delete(cacheKeys.blog.tags())
}
```

## Monitoring & Debugging

### Cache Statistics
```typescript
const stats = blogCache.getStats()
console.log({
  size: stats.size,
  hits: stats.hits,
  misses: stats.misses,
  hitRate: (stats.hits / (stats.hits + stats.misses)) * 100
})
```

### Debug Logging
```typescript
// Enable debug mode
if (process.env.NODE_ENV === 'development') {
  blogCache.on('set', (key) => console.log(`Cache SET: ${key}`))
  blogCache.on('get', (key, found) => console.log(`Cache GET: ${key} (${found ? 'HIT' : 'MISS'})`))
}
```

## Best Practices

### 1. Consistent Key Naming
Always use the `cacheKeys` helpers for consistent naming:
```typescript
// Good
const key = cacheKeys.blog.post(slug, locale)

// Bad
const key = `post_${slug}_${locale}`
```

### 2. Appropriate TTLs
- Static content: 24 hours
- Dynamic content: 1-60 minutes
- User-specific: 5-15 minutes
- Real-time data: Don't cache

### 3. Cache Boundaries
- Cache at service boundaries
- Don't cache across user contexts
- Consider cache invalidation needs

### 4. Error Handling
```typescript
try {
  const cached = await cache.get(key)
  if (cached) return cached
  
  const fresh = await fetchData()
  await cache.set(key, fresh)
  return fresh
} catch (error) {
  // Always fallback to fresh data on cache errors
  return await fetchData()
}
```

## Testing Caches

### Unit Testing
```typescript
// Mock cache in tests
jest.mock('@/lib/core/caching/cache-manager', () => ({
  blogCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  }
}))
```

### Integration Testing
```typescript
// Test with real cache
beforeEach(async () => {
  await blogCache.clear()
})

test('caches blog post', async () => {
  const post = { slug: 'test', title: 'Test' }
  await blogCache.set('test', post)
  
  const cached = await blogCache.get('test')
  expect(cached).toEqual(post)
})
```

## Common Patterns

### Read-Through Cache
```typescript
async function getPost(slug: string) {
  return createCachedLoader(
    blogCache,
    () => database.getPost(slug),
    () => `post:${slug}`
  )()
}
```

### Write-Through Cache
```typescript
async function updatePost(slug: string, data: PostData) {
  const updated = await database.updatePost(slug, data)
  await blogCache.set(`post:${slug}`, updated)
  await blogCache.delete('posts:all') // Invalidate lists
  return updated
}
```

### Cache-Aside Pattern
```typescript
async function getPostCacheAside(slug: string) {
  // Check cache
  const cached = await blogCache.get(`post:${slug}`)
  if (cached) return cached
  
  // Load from source
  const post = await database.getPost(slug)
  
  // Update cache
  if (post) {
    await blogCache.set(`post:${slug}`, post)
  }
  
  return post
}
```