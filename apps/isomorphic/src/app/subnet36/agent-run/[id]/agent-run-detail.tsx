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
                )
                  ?.name || `Use Case ${result.useCaseId}`
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
        "relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/22 p-6 shadow-2xl backdrop-blur-xl text-white",
        className
      )}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 -bottom-28 h-72 w-72 rounded-full bg-purple-500/25 blur-[140px]" />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(245, 222, 179, 0.18)" }}
      />
      
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl shadow-lg">
              <PiChartBar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
              <p className="text-sm text-white/70">
                Success rates and performance metrics
              </p>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <PiTarget className="w-4 h-4 text-white/70" />
            <span className="text-sm font-medium text-white/80">Time range:</span>
          </div>
            <Select
              options={periodOptions}
              value={periodOptions.find(
                (opt) => opt.value === (period ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setPeriod(option.value === "__all__" ? null : option.value)
              }
              className="w-[90px] text-sm rounded-lg border border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-0"
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
              className="w-[160px] text-sm rounded-lg border border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              borderColor: "rgba(245, 222, 179, 0.45)",
              backgroundColor: "rgba(245, 222, 179, 0.15)",
              color: HIGHLIGHT_COLOR,
            }}
          >
            Active
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: HIGHLIGHT_COLOR }}
            />
          </span>
          <span className="text-xs text-white/70">
            Live view of current website performance trends
          </span>
        </div>
      </div>

      {hasWebsites ? (
        <div className="relative space-y-6">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const isHighPerformance = item.average >= 80;
            const isMediumPerformance = item.average >= 60 && item.average < 80;
            
            return (
              <div 
                key={`${item.website}-${index}`} 
                className="group relative rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#F5DEB3]/60 hover:shadow-2xl"
                style={{
                  boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)",
                }}
              >
                {/* Performance Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: colorClass }}
                    />
                    <span className="text-lg font-semibold text-white">
                      {item.website}
                    </span>
                    {isHighPerformance && (
                      <div
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border"
                        style={{
                          backgroundColor: "rgba(245, 222, 179, 0.2)",
                          borderColor: "rgba(245, 222, 179, 0.45)",
                          color: HIGHLIGHT_COLOR,
                        }}
                      >
                        <PiTrendUp className="w-3 h-3" />
                        Excellent
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-100 rounded-full text-xs font-medium border border-indigo-400/30">
                        <PiTrendUp className="w-3 h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-200 rounded-full text-xs font-medium border border-red-400/40">
                        <PiTrendDown className="w-3 h-3" />
                        Needs Improvement
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {item.average.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">
                      {item.total} requests • {item.successCount} successful
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(0, Math.min(item.average, 100))}%`,
                        background: `linear-gradient(90deg, ${colorClass} 0%, rgba(245, 222, 179, 0.85) 100%)`,
                        boxShadow: "0 8px 25px rgba(245, 222, 179, 0.25)",
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      
                      {/* Progress indicator dot */}
                      <div
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: HIGHLIGHT_COLOR,
                          opacity: item.average > 5 ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Performance markers */}
                  <div className="flex justify-between mt-2 text-xs text-white/60">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Additional metrics */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                    <div className="mb-1 text-white/70">Avg Solution Time</div>
                    <div className="font-semibold text-white">
                      {item.avgSolutionTime.toFixed(2)}s
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/15 bg-white/10 p-3">
                    <div className="mb-1 text-white/70">Success Rate</div>
                    <div className="font-semibold text-white">
                      {((item.successCount / item.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <PiChartBar className="w-8 h-8 text-white/70" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Performance Data Available
          </h3>
          <p className="text-white/70">
            Performance metrics will appear here once the agent run completes.
          </p>
        </div>
      )}
    </div>
  );
}
