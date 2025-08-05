# Monitoring & Logging Documentation

This directory provides comprehensive observability through structured logging, error tracking, and performance monitoring.

## Components Overview

### 📝 Logger (`logger.ts`)
Structured logging system with multiple levels and formats.

**Features:**
- Log levels: error, warn, info, debug
- Structured JSON output in production
- Pretty console output in development
- Contextual logging with metadata
- Safe error serialization

### 🚨 Error Logger (`error-logger.ts`)
Specialized error tracking and reporting.

**Features:**
- Component error boundary logging
- API error standardization
- Error context preservation
- Safe error messages for users
- Stack trace handling

### 📊 Monitoring (`monitoring.ts`)
Production monitoring and metrics collection.

**Features:**
- Performance tracking
- Custom metrics
- Error aggregation
- Health check endpoints
- Integration hooks for APM

### ⚡ Performance (`performance.ts`)
Performance measurement and optimization utilities.

**Features:**
- Operation timing
- Resource usage tracking
- Performance budgets
- Web Vitals collection
- Custom performance marks

## Logger Usage

### Basic Logging
```typescript
import { logger } from '@/lib/core/monitoring/logger'

// Simple messages
logger.info('User logged in')
logger.warn('API rate limit approaching')
logger.error('Database connection failed')
logger.debug('Cache hit for key: user:123')
```

### Structured Logging
```typescript
// With context
logger.info('Order processed', {
  orderId: '12345',
  userId: 'user-789',
  amount: 99.99,
  items: 3
})

// With error context
logger.error('Payment failed', {
  error,
  orderId: '12345',
  provider: 'stripe',
  attemptNumber: 2
})
```

### Conditional Logging
```typescript
// Debug only in development
logger.debug('Detailed trace', { 
  query: sqlQuery,
  params: queryParams 
})

// Log based on level
if (logger.isLevelEnabled('debug')) {
  const debugInfo = calculateExpensiveDebugInfo()
  logger.debug('Debug info', debugInfo)
}
```

## Error Logging

### Component Errors
```typescript
import { logComponentError } from '@/lib/core/monitoring/error-logger'

// In error boundary
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logComponentError({
    error,
    errorInfo,
    componentName: 'UserProfile',
    props: this.props
  })
}
```

### API Errors
```typescript
import { logAPIError } from '@/lib/core/monitoring/error-logger'

// In API route
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  logAPIError({
    error,
    endpoint: '/api/users',
    method: 'POST',
    body: req.body,
    headers: req.headers
  })
  
  return {
    error: 'Operation failed',
    message: getSafeErrorMessage(error)
  }
}
```

### Safe Error Messages
```typescript
import { getSafeErrorMessage } from '@/lib/core/monitoring/error-logger'

// Never expose internals to users
const userMessage = getSafeErrorMessage(error)
// Returns generic message in production
// Returns detailed message in development
```

## Performance Monitoring

### Operation Timing
```typescript
import { startTimer, measureAsync } from '@/lib/core/monitoring/performance'

// Manual timing
const timer = startTimer('database.query')
const result = await db.query(sql)
timer.end() // Logs: "database.query took 45ms"

// Automatic timing
const result = await measureAsync(
  'api.fetch',
  () => fetch('/api/data')
)
```

### Performance Budgets
```typescript
import { checkPerformanceBudget } from '@/lib/core/monitoring/performance'

// Define budgets
const budgets = {
  'api.response': 200,    // 200ms max
  'db.query': 50,         // 50ms max
  'render.page': 100      // 100ms max
}

// Check performance
const timer = startTimer('api.response')
const response = await processRequest()
timer.end()

checkPerformanceBudget('api.response', budgets)
// Warns if exceeded
```

### Web Vitals
```typescript
import { trackWebVitals } from '@/lib/core/monitoring/performance'

// In _app.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVitals(metric)
}

// Tracks: FCP, LCP, CLS, FID, TTFB
```

## Production Monitoring

### Metrics Collection
```typescript
import { metrics } from '@/lib/core/monitoring/monitoring'

// Count events
metrics.increment('user.signup')
metrics.increment('api.calls', { endpoint: '/users' })

// Track values
metrics.gauge('queue.size', queue.length)
metrics.histogram('response.time', responseTime)

// Track errors
metrics.incrementError('payment.failed', { 
  provider: 'stripe',
  code: 'card_declined' 
})
```

