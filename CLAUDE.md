# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready portfolio website for Brandon J. Redmond, an AI Engineer & Agentic Systems Architect. Built with Next.js 15.3.3 (App Router), React 19, TypeScript 5, and Tailwind CSS 4. The site features full internationalization (English/Portuguese), a learning management system, MDX blog, and AI-powered content translation.

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
npx tsx scripts/youtube-transcript.ts <videoId>           # Fetch transcript for video
npx tsx scripts/youtube-transcript.ts <videoId> --json    # Save as JSON format
npx tsx scripts/youtube-transcript.ts <videoId> --txt     # Save as TXT format (default)
npx tsx scripts/youtube-transcript.ts --help              # Show usage information
```

### YouTube Integration
```bash
npm run youtube:fetch <url>      # Fetch transcript from YouTube URL
npm run youtube:update <id>      # Update existing transcript
npm run youtube:list             # List all stored transcripts
npm run youtube:export <id>      # Export transcript in various formats
npm run youtube:search <query>   # Search transcripts
npm run youtube:remove <id>      # Remove transcript
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

### Internationalization (i18n)
- **Routing**: `/[locale]/...` pattern for all pages (en, pt-BR)
- **Content**: Separate directories under `/content/blog/[locale]/` and `/content/projects/[locale]/`
- **Translations**: JSON files in `/content/translations/[locale].json`
- **Navigation**: Auto-switches between `/en/` and `/pt-BR/` routes
- **Route Translations**: Localized URLs (e.g., `/en/about` → `/pt-BR/sobre`)
- **Key files**: `lib/i18n.ts`, `lib/translations.ts`, `middleware.ts`

### Learning Management System
- **Module System**: JSON metadata + MDX content files in `/content/learn/paths/`
- **Dynamic Loading**: `lib/modules.server.ts` handles server-side module loading
- **Module Renderer**: `components/learn/ModuleRenderer.tsx` parses MDX with custom components
- **Special Components**: Quiz, Callout, CodeExample, Diagram (Mermaid)
- **Progress Tracking**: API routes in `/app/api/progress/`
- **Code Philosophy**: Use the 30-line rule - no code block should exceed 30 lines for optimal comprehension
- **Content Guidelines**: Follow progressive disclosure pattern, avoid raw HTML elements

### Content Management
- **Blog Posts**: MDX files with frontmatter in `/content/blog/[locale]/published/`
- **Projects**: JSON files in `/content/projects/published/[locale]/`
- **Dynamic Routes**: `[slug]` patterns for blog and project detail pages
- **Server Components**: MDX processing happens server-side via `lib/mdx.server.ts`
- **Publishing Control**: Directory structure controls visibility, not frontmatter flags
- **Content Style Guides**: See `content/blog/CLAUDE.md`, `content/projects/CLAUDE.md`, `content/learn/CLAUDE.md` for detailed style guides

### Email System
- **Provider**: Resend API integration
- **Contact Form**: `components/ContactForm.tsx` with validation
- **API Route**: `/api/contact/route.ts` with rate limiting
- **Environment**: Requires `RESEND_API_KEY`, `CONTACT_EMAIL`, and `RESEND_FROM_EMAIL`
- **Email Service**: `lib/email.ts` with enhanced error logging for production debugging
- **Templates**: Supports both admin notifications and user confirmations

### Dev.to Integration
- **API Client**: `lib/devto-api.ts` handles all Dev.to API calls
- **Markdown Parser**: `lib/devto-markdown.ts` processes and validates content
- **Mapping System**: `lib/devto-mapping.ts` tracks published articles
- **CLI Tool**: `scripts/devto-publish.ts` provides command interface
- **Mapping File**: `.devto-mapping.json` stores article mappings (gitignored)

