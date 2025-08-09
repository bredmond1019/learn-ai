# AI Engineer Portfolio

**Brandon J. Redmond - AI Engineer & Agentic Systems Architect**

A modern, production-ready portfolio website showcasing AI engineering expertise, built with Next.js 15, TypeScript, and Tailwind CSS. Features a comprehensive Learning Management System (LMS), internationalization (English/Portuguese), AI-powered content translation, and professional deployment configurations.

**Live Website**: [https://learn-agentic-ai.com](https://learn-agentic-ai.com)

## ✨ Key Features

- **🎓 Learning Management System**: Interactive courses with 7+ learning paths, 50+ modules, quizzes, and progress tracking
- **🌐 Full Internationalization**: English/Portuguese support with AI-powered translation
- **📝 Advanced Content System**: MDX blog with syntax highlighting, Dev.to integration, YouTube transcripts
- **🤖 AI Integrations**: Claude API for translations, Notion API for content sync
- **📱 Responsive Design**: Mobile-first approach with dark theme and accessibility
- **🧪 Comprehensive Testing**: Jest, React Testing Library, production email tests
- **🚀 Performance Optimized**: Aggressive code splitting, WASM support, image optimization
- **📧 Email System**: Contact forms with Resend API, rate limiting, spam protection
- **🔍 Advanced SEO**: Structured data, dynamic sitemaps, Open Graph, hreflang
- **📊 Analytics & Monitoring**: Google Analytics, Sentry error tracking, performance monitoring
- **🚢 Production Ready**: Docker, Kubernetes configs, Vercel optimizations

## 🚀 Quick Start

### Prerequisites

- **Node.js 18.x** (required for Next.js 15)
- npm or yarn package manager
- Git

### Development Setup

```bash
# Clone and navigate to the project
cd portfolio

# Install dependencies
npm install

# Copy environment template (if exists)
cp .env.example .env.local 2>/dev/null || touch .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

**Development server**: [http://localhost:3003](http://localhost:3003)

### Environment Variables

Required for full functionality:

```bash
# Required: Email functionality
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=verified-sender@yourdomain.com
CONTACT_EMAIL=your-email@domain.com

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_SITE_VERIFICATION=verification_code

# Optional: Content integrations
DEV_TO_API_KEY=dev_to_api_key
ANTHROPIC_API_KEY=claude_api_key
YOUTUBE_API_KEY=youtube_data_api_v3_key
NOTION_API_KEY=notion_integration_key
NOTION_DATABASE_ID=notion_database_id
```

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── [locale]/                    # Internationalized routes (en/pt-BR)
│   │   ├── about/                  # About page
│   │   ├── blog/                   # Blog listing and posts
│   │   │   └── [slug]/            # Dynamic blog post pages
│   │   ├── projects/               # Project showcase
│   │   │   └── [slug]/            # Dynamic project detail pages
│   │   ├── learn/                  # Learning Management System
│   │   │   ├── paths/             # Learning paths
│   │   │   │   └── [slug]/
│   │   │   │       └── modules/
│   │   │   │           └── [moduleId]/  # Interactive modules
│   │   │   └── concepts/          # Concept pages
│   │   ├── contact/                # Contact form
│   │   ├── co-founder/             # Co-founder services
│   │   └── page.tsx                # Homepage
│   ├── api/                        # API routes
│   │   ├── contact/                # Contact form handler
│   │   ├── learn/                  # LMS API endpoints
│   │   │   ├── paths/             # Learning path data
│   │   │   ├── progress/          # Progress tracking
│   │   │   └── modules/           # Module content
│   │   └── health/                 # Health check endpoint
│   └── globals.css                 # Global styles
├── components/                     # React components
│   ├── learn/                     # Learning components
│   │   ├── ModuleRenderer.tsx    # MDX module renderer
│   │   ├── Quiz.tsx               # Interactive quizzes
│   │   ├── ProgressDashboard.tsx # Progress tracking
│   │   └── CodeValidation.tsx    # Code exercise validation
│   ├── blog/                      # Blog components
│   ├── ui/                        # UI components
│   └── *.test.tsx                 # Component tests
├── content/                        # Content management
│   ├── blog/                      # Blog posts (MDX)
│   │   ├── [locale]/published/
│   │   └── [locale]/draft/
│   ├── learn/                     # Learning content
│   │   ├── paths/                # Learning paths
│   │   │   ├── mcp-fundamentals/ # MCP course
│   │   │   ├── agentic-workflows/# Agent development
│   │   │   ├── production-ai/    # Production systems
│   │   │   ├── ai-systems-intro/ # Intro course
│   │   │   ├── claude-code-mastery/
│   │   │   ├── agent-memory-systems/
│   │   │   └── 12-factor-agent-development/
│   │   └── shared/                # Shared learning resources
│   ├── projects/                  # Project data (JSON)
│   │   ├── published/[locale]/
│   │   └── draft/
│   ├── summaries/                 # YouTube transcript summaries
│   └── socials/                   # Social media content
│       ├── linkedin/
│       └── dev-to/
├── lib/                           # Core libraries
│   ├── services/                 # External services
│   │   ├── email/               # Email service
│   │   ├── devto/               # Dev.to API
│   │   ├── youtube/             # YouTube transcripts
│   │   └── notion/              # Notion integration
│   ├── content/                  # Content processing
│   │   ├── blog/                # Blog utilities
│   │   ├── learning/            # LMS utilities
│   │   └── projects/            # Project utilities
│   ├── core/                    # Core infrastructure
│   │   ├── cache/               # Caching system
│   │   ├── environment/         # Environment config
│   │   ├── monitoring/          # Performance monitoring
│   │   └── security/            # Security utilities
│   └── client/                  # Client utilities
├── scripts/                      # Automation scripts
│   ├── translate-content.ts    # AI translation
│   ├── devto-publish.ts        # Dev.to publishing
│   ├── youtube-transcript.ts   # YouTube fetching
│   ├── test-notion-api.ts      # Notion testing
│   ├── validate-content.ts     # Content validation
│   ├── comprehensive-validation.ts
│   ├── test-email.ts           # Email testing
│   └── video-blog-mapping.ts   # Video to blog conversion
├── public/                      # Static assets
├── __tests__/                   # Test suites
├── __mocks__/                   # Test mocks
└── types/                       # TypeScript definitions
```

## 🎨 Tech Stack

### Core Technologies
- **Framework**: Next.js 15.3.3 (App Router)
- **Runtime**: React 19 with TypeScript 5.x
- **Styling**: Tailwind CSS 4.0 with custom dark theme
- **Content**: MDX for blog posts, JSON for projects
- **Internationalization**: next-intl for full i18n support
- **Testing**: Jest with React Testing Library
- **Email**: Resend API integration
- **Translation**: Claude AI-powered content translation

### Key Dependencies
- `@anthropic-ai/sdk` - AI translation system
- `next-intl` - Internationalization framework
- `react-hook-form` - Form validation
- `gray-matter` - MDX frontmatter parsing
- `resend` - Email service integration
- `prism-react-renderer` - Code syntax highlighting

### Design System

**Colors:**
- Background: `#0A0A0A` (Primary dark)
- Background Secondary: `#0D1B2A` (Card backgrounds)
- Foreground: `#F8F9FA` (Text)
- Primary: `#64FFDA` (Accent/links)
- Accent: `#415A77` (Secondary elements)

**Typography:**
- Headings: Inter (`@fontsource/inter`)
- Body: Source Sans Pro (`@fontsource/source-sans-pro`)
- Code: JetBrains Mono (`@fontsource/jetbrains-mono`)

## 🛠️ Development Commands

### Core Development
```bash
npm run dev              # Start dev server (localhost:3003)
npm run build            # Production build
npm run build:production # Production build (ignores ESLint warnings)
npm run start            # Start production server (port 3003)
npm run lint             # Run ESLint
npm run analyze          # Analyze bundle size
```

### Testing
```bash
npm test                 # Run all tests
npm test:watch          # Watch mode
npm test:coverage       # Generate coverage report

# Test specific files/patterns
npm test ComponentName.test.tsx
npm test -- Button
npm test -- --testPathPattern=components
npm test -- --updateSnapshot
```

### Content Management
```bash
npm run validate:content                  # Validate all content files
npx tsx scripts/comprehensive-validation.ts # Comprehensive validation
npx tsx scripts/test-error-boundaries.ts  # Test error boundaries
```

### Translation System
```bash
npm run translate:scan      # Scan for missing translations
npm run translate:priority  # Translate high-priority content
npm run translate:blog      # Translate blog posts only
npm run translate:learning  # Translate learning modules
npm run translate:all       # Translate all content
```

### Email Testing
```bash
npm run email:test          # Send test email
npm run email:test-contact  # Test contact form
npm run email:test-all      # Test all email addresses
npm run email:verify        # Verify configuration
npm run email:stress        # Stress test delivery
npm test:email:integration  # Production integration tests
```

### Dev.to Publishing
```bash
npm run devto:publish <file>    # Publish single article
npm run devto:update <file>     # Update existing article
npm run devto:unpublish <file>  # Unpublish article
npm run devto:publish-dir <dir> # Publish directory
npm run devto:sync              # Sync changed articles
npm run devto:list              # List published articles
npx tsx scripts/test-devto.ts   # Test Dev.to API
```

### YouTube Transcripts
```bash
npx tsx scripts/youtube-transcript.ts fetch <url>   # Fetch transcript
npx tsx scripts/youtube-transcript.ts update <url>  # Update existing
npx tsx scripts/youtube-transcript.ts list          # List all
npx tsx scripts/youtube-transcript.ts export <id>   # Export format
npx tsx scripts/youtube-transcript.ts search <term> # Search transcripts
npx tsx scripts/youtube-transcript.ts remove <id>   # Remove transcript
```

### Other Integrations
```bash
npx tsx scripts/test-notion-api.ts      # Test Notion API
npx tsx scripts/video-blog-mapping.ts   # Map videos to blogs
```

### Deployment
```bash
npm run build:prod      # Production build script
npm run deploy          # Deploy script
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run k8s:deploy      # Deploy to Kubernetes
npm run k8s:status      # Check pod status
```

## 🎓 Learning Management System

The portfolio includes a comprehensive LMS with:

### Available Learning Paths
- **AI Systems Introduction** (10 modules) - Beginner-friendly introduction
- **MCP Fundamentals** (5 modules) - Model Context Protocol basics
- **Agentic Workflows** (6 modules) - Building AI agents
- **Production AI** (5 modules) - Deployment and scaling
- **Claude Code Mastery** (7 modules) - Advanced Claude Code usage
- **Agent Memory Systems** (5 modules) - Memory architectures
- **12-Factor Agent Development** (5 modules) - Production patterns

### LMS Features
- **Interactive Modules**: MDX content with quizzes and exercises
- **Progress Tracking**: LocalStorage with API sync preparation
- **Custom Components**: Quiz, Callout, CodeExample, Diagram (Mermaid)
- **Multi-language**: Full English/Portuguese support with fallback
- **Module Types**: concept, theory, project, practice
- **30-Line Rule**: Code blocks optimized for comprehension

## 🌐 Internationalization

The site supports English (primary) and Portuguese (pt-BR) with:

- **Dynamic routing**: `/[locale]/...` pattern for all pages
- **Content separation**: Organized by locale in content directories
- **AI-powered translation**: Claude API for automated translation
- **Cultural adaptation**: Localized idioms and technical terms
- **SEO optimization**: Proper hreflang tags and locale-specific metadata
- **Route translations**: `/en/about` → `/pt-BR/sobre`

## 📧 Contact Form Setup

The contact form requires Resend API integration:

1. **Get Resend API Key**:
   - Sign up at [resend.com](https://resend.com)
   - Generate API key
   - Add to `.env.local`: `RESEND_API_KEY=your_key`

2. **Configure Email**:
   - Set `CONTACT_EMAIL` in `.env.local`
   - Verify domain in Resend dashboard

3. **Features**:
   - Form validation with React Hook Form
   - Rate limiting (5 requests per minute)
   - Toast notifications
   - Spam protection
   - Email templates

## 🚀 Production Deployment

### Recommended Platforms

1. **Vercel** (Recommended)
   - Native Next.js support
   - Automatic optimizations
   - Edge runtime support

2. **Netlify**
   - Good Next.js support
   - Easy domain management

3. **AWS Amplify**
   - Full control and customization

### Pre-Deployment Checklist

**Environment Variables:**
```bash
# Required
RESEND_API_KEY=prod_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=your-email@domain.com

# Analytics & Monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn
GOOGLE_SITE_VERIFICATION=verification_code

# Content Integrations (Optional)
DEV_TO_API_KEY=dev_to_api_key
ANTHROPIC_API_KEY=claude_api_key
YOUTUBE_API_KEY=youtube_api_key
NOTION_API_KEY=notion_api_key
NOTION_DATABASE_ID=database_id

# Build Settings
NODE_ENV=production
ESLINT_NO_DEV_ERRORS=true  # For Vercel
```

**Performance:**
- [ ] Run `npm run build` successfully
- [ ] Test all pages and functionality
- [ ] Verify email form works
- [ ] Check both language versions
- [ ] Test responsive design
- [ ] Validate SEO metadata

**Security:**
- [ ] Review CORS settings
- [ ] Verify rate limiting
- [ ] Check CSP headers
- [ ] Test contact form validation

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Configure environment variables in Vercel dashboard
# Set custom domain if needed
```

## 🧪 Testing Strategy

### Test Coverage
- **Components**: React Testing Library tests for all UI components
- **Utilities**: Jest tests for all utility functions
- **API Routes**: Tests for contact form and health endpoints
- **Translation**: Tests for translation system and i18n utilities
- **Performance**: Performance monitoring and optimization tests

### Running Tests
```bash
# Run all tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Test specific component
npm test -- Hero.test.tsx
```

## 📈 Performance & SEO

### Built-in Optimizations
- **Aggressive Code Splitting**: Separate chunks for React, Next.js, Monaco, large libs
- **WASM Support**: Async loading for WebAssembly modules
- **Image Optimization**: WebP/AVIF with device-specific sizes
- **Lazy Loading**: Learning components loaded on-demand with intersection observers
- **Bundle Management**: 500KB max chunk size, tree shaking enabled
- **Caching Strategy**:
  - Static assets: 1 year immutable
  - API responses: 60s with stale-while-revalidate
  - WASM modules: 1 day with stale-while-revalidate
  - Images: 7 days minimum cache TTL

### SEO Features
- **Dynamic Metadata**: Per-page title, description, OG tags
- **Structured Data**: JSON-LD for rich snippets
- **Dynamic Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Search engine directives
- **International SEO**: Proper hreflang implementation
- **Performance Monitoring**: Web Vitals attribution (CLS, LCP)

## 🔧 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Use production build to ignore ESLint warnings
npm run build:production

# Clear node modules if needed
rm -rf node_modules package-lock.json
npm install
```

**MDX/Learning Module Issues:**
- Escape curly braces in MDX: `\{` and `\}`
- Use `<CodeExample>` instead of HTML `<details>` tags
- Ensure all MDX components are imported
- Follow 30-line rule for code blocks
- Check Portuguese content fallback to English

**Email Form Not Working:**
- Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`
- Use domain-verified email for sender (not Gmail)
- Check Vercel function logs for `[EMAIL ERROR]` prefixes
- Test with `npm run email:test`

**Dev.to Publishing Issues:**
- Quote titles containing colons: `title: "Title: Subtitle"`
- Maximum 4 tags allowed per article
- Rate limit: ~30 requests per 30 seconds
- Check `.devto-mapping.json` for article IDs

**Bundle Size Warnings:**
- Normal for pages using Shiki/Monaco (lazy loaded)
- Run `npm run analyze` to investigate
- Check chunk splitting in `next.config.mjs`

### Node Version Requirement
**Important**: This project requires **Node.js 18.x** for Next.js 15 compatibility.

```bash
# Using nvm
nvm use 18

# Check version
node --version  # Should show v18.x.x
```

## 📚 Documentation

### Core Documentation
- **Development Guide**: `CLAUDE.md` - Comprehensive development patterns and commands
- **Architecture Docs**: `lib/CLAUDE.md` - Library services documentation hub
- **Content Guidelines**: 
  - `content/blog/CLAUDE.md` - Blog writing and MDX troubleshooting
  - `content/learn/CLAUDE.md` - Learning module creation guide
  - `content/summaries/CLAUDE.md` - YouTube transcript summaries
  - `content/socials/*/CLAUDE.md` - Social media content guides

### Service Documentation
- **Email Service**: `lib/services/CLAUDE.md`
- **Content System**: `lib/content/CLAUDE.md`
- **Core Infrastructure**: `lib/core/CLAUDE.md`
- **Client Utilities**: `lib/client/CLAUDE.md`

### Deployment & Operations
- **Production Readiness**: `docs/misc/PRODUCTION-READINESS-ASSESSMENT.md`
- **Deployment Checklist**: `docs/misc/DEPLOYMENT-CHECKLIST.md`
- **Operations Guide**: `docs/OPERATIONS.md`
- **API Documentation**: `docs/misc/API-DOCUMENTATION.md`

## 🚀 Tech Stack

### Core
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.0
- **Runtime**: React 19

### Content & Data
- **Blog**: MDX with syntax highlighting (Shiki)
- **Learning**: JSON metadata + MDX content
- **Database**: File-based (no DB required)
- **Caching**: In-memory LRU cache

### Integrations
- **Email**: Resend API
- **Translation**: Claude API (Anthropic)
- **Publishing**: Dev.to API
- **Video**: YouTube Data API v3
- **Content**: Notion API
- **Analytics**: Google Analytics
- **Monitoring**: Sentry

### Infrastructure
- **Deployment**: Vercel (optimized)
- **Containers**: Docker support
- **Orchestration**: Kubernetes configs
- **Testing**: Jest + React Testing Library

## 🤝 Contributing

This portfolio uses a multi-agent development approach with comprehensive testing and quality assurance. See the project documentation for development guidelines and contribution standards.

---

**Built with ❤️ by Brandon J. Redmond**  
*AI Engineer & Agentic Systems Architect*

**LinkedIn**: [linkedin.com/in/bredmond1019](https://www.linkedin.com/in/bredmond1019/)  
**GitHub**: [github.com/brandonredmond](https://github.com/brandonredmond)  
**Website**: [learn-agentic-ai.com](https://learn-agentic-ai.com)