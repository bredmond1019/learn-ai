/**
 * Environment variable validation and configuration
 * This module ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Brandon Redmond - AI Engineer'),
  
  // Email Service
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_TO_EMAIL: z.string().email().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('5'),
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  
  // Security
  CSRF_SECRET: z.string().min(32).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  
  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  DATABASE_SSL: z.string().transform(val => val === 'true').default('true'),
  
  // CDN
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_TRANSLATIONS: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_CONTACT_FORM: z.string().transform(val => val === 'true').default('true'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  
  // Performance
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  PERFORMANCE_SAMPLE_RATE: z.string().transform(val => parseFloat(val)).default('0.1'),
  
  // Translation Service
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Deployment
  DEPLOYMENT_ENVIRONMENT: z.string().default('development'),
  DEPLOYMENT_VERSION: z.string().optional(),
  DEPLOYMENT_BUILD_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Environment validation failed');
}

// Export validated environment variables
export { env };

// Utility functions for environment checks
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof Pick<Env, 
  'NEXT_PUBLIC_ENABLE_ANALYTICS' | 
  'NEXT_PUBLIC_ENABLE_TRANSLATIONS' | 
  'NEXT_PUBLIC_ENABLE_CONTACT_FORM' |
  'NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING'
>) => {
  return env[feature];
};

// Validate required environment variables for production
export const validateProductionEnv = () => {
  if (!isProduction()) return;
  
  const requiredInProduction = [
    'NEXT_PUBLIC_APP_URL',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'RESEND_TO_EMAIL',
  ];
  
  const missing = requiredInProduction.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
};

// Email service configuration validation
export const validateEmailConfig = () => {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.RESEND_TO_EMAIL) {
    console.warn('⚠️ Email service not fully configured. Contact form may not work.');
    return false;
  }
  return true;
};

// Logging configuration
export const getLogConfig = () => ({
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT,
  enableConsole: !isProduction() || env.LOG_LEVEL === 'debug',
});

// Performance monitoring configuration
export const getPerformanceConfig = () => ({
  enabled: env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
  sampleRate: env.PERFORMANCE_SAMPLE_RATE,
});

// Export environment info for debugging (safe for client-side)
export const getPublicEnvInfo = () => ({
  environment: env.NODE_ENV,
  appName: env.NEXT_PUBLIC_APP_NAME,
  version: env.DEPLOYMENT_VERSION || 'unknown',
  buildId: env.DEPLOYMENT_BUILD_ID || 'unknown',
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    translations: env.NEXT_PUBLIC_ENABLE_TRANSLATIONS,
    contactForm: env.NEXT_PUBLIC_ENABLE_CONTACT_FORM,
    performanceMonitoring: env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
  },
});