### Health Checks
```typescript
import { createHealthCheck } from '@/lib/core/monitoring/monitoring'

// Define health check
export const healthCheck = createHealthCheck({
  name: 'api',
  checks: {
    database: async () => {
      await db.ping()
      return { status: 'healthy' }
    },
    cache: async () => {
      await cache.get('health')
      return { status: 'healthy' }
    },
    external: async () => {
      const response = await fetch('https://api.example.com/health')
      return { 
        status: response.ok ? 'healthy' : 'unhealthy',
        latency: response.headers.get('x-response-time')
      }
    }
  }
})

// In API route
export async function GET() {
  const health = await healthCheck.run()
  return NextResponse.json(health)
}
```

### Error Aggregation
```typescript
import { errorReporter } from '@/lib/core/monitoring/monitoring'

// Aggregate similar errors
errorReporter.report(error, {
  groupBy: ['message', 'code'],
  context: {
    userId: session.userId,
    requestId: req.headers.get('x-request-id')
  }
})

// Get error statistics
const stats = errorReporter.getStats()
// { total: 142, unique: 23, byType: {...} }
```

## Configuration

### Log Levels
```typescript
// Set via environment
LOG_LEVEL=debug npm run dev

// Or programmatically
logger.setLevel('debug')

// Levels: error < warn < info < debug
```

### Log Formatting
```typescript
// Development (pretty print)
[2024-01-15 10:30:45] INFO: User logged in
  userId: "user-123"
  email: "user@example.com"

// Production (JSON)
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"User logged in","userId":"user-123","email":"user@example.com"}
```

### Integration Options
```typescript
// Sentry integration
if (process.env.SENTRY_DSN) {
  logger.addTransport(new SentryTransport({
    dsn: process.env.SENTRY_DSN,
    level: 'error'
  }))
}

// Custom transport
logger.addTransport(new CustomTransport({
  send: async (log) => {
    await sendToElasticsearch(log)
  }
}))
```

## Best Practices

### 1. Use Appropriate Levels
```typescript
// Error: Actionable problems
logger.error('Database connection lost', { error })

// Warn: Potential issues
logger.warn('Rate limit 80% reached', { userId })

// Info: Important events
logger.info('Order completed', { orderId })

// Debug: Development details
logger.debug('Cache miss', { key, reason })
```

### 2. Include Context
```typescript
// Good: Includes relevant context
logger.error('Payment failed', {
  orderId,
  amount,
  currency,
  provider,
  errorCode: error.code
})

// Bad: No context
logger.error('Payment failed')
```

### 3. Don't Log Sensitive Data
```typescript
// Good: Sanitize sensitive data
logger.info('User login', {
  userId: user.id,
  email: maskEmail(user.email),
  // Don't log: password, tokens, credit cards
})

// Use sanitizers
const sanitized = sanitizeLogData(data, [
  'password',
  'creditCard',
  'ssn'
])
```

### 4. Use Structured Data
```typescript
// Good: Structured for querying
logger.info('API request', {
  method: 'POST',
  path: '/api/users',
  statusCode: 200,
  duration: 145,
  userId: 'user-123'
})

// Bad: Unstructured string
logger.info(`POST /api/users 200 145ms user-123`)
```

## Testing

### Mock Logger in Tests
```typescript
// Mock all logging in tests
jest.mock('@/lib/core/monitoring/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}))

// Verify logging
expect(logger.error).toHaveBeenCalledWith(
  'Payment failed',
  expect.objectContaining({ orderId: '123' })
)
```

### Test Performance
```typescript
// Test with performance assertions
test('query completes within budget', async () => {
  const start = Date.now()
  await performQuery()
  const duration = Date.now() - start
  
  expect(duration).toBeLessThan(100) // 100ms budget
})
```

## Production Debugging

### Enable Debug Logs
```typescript
// Temporarily enable debug logs
logger.setLevel('debug', {
  duration: 1000 * 60 * 5 // 5 minutes
})

// Or for specific components
logger.setComponentLevel('database', 'debug')
```

### Correlation IDs
```typescript
// Track requests across services
const correlationId = req.headers.get('x-correlation-id') || 
  crypto.randomUUID()

logger.info('Request started', { correlationId })

// Pass to other services
fetch('/api/downstream', {
  headers: {
    'x-correlation-id': correlationId
  }
})
```