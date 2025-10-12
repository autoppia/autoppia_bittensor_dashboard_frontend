"use client";

import { useParams } from "next/navigation";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";
import {
  PiChartLineUpDuotone,
  PiTimerDuotone,
  PiGlobeDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
} from "react-icons/pi";
import cn from "@core/utils/class-names";

function StatsSkeleton() {
  return (
    <div className="mb-6 rounded-2xl border border-muted/60 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`highlight-skeleton-${index}`}
            className="flex items-center gap-4 rounded-xl border border-muted/40 bg-white/60 p-4"
          >
            <Placeholder variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Placeholder height="1.25rem" width="5rem" />
              <Placeholder height="0.75rem" width="7rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="rounded-xl border border-muted/40 bg-white/60 p-4"
          >
            <div className="flex items-center gap-3">
              <Placeholder variant="circular" width={36} height={36} />
              <div className="flex-1 space-y-2">
                <Placeholder height="1rem" width="4rem" />
                <Placeholder height="0.75rem" width="6rem" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-muted/40 bg-white/60 p-4">
        <Placeholder height="1rem" width="7rem" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`distribution-skeleton-${index}`} className="space-y-2">
            <Placeholder height="0.75rem" width="5rem" />
            <Placeholder height="0.75rem" width="100%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentRunStatsDynamic() {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center text-red-700">
        Failed to load run statistics. Please try again later.
      </div>
    );
  }

  const totalTasks = stats.totalTasks;
  const successfulTasks = stats.successfulTasks;
  const failedTasks = stats.failedTasks;
  const successRate = totalTasks ? (successfulTasks / totalTasks) * 100 : 0;
  const failureRate = totalTasks ? (failedTasks / totalTasks) * 100 : 0;
  const averageScore = stats.overallScore;
  const averageTaskDuration = stats.averageTaskDuration;
  const websitesCount = stats.performanceByWebsite.length;
  const useCasesCount = stats.performanceByUseCase.length;

  const highlightCards = [
    {
      title: "Average Score",
      value: `${Math.round(averageScore)}%`,
      description: `${successRate.toFixed(1)}% tasks successful`,
      icon: <PiChartLineUpDuotone className="h-6 w-6" />,
      iconClass: "bg-emerald-500/15 text-emerald-600",
    },
    {
      title: "Avg Response Time",
      value: `${Math.round(averageTaskDuration)}s`,
      description: "Per evaluated task",
      icon: <PiTimerDuotone className="h-6 w-6" />,
      iconClass: "bg-blue-500/15 text-blue-600",
    },
    {
      title: "Websites Evaluated",
      value: websitesCount,
      description: `${useCasesCount} unique use cases`,
      icon: <PiGlobeDuotone className="h-6 w-6" />,
      iconClass: "bg-purple-500/15 text-purple-600",
    },
  ];

  const scoreDistribution = [
    {
      label: "Excellent (90-100%)",
      value: stats.scoreDistribution.excellent,
      color: "bg-emerald-500",
    },
    {
      label: "Good (70-89%)",
      value: stats.scoreDistribution.good,
      color: "bg-blue-500",
    },
    {
      label: "Average (50-69%)",
      value: stats.scoreDistribution.average,
      color: "bg-yellow-500",
    },
    {
      label: "Needs Work (0-49%)",
      value: stats.scoreDistribution.poor,
      color: "bg-red-500",
    },
  ];

  const distributionTotal = scoreDistribution.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const successBlocks = [
    {
      label: "Successful Tasks",
      value: successfulTasks,
      percentage: successRate,
      icon: <PiCheckCircleDuotone className="h-5 w-5" />,
      accent: "bg-emerald-500/15 text-emerald-600",
    },
    {
      label: "Failed Tasks",
      value: failedTasks,
      percentage: failureRate,
      icon: <PiXCircleDuotone className="h-5 w-5" />,
      accent: "bg-red-500/15 text-red-600",
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-muted/50 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="grid gap-4 md:grid-cols-3">
        {highlightCards.map((card) => (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-xl border border-muted/40 bg-white/80 p-4 shadow-sm"
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.iconClass)}>
              {card.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">{card.title}</div>
              <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
              <div className="text-xs font-medium text-gray-500">{card.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {successBlocks.map((item) => (
          <div key={item.label} className="rounded-xl border border-muted/40 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", item.accent)}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{item.label}</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {item.value}{" "}
                    <span className="text-sm font-medium text-gray-500">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-muted/40 bg-white/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-600">Score Distribution</div>
          <div className="text-xs text-gray-500">
            {distributionTotal} evaluated tasks
          </div>
        </div>
        <div className="space-y-3">
          {scoreDistribution.map((bucket) => {
            const percentage = distributionTotal
              ? (bucket.value / distributionTotal) * 100
              : 0;
            return (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                  <span>{bucket.label}</span>
                  <span>
                    {bucket.value} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className={cn("h-2 rounded-full transition-all duration-500", bucket.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
