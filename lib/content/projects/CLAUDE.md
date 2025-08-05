# Projects System Documentation

This directory manages project data loading, caching, and localization for the portfolio's project showcase.

## Core Components

### `projects.ts`
Main project data management system.

**Key Functions:**
- `getAllProjects()` - Get all published projects
- `getProjectBySlug()` - Get single project details
- `getProjectsByCategory()` - Filter by category
- `ensureProjectsDirectory()` - Directory initialization

**Features:**
- JSON-based project storage
- Locale-specific content
- Automatic fallback to English
- LRU cache integration

### `projects.test.ts`
Comprehensive test suite for project functionality.

## Project Data Structure

### File Organization
```
content/projects/
├── published/              # English projects (default)
│   ├── ai-chatbot.json
│   ├── vector-search.json
│   └── llm-dashboard.json
└── pt-BR/                  # Portuguese translations
    └── published/
        ├── ai-chatbot.json
        └── vector-search.json
```

### Project Schema
```typescript
interface Project {
  id: string                 // Unique identifier
  slug: string              // URL-friendly slug
  title: string             // Project name
  description: string       // Brief description
  longDescription?: string  // Detailed description
  image: string            // Cover image path
  technologies: string[]    // Tech stack
  category: ProjectCategory // Project type
  featured?: boolean        // Homepage feature flag
  metrics?: {              // Success metrics
    [key: string]: string
  }
  highlights?: string[]     // Key achievements
  github?: string          // GitHub repository
  demo?: string            // Live demo URL
  caseStudy?: string       // Case study link
  testimonial?: {          // Client testimonial
    quote: string
    author: string
    role: string
    company?: string
  }
  date: string             // Project date
  duration?: string        // Project duration
  role?: string            // Your role
  team?: string[]          // Team members
  challenges?: string[]    // Technical challenges
  solutions?: string[]     // Solutions implemented
  results?: string[]       // Project outcomes
  tags?: string[]          // Additional tags
}
```

### Project Categories
```typescript
type ProjectCategory = 
  | 'ai-ml'           // AI/ML projects
  | 'full-stack'      // Full-stack applications
  | 'data-science'    // Data science projects
  | 'automation'      // Automation tools
  | 'open-source'     // OSS contributions
  | 'client-work'     // Client projects
```

## Localization

### Translation Structure
```json
// English version
{
  "id": "ai-chatbot",
  "title": "AI Customer Support Bot",
  "description": "Intelligent chatbot with RAG"
}

// Portuguese version  
{
  "id": "ai-chatbot",
  "title": "Bot de Suporte ao Cliente com IA",
  "description": "Chatbot inteligente com RAG"
}
```

### Fallback Logic
1. Load requested locale version
2. Fall back to English if not found
3. Merge translations with defaults
4. Cache combined result

## Caching Strategy

### Cache Keys
```typescript
// Project list by locale
`projects:all:${locale}`

// Single project
`projects:${slug}:${locale}`

// Category filtered
`projects:category:${category}:${locale}`
```

### Cache Configuration
- **TTL**: 1 hour in production
- **Max Size**: 100 entries
- **Eviction**: LRU (Least Recently Used)

## Featured Projects

### Selection Criteria
```typescript
// Projects with featured: true
const featured = projects.filter(p => p.featured)

// Sort by custom priority
featured.sort((a, b) => {
  const priority = ['ai-chatbot', 'vector-search']
  return priority.indexOf(a.slug) - priority.indexOf(b.slug)
})
```

## Metrics Display

### Common Metrics
```typescript
metrics: {
  "performance": "10x faster queries",
  "accuracy": "95% accuracy rate",
  "scale": "1M+ requests/day",
  "savings": "$100k annual savings",
  "users": "10,000+ active users"
}
```

### Formatting Guidelines
- Use concrete numbers
- Include percentage improvements
- Highlight business impact
- Keep metrics concise

## Project Images

### Image Requirements
- **Format**: WebP preferred, JPG/PNG fallback
- **Dimensions**: 1200x630px (OG image size)
- **Location**: `/public/images/projects/`
- **Naming**: Match project slug

### Image Optimization
```typescript
// Automatic Next.js optimization
import Image from 'next/image'

<Image 
  src={project.image}
  alt={project.title}
  width={1200}
  height={630}
  priority={featured}
/>
```

## Adding New Projects

### Step-by-Step Process

1. **Create JSON file**
   ```bash
   touch content/projects/published/new-project.json
   ```

2. **Add project data**
   ```json
   {
     "id": "new-project",
     "slug": "new-project",
     "title": "New AI Project",
     "description": "Brief description",
     "technologies": ["Next.js", "Python", "OpenAI"],
     "category": "ai-ml",
     "date": "2024-01-01"
   }
   ```

3. **Add translations** (optional)
   ```bash
   touch content/projects/pt-BR/published/new-project.json
   ```

4. **Add project image**
   ```bash
   cp project-image.webp public/images/projects/new-project.webp
   ```

5. **Validate data**
   ```bash
   npm run validate:content
   ```

## Testing Projects

### Validation Checks
- Required fields present
- Valid category selection
- Image file exists
- URLs are valid
- Date format correct
- Unique project ID

### Test Commands
```bash
# Test all projects
npm test projects.test.ts

# Validate project data
npx tsx scripts/validate-projects.ts
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load project details on demand
2. **Image Optimization**: Use Next.js Image component
3. **Data Minimization**: Only load needed fields
4. **Cache Warming**: Pre-cache featured projects

### Bundle Size
- Keep project data under 5KB each
- Optimize images to ~100KB
- Use dynamic imports for large content

## Best Practices

### Content Guidelines
1. **Compelling Titles**: Clear, benefit-focused
2. **Rich Descriptions**: Highlight impact
3. **Concrete Metrics**: Quantify success
4. **Quality Images**: Professional screenshots
5. **Complete Data**: Fill all relevant fields

### Technical Guidelines
1. **Consistent Slugs**: Match filenames
2. **Valid JSON**: Use validator tools
3. **Image Optimization**: Compress before adding
4. **Translation Parity**: Keep versions in sync
5. **Cache Awareness**: Clear after updates

### SEO Optimization
1. **Unique Descriptions**: Avoid duplication
2. **Keyword Integration**: Natural placement
3. **Structured Data**: Project schema markup
4. **Social Images**: OG image optimization
5. **URL Structure**: Clean, descriptive slugs