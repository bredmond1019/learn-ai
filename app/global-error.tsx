'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-4">
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
        </div>
      </body>
    </html>
  );
}