/**
 * Image Optimization Utilities
 * 
 * Comprehensive utilities for image optimization, format conversion, and performance enhancement
 */

export interface ImageOptimizationConfig {
  quality: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  sizes: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface ResponsiveImageConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  densities: number[];
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
}

export interface ImageMetrics {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  loadTime: number;
  cacheHit: boolean;
}

/**
 * Default responsive image configuration
 */
export const defaultResponsiveConfig: ResponsiveImageConfig = {
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    large: 1280,
  },
  densities: [1, 2], // 1x and 2x pixel density
  formats: ['webp', 'jpeg'],
};

/**
 * Image optimization configurations for different use cases
 */
export const imageConfigs = {
  hero: {
    quality: 90,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw',
    priority: true,
    placeholder: 'blur' as const,
  },
  
  thumbnail: {
    quality: 75,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    priority: false,
    placeholder: 'blur' as const,
  },
  
  gallery: {
    quality: 80,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority: false,
    placeholder: 'blur' as const,
  },
  
  avatar: {
    quality: 85,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 64px, 80px',
    priority: false,
    placeholder: 'blur' as const,
  },
  
  background: {
    quality: 70,
    format: 'webp' as const,
    sizes: '100vw',
    priority: false,
    placeholder: 'blur' as const,
  },
  
  icon: {
    quality: 90,
    format: 'png' as const,
    sizes: '32px',
    priority: false,
    placeholder: 'empty' as const,
  },
} as const;

/**
 * Generate optimized image URLs for Next.js Image component
 */
export function generateOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  config: Partial<ImageOptimizationConfig> = {}
): string {
  const {
    quality = 75,
    format = 'auto',
  } = config;

  // For external URLs, return as-is (Next.js will handle optimization)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For local images, construct optimized URL
  const params = new URLSearchParams();
  params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  if (format !== 'auto') params.set('f', format);

  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Generate responsive image sizes string based on breakpoints
 */
export function generateResponsiveSizes(
  config: ResponsiveImageConfig,
  customSizes?: Partial<{
    mobile: string;
    tablet: string;
    desktop: string;
    large: string;
  }>
): string {
  const sizes = {
    mobile: customSizes?.mobile || '100vw',
    tablet: customSizes?.tablet || '50vw',
    desktop: customSizes?.desktop || '33vw',
    large: customSizes?.large || '25vw',
  };

  return [
    `(max-width: ${config.breakpoints.mobile}px) ${sizes.mobile}`,
    `(max-width: ${config.breakpoints.tablet}px) ${sizes.tablet}`,
    `(max-width: ${config.breakpoints.desktop}px) ${sizes.desktop}`,
    sizes.large,
  ].join(', ');
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f0f0f0'
): string {
  // Create a simple base64-encoded SVG blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Calculate optimal image dimensions based on container and device pixel ratio
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = 1,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): { width: number; height: number } {
  const targetWidth = Math.min(containerWidth * devicePixelRatio, maxWidth);
  const targetHeight = Math.min(containerHeight * devicePixelRatio, maxHeight);
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  };
}

/**
 * Image format detection and recommendation
 */
export function getOptimalImageFormat(
  originalFormat: string,
  supportsWebP: boolean = true,
  supportsAVIF: boolean = false
): 'webp' | 'avif' | 'jpeg' | 'png' {
  // Preserve PNG for images that need transparency
  if (originalFormat === 'png') {
    if (supportsAVIF) return 'avif';
    if (supportsWebP) return 'webp';
    return 'png';
  }
  
  // For photos and complex images
  if (supportsAVIF) return 'avif';
  if (supportsWebP) return 'webp';
  return 'jpeg';
}

/**
 * Check browser support for modern image formats
 */
export function checkImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
  jpegXL: boolean;
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false, jpegXL: false };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return {
    webp: canvas.toDataURL('image/webp').indexOf('image/webp') === 5,
    avif: canvas.toDataURL('image/avif').indexOf('image/avif') === 5,
    jpegXL: canvas.toDataURL('image/jxl').indexOf('image/jxl') === 5,
  };
}

