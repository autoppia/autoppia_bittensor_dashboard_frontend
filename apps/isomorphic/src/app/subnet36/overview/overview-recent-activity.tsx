"use client";

import { useMemo } from "react";
import cn from "@core/utils/class-names";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { useRecentActivity } from "@/services/hooks/useOverview";
import type { RecentActivityItem } from "@/repositories/overview/overview.types";
import {
  PiCheckCircleFill,
  PiClockCountdownLight,
  PiCrownSimpleFill,
  PiDownloadSimpleBold,
  PiFlagPennantFill,
  PiHourglassFill,
  PiPlayCircleLight,
  PiRocketLaunchFill,
  PiSealCheckFill,
  PiSparkleFill,
  PiXBold,
} from "react-icons/pi";

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

function formatPercent(value?: number | null, withSign: boolean = false): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  const numeric = Number(value);
  const scaled = numeric <= 1 && numeric >= -1 ? numeric * 100 : numeric;
  const prefix = withSign && scaled > 0 ? "+" : "";
  return `${prefix}${scaled.toFixed(1)}%`;
}

function formatSeconds(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  return `${Number(value).toFixed(1)}s`;
}

function formatCost(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  return `$${Number(value).toFixed(3)}`;
}

function activityChips(activity: RecentActivityItem, maxItems?: number): string[] {
  const chips: string[] = [];
  const metadata = activity.metadata ?? {};

  if (activity.type === "evaluation_finished") {
    if (metadata.seasonNumber != null && metadata.roundNumber != null) {
      chips.push(`Season ${metadata.seasonNumber} · Round ${metadata.roundNumber}`);
    }
    if (metadata.metricSource === "local") {
      chips.push("Local");
    } else if (metadata.metricSource === "best_local") {
      chips.push("Best local");
    } else if (metadata.metricSource === "run") {
      chips.push("Run");
    }
    const reward = formatPercent(metadata.reward);
    const time = formatSeconds(metadata.time);
    const cost = formatCost(metadata.cost);
    if (reward) chips.push(`reward ${reward}`);
    if (
      metadata.score != null &&
      !(Number(metadata.score) === 0 && metadata.reward != null && Number(metadata.reward) > 0)
    ) {
      chips.push(`score ${Number(metadata.score).toFixed(1)}`);
    }
    if (time) chips.push(`time ${time}`);
    if (cost) chips.push(`cost ${cost}`);
  } else if (activity.type === "evaluation_started" && metadata.validatorName) {
    chips.push(metadata.validatorName);
  } else if (
    (activity.type === "consensus_waiting" || activity.type === "consensus_entered") &&
    metadata.validatorName
  ) {
    chips.push(metadata.validatorName);
  } else if (activity.type === "leader_confirmed") {
    const reward = formatPercent(metadata.reward);
    if (reward) chips.push(`leader ${reward}`);
  }

  if (
    activity.type !== "evaluation_finished" &&
    metadata.seasonNumber != null &&
    metadata.roundNumber != null
  ) {
    chips.push(`Season ${metadata.seasonNumber} · Round ${metadata.roundNumber}`);
  } else if (metadata.seasonNumber != null) {
    chips.push(`Season ${metadata.seasonNumber}`);
  }

  if (
    metadata.minerName &&
    !activity.message.toLowerCase().includes(String(metadata.minerName).toLowerCase()) &&
    activity.type !== "evaluation_finished"
  ) {
    chips.push(metadata.minerName);
  }

  return typeof maxItems === "number" ? chips.slice(0, maxItems) : chips;
}

function ActivityIcon({ type }: Readonly<{ type: string }>) {
  if (type === "season_started") {
    return <PiRocketLaunchFill className="h-4 w-4 text-emerald-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "season_finished") {
    return <PiFlagPennantFill className="h-4 w-4 text-fuchsia-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "round_started") {
    return <PiPlayCircleLight className="h-4 w-4 text-cyan-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "round_ended") {
    return <PiCheckCircleFill className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "evaluation_started") {
    return <PiSparkleFill className="h-4 w-4 text-sky-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "evaluation_finished") {
    return <PiSealCheckFill className="h-4 w-4 text-emerald-300 flex-shrink-0" aria-hidden />;
  }
  if (type === "consensus_waiting") {
    return <PiHourglassFill className="h-4 w-4 text-violet-400 flex-shrink-0" aria-hidden />;
  }
  if (type === "consensus_entered") {
    return <PiDownloadSimpleBold className="h-4 w-4 text-sky-300 flex-shrink-0" aria-hidden />;
  }
  if (type === "leader_confirmed") {
    return <PiCrownSimpleFill className="h-4 w-4 text-amber-300 flex-shrink-0" aria-hidden />;
  }
  return <PiClockCountdownLight className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden />;
}

function ActivityRow({
  activity,
  compact = false,
}: Readonly<{
  activity: RecentActivityItem;
  compact?: boolean;
}>) {
  const chips = activityChips(activity, compact ? 5 : undefined);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3",
        compact ? "hover:bg-white/[0.05]" : "bg-white/[0.04]"
      )}
    >
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
        <ActivityIcon type={activity.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-slate-100">{activity.message}</p>
        {chips.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={`${activity.id}-${chip}`}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}

function RecentActivityModal({
  activities,
}: Readonly<{
  activities: RecentActivityItem[];
}>) {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[920px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,28,0.98),rgba(6,10,22,0.96))] px-6 py-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.55)] sm:px-7 sm:py-7">
      <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Recent activity
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Live subnet broadcast
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            High-signal events across evaluation, season flow and consensus. Task-level noise stays out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => closeModal()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Close recent activity"
        >
          <PiXBold className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

const DISPLAY_LIMIT = 6;
const FETCH_LIMIT = 24;

export default function OverviewRecentActivity({ className }: Readonly<{ className?: string }>) {
  const { openModal } = useModal();
  const { data, loading, error } = useRecentActivity(FETCH_LIMIT);

  const activities = useMemo(() => {
    const list = data?.activities ?? [];
    return Array.isArray(list) ? list : [];
  }, [data?.activities]);

  const visibleActivities = useMemo(
    () => activities.slice(0, DISPLAY_LIMIT),
    [activities]
  );

  if (loading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(9,10,24,0.88))] shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-md",
          className
        )}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Recent activity</h3>
        </div>
        <div className="space-y-2 px-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="h-3 w-36 animate-pulse rounded bg-slate-600/50" />
              <div className="mt-3 h-2.5 w-28 animate-pulse rounded bg-slate-600/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || visibleActivities.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[880px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(9,10,24,0.88))] shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Recent activity</h3>
          <p className="mt-1 text-xs text-slate-500">Consensus, seasons and validator evaluation flow.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal({ view: <RecentActivityModal activities={activities} />, size: "xl", customSize: 980 })}
          className="text-xs font-medium text-sky-400 transition hover:text-sky-300"
        >
          View all
        </button>
      </div>
      <div className="flex-1 space-y-2 px-4 py-4">
        {visibleActivities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} compact />
        ))}
      </div>
    </div>
  );
}
