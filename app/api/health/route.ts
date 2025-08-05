import { NextResponse } from 'next/server';
import { env, validateEmailConfig, getPublicEnvInfo } from '@/lib/core/environment/env';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Check various health indicators
    const healthChecks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      responseTime: 0, // Will be set below
      version: env.DEPLOYMENT_VERSION || 'unknown',
      buildId: env.DEPLOYMENT_BUILD_ID || 'unknown',
      environment: env.NODE_ENV,
      checks: {
        // System metrics
        memory: {
          status: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9 ? 'healthy' : 'warning',
          details: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            unit: 'MB',
            usagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
          }
        },
        cpu: {
          status: 'healthy',
          details: {
            user: Math.round(cpuUsage.user / 1000),
            system: Math.round(cpuUsage.system / 1000),
            unit: 'microseconds'
          }
        },
        // Email service configuration
        emailService: {
          status: validateEmailConfig() ? 'configured' : 'not configured',
          provider: 'Resend',
          configured: !!env.RESEND_API_KEY
        },
        // Rate limiting configuration
        rateLimiting: {
          status: 'configured',
          window: env.RATE_LIMIT_WINDOW_MS,
          maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
          redisConfigured: !!env.RATE_LIMIT_REDIS_URL
        },
        // Feature flags
        features: getPublicEnvInfo().features,
        // Environment validation
        environment: {
          status: 'healthy',
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }
    };
    
    // Calculate response time
    healthChecks.responseTime = Date.now() - startTime;

    // Return health status
    return NextResponse.json(healthChecks, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Support HEAD requests for monitoring tools
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}