# Security Module Documentation

This module provides security utilities to protect the application from common threats and abuse.

## Overview

The security module currently focuses on:
- Rate limiting for API endpoints
- Request throttling
- Memory-efficient implementation
- Configurable limits per endpoint

## Core Components

### `rate-limit.ts`
In-memory rate limiting implementation for API protection.

**Key Features:**
- Token bucket algorithm
- Per-IP or per-identifier limiting
- Configurable time windows
- Memory-efficient storage
- Automatic cleanup

## Rate Limiting

### Basic Usage
```typescript
import { rateLimitMiddleware } from '@/lib/core/security/rate-limit'

// In API route
export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(req, {
    limit: 5,
    window: 60 * 1000 // 1 minute
  })
  
  if (!rateLimitResult.success) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': String(rateLimitResult.retryAfter)
      }
    })
  }
  
  // Process request
  return handleRequest(req)
}
```

### Configuration Options
```typescript
interface RateLimitConfig {
  limit: number           // Max requests per window
  window: number          // Time window in ms
  identifier?: string     // Custom identifier (default: IP)
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}
```

### Custom Identifiers
```typescript
// Rate limit by user ID
const userId = await getUserId(req)
const result = await rateLimitMiddleware(req, {
  limit: 100,
  window: 60 * 60 * 1000, // 1 hour
  identifier: userId
})

// Rate limit by API key
const apiKey = req.headers.get('x-api-key')
const result = await rateLimitMiddleware(req, {
  limit: 1000,
  window: 60 * 60 * 1000,
  identifier: `api:${apiKey}`
})
```

### Multiple Rate Limits
```typescript
// Apply different limits
const limits = [
  { limit: 10, window: 60 * 1000 },        // 10 per minute
  { limit: 100, window: 60 * 60 * 1000 },  // 100 per hour
  { limit: 1000, window: 24 * 60 * 60 * 1000 } // 1000 per day
]

for (const config of limits) {
  const result = await rateLimitMiddleware(req, config)
  if (!result.success) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(config.limit),
        'X-RateLimit-Window': String(config.window),
        'X-RateLimit-Remaining': String(result.remaining || 0),
        'Retry-After': String(result.retryAfter)
      }
    })
  }
}
```

## Implementation Details

### Token Bucket Algorithm
```typescript
// Each identifier gets a bucket
interface TokenBucket {
  tokens: number        // Available tokens
  lastRefill: number    // Last refill timestamp
}

// Tokens refill over time
function refillBucket(bucket: TokenBucket, config: RateLimitConfig) {
  const now = Date.now()
  const timePassed = now - bucket.lastRefill
  const tokensToAdd = (timePassed / config.window) * config.limit
  
  bucket.tokens = Math.min(
    config.limit,
    bucket.tokens + tokensToAdd
  )
  bucket.lastRefill = now
}
```

### Memory Management
```typescript
// Automatic cleanup of old entries
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour

setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of rateLimitStore) {
    if (now - bucket.lastRefill > CLEANUP_INTERVAL) {
      rateLimitStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL)
```

### Client Identification
```typescript
export function getClientIdentifier(req: Request): string {
  // Priority order for identification
  
  // 1. Forwarded IP (Vercel)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  // 2. Real IP header
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // 3. CF Connecting IP (Cloudflare)
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }
  
  // 4. Fallback to a generic identifier
  return 'anonymous'
}
```

## Rate Limit Strategies

### Endpoint-Specific Limits
```typescript
// Different limits for different endpoints
const endpointLimits = {
  '/api/contact': { limit: 5, window: 60 * 60 * 1000 },      // 5 per hour
  '/api/auth/login': { limit: 10, window: 15 * 60 * 1000 },  // 10 per 15 min
  '/api/data': { limit: 100, window: 60 * 1000 },            // 100 per minute
  '/api/ai/generate': { limit: 10, window: 60 * 60 * 1000 }  // 10 per hour
}

export function getEndpointLimit(pathname: string) {
  return endpointLimits[pathname] || {
    limit: 60,
    window: 60 * 1000 // Default: 60 per minute
  }
}
```

