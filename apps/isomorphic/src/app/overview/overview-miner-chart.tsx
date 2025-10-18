"use client";

import Image from "next/image";
import { useState, useMemo, useCallback, type CSSProperties } from "react";
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

const filterOptions = ["7D", "15D", "All"] as const;
type FilterOption = (typeof filterOptions)[number];
const CHART_HEIGHT = 200;
const MAX_CHART_HEIGHT = 460;

const fallbackLeaderboard: LeaderboardData[] = [
  { round: 38, subnet36: 0.85, openai_cua: 0.79, anthropic_cua: 0.81, browser_use: 0.84, timestamp: new Date().toISOString() },
  { round: 39, subnet36: 0.87, openai_cua: 0.81, anthropic_cua: 0.83, browser_use: 0.86, timestamp: new Date().toISOString() },
  { round: 40, subnet36: 0.89, openai_cua: 0.83, anthropic_cua: 0.85, browser_use: 0.88, timestamp: new Date().toISOString() },
  { round: 41, subnet36: 0.92, openai_cua: 0.85, anthropic_cua: 0.87, browser_use: 0.9, timestamp: new Date().toISOString() },
  { round: 42, subnet36: 0.95, openai_cua: 0.87, anthropic_cua: 0.89, browser_use: 0.92, timestamp: new Date().toISOString() },
];
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

type LeaderboardSource = LeaderboardData & Record<string, unknown>;
type NormalizedLeaderboardDatum = LeaderboardData & { roundLabel: string };

const resolveRoundNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 0) {
      return value;
    }
    return undefined;
  }
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      const parsed = Number.parseInt(match[0] ?? "", 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return undefined;
};

const deriveRoundLabel = (rawLabel: unknown, roundValue: number): string => {
  if (typeof rawLabel === "string" && rawLabel.trim().length > 0) {
    return rawLabel.trim();
  }
  return `Round ${roundValue}`;
};

interface MinerChartProps {
  className?: string;
  targetHeight?: number;
}

