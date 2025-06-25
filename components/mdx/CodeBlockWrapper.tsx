'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import CodeBlock to avoid SSR issues
const CodeBlock = dynamic(() => import('../ui/code-block'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-800/50 rounded p-6 mb-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
      </div>
    </div>
  )
})

export function CodeBlockWrapper({ children, className, ...props }: any) {
  // Extract language from className (e.g., "language-python" -> "python")
  const language = className?.replace('language-', '') || 'text'
  
  // Get the code content
  const code = typeof children === 'string' 
    ? children 
    : children?.props?.children || ''

  return (
    <CodeBlock
      code={code.trim()}
      language={language}
      showLineNumbers={true}
      className="mb-6"
      {...props}
    />
  )
}