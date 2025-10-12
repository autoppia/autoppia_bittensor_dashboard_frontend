"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import { useParams } from "next/navigation";
import { useAgentRunSummary } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";

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

export interface AgentRunSummaryDynamicProps {
  className?: string;
  selectedWebsite?: string | null;
}

interface DisplayDataItem {
  label: string;
  value: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
}

// Utility function to format use case names
function formatUseCaseName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AgentRunSummaryDynamic({
  className,
  selectedWebsite,
}: AgentRunSummaryDynamicProps) {
  const { id } = useParams();
  const { summary, isLoading, error } = useAgentRunSummary(id as string);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className}`}>
        <div className="mb-2">
          <Placeholder height="1.5rem" width="6rem" />
        </div>
        <div className="h-[240px] w-full @sm:py-3 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600 text-sm">Loading summary...</div>
          </div>
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
              <div className="flex items-center gap-2">
                <Placeholder variant="circular" width={12} height={12} />
                <Placeholder height="1rem" width="4rem" />
              </div>
              <div className="text-right">
                <Placeholder height="1rem" width="3rem" className="mb-1" />
                <Placeholder height="0.75rem" width="5rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !summary) {
    return (
      <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className}`}>
        <div className="mb-2">
          <h2 className="text-xl font-semibold">Summary</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Summary Data
          </div>
          <div className="text-red-500 text-sm mb-4">
            {error || "Unable to fetch summary information"}
          </div>
          <div className="text-gray-500 text-xs">
            Please try refreshing the page or contact support if the issue persists.
          </div>
        </div>
      </div>
    );
  }

  let successRate: number;
  let totalRequests: number;
  let totalSuccesses: number;
  let avgSolutionTime: number;

  // Use summary data directly since it doesn't have websites breakdown
  successRate = summary.overallScore;
  totalRequests = summary.totalTasks;
  totalSuccesses = summary.successfulTasks;
  avgSolutionTime = summary.duration / summary.totalTasks; // Average duration per task

  // Create display data from summary information
  const displayData: DisplayDataItem[] = [
    {
      label: "Overall Performance",
      value: summary.overallScore,
      total: summary.totalTasks,
      successCount: summary.successfulTasks,
      avgSolutionTime: avgSolutionTime,
    },
    {
      label: "Top Website",
      value: summary.topPerformingWebsite?.score || 0,
      total: summary.topPerformingWebsite?.tasks || 0,
      successCount: Math.round((summary.topPerformingWebsite?.score || 0) * (summary.topPerformingWebsite?.tasks || 0) / 100),
      avgSolutionTime: avgSolutionTime,
    },
    {
      label: "Top Use Case",
      value: summary.topPerformingUseCase?.score || 0,
      total: summary.topPerformingUseCase?.tasks || 0,
      successCount: Math.round((summary.topPerformingUseCase?.score || 0) * (summary.topPerformingUseCase?.tasks || 0) / 100),
      avgSolutionTime: avgSolutionTime,
    },
  ];

  // Create donut data from display data
  const donutData = displayData.map((item, idx) => ({
    label: item.label,
    value: item.value * item.total, // Scale average by total for strength
    average: item.value,
    total: item.total,
    successCount: item.successCount,
    avgSolutionTime: item.avgSolutionTime,
    fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
    stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
  }));

  return (
    <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold">Summary</h2>
      </div>

      {/* Content */}
      <div>
        <div className="h-[240px] w-full @sm:py-3">
          {donutData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No Data Available</div>
                <div className="text-sm">
                  No summary data found for the selected criteria.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {displayData.length > 0 ? (
            displayData.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
                    }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.total} requests, {item.successCount} successes
                    {selectedWebsite && (
                      <span>, {item.avgSolutionTime.toFixed(2)}s avg</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <div className="text-sm">No data to display</div>
            </div>
          )}
        </div>
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
        fill="#F3F4F6"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#9CA3AF"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Requests: {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#9CA3AF"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Successes: {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
