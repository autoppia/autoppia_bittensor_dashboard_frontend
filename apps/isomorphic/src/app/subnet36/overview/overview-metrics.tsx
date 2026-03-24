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
      title: hasFinishedRound ? "Season leader" : "Leader",
      value: hasFinishedRound ? formatPercentage(leaderRewardValue) : "Pending",
      headline: hasFinishedRound ? leaderInfo : "No finished round yet",
      chips: [
        hasFinishedRound
          ? seasonLabel
            ? `${seasonLabel} leader`
            : "Season leader"
          : "Awaiting close",
      ],
      githubUrl: leaderGithubUrl,
      icon: LuTrophy,
      bgColor:
        "border border-amber-400/35 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_40%),linear-gradient(160deg,rgba(34,24,10,0.92),rgba(25,18,10,0.92))] shadow-[0_18px_55px_rgba(251,191,36,0.14)]",
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
      headline: "Active validators",
      chips: [metrics?.tasksPerValidator != null ? `${metrics.tasksPerValidator} tasks each` : null].filter(Boolean),
      icon: LuShield,
      bgColor:
        "border border-blue-400/30 bg-[linear-gradient(160deg,rgba(16,31,71,0.88),rgba(14,20,52,0.88))] shadow-[0_18px_45px_rgba(59,130,246,0.12)]",
      iconClassName:
        "bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
      metricClassName: "text-2xl font-black text-blue-300",
      descriptionClassName: "text-blue-100",
    },
    {
      id: "miners",
      title: "Miners",
      value: activeMinersCount,
      headline: "Season miner set",
      chips: [`${newAgentsCount} new`, `${minerUpdatesCount} repo updates`],
      icon: LuPickaxe,
      bgColor:
        "border border-emerald-400/30 bg-[linear-gradient(160deg,rgba(10,54,45,0.88),rgba(9,34,29,0.88))] shadow-[0_18px_45px_rgba(16,185,129,0.12)]",
      iconClassName:
        "bg-gradient-to-br from-emerald-400 to-green-500 text-white",
      metricClassName: "text-2xl font-black text-emerald-300",
      descriptionClassName: "text-emerald-100",
    },
  ];

  const websitesMetric = {
    id: "total-websites",
    title: "Websites",
    value: hasFinishedRound ? totalWebsitesCount : "Pending",
    headline: hasFinishedRound ? "Evaluated by season leader" : "Visible after consensus",
    chips: [
      hasFinishedRound
        ? "leader-evaluated"
        : "pending consensus",
    ],
    icon: LuGlobe,
    bgColor:
      "border border-pink-400/30 bg-[linear-gradient(160deg,rgba(58,16,42,0.88),rgba(31,13,33,0.88))] shadow-[0_18px_45px_rgba(236,72,153,0.12)]",
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
          <div
            key={metric.title}
            className={cn(
              "min-h-[118px] rounded-[22px] p-4 min-w-0 transition duration-300 hover:-translate-y-0.5",
              metric.bgColor
            )}
          >
            <div className="flex min-h-[84px] min-w-0 items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px]",
                  metric.iconClassName
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3
                  className={cn(
                    "mb-1 text-xs font-semibold uppercase tracking-[0.25em] truncate",
                    metric.descriptionClassName
                  )}
                >
                  {metric.title}
                </h3>
                <div className={cn("truncate leading-none", metric.metricClassName)}>
                  {metric.value}
                </div>
              </div>
              <div className="min-w-0 max-w-[190px] self-stretch flex flex-col justify-center items-center text-center">
                {metric.headline != null && metric.headline !== "" && (
                  <div
                    className={cn(
                      "text-sm font-bold leading-5",
                      metric.descriptionClassName
                    )}
                  >
                    {metric.headline}
                  </div>
                )}
                {metric.chips?.length ? (
                  <div className="mt-3 flex flex-nowrap justify-center gap-1.5">
                    {metric.chips.filter(Boolean).map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/70"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      <Link href="/websites" className="block">
        <div
          className={cn(
            "min-h-[118px] rounded-[22px] p-4 min-w-0 transition duration-300 hover:-translate-y-0.5",
            websitesMetric.bgColor
          )}
        >
          <div className="flex min-h-[84px] min-w-0 items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px]",
                websitesMetric.iconClassName
              )}
            >
              <websitesMetric.icon className="h-6 w-6" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3
                className={cn(
                  "mb-1 text-xs font-semibold uppercase tracking-[0.25em] truncate",
                  websitesMetric.descriptionClassName
                )}
              >
                {websitesMetric.title}
              </h3>
              <div className={cn("truncate leading-none", websitesMetric.metricClassName)}>
                {websitesMetric.value}
              </div>
            </div>
            <div className="min-w-0 max-w-[190px] self-stretch flex flex-col justify-center items-center text-center">
              <div
                className={cn(
                  "text-sm font-bold leading-5",
                  websitesMetric.descriptionClassName
                )}
              >
                {websitesMetric.headline}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {websitesMetric.chips.map((chip: string) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/70"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
