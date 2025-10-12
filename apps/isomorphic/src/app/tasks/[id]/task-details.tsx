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
import { useTask } from "@/services/hooks/useTask";

export default function TaskDetails() {
  const { id } = useParams();
  
  // Use the API hook to get real task data
  const { data, isLoading, error } = useTask(id as string, {
    includeDetails: true,
    includePersonas: false,
    includeResults: false,
    includeStatistics: false,
  });
  
  const taskData = data.details;

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-emerald-400">Loading task details...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !taskData) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">
            Failed to Load Task Data
          </div>
          <div className="text-red-300 text-sm">
            {error || 'Task not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="hidden md:flex flex-col space-y-6">
        {/* Task Stats - responsive centered layout */}
        <div className="flex flex-wrap justify-center gap-6 xl:gap-8">
          <div className="text-center w-full max-w-[160px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiGlobe className="w-4 h-4 text-blue-400" />
              <div className="text-xl font-bold text-blue-400">
                {taskData?.website || "Unknown"}
              </div>
            </div>
            <div className="text-xs text-gray-700">Website</div>
          </div>
          <div className="text-center w-full max-w-[160px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTarget className="w-4 h-4 text-green-400" />
              <div className="text-xl font-bold text-green-400">
                {taskData?.useCase || "Unknown"}
              </div>
            </div>
            <div className="text-xs text-gray-700">Use Case</div>
          </div>
          <div className="text-center w-full max-w-[160px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiChartBar className="w-4 h-4 text-red-400" />
              <div className="text-xl font-bold text-red-400">
                {taskData?.score || 0}
              </div>
            </div>
            <div className="text-xs text-gray-700">Score</div>
          </div>
          <div className="text-center w-full max-w-[160px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTimer className="w-4 h-4 text-orange-400" />
              <div className="text-xl font-bold text-orange-400">
                {taskData?.duration || 0}s
              </div>
            </div>
            <div className="text-xs text-gray-700">Duration</div>
          </div>
          <div className="text-center w-full max-w-[160px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiPlay className="w-4 h-4 text-purple-400" />
              <Link 
                href={`/agent-run/${taskData?.agentRunId || ''}`}
                className="text-xl font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                {taskData?.agentRunId || 'N/A'}
              </Link>
            </div>
            <div className="text-xs text-gray-700">Run ID</div>
          </div>
        </div>

        <div className="w-full flex items-center gap-4">
          <div className="flex h-full items-center w-[144px] gap-2">
            <PiFileText className="w-5 h-5 text-purple-400" />
            <Text className="text-white text-lg font-medium">Task Prompt:</Text>
          </div>
          <div className="flex-1 p-4 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-lg">
            <Text className="text-gray-800 text-sm leading-relaxed">
              {taskData?.prompt || "Buy a product which has a price of 1000"}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
