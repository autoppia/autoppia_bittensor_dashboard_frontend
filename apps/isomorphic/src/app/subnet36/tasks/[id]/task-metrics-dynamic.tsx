"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import {
  PiChartLine,
  PiClock,
  PiCpu,
  PiMemory,
  PiWifiHigh,
  PiTrendUp,
  PiTrendDown,
  PiMinus,
  PiArrowClockwise,
} from "react-icons/pi";
import { useTaskMetrics } from "@/services/hooks/useTask";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";

// Format duration in seconds to human readable format
const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

// Format memory usage
const formatMemory = (mb: number) => {
  if (mb < 1024) {
    return `${mb.toFixed(0)} MB`;
  } else {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
};

// Format network usage
const formatNetwork = (kb: number) => {
  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  } else if (kb < 1024 * 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  } else {
    return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
  }
};

// Get trend icon based on value
const getTrendIcon = (value: number, previousValue?: number) => {
  if (previousValue === undefined) return <PiMinus className="w-4 h-4 text-gray-500" />;

  if (value > previousValue) {
    return <PiTrendUp className="w-4 h-4 text-green-500" />;
  } else if (value < previousValue) {
    return <PiTrendDown className="w-4 h-4 text-red-500" />;
  } else {
    return <PiMinus className="w-4 h-4 text-gray-500" />;
  }
};

