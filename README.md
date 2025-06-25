# AI Engineer Portfolio

**Brandon J. Redmond - AI Engineer & Agentic Systems Architect**

A modern, production-ready portfolio website showcasing AI engineering expertise, built with Next.js 15, TypeScript, and Tailwind CSS. Features comprehensive internationalization (English/Portuguese), advanced content management, and professional deployment configurations.

## ✨ Key Features

- **🌐 Internationalization**: Full English/Portuguese support with dynamic content translation
- **📱 Responsive Design**: Mobile-first approach with dark theme
- **📝 Content Management**: MDX blog posts and JSON-based project data
- **🧪 Testing**: Comprehensive test suite with Jest and React Testing Library
- **🚀 Performance**: Optimized for Core Web Vitals and SEO
- **📧 Contact Form**: Integrated email functionality with Resend
- **🔍 SEO**: Advanced SEO with structured data, sitemap, and metadata
- **⚡ Translation System**: AI-powered content translation with caching
- **📊 Analytics Ready**: Google Analytics and error tracking integration

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

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

**Development server**: [http://localhost:3000](http://localhost:3000)

### Environment Variables

Required for full functionality:

```bash
# Required: Email functionality
RESEND_API_KEY=your_resend_api_key_here
CONTACT_EMAIL=your-email@domain.com

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn_here
```

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── [locale]/              # Internationalized routes (en/pt)
│   │   ├── about/            # About page
│   │   ├── blog/             # Blog listing and posts
│   │   │   └── [slug]/       # Dynamic blog post pages
│   │   ├── projects/         # Project showcase
│   │   │   └── [slug]/       # Dynamic project detail pages
│   │   ├── learn/            # Learning resources
│   │   ├── contact/          # Contact form
│   │   ├── co-founder/       # Co-founder services
│   │   └── page.tsx          # Homepage
│   ├── api/                  # API routes
│   │   ├── contact/          # Contact form handler
│   │   └── health/           # Health check endpoint
│   └── globals.css           # Global styles
├── components/               # React components with tests
│   ├── Navigation.tsx        # Multi-language navigation
│   ├── Hero.tsx             # Homepage hero section
│   ├── ProjectCard.tsx      # Project showcase cards
│   ├── ContactForm.tsx      # Contact form with validation
│   ├── Toast.tsx            # Notification system
│   └── *.test.tsx           # Component tests
├── content/                 # Content management
│   ├── blog/
│   │   ├── en/published/    # English blog posts (MDX)
│   │   └── pt/published/    # Portuguese blog posts (MDX)
│   ├── projects/
│   │   ├── en/published/    # English project data (JSON)
│   │   └── pt/published/    # Portuguese project data (JSON)
│   └── translations/        # UI translations
├── lib/                     # Utilities and business logic
│   ├── mdx.server.ts       # Server-side MDX processing
│   ├── projects.ts         # Project data management
│   ├── claude-translator.ts # AI translation system
│   ├── email.ts            # Email service integration
│   ├── i18n.ts             # Internationalization
│   └── *.test.ts           # Utility tests
├── scripts/                # Build and translation scripts
│   ├── translate-content.ts # Content translation automation
│   └── manage-translations.ts # Translation management
├── public/                 # Static assets
│   ├── images/            # Optimized images
│   ├── robots.txt         # SEO robots file
│   └── manifest.json      # PWA manifest
└── types/                 # TypeScript type definitions
    └── project.ts         # Project data types
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
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Test specific files
npm test -- ComponentName.test.tsx
npm test -- --testNamePattern="specific test name"
```

### Translation System
```bash
npm run translate:status    # Check translation status
npm run translate:blog      # Translate blog posts
npm run translate:projects  # Translate project data
npm run translate:all       # Translate all content
npm run translate:validate  # Validate translations
npm run translate:costs     # Check translation costs
```

## 🌐 Internationalization

The site supports English (primary) and Portuguese with:

- **Dynamic routing**: `/en/...` and `/pt/...`
- **Content translation**: Separate content files per language
- **UI translations**: JSON-based translation files
- **AI-powered translation**: Automated content translation with Claude
- **SEO optimization**: Proper hreflang and metadata per locale

### Adding New Languages

1. Add locale to `i18n.ts`
2. Create translation files in `content/translations/`
3. Add content directories in `content/blog/[locale]/` and `content/projects/[locale]/`
4. Update navigation and metadata

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
RESEND_API_KEY=prod_api_key
CONTACT_EMAIL=your-email@domain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=your_sentry_dsn
NODE_ENV=production
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
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: Pre-rendered pages for better performance
- **Font Optimization**: Self-hosted fonts with font-display swap
- **Bundle Analysis**: Webpack optimizations for production

### SEO Features
- **Dynamic Metadata**: Per-page title, description, and OG tags
- **Structured Data**: JSON-LD for rich snippets
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Search engine directives
- **International SEO**: Proper hreflang implementation

## 🔧 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node modules if needed
rm -rf node_modules package-lock.json
npm install
```

**Translation Issues:**
```bash
# Check translation status
npm run translate:status

# Validate translations
npm run translate:validate

# Clear translation cache
npm run translate:cache
```

**Email Form Not Working:**
- Verify `RESEND_API_KEY` in `.env.local`
- Check domain verification in Resend dashboard
- Ensure `CONTACT_EMAIL` is set correctly

### Node Version Requirement
**Important**: This project requires **Node.js 18.x** for Next.js 15 compatibility.

```bash
# Using nvm
nvm use 18

# Check version
node --version  # Should show v18.x.x
```

## 📚 Additional Resources

- **Architecture Guide**: See `CLAUDE.md` for development patterns
- **Production Readiness**: Check `PRODUCTION-READINESS-ASSESSMENT.md`
- **Deployment Guide**: Review `DEPLOYMENT-CHECKLIST.md`
- **API Documentation**: `/api/health` for health checks

## 🤝 Contributing

This portfolio uses a multi-agent development approach with comprehensive testing and quality assurance. See the project documentation for development guidelines and contribution standards.

---

**Built with ❤️ by Brandon J. Redmond**  
*AI Engineer & Agentic Systems Architect*