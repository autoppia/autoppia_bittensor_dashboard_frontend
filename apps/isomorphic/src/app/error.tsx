'use client';

import { useEffect } from 'react';
import { PiWarningCircleDuotone, PiArrowClockwiseDuotone, PiHouseDuotone } from 'react-icons/pi';

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Dark Background Effects */}
      <div className="absolute inset-0">
        {/* Darker gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Animated gradient orbs with darker tones */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-600/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Subtle grid pattern with darker opacity */}
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Error Card */}
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/50 p-8 text-center relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
          
          {/* Error Icon with enhanced styling */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full mb-4 relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <PiWarningCircleDuotone className="w-10 h-10 text-red-400 relative z-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              An unexpected error occurred. Please try again.
            </p>

            {/* Enhanced Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="group px-8 py-3 bg-white hover:bg-gray-100 text-black text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/25 hover:shadow-white/40 transform hover:scale-105"
              >
                <PiArrowClockwiseDuotone className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="group px-8 py-3 bg-black hover:bg-gray-900 border border-gray-700 hover:border-gray-600 text-white hover:text-gray-100 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PiHouseDuotone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-lg">
            <details className="text-left group">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Error Details
                <span className="ml-auto text-xs text-gray-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="mt-4 p-4 bg-black/60 rounded-xl border border-gray-800">
                <div className="text-red-400 mb-2 text-xs font-semibold">Error:</div>
                <div className="text-yellow-400 text-xs font-mono mb-3 break-words">{error.message}</div>
                {error.digest && (
                  <div className="text-blue-400 text-xs font-mono">ID: {error.digest}</div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
