'use client';

import React, { Suspense, lazy, forwardRef, useImperativeHandle, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Lazy load Monaco Editor
const MonacoEditor = lazy(() => 
  import('@monaco-editor/react').then(module => ({
    default: module.Editor
  }))
);

interface LazyMonacoEditorProps {
  defaultLanguage?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: any, monaco: any) => void;
  theme?: string;
  options?: any;
  height?: number | string;
  loading?: React.ReactNode;
}

interface LazyMonacoEditorRef {
  getEditor: () => any;
  focus: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
  getSelection: () => any;
  insertText: (text: string) => void;
}

// Loading skeleton for Monaco Editor
const MonacoLoadingSkeleton = ({ 
  height = 400, 
  onManualLoad 
}: { 
  height?: number | string;
  onManualLoad?: () => void;
}) => (
  <Card className="p-6" style={{ height }}>
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="space-y-3 w-full max-w-md">
        {/* Editor header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Line number and code skeleton */}
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
                i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Loading code editor...
        </p>
        {onManualLoad && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManualLoad}
            className="text-xs"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Load Editor Now
          </Button>
        )}
      </div>
    </div>
  </Card>
);

// Error boundary for Monaco Editor
const MonacoErrorFallback = ({ 
  error, 
  onRetry, 
  height = 400 
}: { 
  error: Error;
  onRetry: () => void;
  height?: number | string;
}) => (
  <Card className="p-6 border-red-200 dark:border-red-800" style={{ height }}>
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-center">
        <div className="text-red-500 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Editor Failed to Load
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          The code editor couldn't be loaded. This might be due to a network issue or browser compatibility.
        </p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <p className="text-xs text-gray-500">
            Error: {error.message}
          </p>
        </div>
      </div>
    </div>
  </Card>
);

const LazyMonacoEditor = forwardRef<LazyMonacoEditorRef, LazyMonacoEditorProps>(({
  defaultLanguage = 'javascript',
  value = '',
  onChange,
  onMount,
  theme = 'vs-dark',
  options = {},
  height = 400,
  loading,
  ...props
}, ref) => {
  const editorRef = useRef<any>(null);
  const [loadEditor, setLoadEditor] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Expose editor methods through ref
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    focus: () => editorRef.current?.focus(),
    setValue: (newValue: string) => editorRef.current?.setValue(newValue),
    getValue: () => editorRef.current?.getValue() || '',
    getSelection: () => editorRef.current?.getSelection(),
    insertText: (text: string) => {
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        editor.executeEdits('insert-text', [{
          range: selection,
          text,
        }]);
      }
    },
  }), []);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryKey(prev => prev + 1);
    setLoadEditor(true);
  };

  // Trigger editor loading on user interaction or component mount
  React.useEffect(() => {
    // Auto-load after a short delay for better user experience
    const timer = setTimeout(() => {
      setLoadEditor(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <MonacoErrorFallback 
        error={error} 
        onRetry={handleRetry} 
        height={height}
      />
    );
  }

  if (!loadEditor) {
    return loading || (
      <MonacoLoadingSkeleton 
        height={height} 
        onManualLoad={() => setLoadEditor(true)}
      />
    );
  }

  return (
    <div style={{ height }}>
      <Suspense 
        key={retryKey}
        fallback={loading || <MonacoLoadingSkeleton height={height} />}
      >
        <ErrorBoundary onError={setError}>
          <MonacoEditor
            height={height}
            defaultLanguage={defaultLanguage}
            value={value}
            onChange={onChange}
            onMount={handleEditorMount}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              ...options
            }}
            {...props}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

// Error boundary component for Monaco Editor
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Error will be handled by parent component
    }

    return this.props.children;
  }
}

LazyMonacoEditor.displayName = 'LazyMonacoEditor';

export default LazyMonacoEditor;
export type { LazyMonacoEditorRef, LazyMonacoEditorProps };