"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { 
  PiChartPie,
  PiCheckCircle,
  PiTarget
} from "react-icons/pi";
import type {
  AgentRunDetailData,
  AgentRunSummaryChartData,
} from "./agent-run-types";

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

        return displayData.map((item, idx) => {
          const matchingDonutData = sortedResults.find(
            (data) => data.label === item.label
          );
          return {
            label: item.label,
            value: matchingDonutData
              ? matchingDonutData.average * matchingDonutData.total
              : item.value * item.total,
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
        value: web.overall.successRate * web.overall.total,
        average: web.overall.successRate,
        total: web.overall.total,
        successCount: web.overall.successCount,
        avgSolutionTime: web.overall.avgSolutionTime,
        fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
        stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
      }));

  return (
    <div className={`bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl ${className ?? ""}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <PiChartPie className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Summary</h2>
            <p className="text-sm text-slate-400">Performance breakdown overview</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Chart */}
        <div className="h-[280px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>              
              <Pie
                data={donutData}
                innerRadius={90}
                outerRadius={110}
                paddingAngle={4}
                cornerRadius={8}
                dataKey="value"
                stroke="rgba(15, 23, 42, 0.5)"
                strokeWidth={2}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      value={successRate.toFixed(1)}
                      totalRequests={totalRequests.toString()}
                      totalSuccesses={totalSuccesses.toString()}
                      viewBox={props.viewBox}
                    />
                  )}
                />
                {donutData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.fill}
                    stroke={entry.stroke}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {hasWebsites ? (
          <div className="space-y-2">
            {displayData.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
                      boxShadow: `0 0 12px ${PROGRESS_COLORS[idx % PROGRESS_COLORS.length]}60`,
                    }}
                  />
                  <span className="text-sm font-semibold text-white truncate">
                    {item.label}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div 
                    className="text-lg font-bold mb-1"
                    style={{ color: PROGRESS_COLORS[idx % PROGRESS_COLORS.length] }}
                  >
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <PiTarget className="w-3 h-3" />
                      {item.total}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <PiCheckCircle className="w-3 h-3" />
                      {item.successCount}
                    </span>
                    {selectedWebsite && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span>{item.avgSolutionTime.toFixed(2)}s</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
              <PiChartPie className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400">
              Summary metrics will appear here once data is available.
            </p>
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
        y={cy - 15}
        fill="#10B981"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          filter: "drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))",
        }}
      >
        <tspan fontSize="42" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 15}
        fill="#CBD5E1"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="13" fontWeight="600">
          {totalRequests} requests
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 33}
        fill="#94A3B8"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="12" fontWeight="500">
          {totalSuccesses} successful
        </tspan>
      </text>
    </>
  );
}
