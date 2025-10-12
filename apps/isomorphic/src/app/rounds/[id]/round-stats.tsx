"use client";

import { useParams } from "next/navigation";
import {
  PiTrophyDuotone,
  PiUsersDuotone,
  PiCoinsDuotone,
  PiCrownDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
} from "react-icons/pi";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundStatistics, useTopMiners } from "@/services/hooks/useRounds";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";

export default function RoundStats() {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Get statistics and top miners from API
  const { data: statistics, loading: statsLoading, error: statsError } = useRoundStatistics(roundId);
  const { data: topMiners, loading: minersLoading, error: minersError } = useTopMiners(roundId, 1);
  
  const loading = statsLoading || minersLoading;
  const error = statsError || minersError;
  
  // Show loading state or when any required data is not available
  if (loading || !statistics || !topMiners) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }, (_, index) => (
          <StatsCardPlaceholder key={index} />
        ))}
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            ⚠️ Failed to load round statistics: {error}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Winner Card */}
      <div className="relative bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-yellow-500/15 border-2 border-amber-500/40 rounded-xl p-3 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md overflow-hidden">
        {/* Corner Accents - All 4 corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg z-20"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg z-20"></div>
        {/* Aggregated Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-amber-400/20 via-transparent to-orange-500/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400/30 rounded-full animate-pulse"></div>
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiCrownDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-medium text-amber-300">WINNER</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
                Miner {topMiners[0].uid}
              </div>
              <div className="text-xs text-amber-200">
                {topMiners[0].hotkey ? `${topMiners[0].hotkey.slice(0, 6)}...${topMiners[0].hotkey.slice(-6)}` : 'No hotkey'}
              </div>
            </div>
          </div>

          <div className="bg-amber-500/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-200">Top Score</span>
              <span className="text-sm font-bold text-white">
                {topMiners[0].score ? `${(topMiners[0].score * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Score Card */}
      <div className="relative bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-teal-500/15 border-2 border-emerald-500/40 rounded-xl p-3 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md overflow-hidden">
        {/* Corner Accents - All 4 corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg z-20"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg z-20"></div>
        {/* Aggregated Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-emerald-400/20 via-transparent to-teal-500/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"></div>
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiTrophyDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-medium text-emerald-300">AVERAGE TOP SCORE</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-1">
                {statistics.topScore ? `${(statistics.topScore * 100).toFixed(1)}%` : '0.0%'}
              </div>
              <div className="text-xs text-emerald-200">Top performance</div>
            </div>
          </div>

          <div className="bg-emerald-500/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-200">Average Score</span>
              <span className="text-sm font-bold text-white">
                {statistics.averageScore ? `${(statistics.averageScore * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Miners Card */}
      <div className="relative bg-gradient-to-br from-violet-500/15 via-purple-500/15 to-fuchsia-500/15 border-2 border-violet-500/40 rounded-xl p-3 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md overflow-hidden">
        {/* Corner Accents - All 4 corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400/80 rounded-tl-lg z-20"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400/80 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400/80 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400/80 rounded-br-lg z-20"></div>
        {/* Aggregated Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-violet-400/20 via-transparent to-fuchsia-500/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-violet-400/30 rounded-full animate-pulse"></div>
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiUsersDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-medium text-violet-300">AVERAGE TOTAL MINERS</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-1">
                {statistics.totalMiners || 0}
              </div>
              <div className="text-xs text-violet-200">Total participants</div>
            </div>
          </div>

          <div className="bg-violet-500/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-200">Active Miners</span>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-green-400">
                  {statistics.activeMiners || 0}
                </span>
                <span className="text-xs text-violet-200">active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Is In Consensus Card */}
      <div className="relative bg-gradient-to-br from-green-500/15 via-emerald-500/15 to-teal-500/15 border-2 border-green-500/40 rounded-xl p-3 hover:border-green-400/60 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md overflow-hidden">
        {/* Corner Accents - All 4 corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400/80 rounded-tl-lg z-20"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400/80 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400/80 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400/80 rounded-br-lg z-20"></div>
        {/* Aggregated Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-400/20 via-transparent to-emerald-500/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400/30 rounded-full animate-pulse"></div>
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiCheckCircleDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-medium text-green-300">IS IN CONSENSUS</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {statistics.successRate ? (statistics.successRate >= 0.8 ? 'Yes' : 'Partial') : 'No'}
              </div>
              <div className="text-xs text-green-200 mt-1">
                {statistics.successRate ? `${(statistics.successRate * 100).toFixed(1)}% success rate` : 'No data'}
              </div>
            </div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-200">Success Rate</span>
              <span className="text-sm font-bold text-white">
                {statistics.successRate ? `${(statistics.successRate * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

