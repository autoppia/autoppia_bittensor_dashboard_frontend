"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import WidgetCard from "@core/components/cards/widget-card";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundMiners } from "@/services/hooks/useRounds";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function RoundMinerScores({
  className,
}: {
  className?: string;
}) {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Get miners data from API
  const { data: minersData, loading, error } = useRoundMiners(roundId, { 
    limit: 25, 
    sortBy: 'score', 
    sortOrder: 'desc' 
  });

  const isSmallScreen = useMedia("(max-width: 767px)", false);
  const isMediumScreen = useMedia(
    "(min-width: 768px) and (max-width: 1023px)",
    false
  );
  const barSize = isSmallScreen ? 16 : isMediumScreen ? 22 : 25;
  const minWidth = isSmallScreen ? 560 : isMediumScreen ? 640 : 840;

  // Prepare chart data with SOTA agents
  const chartData = React.useMemo(() => {
    if (!minersData?.data?.miners) return [];
    
    const miners = minersData.data.miners.slice(0, 22); // Take 22 miners to leave space for SOTA agents
    
    // Add SOTA agents with fixed scores
    const sotaAgents = [
      { uid: 'OpenAI', score: 0.95, isSota: true },
      { uid: 'Claude', score: 0.92, isSota: true },
      { uid: 'Browser-User', score: 0.88, isSota: true },
    ];
    
    // Combine miners and SOTA agents, sort by score
    const allData = [...miners, ...sotaAgents]
      .sort((a, b) => b.score - a.score)
      .map((item: any, index) => ({
        name: item.isSota ? item.uid : `Miner ${item.uid}`,
        score: item.score,
        isSota: item.isSota || false,
        uid: item.uid,
      }));
    
    return allData;
  }, [minersData]);

  // Show loading state
  if (loading) {
    return (
      <WidgetCard title="Miner Scores" className={cn("h-[520px] rounded-xl", className)}>
        <div className="mt-5 w-full h-[350px] lg:mt-7">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </WidgetCard>
    );
  }

  // Show error state
  if (error) {
    return (
      <WidgetCard title="Miner Scores" className={cn("h-[520px] rounded-xl", className)}>
        <div className="mt-5 w-full h-[350px] lg:mt-7 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Failed to load miner scores</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Miner Scores" className={cn("h-[520px] rounded-xl", className)}>
      <div className="mt-5 w-full h-[350px] lg:mt-7 custom-scrollbar overflow-x-auto scroll-smooth">
        <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
          <ComposedChart
            data={chartData}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient
                id="minerScore"
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#10B981" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient
                id="openaiScore"
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient
                id="claudeScore"
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
              <linearGradient
                id="browserUserScore"
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              fill="url(#minerScore)"
              stroke="#10B981"
              strokeWidth={0}
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            >
              {chartData.map((entry, index) => {
                let fillColor = 'url(#minerScore)';
                if (entry.isSota) {
                  switch (entry.uid) {
                    case 'OpenAI': fillColor = 'url(#openaiScore)'; break;
                    case 'Claude': fillColor = 'url(#claudeScore)'; break;
                    case 'Browser-User': fillColor = 'url(#browserUserScore)'; break;
                  }
                }
                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <Text className="text-gray-600">Miners</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
          <Text className="text-gray-600">OpenAI</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <Text className="text-gray-600">Claude</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
          <Text className="text-gray-600">Browser-User</Text>
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
        Round {label}
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
                backgroundColor: "#10B981",
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
                {item.value}
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
