'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number // How many pixels from bottom to trigger load
  rootMargin?: string // Intersection observer margin
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Callback when sentinel is visible
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      
      // Debug logging
      console.log('Intersection observed:', {
        isIntersecting: entry.isIntersecting,
        hasMore,
        isLoading,
        boundingClientRect: entry.boundingClientRect,
        intersectionRatio: entry.intersectionRatio
      })
      
      // If sentinel is visible, has more items, and not currently loading
      if (entry.isIntersecting && hasMore && !isLoading) {
        console.log('Triggering loadMore from infinite scroll')
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  // Set up intersection observer
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0,
    })

    // Observe sentinel element if it exists
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleIntersection, rootMargin])

  // Re-observe when sentinel ref changes
  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    console.log('setSentinelRef called with:', node)
    
    if (node !== sentinelRef.current) {
      if (observerRef.current && sentinelRef.current) {
        console.log('Unobserving old sentinel')
        observerRef.current.unobserve(sentinelRef.current)
      }
      
      sentinelRef.current = node
      
      if (observerRef.current && node) {
        console.log('Observing new sentinel')
        observerRef.current.observe(node)
      }
    }
  }, [])

  return {
    sentinelRef: setSentinelRef,
  }
}