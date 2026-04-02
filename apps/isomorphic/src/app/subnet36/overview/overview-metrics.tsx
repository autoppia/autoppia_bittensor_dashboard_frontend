"use client";

import { useEffect } from "react";
import Link from "next/link";
import cn from "@core/utils/class-names";
import { LuShield, LuPickaxe, LuGlobe, LuTrophy } from "react-icons/lu";
import { useOverviewMetrics } from "@/services/hooks/useOverview";

interface OverviewMetricsProps {
  className?: string;
  metrics?: any; // OverviewMetrics type
  loading?: boolean;
  error?: string | null;
  onRefetch?: () => void;
}

const SKELETON_KEYS = ["metrics-skeleton-0", "metrics-skeleton-1", "metrics-skeleton-2", "metrics-skeleton-3"] as const;

export default function OverviewMetrics({
  className,
  metrics: metricsProp,
  loading: loadingProp,
  error: errorProp,
  onRefetch,
}: Readonly<OverviewMetricsProps>) {
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
      <div className={cn("w-full grid grid-cols-1 gap-3 h-full", className)}>
        {SKELETON_KEYS.map((skeletonKey) => (
          <div
            key={skeletonKey}
            className="rounded-[22px] border border-white/10 bg-slate-900/70 p-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-slate-700/60 animate-pulse"></div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-3 w-24 rounded bg-slate-700/60 animate-pulse"></div>
                <div className="h-7 w-20 rounded bg-slate-700/60 animate-pulse"></div>
              </div>
              <div className="h-5 w-16 rounded bg-slate-700/60 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn("w-full grid grid-cols-1 gap-3 h-full", className)}>
        <div className="col-span-2 rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-5">
          <div className="text-center">
            <p className="font-medium text-rose-200">Error loading metrics</p>
            <p className="mt-1 text-sm text-rose-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Create dynamic metrics data from API with safe fallbacks
  const currentRound = metrics?.round ?? 0;
  const currentSeason = metrics?.season ?? null;
  const currentActiveSeason = metrics?.currentSeason ?? metrics?.season ?? null;
  const currentActiveRound = metrics?.currentRound ?? metrics?.round ?? null;
  const hasFinishedRound = Boolean(
    metrics?.hasFinishedRound ??
      (metrics?.season !== null &&
        metrics?.season !== undefined &&
        metrics?.round !== null &&
        metrics?.round !== undefined)
  );
  const leader = metrics?.leader ?? null;
  const leaderRewardValue = leader?.reward ?? 0;
  const leaderInfo = hasFinishedRound && leader?.minerUid
    ? `${leader.minerName || "Miner"} (UID ${leader.minerUid})`
    : null;
  const leaderGithubUrl = hasFinishedRound ? leader?.minerGithubUrl ?? null : null;
  const totalWebsitesCount = hasFinishedRound ? leader?.totalWebsitesEvaluated ?? 0 : 0;
  const validatorsCount = hasFinishedRound
    ? leader?.validators ?? 0
    : metrics?.currentValidators ?? 0;
  const activeMinersCount = metrics?.totalMiners ?? 0;
  const minerUpdatesCount = metrics?.minerUpdatesThisRound ?? 0;
  const newAgentsCount = metrics?.newAgentsThisRound ?? 0;

  const seasonLabel = currentSeason !== null && currentSeason !== undefined
    ? `Season ${currentSeason}`
    : null;
  const currentRoundLabel =
    currentActiveSeason !== null &&
    currentActiveSeason !== undefined &&
    currentActiveRound !== null &&
    currentActiveRound !== undefined
      ? `Season ${currentActiveSeason} · Round ${currentActiveRound}`
      : "Current round";
  const panelLabel = hasFinishedRound ? "Finalized round snapshot" : "Awaiting first finalized round";
  const panelSeasonBadge =
    hasFinishedRound && currentSeason !== null && currentSeason !== undefined
      ? `Season ${currentSeason}`
      : currentActiveSeason !== null && currentActiveSeason !== undefined
        ? `Season ${currentActiveSeason}`
        : "Season pending";
  const panelRoundBadge =
    hasFinishedRound && currentRound
      ? `Round ${currentRound}`
      : currentActiveRound !== null && currentActiveRound !== undefined
        ? `Round ${currentActiveRound}`
        : "Round pending";
  const topMetricsData = [
    {
      id: "season-leader",
      title: hasFinishedRound ? "Leader" : "Leader",
      value: hasFinishedRound ? formatPercentage(leaderRewardValue) : "—",
      headline: hasFinishedRound ? leaderInfo : null,
      chips: [],
      githubUrl: leaderGithubUrl,
      icon: LuTrophy,
      bgColor:
        "border border-amber-400/25 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.15),_transparent_40%),linear-gradient(160deg,rgba(16,12,4,0.94),rgba(10,8,3,0.94))] shadow-[0_18px_55px_rgba(251,191,36,0.1)]",
      iconClassName:
        "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_12px_24px_rgba(251,146,60,0.35)]",
      metricClassName:
        "text-3xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent",
      descriptionClassName: "text-amber-100",
    },
    {
      id: "total-validators",
      title: "Validators",
      value: validatorsCount,
      headline: metrics?.tasksPerValidator != null ? `${metrics.tasksPerValidator} tasks each` : "Active",
      chips: [],
      icon: LuShield,
      bgColor:
        "border border-blue-400/20 bg-[linear-gradient(160deg,rgba(6,12,32,0.92),rgba(4,8,24,0.92))] shadow-[0_18px_45px_rgba(59,130,246,0.08)]",
      iconClassName:
        "bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
      metricClassName: "text-2xl font-black text-blue-300",
      descriptionClassName: "text-blue-100",
    },
    {
      id: "miners",
      title: "Miners",
      value: activeMinersCount,
      headline: [newAgentsCount > 0 ? `${newAgentsCount} new` : null, minerUpdatesCount > 0 ? `${minerUpdatesCount} updated` : null].filter(Boolean).join(" · ") || "Season set",
      chips: [],
      icon: LuPickaxe,
      bgColor:
        "border border-emerald-400/20 bg-[linear-gradient(160deg,rgba(4,24,20,0.92),rgba(3,16,14,0.92))] shadow-[0_18px_45px_rgba(16,185,129,0.08)]",
      iconClassName:
        "bg-gradient-to-br from-emerald-400 to-green-500 text-white",
      metricClassName: "text-2xl font-black text-emerald-300",
      descriptionClassName: "text-emerald-100",
    },
  ];

  const websitesMetric = {
    id: "total-websites",
    title: "Websites",
    value: hasFinishedRound ? totalWebsitesCount : "—",
    headline: hasFinishedRound ? "Leader evaluated" : null,
    chips: [],
    icon: LuGlobe,
    bgColor:
      "border border-pink-400/20 bg-[linear-gradient(160deg,rgba(24,6,18,0.92),rgba(14,4,14,0.92))] shadow-[0_18px_45px_rgba(236,72,153,0.08)]",
    iconClassName:
      "bg-gradient-to-br from-pink-400 to-rose-500 text-white",
    metricClassName: "text-2xl font-black text-pink-300",
    descriptionClassName: "text-pink-100",
  };

  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 gap-3 min-w-0",
        className
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            {panelLabel}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-300">
            {panelSeasonBadge}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-300">
            {panelRoundBadge}
          </span>
        </div>
      </div>
      {topMetricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <MetricCard key={metric.id} metric={metric} Icon={Icon} />
        );
      })}
      <Link href="/websites" className="block">
        <MetricCard metric={websitesMetric} Icon={websitesMetric.icon} />
      </Link>
    </div>
  );
}

function MetricCard({
  metric,
  Icon,
}: Readonly<{
  metric: {
    bgColor: string;
    iconClassName: string;
    title: string;
    descriptionClassName: string;
    headline?: string | null;
    chips?: (string | null)[];
    value: string | number;
    metricClassName: string;
  };
  Icon: React.ComponentType<{ className?: string }>;
}>) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-between rounded-[22px] px-5 py-4 min-w-0 transition duration-300 hover:-translate-y-0.5",
        metric.bgColor
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[16px]",
            metric.iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3
            className={cn(
              "text-sm font-bold uppercase tracking-[0.18em]",
              metric.descriptionClassName
            )}
          >
            {metric.title}
          </h3>
          {metric.headline != null && metric.headline !== "" && (
            <p className="mt-0.5 text-xs text-white/45">{metric.headline}</p>
          )}
        </div>
      </div>
      <div className={cn("flex-shrink-0 text-right text-4xl font-black leading-none", metric.metricClassName)}>
        {metric.value}
      </div>
    </div>
  );
}
