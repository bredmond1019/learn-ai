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

### Content Validation
```bash
npm run validate:content # Validate all content files
```

## Architecture & Key Patterns

### Internationalization (i18n)
- **Routing**: `/[locale]/...` pattern for all pages (en, pt-BR)
- **Content**: Separate directories under `/content/blog/[locale]/` and `/content/projects/[locale]/`
- **Translations**: JSON files in `/content/translations/[locale].json`
- **Navigation**: Auto-switches between `/en/` and `/pt-BR/` routes
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
- **Environment**: Requires `RESEND_API_KEY` and `CONTACT_EMAIL`

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

### Common Issues & Solutions

1. **TypeScript Errors in ModuleRenderer**:
   - Check for undefined `section.content.source` before parsing
   - Cast `querySelector` results to `HTMLElement` for mermaid.init

2. **Module Not Found Errors**:
   - Ensure Portuguese content exists in `/content/learn/paths/pt-BR/`
   - Check variable naming consistency (moduleData vs module)

3. **Build Warnings about Bundle Size**:
   - Normal for pages using Shiki/Monaco - chunks are lazy loaded
   - Use `npm run analyze` to investigate specific issues

4. **MDX Parsing Errors**:
   - Escape curly braces in MDX: `\{` and `\}`
   - Check for unmatched JSX tags in content

### Environment Variables
```bash
# Required for production
RESEND_API_KEY=           # Email service
CONTACT_EMAIL=            # Where contact forms are sent

# Optional
NEXT_PUBLIC_GA_ID=        # Google Analytics
SENTRY_DSN=               # Error tracking
```

### Deployment Notes
- **Platform**: Optimized for Vercel deployment
- **Node Version**: Requires Node.js 18.x
- **Build Command**: `npm run build:production`
- **Environment**: Set all required env vars in deployment platform

### Working with Learning Modules
When creating or modifying learning modules:
1. Module metadata goes in `.json` files with specific structure
2. Module content goes in corresponding `.mdx` files
3. Use exact ID matching between JSON and MDX files
4. Support custom components: `<Quiz>`, `<Callout>`, `<CodeExample>`, `<Diagram>`
5. Test both English and Portuguese versions