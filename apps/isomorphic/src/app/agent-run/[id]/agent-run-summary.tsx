"use client";

import WidgetCard from "@core/components/cards/widget-card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import { useParams } from "next/navigation";
import { getAgentExtendedData, getAgentSummaryData } from "@/data/query";
import { agentsData } from "@/data/agents-data";

// Define interfaces for data structures
interface UseCase {
  id: number;
  name: string;
}

interface Result {
  useCaseId: number;
  successRate: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
}

interface Website {
  name: string;
  useCases: UseCase[];
  results: Result[];
  overall: {
    successRate: number;
    total: number;
    successCount: number;
    avgSolutionTime: number;
  };
}

interface AgentExtendedData {
  websites: Website[];
}

interface AgentSummaryData {
  usecases: number[];
  total: number;
}

interface Agent {
  id: string;
  name: string;
  successRate?: number;
}

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

export default function AgentRunSummary({
  className,
  selectedWebsite,
}: AgentRunSummaryProps) {
  const { id } = useParams();
  const agentData: AgentExtendedData = getAgentExtendedData("openai-cua");
  const { usecases, total }: AgentSummaryData = getAgentSummaryData(
    "openai-cua"
  ) || { usecases: [], total: 0 };
  const agent: Agent | undefined = agentsData.find(
    (agent) => agent.id === "openai-cua"
  );

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
        : agent?.successRate || total || 0;
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
          selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)?.name ||
            `Use Case ${result.useCaseId}`
        ),
        value: result.successRate,
        total: result.total,
        successCount: result.successCount,
        avgSolutionTime: result.avgSolutionTime,
      }));
    }
  } else {
    displayData = agentData.websites.map((web) => ({
      label: web.name,
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
              (uc) => uc.id === result.useCaseId
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
        label: web.name,
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
      className={`bg-gray-50 border border-muted hover:border-emerald-500 rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold">Summary</h2>
      </div>

      {/* Content */}
      <div>
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

        <div className="flex flex-col">
          {displayData.map((item, idx) => (
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
          ))}
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
