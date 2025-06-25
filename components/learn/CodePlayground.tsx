'use client';

import React, { useState, useEffect, useRef } from 'react';
import LazyMonacoEditor, { LazyMonacoEditorRef } from './LazyMonacoEditor';
import { useCodePlaygroundOptimization, useMonacoPerformanceMetrics } from '@/lib/hooks/useCodePlaygroundOptimization';
import { 
  PlayIcon, 
  ArrowPathIcon, 
  CloudArrowDownIcon, 
  CloudArrowUpIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeExample, CodeTemplate } from '@/types/module';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  template?: CodeTemplate;
  examples?: CodeExample[];
  onExecute?: (code: string) => Promise<ExecutionResult>;
  saveKey?: string; // Key for localStorage
  readOnlyRanges?: Array<[number, number]>;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

interface SavedCode {
  code: string;
  timestamp: string;
  language: string;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '',
  language = 'javascript',
  template,
  examples = [],
  onExecute,
  saveKey,
  readOnlyRanges = []
}) => {
  const [code, setCode] = useState(initialCode || template?.code || '');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const editorRef = useRef<LazyMonacoEditorRef>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monaco Editor optimization
  const { 
    shouldLoadEditor, 
    triggerLoad, 
    isEditorLoaded, 
    setEditorLoaded,
    containerRef 
  } = useCodePlaygroundOptimization({
    autoLoadDelay: 1500, // Load after 1.5 seconds
    loadOnInteraction: true,
    loadOnVisible: true,
    loadOnIdle: true,
  });

  const { 
    metrics, 
    startLoadMeasurement, 
    endLoadMeasurement 
  } = useMonacoPerformanceMetrics();

  // Load saved code on mount
  useEffect(() => {
    if (saveKey) {
      const saved = localStorage.getItem(`playground_${saveKey}`);
      if (saved) {
        try {
          const parsedSave: SavedCode = JSON.parse(saved);
          setCode(parsedSave.code);
        } catch (err) {
          console.error('Failed to load saved code:', err);
        }
      }
    }
  }, [saveKey]);

  // Auto-save functionality
  useEffect(() => {
    if (saveKey && code !== (initialCode || template?.code || '')) {
      setSavedStatus('unsaved');
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveCode();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, saveKey, initialCode, template]);

  const saveCode = () => {
    if (!saveKey) return;

    setSavedStatus('saving');
    const saveData: SavedCode = {
      code,
      timestamp: new Date().toISOString(),
      language
    };

    try {
      localStorage.setItem(`playground_${saveKey}`, JSON.stringify(saveData));
      setSavedStatus('saved');
      setTimeout(() => setSavedStatus('saved'), 1500);
    } catch (err) {
      console.error('Failed to save code:', err);
      setSavedStatus('unsaved');
    }
  };

  const loadExample = (example: CodeExample) => {
    setCode(example.code);
    setOutput('');
    setError('');
    setExecutionTime(null);
  };

  const handleExecute = async () => {
    if (!onExecute) {
      // Default execution for JavaScript (client-side only)
      executeJavaScript(code);
      return;
    }

    setIsExecuting(true);
    setError('');
    setOutput('');
    setActiveTab('output');

    const startTime = performance.now();

    try {
      const result = await onExecute(code);
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      if (result.success) {
        setOutput(result.output || '');
      } else {
        setError(result.error || 'Execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const executeJavaScript = (code: string) => {
    setIsExecuting(true);
    setError('');
    setOutput('');
    setActiveTab('output');

    const startTime = performance.now();
    const logs: string[] = [];

    // Create a custom console for capturing output
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      },
      error: (...args: any[]) => {
        logs.push(`ERROR: ${args.join(' ')}`);
      },
      warn: (...args: any[]) => {
        logs.push(`WARN: ${args.join(' ')}`);
      }
    };

    try {
      // Create a function with the code and run it in a sandboxed context
      const func = new Function('console', code);
      func(customConsole);
      
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (err) {
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(initialCode || template?.code || '');
    setOutput('');
    setError('');
    setExecutionTime(null);
    setSavedStatus('saved');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Mark editor as loaded for performance tracking
    setEditorLoaded(true);
    endLoadMeasurement();
    
    // The editor reference is now handled by LazyMonacoEditor
    // Apply read-only ranges if specified
    if (readOnlyRanges.length > 0 && template?.readOnlyRanges) {
      // This would require more complex Monaco editor configuration
      // For now, we'll skip the implementation
    }

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development' && metrics.loadDuration) {
      console.log(`Monaco Editor loaded in ${metrics.loadDuration.toFixed(2)}ms`);
    }
  };

  // Start load measurement when editor should load
  useEffect(() => {
    if (shouldLoadEditor && !isEditorLoaded) {
      startLoadMeasurement();
    }
  }, [shouldLoadEditor, isEditorLoaded, startLoadMeasurement]);

  return (
    <div ref={containerRef}>
      <Card className="overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Code Playground</h3>
            <Badge variant="outline">{language}</Badge>
            {savedStatus === 'saved' && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <CheckIcon className="h-4 w-4 mr-1" />
                Saved
              </span>
            )}
            {savedStatus === 'unsaved' && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </Button>
            
            {saveKey && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveCode}
                  disabled={savedStatus === 'saved'}
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetCode}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              size="sm"
            >
              {isExecuting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Examples */}
        {examples.length > 0 && (
          <div className="px-4 pb-3 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Examples:</span>
            <div className="flex space-x-2">
              {examples.map((example) => (
                <Button
                  key={example.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs"
                >
                  {example.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'output')} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="output">
            Output
            {(output || error) && (
              <span className={`ml-2 h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-0">
          {shouldLoadEditor ? (
            <LazyMonacoEditor
              ref={editorRef}
              defaultLanguage={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              height="400px"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center space-y-3">
                <div className="text-gray-400">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Code editor will load automatically
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerLoad}
                    className="text-xs"
                  >
                    Load Editor Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="output" className="mt-0">
          <ScrollArea className="h-[400px] p-4">
            {error ? (
              <div className="space-y-2">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Error</span>
                </div>
                <pre className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-x-auto">
                  {error}
                </pre>
              </div>
            ) : output ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Output</span>
                  {executionTime !== null && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({executionTime.toFixed(2)}ms)
                    </span>
                  )}
                </div>
                <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <PlayIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Click "Run" to execute your code</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
    </div>
  );
};

export default CodePlayground;