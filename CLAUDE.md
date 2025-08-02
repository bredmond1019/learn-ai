# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready portfolio website for Brandon J. Redmond, an AI Engineer & Agentic Systems Architect. Built with Next.js 15.3.3 (App Router), React 19, TypeScript 5, and Tailwind CSS 4. The site features full internationalization (English/Portuguese), a learning management system, MDX blog, and AI-powered content translation.

**Live Website**: https://learn-agentic-ai.com

## Key Commands

### Development
```bash
npm run dev              # Start dev server on localhost:3003
npm run build            # Production build
npm run build:production # Production build with ESLint warnings ignored
npm run start            # Start production server on port 3003
npm run lint             # Run ESLint
npm run analyze          # Analyze bundle size (ANALYZE=true npm run build)
```

### Testing
```bash
npm test                 # Run all tests
npm test:watch          # Watch mode
npm test:coverage       # Generate coverage report
npm test -- --testNamePattern="specific test"  # Run specific test
npm test ComponentName.test.tsx                # Test specific file

# Run tests by pattern
npm test -- Button                             # Test all Button-related files
npm test -- --testPathPattern=components       # Test only components directory
npm test -- --updateSnapshot                   # Update snapshots
```

### Content Management
```bash
npm run validate:content # Validate all content files
npx tsx scripts/comprehensive-validation.ts # Run comprehensive validation
npx tsx scripts/test-error-boundaries.ts    # Test error boundary handling
```

### Translation Management
```bash
npm run translate:scan      # Scan for missing Portuguese translations
npm run translate:priority  # Translate high-priority content (blog + ai-engineering-fundamentals)
npm run translate:blog      # Translate blog posts only
npm run translate:learning  # Translate learning modules only
npm run translate:all       # Translate all missing content
```

### Email Testing
```bash
npm run email:test          # Send single test email
npm run email:test-contact  # Test contact form functionality
npm run email:test-all      # Test all configured email addresses  
npm run email:verify        # Verify email configuration
npm run email:stress        # Stress test email delivery
npm test:email:integration  # Run production email integration tests
```

### Dev.to Publishing
```bash
npm run devto:publish <file>     # Publish single article
npm run devto:update <file>      # Update existing article
npm run devto:unpublish <file>   # Unpublish article
npm run devto:publish-dir <dir>  # Publish directory
npm run devto:sync              # Sync changed articles
npm run devto:list              # List published articles
npx tsx scripts/test-devto.ts   # Test Dev.to API integration
```

### YouTube Transcript Management
```bash
# Fetch and manage YouTube video transcripts
npx tsx scripts/youtube-transcript.ts fetch <url> [options]   # Fetch new transcript
npx tsx scripts/youtube-transcript.ts update <url>            # Update existing
npx tsx scripts/youtube-transcript.ts list                    # List all transcripts
npx tsx scripts/youtube-transcript.ts export <id> -f <format> # Export in different format
npx tsx scripts/youtube-transcript.ts search <keyword>        # Search transcripts
npx tsx scripts/youtube-transcript.ts remove <id>             # Remove transcript
npx tsx scripts/youtube-transcript.ts --help                  # Show all commands

# See lib/CLAUDE.md for detailed YouTube Transcript API documentation
```

### Deployment
```bash
npm run build:prod      # Production build script
npm run deploy          # Deploy script
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run k8s:deploy      # Deploy to Kubernetes
npm run k8s:status      # Check Kubernetes pod status
```

## Architecture & Key Patterns

### Next.js 15 App Router Architecture
- **Server Components by Default**: All components in `app/` are Server Components unless marked with `'use client'`
- **Route Grouping**: Uses `(locale)` for internationalization routing without adding to URL structure
- **Nested Layouts**: Hierarchical layout system with root layout and locale-specific layouts
- **Dynamic Routes**: `[locale]`, `[slug]`, and `[...segments]` patterns for flexible routing
- **Server Actions**: API routes in `app/api/` with proper TypeScript typing and error handling

### Internationalization (i18n) System
- **Middleware-Based Routing**: `middleware.ts` handles locale detection and redirects
- **Locale Structure**: `/[locale]/...` pattern for all pages (en, pt-BR)
- **Content Separation**: 
  - Blog: `/content/blog/[locale]/published/`
  - Learning: `/content/learn/paths/[locale]/` with fallback to English
  - Projects: `/content/projects/published/[locale]/`
- **Translation Pipeline**: 
  - Claude API integration for automated translation (`lib/claude-translator.ts`)
  - Content type detection (blog-post, project-description, ui-text, marketing-copy, technical-doc)
  - Cultural adaptation with localization options
