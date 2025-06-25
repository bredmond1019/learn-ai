import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface CalloutProps {
  type?: 'info' | 'success' | 'warning' | 'error' | 'tip'
  title?: string
  children: React.ReactNode
  className?: string
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  tip: Info,
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

export function Callout({ 
  type = 'info', 
  title, 
  children, 
  className 
}: CalloutProps) {
  const Icon = iconMap[type]
  
  return (
    <div
      className={cn(
        'my-6 mb-8 flex rounded-lg border p-4',
        colorMap[type],
        className
      )}
    >
      <Icon className={cn('mr-3 h-5 w-5 flex-shrink-0 mt-0.5', iconColorMap[type])} />
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