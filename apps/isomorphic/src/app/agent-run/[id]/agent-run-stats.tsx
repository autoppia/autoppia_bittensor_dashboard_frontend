"use client";

import { PiCheckCircle, PiXCircle, PiClock, PiGlobe } from "react-icons/pi";

interface AgentRunStatsProps {
  stats?: any;
}

export default function AgentRunStats({ stats }: AgentRunStatsProps) {
  // Debug: Log the data to see what we're receiving
  console.log("AgentRunStats - stats:", stats);
  
  // Use actual data or fallback to defaults
  const overallScore = stats?.overallScore || 91;
  const totalTasks = stats?.totalTasks || 360;
  const successfulTasks = stats?.successfulTasks || 233;
  const failedTasks = stats?.failedTasks || 127;
  const averageDuration = stats?.averageTaskDuration || 8.3;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl mb-6">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/10 via-blue-500/5 to-transparent blur-[120px]" />
      
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 md:hidden relative">
        {/* Overall Score - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {overallScore}%
          </div>
          <div className="text-sm text-slate-400 mt-2 font-medium">
            Overall evaluation score
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiClock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {totalTasks}
            </div>
            <div className="text-sm text-slate-400 font-medium">Total Tasks</div>
          </div>
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiGlobe className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-orange-400">
              3
            </div>
            <div className="text-sm text-slate-400 font-medium">Websites</div>
          </div>
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiCheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {successfulTasks}
            </div>
            <div className="text-sm text-slate-400 font-medium">Successful</div>
          </div>
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiXCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-red-400">
              {failedTasks}
            </div>
            <div className="text-sm text-slate-400 font-medium">Failed</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiClock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-400">{totalTasks}</div>
            <div className="text-sm text-slate-400 font-medium">Total Tasks</div>
          </div>
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiGlobe className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-400">3</div>
            <div className="text-sm text-slate-400 font-medium">Websites</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mx-8">
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {overallScore}%
          </div>
          <div className="text-sm text-slate-400 mt-2 font-medium">
            Overall evaluation score
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiCheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-emerald-400">{successfulTasks}</div>
            <div className="text-sm text-slate-400 font-medium">Successful</div>
          </div>
          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-700/25">
            <PiXCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-400">{failedTasks}</div>
            <div className="text-sm text-slate-400 font-medium">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
