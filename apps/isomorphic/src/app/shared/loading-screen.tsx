"use client";

import React from 'react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'fullscreen';
  className?: string;
}

export default function LoadingScreen({
  title = "Loading...",
  subtitle = "Please wait while we fetch your data",
  size = 'md',
  variant = 'default',
  className = ""
}: Readonly<LoadingScreenProps>) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const fullscreenInnerCircleClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-20 h-20' };
  const fullscreenInnerDotClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  const fullscreenProgressBarWidth = { sm: 'w-48', md: 'w-64', lg: 'w-80' };
  const defaultOuterClasses = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const defaultInnerClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };
  const defaultTitleClasses = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center space-x-3 ${className}`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-600 font-medium">{title}</span>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Animated Logo/Icon */}
          <div className="relative">
            <div className={`${sizeClasses[size]} mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse`}>
              <div className={`${fullscreenInnerCircleClasses[size]} bg-white rounded-full flex items-center justify-center`}>
                <div className={`${fullscreenInnerDotClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin`}></div>
              </div>
            </div>
            {/* Pulsing rings */}
            <div className={`absolute inset-0 ${sizeClasses[size]} mx-auto border-2 border-blue-300 rounded-full animate-ping`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} mx-auto border border-purple-300 rounded-full animate-ping`} style={{animationDelay: '0.5s'}}></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
              {title}
            </h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Progress Bar */}
          <div className={`${fullscreenProgressBarWidth[size]} mx-auto`}>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4">
        {/* Animated Icon */}
        <div className="relative">
          <div className={`${sizeClasses[size]} mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse`}>
            <div className={`${defaultOuterClasses[size]} bg-white rounded-full flex items-center justify-center`}>
              <div className={`${defaultInnerClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin`}></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-1">
          <h3 className={`${defaultTitleClasses[size]} font-semibold text-gray-800`}>
            {title}
          </h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

// Specialized loading components
export function CardLoadingSkeleton({ count = 4, className = "" }: Readonly<{ count?: number; className?: string }>) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => {
        const colors = [
          'from-amber-500/15 via-orange-500/15 to-yellow-500/15',
          'from-emerald-500/15 via-green-500/15 to-teal-500/15',
          'from-violet-500/15 via-purple-500/15 to-fuchsia-500/15',
          'from-green-500/15 via-emerald-500/15 to-teal-500/15'
        ];
        const borderColors = [
          'border-amber-500/40',
          'border-emerald-500/40',
          'border-violet-500/40',
          'border-green-500/40'
        ];
        const iconColors = [
          'from-amber-400 to-orange-500',
          'from-emerald-400 to-teal-500',
          'from-violet-400 to-fuchsia-500',
          'from-green-400 to-emerald-500'
        ];

        return (
          <div
            key={index}
            className={`relative bg-gradient-to-br ${colors[index % colors.length]} border-2 ${borderColors[index % borderColors.length]} rounded-xl p-3 backdrop-blur-md overflow-hidden animate-pulse`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-400/50 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-400/50 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-400/50 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-400/50 rounded-br-lg"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center space-x-2 mb-2">
                <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br ${iconColors[index % iconColors.length]} rounded-lg shadow-lg animate-pulse`}>
                  <div className="w-4 h-4 bg-white/80 rounded"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col justify-center mb-2">
                <div className="text-center mb-2">
                  <div className="h-8 bg-gray-300 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-300/20 rounded-lg p-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressBarLoading({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-emerald-600 font-medium">Loading...</span>
        </div>
      </div>

      {/* Enhanced Progress Bar Loading */}
      <div className="w-full flex items-center justify-between mb-4">
        {Array.from({ length: 50 }, (_, index) => (
          <span
            key={index}
            className="w-[6px] h-10 rounded-full bg-gradient-to-b from-emerald-300/50 to-emerald-400/50 animate-pulse"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>

      {/* Loading Content */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-emerald-600 font-medium">Loading progress data...</span>
        </div>

        {/* Animated Progress Text */}
        <div className="text-sm text-gray-500 animate-pulse">
          Fetching current block and time remaining...
        </div>
      </div>
    </div>
  );
}
