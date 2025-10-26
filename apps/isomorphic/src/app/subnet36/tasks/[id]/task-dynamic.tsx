"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { Text } from "rizzui";
import PageHeader from "@/app/shared/page-header";
import Placeholder, { TextPlaceholder, ListItemPlaceholder } from "@/app/shared/placeholder";
import { routes } from "@/config/routes";
import { useTaskDetails, useTaskResults, useTaskActions, useTaskScreenshots } from "@/services/hooks/useTask";
import { resolveAssetUrl } from "@/services/utils/assets";
import type { IconType } from "react-icons";
import {
  PiArrowLeftLight,
  PiCopy,
  PiChartBar,
  PiClockCountdown,
  PiFileText,
  PiGauge,
  PiIdentificationCard,
  PiShieldCheck,
  PiTimer,
  PiUserCircle,
  PiArrowRight,
  PiClock,
  PiKeyboard,
  PiCursorClick,
  PiScroll,
  PiCamera,
  PiWarning,
  PiCheckCircle,
  PiXCircle,
  PiPlay,
  PiGlobe,
  PiTarget,
  PiHash,
  PiDownloadSimple,
  PiArrowSquareOutDuotone,
} from "react-icons/pi";
import type { TaskAction, TaskDetails } from "@/services/api/types/tasks";

// Shared helpers
function truncateMiddle(value?: string | null, visible: number = 8) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function IDCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // no-op
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md bg-white/10 p-1 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
      title="Copy to clipboard"
      type="button"
    >
      {copied ? <span className="text-[10px] font-bold text-emerald-300">✓</span> : <PiCopy className="h-3 w-3" />}
    </button>
  );
}

// ===== Inlined Task Details (Cooked) =====
type StatCardConfig = {
  label: string;
  value: ReactNode;
  Icon: IconType;
  gradient: string;
  iconWrapper: string;
  iconColorClass?: string;
  iconBgClass?: string;
  description?: ReactNode;
  valueClassName?: string;
};

type QuickInfoItem = {
  label: string;
  value: ReactNode;
  Icon: IconType;
  href?: string;
  subValue?: ReactNode;
  valueClassName?: string;
  accentBarClass: string;
  iconWrapperClass: string;
  iconColorClass: string;
  iconBgClass?: string;
  imageSrc?: string;
  imageAlt?: string;
};

const formatLabel = (value?: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatPercent = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const formatDuration = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (value < 60) return `${Math.round(value)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const formatNumber = (value?: number | null, digits: number = 2) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
};

function InfoRow({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/55">{label}</span>
      <span className={`text-right text-white/85 font-medium leading-snug ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}

// (ContextCard removed; relationships moved into tiles/snapshot)

const getStatusStyles = (status?: string) => {
  const base = {
    gradient: "from-slate-500/20 via-slate-600/10 to-transparent",
    iconWrapper: "border-slate-600/40 bg-transparent",
    valueClassName: "text-slate-100",
    iconColorClass: "text-slate-200",
  } as const;
  if (!status) return base;
  const normalized = status.toLowerCase();
  if (normalized.includes("success") || normalized.includes("complete")) {
    return {
      gradient: "from-emerald-500/25 via-emerald-400/10 to-transparent",
      iconWrapper: "border-emerald-400/45 bg-transparent",
      valueClassName: "text-emerald-100",
      iconColorClass: "text-emerald-200",
    } as const;
  }
  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient: "from-sky-500/25 via-cyan-400/10 to-transparent",
      iconWrapper: "border-sky-400/45 bg-transparent",
      valueClassName: "text-sky-100",
      iconColorClass: "text-sky-200",
    } as const;
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient: "from-rose-500/25 via-orange-400/10 to-transparent",
      iconWrapper: "border-rose-400/45 bg-transparent",
      valueClassName: "text-rose-100",
      iconColorClass: "text-rose-200",
    } as const;
  }
  return base;
};

