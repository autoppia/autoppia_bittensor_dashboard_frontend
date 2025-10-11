"use client";

import { useState } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import cn from "@core/utils/class-names";
import {
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";
import { leaderboardData, LeaderboardDataType } from "@/data/leaderboard-data";

const filterOptions = ["7D", "15D", "All"];

// SOTA agent color definitions
const sotaAgents = [
  {
    label: "OpenAI CUA",
    value: "openai_cua",
    stroke: "#2196F3",
    fill: "rgba(33, 150, 243, 0.1)",
  },
  {
    label: "Anthropic CUA", 
    value: "anthropic_cua",
    stroke: "#FF8C00",
    fill: "rgba(255, 140, 0, 0.1)",
  },
  {
    label: "Browser Use",
    value: "browser_use", 
    stroke: "#FFFFFF",
    fill: "rgba(255, 255, 255, 0.1)",
  },
];

interface AgentScoreChartProps {
  className?: string;
}

export default function AgentScoreChart({ className }: AgentScoreChartProps) {
  const [filteredData, setFilteredData] =
    useState<LeaderboardDataType[]>(leaderboardData);

  function handleFilterBy(option: string) {
    if (option === "All") {
      setFilteredData(leaderboardData);
    } else {
      const length = option === "7D" ? 7 : 15;
      setFilteredData(leaderboardData.slice(-1 * length));
    }
  }

  return (
    <WidgetCard
      title="Score Over Time"
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex-row items-start space-between"
      rounded="xl"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className={cn("h-[273px] w-full pt-2")}>
          <ResponsiveContainer width="100%" height="100%" minWidth={600}>
            <ComposedChart
              data={filteredData}
              margin={{
                top: 10,
                left: -10,
              }}
            >
              <defs>
                <linearGradient id="subnet36Area" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F0F1FF"
                    className="[stop-opacity:0.2]"
                  />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                {/* SOTA agent gradients */}
                <linearGradient id="openaiArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anthropicArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF8C00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="browserUseArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="round" axisLine={true} tickLine={false} />
              <YAxis
                axisLine={true}
                tickLine={false}
                domain={[
                  Math.min(
                    ...filteredData.map((item) => item.subnet36),
                    ...filteredData.map((item) => item.openai_cua),
                    ...filteredData.map((item) => item.anthropic_cua),
                    ...filteredData.map((item) => item.browser_use)
                  ) - 0.01,
                  Math.max(
                    ...filteredData.map((item) => item.subnet36),
                    ...filteredData.map((item) => item.openai_cua),
                    ...filteredData.map((item) => item.anthropic_cua),
                    ...filteredData.map((item) => item.browser_use)
                  ),
                ]}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Main subnet36 area */}
              <Area
                type="monotone"
                dataKey="subnet36"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#subnet36Area)"
              />
              {/* SOTA agent areas */}
              <Area
                type="monotone"
                dataKey="openai_cua"
                stroke="#2196F3"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#openaiArea)"
              />
              <Area
                type="monotone"
                dataKey="anthropic_cua"
                stroke="#FF8C00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#anthropicArea)"
              />
              <Area
                type="monotone"
                dataKey="browser_use"
                stroke="#FFFFFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#browserUseArea)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
