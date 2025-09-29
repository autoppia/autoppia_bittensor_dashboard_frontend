"use client";

import Image from "next/image";
import { useState } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { Text, Checkbox, CheckboxGroup } from "rizzui";
import {
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";

import { LeaderboardDataType } from "@/data/leaderboard-data";

const filterOptions = ["7D", "15D", "All"];
const sotaAgents = [
  {
    label: "OpenAI CUA",
    value: "openai_cua",
    image: "/icons/openai.webp",
    stroke: "#3562FC",
  },
  {
    label: "Anthropic CUA",
    value: "anthropic_cua",
    image: "/icons/anthropic.webp",
    stroke: "#FC9D23",
  },
  {
    label: "Browser Use",
    value: "browser_use",
    image: "/icons/browser-use.webp",
    stroke: "#BBD6FF",
  },
];

interface AgentRankingChartProps {
  title: string;
  data: LeaderboardDataType[];
  className?: string;
}

export default function AgentRankingChart({
  title,
  data,
  className,
}: AgentRankingChartProps) {
  const isMediumScreen = useMedia("(max-width: 1200px)", false);
  const isTablet = useMedia("(max-width: 800px)", false);

  const [filteredData, setFilteredData] = useState<LeaderboardDataType[]>(data);
  // const [compareWith, setCompareWith] = useState<string[]>([]);

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
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: "700px" })}
            height="100%"
          >
            <ComposedChart
              data={filteredData}
              barSize={isMediumScreen ? 20 : 28}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <defs>
                <linearGradient id="rankingArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F0F1FF"
                    className="[stop-opacity:0.2]"
                  />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[1, 10]}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rankScore"
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rankingArea)"
              />
              {/* {sotaAgents.map((agent) => {
                return compareWith.includes(agent.value) && (
                  <Line
                    key={`line-chart-${agent.value}`}
                    type="monotone"
                    dataKey={agent.value}
                    stroke={agent.stroke}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })} */}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="flex items-center gap-4 mt-1 mb-0.5 text-white flex-wrap">
          <span className="ms-4">Compare with:</span>
          <CheckboxGroup
            values={compareWith}
            setValues={setCompareWith}
            className="flex items-center gap-4"
          >
            {sotaAgents.map((agent) => (
              <Checkbox
                key={`checkbox-${agent.value}`}
                label={
                  <div className="flex items-center">
                    <Image src={agent.image} alt={agent.label} width={16} height={16} className="rounded-md" />
                    <span className="ms-1">{agent.label}</span>
                  </div>
                }
                labelClassName="w-full"
                labelPlacement="left"
                size="sm"
                iconClassName="top-0"
                name={agent.value}
                value={agent.value}
              />
            ))}
          </CheckboxGroup>
        </div> */}
      </div>
    </WidgetCard>
  );
}

function CustomYAxisTick({ x, y, payload, prefix, postfix }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="fill-gray-500">
        {prefix && prefix}
        {payload.value === 1 ? "10+" : 11 - payload.value}
        {postfix && postfix}
      </text>
    </g>
  );
}

function CustomTooltip({
  label,
  prefix,
  active,
  postfix,
  payload,
  className,
}: any) {
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
                Ranking:
              </Text>{" "}
              <Text
                as="span"
                className="font-medium text-gray-900 dark:text-gray-700"
              >
                {prefix && prefix}
                {item.value === 1 ? "10+" : 11 - item.value}
                {postfix && postfix}
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
