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
```

### Content Management
```bash
npm run validate:content # Validate all content files
npx tsx scripts/comprehensive-validation.ts # Run comprehensive validation
npx tsx scripts/test-error-boundaries.ts    # Test error boundary handling
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

### Content Management
- **Blog Posts**: MDX files with frontmatter in `/content/blog/[locale]/published/`
- **Projects**: JSON files in `/content/projects/published/[locale]/`
- **Dynamic Routes**: `[slug]` patterns for blog and project detail pages
- **Server Components**: MDX processing happens server-side via `lib/mdx.server.ts`

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

# Dev.to Integration
DEV_TO_API_KEY=           # Dev.to API key for publishing
```

## Deployment Notes
- **Platform**: Optimized for Vercel deployment
- **Node Version**: Requires Node.js 18.x
- **Build Command**: `npm run build:production`
- **Environment**: Set all required env vars in deployment platform

## Working with Learning Modules
When creating or modifying learning modules:
1. Module metadata goes in `.json` files with specific structure
2. Module content goes in corresponding `.mdx` files
3. Use exact ID matching between JSON and MDX files
4. Support custom components: `<Quiz>`, `<Callout>`, `<CodeExample>`, `<Diagram>`
5. Test both English and Portuguese versions