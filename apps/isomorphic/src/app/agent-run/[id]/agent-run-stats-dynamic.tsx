"use client";

import { useParams } from "next/navigation";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import { ProgressBarLoading } from "@/app/shared/loading-screen";
import { ProgressBarPlaceholder } from "@/app/shared/placeholder";

const formatPercentage = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
};

const formatNumber = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
};

export default function AgentRunStatsDynamic() {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  if (isLoading) {
    return <ProgressBarLoading className="mb-6" />;
  }

  if (error || !stats) {
    return <ProgressBarPlaceholder className="mb-6" />;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 md:hidden">
        {/* Overall Score - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formatPercentage(stats.overallScore)}
          </div>
          <div className="text-xs sm:text-sm text-gray-700 mt-1">
            Overall evaluation score
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">
              {formatNumber(stats.totalTasks)}
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-400">
              {formatNumber(stats.websites)}
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Websites</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              {formatNumber(stats.successfulTasks)}
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-400">
              {formatNumber(stats.failedTasks)}
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Failed</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {/* Overall Score */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formatPercentage(stats.overallScore)}
          </div>
          <div className="text-sm text-gray-700">Overall Score</div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatNumber(stats.totalTasks)}
            </div>
            <div className="text-sm text-gray-700">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {formatNumber(stats.websites)}
            </div>
            <div className="text-sm text-gray-700">Websites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(stats.successfulTasks)}
            </div>
            <div className="text-sm text-gray-700">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {formatNumber(stats.failedTasks)}
            </div>
            <div className="text-sm text-gray-700">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatNumber(Number(stats.averageTaskDuration?.toFixed?.(1) ?? stats.averageTaskDuration))}s
            </div>
            <div className="text-sm text-gray-700">Avg Duration</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-emerald-400">
            {formatPercentage(stats.successRate)}
          </div>
          <div className="text-sm text-gray-700">Success Rate</div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="mt-6 pt-6 border-t border-gray-200/20">
          <div className="text-sm font-medium text-gray-700 mb-3">Score Distribution</div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">
                {formatNumber(stats.scoreDistribution.excellent)}
              </div>
              <div className="text-xs text-gray-600">Excellent (90-100%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">
                {formatNumber(stats.scoreDistribution.good)}
              </div>
              <div className="text-xs text-gray-600">Good (70-89%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-500">
                {formatNumber(stats.scoreDistribution.average)}
              </div>
              <div className="text-xs text-gray-600">Average (50-69%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">
                {formatNumber(stats.scoreDistribution.poor)}
              </div>
              <div className="text-xs text-gray-600">Poor (0-49%)</div>
            </div>
          </div>
        </div>
    </div>
  );
}
