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
import { PiTargetDuotone, PiGlobeDuotone } from "react-icons/pi";

const DONUT_COLORS = {
  success: "#22C55E",
  failed: "#EF4444",
};

export interface AgentRunSummaryDynamicProps {
  className?: string;
  selectedWebsite?: string | null;
}

export default function AgentRunSummaryDynamic({
  className,
}: AgentRunSummaryDynamicProps) {
  const { id } = useParams();
  const { summary, isLoading, error } = useAgentRunSummary(id as string);

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-muted/40 bg-white/70 p-6 shadow-sm ${className ?? ""}`}>
        <Placeholder height="1.5rem" width="6rem" className="mb-4" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <div className="text-sm font-medium">Loading run summary...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center text-red-700 ${className ?? ""}`}>
        Failed to load run summary. Please try again later.
      </div>
    );
  }

  const totalTasks = summary.totalTasks;
  const successfulTasks = summary.successfulTasks;
  const failedTasks = summary.failedTasks;
  const successRate = totalTasks ? (successfulTasks / totalTasks) * 100 : 0;
  const failureRate = totalTasks ? (failedTasks / totalTasks) * 100 : 0;
  const averageScore = summary.overallScore;
  const avgResponseTime = totalTasks ? summary.duration / totalTasks : 0;
  const topWebsite = summary.topPerformingWebsite;
  const topUseCase = summary.topPerformingUseCase;

  const chartData = [
    { label: "Successful", value: successfulTasks, fill: DONUT_COLORS.success },
    { label: "Failed", value: failedTasks, fill: DONUT_COLORS.failed },
  ];

  const insights = [
    {
      label: "Total Tasks",
      primary: totalTasks,
      secondary: `${successfulTasks} successful (${successRate.toFixed(1)}%) · ${failedTasks} failed (${failureRate.toFixed(1)}%)`,
    },
    {
      label: "Average Response Time",
      primary: `${avgResponseTime.toFixed(1)}s`,
      secondary: "Per completed task",
    },
    {
      label: "Top Performing Website",
      primary: topWebsite?.website ?? "N/A",
      secondary: topWebsite
        ? `${Math.round(topWebsite.score)}% over ${topWebsite.tasks} tasks`
        : "No website data available",
      icon: <PiGlobeDuotone />,
    },
    {
      label: "Top Performing Use Case",
      primary: topUseCase?.useCase
        ? formatUseCaseName(topUseCase.useCase)
        : "N/A",
      secondary: topUseCase
        ? `${Math.round(topUseCase.score)}% over ${topUseCase.tasks} tasks`
        : "No use case data available",
      icon: <PiTargetDuotone />,
    },
  ];

  return (
    <div className={`rounded-2xl border border-muted/40 bg-white/80 p-6 shadow-sm backdrop-blur ${className ?? ""}`}>
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Run Summary</h2>
        <p className="text-sm text-gray-500">
          Overview of evaluation outcomes and standout performers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                cornerRadius={12}
                stroke="#fff"
                strokeWidth={2}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      averageScore={averageScore.toFixed(0)}
                      avgResponse={avgResponseTime.toFixed(1)}
                      viewBox={props.viewBox}
                    />
                  )}
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {insights.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-muted/30 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                {item.icon ?? (
                  <span className="text-sm font-semibold text-gray-500">
                    {item.label.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.primary}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-gray-500">
                  {item.secondary}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatUseCaseName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface CenterLabelProps {
  averageScore: string;
  avgResponse: string;
  viewBox: any;
}

function CenterLabel({ averageScore, avgResponse, viewBox }: CenterLabelProps) {
  const { cx, cy } = viewBox;

  return (
    <>
      <text
        x={cx}
        y={cy - 12}
        fill="#0F172A"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="32" fontWeight="700">
          {averageScore}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 8}
        fill="#64748B"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="13" fontWeight="600">
          Avg score
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 26}
        fill="#64748B"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="12" fontWeight="500">
          {avgResponse}s avg response
        </tspan>
      </text>
    </>
  );
}
