# Client-Side Utilities Documentation

This directory contains utilities and components designed specifically for client-side functionality.

## Components Overview

### 📊 Progress Tracking (`progress.ts`)
See `progress-readme.md` for detailed documentation on the client-side progress tracking system including:
- Local storage persistence
- Module progress tracking
- Quiz score management
- Time tracking utilities

### 🎨 Icons (`icons.ts`)
Icon component library for consistent UI elements.

**Features:**
- SVG icon components
- Consistent sizing and styling
- Accessibility attributes
- Tree-shakeable exports

### 🖼️ Image Optimization (`image-optimization.ts`)
Client-side image optimization utilities.

**Features:**
- Lazy loading configuration
- Blur placeholder generation
- Responsive image sizing
- WebP/AVIF format detection

## Icons System

### Available Icons
```typescript
import { 
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  // ... more icons
} from '@/lib/client/icons'
```

### Icon Usage
```typescript
// Basic usage
<CheckIcon className="h-5 w-5 text-green-500" />

// With custom props
<ChevronRightIcon 
  className="h-4 w-4" 
  strokeWidth={2}
  aria-hidden="true"
/>
```

### Icon Component Pattern
```typescript
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

export function CustomIcon({ 
  size = 24, 
  color = 'currentColor',
  ...props 
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="..." 
      />
    </svg>
  )
}
```

## Image Optimization

### Optimization Utilities
```typescript
import { 
  getOptimizedImageProps,
  generateBlurDataURL,
  getResponsiveSizes
} from '@/lib/client/image-optimization'
```

### Optimized Image Props
```typescript
// Get optimized props for Next.js Image
const imageProps = getOptimizedImageProps({
  src: '/images/hero.jpg',
  alt: 'Hero image',
  width: 1200,
  height: 600,
  priority: true
})

// Returns:
{
  src: '/images/hero.jpg',
  alt: 'Hero image',
  width: 1200,
  height: 600,
  priority: true,
  placeholder: 'blur',
  blurDataURL: 'data:image/jpeg;base64,...',
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}
```

### Responsive Sizes
```typescript
// Generate responsive sizes string
const sizes = getResponsiveSizes({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw'
})
// Returns: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

// With custom breakpoints
const sizes = getResponsiveSizes({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw'
}, {
  mobile: 640,
  tablet: 1024
})
```

### Blur Placeholder
```typescript
// Generate blur data URL
const blurDataURL = await generateBlurDataURL('/images/hero.jpg')

// Use in component
<Image
  src="/images/hero.jpg"
  placeholder="blur"
  blurDataURL={blurDataURL}
  {...otherProps}
/>
```

### Format Detection
```typescript
// Check WebP support
const supportsWebP = await checkWebPSupport()

// Check AVIF support  
const supportsAVIF = await checkAVIFSupport()

// Get optimal format
const format = await getOptimalImageFormat()
// Returns: 'avif' | 'webp' | 'jpeg'
```

## Progress Tracking

See `progress-readme.md` for complete documentation. Key features:

### Basic Usage
```typescript
import { useProgress } from '@/lib/client/progress'

function LearningModule({ moduleId, pathId }) {
  const {
    moduleProgress,
    markSectionComplete,
    updateTimeSpent,
    recordQuizScore
  } = useProgress(pathId, moduleId)
  
  // Track section completion
  const handleSectionComplete = (sectionId: string) => {
    markSectionComplete(sectionId)
  }
  
  // Track time
  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeSpent(1) // Add 1 second
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
}
```

### Progress Persistence
```typescript
// Data stored in localStorage
interface StoredProgress {
  modules: {
    [moduleId: string]: {
      completed: boolean
      completedSections: string[]
      timeSpent: number
      lastAccessed: string
      quizScores: { [quizId: string]: number }
    }
  }
  lastUpdated: string
}
```

## Client-Side Patterns

### Lazy Loading
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // Client-side only
  }
)
```

### Client-Only Hooks
```typescript
// Ensure client-side execution
import { useEffect, useState } from 'react'

export function useClientOnly<T>(
  clientValue: T,
  serverValue?: T
): T {
  const [value, setValue] = useState(serverValue ?? clientValue)
  
  useEffect(() => {
    setValue(clientValue)
  }, [clientValue])
  
  return value
}
```

### Local Storage Utilities
```typescript
// Safe localStorage access
export function getStorageItem<T>(
  key: string,
  defaultValue: T
): T {
  if (typeof window === 'undefined') {
    return defaultValue
  }
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(
  key: string,
  value: T
): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}
```

## Performance Considerations

### Bundle Size
- Icons are tree-shakeable - only import what you use
- Image optimization runs client-side - consider server-side for better performance
- Progress tracking is lightweight - minimal impact

### Memory Management
```typescript
// Clean up old progress data
export function cleanupOldProgress(daysToKeep = 90) {
  const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
  
  const progress = getStorageItem('learningProgress', {})
  
  Object.keys(progress.modules).forEach(moduleId => {
    const module = progress.modules[moduleId]
    if (new Date(module.lastAccessed).getTime() < cutoffDate) {
      delete progress.modules[moduleId]
    }
  })
  
  setStorageItem('learningProgress', progress)
}
```

## Testing Client Code

### Component Testing
```typescript
// Test with React Testing Library
import { render, screen } from '@testing-library/react'
import { CheckIcon } from '@/lib/client/icons'

test('renders icon with correct attributes', () => {
  render(<CheckIcon className="test-class" data-testid="check" />)
  
  const icon = screen.getByTestId('check')
  expect(icon).toHaveClass('test-class')
  expect(icon).toHaveAttribute('aria-hidden', 'true')
})
```

### Hook Testing
```typescript
// Test custom hooks
import { renderHook, act } from '@testing-library/react'
import { useProgress } from '@/lib/client/progress'

test('tracks section completion', () => {
  const { result } = renderHook(() => 
    useProgress('path1', 'module1')
  )
  
  act(() => {
    result.current.markSectionComplete('section1')
  })
  
  expect(result.current.moduleProgress.completedSections)
    .toContain('section1')
})
```

### localStorage Testing
```typescript
// Mock localStorage in tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

global.localStorage = localStorageMock

beforeEach(() => {
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
})
```

## Best Practices

### 1. Check for Client-Side
```typescript
// Always check if running on client
if (typeof window !== 'undefined') {
  // Client-side only code
}
```

### 2. Handle SSR Mismatches
```typescript
// Use useEffect for client-only state
const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

if (!isClient) {
  return <ServerPlaceholder />
}
```

### 3. Optimize Bundle Size
```typescript
// Import only needed icons
import { CheckIcon } from '@/lib/client/icons'

// Not this:
import * as Icons from '@/lib/client/icons'
```

### 4. Error Boundaries
```typescript
// Wrap client components in error boundaries
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <ClientOnlyComponent />
</ErrorBoundary>
```

## Future Enhancements

Potential additions:
- Offline support utilities
- PWA helpers
- Client-side caching
- WebSocket utilities
- Animation helpers
- Gesture detection
- Device detection
- Browser storage abstraction