function StatCard({ label, value, Icon, gradient, iconWrapper, iconColorClass, iconBgClass, description, valueClassName }: StatCardConfig) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#2d3452]/70 bg-slate-900/50 text-slate-100 shadow-[0_18px_44px_rgba(4,8,20,0.68)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6b7cdf]/60">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
      <div className="relative flex gap-4 p-5 items-start">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${iconBgClass ?? 'bg-white/10'} border-white/20 shrink-0 ${iconWrapper}`}>
          <Icon className={`h-6 w-6 text-white`} />
        </div>
        <div className="flex-1">
          <span className="text-[11px] uppercase tracking-wide text-slate-200/75">{label}</span>
          <div className={`mt-1.5 text-2xl font-semibold text-white ${valueClassName ?? ""}`}>{value}</div>
          {description ? <p className="mt-2 text-xs leading-relaxed text-slate-200/75">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

type TaskDetailsDynamicProps = { details?: TaskDetails | null; isLoading?: boolean; error?: string | null };
function TaskDetailsDynamic({ details, isLoading = false, error }: TaskDetailsDynamicProps) {
  if (isLoading && !details) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-transparent p-8 shadow-2xl backdrop-blur-sm">
        <div className="relative space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`task-loading-primary-${idx}`} className="animate-pulse rounded-xl border border-slate-700/50 bg-transparent p-5">
                <div className="space-y-3">
                  <div className="h-2.5 w-20 rounded bg-slate-700" />
                  <div className="h-6 w-32 rounded bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`task-loading-secondary-${idx}`} className="animate-pulse rounded-xl border border-slate-700/50 bg-transparent p-6">
                <div className="space-y-3">
                  <div className="h-2.5 w-16 rounded bg-slate-700" />
                  <div className="h-8 w-24 rounded bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if ((error && !details) || !details) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-transparent p-6 shadow-2xl mb-8">
        <div className="relative text-center">
          <div className="text-red-200 text-lg font-semibold mb-2">Failed to load task overview</div>
          <div className="text-sm text-red-100/80">{error || "An unexpected error occurred while fetching task data."}</div>
        </div>
      </div>
    );
  }

  const taskData = details;
  const relationships = taskData.relationships;
  const roundInfo = relationships?.round;
  const validatorInfo = relationships?.validator;
  const minerInfo = relationships?.miner;
  const agentRunInfo = relationships?.agentRun;
  const evaluationInfo = relationships?.evaluation;
  const solutionInfo = relationships?.solution;

  const evaluationScore = typeof evaluationInfo?.finalScore === "number" ? formatPercent(evaluationInfo.finalScore) : formatPercent((taskData as any).score);
  const evaluationDuration = evaluationInfo ? formatDuration(evaluationInfo.evaluationTime) : formatDuration((taskData as any).duration);
  const agentRunDuration = agentRunInfo?.duration ? formatDuration(agentRunInfo.duration) : formatDuration((taskData as any).duration);
  const agentRunAverageScore = typeof agentRunInfo?.averageScore === "number" ? formatPercent(agentRunInfo.averageScore) : "—";

  // (Artifacts/solution summary removed from UI to reduce duplication)
  const evaluationStyles = getStatusStyles(evaluationInfo?.status ?? (taskData as any).status);
  const agentRunLinkId = agentRunInfo?.agentRunId ?? (taskData as any).agentRunId ?? "";

  const primaryCards: StatCardConfig[] = [
    { label: "Score", value: evaluationScore, Icon: PiChartBar, gradient: "from-emerald-500/18 via-emerald-400/8 to-transparent", iconWrapper: "border-emerald-400/40", iconBgClass: "bg-emerald-500/20", iconColorClass: "text-white", description: evaluationInfo ? "Final evaluation issued by the validator for this task." : "Awaiting validator scoring for this task.", valueClassName: "text-emerald-100" },
    { label: "Duration", value: evaluationDuration, Icon: PiTimer, gradient: "from-indigo-500/18 via-indigo-400/8 to-transparent", iconWrapper: "border-indigo-400/40", iconBgClass: "bg-indigo-500/20", iconColorClass: "text-white", description: evaluationInfo ? "Measured evaluation time recorded by the validator." : "Elapsed time based on action execution.", valueClassName: "text-indigo-100" },
    { label: "Tasks", value: agentRunInfo?.taskCount ?? "—", Icon: PiGauge, gradient: "from-cyan-500/18 via-blue-400/8 to-transparent", iconWrapper: "border-cyan-400/40", iconBgClass: "bg-cyan-500/20", iconColorClass: "text-white", description: `${agentRunInfo?.completedTasks ?? "—"} completed • ${agentRunInfo?.failedTasks ?? "—"} failed`, valueClassName: "text-cyan-100" },
  ];

  // Derive seed from website URL if not provided by backend
  const websiteUrl: string = (taskData as any).website || '';
  let derivedSeed: string | null = (taskData as any).seed ?? null;
  if (!derivedSeed && typeof window !== 'undefined' && websiteUrl) {
    try {
      const u = new URL(websiteUrl, websiteUrl.startsWith('http') ? undefined : 'https://dummy.local');
      derivedSeed = u.searchParams.get('seed');
    } catch (e) {
      const m = websiteUrl.match(/[?&]seed=([^&]+)/i);
      derivedSeed = m ? decodeURIComponent(m[1]) : null;
    }
  }

  const metaCards: StatCardConfig[] = [
    { label: "Website", value: String(websiteUrl), Icon: PiGlobe, gradient: "from-sky-500/18 via-sky-400/8 to-transparent", iconWrapper: "border-sky-400/40", iconBgClass: "bg-sky-500/20", iconColorClass: "text-white", valueClassName: "text-sm font-medium break-all" },
    { label: "Use Case", value: formatLabel((taskData as any).useCase), Icon: PiTarget, gradient: "from-emerald-500/18 via-teal-400/8 to-transparent", iconWrapper: "border-emerald-400/40", iconBgClass: "bg-emerald-500/20", iconColorClass: "text-white", valueClassName: "text-base font-medium" },
    { label: "Seed", value: derivedSeed ?? '—', Icon: PiHash, gradient: "from-fuchsia-500/18 via-purple-400/8 to-transparent", iconWrapper: "border-fuchsia-400/40", iconBgClass: "bg-fuchsia-500/20", iconColorClass: "text-white", valueClassName: "text-base font-mono" },
  ];

  const timelineCards: StatCardConfig[] = [
    { label: "Started", value: (taskData as any).startTime ? new Date((taskData as any).startTime!).toLocaleString() : "—", Icon: PiClock, gradient: "from-sky-500/18 via-slate-400/8 to-transparent", iconWrapper: "border-sky-400/40 bg-transparent", iconColorClass: "text-sky-200" },
    { label: "Finished", value: (taskData as any).endTime ? new Date((taskData as any).endTime!).toLocaleString() : (taskData as any).updatedAt ? new Date((taskData as any).updatedAt!).toLocaleString() : "—", Icon: PiClock, gradient: "from-indigo-500/18 via-slate-400/8 to-transparent", iconWrapper: "border-indigo-400/40 bg-transparent", iconColorClass: "text-indigo-200" },
  ];

  // Build image URLs for validator/miner
  const validatorDefaultImage = resolveAssetUrl("/validators/Other.png");
  const validatorImage = validatorInfo?.image
    ? resolveAssetUrl(validatorInfo.image, validatorDefaultImage)
    : validatorDefaultImage;
  const minerDefaultImage = resolveAssetUrl(minerInfo?.isSota ? "/validators/Other.png" : "/images/autoppia-logo.png");
  const minerImage = minerInfo?.image ? resolveAssetUrl(minerInfo.image, minerDefaultImage) : minerDefaultImage;

  // Display helpers for UID (ensure non-negative & string-safe)
  const displayValidatorUid = (() => {
    const v: any = validatorInfo?.uid;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, Math.abs(n)).toString();
    return typeof v === 'string' ? v.replace(/^-+/, '') : '—';
  })();
  const displayMinerUid = (() => {
    const v: any = minerInfo?.uid;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, Math.abs(n)).toString();
    return typeof v === 'string' ? v.replace(/^-+/, '') : '—';
  })();
  const displayValidatorHotkey = validatorInfo?.hotkey ? truncateMiddle(validatorInfo.hotkey, 6) : '—';
  const displayMinerHotkey = minerInfo?.hotkey ? truncateMiddle(minerInfo.hotkey, 6) : '—';

  const quickInfoItems: QuickInfoItem[] = [
    {
      label: "Round",
      value: roundInfo?.roundNumber != null ? `#${roundInfo.roundNumber}` : roundInfo?.validatorRoundId ? truncateMiddle(roundInfo.validatorRoundId, 6) : "—",
      subValue: roundInfo?.status ? formatLabel(roundInfo.status) : undefined,
      href: (() => {
        const key = roundInfo?.roundNumber != null ? `round_${roundInfo.roundNumber}` : roundInfo?.validatorRoundId;
        return key ? `${routes.rounds}/${encodeURIComponent(key)}` : undefined;
      })(),
      Icon: PiClockCountdown,
      valueClassName: "font-mono text-base tracking-tight",
      accentBarClass: "bg-gradient-to-r from-amber-400/90 via-amber-500/60 to-transparent",
      iconWrapperClass: "border-amber-400/45 bg-transparent",
      iconColorClass: "text-white",
      iconBgClass: "bg-amber-500/20",
    },
    {
      label: "Validator",
      value: validatorInfo?.name ?? truncateMiddle(validatorInfo?.hotkey),
      subValue: validatorInfo?.hotkey ? truncateMiddle(validatorInfo.hotkey) : undefined,
      Icon: PiShieldCheck,
      valueClassName: "text-base text-white",
      accentBarClass: "bg-gradient-to-r from-emerald-400/90 via-teal-500/60 to-transparent",
      iconWrapperClass: "border-emerald-400/45 bg-transparent",
      iconColorClass: "text-white",
      iconBgClass: "bg-emerald-500/20",
      imageSrc: validatorImage,
      imageAlt: validatorInfo?.name || "Validator",
    },
    {
      label: minerInfo?.isSota ? "SOTA Agent" : "Miner",
      value: minerInfo?.name ?? "—",
      subValue: minerInfo?.hotkey ? truncateMiddle(minerInfo.hotkey) : undefined,
      Icon: PiUserCircle,
      valueClassName: "text-base text-white",
      accentBarClass: "bg-gradient-to-r from-fuchsia-400/90 via-purple-500/60 to-transparent",
      iconWrapperClass: "border-fuchsia-400/45 bg-transparent",
      iconColorClass: "text-white",
      iconBgClass: "bg-fuchsia-500/20",
      imageSrc: minerImage,
      imageAlt: minerInfo?.name || "Miner",
    },
  ];

  return (
    <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[#262d49]/70 bg-transparent shadow-[0_26px_80px_rgba(3,7,18,0.52)]">
      <div className="relative grid gap-10 p-6 sm:p-8 lg:gap-12 lg:px-10 lg:py-8">
        {/* Main content column */}
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aaeff]/70">Task Snapshot</span>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/80">
              <span>Started {(taskData as any).startTime ? new Date((taskData as any).startTime!).toLocaleString() : "—"}</span>
              <span className="opacity-50">•</span>
              <span>Updated {(taskData as any).updatedAt ? new Date((taskData as any).updatedAt!).toLocaleString() : (taskData as any).endTime ? new Date((taskData as any).endTime!).toLocaleString() : "—"}</span>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Round Card */}
            <section className="relative overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 text-white shadow-lg">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-black shadow">
                    <PiClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Round</p>
                    <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                      {roundInfo?.roundNumber != null ? `#${roundInfo.roundNumber}` : truncateMiddle(roundInfo?.validatorRoundId, 6)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ borderColor: "rgba(253,245,230,0.45)", backgroundColor: "rgba(253,245,230,0.12)", color: "#fde68a" }}>
                  {formatLabel(roundInfo?.status ?? "Active")}
                </span>
              </header>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="uppercase tracking-[0.3em] text-xs text-white/70">Epochs</span>
                    <span className="font-mono text-sm text-white whitespace-nowrap">
                      {(roundInfo?.startEpoch ?? '—')} - {(
                        roundInfo?.endEpoch ?? (roundInfo?.status && String(roundInfo.status).toLowerCase() === 'active' ? 'Active' : '—')
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Validator Card */}
            <section className="relative overflow-hidden rounded-3xl border-2 border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-indigo-500/15 p-5 text-white shadow-lg">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl ring-2 ring-sky-400/40 bg-white/10 p-1 overflow-hidden shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={validatorImage} alt={validatorInfo?.name || "Validator"} className="h-full w-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Validator</p>
                    <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">{validatorInfo?.name ?? truncateMiddle(validatorInfo?.hotkey)}</p>
                  </div>
                </div>
              </header>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-[0.3em] text-xs text-white/60">UID:</span>
                      <span className="font-mono text-sm text-white">{displayValidatorUid}</span>
                    </div>
                    {validatorInfo?.uid != null && <IDCopyButton text={String(displayValidatorUid)} />}
                  </div>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="uppercase tracking-[0.3em] text-xs text-white/60">Hotkey:</span>
                      <span className="font-mono text-sm text-white truncate max-w-[220px] md:max-w-[320px]">{validatorInfo?.hotkey ?? '—'}</span>
                    </div>
                    {validatorInfo?.hotkey && <IDCopyButton text={validatorInfo.hotkey} />}
                  </div>
                </div>
              </div>
            </section>

            {/* Miner Card */}
            <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-green-500/15 p-5 text-white shadow-lg">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full ring-2 ring-emerald-400/40 bg-white/10 p-1 overflow-hidden shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={minerImage} alt={minerInfo?.name || "Miner"} className="h-full w-full object-cover rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{minerInfo?.isSota ? "SOTA Agent" : "Miner"}</p>
                    <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">{minerInfo?.name ?? "—"}</p>
                  </div>
                </div>
              </header>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-[0.3em] text-xs text-white/60">UID:</span>
                      <span className="font-mono text-sm text-white">{displayMinerUid}</span>
                    </div>
                    {minerInfo?.uid != null && <IDCopyButton text={String(displayMinerUid)} />}
                  </div>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="uppercase tracking-[0.3em] text-xs text-white/60">Hotkey:</span>
                      <span className="font-mono text-sm text-white truncate max-w-[220px] md:max-w-[320px]">{minerInfo?.hotkey ?? '—'}</span>
                    </div>
                    {minerInfo?.hotkey && <IDCopyButton text={minerInfo.hotkey} />}
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* Agent Run style stats with Task Score centered */}
        {agentRunInfo ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-transparent p-5 text-white">
            {/* Mobile */}
            <div className="flex flex-col space-y-6 md:hidden">
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-emerald-200 to-green-300 bg-clip-text text-transparent" style={{ WebkitTextStroke: '0.4px rgba(249, 250, 251, 0.15)' }}>
                  {evaluationScore}
                </div>
                <div className="mt-2 text-sm font-medium text-white/70">Task Score</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <RunStatCard label="Duration" value={String(evaluationDuration)} color="blue" Icon={PiTimer} />
                <RunStatCard label="Actions" value={String((details as any)?.performance?.totalActions ?? '—')} color="amber" Icon={PiPlay} />
                <RunStatCard label="Successful" value={String(agentRunInfo.completedTasks ?? '—')} color="emerald" Icon={PiCheckCircle} />
                <RunStatCard label="Failed" value={String(agentRunInfo.failedTasks ?? Math.max((agentRunInfo.taskCount ?? 0) - (agentRunInfo.completedTasks ?? 0), 0))} color="rose" Icon={PiXCircle} />
              </div>
            </div>

            {/* Desktop: left 2 cards • centered score • right 2 cards */}
            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
              <div className="grid grid-cols-2 gap-4 justify-start">
                <RunStatCard label="Duration" value={String(evaluationDuration)} color="blue" Icon={PiTimer} />
                <RunStatCard label="Actions" value={String((details as any)?.performance?.totalActions ?? '—')} color="amber" Icon={PiPlay} />
              </div>
              <div className="flex flex-col items-center justify-center mx-4">
                <div className="bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-5xl font-extrabold text-transparent" style={{ WebkitTextStroke: '0.6px rgba(249, 250, 251, 0.18)' }}>
                  {evaluationScore}
                </div>
                <div className="mt-1 text-xs font-medium text-white/70">Task Score</div>
              </div>
              <div className="grid grid-cols-2 gap-4 justify-end">
                <RunStatCard label="Successful" value={String(agentRunInfo.completedTasks ?? '—')} color="emerald" Icon={PiCheckCircle} />
                <RunStatCard label="Failed" value={String(agentRunInfo.failedTasks ?? Math.max((agentRunInfo.taskCount ?? 0) - (agentRunInfo.completedTasks ?? 0), 0))} color="rose" Icon={PiXCircle} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#9aaeff]/70">Task Context</span>
          <div className="grid gap-4 md:grid-cols-3">
            {metaCards.map((card) => (
              <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#5436a6]/40 bg-transparent p-4 text-white shadow-[0_16px_44px_rgba(4,8,20,0.6)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/70 text-white shadow-inner">
                <PiFileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-white truncate" title={taskData.prompt || 'Prompt not provided for this task.'}>
                  {taskData.prompt || 'Prompt not provided for this task.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Relationships sidebar removed to avoid duplication; essentials merged into tiles/snapshot */}
      </div>
    </div>
  );
}

// ===== Inlined Task Results (Cooked) =====
const ACTION_TYPE_META: Record<
  TaskAction["type"],
  { label: string; icon: IconType; badgeBg: string; badgeText: string }
> = {
  navigate: { label: "Navigate", icon: PiArrowRight, badgeBg: "bg-cyan-500/15", badgeText: "text-cyan-300" },
  click: { label: "Click", icon: PiCursorClick, badgeBg: "bg-purple-500/15", badgeText: "text-purple-300" },
  type: { label: "Type", icon: PiKeyboard, badgeBg: "bg-emerald-500/15", badgeText: "text-emerald-300" },
  input: { label: "Input", icon: PiKeyboard, badgeBg: "bg-emerald-500/15", badgeText: "text-emerald-300" },
  search: { label: "Search", icon: PiArrowRight, badgeBg: "bg-sky-500/15", badgeText: "text-sky-300" },
  extract: { label: "Extract", icon: PiArrowRight, badgeBg: "bg-indigo-500/15", badgeText: "text-indigo-300" },
  submit: { label: "Submit", icon: PiArrowRight, badgeBg: "bg-fuchsia-500/15", badgeText: "text-fuchsia-300" },
  open_tab: { label: "Open Tab", icon: PiArrowRight, badgeBg: "bg-blue-500/15", badgeText: "text-blue-300" },
  close_tab: { label: "Close Tab", icon: PiXCircle, badgeBg: "bg-rose-500/15", badgeText: "text-rose-300" },
  wait: { label: "Wait", icon: PiClock, badgeBg: "bg-amber-500/15", badgeText: "text-amber-300" },
  scroll: { label: "Scroll", icon: PiScroll, badgeBg: "bg-blue-500/15", badgeText: "text-blue-300" },
  screenshot: { label: "Screenshot", icon: PiCamera, badgeBg: "bg-pink-500/15", badgeText: "text-pink-300" },
  other: { label: "Other", icon: PiPlay, badgeBg: "bg-slate-500/15", badgeText: "text-slate-200" },
};

const truncate = (value: string, max = 80) => (value.length > max ? `${value.slice(0, max).trim()}…` : value);

const getStatusIcon = (success: boolean, error?: string) => {
  if (error) return <PiCheckCircle className="w-4 h-4 text-red-500" />;
  if (success) return <PiCheckCircle className="w-4 h-4 text-emerald-500" />;
  return <PiWarning className="w-4 h-4 text-amber-500" />;
};

const formatActionDetails = (action: TaskAction) => {
  const parts: string[] = [];
  const meta = (action as any).metadata || {};

  // Prefer common fields
  if (action.selector) parts.push(`Selector: ${truncate(action.selector, 80)}`);
  if (action.value) parts.push(`Value: ${truncate(action.value, 80)}`);
  if (meta.url) parts.push(`URL: ${truncate(String(meta.url), 120)}`);
  if (meta.query) parts.push(`Query: ${truncate(String(meta.query), 80)}`);
  if (meta.keys) parts.push(`Keys: ${truncate(String(meta.keys), 40)}`);
  if (meta.text) parts.push(`Text: ${truncate(String(meta.text), 80)}`);
  if (meta.to) parts.push(`To: ${truncate(String(meta.to), 80)}`);
  if (meta.from) parts.push(`From: ${truncate(String(meta.from), 80)}`);
  if (typeof meta.deltaY === 'number') parts.push(`deltaY: ${meta.deltaY}`);
  if (typeof meta.deltaX === 'number') parts.push(`deltaX: ${meta.deltaX}`);
  if (meta.title) parts.push(`Title: ${truncate(String(meta.title), 60)}`);
  if (action.error) parts.push(`Error: ${truncate(action.error, 80)}`);

  // If still nothing, surface first 2 metadata entries if present
  if (parts.length === 0 && meta && typeof meta === 'object') {
    const entries = Object.entries(meta).slice(0, 2);
    entries.forEach(([k, v]) => {
      if (v == null) return;
      const val = typeof v === 'string' ? v : JSON.stringify(v);
      parts.push(`${k}: ${truncate(val, 80)}`);
    });
  }

  return parts.length === 0 ? 'No additional details' : parts.join(' • ');
};

// Build structured key-value pairs from action metadata for display
const extractActionDetailPairs = (action: TaskAction): Array<[string, string]> => {
  const pairs: Array<[string, string]> = [];
  const add = (k: string, v: any) => {
    if (v === undefined || v === null || v === '') return;
    const val = typeof v === 'string' ? v : JSON.stringify(v);
    pairs.push([k, val]);
  };
  if (action.selector) add('selector', action.selector);
  if (action.value) add('value', action.value);

  const meta: any = (action as any).metadata || {};
  const attr = meta?.attributes?.attributes || meta?.attributes || {};
  const raw = meta?.raw_action || {};
  const rawAttr = raw?.attributes?.attributes || raw?.attributes || {};

  // Prefer attributes
  add('url', attr.url ?? rawAttr.url);
  add('status', attr.status ?? rawAttr.status);
  add('query', attr.query ?? rawAttr.query);
  add('keys', attr.keys ?? rawAttr.keys);
  add('text', attr.text ?? rawAttr.text);
  add('to', attr.to ?? rawAttr.to);
  add('from', attr.from ?? rawAttr.from);
  if (typeof (attr.deltaY ?? rawAttr.deltaY) === 'number') add('deltaY', attr.deltaY ?? rawAttr.deltaY);
  if (typeof (attr.deltaX ?? rawAttr.deltaX) === 'number') add('deltaX', attr.deltaX ?? rawAttr.deltaX);
  add('title', attr.title ?? rawAttr.title);
  // Hide redundant type for navigate actions; label already conveys it
  if (raw?.type && String(raw.type).toLowerCase() !== 'navigate') {
    add('type', raw.type);
  }
  if (action.error) add('error', action.error);

  // If nothing, surface first entries of metadata
  if (pairs.length === 0 && meta && typeof meta === 'object') {
    const entries = Object.entries(meta).slice(0, 3) as Array<[string, any]>;
    entries.forEach(([k, v]) => add(k, v));
  }
  return pairs;
};

const formatKeyLabel = (k: string) =>
  k
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

function TaskResults() {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { results, isLoading: resultsLoading, error: resultsError } = useTaskResults(id as string);
  const { actions, total: actionsTotal, isLoading: actionsLoading, error: actionsError, goToPage } = useTaskActions(id as string, {
    page: currentPage,
    limit: pageSize,
    sortBy: "timestamp",
    sortOrder: "asc",
  });
  const { screenshots, isLoading: screenshotsLoading, error: screenshotsError } = useTaskScreenshots(id as string);

  const hasApiScreenshots = screenshots.length > 0;
  const fallbackScreenshots = useMemo(() => {
    if (hasApiScreenshots || !results?.screenshots?.length) return [] as Array<{
      id?: string;
      url: string;
      timestamp?: string;
      actionId?: string;
      description?: string;
    }>;
    return results.screenshots.map((url, index) => {
      const timelineTimestamp = results.timeline?.[index]?.timestamp;
      const actionTimestamp = results.actions?.[index]?.timestamp;
      const fallbackTimestamp = timelineTimestamp ?? actionTimestamp ?? results.timeline?.[0]?.timestamp ?? results.actions?.[0]?.timestamp ?? new Date().toISOString();
      const actionType = results.actions?.[index]?.type;
      return {
        id: `results-gif-${index}`,
        url,
        timestamp: fallbackTimestamp,
        actionId: results.actions?.[index]?.id,
        description: actionType ? `GIF Replay • ${actionType}` : `GIF Replay ${index + 1}`,
      };
    });
  }, [hasApiScreenshots, results]);

  const mediaItems = hasApiScreenshots ? screenshots : fallbackScreenshots;
  const isMediaLoading = screenshotsLoading || (!hasApiScreenshots && resultsLoading);
  const showMediaError = !isMediaLoading && !!screenshotsError && mediaItems.length === 0;
  const showMediaEmpty = !isMediaLoading && !showMediaError && mediaItems.length === 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const totalPages = Math.max(1, Math.ceil(actionsTotal / pageSize));
  const successCount = actions.filter((a) => a.success).length;
  const failCount = actions.filter((a) => a.error || !a.success).length;

  const handleDownloadAll = () => {
    if (!mediaItems || mediaItems.length === 0) return;
    const baseId = Array.isArray(id) ? id[0] : (id as string);
    mediaItems.forEach((item: any, index: number) => {
      if (!item?.url) return;
      const a = document.createElement('a');
      a.href = item.url;
      a.download = `${baseId || 'task'}-replay-${index + 1}.gif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  // Fullscreen handling for the recordings panel
  const recordingsRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(!!fsEl && fsEl === recordingsRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);
  const handleToggleFullscreen = () => {
    if (!recordingsRef.current) return;
    if (!document.fullscreenElement) {
      recordingsRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement === recordingsRef.current) {
      document.exitFullscreen?.();
    } else {
      // another element is in fullscreen; exit then request
      document.exitFullscreen?.().then(() => recordingsRef.current?.requestFullscreen?.());
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Actions (left) */}
      <section className="rounded-2xl border border-slate-700/50 bg-transparent p-5 backdrop-blur-sm shadow-[0_14px_44px_rgba(4,8,20,0.45)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text className="text-white text-lg font-semibold">Actions Timeline</Text>
            {!actionsLoading && (
              <p className="text-sm text-slate-400">
                {actionsTotal} total actions · {successCount} successful · {failCount} failed
              </p>
            )}
          </div>
          {!actionsLoading && actionsTotal > pageSize && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded border border-sky-500/40 bg-transparent text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-sky-400/60 hover:text-sky-100 transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded border border-sky-500/40 bg-transparent text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-sky-400/60 hover:text-sky-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 h-[350px] overflow-y-auto custom-scrollbar pr-1">
          {actionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: pageSize }, (_, index) => (
                <ListItemPlaceholder key={`action-loading-${index}`} />
              ))}
            </div>
          ) : actionsError ? (
            <div className="flex items-center justify-center h-full text-red-300">
              <div className="text-center space-y-1">
                <PiXCircle className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-red-200">{actionsError || "Failed to load actions"}</Text>
              </div>
            </div>
          ) : actions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center space-y-1">
                <PiPlay className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-slate-300">No actions available</Text>
              </div>
            </div>
          ) : (
            actions.map((action, index) => {
              const meta = ACTION_TYPE_META[action.type] || ACTION_TYPE_META.other;
              const detailsList = extractActionDetailPairs(action);
              return (
                <div key={action.id || index} className="flex items-center justify-between p-3 rounded-lg border border-slate-700/40 bg-transparent">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-10 w-10 min-w-[2.5rem] rounded-lg ${meta.badgeBg} flex-shrink-0`}>
                      <meta.icon className={`w-5 h-5 ${meta.badgeText}`} />
                    </div>
                    <div>
                      <Text className="text-white font-medium">{meta.label}</Text>
                      {detailsList.length > 0 ? (
                        <ul className="mt-0.5 text-xs text-slate-400 list-disc pl-4 space-y-0.5">
                          {detailsList.slice(0, 4).map(([k, v], i) => (
                            <li key={`${action.id || index}-d-${i}`}>
                              <span className="text-slate-500">{formatKeyLabel(k)}:</span> {truncate(String(v), 120)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text className="text-slate-400 text-xs">No additional details</Text>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(action.success, action.error)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* GIF Replays (right) */}
      <section className="rounded-2xl border border-slate-700/50 bg-transparent p-5 backdrop-blur-sm shadow-[0_14px_44px_rgba(4,8,20,0.45)]">
        <div className="flex items-center mb-4">
          <Text className="text-white text-lg font-semibold">Screen Recordings</Text>
          <div className="ml-auto flex items-center gap-2">
            {!isMediaLoading && mediaItems.length > 0 && (
              <button
                onClick={handleToggleFullscreen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15 transition-colors"
                title={isFullscreen ? "Exit full screen" : "Full screen"}
                aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
                type="button"
              >
                <PiArrowSquareOutDuotone className="h-4 w-4" />
              </button>
            )}
            {!isMediaLoading && mediaItems.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15 transition-colors"
                title="Download all"
                aria-label="Download all"
                type="button"
              >
                <PiDownloadSimple className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div ref={recordingsRef} className={`${isFullscreen ? 'h-screen' : 'h-[350px]'} border border-slate-700/50 rounded-xl overflow-y-auto custom-scrollbar bg-transparent p-4`}
        >
          {isMediaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={`screenshot-loading-${index}`} className="space-y-2">
                  <Placeholder height="160px" className="rounded-lg" />
                  <TextPlaceholder lines={2} />
                </div>
              ))}
            </div>
          ) : showMediaError ? (
            <div className="flex items-center justify-center h-full text-red-300">
              <div className="text-center space-y-1">
                <PiXCircle className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-red-200">{screenshotsError || resultsError || "Failed to load GIF replays"}</Text>
              </div>
            </div>
          ) : showMediaEmpty ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center space-y-1">
                <PiCamera className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-slate-300">No GIF replays available</Text>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaItems.map((screenshot: any, index: number) => (
                <div key={`gif-${screenshot.id || index}`} className="w-full group bg-transparent rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all">
                  <div className="relative w-full aspect-video bg-black/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshot.url}
                      alt={`GIF Replay ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) sibling.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-slate-500">
                      <PiCamera className="w-12 h-12 mb-2" />
                      <p className="text-sm">Recording unavailable</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ===== Page wrapper combining header + details + results =====
export default function TaskDynamic() {
  const { id } = useParams();
  const taskId = Array.isArray(id) ? id[0] : (id as string) ?? "";
  const { details, isLoading, error } = useTaskDetails(taskId);
  const runIdDisplay = details?.agentRunId ?? (isLoading ? "Loading…" : error ? "Unavailable" : "—");
  const evaluationIdDisplay = details?.relationships?.evaluation?.evaluationId ?? (isLoading ? "Loading…" : error ? "Unavailable" : "—");
  const roundKeyForHeader = (() => {
    const r = details?.relationships?.round;
    if (!r) return '';
    if (typeof r?.roundNumber === 'number') return `round_${r.roundNumber}`;
    return r?.validatorRoundId ?? '';
  })();
  const backHref = details?.agentRunId ? `${routes.agent_run}/${details.agentRunId}` : routes.agent_run;

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title="Task Details"
        description={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={roundKeyForHeader ? `${routes.rounds}/${encodeURIComponent(roundKeyForHeader)}` : '#'} className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-amber-400/60 hover:bg-amber-500/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Round</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">{truncateMiddle(roundKeyForHeader || '-', 8)}</span>
            </Link>
            <Link href={details?.agentRunId ? `${routes.agent_run}/${encodeURIComponent(details.agentRunId)}` : '#'} className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-emerald-400/60 hover:bg-emerald-500/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Run</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">{truncateMiddle(runIdDisplay as string, 8)}</span>
              {details?.agentRunId && <IDCopyButton text={details.agentRunId} />}
            </Link>
            <Link href={`${routes.tasks}/${taskId}`} className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-cyan-400/60 hover:bg-cyan-500/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">{truncateMiddle(taskId, 8)}</span>
              <IDCopyButton text={taskId} />
            </Link>
            <a href="#evaluation" className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-indigo-400/60 hover:bg-indigo-500/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">{truncateMiddle(evaluationIdDisplay as string, 8)}</span>
              {details?.relationships?.evaluation?.evaluationId && <IDCopyButton text={details.relationships.evaluation.evaluationId} />}
            </a>
          </div>
        }
        className="mt-2"
      >
        <Link href={backHref} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agent Run</span>
        </Link>
      </PageHeader>

      <TaskDetailsDynamic details={details} isLoading={isLoading} error={error} />

      <div className="mb-10">
        <TaskResults />
      </div>
    </div>
  );
}
// Small stat card used for "Agent Run" cards replicated from agent run detail
function RunStatCard({ label, value, color = "blue", Icon }: { label: string; value: string; color?: "blue"|"amber"|"emerald"|"rose"; Icon: IconType }) {
  const colorMap: Record<string, { bg: string; border: string; iconBg: string }> = {
    blue: { bg: "bg-blue-500/20", border: "border-blue-400/40", iconBg: "bg-blue-500/70" },
    amber: { bg: "bg-amber-500/20", border: "border-amber-400/40", iconBg: "bg-amber-500/70" },
    emerald: { bg: "bg-emerald-500/20", border: "border-emerald-400/40", iconBg: "bg-emerald-500/70" },
    rose: { bg: "bg-rose-500/20", border: "border-rose-400/40", iconBg: "bg-rose-500/70" },
  };
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg} text-white shadow-inner`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-extrabold text-white leading-tight truncate">{value}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/85">{label}</div>
        </div>
      </div>
    </div>
  );
}
