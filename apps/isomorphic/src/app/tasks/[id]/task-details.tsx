"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import {
  PiGlobe,
  PiTarget,
  PiChartBar,
  PiTimer,
  PiFileText,
} from "react-icons/pi";
import { tasksDataMap } from "@/data/tasks-data";

export default function TaskDetails() {
  const { id } = useParams();
  const taskData = tasksDataMap[id as string];

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="hidden md:flex flex-col space-y-6">
        {/* Task Stats Grid - 2x2 on desktop */}
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiGlobe className="w-4 h-4 text-blue-400" />
              <div className="text-xl font-bold text-blue-400">
                {taskData?.website || "Autozone"}
              </div>
            </div>
            <div className="text-xs text-gray-700">Website</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTarget className="w-4 h-4 text-green-400" />
              <div className="text-xl font-bold text-green-400">
                {taskData?.use_case || "buy_product"}
              </div>
            </div>
            <div className="text-xs text-gray-700">Use Case</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiChartBar className="w-4 h-4 text-red-400" />
              <div className="text-xl font-bold text-red-400">
                {taskData?.score || 0.95}
              </div>
            </div>
            <div className="text-xs text-gray-700">Score</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PiTimer className="w-4 h-4 text-orange-400" />
              <div className="text-xl font-bold text-orange-400">
                {taskData?.solutionTime || 10}s
              </div>
            </div>
            <div className="text-xs text-gray-700">Response Time</div>
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
