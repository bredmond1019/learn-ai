'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ImageLoadingState {
  isLoading: boolean;
  hasError: boolean;
  hasLoaded: boolean;
  retryCount: number;
}

interface UseImageLoadingOptions {
  src: string;
  maxRetries?: number;
  retryDelay?: number;
  preload?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Hook for managing image loading state with retry logic
 */
export function useImageLoading({
  src,
  maxRetries = 2,
  retryDelay = 1000,
  preload = false,
  onLoad,
  onError,
}: UseImageLoadingOptions) {
  const [state, setState] = useState<ImageLoadingState>({
    isLoading: false,
    hasError: false,
    hasLoaded: false,
    retryCount: 0,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadImage = useCallback((imageSrc: string, attempt: number = 0) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));

    const img = new Image();
    
    img.onload = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasLoaded: true,
        hasError: false,
      }));
      onLoad?.();
    };

    img.onerror = () => {
      if (attempt < maxRetries) {
        setState(prev => ({
          ...prev,
          retryCount: attempt + 1,
        }));

        retryTimeoutRef.current = setTimeout(() => {
          loadImage(imageSrc, attempt + 1);
        }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
        }));
        onError?.();
      }
    };

    img.src = imageSrc;
  }, [maxRetries, retryDelay, onLoad, onError]);

  const retryLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      retryCount: 0,
    }));
    loadImage(src);
  }, [src, loadImage]);

  useEffect(() => {
    if (preload && src) {
      loadImage(src);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [src, preload, loadImage]);

  return {
    ...state,
    retryLoad,
  };
}

/**
 * Hook for preloading multiple images
 */
export function useImagePreloader(imageSources: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const preloadImages = useCallback(async (sources: string[]) => {
    setIsLoading(true);
    setLoadedImages(new Set());
    setFailedImages(new Set());

    const loadPromises = sources.map(src => 
      new Promise<{ src: string; success: boolean }>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve({ src, success: true });
        };
        
        img.onerror = () => {
          setFailedImages(prev => new Set([...prev, src]));
          resolve({ src, success: false });
        };
        
        img.src = src;
      })
    );

    await Promise.all(loadPromises);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (imageSources.length > 0) {
      preloadImages(imageSources);
    }
  }, [imageSources, preloadImages]);

  return {
    loadedImages,
    failedImages,
    isLoading,
    preloadImages,
    progress: {
      loaded: loadedImages.size,
      failed: failedImages.size,
      total: imageSources.length,
      percentage: imageSources.length > 0 
        ? Math.round(((loadedImages.size + failedImages.size) / imageSources.length) * 100)
        : 0,
    },
  };
}

/**
 * Hook for intersection-based image loading
 */
export function useIntersectionImageLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return {
    shouldLoad,
    elementRef,
  };
}

/**
 * Hook for progressive image loading (low quality to high quality)
 */
export function useProgressiveImageLoading(
  lowQualitySrc: string,
  highQualitySrc: string
) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(lowQualitySrc);
    setIsHighQualityLoaded(false);
    setIsLoading(true);

    // Load high quality image in background
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = highQualitySrc;
  }, [lowQualitySrc, highQualitySrc]);

  return {
    currentSrc,
    isHighQualityLoaded,
    isLoading,
  };
}

/**
 * Hook for adaptive image quality based on network conditions
 */
export function useAdaptiveImageQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Check for Network Information API support
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: { effectiveType: string; addEventListener: (event: string, callback: () => void) => void; removeEventListener: (event: string, callback: () => void) => void } }).connection;
      
      const updateQuality = () => {
        const effectiveType = connection.effectiveType;
        setConnectionType(effectiveType);

        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            setQuality('low');
            break;
          case '3g':
            setQuality('medium');
            break;
          case '4g':
          default:
            setQuality('high');
            break;
        }
      };

      updateQuality();
      connection.addEventListener('change', updateQuality);

      return () => {
        connection.removeEventListener('change', updateQuality);
      };
    }
  }, []);

  const getQualityValue = useCallback((highQuality: number = 90, mediumQuality: number = 75, lowQuality: number = 60) => {
    switch (quality) {
      case 'low':
        return lowQuality;
      case 'medium':
        return mediumQuality;
      case 'high':
      default:
        return highQuality;
    }
  }, [quality]);

  const getOptimalSizes = useCallback((
    baseSizes: string,
    reduceFactor: number = 0.75
  ) => {
    if (quality === 'low') {
      // Parse and reduce sizes for slower connections
      return baseSizes.replace(/(\d+)px/g, (match, pixels) => {
        const reduced = Math.round(parseInt(pixels) * reduceFactor);
        return `${reduced}px`;
      });
    }
    return baseSizes;
  }, [quality]);

  return {
    quality,
    connectionType,
    getQualityValue,
    getOptimalSizes,
    isSlowConnection: quality === 'low',
  };
}

/**
 * Hook for image lazy loading with viewport awareness
 */
export function useLazyImageLoading(
  src: string,
  options: {
    threshold?: number;
    rootMargin?: string;
    placeholder?: string;
    fallback?: string;
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder,
    fallback,
  } = options;

  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Intersection observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load actual image when in view
  useEffect(() => {
    if (!isInView || hasLoaded) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setHasLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setImageSrc(fallback || placeholder || '');
      setHasError(true);
    };
    img.src = src;
  }, [isInView, src, hasLoaded, fallback, placeholder]);

  return {
    imageSrc,
    elementRef,
    isInView,
    hasLoaded,
    hasError,
    isLoading: isInView && !hasLoaded && !hasError,
  };
}