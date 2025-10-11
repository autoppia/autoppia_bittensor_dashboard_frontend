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
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded"
          >
            Go Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-w-md">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
