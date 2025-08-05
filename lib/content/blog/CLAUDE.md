# Blog Content System Documentation

This directory handles all blog post processing, including MDX compilation, metadata extraction, and server-side rendering.

## Core Components

### `mdx.server.ts`
Server-side blog post processing and retrieval.

**Key Functions:**
- `getPostBySlug()` - Fetch single post with content
- `getAllPosts()` - Get all published posts
- `getAllPostsMeta()` - Get metadata without content (performance)
- `getPostsByTag()` - Filter posts by tag

**Features:**
- Locale-based content retrieval
- Automatic fallback to English
- Metadata extraction
- Cache integration

### `mdx-parser.server.ts`
MDX content compilation for server-side rendering.

**Key Functions:**
- `parseMDXContent()` - Compile MDX to React components
- `validateMDXContent()` - Syntax validation
- `extractSections()` - Parse content sections

**MDX Processing:**
```typescript
// Remark plugins
- remarkGfm          // GitHub Flavored Markdown
- remarkMath         // Math notation support

// Rehype plugins  
- rehypeHighlight    // Code syntax highlighting
- rehypeSlug         // Heading IDs
- rehypeAutolinkHeadings // Heading links
```

### `mdx.ts`
Client-safe utilities and type exports.

**Exports:**
- Blog post types
- Reading time calculation
- Date formatting utilities
- Slug generation

### `mdx.test.ts`
Comprehensive test suite for blog functionality.

## Blog Post Structure

### File Organization
```
content/blog/
├── published/          # Live posts
│   ├── post-1.mdx
│   └── post-2.mdx
├── draft/             # Work in progress
└── [locale]/          # Localized posts
    └── published/
        └── post-1.mdx
```

### Frontmatter Format
```yaml
---
title: "Post Title"              # Required
date: "2024-01-01"              # Required (YYYY-MM-DD)
excerpt: "Brief description"     # Required
author: "Author Name"           # Optional (default: Brandon)
tags: ["tag1", "tag2"]          # Optional
published: true                 # Optional (default: true)
image: "/images/cover.jpg"      # Optional
---
```

## MDX Components

### Available Components
```tsx
// Built-in components
<CodeExample language="typescript">
  // Code here
</CodeExample>

<Callout type="info">
  Information callout
</Callout>

<Image src="/path" alt="Description" />
```

### Custom Component Registration
```typescript
const components = {
  pre: CodeBlock,
  img: ResponsiveImage,
  a: SmartLink,
  // Add custom components here
}
```

## Caching Strategy

### Cache Namespaces
- `blog:post:{slug}:{locale}` - Full post content
- `blog:meta:{locale}` - Post metadata list
- `blog:tags:{locale}` - Tag aggregation

### Cache Invalidation
- Automatic on file change (development)
- Manual via cache API (production)
- TTL-based expiration

## Reading Time Calculation

```typescript
// Calculation logic
- Average reading speed: 200 words/minute
- Code blocks: 3 seconds per line
- Images: 10 seconds each
- Minimum time: 1 minute
```

## Slug Generation

```typescript
// Slug rules
"My Blog Post!" → "my-blog-post"
"AI & ML" → "ai-ml"
"Next.js 13" → "nextjs-13"
```

## Localization

### Directory Structure
```
content/blog/
├── published/        # English (default)
│   └── my-post.mdx
└── pt-BR/
    └── published/
        └── my-post.mdx  # Portuguese version
```

### Fallback Logic
1. Check locale-specific path
2. Fall back to English version
3. Return null if not found

## Performance Optimizations

### Metadata-Only Queries
```typescript
// Don't load content when listing posts
const posts = getAllPostsMeta(locale)
// Returns: title, date, excerpt, tags, slug
```

### Cached Compilation
```typescript
// MDX compilation is expensive - cache results
const cached = await blogCache.get(cacheKey)
if (cached) return cached

const compiled = await compileMDX(content)
await blogCache.set(cacheKey, compiled)
```

### Lazy Component Loading
```typescript
// Heavy components loaded on demand
const CodePlayground = dynamic(() => import('./CodePlayground'))
```

## Error Handling

### Common Issues

1. **Invalid Frontmatter**
   ```
   Error: Missing required field: title
   Solution: Ensure all required fields present
   ```

2. **MDX Syntax Error**
   ```
   Error: Unexpected closing tag </div>
   Solution: Check for unmatched JSX tags
   ```

3. **Missing Locale**
   ```
   Warning: No Portuguese version found
   Behavior: Falls back to English
   ```

## Testing Blog Posts

### Validation Commands
```bash
# Validate all posts
npm run validate:content

# Test specific post
npx tsx scripts/validate-blog-post.ts my-post.mdx
```

### Common Validations
- Required frontmatter fields
- Valid date format
- Unique slugs
- MDX syntax correctness
- Image references exist

## SEO Considerations

### Metadata Generation
- Title: Post title + site name
- Description: Post excerpt
- OG Image: Post image or default
- Canonical URL: Full post URL

### Structured Data
```typescript
// Article schema
{
  "@type": "BlogPosting",
  "headline": post.title,
  "datePublished": post.date,
  "author": {
    "@type": "Person",
    "name": post.author
  }
}
```

## Best Practices

1. **Frontmatter First**: Always validate frontmatter before content
2. **Image Optimization**: Use Next.js Image component
3. **Code Highlighting**: Specify language for all code blocks
4. **Excerpt Quality**: Write compelling excerpts for listings
5. **Tag Consistency**: Use consistent tag naming across posts
6. **Date Format**: Always use YYYY-MM-DD format
7. **File Naming**: Use kebab-case matching the slug