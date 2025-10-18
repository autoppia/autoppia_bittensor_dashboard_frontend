 "use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  PiTrophyDuotone,
  PiUsersDuotone,
  PiCoinsDuotone,
  PiCrownDuotone,
} from "react-icons/pi";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundStatistics, useTopMiners } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";
import type { ValidatorPerformance } from "@/services/api/types/rounds";

interface RoundStatsProps {
  selectedValidator?: ValidatorPerformance | null;
}

export default function RoundStats({ selectedValidator }: RoundStatsProps = {}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  
  // Get statistics and top miners from API
  const { data: statistics, loading: statsLoading, error: statsError } = useRoundStatistics(roundKey);
  const { data: topMiners, loading: minersLoading, error: minersError } = useTopMiners(roundKey, 10);

  const loading = statsLoading || minersLoading;
  const error = statsError || minersError;
  const topMiner = React.useMemo(() => {
    if (selectedValidator?.topMiner) {
      return selectedValidator.topMiner;
    }
    if (!Array.isArray(topMiners) || topMiners.length === 0) {
      return undefined;
    }
    if (selectedValidator?.id) {
      const filtered = topMiners.filter((miner) => miner.validatorId === selectedValidator.id);
      if (filtered.length > 0) {
        return filtered[0];
      }
    }
    return topMiners[0];
  }, [topMiners, selectedValidator]);

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
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load round statistics: {error}
          </p>
        </div>
      </div>
    );
  }

  const totalValidators = statistics.totalValidators || 0;
  const averageTasks =
    statistics.averageTasksPerValidator != null
      ? statistics.averageTasksPerValidator
      : totalValidators
        ? statistics.totalTasks / totalValidators
        : 0;
  const topMinerLabel = topMiner
    ? (topMiner.name && topMiner.name.trim().length > 0
        ? topMiner.name
        : `Miner ${topMiner.uid ?? "pending"}`)
    : "Top miner pending";

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
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {topMinerLabel}
              </div>
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
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                {statistics.averageScore ? `${(statistics.averageScore * 100).toFixed(1)}%` : '0.0%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Miners Evaluated Card */}
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
            <h3 className="text-xs font-medium text-violet-300">MINERS EVALUATED</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                {statistics.totalMiners || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Average Tasks Card */}
      <div className="relative bg-gradient-to-br from-blue-500/15 via-sky-500/15 to-indigo-500/15 border-2 border-blue-500/40 rounded-xl p-3 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md overflow-hidden">
        {/* Corner Accents - All 4 corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400/80 rounded-tl-lg z-20"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400/80 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400/80 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400/80 rounded-br-lg z-20"></div>
        {/* Aggregated Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-400/20 via-transparent to-indigo-500/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiCoinsDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-medium text-blue-300">AVERAGE TASKS</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                {averageTasks ? Math.round(averageTasks) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
