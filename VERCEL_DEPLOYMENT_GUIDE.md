# Vercel Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Next.js portfolio application to Vercel with optimal performance and configuration.

## Pre-Deployment Checklist

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure the following required variables:

**Required for Production:**
```bash
# Deployment Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@your-domain.com
RESEND_TO_EMAIL=your-email@domain.com

# Security
CSRF_SECRET=your_random_csrf_secret_here
```

**Optional but Recommended:**
```bash
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-YOUR_GA_ID
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id

# Spam Protection
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. Build Verification

Test the production build locally:

```bash
# Clean build
rm -rf .next
npm run build

# Start production server
npm start
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ Main entrypoint < 800KB
- ✅ Contact form works (ToastProvider integrated)
- ✅ All pages render correctly

### 3. Code Quality Checks

```bash
# Run linting
npm run lint

# Run tests
npm test

# Type checking
npx tsc --noEmit
```

## Vercel Configuration

### 1. Project Setup

**Connect Repository:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the `portfolio` directory as the root

**Framework Preset:**
- Framework: `Next.js`
- Root Directory: `./portfolio` (if in monorepo)
- Node.js Version: `18.x`

### 2. Build Settings

Vercel automatically detects Next.js projects, but verify these settings:

```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": ".next",
  "installCommand": "npm ci --prefer-offline --no-audit",
  "framework": "nextjs",
  "nodeVersion": "18.x"
}
```

### 3. Environment Variables in Vercel

Add these environment variables in Vercel Dashboard:

**Production Environment:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
RESEND_API_KEY=re_your_actual_key
RESEND_FROM_EMAIL=noreply@your-domain.com
RESEND_TO_EMAIL=your@email.com
CSRF_SECRET=your_actual_secret
```

**Preview Environment (Optional):**
```
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://your-branch-preview.vercel.app
```

### 4. Domain Configuration

1. **Custom Domain:** Add your custom domain in Vercel settings
2. **SSL Certificate:** Automatically provisioned by Vercel
3. **DNS Records:** Configure as per Vercel instructions

## Deployment Process

### 1. Initial Deployment

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Automated Deployment

**Production Branch:**
- Push to `main` branch → Automatic production deployment
- Domain: `https://your-domain.vercel.app`

**Preview Deployments:**
- Push to any branch → Automatic preview deployment
- Domain: `https://branch-name-preview.vercel.app`

### 3. Manual Deployment

```bash
# Deploy current branch to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --target production
```

## Performance Optimizations

### 1. Bundle Size Optimizations

Our configuration includes:

- **Chunk Splitting:** Optimized for Vercel's 240KB limit
- **Code Splitting:** Async loading of heavy components
- **Tree Shaking:** Removes unused code
- **Compression:** Gzip/Brotli enabled

**Results:**
- Main entrypoint: ~719KB (down from 9.65MB)
- Individual pages: ~1MB average
- Static assets: Optimally cached

### 2. Caching Strategy

**Static Assets:**
- Images: 1 year cache
- JS/CSS: Immutable cache
- Fonts: 1 year cache

**API Routes:**
- Health endpoint: 5 minutes
- Contact form: No cache
- Metrics: 1 hour

### 3. Image Optimization

Configured for Vercel's image optimization:

```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  minimumCacheTTL: 604800, // 1 week
}
```

## Monitoring & Health Checks

### 1. Health Endpoints

**Available Endpoints:**
- `/api/health` - Application health
- `/api/metrics` - Performance metrics
- `/api/cache/status` - Cache status

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234567,
  "memory": { "used": 50, "total": 100 },
  "version": "1.0.0"
}
```

### 2. Analytics Integration

**Google Analytics:**
- Set `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
- Automatic page view tracking

**Vercel Analytics:**
- Enabled automatically in production
- Real user metrics available in dashboard

### 3. Error Monitoring

**Sentry Integration:**
- Set `SENTRY_DSN` for error tracking
- Automatic error reporting and performance monitoring

## Troubleshooting

### Common Issues

**1. Build Failures**

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**2. Environment Variables Not Working**
- Ensure variables are set in Vercel dashboard
- Check variable names (NEXT_PUBLIC_ prefix for client-side)
- Redeploy after adding variables

**3. Bundle Size Warnings**
- Check bundle analyzer: `npm run build` (warnings are normal if < 1MB)
- Large components should be lazy-loaded
- Consider code splitting for heavy dependencies

**4. Contact Form Issues**
- Verify RESEND_API_KEY is set
- Check email configuration
- Ensure ToastProvider is in layout

### Performance Issues

**1. Slow Build Times**
- Enable caching in Vercel settings
- Consider reducing bundle size
- Optimize image assets

**2. Slow Page Loads**
- Check bundle sizes in build output
- Verify CDN configuration
- Review lazy loading implementation

**3. API Timeouts**
- Check function timeout settings in vercel.json
- Optimize database queries
- Consider edge caching

## Security Considerations

### 1. Headers Configuration

Security headers are configured in `vercel.json`:

```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### 2. API Security

- CORS configured for specific origins
- Rate limiting on contact form
- CSRF protection enabled
- Input validation on all forms

### 3. Content Security

- SVG sanitization for user uploads
- XSS protection in MDX content
- Secure image optimization settings

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update

# Security audit
npm audit

# Test after updates
npm test && npm run build
```

### 2. Performance Monitoring

- Monitor Vercel analytics dashboard
- Check Core Web Vitals scores
- Review error rates and performance metrics

### 3. Content Updates

**Blog Posts:**
- Add MDX files to `content/blog/published/`
- Images go in `public/images/`
- Automatic deployment on push

**Projects:**
- Update JSON files in `content/projects/published/`
- Follow schema in `content/projects/schema/`

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Project README](./README.md)

### Contact
- Create issue in repository
- Check deployment logs in Vercel dashboard
- Review health check endpoints

---

Last Updated: 2024-12-22
Version: 1.0.0