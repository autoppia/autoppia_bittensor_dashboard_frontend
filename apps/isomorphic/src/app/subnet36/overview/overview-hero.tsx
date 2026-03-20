"use client";

import cn from "@core/utils/class-names";
import { useNetworkStatus } from "@/services/hooks/useOverview";
import { PiPulseFill } from "react-icons/pi";

type OverviewHeroProps = Readonly<{
  className?: string;
}>;

export default function OverviewHero({ className }: OverviewHeroProps) {
  const { data: networkStatus, loading } = useNetworkStatus();
  const status = networkStatus?.status ?? "unknown";
  const isHealthy = status === "healthy";
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3",
          className
        )}
      >
        <div className="h-5 w-56 rounded bg-white/[0.06] animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,27,0.42),rgba(8,10,22,0.28))] px-4 py-3 shadow-[0_12px_26px_rgba(2,6,23,0.08)] backdrop-blur-sm sm:px-5",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border",
            isHealthy ? "border-emerald-400/18 bg-emerald-400/10 text-emerald-200" : "border-amber-400/18 bg-amber-400/10 text-amber-200"
          )}
        >
          <PiPulseFill className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-2.5 w-2.5 rounded-full",
                isHealthy ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" : "bg-amber-400"
              )}
            />
            <span className="text-sm font-semibold text-white">
              {networkStatus?.message ?? (isHealthy ? "Network operational" : "Degraded")}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 sm:text-sm">
            Live subnet context for the current evaluation window.
          </div>
        </div>
      </div>
    </div>
  );
}
