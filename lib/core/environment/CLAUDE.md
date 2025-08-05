# Environment Configuration Documentation

This module provides centralized environment variable management with type safety and validation.

## Overview

The environment configuration system provides:
- Type-safe environment variable access
- Validation and default values
- Feature flag management
- Environment-specific configurations
- Security best practices

## Core Components

### `env.ts`
Central environment configuration and validation.

**Key Exports:**
```typescript
// Environment variables
export const env = {
  // Email configuration
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL,
  
  // API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  DEV_TO_API_KEY: process.env.DEV_TO_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  
  // Analytics & Monitoring
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
  
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
}

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
```

## Environment Detection

### Environment Types
```typescript
type Environment = 'development' | 'production' | 'test' | 'preview'

export function getEnvironment(): Environment {
  if (env.NODE_ENV === 'test') return 'test'
  if (env.VERCEL_ENV === 'preview') return 'preview'
  if (env.NODE_ENV === 'production') return 'production'
  return 'development'
}
```

### Environment-Specific Config
```typescript
export const config = {
  development: {
    debug: true,
    apiTimeout: 30000,
    cacheEnabled: false,
  },
  production: {
    debug: false,
    apiTimeout: 10000,
    cacheEnabled: true,
  },
  test: {
    debug: false,
    apiTimeout: 5000,
    cacheEnabled: false,
  }
}[getEnvironment()]
```

## Validation

### Email Configuration
```typescript
export function validateEmailConfig(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is required')
  }
  
  if (!env.RESEND_FROM_EMAIL) {
    errors.push('RESEND_FROM_EMAIL is required')
  } else if (!isValidEmail(env.RESEND_FROM_EMAIL)) {
    errors.push('RESEND_FROM_EMAIL must be a valid email')
  }
  
  if (!env.CONTACT_EMAIL) {
    errors.push('CONTACT_EMAIL is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### API Key Validation
```typescript
export function hasRequiredAPIKeys(): boolean {
  const required = ['RESEND_API_KEY']
  const optional = ['ANTHROPIC_API_KEY', 'DEV_TO_API_KEY']
  
  // Check required keys
  for (const key of required) {
    if (!env[key]) {
      console.warn(`Missing required API key: ${key}`)
      return false
    }
  }
  
  // Warn about optional keys
  for (const key of optional) {
    if (!env[key]) {
      console.info(`Optional API key not configured: ${key}`)
    }
  }
  
  return true
}
```

## Feature Flags

### Flag Management
```typescript
export const features = {
  // Feature flags from environment
  enableAnalytics: isProduction && !!env.NEXT_PUBLIC_GA_ID,
  enableErrorTracking: isProduction && !!env.SENTRY_DSN,
  enableEmailService: !!env.RESEND_API_KEY,
  enableTranslation: !!env.ANTHROPIC_API_KEY,
  enableDevToIntegration: !!env.DEV_TO_API_KEY,
  
  // Environment-based flags
  enableDebugLogging: isDevelopment,
  enableCaching: isProduction,
  enableRateLimiting: !isTest,
}
```

### Using Feature Flags
```typescript
import { features } from '@/lib/core/environment/env'

if (features.enableAnalytics) {
  // Initialize Google Analytics
  initGA(env.NEXT_PUBLIC_GA_ID)
}

if (features.enableErrorTracking) {
  // Initialize Sentry
  initSentry(env.SENTRY_DSN)
}
```

## Security Considerations

### Public vs Private Variables
```typescript
// Public (client-safe) - prefixed with NEXT_PUBLIC_
export const publicEnv = {
  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
}

// Private (server-only)
export const privateEnv = {
  API_KEYS: {
    resend: env.RESEND_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY,
  }
}
```

### Safe Error Messages
```typescript
export function getPublicEnvInfo() {
  return {
    environment: getEnvironment(),
    features: {
      analytics: features.enableAnalytics,
      email: features.enableEmailService,
      translation: features.enableTranslation,
    },
    // Never expose private keys
    configured: {
      email: !!env.RESEND_API_KEY,
      translation: !!env.ANTHROPIC_API_KEY,
    }
  }
}
```

## Loading Configuration

### Initialization Order
```typescript
// 1. Load environment variables
const env = loadEnvironment()

