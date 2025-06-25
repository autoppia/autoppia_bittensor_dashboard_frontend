"use client";

import { useParams } from "next/navigation";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
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
import { Select } from "rizzui";

const BAR_COLOR = "#FF7E5F";
const BAR_COLORS = [
  "#FF7E5F", // bright coral
  "#FDB36A", // apricot
  "#FFD166", // golden sand
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
              website:
                selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)
                  ?.name || `Use Case ${result.useCaseId}`,
              average: Number(result.score.toPrecision(3)),
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web) => {
          const allScores = web.results.map((r) => r.score);
          return {
            website: web.name,
            average: Number(
              (
                allScores.reduce((sum, s) => sum + s, 0) / allScores.length || 0
              ).toPrecision(3)
            ),
          };
        });

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
              margin={{ left: -6, bottom: chartData.length === 12 ? 100 : 50 }} // Adjust bottom margin based on data length
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
                interval={0} // Show all ticks
                height={chartData.length === 12 ? 100 : 50} // Adjust height for vertical labels
                tick={(props) => {
                  const { x, y, payload } = props;
                  if (chartData.length === 12) {
                    // Vertical labels for 12 use cases
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
                  // Horizontal labels for 3 websites
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
                content={<CustomTooltip postfix="%" formattedNumber={true} />}
              />
              <Bar dataKey="average" barSize={barSize} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={
                      selectedWebsite && selectedWebsite !== "__all__"
                        ? BAR_COLORS[entry.colorIndex % BAR_COLORS.length]
                        : BAR_COLOR
                    }
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
