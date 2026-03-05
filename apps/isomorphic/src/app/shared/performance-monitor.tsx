"use client";

import { useEffect, useState } from "react";

interface PerformanceMonitorProps {
  label: string;
  startTime?: number;
}

export default function PerformanceMonitor({ label, startTime }: Readonly<PerformanceMonitorProps>) {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    if (startTime) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setLoadTime(duration);
      
      // Log performance metrics
      console.log(`🚀 ${label} loaded in ${duration.toFixed(2)}ms`);
      
      // Store in localStorage for debugging
      const metrics = JSON.parse(localStorage.getItem('performance-metrics') || '[]');
      metrics.push({
        label,
        duration,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('performance-metrics', JSON.stringify(metrics.slice(-50))); // Keep last 50 entries
    }
  }, [label, startTime]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !loadTime) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded z-50">
      {label}: {loadTime.toFixed(0)}ms
    </div>
  );
}

export function usePerformanceTimer(label: string) {
  const [startTime] = useState(() => performance.now());
  
  useEffect(() => {
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`⏱️ ${label} took ${duration.toFixed(2)}ms`);
    };
  }, [label, startTime]);

  return startTime;
}
