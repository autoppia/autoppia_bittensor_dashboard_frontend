"use client";

import { PiCheckCircle, PiXCircle, PiClock, PiGlobe } from "react-icons/pi";
import type { AgentRunStats as AgentRunStatsData } from "@/services/api/types/agent-runs";

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
    stats?.successRate ?? (totalTasks ? (successfulTasks / totalTasks) * 100 : 0)
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
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 via-slate-800/90 to-slate-900/90",
    },
    {
      key: "websites",
      label: "Websites",
      value: formatCount(websitesCount),
      icon: PiGlobe,
      gradient: "from-amber-400 to-orange-500",
      bgGradient: "from-amber-500/10 via-slate-800/90 to-slate-900/90",
    },
    {
      key: "success",
      label: "Successful",
      value: formatCount(successfulTasks),
      icon: PiCheckCircle,
      gradient: "from-emerald-400 to-teal-500",
      bgGradient: "from-emerald-500/10 via-slate-800/90 to-slate-900/90",
    },
    {
      key: "failed",
      label: "Failed",
      value: formatCount(failedTasks),
      icon: PiXCircle,
      gradient: "from-rose-400 to-pink-500",
      bgGradient: "from-rose-500/10 via-slate-800/90 to-slate-900/90",
    },
  ] as const;

  return (
    <div className="mb-6 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-6 lg:hidden">
        {/* Overall Score - Prominent on mobile */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-6xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-3 drop-shadow-[0_4px_16px_rgba(251,191,36,0.5)]">
            {displayOverallScore}
          </div>
          <div className="text-sm font-semibold text-slate-300 mb-2">
            Overall evaluation score
          </div>
          <div className="text-xs text-slate-400">
            Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center shadow-lg`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {card.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden lg:flex items-center justify-between gap-8">
        <div className="grid grid-cols-2 gap-4">
          {statsCards.slice(0, 2).map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 text-center shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-3`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {card.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="text-7xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-3 drop-shadow-[0_6px_20px_rgba(251,191,36,0.6)]">
            {displayOverallScore}
          </div>
          <div className="text-sm font-semibold text-slate-300 mb-2">
            Overall evaluation score
          </div>
          <div className="text-xs text-slate-400">
            Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {statsCards.slice(2).map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 text-center shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-3`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {card.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
