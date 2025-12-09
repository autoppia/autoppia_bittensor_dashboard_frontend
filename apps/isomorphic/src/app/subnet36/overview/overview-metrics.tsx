"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import MetricCard from "@core/components/cards/metric-card";
import cn from "@core/utils/class-names";
import { LuShield, LuPickaxe, LuGlobe, LuTrophy } from "react-icons/lu";
import { useOverviewMetrics } from "@/services/hooks/useOverview";

const metricsData = [
  {
    id: "score-to-win",
    title: "Top Reward",
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

interface OverviewMetricsProps {
  className?: string;
  metrics?: any; // OverviewMetrics type
  loading?: boolean;
  error?: string | null;
  onRefetch?: () => void;
}

export default function OverviewMetrics({ 
  className,
  metrics: metricsProp,
  loading: loadingProp,
  error: errorProp,
  onRefetch
}: OverviewMetricsProps) {
  // Use props if provided, otherwise fallback to hook (for backward compatibility)
  const hookResult = useOverviewMetrics();
  const metrics = metricsProp ?? hookResult.data;
  const loading = loadingProp ?? hookResult.loading;
  const error = errorProp ?? hookResult.error;
  const refetch = onRefetch ?? hookResult.refetch;

  // Auto-refresh metrics every 30 seconds to update cards with latest round data
  // Only set up interval if we're using the hook (not props)
  useEffect(() => {
    if (metricsProp !== undefined) {
      // If metrics are provided as props, don't set up auto-refresh here
      // The parent component handles it
      return;
    }
    
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch, metricsProp]);

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
  if (loading) {
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
  const topScoreValue = metrics?.topScore ?? 0;
  const topMinerInfo = metrics?.topMinerUid
    ? `${metrics.topMinerName || "Miner"} (UID ${metrics.topMinerUid})`
    : null;

  const dynamicMetricsData = [
    {
      id: "score-to-win",
      title: "Top Reward",
      value: formatPercentage(topScoreValue),
      topLabel: topMinerInfo,
      bottomLabel: `Round ${latestFinishedRound}`,
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
      topLabel: "Active websites",
      bottomLabel: `Round ${latestFinishedRound}`,
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
      topLabel: "Active validators",
      bottomLabel: `Round ${latestFinishedRound}`,
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
      topLabel: "Active miners",
      bottomLabel: `Round ${latestFinishedRound}`,
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
              "rounded-2xl p-4 min-w-0 h-[140px] flex flex-col",
              metric.bgColor
            )}
          >
            <div className="flex space-x-4 min-w-0 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg flex-shrink-0",
                  metric.iconClassName
                )}
              >
                <Icon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
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
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 min-w-0 space-y-1">
              {(metric as any).topLabel && (
                <div
                  className={cn(
                    "text-xs text-center truncate font-bold",
                    metric.descriptionClassName
                  )}
                >
                  {(metric as any).topLabel}
                </div>
              )}
              {(metric as any).bottomLabel && (
                <div
                  className={cn(
                    "text-[10px] text-center truncate opacity-70",
                    metric.descriptionClassName
                  )}
                >
                  {(metric as any).bottomLabel}
                </div>
              )}
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
