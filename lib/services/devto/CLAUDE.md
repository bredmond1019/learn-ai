# Dev.to Publishing Service Documentation

This service enables publishing blog posts directly from markdown files to the Dev.to platform.

## Overview

The Dev.to publishing service provides:
- Direct markdown to Dev.to article publishing
- Article mapping and change tracking
- Series support for multi-part articles
- Rate limiting compliance (30 requests/30 seconds)
- YAML frontmatter validation

## Core Components

### `devto-api.ts`
API client for all Dev.to interactions.

**Key Features:**
- Built-in rate limiting
- Comprehensive error handling
- Full CRUD operations
- TypeScript interfaces for all API types

**Key Methods:**
```typescript
createArticle(article: DevToArticle): Promise<DevToArticleResponse>
updateArticle(id: number, article: DevToArticle): Promise<DevToArticleResponse>
getArticle(id: number): Promise<DevToArticleResponse>
getUserArticles(page?: number, perPage?: number): Promise<DevToArticleResponse[]>
unpublishArticle(id: number): Promise<void>
```

### `devto-markdown.ts`
Markdown content processor and validator.

**Key Features:**
- YAML frontmatter parsing with gray-matter
- Special character handling
- Frontmatter validation
- Content transformation

**Validation Rules:**
- Title: Required, quote if contains colons
- Tags: Maximum 4, lowercase, alphanumeric
- Published: Boolean flag
- Series: Optional, for multi-part articles

### `devto-mapping.ts`
Local article tracking system.

**Key Features:**
- Maps local files to Dev.to article IDs
- Tracks content changes via checksums
- Stores publication metadata
- Enables sync detection

**Mapping Structure:**
```typescript
interface ArticleMapping {
  filePath: string      // Local file path
  articleId: number     // Dev.to article ID
  title: string         // Article title
  lastSynced: string    // ISO timestamp
  checksum?: string     // MD5 hash for change detection
}
```

## CLI Commands

### Publishing Workflows

```bash
# Single article
npm run devto:publish path/to/article.md

# With options
npm run devto:publish article.md -- --draft  # Publish as draft
npm run devto:publish article.md -- --force  # Force republish

# Directory (series)
npm run devto:publish-dir content/series/

# Update existing
npm run devto:update path/to/article.md

# Sync changed files
npm run devto:sync

# List published
npm run devto:list
```

## Markdown Format

### Required Frontmatter

```markdown
---
title: "Article Title"          # Required, quote if has colons
published: true                 # true/false
tags: ai, programming, claude   # Max 4, comma-separated
---

Article content...
```

### Optional Frontmatter

```markdown
---
series: "Series Name"           # For multi-part articles
description: "Brief summary"    # Article excerpt
canonical_url: "https://..."    # Original source
cover_image: "https://..."      # Header image
---
```

## Usage Examples

### Programmatic Publishing

```typescript
import { DevToAPI } from '@/lib/services/devto/devto-api'
import { DevToMarkdown } from '@/lib/services/devto/devto-markdown'
import { DevToMapping } from '@/lib/services/devto/devto-mapping'

// Initialize
const api = new DevToAPI(process.env.DEV_TO_API_KEY)
const markdown = new DevToMarkdown()
const mapping = new DevToMapping()

// Parse and publish
const parsed = await markdown.parseFile('article.md')
const article = await api.createArticle({
  title: parsed.title,
  body_markdown: parsed.content,
  published: true,
  tags: parsed.tags
})

// Track publication
await mapping.set('article.md', article.id)
```

### Series Publishing

```typescript
// Publish series in order
const seriesName = "My Tutorial Series"
const articles = ['part-1.md', 'part-2.md', 'part-3.md']

for (const file of articles) {
  const parsed = await markdown.parseFile(file)
  await api.createArticle({
    ...parsed,
    series: seriesName
  })
}
```

## Error Handling

### Common Errors

1. **YAML Parsing**
   ```
   Error: incomplete explicit mapping pair
   Solution: Quote titles containing colons
   ```

2. **Rate Limiting**
   ```
   Error: 429 Too Many Requests
   Solution: Wait 30 seconds between bulk operations
   ```

3. **Duplicate Publication**
   ```
   Error: Article already exists
   Solution: Use update instead of create, or --force flag
   ```

### Error Recovery

The service includes automatic retry logic for transient failures:
- Network errors: 3 retries with exponential backoff
- Rate limits: Automatic delay and retry
- API errors: Detailed error messages for debugging

## Mapping File

The `.devto-mapping.json` file (gitignored) tracks all publications:

```json
{
  "version": "1.0.0",
  "mappings": [
    {
      "filePath": "/absolute/path/to/article.md",
      "articleId": 12345,
      "title": "Article Title",
      "lastSynced": "2024-01-01T00:00:00.000Z",
      "checksum": "md5hash"
    }
  ]
}
```

## Best Practices

1. **Version Control**: Don't commit `.devto-mapping.json`
2. **Series Order**: Publish series articles sequentially
3. **Draft First**: Test with `--draft` before publishing
4. **Canonical URLs**: Set when cross-posting
5. **Tags**: Research popular tags on Dev.to first

## Testing

```bash
# Test API connection
npx tsx scripts/test-devto.ts

# Dry run (parse without publishing)
npm run devto:publish article.md -- --dry-run
```

## Website URL References

When linking back to your site:
- Main: `https://learn-agentic-ai.com`
- Blog: `https://learn-agentic-ai.com/blog/[slug]`
- Learning: `https://learn-agentic-ai.com/en/learn/paths/[path]`