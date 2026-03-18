"use client";

import { useMemo } from "react";
import Link from "next/link";
import cn from "@core/utils/class-names";
import { routes } from "@/config/routes";
import { useRecentActivity } from "@/services/hooks/useOverview";
import { PiClockCountdownLight, PiPlayCircleLight, PiStopCircleLight } from "react-icons/pi";

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function ActivityIcon({ type }: Readonly<{ type: string }>) {
  if (type === "round_started")
    return <PiPlayCircleLight className="h-4 w-4 text-emerald-400 flex-shrink-0" aria-hidden />;
  if (type === "round_ended")
    return <PiStopCircleLight className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden />;
  return <PiClockCountdownLight className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden />;
}

const LIMIT = 5;

export default function OverviewRecentActivity({ className }: Readonly<{ className?: string }>) {
  const { data, loading, error } = useRecentActivity(LIMIT);

  const activities = useMemo(() => {
    const list = data?.activities ?? [];
    return Array.isArray(list) ? list.slice(0, LIMIT) : [];
  }, [data?.activities]);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-600/40 bg-slate-800/30 backdrop-blur-sm overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-slate-600/40">
          <h3 className="text-sm font-semibold text-slate-200">Recent activity</h3>
        </div>
        <ul className="divide-y divide-slate-700/50">
          {[1, 2, 3].map((i) => (
            <li key={i} className="px-4 py-2.5 flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-slate-600/50 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="h-3 w-32 bg-slate-600/50 rounded animate-pulse" />
                <div className="h-2.5 w-16 mt-1 bg-slate-600/40 rounded animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error || activities.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-600/40 bg-slate-800/30 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-600/40 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Recent activity</h3>
        <Link
          href={routes.rounds}
          className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y divide-slate-700/50">
        {activities.map((a) => (
            <li key={a.id}>
              <Link
                href={routes.rounds}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/30 transition text-left"
              >
                <ActivityIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{a.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(a.timestamp)}</p>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
