"use client";

import { useState } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { Text } from "rizzui";
import {
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";
import { minersScoreData, MinerScoreDataType } from "@/data/miners-score-data";

const filterOptions = ["7D", "15D", "All"];

export default function MinerChart({ className }: { className?: string }) {
  const isMediumScreen = useMedia("(max-width: 1200px)", false);
  const isTablet = useMedia("(max-width: 800px)", false);

  const [filteredData, setFilteredData] = useState<MinerScoreDataType[]>(minersScoreData);

  function handleFilterBy(option: string) {
    if (option === "All") {
      setFilteredData(minersScoreData);
    } else {
      const length = option === "7D" ? 7 : 15;
      setFilteredData(minersScoreData.slice(-1 * length));
    }
  }

  return (
    <WidgetCard
      title="Top Miner"
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
        <div className={cn("h-[150px] w-full pt-2")}>
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: "700px" })}
            height="100%"
          >
            <ComposedChart
              data={filteredData}
              barSize={isMediumScreen ? 20 : 28}
              margin={{
                top: 1,
                left: -5,
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
              <XAxis dataKey="round" axisLine={false} tickLine={false} />
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

export function CustomTooltip({ label, active, payload, className }: any) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100",
        className
      )}
    >
      <Text className="label mb-0.5 block bg-gray-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        {label}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload?.map((item: any, index: number) => (
          <div
            key={item.dataKey + index}
            className="chart-tooltip-item flex items-center py-1.5"
          >
            <span
              className="me-1.5 h-2 w-2 rounded-full"
              style={{
                backgroundColor: "#10b981",
              }}
            />
            <Text>
              <Text as="span" className="capitalize">
                Score:
              </Text>{" "}
              <Text
                as="span"
                className="font-medium text-gray-900 dark:text-gray-700"
              >
                {item.value.toFixed(2)}
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
