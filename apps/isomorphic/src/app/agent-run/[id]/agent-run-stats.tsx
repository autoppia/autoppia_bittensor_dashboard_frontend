"use client";

import { PiListChecksDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiGlobeDuotone, PiChartBarDuotone } from "react-icons/pi";

export default function AgentRunStats() {
  return (
    <div className="group relative bg-black border border-cyan-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500 mb-6">
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

      {/* Main Content */}
      <div className="relative p-4 sm:p-6">

        {/* Mobile Layout: Stack vertically on small screens */}
        <div className="flex flex-col lg:hidden gap-4">
          {/* Center Score - Mobile first */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] font-mono">
              91%
            </div>
            <div className="text-xs text-cyan-200 mt-1 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]">
              OVERALL_EVAL_SCORE
            </div>
          </div>

          {/* Stats Grid - Mobile 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Tasks */}
            <div className="text-center p-3 bg-black/50 rounded-lg border border-blue-400/30 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-1 mb-2">
                <PiListChecksDuotone className="w-3 h-3 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]" />
                <span className="text-xs font-medium text-blue-300 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]">
                  TOTAL_TASKS
                </span>
              </div>
              <div className="text-lg font-bold text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,1)] font-mono">
                360
              </div>
            </div>

            {/* Successful Tasks */}
            <div className="text-center p-3 bg-black/50 rounded-lg border border-emerald-400/30 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-1 mb-2">
                <PiCheckCircleDuotone className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]" />
                <span className="text-xs font-medium text-emerald-300 font-mono drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
                  SUCCESSFUL
                </span>
              </div>
              <div className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,1)] font-mono">
                233
              </div>
            </div>

            {/* Failed Tasks */}
            <div className="text-center p-3 bg-black/50 rounded-lg border border-red-400/30 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-1 mb-2">
                <PiXCircleDuotone className="w-3 h-3 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
                <span className="text-xs font-medium text-red-300 font-mono drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                  FAILED
                </span>
              </div>
              <div className="text-lg font-bold text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] font-mono">
                127
              </div>
            </div>

            {/* Websites */}
            <div className="text-center p-3 bg-black/50 rounded-lg border border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-1 mb-2">
                <PiGlobeDuotone className="w-3 h-3 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" />
                <span className="text-xs font-medium text-yellow-300 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                  WEBSITES
                </span>
              </div>
              <div className="text-lg font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)] font-mono">
                3
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Original structure preserved */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Left Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Total Tasks */}
            <div className="text-center p-4 bg-black/50 rounded-lg border border-blue-400/30 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PiListChecksDuotone className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]" />
                <span className="text-sm font-medium text-blue-300 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]">
                  TOTAL_TASKS
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,1)] font-mono">
                360
              </div>
            </div>

            {/* Successful Tasks */}
            <div className="text-center p-4 bg-black/50 rounded-lg border border-emerald-400/30 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PiCheckCircleDuotone className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]" />
                <span className="text-sm font-medium text-emerald-300 font-mono drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
                  SUCCESSFUL
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,1)] font-mono">
                233
              </div>
            </div>
          </div>

          {/* Center Score */}
          <div className="flex flex-col items-center justify-center mx-6">
            <div className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] font-mono">
              91%
            </div>
            <div className="text-xs text-cyan-200 mt-1 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]">
              OVERALL_EVAL_SCORE
            </div>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Failed Tasks */}
            <div className="text-center p-4 bg-black/50 rounded-lg border border-red-400/30 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PiXCircleDuotone className="w-4 h-4 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
                <span className="text-sm font-medium text-red-300 font-mono drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                  FAILED
                </span>
              </div>
              <div className="text-2xl font-bold text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] font-mono">
                127
              </div>
            </div>

            {/* Websites */}
            <div className="text-center p-4 bg-black/50 rounded-lg border border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PiGlobeDuotone className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" />
                <span className="text-sm font-medium text-yellow-300 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                  WEBSITES
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)] font-mono">
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
    </div>
  )
}
