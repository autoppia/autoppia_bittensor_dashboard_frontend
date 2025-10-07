"use client";

import { Flex, Text } from "rizzui";
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

const BAR_COLORS = [
  "#00FFFF", // cyan
  "#9333EA", // purple
  "#10B981", // emerald
  "#3B82F6", // blue
  "#FBBF24", // yellow
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // sky
  "#84CC16", // lime
  "#F97316", // orange
  "#EC4899", // pink
  "#14B8A6", // teal
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
            fill: BAR_COLORS[idx % BAR_COLORS.length],
            stroke: BAR_COLORS[idx % BAR_COLORS.length],
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
        fill: BAR_COLORS[idx % BAR_COLORS.length],
        stroke: BAR_COLORS[idx % BAR_COLORS.length],
      }));

  return (
    <div
      className={`group relative bg-black border border-purple-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/50 hover:border-purple-400 transition-all duration-500 ${className}`}
    >
      {/* Dark Cyberpunk Background with Subtle Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.05),transparent_70%)]"></div>

      {/* Header */}
      <div className="relative p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-purple-400 shadow-2xl shadow-purple-500/80">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-sm"></div>
            </div>
            {/* Enhanced Pulsing Ring Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse opacity-100"></div>
            <div className="absolute inset-0 rounded-full border border-purple-300 animate-ping opacity-30"></div>
          </div>
          <h2 className="text-xl font-bold text-purple-400 drop-shadow-[0_0_15px_rgba(147,51,234,1)] font-mono">
            SUMMARY
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 pt-0">
        <div className="h-[280px] w-full @sm:py-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="relative bg-black border border-purple-400/30 rounded-lg shadow-2xl shadow-purple-500/50 pb-2 overflow-hidden">
                      {/* Cyberpunk Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.05),transparent_70%)]"></div>

                      <div className="relative">
                        <Text className="label mb-0.5 block bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-1 px-2 text-center font-mono text-xs font-semibold capitalize text-purple-300 py-2 border-b border-purple-400/20">
                          {data.label || "Unknown"}
                        </Text>
                        <div className="px-6 py-1 text-xs">
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full border border-purple-400/50"
                              style={{
                                backgroundColor: "#9333EA",
                                boxShadow: "0 0 8px rgba(147,51,234,0.8)",
                              }}
                            />
                            <Text className="text-purple-300 font-mono">
                              <Text as="span" className="capitalize">
                                Average:
                              </Text>{" "}
                              <Text
                                as="span"
                                className="font-medium text-purple-200"
                              >
                                {data.average ? data.average.toFixed(1) : "0"}%
                              </Text>
                            </Text>
                          </div>
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full border border-emerald-400/50"
                              style={{
                                backgroundColor: "#10B981",
                                boxShadow: "0 0 8px rgba(16,185,129,0.8)",
                              }}
                            />
                            <Text className="text-emerald-300 font-mono">
                              Requests:{" "}
                              <span className="text-emerald-200 font-medium">
                                {data.total ?? 0}
                              </span>
                            </Text>
                          </div>
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full border border-yellow-400/50"
                              style={{
                                backgroundColor: "#FBBF24",
                                boxShadow: "0 0 8px rgba(251,191,36,0.8)",
                              }}
                            />
                            <Text className="text-yellow-300 font-mono">
                              Successes:{" "}
                              <span className="text-yellow-200 font-medium">
                                {data.successCount ?? 0}
                              </span>
                            </Text>
                          </div>
                          {selectedWebsite && selectedWebsite !== "__all__" && (
                            <div className="chart-tooltip-item flex items-center p-1">
                              <span
                                className="me-1.5 h-2 w-2 rounded-full border border-orange-400/50"
                                style={{
                                  backgroundColor: "#F97316",
                                  boxShadow: "0 0 8px rgba(249,115,22,0.8)",
                                }}
                              />
                              <Text className="text-orange-300 font-mono">
                                Avg Solution Time:{" "}
                                <span className="text-orange-200 font-medium">
                                  {data.avgSolutionTime
                                    ? data.avgSolutionTime.toFixed(2)
                                    : "0"}
                                  s
                                </span>
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={donutData}
                innerRadius={100}
                outerRadius={120}
                paddingAngle={5}
                cornerRadius={40}
                dataKey="value"
                stroke="rgba(0,0,0,0)"
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
                    style={{
                      filter: `drop-shadow(0 0 8px ${entry.fill}80)`,
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          {displayData.map((item, idx) => (
            <Flex
              key={item.label}
              direction="col"
              align="start"
              className="mb-2 gap-1 border-b border-purple-400/20 pb-2 last:mb-0 last:border-0 last:pb-0"
            >
              <Flex align="center" className="w-full">
                <Flex align="center" className="gap-2">
                  <span
                    className="me-2 size-2 rounded-full border border-purple-400/50"
                    style={{
                      backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                      boxShadow: `0 0 8px ${BAR_COLORS[idx % BAR_COLORS.length]}80`,
                    }}
                  />
                  <Text
                    as="span"
                    className="font-mono text-sm font-medium text-purple-300"
                  >
                    {item.label}
                  </Text>
                </Flex>
                <Text
                  as="span"
                  className="font-mono text-sm font-medium text-purple-400"
                >
                  {item.value.toFixed(1)}%
                </Text>
              </Flex>
              <Text as="span" className="text-xs text-purple-300 font-mono">
                Requests: {item.total}, Successes: {item.successCount}
                {selectedWebsite && (
                  <>, Avg Time: {item.avgSolutionTime.toFixed(2)}s</>
                )}
              </Text>
            </Flex>
          ))}
        </div>
      </div>

      {/* Intense Cyberpunk Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,1)]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,1)]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,1)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,1)]"></div>
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
        fill="#9333EA"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          filter: "drop-shadow(0 0 15px rgba(147,51,234,1))",
          fontFamily: "monospace",
        }}
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#10B981"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          filter: "drop-shadow(0 0 8px rgba(16,185,129,0.8))",
          fontFamily: "monospace",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Requests: {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#FBBF24"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          filter: "drop-shadow(0 0 8px rgba(251,191,36,0.8))",
          fontFamily: "monospace",
        }}
      >
        <tspan fontSize="14" fontWeight="600">
          Successes: {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