export default function TaskMetricsDynamic() {
  const { id } = useParams();
  const { metrics, isLoading, error } = useTaskMetrics(id as string);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <StatsCardPlaceholder key={`metrics-loading-${index}`} />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiChartLine className="w-5 h-5 text-red-500" />
            <Text className="text-red-700 font-medium">Failed to load metrics</Text>
          </div>
          <button
            onClick={() => globalThis.window.location.reload()}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Retry loading metrics"
          >
            <PiArrowClockwise className="w-4 h-4" />
          </button>
        </div>
        <Text className="text-red-600 text-sm mt-2">
          {error || 'Unable to fetch performance metrics for this task'}
        </Text>
      </div>
    );
  }

  const {
    duration,
    actionsPerSecond,
    averageActionDuration,
    totalWaitTime,
    totalNavigationTime,
    memoryUsage = [],
    cpuUsage = []
  } = metrics;

  // Calculate current vs previous values for trends
  const currentMemory = memoryUsage.length > 0 ? memoryUsage[memoryUsage.length - 1]?.value : 0;
  const previousMemory = memoryUsage.length > 1 ? memoryUsage[memoryUsage.length - 2]?.value : undefined;

  const currentCpu = cpuUsage.length > 0 ? cpuUsage[cpuUsage.length - 1]?.value : 0;
  const previousCpu = cpuUsage.length > 1 ? cpuUsage[cpuUsage.length - 2]?.value : undefined;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Duration */}
        <div className="bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 border-2 border-blue-500/40 rounded-2xl p-5 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="text-center h-full flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
              <PiClock className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-blue-300 mb-2">DURATION</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {formatDuration(duration)}
            </div>
            <div className="text-xs text-blue-200 mt-2">
              Total execution time
            </div>
          </div>
        </div>

        {/* Actions Per Second */}
        <div className="bg-gradient-to-br from-green-500/15 via-emerald-500/15 to-teal-500/15 border-2 border-green-500/40 rounded-2xl p-5 hover:border-green-400/60 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="text-center h-full flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
              <PiChartLine className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-green-300 mb-2">SPEED</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
              {actionsPerSecond.toFixed(2)}
            </div>
            <div className="text-xs text-green-200 mt-2">
              Actions per second
            </div>
          </div>
        </div>

        {/* Average Action Duration */}
        <div className="bg-gradient-to-br from-orange-500/15 via-amber-500/15 to-yellow-500/15 border-2 border-orange-500/40 rounded-2xl p-5 hover:border-orange-400/60 hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="text-center h-full flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
              <PiClock className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-orange-300 mb-2">AVG ACTION</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              {formatDuration(averageActionDuration)}
            </div>
            <div className="text-xs text-orange-200 mt-2">
              Per action average
            </div>
          </div>
        </div>

        {/* Wait Time */}
        <div className="bg-gradient-to-br from-red-500/15 via-pink-500/15 to-rose-500/15 border-2 border-red-500/40 rounded-2xl p-5 hover:border-red-400/60 hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="text-center h-full flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
              <PiClock className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-red-300 mb-2">WAIT TIME</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
              {formatDuration(totalWaitTime)}
            </div>
            <div className="text-xs text-red-200 mt-2">
              Total waiting time
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="border border-muted rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PiMemory className="w-5 h-5 text-blue-500" />
              <Text className="text-white text-lg font-medium">Memory Usage</Text>
            </div>
            {getTrendIcon(currentMemory, previousMemory)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-gray-600 text-sm">Current Usage</Text>
              <Text className="text-lg font-bold text-blue-600">
                {formatMemory(currentMemory)}
              </Text>
            </div>

            {memoryUsage.length > 1 && (
              <div className="space-y-2">
                <Text className="text-gray-600 text-sm">Usage Over Time</Text>
                <div className="h-20 bg-gray-100 rounded-lg p-2">
                  <div className="flex items-end justify-between h-full">
                    {memoryUsage.slice(-10).map((usage: any) => {
                      const maxUsage = Math.max(...memoryUsage.map((u: any) => u.value));
                      const height = (usage.value / maxUsage) * 100;
                      return (
                        <div
                          key={usage.timestamp ?? String(usage.value)}
                          className="bg-blue-500 rounded-sm flex-1 mx-0.5"
                          style={{ height: `${height}%` }}
                          title={`${formatMemory(usage.value)} at ${new Date(usage.timestamp).toLocaleTimeString()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CPU Usage */}
        <div className="border border-muted rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PiCpu className="w-5 h-5 text-green-500" />
              <Text className="text-white text-lg font-medium">CPU Usage</Text>
            </div>
            {getTrendIcon(currentCpu, previousCpu)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-gray-600 text-sm">Current Usage</Text>
              <Text className="text-lg font-bold text-green-600">
                {currentCpu.toFixed(1)}%
              </Text>
            </div>

            {cpuUsage.length > 1 && (
              <div className="space-y-2">
                <Text className="text-gray-600 text-sm">Usage Over Time</Text>
                <div className="h-20 bg-gray-100 rounded-lg p-2">
                  <div className="flex items-end justify-between h-full">
                    {cpuUsage.slice(-10).map((usage: any) => {
                      const height = usage.value;
                      return (
                        <div
                          key={usage.timestamp ?? String(usage.value)}
                          className="bg-green-500 rounded-sm flex-1 mx-0.5"
                          style={{ height: `${height}%` }}
                          title={`${usage.value.toFixed(1)}% at ${new Date(usage.timestamp).toLocaleTimeString()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Time */}
        <div className="border border-muted rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <PiWifiHigh className="w-5 h-5 text-purple-500" />
            <Text className="text-white font-medium">Navigation Time</Text>
          </div>
          <Text className="text-2xl font-bold text-purple-600">
            {formatDuration(totalNavigationTime)}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            Total navigation time
          </Text>
        </div>

        {/* Efficiency Score */}
        <div className="border border-muted rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <PiChartLine className="w-5 h-5 text-indigo-500" />
            <Text className="text-white font-medium">Efficiency</Text>
          </div>
          <Text className="text-2xl font-bold text-indigo-600">
            {((1 - totalWaitTime / duration) * 100).toFixed(1)}%
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            Active time ratio
          </Text>
        </div>

        {/* Data Points */}
        <div className="border border-muted rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <PiChartLine className="w-5 h-5 text-teal-500" />
            <Text className="text-white font-medium">Data Points</Text>
          </div>
          <Text className="text-2xl font-bold text-teal-600">
            {memoryUsage.length + cpuUsage.length}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            Metrics collected
          </Text>
        </div>
      </div>
    </div>
  );
}
