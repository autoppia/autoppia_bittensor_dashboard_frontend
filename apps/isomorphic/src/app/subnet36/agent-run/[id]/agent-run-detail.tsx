"use client";

import cn from "@core/utils/class-names";
import { Select } from "rizzui";
import type { AgentRunDetailData } from "./agent-run-types";
import { PiTrendUp, PiTrendDown, PiChartBar, PiTarget } from "react-icons/pi";

const PROGRESS_COLORS = [
  "#10B981", // emerald-500
  "#3B82F6", // blue-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#EC4899", // pink-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#EAB308", // yellow-500
  "#0EA5E9", // sky-500
  "#D946EF", // fuchsia-500
  "#F43F5E", // rose-500
];

const HIGHLIGHT_COLOR = "#F5DEB3";

// Utility function to format use case names
function formatUseCaseName(name?: string | null): string {
  if (!name) {
    return "Use Case";
  }
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface AgentRunDetailProps {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
  data?: AgentRunDetailData | null;
}

export default function AgentRunDetail({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
  data,
}: AgentRunDetailProps) {
  const agentDetailsData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentDetailsData.websites.length > 0;

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web, index) => ({
      value: web.name ?? `Website ${index + 1}`,
      label: web.name ?? `Website ${index + 1}`,
    })),
  ];

  const periodOptions = [
    { value: "24h", label: "Last 24h" },
    { value: "7d", label: "Last 7d" },
    { value: "__all__", label: "All time" },
  ];

  const chartData =
    selectedWebsite && selectedWebsite !== "__all__"
      ? (() => {
          const selectedWeb = agentDetailsData.websites.find(
            (web) => web.name === selectedWebsite
          );
          return (
            selectedWeb?.results.map((result, idx) => ({
              website: formatUseCaseName(
                selectedWeb.useCases.find(
                  (uc) => String(uc.id) === String(result.useCaseId)
                )?.name || `Use Case ${result.useCaseId}`
              ),
              average: Number((result.successRate ?? 0).toFixed(3)),
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web, idx) => ({
          website: web.name,
          average: Number((web.overall.successRate ?? 0).toFixed(3)),
          total: web.overall.total ?? 0,
          successCount: web.overall.successCount ?? 0,
          avgSolutionTime: web.overall.avgSolutionTime ?? 0,
          colorIndex: idx,
        }));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white",
        className
      )}
    >
      {/* Header Section */}
      <div className="relative mb-6">
        <div className="flex items-center flex-col sm:flex-row justify-between mb-5">
          <div className="flex items-center flex-col sm:flex-row gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30 shadow-lg">
              <PiChartBar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-center sm:text-left text-2xl font-bold text-white">
                Performance Analytics
              </h2>
              <p className="text-center sm:text-left text-sm text-slate-400">
                Success rates and performance metrics
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <PiTarget className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">
                Time range:
              </span>
            </div>
            <Select
              options={periodOptions}
              value={periodOptions.find(
                (opt) => opt.value === (period ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setPeriod(option.value === "__all__" ? null : option.value)
              }
              className="w-[90px] text-sm rounded-lg border border-slate-700/50 bg-slate-800/50 text-white focus:border-slate-600 focus:ring-0"
            />
            <Select
              options={websiteOptions}
              value={websiteOptions.find(
                (opt) => opt.value === (selectedWebsite ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setSelectedWebsite(
                  option.value === "__all__" ? null : option.value
                )
              }
              className="w-[160px] text-sm rounded-lg border border-slate-700/50 bg-slate-800/50 text-white focus:border-slate-600 focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              borderColor: "rgba(245, 222, 179, 0.4)",
              backgroundColor: "rgba(245, 222, 179, 0.1)",
              color: HIGHLIGHT_COLOR,
            }}
          >
            Active
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: HIGHLIGHT_COLOR }}
            />
          </span>
          <span className="text-xs text-slate-400">
            Live view of current website performance trends
          </span>
        </div>
      </div>

      {hasWebsites ? (
        <div className="relative space-y-6 sm:space-y-4">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const isHighPerformance = item.average >= 80;
            const isMediumPerformance = item.average >= 60 && item.average < 80;

            return (
              <div
                key={`${item.website}-${index}`}
                className="group relative rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 sm:p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-500/40"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                  {/* Website + performance */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-md"
                      style={{
                        backgroundColor: colorClass,
                        boxShadow: `0 0 12px ${colorClass}40`,
                      }}
                    />
                    <span className="text-base sm:text-lg font-semibold text-white truncate max-w-[180px] sm:max-w-none">
                      {item.website}
                    </span>

                    {isHighPerformance && (
                      <div
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium border"
                        style={{
                          backgroundColor: "rgba(245, 222, 179, 0.15)",
                          borderColor: "rgba(245, 222, 179, 0.4)",
                          color: HIGHLIGHT_COLOR,
                        }}
                      >
                        <PiTrendUp className="w-3 h-3" />
                        Excellent
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-500/15 text-blue-300 rounded-full text-[10px] sm:text-xs font-medium border border-blue-500/30">
                        <PiTrendUp className="w-3 h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-500/15 text-red-300 rounded-full text-[10px] sm:text-xs font-medium border border-red-500/30">
                        <PiTrendDown className="w-3 h-3" />
                        Needs Improvement
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      {item.average.toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {item.total} requests • {item.successCount} successful
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="h-2 sm:h-3 w-full rounded-full bg-slate-900/50 border border-slate-700/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(0, Math.min(item.average, 100))}%`,
                        background: `linear-gradient(90deg, ${colorClass} 0%, rgba(245, 222, 179, 0.8) 100%)`,
                        boxShadow: `0 0 20px ${colorClass}30`,
                      }}
                    >
                      {/* Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                      {/* Dot */}
                      <div
                        className="absolute right-0.5 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{
                          backgroundColor: HIGHLIGHT_COLOR,
                          opacity: item.average > 5 ? 1 : 0,
                          boxShadow: `0 0 8px ${HIGHLIGHT_COLOR}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Markers */}
                  <div className="hidden sm:flex justify-between mt-2 text-xs text-slate-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center sm:text-left">
                    <div className="mb-1 text-slate-400 text-xs font-medium">
                      Avg Solution Time
                    </div>
                    <div className="font-semibold text-white text-base sm:text-lg">
                      {item.avgSolutionTime.toFixed(2)}s
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center sm:text-left">
                    <div className="mb-1 text-slate-400 text-xs font-medium">
                      Success Rate
                    </div>
                    <div className="font-semibold text-white text-base sm:text-lg">
                      {((item.successCount / item.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative text-center py-10 sm:py-12">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/40">
            <PiChartBar className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
            No Performance Data Available
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Performance metrics will appear here once the agent run completes.
          </p>
        </div>
      )}
    </div>
  );
}
