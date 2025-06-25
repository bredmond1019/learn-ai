'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  fallbackSrc?: string;
  retryCount?: number;
  enableIntersectionObserver?: boolean;
  rootMargin?: string;
  threshold?: number;
}

interface LoadingState {
  isLoading: boolean;
  hasError: boolean;
  retryAttempts: number;
}

/**
 * Optimized Image Component with advanced loading strategies, error handling, and performance features
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc,
  retryCount = 2,
  enableIntersectionObserver = true,
  rootMargin = '50px',
  threshold = 0.1,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasError: false,
    retryAttempts: 0,
  });
  
  const [shouldLoad, setShouldLoad] = useState(priority || !enableIntersectionObserver);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableIntersectionObserver || shouldLoad || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [enableIntersectionObserver, shouldLoad, priority, threshold, rootMargin]);

  // Handle image load success
  const handleLoad = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
    }));
    onLoad?.();
  }, [onLoad]);

  // Handle image load error - simplified without retry logic
  const handleError = useCallback(() => {
    // If we have a fallback and haven't tried it yet, use it
    if (fallbackSrc && !triedFallback) {
      setCurrentSrc(fallbackSrc);
      setTriedFallback(true);
      // Don't reset hasError to false - let the fallback image load naturally
    } else {
      // Otherwise, just mark as error - no retries
      setLoadingState({
        isLoading: false,
        hasError: true,
        retryAttempts: 1,
      });
      onError?.();
    }
  }, [fallbackSrc, triedFallback, onError]);

  // Manual retry function
  const retryLoad = useCallback(() => {
    setLoadingState({
      isLoading: true,
      hasError: false,
      retryAttempts: 0,
    });
    setCurrentSrc(src);
    setTriedFallback(false);
  }, [src]);

  // Generate blur placeholder if not provided
  const generateBlurDataURL = useCallback((_width: number, _height: number) => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple gray blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 10, 10);
      return canvas.toDataURL();
    }
    return undefined;
  }, [blurDataURL]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div 
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    />
  );

  // Error fallback component
  const ErrorFallback = () => (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      <div className="text-center p-4">
        <svg 
          className="h-8 w-8 text-gray-400 mx-auto mb-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Failed to load image
        </p>
        <button 
          onClick={retryLoad}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Don't render anything until intersection observer triggers (unless priority)
  if (!shouldLoad) {
    return (
      <div ref={imgRef} className={className} style={{ width, height }}>
        <LoadingSkeleton />
      </div>
    );
  }

  // Show error fallback if all retry attempts failed
  if (loadingState.hasError) {
    return <ErrorFallback />;
  }

  // Image container with proper responsive behavior
  const imageContainer = (
    <div 
      ref={imgRef}
      className={cn("relative", fill ? "w-full h-full" : "", className)}
      style={fill ? {} : { width, height }}
    >
      {loadingState.isLoading && <LoadingSkeleton />}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generateBlurDataURL(width || 100, height || 100) : undefined}
        sizes={sizes}
        {...(priority ? {} : { loading })}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          loadingState.isLoading ? "opacity-0" : "opacity-100",
          fill ? "object-cover" : ""
        )}
        style={{
          objectFit: fill ? objectFit : undefined,
          objectPosition: fill ? objectPosition : undefined,
        }}
      />
    </div>
  );

  return imageContainer;
};

/**
 * Hero Image Component - Optimized for above-the-fold hero images
 */
export const HeroImage: React.FC<
  Omit<OptimizedImageProps, 'priority' | 'loading' | 'placeholder'> & {
    blurDataURL?: string;
  }
> = (props) => (
  <OptimizedImage
    {...props}
    priority={true}
    loading="eager"
    placeholder="blur"
    quality={90}
    enableIntersectionObserver={false}
  />
);

/**
 * Thumbnail Image Component - Optimized for image galleries and thumbnails
 */
export const ThumbnailImage: React.FC<
  Omit<OptimizedImageProps, 'quality' | 'sizes'>
> = (props) => (
  <OptimizedImage
    {...props}
    quality={75}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    enableIntersectionObserver={true}
    rootMargin="100px"
  />
);

/**
 * Background Image Component - Optimized for background images with fill
 */
export const BackgroundImage: React.FC<
  Omit<OptimizedImageProps, 'fill' | 'objectFit'>
> = (props) => (
  <OptimizedImage
    {...props}
    fill={true}
    objectFit="cover"
    quality={80}
  />
);

export default OptimizedImage;