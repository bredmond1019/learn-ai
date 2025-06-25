/**
 * Metrics endpoint for monitoring and observability
 * Provides Prometheus-compatible metrics for production monitoring
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Simple in-memory metrics store (in production, use Redis or proper metrics store)
class MetricsStore {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  incrementCounter(name: string, value = 1) {
    this.counters.set(name, (this.counters.get(name) || 0) + value);
  }

  setGauge(name: string, value: number) {
    this.gauges.set(name, value);
  }

  recordHistogram(name: string, value: number) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name)!.push(value);
    
    // Keep only last 1000 values to prevent memory leak
    const values = this.histograms.get(name)!;
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
  }

  getMetrics() {
    const metrics: any = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: {},
    };

    // Calculate histogram statistics
    for (const [name, values] of this.histograms) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        metrics.histograms[name] = {
          count: values.length,
          sum: values.reduce((a, b) => a + b, 0),
          min: sorted[0],
          max: sorted[sorted.length - 1],
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p90: sorted[Math.floor(sorted.length * 0.9)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    }

    return metrics;
  }

  // Convert to Prometheus format
  toPrometheusFormat() {
    let output = '';
    
    // Counters
    for (const [name, value] of this.counters) {
      output += `# TYPE ${name} counter\n`;
      output += `${name} ${value}\n`;
    }
    
    // Gauges
    for (const [name, value] of this.gauges) {
      output += `# TYPE ${name} gauge\n`;
      output += `${name} ${value}\n`;
    }
    
    // Histograms
    for (const [name, values] of this.histograms) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        
        output += `# TYPE ${name} histogram\n`;
        output += `${name}_count ${values.length}\n`;
        output += `${name}_sum ${sum}\n`;
        
        // Add quantiles
        const quantiles = [0.5, 0.9, 0.95, 0.99];
        for (const q of quantiles) {
          const index = Math.floor(sorted.length * q);
          output += `${name}{quantile="${q}"} ${sorted[index] || 0}\n`;
        }
      }
    }
    
    return output;
  }

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Global metrics store
const metrics = new MetricsStore();

// Initialize some default metrics
metrics.setGauge('app_start_time', Date.now());

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';

    // Update system metrics
    const memoryUsage = process.memoryUsage();
    metrics.setGauge('nodejs_memory_heap_used_bytes', memoryUsage.heapUsed);
    metrics.setGauge('nodejs_memory_heap_total_bytes', memoryUsage.heapTotal);
    metrics.setGauge('nodejs_memory_external_bytes', memoryUsage.external);
    metrics.setGauge('nodejs_memory_rss_bytes', memoryUsage.rss);
    metrics.setGauge('nodejs_process_uptime_seconds', process.uptime());

    // CPU usage
    const cpuUsage = process.cpuUsage();
    metrics.setGauge('nodejs_cpu_user_microseconds', cpuUsage.user);
    metrics.setGauge('nodejs_cpu_system_microseconds', cpuUsage.system);

    if (format === 'prometheus') {
      return new Response(metrics.toPrometheusFormat(), {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Default JSON format
    const metricsData = {
      timestamp: new Date().toISOString(),
      metrics: metrics.getMetrics(),
      system: {
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          unit: 'MB',
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000),
          system: Math.round(cpuUsage.system / 1000),
          unit: 'microseconds',
        },
      },
    };

    return NextResponse.json(metricsData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('Metrics endpoint error', {}, error as Error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

// Utility functions for recording metrics (internal use)
// Note: These are not exported to comply with Next.js API route requirements
// Access metrics through the metrics instance or create a separate utility file
const recordMetric = {
  increment: (name: string, value = 1) => metrics.incrementCounter(name, value),
  gauge: (name: string, value: number) => metrics.setGauge(name, value),
  histogram: (name: string, value: number) => metrics.recordHistogram(name, value),
  
  // Common metrics helpers
  apiRequest: (endpoint: string, method: string) => {
    metrics.incrementCounter('http_requests_total');
    metrics.incrementCounter(`http_requests_${method.toLowerCase()}_total`);
    metrics.incrementCounter(`http_requests_endpoint_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}_total`);
  },
  
  apiResponse: (endpoint: string, method: string, statusCode: number, responseTime: number) => {
    metrics.incrementCounter(`http_responses_${statusCode}_total`);
    metrics.recordHistogram('http_request_duration_ms', responseTime);
    metrics.recordHistogram(`http_request_duration_${method.toLowerCase()}_ms`, responseTime);
  },
  
  emailSent: (success: boolean) => {
    metrics.incrementCounter('emails_sent_total');
    if (success) {
      metrics.incrementCounter('emails_sent_success_total');
    } else {
      metrics.incrementCounter('emails_sent_error_total');
    }
  },
  
  rateLimitHit: (endpoint: string) => {
    metrics.incrementCounter('rate_limit_hits_total');
    metrics.incrementCounter(`rate_limit_hits_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}_total`);
  },
};