// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  
  // Custom metrics
  timeToInteractive: number | null;
  domContentLoaded: number | null;
  
  // Additional context
  userAgent: string;
  connection: string | null;
  navigationTiming: PerformanceTiming | null;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.captureNavigationTiming();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          this.metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.fid = (entry as any).processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  private captureNavigationTiming(): void {
    if (typeof window !== 'undefined' && window.performance) {
      // Wait for page load to get accurate timing
      window.addEventListener('load', () => {
        const timing = window.performance.timing;
        
        this.metrics.navigationTiming = timing;
        this.metrics.ttfb = timing.responseStart - timing.navigationStart;
        this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.metrics.timeToInteractive = timing.loadEventEnd - timing.navigationStart;
        
        // Capture user agent and connection info
        this.metrics.userAgent = navigator.userAgent;
        this.metrics.connection = (navigator as any).connection?.effectiveType || null;
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return {
      fcp: this.metrics.fcp || null,
      lcp: this.metrics.lcp || null,
      fid: this.metrics.fid || null,
      cls: this.metrics.cls || null,
      ttfb: this.metrics.ttfb || null,
      timeToInteractive: this.metrics.timeToInteractive || null,
      domContentLoaded: this.metrics.domContentLoaded || null,
      userAgent: this.metrics.userAgent || '',
      connection: this.metrics.connection || null,
      navigationTiming: this.metrics.navigationTiming || null,
    };
  }

  public getWebVitalsReport(): {
    score: 'good' | 'needs-improvement' | 'poor';
    metrics: {
      lcp: { value: number | null; rating: string };
      fid: { value: number | null; rating: string };
      cls: { value: number | null; rating: string };
    };
  } {
    const metrics = this.getMetrics();
    
    const lcpRating = !metrics.lcp ? 'unknown' : 
      metrics.lcp <= 2500 ? 'good' : 
      metrics.lcp <= 4000 ? 'needs-improvement' : 'poor';
    
    const fidRating = !metrics.fid ? 'unknown' :
      metrics.fid <= 100 ? 'good' :
      metrics.fid <= 300 ? 'needs-improvement' : 'poor';
    
    const clsRating = !metrics.cls ? 'unknown' :
      metrics.cls <= 0.1 ? 'good' :
      metrics.cls <= 0.25 ? 'needs-improvement' : 'poor';

    const ratings = [lcpRating, fidRating, clsRating];
    const overallScore = 
      ratings.every(r => r === 'good') ? 'good' :
      ratings.some(r => r === 'poor') ? 'poor' : 'needs-improvement';

    return {
      score: overallScore,
      metrics: {
        lcp: { value: metrics.lcp, rating: lcpRating },
        fid: { value: metrics.fid, rating: fidRating },
        cls: { value: metrics.cls, rating: clsRating },
      }
    };
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Utility function to report performance metrics (for analytics)
export function reportPerformanceMetrics(
  metrics: PerformanceMetrics,
  endpoint?: string
): void {
  if (typeof window === 'undefined') return;

  const report = {
    ...metrics,
    timestamp: Date.now(),
    url: window.location.href,
    referrer: document.referrer,
  };

  // Send to analytics endpoint if provided
  if (endpoint) {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(() => {
      // Silently fail - performance reporting shouldn't break the app
    });
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Performance Metrics');
    console.table(report);
    console.groupEnd();
  }
}

// SEO optimization utilities
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  alternateLanguages?: Array<{
    lang: string;
    url: string;
  }>;
}

export function generateMetaTags(config: SEOConfig): {
  title: string;
  meta: Array<{ name?: string; property?: string; content: string; key?: string }>;
  link: Array<{ rel: string; href: string; hreflang?: string }>;
  jsonLd?: object;
} {
  const meta: Array<{ name?: string; property?: string; content: string; key?: string }> = [
    { name: 'description', content: config.description },
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: config.title },
    { name: 'twitter:description', content: config.description },
  ];

  const link: Array<{ rel: string; href: string; hreflang?: string }> = [];

  // Add canonical URL
  if (config.canonicalUrl) {
    link.push({ rel: 'canonical', href: config.canonicalUrl });
    meta.push({ property: 'og:url', content: config.canonicalUrl });
  }

  // Add OG image
  if (config.ogImage) {
    meta.push({ property: 'og:image', content: config.ogImage });
    meta.push({ name: 'twitter:image', content: config.ogImage });
  }

  // Add keywords
  if (config.keywords && config.keywords.length > 0) {
    meta.push({ name: 'keywords', content: config.keywords.join(', ') });
  }

  // Add alternate language links
  if (config.alternateLanguages) {
    config.alternateLanguages.forEach(({ lang, url }) => {
      link.push({ rel: 'alternate', hreflang: lang, href: url });
    });
  }

  return {
    title: config.title,
    meta,
    link,
    jsonLd: config.structuredData,
  };
}

// Image optimization helpers
export function generateSrcSet(basePath: string, sizes: number[]): string {
  return sizes
    .map(size => `${basePath}?w=${size} ${size}w`)
    .join(', ');
}

export function generateImageSizes(breakpoints: Array<{ minWidth: string; width: string }>): string {
  return breakpoints
    .map(({ minWidth, width }) => `(min-width: ${minWidth}) ${width}`)
    .join(', ');
}

// Global performance monitor instance
let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor && typeof window !== 'undefined') {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor!;
}

export function startPerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    getPerformanceMonitor();
    
    // Report metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = globalMonitor?.getMetrics();
        if (metrics) {
          reportPerformanceMetrics(metrics);
        }
      }, 1000); // Wait 1 second after load for accurate metrics
    });
  }
}