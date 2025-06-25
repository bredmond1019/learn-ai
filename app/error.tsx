'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-3xl font-bold text-primary mb-4">
        Something went wrong!
      </h2>
      <p className="text-foreground/70 text-center mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && error.message && (
        <details className="mt-8 p-4 bg-accent/10 rounded-lg max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium text-foreground/70">
            Error details
          </summary>
          <pre className="mt-2 text-xs text-red-400 overflow-auto">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}