"use client";

import cn from "@core/utils/class-names";
import { useNetworkStatus, useSubnetStatistics } from "@/services/hooks/useOverview";
import { PiActivityFill, PiShieldCheckFill, PiStackFill, PiListChecksFill } from "react-icons/pi";

function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n);
}

export default function OverviewHero({ className }: Readonly<{ className?: string }>) {
  const { data: networkStatus, loading: networkLoading } = useNetworkStatus();
  const { data: statistics, loading: statsLoading } = useSubnetStatistics();

  const loading = networkLoading || statsLoading;
  const status = networkStatus?.status ?? "unknown";
  const isHealthy = status === "healthy";
  const validators = statistics?.activeValidators ?? 0;
  const miners = statistics?.registeredMiners ?? 0;
  const tasks = statistics?.totalTasksCompleted ?? 0;
  const avgScore = statistics?.averageTaskScore ?? 0;
  const avgScorePct = avgScore <= 1 ? (avgScore * 100).toFixed(1) : avgScore.toFixed(1);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-600/40 bg-slate-800/40 backdrop-blur-sm px-4 py-3 flex flex-wrap items-center gap-4",
          className
        )}
      >
        <div className="h-6 w-24 rounded-full bg-slate-600/50 animate-pulse" />
        <div className="h-4 w-48 rounded bg-slate-600/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-600/40 bg-slate-800/40 backdrop-blur-sm px-4 py-3 flex flex-wrap items-center gap-4 sm:gap-6",
        className
      )}
    >
      {/* Network status pill */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-2.5 w-2.5 rounded-full flex-shrink-0",
            isHealthy ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400"
          )}
          aria-hidden
        />
        <span className="text-sm font-medium text-slate-200">
          {networkStatus?.message ?? (isHealthy ? "Network operational" : "Degraded")}
        </span>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <PiShieldCheckFill className="h-4 w-4 text-blue-400" aria-hidden />
          <span className="font-semibold text-white">{formatCompactNumber(validators)}</span>
          <span>validators</span>
        </span>
        <span className="text-slate-500" aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <PiStackFill className="h-4 w-4 text-emerald-400" aria-hidden />
          <span className="font-semibold text-white">{formatCompactNumber(miners)}</span>
          <span>miners</span>
        </span>
        <span className="text-slate-500" aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <PiListChecksFill className="h-4 w-4 text-amber-400" aria-hidden />
          <span className="font-semibold text-white">{formatCompactNumber(tasks)}</span>
          <span>tasks</span>
        </span>
        {avgScore > 0 && (
          <>
            <span className="text-slate-500" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <PiActivityFill className="h-4 w-4 text-pink-400" aria-hidden />
              <span className="font-semibold text-white">{avgScorePct}%</span>
              <span>avg score</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
