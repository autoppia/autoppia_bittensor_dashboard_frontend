"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import cn from "@core/utils/class-names";
import { Button, Text } from "rizzui";
import {
  formatWebsiteName,
  getProjectColors,
  getProjectMainColor,
} from "@/utils/website-colors";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
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
import { useAgent } from "@/services/hooks/useAgents";
import { agentsService } from "@/services/api/agents.service";
import type {
  ScoreRoundDataPoint,
  AgentData,
  AgentRoundMetrics,
  AgentRunOverview,
} from "@/services/api/types/agents";
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
  PiTrophyDuotone,
  PiListChecksDuotone,
  PiTrendUpDuotone,
  PiTimerDuotone,
  PiCaretDownDuotone,
  PiCaretUpDuotone,
} from "react-icons/pi";
import {
  LuCircleCheckBig,
  LuTrophy,
  LuAward,
  LuTarget,
  LuStar,
  LuCrown,
} from "react-icons/lu";
import { GLASS_STYLES, METRIC_CARD_GRADIENTS } from "@/config/theme-styles";

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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const RUNS_PAGE_SIZE = 100;

async function fetchAllAgentRuns(
  agentId: string,
  params: { roundId?: number; validatorId?: string } = {}
): Promise<{ runs: AgentRunOverview[]; total: number }> {
  let page = 1;
  const aggregated: AgentRunOverview[] = [];
  let total = 0;

  while (true) {
    const response = await agentsService.getAgentRuns(agentId, {
      ...params,
      page,
      limit: RUNS_PAGE_SIZE,
      sortBy: "startTime",
      sortOrder: "desc",
    });
    const payload = response?.data;
    const batch = payload?.runs ?? [];
    if (page === 1) {
      total = payload?.total ?? batch.length;
    }
    aggregated.push(...batch);
    if (aggregated.length >= total || batch.length < RUNS_PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  return { runs: aggregated, total };
}

// Agent stats band
function AgentStats({
  agent,
  roundMetrics,
  mode = "current",
  preAvg,
}: {
  agent?: AgentData | null;
  roundMetrics?: AgentRoundMetrics | null;
  mode?: "current" | "historical";
  preAvg?: any;
}) {
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

  const currentRankValue =
    roundMetrics?.rank && roundMetrics.rank > 0
      ? `#${roundMetrics.rank}`
      : agent.currentRank && agent.currentRank > 0
        ? `#${agent.currentRank}`
        : "N/A";

  const bestRankEver =
    agent.bestRankEver && agent.bestRankEver > 0
      ? `#${agent.bestRankEver}`
      : "N/A";
  const currentScorePercentage = `${((roundMetrics?.score ?? agent.currentScore ?? 0) * 100).toFixed(1)}%`;
  const bestRoundScoreValue =
    agent.bestRoundScore ?? agent.currentTopScore ?? 0;
  const bestEverScorePercentage = `${(bestRoundScoreValue * 100).toFixed(1)}%`;
  const bestRoundBadge =
    agent.bestRoundId && agent.bestRoundId > 0
      ? `Round ${agent.bestRoundId}`
      : null;
  const roundsParticipated = (
    agent.roundsParticipated || agent.totalRuns
  ).toLocaleString();
  const totalAlphaValue = Number(agent.alphaWonInPrizes ?? 0);
  const totalAlphaEarned = Math.round(totalAlphaValue);
  const totalTaoEarned = (() => {
    const v = (agent as any).taoWonInPrizes;
    if (typeof v === "number") return Math.round(v);
    return Math.round(Number(agent.alphaWonInPrizes ?? 0));
  })();

  const stats = [
    {
      title: "Rank",
      metric: currentRankValue,
      icon: LuAward,
      ...METRIC_CARD_GRADIENTS.amber,
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
            : (agent.completedTasks ?? 0);
        return total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
      })(),
      icon: LuTrophy,
      ...METRIC_CARD_GRADIENTS.yellow,
    },
    {
      title: "Current Score",
      metric: currentScorePercentage,
      icon: LuTarget,
      ...METRIC_CARD_GRADIENTS.green,
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
      ...METRIC_CARD_GRADIENTS.purple,
    },
    {
      title: "Avg Task Per Validator",
      metric: preAvg?.avgTasks ?? "0",
      icon: PiListChecksDuotone,
      ...METRIC_CARD_GRADIENTS.orange,
    },
    {
      title: "Best Ever Score",
      metric: bestEverScorePercentage,
      badge: bestRoundBadge,
      icon: LuStar,
      ...METRIC_CARD_GRADIENTS.green,
    },
    {
      title: "Alpha Earned",
      metric: `${totalAlphaEarned} α`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "TAO Earned",
      metric: `${totalTaoEarned} τ`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
  ];

  // In current view: show Rank, Current Score, Avg Response Time, Validators, Avg Tasks
  // In historical view: show Success Rate, Tasks Success, Tasks Failed, Alpha Earned (first row), Best Score Ever, Best Rank Ever, Rounds Won, TAO Earned (second row)
  const displayStats = (
    mode === "current"
      ? [stats[0], stats[2], stats[4], stats[3], stats[5]]
      : [stats[1], stats[6], stats[7], stats[8]]
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
          {displayStats.map((stat) => {
            const Icon = stat.icon as any;
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
                    background: `radial-gradient(circle, ${stat.glowColor}, transparent 70%)`,
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
                    <div className="flex items-center gap-2 mb-2">
                      <Text className="font-black text-3xl leading-none text-white transition-transform duration-300 group-hover:scale-105">
                        {stat.metric}
                      </Text>
                      {(stat as any).badge ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-white/15 text-white/90 border border-white/25 shadow-sm">
                          {(stat as any).badge}
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

// Score over time chart
const filterOptions = ["7D", "15D", "All"];
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
  scoreRoundData = [] as ScoreRoundDataPoint[],
  loading = false,
  error,
}: {
  className?: string;
  scoreRoundData?: ScoreRoundDataPoint[];
  loading?: boolean;
  error?: string | null;
}) {
  const [timeRange, setTimeRange] = useState<"7d" | "15d" | "all">("all");

  const { processedRows, benchmarkSeries } = useMemo(() => {
    const seriesMap = new Map<string, { label: string; color: string }>();

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
        if (topScore !== null) row.topBenchmarkScore = topScore;

        if (Array.isArray(point.benchmarks) && point.benchmarks.length > 0) {
          point.benchmarks.forEach((benchmark, idx) => {
            const rawId =
              benchmark.provider || benchmark.name || `benchmark-${idx}`;
            const slug = slugify(rawId);
            const key = `benchmark_${slug || idx}`;
            const normalized = normalizeScore(benchmark.score);

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
          (entry.round as number) > 0
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
  }, [scoreRoundData]);

  function handleFilterBy(option: string) {
    if (option === "7D") setTimeRange("7d");
    else if (option === "15D") setTimeRange("15d");
    else setTimeRange("all");
  }

  if (loading) {
    return <AgentScoreChartPlaceholder className={className} />;
  }

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
        headerClassName="flex-row items-start space-between text-white pb-4"
        rounded="xl"
        className={className}
        titleClassName="text-white"
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
    const roundsToShow = timeRange === "7d" ? 7 : 15;
    const minRound = Math.max(1, maxRound - roundsToShow + 1);
    return data.filter((d) => d.round >= minRound);
  };

  const displayData = getFilteredData(processedRows).map((entry: any) => {
    const scaled: Record<string, number | string | null> = {
      ...entry,
      score: entry.score != null ? Number(entry.score) * 100 : entry.score,
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
  const scoreValues = displayData
    .flatMap((entry) => {
      const values: number[] = [];
      if (typeof entry.score === "number") values.push(entry.score);
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
    if (!scoreValues.length) return [0, 100] as [number, number];
    const minValue = Math.min(...scoreValues);
    const maxValue = Math.max(...scoreValues);
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.2 : Math.max(5, maxValue * 0.1 || 5);
    const lowerBound = Math.max(0, minValue - padding);
    const upperBound = Math.min(100, maxValue + padding);
    return [Math.floor(lowerBound), Math.ceil(upperBound)] as [number, number];
  };

  const yAxisDomain = computeDomain();
  const legendItems = [
    { label: "Miner score", color: "#10B981" },
    ...(hasTopBenchmark
      ? [{ label: "Top miner score", color: "#FACC15" }]
      : []),
    ...benchmarkSeries.map((series) => ({
      label: series.label,
      color: series.color,
    })),
  ];

  return (
    <WidgetCard
      title={
        <span className="text-2xl font-black text-white">Score Over Time</span>
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
        "flex flex-col min-h-[500px] p-4 lg:p-5 !bg-transparent !border-transparent !shadow-none",
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
        <div className={cn("h-full w-full pt-2 min-h-[360px]")}>
          <ResponsiveContainer width="100%" height={360} minWidth={600}>
            <ComposedChart
              data={displayData}
              margin={{ top: 10, left: -10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
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
                content={<CustomTooltip />}
                formatter={(value: any, name: string) =>
                  value == null
                    ? ["—", name]
                    : [`${Number(value).toFixed(2)}%`, name]
                }
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
                name="Miner score"
              />
              {hasTopBenchmark && (
                <Line
                  type="monotone"
                  dataKey="topBenchmarkScore"
                  stroke="#FACC15"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 4"
                  name="Top miner score"
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
  runs,
  loading,
  error,
}: {
  selectedRound?: number | null;
  runs: AgentRunOverview[];
  loading: boolean;
  error?: string | null;
}) {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

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

  if (!runs.length) {
    return (
      <div className="mt-6">
        <div className="text-center py-12 text-white/70">
          No validator runs found for this agent
        </div>
      </div>
    );
  }

  const filteredRuns =
    selectedRound != null
      ? runs.filter((run) => run.roundId === selectedRound)
      : runs;

  const runsByValidator = filteredRuns.reduce(
    (acc, run) => {
      if (!acc[run.validatorId])
        acc[run.validatorId] = [] as typeof filteredRuns;
      acc[run.validatorId].push(run);
      return acc;
    },
    {} as Record<string, typeof filteredRuns>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-3">
        <div className="flex items-center flex-col sm:flex-row gap-3">
          <Text className="text-2xl text-center font-bold text-white">
            Agent Evaluation Runs ({Object.keys(runsByValidator).length})
            {selectedRound ? ` - Round ${selectedRound}` : ""}
          </Text>
        </div>
        <button
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 shadow-sm hover:shadow-md backdrop-blur-sm"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
            <PiInfoDuotone className="w-3.5 h-3.5 text-white" />
          </div>
          <span>How it works</span>
          <div className="ml-1 transition-transform duration-300 group-hover:scale-110">
            {isInfoExpanded ? (
              <PiCaretUpDuotone className="w-4 h-4 text-white/80 group-hover:text-white" />
            ) : (
              <PiCaretDownDuotone className="w-4 h-4 text-white/80 group-hover:text-white" />
            )}
          </div>
        </button>
      </div>

      {isInfoExpanded && (
        <div
          className="mb-6 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-500"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          <div className="pulse-bg-rounded-2xl" style={{ display: "none" }} />
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <PiInfoDuotone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                How Agent Evaluation Works
              </h3>
              <p className="text-sm text-white/70">
                Understanding the validation process
              </p>
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <PiTrophyDuotone className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Validators</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Each validator runs independent evaluations of your agent
                  across different tasks and scenarios to ensure fair and
                  comprehensive testing.
                </p>
              </div>
              <div
                className="rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <PiChartLineUpDuotone className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Scoring</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Agents are scored based on task completion accuracy, response
                  quality, and execution efficiency across multiple evaluation
                  criteria.
                </p>
              </div>
              <div
                className="rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <PiListChecksDuotone className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Ranking</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Your final rank is determined by your average performance
                  across all validators in each round, providing a comprehensive
                  ranking system.
                </p>
              </div>
              <div
                className="rounded-xl p-5 hover:scale-[1.02] transition-all duration-300 group"
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <PiTimerDuotone className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    Response Time
                  </h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Faster response times with maintained quality result in higher
                  scores, balancing speed and accuracy in the evaluation
                  process.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Removed duplicate Avg cards from validators section */}

      {filteredRuns.length === 0 ? (
        <div className="mt-6 text-center text-white/70">
          No runs available for the selected round.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 px-2 py-4">
          {Object.entries(runsByValidator).map(([validatorId, runs]) => {
            const latestRun = runs[0];
            const scorePct = Math.round((latestRun.score ?? 0) * 100);
            const responseTimeSeconds = (() => {
              if (
                typeof latestRun.averageEvaluationTime === "number" &&
                Number.isFinite(latestRun.averageEvaluationTime)
              ) {
                return Math.round(Math.abs(latestRun.averageEvaluationTime));
              }
              if (
                typeof latestRun.duration === "number" &&
                Number.isFinite(latestRun.duration)
              ) {
                return Math.round(Math.abs(latestRun.duration));
              }
              return 0;
            })();
            const validatorName =
              latestRun.validatorName ||
              `Validator ${validatorId.slice(0, 6)}...`;
            const validatorImage = resolveAssetUrl(
              latestRun.validatorImage || "/validators/default.png"
            );

            const secondaryStats = [
              {
                title: "Round",
                metric: latestRun.roundId,
                icon: PiClockDuotone,
                iconClassName:
                  "bg-gradient-to-br from-purple-500 to-violet-600",
                metricClassName: "text-purple-600",
              },
              {
                title: "Rank",
                metric:
                  typeof latestRun.ranking === "number" && latestRun.ranking > 0
                    ? `#${latestRun.ranking}`
                    : "N/A",
                icon: PiHashDuotone,
                iconClassName: "bg-gradient-to-br from-yellow-500 to-amber-600",
                metricClassName: "text-yellow-600",
              },
              {
                title: "Score",
                metric: `${scorePct}%`,
                icon: PiChartLineUpDuotone,
                iconClassName:
                  "bg-gradient-to-br from-emerald-500 to-green-600",
                metricClassName: "text-emerald-600",
              },
              {
                title: "Response Time",
                metric: `${responseTimeSeconds}s`,
                icon: PiTimerDuotone,
                iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600",
                metricClassName: "text-blue-600",
              },
              {
                title: "Tasks",
                metric: `${Math.max(0, latestRun.successfulTasks ?? 0)}/${Math.max(0, latestRun.totalTasks ?? 0)}`,
                icon: PiListChecksDuotone,
                iconClassName: "bg-gradient-to-br from-indigo-500 to-blue-600",
                metricClassName: "text-indigo-600",
              },
              {
                title: "Websites",
                metric: (() => {
                  const anyRun: any = latestRun as any;
                  if (typeof anyRun.websitesCount === "number")
                    return anyRun.websitesCount;
                  const ws = anyRun.websites;
                  if (Array.isArray(ws)) return ws.length;
                  if (typeof ws === "number") return ws;
                  if (typeof anyRun.totalWebsites === "number")
                    return anyRun.totalWebsites;
                  return 0;
                })(),
                icon: PiChartBarDuotone,
                iconClassName: "bg-gradient-to-br from-pink-500 to-rose-600",
                metricClassName: "text-pink-600",
              },
            ];

            return (
              <Link
                key={`agent-run-${validatorId}`}
                href={`${routes.agent_run}/${latestRun.runId}`}
              >
                <div
                  className="group transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] rounded-2xl cursor-pointer z-10 hover:z-40 border-2 border-white/20 hover:border-white/40"
                  style={{ background: "transparent", boxShadow: "none" }}
                >
                  <div
                    className="pulse-bg-rounded-2xl"
                    style={{ display: "none" }}
                  />
                  <div className="relative p-5 border-b border-white/15 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-sm rounded-t-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/30 group-hover:ring-white/50 shadow-xl transition-all duration-300">
                          <Image
                            src={validatorImage}
                            alt={validatorName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="font-bold text-white text-base group-hover:text-white transition-colors duration-300">
                            {validatorName}
                          </Text>
                          <Text className="text-xs text-white/60 tracking-wide font-mono truncate group-hover:text-white/80 transition-colors duration-300">
                            {validatorId.slice(0, 8)}...{validatorId.slice(-8)}
                          </Text>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg flex-shrink-0 transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/20 border border-white/20 group-hover:border-white/40">
                        <PiHashDuotone className="w-4 h-4" />
                        <span className="font-mono" title={latestRun.runId}>
                          {latestRun.runId.length > 12
                            ? `${latestRun.runId.slice(0, 6)}...${latestRun.runId.slice(-6)}`
                            : latestRun.runId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-5 space-y-3">
                    <div className="grid grid-cols-3 gap-3 bg-transparent border border-white/15 rounded-xl p-4 sm:p-5 group-hover:border-white/25 transition-all duration-300">
                      {secondaryStats.map((stat) => {
                        const Icon = stat.icon as any;
                        return (
                          <div
                            key={stat.title}
                            className="flex items-center gap-2.5 min-w-0"
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white flex-shrink-0 shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300",
                                stat.iconClassName
                              )}
                            >
                              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Text className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-medium">
                                {stat.title}
                              </Text>
                              <Text
                                className={cn(
                                  "font-bold text-base truncate text-white"
                                )}
                              >
                                {stat.metric}
                              </Text>
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
      )}
    </>
  );
}

// Enhanced custom tooltip for bar chart
const WebsitePerformanceTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const successRate = Math.round(data.successRate);
  const successful = data.successful;
  const total = data.total;
  const failed = total - successful;

  return (
    <div className="rounded-2xl border-2 border-white/30 bg-slate-900/95 p-4 shadow-2xl min-w-[220px]">
      {/* Website name header */}
      <div className="mb-3 pb-3 border-b border-white/20">
        <div className="text-base font-bold text-white mb-1">
          {data.website}
        </div>
        <div className="text-xs text-white/60 font-medium">
          Performance Metrics
        </div>
      </div>

      {/* Success Rate - Main metric */}
      <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
            Success Rate
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
        <div className="text-2xl font-black text-white">{successRate}%</div>
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
          <span className="text-sm font-bold text-blue-300">{total}</span>
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
            {successful}
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
          <span className="text-sm font-bold text-rose-300">{failed}</span>
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
}: {
  agentId: string;
  selectedRound?: number | null;
  runs: AgentRunOverview[];
  onSummaryChange?: (summary: {
    uniqueWebsites: number;
    totalTasks: number;
  }) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRows, setChartRows] = useState<
    Array<{
      website: string;
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
              return await agentsService.getAgentRun(agentId, run.runId);
            } catch (e) {
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
            const succ = Number.isFinite(w.successful as any)
              ? Math.max(0, Number(w.successful))
              : 0;
            const tasks = Number.isFinite(w.tasks as any)
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
            <span className="text-2xl font-black text-white">
              Performance per website
            </span>
          </div>

          {/* Bar Chart */}
          <div className="relative h-[450px] w-full">
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
                  {/* Enhanced gradients with glow effects */}
                  <linearGradient id="barGradient0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                    <stop offset="50%" stopColor="#06D6A0" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow0"
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

                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity={1} />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow1"
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

                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity={1} />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow2"
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

                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" stopOpacity={1} />
                    <stop offset="50%" stopColor="#EF4444" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow3"
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

                  <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow4"
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

                  <linearGradient id="barGradient5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F472B6" stopOpacity={1} />
                    <stop offset="50%" stopColor="#EC4899" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#DB2777" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow5"
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

                  <linearGradient id="barGradient6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity={1} />
                    <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow6"
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

                  <linearGradient id="barGradient7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                    <stop offset="50%" stopColor="#FBBF24" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow7"
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

                  <linearGradient id="barGradient8" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                    <stop offset="50%" stopColor="#10B981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                  </linearGradient>
                  <filter
                    id="glow8"
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
                        activeIndex === index ? `url(#glow${index})` : undefined
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
  const roundParam = searchParams.get("round");
  const [copiedHotkey, setCopiedHotkey] = useState(false);

  const selectedRoundFromQuery = useMemo(() => {
    if (!roundParam) return undefined;
    const parsed = Number.parseInt(roundParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [roundParam]);

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

  const {
    data: agentDetail,
    loading,
    error,
  } = useAgent(
    agentIdForQuery,
    selectedRoundFromQuery ? { round: selectedRoundFromQuery } : undefined
  );

  const agent = agentDetail?.agent ?? null;
  const roundMetrics = agentDetail?.roundMetrics ?? null;
  const availableRounds = agentDetail?.availableRounds ?? [];
  const apiScoreRoundData = agentDetail?.scoreRoundData ?? [];
  const githubAvailable = Boolean(agent?.githubUrl && !agent?.isSota);
  const taoStatsAvailable = Boolean(
    !agent?.isSota && (agent?.taostatsUrl || agent?.hotkey)
  );

  const defaultAvatar = useMemo(
    () =>
      resolveAssetUrl(
        `/miners/${Math.abs((agent?.uid ?? numericUidFromParam ?? 0) % 50)}.svg`
      ),
    [agent?.uid, numericUidFromParam]
  );
  const [agentImgSrc, setAgentImgSrc] = useState<string>(defaultAvatar);
  useEffect(() => {
    setAgentImgSrc(resolveAssetUrl(agent?.imageUrl, defaultAvatar));
  }, [agent?.imageUrl, defaultAvatar]);

  const [viewMode, setViewMode] = useState<"current" | "historical" | "runs">(
    "current"
  );
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

  const scoreRoundData: ScoreRoundDataPoint[] = useMemo(() => {
    const source = agentDetail?.scoreRoundData ?? [];
    if (!source.length) return [];
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
        score: normalizeScore(point.score) ?? 0,
        rank: point.rank ?? point.position ?? null,
        reward: point.reward ?? 0,
        timestamp:
          typeof point.timestamp === "string"
            ? point.timestamp
            : (point.timestamp?.toString() ?? ""),
        topScore:
          normalizeScore(
            point.topScore ?? point.top_score ?? point.bestScore
          ) ?? undefined,
        benchmarks: Array.isArray(point.benchmarks)
          ? point.benchmarks.map((benchmark: any) => ({
              name: benchmark.name ?? benchmark.provider ?? "Benchmark",
              provider: benchmark.provider,
              score: normalizeScore(benchmark.score) ?? 0,
            }))
          : undefined,
      };
    });
  }, [agentDetail?.scoreRoundData]);

  const canFetchRuns = useMemo(() => {
    if (!agentIdForQuery) return false;
    return /\d+/.test(agentIdForQuery);
  }, [agentIdForQuery]);

  const [runsState, setRunsState] = useState<{
    loading: boolean;
    runs: AgentRunOverview[];
    error: string | null;
  }>({
    loading: true,
    runs: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    if (
      !agentIdForQuery ||
      !currentRound ||
      !Number.isFinite(currentRound) ||
      !canFetchRuns
    ) {
      setRunsState({ loading: false, runs: [], error: null });
      return;
    }

    setRunsState({ loading: true, runs: [], error: null });

    (async () => {
      try {
        const { runs } = await fetchAllAgentRuns(agentIdForQuery, {
          roundId: currentRound,
        });
        if (!cancelled) {
          setRunsState({ loading: false, runs, error: null });
        }
      } catch (err: any) {
        if (!cancelled) {
          setRunsState({
            loading: false,
            runs: [],
            error: err?.message || "Failed to load validator runs",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentIdForQuery, canFetchRuns, currentRound]);

  const preAvg = useMemo(() => {
    const runs = runsState.runs;
    const rankingValues = runs
      .map((run) =>
        typeof run.ranking === "number" &&
        Number.isFinite(run.ranking) &&
        run.ranking > 0
          ? run.ranking
          : null
      )
      .filter((v): v is number => v !== null);
    const avgRankVal =
      rankingValues.length > 0
        ? rankingValues.reduce((sum, v) => sum + v, 0) / rankingValues.length
        : null;
    const scoreValues = runs
      .map((run) =>
        typeof run.score === "number" && Number.isFinite(run.score)
          ? run.score
          : null
      )
      .filter((v): v is number => v !== null);
    const avgScoreVal =
      scoreValues.length > 0
        ? Math.round(
            (scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length) * 100
          )
        : 0;
    const responseTimeValues = runs
      .map((run) => {
        if (
          typeof run.averageEvaluationTime === "number" &&
          Number.isFinite(run.averageEvaluationTime)
        )
          return Math.abs(run.averageEvaluationTime);
        if (typeof run.duration === "number" && Number.isFinite(run.duration))
          return Math.abs(run.duration);
        return null;
      })
      .filter((v): v is number => v !== null);
    const avgResp =
      responseTimeValues.length > 0
        ? Math.round(
            responseTimeValues.reduce((s, v) => s + v, 0) /
              responseTimeValues.length
          )
        : 0;
    const taskValues = runs
      .map((run) =>
        typeof run.completedTasks === "number" &&
        Number.isFinite(run.completedTasks)
          ? run.completedTasks
          : null
      )
      .filter((v): v is number => v !== null);
    const avgTasksVal =
      taskValues.length > 0
        ? Math.round(taskValues.reduce((s, v) => s + v, 0) / taskValues.length)
        : 0;
    return {
      avgRank: avgRankVal !== null ? avgRankVal.toFixed(1) : "N/A",
      avgScore: `${avgScoreVal}%`,
      avgResp: `${avgResp}s`,
      avgTasks: `${avgTasksVal}`,
    };
  }, [runsState.runs]);

  if (loading) {
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

  if (error || !agent) {
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
      : agent.currentRank && agent.currentRank > 0
        ? `#${agent.currentRank}`
        : "N/A";

  const currentScorePercentage = `${((roundMetrics?.score ?? agent.currentScore ?? 0) * 100).toFixed(1)}%`;

  // Historical metrics
  const bestRankEver =
    agent.bestRankEver && agent.bestRankEver > 0
      ? `#${agent.bestRankEver}`
      : "N/A";
  const bestEverScorePercentage = `${((agent.bestRoundScore ?? 0) * 100).toFixed(1)}%`;
  const bestRoundBadge =
    agent.bestRoundId && agent.bestRoundId > 0
      ? `Round ${agent.bestRoundId}`
      : null;
  const roundsParticipated = (
    agent.roundsParticipated ||
    agent.totalRuns ||
    0
  ).toLocaleString();
  const totalAlphaEarned = Math.round(Number(agent.alphaWonInPrizes ?? 0));
  const totalTaoEarned = Math.round(
    Number((agent as any).taoWonInPrizes ?? agent.alphaWonInPrizes ?? 0)
  );
  const currentStats = [
    {
      title: "Round",
      metric: currentRound ? `${currentRound}` : "N/A",
      icon: PiClockDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
    {
      title: "Rank",
      metric: currentRankValue,
      icon: LuAward,
      ...METRIC_CARD_GRADIENTS.amber,
    },
    {
      title: "Avg Score",
      metric: currentScorePercentage,
      icon: LuTarget,
      ...METRIC_CARD_GRADIENTS.emerald,
    },
    {
      title: "Avg Response Time",
      metric: preAvg?.avgResp ?? "0s",
      icon: PiTimerDuotone,
      ...METRIC_CARD_GRADIENTS.blue,
    },
    {
      title: "Validators",
      metric: (roundMetrics?.totalValidators ?? 0).toString(),
      icon: PiTrophyDuotone,
      ...METRIC_CARD_GRADIENTS.orange,
    },
    {
      title: "Avg Tasks Per Validator",
      metric: preAvg?.avgTasks ?? "0",
      icon: PiListChecksDuotone,
      ...METRIC_CARD_GRADIENTS.cyan,
    },
    {
      title: "Websites",
      metric: websitesSummary.unique.toString(),
      icon: PiChartBarDuotone,
      ...METRIC_CARD_GRADIENTS.violet,
    },
    {
      title: "TAO Earned",
      metric: `${totalTaoEarned} τ`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
  ];

  const historicalStats = [
    // Primera fila: Success Rate, Tasks Success, Tasks Failed, Alpha Earned
    {
      title: "Success Rate",
      metric: (() => {
        const total = agent.totalTasks ?? 0;
        const completed = agent.completedTasks ?? 0;
        return total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
      })(),
      icon: LuAward,
      ...METRIC_CARD_GRADIENTS.cyan,
    },
    {
      title: "Tasks Success",
      metric: (agent.completedTasks ?? 0).toLocaleString(),
      icon: LuCircleCheckBig,
      ...METRIC_CARD_GRADIENTS.emerald,
    },
    {
      title: "Tasks Failed",
      metric: Math.max(
        0,
        (agent.totalTasks ?? 0) - (agent.completedTasks ?? 0)
      ).toLocaleString(),
      icon: LuTarget,
      ...METRIC_CARD_GRADIENTS.indigo,
    },
    {
      title: "Alpha Earned",
      metric: `${totalAlphaEarned} α`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.purple,
    },
    // Segunda fila: Best Score Ever, Best Rank Ever, Rounds Won, TAO Earned
    {
      title: "Best Score Ever",
      metric: bestEverScorePercentage,
      badge: bestRoundBadge,
      icon: LuStar,
      ...METRIC_CARD_GRADIENTS.green,
    },
    {
      title: "Best Rank Ever",
      metric: bestRankEver,
      badge:
        (agent as any).bestRankRoundId && (agent as any).bestRankRoundId > 0
          ? `Round ${(agent as any).bestRankRoundId}`
          : null,
      icon: LuCrown,
      ...METRIC_CARD_GRADIENTS.yellow,
    },
    {
      title: "Rounds Won",
      metric: `${(agent as any).roundsWon ?? 0}/${agent.roundsParticipated ?? agent.totalRuns ?? 0}`,
      icon: LuTrophy,
      ...METRIC_CARD_GRADIENTS.orange,
    },
    {
      title: "TAO Earned",
      metric: `${totalTaoEarned} τ`,
      icon: PiCurrencyDollarDuotone,
      ...METRIC_CARD_GRADIENTS.violet,
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
      <div className="flex flex-col gap-1 mt-2 mb-2">
        <div
          className="rounded-3xl flex flex-col gap-6 p-5 lg:p-7 group"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          {/* Animated background gradient */}
          <div className="pulse-bg-rounded-3xl" style={{ display: "none" }} />

          {/* Header Section */}
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={agentImgSrc}
                  alt={agent.name}
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
                    {agent.name}
                  </span>
                  {agent.isSota && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/90 to-violet-500/90 text-white border-2 border-purple-400/70 shadow-lg backdrop-blur-sm">
                      SOTA
                    </span>
                  )}
                  {!agent.isSota &&
                    agent.status &&
                    agent.status !== "active" && (
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-sm shadow-lg",
                          agent.status === "maintenance"
                            ? "bg-yellow-500/90 text-white border-yellow-400/70"
                            : "bg-white/90 text-gray-900 border-gray-300/70"
                        )}
                      >
                        {agent.status}
                      </span>
                    )}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300",
                        githubAvailable
                          ? "bg-white/15 hover:bg-white/25 cursor-pointer border border-white/20 hover:border-white/40 shadow-sm hover:scale-110 active:scale-95"
                          : "bg-white/5 cursor-not-allowed opacity-40 border border-white/10"
                      )}
                      title={
                        agent.isSota
                          ? "GitHub repository not available for SOTA benchmarks"
                          : agent.githubUrl
                            ? "View GitHub repository"
                            : "GitHub repository not available"
                      }
                    >
                      {githubAvailable ? (
                        <a
                          href={agent.githubUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full w-full items-center justify-center group"
                        >
                          <PiGithubLogoDuotone className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </a>
                      ) : (
                        <PiGithubLogoDuotone className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300",
                        taoStatsAvailable
                          ? "bg-white/15 hover:bg-white/25 cursor-pointer border border-white/20 hover:border-white/40 shadow-sm hover:scale-110 active:scale-95"
                          : "bg-white/5 cursor-not-allowed opacity-40 border border-white/10"
                      )}
                      title={
                        agent.isSota
                          ? "On-chain explorer is not available for SOTA benchmarks"
                          : agent.taostatsUrl || agent.hotkey
                            ? "View on TaoStats"
                            : "TaoStats link not available"
                      }
                    >
                      {taoStatsAvailable ? (
                        <a
                          href={
                            agent.taostatsUrl ||
                            (agent.hotkey
                              ? `https://taostats.io/subnets/36/metagraph?filter=${encodeURIComponent(agent.hotkey)}`
                              : "#")
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full w-full items-center justify-center group"
                        >
                          <PiInfoDuotone className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </a>
                      ) : (
                        <PiInfoDuotone className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <PiHashDuotone className="w-4 h-4 text-emerald-300" />
                    <span className="font-mono font-semibold">
                      UID: {agent.isSota ? "—" : (agent.uid ?? "unknown")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiKeyDuotone className="w-4 h-4 text-sky-300" />
                    <span className="font-mono text-xs font-semibold">
                      {agent.isSota
                        ? "No on-chain hotkey"
                        : agent.hotkey
                          ? `${agent.hotkey.slice(0, 8)}...${agent.hotkey.slice(-8)}`
                          : "unknown"}
                    </span>
                    {!agent.isSota && agent.hotkey && (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(agent.hotkey!);
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
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
                  <span className="relative z-10 hidden sm:inline">Round</span>
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
              {agent.isSota && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-500/90 border-2 border-yellow-400/70 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  <PiSparkle className="h-4 w-4" />
                  Benchmark Agent
                </span>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          {headerStats.length > 0 && (
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 z-10">
              {headerStats.map((stat) => {
                const Icon = stat.icon as any;
                return (
                  <div
                    key={stat.title}
                    className="group relative overflow-hidden rounded-xl md:rounded-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
                  >
                    {/* Card background with gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl md:rounded-2xl opacity-80 bg-gradient-to-br transition-opacity duration-300 group-hover:opacity-90",
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
                        boxShadow: `0 0 12px ${stat.glowColor}33`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative p-2.5 md:p-4 flex items-center gap-2 md:gap-4">
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
                        <div className="flex items-center gap-1 md:gap-2">
                          <Text className="text-lg md:text-3xl font-black text-white leading-none tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                            {stat.metric}
                          </Text>
                          {(stat as any).badge ? (
                            <span className="hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-white/15 text-white/90 border border-white/25 shadow-sm">
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
                runs={runsState.runs}
                loading={runsState.loading}
                error={runsState.error ?? undefined}
              />
            ) : (
              <>
                {viewMode === "current" ? (
                  <div>
                    <RoundWebsitesChart
                      agentId={agentIdForQuery ?? trimmedId}
                      selectedRound={currentRound ?? null}
                      runs={runsState.runs}
                      onSummaryChange={handleSummaryChange}
                    />
                  </div>
                ) : (
                  <div>
                    <AgentScoreChart
                      className="w-full"
                      scoreRoundData={scoreRoundData}
                      loading={loading}
                      error={error}
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
