"use client";

import cn from "@core/utils/class-names";
import { Select } from "rizzui";
import type { AgentRunDetailData } from "./agent-run-types";

const PROGRESS_COLORS = [
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#84CC16", // lime-500
  "#22C55E", // green-500
  "#10B981", // emerald-500
  "#14B8A6", // teal-500
  "#06B6D4", // cyan-500
  "#0EA5E9", // sky-500
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#A855F7", // purple-500
  "#D946EF", // fuchsia-500
  "#EC4899", // pink-500
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
        "relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/15 via-sky-400/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/10 via-emerald-500/5 to-transparent blur-[120px]" />

      {/* Header */}
      <div className="relative mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Success Rate</h2>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            All vs selected filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={periodOptions}
            value={periodOptions.find(
              (opt) => opt.value === (period ?? "__all__")
            )}
            onChange={(option: { label: string; value: string }) =>
              setPeriod(option.value === "__all__" ? null : option.value)
            }
            className="w-[80px] text-xs"
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
            className="w-[150px] text-xs"
          />
        </div>
      </div>

      {hasWebsites ? (
        <div className="relative space-y-6 text-slate-200">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            return (
              <div key={`${item.website}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    {item.website}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {item.average.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-slate-800/80">
                  <div
                    className="flex h-3.5 items-center justify-end rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(item.average, 100))}%`,
                      backgroundColor: colorClass,
                    }}
                  >
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white/80" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative text-sm text-slate-400">
          Performance metrics are not available for this run yet.
        </div>
      )}
    </div>
  );
}
