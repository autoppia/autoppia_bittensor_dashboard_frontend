"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { useAgentPerformance } from "@/services/hooks/useAgents";
import { AgentScoreChartPlaceholder } from "@/components/placeholders/agent-placeholders";

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
  const { id } = useParams();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  const { data: performance, loading } = useAgentPerformance(id as string, {
    timeRange,
    granularity: timeRange === '7d' ? 'hour' : 'day'
  });

  function handleFilterBy(option: string) {
    if (option === "7D") {
      setTimeRange('7d');
    } else if (option === "15D") {
      setTimeRange('30d'); // Use 30d as closest to 15D
    } else {
      setTimeRange('90d');
    }
  }

  // Show loading placeholder
  if (loading) {
    return <AgentScoreChartPlaceholder className={className} />;
  }

  if (!performance?.performanceTrend) {
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
        <div className="flex items-center justify-center h-[273px] text-gray-500">
          No performance data available
        </div>
      </WidgetCard>
    );
  }

  // Transform performance data for chart
  const chartData = performance.performanceTrend.map((trend, index) => ({
    period: trend.period,
    score: trend.score,
    successRate: trend.successRate,
    duration: trend.duration,
  }));

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
              data={chartData}
              margin={{
                top: 10,
                left: -10,
              }}
            >
              <defs>
                <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#10b981"
                    stopOpacity={0.2}
                  />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="successRateArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                axisLine={true} 
                tickLine={false}
                tickFormatter={(value) => {
                  if (timeRange === '7d') {
                    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                axisLine={true}
                tickLine={false}
                domain={[0, 1]}
                tick={<CustomYAxisTick />}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number, name: string) => [
                  `${(value * 100).toFixed(1)}%`,
                  name === 'score' ? 'Score' : name === 'successRate' ? 'Success Rate' : name
                ]}
              />
              {/* Score area */}
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreArea)"
              />
              {/* Success rate area */}
              <Area
                type="monotone"
                dataKey="successRate"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#successRateArea)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
