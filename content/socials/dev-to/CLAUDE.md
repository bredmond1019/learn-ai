# Dev.to Publishing Guide

This guide helps Claude (and you) remember how to use the Dev.to API functionality.

## Website Information

**Main Website**: https://learn-agentic-ai.com
- Use this URL when referencing blog posts or learning paths in Dev.to articles
- Blog format: `https://learn-agentic-ai.com/blog/[slug]`
- Learning paths: `https://learn-agentic-ai.com/en/learn/paths/[path-id]`

## Quick Start

### Publishing Articles

```bash
# Publish a single article
npm run devto:publish content/socials/dev-to/article.md

# Publish all articles in a directory
npm run devto:publish-dir content/socials/dev-to/ai-systems-series/

# Force republish (if already published)
npm run devto:publish content/socials/dev-to/article.md -- --force

# Publish as draft
npm run devto:publish content/socials/dev-to/article.md -- --draft
```

### Managing Articles

```bash
# List all published articles
npm run devto:list

# Update an existing article
npm run devto:update content/socials/dev-to/article.md

# Unpublish an article (set to draft)
npm run devto:unpublish content/socials/dev-to/article.md

# Sync all changed articles
npm run devto:sync
```

## Markdown Format

Articles must have proper front matter:

```markdown
---
title: "Article Title (use quotes if it contains colons)"
published: true
tags: tag1, tag2, tag3, tag4  # Maximum 4 tags
series: "Series Name"          # Optional
description: "Brief description" # Optional
---

Article content goes here...
```

## Important Notes

### Rate Limiting
- Dev.to has a rate limit of ~30 requests per 30 seconds
- When publishing multiple articles, you may need to wait between requests
- The error message will tell you how long to wait

### YAML Issues
- If your title contains a colon (:), wrap it in quotes
- Example: `title: "Building AI: A Guide"` not `title: Building AI: A Guide`

### Mapping File
- Article mappings are stored in `.devto-mapping.json`
- This file tracks which local files are published to which Dev.to article IDs
- Don't delete this file or you'll lose track of published articles

### API Key
- Stored in `.env.development.local` as `DEV_TO_API_KEY`
- Get your API key from: https://dev.to/settings/extensions
- Scroll to "DEV Community API Keys" section

## Common Tasks

### Check if articles need updating
```bash
npm run devto:sync
```
This will check all mapped articles and update any that have changed.

### Fix broken mappings
If the mapping file gets corrupted or lost:
1. Delete `.devto-mapping.json`
2. Use the Dev.to API to list your articles
3. Manually recreate mappings by republishing with --force

### Test the API connection
```bash
npx tsx scripts/test-devto.ts
```

## File Locations

- **API Client**: `lib/devto-api.ts`
- **Markdown Parser**: `lib/devto-markdown.ts`
- **Mapping System**: `lib/devto-mapping.ts`
- **CLI Script**: `scripts/devto-publish.ts`
- **Tests**: `__tests__/lib/devto-*.test.ts`

## Troubleshooting

### "Article already published"
Use `--force` flag or use the update command instead.

### "Rate limit reached"
Wait 30 seconds and try again.

### "Missing required field: title"
Check your markdown front matter has a title field.

### "Maximum 4 tags allowed"
Reduce the number of tags in your front matter.

### YAML parsing errors
Usually caused by unquoted colons in titles. Add quotes around the title.