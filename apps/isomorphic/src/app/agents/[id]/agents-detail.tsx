"use client";

import { useParams } from "next/navigation";
import { getAgentDetailsData } from "@/data/query";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

const BAR_COLORS = ["#FEDCBE", "#FF7E5F", "#BE3D2A"];

export default function DetailsChart({ className }: { className?: string }) {
  const { id } = useParams();
  const [agentDetailsData, setAgentDetailsData] = useState<ChartData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isTab = useMedia("(max-width: 768px)", false);
  const barSize = isTab ? 16 : 20;

  useEffect(() => {
    const data = getAgentDetailsData(id as string);
    setAgentDetailsData(data);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <WidgetCard
        title="Job Overview"
        className={cn("min-h-[28rem]", className)}
        titleClassName="font-normal text-sm sm:text-sm text-gray-500 mb-2.5 font-inter"
      >
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </WidgetCard>
    );
  }

  if (!agentDetailsData.length) {
    return (
      <WidgetCard
        title="Job Overview"
        className={cn("min-h-[28rem]", className)}
        titleClassName="font-normal text-sm sm:text-sm text-gray-500 mb-2.5 font-inter"
      >
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-gray-500">No data available for this agent.</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Job Overview"
      className={cn("min-h-[28rem]", className)}
      titleClassName="font-normal text-sm sm:text-sm text-gray-500 mb-2.5 font-inter"
      action={<Legend className="my-4 flex @md:justify-end @2xl:hidden" />}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="h-[450px] w-full pt-6">
          <ResponsiveContainer width="100%" height="100%" minWidth={700}>
            <ComposedChart
              data={agentDetailsData as any[]}
              margin={{
                left: -6,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="website" axisLine={false} tickLine={false} />
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
                content={<CustomTooltip postfix="%" formattedNumber />}
              />
              <Bar
                dataKey="easy"
                fill={BAR_COLORS[0]}
                stroke={BAR_COLORS[0]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="medium"
                fill={BAR_COLORS[1]}
                stroke={BAR_COLORS[1]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="hard"
                fill={BAR_COLORS[2]}
                stroke={BAR_COLORS[2]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
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
    >
      {["Easy", "Medium", "Hard"].map((item, index) => (
        <div key={item} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: BAR_COLORS[index] }}
          />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