/**
 * Image performance monitoring
 */
export class ImagePerformanceMonitor {
  private metrics: Map<string, ImageMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  startMonitoring(imageUrl: string): void {
    if (typeof window === 'undefined') return;
    
    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(imageUrl)) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const metrics: ImageMetrics = {
            originalSize: resourceEntry.transferSize || 0,
            optimizedSize: resourceEntry.encodedBodySize || 0,
            compressionRatio: resourceEntry.transferSize 
              ? resourceEntry.encodedBodySize / resourceEntry.transferSize 
              : 1,
            format: this.extractFormat(entry.name),
            loadTime: entry.duration,
            cacheHit: resourceEntry.transferSize === 0,
          };
          
          this.metrics.set(imageUrl, metrics);
          observer.disconnect();
          this.observers.delete(imageUrl);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set(imageUrl, observer);
  }

  private extractFormat(url: string): string {
    const match = url.match(/\.(\w+)(?:\?|$)/);
    return match ? match[1] : 'unknown';
  }

  getMetrics(imageUrl: string): ImageMetrics | undefined {
    return this.metrics.get(imageUrl);
  }

  getAllMetrics(): ImageMetrics[] {
    return Array.from(this.metrics.values());
  }

  getAverageLoadTime(): number {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return totalTime / metrics.length;
  }

  getCacheHitRate(): number {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) return 0;
    
    const cacheHits = metrics.filter(metric => metric.cacheHit).length;
    return (cacheHits / metrics.length) * 100;
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

/**
 * Create global image performance monitor instance
 */
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

/**
 * Preload critical images
 */
export function preloadImages(
  images: Array<{ src: string; as?: 'image'; type?: string }>,
  priority: 'high' | 'low' = 'high'
): void {
  if (typeof window === 'undefined') return;

  images.forEach(({ src, as = 'image', type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    if (type) link.type = type;
    
    // Set fetchpriority for modern browsers
    if ('fetchPriority' in link) {
      (link as unknown as { fetchPriority: string }).fetchPriority = priority;
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with intersection observer
 */
export function createLazyImageLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    { threshold, rootMargin }
  );

  // Find all images with data-src attribute
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseSrc: string,
  widths: number[],
  config: Partial<ImageOptimizationConfig> = {}
): string {
  return widths
    .map((width) => {
      const url = generateOptimizedImageUrl(baseSrc, width, undefined, config);
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Image optimization utilities for development
 */
export const imageOptimizationDev = {
  /**
   * Log image optimization metrics
   */
  logMetrics(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const metrics = imagePerformanceMonitor.getAllMetrics();
    const avgLoadTime = imagePerformanceMonitor.getAverageLoadTime();
    const cacheHitRate = imagePerformanceMonitor.getCacheHitRate();
    
    console.group('📸 Image Optimization Metrics');
    console.log(`Average Load Time: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
    console.log(`Total Images Monitored: ${metrics.length}`);
    
    if (metrics.length > 0) {
      console.table(metrics);
    }
    
    console.groupEnd();
  },

  /**
   * Test image format support
   */
  testFormatSupport(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const support = checkImageFormatSupport();
    console.log('🖼️ Image Format Support:', support);
  },

  /**
   * Analyze page images
   */
  analyzePageImages(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    const images = document.querySelectorAll('img');
    const analysis = {
      total: images.length,
      withSrcSet: 0,
      withSizes: 0,
      withLoading: 0,
      withAlt: 0,
      lazyLoaded: 0,
    };

    images.forEach((img) => {
      if (img.srcset) analysis.withSrcSet++;
      if (img.sizes) analysis.withSizes++;
      if (img.loading) analysis.withLoading++;
      if (img.alt) analysis.withAlt++;
      if (img.loading === 'lazy') analysis.lazyLoaded++;
    });

    console.log('📊 Page Image Analysis:', analysis);
  },
};

// Expose dev utilities globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { imageOptimizationDev: typeof imageOptimizationDev }).imageOptimizationDev = imageOptimizationDev;
}