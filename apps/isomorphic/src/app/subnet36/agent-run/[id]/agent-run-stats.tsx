"use client";

import { PiCheckCircle, PiXCircle, PiClock, PiGlobe } from "react-icons/pi";
import type { AgentRunStats as AgentRunStatsData } from "@/services/api/types/agent-runs";
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

const formatPercentage = (value: number) =>
  `${percentageFormatter.format(value)}%`;

const formatDuration = (value: number | null | undefined) =>
  value && value > 0 ? `${percentageFormatter.format(value)}s` : "—";

interface AgentRunStatsProps {
  stats?: AgentRunStatsData | null;
}

export default function AgentRunStats({ stats }: AgentRunStatsProps) {
  const overallScore = clampPercentage(stats?.overallScore);
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
    stats?.successRate ??
      (totalTasks ? (successfulTasks / totalTasks) * 100 : 0)
  );
  const averageDuration = stats?.averageTaskDuration ?? 0;

  const displayOverallScore = formatPercentage(overallScore);
  const displaySuccessRate = formatPercentage(successRate);
  const displayAverageDuration = formatDuration(averageDuration);

  const statsCards = [
    {
      key: "tasks",
      label: "Total Tasks",
      value: formatCount(totalTasks),
      icon: PiClock,
      wrapperClass:
        "border-blue-500/40 bg-blue-500/20 text-blue-50 shadow-lg shadow-blue-500/20",
      iconClass: "text-blue-200",
      valueClass: "text-blue-50",
      labelClass: "text-blue-200/90",
    },
    {
      key: "websites",
      label: "Websites",
      value: formatCount(websitesCount),
      icon: PiGlobe,
      wrapperClass:
        "border-amber-500/40 bg-amber-500/20 text-amber-50 shadow-lg shadow-amber-500/20",
      iconClass: "text-amber-200",
      valueClass: "text-amber-50",
      labelClass: "text-amber-200/90",
    },
    {
      key: "success",
      label: "Successful",
      value: formatCount(successfulTasks),
      icon: PiCheckCircle,
      wrapperClass:
        "border-emerald-500/40 bg-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-500/20",
      iconClass: "text-emerald-200",
      valueClass: "text-emerald-50",
      labelClass: "text-emerald-200/90",
    },
    {
      key: "failed",
      label: "Failed",
      value: formatCount(failedTasks),
      icon: PiXCircle,
      wrapperClass:
        "border-rose-500/40 bg-rose-500/20 text-rose-50 shadow-lg shadow-rose-500/20",
      iconClass: "text-rose-200",
      valueClass: "text-rose-50",
      labelClass: "text-rose-200/90",
    },
  ] as const;

  const renderStatCard = (
    card: (typeof statsCards)[number],
    isMobile = false
  ) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className={cn(
          "rounded-2xl border px-4 py-4 text-center transition-all duration-300",
          card.wrapperClass,
          isMobile ? "sm:px-5 sm:py-5" : "p-4"
        )}
      >
        <Icon className={cn("mx-auto mb-2 h-6 w-6", card.iconClass)} />
        <div className={cn("text-2xl font-bold sm:text-3xl", card.valueClass)}>
          {card.value}
        </div>
        <div
          className={cn(
            "text-sm font-medium uppercase tracking-wide",
            card.labelClass
          )}
        >
          {card.label}
        </div>
      </div>
    );
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 lg:hidden relative">
        {/* Overall Score - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
            {displayOverallScore}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-300">
            Overall evaluation score
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Success rate {displaySuccessRate} • Avg duration{" "}
            {displayAverageDuration}
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {statsCards.map((card) => renderStatCard(card, true))}
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden lg:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">
          {statsCards.slice(0, 2).map((card) => renderStatCard(card))}
        </div>
        <div className="flex flex-col items-center justify-center mx-8">
          <div className="bg-gradient-to-r from-amber-300 via-yellow-200 to-yellow-400 bg-clip-text text-6xl font-extrabold text-transparent">
            {displayOverallScore}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-300">
            Overall evaluation score
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Success rate {displaySuccessRate} • Avg duration{" "}
            {displayAverageDuration}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {statsCards.slice(2).map((card) => renderStatCard(card))}
        </div>
      </div>
    </div>
  );
}