### User-Based Limits
```typescript
// Different limits for different user tiers
const userTierLimits = {
  free: { limit: 10, window: 60 * 60 * 1000 },
  pro: { limit: 100, window: 60 * 60 * 1000 },
  enterprise: { limit: 1000, window: 60 * 60 * 1000 }
}

export async function getUserRateLimit(userId: string) {
  const user = await getUser(userId)
  return userTierLimits[user.tier] || userTierLimits.free
}
```

### Conditional Rate Limiting
```typescript
// Skip rate limiting for certain conditions
export async function shouldSkipRateLimit(req: Request) {
  // Skip for internal services
  if (req.headers.get('x-internal-service') === process.env.INTERNAL_KEY) {
    return true
  }
  
  // Skip for admin users
  const user = await getUser(req)
  if (user?.role === 'admin') {
    return true
  }
  
  return false
}
```

## Response Headers

### Standard Headers
```typescript
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  config: RateLimitConfig
) {
  const headers = new Headers(response.headers)
  
  // Standard headers
  headers.set('X-RateLimit-Limit', String(config.limit))
  headers.set('X-RateLimit-Remaining', String(result.remaining || 0))
  headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString())
  
  // Retry after (when limited)
  if (!result.success) {
    headers.set('Retry-After', String(Math.ceil(result.retryAfter / 1000)))
  }
  
  return new Response(response.body, {
    status: response.status,
    headers
  })
}
```

## Testing Rate Limits

### Unit Tests
```typescript
describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store
    clearRateLimitStore()
  })
  
  test('allows requests within limit', async () => {
    const config = { limit: 3, window: 1000 }
    
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit('test-ip', config)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(2 - i)
    }
  })
  
  test('blocks requests over limit', async () => {
    const config = { limit: 1, window: 1000 }
    
    // First request succeeds
    let result = await checkRateLimit('test-ip', config)
    expect(result.success).toBe(true)
    
    // Second request fails
    result = await checkRateLimit('test-ip', config)
    expect(result.success).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })
})
```

### Integration Tests
```typescript
test('API endpoint respects rate limits', async () => {
  const requests = Array(6).fill(null).map(() => 
    fetch('/api/contact', { method: 'POST', body: '{}' })
  )
  
  const responses = await Promise.all(requests)
  
  // First 5 should succeed
  expect(responses.slice(0, 5).every(r => r.status === 200)).toBe(true)
  
  // 6th should be rate limited
  expect(responses[5].status).toBe(429)
  expect(responses[5].headers.get('Retry-After')).toBeTruthy()
})
```

## Best Practices

### 1. Set Appropriate Limits
```typescript
// Consider the operation cost
const limits = {
  // Expensive operations: strict limits
  '/api/ai/generate': { limit: 10, window: 3600000 },
  
  // Cheap operations: relaxed limits  
  '/api/health': { limit: 1000, window: 60000 },
  
  // Sensitive operations: very strict
  '/api/auth/reset-password': { limit: 3, window: 3600000 }
}
```

### 2. Provide Clear Feedback
```typescript
if (!rateLimitResult.success) {
  return new Response(JSON.stringify({
    error: 'Too many requests',
    message: `Please retry after ${Math.ceil(rateLimitResult.retryAfter / 1000)} seconds`,
    retryAfter: rateLimitResult.retryAfter
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(Math.ceil(rateLimitResult.retryAfter / 1000))
    }
  })
}
```

### 3. Monitor Rate Limiting
```typescript
import { logger } from '@/lib/core/monitoring/logger'

// Log rate limit hits
if (!result.success) {
  logger.warn('Rate limit exceeded', {
    identifier: clientId,
    endpoint: req.url,
    limit: config.limit,
    window: config.window
  })
}
```

### 4. Consider Distributed Systems
```typescript
// For production with multiple servers
// Consider using Redis or similar
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function checkDistributedRateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  const key = `ratelimit:${identifier}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(config.window / 1000))
  }
  
  return {
    success: current <= config.limit,
    remaining: Math.max(0, config.limit - current),
    resetAt: Date.now() + (await redis.ttl(key)) * 1000
  }
}
```

## Future Enhancements

Potential security additions:
- CSRF protection
- Input validation utilities  
- SQL injection prevention
- XSS protection helpers
- Authentication utilities
- API key management
- IP allowlisting/blocklisting
- DDoS protection
- Request signing