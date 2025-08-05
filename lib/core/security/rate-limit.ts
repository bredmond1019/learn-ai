import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries on each check (for Edge Runtime compatibility)
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10) // 5 requests default
  }
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get the real IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP or fall back to a default
  const ip = forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'
  
  // You could also combine with user agent for more granular limiting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.substring(0, 50)}` // Limit user agent length
}

export function checkRateLimit(identifier: string, config?: RateLimitConfig): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  // Clean up expired entries first
  cleanupExpiredEntries()
  
  const { windowMs, maxRequests } = config || getRateLimitConfig()
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStore.set(identifier, entry)
  }
  
  // Check if request is allowed
  const allowed = entry.count < maxRequests
  
  if (allowed) {
    entry.count++
  }
  
  return {
    allowed,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime
  }
}

// Middleware helper for rate limiting
export async function rateLimitMiddleware(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const identifier = getClientIdentifier(request)
  const { allowed, remaining, resetTime } = checkRateLimit(identifier)
  
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX_REQUESTS || '5',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  // Add rate limit headers to successful responses
  const response = await handler()
  
  response.headers.set('X-RateLimit-Limit', process.env.RATE_LIMIT_MAX_REQUESTS || '5')
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
  
  return response
}