"use client";

// Core/Next
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

// UI & Utils
import PageHeader from "@/app/shared/page-header";
import { Button, Text } from "rizzui";
import { Text as RizzText } from "rizzui/typography";
import { Skeleton } from "@core/ui/skeleton";
import WidgetCard from "@core/components/cards/widget-card";
import { useMedia } from "@core/hooks/use-media";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import cn from "@core/utils/class-names";

// Icons
import { LuInfo } from "react-icons/lu";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiClockDuotone,
  PiFlagCheckeredDuotone,
  PiPulseDuotone,
  PiInfoDuotone,
  PiCrownDuotone,
  PiTrophyDuotone,
  PiUsersThreeDuotone,
  PiCheckCircleDuotone,
  PiListChecksDuotone,
  PiCrownFill,
  PiCopyDuotone,
  PiCheckDuotone,
} from "react-icons/pi";

// Services & helpers
import { routes } from "@/config/routes";
import { resolveAssetUrl } from "@/services/utils/assets";
import {
  useRound,
  useRoundBasic,
  useRounds,
  useRoundProgress,
  useRoundValidators,
  useTopMiners,
  useRoundStatistics,
  useRoundMiners,
} from "@/services/hooks/useRounds";
import { roundsService } from "@/services/api/rounds.service";
import type {
  ValidatorPerformance,
  MinerPerformance,
  BenchmarkPerformance,
} from "@/services/api/types/rounds";

