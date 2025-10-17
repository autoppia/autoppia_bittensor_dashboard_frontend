"use client";

import { useState, useMemo } from "react";
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
  Line,
} from "recharts";
import { useMinerDetails } from "@/services/hooks/useAgents";
import { AgentScoreChartPlaceholder } from "@/components/placeholders/agent-placeholders";
import type { ScoreRoundDataPoint } from "@/services/api/types/agents";

const filterOptions = ["7D", "15D", "All"];

const BENCHMARK_COLORS: Record<string, string> = {
  openai: "#2563EB",
  anthropic: "#F97316",
  browser: "#8B5CF6",
  "browser-use": "#8B5CF6",
  browser_use: "#8B5CF6",
  claude: "#F97316",
};

const BENCHMARK_COLOR_PALETTE = ["#2563EB", "#F97316", "#8B5CF6", "#14B8A6", "#F472B6", "#EC4899"];

interface AgentScoreChartProps {
  className?: string;
  scoreRoundData?: ScoreRoundDataPoint[];
}

const normalizeScore = (value?: number | null): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (Number.isNaN(value)) {
    return null;
  }
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AgentScoreChart({
  className,
  scoreRoundData = [],
}: AgentScoreChartProps) {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const [timeRange, setTimeRange] = useState<"7d" | "15d" | "all">("all");

  const { data: agent, loading, error } = useMinerDetails(uid);

  const { processedRows, benchmarkSeries } = useMemo(() => {
    const seriesMap = new Map<
      string,
      {
        label: string;
        color: string;
      }
    >();

    const rows = scoreRoundData
      .map((point) => {
        const row: Record<string, number | string | null> = {
          round: point.round_id,
          score: normalizeScore(point.score) ?? 0,
          rank: point.rank ?? null,
          reward: point.reward ?? null,
          timestamp: point.timestamp,
        };

        const topScore = normalizeScore(point.topScore);
        if (topScore !== null) {
          row.topBenchmarkScore = topScore;
        }

        if (Array.isArray(point.benchmarks) && point.benchmarks.length > 0) {
          point.benchmarks.forEach((benchmark, idx) => {
            const rawId = benchmark.provider || benchmark.name || `benchmark-${idx}`;
            const slug = slugify(rawId);
            const key = `benchmark_${slug || idx}`;
            const normalized = normalizeScore(benchmark.score);

            if (!seriesMap.has(key)) {
              const color =
                BENCHMARK_COLORS[slug] ||
                BENCHMARK_COLOR_PALETTE[seriesMap.size % BENCHMARK_COLOR_PALETTE.length];

              seriesMap.set(key, {
                label: benchmark.name || benchmark.provider || "Benchmark",
                color,
              });
            }

            row[key] = normalized;
          });
        }

        return row;
      })
      .filter((entry) => {
        const value = entry.round;
        if (typeof value !== "number") {
          return false;
        }
        return Number.isFinite(value) && value > 0;
      })
      .sort((a, b) => {
        const roundA = typeof a.round === "number" ? a.round : Number(a.round);
        const roundB = typeof b.round === "number" ? b.round : Number(b.round);
        return roundA - roundB;
      });

    return {
      processedRows: rows,
      benchmarkSeries: Array.from(seriesMap.entries()).map(([key, meta]) => ({
        key,
        label: meta.label,
        color: meta.color,
      })),
    };
  }, [scoreRoundData]);

  const useSyntheticTrend = false;

  function handleFilterBy(option: string) {
    if (option === "7D") {
      setTimeRange("7d");
    } else if (option === "15D") {
      setTimeRange("15d");
    } else {
      setTimeRange("all");
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
        <div className="flex h-[273px] items-center justify-center text-red-500">
          <div className="text-center">
            <p className="text-lg font-semibold">Error loading performance data</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  // Apply time range filtering (1 round = 1 day)
  const getFilteredData = (data: any[]) => {
    if (data.length === 0 || timeRange === "all") {
      return data;
    }

    const maxRound = Math.max(...data.map((d) => d.round));
    const roundsToShow = timeRange === "7d" ? 7 : 15;
    const minRound = Math.max(1, maxRound - roundsToShow + 1);
    return data.filter((d) => d.round >= minRound);
  };

  const displayData = getFilteredData(processedRows).map((entry: any) => {
    const scaled: Record<string, number | string | null> = {
      ...entry,
      score: entry.score != null ? Number(entry.score) * 100 : entry.score,
      topBenchmarkScore:
        entry.topBenchmarkScore != null ? Number(entry.topBenchmarkScore) * 100 : entry.topBenchmarkScore,
    };

    benchmarkSeries.forEach((series) => {
      if (scaled[series.key] != null) {
        scaled[series.key] = Number(scaled[series.key]) * 100;
      }
    });

    return scaled;
  });
  const hasTopBenchmark = displayData.some(
    (entry) => typeof entry.topBenchmarkScore === "number"
  );

  const scoreValues = displayData
    .flatMap((entry) => {
      const values: number[] = [];
      if (typeof entry.score === "number") {
        values.push(entry.score);
      }
      if (typeof entry.topBenchmarkScore === "number") {
        values.push(entry.topBenchmarkScore);
      }
      benchmarkSeries.forEach((series) => {
        if (typeof entry[series.key] === "number") {
          values.push(entry[series.key] as number);
        }
      });
      return values;
    })
    .filter((value) => Number.isFinite(value));

  const computeDomain = () => {
    if (!scoreValues.length) {
      return [0, 100];
    }
    const minValue = Math.min(...scoreValues);
    const maxValue = Math.max(...scoreValues);
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.2 : Math.max(5, maxValue * 0.1 || 5);
    const lowerBound = Math.max(0, minValue - padding);
    const upperBound = Math.min(100, maxValue + padding);
    return [Math.floor(lowerBound), Math.ceil(upperBound)];
  };

  const yAxisDomain = computeDomain();

  const legendItems = [
    { label: "Agent score", color: "#10B981" },
    ...(hasTopBenchmark ? [{ label: "Top score", color: "#FACC15" }] : []),
    ...benchmarkSeries.map((series) => ({ label: series.label, color: series.color })),
  ];

  return (
    <WidgetCard
      title="Score Over Time"
      action={
        <ButtonGroupAction options={filterOptions} onChange={(option) => handleFilterBy(option)} />
      }
      headerClassName="flex-row items-start space-between"
      rounded="xl"
      className={cn("flex flex-col min-h-[180px]", className)}
    >
      {processedRows.length === 0 && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <strong>No history yet:</strong> This agent has not completed any recorded rounds.
        </div>
      )}
      <div className="custom-scrollbar flex-1 overflow-x-auto scroll-smooth">
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
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="round" axisLine tickLine={false} tickFormatter={(value) => `${value}`} />
              <YAxis
                axisLine
                tickLine={false}
                domain={yAxisDomain}
                tick={<CustomYAxisTick postfix="%" />}
              />
              <Tooltip
                content={<CustomTooltip />}
                formatter={(value: number | null, name: string) => {
                  if (value === null || value === undefined) {
                    return ["—", name];
                  }
                  return [`${Number(value).toFixed(1)}%`, name];
                }}
                labelFormatter={(value, payload) => {
                  const data = payload?.[0]?.payload;
                  return `${value}${data?.rank ? ` (Rank #${data.rank})` : ""}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreArea)"
                name="Agent score"
              />
              {hasTopBenchmark && (
                <Line
                  type="monotone"
                  dataKey="topBenchmarkScore"
                  stroke="#FACC15"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 4"
                  name="Top score"
                />
              )}
              {benchmarkSeries.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={1.75}
                  dot={false}
                  name={series.label}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {legendItems.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
          {legendItems.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
