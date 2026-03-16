"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/config/routes";
import {
  formatWebsiteName,
  getProjectColors,
} from "@/utils/website-colors";

import PageHeader from "@/app/shared/page-header";
import Placeholder, { TableRowPlaceholder } from "@/app/shared/placeholder";

import cn from "@core/utils/class-names";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";

import { Select, Button, Input } from "rizzui";
import Image from "next/image";

import {
  PiArrowLeftLight,
  PiTrendUp,
  PiTrendDown,
  PiChartBar,
  PiTarget,
  PiCheckCircle,
  PiXCircle,
  PiClock,
  PiGlobe,
  PiEyeBold,
  PiMagnifyingGlassBold,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
  PiCopySimple,
} from "react-icons/pi";

import { useAgentRunComplete } from "@/services/hooks/useAgentRun";
import type {
  AgentRunStats as AgentRunStatsData,
  AgentRunEvaluationData,
} from "@/repositories/agent-runs/agent-runs.types";
import { createColumnHelper, type Table as TanStackTableType } from "@tanstack/react-table";
import { resolveAssetUrl } from "@/services/utils/assets";

// Local types for consolidated view models
interface AgentRunUseCase {
  id: string | number;
  name: string;
}

interface AgentRunResult {
  useCaseId: string | number;
  name: string;
  successRate: number; // percentage 0-100
  total: number;
  successCount: number;
  avgSolutionTime: number; // seconds
  avgReward: number;
  avgCost: number;
  dominantZeroReason?: string | null;
}

interface AgentRunWebsite {
  name: string;
  useCases: AgentRunUseCase[];
  results: AgentRunResult[];
  overall: {
    successRate: number;
    total: number;
    successCount: number;
    avgSolutionTime: number;
    avgReward: number;
    avgCost: number;
    dominantZeroReason?: string | null;
  };
}

interface AgentRunDetailData {
  websites: AgentRunWebsite[];
}

// Visual constants
const HIGHLIGHT_COLOR = "#FDF5E6";
const PROGRESS_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#EC4899",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
  "#EAB308",
  "#0EA5E9",
  "#D946EF",
  "#F43F5E",
];

const REWARD_FORMULA =
  "Reward = (Score Weight × 1.0) + (Time Weight × (1 − time / Task Timeout)) + (Cost Weight × (1 − cost / Cost Normalizer))";
const OVER_COST_LIMIT = 0.05;

// Utilities
function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function extractUidNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value))
    return Math.max(0, Math.abs(value));
  if (typeof value === "string") {
    const match = /\d+/.exec(value);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      if (!Number.isNaN(parsed)) return Math.max(0, parsed);
    }
  }
  return null;
}

