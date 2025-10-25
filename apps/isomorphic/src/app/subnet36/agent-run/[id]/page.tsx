"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/config/routes";

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
} from "react-icons/pi";

import {
  useAgentRun,
  useAgentRunTasks,
} from "@/services/hooks/useAgentRun";
import type {
  AgentRunStats as AgentRunStatsData,
  AgentRunTaskData,
} from "@/services/api/types/agent-runs";
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

function formatUseCaseName(name?: string | null): string {
  if (!name) return "Use Case";
  return name
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Transform stats to local detail model (no external utils)
function buildDetailDataFromStats(stats?: AgentRunStatsData | null): AgentRunDetailData {
  if (!stats) return { websites: [] };

  const useCases: AgentRunUseCase[] = (stats.performanceByUseCase || []).map(
    (u, idx) => ({ id: u.useCase || idx, name: u.useCase || `Use Case ${idx + 1}` })
  );

  const genericResults: AgentRunResult[] = (stats.performanceByUseCase || []).map(
    (u, idx) => ({
      useCaseId: u.useCase || idx,
      name: u.useCase || `Use Case ${idx + 1}`,
      successRate: typeof u.averageScore === "number" ? u.averageScore : 0,
      total: u.tasks || 0,
      successCount: u.successful || 0,
      avgSolutionTime: u.averageDuration || 0,
    })
  );

  const websites: AgentRunWebsite[] = (stats.performanceByWebsite || []).map((w, i) => ({
    name: w.website || `Website ${i + 1}`,
    useCases,
    // Note: Per-website use-case breakdown may not be available; use global as a reasonable approximation
    results: genericResults,
    overall: {
      successRate: typeof w.averageScore === "number" ? w.averageScore : 0,
      total: w.tasks || 0,
      successCount: w.successful || 0,
      avgSolutionTime: typeof w.averageDuration === "number" ? w.averageDuration : 0,
    },
  }));

  return { websites };
}

export default function Page() {
  const { id } = useParams();
  const runId = Array.isArray(id) ? id[0] : (id as string) || "";

  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  const { data, error, refetch, isAnyLoading } = useAgentRun(runId, {
    includePersonas: true,
    includeStats: true,
    includeSummary: true,
    includeTasks: true,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Derived detail data from stats for charts/summary
  const detailData = useMemo(() => buildDetailDataFromStats(data.stats), [data.stats]);

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title="Agent Run Details"
        description={
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span>Agent Run ID:</span>
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(253, 245, 230, 0.18)",
                  color: HIGHLIGHT_COLOR,
                  border: "1px solid rgba(253, 245, 230, 0.35)",
                }}
              >
                {runId}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <span>Validator Round ID:</span>
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(253, 245, 230, 0.18)",
                  color: HIGHLIGHT_COLOR,
                  border: "1px solid rgba(253, 245, 230, 0.35)",
                }}
              >
                {data?.personas?.round?.name ?? "—"}
              </span>
            </span>
          </div>
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

      <AgentRunPersonas personas={data.personas} summary={data.summary} />
      <AgentRunStats stats={data.stats || null} />

      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        <div className="xl:col-span-8">
          {data.loading.stats && (
            <AgentRunDetailPlaceholder />
          )}
          {!data.loading.stats && (
            <AgentRunDetail
              selectedWebsite={selectedWebsite}
              setSelectedWebsite={setSelectedWebsite}
              period={period}
              setPeriod={setPeriod}
              data={detailData}
            />
          )}
        </div>
        <div className="xl:col-span-4">
          {data.loading.stats && data.loading.summary ? (
            <AgentRunSummaryPlaceholder />
          ) : (
            <AgentRunSummary selectedWebsite={selectedWebsite} data={detailData} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <AgentRunTasksSection />
      </div>

      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-transparent border border-blue-600/60 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Updating data...</span>
        </div>
      )}
    </div>
  );
}

// Personas card group
function AgentRunPersonas({ personas, summary }: { personas?: any; summary?: any }) {
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

  const validatorHotkey = summary?.validatorId || validatorData.id || validatorData.name;
  const taoStatsUrl = validatorHotkey ? `https://taostats.io/validators/${validatorHotkey}` : null;

  const extractUidNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const match = value.match(/-?\d+/);
      if (match) {
        const parsed = Number.parseInt(match[0], 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return null;
  };

  const agentUid =
    (typeof agentData.uid === "number" ? agentData.uid : null) ??
    (typeof summary?.agentUid === "number" ? summary?.agentUid : null) ??
    extractUidNumber(agentData.id) ??
    extractUidNumber(summary?.agentId);

  const agentHotkey = agentData.hotkey ?? summary?.agentHotkey ?? agentData.id ?? summary?.agentId;

  const fallbackMinerImage = (() => {
    const uidCandidate = agentUid ?? extractUidNumber(summary?.minerUid);
    if (uidCandidate === null) return "/images/autoppia-logo.png";
    const normalized = Math.abs(uidCandidate % 50);
    return `/miners/${normalized}.svg`;
  })();

  const minerImageSrc = agentData.image ? resolveAssetUrl(agentData.image) : resolveAssetUrl(fallbackMinerImage);
  const validatorImageSrc = validatorData.image
    ? resolveAssetUrl(validatorData.image)
    : resolveAssetUrl("/validators/Other.png");

  const toEpochSeconds = (value?: string | null) => {
    if (!value) return null;
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return null;
    return Math.floor(timestamp / 1000);
  };

  const epochStart = toEpochSeconds(roundData.startTime);
  const epochEnd = toEpochSeconds(roundData.endTime ?? summary?.endTime);
  const formatEpoch = (value: number | null) => (typeof value === "number" ? value.toString() : "—");

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Round */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-5 text-white">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-transparent text-amber-300 border border-amber-400">
              <PiClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Round</p>
              <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                #{roundData.id ?? summary?.roundId ?? "—"}
              </p>
            </div>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ borderColor: "rgba(253, 245, 230, 0.45)", backgroundColor: "rgba(253, 245, 230, 0.12)", color: HIGHLIGHT_COLOR }}
          >
            {(roundData.status || "Active").replace(/^\w/, (c: string) => c.toUpperCase())}
          </span>
        </header>

        <div className="mt-4 rounded-xl border border-white/10 bg-transparent px-3 py-3 text-sm text-white/80">
          <div className="flex items-center justify-between gap-3 font-mono text-base text-white">
            <span className="uppercase tracking-[0.3em] text-xs text-white/60">Epoch:</span>
            <span className="whitespace-nowrap">{formatEpoch(epochStart)} - {formatEpoch(epochEnd)}</span>
          </div>
        </div>
      </section>

      {/* Validator */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-5 text-white">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image alt={validatorData.name} src={validatorImageSrc} width={56} height={56} unoptimized className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-purple-500/30" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Validator</p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">{validatorData.name}</p>
            </div>
          </div>
          {taoStatsUrl ? (
            <a href={taoStatsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]" title="Open TaoStats">
              <PiArrowSquareOutDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.3em] text-xs text-white/60">Hotkey:</span>
              <span className="font-mono text-sm text-white">{truncateMiddle(validatorHotkey)}</span>
              <button type="button" onClick={() => validatorHotkey && navigator.clipboard.writeText(validatorHotkey)} className="inline-flex items-center justify-center rounded-md border border-white/20 bg-transparent p-1 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]" aria-label="Copy validator hotkey">
                <PiCopySimple className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Miner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-5 text-white">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image alt={agentData.name} src={minerImageSrc} width={64} height={64} unoptimized className="h-16 w-16 rounded-full border border-white/15 object-cover shadow-lg shadow-blue-900/40" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Miner</p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">{agentData.name}</p>
            </div>
          </div>
          {agentData.github ? (
            <a href={agentData.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]" title="Open GitHub">
              <PiGithubLogoDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">UID:</span>
                <span className="font-mono text-sm text-white">{agentUid ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">Hotkey:</span>
                <span className="font-mono text-sm text-white">{truncateMiddle(agentHotkey)}</span>
                <button type="button" onClick={() => agentHotkey && navigator.clipboard.writeText(agentHotkey)} className="inline-flex items-center justify-center rounded-md border border-white/20 bg-transparent p-1 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]" aria-label="Copy miner hotkey">
                  <PiCopySimple className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Stats cards
function AgentRunStats({ stats }: { stats: AgentRunStatsData | null }) {
  const numberFormatter = new Intl.NumberFormat("en-US");
  const percentageFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const clampPercentage = (v: number | null | undefined) => {
    if (typeof v !== "number" || Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(100, v));
  };
  const clampNonNegative = (v: number | null | undefined) => {
    if (typeof v !== "number" || Number.isNaN(v)) return 0;
    return Math.max(0, v);
  };
  const formatCount = (v: number | null | undefined) => numberFormatter.format(Math.max(0, Math.round(v ?? 0)));
  const formatPercentage = (v: number) => `${percentageFormatter.format(v)}%`;
  const formatDuration = (v: number | null | undefined) => (v && v > 0 ? `${percentageFormatter.format(v)}s` : "—");

  const overallScore = clampPercentage(stats?.overallScore);
  const totalTasks = clampNonNegative(stats?.totalTasks);
  const successfulTasks = clampNonNegative(stats?.successfulTasks);
  const failedTasks = stats?.failedTasks != null ? clampNonNegative(stats.failedTasks) : Math.max(totalTasks - successfulTasks, 0);
  const websitesCount = clampNonNegative(stats?.websites ?? stats?.performanceByWebsite?.length ?? 0);
  const successRate = clampPercentage(stats?.successRate ?? (totalTasks ? (successfulTasks / totalTasks) * 100 : 0));
  const averageDuration = stats?.averageTaskDuration ?? 0;

  const displayOverallScore = formatPercentage(overallScore);
  const displaySuccessRate = formatPercentage(successRate);
  const displayAverageDuration = formatDuration(averageDuration);

  const cards = [
    { key: "tasks", label: "Total Tasks", value: formatCount(totalTasks), icon: PiClock, wrapperClass: "border-blue-400/45 text-blue-50", iconClass: "text-blue-100", valueClass: "text-blue-50", labelClass: "text-blue-100/80" },
    { key: "websites", label: "Websites", value: formatCount(websitesCount), icon: PiGlobe, wrapperClass: "border-amber-400/50 text-amber-50", iconClass: "text-amber-100", valueClass: "text-amber-50", labelClass: "text-amber-100/85" },
    { key: "success", label: "Successful", value: formatCount(successfulTasks), icon: PiCheckCircle, wrapperClass: "border-emerald-400/50 text-emerald-50", iconClass: "text-emerald-100", valueClass: "text-emerald-50", labelClass: "text-emerald-100/80" },
    { key: "failed", label: "Failed", value: formatCount(failedTasks), icon: PiXCircle, wrapperClass: "border-rose-400/50 text-rose-50", iconClass: "text-rose-100", valueClass: "text-rose-50", labelClass: "text-rose-100/80" },
  ] as const;

  const renderCard = (card: (typeof cards)[number], isMobile = false) => {
    const Icon = card.icon;
    return (
      <div key={card.key} className={cn("rounded-2xl border px-4 py-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl", card.wrapperClass, isMobile ? "sm:px-5 sm:py-5" : "p-4")}>        
        <Icon className={cn("mx-auto mb-2 h-6 w-6", card.iconClass)} />
        <div className={cn("text-2xl font-bold sm:text-3xl", card.valueClass)}>{card.value}</div>
        <div className={cn("text-sm font-medium uppercase tracking-wide", card.labelClass)}>{card.label}</div>
      </div>
    );
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white">

      <div className="flex flex-col space-y-6 md:hidden relative">
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_15px_35px_rgba(244,197,94,0.45)]" style={{ WebkitTextStroke: "0.4px rgba(249, 250, 251, 0.15)" }}>{displayOverallScore}</div>
          <div className="mt-2 text-sm font-medium text-white/70">Overall evaluation score</div>
          <div className="mt-1 text-xs text-white/60">Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">{cards.map((c) => renderCard(c, true))}</div>
      </div>

      <div className="hidden md:flex items-center justify-between relative">
        <div className="grid grid-cols-2 gap-6">{cards.slice(0, 2).map((c) => renderCard(c))}</div>
        <div className="flex flex-col items-center justify-center mx-8">
          <div className="bg-gradient-to-r from-amber-300 via-yellow-200 to-yellow-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-[0_18px_38px_rgba(244,197,94,0.5)]" style={{ WebkitTextStroke: "0.6px rgba(249, 250, 251, 0.18)" }}>{displayOverallScore}</div>
          <div className="mt-2 text-sm font-medium text-white/70">Overall evaluation score</div>
          <div className="mt-1 text-xs text-white/60">Success rate {displaySuccessRate} • Avg duration {displayAverageDuration}</div>
        </div>
        <div className="grid grid-cols-2 gap-6">{cards.slice(2).map((c) => renderCard(c))}</div>
      </div>
    </div>
  );
}

// Detail panel (bar list)
function AgentRunDetail({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
  data,
}: {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
  data?: AgentRunDetailData | null;
}) {
  const agentDetailsData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentDetailsData.websites.length > 0;

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web, index) => ({ value: web.name ?? `Website ${index + 1}`, label: web.name ?? `Website ${index + 1}` })),
  ];

  const periodOptions = [
    { value: "24h", label: "Last 24h" },
    { value: "7d", label: "Last 7d" },
    { value: "__all__", label: "All time" },
  ];

  const chartData =
    selectedWebsite && selectedWebsite !== "__all__"
      ? (() => {
          const selectedWeb = agentDetailsData.websites.find((web) => web.name === selectedWebsite);
          return (
            selectedWeb?.results.map((result, idx) => ({
              website: formatUseCaseName(
                selectedWeb.useCases.find((uc) => String(uc.id) === String(result.useCaseId))?.name || `Use Case ${result.useCaseId}`
              ),
              average: Number((result.successRate ?? 0).toFixed(3)),
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web, idx) => ({
          website: web.name,
          average: Number((web.overall.successRate ?? 0).toFixed(3)),
          total: web.overall.total ?? 0,
          successCount: web.overall.successCount ?? 0,
          avgSolutionTime: web.overall.avgSolutionTime ?? 0,
          colorIndex: idx,
        }));

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white", className)}>

      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl">
              <PiChartBar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
              <p className="text-sm text-white/70">Success rates and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <PiTarget className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white/80">Time range:</span>
            </div>
            <Select
              options={periodOptions}
              value={periodOptions.find((opt) => opt.value === (period ?? "__all__"))}
              onChange={(option: { label: string; value: string }) => setPeriod(option.value === "__all__" ? null : option.value)}
              className="w-[90px] text-sm rounded-lg border border-white/20 bg-transparent text-white focus:border-white/40 focus:ring-0"
            />
            <Select
              options={websiteOptions}
              value={websiteOptions.find((opt) => opt.value === (selectedWebsite ?? "__all__"))}
              onChange={(option: { label: string; value: string }) => setSelectedWebsite(option.value === "__all__" ? null : option.value)}
              className="w-[160px] text-sm rounded-lg border border-white/20 bg-transparent text-white focus:border-white/40 focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ borderColor: "rgba(253, 245, 230, 0.45)", backgroundColor: "rgba(253, 245, 230, 0.15)", color: HIGHLIGHT_COLOR }}>
            Active
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: HIGHLIGHT_COLOR }} />
          </span>
          <span className="text-xs text-white/70">Live view of current website performance trends</span>
        </div>
      </div>

      {hasWebsites ? (
        <div className="relative space-y-6">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const isHighPerformance = item.average >= 80;
            const isMediumPerformance = item.average >= 60 && item.average < 80;

            return (
              <div key={`${item.website}-${index}`} className="group relative rounded-xl border border-white/15 bg-transparent p-5 transition-all duration-300 hover:border-[#FDF5E6]/60 hover:shadow-2xl" style={{ boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: colorClass }} />
                    <span className="text-lg font-semibold text-white">{item.website}</span>
                    {isHighPerformance && (
                      <div className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border" style={{ backgroundColor: "rgba(253, 245, 230, 0.2)", borderColor: "rgba(253, 245, 230, 0.45)", color: HIGHLIGHT_COLOR }}>
                        <PiTrendUp className="w-3 h-3" />
                        Excellent
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 text-indigo-100 rounded-full text-xs font-medium border border-indigo-400/30 bg-transparent">
                        <PiTrendUp className="w-3 h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-2 py-1 text-red-200 rounded-full text-xs font-medium border border-red-400/40 bg-transparent">
                        <PiTrendDown className="w-3 h-3" />
                        Needs Improvement
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{item.average.toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">{item.total} requests • {item.successCount} successful</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-4 w-full rounded-full bg-transparent overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${Math.max(0, Math.min(item.average, 100))}%`, background: `linear-gradient(90deg, ${colorClass} 0%, rgba(253, 245, 230, 0.85) 100%)`, boxShadow: "0 8px 25px rgba(253, 245, 230, 0.25)" }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: HIGHLIGHT_COLOR, opacity: item.average > 5 ? 1 : 0 }} />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/60">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg border border-white/15 bg-transparent p-3">
                    <div className="mb-1 text-white/70">Avg Solution Time</div>
                    <div className="font-semibold text-white">{item.avgSolutionTime.toFixed(2)}s</div>
                  </div>
                  <div className="rounded-lg border border-white/15 bg-transparent p-3">
                    <div className="mb-1 text-white/70">Success Rate</div>
                    <div className="font-semibold text-white">{((item.successCount / Math.max(item.total, 1)) * 100).toFixed(1)}%</div>
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
          <h3 className="text-lg font-semibold text-white mb-2">No Performance Data Available</h3>
          <p className="text-white/70">Performance metrics will appear here once the agent run completes.</p>
        </div>
      )}
    </div>
  );
}

function AgentRunDetailPlaceholder({ className }: { className?: string }) {
  const progressWidths = ["68%", "52%", "78%"];
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6", className)}>

      <div className="relative mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-transparent p-3"><Placeholder variant="circular" width={28} height={28} className="bg-transparent" /></div>
            <div className="space-y-2">
              <Placeholder height="1.5rem" width="14rem" className="bg-transparent" />
              <Placeholder height="1rem" width="18rem" className="bg-transparent" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Placeholder height="1rem" width="4rem" className="hidden rounded-full bg-transparent md:block" />
            <div className="flex items-center gap-2">
              <Placeholder height="2.25rem" width="5.5rem" className="rounded-lg bg-transparent" />
              <Placeholder height="2.25rem" width="7.5rem" className="rounded-lg bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-6">
        {progressWidths.map((w, i) => (
          <div key={`placeholder-card-${i}`} className="relative rounded-xl border border-white/15 bg-transparent p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Placeholder variant="circular" width={12} height={12} className="bg-transparent" />
                <Placeholder height="1.1rem" width="8rem" className="bg-transparent" />
                <Placeholder height="1.1rem" width="5rem" className="rounded-full bg-transparent" />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder height="1.75rem" width="3.5rem" className="bg-transparent" />
                <Placeholder height="1rem" width="10rem" className="bg-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full overflow-hidden rounded-full bg-transparent">
                <Placeholder height="100%" width={w} className="bg-transparent" />
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 5 }, (_, j) => (
                  <Placeholder key={`marker-${j}`} height="0.75rem" width="2.25rem" className="bg-transparent" />
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              {Array.from({ length: 2 }, (_, m) => (
                <div key={`metric-${m}`} className="rounded-lg border border-white/15 bg-transparent p-3">
                  <Placeholder height="0.85rem" width="70%" className="mb-2 bg-transparent" />
                  <Placeholder height="1.4rem" width="50%" className="bg-transparent" />
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

function AgentRunSummary({ className, selectedWebsite, data }: { className?: string; selectedWebsite?: string | null; data?: AgentRunDetailData | null }) {
  const agentData: AgentRunDetailData = data ?? { websites: [] };
  const hasWebsites = agentData.websites.length > 0;

  // Compute display metrics
  let successRate = 0;
  let totalRequests = 0;
  let totalSuccesses = 0;
  let avgSolutionTime = 0;

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find((w) => w.name === selectedWebsite);
    if (selectedWeb) {
      successRate = selectedWeb.overall.successRate;
      totalRequests = selectedWeb.overall.total;
      totalSuccesses = selectedWeb.overall.successCount;
      avgSolutionTime = selectedWeb.overall.avgSolutionTime;
    }
  } else {
    const websites = agentData.websites;
    successRate = websites.length ? websites.reduce((s, w) => s + w.overall.successRate, 0) / websites.length : 0;
    totalRequests = websites.reduce((s, w) => s + w.overall.total, 0);
    totalSuccesses = websites.reduce((s, w) => s + w.overall.successCount, 0);
    avgSolutionTime = websites.length ? websites.reduce((s, w) => s + w.overall.avgSolutionTime, 0) / websites.length : 0;
  }

  const displayData = (() => {
    if (selectedWebsite) {
      const selectedWeb = agentData.websites.find((w) => w.name === selectedWebsite);
      if (!selectedWeb) return [] as { label: string; value: number; total: number; successCount: number; avgSolutionTime: number }[];
      return selectedWeb.results.map((r) => ({
        label: formatUseCaseName(selectedWeb.useCases.find((uc) => String(uc.id) === String(r.useCaseId))?.name || `Use Case ${r.useCaseId}`),
        value: r.successRate,
        total: r.total,
        successCount: r.successCount,
        avgSolutionTime: r.avgSolutionTime,
      }));
    }
    return agentData.websites.map((w, idx) => ({
      label: w.name ?? `Website ${idx + 1}`,
      value: w.overall.successRate,
      total: w.overall.total,
      successCount: w.overall.successCount,
      avgSolutionTime: w.overall.avgSolutionTime,
    }));
  })();

  const donutData = selectedWebsite
    ? (() => {
        const selectedWeb = agentData.websites.find((w) => w.name === selectedWebsite);
        if (!selectedWeb) return [] as any[];
        const sortedResults = [...selectedWeb.results]
          .map((result) => {
            const useCase = selectedWeb.useCases.find((uc) => String(uc.id) === String(result.useCaseId));
            const label = formatUseCaseName(useCase?.name || `Use Case ${result.useCaseId}`);
            return { label, value: result.total, average: result.successRate, total: result.total, successCount: result.successCount, avgSolutionTime: result.avgSolutionTime };
          })
          .sort((a, b) => b.average - a.average);
        return displayData.map((item, idx) => {
          const match = sortedResults.find((d) => d.label === item.label);
          return {
            label: item.label,
            value: match ? match.average * match.total : item.value * item.total,
            average: match ? match.average : item.value,
            total: match ? match.total : item.total,
            successCount: match ? match.successCount : item.successCount,
            avgSolutionTime: match ? match.avgSolutionTime : item.avgSolutionTime,
            fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
            stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
          };
        });
      })()
    : agentData.websites.map((w, idx) => ({
        label: w.name ?? `Website ${idx + 1}`,
        value: w.overall.successRate * w.overall.total,
        average: w.overall.successRate,
        total: w.overall.total,
        successCount: w.overall.successCount,
        avgSolutionTime: w.overall.avgSolutionTime,
        fill: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
        stroke: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
      }));

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white ${className ?? ""}`}>

      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl border border-white/15 bg-transparent p-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">Summary</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Performance Breakdown</p>
      </div>

      <div className="relative text-white/80">
        <div className="h-[240px] w-full @sm:py-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} innerRadius={85} outerRadius={100} paddingAngle={5} cornerRadius={30} dataKey="value" stroke="#fff" strokeWidth={2}>
                <Label position="center" content={(props) => (
                  <CenterLabel value={successRate.toFixed(0)} totalRequests={totalRequests.toFixed(0)} totalSuccesses={totalSuccesses.toFixed(0)} viewBox={(props as any).viewBox} />
                )} />
                {donutData.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {hasWebsites ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-transparent">
            {displayData.map((item, idx) => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-3 px-2 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PROGRESS_COLORS[idx % PROGRESS_COLORS.length] }} />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{item.value.toFixed(1)}%</div>
                  <div className="text-xs text-white/70">{item.total} requests • {item.successCount} successes{selectedWebsite && <span> • {item.avgSolutionTime.toFixed(2)}s avg</span>}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/70">Summary metrics are not available for this run yet.</div>
        )}
      </div>
    </div>
  );
}

function CenterLabel({ value, totalRequests, totalSuccesses, viewBox }: { value: string; totalRequests: string; totalSuccesses: string; viewBox: any }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 20} fill={HIGHLIGHT_COLOR} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "system-ui, sans-serif", textShadow: "0 12px 28px rgba(253, 245, 230, 0.35)" }}>
        <tspan fontSize="36" fontWeight="700">{value}%</tspan>
      </text>
      <text x={cx} y={cy + 10} fill="#E2E8F0" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "system-ui, sans-serif" }}>
        <tspan fontSize="14" fontWeight="600">Requests · {totalRequests}</tspan>
      </text>
      <text x={cx} y={cy + 30} fill="#E2E8F0" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "system-ui, sans-serif" }}>
        <tspan fontSize="14" fontWeight="600">Successes · {totalSuccesses}</tspan>
      </text>
    </>
  );
}

function AgentRunSummaryPlaceholder({ className }: { className?: string }) {
  const donutInner = (
    <div className="relative flex items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        <Placeholder variant="circular" width={200} height={200} className="border border-white/15 bg-transparent" />
        <div className="absolute flex flex-col items-center gap-2">
          <Placeholder height="2.25rem" width="4rem" className="rounded-lg bg-transparent" />
          <Placeholder height="0.9rem" width="7.5rem" className="rounded bg-transparent" />
          <Placeholder height="0.9rem" width="6.5rem" className="rounded bg-transparent" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6", className)}>

      <div className="relative mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl border border-white/15 bg-transparent p-2"><Placeholder variant="circular" width={24} height={24} className="bg-transparent" /></div>
          <Placeholder height="1.35rem" width="6rem" className="bg-transparent" />
        </div>
        <Placeholder height="0.75rem" width="10rem" className="bg-transparent" />
      </div>

      <div className="relative text-white/80">
        {donutInner}
        <div className="mt-6 flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-transparent">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`summary-placeholder-${index}`} className="flex items-center justify-between gap-3 px-3 py-4">
              <div className="flex items-center gap-2">
                <Placeholder variant="circular" width={12} height={12} className="bg-transparent" />
                <Placeholder height="0.85rem" width="7rem" className="bg-transparent" />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder height="1rem" width="3.75rem" className="bg-transparent" />
                <Placeholder height="0.75rem" width="8rem" className="bg-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tasks table with pagination
const columnHelper = createColumnHelper<AgentRunTaskData>();
const agentRunTasksColumns = [
  columnHelper.display({
    id: "taskId",
    size: 80,
    header: "Task Id",
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.taskId}`}
        className="ms-2 font-mono text-white"
        title="View task details"
      >
        #{row.original.taskId}
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
        href={`${routes.tasks}/${row.original.taskId}`}
        className="block max-w-[320px] break-words whitespace-pre-wrap font-medium text-slate-200"
        title="View task details"
      >
        {row.original.prompt}
      </Link>
    ),
  }),
  columnHelper.accessor("website", {
    id: "website",
    size: 120,
    header: "Website",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.taskId}`}
        className="inline-flex items-center rounded-md border border-blue-600 px-2 py-0.5 text-xs text-blue-300"
        title="View task details"
      >
        {row.original.website}
      </Link>
    ),
  }),
  columnHelper.accessor("useCase", {
    id: "useCase",
    size: 160,
    header: "Use Case",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.taskId}`}
        className="font-medium text-slate-300"
        title="View task details"
      >
        {row.original.useCase
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")}
      </Link>
    ),
  }),
  columnHelper.accessor("score", {
    id: "score",
    size: 100,
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score;
      let scoreColor = "text-slate-300";
      if (score >= 0.8) scoreColor = "text-green-400";
      else if (score >= 0.6) scoreColor = "text-yellow-400";
      else if (score >= 0.4) scoreColor = "text-orange-400";
      else scoreColor = "text-red-400";
      return (
        <Link
          href={`${routes.tasks}/${row.original.taskId}`}
          className={`font-medium ${scoreColor}`}
          title="View task details"
        >
          {score.toFixed(2)}
        </Link>
      );
    },
  }),
  columnHelper.accessor("duration", {
    id: "duration",
    size: 100,
    header: "Duration",
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.taskId}`}
        className="font-medium text-slate-300"
        title="View task details"
      >
        {row.original.duration}s
      </Link>
    ),
  }),
  columnHelper.display({
    id: "action",
    size: 100,
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.taskId}`}
        className="flex items-center text-slate-200 transition-colors duration-200"
        title="Inspect task"
      >
        <Button
          variant="outline"
          size="sm"
          className="relative z-20 border-slate-600 text-white hover:border-slate-400 hover:bg-transparent"
        >
          <PiEyeBold className="me-1.5 size-4" />
          <span>Inspect</span>
        </Button>
      </Link>
    ),
  }),
];

function AgentRunTasksSection() {
  const { id } = useParams();
  const { tasks, total, page, limit, isLoading, error, refetch, goToPage, changeLimit } = useAgentRunTasks(id as string, { page: 1, limit: 10 });

  const { table, setData } = useTanStackTable<AgentRunTaskData>({
    tableData: tasks || [],
    columnConfig: agentRunTasksColumns,
    options: {
      initialState: { pagination: { pageIndex: (page || 1) - 1, pageSize: limit || 10 } },
      enableColumnResizing: false,
      manualPagination: true,
      pageCount: Math.max(1, Math.ceil((total || 0) / Math.max(1, limit || 10))),
    },
  });

  useEffect(() => { if (tasks) setData(tasks); }, [tasks, setData]);

  if (isLoading && !tasks) {
    return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-6">
        <div className="relative mb-6 flex items-center justify-between"><Placeholder height="1.4rem" width="6rem" /><Placeholder height="2.3rem" width="15rem" /></div>
        <div className="relative mb-3">
          <div className="overflow-hidden rounded-2xl border border-slate-700/25">
            <table className="w-full">
              <thead className="bg-transparent">
                <tr>{Array.from({ length: 6 }).map((_, i) => (<th key={i} className="px-4 py-3 text-left"><Placeholder height="1rem" width="4rem" /></th>))}</tr>
              </thead>
              <tbody>{Array.from({ length: 5 }).map((_, i) => (<TableRowPlaceholder key={i} columns={6} />))}</tbody>
            </table>
          </div>
        </div>
        <div className="relative flex items-center justify-between py-4"><Placeholder height="1rem" width="8rem" /><div className="flex items-center gap-2"><Placeholder height="2rem" width="6rem" /><Placeholder height="2rem" width="4rem" /><Placeholder height="2rem" width="6rem" /></div></div>
      </div>
    );
  }

  if (error && !tasks) {
    return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-6">
        <div className="relative mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All Tasks</h2>
        </div>
        <div className="relative py-8 text-center">
          <div className="mb-2 text-lg font-semibold text-red-400">Failed to Load Tasks Data</div>
          <div className="mb-4 text-sm text-red-300">{error}</div>
          <button onClick={refetch} className="rounded-lg bg-transparent border border-red-600 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-transparent">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-transparent p-6">

      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">
          All Tasks
          {total > 0 && <span className="ml-2 text-sm font-normal text-slate-300">({total} total)</span>}
        </h2>
        <div className="relative w-full max-w-[240px]">
          <Input type="search" clearable placeholder="Search task..." onClear={() => table.setGlobalFilter("")} value={(table.getState().globalFilter as string) ?? ""} prefix={<PiMagnifyingGlassBold className="size-4 text-slate-400" />} onChange={(e) => table.setGlobalFilter(e.target.value)} className="w-full xs:max-w-60" />
        </div>
      </div>

      <div className="relative mb-2">
        {tasks && tasks.length > 0 ? (
          <Table
            table={table}
            variant="modern"
            classNames={{
              container:
                "custom-scrollbar scroll-smooth overflow-x-auto rounded-2xl border border-slate-700/25 bg-transparent",
              headerClassName: "bg-transparent text-slate-200",
              rowClassName:
                "group cursor-pointer relative border-b border-slate-700/25 transition-colors duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_12px_28px_rgba(255,255,255,0.12)]",
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-700/25 bg-transparent p-8 text-center">
            <div className="mb-2 text-lg font-medium text-slate-200">No Tasks Found</div>
            <div className="text-sm text-slate-400">No tasks are available for this agent run.</div>
          </div>
        )}
      </div>

      {tasks && tasks.length > 0 && (
        <TablePagination table={table} className="relative py-4 text-slate-300" />
      )}

      {isLoading && tasks && (
        <div className="relative flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
            <span className="text-sm">Loading more tasks...</span>
          </div>
        </div>
      )}
    </div>
  );
}