// ============================================================================
// UTILITY FUNCTIONS - Inline from round-identifier.ts
// ============================================================================
function extractRoundIdentifier(
  value: string | string[] | undefined
): string | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function extractRoundNumber(
  value: string | string[] | undefined
): number | undefined {
  const identifier = extractRoundIdentifier(value);
  if (!identifier) return undefined;
  const normalized = identifier.toLowerCase();
  const roundPatternMatch = normalized.match(/round[-_]?(\d+)/);
  if (roundPatternMatch?.[1]) {
    const parsed = Number.parseInt(roundPatternMatch[1], 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  const digitMatches = normalized.match(/\d+/g);
  if (digitMatches && digitMatches.length > 0) {
    const lastSegment = digitMatches[digitMatches.length - 1];
    const parsed = Number.parseInt(lastSegment, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

// ============================================================================
// STYLE CONSTANTS - Enhanced Modern Design System
// ============================================================================
const roundGlassBackgroundClass =
  "relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl";
const roundAccentActive =
  "border-emerald-400/50 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.4)]";
const roundAccentCompleted =
  "border-indigo-400/50 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-violet-500/5 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)]";
const roundAccentPending =
  "border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/5 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.4)]";
const roundSectionHeaderClass = `${roundGlassBackgroundClass} rounded-2xl border-white/30 px-8 py-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-4 hover:border-white/40 transition-all duration-300`;
const chipBase =
  "inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all duration-300";
const chipActive =
  "border-emerald-400/70 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.6)] hover:scale-105";
const chipCompleted =
  "border-indigo-400/70 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.6)] hover:scale-105";
const chipPending =
  "border-amber-400/70 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.6)] hover:scale-105";
const chipEvaluating =
  "border-orange-400/70 bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_30px_rgba(251,146,60,0.6)] hover:scale-105";
const roundNavButton =
  "inline-flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/40 disabled:hover:scale-100";
const metricCardClass = `${roundGlassBackgroundClass} group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:border-white/30`;
const tallCardClass = `${roundGlassBackgroundClass} rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]`;
const listRowHover =
  "hover:bg-white/15 hover:shadow-lg hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]";
const listRowHighlight = "";
const skeletonCard =
  "rounded-2xl border border-white/15 bg-white/5 animate-pulse";

// Modals
import { useModal } from "@/app/shared/modal-views/use-modal";
import RoundsGlossaryModal from "@/app/shared/modal-views/rounds-glossary-modal";

// Charts
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

// Local helpers
const normalizeScore = (value?: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const BENCHMARK_COLORS: Record<string, string> = {
  openai: "#2563EB",
  anthropic: "#F97316",
  "browser-use": "#8B5CF6",
  browser_use: "#8B5CF6",
  browser: "#8B5CF6",
};
const DEFAULT_BENCHMARK_COLORS = [
  "#2563EB",
  "#F97316",
  "#8B5CF6",
  "#14B8A6",
  "#F472B6",
];

function CustomTooltip({ label, active, payload, className }: any) {
  if (!active || !payload?.length) return null;
  const minerData = payload[0]?.payload;
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-white/30 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <Text className="label mb-1 block bg-gradient-to-r from-white/15 to-white/5 p-3 px-4 text-center font-inter text-sm font-bold capitalize text-white border-b border-white/10">
        {minerData?.name}
      </Text>
      <div className="px-4 py-3 text-sm space-y-2">
        {payload.map((item: any, index: number) => (
          <div
            key={item.dataKey + index}
            className="chart-tooltip-item flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full shadow-lg ring-2 ring-white/20"
                style={{
                  backgroundColor:
                    item.payload?.color || item.fill || "#10B981",
                }}
              />
              <Text
                as="span"
                className="capitalize text-white/90 font-semibold"
              >
                Score:
              </Text>
            </div>
            <Text as="span" className="font-black text-white text-base">
              {(Number(item.value) * 100).toFixed(2)}%
            </Text>
          </div>
        ))}
        {minerData?.avgTime != null && (
          <div className="chart-tooltip-item flex items-center justify-between gap-4 pt-1 border-t border-white/10">
            <Text as="span" className="capitalize text-white/90 font-semibold">
              Avg Time:
            </Text>
            <Text as="span" className="font-black text-white text-base">
              {Number(minerData.avgTime).toFixed(2)}s
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

function RoundHeaderInline({
  round,
  roundLoading,
}: {
  round?: any;
  roundLoading?: boolean;
}) {
  const { id } = useParams();
  const router = useRouter();
  const roundKey = extractRoundIdentifier(id);
  const roundNumber = extractRoundNumber(roundKey);
  const { data: progressData, loading: progressLoading } =
    useRoundProgress(roundKey);
  const { data: roundsData, loading: roundsLoading } = useRounds({
    page: 1,
    limit: 30,
    sortBy: "startTime",
    sortOrder: "desc",
  });
  const rawRounds = roundsData?.data?.rounds;
  const rounds = React.useMemo(() => rawRounds ?? [], [rawRounds]);
  const currentRoundFromList = (roundsData?.data as any)?.currentRound;

  const isLoading = roundLoading || progressLoading;

  const resolveRoundNumber = (r: any) => r?.roundNumber ?? r?.round ?? r?.id;
  const resolveRoundKey = (r: any, fallbackNumber?: number) =>
    r?.roundKey ??
    ((resolveRoundNumber(r) ?? fallbackNumber)
      ? `round_${resolveRoundNumber(r) ?? fallbackNumber}`
      : undefined);

  const normalizedCurrentNumber =
    typeof roundNumber === "number" && Number.isFinite(roundNumber)
      ? roundNumber
      : resolveRoundNumber(round);

  const neighborRounds = React.useMemo(() => {
    if (normalizedCurrentNumber === undefined)
      return { previous: null as any, next: null as any };
    let previous: any = null;
    let next: any = null;
    rounds.forEach((candidate: any) => {
      const candidateNumber = resolveRoundNumber(candidate);
      if (
        candidateNumber === undefined ||
        candidateNumber === normalizedCurrentNumber
      )
        return;
      if (candidateNumber < normalizedCurrentNumber) {
        if (!previous || resolveRoundNumber(previous) < candidateNumber)
          previous = candidate;
      } else if (candidateNumber > normalizedCurrentNumber) {
        if (!next || resolveRoundNumber(next) > candidateNumber)
          next = candidate;
      }
    });
    return { previous, next };
  }, [normalizedCurrentNumber, rounds]);

  const goToRound = React.useCallback(
    (targetKey?: string) => {
      if (!targetKey || targetKey === roundKey) return;
      router.push(`${routes.rounds}/${encodeURIComponent(targetKey)}`);
    },
    [router, roundKey]
  );

  const startBlock = progressData?.startBlock ?? round?.startBlock ?? 0;
  const endBlock = progressData?.endBlock ?? round?.endBlock ?? 0;
  const currentBlock =
    progressData?.currentBlock ?? round?.currentBlock ?? startBlock;
  const blocksRemaining =
    progressData?.blocksRemaining ??
    (typeof endBlock === "number" && typeof currentBlock === "number"
      ? Math.max(endBlock - currentBlock, 0)
      : undefined);

  // Determine actual round status - prioritize backend status
  const currentRoundNumber = resolveRoundNumber(currentRoundFromList);
  const progressValue = progressData?.progress ?? round?.progress ?? 0;

  // Check if validator rounds have evaluation results (tasks evaluated)
  const validatorRounds = round?.validatorRounds ?? [];
  const hasEvaluationsComplete = validatorRounds.some((vr) => {
    // Check if this validator has finished evaluating
    if (vr.status === "evaluating_finished" || vr.status === "finished") {
      return true;
    }
    // Check if there are agent runs with evaluation results
    const agentRuns = vr.agentEvaluationRuns ?? [];
    return agentRuns.some((run) => {
      const evalResults = run.evaluation_results ?? run.evaluationResults ?? [];
      return (
        evalResults.length > 0 &&
        evalResults.length >= (run.total_tasks ?? run.totalTasks ?? 0)
      );
    });
  });

  // ALWAYS trust backend status first - it's the source of truth
  const backendStatus = round?.status;
  let status: "active" | "completed" | "pending";
  let statusLabel: string;

  if (backendStatus === "pending") {
    status = "pending";
    statusLabel = "Pending";
  } else if (backendStatus === "finished") {
    status = "completed";
    statusLabel = "Finished";
  } else if (backendStatus === "evaluating_finished") {
    // Evaluating finished - waiting for consensus/weights
    status = "active";
    statusLabel = "Waiting for Consensus";
  } else if (backendStatus === "active") {
    // Active round - check if evaluations are done
    if (hasEvaluationsComplete) {
      status = "active";
      statusLabel = "Waiting for Consensus";
    } else {
      status = "active";
      statusLabel = "Running";
    }
  } else {
    // No backend status - fallback to round.current flag
    if (round?.current) {
      status = "active";
      statusLabel = "Running";
    } else {
      status = "completed";
      statusLabel = "Finished";
    }
  }

  const isActive = status === "active";

  const progressPercentageRaw =
    typeof progressData?.progress === "number"
      ? progressData.progress * 100
      : typeof round?.progress === "number"
        ? round.progress * 100
        : isActive
          ? 0
          : 100;
  const progressPercentage = Math.max(
    0,
    Math.min(100, Math.round(progressPercentageRaw))
  );

  const previousKey = resolveRoundKey(neighborRounds.previous);
  const nextKey = resolveRoundKey(neighborRounds.next);
  const previousNumber = resolveRoundNumber(neighborRounds.previous);
  const nextNumber = resolveRoundNumber(neighborRounds.next);
  const currentRoundKey = resolveRoundKey(currentRoundFromList);

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl rounded-3xl p-8 text-white">
          <div className="relative space-y-8">
            <header className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-40 md:h-14 md:w-56 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-5 w-48 bg-white/10" />
                  <Skeleton className="h-5 w-40 bg-white/10" />
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-28 bg-white/10" />
                  <Skeleton className="h-10 w-28 bg-white/10" />
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-1 flex-col gap-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32 bg-white/10" />
                  <Skeleton className="h-8 w-16 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-full rounded-full bg-white/10" />
                <div className="grid gap-5 sm:grid-cols-3">
                  <Skeleton className="h-24 rounded-2xl bg-white/10" />
                  <Skeleton className="h-24 rounded-2xl bg-white/10" />
                  <Skeleton className="h-24 rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div
        className={cn(
          roundGlassBackgroundClass,
          "rounded-3xl p-8 text-white shadow-2xl relative",
          isActive
            ? roundAccentActive
            : status === "completed"
              ? roundAccentCompleted
              : status === "pending"
                ? roundAccentPending
                : undefined
        )}
      >
        <div className="relative space-y-8">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-black leading-none md:text-5xl text-white">
                  Round {normalizedCurrentNumber ?? "—"}
                </h1>
                <span
                  className={cn(
                    chipBase,
                    status === "pending" && chipPending,
                    status === "completed" && chipCompleted,
                    isActive &&
                      statusLabel === "Waiting for Consensus" &&
                      chipEvaluating,
                    isActive &&
                      statusLabel !== "Waiting for Consensus" &&
                      chipActive
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shadow-lg",
                      isActive && "bg-white animate-pulse",
                      status === "completed" && "bg-white",
                      status === "pending" && "bg-white"
                    )}
                  />
                  {statusLabel}
                  {isActive && (
                    <span
                      aria-label={
                        statusLabel === "Waiting for Consensus"
                          ? "Evaluating"
                          : "Running"
                      }
                      aria-live="polite"
                      className="ml-1 inline-block h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin"
                    />
                  )}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <PiClockDuotone className="h-5 w-5 text-emerald-300" />
                  <span>
                    {isActive
                      ? "Waiting for updated timing"
                      : "No remaining time"}
                  </span>
                </div>
                {typeof blocksRemaining === "number" &&
                  !Number.isNaN(blocksRemaining) && (
                    <div className="flex items-center gap-2">
                      <PiPulseDuotone className="h-5 w-5 text-sky-300" />
                      <span>
                        {blocksRemaining.toLocaleString()} blocks remaining
                      </span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {/* Previous round (lower number) on the left */}
                <button
                  type="button"
                  onClick={() => goToRound(previousKey)}
                  disabled={!previousKey}
                  className={cn(roundNavButton)}
                >
                  <PiCaretLeftBold className="h-4 w-4" />
                  <span>
                    {previousNumber ? `Round ${previousNumber}` : "Prev"}
                  </span>
                </button>
                {/* Next round (higher number) on the right */}
                <button
                  type="button"
                  onClick={() => goToRound(nextKey)}
                  disabled={!nextKey}
                  className={cn(roundNavButton)}
                >
                  <span>{nextNumber ? `Round ${nextNumber}` : "Next"}</span>
                  <PiCaretRightBold className="h-4 w-4" />
                </button>
              </div>
              {currentRoundKey && currentRoundKey !== roundKey && (
                <Link
                  href={`${routes.rounds}/${encodeURIComponent(currentRoundKey)}`}
                  className="inline-flex items-center gap-2.5 rounded-xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:border-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Current (Round {currentRoundNumber ?? "—"})
                </Link>
              )}
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 flex-col gap-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white/80 uppercase tracking-wider">
                  Round Progress
                </span>
                <span className="font-black text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {progressPercentage}%
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10 border border-white/20 shadow-inner">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out shadow-lg",
                    isActive &&
                      "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 shadow-emerald-500/50",
                    status === "completed" &&
                      "bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-500 shadow-indigo-500/50",
                    status === "pending" &&
                      "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 shadow-amber-500/50"
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-3 border-white transition-[left] duration-700 ease-out ring-4 ring-white/20",
                    isActive &&
                      "bg-emerald-400 shadow-[0_0_25px_rgba(110,231,183,0.6)] animate-pulse",
                    status === "completed" &&
                      "bg-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.6)]",
                    status === "pending" &&
                      "bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)]"
                  )}
                  style={{ left: `calc(${progressPercentage}% - 10px)` }}
                />
              </div>
              <div className="grid gap-5 text-sm text-white/70 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-2xl border-2 border-indigo-400/40 bg-gradient-to-br from-indigo-400/15 to-purple-400/10 px-5 py-4 hover:border-indigo-300/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400/30 to-purple-400/30 ring-2 ring-indigo-400/40">
                    <PiClockDuotone className="h-7 w-7 text-indigo-200" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
                      Start Block
                    </span>
                    <div className="text-lg font-black text-white mt-0.5">
                      {startBlock.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-400/15 to-orange-400/10 px-5 py-4 hover:border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-400/30 ring-2 ring-amber-400/40">
                    <PiPulseDuotone className="h-7 w-7 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-200/80 font-bold">
                      Current Block
                    </span>
                    <div className="text-lg font-black text-amber-100 mt-0.5">
                      {currentBlock.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 px-5 py-4  hover:border-white/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 ring-2 ring-indigo-400/30">
                    <PiFlagCheckeredDuotone className="h-7 w-7 text-indigo-200" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
                      End Block
                    </span>
                    <div className="text-lg font-black text-white mt-0.5">
                      {endBlock.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// RoundRecentsInline removed — slider replaced by Prev/Next in header
/* function RoundRecentsInline() {
  const { id } = useParams();
  const currentRoundKey = extractRoundIdentifier(id);
  const currentRoundNumber = extractRoundNumber(currentRoundKey);
  const hasScrolledToActive = React.useRef(false);
  const { data: roundsData, loading, error } = useRounds({ page: 1, limit: 10, sortBy: "startTime", sortOrder: "desc" });
  const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } = useScrollableSlider();

  React.useEffect(() => {
    if (!roundsData || loading || !sliderEl.current || hasScrolledToActive.current) return;
    const roundsSource = roundsData?.data?.rounds ?? [];
    const roundsList = roundsSource.slice(0, 10);
    if (roundsList.length === 0) return;
    const activeIndex = roundsList.findIndex((round: any, index: number) => {
      const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
      const baseNumber = round.roundNumber ?? round.id;
      return (currentRoundKey !== undefined && roundKey === currentRoundKey) || (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
    });
    if (activeIndex !== -1) {
      setTimeout(() => {
        const roundCards = sliderEl.current?.querySelectorAll('a');
        if (roundCards && (roundCards as any)[activeIndex]) {
          (roundCards as any)[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          hasScrolledToActive.current = true;
        }
      }, 100);
    }
  }, [roundsData, loading, sliderEl, currentRoundKey, currentRoundNumber]);

  React.useEffect(() => { hasScrolledToActive.current = false; }, [currentRoundKey, currentRoundNumber]);

  if (loading) {
    return (
      <div className="relative flex w-auto items-center overflow-hidden mb-3">
        <div className="w-full overflow-hidden">
          <div className="grid grid-flow-col gap-5 overflow-x-auto scroll-smooth">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="w-full min-w-[320px] rounded-xl px-6 py-7 border-2 border-gray-200">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-0.5 w-8" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-3">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">⚠️ Failed to load recent rounds: {error}</p>
        </div>
      </div>
    );
  }

  const roundsSource = roundsData?.data?.rounds ?? [];
  const roundsList = roundsSource.slice(0, 10);
  if (roundsList.length === 0) {
    return (
      <div className="mb-3">
        <div className="rounded-lg border border-gray-200 px-6 py-5 text-sm text-gray-500">No recent rounds available.</div>
      </div>
    );
  }

  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-4">
        <Button title="Prev" variant="text" ref={sliderPrevBtn} onClick={() => scrollToTheLeft()} className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-110 hover:shadow-xl z-10">
          <PiCaretLeftBold className="h-6 w-6" />
        </Button>
        <div className="flex-1 overflow-hidden">
          <div ref={sliderEl} className="flex gap-6 overflow-x-scroll scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-0" style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
            {roundsList.map((round: any, index: number) => {
              const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
              const baseNumber = round.roundNumber ?? round.id;
              const isActive = (currentRoundKey !== undefined && roundKey === currentRoundKey) || (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
              const isCurrent = round.current;
              const isSelected = isActive;
              return (
                <Link key={roundKey} href={`${routes.rounds}/${encodeURIComponent(roundKey)}`} className="snap-start flex-shrink-0 w-[calc(33.333%-1rem)] min-w-[320px] animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                  <div className={cn("w-full h-full rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group  transform hover:scale-[1.02]",
                    isSelected ? "bg-[#F8FAFC] border-2 border-[#E2E8F0] text-slate-900 shadow-[0_10px_24px_rgba(248,250,252,0.25)] hover:border-[#CBD5F5] hover:shadow-[0_16px_32px_rgba(248,250,252,0.35)]" : "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white hover:shadow-xl hover:shadow-blue-500/30")}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 bg-white text-black">
                          {(isCurrent ? <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/></svg> : <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                        </span>
                        <span className={cn("text-[20px] font-bold uppercase tracking-wide", isSelected ? "text-slate-900" : "text-white")}>Round {baseNumber}</span>
                      </div>
                      {!isCurrent && (
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                          isSelected ? "bg-green-500/20 text-green-700" : "bg-green-500/25 text-green-300")}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          Finished
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className={cn("flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide", isSelected ? "text-slate-700" : "text-gray-400")}> <span>Epoch Start</span> <span>Epoch End</span> </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all", isSelected ? "bg-black/10 text-slate-900" : "bg-white/10 text-white group-hover:bg-white/15")}>{round.startBlock}</div>
                        <div className={cn("w-8 h-[2px] rounded-full", isSelected ? "bg-black/20" : "bg-white/20")} />
                        <div className={cn("flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all", isSelected ? "bg-black/10 text-slate-900" : "bg-white/10 text-white group-hover:bg-white/15")}>{round.endBlock}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <Button title="Next" variant="text" ref={sliderNextBtn} onClick={() => scrollToTheRight()} className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-110 hover:shadow-xl z-10">
          <PiCaretRightBold className="h-6 w-6" />
        </Button>
      </div>
      <div className="mt-10 mb-8"><div className="h-[3px] bg-gradient-to-r from-transparent via-gray-400/70 to-transparent shadow-sm"></div></div>
    </div>
  );
} */

function RoundStatsInline({
  selectedValidator,
  statistics,
  topMiners,
  loading,
  error,
}: {
  selectedValidator?: ValidatorPerformance | null;
  statistics?: any;
  topMiners?: any[];
  loading?: boolean;
  error?: string;
}) {
  const winnerUid = statistics?.winnerMinerUid ?? null;

  const topMiner = React.useMemo(() => {
    if (selectedValidator?.topMiner) return selectedValidator.topMiner;
    if (!Array.isArray(topMiners) || topMiners.length === 0) return undefined;
    if (selectedValidator?.id) {
      const filtered = topMiners.filter(
        (miner) => miner.validatorId === selectedValidator.id
      );
      if (filtered.length > 0) return filtered[0];
    }
    if (winnerUid !== null) {
      const winnerEntry = topMiners.find((miner) => miner.uid === winnerUid);
      if (winnerEntry) return winnerEntry;
    }
    return topMiners[0];
  }, [topMiners, selectedValidator, winnerUid]);

  if (loading || !statistics || !topMiners) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={cn("h-36", skeletonCard)} />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="mb-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load round statistics: {error}
          </p>
        </div>
      </div>
    );
  }

  const totalValidators = statistics.totalValidators || 0;
  const averageTasks =
    statistics.averageTasksPerValidator != null
      ? statistics.averageTasksPerValidator
      : totalValidators
        ? statistics.totalTasks / totalValidators
        : 0;
  const topMinerLabel = topMiner
    ? topMiner.name && topMiner.name.trim().length > 0
      ? topMiner.name
      : `Miner ${topMiner.uid ?? "pending"}`
    : "Top miner pending";
  const formatNumber = (value: number | undefined | null, digits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value))
      return "0";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };
  const winnerAverageScore =
    statistics?.winnerAverageScore ?? statistics?.averageScore ?? 0;

  const aggregatedCards = [
    {
      key: "winner",
      title: "Winner",
      value: topMinerLabel,
      uid: topMiner?.uid,
      hotkey: topMiner?.hotkey,
      imageUrl: topMiner?.imageUrl,
      helper: !topMiner ? "Awaiting validator results" : undefined,
      icon: PiCrownDuotone,
      gradient: "from-amber-500/30 via-yellow-500/25 to-orange-500/30",
      bgGradient: "from-amber-500/20 via-yellow-500/15 to-orange-500/10",
      iconGradient: "from-amber-400 to-orange-500",
      borderColor: "border-amber-400/50",
      glowColor: "rgba(251,191,36,0.5)",
      valueClass: "text-2xl",
    },
    {
      key: "winnerAverageScore",
      title: "Winner Average Score",
      value: `${formatNumber(winnerAverageScore * 100, 1)}%`,
      helper: "Average score achieved by the winning miner across validators",
      icon: PiTrophyDuotone,
      gradient: "from-emerald-500/30 via-teal-500/25 to-cyan-500/30",
      bgGradient: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
      iconGradient: "from-emerald-400 to-teal-500",
      borderColor: "border-emerald-400/50",
      glowColor: "rgba(16,185,129,0.5)",
      valueClass: "text-4xl",
    },
    {
      key: "miners",
      title: "Miners Evaluated",
      value: formatNumber(statistics.totalMiners ?? 0),
      helper: "Unique miners participating this round",
      icon: PiUsersThreeDuotone,
      gradient: "from-violet-500/30 via-purple-500/25 to-fuchsia-500/30",
      bgGradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/10",
      iconGradient: "from-violet-400 to-fuchsia-500",
      borderColor: "border-violet-400/50",
      glowColor: "rgba(139,92,246,0.5)",
      valueClass: "text-4xl",
    },
    {
      key: "tasks",
      title: "Average Tasks",
      value: formatNumber(averageTasks, 0),
      helper: "Tasks completed per validator",
      icon: PiListChecksDuotone,
      gradient: "from-blue-500/30 via-indigo-500/25 to-sky-500/30",
      bgGradient: "from-blue-500/20 via-indigo-500/15 to-sky-500/10",
      iconGradient: "from-blue-400 to-indigo-500",
      borderColor: "border-blue-400/50",
      glowColor: "rgba(59,130,246,0.5)",
      valueClass: "text-4xl",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {aggregatedCards.map((card) => (
        <MetricCard key={card.key} card={card} />
      ))}
    </div>
  );
}

function MetricCard({ card }: { card: any }) {
  const Icon = card.icon;
  const isWinner = card.key === "winner" && typeof card.uid === "number";
  const [copied, setCopied] = React.useState(false);
  const fallbackAvatarIndex = (() => {
    const uidValue = card?.uid;
    if (typeof uidValue === "number" && Number.isFinite(uidValue)) {
      return Math.abs(uidValue % 50);
    }
    return 0;
  })();
  const fallbackAvatar = resolveAssetUrl(`/miners/${fallbackAvatarIndex}.svg`);
  const winnerAvatar = resolveAssetUrl(card?.imageUrl, fallbackAvatar);

  const handleCopyHotkey = async (hotkey: string) => {
    try {
      await navigator.clipboard.writeText(hotkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl md:rounded-3xl p-3 md:p-8 shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] border-2 bg-gradient-to-br",
        card.borderColor,
        card.bgGradient
      )}
    >
      {/* Mobile Layout */}
      <div className="relative flex md:hidden h-full flex-col gap-2.5">
        <div className="flex items-start gap-2">
          {isWinner ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-amber-300/70 shadow-2xl ring-4 ring-amber-400/30 transition-all duration-300 group-hover:scale-110 group-hover:ring-amber-400/50 group-hover:rotate-3 flex-shrink-0">
              <Image
                src={winnerAvatar}
                alt={`UID ${card.uid ?? "winner"}`}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-2xl ring-2 ring-white/30 animate-pulse">
                <PiCrownDuotone className="h-4 w-4 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:border-white/50 flex-shrink-0",
                "bg-gradient-to-br",
                card.iconGradient
              )}
            >
              <Icon className="h-8 w-8 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />
            </div>
          )}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80 group-hover:text-white transition-colors duration-300 text-right">
              {card.title}
            </span>
            <div
              className={cn(
                "font-black text-white transition-all duration-300 group-hover:scale-105",
                card.valueClass
              )}
            >
              {card.value}
            </div>
            {isWinner && typeof card.uid === "number" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  UID
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/40 text-white font-black text-sm shadow-lg">
                  {card.uid}
                </span>
              </div>
            )}
          </div>
        </div>
        {isWinner && card.hotkey ? (
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
              Hotkey
            </span>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-white/15 to-white/10 border-2 border-white/30 shadow-lg group-hover:border-white/40 transition-all duration-300">
              <span className="text-xs font-mono font-bold text-white/95 truncate flex-1">
                {card.hotkey.slice(0, 10)}...{card.hotkey.slice(-10)}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyHotkey(card.hotkey);
                }}
                className="flex-shrink-0 p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                title="Copy full hotkey"
              >
                {copied ? (
                  <PiCheckDuotone className="h-4 w-4 text-emerald-300" />
                ) : (
                  <PiCopyDuotone className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
          </div>
        ) : card.helper ? (
          <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors duration-300 leading-relaxed">
            {card.helper}
          </p>
        ) : null}
      </div>

      {/* Desktop Layout */}
      <div className="relative hidden md:flex h-full flex-col gap-7">
        <div className="flex items-start gap-4">
          {isWinner ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-3 border-amber-300/70 shadow-2xl ring-6 ring-amber-400/30 transition-all duration-300 group-hover:scale-110 group-hover:ring-amber-400/50 group-hover:rotate-3">
              <Image
                src={winnerAvatar}
                alt={`UID ${card.uid ?? "winner"}`}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 shadow-2xl ring-3 ring-white/30 animate-pulse">
                <PiCrownDuotone className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-3 border-white/30 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:border-white/50",
                "bg-gradient-to-br",
                card.iconGradient
              )}
            >
              <Icon className="h-12 w-12 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />
            </div>
          )}
          <div className="flex flex-col items-end gap-2 flex-1">
            <span className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80 group-hover:text-white transition-colors duration-300 text-right">
              {card.title}
            </span>
            {isWinner && typeof card.uid === "number" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  UID
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/40 text-white font-black text-sm shadow-lg">
                  {card.uid}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto space-y-3">
          <div
            className={cn(
              "font-black text-white transition-all duration-300 group-hover:scale-105",
              card.valueClass
            )}
          >
            {card.value}
          </div>

          {isWinner && card.hotkey ? (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
                Hotkey
              </span>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-white/15 to-white/10 border-2 border-white/30 shadow-lg group-hover:border-white/40 transition-all duration-300">
                <span className="text-xs font-mono font-bold text-white/95 truncate flex-1">
                  {card.hotkey.slice(0, 10)}...{card.hotkey.slice(-10)}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyHotkey(card.hotkey);
                  }}
                  className="flex-shrink-0 p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                  title="Copy full hotkey"
                >
                  {copied ? (
                    <PiCheckDuotone className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <PiCopyDuotone className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          ) : card.helper ? (
            <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors duration-300 leading-relaxed">
              {card.helper}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoundValidatorsInline({
  className,
  onValidatorSelect,
  selectedValidatorId: externalSelectedId = null,
  requestedValidatorId = null,
}: {
  className?: string;
  onValidatorSelect?: (v: ValidatorPerformance) => void;
  selectedValidatorId?: string | null;
  requestedValidatorId?: string | null;
}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { data: validatorsData, loading, error } = useRoundValidators(roundKey);
  const [selectedValidatorId, setSelectedValidatorId] = React.useState<
    string | null
  >(requestedValidatorId ?? externalSelectedId);
  const lastNotifiedValidator = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (requestedValidatorId && requestedValidatorId !== selectedValidatorId) {
      setSelectedValidatorId(requestedValidatorId);
      return;
    }
    if (externalSelectedId && externalSelectedId !== selectedValidatorId) {
      setSelectedValidatorId(externalSelectedId);
    }
  }, [externalSelectedId, requestedValidatorId, selectedValidatorId]);

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  React.useEffect(() => {
    if (!validatorsData || validatorsData.length === 0) return;
    const resolveValidatorById = (candidateId: string | null | undefined) =>
      candidateId
        ? (validatorsData.find((v) => v.id === candidateId) ?? null)
        : null;
    const requested = resolveValidatorById(requestedValidatorId);
    const currentExternal = resolveValidatorById(externalSelectedId);
    const currentSelected = resolveValidatorById(selectedValidatorId);
    if (requestedValidatorId && !requested) return; // wait until exists
    const nextValidator =
      requested ?? currentExternal ?? currentSelected ?? validatorsData[0];
    if (!nextValidator) return;
    if (selectedValidatorId !== nextValidator.id)
      setSelectedValidatorId(nextValidator.id);
    if (
      onValidatorSelect &&
      lastNotifiedValidator.current !== nextValidator.id
    ) {
      onValidatorSelect(nextValidator);
      lastNotifiedValidator.current = nextValidator.id;
    }
  }, [
    validatorsData,
    selectedValidatorId,
    externalSelectedId,
    requestedValidatorId,
    onValidatorSelect,
  ]);

  const selectedValidator = validatorsData?.find(
    (v) => v.id === selectedValidatorId
  );

  if (loading) {
    return (
      <div className={cn(className)}>
        <div className="relative flex w-auto items-center overflow-hidden">
          <div className="w-full overflow-hidden">
            <div className="grid grid-flow-col gap-4 overflow-x-auto scroll-smooth">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className={cn("w-full min-w-[220px] px-5 py-5", skeletonCard)}
                >
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/20 rounded-full border border-blue-700/50">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(className)}>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load validators: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div className="relative flex w-auto items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent px-0 ps-1 text-white/70 hover:text-white 3xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>

        <div className="w-full overflow-hidden">
          <div
            ref={sliderEl}
            className="custom-scrollbar grid grid-flow-col gap-8 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-0 px-4 py-6"
          >
            {validatorsData?.map((validator) => {
              const iconSrc = resolveAssetUrl(
                validator.icon,
                resolveAssetUrl("/validators/Other.png")
              );
              const isActive = selectedValidatorId === validator.id;
              return (
                <div
                  key={`validator-${validator.id}`}
                  onClick={() => {
                    if (validator.id === selectedValidatorId) return;
                    setSelectedValidatorId(validator.id);
                    lastNotifiedValidator.current = validator.id;
                    onValidatorSelect?.(validator);
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "relative w-full min-w-[200px] px-5 py-5 transition-all duration-500 shadow-2xl group rounded-2xl",
                      tallCardClass,
                      isActive
                        ? "border-sky-400/70 bg-gradient-to-br from-sky-500/20 via-cyan-500/15 to-blue-500/20 ring-4 ring-sky-400/30"
                        : "hover:border-white/40 hover:bg-white/10 hover:scale-102 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    <div className="relative flex flex-col items-center text-white">
                      <div
                        className={cn(
                          "relative aspect-square w-16 h-16 mb-4 transition-all duration-500",
                          "group-hover:scale-110 group-hover:rotate-3"
                        )}
                      >
                        <Image
                          src={iconSrc}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className={cn(
                            "h-full w-full rounded-full object-contain transition-all duration-500 shadow-xl",
                            isActive
                              ? "ring-4 ring-sky-300/70 ring-offset-2 ring-offset-sky-500/20 shadow-[0_8px_30px_rgba(56,189,248,0.5)]"
                              : "ring-2 ring-white/20 group-hover:ring-4 group-hover:ring-white/40"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-lg font-black tracking-wide text-center transition-all duration-300",
                          isActive &&
                            "bg-gradient-to-r from-sky-200 via-white to-cyan-200 bg-clip-text text-transparent"
                        )}
                      >
                        {validator.name}
                      </span>
                      <span
                        className={cn(
                          "mt-2 text-xs font-bold tracking-wider font-inter truncate max-w-full px-3 py-1.5 rounded-full transition-all duration-300",
                          isActive
                            ? "text-sky-200 bg-sky-500/20 border border-sky-400/40"
                            : "text-white/60 group-hover:text-white/80 border border-transparent group-hover:border-white/20 group-hover:bg-white/10"
                        )}
                      >
                        {validator.hotkey
                          ? `${validator.hotkey.slice(0, 6)}...${validator.hotkey.slice(-6)}`
                          : "No hotkey"}
                      </span>
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
          className="!absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-slate-900 via-slate-900/60 to-transparent px-0 pe-2 text-white/70 hover:text-white 3xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-10 mb-8">
        <div className="flex items-center gap-8">
          <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-lg"></div>
          <div
            className={cn(
              roundSectionHeaderClass,
              "shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
            )}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.7)] ring-4 ring-amber-400/20"></div>
              <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <RizzText className="text-xl font-black tracking-wide bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              {selectedValidator?.name || "Selected Validator"}
            </RizzText>
          </div>
          <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-lg"></div>
        </div>
      </div>
    </div>
  );
}

function RoundMinerScoresInline({
  className,
  selectedValidator,
  roundInfo,
  minersData,
  loading,
  error,
}: {
  className?: string;
  selectedValidator?: ValidatorPerformance | null;
  roundInfo?: any;
  minersData?: any;
  loading?: boolean;
  error?: string;
}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const roundStatus = (roundInfo?.status ??
    (roundInfo?.current ? "active" : "completed")) as
    | "active"
    | "completed"
    | "pending";
  const accentClass =
    roundStatus === "active"
      ? roundAccentActive
      : roundStatus === "completed"
        ? roundAccentCompleted
        : roundAccentPending;
  const cardClassName = React.useMemo(
    () =>
      cn(
        tallCardClass,
        accentClass,
        "relative overflow-hidden group h-[450px] md:h-[550px] xl:h-[650px] px-6 py-4",
        className
      ),
    [accentClass, className]
  );
  const isSmallScreen = useMedia("(max-width: 767px)", false);
  const isMediumScreen = useMedia(
    "(min-width: 768px) and (max-width: 1023px)",
    false
  );
  const barSize = isSmallScreen ? 10 : isMediumScreen ? 20 : 25;
  const minWidth = isSmallScreen ? 200 : isMediumScreen ? 640 : 840;
  const chartSource = minersData?.data;

  const chartData = React.useMemo(() => {
    if (!chartSource?.miners) {
      console.log("[RoundMinerScores] No miners in chartSource:", chartSource);
      return [] as any[];
    }
    console.log("[RoundMinerScores] chartSource.miners:", chartSource.miners);
    console.log("[RoundMinerScores] selectedValidator:", selectedValidator);
    const benchmarkColorCache = new Map<string, string>();
    let fallbackColorIndex = 0;
    const benchmarks: BenchmarkPerformance[] = chartSource.benchmarks || [];
    const filteredMiners = selectedValidator?.id
      ? chartSource.miners.filter(
          (miner) => miner.validatorId === selectedValidator.id
        )
      : chartSource.miners;
    console.log("[RoundMinerScores] filteredMiners:", filteredMiners);
    console.log("[RoundMinerScores] benchmarks:", benchmarks);
    const minerEntries = filteredMiners.map((miner: any) => {
      const score = normalizeScore(miner.score);
      const rawIsSota =
        miner.isSota ??
        miner.is_sota ??
        miner.isBenchmark ??
        miner.is_benchmark ??
        (typeof miner.type === "string" &&
          miner.type.toLowerCase() === "benchmark");
      const isSota = Boolean(rawIsSota);
      const resolvedName = miner.name?.trim() || miner.provider?.trim() || "";
      const uidLabel =
        miner.uid !== undefined && miner.uid !== null ? String(miner.uid) : "";
      const label = isSota
        ? resolvedName || `Benchmark ${uidLabel || "unknown"}`
        : resolvedName
          ? `${resolvedName} · ${uidLabel || "unknown"}`
          : uidLabel
            ? `Miner ${uidLabel}`
            : "Miner";
      const slug = miner.provider ? slugify(miner.provider) : slugify(label);
      let color = "#06B6D4";
      if (isSota) {
        if (BENCHMARK_COLORS[slug]) color = BENCHMARK_COLORS[slug];
        else if (benchmarkColorCache.has(slug))
          color = benchmarkColorCache.get(slug)!;
        else {
          color =
            DEFAULT_BENCHMARK_COLORS[
              fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length
            ];
          benchmarkColorCache.set(slug, color);
          fallbackColorIndex += 1;
        }
      }
      return {
        name: label,
        score,
        isSota,
        uid: miner.uid,
        color,
        provider: miner.provider,
        xAxisLabel: isSota ? "" : uidLabel,
      };
    });
    const benchmarkEntries = benchmarks.map((benchmark) => {
      const score = normalizeScore(benchmark.score);
      const label = benchmark.name;
      const slug = benchmark.provider
        ? slugify(benchmark.provider)
        : slugify(label);
      let color = BENCHMARK_COLORS[slug];
      if (!color) {
        if (benchmarkColorCache.has(slug))
          color = benchmarkColorCache.get(slug)!;
        else {
          color =
            DEFAULT_BENCHMARK_COLORS[
              fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length
            ];
          benchmarkColorCache.set(slug, color);
          fallbackColorIndex += 1;
        }
      }
      return {
        name: label,
        score,
        isSota: true,
        uid: `benchmark-${benchmark.id}`,
        color,
        provider: benchmark.provider,
        xAxisLabel: "",
      };
    });
    return [...minerEntries, ...benchmarkEntries].sort(
      (a, b) => b.score - a.score
    );
  }, [minersData, selectedValidator]);

  const legendItems = React.useMemo(() => {
    const sotaEntries = new Map<string, string>();
    chartData.forEach((entry: any) => {
      if (entry.isSota) sotaEntries.set(entry.name, entry.color);
    });
    return [
      ...Array.from(sotaEntries.entries()).map(([label, color]) => ({
        label,
        color,
      })),
    ];
  }, [chartData]);

  if (loading) {
    return (
      <WidgetCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        }
        className={cardClassName}
        headerClassName="text-white pb-4"
        titleClassName="text-white"
      >
        <div className="mt-3 w-full h-[360px] md:h-[400px] xl:h-[490px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="mt-3 flex justify-center gap-6">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold">Miner Scores</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                disabled
              />
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                Show SOTA
              </span>
            </label>
          </div>
        }
        className={cardClassName}
        headerClassName="text-white pb-4"
        titleClassName="text-white"
      >
        <div className="mt-3 flex h-[360px] md:h-[400px] xl:h-[490px] w-full items-center justify-center">
          <div className="text-center text-rose-200">
            <p className="text-xl font-semibold">Failed to load miner scores</p>
            <p className="mt-3 text-base text-white/80">
              Please try again later
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (!chartData.length) {
    return (
      <WidgetCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold">Miner Scores</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                disabled
              />
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                Show SOTA
              </span>
            </label>
          </div>
        }
        className={cardClassName}
        headerClassName="text-white pb-4"
        titleClassName="text-white"
      >
        <div className="mt-3 flex h-[360px] md:h-[400px] xl:h-[490px] w-full items-center justify-center">
          <div className="text-center text-white/70">
            <p className="text-xl font-semibold">No miners found</p>
            <p className="mt-3 text-base">
              No miner leaderboard data is available for this round.
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 md:h-10 md:w-10 xl:h-12 xl:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <svg
                className="h-4 w-4 md:h-5 md:w-5 xl:h-6 xl:w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z"
                />
              </svg>
            </div>
            <span className="text-md sm:text-2xl font-bold">
              Miner Scores
              {selectedValidator?.name ? ` - ${selectedValidator.name}` : ""}
            </span>
          </div>
        </div>
      }
      className={cardClassName}
      headerClassName="text-white pb-4"
      titleClassName="text-white"
    >
      <div className="mt-3 h-[360px] md:h-[400px] xl:h-[490px] w-full custom-scrollbar overflow-x-auto scroll-smooth">
        <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
          <ComposedChart
            data={chartData}
            margin={{ left: -20, top: 20, bottom: 30 }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(148,163,184,0.15)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="xAxisLabel"
              tick={{
                fill: "rgba(226,232,240,0.9)",
                fontSize: isSmallScreen ? 11 : 13,
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
              }}
              axisLine={{ stroke: "rgba(148,163,184,0.3)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.3)" }}
              height={40}
              label={{
                value: "Miner UID",
                position: "insideBottom",
                offset: -5,
                fill: "#94a3b8",
                fontSize: isSmallScreen ? 10 : 12,
              }}
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              tick={{
                fill: "rgba(226,232,240,0.9)",
                fontSize: isSmallScreen ? 11 : 13,
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
              }}
              axisLine={{ stroke: "rgba(148,163,184,0.3)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.3)" }}
              width={60}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(148,163,184,0.1)" }}
            />
            <Bar
              dataKey="score"
              fill="url(#barGradient)"
              strokeWidth={0}
              radius={[8, 8, 0, 0]}
              barSize={barSize}
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${entry.uid}-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {legendItems.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-6">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 border border-white/15 shadow-sm"
            >
              <div
                className="h-4 w-4 rounded-full shadow-lg"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}66`,
                }}
              />
              <Text className="text-white font-medium text-sm">
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function RoundTopMinersInline({
  className,
  selectedValidator,
  roundNumber,
  roundInfo,
  minersData,
  loading,
  error,
}: {
  className?: string;
  selectedValidator?: ValidatorPerformance | null;
  roundNumber?: number;
  roundInfo?: any;
  minersData?: any;
  loading?: boolean;
  error?: string;
}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const roundStatus = (roundInfo?.status ??
    (roundInfo?.current ? "active" : "completed")) as
    | "active"
    | "completed"
    | "pending";
  const accentClass =
    roundStatus === "active"
      ? roundAccentActive
      : roundStatus === "completed"
        ? roundAccentCompleted
        : roundAccentPending;
  const topMinersList = React.useMemo(() => {
    const miners =
      minersData?.data?.miners && Array.isArray(minersData.data.miners)
        ? minersData.data.miners
        : [];
    if (!selectedValidator?.id) return miners.slice(0, 10);
    const filtered = miners.filter(
      (miner) => miner.validatorId === selectedValidator.id
    );
    return filtered.length > 0 ? filtered : [];
  }, [minersData, selectedValidator]);

  if (loading) {
    return (
      <WidgetCard
        title={<Skeleton className="h-6 w-32 bg-white/10" />}
        className={cn(
          tallCardClass,
          accentClass,
          "relative overflow-hidden h-[450px] md:h-[550px] xl:h-[650px] px-2 lg:px-4 w-full",
          className
        )}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[360px] md:h-[460px] xl:h-[560px] overflow-y-auto mt-3">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center w-full px-4 py-1.5">
                <Skeleton className="h-10 w-10 rounded-full me-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard
        title={`All Miners${selectedValidator?.name ? ` - ${selectedValidator.name}` : ""}`}
        className={cn(
          tallCardClass,
          accentClass,
          "relative overflow-hidden h-[450px] md:h-[550px] xl:h-[650px] px-2 lg:px-4 w-full",
          className
        )}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[360px] md:h-[460px] xl:h-[560px] overflow-y-auto mt-3 flex items-center justify-center">
          <div className="text-center text-red-400">
            <p className="text-lg font-semibold">Failed to load top miners</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (!topMinersList.length) {
    return (
      <WidgetCard
        title={`All Miners${selectedValidator?.name ? ` - ${selectedValidator.name}` : ""}`}
        className={cn(
          tallCardClass,
          accentClass,
          "relative overflow-hidden h-[450px] md:h-[550px] xl:h-[650px] px-2 lg:px-4 w-full",
          className
        )}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[360px] md:h-[460px] xl:h-[560px] overflow-y-auto mt-3 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <p className="text-lg font-semibold">No miners ranked yet</p>
            <p className="text-sm mt-2">
              {selectedValidator
                ? "Select another validator or check back once evaluations complete."
                : "No miner leaderboard data is available for this round."}
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={`All Miners${selectedValidator?.name ? ` - ${selectedValidator.name}` : ""}`}
      className={cn(
        tallCardClass,
        accentClass,
        "relative overflow-hidden h-[450px] md:h-[550px] xl:h-[650px] px-2 lg:px-4 w-full",
        className
      )}
      headerClassName="px-3 pb-2"
      titleClassName="text-white text-xl font-bold"
    >
      <div className="custom-scrollbar h-[360px] md:h-[460px] xl:h-[560px] overflow-y-auto mt-3">
        <div className="flex flex-col">
          {topMinersList.map((miner: any, index: number) => {
            const agentHref =
              typeof roundNumber === "number" && Number.isFinite(roundNumber)
                ? `${routes.agents}/${miner.uid}?round=${roundNumber}&agent=${miner.uid}`
                : `${routes.agents}/${miner.uid}`;
            const rank = index + 1;
            const rawIsSota =
              miner.isSota ??
              miner.is_sota ??
              miner.isBenchmark ??
              miner.is_benchmark ??
              (typeof miner.type === "string" &&
                miner.type.toLowerCase() === "benchmark");
            const isSota = Boolean(rawIsSota);
            const fallbackAvatar = resolveAssetUrl(
              `/miners/${Math.abs(miner.uid % 50)}.svg`
            );
            const avatarSrc = resolveAssetUrl(miner.imageUrl, fallbackAvatar);
            return (
              <Link
                key={`top-miner-${index}`}
                href={agentHref}
                title="Inspect Agent Run"
              >
                <div
                  className={cn(
                    "relative flex items-center w-full px-5 py-4 mb-3 rounded-2xl transition-all duration-300 cursor-pointer group border-2",
                    listRowHover,
                    rank === 1
                      ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10"
                      : "border-transparent"
                  )}
                >
                  {/* Subtle glow effect for top 3 on hover only */}
                  {rank <= 3 && (
                    <div
                      className={cn(
                        "absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 blur transition-opacity duration-500",
                        rank === 1
                          ? "from-amber-400 via-yellow-400 to-amber-500"
                          : rank === 2
                            ? "from-slate-300 via-slate-200 to-slate-400"
                            : "from-orange-400 via-amber-500 to-orange-600"
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "relative me-4 h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 transition-all duration-300 group-hover:scale-110 group-hover:ring-4 shadow-xl",
                      rank === 1
                        ? "ring-amber-400/60 group-hover:ring-amber-400/80"
                        : "ring-white/20 group-hover:ring-white/40"
                    )}
                  >
                    <Image
                      src={avatarSrc}
                      alt={miner.uid.toString()}
                      fill
                      sizes="(max-width: 768px) 100vw"
                      className="object-cover"
                    />
                    {rank === 1 && (
                      <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-white/50 shadow-lg">
                        <PiCrownFill className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <RizzText
                          className={cn(
                            "text-base font-black transition-all duration-300",
                            rank === 1
                              ? "text-amber-300 group-hover:text-amber-200"
                              : "text-white group-hover:scale-105"
                          )}
                        >
                          {miner.name && miner.name.trim()
                            ? miner.name
                            : `Miner ${miner.uid}`}
                        </RizzText>
                        {isSota && (
                          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white border-2 border-white/20 shadow-sm">
                            SOTA
                          </span>
                        )}
                        {rank === 1 && (
                          <div className="relative ms-1">
                            <PiCrownFill className="h-5 w-5 text-amber-400 animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-white/70">
                        <span className="uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                          UID {miner.uid}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <RizzText className="text-xs text-white/60 font-bold uppercase tracking-wider">
                          Score
                        </RizzText>
                        <div
                          className={cn(
                            "text-xl font-black transition-all duration-300 group-hover:scale-110",
                            index === 0 ? "text-amber-300" : "text-cyan-300"
                          )}
                        >
                          {(miner.score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-white transition-all duration-300 group-hover:translate-x-1">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

export default function Round() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { openModal } = useModal();
  const { data: round, error, refetch } = useRoundBasic(roundKey);

  const handleOpenGlossary = () =>
    openModal({ view: <RoundsGlossaryModal />, size: "lg", customSize: 1400 });

  // Selection state for validator-driven panels
  const [selectedValidator, setSelectedValidator] =
    React.useState<ValidatorPerformance | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedValidatorId = searchParams?.get("validator") ?? null;

  // Top/context labels
  const roundNumberFromData =
    typeof round?.roundNumber === "number"
      ? round.roundNumber
      : typeof round?.round === "number"
        ? round.round
        : typeof round?.id === "number"
          ? round.id
          : undefined;
  const roundNumberFromKey = React.useMemo(
    () => extractRoundNumber(roundKey),
    [roundKey]
  );
  const roundNumberForLinks = roundNumberFromData ?? roundNumberFromKey;
  const roundLabel = roundNumberForLinks ?? roundKey;

  // Fetch data once at top level to avoid duplicate calls
  // Load all miners data (used by chart, list, and stats)
  const { data: allMinersData, loading: minersLoading } = useRoundMiners(
    roundKey,
    {
      limit: 100,
      sortBy: "score",
      sortOrder: "desc",
      minScore: 0,
    }
  );
  const topMiners = React.useMemo(() => {
    const miners = allMinersData?.data?.miners ?? [];
    return Array.isArray(miners) ? miners.slice(0, 10) : [];
  }, [allMinersData]);

  const { data: statistics, loading: statsLoading } =
    useRoundStatistics(roundKey);

  // Determine if round is waiting for consensus
  const validatorRounds = round?.validatorRounds ?? [];
  const isWaitingForConsensus =
    round?.status === "evaluating_finished" ||
    (validatorRounds.some((vr) => {
      if (vr.status === "evaluating_finished") return true;
      const agentRuns = vr.agentEvaluationRuns ?? [];
      return agentRuns.some((run) => {
        const evalResults =
          run.evaluation_results ?? run.evaluationResults ?? [];
        return (
          evalResults.length > 0 &&
          evalResults.length >= (run.total_tasks ?? run.totalTasks ?? 0)
        );
      });
    }) &&
      round?.status === "active");

  const aggregatedTopMiner: MinerPerformance | null = React.useMemo(() => {
    if (!Array.isArray(topMiners) || topMiners.length === 0) return null;
    return topMiners[0] ?? null;
  }, [topMiners]);

  const winnerLabel = selectedValidator?.topMiner
    ? selectedValidator.topMiner.name?.trim() ||
      `Miner ${selectedValidator.topMiner.uid ?? "unknown"}`
    : aggregatedTopMiner
      ? aggregatedTopMiner.name?.trim() ||
        `Miner ${aggregatedTopMiner.uid ?? "unknown"}`
      : "No winner yet";
  const winnerUidVal =
    selectedValidator?.topMiner?.uid ?? aggregatedTopMiner?.uid;

  const formatNumber = (value: number | undefined | null, digits = 0) =>
    value === undefined || value === null || Number.isNaN(value)
      ? "0"
      : Number(value).toLocaleString(undefined, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });

  const selectedValidatorCards = selectedValidator
    ? [
        {
          key: "winner",
          title: "Validator Winner",
          value: winnerLabel,
          uid: winnerUidVal,
          hotkey: selectedValidator?.topMiner?.hotkey,
          imageUrl:
            selectedValidator?.topMiner?.imageUrl ??
            aggregatedTopMiner?.imageUrl,
          helper:
            winnerUidVal != null
              ? `UID ${winnerUidVal}`
              : selectedValidator.name
                ? `${selectedValidator.name} latest champion`
                : "Champion for this validator",
          icon: PiCrownDuotone,
          gradient: "from-amber-500/30 via-yellow-500/25 to-orange-500/30",
          bgGradient: "from-amber-500/20 via-yellow-500/15 to-orange-500/10",
          iconGradient: "from-amber-400 to-orange-500",
          borderColor: "border-amber-400/50",
          glowColor: "rgba(251,191,36,0.5)",
          valueClass: "text-base md:text-2xl",
        },
        {
          key: "score",
          title: "Top Score",
          value: `${formatNumber((selectedValidator.topScore ?? selectedValidator.averageScore ?? 0) * 100, 1)}%`,
          helper: "Best run recorded by this validator",
          icon: PiTrophyDuotone,
          gradient: "from-emerald-500/30 via-teal-500/25 to-cyan-500/30",
          bgGradient: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
          iconGradient: "from-emerald-400 to-teal-500",
          borderColor: "border-emerald-400/50",
          glowColor: "rgba(16,185,129,0.5)",
          valueClass: "text-lg md:text-4xl",
        },
        {
          key: "miners",
          title: "Miners Participated",
          value: formatNumber(selectedValidator.totalMiners ?? 0),
          helper: "Unique miners assessed this round",
          icon: PiUsersThreeDuotone,
          gradient: "from-violet-500/30 via-purple-500/25 to-fuchsia-500/30",
          bgGradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/10",
          iconGradient: "from-violet-400 to-fuchsia-500",
          borderColor: "border-violet-400/50",
          glowColor: "rgba(139,92,246,0.5)",
          valueClass: "text-lg md:text-4xl",
        },
        {
          key: "tasks",
          title: "Tasks",
          value: formatNumber(selectedValidator.totalTasks ?? 0),
          helper: "Total tasks executed by this validator",
          icon: PiListChecksDuotone,
          gradient: "from-blue-500/30 via-indigo-500/25 to-sky-500/30",
          bgGradient: "from-blue-500/20 via-indigo-500/15 to-sky-500/10",
          iconGradient: "from-blue-400 to-indigo-500",
          borderColor: "border-blue-400/50",
          glowColor: "rgba(59,130,246,0.5)",
          valueClass: "text-lg md:text-4xl",
        },
      ]
    : [];

  const handleValidatorSelect = React.useCallback(
    (validator: ValidatorPerformance) => {
      setSelectedValidator((prev) =>
        prev?.id === validator.id ? prev : validator
      );
      if (!pathname) return;
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if ((requestedValidatorId ?? params.get("validator")) === validator.id)
        return;
      params.set("validator", validator.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, requestedValidatorId]
  );

  // Determine if round data is not yet available (statistics already loaded above)
  // Only show "no data" message for current/active rounds that truly have no data
  const isCurrentRound = round?.current === true || round?.status === "active";
  const hasNoData =
    isCurrentRound && !statistics?.totalMiners && !statistics?.totalTasks;
  const isRoundStarting = round?.status === "pending";

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-24">
      <PageHeader title={""} className="mt-4" />

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 mb-6 text-rose-200">
          <p className="text-sm">⚠️ Failed to load round data: {error}</p>
        </div>
      )}

      {/* Show "Data Not Available" message if round is starting or has no data */}
      {!error && (isRoundStarting || hasNoData) ? (
        <div className="mt-10 mb-10">
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-50"></div>
            <div className="relative px-8 py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-2xl">
                <PiInfoDuotone className="h-10 w-10 text-amber-300" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white tracking-wide">
                Round Data Not Available Yet
              </h3>
              <p className="mb-2 text-base text-white/70 font-medium max-w-2xl mx-auto">
                This round is currently being processed by validators. Data will
                appear here shortly once evaluations are complete.
              </p>
              <p className="text-sm text-white/50 font-semibold">
                Please check back in a few minutes or navigate to a different
                round.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  onClick={refetch}
                  className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl hover:!scale-105 !transition-all !duration-300"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => router.push(routes.rounds)}
                  className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl hover:!scale-105 !transition-all !duration-300"
                >
                  View All Rounds
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : !error ? (
        <>
      {/* Header */}
          <RoundHeaderInline round={round} roundLoading={false} />

      {/* Recents removed: using Prev/Next navigation in header */}

      {/* Round Progress removed: already shown in main header card */}

      {/* Aggregated Metrics */}
      <div className="mt-10 mb-6">
            {statsLoading || minersLoading ? (
              <div className="flex items-center gap-4 mb-5">
                <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2 bg-white/10" />
                  <Skeleton className="h-3 w-64 bg-white/10" />
                </div>
              </div>
            ) : (
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg ring-2 ring-emerald-400/20">
            <PiCheckCircleDuotone className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <Text className="text-base font-black text-white uppercase tracking-wider">
              Aggregated Metrics
            </Text>
            <Text className="text-xs text-white/60 font-semibold">
                    {isWaitingForConsensus
                      ? "⚠️ Provisional metrics - Waiting for validator consensus"
                      : "Comprehensive stats across all validators"}
            </Text>
          </div>
        </div>
            )}
            <RoundStatsInline
              selectedValidator={selectedValidator}
              statistics={statistics}
              topMiners={topMiners}
              loading={statsLoading || minersLoading}
            />
      </div>

      {/* Validators selector */}
      <div className="mt-10 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 shadow-lg ring-2 ring-sky-400/20">
            <PiUsersThreeDuotone className="w-6 h-6 text-sky-300" />
          </div>
          <div className="flex-1">
            <Text className="text-base font-black text-white uppercase tracking-wider">
              Multiple Validators
            </Text>
            <Text className="text-xs text-white/60 font-semibold">
              Select a validator to view detailed performance metrics
            </Text>
          </div>
        </div>
      </div>

      <RoundValidatorsInline
        onValidatorSelect={handleValidatorSelect}
        selectedValidatorId={selectedValidator?.id ?? null}
        requestedValidatorId={requestedValidatorId}
      />

      {/* Selected validator metric cards */}
      {minersLoading || !selectedValidator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={cn("h-36", skeletonCard)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {selectedValidatorCards.map((card) => (
            <MetricCard key={(card as any).key} card={card} />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScoresInline
          className="w-full xl:w-[calc(100%-400px)]"
          selectedValidator={selectedValidator}
              roundInfo={round}
              minersData={allMinersData}
              loading={minersLoading}
              error={undefined}
        />
        <RoundTopMinersInline
          className="w-full xl:w-[400px]"
          selectedValidator={selectedValidator}
          roundNumber={roundNumberForLinks}
              roundInfo={round}
              minersData={allMinersData}
              loading={minersLoading}
              error={undefined}
        />
      </div>

      {/* Floating Glossary Button */}
      <button
        type="button"
        onClick={handleOpenGlossary}
        className="fixed bottom-8 left-8 z-40 group inline-flex items-center gap-3 rounded-2xl border-2 border-white/30 bg-gradient-to-br from-white/15 to-white/5 px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-emerald-400/60 hover:from-emerald-500/20 hover:to-teal-500/20 hover:shadow-[0_20px_60px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95"
      >
        <div className="relative">
          <LuInfo className="h-5 w-5 text-emerald-300 transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute inset-0 h-5 w-5 text-emerald-300 animate-ping opacity-0 group-hover:opacity-75">
            <LuInfo className="h-5 w-5" />
          </div>
        </div>
        <span className="uppercase tracking-wider">Glossary</span>
      </button>
        </>
      ) : null}
    </div>
  );
}

// RoundProgressInline removed — progress shown in main card header
/* function RoundProgressInline() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { data: progressData, loading: progressLoading, error: progressError } = useRoundProgress(roundKey);
  const { data: roundData, loading: roundLoading, error: roundError } = useRound(roundKey);

  const round = roundData as any;
  const progress = progressData as any;
  const loading = progressLoading || roundLoading;
  const isTinyScreen = useMedia("(max-width: 639px)", false);
  const isSmallScreen = useMedia("(min-width: 640px) and (max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const cellCount = isTinyScreen ? 30 : isSmallScreen ? 50 : isMediumScreen ? 75 : 100;

  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  React.useEffect(() => {
    if (!round) return;
    const calculateTimeLeft = () => {
      if (progress?.estimatedTimeRemaining) {
        setTimeLeft(progress.estimatedTimeRemaining);
        return;
      }
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [round, progress?.estimatedTimeRemaining]);

  const currentBlock = progress?.currentBlock || 0;
  const percentage = progress?.progress || 0;
  const cells = React.useMemo(() => Array.from({ length: cellCount }, (_, index) => ({ isPassed: index < percentage * cellCount })), [cellCount, percentage]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 ">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="w-full flex items-center justify-between mb-4">
          {Array.from({ length: cellCount }, (_, index) => (
            <Skeleton key={index} className="w-[6px] h-10 rounded-full" />
          ))}
        </div>
        <div className="w-full flex items-center justify-between">
          <div></div>
          <div className="w-full flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (progressError || roundError) {
    return (
      <div className="w-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl mt-4 px-7 py-5 ">
        <div className="text-center text-red-200">
          <p className="text-lg font-semibold">Progress data unavailable</p>
          <p className="text-sm mt-2">Failed to load round data</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-500/10 via-gray-500/10 to-gray-500/10 border-2 border-gray-500/30 rounded-2xl mt-4 px-7 py-5 ">
        <div className="text-center text-gray-300">
          <p className="text-lg font-semibold">Round not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5  hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-white">Round Progress</div>
        <div className="flex items-center text-md text-white font-semibold">
          <span>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
            {timeLeft.seconds}s
          </span>
        </div>
      </div>
      <div className="w-full flex items-center justify-between mb-4">
        {cells.map((cell, index) => (
          <span key={index} className={cn("w-[6px] h-10 rounded-full transition-all duration-300 hover:scale-110", cell.isPassed ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30" : "bg-white/20 hover:bg-white/30")} />
        ))}
      </div>
      <div className="w-full flex items-center justify-between">
        <div></div>
        <div className="w-full flex items-center justify-between text-white">
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Epoch Start: </span>
            <span className="ms-1">{round.startBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Current Block: </span>
            <span className="ms-1">{currentBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Epoch End: </span>
            <span className="ms-1">{round.endBlock}</span>
          </div>
        </div>
      </div>
    </div>
  );
} */
