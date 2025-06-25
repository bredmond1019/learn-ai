'use client';

import React, { useState, Suspense } from 'react';
import { ChevronDown, ChevronRight, Code2 } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';

interface CollapsibleCodeBlockProps {
  title: string;
  description?: string;
  code: string;
  language: string;
  defaultOpen?: boolean;
}

export default function CollapsibleCodeBlock({ 
  title, 
  description,
  code, 
  language,
  defaultOpen = false 
}: CollapsibleCodeBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-accent/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-background-secondary/50 hover:bg-background-secondary/70 transition-colors flex items-start gap-3 text-left"
      >
        <div className="mt-0.5">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary/60" />
            {title}
          </h3>
          {description && (
            <p className="text-sm text-foreground/70 mt-1">
              {description}
            </p>
          )}
        </div>
        <span className="text-sm text-foreground/50 font-mono">
          {language}
        </span>
      </button>
      
      {isOpen && (
        <div className="border-t border-accent/20">
          <Suspense 
            fallback={
              <div className="animate-pulse bg-gray-700/50 p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-600/50 rounded w-2/3"></div>
                </div>
              </div>
            }
          >
            <CodeBlock
              code={code}
              language={language}
              showLineNumbers={true}
              className="rounded-none border-0"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}