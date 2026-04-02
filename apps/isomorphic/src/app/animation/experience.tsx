"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import WidgetCard from "@core/components/cards/widget-card";
import PageHeader from "@/app/shared/page-header";
import cn from "@core/utils/class-names";
import { PiTrophyFill } from "react-icons/pi";
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
import { agentsRepository } from "@/repositories/agents/agents.repository";
import { subnetsRepository } from "@/repositories/subnets/subnets.repository";
import type {
  SubnetTimelineMeta,
  SubnetTimelineResponse,
} from "@/repositories/subnets/subnets.types";

type MinerProfile = {
  id: string;
  name: string;
  color: string;
  image: string;
  order: number;
};

type MinerSnapshot = MinerProfile & {
  score: number;
  reward: number;
  seasonScore: number;
  rank: number;
  previousRank: number | null;
  rankChange: number;
  scoreChange: number;
};

type TimelinePoint = {
  round: number;
  date: string;
  miners: MinerSnapshot[];
};

export type ProcessedTimeline = {
  roster: MinerProfile[];
  timeline: TimelinePoint[];
  subnetId: string;
  meta: SubnetTimelineMeta;
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
  subnetId?: string;
  rounds?: number;
  initialSeason?: number;
  mockTimeline?: ProcessedTimeline | null;
}

const DEFAULT_SUBNET_ID = "subnet36";
const DEFAULT_ROUND_COUNT = 90;
const REFRESH_INTERVAL_MS = 60_000;
const FALLBACK_COLOR = "#0F172A";
const FALLBACK_AVATAR = "/miners/1.svg";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(
    sanitized.length === 3 ? sanitized.repeat(2) : sanitized,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeScore(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return numeric <= 1 ? Number((numeric * 10).toFixed(3)) : numeric;
}

function formatRoundNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  const rounded = Math.round(value);
  return rounded >= 10000 ? String(rounded % 10000) : String(rounded);
}

function rankSnapshots(miners: MinerSnapshot[]): MinerSnapshot[] {
  const ordered = [...miners].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.reward !== a.reward) return b.reward - a.reward;
    return a.order - b.order;
  });

  return ordered.map((miner, index) => ({
    ...miner,
    rank: index + 1,
  }));
}

function transformTimelineResponse(
  payload: SubnetTimelineResponse,
  seasonSummaryMap?: Map<string, { seasonScore: number; image: string | null }>
): ProcessedTimeline {
  const roster: MinerProfile[] = payload.roster.map((entry, index) => {
    const fallbackName = entry.miner_id.replace(/[_-]/g, " ").toUpperCase();
    const seasonSummary = seasonSummaryMap?.get(entry.miner_id);
    return {
      id: entry.miner_id,
      name: entry.display_name || fallbackName,
      color: entry.color_hex || FALLBACK_COLOR,
      image: seasonSummary?.image || entry.avatar_url || FALLBACK_AVATAR,
      order: entry.order ?? index,
    };
  });

  const rosterMap = new Map(roster.map((miner) => [miner.id, miner]));

  let priorRanks = new Map<string, number>();
  let priorBestScores = new Map<string, number>();

  const timeline: TimelinePoint[] = payload.timeline.map((point) => {
    const miners = rankSnapshots(
      point.snapshots
      .map((snapshot) => {
        const baseProfile =
          rosterMap.get(snapshot.miner_id) ??
          ({
            id: snapshot.miner_id,
            name: snapshot.miner_id.replace(/[_-]/g, " ").toUpperCase(),
            color: FALLBACK_COLOR,
            image: FALLBACK_AVATAR,
            order: snapshot.rank - 1,
          } as MinerProfile);

        const reward = normalizeScore(snapshot.reward ?? snapshot.score);
        const rawScore = normalizeScore(snapshot.score ?? snapshot.reward);
        const score = Math.max(
          priorBestScores.get(snapshot.miner_id) ?? 0,
          rawScore
        );
        const previousRankValue = priorRanks.get(snapshot.miner_id) ?? null;
        const previousBestScore = priorBestScores.get(snapshot.miner_id);

        return {
          ...baseProfile,
          score,
          reward,
          seasonScore: seasonSummaryMap?.get(snapshot.miner_id)?.seasonScore ?? 0,
          rank: 0,
          previousRank: previousRankValue,
          rankChange: 0,
          scoreChange: normalizeScore(
            score - (previousBestScore ?? score)
          ),
        };
      })
    );

    const rankedMiners = miners.map((miner) => {
      const previousRankValue = miner.previousRank ?? miner.rank;
      return {
        ...miner,
        rankChange: previousRankValue - miner.rank,
      };
    });

    priorRanks = new Map(rankedMiners.map((miner) => [miner.id, miner.rank]));
    priorBestScores = new Map(
      rankedMiners.map((miner) => [miner.id, miner.score])
    );

    return {
      round: point.round,
      date: point.timestamp,
      miners: rankedMiners,
    };
  });

  return {
    roster,
    timeline,
    subnetId: payload.subnet_id,
    meta: payload.meta,
  };
}

