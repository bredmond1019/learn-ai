# Vercel Deployment Troubleshooting Guide

## Common Build Issues

### 1. Build Timeouts

**Symptoms:**
- Build process times out after 45 minutes
- "Build exceeded maximum duration" error

**Solutions:**
```bash
# Reduce build time
npm ci --prefer-offline --no-audit

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Vercel-specific optimizations:**
- Enable build cache in project settings
- Use `output: 'standalone'` for Docker deployments only
- Optimize webpack configuration for faster builds

### 2. Out of Memory Errors

**Symptoms:**
- "JavaScript heap out of memory" error
- Build process killed

**Solutions:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Optimize bundle splitting
# Check next.config.mjs for chunk size limits
```

**Vercel Configuration:**
```json
{
  "functions": {
    "app/**": {
      "memory": 1024
    }
  }
}
```

### 3. TypeScript Errors

**Symptoms:**
- Build fails with TypeScript compilation errors
- "Type error" messages during build

**Solutions:**
```bash
# Check types locally
npx tsc --noEmit

# Fix common issues
npm install @types/node @types/react @types/react-dom

# Verify tsconfig.json paths
```

**Common fixes:**
```typescript
// Missing type declarations
npm install --save-dev @types/react-syntax-highlighter

// Path resolution issues
"paths": {
  "@/*": ["./*"]
}
```

## Runtime Errors

### 1. Environment Variable Issues

**Symptoms:**
- "undefined" values for environment variables
- Features not working in production

**Diagnostics:**
```bash
# Check if variables are set
console.log(process.env.NEXT_PUBLIC_APP_URL)

# Verify in Vercel dashboard
vercel env ls
```

**Solutions:**
- Add variables in Vercel dashboard
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables
- Check variable scope (Production/Preview/Development)

### 2. Contact Form Not Working

**Symptoms:**
- Form submission fails
- Email not sent
- Toast notifications not showing

**Diagnostics:**
```bash
# Check API endpoint
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'

# Check logs in Vercel dashboard
```

**Solutions:**
```javascript
// Verify RESEND_API_KEY is set
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY not configured')
}

// Check ToastProvider is in layout
// app/layout.tsx should wrap children with ToastProvider
```

### 3. 404 Errors on Dynamic Routes

**Symptoms:**
- Blog posts return 404
- Project pages not found
- Routes work locally but not in production

**Solutions:**
```bash
# Verify file structure
ls -la app/blog/[slug]/
ls -la content/blog/published/

# Check file naming conventions
# Files should be: page.tsx, not Page.tsx
```

**Route debugging:**
```javascript
// Add logging to dynamic routes
export async function generateStaticParams() {
  const posts = await getPosts()
  console.log('Generated params:', posts.map(p => p.slug))
  return posts.map(p => ({ slug: p.slug }))
}
```

## Performance Issues

### 1. Large Bundle Sizes

**Symptoms:**
- Bundle size warnings during build
- Slow page loads
- High bandwidth usage

**Diagnostics:**
```bash
# Analyze bundle
npm run build
# Check output for size warnings

# Use bundle analyzer (if configured)
ANALYZE=true npm run build
```

**Solutions:**
```javascript
// next.config.mjs optimizations
module.exports = {
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns']
  },
  webpack: (config) => {
    config.optimization.splitChunks.maxSize = 240000 // 240KB for Vercel
    return config
  }
}
```

### 2. Slow Cold Starts

**Symptoms:**
- First request takes several seconds
- API functions timeout

**Solutions:**
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Optimization techniques:**
- Reduce function bundle size
- Use edge functions for simple operations
- Implement caching strategies

### 3. Image Loading Issues

**Symptoms:**
- Images not loading
- Slow image optimization
- Layout shift

**Solutions:**
```javascript
// next.config.mjs
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000
  }
}
```

## API Issues

### 1. Function Timeouts

**Symptoms:**
- API requests timeout
- 504 Gateway Timeout errors

**Solutions:**
```json
// vercel.json - Increase timeout
{
  "functions": {
    "app/api/slow-endpoint/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Code optimizations:**
```javascript
// Implement timeout handling
export async function POST(request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)
  
  try {
    const result = await fetch(url, { 
      signal: controller.signal 
    })
    clearTimeout(timeoutId)
    return result
  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response('Request timeout', { status: 408 })
    }
    throw error
  }
}
```

### 2. CORS Issues

**Symptoms:**
- Cross-origin request blocked
- API calls fail from browser

**Solutions:**
```javascript
// app/api/*/route.ts
export async function GET(request) {
  const response = NextResponse.json(data)
  response.headers.set('Access-Control-Allow-Origin', 'https://your-domain.com')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  return response
}
```

### 3. Rate Limiting Issues

**Symptoms:**
- Too Many Requests (429) errors
- API calls being blocked

**Solutions:**
```javascript
// Implement proper rate limiting
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request) {
  const result = await rateLimit(request)
  if (!result.success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  // Process request
}
```

## Security Issues

### 1. CSP Violations

**Symptoms:**
- Content Security Policy errors in console
- Scripts/styles not loading

**Solutions:**
```javascript
// next.config.mjs
module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
      }]
    }]
  }
}
```

### 2. HTTPS Issues

**Symptoms:**
- Mixed content warnings
- Insecure requests blocked

**Solutions:**
- Ensure all external resources use HTTPS
- Use relative URLs where possible
- Configure proper redirects in vercel.json

## Monitoring & Debugging

### 1. Enable Debug Logging

```javascript
// Add to pages for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { props, params })
}
```

### 2. Health Check Endpoint

```javascript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    memory: process.memoryUsage()
  })
}
```

### 3. Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Emergency Procedures

### 1. Quick Rollback

```bash
# From Vercel dashboard
1. Go to Deployments tab
2. Find last working deployment
3. Click "Promote to Production"

# From CLI
vercel rollback <deployment-url>
```

### 2. Temporary Maintenance Page

```javascript
// app/page.tsx (temporary replacement)
export default function Maintenance() {
  return (
    <div className="maintenance">
      <h1>Site Under Maintenance</h1>
      <p>We'll be back shortly.</p>
    </div>
  )
}
```

### 3. Disable Problematic Features

```javascript
// Feature flags for quick disabling
const FEATURES = {
  contactForm: process.env.FEATURE_CONTACT_ENABLED !== 'false',
  analytics: process.env.FEATURE_ANALYTICS_ENABLED !== 'false'
}
```

## Getting Help

### 1. Vercel Support
- Check [Vercel Status Page](https://vercel-status.com/)
- Contact support through dashboard
- Check [Vercel Community](https://github.com/vercel/vercel/discussions)

### 2. Debug Information to Collect
- Deployment URL
- Build logs (from Vercel dashboard)
- Function logs (from Vercel dashboard)
- Error messages (with timestamps)
- Browser console errors
- Network tab information

### 3. Useful Commands

```bash
# Get deployment info
vercel inspect <deployment-url>

# Check function logs
vercel logs <deployment-url>

# List deployments
vercel ls

# Check environment variables
vercel env ls
```

---

**Remember:**
- Always check Vercel status page first
- Collect logs before reporting issues
- Test changes in preview environment
- Keep emergency rollback procedure handy

Last Updated: 2024-12-22