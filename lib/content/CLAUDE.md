# Content Management Documentation

This directory contains all content processing and management functionality for the portfolio site.

## Content Categories

### 📝 Blog System (`/blog`)
See [blog/CLAUDE.md](./blog/CLAUDE.md) for blog content documentation including:
- MDX processing pipeline
- Server-side rendering
- Frontmatter handling
- Reading time calculation

### 📚 Learning System (`/learning`)
See [learning/CLAUDE.md](./learning/CLAUDE.md) for learning module documentation including:
- Module validation and loading
- JSON + MDX architecture
- Progress tracking integration
- Custom component support

### 🚀 Projects System (`/projects`)
See [projects/CLAUDE.md](./projects/CLAUDE.md) for project management documentation including:
- JSON-based project data
- Localization support
- Caching strategies
- File structure

### ✅ Content Validation
The `content-validation.ts` file provides cross-content validation utilities:
- MDX syntax validation
- Frontmatter verification
- Link checking
- Image reference validation

## Architecture Patterns

All content systems in this directory follow these patterns:

### 1. File-Based Storage
- No database required
- Git-trackable content
- Easy content versioning
- Simple deployment

### 2. Server-Side Processing
- MDX compilation on server
- No client-side security risks
- Better performance
- SEO optimization

### 3. Caching Strategy
- LRU cache implementation
- Namespace separation
- Automatic invalidation
- Performance optimization

### 4. Localization Support
- Consistent file structure
- Fallback mechanisms
- Locale-specific content
- Translation integration

## Content Pipeline

```
File System → Server Processing → Cache → Client Rendering
     ↓              ↓                ↓           ↓
  .md/.mdx    Validation/Parse    Store    React Components
```

## Common Interfaces

### Content Metadata
```typescript
interface ContentMeta {
  title: string
  date?: string
  excerpt?: string
  tags?: string[]
  author?: string
  published: boolean
}
```

### Localization Pattern
```typescript
interface LocalizedContent<T> {
  default: T          // English (fallback)
  'pt-BR'?: T        // Portuguese
  [locale: string]: T | undefined
}
```

## Directory Structure

```
content/
├── blog/
│   ├── published/      # Live blog posts
│   ├── draft/          # Work in progress
│   └── [locale]/       # Localized content
├── learn/
│   ├── paths/          # Learning paths
│   ├── schemas/        # Validation schemas
│   └── [locale]/       # Localized modules
└── projects/
    ├── published/      # Active projects
    └── [locale]/       # Localized projects
```

## Best Practices

### Content Organization
1. Use clear naming conventions
2. Group related content
3. Maintain consistent structure
4. Document special cases

### Performance
1. Leverage server-side caching
2. Minimize client-side processing
3. Optimize image references
4. Use lazy loading where appropriate

### Validation
1. Validate on content save
2. Check during build process
3. Runtime error boundaries
4. Comprehensive error messages

### Localization
1. Always provide English version
2. Use consistent key naming
3. Validate all locales
4. Test fallback behavior

## Integration Points

### With Services
- Translation service for content localization
- Email service for content notifications
- YouTube service for transcript integration

### With Core Systems
- Cache manager for performance
- Error logger for debugging
- Environment config for feature flags

### With Client
- Progress tracking for learning modules
- Image optimization for blog posts
- Component lazy loading

## Testing Approach

Each content system includes:
1. Unit tests for processing logic
2. Integration tests for file operations
3. Validation tests for content rules
4. Performance tests for large datasets

## Adding New Content Types

To add a new content type:

1. Create subdirectory in `/content`
2. Implement processing logic in `/lib/content`
3. Add TypeScript interfaces in `/lib/types`
4. Create CLAUDE.md documentation
5. Add validation rules
6. Implement caching strategy
7. Add comprehensive tests