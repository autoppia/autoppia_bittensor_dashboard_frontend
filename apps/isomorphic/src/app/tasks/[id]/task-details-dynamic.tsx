"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Text } from "rizzui";
import {
  PiGlobe,
  PiTarget,
  PiChartBar,
  PiTimer,
  PiFileText,
  PiPlay,
} from "react-icons/pi";
import { useTaskDetails } from "@/services/hooks/useTask";
import LoadingScreen from "@/app/shared/loading-screen";
import Placeholder, { TextPlaceholder } from "@/app/shared/placeholder";

export default function TaskDetailsDynamic() {
  const { id } = useParams();
  const { details, isLoading, error } = useTaskDetails(id as string);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="hidden md:flex flex-col space-y-6">
          <div className="grid grid-cols-6 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Placeholder variant="circular" width={16} height={16} />
                  <Placeholder height="1.25rem" width="60%" />
                </div>
                <Placeholder height="0.75rem" width="80%" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="md:hidden flex flex-col space-y-4">
          <div className="text-center">
            <Placeholder height="2rem" width="40%" className="mx-auto mb-2" />
            <Placeholder height="0.75rem" width="60%" className="mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="text-center">
                <Placeholder height="1.5rem" width="60%" className="mx-auto mb-1" />
                <Placeholder height="0.75rem" width="80%" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Task Details</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="hidden md:flex flex-col space-y-6">
        {/* Task Stats Grid - 2x3 on desktop */}
        <div className="grid grid-cols-6 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiGlobe className="w-4 h-4 text-blue-400" />
              <div className="text-xl font-bold text-blue-400">
                {details.website}
              </div>
            </div>
            <div className="text-xs text-gray-700">Website</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTarget className="w-4 h-4 text-green-400" />
              <div className="text-xl font-bold text-green-400">
                {details.useCase}
              </div>
            </div>
            <div className="text-xs text-gray-700">Use Case</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiChartBar className="w-4 h-4 text-purple-400" />
              <div className="text-xl font-bold text-purple-400">
                {Math.round(details.score * 100)}%
              </div>
            </div>
            <div className="text-xs text-gray-700">Score</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTimer className="w-4 h-4 text-orange-400" />
              <div className="text-xl font-bold text-orange-400">
                {details.duration}s
              </div>
            </div>
            <div className="text-xs text-gray-700">Duration</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiFileText className="w-4 h-4 text-indigo-400" />
              <div className="text-xl font-bold text-indigo-400">
                {details.performance.totalActions}
              </div>
            </div>
            <div className="text-xs text-gray-700">Actions</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiPlay className="w-4 h-4 text-teal-400" />
              <div className="text-xl font-bold text-teal-400">
                {details.status}
              </div>
            </div>
            <div className="text-xs text-gray-700">Status</div>
          </div>
        </div>

        {/* Task Prompt */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Task Prompt</div>
          <div className="text-gray-800 text-sm leading-relaxed">
            {details.prompt}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {details.performance.successfulActions}
            </div>
            <div className="text-xs text-gray-600">Successful Actions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              {details.performance.failedActions}
            </div>
            <div className="text-xs text-gray-600">Failed Actions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {details.performance.averageActionDuration.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-600">Avg Action Duration</div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-4 md:hidden">
        {/* Overall Score - Prominent on mobile */}
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {Math.round(details.score * 100)}%
          </div>
          <div className="text-sm text-gray-700 mt-1">Task Score</div>
        </div>

        {/* Task Info */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Task Details</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Website:</span>
              <span className="font-medium">{details.website}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Use Case:</span>
              <span className="font-medium">{details.useCase}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{details.duration}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{details.status}</span>
            </div>
          </div>
        </div>

        {/* Task Prompt */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Prompt</div>
          <div className="text-gray-800 text-sm leading-relaxed">
            {details.prompt}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {details.performance.successfulActions}
            </div>
            <div className="text-xs text-gray-600">Successful</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              {details.performance.failedActions}
            </div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
