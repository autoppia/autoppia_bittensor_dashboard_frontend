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
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "__all__", label: "ALL" },
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
        "relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl",
        className
      )}
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/15 via-sky-400/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/10 via-emerald-500/5 to-transparent blur-[120px]" />
      
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl shadow-lg">
              <PiChartBar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
              <p className="text-sm text-slate-400">
                Success rates and performance metrics
              </p>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <PiTarget className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Filters:</span>
            </div>
            <Select
              options={periodOptions}
              value={periodOptions.find(
                (opt) => opt.value === (period ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setPeriod(option.value === "__all__" ? null : option.value)
              }
              className="w-[90px] text-sm"
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
              className="w-[160px] text-sm"
            />
          </div>
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
                className="group relative bg-slate-800/20 backdrop-blur-sm rounded-xl p-5 border border-slate-700/25 hover:border-slate-600/45 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/15"
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
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
                        <PiTrendUp className="w-3 h-3" />
                        Excellent
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium border border-amber-500/30">
                        <PiTrendUp className="w-3 h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
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
                  <div className="h-4 w-full rounded-full bg-slate-700/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(0, Math.min(item.average, 100))}%`,
                        background: `linear-gradient(90deg, ${colorClass} 0%, ${colorClass}CC 100%)`,
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      
                      {/* Progress indicator dot */}
                      <div 
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"
                        style={{ opacity: item.average > 5 ? 1 : 0 }}
                      />
                    </div>
                  </div>
                  
                  {/* Performance markers */}
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Additional metrics */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-800/15 rounded-lg p-3 border border-slate-700/20">
                    <div className="text-slate-400 mb-1">Avg Solution Time</div>
                    <div className="font-semibold text-white">
                      {item.avgSolutionTime.toFixed(2)}s
                    </div>
                  </div>
                  <div className="bg-slate-800/15 rounded-lg p-3 border border-slate-700/20">
                    <div className="text-slate-400 mb-1">Success Rate</div>
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
          <div className="w-16 h-16 bg-slate-800/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/25">
            <PiChartBar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Performance Data Available
          </h3>
          <p className="text-slate-400">
            Performance metrics will appear here once the agent run completes.
          </p>
        </div>
      )}
    </div>
  );
}
