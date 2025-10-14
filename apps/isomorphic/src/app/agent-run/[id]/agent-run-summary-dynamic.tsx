"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useParams } from "next/navigation";
import { useAgentRunSummary } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";

const DONUT_COLORS = ["#22C55E", "#EF4444"];

interface AgentRunSummaryDynamicProps {
  className?: string;
}

function formatPercentage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatDuration(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds <= 0) {
    return "—";
  }
  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  if (totalMinutes > 0) {
    return `${totalMinutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export default function AgentRunSummaryDynamic({ className }: AgentRunSummaryDynamicProps) {
  const { id } = useParams();
  const { summary, isLoading, error } = useAgentRunSummary(id as string);

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className ?? ""}`}>
        <div className="mb-2">
          <Placeholder height="1.5rem" width="6rem" />
        </div>
        <div className="h-[240px] w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-600 text-sm">Loading summary...</div>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Placeholder height="1rem" width="5rem" />
              <Placeholder height="1rem" width="3rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className ?? ""}`}>
        <div className="mb-2">
          <h2 className="text-xl font-semibold">Summary</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Summary Data
          </div>
          <div className="text-red-500 text-sm mb-4">
            {error || "Unable to fetch summary information."}
          </div>
          <div className="text-gray-500 text-xs">
            Please try refreshing the page or contact support if the issue persists.
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = summary.totalTasks ?? 0;
  const successfulTasks = summary.successfulTasks ?? 0;
  const failedTasks = summary.failedTasks ?? 0;
  const score = summary.overallScore ?? 0;
  const successRate =
    totalTasks > 0 ? ((successfulTasks / totalTasks) * 100) : 0;

  const donutData =
    successfulTasks + failedTasks > 0
      ? [
          { label: "Successful", value: successfulTasks, color: DONUT_COLORS[0] },
          { label: "Failed", value: failedTasks, color: DONUT_COLORS[1] },
        ]
      : [];

  const highlightItems = [
    {
      label: "Score",
      value: formatPercentage(score),
    },
    {
      label: "Success Rate",
      value: formatPercentage(successRate),
    },
    {
      label: "Total Tasks",
      value: totalTasks.toLocaleString(),
    },
    {
      label: "Duration",
      value: formatDuration(summary.duration),
    },
    {
      label: "Ranking",
      value: summary.ranking ? `#${summary.ranking}` : "—",
    },
  ];

  const extraHighlights = [
    summary.topPerformingWebsite && {
      label: "Top Website",
      primary: summary.topPerformingWebsite.website,
      secondary: `${formatPercentage(summary.topPerformingWebsite.score)} • ${summary.topPerformingWebsite.tasks.toLocaleString()} tasks`,
    },
    summary.topPerformingUseCase && {
      label: "Top Use Case",
      primary: summary.topPerformingUseCase.useCase,
      secondary: `${formatPercentage(summary.topPerformingUseCase.score)} • ${summary.topPerformingUseCase.tasks.toLocaleString()} tasks`,
    },
  ].filter(Boolean) as { label: string; primary: string; secondary: string }[];

  return (
    <div className={`bg-gray-50 border border-muted rounded-xl p-6 ${className ?? ""}`}>
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
      </div>

      <div className="h-[240px] w-full">
        {donutData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={85}
                outerRadius={100}
                dataKey="value"
                stroke="#0F172A"
                strokeWidth={2}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      successRate={successRate}
                      totalTasks={totalTasks}
                      successfulTasks={successfulTasks}
                      viewBox={props.viewBox}
                    />
                  )}
                />
                {donutData.map((entry, idx) => (
                  <Cell key={entry.label} fill={entry.color} stroke={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 text-sm">
              No task results are available for this run yet.
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {highlightItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {item.label}
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {extraHighlights.length > 0 && (
          <div className="space-y-3">
            {extraHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              >
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {item.label}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {item.primary}
                </div>
                <div className="text-xs text-gray-500">{item.secondary}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CenterLabelProps {
  successRate: number;
  totalTasks: number;
  successfulTasks: number;
  viewBox: any;
}

function CenterLabel({ successRate, totalTasks, successfulTasks, viewBox }: CenterLabelProps) {
  const { cx, cy } = viewBox;

  return (
    <>
      <text
        x={cx}
        y={cy - 8}
        fill="#0F172A"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="28" fontWeight="700">
          {successRate.toFixed(1)}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 16}
        fill="#64748B"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="12" fontWeight="600">
          {successfulTasks}/{totalTasks} successful
        </tspan>
      </text>
    </>
  );
}
