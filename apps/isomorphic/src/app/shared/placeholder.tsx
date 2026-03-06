"use client";

import React from 'react';
import cn from "@core/utils/class-names";

interface PlaceholderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Placeholder({
  className = "",
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  animation = 'pulse'
}: Readonly<PlaceholderProps>) {
  const baseClasses = "bg-gray-200 rounded";
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: ""
  };

  const variantClasses = {
    text: "h-4 rounded-md",
    rectangular: "rounded-md",
    circular: "rounded-full",
    card: "rounded-lg"
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

// Specialized placeholder components
export function TextPlaceholder({ lines = 1, className = "" }: Readonly<{ lines?: number; className?: string }>) {
  return (
    <div className={className}>
      {Array.from({ length: lines }, (_, index) => (
        <Placeholder
          key={index}
          variant="text"
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
          className="mb-2 last:mb-0"
        />
      ))}
    </div>
  );
}

export function CardPlaceholder({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center space-x-3 mb-3">
        <Placeholder variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Placeholder height="1rem" width="60%" className="mb-2" />
          <Placeholder height="0.75rem" width="40%" />
        </div>
      </div>
      <Placeholder height="2rem" className="mb-3" />
      <div className="flex justify-between">
        <Placeholder height="0.75rem" width="30%" />
        <Placeholder height="0.75rem" width="20%" />
      </div>
    </div>
  );
}

export function StatsCardPlaceholder({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 border-2 border-gray-200/50 rounded-xl p-3 backdrop-blur-md overflow-hidden", className)}>
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-300/50 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-300/50 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-300/50 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-300/50 rounded-br-lg"></div>

      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-center space-x-2 mb-2">
          <Placeholder variant="circular" width={32} height={32} />
          <Placeholder height="0.75rem" width="60%" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center mb-2">
          <div className="text-center mb-2">
            <Placeholder height="2rem" width="80%" className="mx-auto mb-1" />
            <Placeholder height="0.75rem" width="70%" className="mx-auto" />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-200/30 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <Placeholder height="0.75rem" width="50%" />
            <Placeholder height="1rem" width="30%" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressBarPlaceholder({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <Placeholder height="1.5rem" width="8rem" />
        <div className="flex items-center space-x-2">
          <Placeholder variant="circular" width={8} height={8} />
          <Placeholder height="0.875rem" width="4rem" />
        </div>
      </div>

      {/* Progress Cells */}
      <div className="w-full flex items-center justify-between mb-4">
        {Array.from({ length: 50 }, (_, index) => (
          <Placeholder
            key={index}
            variant="rectangular"
            width="6px"
            height="2.5rem"
            className="rounded-full"
            animation="pulse"
          />
        ))}
      </div>

      {/* Block Info */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Placeholder height="0.875rem" width="4rem" />
            <Placeholder height="0.875rem" width="3rem" />
          </div>
          <div className="flex items-center space-x-1">
            <Placeholder height="0.875rem" width="5rem" />
            <Placeholder height="0.875rem" width="3rem" />
          </div>
          <div className="flex items-center space-x-1">
            <Placeholder height="0.875rem" width="4rem" />
            <Placeholder height="0.875rem" width="3rem" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowPlaceholder({ columns = 4, className = "" }: Readonly<{ columns?: number; className?: string }>) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }, (_, index) => (
        <td key={index} className="px-4 py-3">
          <Placeholder height="1rem" width={index === 0 ? '100%' : '80%'} />
        </td>
      ))}
    </tr>
  );
}

export function ListItemPlaceholder({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("flex items-center space-x-3 p-3 border border-gray-200 rounded-lg", className)}>
      <Placeholder variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Placeholder height="1rem" width="60%" className="mb-1" />
        <Placeholder height="0.75rem" width="40%" />
      </div>
      <div className="text-right">
        <Placeholder height="1.25rem" width="3rem" className="mb-1" />
        <Placeholder height="0.75rem" width="2rem" />
      </div>
    </div>
  );
}
