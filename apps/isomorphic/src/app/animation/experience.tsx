"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  LabelList,
  type TooltipProps,
} from "recharts";
import {
  FaPause,
  FaPlay,
  FaRedo,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";

type MinerProfile = {
  id: string;
  name: string;
  color: string;
  image: string;
  baseline: number;
  drift: number;
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

interface ChartDatum {
  round: number;
  date: string;
  label: string;
  minersSnapshot: MinerSnapshot[];
  [key: string]: string | number | MinerSnapshot[];
}

interface MinerAnimationExperienceProps {
  condensed?: boolean;
}

const MINERS: MinerProfile[] = [
  {
    id: "miner_032",
    name: "Miner 032",
    color: "#2563EB",
    image: "/miners/32.svg",
    baseline: 61,
    drift: 0.54,
  },
  {
    id: "miner_118",
    name: "Miner 118",
    color: "#0EA5E9",
    image: "/miners/18.svg",
    baseline: 59,
    drift: 0.51,
  },
  {
    id: "miner_149",
    name: "Miner 149",
    color: "#10B981",
    image: "/miners/49.svg",
    baseline: 56,
    drift: 0.49,
  },
  {
    id: "miner_212",
    name: "Miner 212",
    color: "#FB923C",
    image: "/miners/12.svg",
    baseline: 54,
    drift: 0.47,
  },
  {
    id: "miner_255",
    name: "Miner 255",
    color: "#A855F7",
    image: "/miners/25.svg",
    baseline: 52,
    drift: 0.45,
  },
  {
    id: "openai_cua",
    name: "OpenAI CUA",
    color: "#38BDF8",
    image: "/icons/openai.webp",
    baseline: 67,
    drift: 0.62,
  },
  {
    id: "claude_cua",
    name: "Claude CUA",
    color: "#F472B6",
    image: "/icons/anthropic.webp",
    baseline: 64,
    drift: 0.58,
  },
  {
    id: "browser_use",
    name: "Browser Use",
    color: "#FACC15",
    image: "/icons/browser-use.webp",
    baseline: 60,
    drift: 0.54,
  },
];

const MINER_META_MAP = new Map(MINERS.map((miner) => [miner.id, miner]));

const TOTAL_ROUNDS = 90;

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function pseudoRandom(initialSeed: number) {
  let seed = initialSeed % 2147483647;
  if (seed <= 0) {
    seed += 2147483646;
  }
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function clampScore(value: number) {
  return Math.min(100, Math.max(40, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized.length === 3 ? sanitized.repeat(2) : sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildTimeline(): TimelinePoint[] {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (TOTAL_ROUNDS - 1));

  const randomGenerators = MINERS.map((_, index) =>
    pseudoRandom(713 + index * 97)
  );

  let currentScores = MINERS.map((miner) => miner.baseline);
  const timeline: TimelinePoint[] = [];

  const swapEvents: Record<number, Partial<Record<string, number>>> = {
    18: { openai_cua: 4.5, miner_032: -3.2 },
    28: { miner_032: -3.5, miner_118: 5.5 },
    42: { claude_cua: 4.2, openai_cua: -2.5 },
    55: { miner_118: -2.8, miner_149: 4.2 },
    63: { browser_use: 4.8, claude_cua: -3.1 },
    73: { miner_212: 4.8, miner_149: -3.4 },
    81: { miner_255: 3.5, browser_use: -2.4 },
  };

  for (let day = 0; day < TOTAL_ROUNDS; day++) {
    const baseline = day / TOTAL_ROUNDS;
    const nextScores: number[] = [];

    MINERS.forEach((miner, index) => {
      const random = randomGenerators[index]();
      const momentumBias = (miner.baseline - 55) / 22;
      const baseTrend =
        miner.drift * 0.9 + baseline * (0.35 + momentumBias * 0.25);
      const seasonal =
        Math.sin((day + index * 1.4) / 5) * (1.6 + momentumBias * 0.6);
      const slowWave =
        Math.cos((day * 0.65 + index) / 13) * (1.2 + miner.drift * 2);
      const noise = (random - 0.5) * (2.1 + miner.drift * 2.1);

      const delta =
        baseTrend + seasonal * 0.55 + slowWave * 0.35 + noise * 0.22;
      const projected = currentScores[index] + delta;
      // encourage gradual upward movement while allowing light dips
      const adjusted = Math.max(
        currentScores[index] - 1.6,
        Math.min(projected, currentScores[index] + 3.2)
      );
      nextScores[index] = clampScore(adjusted);
    });

    if (swapEvents[day]) {
      Object.entries(swapEvents[day]!).forEach(([minerId, adjustment]) => {
        const minerIndex = MINERS.findIndex((miner) => miner.id === minerId);
        if (minerIndex >= 0) {
          nextScores[minerIndex] = clampScore(
            nextScores[minerIndex] + (adjustment ?? 0)
          );
        }
      });
    }

    const previousSnapshots = timeline[day - 1]?.miners ?? [];
    const previousMap = new Map(previousSnapshots.map((miner) => [miner.id, miner]));

    const daySnapshots: MinerSnapshot[] = MINERS.map((miner, index) => {
      const previous = previousMap.get(miner.id);
      const score = Number(nextScores[index].toFixed(2));
      const previousScore = previous?.score ?? score;
      const previousRank = previous?.rank ?? index + 1;

      return {
        ...miner,
        score,
        previousRank,
        rank: previousRank,
        rankChange: 0,
        scoreChange: Number((score - previousScore).toFixed(2)),
      };
    });

    const ranked = [...daySnapshots].sort((a, b) => b.score - a.score);
    ranked.forEach((miner, rankIndex) => {
      miner.rank = rankIndex + 1;
      const origin = previousMap.get(miner.id);
      miner.rankChange = (origin?.rank ?? miner.rank) - miner.rank;
    });

    const orderedByRank = [...daySnapshots].sort((a, b) => a.rank - b.rank);

    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);

    timeline.push({
      round: day + 1,
      date: date.toISOString(),
      miners: orderedByRank,
    });

    currentScores = nextScores;
  }

  return timeline;
}

const timelineCache = buildTimeline();

function interpolateSnapshots(
  currentPoint: TimelinePoint,
  nextPoint: TimelinePoint,
  fraction: number
): TimelinePoint {
  if (fraction <= 0 || !nextPoint) {
    return currentPoint;
  }
  if (fraction >= 1) {
    return nextPoint;
  }

  const nextMap = new Map(nextPoint.miners.map((miner) => [miner.id, miner]));
  const currentMap = new Map(currentPoint.miners.map((miner) => [miner.id, miner]));

  const interpolatedMiners: MinerSnapshot[] = currentPoint.miners.map((miner) => {
    const next = nextMap.get(miner.id) ?? miner;
    const score = Number(lerp(miner.score, next.score, fraction).toFixed(2));
    const previousRank = miner.rank;

    return {
      ...miner,
      score,
      previousRank,
      rank: miner.rank,
      rankChange: 0,
      scoreChange: Number(
        (score - (currentMap.get(miner.id)?.score ?? score)).toFixed(2)
      ),
    };
  });

  const ranked = [...interpolatedMiners].sort((a, b) => b.score - a.score);
  ranked.forEach((miner, rankIndex) => {
    const origin = currentMap.get(miner.id);
    miner.rank = rankIndex + 1;
    miner.rankChange = (origin?.rank ?? miner.rank) - miner.rank;
  });

  const interpolatedDate = new Date(
    lerp(
      new Date(currentPoint.date).getTime(),
      new Date(nextPoint.date).getTime(),
      fraction
    )
  );

  return {
    round: lerp(currentPoint.round, nextPoint.round, fraction),
    date: interpolatedDate.toISOString(),
    miners: ranked,
  };
}

function toChartDatum(point: TimelinePoint): ChartDatum {
  const scoreMap = point.miners.reduce<Record<string, number>>(
    (accumulator, miner) => {
      accumulator[miner.id] = Number(miner.score.toFixed(2));
      return accumulator;
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
}

function ScoreTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const [first] = payload;
  const snapshot: MinerSnapshot[] = first?.payload?.minersSnapshot ?? [];
  const roundValue: number = first?.payload?.round ?? 0;
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
        <span>Round {Math.round(roundValue)}</span>
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

          const percentageValue = Number(entry.value).toFixed(1);
          const labelText = `${miner.name} · ${percentageValue}%`;

          return (
            <div
              key={`${miner.id}-${entry.dataKey}`}
              className="flex items-center justify-between rounded-lg border border-transparent bg-gray-50 px-3 py-2 text-xs"
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
                    width={20}
                    height={20}
                    className="rounded-full border border-gray-200"
                  />
                  <span className="font-medium text-gray-900">{labelText}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400">
                Rank #{miner.rank.toString().padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const speedPresets = [
  { label: "0.5x", value: 0.45 },
  { label: "1x", value: 0.9 },
  { label: "2x", value: 1.6 },
];

export function MinerAnimationExperience({ condensed = false }: MinerAnimationExperienceProps) {
  const timeline = useMemo(() => timelineCache, []);
  const totalSnapshots = timeline.length;

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(speedPresets[1].value);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastTimestampRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      setProgress((previous) => {
        const next = previous + (delta / 1000) * speed;
        if (next >= totalSnapshots - 1) {
          setIsPlaying(false);
          return totalSnapshots - 1;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [isPlaying, speed, totalSnapshots]);

  const baseIndex = Math.floor(progress);
  const nextIndex = Math.min(baseIndex + 1, totalSnapshots - 1);
  const fraction = progress - baseIndex;

  const currentPoint = timeline[baseIndex] ?? timeline[0];
  const nextPoint = timeline[nextIndex] ?? currentPoint;

  const interpolatedPoint = useMemo(
    () => interpolateSnapshots(currentPoint, nextPoint, fraction),
    [currentPoint, nextPoint, fraction]
  );

  const chartData: ChartDatum[] = useMemo(() => {
    const base = timeline.slice(0, baseIndex + 1).map(toChartDatum);

    if (fraction > 0 && baseIndex < totalSnapshots - 1) {
      base.push(toChartDatum(interpolatedPoint));
    }

    return base;
  }, [timeline, baseIndex, interpolatedPoint, fraction, totalSnapshots]);

  const windowSize = condensed ? 22 : 32;
  const visibleData = useMemo(() => {
    if (chartData.length <= windowSize) {
      return chartData;
    }
    return chartData.slice(chartData.length - windowSize);
  }, [chartData, windowSize]);

  const activeData = visibleData.length ? visibleData : chartData;

  const latestSnapshot = chartData[chartData.length - 1]?.minersSnapshot ?? [];
  const topMiner = latestSnapshot[0];
  const currentRound = Math.round(interpolatedPoint.round);
  const topMiners = latestSnapshot.slice(0, 3);

  const [minScore, maxScore] = useMemo(() => {
    if (!activeData.length) {
      return [0, 100];
    }
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    activeData.forEach((point) => {
      MINERS.forEach((miner) => {
        const value = point[miner.id];
        if (typeof value === "number") {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [0, 100];
    }

    const span = Math.max(max - min, 6);
    const padding = Math.max(1.2, span * 0.12);
    const lower = Math.max(0, min - padding);
    const upper = Math.min(100, max + padding);

    return [
      Math.max(0, Math.floor(lower * 10) / 10),
      Math.min(100, Math.ceil(upper * 10) / 10),
    ];
  }, [activeData]);

  const progressPercent =
    totalSnapshots > 1
      ? Math.min(100, Math.max(0, (progress / (totalSnapshots - 1)) * 100))
      : 100;

  const clampProgress = (value: number) =>
    Math.min(Math.max(value, 0), totalSnapshots - 1);

  const handleStepBackward = () => {
    setIsPlaying(false);
    setProgress((previous) => clampProgress(Math.floor(previous - 1)));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setProgress((previous) => clampProgress(Math.ceil(previous + 1)));
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePlayToggle = () => {
    if (progress >= totalSnapshots - 1) {
      setProgress(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((previous) => !previous);
  };

  const topMinerId = topMiner?.id;

  const renderDot =
    (minerId: string) =>
    (props: any) => {
      const { cx = 0, cy = 0, stroke, index } = props;
      if (!activeData.length || index !== activeData.length - 1) {
        return <g />;
      }

      const strokeColor =
        stroke ??
        MINER_META_MAP.get(minerId)?.color ??
        "#0F172A";
      const isLeader = topMinerId === minerId;
      const minerData =
        latestSnapshot.find((snapshot) => snapshot.id === minerId) ??
        MINER_META_MAP.get(minerId);
      const imageHref = minerData?.image ?? "/miners/1.svg";
      const imageRadius = isLeader ? 12 : 10;
      const haloRadius = imageRadius + (isLeader ? 5 : 4);
      const clipPathId = `clip-${minerId}`;

      return (
        <g key={`dot-${minerId}`}>
          <defs>
            <clipPath id={clipPathId}>
              <circle cx={cx} cy={cy} r={imageRadius} />
            </clipPath>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={haloRadius}
            fill={hexToRgba(strokeColor, isLeader ? 0.32 : 0.22)}
            stroke={strokeColor}
            strokeWidth={isLeader ? 2 : 1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={imageRadius + 1.2}
            fill="#fff"
            stroke="#ffffff"
            strokeWidth={isLeader ? 2 : 1.8}
          />
          <image
            x={cx - imageRadius}
            y={cy - imageRadius}
            width={imageRadius * 2}
            height={imageRadius * 2}
            href={imageHref}
            xlinkHref={imageHref}
            clipPath={`url(#${clipPathId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      );
    };

  const createLineLabel =
    (minerId: string) =>
    (props: any) => {
      const { x = 0, y = 0, index } = props;
      if (!activeData.length || index !== activeData.length - 1) {
        return null;
      }

      const miner = latestSnapshot.find((snapshot) => snapshot.id === minerId);
      if (!miner) {
        return null;
      }

      const isAscending = miner.rankChange > 0;
      const trendSymbol =
        miner.rankChange > 0 ? "▲" : miner.rankChange < 0 ? "▼" : "•";
      const labelText = `${miner.name} ${trendSymbol} ${miner.score.toFixed(1)}%`;
      const widthEstimate = Math.max(110, labelText.length * (isAscending ? 7 : 6.1));
      const backgroundFill = isAscending
        ? hexToRgba(miner.color, 0.55)
        : "rgba(15, 23, 42, 0.65)";
      const textColor = isAscending ? "#0F172A" : "#FFFFFF";
      const fontSize = isAscending ? 13 : 11;

      return (
        <g transform={`translate(${x + 14}, ${y - (isAscending ? 12 : 10)})`}>
          <rect
            x={-6}
            y={-10}
            width={widthEstimate}
            height={isAscending ? 26 : 24}
            rx={6}
            fill={backgroundFill}
            stroke={isAscending ? hexToRgba(miner.color, 0.8) : "rgba(255,255,255,0.08)"}
            strokeWidth={isAscending ? 1.4 : 1}
          />
          <text
            x={0}
            y={isAscending ? 2 : 0}
            fill={textColor}
            fontSize={fontSize}
            fontWeight={700}
            dominantBaseline="middle"
          >
            {labelText}
          </text>
        </g>
      );
    };

  const containerSpacing = condensed ? "space-y-5" : "space-y-6";
  const chartHeightClass = condensed ? "h-[360px]" : "h-[420px]";

  return (
    <div className={containerSpacing}>
      {!condensed && (
        <PageHeader
          title="Miner Score Cinematic"
          description="Three months of subnet performance rendered as a continuous Elo race."
        />
      )}

      <WidgetCard
        headerClassName="hidden"
        className={cn("relative overflow-hidden", condensed && "mt-2")}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-teal-400/5 to-purple-500/5" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {topMiners.map((miner, index) => {
              const scale = 1 - index * 0.06;
              const baseImage = condensed ? 64 : 72;
              const imageSize = Math.max(46, Math.round(baseImage * scale));
              const accentClass =
                index === 0
                  ? "border-amber-200 bg-gradient-to-br from-amber-100 via-amber-50 to-white"
                  : index === 1
                  ? "border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white"
                  : index === 2
                  ? "border-orange-200 bg-gradient-to-br from-orange-100 via-orange-50 to-white"
                  : "border-gray-200 bg-white";
              return (
                <div
                  key={`top-five-${miner.id}`}
                  className={cn(
                    "flex min-w-[220px] flex-1 items-center gap-4 rounded-xl border px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                    accentClass
                  )}
                >
                  <Image
                    src={miner.image}
                    alt={miner.name}
                    width={imageSize}
                    height={imageSize}
                    className="z-20 rounded-full border border-white/80 shadow"
                  />
                  <div className="leading-tight text-black">
                    <p className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                      Rank #{miner.rank}
                    </p>
                    <p className="text-sm font-semibold text-black">{miner.name}</p>
                    <p className="text-xs font-semibold text-black">
                      Score: {miner.score.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                Current Round
              </p>
              <p className="text-xl font-bold text-gray-900">#{currentRound}</p>
              <p className="text-xs font-medium text-gray-500">
                {DATE_LABEL_FORMATTER.format(new Date(interpolatedPoint.date))}
              </p>
            </div>
          </div>
        </div>
        <div className={cn("relative mt-6 w-full", chartHeightClass)}>
          <div className="absolute inset-x-6 top-0 h-40 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400/15 via-teal-400/10 to-indigo-500/15 blur-3xl" />
          {activeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeData}
                margin={{ top: 28, right: 100, left: 32, bottom: 24 }}
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
                  minTickGap={18}
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
                    strokeWidth={miner.id === topMinerId ? 3.2 : 2.4}
                    dot={renderDot(miner.id)}
                    activeDot={false}
                    isAnimationActive={false}
                  >
                    <LabelList content={createLineLabel(miner.id)} />
                  </Line>
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
              onClick={handleStepBackward}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900",
                progress <= 0 && "cursor-not-allowed opacity-30"
              )}
              disabled={progress <= 0}
              aria-label="Previous snapshot"
            >
              <FaStepBackward />
            </button>
            <button
              type="button"
              onClick={handlePlayToggle}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 hover:shadow"
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? (
                <FaPause className="text-black" />
              ) : (
                <FaPlay className="text-black" />
              )}
            </button>
            <button
              type="button"
              onClick={handleStepForward}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900",
                progress >= totalSnapshots - 1 && "cursor-not-allowed opacity-30"
              )}
              disabled={progress >= totalSnapshots - 1}
              aria-label="Next snapshot"
            >
              <FaStepForward />
            </button>
            <button
              type="button"
              onClick={handleRestart}
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
                    "rounded-full border px-3 py-1 transition",
                    speed === preset.value
                      ? "border-gray-300 bg-white text-gray-900 shadow-sm"
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
              {Math.round(progress)} / {totalSnapshots} rounds
            </span>
            <span>{progressPercent.toFixed(0)}% complete</span>
          </div>
        </div>

      </WidgetCard>
    </div>
  );
}
