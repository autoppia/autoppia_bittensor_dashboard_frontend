"use client";

import { useState } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import {
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";

import { MinerScoreDataType } from "@/data/miners-score-data";

const filterOptions = ["7D", "15D", "All"];

interface AgentScoreChartProps {
  title: string;
  data: MinerScoreDataType[];
  className?: string;
}

export default function AgentScoreChart({
  title,
  data,
  className,
}: AgentScoreChartProps) {
  const isTablet = useMedia("(max-width: 800px)", false);

  const [filteredData, setFilteredData] = useState<MinerScoreDataType[]>(data);

  function handleFilterBy(option: string) {
    if (option === "All") {
      setFilteredData(data);
    } else {
      const length = option === "7D" ? 7 : 15;
      setFilteredData(data.slice(-1 * length));
    }
  }

  return (
    <WidgetCard
      title={title}
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex items-start space-between"
      rounded="lg"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className={cn("h-[160px] w-full pt-2")}>
          <ResponsiveContainer width="100%" height="100%" minWidth={500}>
            <ComposedChart
              data={filteredData}
              margin={{
                left: -20,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <defs>
                <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F0F1FF"
                    className="[stop-opacity:0.2]"
                  />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[
                  Math.min(...filteredData.map((item) => item.score)),
                  Math.max(...filteredData.map((item) => item.score)),
                ]}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="step"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreArea)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
