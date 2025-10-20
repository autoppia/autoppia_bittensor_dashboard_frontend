 "use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  PiTrophyDuotone,
  PiUsersDuotone,
  PiCrownDuotone,
  PiListChecksDuotone,
} from "react-icons/pi";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundStatistics, useTopMiners } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";
import type { ValidatorPerformance } from "@/services/api/types/rounds";
import cn from "@core/utils/class-names";

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
  const winnerUid = statistics?.winnerMinerUid ?? null;
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
    if (winnerUid !== null) {
      const winnerEntry = topMiners.find((miner) => miner.uid === winnerUid);
      if (winnerEntry) {
        return winnerEntry;
      }
    }
    return topMiners[0];
  }, [topMiners, selectedValidator, winnerUid]);

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

  const formatNumber = (value: number | undefined | null, digits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return "0";
    }
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const winnerAverageScore = statistics?.winnerAverageScore ?? statistics?.averageScore ?? 0;

  const aggregatedCards = [
    {
      key: "winner",
      title: "Winner",
      value: topMinerLabel,
      helper: topMiner ? "Latest champion across validators" : "Awaiting validator results",
      icon: PiCrownDuotone,
      gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/20",
      border: "border-amber-500/40",
      iconGradient: "from-amber-400 to-orange-500",
      valueClass: "text-2xl",
    },
    {
      key: "winnerAverageScore",
      title: "Winner Average Score",
      value: `${formatNumber(winnerAverageScore * 100, 1)}%`,
      helper: "Average score achieved by the winning miner across validators",
      icon: PiTrophyDuotone,
      gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/20",
      border: "border-emerald-500/40",
      iconGradient: "from-emerald-400 to-teal-500",
      valueClass: "text-4xl",
    },
    {
      key: "miners",
      title: "Miners Evaluated",
      value: formatNumber(statistics.totalMiners ?? 0),
      helper: "Unique miners participating this round",
      icon: PiUsersDuotone,
      gradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/20",
      border: "border-violet-500/40",
      iconGradient: "from-violet-400 to-fuchsia-500",
      valueClass: "text-4xl",
    },
    {
      key: "tasks",
      title: "Average Tasks",
      value: formatNumber(averageTasks, 1),
      helper: "Tasks completed per validator",
      icon: PiListChecksDuotone,
      gradient: "from-blue-500/20 via-indigo-500/15 to-cyan-500/20",
      border: "border-blue-500/40",
      iconGradient: "from-blue-400 to-indigo-500",
      valueClass: "text-4xl",
    },
  ];

  const renderMetricCard = (card: (typeof aggregatedCards)[number]) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className={cn(
          "group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
          "bg-slate-900/45",
          card.border,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100",
            "bg-gradient-to-br",
            card.gradient,
          )}
        />
        <div className="relative flex h-full flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1",
                "bg-gradient-to-br",
                card.iconGradient,
              )}
            >
              <Icon className="h-8 w-8 text-white drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]" />
              <div className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              {card.title}
            </span>
          </div>
          <div className="mt-auto space-y-2">
            <div className={cn("font-black text-white", card.valueClass)}>{card.value}</div>
            {card.helper ? (
              <p className="text-sm font-medium text-white/70">{card.helper}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {aggregatedCards.map(renderMetricCard)}
    </div>
  );
}
