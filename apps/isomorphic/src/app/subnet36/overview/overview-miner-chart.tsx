"use client";

import Image from "next/image";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
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
import type { LeaderboardData } from "@/repositories/overview/overview.types";

const filterOptions = ["7R", "15R", "30R", "All"] as const;
type FilterOption = (typeof filterOptions)[number];
const filterOptionValues = [...filterOptions];
const CHART_HEIGHT = 200;
const MAX_CHART_HEIGHT = 460;

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
type NormalizedLeaderboardDatum = LeaderboardData & {
  roundLabel: string;
  winnerUid?: number | null;
  winnerName?: string | null;
};

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
  season?: number | null;
}

export default function MinerChart({
  className,
  targetHeight,
  season,
}: MinerChartProps) {
  const [timeRange, setTimeRange] = useState<FilterOption>("7R"); // Default to 7R
  // Get leaderboard data from API
  const apiTimeRange = timeRange === "All" ? "all" : timeRange;
  const {
    data: leaderboardData,
    loading,
    error,
    refetch,
  } = useLeaderboard({ timeRange: apiTimeRange });

  // Auto-refresh leaderboard every 2 minutes (reduced from 30s for performance)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 120000); // 120 seconds (2 minutes)

    return () => clearInterval(interval);
  }, [refetch]);
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
  const rawChartData = useMemo<NormalizedLeaderboardDatum[]>(() => {
    const apiLeaderboard = leaderboardData?.data?.leaderboard;
    if (!Array.isArray(apiLeaderboard)) {
      return [];
    }

    const normalized = apiLeaderboard.reduce<NormalizedLeaderboardDatum[]>(
      (acc, entry, index) => {
        const source = entry as LeaderboardSource;
        const normalizedRound =
          resolveRoundNumber(entry.round) ??
          resolveRoundNumber(source.roundNumber) ??
          resolveRoundNumber(source.round_id) ??
          resolveRoundNumber(source.roundId) ??
          resolveRoundNumber(source.id) ??
          (Number.isFinite(index) ? index + 1 : undefined);

        if (normalizedRound === undefined) {
          return acc;
        }

        const labelSource =
          source.roundLabel ??
          source.roundDisplay ??
          source.roundText ??
          source.roundTitle ??
          entry.round ??
          source.roundNumber ??
          source.round_id ??
          source.roundId;

        acc.push({
          ...entry,
          round: normalizedRound,
          roundLabel: deriveRoundLabel(labelSource, normalizedRound),
          winnerUid: entry.winnerUid ?? (entry as any).winner_uid,
          winnerName: entry.winnerName ?? (entry as any).winner_name,
        });
        return acc;
      },
      []
    );

    return normalized.sort((a, b) => {
      const seasonA =
        typeof a.season === "number" && Number.isFinite(a.season)
          ? a.season
          : 0;
      const seasonB =
        typeof b.season === "number" && Number.isFinite(b.season)
          ? b.season
          : 0;
      if (seasonA !== seasonB) {
        return seasonA - seasonB;
      }
      return a.round - b.round;
    });
  }, [leaderboardData?.data?.leaderboard]);

  const filteredBySeason = useMemo<NormalizedLeaderboardDatum[]>(() => {
    if (season === null || season === undefined) {
      return rawChartData;
    }
    return rawChartData.filter((entry) => entry.season === season);
  }, [rawChartData, season]);

  const seasonPointCounts = useMemo(() => {
    const counts = new Map<number, number>();
    rawChartData.forEach((entry) => {
      if (typeof entry.season === "number" && Number.isFinite(entry.season)) {
        counts.set(entry.season, (counts.get(entry.season) ?? 0) + 1);
      }
    });
    return counts;
  }, [rawChartData]);

  const fallbackSeason = useMemo<number | null>(() => {
    if (season === null || season === undefined || filteredBySeason.length > 0) {
      return null;
    }

    const previousSeasons = Array.from(seasonPointCounts.entries())
      .filter(([seasonNumber, count]) => seasonNumber < season && count > 0)
      .map(([seasonNumber]) => seasonNumber)
      .sort((a, b) => b - a);

    return previousSeasons[0] ?? null;
  }, [filteredBySeason.length, season, seasonPointCounts]);

  const effectiveSeason = useMemo<number | null>(() => {
    if (season === null || season === undefined) {
      return null;
    }
    return fallbackSeason ?? season;
  }, [fallbackSeason, season]);

  const effectiveChartSource = useMemo<NormalizedLeaderboardDatum[]>(() => {
    if (effectiveSeason === null || effectiveSeason === undefined) {
      return rawChartData;
    }
    return rawChartData.filter((entry) => entry.season === effectiveSeason);
  }, [effectiveSeason, rawChartData]);

  const showPreviousSeasonFallback = Boolean(
    season != null &&
      season !== undefined &&
      fallbackSeason != null &&
      filteredBySeason.length === 0
  );

  const scaleScoreValue = (value?: number | null) => {
    if (value === null || value === undefined) return undefined;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return undefined;
    const scaled = numeric <= 1 ? numeric * 100 : numeric;
    return Number(scaled.toFixed(1));
  };

  const chartData = useMemo<NormalizedLeaderboardDatum[]>(() => {
    return effectiveChartSource.map((entry) => ({
      ...entry,
      reward: scaleScoreValue(entry.reward ?? entry.post_consensus_reward ?? entry.subnet36) ?? 0,
      subnet36: scaleScoreValue(entry.reward ?? entry.post_consensus_reward ?? entry.subnet36) ?? 0,
      openai_cua: scaleScoreValue((entry as any).openai_cua),
      anthropic_cua: scaleScoreValue((entry as any).anthropic_cua),
      browser_use: scaleScoreValue((entry as any).browser_use),
    }));
  }, [effectiveChartSource]);

  const availableSotaSeries = useMemo<string[]>(() => {
    if (!chartData.length) {
      return [];
    }
    const detected = new Set<string>();
    chartData.forEach((entry) => {
      sotaAgents.forEach((agent) => {
        const value = (entry as unknown as Record<string, unknown>)[agent.value];
        if (typeof value === "number" && Number.isFinite(value)) {
          detected.add(agent.value);
        }
      });
    });
    return Array.from(detected);
  }, [chartData]);

  const [compareWith, setCompareWith] = useState<string[]>([]);
  const [userTouchedSeries, setUserTouchedSeries] = useState(false);

  useEffect(() => {
    if (!availableSotaSeries.length) {
      if (compareWith.length) {
        setCompareWith([]);
      }
      if (userTouchedSeries) {
        setUserTouchedSeries(false);
      }
      return;
    }

    if (!userTouchedSeries && compareWith.length === 0) {
      setCompareWith(availableSotaSeries);
      return;
    }

    const filtered = compareWith.filter((value) =>
      availableSotaSeries.includes(value)
    );
    if (filtered.length !== compareWith.length) {
      setCompareWith(filtered);
    }
  }, [availableSotaSeries, compareWith, userTouchedSeries]);

  const availableSotaSet = useMemo(
    () => new Set(availableSotaSeries),
    [availableSotaSeries]
  );

  const handleCompareChange = useCallback<Dispatch<SetStateAction<string[]>>>(
    (values) => {
      setUserTouchedSeries(true);
      setCompareWith((previous) =>
        typeof values === "function" ? values(previous) : values
      );
    },
    []
  );

  const filteredData = useMemo(() => {
    if (!chartData.length) return [];
    if (timeRange === "All") {
      return chartData;
    }
    const rangeToLimit: Record<Exclude<FilterOption, "All">, number> = {
      "7R": 7,
      "15R": 15,
      "30R": 30,
    };
    const totalRounds = rangeToLimit[timeRange] ?? chartData.length;
    return chartData.slice(-totalRounds);
  }, [chartData, timeRange]);

  // Generate X-axis ticks from the same visible slice shown in the chart.
  const xAxisTicks = useMemo<number[]>(() => {
    if (!filteredData.length) {
      return [];
    }
    const rounds = filteredData.map((d) => d.round);
    const minRound = Math.min(...rounds);
    const maxRound = Math.max(...rounds);

    const ticks: number[] = [];
    const startTick = Math.ceil(minRound / 4) * 4;
    for (let i = startTick; i <= maxRound; i += 4) {
      ticks.push(i);
    }

    if (!ticks.includes(minRound)) {
      ticks.unshift(minRound);
    }
    if (!ticks.includes(maxRound)) {
      ticks.push(maxRound);
    }

    return ticks.sort((a, b) => a - b);
  }, [filteredData]);

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
    () =>
      sotaAgents
        .filter((agent) => compareWith.includes(agent.value))
        .map((agent) => agent.value),
    [compareWith]
  );

  const yAxisDomain: [number, number] = useMemo(() => {
    if (!filteredData.length) {
      return [0, 100];
    }
    const keys = ["reward", ...selectedSeries];
    let minValue = Infinity;
    let maxValue = -Infinity;
    filteredData.forEach((entry) => {
      keys.forEach((key) => {
        const rawValue = (entry as unknown as Record<string, unknown>)[key];
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
      const upperSingle = Math.min(
        100,
        Number((centered + padding).toFixed(1))
      );
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

  // Custom tooltip to show winner info
  const CustomLeaderboardTooltip = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      const data = payload[0].payload as NormalizedLeaderboardDatum;
      const roundNum = data.round;
      const reward = data.reward ?? data.post_consensus_reward ?? data.subnet36;
      const winnerName = data.winnerName || (data as any).winner_name;
      const winnerUid = data.winnerUid ?? (data as any).winner_uid;

      return (
        <div
          style={{
            backgroundColor: "rgba(17, 24, 39, 0.98)", // gray-900 with high opacity
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          className="rounded-lg border border-gray-700 px-4 py-3 shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {/* Round number */}
            <p
              style={{ color: "#ffffff", borderBottomColor: "#374151" }}
              className="text-sm font-semibold border-b pb-2"
            >
              Round {roundNum}
            </p>

            {/* Winner info */}
            {winnerName && winnerUid !== null && winnerUid !== undefined && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#9ca3af" }} className="text-xs">
                    Miner:
                  </span>
                  <span
                    style={{ color: "#ffffff" }}
                    className="text-sm font-medium"
                  >
                    {winnerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "#9ca3af" }} className="text-xs">
                    UID:
                  </span>
                  <span
                    style={{ color: "#10b981" }}
                    className="text-sm font-medium"
                  >
                    {winnerUid}
                  </span>
                </div>
              </div>
            )}

            {/* Reward */}
            <div
              style={{ borderTopColor: "#374151" }}
              className="flex items-center gap-2 pt-2 border-t"
            >
              <span style={{ color: "#9ca3af" }} className="text-xs">
                Reward:
              </span>
              <span style={{ color: "#10b981" }} className="text-lg font-bold">
                {reward.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    },
    []
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
          title="Top Miner Reward"
          action={
            <ButtonGroupAction
              options={filterOptionValues}
              defaultActive={timeRange}
              onChange={(option) => handleFilterBy(option)}
            />
          }
          headerClassName="flex-row items-center space-between"
          rounded="lg"
          className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
        >
          <div className="flex flex-col flex-1 overflow-hidden">
            <div
              className="flex min-h-0 w-full flex-1 pt-2"
              style={chartContainerStyle}
            >
              <div className="h-full w-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-gray-600 text-sm">
                    Loading chart data...
                  </div>
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
          title="Top Miner Reward"
          action={
            <ButtonGroupAction
              options={filterOptionValues}
              defaultActive={timeRange}
              onChange={(option) => handleFilterBy(option)}
            />
          }
          headerClassName="flex-row items-center space-between"
          rounded="lg"
          className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">
              Error loading leaderboard data
            </p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </WidgetCard>
      </div>
    );
  }

  const chartCard = (
    <WidgetCard
      title={
        effectiveSeason !== null && effectiveSeason !== undefined
          ? `Top Miner Reward - Season ${effectiveSeason}`
          : "Top Miner Reward"
      }
      action={
        <ButtonGroupAction
          options={filterOptionValues}
          defaultActive={timeRange}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex-row items-center space-between"
      rounded="lg"
      className="p-4 lg:p-4 flex h-full flex-col overflow-hidden"
    >
      {showPreviousSeasonFallback && (
        <p className="text-xs text-amber-200/90 mb-1">
          No data for Season {season}; showing Season {fallbackSeason}.
        </p>
      )}
      <div
        className="flex min-h-0 w-full flex-1 pt-2"
        style={chartContainerStyle}
      >
        {filteredData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">Insufficient data for chart</p>
              <p className="text-xs mt-1">Need at least 1 data point</p>
              <p className="text-xs">Current: {filteredData.length} points</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 5, right: 5, bottom: 20, left: 0 }}
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
                ticks={xAxisTicks}
                tickFormatter={xAxisTickFormatter}
                label={{
                  value: "Rounds",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={yAxisDomain}
                tick={<CustomYAxisTick postfix="%" decimals={0} />}
              />
              <Tooltip content={<CustomLeaderboardTooltip />} />
              <Area
                type="monotone"
                dataKey="reward"
                stroke="#10b981"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity={1}
                fill="url(#subnet36Area)"
                dot={
                  filteredData.length === 1
                    ? { r: 4, fill: "#10b981", stroke: "#10b981", strokeWidth: 1 }
                    : false
                }
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
          setValues={handleCompareChange}
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
              labelClassName={cn(
                "w-full",
                !availableSotaSet.has(agent.value) && "text-gray-400"
              )}
              labelPlacement="left"
              size="sm"
              iconClassName="top-0"
              disabled={!availableSotaSet.has(agent.value)}
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
