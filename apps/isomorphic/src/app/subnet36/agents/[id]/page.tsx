"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import cn from "@core/utils/class-names";
import { Button, Text } from "rizzui";
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
} from "recharts";
import {
  AgentHeaderPlaceholder,
  AgentStatsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";
import { useMinerDetails, useAgentRuns } from "@/services/hooks/useAgents";
import { agentsService } from "@/services/api/agents.service";
import type {
  ScoreRoundDataPoint,
  AgentData,
  AgentRoundMetrics,
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
  PiTrophyDuotone,
  PiListChecksDuotone,
  PiTrendUpDuotone,
  PiTimerDuotone,
  PiCaretDownDuotone,
  PiCaretUpDuotone,
} from "react-icons/pi";
import { LuCircleCheckBig, LuTrophy, LuAward, LuTarget, LuStar, LuCrown } from "react-icons/lu";

// ============================================================================
// THEME COLOR SYSTEM - Centralized color variables for easy theme changes
// ============================================================================
const THEME_COLORS = {
  // Primary blue-black theme
  border: "border-slate-900/60",
  bgGradient: "bg-gradient-to-br from-slate-950/50 via-blue-950/40 to-slate-900/30",
  shadow: "shadow-[0_20px_60px_-15px_rgba(15,23,42,0.6)]",
  shadowHover: "hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]",
  // Pulsing overlay
  pulseGradient: "from-white/5 via-transparent to-white/5",
  // Border colors for various elements
  lightBorder: "border-white/20",
  mediumBorder: "border-white/30",
} as const;

// ============================================================================
// STYLE CONSTANTS - Modern Glassmorphism Design System
// ============================================================================
const glassCardBase = `relative overflow-hidden backdrop-blur-xl transition-all duration-500 ${THEME_COLORS.border} ${THEME_COLORS.bgGradient} ${THEME_COLORS.shadow}`;
const statsCardBase = `${glassCardBase} rounded-3xl hover:-translate-y-3 ${THEME_COLORS.shadowHover}`;
const chartCardBase = `${glassCardBase} rounded-2xl`;

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

// Agent stats band
function AgentStats({ agent, roundMetrics, mode = 'current', preAvg }: { agent?: AgentData | null; roundMetrics?: AgentRoundMetrics | null; mode?: 'current' | 'historical'; preAvg?: any }) {
  const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } = useScrollableSlider();

  if (!agent) {
    return <AgentStatsPlaceholder />;
  }

  const currentRankValue =
    roundMetrics?.rank && roundMetrics.rank > 0
      ? `#${roundMetrics.rank}`
      : agent.currentRank && agent.currentRank > 0
      ? `#${agent.currentRank}`
      : "N/A";

  const bestRankEver = agent.bestRankEver && agent.bestRankEver > 0 ? `#${agent.bestRankEver}` : "N/A";
  const currentScorePercentage = `${((roundMetrics?.score ?? agent.currentScore ?? 0) * 100).toFixed(1)}%`;
  const bestEverScorePercentage = `${((agent.bestScore ?? 0) * 100).toFixed(1)}%`;
  const roundsParticipated = (agent.roundsParticipated || agent.totalRuns).toLocaleString();
  const totalAlphaEarned = (agent.totalReward ?? 0).toFixed(2);

  const stats = [
    {
      title: "Current Rank",
      metric: currentRankValue,
      icon: LuAward,
      gradient: "from-amber-500/30 via-yellow-500/20 to-orange-500/30",
      bgGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/15",
      iconGradient: "from-amber-400 via-yellow-500 to-orange-600",
      borderColor: "border-amber-400/50",
      glowColor: "rgba(251,191,36,0.5)",
    },
    {
      title: "Best Rank Ever",
      metric: bestRankEver,
      icon: LuTrophy,
      gradient: "from-yellow-500/30 via-amber-500/20 to-yellow-600/30",
      bgGradient: "from-yellow-500/20 via-amber-500/10 to-yellow-600/15",
      iconGradient: "from-yellow-400 via-amber-500 to-yellow-600",
      borderColor: "border-yellow-400/50",
      glowColor: "rgba(250,204,21,0.5)",
    },
    {
      title: "Current Score",
      metric: currentScorePercentage,
      icon: LuTarget,
      gradient: "from-emerald-500/30 via-teal-500/20 to-green-500/30",
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-green-500/15",
      iconGradient: "from-emerald-400 via-teal-500 to-green-600",
      borderColor: "border-emerald-400/50",
      glowColor: "rgba(16,185,129,0.5)",
    },
    {
      title: "Validators",
      metric: (roundMetrics?.totalValidators ?? 0).toString(),
      icon: PiTrophyDuotone,
      gradient: "from-blue-500/30 via-indigo-500/20 to-blue-600/30",
      bgGradient: "from-blue-500/20 via-indigo-500/10 to-blue-600/15",
      iconGradient: "from-blue-400 via-indigo-500 to-blue-600",
      borderColor: "border-blue-400/50",
      glowColor: "rgba(59,130,246,0.5)",
    },
    {
      title: "Avg Response Time",
      metric: preAvg?.avgResp ?? "0s",
      icon: PiClockDuotone,
      gradient: "from-purple-500/30 via-violet-500/20 to-purple-600/30",
      bgGradient: "from-purple-500/20 via-violet-500/10 to-purple-600/15",
      iconGradient: "from-purple-400 via-violet-500 to-purple-600",
      borderColor: "border-purple-400/50",
      glowColor: "rgba(168,85,247,0.5)",
    },
    {
      title: "Avg Tasks",
      metric: preAvg?.avgTasks ?? "0",
      icon: PiListChecksDuotone,
      gradient: "from-orange-500/30 via-rose-500/20 to-orange-600/30",
      bgGradient: "from-orange-500/20 via-rose-500/10 to-orange-600/15",
      iconGradient: "from-orange-400 via-rose-500 to-orange-600",
      borderColor: "border-orange-400/50",
      glowColor: "rgba(251,146,60,0.5)",
    },
    {
      title: "Best Ever Score",
      metric: bestEverScorePercentage,
      icon: LuStar,
      gradient: "from-emerald-500/30 via-teal-500/20 to-green-500/30",
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-green-500/15",
      iconGradient: "from-emerald-400 via-teal-500 to-green-600",
      borderColor: "border-emerald-400/50",
      glowColor: "rgba(16,185,129,0.5)",
    },
    {
      title: "Rounds Participated",
      metric: roundsParticipated,
      icon: LuCircleCheckBig,
      gradient: "from-cyan-500/30 via-teal-500/20 to-cyan-600/30",
      bgGradient: "from-cyan-500/20 via-teal-500/10 to-cyan-600/15",
      iconGradient: "from-cyan-400 via-teal-500 to-cyan-600",
      borderColor: "border-cyan-400/50",
      glowColor: "rgba(6,182,212,0.5)",
    },
    {
      title: "Total Alpha Earned",
      metric: `${totalAlphaEarned} α`,
      icon: PiCurrencyDollarDuotone,
      gradient: "from-violet-500/30 via-purple-500/20 to-fuchsia-500/30",
      bgGradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/15",
      iconGradient: "from-violet-400 via-purple-500 to-fuchsia-600",
      borderColor: "border-violet-400/50",
      glowColor: "rgba(139,92,246,0.5)",
    },
  ];

  // In current view: show Current Rank, Current Score, Validators, Avg Response Time, Avg Tasks
  // In historical view: show Best Rank Ever, Best Ever Score, Rounds Participated, Total Alpha Earned
  const displayStats = (mode === 'current' ? [stats[0], stats[2], stats[3], stats[4], stats[5]] : [stats[1], stats[6], stats[7], stats[8]]).filter(Boolean);

  return (
    <div className="relative flex w-auto items-center overflow-visible">
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-visible pt-4 pb-4">
        <div ref={sliderEl} className="custom-scrollbar grid grid-flow-col gap-3 overflow-x-auto overflow-y-visible scroll-smooth 2xl:gap-4 3xl:gap-4 px-2 pb-1 [&::-webkit-scrollbar]:h-0">
          {displayStats.map((stat) => {
            const Icon = stat.icon as any;
            return (
              <div
                key={stat.title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl p-3 min-w-[170px] cursor-pointer backdrop-blur-xl transition-all duration-500 hover:-translate-y-2",
                  THEME_COLORS.shadowHover,
                  THEME_COLORS.lightBorder,
                  THEME_COLORS.bgGradient,
                  THEME_COLORS.shadow
                )}
              >
                {/* Animated pulsing background */}
                <div className={cn("absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br animate-pulse pointer-events-none", THEME_COLORS.pulseGradient)} />

                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                      stat.iconGradient
                    )}
                  >
                    <Icon className="w-5 h-5 text-white transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <div className="flex-1">
                    <Text className="font-black text-2xl leading-none text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] transition-all duration-300 group-hover:scale-105">
                      {stat.metric}
                    </Text>
                    <Text className="text-[10px] font-semibold text-white/80 group-hover:text-white uppercase tracking-wider mt-1 transition-colors duration-300">
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
        className="!absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 pe-2 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}

// Score over time chart
const filterOptions = ["7D", "15D", "All"];
const BENCHMARK_COLORS: Record<string, string> = { openai: "#2563EB", anthropic: "#F97316", browser: "#8B5CF6", "browser-use": "#8B5CF6", browser_use: "#8B5CF6", claude: "#F97316" };
const BENCHMARK_COLOR_PALETTE = ["#2563EB", "#F97316", "#8B5CF6", "#14B8A6", "#F472B6", "#EC4899"];

function AgentScoreChart({ className, scoreRoundData = [] as ScoreRoundDataPoint[] }: { className?: string; scoreRoundData?: ScoreRoundDataPoint[] }) {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const [timeRange, setTimeRange] = useState<"7d" | "15d" | "all">("all");

  const { data: agent, loading, error } = useMinerDetails(uid);

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
            const rawId = benchmark.provider || benchmark.name || `benchmark-${idx}`;
            const slug = slugify(rawId);
            const key = `benchmark_${slug || idx}`;
            const normalized = normalizeScore(benchmark.score);

            if (!seriesMap.has(key)) {
              const color = BENCHMARK_COLORS[slug] || BENCHMARK_COLOR_PALETTE[seriesMap.size % BENCHMARK_COLOR_PALETTE.length];
              seriesMap.set(key, { label: benchmark.name || benchmark.provider || "Benchmark", color });
            }
            row[key] = normalized;
          });
        }
        return row;
      })
      .filter((entry) => typeof entry.round === "number" && Number.isFinite(entry.round) && (entry.round as number) > 0)
      .sort((a, b) => (Number(a.round) - Number(b.round)));

    return {
      processedRows: rows,
      benchmarkSeries: Array.from(seriesMap.entries()).map(([key, meta]) => ({ key, label: meta.label, color: meta.color })),
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
      <WidgetCard title="Score Over Time" action={<ButtonGroupAction options={filterOptions} onChange={(option) => handleFilterBy(option)} />} headerClassName="flex-row items-start space-between text-white pb-4" rounded="xl" className={cn(chartCardBase, className)} titleClassName="text-white">
        <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none" />
        <div className="relative flex h-[273px] items-center justify-center text-rose-200">
          <div className="text-center">
            <p className="text-lg font-semibold">Error loading performance data</p>
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
      topBenchmarkScore: entry.topBenchmarkScore != null ? Number(entry.topBenchmarkScore) * 100 : entry.topBenchmarkScore,
    };
    benchmarkSeries.forEach((series) => {
      if (scaled[series.key] != null) scaled[series.key] = Number(scaled[series.key]) * 100;
    });
    return scaled;
  });

  const hasTopBenchmark = displayData.some((entry) => typeof entry.topBenchmarkScore === "number");
  const scoreValues = displayData
    .flatMap((entry) => {
      const values: number[] = [];
      if (typeof entry.score === "number") values.push(entry.score);
      if (typeof entry.topBenchmarkScore === "number") values.push(entry.topBenchmarkScore);
      benchmarkSeries.forEach((series) => {
        if (typeof entry[series.key] === "number") values.push(entry[series.key] as number);
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
    { label: "Agent score", color: "#10B981" },
    ...(hasTopBenchmark ? [{ label: "Top score", color: "#FACC15" }] : []),
    ...benchmarkSeries.map((series) => ({ label: series.label, color: series.color })),
  ];

  return (
    <WidgetCard
      title={<span className="text-2xl font-bold text-white">Score Over Time</span>}
      action={<ButtonGroupAction options={filterOptions} onChange={(option) => handleFilterBy(option)} />}
      headerClassName="flex-row items-start space-between pb-4"
      rounded="xl"
      className={cn(chartCardBase, "flex flex-col min-h-[500px]", className)}
      titleClassName="text-white"
    >
      <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none" />
      {processedRows.length === 0 && (
        <div className={cn("relative mb-4 rounded-lg backdrop-blur-sm p-3 text-sm text-white/90", THEME_COLORS.border, "bg-blue-900/20")}>
          <strong>No history yet:</strong> This agent has not completed any recorded rounds.
        </div>
      )}
      <div className="relative custom-scrollbar flex-1 overflow-x-auto scroll-smooth">
        <div className={cn("h-full w-full pt-2")}> 
          <ResponsiveContainer width="100%" height="100%" minWidth={600}>
            <ComposedChart data={displayData} margin={{ top: 10, left: -10 }}>
              <defs>
                <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="round" axisLine tickLine={false} tickFormatter={(value) => `${value}`} tick={{ fill: "rgba(226,232,240,0.9)", fontSize: 13, fontWeight: 500 }} />
              <YAxis axisLine tickLine={false} domain={yAxisDomain} tick={<CustomYAxisTick postfix="%" />} stroke="rgba(148,163,184,0.3)" />
              <Tooltip
                content={<CustomTooltip />}
                formatter={(value: any, name: string) => (value == null ? ["—", name] : [`${Number(value).toFixed(1)}%`, name])}
                labelFormatter={(value, payload) => {
                  const data = payload?.[0]?.payload;
                  return `${value}${data?.rank ? ` (Rank #${data.rank})` : ""}`;
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#scoreArea)" name="Agent score" />
              {hasTopBenchmark && (
                <Line type="monotone" dataKey="topBenchmarkScore" stroke="#FACC15" strokeWidth={2} dot={false} strokeDasharray="6 4" name="Top score" />
              )}
              {benchmarkSeries.map((series) => (
                <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={1.75} dot={false} name={series.label} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {legendItems.length > 1 && (
        <div className="relative mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-white/70">
          {legendItems.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

// Validators/runs list
function AgentValidators({ selectedRound }: { selectedRound?: number | null }) {
  const { id } = useParams();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const queryParams = useMemo(
    () => ({ limit: 50, sortBy: "startTime" as const, sortOrder: "desc" as const, ...(selectedRound !== null ? { roundId: selectedRound } : {}) }),
    [selectedRound]
  );

  const { data: runsData, loading } = useAgentRuns(id as string, queryParams);
  const availableRounds = runsData?.data?.availableRounds ?? [];

  if (loading) {
    return <AgentValidatorsPlaceholder />;
  }

  if (!runsData?.data?.runs) {
    return (
      <div className="mt-6">
        <div className="text-center py-12">
          <div className="text-gray-500">No validator runs found for this agent</div>
        </div>
      </div>
    );
  }

  const effectiveRound = selectedRound ?? runsData.data.selectedRound ?? (availableRounds.length > 0 ? availableRounds[0] : null);

  const filteredRuns = effectiveRound != null ? (runsData.data.runs ?? []).filter((run) => run.roundId === effectiveRound) : (runsData.data.runs ?? []);

  const runsByValidator = filteredRuns.reduce((acc, run) => {
    if (!acc[run.validatorId]) acc[run.validatorId] = [] as typeof filteredRuns;
    acc[run.validatorId].push(run);
    return acc;
  }, {} as Record<string, typeof filteredRuns>);

  const rankingValues = filteredRuns
    .map((run) => (typeof run.ranking === "number" && Number.isFinite(run.ranking) ? (run.ranking > 0 ? run.ranking : null) : null))
    .filter((value): value is number => value !== null);
  const avgRankValue = rankingValues.length > 0 ? rankingValues.reduce((sum, value) => sum + value, 0) / rankingValues.length : null;
  const avgRank = avgRankValue !== null ? avgRankValue.toFixed(1) : "N/A";

  const scoreValues = filteredRuns
    .map((run) => (typeof run.score === "number" && Number.isFinite(run.score) ? run.score : null))
    .filter((value): value is number => value !== null);
  const avgScore = scoreValues.length > 0 ? ((scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length) * 100).toFixed(1) : "0";

  const responseTimeValues = filteredRuns
    .map((run) => {
      if (typeof run.averageEvaluationTime === "number" && Number.isFinite(run.averageEvaluationTime)) return Math.abs(run.averageEvaluationTime);
      if (typeof run.duration === "number" && Number.isFinite(run.duration)) return Math.abs(run.duration);
      return null;
    })
    .filter((value): value is number => value !== null);
  const avgResponseTime = responseTimeValues.length > 0
    ? Math.round(responseTimeValues.reduce((sum, value) => sum + value, 0) / responseTimeValues.length).toString()
    : "0";

  const tasksValues = filteredRuns
    .map((run) => (typeof run.completedTasks === "number" && Number.isFinite(run.completedTasks) ? run.completedTasks : null))
    .filter((value): value is number => value !== null);
  const avgTasks = tasksValues.length > 0 ? Math.round(tasksValues.reduce((sum, value) => sum + value, 0) / tasksValues.length).toString() : "0";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-6">
        <div className="flex items-center flex-col sm:flex-row gap-3">
          <Text className="text-2xl text-center font-bold text-white">
            Agent Evaluation Runs ({Object.keys(runsByValidator).length})
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
        <div className={cn("mb-6 relative overflow-hidden backdrop-blur-xl rounded-2xl p-6 animate-in slide-in-from-top-2 duration-500", THEME_COLORS.border, THEME_COLORS.bgGradient, THEME_COLORS.shadow)}>
          <div className={cn("absolute inset-0 opacity-30 bg-gradient-to-br animate-pulse pointer-events-none", THEME_COLORS.pulseGradient)} />
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <PiInfoDuotone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How Agent Evaluation Works</h3>
              <p className="text-sm text-white/70">Understanding the validation process</p>
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <PiTrophyDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white">Validators</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">Each validator runs independent evaluations of your agent across different tasks and scenarios to ensure fair and comprehensive testing.</p>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                    <PiChartLineUpDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white">Scoring</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">Agents are scored based on task completion accuracy, response quality, and execution efficiency across multiple evaluation criteria.</p>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <PiListChecksDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white">Ranking</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">Your final rank is determined by your average performance across all validators in each round, providing a comprehensive ranking system.</p>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <PiTimerDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white">Response Time</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">Faster response times with maintained quality result in higher scores, balancing speed and accuracy in the evaluation process.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Removed duplicate Avg cards from validators section */}

      {filteredRuns.length === 0 ? (
        <div className="mt-6 text-center text-white/70">No runs available for the selected round.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 px-2 py-4">
          {Object.entries(runsByValidator).map(([validatorId, runs]) => {
            const latestRun = runs[0];
            const scorePct = Math.round((latestRun.score ?? 0) * 100);
            const responseTimeSeconds = (() => {
              if (typeof latestRun.averageEvaluationTime === "number" && Number.isFinite(latestRun.averageEvaluationTime)) {
                return Math.round(Math.abs(latestRun.averageEvaluationTime));
              }
              if (typeof latestRun.duration === "number" && Number.isFinite(latestRun.duration)) {
                return Math.round(Math.abs(latestRun.duration));
              }
              return 0;
            })();
            const validatorName = latestRun.validatorName || `Validator ${validatorId.slice(0, 6)}...`;
            const validatorImage = resolveAssetUrl(latestRun.validatorImage || "/validators/default.png");

            const secondaryStats = [
              { title: "Round", metric: latestRun.roundId, icon: PiCurrencyDollarDuotone, iconClassName: "bg-gradient-to-br from-purple-500 to-violet-600", metricClassName: "text-purple-600" },
              { title: "Rank", metric: typeof latestRun.ranking === "number" && latestRun.ranking > 0 ? `#${latestRun.ranking}` : "N/A", icon: PiHashDuotone, iconClassName: "bg-gradient-to-br from-yellow-500 to-amber-600", metricClassName: "text-yellow-600" },
              { title: "Score", metric: `${scorePct}%`, icon: PiChartLineUpDuotone, iconClassName: "bg-gradient-to-br from-emerald-500 to-green-600", metricClassName: "text-emerald-600" },
              { title: "Response Time", metric: `${responseTimeSeconds}s`, icon: PiClockDuotone, iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600", metricClassName: "text-blue-600" },
              { title: "Tasks", metric: `${Math.max(0, latestRun.successfulTasks ?? 0)}/${Math.max(0, latestRun.totalTasks ?? 0)}`, icon: PiListChecksDuotone, iconClassName: "bg-gradient-to-br from-indigo-500 to-blue-600", metricClassName: "text-indigo-600" },
            ];

            return (
              <Link key={`agent-run-${validatorId}`} href={`${routes.agent_run}/${latestRun.runId}`}>
                <div className={cn("group relative overflow-hidden backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 rounded-2xl cursor-pointer", THEME_COLORS.shadowHover, THEME_COLORS.border, THEME_COLORS.bgGradient, THEME_COLORS.shadow)}>
                  <div className={cn("absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br animate-pulse pointer-events-none", THEME_COLORS.pulseGradient)} />
                  <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/20 shadow-lg">
                          <Image src={validatorImage} alt={validatorName} fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="font-bold text-white">{validatorName}</Text>
                          <Text className="text-xs text-white/60 tracking-wide font-mono truncate">{validatorId.slice(0, 8)}...{validatorId.slice(-8)}</Text>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg flex-shrink-0 transition-all duration-300 hover:shadow-xl hover:bg-white/20 border border-white/20">
                        <PiHashDuotone className="w-3.5 h-3.5" />
                        <span className="font-mono">{latestRun.runId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4">
                      {secondaryStats.map((stat) => {
                        const Icon = stat.icon as any;
                        return (
                          <div key={stat.title} className="flex items-center gap-2 w-full xs:w-1/2 sm:w-auto">
                            <div className={cn("flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-white flex-shrink-0 shadow-lg", stat.iconClassName)}>
                              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Text className="text-xs text-white/70">{stat.title}</Text>
                              <Text className={cn("font-bold text-sm truncate", stat.metricClassName ? "text-white" : "text-white")}>{stat.metric}</Text>
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

// Main Agent page (header + sections)
export default function Page() {
  const { id } = useParams();
  const uid = Number.parseInt(id as string, 10);
  const searchParams = useSearchParams();
  const roundParam = searchParams.get("round");
  const [copiedHotkey, setCopiedHotkey] = useState(false);

  const selectedRoundFromQuery = useMemo(() => {
    if (!roundParam) return undefined;
    const parsed = Number.parseInt(roundParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [roundParam]);

  const { data: agentData, loading, error } = useMinerDetails(
    uid,
    selectedRoundFromQuery ? { round: selectedRoundFromQuery } : undefined
  );

  const agent = agentData?.agent;
  const roundMetrics = agentData?.roundMetrics ?? null;
  const apiScoreRoundData = agentData?.scoreRoundData;
  const githubAvailable = Boolean(agent?.githubUrl && !agent?.isSota);
  const taoStatsAvailable = Boolean(!agent?.isSota && (agent?.taostatsUrl || agent?.hotkey));

  // Avatar state must be declared before any conditional return to preserve hook order
  const defaultAvatar = `/miners/${Math.abs((uid ?? 0) % 50)}.svg`;
  const [agentImgSrc, setAgentImgSrc] = useState<string>(defaultAvatar);
  useEffect(() => {
    const candidate = agent?.imageUrl && agent.imageUrl.trim() !== "" ? agent.imageUrl : defaultAvatar;
    setAgentImgSrc(candidate);
  }, [agent?.imageUrl, defaultAvatar]);

  // Current | Historical view toggle
  const [viewMode, setViewMode] = useState<'current' | 'historical' | 'runs'>('current');

  const scoreRoundData: ScoreRoundDataPoint[] = useMemo(() => {
    if (!apiScoreRoundData || apiScoreRoundData.length === 0) return [];
    return apiScoreRoundData.map((point: any) => {
      const roundId = point.round_id ?? point.validator_round_id ?? point.roundId ?? point.validatorRoundId ?? point.round ?? 0;
      return {
        round_id: Number(roundId),
        score: normalizeScore(point.score) ?? 0,
        rank: point.rank ?? point.position ?? null,
        reward: point.reward ?? 0,
        timestamp: typeof point.timestamp === "string" ? point.timestamp : point.timestamp?.toString() ?? "",
        topScore: normalizeScore(point.topScore ?? point.top_score ?? point.bestScore) ?? undefined,
        benchmarks: Array.isArray(point.benchmarks)
          ? point.benchmarks.map((benchmark: any) => ({ name: benchmark.name ?? benchmark.provider ?? "Benchmark", provider: benchmark.provider, score: normalizeScore(benchmark.score) ?? 0 }))
          : undefined,
      };
    });
  }, [apiScoreRoundData]);

  const currentRound = selectedRoundFromQuery ?? roundMetrics?.roundId ?? (Array.isArray(agentData?.availableRounds) ? agentData?.availableRounds[0] : undefined);

  // Preload agent runs to compute round-level aggregates for Current view
  const runsQueryParams = useMemo(
    () => ({
      limit: 50,
      sortBy: 'startTime' as const,
      sortOrder: 'desc' as const,
      ...(currentRound != null ? { roundId: currentRound } : {}),
    }),
    [currentRound]
  );
  const { data: preRunsData } = useAgentRuns(String(uid), runsQueryParams);
  const preFilteredRuns = useMemo(() => {
    const all = preRunsData?.data?.runs ?? [];
    if (currentRound == null) return all;
    return all.filter((run) => run.roundId === currentRound);
  }, [preRunsData?.data?.runs, currentRound]);
  const preAvg = useMemo(() => {
    const runs = preFilteredRuns;
    const rankingValues = runs
      .map((run) => (typeof run.ranking === 'number' && Number.isFinite(run.ranking) && run.ranking > 0 ? run.ranking : null))
      .filter((v): v is number => v !== null);
    const avgRankVal = rankingValues.length > 0
      ? rankingValues.reduce((sum, v) => sum + v, 0) / rankingValues.length
      : null;
    const scoreValues = runs
      .map((run) => (typeof run.score === 'number' && Number.isFinite(run.score) ? run.score : null))
      .filter((v): v is number => v !== null);
    const avgScoreVal = scoreValues.length > 0
      ? Math.round((scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length) * 100)
      : 0;
    const responseTimeValues = runs
      .map((run) => {
        if (typeof run.averageEvaluationTime === 'number' && Number.isFinite(run.averageEvaluationTime)) return Math.abs(run.averageEvaluationTime);
        if (typeof run.duration === 'number' && Number.isFinite(run.duration)) return Math.abs(run.duration);
        return null;
      })
      .filter((v): v is number => v !== null);
    const avgResp = responseTimeValues.length > 0
      ? Math.round(responseTimeValues.reduce((s, v) => s + v, 0) / responseTimeValues.length)
      : 0;
    const taskValues = runs
      .map((run) => (typeof run.completedTasks === 'number' && Number.isFinite(run.completedTasks) ? run.completedTasks : null))
      .filter((v): v is number => v !== null);
    const avgTasksVal = taskValues.length > 0
      ? Math.round(taskValues.reduce((s, v) => s + v, 0) / taskValues.length)
      : 0;
    return {
      avgRank: avgRankVal !== null ? avgRankVal.toFixed(1) : 'N/A',
      avgScore: `${avgScoreVal}%`,
      avgResp: `${avgResp}s`,
      avgTasks: `${avgTasksVal}`,
    };
  }, [preFilteredRuns]);

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

// Websites performance for current round
function RoundWebsitesChart({ agentId, selectedRound }: { agentId: string; selectedRound?: number | null }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRows, setChartRows] = useState<Array<{ website: string; successRate: number; successful: number; total: number }>>([]);
  const [totals, setTotals] = useState<{ successful: number; total: number }>({ successful: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    async function fetchWebsites() {
      if (!selectedRound || !Number.isFinite(selectedRound)) {
        setLoading(false);
        setChartRows([]);
        setTotals({ successful: 0, total: 0 });
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const runsResp = await agentsService.getAgentRuns(agentId, { roundId: selectedRound, limit: 50, sortBy: 'startTime', sortOrder: 'desc' });
        const runs = runsResp?.data?.runs ?? [];
        if (!runs.length) {
          if (!cancelled) {
            setChartRows([]);
            setTotals({ successful: 0, total: 0 });
          }
          return;
        }

        const details = await Promise.all(
          runs.map(async (run) => {
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
            const key = (w.website || 'unknown').toString();
            const entry = bySite.get(key) || { successful: 0, total: 0 };
            const succ = Number.isFinite(w.successful as any) ? Math.max(0, Number(w.successful)) : 0;
            const tasks = Number.isFinite(w.tasks as any) ? Math.max(0, Number(w.tasks)) : 0;
            entry.successful += succ;
            entry.total += tasks;
            bySite.set(key, entry);
            totalSuccessful += succ;
            totalTasks += tasks;
          });
        });

        const rows = Array.from(bySite.entries())
          .map(([website, { successful, total }]) => ({
            website,
            successful,
            total,
            successRate: total > 0 ? (successful / total) * 100 : 0,
          }))
          .sort((a, b) => b.successRate - a.successRate);

        if (!cancelled) {
          setChartRows(rows);
          setTotals({ successful: totalSuccessful, total: totalTasks });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load website stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWebsites();
    return () => {
      cancelled = true;
    };
  }, [agentId, selectedRound]);

  const totalRate = totals.total > 0 ? Math.round((totals.successful / totals.total) * 100) : 0;

  return (
    <WidgetCard
      title={<span className="text-2xl font-bold text-white">Performance per website</span>}
      headerClassName="flex-row items-start space-between pb-4"
      rounded="xl"
      className={cn(chartCardBase)}
      titleClassName="text-white"
    >
      <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none" />
      {loading ? (
        <div className="relative flex h-[260px] items-center justify-center text-white/70">Loading website stats…</div>
      ) : error ? (
        <div className="relative flex h-[260px] items-center justify-center text-rose-200">{error}</div>
      ) : chartRows.length === 0 ? (
        <div className="relative flex h-[200px] items-center justify-center text-white/70">No website stats available for this round.</div>
      ) : (
        <>
          <div className="relative h-[200px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ top: 5, left: -10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06D6A0" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="website" axisLine tickLine={false} tick={{ fill: "rgba(226,232,240,0.9)", fontSize: 11, fontWeight: 500 }} />
                <YAxis domain={[0, 100]} tick={<CustomYAxisTick postfix="%" />} stroke="rgba(148,163,184,0.3)" />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value: number, name: string, props) => {
                    const row = props?.payload as any;
                    if (name === 'successRate') {
                      return [`${Math.round(value)}%`, `Success Rate`];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="successRate" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
  if (error || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading agent</div>
          <div className="text-gray-500 text-sm">{error || "Agent not found"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex flex-col gap-2 mt-2 mb-3 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={agentImgSrc}
              alt={agent.name}
              width={48}
              height={48}
              className="rounded-full border-2 border-gray-200 shadow-sm"
              onError={() => setAgentImgSrc(defaultAvatar)}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">{agent.name}</span>
                {agent.isSota && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">SOTA</span>
                )}
                {!agent.isSota && agent.status && agent.status !== 'active' && (
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      agent.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {agent.status}
                  </span>
                )}
                {currentRound && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    Round {currentRound}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <PiHashDuotone className="w-4 h-4 text-gray-500" />
                  <span className="font-mono">UID: {agent.isSota ? "—" : agent.uid ?? "unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PiKeyDuotone className="w-4 h-4 text-gray-500" />
                  <span className="font-mono text-xs">
                    {agent.isSota ? "No on-chain hotkey" : agent.hotkey ? `${agent.hotkey.slice(0, 8)}...${agent.hotkey.slice(-8)}` : "unknown"}
                  </span>
                  {!agent.isSota && agent.hotkey && (
                    <button 
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(agent.hotkey!);
                          setCopiedHotkey(true);
                          setTimeout(() => setCopiedHotkey(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                        }
                      }} 
                      className="p-1 hover:bg-gray-100 rounded transition-colors" 
                      title="Copy hotkey"
                    >
                      {copiedHotkey ? (
                        <PiCheckDuotone className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <PiCopyDuotone className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200", githubAvailable ? "bg-gray-100 hover:bg-gray-200 cursor-pointer" : "bg-gray-200 cursor-not-allowed opacity-60")} title={agent.isSota ? "GitHub repository not available for SOTA benchmarks" : agent.githubUrl ? "View GitHub repository" : "GitHub repository not available"}>
                  {githubAvailable ? (
                    <a href={agent.githubUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center group">
                      <PiGithubLogoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </a>
                  ) : (
                    <PiGithubLogoDuotone className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200", taoStatsAvailable ? "bg-gray-100 hover:bg-gray-200 cursor-pointer" : "bg-gray-200 cursor-not-allowed opacity-60")} title={agent.isSota ? "On-chain explorer is not available for SOTA benchmarks" : agent.taostatsUrl || agent.hotkey ? "View on TaoStats" : "TaoStats link not available"}>
                  {taoStatsAvailable ? (
                    <a href={agent.taostatsUrl || (agent.hotkey ? `https://taostats.io/subnets/36/metagraph?filter=${encodeURIComponent(agent.hotkey)}` : "#")} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center group">
                      <PiInfoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </a>
                  ) : (
                    <PiInfoDuotone className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                {agent.isSota && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
                    <PiSparkle className="h-4 w-4" />
                    Benchmark Agent
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={cn("inline-flex items-center rounded-full backdrop-blur-xl p-1 shadow-lg", THEME_COLORS.border, THEME_COLORS.bgGradient)}>
            <button
              type="button"
              onClick={() => setViewMode('current')}
              className={cn(
                "px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full",
                viewMode === 'current' 
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              aria-pressed={viewMode === 'current'}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => setViewMode('historical')}
              className={cn(
                "px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full",
                viewMode === 'historical' 
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              aria-pressed={viewMode === 'historical'}
            >
              Historical
            </button>
            <button
              type="button"
              onClick={() => setViewMode('runs')}
              className={cn(
                "px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full",
                viewMode === 'runs' 
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              aria-pressed={viewMode === 'runs'}
            >
              Runs
            </button>
          </div>
      </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        {viewMode === 'runs' ? (
          <AgentValidators selectedRound={currentRound ?? null} />
        ) : (
          <>
            <AgentStats agent={agent} roundMetrics={roundMetrics} mode={viewMode} preAvg={preAvg} />

            {viewMode === 'current' ? (
              <div className="mt-1">
                <RoundWebsitesChart agentId={String(uid)} selectedRound={currentRound ?? null} />
              </div>
            ) : (
              <div className="mt-1">
                <AgentScoreChart className="w-full" scoreRoundData={scoreRoundData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
