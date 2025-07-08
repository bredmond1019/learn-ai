import React from 'react';

// Simple component that wraps standard markdown code blocks with better styling
export const CodeExample = ({ children, title, language, fileName, ...props }: any) => {
  return (
    <div className="my-6" {...props}>
      {title && (
        <div className="mb-2 text-sm text-gray-400">{title}</div>
      )}
      {fileName && (
        <div className="mb-2 text-xs text-gray-500">{fileName}</div>
      )}
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};