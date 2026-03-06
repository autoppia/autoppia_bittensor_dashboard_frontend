"use client";

import { PiCheckCircle, PiXCircle, PiClock, PiGlobe } from "react-icons/pi";
import type { AgentRunStats as AgentRunStatsData } from "@/repositories/agent-runs/agent-runs.types";
import cn from "@core/utils/class-names";

const numberFormatter = new Intl.NumberFormat("en-US");
const percentageFormatter = new Intl.NumberFormat("en-US", {
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

const formatCount = (value: number | null | undefined) =>
  numberFormatter.format(Math.max(0, Math.round(value ?? 0)));

const formatPercentage = (value: number) => `${percentageFormatter.format(value)}%`;

const formatDuration = (value: number | null | undefined) =>
  value && value > 0 ? `${percentageFormatter.format(value)}s` : "—";

interface AgentRunStatsProps {
  stats?: AgentRunStatsData | null;
}

export default function AgentRunStats({ stats }: AgentRunStatsProps) {
  const overallReward = clampPercentage(stats?.overallReward);
  const totalTasks = clampNonNegative(stats?.totalTasks);
  const successfulTasks = clampNonNegative(stats?.successfulTasks);
  const failedTasks =
    stats?.failedTasks != null
      ? clampNonNegative(stats.failedTasks)
      : Math.max(totalTasks - successfulTasks, 0);
  const websitesCount = clampNonNegative(
    stats?.websites ?? stats?.performanceByWebsite?.length ?? 0
  );
  const successRate = clampPercentage(
    stats?.successRate ?? (totalTasks ? (successfulTasks / totalTasks) * 100 : 0)
  );
  const averageDuration = stats?.averageTaskDuration ?? 0;

  const displayOverallReward = formatPercentage(overallReward);
  const displaySuccessRate = formatPercentage(successRate);
  const displayAverageDuration = formatDuration(averageDuration);

  const statsCards = [
    {
      key: "tasks",
      label: "Total Tasks",
      value: formatCount(totalTasks),
      icon: PiClock,
      wrapperClass:
        "border-blue-400/45 bg-blue-500/45 text-blue-50 shadow-[0_16px_36px_rgba(59,130,246,0.28)]",
      iconClass: "text-blue-100",
      valueClass: "text-blue-50",
      labelClass: "text-blue-100/80",
    },
    {
      key: "websites",
      label: "Websites",
      value: formatCount(websitesCount),
      icon: PiGlobe,
      wrapperClass:
        "border-amber-400/50 bg-amber-400/45 text-amber-50 shadow-[0_16px_36px_rgba(245,158,11,0.28)]",
      iconClass: "text-amber-100",
      valueClass: "text-amber-50",
      labelClass: "text-amber-100/85",
    },
    {
      key: "success",
      label: "Successful",
      value: formatCount(successfulTasks),
      icon: PiCheckCircle,
      wrapperClass:
        "border-emerald-400/50 bg-emerald-500/45 text-emerald-50 shadow-[0_16px_36px_rgba(16,185,129,0.28)]",
      iconClass: "text-emerald-100",
      valueClass: "text-emerald-50",
      labelClass: "text-emerald-100/80",
    },
    {
      key: "failed",
      label: "Failed",
      value: formatCount(failedTasks),
      icon: PiXCircle,
      wrapperClass:
        "border-rose-400/50 bg-rose-500/45 text-rose-50 shadow-[0_16px_36px_rgba(244,63,94,0.28)]",
      iconClass: "text-rose-100",
      valueClass: "text-rose-50",
      labelClass: "text-rose-100/80",
    },
  ] as const;

  const renderStatCard = (card: (typeof statsCards)[number], isMobile = false) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className={cn(
          "rounded-2xl border px-4 py-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl",
          card.wrapperClass,
          isMobile ? "sm:px-5 sm:py-5" : "p-4"
        )}
      >
        <Icon className={cn("mx-auto mb-2 h-6 w-6", card.iconClass)} />
        <div className={cn("text-2xl font-bold sm:text-3xl", card.valueClass)}>
          {card.value}
        </div>
        <div className={cn("text-sm font-medium uppercase tracking-wide", card.labelClass)}>
          {card.label}
        </div>
      </div>
    );
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-6 -bottom-28 h-72 w-72 rounded-full bg-purple-500/25 blur-[140px]" />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(253, 245, 230, 0.18)" }}
      />

      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 md:hidden relative">
        {/* Overall Reward - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_15px_35px_rgba(244,197,94,0.45)]"
            style={{
              WebkitTextStroke: "0.4px rgba(249, 250, 251, 0.15)",
            }}
          >
            {displayOverallReward}
          </div>
          <div className="mt-2 text-sm font-medium text-white/70">
            Overall reward
          </div>
          <div className="mt-1 text-xs text-white/60">
            Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {statsCards.map((card) => renderStatCard(card, true))}
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">
          {statsCards.slice(0, 2).map((card) => renderStatCard(card))}
        </div>
        <div className="flex flex-col items-center justify-center mx-8">
          <div
            className="bg-gradient-to-r from-amber-300 via-yellow-200 to-yellow-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-[0_18px_38px_rgba(244,197,94,0.5)]"
            style={{
              WebkitTextStroke: "0.6px rgba(249, 250, 251, 0.18)",
            }}
          >
            {displayOverallReward}
          </div>
          <div className="mt-2 text-sm font-medium text-white/70">
            Overall reward
          </div>
          <div className="mt-1 text-xs text-white/60">
            Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {statsCards.slice(2).map((card) => renderStatCard(card))}
        </div>
      </div>
    </div>
  );
}
