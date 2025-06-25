import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import { BlogPost, BlogPostMeta } from './types/blog'
import { calculateReadingTime } from './mdx'
import { blogCache, cacheKeys, createCachedLoader } from './cache-manager'

// Type declaration for gray-matter since @types/gray-matter doesn't exist
declare module 'gray-matter'

const CONTENT_BASE = path.join(process.cwd(), 'content')

// Get blog directory with locale support
function getBlogDirectory(locale?: string): string {
  const basePath = path.join(CONTENT_BASE, 'blog', 'published')
  if (locale && locale !== 'en') {
    return path.join(basePath, locale)
  }
  return basePath
}

// Ensure blog directory exists
export function ensureBlogDirectory(locale?: string) {
  const dir = getBlogDirectory(locale)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Get all blog post slugs with locale support
export function getAllPostSlugs(locale?: string): string[] {
  ensureBlogDirectory(locale)
  
  const dir = getBlogDirectory(locale)
  
  try {
    const files = fs.readdirSync(dir)
    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''))
  } catch (error) {
    console.error('Error reading blog directory:', error)
    return []
  }
}

// Get a single blog post by slug with locale support
const getPostBySlugUncached = (slug: string, locale?: string): BlogPost | null => {
  try {
    const dir = getBlogDirectory(locale)
    const fullPath = path.join(dir, `${slug}.mdx`)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      // If locale version doesn't exist, try fallback to English
      if (locale && locale !== 'en') {
        return getPostBySlugUncached(slug, 'en')
      }
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Validate required frontmatter
    if (!data.title || !data.date || !data.excerpt) {
      console.error(`Missing required frontmatter in ${slug}.mdx`)
      return null
    }
    
    const readingTime = calculateReadingTime(content)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      content,
      readingTime,
      tags: data.tags || [],
      author: data.author || 'Brandon'
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

// Cached version with synchronous wrapper and locale support
export function getPostBySlug(slug: string, locale?: string): BlogPost | null {
  const cacheKey = cacheKeys.blog.post(`${slug}-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const post = getPostBySlugUncached(slug, locale);
  
  if (post) {
    blogCache.set(cacheKey, post);
  }
  
  return post;
}

// Get all blog posts sorted by date (newest first) with locale support
export function getAllPosts(locale?: string): BlogPost[] {
  const cacheKey = cacheKeys.blog.allPosts(`-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const slugs = getAllPostSlugs(locale)
  const posts = slugs
    .map(slug => getPostBySlug(slug, locale))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  blogCache.set(cacheKey, posts);
  return posts
}

// Get blog post metadata only (for listing pages) with locale support
export function getAllPostsMeta(locale?: string): BlogPostMeta[] {
  const cacheKey = cacheKeys.blog.postsMeta(`-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const meta = getAllPosts(locale).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    readingTime: post.readingTime,
    tags: post.tags,
    author: post.author
  }));
  
  blogCache.set(cacheKey, meta);
  return meta;
}

// Get recent posts (for homepage preview) with locale support
export function getRecentPosts(limit: number = 3, locale?: string): BlogPostMeta[] {
  const cacheKey = cacheKeys.blog.recentPosts(`${limit}-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const recent = getAllPostsMeta(locale).slice(0, limit);
  blogCache.set(cacheKey, recent);
  return recent;
}

// Get posts by tag with locale support
export function getPostsByTag(tag: string, locale?: string): BlogPost[] {
  const cacheKey = cacheKeys.blog.postsByTag(`${tag}-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const posts = getAllPosts(locale).filter(post => 
    post.tags?.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
  
  blogCache.set(cacheKey, posts);
  return posts;
}

// Get all unique tags with locale support
export function getAllTags(locale?: string): string[] {
  const cacheKey = cacheKeys.blog.allTags(`-${locale || 'en'}`);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const posts = getAllPosts(locale)
  const tagSet = new Set<string>()
  
  posts.forEach(post => {
    post.tags?.forEach(tag => tagSet.add(tag))
  })
  
  const tags = Array.from(tagSet).sort();
  blogCache.set(cacheKey, tags);
  return tags;
}