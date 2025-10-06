"use client";

import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAgentExtendedData } from "@/data/query";
import { Select, Text } from "rizzui";

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

// Utility function to format use case names
function formatUseCaseName(name: string): string {
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
}

export default function AgentRunDetail({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
}: AgentRunDetailProps) {
  const { id } = useParams();
  const agentDetailsData: AgentExtendedData =
    getAgentExtendedData("openai-cua");
  const isTab = useMedia("(max-width: 768px)", false);

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web) => ({
      value: web.name,
      label: web.name,
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
                selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)
                  ?.name || `Use Case ${result.useCaseId}`
              ),
              average: Number(result.successRate.toFixed(3)),
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web, idx) => ({
          website: web.name,
          average: Number(web.overall.successRate.toFixed(3)),
          total: web.overall.total,
          successCount: web.overall.successCount,
          avgSolutionTime: web.overall.avgSolutionTime,
          colorIndex: idx,
        }));

  return (
    <div
      className={cn(
        "group relative bg-black border border-cyan-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500",
        className
      )}
    >
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-cyan-400 shadow-2xl shadow-cyan-500/80">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-sm"></div>
              </div>
              {/* Enhanced Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse opacity-100"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-30"></div>
            </div>
            <h2 className="text-xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,1)] font-mono">
              SUCCESS RATE
            </h2>
          </div>

          <div className="flex">
            <div className="flex items-center gap-2 mr-2">
              <Select
                options={periodOptions}
                value={periodOptions.find(
                  (opt) => opt.value === (period ?? "__all__")
                )}
                onChange={(option: { label: string; value: string }) =>
                  setPeriod(option.value === "__all__" ? null : option.value)
                }
                className="text-cyan-300 w-[80px] [&_.rizzui-select]:bg-black/50 [&_.rizzui-select]:border-emerald-400/30 [&_.rizzui-select]:text-emerald-300 [&_.rizzui-select]:font-mono [&_.rizzui-select]:focus:border-emerald-400 [&_.rizzui-select]:focus:shadow-2xl [&_.rizzui-select]:focus:shadow-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-2 mr-5 lg:mr-0">
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
                className="text-blue-300 w-[150px] [&_.rizzui-select]:bg-black/50 [&_.rizzui-select]:border-blue-400/30 [&_.rizzui-select]:text-blue-300 [&_.rizzui-select]:font-mono [&_.rizzui-select]:focus:border-blue-400 [&_.rizzui-select]:focus:shadow-2xl [&_.rizzui-select]:focus:shadow-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto scroll-smooth">
          <div
            className="w-full pt-6"
            style={{ height: `${80 + chartData.length * 45}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                layout="vertical"
                margin={{
                  left: isTab ? 45 : 60,
                  top: 10,
                }}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-cyan-300 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="#00FFFF"
                  strokeOpacity={0.2}
                  strokeDasharray="8 10"
                />
                <XAxis
                  type="number"
                  domain={[0, 100]} // Increased domain for upward effect
                  axisLine={false}
                  tickLine={false}
                  tick={({ payload, ...rest }) => {
                    const pl = {
                      ...payload,
                      value: formatNumber(Number(payload.value)),
                    };
                    return (
                      <CustomYAxisTick payload={pl} postfix="%" {...rest} />
                    );
                  }}
                />
                <YAxis
                  dataKey="website"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const maxLength = isTab ? 9 : 12;
                    const truncatedText =
                      payload.value.length > maxLength
                        ? payload.value.slice(0, maxLength) + "..."
                        : payload.value;
                    return (
                      <text
                        x={x}
                        y={y}
                        dy={15}
                        dx={0}
                        textAnchor="end"
                        fill="#00FFFF"
                        className="font-mono"
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(0,255,255,0.8))",
                        }}
                      >
                        {truncatedText}
                      </text>
                    );
                  }}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="relative bg-black border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/50 pb-2 overflow-hidden">
                        {/* Cyberpunk Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

                        <div className="relative">
                          <Text className="label mb-0.5 block bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-1 px-2 text-center font-mono text-xs font-semibold capitalize text-cyan-300 py-2 border-b border-cyan-400/20">
                            {data.website || "Unknown"}
                          </Text>
                          <div className="px-6 py-1 text-xs">
                            <div className="chart-tooltip-item flex items-center p-1">
                              <span
                                className="me-1.5 h-2 w-2 rounded-full border border-cyan-400/50"
                                style={{
                                  backgroundColor: "#00FFFF",
                                  boxShadow: "0 0 8px rgba(0,255,255,0.8)",
                                }}
                              />
                              <Text className="text-cyan-300 font-mono">
                                <Text as="span" className="capitalize">
                                  Average:
                                </Text>{" "}
                                <Text
                                  as="span"
                                  className="font-medium text-cyan-200"
                                >
                                  {data.average ? data.average.toFixed(1) : "0"}
                                  %
                                </Text>
                              </Text>
                            </div>
                            <>
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
                            </>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  layout="horizontal"
                  dataKey="average"
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => {
                    const color =
                      BAR_COLORS[entry.colorIndex % BAR_COLORS.length];
                    return (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={color}
                        height={30}
                        style={{
                          filter: `drop-shadow(0 0 8px ${color}80)`,
                          stroke: color,
                          strokeWidth: 1,
                          strokeOpacity: 0.8,
                        }}
                      />
                    );
                  })}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cyberpunk Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
    </div>
  );
}
