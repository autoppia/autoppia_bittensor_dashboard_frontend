"use client";

import { useMemo } from "react";
import Link from "next/link";
import MetricCard from "@core/components/cards/metric-card";
import cn from "@core/utils/class-names";
import { LuShield, LuPickaxe, LuGlobe, LuTrophy } from "react-icons/lu";
import {
  useOverviewMetrics,
  useLeaderboard,
} from "@/services/hooks/useOverview";

const metricsData = [
  {
    id: "score-to-win",
    title: "Top Score",
    value: 0.95,
    icon: LuTrophy,
    bgColor:
      "bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-amber-400 to-orange-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName:
      "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent",
    descriptionClassName: "text-amber-200",
  },
  {
    id: "total-websites",
    title: "Websites",
    value: 11,
    icon: LuGlobe,
    bgColor:
      "bg-gradient-to-br from-pink-500/15 via-rose-500/15 to-pink-600/15 border-2 border-pink-500/40 hover:border-pink-400/60 hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-pink-400 to-rose-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-pink-400",
    descriptionClassName: "text-pink-200",
  },
  {
    id: "total-validators",
    title: "Validators",
    value: 6,
    icon: LuShield,
    bgColor:
      "bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-blue-600/15 border-2 border-blue-500/40 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-blue-400 to-indigo-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-blue-400",
    descriptionClassName: "text-blue-200",
  },
  {
    id: "total-miners",
    title: "Miners",
    value: 24,
    icon: LuPickaxe,
    bgColor:
      "bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-emerald-600/15 border-2 border-emerald-500/40 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-emerald-400 to-green-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-emerald-400",
    descriptionClassName: "text-emerald-200",
  },
];

export default function OverviewMetrics({ className }: { className?: string }) {
  const { data: metrics, loading, error } = useOverviewMetrics();
  const { data: leaderboardData, loading: leaderboardLoading } = useLeaderboard(
    { timeRange: "all" }
  );

  // Calculate actual top score from leaderboard data
  const calculatedTopScore = useMemo(() => {
    const apiLeaderboard = leaderboardData?.data?.leaderboard;
    if (!Array.isArray(apiLeaderboard) || apiLeaderboard.length === 0) {
      return null;
    }

    let maxScore = -Infinity;
    apiLeaderboard.forEach((entry: any) => {
      const score = entry.subnet36;
      if (typeof score === "number" && !Number.isNaN(score)) {
        maxScore = Math.max(maxScore, score);
      }
    });

    return Number.isFinite(maxScore) ? maxScore : null;
  }, [leaderboardData]);

  const formatPercentage = (value?: number | null) => {
    if (value === null || value === undefined) {
      return "0.0%";
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "0.0%";
    }
    const scaled = numeric <= 1 ? numeric * 100 : numeric;
    return `${scaled.toFixed(1)}%`;
  };

  // Show loading state
  if (loading || leaderboardLoading) {
    return (
      <div
        className={cn(
          "w-full grid grid-cols-1 sm:grid-cols-2 gap-3 h-full",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
          >
            <div className="flex space-x-4 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
              <div className="h-2 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={cn(
          "w-full grid grid-cols-1 sm:grid-cols-2 gap-3 h-full",
          className
        )}
      >
        <div className="col-span-2 rounded-2xl p-5 bg-red-50 border border-red-200">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error loading metrics</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Create dynamic metrics data from API with safe fallbacks
  const latestFinishedRound = metrics?.metricsRound ?? 0;
  const topScoreValue = metrics?.topScore ?? calculatedTopScore ?? 0;
  const topMinerInfo = metrics?.topMinerUid
    ? `${metrics.topMinerName || "Miner"} (UID ${metrics.topMinerUid})`
    : null;

  const dynamicMetricsData = [
    {
      id: "score-to-win",
      title: "Top Score",
      value: formatPercentage(topScoreValue),
      subtitle: topMinerInfo,
      icon: LuTrophy,
      bgColor:
        "bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
      iconClassName:
        "bg-gradient-to-br from-amber-400 to-orange-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
      metricClassName:
        "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent",
      descriptionClassName: "text-amber-200",
    },
    {
      id: "total-websites",
      title: "Websites",
      value: 13,
      icon: LuGlobe,
      bgColor:
        "bg-gradient-to-br from-pink-500/15 via-rose-500/15 to-pink-600/15 border-2 border-pink-500/40 hover:border-pink-400/60 hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
      iconClassName:
        "bg-gradient-to-br from-pink-400 to-rose-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
      metricClassName: "text-2xl font-bold text-pink-400",
      descriptionClassName: "text-pink-200",
    },
    {
      id: "total-validators",
      title: "Validators",
      value: metrics?.totalValidators ?? 0,
      icon: LuShield,
      bgColor:
        "bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-blue-600/15 border-2 border-blue-500/40 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
      iconClassName:
        "bg-gradient-to-br from-blue-400 to-indigo-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
      metricClassName: "text-2xl font-bold text-blue-400",
      descriptionClassName: "text-blue-200",
    },
    {
      id: "total-miners",
      title: "Miners",
      value: metrics?.totalMiners ?? 0,
      icon: LuPickaxe,
      bgColor:
        "bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-emerald-600/15 border-2 border-emerald-500/40 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
      iconClassName:
        "bg-gradient-to-br from-emerald-400 to-green-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
      metricClassName: "text-2xl font-bold text-emerald-400",
      descriptionClassName: "text-emerald-200",
    },
  ];

  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0",
        className
      )}
    >
      {dynamicMetricsData.map((metric) => {
        const Icon = metric.icon;
        const metricCard = (
          <div
            className={cn(
              "rounded-2xl p-4 min-w-0 h-[140px] flex flex-col justify-between",
              metric.bgColor
            )}
          >
            <div className="flex space-x-4 mb-2 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg flex-shrink-0",
                  metric.iconClassName
                )}
              >
                <Icon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide mb-1 truncate",
                    metric.descriptionClassName
                  )}
                >
                  {metric.title}
                </h3>
                <div className={cn("truncate", metric.metricClassName)}>
                  {metric.value}
                </div>
                {metric.subtitle && (
                  <div className="text-xs text-white/70 mt-1 truncate">
                    {metric.subtitle}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center min-w-0">
              <div
                className={cn("text-xs truncate", metric.descriptionClassName)}
              >
                {metric.id === "total-validators" && "Active validators"}
                {metric.id === "total-miners" && "Active miners"}
                {metric.id === "total-websites" && "Active websites"}
              </div>
            </div>
          </div>
        );
        return metric.id === "total-websites" ? (
          <Link key={metric.title} href="/websites" className="block">
            {metricCard}
          </Link>
        ) : (
          <div key={metric.title} className="block">
            {metricCard}
          </div>
        );
      })}
    </div>
  );
}
