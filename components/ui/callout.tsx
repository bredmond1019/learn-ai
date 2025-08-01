'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CalloutProps {
  type?: 'info' | 'success' | 'warning' | 'error' | 'tip'
  title?: string
  children: React.ReactNode
  className?: string
}

const colorMap = {
  info: 'bg-blue-900/20 border-blue-500 text-blue-100',
  success: 'bg-green-900/20 border-green-500 text-green-100',
  warning: 'bg-amber-900/20 border-amber-500 text-amber-100',
  error: 'bg-red-900/20 border-red-500 text-red-100',
  tip: 'bg-purple-900/20 border-purple-500 text-purple-100',
}

const iconColorMap = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  tip: 'text-purple-400',
}

// Icons as inline SVG components to avoid import issues
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
)

export function Callout({ 
  type = 'info', 
  title, 
  children, 
  className 
}: CalloutProps) {
  // Get the appropriate icon based on type
  const getIcon = () => {
    switch (type) {
      case 'info':
      case 'tip':
        return InfoIcon
      case 'success':
        return CheckCircleIcon
      case 'warning':
        return AlertTriangleIcon
      case 'error':
        return AlertCircleIcon
      default:
        return InfoIcon
    }
  }
  
  const Icon = getIcon()
  
  return (
    <div
      className={cn(
        'my-6 mb-8 flex rounded-lg border p-4',
        colorMap[type],
        className
      )}
    >
      <div className={cn('mr-3 flex-shrink-0 mt-0.5', iconColorMap[type])}>
        <Icon />
      </div>
      <div className="flex-1">
        {title && (
          <h4 className="mb-1 font-semibold">
            {title}
          </h4>
        )}
        <div className="text-sm [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// Default export for MDX compatibility
export default Callout