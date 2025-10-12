"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import WidgetCard from "@core/components/cards/widget-card";
import PageHeader from "@/app/shared/page-header";
import cn from "@core/utils/class-names";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import { Badge } from "rizzui";
import {
  FaArrowDown,
  FaArrowUp,
  FaMinus,
  FaPause,
  FaPlay,
  FaRedo,
  FaStepBackward,
  FaStepForward,
  FaCrown,
  FaMedal,
} from "react-icons/fa";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";

type MinerProfile = {
  id: string;
  name: string;
  color: string;
  image: string;
};

type MinerSnapshot = MinerProfile & {
  score: number;
  rank: number;
  previousRank: number;
  rankChange: number;
  scoreChange: number;
};

type TimelinePoint = {
  round: number;
  date: string;
  miners: MinerSnapshot[];
};

const MINERS: MinerProfile[] = [
  {
    id: "quantum_flux",
    name: "Quantum Flux",
    color: "#2563EB",
    image: "/miners/1.svg",
  },
  {
    id: "neural_edge",
    name: "Neural Edge",
    color: "#0EA5E9",
    image: "/miners/2.svg",
  },
  {
    id: "atlas_node",
    name: "Atlas Node",
    color: "#10B981",
    image: "/miners/3.svg",
  },
  {
    id: "lattice_prime",
    name: "Lattice Prime",
    color: "#F97316",
    image: "/miners/4.svg",
  },
  {
    id: "zenith_relay",
    name: "Zenith Relay",
    color: "#A855F7",
    image: "/miners/5.svg",
  },
];

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function buildTimeline(): TimelinePoint[] {
  const totalPoints = 26; // roughly half-year of weekly snapshots
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 6);
  start.setHours(0, 0, 0, 0);

  const timeline: TimelinePoint[] = [];

  for (let index = 0; index < totalPoints; index++) {
    const date = new Date(start);
    date.setDate(start.getDate() + index * 7);
    const round = 2800 + index;

    const minerMetrics = MINERS.map((miner, minerIndex) => {
      const base = 1560 + minerIndex * 35;
      const growth = minerIndex % 2 === 0 ? 3.6 : 2.8;
      const waveOne =
        Math.sin((index + minerIndex * 0.6) / 1.9) * (18 + minerIndex * 4);
      const waveTwo =
        Math.cos((index * 1.1 + minerIndex) / 2.4) * (8 + minerIndex * 2);
      const seasonal = Math.sin(index / 6) * 5;

      const scoreRaw = base + growth * index + waveOne + waveTwo + seasonal;
      const score = Math.round(scoreRaw);

      return {
        ...miner,
        score,
      };
    });

    const ranked = [...minerMetrics].sort((a, b) => b.score - a.score);

    const enriched = minerMetrics.map((miner) => {
      const previous =
        timeline[index - 1]?.miners.find((m) => m.id === miner.id) ?? null;
      const rank = ranked.findIndex((entry) => entry.id === miner.id) + 1;
      const previousRank = previous?.rank ?? rank;
      const rankChange = previous ? previous.rank - rank : 0;
      const scoreChange = previous ? miner.score - previous.score : 0;

      return {
        ...miner,
        rank,
        previousRank,
        rankChange,
        scoreChange,
      };
    });

    const sortedByRank = [...enriched].sort((a, b) => a.rank - b.rank);

    timeline.push({
      round,
      date: date.toISOString(),
      miners: sortedByRank,
    });
  }

  return timeline;
}

const timelineCache = buildTimeline();

const speedPresets = [
  { label: "0.5x", value: 2200 },
  { label: "1x", value: 1400 },
  { label: "2x", value: 800 },
];

function formatScoreChange(value: number) {
  if (value === 0) return "0";
  return value > 0 ? `+${value}` : `${value}`;
}

function ScoreTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const [first] = payload;
  const snapshot: MinerSnapshot[] = first?.payload?.minersSnapshot ?? [];
  const round: number = first?.payload?.round ?? 0;
  const dateIso: string = first?.payload?.date;
  const dateLabel = dateIso
    ? FULL_DATE_FORMATTER.format(new Date(dateIso))
    : "";

  const ordered = [...payload].sort(
    (a, b) => Number(b.value ?? 0) - Number(a.value ?? 0)
  );

  return (
    <div className="min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-2xl dark:bg-gray-100/95">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>Round #{round}</span>
        <span>{dateLabel}</span>
      </div>
      <div className="mt-3 space-y-2">
        {ordered.map((entry) => {
          if (!entry || typeof entry.dataKey !== "string") {
            return null;
          }

          const miner = snapshot.find((m) => m.id === entry.dataKey);
          if (!miner) {
            return null;
          }

          const rankBadge =
            miner.rank <= 3
              ? `#${miner.rank}`
              : `#${miner.rank.toString().padStart(2, "0")}`;

          return (
            <div
              key={miner.id}
              className="flex items-center justify-between rounded-lg border border-transparent bg-gray-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color || miner.color }}
                />
                <div className="flex items-center gap-2">
                  <Image
                    src={miner.image}
                    alt={miner.name}
                    width={24}
                    height={24}
                    className="rounded-full border border-gray-200"
                  />
                  <span className="font-medium text-gray-900">
                    {miner.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  {rankBadge}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(entry.value).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnimationPage() {
  const timeline = useMemo(() => timelineCache, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(speedPresets[1].value);

  const totalSnapshots = timeline.length;
  const currentPoint = timeline[currentIndex] ?? timeline[0];
  const topMiner = currentPoint
    ? [...currentPoint.miners].sort((a, b) => a.rank - b.rank)[0]
    : null;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentIndex >= totalSnapshots - 1) return;

    const timeoutId = window.setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalSnapshots - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => window.clearTimeout(timeoutId);
  }, [currentIndex, isPlaying, speed, totalSnapshots]);

  useEffect(() => {
    if (currentIndex >= totalSnapshots - 1) {
      setIsPlaying(false);
    }
  }, [currentIndex, totalSnapshots]);

  const visibleData = useMemo(() => {
    return timeline.slice(0, currentIndex + 1).map((point) => {
      const scoreMap = point.miners.reduce<Record<string, number>>(
        (acc, miner) => {
          acc[miner.id] = miner.score;
          return acc;
        },
        {}
      );

      return {
        round: point.round,
        date: point.date,
        label: DATE_LABEL_FORMATTER.format(new Date(point.date)),
        minersSnapshot: point.miners,
        ...scoreMap,
      };
    });
  }, [timeline, currentIndex]);

  const [minScore, maxScore] = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    timeline.forEach((point) => {
      point.miners.forEach((miner) => {
        min = Math.min(min, miner.score);
        max = Math.max(max, miner.score);
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [1400, 2000];
    }

    const padding = Math.max(20, Math.round((max - min) * 0.08));
    return [min - padding, max + padding];
  }, [timeline]);

  const progressPercent =
    totalSnapshots > 1
      ? Math.round((currentIndex / (totalSnapshots - 1)) * 100)
      : 100;

  const canStepForward = currentIndex < totalSnapshots - 1;
  const canStepBackward = currentIndex > 0;

  const topMinerId = topMiner?.id;

  const getAccoladeStyles = (rank: number) => {
    if (rank === 1) {
      return {
        container: "border-amber-200/70 bg-amber-50/80 shadow-amber-100",
        emblem: (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600">
            <FaCrown className="h-3 w-3" /> Champion
          </span>
        ),
      };
    }
    if (rank === 2) {
      return {
        container: "border-slate-200/70 bg-slate-50/80",
        emblem: (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <FaMedal className="h-3 w-3 text-slate-400" /> Runner-up
          </span>
        ),
      };
    }
    if (rank === 3) {
      return {
        container: "border-orange-200/70 bg-orange-50/70",
        emblem: (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
            <FaMedal className="h-3 w-3 text-orange-400" /> Top 3
          </span>
        ),
      };
    }
    return {
      container: "border-transparent bg-white/70",
      emblem: null,
    };
  };

  const renderDot =
    (minerId: string) =>
    (props: any) => {
      const { cx, cy, stroke, index } = props;
      if (index !== visibleData.length - 1) {
        return <g />;
      }

      const isLeader = topMinerId === minerId;
      const outerRadius = isLeader ? 7 : 5;
      const innerRadius = isLeader ? 4 : 3;
      const strokeColor =
        stroke ??
        MINERS.find((miner) => miner.id === minerId)?.color ??
        "#0F172A";

      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={outerRadius}
            fill="#fff"
            stroke={strokeColor}
            strokeWidth={2}
          />
          <circle cx={cx} cy={cy} r={innerRadius} fill={strokeColor} />
        </g>
      );
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Miner Score Animation"
        description="Watch how subnet miners have climbed the rankings over the past months."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <WidgetCard
          title="ELO Trajectory"
          action={
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Current Round
                </p>
                <p className="text-lg font-bold text-gray-900">
                  #{currentPoint?.round}
                </p>
              </div>
              {topMiner && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-100/70 px-3 py-2">
                  <Image
                    src={topMiner.image}
                    alt={topMiner.name}
                    width={40}
                    height={40}
                    className="rounded-full border border-gray-200 shadow-sm"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Leading Miner
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {topMiner.name}
                    </p>
                    <p className="text-xs font-medium text-emerald-600">
                      {topMiner.score.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              )}
            </div>
          }
          className="relative overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-teal-400/5 to-purple-500/5" />
          <div className="relative mt-6 h-[380px] w-full">
            <div className="absolute inset-x-10 top-0 h-44 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400/15 via-teal-400/10 to-indigo-500/15 blur-3xl" />
            {visibleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visibleData}
                  margin={{ top: 24, right: 32, left: 12, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 6"
                    className="[&_.recharts-cartesian-grid-horizontal]:stroke-gray-200/70 [&_.recharts-cartesian-grid-vertical]:stroke-gray-200/50"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={[minScore, maxScore]}
                    tickLine={false}
                    axisLine={false}
                    tick={<CustomYAxisTick />}
                  />
                  <Tooltip
                    content={<ScoreTooltip />}
                    cursor={{ strokeDasharray: "3 3", stroke: "#CBD5F5" }}
                  />
                  {MINERS.map((miner) => (
                    <Line
                      key={miner.id}
                      type="monotone"
                      dataKey={miner.id}
                      stroke={miner.color}
                      strokeWidth={miner.id === topMinerId ? 3 : 2}
                      dot={renderDot(miner.id)}
                      activeDot={{
                        r: miner.id === topMinerId ? 6 : 5,
                        strokeWidth: 2,
                        stroke: miner.color,
                        fill: "#fff",
                      }}
                      isAnimationActive
                      animationDuration={850}
                      animationEasing="ease-in-out"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Preparing animation...
              </div>
            )}
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canStepBackward) return;
                  setCurrentIndex((prev) => Math.max(prev - 1, 0));
                  setIsPlaying(false);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900",
                  !canStepBackward && "cursor-not-allowed opacity-30"
                )}
                disabled={!canStepBackward}
                aria-label="Previous snapshot"
              >
                <FaStepBackward />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transition hover:from-blue-400 hover:to-indigo-400"
                aria-label={isPlaying ? "Pause animation" : "Play animation"}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canStepForward) return;
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, totalSnapshots - 1)
                  );
                  setIsPlaying(false);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900",
                  !canStepForward && "cursor-not-allowed opacity-30"
                )}
                disabled={!canStepForward}
                aria-label="Next snapshot"
              >
                <FaStepForward />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsPlaying(true);
                }}
                className="ms-1 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                aria-label="Restart animation"
              >
                <FaRedo />
                Restart
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>Speed</span>
              <div className="flex gap-1">
                {speedPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSpeed(preset.value)}
                    className={cn(
                      "rounded-full border border-transparent px-3 py-1 transition",
                      speed === preset.value
                        ? "bg-gray-900 text-white shadow"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-4">
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>
                {currentIndex + 1} / {totalSnapshots} snapshots
              </span>
              <span>{progressPercent}% complete</span>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={Math.max(totalSnapshots - 1, 0)}
              value={currentIndex}
              onChange={(event) => {
                const value = Number(event.target.value);
                setIsPlaying(false);
                setCurrentIndex(value);
              }}
              className="h-1 flex-1 appearance-none rounded-full bg-gray-200 accent-blue-500"
            />
            <div className="min-w-[120px] text-right text-xs font-semibold text-gray-500">
              Round #{currentPoint?.round}
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3">
            {MINERS.map((miner) => (
              <div
                key={miner.id}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
              >
                <span
                  className="inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: miner.color }}
                />
                <Image
                  src={miner.image}
                  alt={miner.name}
                  width={18}
                  height={18}
                  className="rounded-full border border-gray-200"
                />
                <span>{miner.name}</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard
          title="Live Standings"
          description="Dynamic ranking snapshot of the currently selected round."
          className="relative overflow-hidden"
          headerClassName="flex-col items-start gap-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-sky-500/5 to-emerald-500/5" />
          <div className="relative mt-4 flex items-center justify-between rounded-xl border border-gray-200/70 bg-white/80 px-4 py-3 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Snapshot
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Round #{currentPoint?.round}
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600">
              {DATE_LABEL_FORMATTER.format(new Date(currentPoint?.date ?? ""))}
            </Badge>
          </div>

          <div className="relative mt-5 space-y-3">
            {currentPoint?.miners.map((miner) => {
              const trendIcon =
                miner.scoreChange > 0
                  ? FaArrowUp
                  : miner.scoreChange < 0
                  ? FaArrowDown
                  : FaMinus;

              const TrendIcon = trendIcon;
              const accolade = getAccoladeStyles(miner.rank);
              const normalizedScore =
                maxScore - minScore === 0
                  ? 1
                  : Math.max(
                      0.1,
                      (miner.score - minScore) / (maxScore - minScore)
                    );

              return (
                <div
                  key={miner.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:border-gray-300",
                    accolade.container
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold shadow-sm",
                          miner.rank === 1
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200"
                            : miner.rank === 2
                            ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900"
                            : miner.rank === 3
                            ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        #{miner.rank}
                      </div>
                      <div className="flex items-center gap-3">
                        <Image
                          src={miner.image}
                          alt={miner.name}
                          width={48}
                          height={48}
                          className="rounded-full border border-gray-200 shadow-sm"
                        />
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            {miner.name}
                            {accolade.emblem}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <span
                                className="inline-flex h-2 w-2 rounded-full"
                                style={{ backgroundColor: miner.color }}
                              />
                              {miner.score.toLocaleString()} pts
                            </span>
                            {miner.rankChange !== 0 && (
                              <span
                                className={cn(
                                  "font-semibold",
                                  miner.rankChange > 0
                                    ? "text-emerald-600"
                                    : "text-rose-500"
                                )}
                              >
                                {miner.rankChange > 0
                                  ? `▲${miner.rankChange}`
                                  : `▼${Math.abs(miner.rankChange)}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                        miner.scoreChange > 0
                          ? "bg-emerald-500/10 text-emerald-600"
                          : miner.scoreChange < 0
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {formatScoreChange(miner.scoreChange)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, normalizedScore * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      {Math.min(100, Math.round(normalizedScore * 100))}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
