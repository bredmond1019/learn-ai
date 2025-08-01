import React from 'react';

// Simple component that wraps standard markdown code blocks with better styling
export const CodeExample = ({ children, title, language, fileName, code, ...props }: any) => {
  // Support both children and code prop for flexibility
  const content = code || children;
  
  return (
    <div className="my-6" {...props}>
      {title && (
        <div className="mb-2 text-sm text-gray-400">{title}</div>
      )}
      {fileName && (
        <div className="mb-2 text-xs text-gray-500">{fileName}</div>
      )}
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-gray-300 font-mono text-sm">
          <code className={language ? `language-${language}` : ''}>
            {content}
          </code>
        </pre>
      </div>
    </div>
  );
};