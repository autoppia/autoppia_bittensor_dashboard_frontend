"use client";

import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";

const PROGRESS_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
];

function formatPercentage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatUseCaseName(name: string) {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface AgentRunDetailDynamicProps {
  className?: string;
}

export default function AgentRunDetailDynamic({ className }: AgentRunDetailDynamicProps) {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  if (isLoading) {
    return (
      <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
        <div className="flex items-center justify-between mb-6">
          <Placeholder height="1.5rem" width="8rem" />
          <Placeholder height="2rem" width="6rem" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <Placeholder height="1rem" width="40%" />
                <Placeholder height="1rem" width="3rem" />
              </div>
              <Placeholder height="0.75rem" width="100%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Performance Data
          </div>
          <div className="text-red-500 text-sm mb-4">
            {error || "Unable to fetch performance information for this run."}
          </div>
          <div className="text-gray-500 text-xs">
            Please try refreshing the page or contact support if the issue persists.
          </div>
        </div>
      </div>
    );
  }

  const websiteData = Array.isArray(stats.performanceByWebsite)
    ? stats.performanceByWebsite.map((entry, index) => {
        const completion =
          entry.tasks > 0 ? (entry.successful / entry.tasks) * 100 : 0;
        return {
          key: `${entry.website}-${index}`,
          name: entry.website || `Website ${index + 1}`,
          averageScore: entry.averageScore ?? 0,
          tasks: entry.tasks ?? 0,
          successful: entry.successful ?? 0,
          failed: entry.failed ?? 0,
          completionRate: completion,
          color: PROGRESS_COLORS[index % PROGRESS_COLORS.length],
        };
      })
    : [];

  const useCaseData = Array.isArray(stats.performanceByUseCase)
    ? stats.performanceByUseCase.map((entry, index) => {
        const completion =
          entry.tasks > 0 ? (entry.successful / entry.tasks) * 100 : 0;
        return {
          key: `${entry.useCase}-${index}`,
          name: formatUseCaseName(entry.useCase || `Use Case ${index + 1}`),
          averageScore: entry.averageScore ?? 0,
          tasks: entry.tasks ?? 0,
          successful: entry.successful ?? 0,
          failed: entry.failed ?? 0,
          completionRate: completion,
          color: PROGRESS_COLORS[(index + 4) % PROGRESS_COLORS.length],
        };
      })
    : [];

  return (
    <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Performance Breakdown</h2>
        <p className="text-sm text-gray-500 mt-1">
          Success metrics for the websites and use cases involved in this run.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Website</h3>
          {websiteData.length > 0 ? (
            <div className="space-y-4">
              {websiteData.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <div className="text-xs text-gray-500">
                        {item.successful.toLocaleString()}/{item.tasks.toLocaleString()} successful •{" "}
                        {formatPercentage(item.completionRate)} completion
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatPercentage(item.averageScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.averageScore, 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No website performance data is available for this run.
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Use Case</h3>
          {useCaseData.length > 0 ? (
            <div className="space-y-4">
              {useCaseData.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <div className="text-xs text-gray-500">
                        {item.successful.toLocaleString()}/{item.tasks.toLocaleString()} successful •{" "}
                        {formatPercentage(item.completionRate)} completion
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatPercentage(item.averageScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(item.averageScore, 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No use case performance data is available for this run.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
