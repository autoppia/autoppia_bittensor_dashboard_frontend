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
import { useMinerDetails } from "@/services/hooks/useAgents";
import { AgentScoreChartPlaceholder } from "@/components/placeholders/agent-placeholders";
import { ScoreRoundDataPoint } from "@/services/api/types/agents";

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
  scoreRoundData?: ScoreRoundDataPoint[];
}

export default function AgentScoreChart({ className, scoreRoundData = [] }: AgentScoreChartProps) {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('90d');
  
  const { data: agent, loading, error } = useMinerDetails(uid);


  function handleFilterBy(option: string) {
    if (option === "7D") {
      setTimeRange('7d');
    } else if (option === "15D") {
      setTimeRange('30d'); // Use 30d for 15D filter (15 rounds)
    } else {
      setTimeRange('90d'); // All rounds
    }
  }

  // Show loading placeholder
  if (loading) {
    return <AgentScoreChartPlaceholder className={className} />;
  }

  // Show error state
  if (error) {
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
        <div className="flex items-center justify-center h-[273px] text-red-500">
          <div className="text-center">
            <p className="text-lg font-semibold">Error loading performance data</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  // Transform the score vs round data for the chart
  const chartData = scoreRoundData
    .map((point) => ({
      round: point.round_id,
      score: point.score,
      rank: point.rank,
      reward: point.reward,
      timestamp: point.timestamp,
    }))
    .sort((a, b) => a.round - b.round); // Sort by round number

  // If no real data, generate some sample data
  const isUsingFallbackData = chartData.length === 0;
  const fallbackData = [];
  
  if (isUsingFallbackData && agent) {
    // Generate sample data for demonstration
    for (let i = 1; i <= 20; i++) {
      const baseScore = (agent as any)?.currentScore || 70; // New API returns percentage
      const variation = (Math.random() - 0.5) * 10; // ±5% variation
      const score = Math.max(70, Math.min(100, baseScore + variation)) / 100; // Convert to decimal for chart
      
      fallbackData.push({
        round: i,
        score: score,
        rank: Math.floor(Math.random() * 50) + 1,
        reward: Math.random() * 10,
        timestamp: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Apply time range filtering (1 round = 1 day)
  const getFilteredData = (data: any[]) => {
    if (data.length === 0) return data;
    
    // Get the highest round number (most recent)
    const maxRound = Math.max(...data.map(d => d.round));
    
    // Calculate how many rounds to show based on time range
    let roundsToShow: number;
    switch (timeRange) {
      case '7d':
        roundsToShow = 7; // 7 rounds = 7 days
        break;
      case '30d':
        roundsToShow = 15; // 15 rounds = 15 days (closest to 15D filter)
        break;
      case '90d':
        roundsToShow = Math.min(90, data.length); // All rounds up to 90 days
        break;
      default:
        roundsToShow = data.length;
    }
    
    // Filter to show only the most recent rounds
    const minRound = Math.max(1, maxRound - roundsToShow + 1);
    return data.filter(d => d.round >= minRound);
  };

  const baseData = isUsingFallbackData ? fallbackData : chartData;
  const displayData = getFilteredData(baseData);

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
      className={cn("flex flex-col min-h-[180px]", className)}
    >
      {isUsingFallbackData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Simulated Data:</strong> Historical performance data is not available from the API. Showing realistic simulated data based on current performance metrics.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="custom-scrollbar overflow-x-auto scroll-smooth flex-1">
        <div className={cn("h-full w-full pt-2")}>
          <ResponsiveContainer width="100%" height="100%" minWidth={600}>
            <ComposedChart
              data={displayData}
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
                dataKey="round" 
                axisLine={true} 
                tickLine={false}
                tickFormatter={(value) => `${value}`}
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
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'score') {
                    return [`${(value * 100).toFixed(1)}%`, 'Score'];
                  }
                  return [value, name];
                }}
                labelFormatter={(value, payload) => {
                  const data = payload?.[0]?.payload;
                  return `${value}${data?.rank ? ` (Rank #${data.rank})` : ''}`;
                }}
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