// 2. Validate required variables
validateEnvironment(env)

// 3. Initialize features
const features = initializeFeatures(env)

// 4. Configure services
configureServices(env, features)
```

### Lazy Loading
```typescript
// Load configuration only when needed
let emailConfig: EmailConfig | null = null

export function getEmailConfig(): EmailConfig {
  if (!emailConfig) {
    emailConfig = {
      apiKey: env.RESEND_API_KEY!,
      fromEmail: env.RESEND_FROM_EMAIL!,
      contactEmail: env.CONTACT_EMAIL!,
    }
  }
  return emailConfig
}
```

## Development Helpers

### Environment File Template
```bash
# .env.local.example
# Required for production
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=contact@example.com
RESEND_FROM_EMAIL="Name <noreply@example.com>"

# Optional features
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
DEV_TO_API_KEY=xxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Debug Utilities
```typescript
export function debugEnvironment() {
  if (!isDevelopment) return
  
  console.log('Environment Configuration:')
  console.log('- Environment:', getEnvironment())
  console.log('- Features:', features)
  console.log('- Missing optional keys:', getMissingOptionalKeys())
}
```

## Testing

### Mocking Environment
```typescript
// In tests
jest.mock('@/lib/core/environment/env', () => ({
  env: {
    NODE_ENV: 'test',
    RESEND_API_KEY: 'test-key',
    CONTACT_EMAIL: 'test@example.com',
  },
  isTest: true,
  isDevelopment: false,
  isProduction: false,
}))
```

### Environment Validation Tests
```typescript
describe('Environment Configuration', () => {
  test('validates email configuration', () => {
    const result = validateEmailConfig()
    expect(result.isValid).toBe(true)
  })
  
  test('detects missing required keys', () => {
    const original = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY
    
    const result = validateEmailConfig()
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('RESEND_API_KEY is required')
    
    process.env.RESEND_API_KEY = original
  })
})
```

## Best Practices

### 1. Never Commit Secrets
```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Use Type Guards
```typescript
export function hasEmailConfig(): boolean {
  return !!(
    env.RESEND_API_KEY &&
    env.RESEND_FROM_EMAIL &&
    env.CONTACT_EMAIL
  )
}

// Usage
if (hasEmailConfig()) {
  await sendEmail(data)
}
```

### 3. Provide Defaults
```typescript
export const config = {
  api: {
    timeout: parseInt(env.API_TIMEOUT || '10000'),
    retries: parseInt(env.API_RETRIES || '3'),
  }
}
```

### 4. Document Variables
```typescript
interface EnvironmentVariables {
  // Email Service (Required)
  RESEND_API_KEY: string        // Resend API key
  RESEND_FROM_EMAIL: string     // Verified sender email
  CONTACT_EMAIL: string         // Contact form recipient
  
  // Optional Services
  ANTHROPIC_API_KEY?: string    // Claude API for translations
  DEV_TO_API_KEY?: string       // Dev.to publishing
}
```

## Common Patterns

### Service Configuration
```typescript
export function getServiceConfig(service: string) {
  switch (service) {
    case 'email':
      return {
        enabled: features.enableEmailService,
        config: getEmailConfig(),
      }
    case 'translation':
      return {
        enabled: features.enableTranslation,
        apiKey: env.ANTHROPIC_API_KEY,
      }
    default:
      throw new Error(`Unknown service: ${service}`)
  }
}
```

### Environment-Specific Behavior
```typescript
export function getLogLevel() {
  if (isTest) return 'error'
  if (isDevelopment) return 'debug'
  if (isProduction) return 'info'
  return 'warn'
}
```