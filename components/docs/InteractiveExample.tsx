'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Copy, RotateCcw, Check, Loader2 } from 'lucide-react';
import { usePlayground } from '@/lib/claude-sdk/playground';
import { cn } from '@/lib/utils';

interface InteractiveExampleProps {
  title: string;
  description?: string;
  initialCode: string;
  language?: 'rust' | 'javascript' | 'typescript';
  editable?: boolean;
  runnable?: boolean;
  expectedOutput?: string;
  hints?: string[];
  className?: string;
}

export function InteractiveExample({
  title,
  description,
  initialCode,
  language = 'rust',
  editable = true,
  runnable = true,
  expectedOutput,
  hints,
  className
}: InteractiveExampleProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHints, setShowHints] = useState(false);
  
  const playground = usePlayground();

  // Reset code to initial
  const handleReset = useCallback(() => {
    setCode(initialCode);
    setOutput('');
    setError('');
    setShowHints(false);
  }, [initialCode]);

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

  // Run the code
  const handleRun = useCallback(async () => {
    if (!runnable) return;

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const result = await playground.executeCode(code);
      
      if (result.success) {
        setOutput(result.output || '');
        
        // Check if output matches expected (if provided)
        if (expectedOutput && result.output?.trim() !== expectedOutput.trim()) {
          setShowHints(true);
        }
      } else {
        setError(result.error || 'Execution failed');
        setShowHints(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setShowHints(true);
    } finally {
      setIsRunning(false);
    }
  }, [code, playground, runnable, expectedOutput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && runnable) {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleCopy, runnable]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              title="Copy code (Ctrl+S)"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              title="Reset code"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {runnable && (
              <Button
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                title="Run code (Ctrl+Enter)"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="ml-1">Run</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value="code" className="w-full" onValueChange={() => {}}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="output">
              Output
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                {editable ? (
                  <code
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setCode(e.currentTarget.textContent || '')}
                    className={cn(
                      'block outline-none',
                      `language-${language}`
                    )}
                    style={{ whiteSpace: 'pre' }}
                  >
                    {code}
                  </code>
                ) : (
                  <code className={`language-${language}`}>{code}</code>
                )}
              </pre>
              
              {/* Language indicator */}
              <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                {language}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="mt-4">
            <div className="p-4 bg-muted rounded-lg">
              {error ? (
                <div className="text-red-600">
                  <strong>Error:</strong>
                  <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
                </div>
              ) : output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <span className="text-muted-foreground">No output yet</span>
              )}
              
              {expectedOutput && output && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Expected output:
                  </div>
                  <pre className="mt-1 text-sm">{expectedOutput}</pre>
                  <div className="mt-2">
                    {output.trim() === expectedOutput.trim() ? (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <Check className="h-4 w-4" /> Correct!
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm">
                        Output doesn't match expected result
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Hints section */}
        {hints && hints.length > 0 && showHints && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Hints:</h4>
            <ul className="list-disc list-inside space-y-1">
              {hints.map((hint, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Keyboard shortcuts help */}
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="mr-4">
            <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd>+
            <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to run
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd>+
            <kbd className="px-1 py-0.5 bg-muted rounded">S</kbd> to copy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper component for lazy loading
export function LazyInteractiveExample(props: InteractiveExampleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className={props.className}>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          {props.description && <CardDescription>{props.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return <InteractiveExample {...props} />;
}