"use client";

import { useParams } from "next/navigation";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";
import {
  PiXCircleDuotone,
  PiTimerDuotone,
  PiTrophyDuotone,
} from "react-icons/pi";

const numberFormatter = new Intl.NumberFormat("en-US");
const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const clampPercentage = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
};

const clampNonNegative = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, value);
};

const formatPercentageLabel = (value: number) =>
  `${oneDecimalFormatter.format(value)}%`;

const formatCount = (value: number) => numberFormatter.format(Math.round(value));

const formatDuration = (value: number) =>
  value > 0 ? `${oneDecimalFormatter.format(value)}s` : "—";

export default function AgentRunStatsDynamic() {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  if (isLoading || error || !stats) {
    return (
      <div className="mb-6 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-h-[180px] flex-col justify-between gap-4 rounded-3xl border border-emerald-400/30 bg-slate-900/80 px-6 py-6 shadow">
            <Placeholder
              variant="circular"
              width={90}
              height={90}
              className="bg-slate-700"
            />
            <div className="flex-1 space-y-1.5">
              <Placeholder height="1.1rem" width="55%" className="bg-slate-700" />
              <Placeholder height="0.8rem" width="40%" className="bg-slate-700" />
            </div>
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex min-h-[140px] flex-col justify-between gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 px-5 py-5 shadow"
            >
              <Placeholder height="0.9rem" width="45%" className="bg-slate-700" />
              <Placeholder height="0.8rem" width="35%" className="bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const overallScore = clampPercentage(stats.overallScore);
  const successRate = clampPercentage(stats.successRate);
  const totalTasks = clampNonNegative(stats.totalTasks);
  const successfulTasks = clampNonNegative(stats.successfulTasks);
  const failedTasks = clampNonNegative(stats.failedTasks);
  const averageDuration = clampNonNegative(stats.averageTaskDuration);
  const averageProgress = Math.min(100, overallScore);
  const progressStyle = {
    background: `conic-gradient(#34d399 ${averageProgress * 3.6}deg, rgba(13, 148, 136, 0.15) 0deg)`
  };

  const summaryCards = [
    {
      label: "Successful Tasks",
      value: formatCount(successfulTasks),
      icon: PiTrophyDuotone,
      iconColor: "text-emerald-100",
      valueClass: "text-emerald-200",
      unitClass: "text-emerald-200/80",
    },
    {
      label: "Failed Tasks",
      value: formatCount(failedTasks),
      icon: PiXCircleDuotone,
      iconColor: "text-rose-400",
      valueClass: "text-rose-300",
      unitClass: "text-rose-300/80",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="relative overflow-hidden rounded-3xl border border-blue-400/40 bg-gradient-to-br from-sky-500/30 via-slate-950/80 to-slate-950 px-5 py-6 shadow-lg">
        <div className="relative flex flex-col gap-4 text-blue-50">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/80">
                Score
                </p>
                <p className="text-sm text-blue-100/70">
                  {formatCount(totalTasks)} tasks evaluated in this run
                </p>
              </div>
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-2xl" />
                <div
                  className="absolute inset-[2%] rounded-full border border-blue-500/30 bg-slate-950/60 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                />
                <div
                  className="absolute inset-[2%] rounded-full [mask-image:radial-gradient(circle,rgba(0,0,0,0)_64%,rgba(0,0,0,1)_67%)]"
                  style={progressStyle}
                />
                <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full border border-blue-400/40 bg-slate-950/95 shadow-inner">
                  <span className="text-lg font-semibold text-white/95">
                    {formatPercentageLabel(overallScore)}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl bg-transparent px-4 py-3 text-blue-50">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/70">
                <PiTimerDuotone className="h-5 w-5 text-blue-100" />
              </div>
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100/70">
                  Avg Response Time
                </p>
                <p className="text-sm font-semibold text-white/95">
                  {formatDuration(averageDuration)}
                </p>
              </div>
          </div>
        </div>
      </div>

      {summaryCards.map(({ label, value, icon: Icon, iconColor, valueClass, unitClass }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-3xl border border-blue-400/40 bg-gradient-to-br from-sky-500/30 via-slate-950/80 to-slate-950 px-5 py-6 shadow-lg"
        >
          <div className="relative flex h-full flex-col justify-between gap-4 text-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-50/80">
                {label}
              </span>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <p className={`text-3xl font-semibold text-white/95 ${valueClass ?? ""}`}>
              {value}
              <span className={`ml-1 text-base font-normal ${unitClass ?? "text-blue-100/70"}`}>
                tasks
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