function IDCopyButton({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md bg-white/10 p-1.5 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-300">✓</span>
      ) : (
        <PiCopySimple className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function formatUseCaseName(name?: string | null): string {
  if (!name) return "Use Case";
  return name
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function humanizeZeroReason(reason: string): string {
  if (!reason || typeof reason !== "string") return reason || "—";
  return reason
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function summarizeFailureReason(
  reason?: string | null,
  cost?: number | null
): string | null {
  if (typeof cost === "number" && !Number.isNaN(cost) && cost > OVER_COST_LIMIT) {
    return "Over Cost Limit";
  }
  if (!reason) return null;
  const normalized = reason.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "task_timeout" || normalized === "timeout") return "Timeout";
  if (normalized === "over_cost_limit") return "Over Cost Limit";
  if (
    normalized === "task_failed" ||
    normalized === "tests_failed" ||
    normalized === "ref_not_found"
  ) {
    return "Task Failed";
  }
  return humanizeZeroReason(normalized);
}

function normalizeRoundInSeason(
  roundValue: unknown,
  seasonValue?: unknown
): number | null {
  const parseNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };
  const roundNum = parseNumber(roundValue);
  const seasonNum = parseNumber(seasonValue);
  if (roundNum === null) return null;
  if (roundNum >= 10000) {
    if (seasonNum !== null && roundNum >= seasonNum * 10000) {
      const decoded = roundNum - seasonNum * 10000;
      if (decoded > 0) return decoded;
    }
    const mod = roundNum % 10000;
    if (mod > 0) return mod;
  }
  return roundNum > 0 ? roundNum : null;
}

function normalizePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

// Transform stats to local detail model (no external utils)
function buildDetailDataFromStats(
  stats?: AgentRunStatsData | null,
  evaluations?: AgentRunEvaluationData[] | null
): AgentRunDetailData {
  if (!stats) return { websites: [] };

  const reasonsByWebsite = new Map<string, Map<string, number>>();
  const reasonsByWebsiteUseCase = new Map<string, Map<string, number>>();

  for (const evaluation of evaluations ?? []) {
    const rawReason = evaluation.zeroReason ?? null;
    const summarized = summarizeFailureReason(rawReason, evaluation.cost ?? null);
    if (!summarized) continue;

    const websiteKey = String(evaluation.website || "unknown");
    const useCaseKey = `${websiteKey}::${String(evaluation.useCase || "UNKNOWN")}`;

    const siteMap = reasonsByWebsite.get(websiteKey) ?? new Map<string, number>();
    siteMap.set(summarized, (siteMap.get(summarized) ?? 0) + 1);
    reasonsByWebsite.set(websiteKey, siteMap);

    const useCaseMap = reasonsByWebsiteUseCase.get(useCaseKey) ?? new Map<string, number>();
    useCaseMap.set(summarized, (useCaseMap.get(summarized) ?? 0) + 1);
    reasonsByWebsiteUseCase.set(useCaseKey, useCaseMap);
  }

  const pickDominantReason = (counter?: Map<string, number>): string | null => {
    if (!counter || counter.size === 0) return null;
    const [reason] = Array.from(counter.entries()).sort((a, b) => b[1] - a[1])[0];
    return reason;
  };

  const websites: AgentRunWebsite[] = (stats.performanceByWebsite || []).map(
    (w, i) => {
      const statsByUsecase = (w as { statsByUsecase?: Array<{ useCase?: string; avgScore?: number; total?: number; successful?: number; avgTime?: number; avgReward?: number; avgCost?: number }> }).statsByUsecase ?? [];

      const websiteUseCases: AgentRunUseCase[] = statsByUsecase.map((uc: any, idx: number) => ({
        id: idx,
        name: uc.useCase || `Use Case ${idx + 1}`,
      }));

      const websiteResults: AgentRunResult[] = statsByUsecase.map((uc: any, idx: number) => ({
        useCaseId: idx,
        name: uc.useCase || `Use Case ${idx + 1}`,
        // avgScore is success rate (0-1) from backend
        successRate: typeof uc.avgScore === "number" ? uc.avgScore : 0,
        total: uc.total || 0,
        successCount: uc.successful || 0,
        avgSolutionTime: typeof uc.avgTime === "number" ? uc.avgTime : 0,
        avgReward: typeof uc.avgReward === "number" ? uc.avgReward : 0,
        avgCost: typeof uc.avgCost === "number" ? uc.avgCost : 0,
        dominantZeroReason: pickDominantReason(
          reasonsByWebsiteUseCase.get(`${String(w.website || `Website ${i + 1}`)}::${String(uc.useCase || `Use Case ${idx + 1}`)}`)
        ),
      }));

      return {
        name: w.website || `Website ${i + 1}`,
        useCases: websiteUseCases,
        results: websiteResults,
        overall: {
          // averageScore is in 0-1 format from backend, keep as is
          successRate: typeof w.averageScore === "number" ? w.averageScore : 0,
          total: w.tasks || 0,
          successCount: w.successful || 0,
          avgSolutionTime:
            typeof w.averageDuration === "number" ? w.averageDuration : 0,
          avgReward: typeof (w as { averageReward?: number }).averageReward === "number" ? (w as { averageReward?: number }).averageReward ?? 0 : 0,
          avgCost: typeof (w as { averageCost?: number }).averageCost === "number" ? (w as { averageCost?: number }).averageCost ?? 0 : 0,
          dominantZeroReason: pickDominantReason(
            reasonsByWebsite.get(String(w.website || `Website ${i + 1}`))
          ),
        },
      };
    }
  );

  return { websites };
}

export default function Page() {
  const { id } = useParams();
  const runId = Array.isArray(id) ? id[0] : (id ?? "") || "";

  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  const {
    isLoading,
    error,
    refetch,
    statistics: stats,
    evaluations,
    info,
  } = useAgentRunComplete(runId);

  // Derived detail data from stats for charts/summary
  const detailData = useMemo(() => {
    return buildDetailDataFromStats(stats, evaluations);
  }, [stats, evaluations]);

  // Check if agent run has no data yet
  const hasNoData =
    !isLoading &&
    error &&
    (!stats ||
      (stats.totalTasks === 0 && stats.overallReward === 0));

  const roundInfo = info?.round as Record<string, unknown> | undefined;
  const currentSeasonNumber =
    normalizePositiveInt(roundInfo?.season_number ?? roundInfo?.season) ?? null;
  const currentRoundInSeason =
    normalizeRoundInSeason(
      roundInfo?.round_number_in_season ??
        roundInfo?.roundNumber ??
        roundInfo?.round,
      currentSeasonNumber
    ) ?? null;
  const roundDisplayLabel =
    currentSeasonNumber !== null && currentRoundInSeason !== null
      ? `Season ${currentSeasonNumber}, Round ${currentRoundInSeason}`
      : (roundInfo?.roundId as string | undefined) ??
        (roundInfo?.validatorRoundId as string | undefined) ??
        "—";
  const roundLinkHref =
    currentSeasonNumber !== null && currentRoundInSeason !== null
      ? `${routes.rounds}/${currentSeasonNumber}/${currentRoundInSeason}`
      : "#";
  const reusedRoundInSeason = normalizeRoundInSeason(
    (info?.reusedFrom as Record<string, unknown> | undefined)?.roundNumber,
    (info?.reusedFrom as Record<string, unknown> | undefined)?.seasonNumber
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title="Agent Run Details"
        description={
          isLoading ? (
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
              <div className="inline-flex w-full sm:w-auto items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Round
                </span>
                <div className="h-3.5 w-px bg-slate-600/70" />
                <Placeholder
                  height="0.875rem"
                  width="6rem"
                  className="bg-white/10"
                />
              </div>
              <div className="inline-flex w-full sm:w-auto items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Run
                </span>
                <div className="h-3.5 w-px bg-slate-600/70" />
                <Placeholder
                  height="0.875rem"
                  width="6rem"
                  className="bg-white/10"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
              <Link
                href={((): string => {
                  const roundKey =
                    typeof info?.round?.roundNumber === "number" &&
                    Number.isFinite(info.round.roundNumber)
                      ? `round_${info.round.roundNumber}`
                      : (info?.round?.validatorRoundId ?? "");
                  return roundKey
                    ? `${routes.rounds}/${encodeURIComponent(roundKey)}`
                    : "#";
                })()}
                className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-amber-400/60 hover:bg-amber-500/10"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Round
                </span>
                <div className="h-3.5 w-px bg-slate-600/70" />
                <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">
                  {truncateMiddle(info?.round?.validatorRoundId ?? "—", 8)}
                </span>
                {info?.round?.validatorRoundId && (
                  <span className="ml-auto">
                    <IDCopyButton text={info.round.validatorRoundId} />
                  </span>
                )}
              </Link>
              <Link
                href={
                  runId
                    ? `${routes.agent_run}/${encodeURIComponent(runId)}`
                    : "#"
                }
                className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-emerald-400/60 hover:bg-emerald-500/10"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Run
                </span>
                <div className="h-3.5 w-px bg-slate-600/70" />
                <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">
                  {truncateMiddle(runId, 8)}
                </span>
                {!!runId && (
                  <span className="ml-auto">
                    <IDCopyButton text={runId} />
                  </span>
                )}
              </Link>
            </div>
          )
        }
        className="mt-4"
      >
        <Link
          href={routes.agents}
          className="flex items-center text-white/70 transition-colors duration-200 hover:text-[#FDF5E6]"
        >
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agents</span>
        </Link>
      </PageHeader>

      {error && (
        <div className="mb-4 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white/80">
          Failed to refresh some sections. You can{" "}
          <button
            onClick={refetch}
            className="font-semibold text-[#FDF5E6] underline underline-offset-4 hover:text-white"
          >
            retry
          </button>{" "}
          or wait a moment while data loads.
        </div>
      )}


      {/* Personas cards (Round, Validator, Miner) */}
      {isLoading ? (
        <AgentRunPersonasPlaceholder />
      ) : (
        <AgentRunPersonasFromInfo info={info} />
      )}

      {isLoading ? (
        <AgentRunStatsPlaceholder />
      ) : (
        <AgentRunStats stats={stats || null} />
      )}

      {!isLoading && (() => {
        const zeroReasonRaw = info?.zeroReason ?? stats?.zeroReason;
        const zeroReason = typeof zeroReasonRaw === "string" ? zeroReasonRaw : "";
        const earlyStopReason =
          typeof info?.earlyStopReason === "string"
            ? info.earlyStopReason
            : typeof stats?.earlyStopReason === "string"
              ? stats.earlyStopReason
              : "";
        const earlyStopMessage =
          typeof info?.earlyStopMessage === "string"
            ? info.earlyStopMessage
            : typeof stats?.earlyStopMessage === "string"
              ? stats.earlyStopMessage
              : "";
        const hasZeroReward =
          !!stats && (stats.overallReward === 0 || (stats.avg_reward !== undefined && stats.avg_reward <= 0));

        if (hasZeroReward && zeroReason) {
          return (
            <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
              <span className="font-semibold">Reason for zero reward:</span>{" "}
              {humanizeZeroReason(zeroReason)}
            </div>
          );
        }

        if (earlyStopReason || earlyStopMessage) {
          return (
            <div className="mb-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
              <span className="font-semibold">Reason for early stop:</span>{" "}
              {earlyStopMessage || humanizeZeroReason(earlyStopReason)}
            </div>
          );
        }

        return null;
      })()}

      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        <div className="xl:col-span-8">
          {isLoading && <AgentRunDetailPlaceholder />}
          {!isLoading && (
            <AgentRunDetail
              selectedWebsite={selectedWebsite}
              setSelectedWebsite={setSelectedWebsite}
              data={detailData}
            />
          )}
        </div>
        <div className="xl:col-span-4">
          {isLoading ? (
            <AgentRunSummaryPlaceholder />
          ) : (
            <AgentRunSummary
              selectedWebsite={selectedWebsite}
              data={detailData}
            />
          )}
        </div>
      </div>

      <div className="mb-6">
        <AgentRunTasksSection
          evaluations={evaluations}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          selectedWebsite={selectedWebsite}
        />
      </div>

      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-transparent border border-blue-600/60 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Updating data...</span>
        </div>
      )}
    </div>
  );
}

