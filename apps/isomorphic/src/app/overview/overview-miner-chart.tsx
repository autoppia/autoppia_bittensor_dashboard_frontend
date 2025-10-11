"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import cn from "@core/utils/class-names";
import { Checkbox, CheckboxGroup } from "rizzui";
import {
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";
import { useLeaderboard } from "@/services/hooks/useOverview";
import type { LeaderboardData } from "@/services/api/types/overview";

const filterOptions = ["7D", "15D", "All"];
const sotaAgents = [
  {
    label: "OpenAI CUA",
    value: "openai_cua",
    image: "/icons/openai.webp",
    stroke: "#2196F3",
  },
  {
    label: "Anthropic CUA",
    value: "anthropic_cua",
    image: "/icons/anthropic.webp",
    stroke: "#FF8C00",
  },
  {
    label: "Browser Use",
    value: "browser_use",
    image: "/icons/browser-use.webp",
    stroke: "#FFFFFF",
  },
];

interface MinerChartProps {
  className?: string;
}

export default function MinerChart({ className }: MinerChartProps) {
  const [filteredData, setFilteredData] = useState<LeaderboardData[]>([]);
  const [compareWith, setCompareWith] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string>("All");
  
  const { data: leaderboardData, loading, error } = useLeaderboard({
    timeRange: currentFilter === "All" ? "all" : currentFilter.toUpperCase() as "7D" | "15D"
  });

  useEffect(() => {
    if (leaderboardData?.data?.leaderboard) {
      console.log('Leaderboard data received:', leaderboardData.data.leaderboard);
      setFilteredData(leaderboardData.data.leaderboard);
    }
  }, [leaderboardData]);

  function handleFilterBy(option: string) {
    setCurrentFilter(option);
  }

  // Show loading state
  if (loading) {
    return (
      <WidgetCard
        title="Top Miner Score"
        action={
          <ButtonGroupAction
            options={filterOptions}
            onChange={(option) => handleFilterBy(option)}
          />
        }
        headerClassName="flex-row items-center space-between"
        rounded="lg"
        className={cn("p-5 lg:p-5", className)}
      >
        <div className="custom-scrollbar overflow-x-auto scroll-smooth">
          <div className={cn("h-[160px] w-full pt-2")}>
            <div className="h-full w-full bg-gray-100 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center min-w-[600px] gap-4 text-white flex-wrap mt-4">
            <span className="ms-4">Compare with:</span>
            <div className="flex items-center gap-4">
              {sotaAgents.map((agent) => (
                <div key={agent.value} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <span className="text-sm">{agent.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  }

  // Show error state
  if (error) {
    return (
      <WidgetCard
        title="Top Miner Score"
        action={
          <ButtonGroupAction
            options={filterOptions}
            onChange={(option) => handleFilterBy(option)}
          />
        }
        headerClassName="flex-row items-center space-between"
        rounded="lg"
        className={cn("p-5 lg:p-5", className)}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error loading leaderboard data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Top Miner Score"
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex-row items-center space-between"
      rounded="lg"
      className={cn("p-5 lg:p-5", className)}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className={cn("h-[160px] w-full pt-2")}>
          {filteredData.length < 2 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm">Insufficient data for chart</p>
                <p className="text-xs mt-1">Need at least 2 data points</p>
                <p className="text-xs">Current: {filteredData.length} points</p>
              </div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={600}>
            <ComposedChart
              data={filteredData}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
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
              </defs>
              <XAxis dataKey="round" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={filteredData.length > 0 ? [
                  Math.max(0, Math.min(...filteredData.map((item) => item.subnet36)) - 0.1),
                  Math.min(1, Math.max(...filteredData.map((item) => item.subnet36)) + 0.1),
                ] : [0, 1]}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="step"
                dataKey="subnet36"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#subnet36Area)"
              />
              {sotaAgents.map((agent) => {
                return (
                  compareWith.includes(agent.value) && (
                    <Line
                      key={`line-chart-${agent.value}`}
                      type="monotone"
                      dataKey={agent.value}
                      stroke={agent.stroke}
                      strokeWidth={2}
                      dot={false}
                    />
                  )
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center min-w-[600px] gap-4 text-white flex-wrap">
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
                    <Image
                      src={agent.image}
                      alt={agent.label}
                      width={16}
                      height={16}
                      className="rounded-md"
                    />
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
        </div>
      </div>
    </WidgetCard>
  );
}
