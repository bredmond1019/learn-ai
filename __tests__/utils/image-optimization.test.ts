/**
 * @jest-environment jsdom
 */

import {
  generateBlurDataURL,
  generateOptimizedImageUrl,
  generateResponsiveSizes,
  calculateOptimalDimensions,
  getOptimalImageFormat,
  checkImageFormatSupport,
  generateSrcSet,
  ImagePerformanceMonitor,
  defaultResponsiveConfig,
  imageConfigs
} from '@/lib/image-optimization'

// Mock Buffer for Node.js environment
Object.defineProperty(global, 'Buffer', {
  value: Buffer,
  writable: true
})

// Mock HTMLCanvasElement.prototype.toDataURL
const mockToDataURL = jest.fn()
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: mockToDataURL,
  writable: true
})

describe('Image Optimization Utilities', () => {
  describe('generateBlurDataURL', () => {
    it('should generate blur data URLs with default parameters', () => {
      // RED: Test blur data URL generation
      const blurDataUrl = generateBlurDataURL()
      
      expect(blurDataUrl).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(blurDataUrl.length).toBeGreaterThan(50) // Should contain base64 encoded SVG
    })

    it('should generate blur data URLs with custom parameters', () => {
      const blurDataUrl = generateBlurDataURL(20, 30, '#ff0000')
      
      expect(blurDataUrl).toMatch(/^data:image\/svg\+xml;base64,/)
      
      // Decode and check content contains custom parameters
      const base64Content = blurDataUrl.split(',')[1]
      const svgContent = Buffer.from(base64Content, 'base64').toString()
      
      expect(svgContent).toContain('width="20"')
      expect(svgContent).toContain('height="30"')
      expect(svgContent).toContain('fill="#ff0000"')
    })

    it('should handle edge cases for dimensions', () => {
      const blurDataUrl = generateBlurDataURL(0, 0)
      expect(blurDataUrl).toMatch(/^data:image\/svg\+xml;base64,/)
      
      const blurDataUrlLarge = generateBlurDataURL(1000, 1000)
      expect(blurDataUrlLarge).toMatch(/^data:image\/svg\+xml;base64,/)
    })
  })

  describe('generateOptimizedImageUrl', () => {
    it('should handle different image formats', () => {
      // Test WebP format
      const webpUrl = generateOptimizedImageUrl('/test.jpg', 800, 600, { format: 'webp', quality: 80 })
      expect(webpUrl).toContain('f=webp')
      expect(webpUrl).toContain('q=80')
      expect(webpUrl).toContain('w=800')
      expect(webpUrl).toContain('h=600')

      // Test AVIF format
      const avifUrl = generateOptimizedImageUrl('/test.jpg', 400, undefined, { format: 'avif', quality: 90 })
      expect(avifUrl).toContain('f=avif')
      expect(avifUrl).toContain('q=90')
      expect(avifUrl).toContain('w=400')
      expect(avifUrl).not.toContain('h=')

      // Test auto format (should not include format parameter)
      const autoUrl = generateOptimizedImageUrl('/test.jpg', 600, 400, { format: 'auto', quality: 75 })
      expect(autoUrl).not.toContain('f=')
      expect(autoUrl).toContain('q=75')
    })

    it('should handle external URLs correctly', () => {
      const externalUrl = 'https://example.com/image.jpg'
      const result = generateOptimizedImageUrl(externalUrl, 800, 600)
      
      expect(result).toBe(externalUrl) // Should return unchanged for external URLs
    })

    it('should encode URL parameters correctly', () => {
      const complexPath = '/images/test image with spaces.jpg'
      const result = generateOptimizedImageUrl(complexPath, 800)
      
      expect(result).toContain(encodeURIComponent(complexPath))
    })
  })

  describe('image format optimization', () => {
    it('should handle different image formats optimally', () => {
      // Test PNG preservation for transparency
      expect(getOptimalImageFormat('png', true, true)).toBe('avif')
      expect(getOptimalImageFormat('png', true, false)).toBe('webp')
      expect(getOptimalImageFormat('png', false, false)).toBe('png')

      // Test JPEG optimization
      expect(getOptimalImageFormat('jpeg', true, true)).toBe('avif')
      expect(getOptimalImageFormat('jpeg', true, false)).toBe('webp')
      expect(getOptimalImageFormat('jpeg', false, false)).toBe('jpeg')
    })

    it('should detect browser support correctly', () => {
      // Mock canvas toDataURL responses
      mockToDataURL
        .mockReturnValueOnce('data:image/webp;base64,test') // webp support
        .mockReturnValueOnce('data:image/png;base64,test') // avif not supported
        .mockReturnValueOnce('data:image/png;base64,test') // jpegXL not supported

      const support = checkImageFormatSupport()
      
      expect(support).toHaveProperty('webp')
      expect(support).toHaveProperty('avif')
      expect(support).toHaveProperty('jpegXL')
      expect(support.webp).toBe(true)
      expect(support.avif).toBe(false)
      expect(support.jpegXL).toBe(false)
    })
  })

  describe('responsive image utilities', () => {
    it('should generate responsive sizes correctly', () => {
      const sizes = generateResponsiveSizes(defaultResponsiveConfig)
      
      expect(sizes).toContain('(max-width: 640px) 100vw')
      expect(sizes).toContain('(max-width: 768px) 50vw')
      expect(sizes).toContain('(max-width: 1024px) 33vw')
      expect(sizes).toContain('25vw')
    })

    it('should generate responsive sizes with custom overrides', () => {
      const customSizes = {
        mobile: '90vw',
        tablet: '60vw',
        desktop: '40vw',
        large: '30vw'
      }
      
      const sizes = generateResponsiveSizes(defaultResponsiveConfig, customSizes)
      
      expect(sizes).toContain('90vw')
      expect(sizes).toContain('60vw')
      expect(sizes).toContain('40vw')
      expect(sizes).toContain('30vw')
    })

    it('should calculate optimal dimensions correctly', () => {
      const dimensions = calculateOptimalDimensions(800, 600, 2, 1920, 1080)
      
      expect(dimensions.width).toBe(1600) // 800 * 2
      expect(dimensions.height).toBe(1080) // min(600 * 2, 1080)
    })

    it('should generate srcset correctly', () => {
      const srcset = generateSrcSet('/test.jpg', [400, 800, 1200], { quality: 85 })
      
      expect(srcset).toContain('400w')
      expect(srcset).toContain('800w')
      expect(srcset).toContain('1200w')
      expect(srcset).toContain('q=85')
    })
  })

  describe('ImagePerformanceMonitor', () => {
    it('should optimize for performance monitoring', () => {
      const monitor = new ImagePerformanceMonitor()
      
      // Test that monitor can be created and has expected methods
      expect(monitor).toHaveProperty('startMonitoring')
      expect(monitor).toHaveProperty('getMetrics')
      expect(monitor).toHaveProperty('getAllMetrics')
      expect(monitor).toHaveProperty('getAverageLoadTime')
      expect(monitor).toHaveProperty('getCacheHitRate')
      expect(monitor).toHaveProperty('cleanup')
      
      // Test initial state
      expect(monitor.getAllMetrics()).toEqual([])
      expect(monitor.getAverageLoadTime()).toBe(0)
      expect(monitor.getCacheHitRate()).toBe(0)
    })

    it('should handle cleanup correctly', () => {
      const monitor = new ImagePerformanceMonitor()
      
      // Should not throw errors when cleaning up empty monitor
      expect(() => monitor.cleanup()).not.toThrow()
    })
  })

  describe('image configuration presets', () => {
    it('should provide appropriate configuration presets', () => {
      // Test hero image config
      expect(imageConfigs.hero.quality).toBe(90)
      expect(imageConfigs.hero.format).toBe('webp')
      expect(imageConfigs.hero.priority).toBe(true)
      expect(imageConfigs.hero.placeholder).toBe('blur')

      // Test thumbnail config
      expect(imageConfigs.thumbnail.quality).toBe(75)
      expect(imageConfigs.thumbnail.priority).toBe(false)

      // Test icon config
      expect(imageConfigs.icon.format).toBe('png')
      expect(imageConfigs.icon.placeholder).toBe('empty')
    })
  })
})