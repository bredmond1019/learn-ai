'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Lightweight syntax highlighter using Shiki
const useShikiHighlighter = (code: string, language: string) => {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const highlightCode = async () => {
      try {
        // Dynamic import of Shiki - only load when needed
        const { codeToHtml } = await import('shiki');
        
        // Normalize language
        const normalizedLang = normalizeLanguage(language);
        
        // Only load the specific theme and language bundle we need
        const highlighted = await codeToHtml(code, {
          lang: normalizedLang,
          theme: 'one-dark-pro',
          transformers: [
            {
              name: 'remove-pre-background',
              pre(node) {
                // Remove background to use our custom styling
                delete node.properties.style;
              }
            }
          ]
        });

        if (mounted) {
          setHighlightedCode(highlighted);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('Shiki highlighting failed, using fallback:', error);
        if (mounted) {
          // Fallback to plain code
          setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
          setIsLoading(false);
        }
      }
    };

    highlightCode();

    return () => {
      mounted = false;
    };
  }, [code, language]);

  return { highlightedCode, isLoading };
};

// Escape HTML for fallback
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Normalize language names for Shiki
const normalizeLanguage = (lang: string): string => {
  const languageMap: Record<string, string> = {
    'rust': 'rust',
    'typescript': 'typescript',
    'javascript': 'javascript',
    'python': 'python',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'bash': 'bash',
    'shell': 'bash',
    'sql': 'sql',
    'toml': 'toml',
    'dockerfile': 'dockerfile',
    'markdown': 'markdown',
    'html': 'html',
    'css': 'css',
    'tsx': 'tsx',
    'jsx': 'jsx',
  };

  return languageMap[lang.toLowerCase()] || 'text';
};

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  title,
  showLineNumbers = true,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const { highlightedCode, isLoading } = useShikiHighlighter(code, language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse bg-gray-800/50 rounded p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
        <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className={cn("bg-background-secondary/50 rounded-lg overflow-hidden", className)}>
      {/* Header with title and copy button */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent/20">
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60 bg-accent/10 px-2 py-1 rounded">
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent/20 hover:bg-accent/30 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Code content */}
      <div className="relative">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div 
            className="shiki-container overflow-x-auto"
            style={{
              fontFamily: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              padding: '1.5rem',
              background: 'transparent'
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeBlock;