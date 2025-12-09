"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/config/routes";
import {
  formatWebsiteName,
  getProjectColors,
  getProjectMainColor,
} from "@/utils/website-colors";

import PageHeader from "@/app/shared/page-header";
import Placeholder, { TableRowPlaceholder } from "@/app/shared/placeholder";

import cn from "@core/utils/class-names";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";

import { Select, Button, Text, Input } from "rizzui";
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
  PiInfoDuotone,
} from "react-icons/pi";

import { useAgentRunComplete } from "@/services/hooks/useAgentRun";
import type {
  AgentRunStats as AgentRunStatsData,
  AgentRunTaskData,
  AgentRunEvaluationData,
} from "@/repositories/agent-runs/agent-runs.types";
import { createColumnHelper } from "@tanstack/react-table";
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

// Utilities
function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function IDCopyButton({ text }: { text: string }) {
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

// Transform stats to local detail model (no external utils)
function buildDetailDataFromStats(
  stats?: AgentRunStatsData | null
): AgentRunDetailData {
  if (!stats) return { websites: [] };

  const websites: AgentRunWebsite[] = (stats.performanceByWebsite || []).map(
    (w, i) => {
      // Build useCases and results from statsByUsecase if available
      const statsByUsecase = (w as any).statsByUsecase || [];
      
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
        },
      };
    }
  );

  return { websites };
}

export default function Page() {
  const { id } = useParams();
  const runId = Array.isArray(id) ? id[0] : (id as string) || "";

  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  const { 
    data: agentRunData,
    isLoading,
    error,
    refetch,
    statistics: stats,
    evaluations,
    info,
  } = useAgentRunComplete(runId);

  // Derived detail data from stats for charts/summary
  const detailData = useMemo(() => {
    return buildDetailDataFromStats(stats);
  }, [stats]);

  // Check if agent run has no data yet
  const hasNoData =
    !isLoading &&
    error &&
    (!stats ||
      (stats.totalTasks === 0 && stats.overallScore === 0));

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
        <AgentRunTasksSection evaluations={evaluations} isLoading={isLoading} error={error} refetch={refetch} />
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
function AgentRunPersonasFromInfo({
  info,
}: {
  info: {
    agentRunId: string;
    round: any;
    validator: any;
    miner: any;
  } | null;
}) {
  function extractUidNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value))
      return Math.max(0, Math.abs(value));
    if (typeof value === "string") {
      const match = value.match(/\d+/);
      if (match) {
        const parsed = Number.parseInt(match[0], 10);
        if (!Number.isNaN(parsed)) return Math.max(0, parsed);
      }
    }
    return null;
  }

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
  
  // Round number/ID
  const roundNumber = roundData.roundNumber ?? roundData.validatorRoundId ?? "—";
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
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Round
              </p>
              <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                #{roundNumber}
              </p>
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

// Personas card group (legacy - kept for backward compatibility)
function AgentRunPersonas({
  personas,
  summary,
}: {
  personas?: any;
  summary?: any;
}) {
  function extractUidNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value))
      return Math.max(0, Math.abs(value));
    if (typeof value === "string") {
      // Extract first sequence of digits; treat hyphens as delimiters, not signs
      const match = value.match(/\d+/);
      if (match) {
        const parsed = Number.parseInt(match[0], 10);
        if (!Number.isNaN(parsed)) return Math.max(0, parsed);
      }
    }
    return null;
  }
  const roundData = personas?.round || {
    id: "—",
    status: "Active",
    startTime: null,
    totalValidators: personas?.validatorCount || 0,
  };
  const validatorData = personas?.validator || {
    name: "Autoppia Validator",
    image: "/validators/Autoppia.png",
    id: null,
    country: "—",
    track: "—",
  };
  const agentData = personas?.agent || {
    name: "Benchmark Agent",
    image: "/images/autoppia-logo.png",
    id: "—",
    uid: null,
    hotkey: null,
    provider: "—",
    github: null,
  };

  const validatorHotkey =
    summary?.validatorId || validatorData.id || validatorData.name;
  const validatorUid =
    extractUidNumber(summary?.validatorId) ?? extractUidNumber(validatorHotkey);
  const taoStatsUrl = validatorHotkey
    ? `https://taostats.io/validators/${validatorHotkey}`
    : null;

  const agentUid =
    (typeof agentData.uid === "number" ? agentData.uid : null) ??
    (typeof summary?.agentUid === "number" ? summary?.agentUid : null) ??
    extractUidNumber(agentData.id) ??
    extractUidNumber(summary?.agentId);

  const agentHotkey =
    agentData.hotkey ??
    summary?.agentHotkey ??
    agentData.id ??
    summary?.agentId;

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
  
  // Round number/ID
  const roundNumber = roundData.roundNumber ?? roundData.validatorRoundId ?? "—";
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
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Round
              </p>
              <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                #{roundNumber}
              </p>
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
              alt={validatorData.name}
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
              alt={agentData.name}
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
function AgentRunPersonasPlaceholder() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <section
          key={`persona-placeholder-${idx}`}
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
function AgentRunStats({ stats }: { stats: AgentRunStatsData | null }) {
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

  // Use new fields: avg_score, avg_reward, avg_time
  const overallScore = clampPercentage((stats?.avg_score ?? 0) * 100);
  const overallReward = clampPercentage((stats?.avg_reward ?? 0) * 100);
  const totalTasks = clampNonNegative(stats?.totalTasks);
  const successfulTasks = clampNonNegative(stats?.successfulTasks);
  const failedTasks =
    stats?.failedTasks != null
      ? clampNonNegative(stats.failedTasks)
      : Math.max(totalTasks - successfulTasks, 0);
  const websitesCount = clampNonNegative(
    stats?.websites ?? stats?.performanceByWebsite?.length ?? 0
  );
  const successRate = clampPercentage(
    totalTasks ? (successfulTasks / totalTasks) * 100 : 0
  );
  const averageDuration = stats?.avg_time ?? 0;

  const displayOverallScore = formatPercentage(overallScore);
  const displayOverallReward = formatPercentage(overallReward);
  const displaySuccessRate = formatPercentage(successRate);
  const displayAverageDuration = formatDuration(averageDuration);

  const cards = [
    {
      key: "tasks",
      label: "Total Tasks",
      value: formatCount(totalTasks),
      icon: PiClock,
      wrapperClass: "border-blue-400/40 bg-blue-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
    },
    {
      key: "websites",
      label: "Websites",
      value: formatCount(websitesCount),
      icon: PiGlobe,
      wrapperClass: "border-amber-400/40 bg-amber-500/20 text-white",
      iconClass: "text-white",
      valueClass: "text-white",
      labelClass: "text-white/80",
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
          isMobile ? "sm:px-5 sm:py-5" : "p-4"
        )}
      >
        <Icon className={cn("mx-auto mb-2 h-6 w-6", card.iconClass)} />
        <div className={cn("text-2xl font-bold sm:text-3xl", card.valueClass)}>
          {card.value}
        </div>
        <div
          className={cn(
            "text-sm font-medium uppercase tracking-wide",
            card.labelClass
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
          <div className="mt-1 text-xs text-white/60">
            Score {displayOverallScore} • Time {displayAverageDuration}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {cards.map((c) => renderCard(c, true))}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">
          {cards.slice(0, 2).map((c) => renderCard(c))}
        </div>
        <div className="flex flex-col items-center justify-center mx-8">
          <div
            className="bg-gradient-to-r from-amber-300 via-yellow-200 to-yellow-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-[0_18px_38px_rgba(244,197,94,0.5)]"
            style={{ WebkitTextStroke: "0.6px rgba(249, 250, 251, 0.18)" }}
          >
            {displayOverallReward}
          </div>
          <div className="mt-2 text-sm font-medium text-white/70">
            Overall reward
          </div>
          <div className="mt-1 text-xs text-white/60">
            Score {displayOverallScore} • Time {displayAverageDuration}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {cards.slice(2).map((c) => renderCard(c))}
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
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`stats-mobile-placeholder-${idx}`}
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
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`stats-left-placeholder-${idx}`}
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
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`stats-right-placeholder-${idx}`}
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
}: {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  data?: AgentRunDetailData | null;
}) {
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

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-white/10 bg-white/5">
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
                </div>
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

function AgentRunDetailPlaceholder({ className }: { className?: string }) {
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
        {progressWidths.map((w, i) => (
          <div
            key={`placeholder-card-${i}`}
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

function AgentRunSummary({
  className,
  selectedWebsite,
  data,
}: {
  className?: string;
  selectedWebsite?: string | null;
  data?: AgentRunDetailData | null;
}) {
  const agentData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentData.websites.length > 0;

  // Compute display metrics
  let successRate = 0;
  let totalRequests = 0;
  let totalSuccesses = 0;
  let avgSolutionTime = 0;

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (w) => w.name === selectedWebsite
    );
    if (selectedWeb) {
      successRate = selectedWeb.overall.successRate;
      totalRequests = selectedWeb.overall.total;
      totalSuccesses = selectedWeb.overall.successCount;
      avgSolutionTime = selectedWeb.overall.avgSolutionTime;
    }
  } else {
    const websites = agentData.websites;
    successRate = websites.length
      ? websites.reduce((s, w) => s + w.overall.successRate, 0) /
        websites.length
      : 0;
    totalRequests = websites.reduce((s, w) => s + w.overall.total, 0);
    totalSuccesses = websites.reduce((s, w) => s + w.overall.successCount, 0);
    avgSolutionTime = websites.length
      ? websites.reduce((s, w) => s + w.overall.avgSolutionTime, 0) /
        websites.length
      : 0;
  }

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
        if (!selectedWeb) return [] as any[];
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
  const finalDonutData =
    donutData.length > 0 && donutData.some((d) => d.value > 0)
      ? donutData
      : hasWebsites
        ? displayData.map((item, idx) => {
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
                  content={(props) => (
                    <CenterLabel
                      value={(successRate * 100).toFixed(0)}
                      totalRequests={Math.round(totalRequests).toString()}
                      totalSuccesses={Math.round(totalSuccesses).toString()}
                      viewBox={(props as any).viewBox}
                    />
                  )}
                />
                {finalDonutData.map((entry: any, idx: number) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.fill}
                    stroke={entry.stroke || entry.fill}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {false && (
          <div className="h-[240px] flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                {/* Donut placeholder */}
                <div className="w-[200px] h-[200px] rounded-full border-8 border-slate-600/30 mx-auto mb-4 relative">
                  <div className="absolute inset-4 rounded-full border-4 border-dashed border-slate-500/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-400 mb-1">
                        0%
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        No Data
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Performance Data Available
              </h3>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                Performance metrics will appear here once the agent run
                processes some tasks.
              </p>
            </div>
          </div>
        )}
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
}: {
  value: string;
  totalRequests: string;
  totalSuccesses: string;
  viewBox: any;
}) {
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

function AgentRunSummaryPlaceholder({ className }: { className?: string }) {
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
    size: 80,
    header: "Evaluation Id",
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="ms-2 font-mono text-xs sm:text-sm text-white"
        title="View evaluation details"
      >
        #{row.original.evaluationId}
      </Link>
    ),
  }),
  columnHelper.accessor("prompt", {
    id: "prompt",
    header: "Prompt",
    size: 400,
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`${routes.evaluations}/${row.original.evaluationId}`}
        className="block max-w-[200px] sm:max-w-[320px] break-words whitespace-pre-wrap text-xs sm:text-sm font-medium text-slate-200"
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
  columnHelper.accessor("eval_score", {
    id: "eval_score",
    size: 100,
    header: "Score",
    cell: ({ row }) => {
      const eval_score = row.original.eval_score ?? 0;
      const isPassed = eval_score >= 1;
      const scoreColor = isPassed ? "text-green-400" : "text-red-400";
      const scoreValue = isPassed ? "100%" : "0%";
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
    size: 100,
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
}: {
  evaluations?: any[];
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => void;
}) {
  const evaluations = providedEvaluations;
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                      <Placeholder height="0.875rem" width="3rem" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowPlaceholder key={i} columns={6} />
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

  if (error && !tasks) {
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
            table={table}
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
          table={table}
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
