'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OptimizedImage, ThumbnailImage } from './optimized-image';
import { useImagePreloader, useAdaptiveImageQuality } from '@/hooks/use-image-loading';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  thumbnailClassName?: string;
  columns?: 2 | 3 | 4 | 6;
  aspectRatio?: 'square' | 'video' | 'photo' | 'auto';
  enableLightbox?: boolean;
  preloadCount?: number;
  quality?: number;
  enableKeyboardNavigation?: boolean;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * Optimized Image Gallery with lazy loading, lightbox, and performance features
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  thumbnailClassName,
  columns = 3,
  aspectRatio = 'auto',
  enableLightbox = true,
  preloadCount = 3,
  quality = 80,
  enableKeyboardNavigation = true,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const galleryRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { getQualityValue } = useAdaptiveImageQuality();
  const adaptiveQuality = getQualityValue(quality, quality - 10, quality - 20);

  // Preload visible and upcoming images
  const imagesToPreload = images
    .slice(0, preloadCount)
    .map(img => img.src);
  
  const { loadedImages: _loadedImages } = useImagePreloader(imagesToPreload);

  // Navigation functions
  const openLightbox = useCallback((index: number) => {
    if (!enableLightbox) return;
    setSelectedIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setSelectedIndex(null);
    setIsAutoPlaying(autoPlay);
    document.body.style.overflow = '';
  }, [autoPlay]);

  const navigatePrevious = useCallback(() => {
    setSelectedIndex(prev => 
      prev !== null ? (prev - 1 + images.length) % images.length : images.length - 1
    );
  }, [images.length]);

  const navigateNext = useCallback(() => {
    setSelectedIndex(prev => 
      prev !== null ? (prev + 1) % images.length : 0
    );
  }, [images.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && isLightboxOpen && selectedIndex !== null) {
      autoPlayRef.current = setInterval(() => {
        setSelectedIndex(prev => 
          prev !== null ? (prev + 1) % images.length : 0
        );
      }, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isLightboxOpen, selectedIndex, images.length, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation || !isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateNext();
          break;
        case 'Escape':
          event.preventDefault();
          closeLightbox();
          break;
        case ' ':
          event.preventDefault();
          setIsAutoPlaying(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedIndex, enableKeyboardNavigation, navigatePrevious, navigateNext, closeLightbox]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'photo':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <div 
        ref={galleryRef}
        className={cn(
          "grid gap-4",
          getColumnClass(),
          className
        )}
      >
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "relative overflow-hidden rounded-lg cursor-pointer group",
              getAspectRatioClass(),
              thumbnailClassName
            )}
            onClick={() => openLightbox(index)}
          >
            <ThumbnailImage
              src={image.thumbnail || image.src}
              alt={image.alt}
              fill={aspectRatio !== 'auto'}
              width={aspectRatio === 'auto' ? image.width : undefined}
              height={aspectRatio === 'auto' ? image.height : undefined}
              className={cn(
                "transition-transform duration-300 group-hover:scale-105",
                aspectRatio !== 'auto' ? "object-cover" : ""
              )}
              enableIntersectionObserver={true}
              rootMargin="100px"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            
            {/* Image info overlay */}
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {image.title && (
                  <h3 className="text-white font-medium text-sm mb-1">
                    {image.title}
                  </h3>
                )}
                {image.description && (
                  <p className="text-white/80 text-xs line-clamp-2">
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Auto-play toggle */}
          {autoPlay && (
            <button
              onClick={() => setIsAutoPlaying(prev => !prev)}
              className="absolute top-4 left-4 z-10 p-2 text-white hover:text-gray-300 transition-colors text-sm"
            >
              {isAutoPlaying ? 'Pause' : 'Play'}
            </button>
          )}

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={navigatePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              
              <button
                onClick={navigateNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <OptimizedImage
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              width={images[selectedIndex].width}
              height={images[selectedIndex].height}
              quality={90}
              priority={true}
              className="max-w-full max-h-full object-contain"
              enableIntersectionObserver={false}
            />
          </div>

          {/* Image info */}
          {(images[selectedIndex].title || images[selectedIndex].description) && (
            <div className="absolute bottom-4 left-4 right-4 text-white text-center">
              {images[selectedIndex].title && (
                <h2 className="text-xl font-medium mb-2">
                  {images[selectedIndex].title}
                </h2>
              )}
              {images[selectedIndex].description && (
                <p className="text-white/80 text-sm max-w-2xl mx-auto">
                  {images[selectedIndex].description}
                </p>
              )}
            </div>
          )}

          {/* Thumbnail navigation */}
          {showThumbnails && images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto py-2">
              {images.map((image, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all",
                    index === selectedIndex 
                      ? "border-white scale-110" 
                      : "border-white/50 hover:border-white/80"
                  )}
                >
                  <ThumbnailImage
                    src={image.thumbnail || image.src}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover"
                    enableIntersectionObserver={false}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Simple Grid Gallery - Optimized for basic use cases
 */
export const SimpleImageGrid: React.FC<{
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ images, columns = 3, className }) => (
  <ImageGallery
    images={images}
    columns={columns}
    className={className}
    enableLightbox={false}
    aspectRatio="square"
    showThumbnails={false}
  />
);

/**
 * Masonry Gallery - Pinterest-style layout
 */
export const MasonryGallery: React.FC<{
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ images, columns = 3, className }) => {
  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return 'columns-1 sm:columns-2';
      case 3:
        return 'columns-1 sm:columns-2 lg:columns-3';
      case 4:
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4';
      default:
        return 'columns-1 sm:columns-2 lg:columns-3';
    }
  };

  return (
    <div className={cn("gap-4", getColumnClass(), className)}>
      {images.map((image, index) => (
        <div key={`masonry-${index}`} className="break-inside-avoid mb-4">
          <ThumbnailImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="w-full h-auto rounded-lg"
            enableIntersectionObserver={true}
            rootMargin="100px"
          />
          {(image.title || image.description) && (
            <div className="p-2">
              {image.title && (
                <h3 className="font-medium text-sm mb-1">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {image.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;