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
import { Button, Select, Text } from "rizzui";
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
  PiCloudArrowUpDuotone,
  PiCloudArrowDownDuotone,
  PiCirclesThreeDuotone,
  PiChartLineUpDuotone,
  PiChartLineDownDuotone,
  PiGithubLogoDuotone,
  PiXBold,
  PiArrowSquareOutDuotone,
} from "react-icons/pi";

// Services & helpers
import { routes } from "@/config/routes";
import { resolveAssetUrl } from "@/services/utils/assets";
import {
  useRoundStatusView,
  useRoundSeasonSummaryView,
  useRoundValidatorsView,
  useAvailableRoundSeasons,
} from "@/services/hooks/useRounds";
import type {
  ValidatorPerformance,
  BenchmarkPerformance,
  PostConsensusSummary,
  MinerPerformance,
} from "@/repositories/rounds/rounds.types";

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
  const roundPattern = /round[-_]?(\d+)/;
  const roundPatternMatch = roundPattern.exec(normalized);
  if (roundPatternMatch?.[1]) {
    const parsed = Number.parseInt(roundPatternMatch[1], 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  const digitMatches = normalized.match(/\d+/g);
  if (digitMatches && digitMatches.length > 0) {
    const lastSegment = digitMatches.at(-1) ?? "";
    const parsed = Number.parseInt(lastSegment, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

// ============================================================================
// STYLE CONSTANTS - Unified dark palette
// ============================================================================
const roundGlassBackgroundClass =
  "relative overflow-hidden border border-white/10 dark:bg-gray-50/50 shadow-lg";
const roundAccentActive =
  "border-emerald-400/30 dark:bg-gray-50/50 shadow-lg";
const roundAccentCompleted =
  "border-white/10 dark:bg-gray-50/50 shadow-lg";
const roundAccentPending =
  "border-amber-400/20 dark:bg-gray-50/50 shadow-lg";
const roundSectionHeaderClass = `${roundGlassBackgroundClass} rounded-2xl px-8 py-4 text-white flex items-center gap-4 transition-all duration-300`;
const chipBase =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200";
const chipActive =
  "border-emerald-400/40 bg-emerald-500/20 text-emerald-200";
const BURN_UID = 5;
const chipCompleted =
  "border-white/20 bg-white/10 text-white";
const chipPending =
  "border-amber-400/30 bg-amber-500/15 text-amber-200";
const chipEvaluating =
  "border-amber-400/30 bg-amber-500/15 text-amber-200";
const roundNavButton =
  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-all duration-200 border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/[0.02] disabled:text-white/30";
const metricCardClass = `${roundGlassBackgroundClass} group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5`;
const tallCardClass = `${roundGlassBackgroundClass} rounded-2xl transition-all duration-200`;
const listRowHover =
  "hover:bg-white/[0.06] rounded-xl transition-all duration-200";
const listRowHighlight = "";
const skeletonCard =
  "rounded-2xl border border-white/10 bg-white/5 animate-pulse";

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
} from "recharts";

// Local helpers
const normalizeScore = (value?: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");

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

  const bestReward = minerData?.best_reward ?? minerData?.reward ?? minerData?.best_local_reward ?? 0;
  const localReward =
    minerData?.local_reward ?? minerData?.local_avg_reward ?? null;
  const hasLocalRun = localReward !== null && localReward !== undefined;
  const evalScore =
    (hasLocalRun
      ? minerData?.local_eval_score ?? minerData?.local_avg_eval_score
      : minerData?.eval_score ?? minerData?.best_local_eval_score ?? minerData?.local_avg_eval_score) ?? 0;
  const evalTime =
    (hasLocalRun
      ? minerData?.local_eval_time ?? minerData?.local_avg_eval_time
      : minerData?.eval_time ?? minerData?.best_local_eval_time ?? minerData?.local_avg_eval_time ?? minerData?.avgTime) ?? null;
  const avgCost =
    (hasLocalRun
      ? minerData?.local_avg_cost ?? minerData?.local_avg_eval_cost
      : minerData?.avg_cost ?? minerData?.best_local_eval_cost ?? minerData?.local_avg_eval_cost) ?? null;
  const resolvedAvgCost = avgCost == null ? null : Number(avgCost);

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
        {[
          {
            label: "Score",
            color: "#8B5CF6",
            value: `${(truncateDecimal(evalScore, 4) * 100).toFixed(2)}%`,
            divider: false,
          },
          {
            label: "Time",
            color: "#06B6D4",
            value:
              evalTime != null && Number.isFinite(Number(evalTime))
                ? `${Number(evalTime).toFixed(2)}s`
                : "—",
            divider: false,
          },
          {
            label: "Avg cost",
            color: "#F97316",
            value:
              resolvedAvgCost != null && Number.isFinite(resolvedAvgCost)
                ? `$${resolvedAvgCost.toFixed(3)}`
                : "—",
            divider: false,
          },
          {
            label: "Local reward",
            color: "#22C55E",
            value: `${(truncateDecimal(hasLocalRun ? Number(localReward) : 0, 4) * 100).toFixed(2)}%`,
            divider: true,
          },
          {
            label: "Best reward",
            color: "#3B82F6",
            value: `${(truncateDecimal(bestReward, 4) * 100).toFixed(2)}%`,
            divider: false,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "chart-tooltip-item flex items-center justify-between gap-4",
              item.divider && "pt-1 border-t border-white/10"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full shadow-lg ring-2 ring-white/20"
                style={{ backgroundColor: item.color }}
              />
              <Text
                as="span"
                className="capitalize text-white/90 font-semibold"
              >
                {item.label}:
              </Text>
            </div>
            <Text as="span" className="font-black text-white text-base">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

const VALIDATOR_IMAGE_MAP: Record<string, string> = {
  autoppia: "/validators/Autoppia.png",
  roundtable: "/validators/roundtable.jpg",
  rt21: "/validators/roundtable.jpg",
  kraken: "/validators/Kraken.png",
  yuma: "/validators/Yuma.png",
  tao5: "/validators/tao5.png",
  rizzo: "/validators/rizzo.png",
};

function resolveValidatorImage(name?: string | null, providedImage?: string | null): string {
  const defaultImage = "/validators/Other.png";
  if (!name) return resolveAssetUrl(providedImage, defaultImage);
  const key = name.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  for (const [pattern, img] of Object.entries(VALIDATOR_IMAGE_MAP)) {
    if (key.includes(pattern)) {
      return resolveAssetUrl(providedImage, img);
    }
  }
  return resolveAssetUrl(providedImage, defaultImage);
}

function RoundHeaderInline({
  round,
  roundLoading,
  progressData,
  progressLoading,
}: Readonly<{
  round?: Record<string, unknown>;
  roundLoading?: boolean;
  progressData?: Record<string, unknown> | null;
  progressLoading?: boolean;
}>) {
  const progress = progressData as { previousRound?: string | number; nextRound?: string | number; season_number?: number } | null | undefined;
  const roundObj = round as { season_number?: number } | undefined;
  const progressTyped = progressData as { currentBlock?: number; blocksRemaining?: number; status?: string } | null | undefined;
  const roundTyped = round as { currentBlock?: number; status?: string; validatorRounds?: unknown[]; roundInSeason?: number; season?: number } | undefined;
  const params = useParams();
  const router = useRouter();
  const seasonParam = params.season as string | undefined;
  const roundParam = params.round as string | undefined;
  const roundKey = seasonParam && roundParam ? `${seasonParam}/${roundParam}` : undefined;
  const roundNumber = roundParam ? Number.parseInt(String(roundParam), 10) : undefined;
  const {
    data: availableSeasons,
    loading: seasonsLoading,
  } = useAvailableRoundSeasons();

  const isLoading = roundLoading || progressLoading;

  // ✅ Obtener neighborRounds desde progressData (roundKey = season/round para coincidir con ruta [season]/[round])
  // El backend puede devolver previousRound/nextRound como "83/19" (string) o como 19 (número)
  const neighborRounds = React.useMemo(() => {
    const previousRound = progress?.previousRound;
    const nextRound = progress?.nextRound;
    const season = seasonParam ?? roundObj?.season_number;
    const buildKey = (r: number) => (season != null ? `${season}/${r}` : null);
    const toRoundKey = (val: string | number | null | undefined): string | null => {
      if (val == null) return null;
      if (typeof val === "string" && val.includes("/")) return val; // Ya viene "season/round"
      const r = typeof val === "number" ? val : Number(val);
      return Number.isFinite(r) ? buildKey(r) : null;
    };
    const extractRoundNum = (val: string | number | null | undefined): number | undefined => {
      if (val == null) return undefined;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      if (typeof val === "string" && val.includes("/")) {
        const n = Number.parseInt(val.split("/")[1], 10);
        return Number.isFinite(n) ? n : undefined;
      }
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    };
    const prevKey = toRoundKey(previousRound);
    const nextKeyVal = toRoundKey(nextRound);
    return {
      previous: prevKey != null ? { roundNumber: extractRoundNum(previousRound), roundKey: prevKey } : null,
      next: nextKeyVal != null ? { roundNumber: extractRoundNum(nextRound), roundKey: nextKeyVal } : null,
    };
  }, [progressData, progress, seasonParam, round, roundObj?.season_number]);

  const goToRound = React.useCallback(
    (targetKey?: string) => {
      if (!targetKey || targetKey === roundKey) return;
      // targetKey es "season/round" (ej. 83/19) - sin encodeURIComponent para mantener / como separador de ruta
      router.push(`${routes.rounds}/${targetKey}`);
    },
    [router, roundKey]
  );

  const goToSeason = React.useCallback(
    (targetSeason: number) => {
      if (!Number.isFinite(targetSeason) || targetSeason <= 0) return;
      const targetKey = `${targetSeason}/1`;
      if (targetKey === roundKey) return;
      router.push(`${routes.rounds}/${targetKey}`);
    },
    [router, roundKey]
  );

  const seasonOptions = React.useMemo(
    () =>
      (availableSeasons ?? []).map((season) => ({
        label: `Season ${season}`,
        value: String(season),
      })),
    [availableSeasons]
  );

  const startBlock = progressData?.startBlock ?? round?.startBlock ?? 0;
  const endBlock = progressData?.endBlock ?? round?.endBlock ?? 0;
  const currentBlock =
    progressTyped?.currentBlock ?? roundTyped?.currentBlock ?? startBlock;
  const blocksRemaining =
    progressTyped?.blocksRemaining ??
    (typeof endBlock === "number" && typeof currentBlock === "number"
      ? Math.max(endBlock - currentBlock, 0)
      : undefined);

  // Convert blocks → human-readable time (1 block ≈ 12 s on Bittensor)
  const timeRemainingStr = React.useMemo(() => {
    if (typeof blocksRemaining !== "number" || Number.isNaN(blocksRemaining)) {
      return null;
    }
    if (blocksRemaining <= 0) return null;
    const totalSec = blocksRemaining * 12;
    if (totalSec < 60) return `~${Math.round(totalSec)}s`;
    if (totalSec < 3600) return `~${Math.round(totalSec / 60)}m`;
    const h = Math.floor(totalSec / 3600);
    const m = Math.round((totalSec % 3600) / 60);
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
  }, [blocksRemaining]);

  // ✅ Usar status desde progressData
  const backendStatus = progressTyped?.status ?? roundTyped?.status;

  // Check if validator rounds have evaluation results (tasks evaluated)
  const validatorRounds: unknown[] = Array.isArray(roundTyped?.validatorRounds) ? roundTyped.validatorRounds : [];
  const hasEvaluationsComplete = validatorRounds.some((vr: unknown) => {
    const v = vr as Record<string, unknown>;
    // Check if this validator has finished evaluating
    if (v.status === "evaluating_finished" || v.status === "finished") {
      return true;
    }
    // Check if there are agent runs with evaluation results
    const agentRuns = (v.agentEvaluationRuns ?? []) as Array<Record<string, unknown>>;
    return agentRuns.some((run: Record<string, unknown>) => {
      const evalResults = (run.evaluation_results ?? run.evaluationResults ?? []) as unknown[];
      const total = Number(run.total_tasks ?? run.totalTasks ?? 0);
      return evalResults.length > 0 && evalResults.length >= total;
    });
  });

  // ✅ Status ya viene de progressData
  type RoundStatusDisplay = "active" | "completed" | "pending";
  let status: RoundStatusDisplay;
  let statusLabel: string;

  if (backendStatus === "pending") {
    status = "pending";
    statusLabel = "Pending";
  } else if (backendStatus === "evaluating_finished" || (backendStatus === "active" && hasEvaluationsComplete)) {
    status = "active";
    statusLabel = "Waiting for Consensus";
  } else if (backendStatus === "active" || round?.current) {
    status = "active";
    statusLabel = "Running";
  } else {
    // finished, or no backend status and round not current
    status = "completed";
    statusLabel = "Finished";
  }

  const isActive = status === "active" || round?.current === true;

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

  // ✅ Obtener keys desde neighborRounds (ya incluyen roundKey)
  const previousKey = neighborRounds.previous?.roundKey;
  const nextKey = neighborRounds.next?.roundKey;
  const previousNumber = neighborRounds.previous?.roundNumber;
  const nextNumber = neighborRounds.next?.roundNumber;
  const currentRoundKey = roundKey;

  if (isLoading) {
    return (
      <section className="mb-6">
        <div className="relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl rounded-3xl px-4 py-4 sm:p-6 text-white">
          <div className="relative space-y-6">
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
    <section className="mb-6">
      <div
        className={cn(
          roundGlassBackgroundClass,
          "rounded-3xl px-4 py-4 sm:p-6 text-white shadow-2xl relative",
          isActive
            ? roundAccentActive
            : status === "completed"
              ? roundAccentCompleted
              : status === "pending"
                ? roundAccentPending
                : undefined
        )}
      >
        <div className="relative space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black leading-none md:text-4xl text-white">
                  ROUND {String(roundTyped?.roundInSeason ?? roundParam ?? (progressData as { roundInSeason?: number })?.roundInSeason ?? roundNumber ?? "—")}
                </h1>
                <span
                  className={cn(
                    chipBase,
                    "border-blue-400/70 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)] hover:scale-105"
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-white shadow-lg" />
                  Season {String(roundTyped?.season ?? seasonParam ?? (progressData as { season?: number })?.season ?? "—")}
                </span>
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
                    {timeRemainingStr
                      ? `${timeRemainingStr} remaining`
                      : isActive
                        ? "Waiting for updated timing"
                        : "Round finished"}
                  </span>
                </div>
                {typeof blocksRemaining === "number" &&
                  !Number.isNaN(blocksRemaining) &&
                  blocksRemaining > 0 && (
                    <div className="flex items-center gap-2">
                      <PiPulseDuotone className="h-5 w-5 text-sky-300" />
                      <span>
                        {blocksRemaining.toLocaleString()} blocks
                      </span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {/* Wrapper overrides --muted so the focused option gets a violet
                    highlight instead of the default gray (bg-muted/70) */}
                <div style={{ "--muted": "139 92 246" } as React.CSSProperties}>
                  <Select
                    options={seasonOptions}
                    value={seasonOptions.find(
                      (option) =>
                        option.value ===
                        String(round?.season ?? seasonParam ?? progressData?.season ?? "")
                    ) ?? null}
                    onChange={(option: { label: string; value: string }) =>
                      goToSeason(Number.parseInt(option.value, 10))
                    }
                    disabled={seasonsLoading || !seasonOptions.length}
                    className="inline-flex items-center h-[42px] min-w-[132px] rounded-xl border-2 border-white/20 bg-white/[0.08] text-sm font-bold transition-all duration-300 hover:bg-white/[0.14] hover:border-white/30 hover:scale-105 active:scale-95 !px-0 !py-0"
                    selectClassName="!h-[42px] !rounded-xl !border-0 !ring-0 !outline-none !bg-transparent !px-4 !py-0 !text-sm !font-bold !text-white !shadow-none focus:!border-0 focus:!ring-0 hover:!border-0 hover:!ring-0"
                    dropdownClassName="!rounded-xl !border-2 !border-white/20 !bg-slate-950/95 !shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)]"
                  />
                </div>
                {/* Previous round (lower number) on the left */}
                <button
                  type="button"
                  onClick={() => goToRound(previousKey)}
                  disabled={!previousKey}
                  className={cn(roundNavButton, "h-[42px] whitespace-nowrap")}
                >
                  <PiCaretLeftBold className="h-4 w-4 shrink-0" />
                  <span>{previousNumber ? `Round ${previousNumber}` : "Prev"}</span>
                </button>
                {/* Next round (higher number) on the right */}
                {nextKey && (
                  <button
                    type="button"
                    onClick={() => goToRound(nextKey)}
                    className={cn(roundNavButton, "h-[42px] whitespace-nowrap")}
                  >
                    <span>{nextNumber ? `Round ${nextNumber}` : "Next"}</span>
                    <PiCaretRightBold className="h-4 w-4 shrink-0" />
                  </button>
                )}
              </div>
              {currentRoundKey && currentRoundKey !== roundKey && (
                <Link
                  href={`${routes.rounds}/${currentRoundKey}`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-500/15 hover:border-emerald-400/40 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Current (Round {roundNumber ?? "—"})
                </Link>
              )}
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between gap-2 text-sm min-w-0">
                <span className="font-bold text-white/80 uppercase tracking-wider truncate">
                  Round Progress
                </span>
                <span className="font-black text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent shrink-0">
                  {progressPercentage}%
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10 border border-white/20 shadow-inner">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out shadow-lg",
                    isActive &&
                      "bg-emerald-500 shadow-emerald-500/50",
                    status === "completed" &&
                      "bg-emerald-500 shadow-emerald-500/50",
                    status === "pending" &&
                      "bg-amber-500/50 shadow-amber-500/30"
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-3 border-white transition-[left] duration-700 ease-out ring-4 ring-white/20",
                    isActive &&
                      "bg-emerald-400 shadow-[0_0_25px_rgba(110,231,183,0.6)]",
                    status === "completed" &&
                      "bg-emerald-400 shadow-[0_0_25px_rgba(110,231,183,0.6)]",
                    status === "pending" &&
                      "bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                  )}
                  style={{ left: `calc(${progressPercentage}% - 10px)` }}
                />
              </div>
              <div className="grid gap-5 text-sm text-white/70 sm:grid-cols-3 min-w-0">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 dark:bg-gray-50/50 px-5 py-4 hover:border-white/20 hover:shadow-lg transition-all duration-300 min-w-0">
                  <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/20 shrink-0">
                    <PiClockDuotone className="h-7 w-7 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
                      Start Block
                    </span>
                    <div className="text-lg font-black text-white mt-0.5 break-all">
                      {startBlock.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 dark:bg-gray-50/50 px-5 py-4 hover:border-white/20 hover:shadow-lg transition-all duration-300 min-w-0">
                  <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/20 shrink-0">
                    <PiPulseDuotone className="h-7 w-7 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
                      Current Block
                    </span>
                    <div className="text-lg font-black text-white mt-0.5 break-all">
                      {currentBlock.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 dark:bg-gray-50/50 px-5 py-4 hover:border-white/20 hover:shadow-lg transition-all duration-300 min-w-0">
                  <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/20 shrink-0">
                    <PiFlagCheckeredDuotone className="h-7 w-7 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
                      End Block
                    </span>
                    <div className="text-lg font-black text-white mt-0.5 break-all">
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

// ✅ Función para truncar decimales sin redondear (disponible para todos los componentes)
const truncateDecimal = (value: number, decimals: number = 4): number => {
  if (value === undefined || value === null || Number.isNaN(value)) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.floor(value * multiplier) / multiplier;
};

const formatRewardPercent = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${(Number(value) * 100).toFixed(2)}%`;
};

function RoundStatsInline({
  selectedValidator,
  statistics,
  topMiners,
  postConsensusSummary,
  loading,
  error,
  seasonParam,
  roundParam,
}: Readonly<{
  selectedValidator?: ValidatorPerformance | null;
  statistics?: any;
  topMiners?: any[];
  postConsensusSummary?: PostConsensusSummary | null;
  loading?: boolean;
  error?: string;
  seasonParam?: string | number;
  roundParam?: number;
}>) {
  // Use post_consensus_json if available.
  const winner = postConsensusSummary?.winner;
  const winnerAverageReward = winner?.avg_reward ?? statistics?.winnerAverageReward ?? statistics?.averageReward ?? 0;
  const averageEvalTime = winner?.avg_eval_time ?? 0;
  const averageEvalCost = winner?.avg_eval_cost ?? null;
  const winnerUid = winner?.uid ?? statistics?.winnerMinerUid ?? null;
  const [hotkeyCopied, setHotkeyCopied] = React.useState(false);

  // Aggregated winner should NOT change when validator is selected
  // It always shows the overall round winner
  const topMiner = React.useMemo(() => {
    // Prioritize winner from post_consensus_json.
    if (winner) {
      return {
        uid: winner.uid,
        name: winner.name,
        hotkey: winner.hotkey,
        imageUrl: winner.image,
        githubUrl: winner.github_url ?? null,
      };
    }
    if (!Array.isArray(topMiners) || topMiners.length === 0) return undefined;
    if (winnerUid !== null) {
      const winnerEntry = topMiners.find((miner) => miner.uid === winnerUid);
      if (winnerEntry) return winnerEntry;
    }
    return topMiners[0];
  }, [winner, topMiners, winnerUid]);

  if (loading || (!postConsensusSummary && !statistics) || (!topMiner && (!topMiners || topMiners.length === 0))) {
    return (
      <div className="overflow-hidden rounded-2xl border border-amber-400/15 bg-gradient-to-br from-[#1a1510] via-[#161412] to-[#111110] shadow-xl mb-4">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col gap-4 px-7 py-6 md:w-[42%] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06]">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-2xl bg-white/10 flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-36 bg-white/10" />
                <Skeleton className="h-4 w-20 rounded-full bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-7 w-full rounded-xl bg-white/10" />
          </div>
          <div className="flex flex-1 divide-x divide-white/[0.06]">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-6">
                <Skeleton className="h-3 w-14 bg-white/10" />
                <Skeleton className="h-8 w-20 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mb-4">
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <p className="text-red-400 text-sm">⚠️ Failed to load round statistics: {error}</p>
        </div>
      </div>
    );
  }

  const formatNumber = (value: number | undefined | null, digits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "0";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  // Use winner (postConsensusSummary) as primary source; fall back to topMiner from validators
  const displayUid: number | null = winner?.uid ?? topMiner?.uid ?? null;
  const displayName: string = winner?.name?.trim() || topMiner?.name?.trim() || (displayUid != null ? `Miner ${displayUid}` : "—");
  const displayHotkey: string | null = winner?.hotkey ?? topMiner?.hotkey ?? null;
  const displayGithub: string | null = winner?.github_url ?? topMiner?.githubUrl ?? null;
  const displayImage: string | null = winner?.image ?? topMiner?.imageUrl ?? null;

  const fallbackAvatarIndex = displayUid != null ? Math.abs(displayUid % 50) : 0;
  const fallbackAvatar = resolveAssetUrl(`/miners/${fallbackAvatarIndex}.svg`);
  const winnerAvatar = resolveAssetUrl(displayImage, fallbackAvatar);
  const rewardPct = formatRewardPercent(winnerAverageReward);
  const costStr = averageEvalCost != null
    ? `$${Number(averageEvalCost).toFixed(4)}`
    : "—";

  const agentHref = (() => {
    if (displayUid == null) return null;
    const params = new URLSearchParams();
    if (seasonParam != null) params.set("season", String(seasonParam));
    const qs = params.toString();
    const query = qs ? `?${qs}` : "";
    return `${routes.agents}/${displayUid}${query}`;
  })();

  const cardContent = (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-400/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-orange-400/6 blur-2xl" />

      {/* Card border + bg */}
      <div className="relative border border-amber-400/20 rounded-2xl bg-gradient-to-br from-[#1c1710] via-[#161412] to-[#111110] overflow-hidden">
        {/* Top accent line */}
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="flex flex-col md:flex-row gap-0">

          {/* ——— LEFT: Season leader identity (wider, more prominent) ——— */}
          <div className="relative flex flex-col gap-3 px-5 py-5 md:w-[42%] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06]">
            {/* Subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-l-2xl" />

            {/* Top row: label + round badge + link icon */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <PiCrownFill className="h-3 w-3 text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-400/70">Season leader</span>
              </div>
              <div className="flex items-center gap-1.5">
                {roundParam != null && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/25 border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 rounded-full">
                    Round {roundParam}
                  </span>
                )}
                {agentHref && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-md border border-amber-400/20 bg-amber-500/10 text-amber-400/50 group-hover:border-amber-400/50 group-hover:text-amber-400 transition-all duration-200" title="Ver agente">
                    <PiArrowSquareOutDuotone className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>

            {/* Avatar + name block */}
            <div className="relative flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl shadow-amber-900/40 ring-4 ring-amber-400/10">
                  <Image src={winnerAvatar} alt={displayName} width={56} height={56} className="object-cover w-full h-full" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg ring-2 ring-black/60">
                  <PiCrownFill className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-xl font-black text-white leading-tight">
                  {displayName}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {displayUid != null && (
                    <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-black text-amber-200">
                      UID {displayUid}
                    </span>
                  )}
                  {typeof displayGithub === "string" && displayGithub.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(displayGithub, "_blank", "noopener,noreferrer"); }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-white/40 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/20 transition-all duration-150 text-[10px] font-medium"
                      title="GitHub"
                    >
                      <PiGithubLogoDuotone className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hotkey row */}
            {displayHotkey && (
              <div className="relative flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                <span className="text-[10px] font-semibold text-white/25 flex-shrink-0 uppercase tracking-wider">Hotkey</span>
                <span className="text-[11px] font-mono text-white/40 truncate flex-1 hidden lg:block">
                  {displayHotkey}
                </span>
                <span className="text-[11px] font-mono text-white/40 truncate flex-1 lg:hidden">
                  {displayHotkey.slice(0, 10)}…{displayHotkey.slice(-10)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(displayHotkey).then(() => {
                      setHotkeyCopied(true);
                      setTimeout(() => setHotkeyCopied(false), 2000);
                    });
                  }}
                  className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-md border border-white/[0.08] bg-white/[0.03] text-white/25 hover:text-amber-300 hover:border-amber-400/20 hover:bg-amber-500/10 transition-all duration-150"
                  title="Copy hotkey"
                >
                  {hotkeyCopied
                    ? <PiCheckDuotone className="h-3 w-3 text-emerald-400" />
                    : <PiCopyDuotone className="h-3 w-3" />
                  }
                </button>
              </div>
            )}

          </div>

          {/* ——— RIGHT: 3 compact stat blocks ——— */}
          <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">

            {/* Avg Reward */}
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-xl border border-emerald-500/25 bg-emerald-500/10 mb-0.5">
                <PiTrophyDuotone className="h-4 w-4 text-emerald-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Avg Reward</p>
              <p className="text-2xl font-black text-emerald-300 leading-none">{rewardPct}</p>
            </div>

            {/* Avg Time */}
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-xl border border-sky-500/25 bg-sky-500/10 mb-0.5">
                <PiClockDuotone className="h-4 w-4 text-sky-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Avg Time</p>
              <p className="text-2xl font-black text-sky-300 leading-none">
                {`${formatNumber(averageEvalTime, 1)}s`}
              </p>
            </div>

            {/* Avg Cost */}
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-xl border border-violet-500/25 bg-violet-500/10 mb-0.5">
                <PiChartLineUpDuotone className="h-4 w-4 text-violet-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Avg Cost</p>
              <p className={cn("text-2xl font-black leading-none", averageEvalCost != null ? "text-violet-300" : "text-white/20")}>
                {costStr}
              </p>
            </div>

          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      </div>
    </div>
  );

  return agentHref ? (
    <Link href={agentHref} className="group block transition-all duration-200 hover:opacity-95">
      {cardContent}
    </Link>
  ) : cardContent;
}

function MetricCard({ card }: Readonly<{ card: any }>) {
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
              <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-2xl ring-2 ring-white/30">
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
                {typeof card.githubUrl === "string" && card.githubUrl.trim().length > 0 && (
                  <Link
                    href={card.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-1.5 rounded-full border-2 border-amber-400/40 bg-amber-500/15 text-white hover:bg-amber-500/25 transition-all duration-200"
                    title="Open winner GitHub URL"
                  >
                    <PiGithubLogoDuotone className="h-4 w-4" />
                  </Link>
                )}
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
              <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 shadow-2xl ring-3 ring-white/30">
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
                {typeof card.githubUrl === "string" && card.githubUrl.trim().length > 0 && (
                  <Link
                    href={card.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-1.5 rounded-full border-2 border-amber-400/40 bg-amber-500/15 text-white hover:bg-amber-500/25 transition-all duration-200"
                    title="Open winner GitHub URL"
                  >
                    <PiGithubLogoDuotone className="h-4 w-4" />
                  </Link>
                )}
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

function LocalMetricCard({ card }: Readonly<{ card: any }>) {
  const Icon = card.icon;
  const isWinner = card.key === "winner" && typeof card.uid === "number";
  const [copied, setCopied] = React.useState(false);
  const fallbackAvatarIndex = (() => {
    const uidValue = card?.uid;
    if (typeof uidValue === "number" && Number.isFinite(uidValue)) return Math.abs(uidValue % 50);
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
        "group relative overflow-hidden border backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/35 hover:shadow-sky-500/10",
        isWinner
          ? "rounded-[28px] border-sky-400/18 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_38%),linear-gradient(135deg,rgba(14,23,41,0.96),rgba(10,16,31,0.94))]"
          : "rounded-[28px] border-sky-400/18 bg-[linear-gradient(145deg,rgba(12,20,38,0.94),rgba(8,14,29,0.92))]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.03),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute right-3 top-3 z-10">
        <span
          className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-sky-400/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-sky-200/85"
        >
          Local
        </span>
      </div>

      {isWinner ? (
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-sky-400/30 shadow-xl ring-4 ring-sky-400/10">
            <Image
              src={winnerAvatar}
              alt={`UID ${card.uid ?? "winner"}`}
              fill
              sizes="80px"
              className="object-cover"
            />
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg ring-2 ring-[#08111f]">
              <PiCrownFill className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300/70">
                {card.title}
              </span>
            </div>
            <div className={cn("font-black text-white leading-tight", card.valueClass ?? "text-xl md:text-2xl")}>
              {card.value}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {typeof card.uid === "number" ? (
                <span className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-2.5 py-1 text-[11px] font-black text-sky-100">
                  UID {card.uid}
                </span>
              ) : null}
              {typeof card.githubUrl === "string" && card.githubUrl.trim().length > 0 ? (
                <Link
                  href={card.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition-all duration-200 hover:border-sky-300/20 hover:bg-sky-400/10 hover:text-sky-100"
                  title="Open GitHub URL"
                >
                  <PiGithubLogoDuotone className="h-4 w-4" />
                  <span>GitHub</span>
                </Link>
              ) : null}
            </div>
            {card.hotkey ? (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <span className="flex-1 break-all text-[11px] font-mono text-white/55">
                  {card.hotkey}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyHotkey(card.hotkey);
                  }}
                  className="flex-shrink-0 rounded-lg bg-white/8 p-1.5 transition-all duration-150 hover:bg-white/15"
                  title="Copy hotkey"
                >
                  {copied ? (
                    <PiCheckDuotone className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <PiCopyDuotone className="h-3.5 w-3.5 text-white/60" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full min-h-[188px] flex-col px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-400/18 bg-gradient-to-br from-sky-500/16 to-cyan-500/10 shadow-md">
              {Icon && <Icon className="h-5 w-5 text-sky-300" />}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/70">
              {card.title}
            </span>
            <div className={cn("font-black leading-none text-white", card.valueClass ?? "text-3xl")}>
              {card.value}
            </div>
            {card.helper ? (
              <p className="mt-3 max-w-[18ch] text-[11px] leading-snug text-white/42">
                {card.helper}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function RoundValidatorsInline({
  className,
  onValidatorSelect,
  selectedValidatorId: externalSelectedId = null,
  requestedValidatorId = null,
  roundData,
  loading,
  error,
}: Readonly<{
  className?: string;
  onValidatorSelect?: (v: ValidatorPerformance) => void;
  selectedValidatorId?: string | null;
  requestedValidatorId?: string | null;
  roundData?: any;
  loading?: boolean;
  error?: string | null;
}>) {
  const params = useParams();
  const seasonParam = params.season as string | undefined;
  const roundParam = params.round as string | undefined;
  const roundKey = seasonParam && roundParam ? `${seasonParam}/${roundParam}` : undefined;
  // ✅ Validators ahora vienen de roundData (useGetRound)
  const validatorsData: ValidatorPerformance[] = React.useMemo(() => {
    if (!roundData?.validators) return [];

    const mapped = (roundData.validators as any[]).map((v: any) => {
      const id = `validator-${v.validator_uid}`;
      const name = v.validator_name || `Validator ${v.validator_uid}`;
      const hotkey = v.validator_hotkey || "";
      const icon = resolveValidatorImage(v.validator_name, v.validator_image);
      const topReward = typeof v.topReward === "number" ? v.topReward : 0;
      const stake = typeof v.stake === "number" ? v.stake : 0;

      const topMiner: MinerPerformance | undefined = v.winner
        ? {
            uid: v.winner.uid,
            name: v.winner.name,
            hotkey: v.winner.hotkey ?? null,
            image: v.winner.image ?? null,
            success: true,
            reward: typeof v.winner.reward === "number" ? v.winner.reward : 0,
            duration:
              typeof v.winner.duration === "number" ? v.winner.duration : 0,
            ranking:
              typeof v.winner.ranking === "number" ? v.winner.ranking : 0,
            tasksCompleted:
              typeof v.winner.tasksCompleted === "number"
                ? v.winner.tasksCompleted
                : 0,
            tasksTotal:
              typeof v.winner.tasksTotal === "number" ? v.winner.tasksTotal : 0,
            stake:
              typeof v.winner.stake === "number" ? v.winner.stake : stake,
            emission:
              typeof v.winner.emission === "number" ? v.winner.emission : 0,
            lastSeen:
              typeof v.winner.lastSeen === "string"
                ? v.winner.lastSeen
                : new Date().toISOString(),
          }
        : undefined;

      // Fill required ValidatorPerformance fields with safe defaults when backend
      // does not provide them directly.
      const status: ValidatorPerformance["status"] = "active";
      const totalTasks =
        typeof v.totalTasks === "number" ? v.totalTasks : v.tasks_total ?? 0;
      const completedTasks =
        typeof v.completedTasks === "number"
          ? v.completedTasks
          : v.tasks_completed ?? 0;
      const totalMiners =
        typeof v.totalMiners === "number" ? v.totalMiners : 0;
      const activeMiners =
        typeof v.activeMiners === "number" ? v.activeMiners : 0;
      const averageReward =
        typeof v.averageReward === "number" ? v.averageReward : topReward;
      const weight = typeof v.weight === "number" ? v.weight : 0;
      const trust = typeof v.trust === "number" ? v.trust : 0;
      const version = typeof v.version === "number" ? v.version : 0;
      const emission = typeof v.emission === "number" ? v.emission : 0;
      const lastSeen =
        typeof v.lastSeen === "string" ? v.lastSeen : new Date().toISOString();
      const uptime = typeof v.uptime === "number" ? v.uptime : 0;

      const base: ValidatorPerformance = {
        id,
        name,
        hotkey,
        icon,
        status,
        totalTasks,
        completedTasks,
        totalMiners,
        activeMiners,
        averageReward,
        topReward,
        weight,
        trust,
        version,
        stake,
        emission,
        lastSeen,
        uptime,
      };

      return topMiner ? { ...base, topMiner } : base;
    });

    return mapped.sort((a, b) => (b.stake ?? 0) - (a.stake ?? 0));
  }, [roundData]);
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

  if (error && !loading) {
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
      <div className="relative">
        <div className="relative flex items-center">
          <Button
            title="Prev"
            variant="text"
            ref={sliderPrevBtn}
            onClick={() => scrollToTheLeft()}
            className="!absolute left-0 z-10 !h-full w-8 !justify-center bg-gradient-to-r from-[rgb(12,12,14)] to-transparent px-0 text-white/50 hover:text-white"
          >
            <PiCaretLeftBold className="h-3.5 w-3.5" />
          </Button>

          <div className="w-full overflow-hidden px-6">
            <div
              ref={sliderEl}
              className="flex gap-1 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-0"
            >
              {validatorsData?.map((validator) => {
                const iconSrc = resolveValidatorImage(validator.name, validator.icon);
                const isActive = selectedValidatorId === validator.id;
                return (
                  <button
                    type="button"
                    key={`validator-${validator.id}`}
                    onClick={() => {
                      if (validator.id === selectedValidatorId) return;
                      setSelectedValidatorId(validator.id);
                      lastNotifiedValidator.current = validator.id;
                      onValidatorSelect?.(validator);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-cyan-500/15 border border-cyan-400/30 text-white"
                        : "bg-transparent border border-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={iconSrc}
                        alt={validator.name}
                        fill
                        sizes="32px"
                        className={cn(
                          "rounded-full object-contain",
                          isActive ? "ring-2 ring-cyan-400/40" : "ring-1 ring-white/15"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      isActive ? "text-white" : "text-white/70"
                    )}>
                      {validator.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            title="Next"
            variant="text"
            ref={sliderNextBtn}
            onClick={() => scrollToTheRight()}
            className="!absolute right-0 z-10 !h-full w-8 !justify-center bg-gradient-to-l from-[rgb(12,12,14)] to-transparent px-0 text-white/50 hover:text-white"
          >
            <PiCaretRightBold className="h-4 w-4" />
          </Button>
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
  roundData,
  loading,
  error,
}: Readonly<{
  className?: string;
  selectedValidator?: ValidatorPerformance | null;
  roundInfo?: any;
  minersData?: any;
  roundData?: any;
  loading?: boolean;
  error?: string;
}>) {
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

  // ✅ Priorizar roundData (nuevo endpoint) sobre minersData (antiguo). Nunca devolver undefined para evitar "reading 'benchmarks' of undefined".
  const chartSource = React.useMemo(() => {
    const empty = { miners: [] as any[], benchmarks: [] as any[] };
    if (roundData?.validators) {
      let miners: any[] = [];

      if (selectedValidator?.id) {
        // Si hay selectedValidator, usar solo sus miners
        const validatorUid = selectedValidator.id.replace("validator-", "");
        const validator = roundData.validators.find(
          (v: any) => v.validator_uid?.toString() === validatorUid || v.validator_uid?.toString() === selectedValidator.id
        );
        if (validator?.miners) {
          miners = validator.miners;
        }
      } else {
        // Si no hay selectedValidator, usar todos los miners de todos los validators
        // (usar los del primer validator o agregar todos)
        for (const validator of roundData.validators) {
          if (validator?.miners && Array.isArray(validator.miners)) {
            miners = [...miners, ...validator.miners];
          }
        }
        // Eliminar duplicados por uid
        const uniqueMiners = new Map();
        for (const miner of miners) {
          if (miner.uid && !uniqueMiners.has(miner.uid)) {
            uniqueMiners.set(miner.uid, miner);
          }
        }
        miners = Array.from(uniqueMiners.values());
      }

      // Competition chart is based on best reward, while local run metrics stay available for tooltip/details.
      const mappedMiners = miners.map((miner: any) => ({
        ...miner,
        reward: miner.best_local_reward ?? miner.local_avg_reward ?? miner.reward ?? 0,
        best_reward: miner.best_local_reward ?? miner.reward ?? 0,
        best_local_reward: miner.best_local_reward ?? miner.reward ?? 0,
        best_local_eval_score: miner.best_local_eval_score ?? miner.local_avg_eval_score ?? 0,
        best_local_eval_time: miner.best_local_eval_time ?? miner.local_avg_eval_time ?? null,
        best_local_eval_cost: miner.best_local_eval_cost ?? null,
        local_reward: miner.local_reward ?? miner.local_avg_reward ?? null,
        local_eval_score: miner.local_eval_score ?? miner.local_avg_eval_score ?? null,
        local_eval_time: miner.local_eval_time ?? miner.local_avg_eval_time ?? null,
        local_avg_cost: miner.local_avg_cost ?? null,
        validatorId: selectedValidator?.id || `validator-${roundData.validators[0]?.validator_uid}`, // ✅ Agregar validatorId
      }));

      return {
        miners: mappedMiners,
        benchmarks: [], // Los benchmarks vienen del endpoint antiguo si es necesario
      };
    }
    // Fallback al endpoint antiguo; si falla la API (ej. 500), minersData?.data es undefined → usar empty
    const fallback = minersData?.data;
    return fallback && typeof fallback === "object" && (Array.isArray(fallback.miners) || "miners" in fallback)
      ? { miners: fallback.miners ?? [], benchmarks: fallback.benchmarks ?? [] }
      : empty;
  }, [roundData, selectedValidator, minersData]);

  const chartData = React.useMemo(() => {
    if (!chartSource?.miners) {
      return [] as any[];
    }
    const benchmarkColorCache = new Map<string, string>();
    let fallbackColorIndex = 0;
    const benchmarks: BenchmarkPerformance[] = chartSource.benchmarks || [];
    // ✅ Los miners ya vienen filtrados desde chartSource según selectedValidator
    const filteredMiners = chartSource.miners;
    const minerEntries = filteredMiners.map((miner: any) => {
      const reward = normalizeScore(miner.reward);
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
        isSota,
        uid: miner.uid,
        provider: miner.provider,
        xAxisLabel: isSota ? "" : uidLabel,
        best_reward: miner.best_reward ?? miner.best_local_reward ?? miner.reward ?? 0,
        best_reward_bar: miner.best_reward ?? miner.best_local_reward ?? miner.reward ?? 0,
        local_reward_bar: miner.local_reward ?? miner.local_avg_reward ?? 0,
        local_reward: miner.local_reward ?? miner.local_avg_reward ?? null,
        eval_score: miner.best_local_eval_score ?? miner.local_avg_eval_score ?? miner.eval_score ?? 0,
        eval_time: miner.best_local_eval_time ?? miner.local_avg_eval_time ?? miner.avgTime ?? miner.eval_time ?? null,
        avg_cost: miner.best_local_eval_cost ?? miner.local_avg_cost ?? null,
        local_eval_score: miner.local_eval_score ?? miner.local_avg_eval_score ?? null,
        local_eval_time: miner.local_eval_time ?? miner.local_avg_eval_time ?? null,
        local_avg_cost: miner.local_avg_cost ?? null,
        reward: miner.best_reward ?? miner.best_local_reward ?? miner.reward ?? 0,
      };
    });
    const benchmarkEntries = benchmarks.map((benchmark) => {
      const reward = normalizeScore(benchmark.reward);
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
        reward,
        best_reward_bar: reward,
        local_reward_bar: 0,
        isSota: true,
        uid: `benchmark-${benchmark.id}`,
        provider: benchmark.provider,
        xAxisLabel: "",
      };
    });
    return [...minerEntries, ...benchmarkEntries].sort(
      (a, b) => b.reward - a.reward
    );
  }, [minersData, selectedValidator, chartSource?.benchmarks, chartSource?.miners]);

  const legendItems = React.useMemo(
    () => [
      { label: "Local reward", color: "#22C55E" },
      { label: "Best reward", color: "#06B6D4" },
    ],
    []
  );

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

  if (error && !loading) {
    return (
      <WidgetCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 ring-1 ring-white/10">
                <PiTrophyDuotone className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-base font-black text-white uppercase tracking-wider">Local round and best rewards</p>
                <p className="text-[11px] text-white/40 font-medium">Pre-consensus · per validator</p>
              </div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 ring-1 ring-white/10">
                <PiTrophyDuotone className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-base font-black text-white uppercase tracking-wider">Local round and best rewards</p>
                <p className="text-[11px] text-white/40 font-medium">Pre-consensus · per validator</p>
              </div>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 ring-1 ring-white/10">
              <PiTrophyDuotone className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <p className="text-base font-black text-white uppercase tracking-wider">Local round and best rewards</p>
              <p className="text-[11px] text-white/40 font-medium">
                Reward/score/time/cost from this round, compared against the best local reward in this validator
              </p>
            </div>
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
              dataKey="local_reward_bar"
              fill="#22C55E"
              strokeWidth={0}
              radius={[8, 8, 0, 0]}
              barSize={Math.max(8, Math.floor(barSize * 0.48))}
              isAnimationActive
              animationBegin={0}
              animationDuration={700}
            />
            <Bar
              dataKey="best_reward_bar"
              fill="url(#barGradient)"
              strokeWidth={0}
              radius={[8, 8, 0, 0]}
              barSize={Math.max(8, Math.floor(barSize * 0.48))}
              isAnimationActive
              animationBegin={100}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {legendItems.length > 0 && (
        <div className="mt-1 flex flex-wrap justify-center gap-6">
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
  roundData,
  loading,
  error,
}: Readonly<{
  className?: string;
  selectedValidator?: ValidatorPerformance | null;
  roundNumber?: number;
  roundInfo?: any;
  minersData?: any;
  roundData?: any;
  loading?: boolean;
  error?: string;
}>) {
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
  // ✅ Usar roundData.validators[selectedValidator].miners si está disponible
  const topMinersList = React.useMemo(() => {
    // Si tenemos roundData y un validator seleccionado, usar sus miners
    if (roundData?.validators && selectedValidator?.id) {
      const validatorUid = selectedValidator.id.replace("validator-", "");
      const validator = roundData.validators.find(
        (v: any) => v.validator_uid?.toString() === validatorUid || v.validator_uid?.toString() === selectedValidator.id
      );
      if (validator?.miners && Array.isArray(validator.miners)) {
        return validator.miners
          .filter((miner: any) => Number(miner?.uid) !== BURN_UID)
          .map((miner: any) => ({
          uid: miner.uid,
          name: miner.name,
          imageUrl: miner.image,
          hotkey: miner.hotkey,
          reward: miner.best_local_reward ?? miner.local_avg_reward,
          ranking: miner.local_rank,
          validatorId: selectedValidator.id,
          }));
      }
    }
    // Fallback al endpoint antiguo
    const miners =
      minersData?.data?.miners && Array.isArray(minersData.data.miners)
        ? minersData.data.miners.filter((miner: any) => Number(miner?.uid) !== BURN_UID)
        : [];
    if (!selectedValidator?.id) return miners.slice(0, 10);
    const filtered = miners.filter(
      (miner: any) => miner.validatorId === selectedValidator.id
    );
    return filtered.length > 0 ? filtered : [];
  }, [roundData, minersData, selectedValidator]);

  const rewardsTitle = selectedValidator?.name
    ? `Best Local Rewards - ${selectedValidator.name}`
    : "Best Local Rewards";

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

  if (error && !loading) {
    return (
      <WidgetCard
        title={rewardsTitle}
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
        title={rewardsTitle}
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
      title={rewardsTitle}
      className={cn(
        tallCardClass,
        accentClass,
        "relative overflow-hidden h-[450px] md:h-[550px] xl:h-[650px] px-2 lg:px-4 w-full",
        className
      )}
      headerClassName="px-3 pb-2"
      titleClassName="text-white text-xl font-bold"
    >
      <div className="custom-scrollbar h-[360px] md:h-[460px] xl:h-[560px] overflow-y-auto overflow-x-hidden mt-3">
        <div className="flex flex-col min-w-0">
          {topMinersList.map((miner: any, index: number) => {
            // Link to agent with season filter only (dropdown on agent page filters by season)
            const agentHref = roundInfo?.season != null
                ? `${routes.agents}/${miner.uid}?season=${roundInfo.season}`
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
                      ? "border-amber-400/20 bg-amber-500/[0.06]"
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
                  </div>
                  <div className="flex w-full min-w-0 items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 min-w-0">
                        <RizzText
                          className={cn(
                            "text-base font-black transition-all duration-300 truncate min-w-0",
                            rank === 1
                              ? "text-amber-300 group-hover:text-amber-200"
                              : "text-white group-hover:scale-105"
                          )}
                        >
                          {(miner?.name ?? "").trim()
                            ? miner.name
                            : `Miner ${miner.uid}`}
                        </RizzText>
                        {isSota && (
                          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white border-2 border-white/20 shadow-sm">
                            SOTA
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-white/70">
                        <span className="uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                          UID {miner.uid}
                        </span>
                      </div>
                      {(() => {
                        const zeroReason = miner?.zero_reason ?? miner?.zeroReason;
                        return zeroReason && (Number(miner?.reward ?? miner?.local_avg_reward ?? 0) <= 0) ? (
                          <div className="mt-1.5 text-[11px] text-amber-200/90 font-medium">
                            Reason: {typeof zeroReason === "string" ? zeroReason.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : String(zeroReason)}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={cn(
                            "text-xl font-black transition-all duration-300 group-hover:scale-110",
                            index === 0 ? "text-amber-300" : "text-cyan-300"
                          )}
                        >
                          {(() => {
                            const reward = Number(miner.best_reward ?? miner.reward ?? miner.local_avg_reward ?? 0);
                            const truncated = truncateDecimal(reward, 4); // ✅ Truncar a 4 decimales (0.7458)
                            return (truncated * 100).toFixed(2) + "%"; // ✅ Mostrar como porcentaje con 2 decimales (74.58%)
                          })()}
                        </div>
                        {miner.local_reward != null && (
                          <RizzText className="text-[11px] text-white/65 font-semibold">
                            Local {(() => {
                              const reward = Number(miner.local_reward ?? 0);
                              const truncated = truncateDecimal(reward, 4);
                              return (truncated * 100).toFixed(2) + "%";
                            })()}
                          </RizzText>
                        )}
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
  const params = useParams();
  const seasonParam = params.season as string | undefined;
  const roundParam = params.round as string | undefined;
  const roundKey = seasonParam && roundParam ? `${seasonParam}/${roundParam}` : undefined;
  const { openModal } = useModal();

  const handleOpenGlossary = () =>
    openModal({ view: <RoundsGlossaryModal />, size: "lg", customSize: 1400 });

  // Selection state for validator-driven panels
  const [selectedValidator, setSelectedValidator] =
    React.useState<ValidatorPerformance | null>(null);
  // IPFS / Consensus detail modal: click on Upload, Download or Consensus to see full data
  const [ipfsConsensusDetail, setIpfsConsensusDetail] = React.useState<{
    type: "upload" | "download" | "post_consensus" | "how_consensus";
    title: string;
    data: unknown;
  } | null>(null);
  const [includeOwnDownloadedPayload, setIncludeOwnDownloadedPayload] = React.useState(false);
  const [ipfsUploadFullPayload, setIpfsUploadFullPayload] = React.useState<Record<string, unknown> | null>(null);
  const [ipfsUploadLoading, setIpfsUploadLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const closeIpfsDialog = React.useCallback(() => {
    setIpfsConsensusDetail(null);
    setIncludeOwnDownloadedPayload(false);
    setIpfsUploadFullPayload(null);
  }, []);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedValidatorId = searchParams?.get("validator") ?? null;

  // Extraer season y round del roundKey
  const [seasonFromKey, roundFromKey] = React.useMemo(() => {
    if (typeof roundKey === 'string' && roundKey.includes('/')) {
      const [s, r] = roundKey.split('/').map(Number);
      return [s, r];
    }
    return [undefined, undefined];
  }, [roundKey]);

  const {
    data: roundStatusData,
    loading: roundStatusLoading,
    error: roundStatusError,
  } = useRoundStatusView(seasonFromKey, roundFromKey);
  const {
    data: seasonSummaryData,
    loading: seasonSummaryLoading,
    error: seasonSummaryError,
  } = useRoundSeasonSummaryView(seasonFromKey, roundFromKey);
  const {
    data: validatorsViewData,
    loading: validatorsViewLoading,
    error: validatorsViewError,
  } = useRoundValidatorsView(seasonFromKey, roundFromKey);

  const roundDataLoading =
    roundStatusLoading || seasonSummaryLoading || validatorsViewLoading;
  const roundDataError =
    roundStatusError || seasonSummaryError || validatorsViewError || null;

  const roundInfo = React.useMemo(() => {
    if (!roundStatusData) return null;
    return {
      season: roundStatusData.season,
      roundInSeason: roundStatusData.round_in_season,
      status: roundStatusData.status,
      current: roundStatusData.status === "active",
      startBlock: roundStatusData.start_block,
      endBlock: roundStatusData.end_block,
      progress: roundStatusData.progress,
      totalTasks: roundStatusData.tasks_total,
      completedTasks: roundStatusData.completed_tasks,
      validatorRounds: [],
    };
  }, [roundStatusData]) as any;

  const progressData = React.useMemo(() => {
    if (!roundStatusData) return null;
    return {
      season: roundStatusData.season,
      roundInSeason: roundStatusData.round_in_season,
      currentBlock: roundStatusData.current_block,
      startBlock: roundStatusData.start_block,
      endBlock: roundStatusData.end_block,
      blocksRemaining: roundStatusData.blocks_remaining,
      progress: roundStatusData.progress,
      status: roundStatusData.status,
      nextRound: roundStatusData.next_round ?? null,
      previousRound: roundStatusData.previous_round ?? null,
    };
  }, [roundStatusData]);

  // Neighbor rounds for floating nav bar
  const neighborRounds = React.useMemo(() => {
    const prev = progressData?.previousRound;
    const next = progressData?.nextRound;
    const toKey = (v: string | number | null | undefined) => {
      if (v == null) return null;
      const s = String(v);
      if (s.includes("/")) return s;
      const sn = progressData?.season ?? seasonFromKey;
      return sn != null ? `${sn}/${s}` : null;
    };
    const toNum = (v: string | number | null | undefined) => {
      if (v == null) return undefined;
      const s = String(v);
      const parts = s.includes("/") ? s.split("/") : [s];
      const n = Number(parts[parts.length - 1]);
      return Number.isFinite(n) ? n : undefined;
    };
    return {
      previous: toKey(prev) ? { roundKey: toKey(prev)!, roundNumber: toNum(prev) } : null,
      next: toKey(next) ? { roundKey: toKey(next)!, roundNumber: toNum(next) } : null,
    };
  }, [progressData, seasonFromKey]);

  const goToRound = React.useCallback(
    (targetKey?: string | null) => {
      if (!targetKey) return;
      router.push(`${routes.rounds}/${targetKey}`);
    },
    [router]
  );

  const roundNumberForLinks = roundStatusData?.round_in_season ?? roundFromKey;
  const seasonSummary = seasonSummaryData?.summary ?? null;
  const validatorsDataPayload = validatorsViewData?.validators ?? [];
  const topMiners = React.useMemo(() => {
    if (seasonSummary?.leader_after) {
      const leaderUid = seasonSummary.leader_after.uid;
      // Fallback: if avg_eval_time / avg_eval_cost from round_summary are 0/null,
      // use the leader's best_local_eval_time / best_local_eval_cost from the
      // validators' competition data (which is always populated from the agent run).
      let fallbackTime: number | null = null;
      let fallbackCost: number | null = null;
      for (const v of validatorsDataPayload) {
        const miners: any[] = v?.competition_state?.miners ?? [];
        const leaderMiner = miners.find((m: any) => m?.uid === leaderUid);
        if (leaderMiner) {
          if (fallbackTime === null && leaderMiner.best_local_eval_time) {
            fallbackTime = Number(leaderMiner.best_local_eval_time);
          }
          if (fallbackCost === null && leaderMiner.best_local_eval_cost != null) {
            fallbackCost = Number(leaderMiner.best_local_eval_cost);
          }
        }
      }
      const resolvedTime =
        seasonSummary.avg_eval_time && seasonSummary.avg_eval_time > 0
          ? seasonSummary.avg_eval_time
          : (fallbackTime ?? null);
      const resolvedCost = seasonSummary.avg_eval_cost ?? fallbackCost;
      return [
        {
          uid: leaderUid,
          name: seasonSummary.leader_after.name,
          image: seasonSummary.leader_after.image ?? null,
          hotkey: seasonSummary.leader_after.hotkey ?? null,
          github_url: seasonSummary.leader_after.github_url ?? null,
          avg_reward: seasonSummary.leader_after.reward,
          avg_eval_score: seasonSummary.avg_eval_score,
          avg_eval_time: resolvedTime,
          avg_eval_cost: resolvedCost ?? null,
        },
      ];
    }
    return [];
  }, [seasonSummary, validatorsDataPayload]);

  const statistics = React.useMemo(() => {
    if (!seasonSummary) return null;
    return {
      winnerUid: seasonSummary.leader_after?.uid,
      winnerAverage: seasonSummary.leader_after?.reward,
      topReward: seasonSummary.leader_after?.reward,
      avgEvalTime: seasonSummary.avg_eval_time,
      totalMiners: seasonSummary.miners_evaluated ?? 0,
      totalTasks: seasonSummary.tasks_evaluated ?? 0,
      minersEvaluated: seasonSummary.miners_evaluated,
      tasksEvaluated: seasonSummary.tasks_evaluated,
    };
  }, [seasonSummary]);

  const roundData = React.useMemo(() => {
    const leadershipRule = seasonSummary
      ? (() => {
          const reigningUid = seasonSummary.leader_before?.uid ?? null;
          const challengerUidRaw = seasonSummary.candidate?.uid ?? null;
          const challengerIsSameAsReigning =
            reigningUid != null &&
            challengerUidRaw != null &&
            reigningUid === challengerUidRaw;
          const challengerUid = challengerIsSameAsReigning ? null : challengerUidRaw;

          return {
          required_improvement_pct: seasonSummary.required_improvement_pct,
          reigning_uid: reigningUid,
          reigning_name: seasonSummary.leader_before?.name ?? null,
          reigning_reward: seasonSummary.leader_before?.reward ?? null,
          reigning_score: seasonSummary.leader_before?.reward ?? null,
          challenger_uid: challengerUid,
          challenger_name: challengerUid != null ? seasonSummary.candidate?.name ?? null : null,
          challenger_reward: challengerUid != null ? seasonSummary.candidate?.reward ?? null : null,
          challenger_score: challengerUid != null ? seasonSummary.candidate?.reward ?? null : null,
          dethroned: seasonSummary.dethroned,
          season_leader_uid: seasonSummary.leader_after?.uid ?? null,
        };
        })()
      : null;

    return {
      season: roundStatusData?.season ?? seasonSummaryData?.season ?? validatorsViewData?.season,
      round_in_season:
        roundStatusData?.round_in_season ??
        seasonSummaryData?.round_in_season ??
        validatorsViewData?.round_in_season,
      post_consensus_json: seasonSummary
        ? {
            winner: topMiners[0] ?? null,
            miners_evaluated: seasonSummary.miners_evaluated,
            tasks_evaluated: seasonSummary.tasks_evaluated,
            leadership_rule: leadershipRule,
          }
        : null,
      validators: validatorsDataPayload.map((validator: any) => ({
        validator_uid: validator.validator_uid,
        validator_name: validator.validator_name,
        validator_hotkey: validator.validator_hotkey,
        validator_image: resolveValidatorImage(validator.validator_name, validator.validator_image),
        stake: validator.stake ?? 0,
        winner: validator.competition_state?.winner
          ? {
              ...validator.competition_state.winner,
              hotkey: validator.competition_state.winner.hotkey ?? null,
            }
          : null,
        topReward: validator.competition_state?.top_reward ?? 0,
        local_avg_winner_reward: validator.competition_state?.top_reward ?? 0,
        local_avg_eval_time:
          validator.competition_state?.winner?.best_local_eval_time ?? 0,
        local_miners_evaluated:
          validator.competition_state?.miners_participated ?? 0,
        local_tasks_evaluated:
          validator.competition_state?.tasks_evaluated ?? 0,
        miners: (validator.competition_state?.miners ?? []).map((miner: any) => ({
          uid: miner.uid,
          name: miner.name,
          hotkey: miner.hotkey ?? null,
          image: miner.image ?? null,
          local_rank: miner.competition_rank ?? null,
          local_avg_reward: miner.local_avg_reward ?? null,
          local_avg_eval_score: miner.local_avg_eval_score ?? null,
          local_avg_eval_time: miner.local_avg_eval_time ?? null,
          best_local_reward: miner.best_local_reward ?? 0,
          best_local_eval_score: miner.best_local_eval_score ?? 0,
          best_local_eval_time: miner.best_local_eval_time ?? 0,
          best_local_eval_cost: miner.best_local_eval_cost ?? null,
          local_reward: miner.local_avg_reward ?? null,
          local_eval_score: miner.local_avg_eval_score ?? null,
          local_eval_time: miner.local_avg_eval_time ?? null,
          local_avg_cost: miner.local_avg_eval_cost ?? null,
          is_reused: Boolean(miner.is_reused),
        })),
        ipfs_uploaded: validator.ipfs?.uploaded ?? null,
        ipfs_downloaded: validator.ipfs?.downloaded ?? null,
        post_consensus_evaluation: validator.consensus?.post_consensus ?? null,
        evaluation_post_consensus: validator.consensus?.post_consensus ?? null,
      })),
    };
  }, [roundStatusData, seasonSummaryData, validatorsViewData, seasonSummary, topMiners, validatorsDataPayload]);

  // Determine if round is waiting for consensus
  const isWaitingForConsensus = roundInfo?.status === "evaluating_finished";

  const aggregatedTopMiner = React.useMemo<{
    uid?: number;
    name?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    hotkey?: string | null;
    githubUrl?: string | null;
    github_url?: string | null;
    avg_reward?: number;
    avg_eval_score?: number;
    avg_eval_time?: number | null;
  } | null>(() => {
    if (!Array.isArray(topMiners) || topMiners.length === 0) return null;
    return topMiners[0] ?? null;
  }, [topMiners]);

  // ✅ Usar winner de roundData.validators[selectedValidator] si está disponible
  const selectedValidatorWinner = React.useMemo<{
    uid?: number;
    name?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    hotkey?: string | null;
    githubUrl?: string | null;
    github_url?: string | null;
    avg_reward?: number;
    avg_eval_score?: number;
    avg_eval_time?: number | null;
  } | null>(() => {
    if (validatorsDataPayload && selectedValidator?.id) {
      const validatorUid = selectedValidator.id.replace("validator-", "");
      const validator = validatorsDataPayload.find(
        (v: any) => v.validator_uid?.toString() === validatorUid || v.validator_uid?.toString() === selectedValidator.id
      );
      if (validator?.competition_state?.winner) {
        return {
          ...validator.competition_state.winner,
          avg_reward: validator.competition_state.winner.best_local_reward,
          avg_eval_score: validator.competition_state.winner.best_local_eval_score,
          avg_eval_time: validator.competition_state.winner.best_local_eval_time,
        };
      }
    }
    return (selectedValidator?.topMiner as any) ?? null;
  }, [validatorsDataPayload, selectedValidator]);

  const winnerLabel = selectedValidatorWinner
    ? selectedValidatorWinner.name?.trim() ||
      `Miner ${selectedValidatorWinner.uid ?? "unknown"}`
    : aggregatedTopMiner
      ? aggregatedTopMiner.name?.trim() ||
        `Miner ${aggregatedTopMiner.uid ?? "unknown"}`
      : "No winner yet";
  const winnerUidVal =
    selectedValidatorWinner?.uid ?? aggregatedTopMiner?.uid;

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
          title: "Winner in this validator",
          value: winnerLabel,
          uid: winnerUidVal,
          hotkey: selectedValidatorWinner?.hotkey ?? selectedValidator?.topMiner?.hotkey,
          githubUrl:
            selectedValidatorWinner?.github_url ??
            selectedValidator?.topMiner?.githubUrl ??
            selectedValidator?.topMiner?.github_url ??
            aggregatedTopMiner?.githubUrl ??
            aggregatedTopMiner?.github_url ??
            null,
          imageUrl:
            selectedValidatorWinner?.image ??
            selectedValidator?.topMiner?.imageUrl ??
            aggregatedTopMiner?.imageUrl,
          helper:
            winnerUidVal != null
              ? `UID ${winnerUidVal}`
              : selectedValidator.name
                ? `${selectedValidator.name} latest champion`
                : "Champion for this validator",
          icon: PiCrownDuotone,
          gradient: "from-white/[0.04] to-white/[0.02]",
          bgGradient: "from-white/[0.04] to-white/[0.02]",
          iconGradient: "from-amber-400 to-orange-500",
          borderColor: "border-white/10",
          glowColor: "transparent",
          valueClass: "text-base md:text-2xl",
        },
        {
          key: "reward",
          title: "Top Reward",
          value: `${(() => {
            const reward = roundData?.validators?.find(
              (v: any) => v.validator_uid?.toString() === selectedValidator.id.replace("validator-", "") || v.validator_uid?.toString() === selectedValidator.id
            )?.local_avg_winner_reward ?? selectedValidator.topReward ?? selectedValidator.averageReward ?? 0;
            const truncated = truncateDecimal(reward, 4);
            return formatNumber(truncated * 100, 2);
          })()}%`, // ✅ Mostrar como porcentaje con 2 decimales
          helper: "Best local reward in this validator",
          icon: PiTrophyDuotone,
          gradient: "from-white/[0.04] to-white/[0.02]",
          bgGradient: "from-white/[0.04] to-white/[0.02]",
          iconGradient: "from-emerald-400 to-teal-500",
          borderColor: "border-white/10",
          glowColor: "transparent",
          valueClass: "text-lg md:text-4xl",
        },
        {
          key: "miners",
          title: "Agents evaluated",
          value: formatNumber((() => {
            // ✅ Obtener desde roundData.validators[selectedValidator].miners.length o local_miners_evaluated
            if (roundData?.validators && selectedValidator?.id) {
              const validatorUid = selectedValidator.id.replace("validator-", "");
              const validator = roundData.validators.find(
                (v: any) => v.validator_uid?.toString() === validatorUid || v.validator_uid?.toString() === selectedValidator.id
              );
              if (validator) {
                // Priorizar local_miners_evaluated, sino usar length de miners
                return validator.local_miners_evaluated ?? validator.miners?.length ?? 0;
              }
            }
            return selectedValidator.totalMiners ?? 0;
          })()),
          helper: "Agents evaluated this round",
          icon: PiUsersThreeDuotone,
          gradient: "from-white/[0.04] to-white/[0.02]",
          bgGradient: "from-white/[0.04] to-white/[0.02]",
          iconGradient: "from-violet-400 to-fuchsia-500",
          borderColor: "border-white/10",
          glowColor: "transparent",
          valueClass: "text-lg md:text-4xl",
        },
        {
          key: "tasks",
          title: "Tasks",
          value: formatNumber((() => {
            // ✅ Obtener desde roundData.validators[selectedValidator].local_tasks_evaluated
            if (roundData?.validators && selectedValidator?.id) {
              const validatorUid = selectedValidator.id.replace("validator-", "");
              const validator = roundData.validators.find(
                (v: any) => v.validator_uid?.toString() === validatorUid || v.validator_uid?.toString() === selectedValidator.id
              );
              if (validator) {
                return validator.local_tasks_evaluated ?? 0;
              }
            }
            return selectedValidator.totalTasks ?? 0;
          })()),
          helper: "Tasks per agent evaluation run",
          icon: PiListChecksDuotone,
          gradient: "from-white/[0.04] to-white/[0.02]",
          bgGradient: "from-white/[0.04] to-white/[0.02]",
          iconGradient: "from-blue-400 to-indigo-500",
          borderColor: "border-white/10",
          glowColor: "transparent",
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

  // Determine if round is active (and not already past end block on chain)
  const backendStatus = progressData?.status ?? roundInfo?.status;
  const progressRatio = progressData?.progress; // 0–1 from API
  const currentBlock = progressData?.currentBlock ?? (progressData as any)?.current_block;
  const endBlock = progressData?.endBlock ?? (progressData as any)?.end_block;
  const roundBlockWindowEnded =
    (typeof progressRatio === "number" && progressRatio >= 1) ||
    (typeof currentBlock === "number" &&
      typeof endBlock === "number" &&
      currentBlock >= endBlock);
  const isActive =
    !roundBlockWindowEnded &&
    (backendStatus === "active" ||
      backendStatus === "evaluating_finished" ||
      roundInfo?.current === true);

  // Only show full-screen "data not available" when round is still pending (not started).
  // For active rounds we always show header + progress + "Round in progress" banner below.
  const isRoundStarting = roundInfo?.status === "pending";

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-24">
      <PageHeader title={""} className="mt-4" />

      {roundDataError && !roundDataLoading && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 mb-6 text-rose-200">
          <p className="text-sm">⚠️ Failed to load round data: {roundDataError}</p>
        </div>
      )}

      {/* Show "Data Not Available" only when round is pending (not yet started) */}
      {!roundDataError && isRoundStarting ? (
        <div className="mt-6 mb-6">
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-50"></div>
            <div className="relative px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-2xl">
                <PiInfoDuotone className="h-8 w-8 text-amber-300" />
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
                  onClick={() => globalThis.location.reload()}
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
      ) : !roundDataError ? (
        <>
      {/* Header */}
          <RoundHeaderInline
            round={roundInfo}
            roundLoading={roundDataLoading}
            progressData={progressData}
            progressLoading={roundStatusLoading}
          />

      {/* Recents removed: using Prev/Next navigation in header */}

      {/* Round Progress removed: already shown in main header card */}

      {/* Show message if round is active, otherwise show metrics */}
      {isActive ? (
        <div className="mt-6 mb-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10 p-4 sm:p-5 shadow-lg backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-60" />
            <div className="relative flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-xl border-2 border-amber-300/60 bg-white/10 flex items-center justify-center shadow-inner">
                <PiInfoDuotone className="h-8 w-8 text-amber-200" />
              </div>
              <div className="flex-1">
                <p className="text-lg sm:text-xl font-bold text-amber-100 uppercase tracking-wide mb-2">
                  Round in progress
                </p>
                <p className="text-sm sm:text-base text-white/80 font-medium max-w-2xl">
                  This round is in progress. Results and rankings will be available once evaluations are complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Post-Consensus Metrics */}
      <div className="mt-6 mb-4">
            {roundDataLoading ? (
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-8 h-8 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-56 bg-white/10" />
                  <Skeleton className="h-3 w-36 bg-white/10" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg ring-2 ring-emerald-400/20 flex-shrink-0">
                  <PiCheckCircleDuotone className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-base font-black text-white leading-tight">
                    {isWaitingForConsensus
                      ? "Waiting for consensus…"
                      : (() => {
                          const rNum = roundNumberForLinks;
                          return rNum != null ? `Season rank after round ${rNum}` : "Season rank";
                        })()}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      Post-Consensus Metrics
                    </span>
                  </p>
                </div>
              </div>
            )}
            {/* ── Leadership Rule Strip ── */}
            {(() => {
              const lr = roundData?.post_consensus_json?.leadership_rule;
              if (!lr) return null;
              const det = lr.dethroned;
              const reigningReward = lr.reigning_reward ?? lr.reigning_score;
              const challengerReward = lr.challenger_reward ?? lr.challenger_score;
              const reignPct = formatRewardPercent(reigningReward);
              const chalPct = challengerReward != null ? formatRewardPercent(challengerReward) : null;
              const thresholdPct = `+${(lr.required_improvement_pct * 100).toFixed(1)}%`;
              const needed = reigningReward != null && challengerReward != null
                ? `${((reigningReward * (1 + lr.required_improvement_pct) - challengerReward) * 100).toFixed(3)}%`
                : null;
              return (
                <div className={cn(
                  "relative overflow-hidden rounded-xl border mb-4 mt-4",
                  det
                    ? "border-emerald-500/25 bg-emerald-950/40"
                    : "border-amber-400/15 bg-amber-950/35"
                )}>
                  <div className={cn("h-[1.5px] w-full", det
                    ? "bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                    : "bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
                  )} />

                  <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">

                    {/* Col 1: Season rule label */}
                    <div className="flex items-center gap-2.5 px-4 py-3 sm:w-auto sm:flex-shrink-0">
                      <PiInfoDuotone className={cn("h-3.5 w-3.5 flex-shrink-0", det ? "text-emerald-400" : "text-amber-400/70")} />
                      <div>
                        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", det ? "text-emerald-400/70" : "text-amber-400/60")}>
                          Season rule
                        </p>
                        <p className="text-[10px] text-white/55 font-semibold">{thresholdPct} to dethrone</p>
                      </div>
                    </div>

                    {/* Col 2: Reigning before this round */}
                    {lr.reigning_uid != null && (
                      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/15">
                          <PiTrophyDuotone className="h-3.5 w-3.5 text-amber-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-400/50 mb-0.5">
                            Reigning before this round
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center rounded-md border border-amber-400/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                              UID {lr.reigning_uid}
                            </span>
                            <span className="text-[12px] font-bold text-amber-100 truncate">
                              {lr.reigning_name || "—"}
                            </span>
                            <span className="text-[12px] font-black font-mono text-amber-300">{reignPct}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* vs — only show when there is an actual reigning leader to compare against */}
                    {lr.reigning_uid != null && lr.challenger_uid != null && chalPct && (
                      <div className="hidden sm:flex items-center justify-center w-7 flex-shrink-0">
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">vs</span>
                      </div>
                    )}

                    {/* Col 3: Challenger this round */}
                    {lr.challenger_uid != null && chalPct && (
                      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15">
                          <PiChartLineUpDuotone className="h-3.5 w-3.5 text-sky-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-sky-400/50 mb-0.5">
                            Challenger this round
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center rounded-md border border-sky-400/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-black text-sky-300">
                              UID {lr.challenger_uid}
                            </span>
                            <span className="text-[12px] font-bold text-sky-100 truncate">
                              {lr.challenger_name || "—"}
                            </span>
                            <span className="text-[12px] font-black font-mono text-sky-300">{chalPct}</span>
                            {!det && needed && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-black text-rose-300/70 self-center">
                                −{needed}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Col 4: Current leader after round */}
                    <div className="flex items-center gap-3 px-4 py-3 sm:flex-shrink-0">
                      <div className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border",
                        det ? "border-emerald-400/35 bg-emerald-500/20" : "border-amber-400/30 bg-amber-500/15"
                      )}>
                        <PiCrownDuotone className={cn("h-3.5 w-3.5", det ? "text-emerald-300" : "text-amber-300")} />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-0.5", det ? "text-emerald-400/60" : "text-amber-400/60")}>
                          Current leader
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn(
                            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-black",
                            det ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-300" : "border-amber-400/20 bg-amber-500/10 text-amber-300"
                          )}>
                            UID {lr.season_leader_uid ?? lr.reigning_uid ?? "—"}
                          </span>
                          <span className={cn("text-[12px] font-bold truncate", det ? "text-emerald-100" : "text-amber-100")}>
                            {det ? (lr.challenger_name || "—") : (lr.reigning_name || "—")}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {seasonSummary ? (
              <RoundStatsInline
                selectedValidator={selectedValidator}
                statistics={statistics}
                topMiners={topMiners}
                postConsensusSummary={roundData?.post_consensus_json ?? null}
                loading={roundDataLoading}
                error={roundDataError ?? undefined}
                seasonParam={seasonParam ?? undefined}
                roundParam={roundNumberForLinks ?? undefined}
              />
            ) : (
              <div className="mb-4 rounded-2xl border border-white/15 bg-white/5 px-6 py-6 text-white/70">
                No post-consensus season summary has been materialized for this round yet.
              </div>
            )}

      </div>

      {/* Selected validator metric cards */}
      {(() => {
        if (roundDataLoading) {
          return (
            <>
              <div className="flex items-center gap-3 mt-6 mb-4">
                <Skeleton className="w-1.5 h-8 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-56 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className={cn("h-36", skeletonCard)} />
                ))}
              </div>
            </>
          );
        }
        if (selectedValidator) {
          return (
            <>
              {/* Local metrics header */}
              <div className="flex items-center gap-3 mt-6 mb-4">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-sky-400 to-cyan-500 shadow shadow-sky-500/40" />
                <div>
                  <span className="text-sm font-bold text-white/90 uppercase tracking-wider">
                    Validator competition state
                  </span>
                  <span className="mx-2 text-white/30">·</span>
                  <span className="text-sm font-semibold text-sky-300">
                    {selectedValidator.name ?? `Validator ${selectedValidator.id.replace("validator-", "")}`}
                  </span>
                  <p className="text-xs text-white/50 mt-0.5">
                    Best local rewards used by this validator for round competition
                  </p>
                </div>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,1fr)_minmax(0,2fr)]">
                <LocalMetricCard card={selectedValidatorCards[0]} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {selectedValidatorCards.slice(1).map((card) => (
                    <LocalMetricCard key={(card as any).key} card={card} />
                  ))}
                </div>
              </div>
            </>
          );
        }
        return null;
      })()}

      {/* IPFS & Consensus (validator detail) — always show section; cards clickable when data exists */}
      {selectedValidator && roundData?.validators && (() => {
        const validatorUid = selectedValidator.id.replace("validator-", "");
        const selfValidatorUid = Number.parseInt(validatorUid, 10);
        const v = roundData.validators.find(
          (x: any) => String(x.validator_uid) === validatorUid || String(x.validator_uid) === selectedValidator.id
        );
        const vAny = v as any;
        const hasIpfs =
          vAny?.ipfs_uploaded ||
          vAny?.ipfs_downloaded ||
          vAny?.evaluation_post_consensus ||
          vAny?.post_consensus_evaluation;
        const ipfsUp = vAny?.ipfs_uploaded as Record<string, unknown> | undefined;
        const ipfsDown = vAny?.ipfs_downloaded as Record<string, unknown> | undefined;
        const evaluationPost = (vAny?.evaluation_post_consensus ?? vAny?.post_consensus_evaluation) as Record<string, unknown> | undefined;
        const ipfsGateway = (cid: string) => `https://ipfs.io/ipfs/${cid}`;
        const pickCanonicalIpfsPayload = (raw: unknown, depth = 0): Record<string, unknown> | null => {
          if (!raw || typeof raw !== "object" || depth > 5) return null;
          const obj = raw as any;

          const hasMiners = Array.isArray(obj?.miners);
          if (hasMiners) {
            return {
              v: obj?.v ?? null,
              s: obj?.s ?? obj?.season ?? null,
              r: obj?.r ?? obj?.round ?? null,
              es: obj?.es ?? null,
              et: obj?.et ?? null,
              hk: obj?.hk ?? obj?.validator_hotkey ?? null,
              uid: obj?.uid ?? obj?.validator_uid ?? null,
              validator_uid: obj?.validator_uid ?? obj?.uid ?? null,
              validator_hotkey: obj?.validator_hotkey ?? obj?.hk ?? null,
              validator_version: obj?.validator_version ?? null,
              validator_round_id: obj?.validator_round_id ?? null,
              miners: obj?.miners ?? [],
              summary: obj?.summary ?? null,
            };
          }

          const hasScores = obj?.scores && typeof obj.scores === "object" && !Array.isArray(obj.scores);
          if (hasScores) {
            return {
              r: obj?.r ?? null,
              s: obj?.s ?? null,
              v: obj?.v ?? null,
              es: obj?.es ?? null,
              et: obj?.et ?? null,
              hk: obj?.hk ?? null,
              uid: obj?.uid ?? null,
              scores: obj?.scores ?? {},
              validator_uid: obj?.validator_uid ?? null,
              validator_hotkey: obj?.validator_hotkey ?? null,
              validator_version: obj?.validator_version ?? null,
              validator_round_id: obj?.validator_round_id ?? null,
            };
          }

          return (
            pickCanonicalIpfsPayload(obj?.payload, depth + 1) ||
            pickCanonicalIpfsPayload(obj?.data, depth + 1) ||
            pickCanonicalIpfsPayload(obj?.content, depth + 1) ||
            null
          );
        };

        const buildIpfsUploadModalData = (
          payload: Record<string, unknown> | undefined,
          downloaded: Record<string, unknown> | undefined
        ) => {
          if (!payload) return payload;
          const p = payload as any;
          let canonicalPayload = pickCanonicalIpfsPayload(p?.payload ?? p);

          // Some validators persist only CID on ipfs_uploaded.
          // If payload is missing, recover it from ipfs_downloaded payloads by CID.
          if (!canonicalPayload && p?.cid && downloaded && typeof downloaded === "object") {
            const d = downloaded as any;
            const entries = Array.isArray(d?.payloads) ? d.payloads : [];
            const sameCid = entries.find((entry: any) => entry?.cid === p.cid);
            canonicalPayload = pickCanonicalIpfsPayload(sameCid?.payload ?? sameCid);
          }

          const payloadPreview = canonicalPayload ?? { note: p?.payload?.note ?? "Payload not available" };
          return {
            cid: p?.cid ?? null,
            uid: p?.uid ?? null,
            stake: p?.stake ?? null,
            validator_hotkey: p?.validator_hotkey ?? null,
            payload: payloadPreview,
          };
        };
        const buildIpfsDownloadModalData = (payload: Record<string, unknown> | undefined) => {
          if (!payload) return payload;
          const p = payload as any;
          const cleanPayloads = Array.isArray(p?.payloads)
            ? p.payloads.map((entry: any) => ({
                cid: entry?.cid ?? null,
                validator_uid: entry?.validator_uid ?? null,
                validator_hotkey: entry?.validator_hotkey ?? null,
                payload:
                  pickCanonicalIpfsPayload(entry?.payload ?? entry) ??
                  { note: entry?.payload?.note ?? "Payload not available" },
              }))
            : [];
          return {
            validators_participated: p?.validators_participated ?? cleanPayloads.length ?? 0,
            total_stake: p?.total_stake ?? null,
            self_validator_uid: Number.isFinite(selfValidatorUid) ? selfValidatorUid : null,
            payloads: cleanPayloads,
          };
        };
        const cardClass = "rounded-xl border border-white/20 bg-white/5 p-4 text-left transition-all " + (hasIpfs ? "cursor-pointer hover:border-white/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]" : "opacity-80");
        // UID 5 (Burned) does not count as a miner.
        // Prefer counting actual participants (non-zero activity/score), then fallback.
        const countMinersExcludingBurned = (evaluationPayload: unknown): number => {
          if (!evaluationPayload || typeof evaluationPayload !== "object") return 0;
          const raw = evaluationPayload as any;
          const payload =
            raw?.evaluation_post_consensus ??
            raw?.post_consensus_evaluation ??
            raw;

          if (Array.isArray(payload.miners)) {
            const miners = payload.miners.filter((m: any) => {
              const uid = m?.uid ?? m?.miner_uid;
              return uid != null && Number(uid) !== 5;
            });

            const participants = miners.filter((m: any) => {
              const tasksSent = Number(
                m?.tasks_sent ??
                m?.tasks_received ??
                m?.post_consensus_tasks_received ??
                m?.local_tasks_received ??
                0
              );
              const reward = Number(
                m?.consensus_reward ??
                m?.reward ??
                m?.post_consensus_avg_reward ??
                m?.local_avg_reward ??
                0
              );
              const evalScore = Number(
                m?.avg_eval_score ??
                m?.post_consensus_avg_eval_score ??
                m?.local_avg_eval_score ??
                0
              );
              const evalTime = Number(
                m?.avg_eval_time ??
                m?.post_consensus_avg_eval_time ??
                m?.local_avg_eval_time ??
                0
              );
              return tasksSent > 0 || reward > 0 || evalScore > 0 || evalTime > 0;
            });

            return participants.length > 0 ? participants.length : miners.length;
          }

          const minerScores = payload?.round_summary?.miner_scores;
          if (minerScores && typeof minerScores === "object") {
            const entries = Object.entries(minerScores).filter(([uid]) => Number(uid) !== 5);
            const nonZero = entries.filter(([, score]) => Number(score ?? 0) > 0);
            return nonZero.length > 0 ? nonZero.length : entries.length;
          }

          return 0;
        };
        const cardTitleRowClass = "flex items-center gap-2 min-h-6 mb-2";
        return (
          <div className={cn("mt-4 mb-4", roundGlassBackgroundClass, "rounded-2xl p-4 border-white/20")}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PiCirclesThreeDuotone className="h-5 w-5 text-cyan-400" />
                Consensus & IPFS
              </h3>
              <button
                type="button"
                onClick={() =>
                  setIpfsConsensusDetail({
                    type: "how_consensus",
                    title: "How consensus works",
                    data: {},
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-300/60 transition-colors"
              >
                <LuInfo className="h-4 w-4" />
                How consensus works?
              </button>
            </div>
            {hasIpfs ? (
              <p className="text-white/60 text-sm mb-4">Click a card to see full details.</p>
            ) : (
              <p className="text-white/50 text-sm mb-4">No IPFS/consensus data for this validator in this round yet. Data appears after the round ends and the validator sends results.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Validator consensus — final metrics (first card) */}
              {evaluationPost ? (
                <button
                  type="button"
                  className={cardClass}
                  onClick={() => setIpfsConsensusDetail({ type: "post_consensus", title: "Validator consensus — Results Averaged Across All Validators After Consensus", data: evaluationPost })}
                >
                  <div className={cn(cardTitleRowClass, "text-orange-400")}>
                    <PiChartLineDownDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Validator consensus</span>
                  </div>
                  <p className="text-white/80 text-sm">Results Averaged Across All Validators After Consensus.</p>
                  <p className="text-white/60 text-xs mt-1">{countMinersExcludingBurned(evaluationPost)} miners</p>
                  <p className="text-orange-400/80 text-xs mt-2">Click to view full payload →</p>
                </button>
              ) : (
                <div className={cardClass}>
                  <div className={cn(cardTitleRowClass, "text-orange-400/70")}>
                    <PiChartLineDownDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Validator consensus</span>
                  </div>
                  <p className="text-white/60 text-sm">Results Averaged Across All Validators After Consensus.</p>
                  <p className="text-white/40 text-xs mt-6">No data for this round yet.</p>
                </div>
              )}
              {/* IPFS Upload — always visible */}
              {ipfsUp ? (
                <button
                  type="button"
                  className={cardClass}
                  onClick={() => {
                    setIpfsUploadFullPayload(null);
                    setIpfsConsensusDetail({
                      type: "upload",
                      title: "IPFS Uploaded — What this validator published",
                      data: buildIpfsUploadModalData(ipfsUp, ipfsDown),
                    });
                  }}
                >
                  <div className={cn(cardTitleRowClass, "text-teal-400")}>
                    <PiCloudArrowUpDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">IPFS Uploaded</span>
                  </div>
                  <p className="text-white/80 text-sm">Local validator snapshot published for consensus.</p>
                  {(ipfsUp as any).cid && (
                    <a
                      href={ipfsGateway((ipfsUp as any).cid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-block text-cyan-400 hover:underline text-sm font-mono break-all"
                    >
                      {(ipfsUp as any).cid.slice(0, 20)}…
                    </a>
                  )}
                  <p className="text-teal-400/80 text-xs mt-2">Click to view full payload →</p>
                </button>
              ) : (
                <div className={cardClass}>
                  <div className={cn(cardTitleRowClass, "text-teal-400/70")}>
                    <PiCloudArrowUpDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">IPFS Uploaded</span>
                  </div>
                  <p className="text-white/60 text-sm">Local validator snapshot published for consensus.</p>
                  <p className="text-white/40 text-xs mt-6">No data for this round yet.</p>
                </div>
              )}
              {/* IPFS Download — always visible */}
              {ipfsDown ? (
                <button
                  type="button"
                  className={cardClass}
                  onClick={() => {
                    setIncludeOwnDownloadedPayload(false);
                    setIpfsConsensusDetail({
                      type: "download",
                      title: "IPFS Downloaded — Payloads from other validators",
                      data: buildIpfsDownloadModalData(ipfsDown),
                    });
                  }}
                >
                  <div className={cn(cardTitleRowClass, "text-violet-400")}>
                    <PiCloudArrowDownDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">IPFS Downloaded</span>
                  </div>
                  <p className="text-white/80 text-sm">Payloads downloaded from other validators.</p>
                  {(ipfsDown as any).validators_participated != null && (
                    <p className="text-white font-medium mt-2">{(ipfsDown as any).validators_participated} validators</p>
                  )}
                  {(ipfsDown as any).total_stake != null && (ipfsDown as any).total_stake > 0 && (
                    <p className="text-white/60 text-xs">Total stake: {Number((ipfsDown as any).total_stake).toFixed(2)} τ</p>
                  )}
                  <p className="text-violet-400/80 text-xs mt-2">Click to view all payloads →</p>
                </button>
              ) : (
                <div className={cardClass}>
                  <div className={cn(cardTitleRowClass, "text-violet-400/70")}>
                    <PiCloudArrowDownDuotone className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold text-sm uppercase tracking-wider">IPFS Downloaded</span>
                  </div>
                  <p className="text-white/60 text-sm">Payloads downloaded from other validators.</p>
                  <p className="text-white/40 text-xs mt-6">No data for this round yet.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal: full IPFS / Consensus detail when user clicks a card */}
      {ipfsConsensusDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeIpfsDialog}
          role="dialog"
          aria-modal="true"
          aria-label="IPFS & Consensus detail"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close dialog"
            onClick={() => {
            setIpfsConsensusDetail(null);
            setIncludeOwnDownloadedPayload(false);
            setIpfsUploadFullPayload(null);
          }}
          />
          <div
            className={cn("relative z-10 max-h-[90vh] w-full max-w-3xl rounded-2xl border border-white/30 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl overflow-hidden", roundGlassBackgroundClass)}
          >
            <div className="flex items-center justify-between border-b border-white/20 px-6 py-4 gap-3">
              <h3 className="text-lg font-bold text-white truncate min-w-0">{ipfsConsensusDetail.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                {ipfsConsensusDetail.type !== "how_consensus" && (
                  <button
                    type="button"
                    onClick={() => {
                      const data = ipfsConsensusDetail.data as Record<string, unknown> | undefined;
                      if (ipfsConsensusDetail.type === "download") {
                        const payloads = Array.isArray(data?.payloads) ? data.payloads : [];
                        const selfUid = Number(data?.self_validator_uid);
                        const filtered =
                          includeOwnDownloadedPayload || !Number.isFinite(selfUid)
                            ? payloads
                            : payloads.filter((e: { validator_uid?: unknown }) => Number(e?.validator_uid) !== selfUid);
                        const str = JSON.stringify(
                          {
                            validators_participated: data?.validators_participated ?? payloads.length,
                            total_stake: data?.total_stake ?? null,
                            payloads: filtered,
                          },
                          null,
                          2
                        );
                        void navigator.clipboard.writeText(str).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      } else {
                        const toCopy =
                          ipfsConsensusDetail.type === "upload" && ipfsUploadFullPayload
                            ? ipfsUploadFullPayload
                            : data ?? {};
                        void navigator.clipboard
                          .writeText(JSON.stringify(toCopy, null, 2))
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                      }
                    }}
                    className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
                    aria-label="Copy payload"
                    title="Copy payload"
                  >
                    {copied ? (
                      <PiCheckDuotone className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <PiCopyDuotone className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIpfsConsensusDetail(null);
                    setIncludeOwnDownloadedPayload(false);
                    setIpfsUploadFullPayload(null);
                  }}
                  className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <PiXBold className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)] p-6">
              {ipfsConsensusDetail.type === "how_consensus" ? (
                <div className="space-y-4 text-white/85 text-sm leading-relaxed">
                  <p>
                    1. Each validator evaluates miners locally and keeps two local views per miner:
                    `best_run` and `current_run`.
                  </p>
                  <p>
                    2. Each validator uploads that local snapshot to IPFS (`IPFS Uploaded`), then downloads
                    peers&apos; snapshots (`IPFS Downloaded`).
                  </p>
                  <p>
                    3. Final consensus combines validators using stake-weighted aggregation of `best_run`
                    to produce final ranks and weights.
                  </p>
                  <p>
                    4. `Validator consensus` shows the final post-consensus result. `IPFS Uploaded`
                    shows the raw local snapshot this validator published.
                  </p>
                </div>
              ) : ipfsConsensusDetail.type === "download" ? (
                (() => {
                  const data = (ipfsConsensusDetail.data ?? {}) as any;
                  const payloads = Array.isArray(data?.payloads) ? data.payloads : [];
                  const selfUid = Number(data?.self_validator_uid);
                  let filteredPayloads: typeof payloads;
                  if (includeOwnDownloadedPayload || !Number.isFinite(selfUid)) {
                    filteredPayloads = payloads;
                  } else {
                    filteredPayloads = payloads.filter((entry: any) => Number(entry?.validator_uid) !== selfUid);
                  }
                  const shownData = {
                    validators_participated: data?.validators_participated ?? payloads.length,
                    total_stake: data?.total_stake ?? null,
                    payloads: filteredPayloads,
                  };
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white/70 text-xs">
                          Showing {filteredPayloads.length} payload(s)
                        </p>
                        <button
                          type="button"
                          onClick={() => setIncludeOwnDownloadedPayload((prev) => !prev)}
                          className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10 transition-colors"
                        >
                          {includeOwnDownloadedPayload ? "Hide own payload" : "Include own payload"}
                        </button>
                      </div>
                      <pre className="text-sm text-cyan-100/90 font-mono whitespace-pre-wrap break-words bg-black/30 rounded-xl p-4">
                        {JSON.stringify(shownData, null, 2)}
                      </pre>
                    </div>
                  );
                })()
              ) : ipfsConsensusDetail.type === "upload" &&
                (ipfsConsensusDetail.data as { cid?: string } | undefined)?.cid ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://ipfs.io/ipfs/${(ipfsConsensusDetail.data as { cid?: string }).cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      <PiArrowSquareOutDuotone className="h-4 w-4" />
                      Open in IPFS
                    </a>
                    <button
                      type="button"
                      disabled={ipfsUploadLoading}
                      onClick={() => {
                        const cid = (ipfsConsensusDetail.data as { cid?: string }).cid;
                        if (!cid) return;
                        setIpfsUploadLoading(true);
                        fetch(`https://ipfs.io/ipfs/${cid}`)
                          .then((r) => r.json())
                          .then((body) => {
                            setIpfsUploadFullPayload(body ?? null);
                          })
                          .catch(() => setIpfsUploadFullPayload(null))
                          .finally(() => setIpfsUploadLoading(false));
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-violet-400/50 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                    >
                      {ipfsUploadLoading ? "Loading…" : "Load full payload from IPFS"}
                    </button>
                  </div>
                  <pre className="text-sm text-cyan-100/90 font-mono whitespace-pre-wrap break-words bg-black/30 rounded-xl p-4">
                    {JSON.stringify(
                      ipfsUploadFullPayload ?? ipfsConsensusDetail.data,
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : (
                <pre className="text-sm text-cyan-100/90 font-mono whitespace-pre-wrap break-words bg-black/30 rounded-xl p-4">
                  {JSON.stringify(ipfsConsensusDetail.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScoresInline
          className="w-full xl:w-[calc(100%-400px)]"
          selectedValidator={selectedValidator}
          roundInfo={roundInfo}
          minersData={undefined}
          roundData={roundData}
          loading={roundDataLoading}
          error={roundDataError ?? undefined}
        />
        <RoundTopMinersInline
          className="w-full xl:w-[400px]"
          selectedValidator={selectedValidator}
          roundNumber={roundNumberForLinks}
          roundInfo={roundInfo}
          minersData={undefined}
          roundData={roundData} // ✅ Pasar roundData
          loading={roundDataLoading}
          error={roundDataError ?? undefined}
        />
      </div>
        </>
      )}

      {/* Floating bottom bar: round nav (top) + validator selector (bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1100px]">
        <div className="rounded-2xl border border-white/15 bg-[rgb(12,12,14)]/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            {/* Round nav - top level, centered */}
            <div className="flex items-center justify-center gap-1.5 px-4 pt-2.5 pb-2">
              <button
                type="button"
                onClick={() => goToRound(neighborRounds.previous?.roundKey)}
                disabled={!neighborRounds.previous?.roundKey}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:text-white/20 disabled:cursor-not-allowed"
              >
                <PiCaretLeftBold className="h-3 w-3" />
                <span className="hidden sm:inline">R{neighborRounds.previous?.roundNumber ?? "—"}</span>
              </button>
              <span className="text-sm font-black text-white px-2">
                Round {roundParam}
              </span>
              {neighborRounds.next?.roundKey && (
                <button
                  type="button"
                  onClick={() => goToRound(neighborRounds.next?.roundKey)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <span className="hidden sm:inline">R{neighborRounds.next?.roundNumber ?? "—"}</span>
                  <PiCaretRightBold className="h-3 w-3" />
                </button>
              )}
            </div>
            {/* Validators carousel - bottom level */}
            <div className="border-t border-white/10 px-4 pb-2.5 pt-2">
              <RoundValidatorsInline
                onValidatorSelect={handleValidatorSelect}
                selectedValidatorId={selectedValidator?.id ?? null}
                requestedValidatorId={requestedValidatorId}
                roundData={roundData}
                loading={roundDataLoading}
                error={roundDataError ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>

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

  if ((progressError || roundError) && !progressLoading && !roundLoading) {
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