export default function MinerChart({ className, targetHeight }: MinerChartProps) {
  const [timeRange, setTimeRange] = useState<FilterOption>("All");
  // Get leaderboard data from API
  const apiTimeRange = timeRange === "All" ? "all" : timeRange;
  const { data: leaderboardData, loading, error } = useLeaderboard({ timeRange: apiTimeRange });
  const chartContainerStyle = useMemo<CSSProperties>(
    () => ({
      minHeight: CHART_HEIGHT,
      flex: "1 1 auto",
    }),
    []
  );
  const wrapperStyle = useMemo<CSSProperties | undefined>(() => {
    if (typeof targetHeight === "number" && Number.isFinite(targetHeight)) {
      const clampedHeight = Math.min(
        Math.max(targetHeight, CHART_HEIGHT),
        MAX_CHART_HEIGHT
      );
      return { height: clampedHeight };
    }
    return { height: MAX_CHART_HEIGHT };
  }, [targetHeight]);
  const wrapperClassName = useMemo(
    () => cn("flex flex-col", className),
    [className]
  );
  
  // Memoize chart data to prevent infinite re-renders
  const { chartData: rawChartData, usingFallback } = useMemo(() => {
    const apiLeaderboard = leaderboardData?.data?.leaderboard;
    const hasSufficientApiData = Array.isArray(apiLeaderboard) && apiLeaderboard.length >= 2;
    const source = (hasSufficientApiData ? apiLeaderboard! : fallbackLeaderboard) as LeaderboardSource[];

    const normalized: NormalizedLeaderboardDatum[] = source
      .map((entry, index) => {
        const normalizedRound =
          resolveRoundNumber(entry.round) ??
          resolveRoundNumber(entry.roundNumber) ??
          resolveRoundNumber(entry.round_id) ??
          resolveRoundNumber(entry.roundId) ??
          resolveRoundNumber(entry.id) ??
          index +
            1;
        const labelSource =
          entry.roundLabel ??
          entry.roundDisplay ??
          entry.roundText ??
          entry.roundTitle ??
          entry.round ??
          entry.roundNumber ??
          entry.round_id ??
          entry.roundId;

        return {
          ...entry,
          round: normalizedRound,
          roundLabel: deriveRoundLabel(labelSource, normalizedRound),
        };
      })
      // Sort after normalization so the x-axis stays in ascending order.
      .sort((a, b) => a.round - b.round);

    return {
      chartData: normalized,
      usingFallback: !hasSufficientApiData,
    };
  }, [leaderboardData?.data?.leaderboard]);

  const scaleScoreValue = (value?: number | null) => {
    if (value === null || value === undefined) return undefined;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return undefined;
    const scaled = numeric <= 1 ? numeric * 100 : numeric;
    return Number(scaled.toFixed(1));
  };

  const chartData = useMemo<NormalizedLeaderboardDatum[]>(() => {
    return rawChartData.map((entry) => ({
      ...entry,
      subnet36: scaleScoreValue(entry.subnet36) ?? 0,
      openai_cua: scaleScoreValue((entry as any).openai_cua),
      anthropic_cua: scaleScoreValue((entry as any).anthropic_cua),
      browser_use: scaleScoreValue((entry as any).browser_use),
    }));
  }, [rawChartData]);

  const [compareWith, setCompareWith] = useState<string[]>(["openai_cua", "anthropic_cua", "browser_use"]);

  const filteredData = useMemo(() => {
    if (!chartData.length) return [];
    if (timeRange === "All") {
      return chartData;
    }
    const rangeToLimit: Record<Exclude<FilterOption, "All">, number> = {
      "7D": 7,
      "15D": 15,
    };
    const totalDays = rangeToLimit[timeRange] ?? chartData.length;
    return chartData.slice(-totalDays);
  }, [chartData, timeRange]);

  const roundLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    chartData.forEach((entry) => {
      if (typeof entry.round === "number") {
        map.set(entry.round, entry.roundLabel);
      }
    });
    return map;
  }, [chartData]);

  const selectedSeries = useMemo(
    () => sotaAgents.filter((agent) => compareWith.includes(agent.value)).map((agent) => agent.value),
    [compareWith]
  );

  const yAxisDomain: [number, number] = useMemo(() => {
    if (!filteredData.length) {
      return [0, 100];
    }
    const keys = ["subnet36", ...selectedSeries];
    let minValue = Infinity;
    let maxValue = -Infinity;
    filteredData.forEach((entry) => {
      keys.forEach((key) => {
        const rawValue = (entry as Record<string, unknown>)[key];
        if (typeof rawValue === "number" && !Number.isNaN(rawValue)) {
          minValue = Math.min(minValue, rawValue);
          maxValue = Math.max(maxValue, rawValue);
        }
      });
    });
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      return [0, 100];
    }
    if (minValue === maxValue) {
      const centered = Number(minValue.toFixed(1));
      const padding = centered === 0 ? 5 : Math.max(centered * 0.05, 2);
      const lowerSingle = Math.max(0, Number((centered - padding).toFixed(1)));
      const upperSingle = Math.min(100, Number((centered + padding).toFixed(1)));
      return [lowerSingle, Math.max(lowerSingle + 1, upperSingle)];
    }
    const range = Math.max(maxValue - minValue, 1);
    const padding = Math.max(range * 0.1, 1);
    const lowerBound = Math.max(0, Number((minValue - padding).toFixed(1)));
    const upperBound = Math.min(100, Number((maxValue + padding).toFixed(1)));
    if (lowerBound >= upperBound) {
      return [Math.max(0, lowerBound - 1), Math.min(100, lowerBound + 1)];
    }
    return [lowerBound, upperBound];
  }, [filteredData, selectedSeries]);

  const xAxisTickFormatter = useCallback((value: number | string) => {
    const numeric = resolveRoundNumber(value);
    if (numeric !== undefined) {
      return `${numeric}`;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return "";
  }, []);

  const tooltipLabelFormatter = useCallback(
    (value: number | string) => {
      const numeric = resolveRoundNumber(value);
      if (numeric !== undefined) {
        return roundLabelMap.get(numeric) ?? `Round ${numeric}`;
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      return "Round";
    },
    [roundLabelMap]
  );

  function handleFilterBy(option: string) {
    if (filterOptions.includes(option as FilterOption)) {
      setTimeRange(option as FilterOption);
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <WidgetCard
          title="Top Miner Score"
          action={
            <ButtonGroupAction
              options={filterOptions}
              defaultActive={timeRange}
              onChange={(option) => handleFilterBy(option)}
            />
          }
          headerClassName="flex-row items-center space-between"
          rounded="lg"
          className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
        >
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex min-h-0 w-full flex-1 pt-2" style={chartContainerStyle}>
              <div className="h-full w-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-gray-600 text-sm">Loading chart data...</div>
                </div>
              </div>
            </div>
            <div className="mt-3 self-end flex flex-wrap items-center justify-end gap-3 text-white">
              <div className="flex flex-wrap items-center gap-3">
                {sotaAgents.map((agent) => (
                  <div key={agent.value} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-sm text-gray-400">{agent.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WidgetCard>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <WidgetCard
          title="Top Miner Score"
          action={
            <ButtonGroupAction
              options={filterOptions}
              defaultActive={timeRange}
              onChange={(option) => handleFilterBy(option)}
            />
          }
          headerClassName="flex-row items-center space-between"
          rounded="lg"
          className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Error loading leaderboard data</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </WidgetCard>
      </div>
    );
  }

  const chartCard = (
    <WidgetCard
      title="Top Miner Score"
      action={
        <ButtonGroupAction
          options={filterOptions}
          defaultActive={timeRange}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex-row items-center space-between"
      rounded="lg"
      className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
    >
      <div className="flex min-h-0 w-full flex-1 pt-2" style={chartContainerStyle}>
        {filteredData.length < 2 ? (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">Insufficient data for chart</p>
              <p className="text-xs mt-1">Need at least 2 data points</p>
              <p className="text-xs">Current: {filteredData.length} points</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
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
              <XAxis
                dataKey="round"
                axisLine={false}
                tickLine={false}
                allowDuplicatedCategory={false}
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={xAxisTickFormatter}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={yAxisDomain}
                tick={<CustomYAxisTick postfix="%" decimals={0} />}
              />
              <Tooltip
                content={<CustomTooltip postfix="%" decimals={1} />}
                labelFormatter={tooltipLabelFormatter}
              />
              <Area
                type="monotone"
                dataKey="subnet36"
                stroke="#10b981"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={false}
                    />
                  )
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-3 self-end flex flex-wrap items-center justify-end gap-3 text-white">
        <CheckboxGroup
          values={compareWith}
          setValues={setCompareWith}
          className="flex flex-wrap items-center gap-3"
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
    </WidgetCard>
  );

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      {chartCard}
    </div>
  );
}
