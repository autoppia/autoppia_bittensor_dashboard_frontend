"use client";

import {
  PiTrophyDuotone,
  PiUsersDuotone,
  PiCoinsDuotone,
  PiCrownDuotone,
} from "react-icons/pi";

export default function RoundStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Winner Card */}
      <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-yellow-500/15 border-2 border-amber-500/40 rounded-2xl p-5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiCrownDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-amber-300">WINNER</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-3">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                Miner 1
              </div>
              <div className="text-xs text-amber-200">5GHrA5gqhWVm1Cp92jXa...</div>
            </div>
          </div>

          <div className="bg-amber-500/20 rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-200">Leading by</span>
              <span className="text-sm font-bold text-white">+12.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Score Card */}
      <div className="bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-teal-500/15 border-2 border-emerald-500/40 rounded-2xl p-5 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiTrophyDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-emerald-300">TOP SCORE</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-3">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-1">
                98.7%
              </div>
              <div className="text-xs text-emerald-200">Highest performance</div>
            </div>
          </div>

          <div className="bg-emerald-500/20 rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-200">Average Score</span>
              <span className="text-sm font-bold text-white">76.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Miners Card */}
      <div className="bg-gradient-to-br from-violet-500/15 via-purple-500/15 to-fuchsia-500/15 border-2 border-violet-500/40 rounded-2xl p-5 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiUsersDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-violet-300">TOTAL MINERS</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-3">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-1">
                42
              </div>
              <div className="text-xs text-violet-200">Active participants</div>
            </div>
          </div>

          <div className="bg-violet-500/20 rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-200">New Miners</span>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-green-400">+3</span>
                <span className="text-xs text-violet-200">this round</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Emission Card */}
      <div className="bg-gradient-to-br from-blue-500/15 via-cyan-500/15 to-sky-500/15 border-2 border-blue-500/40 rounded-2xl p-5 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiCoinsDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-blue-300">TOP EMISSION</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Coming Soon
              </div>
              <div className="text-xs text-blue-200 mt-1">Highest rewards earned</div>
            </div>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-200">Total Distributed</span>
              <span className="text-sm font-bold text-white">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

