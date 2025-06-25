'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileCode2, Terminal, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  copyButton?: boolean;
  downloadButton?: boolean;
  terminal?: boolean;
  className?: string;
  wrapLongLines?: boolean;
}

export function CodeSnippet({
  code,
  language = 'typescript',
  title,
  filename,
  showLineNumbers = false,
  highlightLines = [],
  copyButton = true,
  downloadButton = false,
  terminal = false,
  className,
  wrapLongLines = false
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  // Download code as file
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, filename, language]);

  // Process code for line numbers and highlighting
  const processedLines = code.split('\n').map((line, index) => ({
    content: line,
    number: index + 1,
    highlighted: highlightLines.includes(index + 1)
  }));

  if (!mounted) {
    return (
      <div className={cn('rounded-lg bg-muted p-4', className)}>
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Header */}
      {(title || filename || terminal) && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900 rounded-t-lg">
          <div className="flex items-center gap-2">
            {terminal ? (
              <Terminal className="h-4 w-4 text-zinc-400" />
            ) : (
              <FileCode2 className="h-4 w-4 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-300">
              {title || filename || 'Terminal'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Mac-style window controls for terminal */}
            {terminal && (
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            )}
            <span className="text-xs text-zinc-500">{language}</span>
          </div>
        </div>
      )}

      {/* Code content */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg',
          title || filename || terminal ? 'rounded-t-none' : '',
          terminal ? 'bg-zinc-900' : 'bg-zinc-800 dark:bg-zinc-950'
        )}
      >
        {/* Action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
          {downloadButton && filename && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-8 px-2 text-zinc-400 hover:text-zinc-100"
              title={`Download ${filename}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {copyButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 px-2 text-zinc-400 hover:text-zinc-100"
              title="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Code with syntax highlighting */}
        <div className="overflow-x-auto">
          <pre
            className={cn(
              'p-4 text-sm',
              terminal && 'font-mono',
              wrapLongLines && 'whitespace-pre-wrap'
            )}
          >
            {showLineNumbers ? (
              <table className="w-full border-collapse">
                <tbody>
                  {processedLines.map((line) => (
                    <tr
                      key={line.number}
                      className={cn(
                        line.highlighted && 'bg-yellow-500/10'
                      )}
                    >
                      <td
                        className={cn(
                          'select-none pr-4 text-zinc-500 text-right',
                          'sticky left-0 bg-inherit'
                        )}
                        style={{ width: '1%' }}
                      >
                        {line.number}
                      </td>
                      <td className="pr-4">
                        <code
                          className={`language-${language}`}
                          dangerouslySetInnerHTML={{
                            __html: highlightSyntax(line.content, language)
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <code
                className={cn(
                  `language-${language}`,
                  terminal && 'text-green-400'
                )}
                dangerouslySetInnerHTML={{
                  __html: terminal
                    ? formatTerminalOutput(code)
                    : highlightSyntax(code, language)
                }}
              />
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighting (in production, use a proper library like Prism.js)
function highlightSyntax(code: string, language: string): string {
  // This is a placeholder - in production, integrate with a syntax highlighting library
  // For now, just escape HTML
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format terminal output with color codes
function formatTerminalOutput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\$ (.+)$/gm, '<span class="text-blue-400">$</span> <span class="text-white">$1</span>')
    .replace(/^(›|\>)(.+)$/gm, '<span class="text-zinc-500">›</span>$2')
    .replace(/^(✓|✔)(.+)$/gm, '<span class="text-green-500">✓</span>$2')
    .replace(/^(✗|✖|ERROR)(.+)$/gm, '<span class="text-red-500">✗</span>$2')
    .replace(/^(WARNING)(.+)$/gm, '<span class="text-yellow-500">WARNING</span>$2');
}

// Preset code snippets for common use cases
export const CodeSnippets = {
  // Quick start example
  quickStart: `import { getWasmLoader } from '@/lib/claude-sdk/wasm-loader';

// Initialize the WASM loader
const loader = getWasmLoader();
await loader.initialize();

// Load a module
const module = await loader.loadModule(
  '/wasm/claude.wasm',
  'claude-ai'
);

// Execute code
const result = await module.exports.process('Hello, Claude!');
console.log(result);`,

  // React integration
  reactIntegration: `import { useWasmLoader } from '@/lib/claude-sdk/wasm-loader';
import { useEffect, useState } from 'react';

function MyComponent() {
  const wasmLoader = useWasmLoader();
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    async function initialize() {
      await wasmLoader.initialize();
      const module = await wasmLoader.loadModule(
        '/wasm/processor.wasm',
        'processor'
      );
      
      const output = await module.exports.process('input');
      setResult(output);
    }
    
    initialize();
  }, [wasmLoader]);

  return <div>{result}</div>;
}`,

  // Error handling
  errorHandling: `try {
  const result = await playground.executeCode(code);
  
  if (!result.success) {
    console.error('Execution failed:', result.error);
    // Handle error appropriately
    return;
  }
  
  console.log('Output:', result.output);
} catch (error) {
  if (error instanceof WasmLoadError) {
    console.error('Failed to load module:', error.message);
  } else if (error instanceof ExecutionError) {
    console.error('Execution error:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}`,

  // Terminal commands
  terminalCommands: `$ npm install @claude-sdk/web
› added 12 packages in 2.3s

$ npm run dev
› Starting development server...
✓ Ready on http://localhost:3000

$ npm test
› Running tests...
✓ 42 tests passed
✗ 0 tests failed`
};

// Convenience wrapper for inline code
export function InlineCode({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded bg-muted font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}