- **Route Translations**: Localized URLs (e.g., `/en/about` → `/pt-BR/sobre`)

### Learning Management System (LMS)
- **Module-Based Architecture**: JSON metadata + MDX content separation
- **Dynamic Module Loading**: Server-side rendering with `lib/modules.server.ts`
- **Content Processing Pipeline**:
  1. JSON module metadata loading
  2. MDX content fetching and section extraction
  3. Client-side rendering with `ModuleRenderer.tsx`
  4. Custom component processing (Quiz, Callout, CodeExample, Diagram)
- **Progress Tracking**: Client-side localStorage with API endpoints for future server sync
- **Module Types**: concept, theory, project, practice
- **Section Types**: content, quiz, exercise with MDX embedding
- **30-Line Rule**: Code blocks limited to 30 lines for optimal comprehension

### Content Management Architecture
- **File-Based CMS**: No database, all content stored as files
- **Publishing Control**: Directory structure controls visibility
  - Published: `/content/blog/published/`
  - Draft: `/content/blog/todo/` or `/content/blog/draft/`
- **Server-Side Processing**: 
  - `lib/mdx.server.ts` for blog content
  - `lib/modules.server.ts` for learning modules
  - `lib/projects.ts` for project data
- **Caching Strategy**: 
  - `lib/cache-manager.ts` with in-memory LRU cache
  - Separate cache namespaces for blog, modules, projects
  - Cache invalidation on content changes

### MDX Processing System
- **Dual Processing**: Blog posts vs Learning modules use different pipelines
- **Component Registration**: 
  - Blog: Standard markdown components + custom CodeExample
  - Learning: Quiz, Callout, CodeExample, Diagram (Mermaid)
- **Content Parsing**: 
  - Frontmatter extraction with `gray-matter`
  - Reading time calculation
  - Tag and metadata processing
- **Security**: Server-side processing only, no client-side MDX compilation

### Email System Architecture
- **Provider**: Resend API integration with robust error handling
- **Dual Templates**: Admin notifications + User confirmations
- **Rate Limiting**: 5 requests per minute with spam protection
- **Environment Configuration**: 
  - `RESEND_API_KEY`: API authentication
  - `RESEND_FROM_EMAIL`: Verified sender (domain-verified)
  - `CONTACT_EMAIL`: Destination for form submissions
- **Production Debugging**: Enhanced logging with `[EMAIL ERROR]` prefixes

### Performance Architecture
- **Code Splitting Strategy**: Aggressive chunk splitting in `next.config.mjs`
  - Separate chunks for React, Next.js, Monaco Editor, large libraries
  - Learning components lazy-loaded with intersection observers
  - WASM modules async loading
- **Bundle Size Management**:
  - Performance budgets: 1MB max per asset/entrypoint
  - Tree shaking and module concatenation
  - Dynamic imports for heavy components
- **Caching Strategy**:
  - Static assets: 1 year immutable cache
  - API responses: 60s cache with stale-while-revalidate
  - Images: WebP/AVIF with Next.js optimization

### Dev.to Integration
- **API Client**: `lib/devto-api.ts` with rate limiting (~30 requests/30 seconds)
- **Content Pipeline**:
  1. Markdown processing and validation (`lib/devto-markdown.ts`)
  2. YAML frontmatter generation with proper escaping
  3. Article mapping storage (`.devto-mapping.json`, gitignored)
  4. Sync detection for changed articles
- **CLI Interface**: `scripts/devto-publish.ts` with full CRUD operations

### Testing Architecture
- **Framework**: Jest + React Testing Library + Testing Playground
- **Coverage Areas**: Components, utilities, API routes, integration tests
- **Mocking Strategy**:
  - Server-only modules mocked in `jest.setup.js`
  - Next.js navigation and router mocked
  - MDX components and external APIs mocked
- **Accessibility**: Automated a11y testing with jest-axe
- **Email Testing**: Production integration tests with real API calls

## Service-Specific Documentation

- **YouTube Transcript API**: See `lib/CLAUDE.md` for detailed documentation on the YouTube transcript fetching and management system, including API architecture, usage patterns, and integration points.
- **Blog Writing Guide**: See `content/blog/CLAUDE.md` for comprehensive blog writing guidelines, style guide, MDX troubleshooting, and content management patterns.
- **LinkedIn Social Posts**: See `content/socials/linkedin/CLAUDE.md` for LinkedIn post formatting and website URL guidelines.
- **Dev.to Publishing**: See `content/socials/dev-to/CLAUDE.md` for Dev.to API usage, publishing workflows, and multi-part series guidelines.

## Common Development Patterns

### Component Architecture
- **Server vs Client Components**: 
  - Use Server Components by default
  - Add `'use client'` only when needed (interactivity, browser APIs)
  - Lazy load heavy client components
- **Styling**: Tailwind CSS with `cn()` utility for conditional classes
- **Error Boundaries**: Comprehensive error handling with custom boundaries

### API Route Patterns
- **Standardized Response Format**: Consistent JSON responses with error handling
- **TypeScript Integration**: Proper typing for request/response objects
- **Rate Limiting**: Applied to user-facing endpoints
- **CORS Configuration**: Properly configured for production domain

### Content Creation Workflow
1. **Blog Posts**: 
   - Create in `/content/blog/published/` for immediate visibility
   - Use required frontmatter: `title`, `date`, `excerpt`
   - Validate with `npm run validate:content`
   - See `content/blog/CLAUDE.md` for style guide and MDX troubleshooting
2. **Learning Modules**:
   - JSON metadata + MDX content pairs
   - Follow naming convention: `{order}-{module-id}.{json|mdx}`
   - Use progressive disclosure and 30-line rule
3. **Projects**:
   - JSON format with localized versions
   - Include substantial code examples and metrics

### Translation Workflow
1. **Content Detection**: Automated scanning for missing translations
2. **AI Translation**: Claude API with content-type-specific prompts
3. **Cultural Adaptation**: Localization of idioms and technical terms
4. **Quality Assurance**: Manual review of technical terminology

## Environment Variables
```bash
# Required for production
RESEND_API_KEY=           # Resend API key for email service
CONTACT_EMAIL=            # Where contact forms are sent
RESEND_FROM_EMAIL=        # Verified sender email address for Resend (e.g., "Brandon Redmond <noreply@yourdomain.com>")

# Optional
NEXT_PUBLIC_GA_ID=        # Google Analytics
SENTRY_DSN=               # Error tracking
GOOGLE_SITE_VERIFICATION= # Google site verification

# Dev.to Integration
DEV_TO_API_KEY=           # Dev.to API key for publishing

# Translation System
ANTHROPIC_API_KEY=        # Claude API key for content translation

# YouTube Integration (Optional)
YOUTUBE_API_KEY=          # YouTube Data API v3 key for transcript fetching
```

## Common Issues & Solutions

### TypeScript Errors in ModuleRenderer
- Check for undefined `section.content.source` before parsing
- Cast `querySelector` results to `HTMLElement` for mermaid.init

### Module Not Found Errors
- Ensure Portuguese content exists in `/content/learn/paths/pt-BR/`
- Check variable naming consistency (moduleData vs module)

### Build Warnings about Bundle Size
- Normal for pages using Shiki/Monaco - chunks are lazy loaded
- Use `npm run analyze` to investigate specific issues

### MDX Parsing Errors
- Escape curly braces in MDX: `\{` and `\}`
- Check for unmatched JSX tags in content
- Replace HTML elements (`<details>`, `<summary>`) with MDX components (`<CodeExample>`, `<Callout>`)

### Learning Module Rendering Issues
- **Raw HTML showing**: HTML elements like `<details>` don't render in MDX - use `<CodeExample>` instead
- **Missing imports**: Ensure all MDX components are imported at the top of the file
- **Component props**: Check that all required props are provided for custom components
- **30-Line Rule**: Break code blocks longer than 30 lines into logical segments with explanations
- **Progressive Disclosure**: Start with simplest examples, add complexity gradually

### Dev.to YAML Errors
- Quote titles containing colons: `title: "Title: Subtitle"`
- Maximum 4 tags allowed per article
- Rate limit: ~30 requests per 30 seconds

### Email Configuration Issues
- **Vercel Deployment**: Set `RESEND_FROM_EMAIL` to a verified domain email address
- **Sender Verification**: Use domain-verified emails, not free providers like Gmail for the from address
- **Error Debugging**: Check Vercel function logs for detailed error information with `[EMAIL ERROR]` prefix
- **Local Testing**: Use `npm run email:test` to verify configuration before deployment

## Security & Performance

### Security Headers (vercel.json)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restrictive permissions

### Vercel Configuration
- **Build Command**: `npm run build:production` (ignores ESLint dev errors)
- **Memory Allocation**: 
  - General APIs: 1024MB, 30s timeout
  - Contact API: 512MB, 15s timeout
  - Health Check: 256MB, 5s timeout
- **Cron Jobs**: Daily cache cleanup at 2 AM UTC
- **Regional Deployment**: US East (iad1) for optimal performance

### Performance Budgets
- **Bundle Size**: 1MB max per asset/entrypoint
- **Caching Strategy**: 
  - Static assets: 1 year immutable
  - API responses: 60s with stale-while-revalidate
  - Images: Optimized with WebP/AVIF formats