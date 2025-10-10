"use client";

export default function AgentRunStats() {
  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 md:hidden">
        {/* Overall Score - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            91%
          </div>
          <div className="text-xs sm:text-sm text-gray-700 mt-1">
            Overall evaluation score
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">
              360
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-400">
              3
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Websites</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              233
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-400">
              127
            </div>
            <div className="text-xs sm:text-sm text-gray-700">Failed</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">360</div>
            <div className="text-xs text-gray-700">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">3</div>
            <div className="text-xs text-gray-700">Websites</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mx-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            91%
          </div>
          <div className="text-xs text-gray-700 mt-1">
            Overall evaluation score
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">233</div>
            <div className="text-xs text-gray-700">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">127</div>
            <div className="text-xs text-gray-700">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
