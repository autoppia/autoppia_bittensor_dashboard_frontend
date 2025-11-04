"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import type {
  AgentRunDetailData,
  AgentRunSummaryChartData,
} from "./agent-run-types";

const HIGHLIGHT_COLOR = "#FDF5E6";

// Rainbow colors starting with red using hex values
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

export interface AgentRunSummaryProps {
  className?: string;
  selectedWebsite?: string | null;
  data?: AgentRunDetailData | null;
  summaryData?: AgentRunSummaryChartData | null;
  summaryTotals?: {
    totalRequests: number;
    totalSuccesses: number;
    successRate: number; // 0-100
  } | null;
}

interface DisplayDataItem {
  label: string;
  value: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
}

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

export default function AgentRunSummary({
  className,
  selectedWebsite,
  data,
  summaryData,
  summaryTotals,
}: AgentRunSummaryProps) {
  const agentData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentData.websites.length > 0;

  const fallbackSummary: AgentRunSummaryChartData = summaryData ?? {
    usecases: [],
    total: 0,
  };

  let successRate: number;
  let totalRequests: number;
  let totalSuccesses: number;
  let avgSolutionTime: number;

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      successRate = selectedWeb.overall.successRate;
      totalRequests = selectedWeb.overall.total;
      totalSuccesses = selectedWeb.overall.successCount;
      avgSolutionTime = selectedWeb.overall.avgSolutionTime;
    } else {
      successRate = 0;
      totalRequests = 0;
      totalSuccesses = 0;
      avgSolutionTime = 0;
    }
  } else {
    const websiteAverages = agentData.websites;
    if (websiteAverages.length > 0) {
      successRate =
        websiteAverages.reduce((sum, w) => sum + w.overall.successRate, 0) /
        websiteAverages.length;
      totalRequests = websiteAverages.reduce(
        (sum, w) => sum + w.overall.total,
        0
      );
      totalSuccesses = websiteAverages.reduce(
        (sum, w) => sum + w.overall.successCount,
        0
      );
    } else {
      // Fallback to summary totals so the donut always shows something
      successRate = summaryTotals?.successRate ?? fallbackSummary.total ?? 0;
      totalRequests = summaryTotals?.totalRequests ?? 0;
      totalSuccesses = summaryTotals?.totalSuccesses ?? 0;
    }
    avgSolutionTime =
      websiteAverages.length > 0
        ? websiteAverages.reduce(
            (sum, w) => sum + w.overall.avgSolutionTime,
            0
          ) / websiteAverages.length
        : 0;
  }

  let displayData: DisplayDataItem[] = [];

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      displayData = selectedWeb.results.map((result, idx) => ({
        label: formatUseCaseName(
          selectedWeb.useCases.find(
            (uc) => String(uc.id) === String(result.useCaseId)
          )?.name || `Use Case ${result.useCaseId}`
        ),
        value: result.successRate,
        total: result.total,
        successCount: result.successCount,
        avgSolutionTime: result.avgSolutionTime,
      }));
    }
  } else {
    displayData = agentData.websites.map((web, idx) => ({
      label: web.name ?? `Website ${idx + 1}`,
      value: web.overall.successRate,
      total: web.overall.total,
      successCount: web.overall.successCount,
      avgSolutionTime: web.overall.avgSolutionTime,
    }));
  }

  let donutData = selectedWebsite
    ? (() => {
        const selectedWeb = agentData.websites.find(
          (web) => web.name === selectedWebsite
        );
        if (!selectedWeb) return [];

        const sortedResults = [...selectedWeb.results]
          .map((result) => {
            const useCase = selectedWeb.useCases.find(
              (uc) => String(uc.id) === String(result.useCaseId)
            );
            const label = formatUseCaseName(
              useCase?.name || `Use Case ${result.useCaseId}`
            );
            return {
              label,
              value: result.total,
              average: result.successRate,
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
            };
          })
          .sort((a, b) => b.average - a.average);

        // Use average (success rate) scaled by total as value for strength
        return displayData.map((item, idx) => {
          const matchingDonutData = sortedResults.find(
            (data) => data.label === item.label
          );
          return {
            label: item.label,
            value: matchingDonutData
              ? matchingDonutData.average * matchingDonutData.total
              : item.value * item.total, // Scale average by total for strength
            average: matchingDonutData ? matchingDonutData.average : item.value,
            total: matchingDonutData ? matchingDonutData.total : item.total,
            successCount: matchingDonutData
              ? matchingDonutData.successCount
              : item.successCount,
            avgSolutionTime: matchingDonutData
              ? matchingDonutData.avgSolutionTime
              : item.avgSolutionTime,
            fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
            stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
          };
        });
      })()
    : agentData.websites.map((web, idx) => ({
        label: web.name ?? `Website ${idx + 1}`,
        value: web.overall.successRate * web.overall.total, // Use success rate scaled by total
        average: web.overall.successRate,
        total: web.overall.total,
        successCount: web.overall.successCount,
        avgSolutionTime: web.overall.avgSolutionTime,
        fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
        stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
      }));

  // If no data segments exist, show a neutral full ring so the donut is visible
  if (!donutData || donutData.length === 0) {
    donutData = [
      {
        label: "All",
        value: 1,
        average:
          (summaryTotals?.successRate ?? fallbackSummary.total ?? 0) / 100,
        total: summaryTotals?.totalRequests ?? 0,
        successCount: summaryTotals?.totalSuccesses ?? 0,
        avgSolutionTime: 0,
        fill: "#64748B", // slate-500
        stroke: "#64748B",
      } as any,
    ];
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl text-white ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div
        className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(253, 245, 230, 0.18)" }}
      />
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl border border-white/15 bg-white/10 p-2 shadow-lg shadow-blue-500/25">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
            Summary
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Performance Breakdown
        </p>
      </div>

      {/* Content */}
      <div className="relative text-white/80">
        <div className="h-[240px] w-full @sm:py-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={85}
                outerRadius={100}
                paddingAngle={5}
                cornerRadius={30}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      value={successRate.toFixed(0)}
                      totalRequests={Math.round(totalRequests).toString()}
                      totalSuccesses={Math.round(totalSuccesses).toString()}
                      viewBox={props.viewBox}
                    />
                  )}
                />
                {donutData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.fill}
                    stroke={entry.stroke}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {hasWebsites ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            {displayData.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 py-3 px-2 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
                    }}
                  />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/70">
                    {Math.round(item.total)} requests •{" "}
                    {Math.round(item.successCount)} successes
                    {selectedWebsite && (
                      <span> • {item.avgSolutionTime.toFixed(2)}s avg</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/70">
            Summary metrics are not available for this run yet.
          </div>
        )}
      </div>
    </div>
  );
}

interface CenterLabelProps {
  value: string;
  totalRequests: string;
  totalSuccesses: string;
  viewBox: any;
}

function CenterLabel({
  value,
  totalRequests,
  totalSuccesses,
  viewBox,
}: CenterLabelProps) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 20}
        fill={HIGHLIGHT_COLOR}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 12px 28px rgba(253, 245, 230, 0.35)",
        }}
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Requests · {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Successes · {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