// Personas card group - adapted to use info object
type AgentRunPersonasFromInfoProps = Readonly<{
  info: {
    agentRunId: string;
    round: any;
    validator: any;
    miner: any;
    zeroReason?: string | null;
    earlyStopReason?: string | null;
    earlyStopMessage?: string | null;
    tasksAttempted?: number | null;
  } | null;
}>;
function AgentRunPersonasFromInfo({ info }: AgentRunPersonasFromInfoProps) {
  if (!info) {
    return <AgentRunPersonasPlaceholder />;
  }

  const roundData = info.round || {
    roundNumber: null,
    validatorRoundId: null,
    status: "Active",
    startedAt: null,
    endedAt: null,
    startEpoch: null,
    endEpoch: null,
  };

  const validatorData = info.validator || {
    uid: null,
    hotkey: null,
    name: "Autoppia Validator",
    image: "/validators/Autoppia.png",
    coldkey: null,
    stake: 0,
    vtrust: 0,
    version: null,
  };

  const minerData = info.miner || {
    uid: null,
    hotkey: null,
    name: "Unknown Miner",
    image: null,
    github: null,
    isSota: false,
  };

  const validatorHotkey = validatorData.hotkey || validatorData.name || "—";
  const validatorUid = validatorData.uid ?? extractUidNumber(validatorHotkey);
  const taoStatsUrl = validatorHotkey && validatorHotkey !== "—"
    ? `https://taostats.io/validators/${validatorHotkey}`
    : null;

  const minerUid = minerData.uid ?? extractUidNumber(minerData.hotkey);
  const minerHotkey = minerData.hotkey || "—";

  const fallbackMinerImage = (() => {
    const uidCandidate = minerUid;
    if (uidCandidate === null) return "/images/autoppia-logo.png";
    const normalized = Math.abs(uidCandidate % 50);
    return `/miners/${normalized}.svg`;
  })();

  const minerImageSrc = minerData.image
    ? resolveAssetUrl(minerData.image)
    : resolveAssetUrl(fallbackMinerImage);
  const validatorImageSrc = validatorData.image
    ? resolveAssetUrl(validatorData.image)
    : resolveAssetUrl("/validators/Other.png");

  // Epoch helpers
  const epochStart = roundData.startEpoch ?? null;
  const epochEnd = roundData.endEpoch ?? null;
  const formatEpoch = (value: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? String(value) : "—";

  // Parse round number/ID - support "season/round" format
  // Priority: roundId (string "season/round") > roundData.season/round > roundNumber (legacy)
  const parseRoundInfo = () => {
    // First, try roundId as string in "season/round" format
    if (typeof roundData.roundId === "string" && roundData.roundId.includes("/")) {
      const parts = roundData.roundId.split("/");
      const season = parts[0]?.trim();
      const round = parts[1]?.trim();
      if (season && round && !Number.isNaN(Number(season)) && !Number.isNaN(Number(round))) {
        return { season, round };
      }
    }

    // Second, try to get from roundData directly (season_number, round_number_in_season)
    if (roundData.season_number !== undefined && roundData.round_number_in_season !== undefined) {
      return {
        season: String(roundData.season_number),
        round: String(roundData.round_number_in_season)
      };
    }

    // Third, try season and round fields
    if (roundData.season !== undefined && roundData.round !== undefined) {
      return {
        season: String(roundData.season),
        round: String(roundData.round)
      };
    }

    // If we have roundNumber that looks like legacy format (10001, 20003, etc), try to extract
    if (roundData.roundNumber && typeof roundData.roundNumber === "number") {
      const num = roundData.roundNumber;
      // Legacy format: season * 10000 + round
      if (num >= 10000) {
        const season = Math.floor(num / 10000);
        const round = num % 10000;
        if (season > 0 && round > 0) {
          return { season: String(season), round: String(round) };
        }
      }
    }

    // No valid data found
    return null;
  };

  const roundInfo = parseRoundInfo();
  const roundStatus = roundData.status || "Active";

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Round */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 text-white shadow-lg">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-black shadow">
              <PiClock className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-4">
              {roundInfo?.season && roundInfo?.round ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Season
                    </p>
                    <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                      {roundInfo.season}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Round
                    </p>
                    <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                      {roundInfo.round}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Round
                  </p>
                  <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                    {roundData.validatorRoundId ? truncateMiddle(roundData.validatorRoundId, 8) : "—"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              borderColor: "rgba(253, 245, 230, 0.45)",
              backgroundColor: "rgba(253, 245, 230, 0.12)",
              color: HIGHLIGHT_COLOR,
            }}
          >
            {roundStatus.replace(/^\w/, (c: string) =>
              c.toUpperCase()
            )}
          </span>
        </header>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 font-mono text-base text-white">
            <span className="uppercase tracking-[0.3em] text-xs text-white/60">
              Epoch:
            </span>
            <span className="whitespace-nowrap">
              {formatEpoch(epochStart)} - {formatEpoch(epochEnd ?? Math.floor(Date.now() / 1000))}
            </span>
          </div>
        </div>
      </section>

      {/* Validator */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-indigo-500/15 p-5 text-white shadow-lg">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              alt={validatorData.name || "Validator"}
              src={validatorImageSrc}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-2xl object-cover shadow-lg ring-2 ring-sky-400/40 bg-white/10 p-1"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Validator
              </p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                {validatorData.name || "Unknown Validator"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {validatorUid !== null && (
              <span
                className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
                style={{
                  borderColor: "rgba(59, 130, 246, 0.45)",
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  color: "#60A5FA",
                }}
              >
                UID {validatorUid}
              </span>
            )}
            {taoStatsUrl ? (
              <a
                href={taoStatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-400 text-black shadow hover:bg-sky-300"
                title="Open TaoStats"
              >
                <PiArrowSquareOutDuotone className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </header>

        <div className="mt-4">
          <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                  Hotkey:
                </span>
                <span className="font-mono text-sm text-white">
                  {truncateMiddle(validatorHotkey)}
                </span>
              </div>
              {validatorHotkey && validatorHotkey !== "—" && <IDCopyButton text={validatorHotkey} />}
            </div>
          </div>
        </div>
      </section>

      {/* Miner */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-green-500/15 p-5 text-white shadow-lg">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              alt={minerData.name || "Miner"}
              src={minerImageSrc}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-2xl object-cover shadow-lg ring-2 ring-emerald-400/40 bg-white/10 p-1"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Miner
              </p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                {minerData.name || "Unknown Miner"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {minerUid !== null && (
              <span
                className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
                style={{
                  borderColor: "rgba(16, 185, 129, 0.45)",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#34D399",
                }}
              >
                UID {minerUid}
              </span>
            )}
            {minerData.github ? (
              <a
                href={minerData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-black shadow hover:bg-emerald-300"
                title="Open GitHub"
              >
                <PiGithubLogoDuotone className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </header>

        <div className="mt-4">
          <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                  Hotkey:
                </span>
                <span className="font-mono text-sm text-white">
                  {truncateMiddle(minerHotkey)}
                </span>
              </div>
              {minerHotkey && minerHotkey !== "—" && <IDCopyButton text={minerHotkey} />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Personas placeholder
const PERSONA_PLACEHOLDER_KEYS = ["round", "validator", "miner"] as const;
function AgentRunPersonasPlaceholder() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {PERSONA_PLACEHOLDER_KEYS.map((key) => (
        <section
          key={`persona-placeholder-${key}`}
          className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-transparent p-5 shadow-lg"
        >
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Placeholder
                variant="circular"
                width={56}
                height={56}
                className="rounded-xl bg-white/10"
              />
              <div className="space-y-2">
                <Placeholder
                  height="0.75rem"
                  width="4rem"
                  className="bg-white/10"
                />
                <Placeholder
                  height="1.25rem"
                  width="8rem"
                  className="bg-white/10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Placeholder
                height="1.75rem"
                width="4rem"
                className="rounded-full bg-white/10"
              />
            </div>
          </header>

          <div className="mt-4">
            <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <Placeholder
                  height="0.875rem"
                  width="5rem"
                  className="bg-white/10"
                />
                <Placeholder
                  height="1rem"
                  width="8rem"
                  className="bg-white/10"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

// Stats cards
function AgentRunStats({ stats }: Readonly<{ stats: AgentRunStatsData | null }>) {
  const numberFormatter = new Intl.NumberFormat("en-US");
  const percentageFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const clampPercentage = (v: number | null | undefined) => {
    if (typeof v !== "number" || Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(100, v));
  };
  const clampNonNegative = (v: number | null | undefined) => {
    if (typeof v !== "number" || Number.isNaN(v)) return 0;
    return Math.max(0, v);
  };
  const formatCount = (v: number | null | undefined) =>
    numberFormatter.format(Math.max(0, Math.round(v ?? 0)));
  const formatPercentage = (v: number) => `${percentageFormatter.format(v)}%`;
  const formatDuration = (v: number | null | undefined) =>
    v && v > 0 ? `${percentageFormatter.format(v)}s` : "—";

  // Reward/time use the post-run reward metrics; website rows keep eval_score separately.
  const overallReward = clampPercentage((stats?.avg_reward ?? 0) * 100);
  const totalTasks = clampNonNegative(stats?.totalTasks);
  const attemptedTasksRaw = stats?.tasksAttempted;
  const attemptedTasks =
    typeof attemptedTasksRaw === "number" && !Number.isNaN(attemptedTasksRaw)
      ? clampNonNegative(attemptedTasksRaw)
      : null;
  const effectiveAttemptedTasks = attemptedTasks ?? totalTasks;
  const successfulTasks = clampNonNegative(stats?.successfulTasks);
  const failedTasks =
    attemptedTasks !== null
      ? Math.max(effectiveAttemptedTasks - successfulTasks, 0)
      : stats?.failedTasks == null
        ? Math.max(totalTasks - successfulTasks, 0)
        : clampNonNegative(stats.failedTasks);
  const nonEvaluatedTasks =
    attemptedTasks !== null ? Math.max(totalTasks - effectiveAttemptedTasks, 0) : 0;
  const websitesCount = clampNonNegative(
    stats?.websites ?? stats?.performanceByWebsite?.length ?? 0
  );
  const averageDuration = stats?.avg_time ?? 0;
  const averageScore = clampPercentage((stats?.avg_score ?? 0) * 100);
  const averageCost =
    typeof stats?.avg_cost === "number" && !Number.isNaN(stats.avg_cost)
      ? Math.max(0, stats.avg_cost)
      : null;

  const displayOverallReward = formatPercentage(overallReward);
  const displayAverageDuration = formatDuration(averageDuration);
  const displayAverageScore = formatPercentage(averageScore);
  const displayAverageCost =
    averageCost !== null ? `$${averageCost.toFixed(4)}` : "—";

  const rewardBreakdownItems = [
    {
      key: "score",
      label: "Score",
      value: displayAverageScore,
      icon: PiTarget,
      accentClass:
        "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100",
      iconClass: "text-fuchsia-300",
    },
    {
      key: "time",
      label: "Time",
      value: displayAverageDuration,
      icon: PiClock,
      accentClass: "border-sky-400/35 bg-sky-500/10 text-sky-100",
      iconClass: "text-sky-300",
    },
    {
      key: "cost",
      label: "Cost",
      value: displayAverageCost,
      icon: PiChartBar,
      accentClass:
        "border-amber-400/35 bg-amber-500/10 text-amber-100",
      iconClass: "text-amber-300",
    },
  ] as const;

  const cards = [
    {
      key: "websites",
      label: "Websites",
      value: formatCount(websitesCount),
      icon: PiGlobe,
      wrapperClass: "border-amber-400/40 bg-amber-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
      labelTextClass: "whitespace-nowrap text-[10px] tracking-[0.06em]",
      cardClass: "w-[128px] lg:w-[138px]",
    },
    {
      key: "tasks",
      label: "Total Tasks",
      value: formatCount(totalTasks),
      icon: PiClock,
      wrapperClass: "border-blue-400/40 bg-blue-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
      labelTextClass: "whitespace-nowrap text-[10px] tracking-[0.06em]",
      cardClass: "w-[128px] lg:w-[138px]",
    },
    {
      key: "success",
      label: "Successful",
      value: formatCount(successfulTasks),
      icon: PiCheckCircle,
      wrapperClass: "border-emerald-400/40 bg-emerald-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
      labelTextClass: "whitespace-nowrap text-[10px] tracking-[0.06em]",
      cardClass: "w-[128px] lg:w-[138px]",
    },
    {
      key: "failed",
      label: "Failed",
      value: formatCount(failedTasks),
      icon: PiXCircle,
      wrapperClass: "border-rose-400/40 bg-rose-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
      labelTextClass: "whitespace-nowrap text-[10px] tracking-[0.06em]",
      cardClass: "w-[128px] lg:w-[138px]",
    },
    {
      key: "non-evaluated",
      label: "Non Evaluated",
      value: formatCount(nonEvaluatedTasks),
      icon: PiClock,
      wrapperClass: "border-slate-400/35 bg-slate-500/15 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
      labelTextClass: "whitespace-nowrap text-[8px] tracking-[0.03em] lg:text-[9px]",
      cardClass: "w-[132px] lg:w-[150px]",
    },
  ] as const;

  const renderCard = (card: (typeof cards)[number], isMobile = false) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className={cn(
          "rounded-2xl border px-4 py-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl",
          card.wrapperClass,
          card.cardClass,
          isMobile ? "sm:px-5 sm:py-5" : "p-4"
        )}
      >
        <Icon className={cn("mx-auto mb-2 h-6 w-6", card.iconClass)} />
        <div className={cn("text-2xl font-bold sm:text-3xl", card.valueClass)}>
          {card.value}
        </div>
        <div
          className={cn(
            "whitespace-nowrap text-sm font-medium uppercase tracking-wide",
            card.labelClass,
            card.labelTextClass
          )}
        >
          {card.label}
        </div>
      </div>
    );
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white">
      <div className="flex flex-col space-y-6 md:hidden relative">
        <div className="flex flex-col items-center justify-center">
          <div
            className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_15px_35px_rgba(244,197,94,0.45)]"
            style={{ WebkitTextStroke: "0.4px rgba(249, 250, 251, 0.15)" }}
          >
            {displayOverallReward}
          </div>
          <div className="mt-2 text-sm font-medium text-white/70">
            Overall reward
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {rewardBreakdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm",
                    item.accentClass
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", item.iconClass)} />
                  <span className="text-white/70">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {cards.map((c) => renderCard(c, true))}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between gap-6 relative">
        <div className="grid grid-cols-5 gap-4 lg:gap-5">
          {cards.map((c) => renderCard(c))}
        </div>
        <div className="flex min-w-[250px] shrink-0 flex-col items-center justify-center px-2 lg:px-4">
          <div
            className="bg-gradient-to-r from-amber-300 via-yellow-200 to-yellow-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-[0_18px_38px_rgba(244,197,94,0.5)]"
            style={{ WebkitTextStroke: "0.6px rgba(249, 250, 251, 0.18)" }}
          >
            {displayOverallReward}
          </div>
          <div className="mt-2 text-sm font-medium text-white/70">
            Overall reward
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {rewardBreakdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm",
                    item.accentClass
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", item.iconClass)} />
                  <span className="text-white/70">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-sky-400/20 bg-[linear-gradient(135deg,rgba(8,47,73,0.68),rgba(15,23,42,0.72),rgba(30,41,59,0.66))] p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/80">
              How Reward Is Calculated
            </div>
            <div className="mt-1 text-sm text-white/70">
              Reward is the weighted combination of task completion, speed, and cost efficiency.
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
            Higher score, faster time, lower cost
          </div>
        </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 p-4">
            <div className="flex items-center gap-2 text-fuchsia-200">
              <PiTarget className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Score Term
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              Score Weight × 1.0
            </div>
            <div className="mt-1 text-xs text-fuchsia-100/70">
              Full reward credit when the task is completed.
            </div>
          </div>

          <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-4">
            <div className="flex items-center gap-2 text-sky-200">
              <PiClock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Time Term
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              Time Weight × (1 − time / Task Timeout)
            </div>
            <div className="mt-1 text-xs text-sky-100/70">
              Faster solutions keep more of the time component.
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 text-amber-200">
              <PiChartBar className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Cost Term
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              Cost Weight × (1 − cost / Cost Normalizer)
            </div>
            <div className="mt-1 text-xs text-amber-100/70">
              Lower LLM spend preserves more of the cost component.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
            Full Formula
          </div>
          <div className="mt-2 break-words font-mono text-xs leading-6 text-white/90 md:text-sm">
            {REWARD_FORMULA}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats placeholder
function AgentRunStatsPlaceholder() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white">
      {/* Mobile layout */}
      <div className="flex flex-col space-y-6 md:hidden relative">
        <div className="flex flex-col items-center justify-center">
          <Placeholder
            height="3rem"
            width="8rem"
            className="rounded-lg bg-white/10"
          />
          <Placeholder
            height="0.875rem"
            width="12rem"
            className="mt-2 bg-white/10"
          />
          <Placeholder
            height="0.75rem"
            width="16rem"
            className="mt-1 bg-white/10"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {(["tasks", "websites", "success", "failed", "non-evaluated"] as const).map((k) => (
            <div
              key={`stats-mobile-placeholder-${k}`}
              className="rounded-2xl border border-white/20 bg-transparent p-4 sm:px-5 sm:py-5 text-center backdrop-blur-sm"
            >
              <Placeholder
                variant="circular"
                width={24}
                height={24}
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="2rem"
                width="4rem"
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="0.875rem"
                width="5rem"
                className="mx-auto bg-white/10"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">
          {(["left1", "left2"] as const).map((k) => (
            <div
              key={`stats-left-placeholder-${k}`}
              className="rounded-2xl border border-white/20 bg-transparent p-4 text-center backdrop-blur-sm"
            >
              <Placeholder
                variant="circular"
                width={24}
                height={24}
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="2rem"
                width="4rem"
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="0.875rem"
                width="5rem"
                className="mx-auto bg-white/10"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center mx-8">
          <Placeholder
            height="3.75rem"
            width="8rem"
            className="rounded-lg bg-white/10"
          />
          <Placeholder
            height="0.875rem"
            width="12rem"
            className="mt-2 bg-white/10"
          />
          <Placeholder
            height="0.75rem"
            width="10rem"
            className="mt-1 bg-white/10"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {(["right1", "right2", "right3"] as const).map((k) => (
            <div
              key={`stats-right-placeholder-${k}`}
              className="rounded-2xl border border-white/20 bg-transparent p-4 text-center backdrop-blur-sm"
            >
              <Placeholder
                variant="circular"
                width={24}
                height={24}
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="2rem"
                width="4rem"
                className="mx-auto mb-2 bg-white/10"
              />
              <Placeholder
                height="0.875rem"
                width="5rem"
                className="mx-auto bg-white/10"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Detail panel (bar list)
function AgentRunDetail({
  className,
  selectedWebsite,
  setSelectedWebsite,
  data,
}: Readonly<{
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  data?: AgentRunDetailData | null;
}>) {
  const agentDetailsData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentDetailsData.websites.length > 0;

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web, index) => ({
      value: web.name ?? `Website ${index + 1}`,
      label: formatWebsiteName(web.name ?? `Website ${index + 1}`),
    })),
  ];

  // Removed time range filter as requested

  const chartData =
    selectedWebsite && selectedWebsite !== "__all__"
      ? (() => {
          console.log("🔍 Filtering by website:", selectedWebsite);
          console.log(
            "📊 Available websites:",
            agentDetailsData.websites.map((w) => w.name)
          );
          const selectedWeb = agentDetailsData.websites.find(
            (web) => web.name === selectedWebsite
          );
          console.log("✅ Found website:", selectedWeb);
          console.log("📋 Results:", selectedWeb?.results);
          return (
            selectedWeb?.results.map((result, idx) => ({
              website: formatUseCaseName(
                selectedWeb.useCases.find(
                  (uc) => String(uc.id) === String(result.useCaseId)
                )?.name || `Use Case ${result.useCaseId}`
              ),
              // successRate is 0-1, convert to 0-100 for display
              average: Number(((result.successRate ?? 0) * 100).toFixed(1)),
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
              avgReward: result.avgReward,
              avgCost: result.avgCost,
              dominantZeroReason: result.dominantZeroReason ?? null,
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web, idx) => ({
          website: formatWebsiteName(web.name),
          // successRate is 0-1, convert to 0-100 for display
          average: Number(((web.overall.successRate ?? 0) * 100).toFixed(1)),
          total: web.overall.total ?? 0,
          successCount: web.overall.successCount ?? 0,
          avgSolutionTime: web.overall.avgSolutionTime ?? 0,
          avgReward: web.overall.avgReward ?? 0,
          avgCost: web.overall.avgCost ?? 0,
          dominantZeroReason: web.overall.dominantZeroReason ?? null,
          colorIndex: idx,
        }));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white",
        className
      )}
    >
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
              <PiChartBar className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Performance Analytics
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70">
                Success rates and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              options={websiteOptions}
              value={websiteOptions.find(
                (opt) => opt.value === (selectedWebsite ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setSelectedWebsite(
                  option.value === "__all__" ? null : option.value
                )
              }
              className="w-full sm:w-[160px] text-sm rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-sky-600/20 text-blue-100 focus:border-blue-400/60 focus:ring-0 hover:border-blue-400/50"
            />
          </div>
        </div>

        {/* removed status chip and live view helper text per request */}
      </div>

      {hasWebsites ? (
        <div className="relative space-y-6">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const projectColors = getProjectColors(item.website);
            const isHighPerformance = item.average >= 80;
            const isMediumPerformance = item.average >= 60 && item.average < 80;

            return (
              <div
                key={`${item.website}-${index}`}
                className="group relative rounded-xl border p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)",
                  borderColor: `${projectColors.mainColor}99`, // 60% opacity
                  background: `linear-gradient(to bottom right, ${projectColors.mainColor}26, ${projectColors.mainColor}1A)`, // 15% to 10% opacity
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: projectColors.dotColor }}
                    />
                    <span className="text-base sm:text-lg font-semibold text-white">
                      {item.website}
                    </span>
                    {isHighPerformance && (
                      <div
                        className="flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium border"
                        style={{
                          backgroundColor: "rgba(253, 245, 230, 0.2)",
                          borderColor: "rgba(253, 245, 230, 0.45)",
                          color: HIGHLIGHT_COLOR,
                        }}
                      >
                        <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Excellent</span>
                        <span className="sm:hidden">Top</span>
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-indigo-100 rounded-full text-[10px] sm:text-xs font-medium border border-indigo-400/30 bg-transparent">
                        <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-red-200 rounded-full text-[10px] sm:text-xs font-medium border border-red-400/40 bg-transparent">
                        <PiTrendDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">
                          Needs Improvement
                        </span>
                        <span className="sm:hidden">Low</span>
                      </div>
                    )}
                    {item.avgReward <= 0 &&
                      !!(
                        item.dominantZeroReason ??
                        (item.avgCost > OVER_COST_LIMIT ? "Over Cost Limit" : null)
                      ) && (
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-amber-100 rounded-full text-[10px] sm:text-xs font-medium border border-amber-400/40 bg-amber-500/10">
                          <span>
                            {item.dominantZeroReason ??
                              (item.avgCost > OVER_COST_LIMIT
                                ? "Over Cost Limit"
                                : null)}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      {item.average.toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {item.total} requests • {item.successCount} successful
                    </div>
                  </div>
                </div>

                {item.average > 0 ? (
                  <div className="relative">
                    <div className="h-3 sm:h-4 w-full rounded-full bg-transparent overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{
                          width: `${Math.max(0, Math.min(item.average, 100))}%`,
                          background: `linear-gradient(90deg, ${colorClass} 0%, rgba(253, 245, 230, 0.85) 100%)`,
                          boxShadow: "0 8px 25px rgba(253, 245, 230, 0.25)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        <div
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm"
                          style={{
                            backgroundColor: HIGHLIGHT_COLOR,
                            opacity: item.average > 5 ? 1 : 0,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/60">
                      <span>0%</span>
                      <span className="hidden sm:inline">25%</span>
                      <span>50%</span>
                      <span className="hidden sm:inline">75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative text-center py-2">
                    <div className="text-xs sm:text-sm text-white/50 italic">
                      No success rate to display
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <PiChartBar className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-white/70 uppercase tracking-wide">
                      Reward
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {(item.avgReward * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <PiTarget className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-white/70 uppercase tracking-wide">
                      Score
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {(
                        (item.successCount / Math.max(item.total, 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <PiClock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-white/70 uppercase tracking-wide">
                      Time
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {item.avgSolutionTime.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <PiGlobe className="w-4 h-4 sm:w-6 sm:h-6 text-fuchsia-300 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-white/70 uppercase tracking-wide">
                      Cost
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      ${item.avgCost.toFixed(4)}
                    </span>
                  </div>
                </div>
                {item.avgReward <= 0 &&
                  (item.dominantZeroReason || item.avgCost > OVER_COST_LIMIT) && (
                  <div className="mt-3 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
                    Reason:{" "}
                    {item.dominantZeroReason ??
                      (item.avgCost > OVER_COST_LIMIT ? "Over Cost Limit" : "Task Failed")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative text-center py-12">
          <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <PiChartBar className="w-8 h-8 text-white/70" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Performance Data Available
          </h3>
          <p className="text-white/70">
            Performance metrics will appear here once the agent run completes.
          </p>
        </div>
      )}
    </div>
  );
}

function AgentRunDetailPlaceholder({ className }: Readonly<{ className?: string }>) {
  const progressWidths = ["68%", "52%", "78%"];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6",
        className
      )}
    >
      <div className="relative mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-transparent p-3">
              <Placeholder
                variant="circular"
                width={28}
                height={28}
                className="bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Placeholder
                height="1.5rem"
                width="14rem"
                className="bg-transparent"
              />
              <Placeholder
                height="1rem"
                width="18rem"
                className="bg-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Placeholder
              height="1rem"
              width="4rem"
              className="hidden rounded-full bg-transparent md:block"
            />
            <div className="flex items-center gap-2">
              <Placeholder
                height="2.25rem"
                width="5.5rem"
                className="rounded-lg bg-transparent"
              />
              <Placeholder
                height="2.25rem"
                width="7.5rem"
                className="rounded-lg bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-6">
        {progressWidths.map((w) => (
          <div
            key={`placeholder-card-${w}`}
            className="relative rounded-xl border border-white/15 bg-transparent p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Placeholder
                  variant="circular"
                  width={12}
                  height={12}
                  className="bg-transparent"
                />
                <Placeholder
                  height="1.1rem"
                  width="8rem"
                  className="bg-transparent"
                />
                <Placeholder
                  height="1.1rem"
                  width="5rem"
                  className="rounded-full bg-transparent"
                />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder
                  height="1.75rem"
                  width="3.5rem"
                  className="bg-transparent"
                />
                <Placeholder
                  height="1rem"
                  width="10rem"
                  className="bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full overflow-hidden rounded-full bg-transparent">
                <Placeholder
                  height="100%"
                  width={w}
                  className="bg-transparent"
                />
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 5 }, (_, j) => (
                  <Placeholder
                    key={`marker-${j}`}
                    height="0.75rem"
                    width="2.25rem"
                    className="bg-transparent"
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              {Array.from({ length: 2 }, (_, m) => (
                <div
                  key={`metric-${m}`}
                  className="rounded-lg border border-white/15 bg-transparent p-3"
                >
                  <Placeholder
                    height="0.85rem"
                    width="70%"
                    className="mb-2 bg-transparent"
                  />
                  <Placeholder
                    height="1.4rem"
                    width="50%"
                    className="bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Summary donut + list
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

function DonutCenterLabelContent(
  props: Readonly<{
    viewBox?: { cx?: number; cy?: number };
    successRate: number;
    totalRequests: number;
    totalSuccesses: number;
  }>
) {
  const viewBox = props.viewBox;
  const cx = viewBox && "cx" in viewBox ? viewBox.cx ?? 0 : 0;
  const cy = viewBox && "cy" in viewBox ? viewBox.cy ?? 0 : 0;
  return (
    <CenterLabel
      value={(props.successRate * 100).toFixed(0)}
      totalRequests={Math.round(props.totalRequests).toString()}
      totalSuccesses={Math.round(props.totalSuccesses).toString()}
      viewBox={{ cx, cy }}
    />
  );
}

function AgentRunSummary({
  className,
  selectedWebsite,
  data,
}: Readonly<{
  className?: string;
  selectedWebsite?: string | null;
  data?: AgentRunDetailData | null;
}>) {
  const agentData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentData.websites.length > 0;

  // Compute display metrics
  const selectedWeb = selectedWebsite
    ? agentData.websites.find((w) => w.name === selectedWebsite)
    : null;
  const websites = agentData.websites;
  const n = websites.length;
  const avgSuccessRate =
    n > 0 ? websites.reduce((s, w) => s + w.overall.successRate, 0) / n : 0;
  const successRate = selectedWeb ? selectedWeb.overall.successRate : avgSuccessRate;
  const totalRequests = selectedWeb
    ? selectedWeb.overall.total
    : websites.reduce((s, w) => s + w.overall.total, 0);
  const totalSuccesses = selectedWeb
    ? selectedWeb.overall.successCount
    : websites.reduce((s, w) => s + w.overall.successCount, 0);
  const displayData = (() => {
    if (selectedWebsite) {
      console.log("🎯 Summary: Filtering by website:", selectedWebsite);
      console.log(
        "🏢 Summary: Available websites:",
        agentData.websites.map((w) => w.name)
      );
      const selectedWeb = agentData.websites.find(
        (w) => w.name === selectedWebsite
      );
      console.log("✨ Summary: Found website:", selectedWeb);
      if (!selectedWeb) {
        console.warn("⚠️ Summary: Website not found!");
        return [] as {
          label: string;
          value: number;
          total: number;
          successCount: number;
          avgSolutionTime: number;
        }[];
      }
      console.log("📋 Summary: Results:", selectedWeb.results);
      return selectedWeb.results.map((r) => ({
        label: formatUseCaseName(
          selectedWeb.useCases.find(
            (uc) => String(uc.id) === String(r.useCaseId)
          )?.name || `Use Case ${r.useCaseId}`
        ),
        value: r.successRate,
        total: r.total,
        successCount: r.successCount,
        avgSolutionTime: r.avgSolutionTime,
      }));
    }
    return agentData.websites.map((w, idx) => ({
      label: formatWebsiteName(w.name ?? `Website ${idx + 1}`),
      value: w.overall.successRate,
      total: w.overall.total,
      successCount: w.overall.successCount,
      avgSolutionTime: w.overall.avgSolutionTime,
    }));
  })();

  const donutData = selectedWebsite
    ? (() => {
        const selectedWeb = agentData.websites.find(
          (w) => w.name === selectedWebsite
        );
        if (!selectedWeb) return [] as { label: string; value: number; average: number; total: number; successCount: number; avgSolutionTime: number; fill: string; stroke: string }[];
        const sortedResults = [...selectedWeb.results]
          .map((result) => {
            const useCase = selectedWeb.useCases.find(
              (uc) => String(uc.id) === String(result.useCaseId)
            );
            const label = formatUseCaseName(
              useCase?.name || `Use Case ${result.useCaseId}`
            );
            return {
              label,
              value: result.total,
              average: result.successRate,
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
            };
          })
          .sort((a, b) => b.average - a.average);
        return displayData.map((item, idx) => {
          const match = sortedResults.find((d) => d.label === item.label);
          const totalVal = match ? match.total : item.total;
          return {
            label: item.label,
            value: Math.max(totalVal, 1), // Always show at least 1 to render the segment
            average: match ? match.average : item.value,
            total: totalVal,
            successCount: match ? match.successCount : item.successCount,
            avgSolutionTime: match
              ? match.avgSolutionTime
              : item.avgSolutionTime,
            fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
            stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
          };
        });
      })()
    : agentData.websites.map((w, idx) => {
        const websiteName = formatWebsiteName(w.name ?? `Website ${idx + 1}`);
        const projectColors = getProjectColors(websiteName);
        return {
          label: websiteName,
          value: Math.max(w.overall.total, 1), // Always show at least 1 to render the segment
          average: w.overall.successRate,
          total: w.overall.total,
          successCount: w.overall.successCount,
          avgSolutionTime: w.overall.avgSolutionTime,
          fill: projectColors.dotColor,
          stroke: projectColors.dotColor,
        };
      });

  // Ensure donutData has valid values for rendering
  const hasValidDonut = donutData.some((d) => d.value > 0);
  const fallbackDonut = hasWebsites
    ? displayData.map((item) => {
        const projectColors = getProjectColors(item.label);
        return {
          label: item.label,
          value: 100, // Show equal segments when no data
          average: 0,
          total: item.total,
          successCount: 0,
          avgSolutionTime: 0,
          fill: projectColors.dotColor,
          stroke: projectColors.dotColor,
        };
      })
    : [];
  const finalDonutData = hasValidDonut ? donutData : fallbackDonut;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white ${className ?? ""}`}
    >
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
            Summary
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
          Performance Breakdown
        </p>
      </div>

      <div className="relative text-white/80">
        <div className="h-[240px] w-full @sm:py-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalDonutData}
                innerRadius={85}
                outerRadius={100}
                paddingAngle={finalDonutData.length > 1 ? 5 : 0}
                cornerRadius={30}
                dataKey="value"
                stroke="#1e293b"
                strokeWidth={2}
                isAnimationActive={true}
              >
                <Label
                  position="center"
                  content={
                    <DonutCenterLabelContent
                      successRate={successRate}
                      totalRequests={totalRequests}
                      totalSuccesses={totalSuccesses}
                    />
                  }
                />
                {finalDonutData.map((entry: { label: string; fill?: string; stroke?: string }, idx: number) => (
                  <Cell
                    key={`cell-${entry.label}-${idx}`}
                    fill={entry.fill}
                    stroke={entry.stroke || entry.fill}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {displayData.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-transparent">
            {displayData.map((item, idx) => {
              const projectColors = getProjectColors(item.label);
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 py-3 px-2 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: projectColors.dotColor,
                      }}
                    />
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {(item.value * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/70">
                      {Math.round(item.total)} requests •{" "}
                      {Math.round(item.successCount)} successes
                      {selectedWebsite && (
                        <span> • {item.avgSolutionTime.toFixed(2)}s avg</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-white/70">
            Summary metrics are not available for this run yet.
          </div>
        )}
      </div>
    </div>
  );
}

function CenterLabel({
  value,
  totalRequests,
  totalSuccesses,
  viewBox,
}: Readonly<{
  value: string;
  totalRequests: string;
  totalSuccesses: string;
  viewBox: { cx: number; cy: number };
}>) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 20}
        fill={HIGHLIGHT_COLOR}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 12px 28px rgba(253, 245, 230, 0.35)",
        }}
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="14" fontWeight="600">
          Requests · {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="14" fontWeight="600">
          Successes · {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}

function AgentRunSummaryPlaceholder({ className }: Readonly<{ className?: string }>) {
  const donutInner = (
    <div className="relative flex items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        <Placeholder
          variant="circular"
          width={200}
          height={200}
          className="border border-white/15 bg-transparent"
        />
        <div className="absolute flex flex-col items-center gap-2">
          <Placeholder
            height="2.25rem"
            width="4rem"
            className="rounded-lg bg-transparent"
          />
          <Placeholder
            height="0.9rem"
            width="7.5rem"
            className="rounded bg-transparent"
          />
          <Placeholder
            height="0.9rem"
            width="6.5rem"
            className="rounded bg-transparent"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6",
        className
      )}
    >
      <div className="relative mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl border border-white/15 bg-transparent p-2">
            <Placeholder
              variant="circular"
              width={24}
              height={24}
              className="bg-transparent"
            />
          </div>
          <Placeholder
            height="1.35rem"
            width="6rem"
            className="bg-transparent"
          />
        </div>
        <Placeholder
          height="0.75rem"
          width="10rem"
          className="bg-transparent"
        />
      </div>

      <div className="relative text-white/80">
        {donutInner}
        <div className="mt-6 flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-transparent">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`summary-placeholder-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-4"
            >
              <div className="flex items-center gap-2">
                <Placeholder
                  variant="circular"
                  width={12}
                  height={12}
                  className="bg-transparent"
                />
                <Placeholder
                  height="0.85rem"
                  width="7rem"
                  className="bg-transparent"
                />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder
                  height="1rem"
                  width="3.75rem"
                  className="bg-transparent"
                />
                <Placeholder
                  height="0.75rem"
                  width="8rem"
                  className="bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Evaluations table with pagination
const columnHelper = createColumnHelper<AgentRunEvaluationData>();
const agentRunTasksColumns = [
  columnHelper.display({
    id: "evaluationId",
    size: 110,
    header: "Evaluation Id",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="ms-2 font-mono text-xs sm:text-sm text-white/90"
        title="View evaluation details"
      >
        #{truncateMiddle(row.original.evaluationId, 6)}
      </Link>
    ),
  }),
  columnHelper.accessor("prompt", {
    id: "prompt",
    header: "Prompt",
    size: 560,
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="block max-w-[260px] sm:max-w-[520px] break-words whitespace-pre-wrap text-sm sm:text-base font-medium leading-6 text-slate-100"
        title="View evaluation details"
      >
        {row.original.prompt}
      </Link>
    ),
  }),
  columnHelper.accessor("website", {
    id: "website",
    size: 120,
    header: "Website",
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="inline-flex items-center rounded-md border border-blue-600 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-blue-300"
        title="View evaluation details"
      >
        {formatWebsiteName(row.original.website)}
      </Link>
    ),
  }),
  columnHelper.accessor("useCase", {
    id: "useCase",
    size: 160,
    header: "Use Case",
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="text-xs sm:text-sm font-medium text-slate-300"
        title="View evaluation details"
      >
        {row.original.useCase
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")}
      </Link>
    ),
  }),
  columnHelper.accessor("reward", {
    id: "reward",
    size: 90,
    header: "Reward",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="text-xs sm:text-sm font-medium text-amber-300"
        title="View evaluation details"
      >
        {(100 * (row.original.reward ?? 0)).toFixed(1)}%
      </Link>
    ),
  }),
  columnHelper.accessor("eval_score", {
    id: "eval_score",
    size: 90,
    header: "Score",
    cell: ({ row }) => {
      const eval_score = row.original.eval_score ?? 0;
      const scoreColor = eval_score > 0 ? "text-green-400" : "text-red-400";
      const scoreValue = `${(eval_score * 100).toFixed(1)}%`;
      return (
        <Link
          href={`${routes.evaluations}/${row.original.evaluationId}`}
          className={`text-xs sm:text-sm font-medium ${scoreColor}`}
          title="View evaluation details"
        >
          {scoreValue}
        </Link>
      );
    },
  }),
  columnHelper.accessor("eval_time", {
    id: "eval_time",
    size: 90,
    header: "Time",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="text-xs sm:text-sm font-medium text-slate-300"
        title="View evaluation details"
      >
        {row.original.eval_time?.toFixed(2) ?? 0}s
      </Link>
    ),
  }),
  columnHelper.display({
    id: "cost",
    size: 90,
    header: "Cost",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="text-xs sm:text-sm font-medium text-slate-300"
        title="View evaluation details"
      >
        {typeof row.original.cost === "number" ? `$${row.original.cost.toFixed(4)}` : "—"}
      </Link>
    ),
  }),
  columnHelper.display({
    id: "reason",
    size: 140,
    header: "Reason",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="text-xs sm:text-sm font-medium text-amber-100/90"
        title="View evaluation details"
      >
        {summarizeFailureReason(row.original.zeroReason, row.original.cost ?? null) ?? "—"}
      </Link>
    ),
  }),
  columnHelper.display({
    id: "action",
    size: 100,
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="flex items-center text-slate-200 transition-colors duration-200"
        title="Inspect evaluation"
      >
        <Button
          variant="outline"
          size="sm"
          className="relative z-20 border-slate-600 text-white hover:border-slate-400 hover:bg-transparent text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
        >
          <PiEyeBold className="me-1 sm:me-1.5 size-3 sm:size-4" />
          <span>Inspect</span>
        </Button>
      </Link>
    ),
  }),
];

function AgentRunTasksSection({
  evaluations: providedEvaluations = [],
  isLoading = false,
  error,
  refetch,
  selectedWebsite,
}: Readonly<{
  evaluations?: AgentRunEvaluationData[];
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => void;
  selectedWebsite?: string | null;
}>) {
  // Filter evaluations by selected website
  const filteredEvaluations = useMemo(() => {
    if (!selectedWebsite || selectedWebsite === "__all__") {
      return providedEvaluations;
    }
    return providedEvaluations.filter(
      (evaluation) => evaluation.website === selectedWebsite
    );
  }, [providedEvaluations, selectedWebsite]);

  const evaluations = filteredEvaluations;
  const total = evaluations.length;
  const page = 1;
  const limit = 10;

  const { table, setData } = useTanStackTable<AgentRunEvaluationData>({
    tableData: evaluations || [],
    columnConfig: agentRunTasksColumns,
    options: {
      initialState: {
        pagination: { pageIndex: (page || 1) - 1, pageSize: limit || 10 },
      },
      enableColumnResizing: false,
      manualPagination: false,
    },
  });

  useEffect(() => {
    if (evaluations) setData(evaluations);
  }, [evaluations, setData]);

  if (isLoading && !evaluations) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-3 sm:p-6">
        <div className="relative mb-4 sm:mb-6 flex items-center justify-between">
          <Placeholder height="1.2rem" width="5rem" />
          <Placeholder height="2rem" width="12rem" />
        </div>
        <div className="relative mb-3">
          <div className="overflow-hidden rounded-2xl border border-slate-700/25">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-transparent">
                <tr>
                  {(["c0", "c1", "c2", "c3", "c4", "c5"] as const).map((col) => (
                    <th key={`tasks-thead-${col}`} className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      <Placeholder height="0.875rem" width="3rem" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["r0", "r1", "r2", "r3", "r4"] as const).map((row) => (
                  <TableRowPlaceholder key={`tasks-row-${row}`} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="relative flex items-center justify-between py-3 sm:py-4">
          <Placeholder height="0.875rem" width="6rem" />
          <div className="flex items-center gap-2">
            <Placeholder height="1.75rem" width="5rem" />
            <Placeholder height="1.75rem" width="3rem" />
            <Placeholder height="1.75rem" width="5rem" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !evaluations?.length) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-3 sm:p-6">
        <div className="relative mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-semibold text-white">
            All Tasks
          </h2>
        </div>
        <div className="relative py-6 sm:py-8 text-center">
          <div className="mb-2 text-base sm:text-lg font-semibold text-red-400">
            Failed to Load Tasks Data
          </div>
          <div className="mb-4 text-xs sm:text-sm text-red-300">{error}</div>
          <button
            onClick={refetch}
            className="rounded-lg bg-transparent border border-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-300 transition-colors hover:bg-transparent"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-3 sm:p-6">
      <div className="relative mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 border border-blue-500/30">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-base sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
            All Evaluations
            {total > 0 && (
              <span className="ml-2 text-xs sm:text-sm font-normal text-blue-300/70">
                ({total} total)
              </span>
            )}
          </h2>
        </div>
        <div className="relative w-full max-w-[240px]">
          <Input
            type="search"
            clearable
            placeholder="Search evaluation..."
            onClear={() => table.setGlobalFilter("")}
            value={(table.getState().globalFilter as string) ?? ""}
            prefix={
              <PiMagnifyingGlassBold className="size-3 sm:size-4 text-slate-400" />
            }
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full xs:max-w-60 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="relative mb-2">
        {evaluations && evaluations.length > 0 ? (
          <Table
            table={table as unknown as TanStackTableType<Record<string, unknown>>}
            variant="modern"
            classNames={{
              container:
                "custom-scrollbar scroll-smooth overflow-x-auto rounded-2xl border border-slate-700/25 bg-transparent",
              headerClassName:
                "bg-gradient-to-r from-blue-600/20 to-sky-600/20 text-blue-100 border-b border-blue-500/30",
              rowClassName:
                "group cursor-pointer relative border-b border-slate-700/25 transition-colors duration-200 hover:bg-sky-500/15 hover:border-sky-400/40 hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)]",
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-700/25 bg-transparent p-6 sm:p-8 text-center">
            <div className="mb-2 text-base sm:text-lg font-medium text-slate-200">
              No Evaluations Found
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              No evaluations are available for this agent run.
            </div>
          </div>
        )}
      </div>

      {evaluations && evaluations.length > 0 && (
        <TablePagination
          table={table as unknown as TanStackTableType<Record<string, unknown>>}
          className="relative py-3 sm:py-4 text-slate-300 text-xs sm:text-sm"
        />
      )}

      {isLoading && evaluations && (
        <div className="relative flex items-center justify-center py-3 sm:py-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
            <span className="text-xs sm:text-sm">Loading more evaluations...</span>
          </div>
        </div>
      )}
    </div>
  );
}