function cloneProcessedTimeline(source: ProcessedTimeline): ProcessedTimeline {
  return {
    ...source,
    roster: source.roster.map((miner) => ({ ...miner })),
    timeline: source.timeline.map((point) => ({
      ...point,
      miners: point.miners.map((miner) => ({ ...miner })),
    })),
    meta: {
      ...source.meta,
      query: { ...source.meta.query },
    },
  };
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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
    const reward = Number(lerp(miner.reward, next.reward, fraction).toFixed(2));
    const previousRank = miner.rank;

    return {
      ...miner,
      score,
      reward,
      seasonScore: Number(
        lerp(miner.seasonScore, next.seasonScore, fraction).toFixed(4)
      ),
      previousRank,
      rank: miner.rank,
      rankChange: 0,
      scoreChange: Number(
        (score - (currentMap.get(miner.id)?.score ?? score)).toFixed(2)
      ),
    };
  });

  const ranked = rankSnapshots(interpolatedMiners);
  ranked.forEach((miner, rankIndex) => {
    const origin = currentMap.get(miner.id);
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
        <span>Round {formatRoundNumber(roundValue)}</span>
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

          const scoreValue = Number(entry.value).toFixed(2);
          const labelText = `${miner.name} · ${scoreValue}`;

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
                Rank {miner.rank.toString().padStart(2, "0")}
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

export function MinerAnimationExperience({
  condensed = false,
  subnetId = DEFAULT_SUBNET_ID,
  rounds = DEFAULT_ROUND_COUNT,
  initialSeason,
  mockTimeline = null,
}: MinerAnimationExperienceProps) {
  const [data, setData] = useState<ProcessedTimeline | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(
    initialSeason ?? null
  );
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(speedPresets[1].value);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const shouldUseMock = Boolean(mockTimeline);

  const timeline = useMemo(() => data?.timeline ?? [], [data]);
  const roster = useMemo(() => data?.roster ?? [], [data]);
  const totalSnapshots = timeline.length;

  const rosterMap = useMemo(
    () => new Map(roster.map((miner) => [miner.id, miner])),
    [roster]
  );

  const sanitizeTimeline = useCallback((payload: SubnetTimelineResponse) => {
    const timeline = [...payload.timeline];
    while (timeline.length > 1) {
      const lastPoint = timeline[timeline.length - 1];
      const hasUsableSnapshot = lastPoint.snapshots.some((snapshot) => {
        const value = snapshot.reward ?? snapshot.score ?? 0;
        return value > 0 && snapshot.rank < 9999;
      });
      if (hasUsableSnapshot) {
        break;
      }
      timeline.pop();
    }
    return {
      ...payload,
      timeline,
      meta: {
        ...payload.meta,
        round_count: timeline.length,
        start_round: timeline[0]?.round ?? payload.meta.start_round,
        end_round:
          timeline[timeline.length - 1]?.round ?? payload.meta.end_round,
      },
    };
  }, []);

  const fetchSeasonMeta = useCallback(async () => {
    const summary = await agentsRepository.getSeasonRank("latest");
    const seasons = summary.availableSeasons ?? [];
    setAvailableSeasons(seasons);
    setSelectedSeason((previous) => previous ?? summary.season ?? summary.latestSeason ?? seasons[0] ?? null);
  }, []);

  const fetchTimeline = useCallback(
    async (withLoader: boolean) => {
      if (withLoader) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const seasonRef = selectedSeason ?? initialSeason ?? 1;
        const [seasonRank, roundsData] = await Promise.all([
          agentsRepository.getSeasonRank(seasonRef),
          agentsRepository.getRoundsData({ season: seasonRef }),
        ]);

        if (withLoader) {
          setAvailableSeasons(seasonRank.availableSeasons ?? []);
        }

        const roundKeys = (roundsData.rounds ?? [])
          .map((value) => String(value))
          .filter((value) => value.includes("/"))
          .sort((a, b) => {
            const [aSeason, aRound] = a.split("/").map(Number);
            const [bSeason, bRound] = b.split("/").map(Number);
            if (aSeason !== bSeason) return aSeason - bSeason;
            return aRound - bRound;
          });

        if (!roundKeys.length) {
          throw new Error(`No completed rounds available for season ${seasonRef}`);
        }

        const lastRoundKey = roundKeys[roundKeys.length - 1];
        const [lastSeason, lastRound] = lastRoundKey.split("/").map(Number);
        const endRound = lastSeason * 10000 + lastRound;

        const response = await subnetsRepository.getSubnetTimeline(subnetId, {
          rounds: Math.min(Math.max(1, roundKeys.length), Math.floor(rounds)),
          end_round: endRound,
        });

        const seasonMap = new Map<string, { seasonScore: number; image: string | null }>(
          seasonRank.miners.map((miner) => [
            `miner-${miner.uid}`,
            {
              seasonScore: normalizeScore(miner.post_consensus_avg_reward),
              image: miner.image,
            },
          ])
        );

        const processed = transformTimelineResponse(
          sanitizeTimeline(response),
          seasonMap
        );
        setData(processed);
        setError(null);

        if (withLoader) {
          setProgress(0);
          setIsPlaying(true);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load subnet timeline";
        setError(message);
      } finally {
        if (withLoader) {
          setIsInitialLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [initialSeason, rounds, sanitizeTimeline, selectedSeason, subnetId]
  );

  useEffect(() => {
    if (shouldUseMock) {
      const nextData = mockTimeline ? cloneProcessedTimeline(mockTimeline) : null;

      setData(nextData);
      setError(nextData ? null : "Mock timeline unavailable");
      setIsInitialLoading(false);
      setIsRefreshing(false);
      setProgress(0);
      setIsPlaying((nextData?.timeline.length ?? 0) > 1);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    fetchSeasonMeta().catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to load season metadata";
      setError(message);
      setIsInitialLoading(false);
    });
  }, [
    fetchSeasonMeta,
    mockTimeline,
    shouldUseMock,
  ]);

  useEffect(() => {
    if (shouldUseMock || selectedSeason === null) {
      return;
    }
    fetchTimeline(true);
  }, [fetchTimeline, selectedSeason, shouldUseMock]);

  useEffect(() => {
    if (shouldUseMock || selectedSeason === null) {
      return;
    }

    const interval = setInterval(() => {
      fetchTimeline(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchTimeline, selectedSeason, shouldUseMock]);

  useEffect(() => {
    if (totalSnapshots === 0) {
      setProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    setProgress((previous) =>
      Math.min(Math.max(previous, 0), totalSnapshots - 1)
    );
  }, [totalSnapshots]);

  useEffect(() => {
    if (!isPlaying || totalSnapshots <= 1) {
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

      const maxIndex = Math.max(totalSnapshots - 1, 0);

      setProgress((previous) => {
        const next = previous + (delta / 1000) * speed;
        if (next >= maxIndex) {
          setIsPlaying(false);
          return maxIndex;
        }
        return Math.min(next, maxIndex);
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
  const nextIndex = Math.min(baseIndex + 1, Math.max(totalSnapshots - 1, 0));
  const fraction = progress - baseIndex;

  const currentPoint =
    totalSnapshots > 0
      ? timeline[Math.min(baseIndex, totalSnapshots - 1)]
      : null;
  const nextPoint =
    totalSnapshots > 0
      ? timeline[Math.min(nextIndex, totalSnapshots - 1)]
      : null;

  const interpolatedPoint = useMemo(() => {
    if (!currentPoint) {
      return null;
    }
    return interpolateSnapshots(
      currentPoint,
      nextPoint ?? currentPoint,
      fraction
    );
  }, [currentPoint, nextPoint, fraction]);

  const chartData: ChartDatum[] = useMemo(() => {
    if (!totalSnapshots) {
      return [];
    }

    const limit = Math.min(baseIndex + 1, totalSnapshots);
    const base = timeline.slice(0, limit).map(toChartDatum);

    if (
      fraction > 0 &&
      baseIndex < totalSnapshots - 1 &&
      interpolatedPoint
    ) {
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

  const animatedSnapshot = chartData[chartData.length - 1]?.minersSnapshot ?? [];
  const displayIndex =
    totalSnapshots > 0 ? Math.min(Math.round(progress), totalSnapshots - 1) : 0;
  const displaySnapshot = timeline[displayIndex]?.miners ?? animatedSnapshot;
  const topMiner = animatedSnapshot[0];
  const currentRound = interpolatedPoint
    ? Math.round(interpolatedPoint.round)
    : null;
  const currentDateLabel = interpolatedPoint
    ? DATE_LABEL_FORMATTER.format(new Date(interpolatedPoint.date))
    : "--";
  const topMinerDisplayCount = condensed ? 3 : 6;
  const topMiners = displaySnapshot.slice(
    0,
    Math.min(displaySnapshot.length, topMinerDisplayCount)
  );
  const seasonLeader = topMiners[0];

  const [minScore, maxScore] = useMemo(() => {
    if (!activeData.length) {
      return [0, 10];
    }
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    activeData.forEach((point) => {
      const candidates =
        roster.length > 0
          ? roster
          : (point.minersSnapshot as MinerSnapshot[]);

      candidates.forEach((miner) => {
        const value = point[miner.id];
        if (typeof value === "number") {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [0, 10];
    }

    const span = Math.max(max - min, 1.5);
    const padding = Math.max(0.4, span * 0.18);
    const lower = Math.max(0, min - padding);
    const upper = max + padding;

    return [
      Math.max(0, Math.floor(lower * 10) / 10),
      Math.ceil(upper * 10) / 10,
    ];
  }, [activeData, roster]);

  const progressPercent =
    totalSnapshots > 1
      ? Math.min(
          100,
          Math.max(
            0,
            (progress / Math.max(totalSnapshots - 1, 1)) * 100
          )
        )
      : totalSnapshots === 1
      ? 100
      : 0;

  const clampProgress = useCallback(
    (value: number) => {
      if (totalSnapshots <= 0) {
        return 0;
      }
      const maxIndex = Math.max(totalSnapshots - 1, 0);
      return Math.min(Math.max(value, 0), maxIndex);
    },
    [totalSnapshots]
  );

  const handleStepBackward = () => {
    if (totalSnapshots <= 0) {
      return;
    }
    setIsPlaying(false);
    setProgress((previous) => clampProgress(Math.floor(previous - 1)));
  };

  const handleStepForward = () => {
    if (totalSnapshots <= 0) {
      return;
    }
    setIsPlaying(false);
    setProgress((previous) => clampProgress(Math.ceil(previous + 1)));
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(totalSnapshots > 1);
  };

  const handlePlayToggle = () => {
    if (totalSnapshots <= 1) {
      setIsPlaying(false);
      return;
    }
    if (progress >= totalSnapshots - 1) {
      setProgress(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((previous) => !previous);
  };

  const topMinerId = topMiner?.id;

  const renderDot =
    (minerId: string) => {
    const DotComponent = (props: any) => {
      const { cx = 0, cy = 0, stroke, index } = props;
      if (!activeData.length || index !== activeData.length - 1) {
        return <g />;
      }

      const strokeColor =
        stroke ?? rosterMap.get(minerId)?.color ?? FALLBACK_COLOR;
      const isLeader = topMinerId === minerId;
      const minerData =
        animatedSnapshot.find((snapshot) => snapshot.id === minerId) ??
        rosterMap.get(minerId);
      const imageHref = minerData?.image ?? FALLBACK_AVATAR;
      const imageRadius = isLeader ? 12 : 10;
      const haloRadius = imageRadius + (isLeader ? 5 : 4);
      const clipPathId = `clip-${minerId}-${index}`;

      return (
        <g key={`${minerId}-${index}`}>
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
            clipPath={`url(#${clipPathId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      );
    };
    DotComponent.displayName = `DotComponent-${minerId}`;
    return DotComponent;
  };

  const createLineLabel =
    (minerId: string) => {
      const LineLabelComponent = (props: any) => {
      const { x = 0, y = 0, index } = props;
      if (!activeData.length || index !== activeData.length - 1) {
        return <g />;
      }

      const miner = animatedSnapshot.find((snapshot) => snapshot.id === minerId);
      if (!miner) {
        return <g />;
      }

      const isAscending = miner.rankChange > 0;
      const trendSymbol =
        miner.rankChange > 0 ? "▲" : miner.rankChange < 0 ? "▼" : "•";
      const labelText = `${miner.name} ${trendSymbol} ${miner.score.toFixed(2)}`;
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
    LineLabelComponent.displayName = `LineLabelComponent-${minerId}`;
    return LineLabelComponent;
  };

  const containerSpacing = condensed ? "space-y-5" : "space-y-6";
  const chartHeightClass = condensed ? "h-[360px]" : "h-[420px]";

  return (
    <div className={containerSpacing}>
      {!condensed && (
        <PageHeader
          title="Miner Season Race"
          description="Live season replay of miner competition with round reward, current rank, and season score."
        />
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {data
            ? `Refresh failed: ${error}. Showing cached data.`
            : error}
        </div>
      )}

      <WidgetCard
        headerClassName="hidden"
        className={cn("relative overflow-hidden", condensed && "mt-2")}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-teal-400/5 to-purple-500/5" />
        {isInitialLoading && totalSnapshots === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 text-sm font-semibold text-gray-600">
            Loading subnet timeline…
          </div>
        )}
        <div className="relative z-10">
          {!condensed && availableSeasons.length > 0 && (
            <div className="mb-4 flex justify-end">
              <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-black shadow-sm">
                <span className="uppercase tracking-[0.2em] text-gray-400">
                  Season
                </span>
                <select
                  value={selectedSeason ?? ""}
                  onChange={(event) =>
                    setSelectedSeason(Number(event.target.value))
                  }
                  className="bg-transparent text-sm font-semibold text-black outline-none"
                >
                  {availableSeasons.map((season) => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {topMiners.length > 0 ? (
              topMiners.map((miner, index) => {
                const imageSize = condensed ? 56 : 64;
                const accentClass =
                  index === 0
                    ? "border-amber-300 bg-gradient-to-br from-amber-200 via-yellow-100 to-white shadow-[0_16px_40px_rgba(245,158,11,0.22)]"
                    : index === 1
                    ? "border-slate-300 bg-gradient-to-br from-slate-200 via-slate-100 to-white shadow-[0_14px_34px_rgba(148,163,184,0.18)]"
                    : index === 2
                    ? "border-orange-300 bg-gradient-to-br from-orange-200 via-amber-100 to-white shadow-[0_14px_34px_rgba(249,115,22,0.18)]"
                    : "border-gray-200 bg-white";
                const rankBadgeClass =
                  index === 0
                    ? "bg-amber-500 text-white"
                    : index === 1
                    ? "bg-slate-500 text-white"
                    : index === 2
                    ? "bg-orange-500 text-white"
                    : "bg-amber-100/80 text-amber-700";
                const podiumLabel =
                  index === 0
                    ? "1st Place"
                    : index === 1
                    ? "2nd Place"
                    : index === 2
                    ? "3rd Place"
                    : null;
                return (
                  <div
                    key={`top-five-${miner.id}`}
                    className={cn(
                      "relative flex min-h-[122px] items-center gap-4 overflow-hidden rounded-xl border px-5 py-4 shadow-sm",
                      accentClass
                    )}
                  >
                    {podiumLabel && (
                      <div className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/70 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-700 backdrop-blur-sm">
                        {podiumLabel}
                      </div>
                    )}
                    <Image
                      src={miner.image}
                      alt={miner.name}
                      width={imageSize}
                      height={imageSize}
                      className={cn(
                        "z-20 rounded-full border border-white/80 shadow",
                        index === 0 && "ring-4 ring-amber-400/65",
                        index === 1 && "ring-4 ring-slate-400/55",
                        index === 2 && "ring-4 ring-orange-400/55"
                      )}
                    />
                    <div className="leading-tight text-black">
                      <p className="text-sm font-semibold text-black">{miner.name}</p>
                      <p className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em]",
                        rankBadgeClass
                      )}>
                        Rank #{miner.rank}
                      </p>
                      <div className="mt-1 grid gap-1 text-xs font-semibold text-black">
                        <p>Round reward: {miner.reward.toFixed(2)}</p>
                        <p>Season score: {miner.seasonScore.toFixed(3)}</p>
                        <p>Top score: {miner.score.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex min-w-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500">
                {isInitialLoading ? "Preparing miner standings…" : "No miner data available"}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex flex-col items-end">
              {seasonLeader && !condensed && (
                <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-700">
                  <PiTrophyFill className="h-3.5 w-3.5" />
                  {`Leader ${seasonLeader.name}`}
                </p>
              )}
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                {selectedSeason ? `Season ${selectedSeason}` : "Current Season"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {`Round ${formatRoundNumber(timeline[displayIndex]?.round ?? currentRound)}`}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {timeline[displayIndex]?.date
                  ? DATE_LABEL_FORMATTER.format(new Date(timeline[displayIndex].date))
                  : currentDateLabel}
              </p>
            </div>
            {isRefreshing && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-600">
                Refreshing…
              </span>
            )}
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
                {roster.map((miner) => (
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
              {isInitialLoading
                ? "Preparing animation..."
                : error
                ? data
                  ? "Timeline unavailable (showing cached state)."
                  : "Timeline unavailable."
                : "No timeline data available."}
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

        {!condensed && displaySnapshot.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.22em] text-gray-400">
                  <th className="px-3 py-2">Rank</th>
                  <th className="px-3 py-2">Miner</th>
                  <th className="px-3 py-2">Season Score</th>
                  <th className="px-3 py-2">Round Reward</th>
                  <th className="px-3 py-2">Round Peak</th>
                </tr>
              </thead>
              <tbody>
                {displaySnapshot.slice(0, 10).map((miner) => (
                  <tr
                    key={`leaderboard-${miner.id}`}
                    className="rounded-2xl bg-gray-50 text-gray-800 shadow-sm"
                  >
                    <td className="px-3 py-3 font-bold">#{miner.rank}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={miner.image}
                          alt={miner.name}
                          width={28}
                          height={28}
                          className="rounded-full border border-white shadow-sm"
                        />
                        <span className="font-semibold">{miner.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {miner.seasonScore.toFixed(3)}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {miner.reward.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {miner.score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

      </WidgetCard>
    </div>
  );
}
