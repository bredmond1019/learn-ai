import React from 'react';

// Simple MDX components for learning modules
export const CodeExample = ({ children, title, language, fileName, highlightLines, ...props }: any) => {
  return (
    <div className="my-4 rounded-lg border border-gray-700 bg-gray-900 p-4" {...props}>
      {title && (
        <div className="mb-2 text-sm font-semibold text-gray-300">{title}</div>
      )}
      {fileName && (
        <div className="mb-2 text-xs text-gray-500">{fileName}</div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export const Callout = ({ type = 'info', children, ...props }: any) => {
  const styles = {
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    error: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div 
      className={`my-4 rounded-lg border-l-4 p-4 ${styles[type as keyof typeof styles] || styles.info}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Exercise = ({ children, ...props }: any) => {
  return (
    <div 
      className="my-6 rounded-lg border border-green-500 bg-green-50 p-6 dark:bg-green-900/20"
      {...props}
    >
      <div className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
        Exercise
      </div>
      {children}
    </div>
  );
};