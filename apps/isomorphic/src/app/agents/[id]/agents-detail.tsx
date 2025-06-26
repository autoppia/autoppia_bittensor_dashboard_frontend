"use client";

import { useParams } from "next/navigation";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
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

export default function DetailsChart({
  className,
  selectedWebsite,
  setSelectedWebsite,
}: {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
}) {
  const { id } = useParams();
  const agentDetailsData = getAgentExtendedData(id as string);
  const isTab = useMedia("(max-width: 768px)", false);
  const barSize = isTab ? 16 : 20;

  const websiteOptions = [
    { value: "__all__", label: "See All" },
    ...agentDetailsData.websites.map((web) => ({
      value: web.name,
      label: web.name,
    })),
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
          colorIndex: idx, // Assign index for color mapping
        }));

  return (
    <WidgetCard
      title="Success Rate"
      className={cn("min-h-[28rem]", className)}
      titleClassName="font-normal text-sm sm:text-sm text-gray-500 mb-2.5 font-inter"
      action={
        <div className="flex items-center gap-2">
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
            placeholder="Select Website"
            className="w-[200px]"
          />
          <Legend className="my-4 flex @md:justify-end @2xl:hidden" />
        </div>
      }
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="h-[450px] w-full pt-6">
          <ResponsiveContainer width="100%" height="100%" minWidth={700}>
            <ComposedChart
              data={chartData}
              margin={{ left: -6, bottom: chartData.length === 12 ? 100 : 50 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis
                dataKey="website"
                axisLine={false}
                tickLine={false}
                interval={0}
                height={chartData.length === 12 ? 100 : 50}
                tick={(props) => {
                  const { x, y, payload } = props;
                  if (chartData.length === 12) {
                    return (
                      <g transform={`translate(${x},${y + 20})`}>
                        <text
                          x={0}
                          y={0}
                          dy={10}
                          textAnchor="end"
                          fill="#666"
                          transform="rotate(-70)"
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }
                  return (
                    <text x={x} y={y} dy={10} textAnchor="middle" fill="#666">
                      {payload.value}
                    </text>
                  );
                }}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
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
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 pb-2">
                      <Text className="label mb-0.5 block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
                        {data.website || "Unknown"}
                      </Text>
                      <div className="px-6 py-1 text-xs">
                        <div className="chart-tooltip-item flex items-center p-1">
                          <span
                            className="me-1.5 h-2 w-2 rounded-full inline-block"
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
                        {selectedWebsite && selectedWebsite !== "__all__" && (
                          <>
                            <div className="chart-tooltip-item flex items-center p-1">
                              <span
                                className="me-1.5 h-2 w-2 rounded-full inline-block"
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
                                className="me-1.5 h-2 w-2 rounded-full inline-block"
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
                                className="me-1.5 h-2 w-2 rounded-full inline-block"
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
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="average" barSize={barSize} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={BAR_COLORS[entry.colorIndex % BAR_COLORS.length]}
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

function Legend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 text-xs @3xl:text-sm lg:gap-4",
        className
      )}
    ></div>
  );
}
