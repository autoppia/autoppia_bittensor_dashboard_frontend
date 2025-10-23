"use client";

import cn from "@core/utils/class-names";
import { Select } from "rizzui";
import type { AgentRunDetailData } from "./agent-run-types";
import { 
  PiTrendUp, 
  PiTrendDown, 
  PiChartBar, 
  PiTarget, 
  PiClock,
  PiCheckCircle,
  PiGlobe
} from "react-icons/pi";

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
    <div className={cn("space-y-6", className)}>
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <PiChartBar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Performance Analytics</h2>
              <p className="text-sm text-slate-400">
                Success rates and performance metrics across websites
              </p>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <PiTarget className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Filters:</span>
            </div>
            <Select
              options={periodOptions}
              value={periodOptions.find(
                (opt) => opt.value === (period ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setPeriod(option.value === "__all__" ? null : option.value)
              }
              className="min-w-[120px]"
              selectClassName="bg-slate-800/50 border-slate-600/50 text-white"
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
              className="min-w-[180px]"
              selectClassName="bg-slate-800/50 border-slate-600/50 text-white"
            />
          </div>
        </div>
      </div>

      {hasWebsites ? (
        <div className="grid grid-cols-1 gap-6">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const isHighPerformance = item.average >= 80;
            const isMediumPerformance = item.average >= 60 && item.average < 80;
            
            return (
              <div 
                key={`${item.website}-${index}`} 
                className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:border-slate-600/50 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${colorClass}CC, ${colorClass})`,
                      }}
                    >
                      <PiGlobe className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {item.website}
                        </h3>
                        {isHighPerformance && (
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: `${colorClass}20`,
                              borderColor: `${colorClass}50`,
                              color: colorClass,
                            }}
                          >
                            <PiTrendUp className="w-3.5 h-3.5" />
                            Excellent
                          </div>
                        )}
                        {isMediumPerformance && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
                            <PiTrendUp className="w-3.5 h-3.5" />
                            Good
                          </div>
                        )}
                        {!isHighPerformance && !isMediumPerformance && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold border border-red-500/40">
                            <PiTrendDown className="w-3.5 h-3.5" />
                            Needs Improvement
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <PiCheckCircle className="w-4 h-4" />
                          {item.successCount} / {item.total} successful
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Success Rate
                    </div>
                    <div 
                      className="text-5xl font-bold"
                      style={{ color: colorClass }}
                    >
                      {item.average.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="relative h-5 w-full rounded-full bg-slate-950/50 overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(0, Math.min(item.average, 100))}%`,
                        background: `linear-gradient(90deg, ${colorClass} 0%, ${colorClass}DD 100%)`,
                        boxShadow: `0 0 20px ${colorClass}60`,
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      
                      {/* Progress indicator dot */}
                      {item.average > 5 && (
                        <div
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: '#FFFFFF',
                            boxShadow: `0 0 10px ${colorClass}`,
                          }}
                        />
                      )}
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
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Avg Solution Time
                      </div>
                      <PiClock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {item.avgSolutionTime.toFixed(2)}s
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Total Requests
                      </div>
                      <PiTarget className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {item.total}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Success Count
                      </div>
                      <PiCheckCircle 
                        className="w-4 h-4"
                        style={{ color: colorClass }}
                      />
                    </div>
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: colorClass }}
                    >
                      {item.successCount}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 shadow-xl text-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
            <PiChartBar className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            No Performance Data Available
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Performance metrics will appear here once the agent run completes its tasks.
          </p>
        </div>
      )}
    </div>
  );
}