### Styling Architecture
- **Framework**: Tailwind CSS 4 with custom configuration
- **Dark Theme**: Primary dark design (#0A0A0A background)
- **Typography**: Inter (headings), Source Sans Pro (body), JetBrains Mono (code)
- **Components**: Consistent use of `cn()` utility for conditional classes
- **Responsive**: Mobile-first with standard Tailwind breakpoints

### Performance Optimizations
- **Code Splitting**: Aggressive chunk splitting in `next.config.mjs`
- **Image Optimization**: Next.js Image with WebP/AVIF formats
- **Font Loading**: Self-hosted fonts with font-display swap
- **Bundle Size**: Monaco Editor and syntax highlighters lazy-loaded
- **Caching**: Immutable assets cached for 1 year

### Testing Approach
- **Framework**: Jest with React Testing Library
- **Coverage**: Components, utilities, API routes
- **Mocks**: Server-only modules, Next.js navigation, MDX
- **Setup**: `jest.setup.js` provides polyfills and global mocks

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

## Deployment Notes

### Vercel Configuration
- **Platform**: Optimized for Vercel deployment
- **Node Version**: Requires Node.js 18.x
- **Build Command**: `npm run build:production`
- **Install Command**: `npm ci --prefer-offline --no-audit`
- **Output Directory**: `.next`
- **Region**: `iad1` (US East)
- **Environment**: Set all required env vars in deployment platform

### Security Headers
The project includes comprehensive security headers configured in `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restrictive permissions

### API Function Configuration
- Contact API: 15s timeout, 512MB memory
- Health Check: 5s timeout, 256MB memory
- Metrics API: 10s timeout, 512MB memory
- General APIs: 30s timeout, 1024MB memory

### Scheduled Jobs (Crons)
- Cache Cleanup: Daily at 2 AM UTC (`/api/cache/cleanup`)

### Caching Strategy
- Static assets: 1 year cache
- API responses: 60s cache with 5-minute stale-while-revalidate
- Images: Immutable 1-year cache

## Working with Learning Modules

### File Naming Conventions
When creating learning modules, follow these patterns:
- **Module Files**: `{order}-{module-id}.mdx` (e.g., `01-introduction-to-mcp.mdx`)
- **Module Metadata**: `{order}-{module-id}.json` (same name as MDX)
- **Exercises**: `{module-id}-{exercise-name}.json`
- **Quizzes**: `{module-id}-quiz-{topic}.json`
- **Projects**: `project-{project-name}.json`
- **Assets**: `{context}-{description}.{ext}` (e.g., `mcp-architecture-diagram.png`)

### Module Structure Requirements
1. Module metadata goes in `.json` files with specific structure
2. Module content goes in corresponding `.mdx` files
3. Use exact ID matching between JSON and MDX files
4. Support custom components: `<Quiz>`, `<Callout>`, `<CodeExample>`, `<Diagram>`
5. Test both English and Portuguese versions
6. All files must use kebab-case, lowercase only

### Content Validation
Run validation scripts before committing:
```bash
npm run validate:content
npx tsx scripts/comprehensive-validation.ts
```

## Development Patterns

### Testing Philosophy
- **Test Coverage**: All components, utilities, and API routes must have tests
- **Accessibility Testing**: Using jest-axe for automated a11y testing
- **Mock Strategy**: Server-only modules and external APIs are mocked
- **Test Data**: Use fixtures in `__tests__/fixtures/` for consistent test data

### Code Splitting
Heavy components are lazy-loaded with custom loading strategies:
- **LazyQuiz**: Auto-loads after 500ms
- **LazyProgressDashboard**: Intersection Observer + 2s fallback
- **LazyCodeValidation**: Intersection Observer + hover preload + 3s fallback
- **LazyMonacoEditor**: Loaded on demand for code editing

### AI Integration Patterns

#### Claude Translation System
- **Rate Limiting**: 1 second between requests
- **Retry Logic**: Max 3 retries with 2-second delays
- **Content Types**: blog-post, project-description, ui-text, marketing-copy, technical-doc
- **Cultural Adaptation**: Optional localization of idioms and references
- **Technical Terminology**: Options to preserve, localize, or mix

#### YouTube Integration
- **Transcript Fetching**: Using youtubei.js for reliable transcript extraction
- **Metadata Storage**: Stores video metadata alongside transcripts
- **Format Support**: JSON and TXT export formats
- **Error Handling**: Comprehensive error classes for different failure modes

### Multi-Agent Development Approach
The project uses a multi-agent development workflow with task coordination:
- Agent tasks tracked in `docs/misc/tasks/`
- Phase-based development with completed tasks archived
- Clear separation of concerns between agents
- Comprehensive documentation for handoffs

## Content Creation Patterns

### Blog Post Publishing
**Important: Post visibility is controlled by directory structure, NOT by frontmatter.**

To publish a post:
1. Move the `.mdx` file from any `/todo/` directory to `/content/blog/published/`
2. Ensure required frontmatter: `title`, `date`, and `excerpt`
3. No `status`, `published`, or `draft` field needed

To unpublish a post:
1. Move it to `/content/blog/en/todo/` or any `/todo/` directory
2. Effect is immediate

### Learning Module Guidelines
1. **30-Line Rule**: No code block should exceed 30 lines for optimal comprehension
2. **Progressive Disclosure**: Start with simplest implementation, add complexity gradually
3. **Avoid Raw HTML**: Use MDX components instead of `<details>`, `<summary>`, etc.
4. **Component Imports**: Always import required components at top of MDX files
5. **Anchors Required**: Every major section needs `{#section-id}` for navigation

### Project Entry Structure
- **JSON Format**: All projects stored as JSON files with strict schema
- **Localization**: Separate files for each language (en, pt-BR)
- **Code Snippets**: Include 2-3 substantial, production-quality examples
- **Metrics**: Always quantify outcomes and technical achievements
- **Educational Value**: Explain what others can learn from each project

## Common Gotchas

### Next.js 15 App Router
- All components in `app/` directory are Server Components by default
- Use `'use client'` directive for interactive components
- Metadata must be exported from page.tsx files, not layout.tsx

### Internationalization
- Always use absolute paths in navigation
- Portuguese routes use localized paths (e.g., `/sobre` instead of `/about`)
- Content must exist in both languages or fallback will fail

### MDX Processing
- Server-side only - no client-side MDX compilation
- Custom components must be registered in MDXComponents
- Escape curly braces in content: `\{` and `\}`

### Email System
- Resend requires domain verification for production
- Use proper "from" format: "Name <email@domain.com>"
- Rate limiting is enforced at 5 requests per minute

## Performance Considerations

### Bundle Size Optimization
- Monaco Editor is the largest dependency - always lazy load
- Syntax highlighters (Shiki, Prism) should be code-split
- Use dynamic imports for heavy components
- Run `npm run analyze` to check bundle impacts
- Performance budgets: 1MB max per asset/entrypoint as configured in `next.config.mjs`

### Image Optimization
- All images should use Next.js Image component
- Provide width and height for CLS optimization
- Use WebP/AVIF formats with fallbacks
- Store images in `public/images/` with descriptive names

### Database/Storage
- No database - all content is file-based
- Learning progress uses localStorage (client-side only)
- Consider adding Redis for production caching

## Security Best Practices

### API Security
- All API routes include rate limiting
- Contact form has spam protection
- CORS configured for production domain only
- Input validation using Zod schemas

### Content Security
- MDX content is sanitized server-side
- No dynamic code execution in MDX
- HTML content is escaped by default
- XSS protection via security headers