"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import type {
  AgentRunDetailData,
  AgentRunSummaryChartData,
} from "./agent-run-types";

const HIGHLIGHT_COLOR = "#F5DEB3";

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
    successRate =
      websiteAverages.length > 0
        ? websiteAverages.reduce((sum, w) => sum + w.overall.successRate, 0) /
          websiteAverages.length
        : fallbackSummary.total || 0;
    totalRequests = websiteAverages.reduce(
      (sum, w) => sum + w.overall.total,
      0
    );
    totalSuccesses = websiteAverages.reduce(
      (sum, w) => sum + w.overall.successCount,
      0
    );
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

  const donutData = selectedWebsite
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

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white ${className ?? ""}`}
    >
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg border border-slate-700/40 bg-slate-700/30 p-2 shadow-lg">
            <svg
              className="w-5 h-5 text-slate-200"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Summary</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">
          Performance Breakdown
        </p>
      </div>

      {/* Content */}
      <div className="relative text-slate-300">
        <div className="h-[260px] w-full py-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={90}
                outerRadius={105}
                paddingAngle={4}
                cornerRadius={25}
                dataKey="value"
                stroke="#1e293b"
                strokeWidth={3}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      value={successRate.toFixed(0)}
                      totalRequests={totalRequests.toFixed(0)}
                      totalSuccesses={totalSuccesses.toFixed(0)}
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
          <div className="flex flex-col divide-y divide-slate-700/40 rounded-xl border border-slate-700/40 bg-slate-800/50 overflow-hidden">
            {displayData.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 py-4 px-4 transition-colors hover:bg-slate-700/30"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="h-3.5 w-3.5 rounded-full flex-shrink-0 shadow-lg"
                    style={{
                      backgroundColor:
                        PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
                      boxShadow: `0 0 12px ${PROGRESS_COLORS[idx % PROGRESS_COLORS.length]}40`,
                    }}
                  />
                  <span className="text-sm font-semibold text-slate-100 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-slate-100 mb-0.5">
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {item.total} req • {item.successCount} ok
                    {selectedWebsite && (
                      <span> • {item.avgSolutionTime.toFixed(2)}s</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center py-8 px-4 rounded-xl border border-slate-700/40 bg-slate-800/50">
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
        y={cy - 22}
        fill={HIGHLIGHT_COLOR}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 4px 16px rgba(245, 222, 179, 0.4)",
        }}
      >
        <tspan fontSize="40" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 12}
        fill="#cbd5e1"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="13" fontWeight="600">
          Requests · {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 32}
        fill="#cbd5e1"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="13" fontWeight="600">
          Successes · {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
