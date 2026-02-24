'use client';

import { useEffect } from 'react';
import { PiWarningCircleDuotone, PiArrowClockwiseDuotone, PiHouseDuotone } from 'react-icons/pi';

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Simple Error Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-xl">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <PiWarningCircleDuotone className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-300 mb-8 text-sm">
            An unexpected error occurred. Please try again.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <PiArrowClockwiseDuotone className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => globalThis.window.location.href = '/'}
              className="px-6 py-3 bg-black hover:bg-gray-900 border border-gray-700 hover:border-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <PiHouseDuotone className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
