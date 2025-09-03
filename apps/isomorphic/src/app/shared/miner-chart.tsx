"use client";

import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import {
  Area,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const filterOptions = ["7D", "15D", "All"];

interface MinerChartProps {
  title: string;
  data: any[];
  className?: string;
}

export default function MinerChart({
  title,
  data,
  className,
}: MinerChartProps) {
  const isMediumScreen = useMedia("(max-width: 1200px)", false);
  const isTablet = useMedia("(max-width: 800px)", false);
  function handleFilterBy(data: string) {
    console.log("Audience Metrics Filter:", data);
  }

  return (
    <WidgetCard
      title={title}
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(data) => handleFilterBy(data)}
          className="-ms-2 mb-3 @lg:mb-0 @lg:ms-0"
        />
      }
      headerClassName="flex-row space-between"
      rounded="lg"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className={cn("h-[160px] w-full pt-6")}>
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: "700px" })}
            height="100%"
          >
            <ComposedChart
              data={data}
              barSize={isMediumScreen ? 20 : 28}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <defs>
                <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F0F1FF"
                    className="[stop-opacity:0.2]"
                  />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="step"
                dataKey="sessions"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#analyticsArea)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
