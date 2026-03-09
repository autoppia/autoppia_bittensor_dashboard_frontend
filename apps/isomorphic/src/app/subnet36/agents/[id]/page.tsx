"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import cn from "@core/utils/class-names";
import { Button, Select, Text } from "rizzui";
import {
  formatWebsiteName,
  getProjectColors,
} from "@/utils/website-colors";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import {
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  AgentHeaderPlaceholder,
  AgentStatsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";
import AgentHistoricalAnalytics from "./agent-historical-analytics";
import { useAgent, useMinerRoundDetails, useMinerHistorical } from "@/services/hooks/useAgents";
import { agentsRepository } from "@/repositories/agents/agents.repository";
import type {
  RewardRoundDataPoint,
  AgentData,
  AgentRoundMetrics,
  AgentRunOverview,
  AgentRunsResponse,
} from "@/repositories/agents/agents.types";
import { routes } from "@/config/routes";
import { resolveAssetUrl } from "@/services/utils/assets";
import {
  PiGithubLogoDuotone,
  PiHashDuotone,
  PiKeyDuotone,
  PiCopyDuotone,
  PiCheckDuotone,
  PiInfoDuotone,
  PiSparkle,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiChartLineDuotone,
  PiChartLineUpDuotone,
  PiChartBarDuotone,
  PiTargetDuotone,
  PiTrophyDuotone,
  PiListChecksDuotone,
  PiTrendUpDuotone,
  PiTimerDuotone,
  PiCaretDownDuotone,
  PiCaretUpDuotone,
} from "react-icons/pi";
import {
  LuTrophy,
  LuAward,
  LuTarget,
  LuStar,
  LuCrown,
} from "react-icons/lu";
import { METRIC_CARD_GRADIENTS } from "@/config/theme-styles";

// ============================================================================
// Shared helpers within this page
const normalizeScore = (value?: number | null): number | null => {
  if (value === null || value === undefined) return null;
  if (Number.isNaN(value)) return null;
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");

const formatBestRoundBadge = (value: number | string | null | undefined) => {
  if (value == null) return null;
  if (typeof value === "string") {
    if (!value.trim()) return null;
    if (value.includes("/")) {
      const [seasonRaw, roundRaw] = value.split("/");
      const season = Number.parseInt(seasonRaw, 10);
      const round = Number.parseInt(roundRaw, 10);
      if (Number.isFinite(season) && Number.isFinite(round)) {
        return `Season ${season} · Round ${round}`;
      }
    }
    return `Round ${value}`;
  }
  if (Number.isFinite(value) && value > 0) {
    return `Round ${value}`;
  }
  return null;
};

/** Shape of each metric card in AgentStats slider */
type AgentStatCardItem = {
  title: string;
  metric: string | number;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  borderColor?: string;
  bgGradient?: string;
  gradient?: string;
  iconGradient?: string;
  iconClassName?: string;
  glowColor?: string;
};

/** Processed chart row for reward-over-time chart */
type ChartRow = Record<string, number | string | null>;

const RUNS_PAGE_SIZE = 100;

async function fetchAllAgentRuns(
  agentId: string,
  params: { roundId?: number; validatorId?: string } = {},
  signal?: AbortSignal
): Promise<{
  runs: AgentRunOverview[];
  total: number;
  validators?: AgentRunsResponse['data']['validators'];
  post_consensus_summary?: AgentRunsResponse['data']['post_consensus_summary'];
}> {
  let page = 1;
  const aggregated: AgentRunOverview[] = [];
  let total = 0;
  let validators: AgentRunsResponse['data']['validators'] | undefined;
  let post_consensus_summary: AgentRunsResponse['data']['post_consensus_summary'] | undefined;

  while (true) {
    // Check if cancelled before making the request
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    const response = await agentsRepository.getAgentRuns(agentId, {
      ...params,
      page,
      limit: RUNS_PAGE_SIZE,
      sortBy: "startTime",
      sortOrder: "desc",
    });

    // Check again after the request (in case it was cancelled during the request)
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    const payload = response?.data;
    const batch = payload?.runs ?? [];
    if (page === 1) {
      total = payload?.total ?? batch.length;
      // Get validators and post_consensus_summary from first page response
      validators = payload?.validators;
      post_consensus_summary = payload?.post_consensus_summary;
    }
    aggregated.push(...batch);
    if (aggregated.length >= total || batch.length < RUNS_PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  return { runs: aggregated, total, validators, post_consensus_summary };
}

// Agent stats band
function AgentStats({
  agent,
  roundMetrics,
  mode = "current",
  preAvg,
}: Readonly<{
  agent?: AgentData | null;
  roundMetrics?: AgentRoundMetrics | null;
  mode?: "current" | "historical";
  preAvg?: { avgResp?: string | number; avgTasks?: string | number };
}>) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  if (!agent) {
    return <AgentStatsPlaceholder />;
  }

  const currentRankValue = (() => {
    if (roundMetrics?.rank != null && roundMetrics.rank > 0) return `#${roundMetrics.rank}`;
    if (agent.currentRank != null && agent.currentRank > 0) return `#${agent.currentRank}`;
    return "N/A";
  })();

  const bestRankEver =
    agent.bestRankEver && agent.bestRankEver > 0
      ? `#${agent.bestRankEver}`
      : "N/A";
  const currentRewardPercentage = `${((roundMetrics?.reward ?? agent.currentReward ?? 0) * 100).toFixed(1)}%`;
  const bestRoundRewardValue =
    agent.bestRoundReward ?? agent.currentTopReward ?? 0;
  const bestEverRewardPercentage = `${(bestRoundRewardValue * 100).toFixed(1)}%`;
  const bestRoundBadge = formatBestRoundBadge(agent.bestRoundId);
  const roundsParticipated = (
    agent.roundsParticipated || agent.totalRuns
  ).toLocaleString();

  // Multiplicando por el 7.5% solicitado por robert
  const totalAlphaValue = Number(agent.alphaWonInPrizes ?? 0) * 0.075;
  const totalAlphaEarned = Math.round(totalAlphaValue);
  const totalTaoEarned = (() => {
    const v = (agent as any).taoWonInPrizes;
    if (typeof v === "number") return (v * 0.075).toFixed(2);
    return (Number(agent.alphaWonInPrizes ?? 0) * 0.075).toFixed(2);
  })();

  const stats = [
    {
      title: "Rank",
      metric: currentRankValue,
      icon: LuAward,
      ...METRIC_CARD_GRADIENTS.blue,
    },
    {
      title: "Success Rate",
      metric: (() => {
        const total =
          mode === "historical"
            ? (agent.totalTasks ?? 0)
            : (roundMetrics?.totalTasks ?? 0);
        const completed =
          mode === "historical"
            ? (agent.completedTasks ?? 0)
            : (roundMetrics?.completedTasks ?? 0);
        return total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
      })(),
      icon: LuTrophy,
      ...METRIC_CARD_GRADIENTS.blue,
    },
    {
      title: "Current Reward",
      metric: currentRewardPercentage,
      icon: LuTarget,
      ...METRIC_CARD_GRADIENTS.emerald,
    },
    {
      title: "Validators",
      metric: (roundMetrics?.totalValidators ?? 0).toString(),
      icon: PiTrophyDuotone,
      ...METRIC_CARD_GRADIENTS.indigo,
    },
    {
      title: "Avg Response Time",
      metric: preAvg?.avgResp ?? "0s",
      icon: PiClockDuotone,
      ...METRIC_CARD_GRADIENTS.blue,
    },
    {
      title: "Avg Task Per Validator",
      metric: preAvg?.avgTasks ?? "0",
      icon: PiListChecksDuotone,
      ...METRIC_CARD_GRADIENTS.indigo,
    },
    {
      title: "Best Ever Reward",
      metric: bestEverRewardPercentage,
      badge: bestRoundBadge,
      icon: LuStar,
      ...METRIC_CARD_GRADIENTS.blue,
    },
    {
      title: "Alpha Earned",
      metric: `${totalAlphaEarned} α`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
    {
      title: "TAO Earned",
      metric: `${totalTaoEarned} τ`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
  ];

  // In current view: show Rank, Current Score, Avg Response Time, Validators, Avg Tasks
  // In historical view: show Success Rate, Best Reward Ever, Alpha Earned
  const displayStats = (
    mode === "current"
      ? [stats[0], stats[2], stats[4], stats[3], stats[5]]
      : [stats[1], stats[6], stats[7]]
  ).filter(Boolean);

  return (
    <div className="relative flex w-auto items-center overflow-visible z-20">
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-[100] !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent px-0 ps-1 text-white/70 hover:text-white 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-visible pt-3 pb-4">
        <div
          ref={sliderEl}
          className="custom-scrollbar grid grid-flow-col gap-3 overflow-x-auto overflow-y-visible scroll-smooth 2xl:gap-4 3xl:gap-5 px-2 py-2 [&::-webkit-scrollbar]:h-0"
        >
          {displayStats.map((stat: AgentStatCardItem) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border bg-gradient-to-br",
                  "min-w-[200px] cursor-pointer z-[30] hover:z-[90]",
                  stat.borderColor,
                  stat.bgGradient
                )}
              >
                {/* Animated pulsing background like main card */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-3xl opacity-20 bg-gradient-to-br pointer-events-none",
                    stat.gradient
                  )}
                />

                {/* Animated glow effect */}
                <div
                  className="pointer-events-none absolute -inset-20 -z-0 rotate-12 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-30 group-hover:blur-xl"
                  style={{
                    maskImage: "radial-gradient(white, transparent)",
                    WebkitMaskImage: "radial-gradient(white, transparent)",
                    background: `radial-gradient(circle, ${stat.glowColor ?? "transparent"}, transparent 70%)`,
                  }}
                />

                {/* Shine effect on hover */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
                  }}
                />

                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex items-center justify-center w-16 h-16 rounded-2xl shadow-md transition-all duration-300 group-hover:scale-105 bg-gradient-to-br",
                        "border-2 border-white/30 group-hover:border-white/40",
                        stat.iconGradient
                      )}
                    >
                      <Icon className="w-8 h-8 text-white drop-shadow" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                      <div className="w-2 h-2 rounded-full bg-white/40" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Text className="font-black text-3xl leading-none text-white transition-transform duration-300 group-hover:scale-105">
                        {stat.metric}
                      </Text>
                      {stat.badge ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-white/15 text-white/90 border border-white/25 shadow-sm flex-shrink-0">
                          {stat.badge}
                        </span>
                      ) : null}
                    </div>
                    <Text className="text-[11px] font-black text-white/80 group-hover:text-white uppercase tracking-[0.35em] transition-colors duration-300 leading-tight">
                      {stat.title}
                    </Text>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute -right-2 top-0 z-[100] !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-slate-900 via-slate-900/60 to-transparent px-0 pe-2 text-white/70 hover:text-white 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}

// Score over time char
const filterOptions = ["7R", "15R", "30R", "All"];
const BENCHMARK_COLORS: Record<string, string> = {
  openai: "#2563EB",
  anthropic: "#F97316",
  browser: "#8B5CF6",
  "browser-use": "#8B5CF6",
  browser_use: "#8B5CF6",
  claude: "#F97316",
};
const BENCHMARK_COLOR_PALETTE = [
  "#2563EB",
  "#F97316",
  "#8B5CF6",
  "#14B8A6",
  "#F472B6",
  "#EC4899",
];

function AgentScoreChart({
  className,
  rewardRoundData = [] as RewardRoundDataPoint[],
  loading = false,
  error,
  title = "Reward Over Time",
}: Readonly<{
  className?: string;
  rewardRoundData?: RewardRoundDataPoint[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}>) {
  const [timeRange, setTimeRange] = useState<"7r" | "15r" | "30r" | "all">(
    "all"
  );

  const { processedRows, benchmarkSeries } = useMemo(() => {
    const seriesMap = new Map<string, { label: string; color: string }>();

    const rows = rewardRoundData
      .map((point) => {
        const row: ChartRow = {
          round: point.round ?? point.round_id, // Use numeric round field if available (historical), otherwise round_id
          roundLabel: point.round_id, // Keep string format for display (e.g., "1/1")
          reward: normalizeScore(point.reward) ?? 0,
          rank: point.rank ?? null,
          eval_score: point.eval_score ?? null,
          eval_time: point.eval_time ?? null,
          timestamp: point.timestamp,
        };

        const topReward = normalizeScore(point.topReward);
        if (topReward !== null) row.topBenchmarkScore = topReward;

        if (Array.isArray(point.benchmarks) && point.benchmarks.length > 0) {
          point.benchmarks.forEach((benchmark, idx) => {
            const rawId =
              benchmark.provider || benchmark.name || `benchmark-${idx}`;
            const slug = slugify(rawId);
            const key = `benchmark_${slug || idx}`;
            const normalized = normalizeScore(benchmark.reward);

            if (!seriesMap.has(key)) {
              const color =
                BENCHMARK_COLORS[slug] ||
                BENCHMARK_COLOR_PALETTE[
                  seriesMap.size % BENCHMARK_COLOR_PALETTE.length
                ];
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
      .filter(
        (entry) =>
          typeof entry.round === "number" &&
          Number.isFinite(entry.round) &&
          entry.round > 0
      )
      .sort((a, b) => Number(a.round) - Number(b.round));

    return {
      processedRows: rows,
      benchmarkSeries: Array.from(seriesMap.entries()).map(([key, meta]) => ({
        key,
        label: meta.label,
        color: meta.color,
      })),
    };
  }, [rewardRoundData]);

  function handleFilterBy(option: string) {
    if (option === "7R") setTimeRange("7r");
    else if (option === "15R") setTimeRange("15r");
    else if (option === "30R") setTimeRange("30r");
    else setTimeRange("all");
  }

  if (loading) {
    return <AgentScoreChartPlaceholder className={className} />;
  }

  if (error && processedRows.length === 0) {
    return (
      <WidgetCard
        title={title}
        action={
          <ButtonGroupAction
            options={filterOptions}
            onChange={(option) => handleFilterBy(option)}
          />
        }
        headerClassName="flex-row items-start space-between text-white pb-4"
        rounded="xl"
        className={className}
        titleClassName="text-sm md:text-base sm:text-lg text-white"
      >
        <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none" />
        <div className="relative flex h-[273px] items-center justify-center text-rose-200">
          <div className="text-center">
            <p className="text-lg font-semibold">
              Error loading performance data
            </p>
            <p className="mt-2 text-sm text-white/80">{error}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  const getFilteredData = (data: any[]) => {
    if (data.length === 0 || timeRange === "all") return data;
    const maxRound = Math.max(...data.map((d) => d.round));
    const roundsToShow = timeRange === "7r" ? 7 : timeRange === "15r" ? 15 : 30;
    const minRound = Math.max(1, maxRound - roundsToShow + 1);
    return data.filter((d) => d.round >= minRound);
  };

  const displayData = getFilteredData(processedRows).map((entry: any) => {
    const scaled: Record<string, number | string | null> = {
      ...entry,
      reward: entry.reward != null ? Number(entry.reward) * 100 : entry.reward,
      topBenchmarkScore:
        entry.topBenchmarkScore != null
          ? Number(entry.topBenchmarkScore) * 100
          : entry.topBenchmarkScore,
    };
    benchmarkSeries.forEach((series) => {
      if (scaled[series.key] != null)
        scaled[series.key] = Number(scaled[series.key]) * 100;
    });
    return scaled;
  });

  const hasTopBenchmark = displayData.some(
    (entry) => typeof entry.topBenchmarkScore === "number"
  );
  const rewardValues = displayData
    .flatMap((entry) => {
      const values: number[] = [];
      if (typeof entry.reward === "number") values.push(entry.reward);
      if (typeof entry.topBenchmarkScore === "number")
        values.push(entry.topBenchmarkScore);
      benchmarkSeries.forEach((series) => {
        if (typeof entry[series.key] === "number")
          values.push(entry[series.key] as number);
      });
      return values;
    })
    .filter((value) => Number.isFinite(value));

  const computeDomain = () => {
    if (!rewardValues.length) return [0, 100] as [number, number];
    const minValue = Math.min(...rewardValues);
    const maxValue = Math.max(...rewardValues);
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.2 : Math.max(5, maxValue * 0.1 || 5);
    const lowerBound = Math.max(0, minValue - padding);
    const upperBound = Math.min(100, maxValue + padding);
    return [Math.floor(lowerBound), Math.ceil(upperBound)] as [number, number];
  };

  const yAxisDomain = computeDomain();
  const legendItems = [
    { label: "Miner reward", color: "#10B981" },
    ...(hasTopBenchmark
      ? [{ label: "Top miner reward", color: "#FACC15" }]
      : []),
    ...benchmarkSeries.map((series) => ({
      label: series.label,
      color: series.color,
    })),
  ];

  return (
    <WidgetCard
      title={
        <span className="text-md lg:text-2xl font-black text-white">
          {title}
        </span>
      }
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(option) => handleFilterBy(option)}
        />
      }
      headerClassName="flex-row items-start space-between pb-2"
      rounded="xl"
      className={cn(
        "flex flex-col min-h-[350px] md:min-h-[500px] p-4 lg:p-5 !bg-transparent !border-transparent !shadow-none",
        className
      )}
      titleClassName="text-white"
    >
      <div className="pulse-bg-rounded-2xl" style={{ display: "none" }} />
      {processedRows.length === 0 && (
        <div
          className={cn(
            "relative mb-4 rounded-lg backdrop-blur-sm p-3 text-sm text-white/90 border border-white/20 bg-blue-900/20"
          )}
        >
          <strong>No history yet:</strong> This agent has not completed any
          recorded rounds.
        </div>
      )}
      <div className="relative custom-scrollbar flex-1 overflow-x-auto scroll-smooth">
        <div className={cn("w-full pt-2 h-[250px] md:h-[360px]")}>
          <ResponsiveContainer width="100%" height="100%" minWidth={600}>
            <ComposedChart
              data={displayData}
              margin={{ top: 10, left: -10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="rewardArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.15)"
              />
              <XAxis
                dataKey="round"
                axisLine
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                tick={{
                  fill: "rgba(226,232,240,0.9)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
                label={{
                  value: "Rounds",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                axisLine
                tickLine={false}
                domain={yAxisDomain}
                tick={<CustomYAxisTick postfix="%" />}
                stroke="rgba(148,163,184,0.3)"
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;

                  // Get post-consensus data from the payload
                  const reward = data?.reward ?? 0;
                  const evalScore = data?.eval_score != null && typeof data.eval_score === 'number' ? data.eval_score : null;
                  const evalTime = data?.eval_time != null && typeof data.eval_time === 'number' ? data.eval_time : null;

                  return (
                    <div className="rounded-2xl border-2 border-white/30 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] px-4 py-3">
                      <div className="text-center font-bold text-sm mb-2 pb-2 border-b border-white/10">
                        Round {label}{data?.rank ? ` (Rank #${data.rank})` : ""}
                      </div>
                      <div className="space-y-2 text-sm">
                        {/* Reward */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-3 w-3 rounded-full shadow-lg ring-2 ring-white/20"
                              style={{ backgroundColor: "#F59E0B" }}
                            />
                            <span className="text-white/90 font-semibold">Reward:</span>
                          </div>
                          <span className="font-black text-white text-base">
                            {(reward * 100).toFixed(2)}%
                          </span>
                        </div>

                        {/* Score (eval_score) */}
                        {evalScore != null && !Number.isNaN(Number(evalScore)) && (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 rounded-full shadow-lg ring-2 ring-white/20"
                                style={{ backgroundColor: "#3B82F6" }}
                              />
                              <span className="text-white/90 font-semibold">Score:</span>
                            </div>
                            <span className="font-black text-white text-base">
                              {(evalScore * 100).toFixed(2)}%
                            </span>
                          </div>
                        )}

                        {/* Avg Time (eval_time) */}
                        {evalTime != null && !Number.isNaN(Number(evalTime)) && (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 rounded-full shadow-lg ring-2 ring-white/20"
                                style={{ backgroundColor: "#10B981" }}
                              />
                              <span className="text-white/90 font-semibold">Avg Time:</span>
                            </div>
                            <span className="font-black text-white text-base">
                              {Number(evalTime).toFixed(2)}s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="reward"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rewardArea)"
                name="Miner reward"
              />
              {hasTopBenchmark && (
                <Line
                  type="monotone"
                  dataKey="topBenchmarkScore"
                  stroke="#FACC15"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 4"
                  name="Top miner reward"
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
        <div className="relative mt-3 flex flex-wrap justify-center gap-6">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/15 shadow-sm"
            >
              <div
                className="h-4 w-4 rounded-full shadow-lg"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}66`,
                }}
              />
              <span className="text-white font-medium text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

// Validators/runs list
function AgentValidators({
  selectedRound,
  selectedSeason,
  selectedRoundInSeason,
  runs,
  loading,
  error,
  numericUidFromParam,
  validators,
  post_consensus_summary,
  minerRoundDetailsValidators,
  roundAvgCostPerTask,
  postConsensusRounds,
}: Readonly<{
  selectedRound?: number | string | null;
  selectedSeason?: number | null;
  selectedRoundInSeason?: number | null;
  runs: AgentRunOverview[];
  loading: boolean;
  error?: string | null;
  numericUidFromParam?: number;
  validators?: AgentRunsResponse['data']['validators'];
  post_consensus_summary?: AgentRunsResponse['data']['post_consensus_summary'];
  minerRoundDetailsValidators?: Array<{
    validator_uid: number;
    validator_name: string;
    validator_hotkey: string | null;
    validator_image: string | null;
    local_rank: number | null;
    local_avg_reward: number;
    local_avg_eval_score: number;
    local_avg_eval_time: number;
    local_tasks_received: number;
    local_tasks_success: number;
    local_miners_evaluated: number;
    agent_run_id?: string;
  }>;
  roundAvgCostPerTask?: number | null;
  postConsensusRounds?: Array<{
    round: string | number;
    post_consensus_rank: number | null;
    post_consensus_avg_reward: number;
    post_consensus_avg_eval_score?: number | null;
    post_consensus_avg_eval_time: number;
    post_consensus_avg_eval_cost?: number | null;
    tasks_received: number;
    tasks_success: number;
    validators_count: number;
    websites_count?: number;
    post_consensus_available?: boolean;
    weight?: number;
  }>;
}>) {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [selectedRunsRoundKey, setSelectedRunsRoundKey] = useState<string>("all");

  const getRoundMeta = useCallback((value: number | string | null | undefined) => {
    if (value == null) return null;
    if (typeof value === "string" && value.includes("/")) {
      const [seasonRaw, roundRaw] = value.split("/");
      const season = Number.parseInt(seasonRaw, 10);
      const round = Number.parseInt(roundRaw, 10);
      if (!Number.isFinite(season) || !Number.isFinite(round)) return null;
      return {
        key: `${season}/${round}`,
        season,
        round,
        label: `Season ${season} · Round ${round}`,
      };
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    const season = parsed >= 10000 ? Math.floor(parsed / 10000) : selectedSeason ?? 0;
    const round = parsed >= 10000 ? parsed % 10000 : parsed;
    return {
      key: `${season}/${round}`,
      season,
      round,
      label: season > 0 ? `Season ${season} · Round ${round}` : `Round ${round}`,
    };
  }, [selectedSeason]);

  const normalizedRuns = useMemo(() => {
    return [...runs]
      .map((run) => {
        const meta = getRoundMeta(run.roundId);
        return meta ? { ...run, __roundMeta: meta } : null;
      })
      .filter((run): run is AgentRunOverview & { __roundMeta: { key: string; season: number; round: number; label: string } } => Boolean(run))
      .sort((a, b) => {
        if (a.__roundMeta.season !== b.__roundMeta.season) {
          return b.__roundMeta.season - a.__roundMeta.season;
        }
        if (a.__roundMeta.round !== b.__roundMeta.round) {
          return b.__roundMeta.round - a.__roundMeta.round;
        }
        return String(b.startTime ?? "").localeCompare(String(a.startTime ?? ""));
      });
  }, [getRoundMeta, runs]);

  const roundOptions = useMemo(() => {
    const options = [{ label: "All rounds", value: "all" }];
    const seen = new Set<string>();
    normalizedRuns.forEach((run) => {
      if (seen.has(run.__roundMeta.key)) return;
      seen.add(run.__roundMeta.key);
      options.push({ label: run.__roundMeta.label, value: run.__roundMeta.key });
    });
    return options;
  }, [normalizedRuns]);

  useEffect(() => {
    if (selectedRunsRoundKey === "all") return;
    if (!roundOptions.some((option) => option.value === selectedRunsRoundKey)) {
      setSelectedRunsRoundKey("all");
    }
  }, [roundOptions, selectedRunsRoundKey]);

  const groupedRuns = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        season: number;
        round: number;
        label: string;
        runs: Array<AgentRunOverview & { __roundMeta: { key: string; season: number; round: number; label: string } }>;
      }
    >();

    normalizedRuns.forEach((run) => {
      if (selectedRunsRoundKey !== "all" && run.__roundMeta.key !== selectedRunsRoundKey) {
        return;
      }
      const existing = groups.get(run.__roundMeta.key);
      if (existing) {
        existing.runs.push(run);
        return;
      }
      groups.set(run.__roundMeta.key, {
        key: run.__roundMeta.key,
        season: run.__roundMeta.season,
        round: run.__roundMeta.round,
        label: run.__roundMeta.label,
        runs: [run],
      });
    });

    return Array.from(groups.values());
  }, [normalizedRuns, selectedRunsRoundKey]);

  const postConsensusByRound = useMemo(() => {
    const byRound = new Map<string, NonNullable<typeof postConsensusRounds>[number]>();
    (postConsensusRounds ?? []).forEach((entry) => {
      const meta = getRoundMeta(entry.round);
      if (!meta) return;
      byRound.set(meta.key, entry);
    });
    return byRound;
  }, [getRoundMeta, postConsensusRounds]);

  if (loading) {
    return <AgentValidatorsPlaceholder />;
  }

  if (error) {
    return (
      <div className="mt-6">
        <div className="text-center py-12 text-red-300">{error}</div>
      </div>
    );
  }

  if (!groupedRuns.length) {
    return (
      <div className="mt-6">
        <div className="text-center py-12 text-white/70">
          No validator runs found for this agent in the selected season.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-3">
        <div className="flex items-center flex-col sm:flex-row gap-3">
          <Text className="text-md sm:text-2xl text-center font-bold text-white">
            Agent Runs by Round
            {selectedSeason ? ` · Season ${selectedSeason}` : ""}
          </Text>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Select
            options={roundOptions}
            value={roundOptions.find((option) => option.value === selectedRunsRoundKey) ?? roundOptions[0]}
            onChange={(option: any) => setSelectedRunsRoundKey(String(option?.value ?? "all"))}
            className="w-full sm:w-[240px]"
            placeholder="Filter rounds"
          />
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="group flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium text-white hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 shadow-sm hover:shadow-md backdrop-blur-sm w-full sm:w-auto"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                <PiInfoDuotone className="w-3.5 h-3.5 text-white" />
              </div>
              <span>How it works</span>
            </div>
            <div className="transition-transform duration-300 group-hover:scale-110">
              {isInfoExpanded ? (
                <PiCaretUpDuotone className="w-4 h-4 text-white/80 group-hover:text-white" />
              ) : (
                <PiCaretDownDuotone className="w-4 h-4 text-white/80 group-hover:text-white" />
              )}
            </div>
          </button>
        </div>
      </div>

      {isInfoExpanded && (
        <div
          className="mb-4 md:mb-6 rounded-2xl p-3 md:p-6 animate-in slide-in-from-top-2 duration-500"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          <div className="pulse-bg-rounded-2xl" style={{ display: "none" }} />
          <div className="relative z-10 flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <PiInfoDuotone className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-lg font-bold text-white">
                How Agent Evaluation Works
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                Understanding the validation process
              </p>
            </div>
          </div>
          <div className="relative z-10 space-y-2 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div
                className="rounded-lg md:rounded-xl p-3 md:p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg ring-1 md:ring-2 ring-white/20">
                    <PiTrophyDuotone className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Validators
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  Each validator evaluates your agent independently on the same task set.
                  Local results are computed first, then merged in post-consensus.
                </p>
              </div>
              <div
                className="rounded-lg md:rounded-xl p-3 md:p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg ring-1 md:ring-2 ring-white/20">
                    <PiCurrencyDollarDuotone className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Reward Formula
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  Per solved task, reward combines quality, speed, and efficiency:
                  <span className="mt-1 block rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-[11px] md:text-xs text-white/90">
                    Reward = (EVAL_SCORE_WEIGHT × 1.0) + (TIME_WEIGHT × (1 − time / TASK_TIMEOUT_SECONDS)) + (COST_WEIGHT × (1 − cost / REWARD_TASK_DOLLAR_COST_NORMALIZATOR))
                  </span>
                  <span className="mt-1 block">If the task is not solved, reward = 0.</span>
                </p>
              </div>
              <div
                className="rounded-lg md:rounded-xl p-3 md:p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg ring-1 md:ring-2 ring-white/20">
                    <LuAward className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Effective Ranking
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  In each new round, your effective competition reward is
                  <span className="font-mono text-white/90"> max(round_reward, best_reward_in_season)</span>.
                  Rank is computed with that effective reward against other miners.
                </p>
              </div>
              <div
                className="rounded-lg md:rounded-xl p-3 md:p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg ring-1 md:ring-2 ring-white/20">
                    <PiTimerDuotone className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Time & Cost Limits
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  Faster execution and lower cost improve reward shaping.
                  Exceeding timeout/cost thresholds can force failures or zero-reward outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {groupedRuns.map((group) => {
          const runsByValidator = group.runs.reduce(
            (acc, run) => {
              if (!acc[run.validatorId]) acc[run.validatorId] = [];
              acc[run.validatorId].push(run);
              return acc;
            },
            {} as Record<string, typeof group.runs>
          );
          const postConsensus = postConsensusByRound.get(group.key);
          const groupWebsitesCount = Object.values(runsByValidator).reduce((maxCount, validatorRuns) => {
            const latestRun = validatorRuns[0];
            const count =
              typeof latestRun.websitesCount === "number"
                ? latestRun.websitesCount
                : typeof latestRun.totalWebsites === "number"
                  ? latestRun.totalWebsites
                  : 0;
            return Math.max(maxCount, count);
          }, 0);

          return (
            <div key={group.key} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Text className="text-lg sm:text-xl font-bold text-white">
                  {group.label}
                </Text>
                <Text className="text-xs sm:text-sm text-white/60">
                  {Object.keys(runsByValidator).length} validator run{Object.keys(runsByValidator).length === 1 ? "" : "s"}
                </Text>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 sm:px-2 sm:py-2">
                {postConsensus?.post_consensus_available ? (
                  <div className="group rounded-2xl border-2 border-cyan-400/35 bg-cyan-500/10">
                    <div className="relative p-5 border-b border-white/15 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent backdrop-blur-sm rounded-t-2xl">
                      <Text className="font-bold text-white text-base">Validator consensus</Text>
                      <Text className="text-xs text-white/60 tracking-wide">
                        Final metrics after validator consensus
                      </Text>
                    </div>
                    <div className="relative p-2 sm:p-5">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-transparent border border-white/15 rounded-xl p-3 sm:p-5">
                        {[
                          { title: "Reward", metric: `${(postConsensus.post_consensus_avg_reward * 100).toFixed(2)}%`, icon: PiChartLineUpDuotone, iconClassName: "bg-gradient-to-br from-emerald-500 to-green-600" },
                          { title: "Score", metric: `${((postConsensus.post_consensus_avg_eval_score ?? 0) * 100).toFixed(1)}%`, icon: PiTargetDuotone, iconClassName: "bg-gradient-to-br from-violet-500 to-fuchsia-600" },
                          { title: "Time", metric: `${Number(postConsensus.post_consensus_avg_eval_time ?? 0).toFixed(2)}s`, icon: PiTimerDuotone, iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600" },
                          { title: "Tasks", metric: `${postConsensus.tasks_success}/${postConsensus.tasks_received}`, icon: PiListChecksDuotone, iconClassName: "bg-gradient-to-br from-indigo-500 to-blue-600" },
                          { title: "Websites", metric: String(postConsensus.websites_count ?? groupWebsitesCount ?? 0), icon: PiChartBarDuotone, iconClassName: "bg-gradient-to-br from-pink-500 to-rose-600" },
                          { title: "Avg Cost", metric: postConsensus.post_consensus_avg_eval_cost != null ? `$${Number(postConsensus.post_consensus_avg_eval_cost).toFixed(3)}` : "N/A", icon: PiCurrencyDollarDuotone, iconClassName: "bg-gradient-to-br from-amber-500 to-orange-600" },
                        ].map((stat) => {
                          const Icon = stat.icon as any;
                          return (
                            <div key={stat.title} className="flex items-center sm:gap-2.5 gap-2 min-w-0">
                              <div className={cn("flex items-center justify-center w-7 h-7 sm:w-11 sm:h-11 rounded-md sm:rounded-xl text-white flex-shrink-0 shadow-lg ring-2 ring-white/20", stat.iconClassName)}>
                                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <Text className="text-xs text-white/70 font-medium">{stat.title}</Text>
                                <Text className="font-bold text-xs sm:text-base truncate text-white">{stat.metric}</Text>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
                {Object.entries(runsByValidator).map(([validatorId, validatorRuns]) => {
                  const latestRun = validatorRuns[0];
                  const responseTimeSeconds =
                    typeof latestRun.averageEvaluationTime === "number" && Number.isFinite(latestRun.averageEvaluationTime)
                      ? latestRun.averageEvaluationTime
                      : latestRun.duration ?? 0;
                  const websitesCount = (() => {
                    const anyRun: any = latestRun as any;
                    if (typeof anyRun.websitesCount === "number") return anyRun.websitesCount;
                    if (typeof anyRun.totalWebsites === "number") return anyRun.totalWebsites;
                    return 0;
                  })();

                  const stats = [
                    { title: "Reward", metric: `${((latestRun.overallReward ?? latestRun.reward ?? 0) * 100).toFixed(2)}%`, icon: PiChartLineUpDuotone, iconClassName: "bg-gradient-to-br from-emerald-500 to-green-600" },
                    { title: "Score", metric: `${((latestRun.averageScore ?? 0) * 100).toFixed(1)}%`, icon: PiTargetDuotone, iconClassName: "bg-gradient-to-br from-violet-500 to-fuchsia-600" },
                    { title: "Time", metric: `${Number(responseTimeSeconds).toFixed(2)}s`, icon: PiTimerDuotone, iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600" },
                    { title: "Tasks", metric: `${Math.max(0, latestRun.successfulTasks ?? latestRun.completedTasks ?? 0)}/${Math.max(0, latestRun.totalTasks ?? 0)}`, icon: PiListChecksDuotone, iconClassName: "bg-gradient-to-br from-indigo-500 to-blue-600" },
                    { title: "Websites", metric: websitesCount, icon: PiChartBarDuotone, iconClassName: "bg-gradient-to-br from-pink-500 to-rose-600" },
                    { title: "Avg Cost", metric: latestRun.avgCostPerTask != null ? `$${Number(latestRun.avgCostPerTask).toFixed(3)}` : "N/A", icon: PiCurrencyDollarDuotone, iconClassName: "bg-gradient-to-br from-amber-500 to-orange-600" },
                  ];

                  return (
                    <Link key={`agent-run-${group.key}-${validatorId}`} href={`${routes.agent_run}/${latestRun.runId}`}>
                      <div className="group transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] rounded-2xl cursor-pointer z-10 hover:z-40 border-2 border-white/20 hover:border-white/40">
                        <div className="relative p-5 border-b border-white/15 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-sm rounded-t-2xl">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/30">
                                <Image
                                  src={resolveAssetUrl(latestRun.validatorImage || "/validators/default.png")}
                                  alt={latestRun.validatorName || validatorId}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Text className="font-bold text-white text-base">
                                  {latestRun.validatorName || validatorId}
                                </Text>
                                <Text className="text-xs text-white/60 tracking-wide font-mono truncate">
                                  {validatorId}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative p-2 sm:p-5 space-y-3">
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-transparent border border-white/15 rounded-xl p-3 sm:p-5">
                            {stats.map((stat) => {
                              const Icon = stat.icon as any;
                              return (
                                <div key={stat.title} className="flex items-center sm:gap-2.5 gap-2 min-w-0">
                                  <div className={cn("flex items-center justify-center w-7 h-7 sm:w-11 sm:h-11 rounded-md sm:rounded-xl text-white flex-shrink-0 shadow-lg ring-2 ring-white/20", stat.iconClassName)}>
                                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <Text className="text-xs text-white/70 font-medium">{stat.title}</Text>
                                    <Text className="font-bold text-xs sm:text-base truncate text-white">{stat.metric}</Text>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Enhanced custom tooltip for bar chart
type WebsiteTooltipPayload = { website?: string; successRate?: number; successful?: number; total?: number };
const WebsitePerformanceTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WebsiteTooltipPayload }> }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;
  const successRate = Math.round(Number(data.successRate) || 0);
  const successful = Number(data.successful) || 0;
  const total = Number(data.total) || 0;
  const failed = total - successful;

  return (
    <div className="rounded-2xl border-2 border-white/30 bg-slate-900/95 p-4 shadow-2xl min-w-[220px]">
      {/* Website name header */}
      <div className="mb-3 pb-3 border-b border-white/20">
        <div className="text-base font-bold text-white mb-1">
          {String(data.website ?? "")}
        </div>
        <div className="text-xs text-white/60 font-medium">
          Performance Metrics
        </div>
      </div>

      {/* Success Rate - Main metric */}
      <div className="mb-3 p-1 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
            Success Rate
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
        <div className="text-md sm:text-2xl font-black text-white">
          {successRate}%
        </div>
      </div>

      {/* Task breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200 border-b border-white/10 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg"
              style={{ boxShadow: "0 0 8px rgba(96, 165, 250, 0.6)" }}
            />
            <span className="text-xs font-medium text-white/90">All Tasks</span>
          </div>
          <span className="text-sm font-bold text-blue-300">{String(total)}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg"
              style={{ boxShadow: "0 0 8px rgba(52, 211, 153, 0.6)" }}
            />
            <span className="text-xs font-medium text-white/90">Success</span>
          </div>
          <span className="text-sm font-bold text-emerald-300">
            {String(successful)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-lg"
              style={{ boxShadow: "0 0 8px rgba(251, 113, 133, 0.6)" }}
            />
            <span className="text-xs font-medium text-white/90">Failed</span>
          </div>
          <span className="text-sm font-bold text-rose-300">{String(failed)}</span>
        </div>
      </div>
    </div>
  );
};

// Websites performance for current round
function RoundWebsitesChart({
  agentId,
  selectedRound,
  runs,
  onSummaryChange,
}: Readonly<{
  agentId: string;
  selectedRound?: number | null;
  runs: AgentRunOverview[];
  onSummaryChange?: (summary: {
    uniqueWebsites: number;
    totalTasks: number;
  }) => void;
}>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRows, setChartRows] = useState<
    Array<{
      website: string;
      websiteOriginal: string; // Nombre original del website para buscar colores
      successRate: number;
      successful: number;
      total: number;
    }>
  >([]);
  const [totals, setTotals] = useState<{ successful: number; total: number }>({
    successful: 0,
    total: 0,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const runsForRound = useMemo(() => {
    if (!selectedRound) return runs;
    return runs.filter((run) => run.roundId === selectedRound);
  }, [runs, selectedRound]);

  useEffect(() => {
    let cancelled = false;
    async function fetchWebsites() {
      if (
        !selectedRound ||
        !Number.isFinite(selectedRound) ||
        runsForRound.length === 0
      ) {
        setLoading(false);
        setChartRows([]);
        setTotals({ successful: 0, total: 0 });
        onSummaryChange?.({ uniqueWebsites: 0, totalTasks: 0 });
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const details = await Promise.all(
          runsForRound.map(async (run) => {
            try {
              return await agentsRepository.getAgentRun(agentId, run.runId);
            } catch (e) {
              console.error("getAgentRun failed for run", run.runId, e);
              return null;
            }
          })
        );

        const bySite = new Map<string, { successful: number; total: number }>();
        let totalSuccessful = 0;
        let totalTasks = 0;
        details.forEach((run) => {
          if (!run || !Array.isArray(run.websites)) return;
          run.websites.forEach((w) => {
            const key = (w.website || "unknown").toString();
            const entry = bySite.get(key) || { successful: 0, total: 0 };
            const succ = Number.isFinite(Number(w.successful))
              ? Math.max(0, Number(w.successful))
              : 0;
            const tasks = Number.isFinite(Number(w.tasks))
              ? Math.max(0, Number(w.tasks))
              : 0;
            entry.successful += succ;
            entry.total += tasks;
            bySite.set(key, entry);
            totalSuccessful += succ;
            totalTasks += tasks;
          });
        });

        const rows = Array.from(bySite.entries())
          .map(([website, { successful, total }]) => ({
            website: formatWebsiteName(website),
            websiteOriginal: website, // Guardar el nombre original para buscar colores
            successful,
            total,
            successRate: total > 0 ? (successful / total) * 100 : 0,
          }))
          .sort((a, b) => b.successRate - a.successRate);

        if (!cancelled) {
          setChartRows(rows);
          setTotals({ successful: totalSuccessful, total: totalTasks });
          onSummaryChange?.({
            uniqueWebsites: rows.length,
            totalTasks: totalTasks,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load website stats");
          onSummaryChange?.({ uniqueWebsites: 0, totalTasks: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWebsites();
    return () => {
      cancelled = true;
    };
  }, [agentId, onSummaryChange, runsForRound, selectedRound]);

  const totalRate =
    totals.total > 0 ? Math.round((totals.successful / totals.total) * 100) : 0;

  return (
    <div className="relative">
      {loading ? (
        <div className="relative flex h-[420px] items-center justify-center text-white/70">
          Loading website stats…
        </div>
      ) : error ? (
        <div className="relative flex h-[420px] items-center justify-center text-rose-200">
          {error}
        </div>
      ) : chartRows.length === 0 ? (
        <div className="relative flex h-[420px] items-center justify-center text-white/70">
          No website stats available for this round.
        </div>
      ) : (
        <>
          {/* Performance per website heading */}
          <div className="mb-6">
            <span className="text-xl sm:text-2xl font-black text-white">
              Performance per website
            </span>
          </div>

          {/* Bar Chart */}
          <div className="relative h-[300px] md:h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartRows}
                margin={{ top: 20, left: -10 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive) {
                    setActiveIndex(state.activeTooltipIndex ?? null);
                  } else {
                    setActiveIndex(null);
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <defs>
                  {/* Generate gradients dynamically based on website colors */}
                  {chartRows.map((entry, index) => {
                    // Usar websiteOriginal (nombre del backend) para buscar colores
                    // Si no está disponible, usar website (nombre formateado)
                    const websiteNameForColor = entry.websiteOriginal || entry.website;
                    const colors = getProjectColors(websiteNameForColor);
                    return (
                      <linearGradient
                        key={`barGradient${index}`}
                        id={`barGradient${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={colors.mainColor} stopOpacity={1} />
                        <stop offset="50%" stopColor={colors.mainColor} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={colors.mainColor} stopOpacity={0.9} />
                      </linearGradient>
                    );
                  })}
                  {/* Generate glow filters for hover effect */}
                  {chartRows.map((entry, index) => (
                    <filter
                      key={`glow${index}`}
                      id={`glow${index}`}
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.15)"
                />
                <XAxis
                  dataKey="website"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffffff", fontSize: 13, fontWeight: 700 }}
                  height={60}
                  angle={0}
                  textAnchor="middle"
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomYAxisTick postfix="%" />}
                  stroke="rgba(148,163,184,0.3)"
                />
                <Tooltip
                  content={<WebsitePerformanceTooltip />}
                  cursor={{
                    fill: "rgba(255, 255, 255, 0.08)",
                  }}
                  wrapperStyle={{
                    outline: "none",
                    zIndex: 1000,
                  }}
                />
                <Bar
                  dataKey="successRate"
                  radius={[12, 12, 0, 0]}
                  maxBarSize={80}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartRows.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#barGradient${index})`}
                      filter={
                        activeIndex === index
                          ? `url(#glow${index})`
                          : undefined
                      }
                      fillOpacity={
                        activeIndex === null
                          ? 0.9
                          : activeIndex === index
                            ? 1
                            : 0.4
                      }
                      style={{
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        transformOrigin: "center bottom",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
// Main Agent page (header + sections)
export default function Page() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const agentParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const trimmedId = agentParam?.trim() ?? "";
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");
  const roundParam = searchParams.get("round");
  const [copiedHotkey, setCopiedHotkey] = useState(false);
  const selectedSeasonNumber = useMemo(() => {
    const parsed = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    return parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
  }, [seasonParam]);

  const selectedRoundFromQuery = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    const round = roundParam ? Number.parseInt(roundParam, 10) : undefined;

    if (season !== undefined && Number.isFinite(season) && round !== undefined && Number.isFinite(round)) {
      return `${season}/${round}`;
    }

    return undefined;
  }, [seasonParam, roundParam]);

  const normalizedAgentId = useMemo(() => {
    if (!trimmedId) return null;
    if (/^\d+$/.test(trimmedId)) return trimmedId;
    if (/^agent-\d+$/i.test(trimmedId)) return trimmedId;
    const matches = trimmedId.match(/\d+/g);
    if (matches?.length) {
      return `agent-${matches[matches.length - 1]}`;
    }
    return trimmedId;
  }, [trimmedId]);

  const numericUidFromParam = useMemo(() => {
    if (!trimmedId) return undefined;
    const matches = trimmedId.match(/\d+/g);
    if (!matches?.length) return undefined;
    const value = Number.parseInt(matches[matches.length - 1], 10);
    return Number.isFinite(value) ? value : undefined;
  }, [trimmedId]);

  const agentIdForQuery =
    normalizedAgentId ??
    (numericUidFromParam != null ? `agent-${numericUidFromParam}` : null);

  // Declare viewMode first before using it in hooks
  const [viewMode, setViewMode] = useState<"current" | "historical" | "runs">(
    "current"
  );
  const [websitePanelMode, setWebsitePanelMode] = useState<"chart" | "details">(
    "chart"
  );

  const {
    data: agentDetail,
    loading,
    error,
  } = useAgent(agentIdForQuery, selectedSeasonNumber ? { season: selectedSeasonNumber } : undefined);

  const agent = agentDetail?.agent ?? null;
  const roundMetrics: AgentRoundMetrics | null = agentDetail?.roundMetrics ?? null;
  const availableRounds: Array<string | number> = agentDetail?.availableRounds ?? [];
  // Get miner round details when round and miner UID are available
  // In historical mode, we still need round-details if a round is selected
  // But we don't need it if we're just viewing historical summary
  const {
    data: minerRoundDetails,
    loading: minerRoundDetailsLoading,
    error: minerRoundDetailsError,
  } = useMinerRoundDetails(
    selectedRoundFromQuery, // Always fetch if round is selected (needed for round-details)
    numericUidFromParam
  );

  // Extract latest season from agent detail available rounds
  const latestSeason = useMemo(() => {
    const rounds = availableRounds ?? [];
    if (rounds.length === 0) {
      return undefined;
    }

    // Parse rounds in format "season/round" and get highest season
    const seasons = rounds
      .map((r) => {
        if (typeof r === "string" && r.includes("/")) {
          const parts = r.split("/");
          return Number.parseInt(parts[0], 10);
        }
        return null;
      })
      .filter((s) => s !== null && Number.isFinite(s)) as number[];

    return seasons.length > 0 ? Math.max(...seasons) : undefined;
  }, [availableRounds]);

  // Get miner historical data only when needed:
  // - Historical tab
  // - Current tab in Effective mode (to resolve source best round)
  const shouldFetchHistorical =
    numericUidFromParam !== undefined &&
    (viewMode === "historical" || websitePanelMode === "details");
  // Always filter by season: use season from URL, or latest season as fallback
  const seasonForHistorical = seasonParam
    ? Number.parseInt(seasonParam, 10)
    : latestSeason;
  const {
    data: minerHistorical,
    loading: minerHistoricalLoading,
    error: minerHistoricalError,
  } = useMinerHistorical(
    shouldFetchHistorical ? numericUidFromParam : undefined,
    seasonForHistorical
  );
  const effectiveSourceFromHistory = useMemo(() => {
    const roundsHistory = minerHistorical?.roundsHistory ?? [];
    if (!roundsHistory.length) return null;
    const target = roundsHistory.reduce((best: any, row: any) => {
      if (!best) return row;
      const bestReward = Number(best?.post_consensus_avg_reward ?? 0);
      const rowReward = Number(row?.post_consensus_avg_reward ?? 0);
      if (rowReward > bestReward) return row;
      if (rowReward < bestReward) return best;
      const [bestSeason, bestRound] = String(best?.round ?? "0/0").split("/").map((v) => Number.parseInt(v, 10) || 0);
      const [rowSeason, rowRound] = String(row?.round ?? "0/0").split("/").map((v) => Number.parseInt(v, 10) || 0);
      if (rowSeason > bestSeason) return row;
      if (rowSeason < bestSeason) return best;
      return rowRound >= bestRound ? row : best;
    }, null as any);
    return target ? String(target.round) : null;
  }, [minerHistorical?.roundsHistory]);
  const effectiveSourceRoundIdentifier =
    effectiveSourceFromHistory &&
    selectedRoundFromQuery &&
    effectiveSourceFromHistory !== selectedRoundFromQuery
      ? effectiveSourceFromHistory
      : undefined;
  const {
    data: effectiveSourceRoundDetails,
  } = useMinerRoundDetails(
    effectiveSourceRoundIdentifier,
    numericUidFromParam
  );
  const bestRoundIdentifierFromAgentDetail = useMemo(() => {
    const bestRoundId = agentDetail?.agent?.bestRoundId;
    if (bestRoundId == null) return undefined;
    if (typeof bestRoundId === "string" && bestRoundId.includes("/")) {
      return bestRoundId;
    }
    const bestRoundNumber = Number(bestRoundId);
    if (Number.isFinite(bestRoundNumber) && selectedSeasonNumber) {
      return `${selectedSeasonNumber}/${bestRoundNumber}`;
    }
    return undefined;
  }, [agentDetail?.agent?.bestRoundId, selectedSeasonNumber]);

  // Use minerHistorical data if available in historical mode
  // In other modes, try to construct from minerRoundDetails if available
  const effectiveAgent: AgentData | null = viewMode === "historical" && minerHistorical
    ? {
        id: minerHistorical.miner.uid.toString(),
        uid: minerHistorical.miner.uid,
        name: minerHistorical.miner.name,
        hotkey: minerHistorical.miner.hotkey,
        type: "autoppia",
        imageUrl: minerHistorical.miner.image ?? "",
        isSota: false,
        totalTasks: minerHistorical.summary.totalTasks,
        completedTasks: minerHistorical.summary.totalTasksSuccessful,
        currentReward: minerHistorical.summary.averageReward,
        currentTopReward: minerHistorical.summary.bestReward,
        currentRank: minerHistorical.summary.bestRank,
        bestRankEver: minerHistorical.summary.bestRank,
        bestRankRoundId: minerHistorical.summary.bestRankRound,
        roundsParticipated: minerHistorical.summary.roundsParticipated,
        roundsWon: minerHistorical.summary.roundsWon,
        alphaWonInPrizes: minerHistorical.summary.totalAlphaEarned,
        taoWonInPrizes: minerHistorical.summary.totalTaoEarned,
        bestRoundReward: minerHistorical.summary.bestReward,
        bestRoundId: minerHistorical.summary.bestRewardRound,
        totalRuns: minerHistorical.summary.roundsParticipated,
        successfulRuns: minerHistorical.summary.roundsWon,
        averageResponseTime: minerHistorical.summary.averageDuration,
        lastSeen: "",
        createdAt: "",
        updatedAt: "",
        status: "active" as const,
        githubUrl: agentDetail?.agent?.githubUrl ?? undefined,
        taostatsUrl: undefined,
      }
    : minerRoundDetails?.miner
      ? {
          id: minerRoundDetails.miner.uid.toString(),
          uid: minerRoundDetails.miner.uid,
          name: minerRoundDetails.miner.name,
          hotkey: minerRoundDetails.miner.hotkey ?? null,
          type: "autoppia",
          imageUrl: minerRoundDetails.miner.image ?? "",
          isSota: false,
          totalTasks: minerRoundDetails.tasks_received ?? 0,
          completedTasks: minerRoundDetails.tasks_success ?? 0,
          currentReward: minerRoundDetails.post_consensus_avg_reward ?? 0,
          currentTopReward: minerRoundDetails.post_consensus_avg_reward ?? 0,
          currentRank: minerRoundDetails.post_consensus_rank ?? null,
          bestRankEver: minerRoundDetails.post_consensus_rank ?? null,
          bestRankRoundId: null,
          roundsParticipated: 0,
          roundsWon: 0,
          alphaWonInPrizes: 0,
          taoWonInPrizes: 0,
          bestRoundReward: minerRoundDetails.post_consensus_avg_reward ?? 0,
          bestRoundId: null,
          totalRuns: 0,
          successfulRuns: 0,
          averageResponseTime: minerRoundDetails.post_consensus_avg_eval_time ?? 0,
          lastSeen: "",
          createdAt: "",
          updatedAt: "",
          status: "active" as const,
          githubUrl: minerRoundDetails.miner.github_url ?? undefined,
          taostatsUrl: undefined,
        }
      : agent ?? null;

  const githubAvailable = Boolean(effectiveAgent?.githubUrl && !effectiveAgent?.isSota);
  const taoStatsAvailable = Boolean(
    !effectiveAgent?.isSota && (effectiveAgent?.taostatsUrl || effectiveAgent?.hotkey)
  );

  const defaultAvatar = useMemo(
    () =>
      resolveAssetUrl(
        `/miners/${Math.abs((effectiveAgent?.uid ?? numericUidFromParam ?? 0) % 50)}.svg`
      ),
    [effectiveAgent?.uid, numericUidFromParam]
  );
  const [agentImgSrc, setAgentImgSrc] = useState<string>(defaultAvatar);
  useEffect(() => {
    setAgentImgSrc(resolveAssetUrl(effectiveAgent?.imageUrl, defaultAvatar));
  }, [effectiveAgent?.imageUrl, defaultAvatar]);
  const [websitesSummary, setWebsitesSummary] = useState<{
    unique: number;
    total: number;
  }>({ unique: 0, total: 0 });

  const handleSummaryChange = useCallback(
    ({
      uniqueWebsites,
      totalTasks,
    }: {
      uniqueWebsites: number;
      totalTasks: number;
    }) => {
      setWebsitesSummary({ unique: uniqueWebsites, total: totalTasks });
    },
    [setWebsitesSummary]
  );

  const currentRound =
    selectedRoundFromQuery ??
    roundMetrics?.roundId ??
    (availableRounds.length > 0 ? availableRounds[0] : undefined);

  // Build rewardRoundData from historical data if in historical mode, otherwise from agentDetail
  const rewardRoundData: RewardRoundDataPoint[] = useMemo(() => {
    if (viewMode === "historical" && minerHistorical?.roundsHistory) {
      // Use historical data - sort by round descending (format: "season/round")
      return [...minerHistorical.roundsHistory]
        .sort((a, b) => {
          // Parse "season/round" format for sorting
          const [aSeason, aRound] = String(a.round).split('/').map(Number);
          const [bSeason, bRound] = String(b.round).split('/').map(Number);
          // Sort by season first, then by round (descending)
          if (bSeason !== aSeason) return bSeason - aSeason;
          return bRound - aRound;
        })
        .map((round, index) => ({
          round_id: round.round, // Keep as string "season/round"
          round: index + 1, // Sequential number for chart x-axis
          rank: round.post_consensus_rank,
          reward: round.post_consensus_avg_reward ?? 0,
          eval_score: round.post_consensus_avg_eval_score ?? undefined,
          eval_time: round.post_consensus_avg_eval_time ?? undefined,
          timestamp: "", // Historical data doesn't have timestamp
          topReward: undefined,
          benchmarks: undefined,
        }));
    }

    // Use agentDetail data for current/runs mode
    const source: RewardRoundDataPoint[] =
      agentDetail?.rewardRoundData ??
      (((minerRoundDetails as any)?.rewardRoundData as
        | RewardRoundDataPoint[]
        | undefined) ?? []);
    if (!source.length) {
      const fallbackReward = Number((minerRoundDetails as any)?.post_consensus_avg_reward ?? 0);
      const fallbackRank = Number((minerRoundDetails as any)?.post_consensus_rank ?? 0);
      const fallbackRoundId = selectedRoundFromQuery ?? Number((minerRoundDetails as any)?.round ?? 0);
      if (fallbackRoundId) {
        return [
          {
            round_id: fallbackRoundId as any,
            rank: Number.isFinite(fallbackRank) && fallbackRank > 0 ? fallbackRank : null,
            reward: fallbackReward,
            eval_score: (minerRoundDetails as any)?.post_consensus_avg_eval_score ?? undefined,
            eval_time: (minerRoundDetails as any)?.post_consensus_avg_eval_time ?? undefined,
            timestamp: "",
            topReward: undefined,
            benchmarks: undefined,
          },
        ];
      }
      return [];
    }
    return source.map((point: any) => {
      const roundId =
        point.round_id ??
        point.validator_round_id ??
        point.roundId ??
        point.validatorRoundId ??
        point.round ??
        0;
      return {
        round_id: Number(roundId),
        rank: point.rank ?? point.position ?? null,
        reward: point.reward ?? 0,
        eval_score: point.eval_score ?? point.post_consensus_avg_eval_score ?? point.avg_eval_score ?? undefined,
        eval_time: point.eval_time ?? point.post_consensus_avg_eval_time ?? point.avg_eval_time ?? undefined,
        timestamp:
          typeof point.timestamp === "string"
            ? point.timestamp
            : (point.timestamp?.toString() ?? ""),
        topReward:
          normalizeScore(
            point.topReward ?? point.top_reward ?? point.topScore ?? point.top_score ?? point.bestReward ?? point.bestScore
          ) ?? undefined,
        benchmarks: Array.isArray(point.benchmarks)
          ? point.benchmarks.map((benchmark: any) => ({
              name: benchmark.name ?? benchmark.provider ?? "Benchmark",
              provider: benchmark.provider,
              reward: normalizeScore(benchmark.reward) ?? 0,
            }))
          : undefined,
      };
    });
  }, [viewMode, minerHistorical?.roundsHistory, agentDetail?.rewardRoundData, minerRoundDetails, selectedRoundFromQuery]);

  const selectedRoundEncoded = useMemo(() => {
    if (typeof selectedRoundFromQuery === "string" && selectedRoundFromQuery.includes("/")) {
      const [seasonRaw, roundRaw] = selectedRoundFromQuery.split("/");
      const season = Number.parseInt(seasonRaw, 10);
      const round = Number.parseInt(roundRaw, 10);
      if (Number.isFinite(season) && Number.isFinite(round)) {
        return season * 10000 + round;
      }
      return undefined;
    }
    if (typeof selectedRoundFromQuery === "number" && Number.isFinite(selectedRoundFromQuery)) {
      return selectedRoundFromQuery;
    }
    return undefined;
  }, [selectedRoundFromQuery]);

  const [runsState, setRunsState] = useState<{
    loading: boolean;
    runs: AgentRunOverview[];
    error: string | null;
    validators?: AgentRunsResponse["data"]["validators"];
    post_consensus_summary?: AgentRunsResponse["data"]["post_consensus_summary"];
  }>({
    loading: false,
    runs: [],
    error: null,
    validators: undefined,
    post_consensus_summary: undefined,
  });

  useEffect(() => {
    if (viewMode !== "runs" || !agentIdForQuery) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    setRunsState((prev) => ({ ...prev, loading: true, error: null }));

    fetchAllAgentRuns(
      agentIdForQuery,
      selectedRoundEncoded != null ? { roundId: selectedRoundEncoded } : {},
      controller.signal
    )
      .then((result) => {
        if (!isActive) return;
        setRunsState({
          loading: false,
          runs: result.runs ?? [],
          error: null,
          validators: result.validators,
          post_consensus_summary: result.post_consensus_summary,
        });
      })
      .catch((err) => {
        if (!isActive || controller.signal.aborted) return;
        setRunsState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [viewMode, agentIdForQuery, selectedRoundEncoded]);

  // Calculate preAvg from minerRoundDetails instead of runs
  const preAvg = useMemo(() => {
    // Use minerRoundDetails data if available
    if (minerRoundDetails) {
      const avgRank = minerRoundDetails.post_consensus_rank ?? null;
      const avgScore = minerRoundDetails.post_consensus_avg_reward ?? 0;
      const avgResp = minerRoundDetails.post_consensus_avg_eval_time ?? 0;
      const avgTasks = minerRoundDetails.avg_tasks_per_validator ?? 0;

      return {
        avgRank: avgRank !== null ? avgRank.toFixed(1) : "N/A",
        avgScore: `${Math.round(avgScore * 100)}%`,
        avgResp: `${Math.round(avgResp)}s`,
        avgTasks: `${Math.round(avgTasks)}`,
      };
    }

    // Fallback to empty values if no data
    return {
      avgRank: "N/A",
      avgScore: "0%",
      avgResp: "0s",
      avgTasks: "0",
    };
  }, [minerRoundDetails]);
  const derivedBestRankFromHistory = useMemo(() => {
    const rows = minerHistorical?.roundsHistory ?? [];
    const ranks = rows
      .map((row: any) => Number(row?.post_consensus_rank))
      .filter((rank: number) => Number.isFinite(rank) && rank > 0);
    if (!ranks.length) return { rank: null as number | null, round: null as string | null };
    const bestRank = Math.min(...ranks);
    const candidateRounds = rows
      .filter((row: any) => Number(row?.post_consensus_rank) === bestRank && row?.round)
      .map((row: any) => String(row.round));
    if (!candidateRounds.length) return { rank: bestRank, round: null as string | null };
    // "When achieved": pick earliest round in season/round order (e.g. 25/1 before 25/12)
    candidateRounds.sort((a, b) => {
      const [as, ar] = a.split("/").map((v) => Number.parseInt(v, 10) || 0);
      const [bs, br] = b.split("/").map((v) => Number.parseInt(v, 10) || 0);
      if (as !== bs) return as - bs;
      return ar - br;
    });
    return { rank: bestRank, round: candidateRounds[0] };
  }, [minerHistorical?.roundsHistory]);
  const distinctGithubUrlsInSeason = useMemo(() => {
    const value = Number(minerHistorical?.summary?.distinctGithubUrls ?? 0);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.floor(value);
  }, [minerHistorical?.summary?.distinctGithubUrls]);
  const historicalChartError = useMemo(() => {
    if (!minerHistoricalError) return null;
    const msg = String(minerHistoricalError);
    // For historical chart UX, treat 404 as "no history yet" instead of hard error card.
    if (msg.includes("404")) return null;
    return msg;
  }, [minerHistoricalError]);

  // In historical mode, we can use minerHistorical data even if agent is null
  const hasHistoricalData = viewMode === "historical" && minerHistorical;
  // In current/runs mode, we can use minerRoundDetails data
  const hasRoundDetailsData =
    viewMode !== "historical" && (Boolean(minerRoundDetails) || Boolean(agent));

  // Show loading only if we don't have data yet
  const isLoading =
    (viewMode === "historical" && minerHistoricalLoading) ||
    (viewMode !== "historical" && !minerRoundDetails && minerRoundDetailsLoading);

  if (isLoading) {
    return (
      <>
        <AgentHeaderPlaceholder />
        <div className="space-y-6">
          <div className="h-32 bg-gray-100/50 rounded-xl animate-pulse" />
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="w-full xl:w-[calc(100%-320px)] h-80 bg-gray-100/50 rounded-xl animate-pulse" />
            <div className="w-full xl:w-[320px] h-80 bg-gray-100/50 rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-gray-100/50 rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  // Show error only if we don't have any data source available
  if (!effectiveAgent && !hasHistoricalData && !hasRoundDetailsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading agent</div>
          <div className="text-gray-500 text-sm">
            {error || "Agent not found"}
          </div>
        </div>
      </div>
    );
  }

  // Current mode stats for header - showing only the 5 key metrics
  const currentRankValue =
    roundMetrics?.rank && roundMetrics.rank > 0
      ? `#${roundMetrics.rank}`
      : effectiveAgent?.currentRank && (effectiveAgent.currentRank ?? 0) > 0
        ? `#${effectiveAgent.currentRank}`
        : "N/A";

  const currentRewardPercentage = `${((roundMetrics?.reward ?? effectiveAgent?.currentReward ?? 0) * 100).toFixed(1)}%`;

  // Historical metrics
  const bestRankEver =
    effectiveAgent?.bestRankEver && (effectiveAgent.bestRankEver ?? 0) > 0
      ? `#${effectiveAgent.bestRankEver}`
      : "N/A";
  const bestEverRewardPercentage = `${((effectiveAgent?.bestRoundReward ?? 0) * 100).toFixed(1)}%`;
  const bestRoundBadge = formatBestRoundBadge(effectiveAgent?.bestRoundId);
  const roundsParticipated = (
    effectiveAgent?.roundsParticipated ||
    effectiveAgent?.totalRuns ||
    0
  ).toLocaleString();
  // Multiplicando por el 7.5% solicitado por robert
  const totalAlphaEarned = Math.round(
    Number(effectiveAgent?.alphaWonInPrizes ?? 0) * 0.075
  );
  const totalTaoEarned = (
    Number((effectiveAgent as any)?.taoWonInPrizes ?? effectiveAgent?.alphaWonInPrizes ?? 0) * 0.075
  ).toFixed(2);
  const sourceMetricsDetails = selectedRoundFromQuery
    ? minerRoundDetails ?? null
    : {
        post_consensus_avg_reward:
          roundMetrics?.reward ?? effectiveAgent?.currentReward ?? 0,
        post_consensus_avg_eval_time:
          roundMetrics?.averageResponseTime ?? effectiveAgent?.averageResponseTime ?? null,
        tasks_received: roundMetrics?.totalTasks ?? effectiveAgent?.totalTasks ?? 0,
        tasks_success: roundMetrics?.completedTasks ?? effectiveAgent?.completedTasks ?? 0,
        validators_count: roundMetrics?.totalValidators ?? 0,
        avg_cost_per_task: agentDetail?.avg_cost_per_task ?? null,
        performanceByWebsite:
          agentDetail?.performanceByWebsite ?? [],
      };
  const roundReward = Number(
    sourceMetricsDetails?.post_consensus_avg_reward ??
      roundMetrics?.reward ??
      effectiveAgent?.currentReward ??
      0
  );
  const seasonRank =
    effectiveAgent?.seasonRank ??
    effectiveAgent?.currentRank ??
    null;
  const displayedReward = roundReward;
  const effectiveEvalTime = sourceMetricsDetails?.post_consensus_avg_eval_time ?? null;
  const effectiveTasksReceived = sourceMetricsDetails?.tasks_received ?? roundMetrics?.totalTasks ?? 0;
  const effectiveTasksSuccess = sourceMetricsDetails?.tasks_success ?? roundMetrics?.completedTasks ?? 0;
  const effectiveValidatorsCount = sourceMetricsDetails?.validators_count ?? roundMetrics?.totalValidators ?? 0;
  const effectivePerformanceByWebsite = sourceMetricsDetails?.performanceByWebsite ?? agentDetail?.performanceByWebsite ?? [];
  const effectiveWebsitesCount = effectivePerformanceByWebsite.length > 0
    ? effectivePerformanceByWebsite.length
    : websitesSummary.unique;
  const effectiveAvgCostPerTaskRaw = (sourceMetricsDetails as any)?.avg_cost_per_task ?? (sourceMetricsDetails as any)?.avgCostPerTask ?? agentDetail?.avg_cost_per_task ?? null;
  const effectiveAvgCostPerTask = effectiveAvgCostPerTaskRaw != null ? Number(effectiveAvgCostPerTaskRaw) : null;
  const timeoutThresholdSeconds = Number((sourceMetricsDetails as any)?.task_timeout_seconds ?? 180);
  const maxTaskCostUsd = Number((sourceMetricsDetails as any)?.max_task_cost_usd ?? 0.05);
  const sourceRoundForEffective = selectedRoundFromQuery ?? bestRoundIdentifierFromAgentDetail ?? null;
  const sourceRoundParts = String(sourceRoundForEffective ?? "").split("/");
  const sourceRound = Number.parseInt(sourceRoundParts[1] ?? "", 10);
  const isAvgResponseTimeout =
    effectiveEvalTime !== null &&
    Number.isFinite(effectiveEvalTime) &&
    Number.isFinite(timeoutThresholdSeconds) &&
    effectiveEvalTime >= timeoutThresholdSeconds;
  const isAvgCostOverLimit =
    effectiveAvgCostPerTask !== null &&
    Number.isFinite(effectiveAvgCostPerTask) &&
    Number.isFinite(maxTaskCostUsd) &&
    effectiveAvgCostPerTask >= maxTaskCostUsd;
  // Calculate Success Rate for current round: completed tasks / total tasks
  const roundSuccessRate = (() => {
    const total = effectiveTasksReceived;
    const completed = effectiveTasksSuccess;
    return total > 0 ? `${completed}/${total}` : "0/0";
  })();

  const currentStats = [
    // Primera fila: Round, Rank, Avg Score, Avg Response Time
    {
      title: "Best Round",
      metric:
        Number.isFinite(sourceRound)
          ? `${sourceRound}`
          : "N/A",
      badge: seasonParam ? `Season ${seasonParam}` : "Best in season",
      icon: PiClockDuotone,
      ...METRIC_CARD_GRADIENTS.indigo,
    },
    {
      title: "Season Rank",
      metric: seasonRank && seasonRank > 0 ? `#${seasonRank}` : "N/A",
      icon: LuAward,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "Avg Reward",
      metric: `${((displayedReward ?? 0) * 100).toFixed(1)}%`,
      icon: LuTarget,
      ...METRIC_CARD_GRADIENTS.amber,
    },
    {
      title: "Success Rate",
      metric: roundSuccessRate,
      icon: PiCheckDuotone,
      ...METRIC_CARD_GRADIENTS.green,
    },

    // Segunda fila: Validators, Websites, Avg Cost Per Task, Avg Response Time
    {
      title: "Validators",
      metric: effectiveValidatorsCount.toString(),
      icon: PiTrophyDuotone,
      ...METRIC_CARD_GRADIENTS.indigo,
    },
    {
      title: "Websites",
      metric: effectiveWebsitesCount.toString(),
      icon: PiChartBarDuotone,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "Avg Cost Per Task",
      metric: effectiveAvgCostPerTask != null && Number.isFinite(effectiveAvgCostPerTask)
        ? `$${Number(effectiveAvgCostPerTask).toFixed(3)}`
        : "—",
      badge: isAvgCostOverLimit ? `Over $${maxTaskCostUsd.toFixed(3)} limit` : null,
      badgeClassName: isAvgCostOverLimit ? "bg-red-500/20 text-red-200 border-red-300/40" : undefined,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.amber,
    },
    {
      title: "Avg Response Time",
      metric: effectiveEvalTime !== null
        ? `${effectiveEvalTime.toFixed(1)}s`
        : (preAvg?.avgResp ?? "0s"),
      badge: isAvgResponseTimeout ? `Timeout >= ${Math.round(timeoutThresholdSeconds)}s` : null,
      badgeClassName: isAvgResponseTimeout ? "bg-red-500/20 text-red-200 border-red-300/40" : undefined,
      icon: PiTimerDuotone,
      ...METRIC_CARD_GRADIENTS.emerald,
    },
  ];

  const historicalStats = [
    // 2 filas × 3 columnas. Col1 mismo estilo que Avg Cost (amber), Col2 violet, Col3 green/emerald
    {
      title: "Season Rank",
      metric: minerHistorical?.summary?.bestRank
        ? `#${minerHistorical.summary.bestRank}`
        : derivedBestRankFromHistory.rank != null && Number.isFinite(derivedBestRankFromHistory.rank)
          ? `#${derivedBestRankFromHistory.rank}`
          : "—",
      badge: minerHistorical?.summary?.bestRankRound
        ? formatBestRoundBadge(minerHistorical.summary.bestRankRound)
        : derivedBestRankFromHistory.round ?? null,
      icon: LuCrown,
      ...METRIC_CARD_GRADIENTS.amber,
    },
    {
      title: "Rounds Won",
      metric: `${minerHistorical?.summary?.roundsWon ?? 0}/${minerHistorical?.summary?.roundsParticipated ?? 0}`,
      icon: LuTrophy,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "Alpha Earned",
      metric: `${Math.round(minerHistorical?.summary?.totalAlphaEarned ?? 0)} α`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.green,
    },
    {
      title: "Best Reward (Season)",
      metric: minerHistorical?.summary?.bestReward
        ? `${(minerHistorical.summary.bestReward * 100).toFixed(1)}%`
        : "0%",
      badge: minerHistorical?.summary?.bestRewardRound
        ? formatBestRoundBadge(minerHistorical.summary.bestRewardRound)
        : null,
      icon: LuStar,
      ...METRIC_CARD_GRADIENTS.amber,
    },
    {
      title: "GitHub URLs (Season)",
      metric: distinctGithubUrlsInSeason.toLocaleString(),
      icon: PiGithubLogoDuotone,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "TAO Earned",
      metric: `${(minerHistorical?.summary?.totalTaoEarned ?? 0).toFixed(2)} τ`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.emerald,
    },
  ];

  const headerStats =
    viewMode === "current"
      ? currentStats
      : viewMode === "historical"
        ? historicalStats
        : [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 mb-2">
        <div
          className="rounded-3xl flex flex-col gap-1 sm:gap-6 p-1 sm:p-3 group"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          {/* Animated background gradient */}
          <div className="pulse-bg-rounded-3xl" style={{ display: "none" }} />

          {/* Header Section */}
          <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <Image
                  src={agentImgSrc}
                  alt={effectiveAgent?.name ?? "Miner"}
                  width={56}
                  height={56}
                  className="rounded-full border-3 border-white/30 shadow-2xl ring-4 ring-white/20"
                  onError={() => setAgentImgSrc(defaultAvatar)}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                    {effectiveAgent?.name ?? "Miner"}
                  </span>
                  {effectiveAgent?.isSota && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/90 to-violet-500/90 text-white border-2 border-purple-400/70 shadow-lg backdrop-blur-sm">
                      SOTA
                    </span>
                  )}
                  {!effectiveAgent?.isSota &&
                    effectiveAgent?.status &&
                    effectiveAgent.status !== "active" && (
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-sm shadow-lg",
                          effectiveAgent.status === "maintenance"
                            ? "bg-yellow-500/90 text-white border-yellow-400/70"
                            : "bg-white/90 text-gray-900 border-gray-300/70"
                        )}
                      >
                        {effectiveAgent.status}
                      </span>
                    )}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center h-7 px-2.5 rounded-lg transition-all duration-300 gap-1.5",
                        githubAvailable
                          ? "bg-white/15 hover:bg-white/25 cursor-pointer border border-white/20 hover:border-white/40 shadow-sm hover:scale-105 active:scale-95"
                          : "bg-white/5 cursor-not-allowed opacity-40 border border-white/10"
                      )}
                      title={
                        effectiveAgent?.isSota
                          ? "GitHub repository not available for SOTA benchmarks"
                          : effectiveAgent?.githubUrl
                            ? "View GitHub repository"
                            : "GitHub repository not available"
                      }
                    >
                      {githubAvailable ? (
                        <a
                          href={effectiveAgent?.githubUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full w-full items-center justify-center gap-1.5 group"
                        >
                          <PiGithubLogoDuotone className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-white">GitHub</span>
                        </a>
                      ) : (
                        <>
                          <PiGithubLogoDuotone className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-white/30">GitHub</span>
                        </>
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-center h-7 px-2.5 rounded-lg transition-all duration-300 gap-1.5",
                        taoStatsAvailable
                          ? "bg-white/15 hover:bg-white/25 cursor-pointer border border-white/20 hover:border-white/40 shadow-sm hover:scale-105 active:scale-95"
                          : "bg-white/5 cursor-not-allowed opacity-40 border border-white/10"
                      )}
                      title={
                        effectiveAgent?.isSota
                          ? "On-chain explorer is not available for SOTA benchmarks"
                          : effectiveAgent?.taostatsUrl || effectiveAgent?.hotkey
                            ? "View on TaoStats"
                            : "TaoStats link not available"
                      }
                    >
                      {taoStatsAvailable ? (
                        <a
                          href={
                            effectiveAgent?.taostatsUrl ||
                            (effectiveAgent?.hotkey
                              ? `https://taostats.io/subnets/36/metagraph?filter=${encodeURIComponent(effectiveAgent.hotkey)}`
                              : "#")
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full w-full items-center justify-center gap-1.5 group"
                        >
                          <PiInfoDuotone className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-white">TaoStats</span>
                        </a>
                      ) : (
                        <>
                          <PiInfoDuotone className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-white/30">TaoStats</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <PiHashDuotone className="w-4 h-4 text-emerald-300" />
                    <span className="font-mono font-semibold">
                      UID: {effectiveAgent?.isSota ? "—" : (effectiveAgent?.uid ?? "unknown")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiKeyDuotone className="w-4 h-4 text-sky-300" />
                    <span className="font-mono text-xs font-semibold">
                      {effectiveAgent?.isSota
                        ? "No on-chain hotkey"
                        : effectiveAgent?.hotkey
                          ? effectiveAgent.hotkey
                          : "unknown"}
                    </span>
                    {!effectiveAgent?.isSota && effectiveAgent?.hotkey && (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(effectiveAgent?.hotkey ?? "");
                            setCopiedHotkey(true);
                            setTimeout(() => setCopiedHotkey(false), 2000);
                          } catch (err) {
                            console.error("Failed to copy:", err);
                          }
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Copy hotkey"
                      >
                        {copiedHotkey ? (
                          <PiCheckDuotone className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <PiCopyDuotone className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start gap-2 w-full lg:w-auto lg:flex-shrink-0">
              <div className="glass-card flex sm:inline-flex items-center gap-1.5 p-1.5 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("current")}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold transition-all duration-300 overflow-hidden group rounded-lg flex-1 sm:flex-none",
                    "flex items-center justify-center gap-2",
                    viewMode === "current"
                      ? "bg-gradient-to-br from-white to-white/95 text-black shadow-lg scale-[1.02] border border-white/80"
                      : "text-white hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                  aria-pressed={viewMode === "current"}
                >
                  <PiTrendUpDuotone
                    className={cn(
                      "w-4 h-4 transition-transform duration-300 relative z-10",
                      viewMode === "current" && "scale-110"
                    )}
                  />
                  <span className="relative z-10 hidden sm:inline">Best Round</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("runs")}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold transition-all duration-300 overflow-hidden group rounded-lg flex-1 sm:flex-none",
                    "flex items-center justify-center gap-2",
                    viewMode === "runs"
                      ? "bg-gradient-to-br from-white to-white/95 text-black shadow-lg scale-[1.02] border border-white/80"
                      : "text-white hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                  aria-pressed={viewMode === "runs"}
                >
                  <PiListChecksDuotone
                    className={cn(
                      "w-4 h-4 transition-transform duration-300 relative z-10",
                      viewMode === "runs" && "scale-110"
                    )}
                  />
                  <span className="relative z-10 hidden sm:inline">Runs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("historical")}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold transition-all duration-300 overflow-hidden group rounded-lg flex-1 sm:flex-none",
                    "flex items-center justify-center gap-2",
                    viewMode === "historical"
                      ? "bg-gradient-to-br from-white to-white/95 text-black shadow-lg scale-[1.02] border border-white/80"
                      : "text-white hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                  aria-pressed={viewMode === "historical"}
                >
                  <PiChartLineDuotone
                    className={cn(
                      "w-4 h-4 transition-transform duration-300 relative z-10",
                      viewMode === "historical" && "scale-110"
                    )}
                  />
                  <span className="relative z-10 hidden sm:inline">
                    Historical
                  </span>
                </button>
              </div>
              {effectiveAgent?.isSota && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-500/90 border-2 border-yellow-400/70 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  <PiSparkle className="h-4 w-4" />
                  Benchmark Agent
                </span>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          {headerStats.length > 0 && (
            <div
              className={cn(
                "relative grid gap-4 z-10",
                viewMode === "historical"
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 md:grid-cols-4"
              )}
            >
              {headerStats.map((stat) => {
                const Icon = stat.icon as any;
                return (
                  <div
                    key={stat.title}
                    className="group relative overflow-hidden rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer isolate"
                  >
                    {/* Card background with gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl md:rounded-2xl opacity-90 bg-gradient-to-br transition-opacity duration-300 group-hover:opacity-100 z-0",
                        stat.bgGradient
                      )}
                    />

                    {/* Animated shimmer effect */}
                    <div
                      className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 3.5s linear infinite",
                      }}
                    />

                    {/* Border gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl md:rounded-2xl border transition-all duration-300",
                        stat.borderColor,
                        "group-hover:shadow-lg"
                      )}
                      style={{
                        boxShadow: `0 0 12px ${stat.glowColor ?? "transparent"}33`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative p-4 flex items-center gap-2 md:gap-4">
                      {/* Icon on left */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 bg-gradient-to-br flex-shrink-0",
                          "border border-white/40 group-hover:border-white/60",
                          stat.iconGradient
                        )}
                      >
                        <Icon className="w-5 h-5 md:w-7 md:h-7 text-white drop-shadow" />
                      </div>

                      {/* Metrics in middle */}
                      <div className="flex flex-col gap-0.5 md:gap-1 flex-1 min-w-0">
                        <Text className="text-[9px] md:text-xs font-bold text-white/80 uppercase tracking-wider md:tracking-widest leading-tight">
                          {stat.title}
                        </Text>
                        <div className="flex items-center justify-between gap-1 md:gap-2">
                          <Text className="text-xs sm:text-3xl font-black text-white leading-none tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                            {stat.metric}
                          </Text>
                          {(stat as any).badge ? (
                            <span
                              className={cn(
                                "hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-sm flex-shrink-0",
                                (stat as any).badgeClassName ?? "bg-white/15 text-white/90 border border-white/25"
                              )}
                            >
                              {(stat as any).badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Content Section */}
          <div className="relative z-10">
            {viewMode === "runs" ? (
              <AgentValidators
                selectedRound={currentRound ?? null}
                selectedSeason={seasonParam ? Number.parseInt(seasonParam, 10) : null}
                selectedRoundInSeason={roundParam ? Number.parseInt(roundParam, 10) : null}
                runs={runsState.runs}
                loading={runsState.loading}
                error={runsState.error ?? undefined}
                numericUidFromParam={numericUidFromParam}
                validators={runsState.validators}
                post_consensus_summary={runsState.post_consensus_summary}
                minerRoundDetailsValidators={minerRoundDetails?.validators}
                roundAvgCostPerTask={(minerRoundDetails as any)?.avg_cost_per_task ?? (minerRoundDetails as any)?.avgCostPerTask ?? null}
                postConsensusRounds={minerHistorical?.roundsHistory}
              />
            ) : (
              <>
                {viewMode === "current" ? (
                  <div className="space-y-8">
                    <div className="space-y-5">
                      <div className="flex w-full rounded-2xl border border-white/15 bg-slate-900/35 p-1.5 gap-1.5 backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => setWebsitePanelMode("chart")}
                          className={cn(
                            "flex-1 min-w-0 py-4 px-5 text-sm sm:text-base font-semibold rounded-xl transition-all duration-150 text-center",
                            websitePanelMode === "chart"
                              ? "bg-cyan-500/25 text-cyan-100 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                              : "text-white/60 hover:text-white/90 hover:bg-white/5 border border-transparent"
                          )}
                          aria-pressed={websitePanelMode === "chart"}
                        >
                          Performance by website
                        </button>
                        <button
                          type="button"
                          onClick={() => setWebsitePanelMode("details")}
                          className={cn(
                            "flex-1 min-w-0 py-4 px-5 text-sm sm:text-base font-semibold rounded-xl transition-all duration-150 text-center",
                            websitePanelMode === "details"
                              ? "bg-cyan-500/25 text-cyan-100 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                              : "text-white/60 hover:text-white/90 hover:bg-white/5 border border-transparent"
                          )}
                          aria-pressed={websitePanelMode === "details"}
                        >
                          Performance details per website
                        </button>
                      </div>

                      {websitePanelMode === "chart" ? (
                        sourceMetricsDetails && effectivePerformanceByWebsite.length > 0 ? (
                          <div className="relative">
                            {minerRoundDetailsLoading ? (
                              <div className="relative flex h-[420px] items-center justify-center text-white/70">
                                Loading website stats…
                              </div>
                            ) : (
                              <>
                                <div className="mb-6">
                                  <h3 className="text-xl font-bold text-white mb-2">
                                    Performance per website
                                  </h3>
                                  <p className="text-sm text-white/60">
                                    Task success rate by website for the best round in this season
                                  </p>
                                </div>
                                <div className="relative h-[300px] md:h-[450px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={effectivePerformanceByWebsite.map((website) => {
                                        const websiteName = website.website;
                                        const formattedName = formatWebsiteName(websiteName);
                                        return {
                                          website: formattedName,
                                          websiteOriginal: websiteName,
                                          successRate: website.success_rate * 100,
                                          successful: website.tasks_success,
                                          total: website.tasks_received,
                                        };
                                      })}
                                      margin={{ top: 20, left: -10 }}
                                    >
                                      <defs>
                                        {effectivePerformanceByWebsite.map((entry, index) => {
                                          const colors = getProjectColors(entry.website);
                                          return (
                                            <linearGradient
                                              key={`barGradient${index}`}
                                              id={`barGradient${index}`}
                                              x1="0"
                                              y1="0"
                                              x2="0"
                                              y2="1"
                                            >
                                              <stop offset="0%" stopColor={colors.mainColor} stopOpacity={1} />
                                              <stop offset="50%" stopColor={colors.mainColor} stopOpacity={0.95} />
                                              <stop offset="100%" stopColor={colors.mainColor} stopOpacity={0.9} />
                                            </linearGradient>
                                          );
                                        })}
                                      </defs>
                                      <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                        stroke="rgba(148,163,184,0.15)"
                                      />
                                      <XAxis
                                        dataKey="website"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                          fill: "rgba(226,232,240,0.9)",
                                          fontSize: 13,
                                          fontWeight: 500,
                                        }}
                                      />
                                      <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={<CustomYAxisTick postfix="%" />}
                                        stroke="rgba(148,163,184,0.3)"
                                      />
                                      <Tooltip
                                        content={<WebsitePerformanceTooltip />}
                                        cursor={{
                                          fill: "rgba(255, 255, 255, 0.08)",
                                        }}
                                        wrapperStyle={{
                                          outline: "none",
                                          zIndex: 1000,
                                        }}
                                      />
                                      <Bar
                                        dataKey="successRate"
                                        radius={[12, 12, 0, 0]}
                                        maxBarSize={80}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                      >
                                        {effectivePerformanceByWebsite.map((entry, index) => {
                                          const colors = getProjectColors(entry.website);
                                          return (
                                            <Cell
                                              key={`cell-${index}`}
                                              fill={`url(#barGradient${index})`}
                                              fillOpacity={0.9}
                                              style={{
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                cursor: "pointer",
                                                transformOrigin: "center bottom",
                                              }}
                                            />
                                          );
                                        })}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <RoundWebsitesChart
                            agentId={agentIdForQuery ?? trimmedId}
                            selectedRound={typeof currentRound === "number" ? currentRound : null}
                            runs={runsState.runs}
                            onSummaryChange={handleSummaryChange}
                          />
                        )
                      ) : (
                        <AgentHistoricalAnalytics
                          agentId={agentIdForQuery ?? trimmedId}
                          className="w-full"
                          minerHistorical={minerHistorical}
                          loading={minerHistoricalLoading}
                          selectedSeason={seasonForHistorical}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AgentScoreChart
                      className="w-full"
                      rewardRoundData={rewardRoundData}
                      loading={minerHistoricalLoading || loading}
                      error={historicalChartError || error}
                      title={`Reward Over Time · Season ${seasonForHistorical ?? "N/A"}`}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
