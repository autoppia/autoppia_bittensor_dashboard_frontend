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
  "#FF7E5F", // bright coral (AutoZone)
  "#FDB36A", // apricot (Books)
  "#FFD166", // golden sand (Cinema)
  "#F9F871", // lemon
  "#C4F0C2", // soft mint
  "#A0CED9", // light teal
  "#84A9C0", // dusty blue
  "#9381FF", // soft purple
  "#B25D91", // plum
  "#F67280", // pinkish red
  "#C06C84", // rose
  "#6C5B7B", // muted violet
];

// Utility function to format use case names
function formatUseCaseName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DetailsChartProps {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  hoveredUseCase: string | null;
  setHoveredUseCase: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
}

export default function DetailsChart({
  className,
  selectedWebsite,
  setSelectedWebsite,
  hoveredUseCase,
  setHoveredUseCase,
  period,
  setPeriod
}: DetailsChartProps) {
  const { id } = useParams();
  const agentDetailsData: AgentExtendedData = getAgentExtendedData(
    id as string
  );
  const isTab = useMedia("(max-width: 768px)", false);

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web) => ({
      value: web.name,
      label: web.name,
    })),
  ];

  const periodOptions = [
    { value: "24h", label: "24H"},
    { value: "7d", label: "7D"},
    { value: "__all__", label: "ALL"},
  ]

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
    <WidgetCard
      title="Success Rate"
      action={
        <div className="flex">
          <div className="flex items-center gap-2 mr-2">
            <Select
              options={periodOptions}
              value={periodOptions.find(
                (opt) => opt.value === (period ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setPeriod(
                  option.value === "__all__" ? null : option.value
                )
              }
              className="text-gray-700/90 w-[80px]"
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
              className="text-gray-700/90 w-[150px]"
            />
          </div>
        </div>
      }
      className={className}
    >
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
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <CartesianGrid
                horizontal={false}
                strokeOpacity={0.435}
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
                  return <CustomYAxisTick payload={pl} postfix="%" {...rest} />;
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
                      fill="#666"
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
                    <div
                      className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 pb-2"
                      onMouseEnter={() => setHoveredUseCase(data.website)}
                      onMouseLeave={() => setHoveredUseCase(null)}
                    >
                      <Text className="label mb-0.5 block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
                        {data.website || "Unknown"}
                      </Text>
                      <div className="px-6 py-1 text-xs">
                        <div className="chart-tooltip-item flex items-center p-1">
                          <span
                            className="me-1.5 h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#FF7E5F" }}
                          />
                          <Text>
                            <Text as="span" className="capitalize">
                              Average:
                            </Text>{" "}
                            <Text
                              as="span"
                              className="font-medium text-gray-900 dark:text-gray-700"
                            >
                              {data.average ? data.average.toFixed(1) : "0"}%
                            </Text>
                          </Text>
                        </div>
                        <>
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full"
                              style={{ backgroundColor: "#F9F871" }}
                            />
                            <Text className="text-gray-500">
                              Requests:{" "}
                              <span className="text-gray-900 dark:text-gray-700 font-medium">
                                {data.total ?? 0}
                              </span>
                            </Text>
                          </div>
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full"
                              style={{ backgroundColor: "#FFD166" }}
                            />
                            <Text className="text-gray-500">
                              Successes:{" "}
                              <span className="text-gray-900 dark:text-gray-700 font-medium">
                                {data.successCount ?? 0}
                              </span>
                            </Text>
                          </div>
                          <div className="chart-tooltip-item flex items-center p-1">
                            <span
                              className="me-1.5 h-2 w-2 rounded-full"
                              style={{ backgroundColor: "#FDB36A" }}
                            />
                            <Text className="text-gray-500">
                              Avg Solution Time:{" "}
                              <span className="text-gray-900 dark:text-gray-700 font-medium">
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
                  );
                }}
              />
              <Bar layout="horizontal" dataKey="average" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={BAR_COLORS[entry.colorIndex % BAR_COLORS.length]}
                    height={30}
                    style={{
                      transform:
                        entry.website === hoveredUseCase
                          ? "scaleX(1.05)"
                          : "scaleX(1)", // Upward stretch effect
                      transformOrigin: "left",
                      transition: "transform 0.2s ease",
                    }}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
