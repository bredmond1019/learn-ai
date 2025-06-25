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

// Get blog directory
function getBlogDirectory(): string {
  return path.join(CONTENT_BASE, 'blog', 'published')
}

// Ensure blog directory exists
export function ensureBlogDirectory() {
  const dir = getBlogDirectory()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Get all blog post slugs
export function getAllPostSlugs(): string[] {
  ensureBlogDirectory()
  
  const dir = getBlogDirectory()
  
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

// Get a single blog post by slug
const getPostBySlugUncached = (slug: string): BlogPost | null => {
  try {
    const dir = getBlogDirectory()
    const fullPath = path.join(dir, `${slug}.mdx`)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
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

// Cached version with synchronous wrapper
export function getPostBySlug(slug: string): BlogPost | null {
  const cacheKey = cacheKeys.blog.post(slug);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const post = getPostBySlugUncached(slug);
  
  if (post) {
    blogCache.set(cacheKey, post);
  }
  
  return post;
}

// Get all blog posts sorted by date (newest first)
export function getAllPosts(): BlogPost[] {
  const cacheKey = cacheKeys.blog.allPosts();
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const slugs = getAllPostSlugs()
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  blogCache.set(cacheKey, posts);
  return posts
}

// Get blog post metadata only (for listing pages)
export function getAllPostsMeta(): BlogPostMeta[] {
  const cacheKey = cacheKeys.blog.postsMeta();
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const meta = getAllPosts().map((post) => ({
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

// Get recent posts (for homepage preview)
export function getRecentPosts(limit: number = 3): BlogPostMeta[] {
  const cacheKey = cacheKeys.blog.recentPosts(limit);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const recent = getAllPostsMeta().slice(0, limit);
  blogCache.set(cacheKey, recent);
  return recent;
}

// Get posts by tag
export function getPostsByTag(tag: string): BlogPost[] {
  const cacheKey = cacheKeys.blog.postsByTag(tag);
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const posts = getAllPosts().filter(post => 
    post.tags?.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
  
  blogCache.set(cacheKey, posts);
  return posts;
}

// Get all unique tags
export function getAllTags(): string[] {
  const cacheKey = cacheKeys.blog.allTags();
  const cached = blogCache.get(cacheKey);
  
  if (cached !== null) {
    return cached;
  }
  
  const posts = getAllPosts()
  const tagSet = new Set<string>()
  
  posts.forEach(post => {
    post.tags?.forEach(tag => tagSet.add(tag))
  })
  
  const tags = Array.from(tagSet).sort();
  blogCache.set(cacheKey, tags);
  return tags;
}