"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { Text } from "rizzui";
import PageHeader from "@/app/shared/page-header";
import Placeholder, {
  TextPlaceholder,
  ListItemPlaceholder,
} from "@/app/shared/placeholder";
import { routes } from "@/config/routes";
import {
  useEvaluationComplete,
} from "@/services/hooks/useTask";
import { resolveAssetUrl } from "@/services/utils/assets";
import { websitesData } from "@/data/websites-data";
import type { IconType } from "react-icons";
import {
  PiArrowLeftLight,
  PiCopy,
  PiChartBar,
  PiFileText,
  PiTimer,
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
  PiInfoDuotone,
} from "react-icons/pi";
import type { TaskAction, TaskDetails } from "@/repositories/tasks/tasks.types";

// Shared helpers
function truncateMiddle(value?: string | null, visible: number = 8) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function IDCopyButton({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Intentional no-op when clipboard write fails (e.g. permissions)
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md bg-white/10 p-1 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
      title="Copy to clipboard"
      type="button"
    >
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-300">✓</span>
      ) : (
        <PiCopy className="h-3 w-3" />
      )}
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
    .replaceAll("_", " ")
    .replaceAll(/\s+/g, " ")
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
  // For very small values (like stake), automatically use more decimal places
  if (value > 0 && value < 0.01 && digits === 2) {
    return value.toFixed(8);
  }
  return value.toFixed(digits);
};

const formatCost = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  });
};

const formatTokens = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US");
};

const formatReward = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${formatNumber(value, 6)} α`;
};

function InfoRow({
  label,
  value,
  valueClassName,
}: Readonly<{
  label: string;
  value: ReactNode;
  valueClassName?: string;
}>) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/55">{label}</span>
      <span
        className={`text-right text-white/85 font-medium leading-snug ${valueClassName ?? ""}`}
      >
        {value}
      </span>
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

function StatCard({
  label,
  value,
  Icon,
  gradient,
  iconWrapper,
  iconColorClass,
  iconBgClass,
  description,
  valueClassName,
}: Readonly<StatCardConfig>) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 text-slate-100 shadow-[0_20px_48px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,0,0,0.8)] hover:border-white/30">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-75 transition-opacity duration-300`}
      />
      <div className="relative flex gap-4 p-6 items-start">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl border ${iconBgClass ?? "bg-white/10"} border-white/20 shrink-0 ${iconWrapper} transition-all duration-300 group-hover:scale-110`}
        >
          <Icon
            className={`h-7 w-7 ${iconColorClass ?? "text-white"} transition-all duration-300`}
          />
        </div>
        <div className="flex-1">
          <span className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">
            {label}
          </span>
          <div
            className={`mt-2 text-2xl font-bold ${valueClassName ?? "text-white"} transition-all duration-300 group-hover:scale-105`}
          >
            {value}
          </div>
          {description ? (
            <p className="mt-2 text-xs leading-relaxed text-white/70">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const TASK_LOADING_PRIMARY_KEYS = ["task-loading-primary-a", "task-loading-primary-b", "task-loading-primary-c"] as const;
const TASK_LOADING_SECONDARY_KEYS = ["task-loading-secondary-a", "task-loading-secondary-b", "task-loading-secondary-c", "task-loading-secondary-d", "task-loading-secondary-e", "task-loading-secondary-f"] as const;

type TaskDetailsDynamicProps = {
  details?: TaskDetails | null;
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => void;
  actionsTotal?: number;
  successCount?: number;
  failCount?: number;
  info?: {
    evaluationId?: string;
    taskId?: string;
    miner_run_id?: string;
    round?: any;
    validator?: any;
    miner?: any;
  } | null;
  evaluationZeroReason?: string | undefined;
};
function TaskDetailsDynamic({
  details,
  isLoading = false,
  error,
  refetch,
  actionsTotal,
  successCount,
  failCount,
  info,
  evaluationZeroReason,
}: Readonly<TaskDetailsDynamicProps>) {
  if (isLoading && !details) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-transparent p-8 shadow-2xl backdrop-blur-sm">
        <div className="relative space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {TASK_LOADING_PRIMARY_KEYS.map((key) => (
              <div
                key={key}
                className="animate-pulse rounded-xl border border-slate-700/50 bg-transparent p-5"
              >
                <div className="space-y-3">
                  <div className="h-2.5 w-20 rounded bg-slate-700" />
                  <div className="h-6 w-32 rounded bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TASK_LOADING_SECONDARY_KEYS.map((key) => (
              <div
                key={key}
                className="animate-pulse rounded-xl border border-slate-700/50 bg-transparent p-6"
              >
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
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-50"></div>
          <div className="relative px-8 py-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-2xl">
              <PiInfoDuotone className="h-10 w-10 text-amber-300" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white tracking-wide">
              Task Data Not Available
            </h3>
            <p className="mb-2 text-base text-white/70 font-medium max-w-2xl mx-auto">
              This task has not been evaluated yet or the evaluation is still in
              progress. Data will appear here once the evaluation is complete.
            </p>
            <p className="text-sm text-white/50 font-semibold">
              Please check back in a few minutes or navigate to a different
              task.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              {refetch && (
                <button
                  onClick={refetch}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Retry
                </button>
              )}
              <Link href={routes.tasks}>
                <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  View All Tasks
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const taskData = details;
  // Use info object if available (from get-evaluation endpoint), otherwise fallback to relationships
  const roundInfo = info?.round ?? taskData.relationships?.round;
  const validatorInfo = info?.validator ?? taskData.relationships?.validator;
  const minerInfo = info?.miner ?? taskData.relationships?.miner;
  const agentRunInfo = taskData.relationships?.agentRun;
  const evaluationInfo = taskData.relationships?.evaluation;

  // Parse season and round from roundInfo
  const { season: parsedSeason, round: parsedRound } = (() => {
    const roundData = roundInfo;

    // Priority 1: roundId as string "season/round"
    if (typeof roundData?.roundId === "string" && roundData.roundId.includes("/")) {
      const [s, r] = roundData.roundId.split("/").map(Number);
      if (Number.isFinite(s) && Number.isFinite(r)) {
        return { season: s, round: r };
      }
    }

    // Priority 2: season_number and round_number_in_season
    if (typeof roundData?.season_number === "number" && typeof roundData?.round_number_in_season === "number") {
      return { season: roundData.season_number, round: roundData.round_number_in_season };
    }

    // Priority 3: season and round fields
    if (typeof roundData?.season === "number" && typeof roundData?.round === "number") {
      return { season: roundData.season, round: roundData.round };
    }

    // Priority 4: Extract from roundNumber if it's legacy format (>= 10000)
    if (typeof roundData?.roundNumber === "number" && roundData.roundNumber >= 10000) {
      const season = Math.floor(roundData.roundNumber / 10000);
      const round = roundData.roundNumber % 10000;
      return { season, round };
    }

    return { season: null, round: null };
  })();

  // Calculate evaluationScore from evaluationInfo, taskData.score, or details.score
  const evaluationScore = (() => {
    if (typeof evaluationInfo?.finalScore === "number") {
      return formatPercent(evaluationInfo.finalScore);
    }
    if (typeof (taskData as any)?.score === "number") {
      return formatPercent((taskData as any).score);
    }
    if (typeof (taskData as any)?.eval_score === "number") {
      return formatPercent((taskData as any).eval_score);
    }
    return "0%";
  })();

  // Calculate evaluationDuration from evaluationInfo, taskData.duration, or details.duration
  const evaluationDuration = (() => {
    if (evaluationInfo?.evaluationTime != null) {
      return formatDuration(evaluationInfo.evaluationTime);
    }
    if ((taskData as any)?.duration != null) {
      return formatDuration((taskData as any).duration);
    }
    if ((taskData as any)?.eval_time != null) {
      return formatDuration((taskData as any).eval_time);
    }
    return "—";
  })();
  // Visual constants and image helpers
  const HIGHLIGHT_COLOR = "#FDF5E6";

  const validatorDefaultImage = resolveAssetUrl("/validators/Other.png");
  const validatorImage =
    validatorInfo?.image?.trim()
      ? resolveAssetUrl(validatorInfo.image, validatorDefaultImage)
      : validatorDefaultImage;

  const minerDefaultImage = resolveAssetUrl(
    minerInfo?.isSota ? "/miners/30.svg" : "/miners/0.svg"
  );
  const minerImage =
    minerInfo?.image?.trim()
      ? resolveAssetUrl(minerInfo.image, minerDefaultImage)
      : minerDefaultImage;

  // Display helpers for UID (ensure non-negative & string-safe)
  const displayValidatorUid = (() => {
    const v: any = validatorInfo?.uid;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, Math.abs(n)).toString();
    return typeof v === "string" ? v.replace(/^-+/, "") : "—";
  })();
  const displayMinerUid = (() => {
    const v: any = minerInfo?.uid;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, Math.abs(n)).toString();
    return typeof v === "string" ? v.replace(/^-+/, "") : "—";
  })();
  const displayValidatorHotkey = validatorInfo?.hotkey
    ? truncateMiddle(validatorInfo.hotkey, 6)
    : "—";
  const displayMinerHotkey = minerInfo?.hotkey
    ? truncateMiddle(minerInfo.hotkey, 6)
    : "—";

  // Extract project name from website URL using existing websitesData configuration
  const getProjectName = (url: string): string => {
    if (!url) return "—";

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      const hostname = urlObj.hostname.toLowerCase();

      // Remove www. prefix
      const cleanHostname = hostname.replace(/^www\./, "");

      // Map common domains to project names (excluding localhost to handle ports specifically)
      const projectMap: Record<string, string> = {
        "github.com": "GitHub",
        "stackoverflow.com": "Stack Overflow",
        "google.com": "Google",
        "youtube.com": "YouTube",
        "facebook.com": "Facebook",
        "twitter.com": "Twitter",
        "linkedin.com": "LinkedIn",
        "reddit.com": "Reddit",
        "amazon.com": "Amazon",
        "wikipedia.org": "Wikipedia",
        "netflix.com": "Netflix",
        "instagram.com": "Instagram",
        "discord.com": "Discord",
        "slack.com": "Slack",
        "zoom.us": "Zoom",
        "microsoft.com": "Microsoft",
        "apple.com": "Apple",
        "dropbox.com": "Dropbox",
        "drive.google.com": "Google Drive",
        "docs.google.com": "Google Docs",
        "sheets.google.com": "Google Sheets",
        "gmail.com": "Gmail",
        "outlook.com": "Outlook",
      };

      // Check for exact matches first
      if (projectMap[cleanHostname]) {
        return projectMap[cleanHostname];
      }

      // Check for subdomain matches
      for (const [domain, name] of Object.entries(projectMap)) {
        if (cleanHostname.includes(domain)) {
          return name;
        }
      }

      // Map localhost ports to project names using existing websitesData
      if (cleanHostname === "localhost") {
        // Extract port from URL object (not hostname)
        const port = urlObj.port;

        if (port) {
          // Find project by port in websitesData
          const project = websitesData.find(
            (site) => site.portValidator === port
          );

          if (project) {
            return project.name;
          }
        }

        // If no port or project found, return localhost
        return "localhost";
      }

      // Fallback: capitalize first part of domain
      const parts = cleanHostname.split(".");
      const mainDomain = parts[0];
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    } catch {
      return url.length > 20 ? `${url.substring(0, 20)}...` : url;
    }
  };

  const hasLlmData =
    Boolean(evaluationInfo?.llmProvider) ||
    Boolean(evaluationInfo?.llmModel) ||
    evaluationInfo?.llmCost != null ||
    evaluationInfo?.llmTokens != null ||
    Boolean(evaluationInfo?.llmUsage?.length);
  const priceValue = evaluationInfo?.llmCost ?? evaluationInfo?.reward;
  const hasPrice = priceValue != null;
  const usageRows = (evaluationInfo?.llmUsage ?? []).filter((row) => {
    return (
      row &&
      (row.provider || row.model || row.tokens != null || row.cost != null)
    );
  });
  const usageTotals = usageRows.reduce<{ tokens: number; cost: number }>(
    (acc, row) => {
      const tokens = row.tokens == null ? 0 : Number(row.tokens);
      const cost = row.cost == null ? 0 : Number(row.cost);
      return {
        tokens: acc.tokens + (Number.isFinite(tokens) ? tokens : 0),
        cost: acc.cost + (Number.isFinite(cost) ? cost : 0),
      };
    },
    { tokens: 0, cost: 0 }
  );

  // Derive seed from website URL if not provided by backend
  const websiteUrl: string = (taskData as any).website || "";
  let derivedSeed: string | null = (taskData as any).seed ?? null;
  if (!derivedSeed && globalThis.window !== undefined && websiteUrl) {
    try {
      const u = new URL(
        websiteUrl,
        websiteUrl.startsWith("http") ? undefined : "https://dummy.local"
      );
      derivedSeed = u.searchParams.get("seed");
    } catch {
      const seedRegex = /[?&]seed=([^&]+)/i;
      const m = seedRegex.exec(websiteUrl);
      derivedSeed = m ? decodeURIComponent(m[1]) : null;
    }
  }

  const metaCards: StatCardConfig[] = [
    {
      label: "Project",
      value: getProjectName(websiteUrl),
      Icon: PiGlobe,
      gradient: "from-cyan-400/30 via-blue-500/25 to-indigo-600/20",
      iconWrapper: "border-cyan-300/60 shadow-lg shadow-cyan-500/25",
      iconBgClass: "bg-gradient-to-br from-cyan-400/40 to-blue-500/30",
      iconColorClass: "text-cyan-100",
      valueClassName: "text-lg font-bold text-cyan-100 drop-shadow-sm",
    },
    {
      label: "Use Case",
      value: formatLabel((taskData as any).useCase),
      Icon: PiTarget,
      gradient: "from-emerald-400/30 via-green-500/25 to-teal-600/20",
      iconWrapper: "border-emerald-300/60 shadow-lg shadow-emerald-500/25",
      iconBgClass: "bg-gradient-to-br from-emerald-400/40 to-green-500/30",
      iconColorClass: "text-emerald-100",
      valueClassName: "text-lg font-bold text-emerald-100 drop-shadow-sm",
    },
    {
      label: "Seed",
      value: derivedSeed ?? "—",
      Icon: PiHash,
      gradient: "from-purple-400/30 via-fuchsia-500/25 to-pink-600/20",
      iconWrapper: "border-purple-300/60 shadow-lg shadow-purple-500/25",
      iconBgClass: "bg-gradient-to-br from-purple-400/40 to-fuchsia-500/30",
      iconColorClass: "text-purple-100",
      valueClassName:
        "text-lg font-bold font-mono text-purple-100 drop-shadow-sm",
    },
  ];

  return (
    <div className="relative mb-8 overflow-hidden rounded-[28px] bg-transparent shadow-[0_26px_80px_rgba(3,7,18,0.52)]">
      {/* Main content column */}
      <div className="space-y-8">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Round */}
          <section className="relative overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 text-white shadow-lg">
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-black shadow">
                  <PiClock className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  {parsedSeason !== null && parsedRound !== null ? (
                    <>
                      <div className="flex flex-col">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/50">
                          Season
                        </p>
                        <p className="text-lg font-bold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                          {parsedSeason}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-white/20"></div>
                      <div className="flex flex-col">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/50">
                          Round
                        </p>
                        <p className="text-lg font-bold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                          {parsedRound}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Round
                      </p>
                      <p className="text-xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                        {roundInfo?.validatorRoundId
                          ? truncateMiddle(roundInfo.validatorRoundId, 6)
                          : "—"}
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
                {formatLabel(roundInfo?.status ?? "Active")}
              </span>
            </header>

            <div className="mt-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                  Epochs:
                </span>
                <span className="font-mono text-sm text-white whitespace-nowrap">
                  {roundInfo?.startEpoch ?? "—"} -{" "}
                  {(() => {
                    if (roundInfo?.endEpoch != null) return roundInfo.endEpoch;
                    const isActive = roundInfo?.status != null && String(roundInfo.status).toLowerCase() === "active";
                    return isActive ? "Active" : "—";
                  })()}
                </span>
              </div>
            </div>
          </section>

          {/* Validator */}
          <section className="relative overflow-hidden rounded-3xl border-2 border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-indigo-500/15 p-5 text-white shadow-lg">
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  alt={validatorInfo?.name ?? "Validator"}
                  src={validatorImage}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-sky-400/40 bg-white/10 p-1"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Validator
                  </p>
                  <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                    {validatorInfo?.name ??
                      truncateMiddle(validatorInfo?.hotkey)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {displayValidatorUid !== "—" && (
                  <span
                    className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
                    style={{
                      borderColor: "rgba(59, 130, 246, 0.45)",
                      backgroundColor: "rgba(59, 130, 246, 0.12)",
                      color: "#60A5FA",
                    }}
                  >
                    UID {displayValidatorUid}
                  </span>
                )}
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
                      {displayValidatorHotkey}
                    </span>
                  </div>
                  {validatorInfo?.hotkey && (
                    <IDCopyButton text={validatorInfo.hotkey} />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Miner */}
          <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-green-500/15 p-5 text-white shadow-lg">
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  alt={minerInfo?.name ?? "Miner"}
                  src={minerImage}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-emerald-400/40 bg-white/10 p-1"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {minerInfo?.isSota ? "SOTA Agent" : "Miner"}
                  </p>
                  <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                    {minerInfo?.name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {displayMinerUid !== "—" && (
                  <span
                    className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
                    style={{
                      borderColor: "rgba(16, 185, 129, 0.45)",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      color: "#34D399",
                    }}
                  >
                    UID {displayMinerUid}
                  </span>
                )}
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
                      {displayMinerHotkey}
                    </span>
                  </div>
                  {minerInfo?.hotkey && (
                    <IDCopyButton text={minerInfo.hotkey} />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Agent Run style stats with Task Score centered */}
        {(agentRunInfo || evaluationInfo || details) ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-transparent p-5 text-white">
            {/* Mobile */}
            <div className="flex flex-col space-y-6 md:hidden">
              <div className="flex flex-col items-center justify-center">
                <div
                  className="text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-emerald-200 to-green-300 bg-clip-text text-transparent"
                  style={{
                    WebkitTextStroke: "0.4px rgba(249, 250, 251, 0.15)",
                  }}
                >
                  {evaluationScore}
                </div>
                <div className="mt-2 text-sm font-medium text-white/70">
                  Task Score
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <RunStatCard
                  label="Duration"
                  value={String(evaluationDuration)}
                  color="blue"
                  Icon={PiTimer}
                />
                <RunStatCard
                  label="Actions"
                  value={String(actionsTotal ?? "—")}
                  color="amber"
                  Icon={PiPlay}
                />
                <RunStatCard
                  label="Successful"
                  value={String(successCount ?? "—")}
                  color="emerald"
                  Icon={PiCheckCircle}
                />
                <RunStatCard
                  label="Failed"
                  value={String(failCount ?? "—")}
                  color="rose"
                  Icon={PiXCircle}
                />
              </div>
            </div>

            {/* Desktop: left 2 cards • centered score • right 2 cards */}
            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
              <div className="grid grid-cols-2 gap-4 justify-start">
                <RunStatCard
                  label="Duration"
                  value={String(evaluationDuration)}
                  color="blue"
                  Icon={PiTimer}
                />
                <RunStatCard
                  label="Actions"
                  value={String(actionsTotal ?? "—")}
                  color="amber"
                  Icon={PiPlay}
                />
              </div>
              <div className="flex flex-col items-center justify-center mx-4">
                <div
                  className="bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-5xl font-extrabold text-transparent"
                  style={{
                    WebkitTextStroke: "0.6px rgba(249, 250, 251, 0.18)",
                  }}
                >
                  {evaluationScore}
                </div>
                <div className="mt-1 text-xs font-medium text-white/70">
                  Task Score
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 justify-end">
                <RunStatCard
                  label="Successful"
                  value={String(successCount ?? "—")}
                  color="emerald"
                  Icon={PiCheckCircle}
                />
                <RunStatCard
                  label="Failed"
                  value={String(failCount ?? "—")}
                  color="rose"
                  Icon={PiXCircle}
                />
              </div>
            </div>
          </div>
        ) : null}

        {(hasLlmData || hasPrice) && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-900/80 via-slate-950/70 to-emerald-950/30 p-5 text-white shadow-[0_20px_56px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(56,189,248,0.12),transparent_40%)]" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500/15 text-emerald-200 shadow-inner">
                  <PiChartBar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/70">
                    Evaluation Usage
                  </p>
                  <p className="text-lg font-semibold text-white/95">
                    LLM Provider, Model &amp; Pricing
                  </p>
                </div>
              </div>
            </div>
            {usageRows.length > 0 ? (
              <div className="relative mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <InfoRow
                      label="Total Tokens"
                      value={formatTokens(usageTotals.tokens)}
                      valueClassName="font-semibold text-amber-200"
                    />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <InfoRow
                      label="Total Cost"
                      value={formatCost(usageTotals.cost)}
                      valueClassName="font-semibold text-emerald-200"
                    />
                  </div>
                </div>
                {usageRows.map((row, idx) => (
                  <div
                    key={`${row.provider ?? "provider"}-${row.model ?? "model"}-${idx}`}
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <InfoRow
                        label="LLM Provider"
                        value={row.provider ? row.provider.toUpperCase() : "—"}
                        valueClassName="font-semibold text-sky-200"
                      />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <InfoRow
                        label="LLM Model"
                        value={row.model ?? "—"}
                        valueClassName="font-semibold text-indigo-200"
                      />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <InfoRow
                        label="Tokens Used"
                        value={row.tokens == null ? "—" : formatTokens(row.tokens)}
                        valueClassName="font-semibold text-amber-200"
                      />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <InfoRow
                        label="Evaluation Cost"
                        value={row.cost == null ? "—" : formatCost(row.cost)}
                        valueClassName="font-semibold text-emerald-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <InfoRow
                    label="LLM Provider"
                    value={evaluationInfo?.llmProvider ? evaluationInfo.llmProvider.toUpperCase() : "—"}
                    valueClassName="font-semibold text-sky-200"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <InfoRow
                    label="LLM Model"
                    value={evaluationInfo?.llmModel ?? "—"}
                    valueClassName="font-semibold text-indigo-200"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <InfoRow
                    label="Tokens Used"
                    value={
                      evaluationInfo?.llmTokens == null
                        ? "—"
                        : formatTokens(evaluationInfo.llmTokens)
                    }
                    valueClassName="font-semibold text-amber-200"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <InfoRow
                    label="Evaluation Cost"
                    value={hasPrice ? formatCost(priceValue) : "—"}
                    valueClassName="font-semibold text-emerald-200"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#9aaeff]/70 font-bold">
            Task Context
          </span>
          <div className="grid gap-4 md:grid-cols-3">
            {metaCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#5436a6]/40 bg-transparent p-4 text-white shadow-[0_16px_44px_rgba(4,8,20,0.6)] backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/70 text-white shadow-inner flex-shrink-0">
              <PiFileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-sm text-white leading-relaxed break-words"
                title={taskData.prompt || "Prompt not provided for this task."}
              >
                {taskData.prompt || "Prompt not provided for this task."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Inlined Task Results (Cooked) =====
const ACTION_TYPE_META: Record<
  TaskAction["type"],
  { label: string; icon: IconType; badgeBg: string; badgeText: string }
> = {
  navigate: {
    label: "Navigate",
    icon: PiArrowRight,
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
  },
  click: {
    label: "Click",
    icon: PiCursorClick,
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
  },
  type: {
    label: "Type",
    icon: PiKeyboard,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  },
  input: {
    label: "Input",
    icon: PiKeyboard,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  },
  search: {
    label: "Search",
    icon: PiArrowRight,
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-300",
  },
  extract: {
    label: "Extract",
    icon: PiArrowRight,
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-300",
  },
  submit: {
    label: "Submit",
    icon: PiArrowRight,
    badgeBg: "bg-fuchsia-500/15",
    badgeText: "text-fuchsia-300",
  },
  open_tab: {
    label: "Open Tab",
    icon: PiArrowRight,
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
  },
  close_tab: {
    label: "Close Tab",
    icon: PiXCircle,
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
  },
  wait: {
    label: "Wait",
    icon: PiClock,
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
  },
  scroll: {
    label: "Scroll",
    icon: PiScroll,
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
  },
  screenshot: {
    label: "Screenshot",
    icon: PiCamera,
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-300",
  },
  other: {
    label: "Other",
    icon: PiPlay,
    badgeBg: "bg-slate-500/15",
    badgeText: "text-slate-200",
  },
};

const truncate = (value: string, max = 80) =>
  value.length > max ? `${value.slice(0, max).trim()}…` : value;

const getStatusIcon = (success: boolean, error?: string) => {
  if (error)
    return <PiCheckCircle className="w-4 h-4 flex-shrink-0 text-red-500" />;
  if (success)
    return <PiCheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />;
  return <PiWarning className="w-4 h-4 flex-shrink-0 text-amber-500" />;
};

const formatActionDetails = (action: TaskAction) => {
  const parts: string[] = [];
  const meta = (action as any).metadata || {};
  const raw = meta?.raw_action || {};
  const attr = meta?.attributes || {};

  // Prefer common fields (attr, raw top-level for IWA format)
  if (action.selector) parts.push(`Selector: ${truncate(String(action.selector), 80)}`);
  if (action.value) parts.push(`Value: ${truncate(action.value, 80)}`);
  const url = attr.url ?? raw.url;
  if (url) parts.push(`URL: ${truncate(String(url), 120)}`);
  const query = attr.query ?? raw.query;
  if (query) parts.push(`Query: ${truncate(String(query), 80)}`);
  const keys = attr.keys ?? raw.keys;
  if (keys) parts.push(`Keys: ${truncate(String(keys), 40)}`);
  const text = attr.text ?? raw.text;
  if (text) parts.push(`Text: ${truncate(String(text), 80)}`);
  const toVal = attr.to ?? raw.to;
  if (toVal) parts.push(`To: ${truncate(String(toVal), 80)}`);
  const fromVal = attr.from ?? raw.from;
  if (fromVal) parts.push(`From: ${truncate(String(fromVal), 80)}`);
  if (typeof (attr.deltaY ?? raw.deltaY) === "number") parts.push(`deltaY: ${attr.deltaY ?? raw.deltaY}`);
  if (typeof (attr.deltaX ?? raw.deltaX) === "number") parts.push(`deltaX: ${attr.deltaX ?? raw.deltaX}`);
  const title = attr.title ?? raw.title;
  if (title) parts.push(`Title: ${truncate(String(title), 60)}`);
  if (raw.go_back === true) parts.push("go_back");
  if (raw.go_forward === true) parts.push("go_forward");
  if (action.error) parts.push(`Error: ${truncate(action.error, 80)}`);

  // Si raw_action tiene campos a nivel superior
  if (parts.length === 0 && raw && typeof raw === "object") {
    const skip = new Set(["type", "attributes", "value"]);
    for (const [k, v] of Object.entries(raw)) {
      if (skip.has(k) || v == null || v === "") continue;
      const val = typeof v === "string" ? v : JSON.stringify(v);
      parts.push(`${k}: ${truncate(val, 80)}`);
      if (parts.length >= 3) break;
    }
  }

  return parts.length === 0 ? "No additional details" : parts.join(" • ");
};

// Build structured key-value pairs from action metadata for display
const extractActionDetailPairs = (
  action: TaskAction
): Array<[string, string]> => {
  const pairs: Array<[string, string]> = [];
  const add = (k: string, v: any) => {
    if (v === undefined || v === null || v === "") return;
    // Skip 'type' field as it's already shown in the action badge
    if (k.toLowerCase() === "type") return;
    // Skip 'value' field as it's often redundant with text
    if (k.toLowerCase() === "value") return;
    const val = typeof v === "string" ? v : JSON.stringify(v);
    pairs.push([k, val]);
  };
  if (action.selector) add("selector", action.selector);
  // if (action.value) add("value", action.value); // Hide value as it's often redundant with text

  const meta: any = (action as any).metadata || {};
  const attr = meta?.attributes?.attributes || meta?.attributes || {};
  const raw = meta?.raw_action || {};
  const rawAttr = raw?.attributes?.attributes || raw?.attributes || {};
  // IWA format: url, text, selector, etc. están a nivel superior en raw_action
  const top = (k: string) => (typeof raw[k] === "string" || typeof raw[k] === "number" || typeof raw[k] === "boolean" ? raw[k] : undefined);

  // Prefer attributes, then raw.attributes, then raw top-level (IWA format)
  add("url", attr.url ?? rawAttr.url ?? top("url"));
  add("status", attr.status ?? rawAttr.status ?? top("status"));
  add("query", attr.query ?? rawAttr.query ?? top("query"));
  add("keys", attr.keys ?? rawAttr.keys ?? top("keys"));
  add("text", attr.text ?? rawAttr.text ?? top("text"));
  add("to", attr.to ?? rawAttr.to ?? top("to"));
  add("from", attr.from ?? rawAttr.from ?? top("from"));
  if (typeof (attr.deltaY ?? rawAttr.deltaY ?? raw.deltaY) === "number")
    add("deltaY", attr.deltaY ?? rawAttr.deltaY ?? raw.deltaY);
  if (typeof (attr.deltaX ?? rawAttr.deltaX ?? raw.deltaX) === "number")
    add("deltaX", attr.deltaX ?? rawAttr.deltaX ?? raw.deltaX);
  add("title", attr.title ?? rawAttr.title ?? top("title"));
  if (raw.go_back === true) add("go_back", "true");
  if (raw.go_forward === true) add("go_forward", "true");
  // Hide redundant type field; action type is already shown in the badge/icon
  // if (raw?.type && String(raw.type).toLowerCase() !== "navigate") {
  //   add("type", raw.type);
  // }
  if (action.error) add("error", action.error);

  // Si raw_action tiene campos útiles a nivel superior que no hemos mostrado
  if (pairs.length === 0 && raw && typeof raw === "object") {
    const skipKeys = new Set(["type", "attributes", "value"]);
    const rawEntries = Object.entries(raw)
      .filter(([k]) => !skipKeys.has(k) && raw[k] != null && raw[k] !== "")
      .slice(0, 4) as Array<[string, any]>;
    rawEntries.forEach(([k, v]) => add(k, v));
  }
  // Fallback final: no mostrar raw_action como JSON, solo "No additional details"
  return pairs;
};

const formatKeyLabel = (k: string) =>
  k
    .replaceAll("_", " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

type TaskResultsProps = {
  evaluationData: {
    result: {
      status: string;
      eval_score: number;
      eval_time: number;
      zero_reason?: string | null;
    } | null;
    actions: any[];
    screenshots: any[];
    isLoading: boolean;
    error: string | null;
  };
  taskId?: string;
};

function TaskResults({ evaluationData, taskId }: Readonly<TaskResultsProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Use data from evaluationData (always from get-evaluation endpoint)
  const resultsLoading = evaluationData.isLoading;
  const resultsError = evaluationData.error;

  // Paginate actions
  const allActions = evaluationData.actions || [];
  const actionsTotal = allActions.length;
  const successCount = allActions.filter((a: any) => a.success).length;
  const failCount = allActions.filter((a: any) => !a.success || a.error).length;
  const actionsLoading = evaluationData.isLoading;
  const actionsError = evaluationData.error;

  // Paginate actions
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const actions = allActions.slice(start, end);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const screenshots = evaluationData.screenshots || [];
  const screenshotsLoading = evaluationData.isLoading;
  const screenshotsError = evaluationData.error;

  const hasApiScreenshots = screenshots.length > 0;
  const fallbackScreenshots = useMemo(() => {
    // Screenshots come from evaluationData.screenshots, not from result
    // No fallback screenshots since result doesn't contain screenshots anymore
    return [] as Array<{
      id?: string;
      url: string;
      timestamp?: string;
      actionId?: string;
      description?: string;
    }>;
  }, [hasApiScreenshots]);

  const mediaItems = hasApiScreenshots ? screenshots : fallbackScreenshots;
  const isMediaLoading =
    screenshotsLoading || (!hasApiScreenshots && resultsLoading);
  const showMediaError =
    !isMediaLoading && !!screenshotsError && mediaItems.length === 0;
  const showMediaEmpty =
    !isMediaLoading && !showMediaError && mediaItems.length === 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const totalPages = Math.max(1, Math.ceil(actionsTotal / pageSize));
  // successCount and failCount now come from the API (total counts, not just current page)

  const handleDownloadAll = () => {
    if (!mediaItems || mediaItems.length === 0) return;
    const baseId = taskId ?? "task";
    mediaItems.forEach((item: any, index: number) => {
      if (!item?.url) return;
      const a = document.createElement("a");
      a.href = item.url;
      a.download = `${baseId}-replay-${index + 1}.gif`;
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
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  const handleToggleFullscreen = () => {
    if (!recordingsRef.current) return;
    if (!document.fullscreenElement) {
      recordingsRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement === recordingsRef.current) {
      document.exitFullscreen?.();
    } else {
      // another element is in fullscreen; exit then request
      document
        .exitFullscreen?.()
        .then(() => recordingsRef.current?.requestFullscreen?.());
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Actions (left) */}
      <section className="rounded-2xl border border-slate-700/50 bg-transparent p-5 backdrop-blur-sm shadow-[0_14px_44px_rgba(4,8,20,0.45)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text className="text-white text-lg font-semibold">
              Actions Timeline
            </Text>
            {!actionsLoading && (
              <p className="text-sm text-slate-400">
                {actionsTotal} total actions · {successCount} successful ·{" "}
                {failCount} failed
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
          {(() => {
            if (actionsLoading) {
              return (
                <div className="space-y-3">
                  {Array.from({ length: pageSize }, (_, index) => (
                    <ListItemPlaceholder key={`action-loading-${index}`} />
                  ))}
                </div>
              );
            }
            if (actionsError) {
              return (
                <div className="flex items-center justify-center h-full text-red-300">
                  <div className="text-center space-y-1">
                    <PiXCircle className="w-8 h-8 mx-auto" />
                    <Text className="text-sm text-red-200">
                      {actionsError || "Failed to load actions"}
                    </Text>
                  </div>
                </div>
              );
            }
            if (actions.length === 0) {
              return (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center space-y-1">
                    <PiPlay className="w-8 h-8 mx-auto" />
                    <Text className="text-sm text-slate-300">
                      No actions available
                    </Text>
                  </div>
                </div>
              );
            }
            return actions.map((action, index) => {
              const meta =
                ACTION_TYPE_META[
                  action.type as keyof typeof ACTION_TYPE_META
                ] || ACTION_TYPE_META.other;
              const detailsList = extractActionDetailPairs(action);
              return (
                <div
                  key={action.id || index}
                  className="flex items-start justify-between p-3 rounded-lg border border-slate-700/40 bg-transparent"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center h-10 w-10 min-w-[2.5rem] rounded-lg ${meta.badgeBg} flex-shrink-0`}
                    >
                      <meta.icon className={`w-5 h-5 ${meta.badgeText}`} />
                    </div>
                    <div>
                      <Text className="text-white font-medium">
                        {meta.label}
                      </Text>
                      {detailsList.length > 0 ? (
                        <ul className="mt-0.5 text-xs text-slate-400 list-disc pl-4 space-y-0.5">
                          {detailsList.slice(0, 4).map(([k, v], i) => (
                            <li
                              key={`${action.id || index}-d-${i}`}
                              className="break-words"
                            >
                              <span className="text-slate-500">
                                {formatKeyLabel(k)}:
                              </span>{" "}
                              <span className="break-all">{String(v)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text className="text-slate-400 text-xs">
                          No additional details
                        </Text>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(action.success, action.error)}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* GIF Replays (right) */}
      <section className="rounded-2xl border border-slate-700/50 bg-transparent p-5 backdrop-blur-sm shadow-[0_14px_44px_rgba(4,8,20,0.45)]">
        <div className="flex items-center mb-4">
          <Text className="text-white text-lg font-semibold">
            Screen Recordings
          </Text>
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

        <div
          ref={recordingsRef}
          className={`${isFullscreen ? "h-screen" : "h-[180px] md:h-[350px]"} border border-slate-700/50 rounded-xl overflow-y-auto custom-scrollbar bg-transparent p-4`}
        >
          {(() => {
            if (isMediaLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={`screenshot-loading-${index}`} className="space-y-2">
                      <Placeholder height="160px" className="rounded-lg" />
                      <TextPlaceholder lines={2} />
                    </div>
                  ))}
                </div>
              );
            }
            if (showMediaError) {
              return (
                <div className="flex items-center justify-center h-full text-red-300">
                  <div className="text-center space-y-1">
                    <PiXCircle className="w-8 h-8 mx-auto" />
                    <Text className="text-sm text-red-200">
                      {screenshotsError ||
                        resultsError ||
                        "Failed to load GIF replays"}
                    </Text>
                  </div>
                </div>
              );
            }
            if (showMediaEmpty) {
              return (
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/images/no_gift_available.png"
                    alt="No GIF replays available"
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              );
            }
            return (
              <div className="space-y-4">
                {mediaItems.map((screenshot: any, index: number) => (
                  <div
                    key={`gif-${screenshot.id || index}`}
                    className="w-full group bg-transparent rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all"
                  >
                    <div className="relative w-full aspect-video bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshot.url}
                        alt={`GIF Replay ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const sibling =
                            target.nextElementSibling as HTMLElement;
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
            );
          })()}
        </div>
      </section>
    </div>
  );
}

// ===== Page wrapper combining header + details + results =====
export default function TaskDynamic() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const idParam = Array.isArray(id) ? id[0] : (id ?? "");

  // Always use the complete evaluation endpoint
  const evaluationData = useEvaluationComplete(idParam);

  const details = evaluationData.details;
  const info = evaluationData.info;
  const isLoading = evaluationData.isLoading;
  const error = evaluationData.error;
  const refetch = evaluationData.refetch;

  // Extract actual IDs from the info object (preferred) or details response
  const loadingOrUnavailable = (() => {
    if (isLoading) return "Loading…";
    if (error) return "Unavailable";
    return "—";
  })();
  const taskId = info?.taskId ?? details?.taskId ?? (isLoading ? "Loading…" : "—");
  const runIdDisplay =
    info?.miner_run_id ?? details?.agentRunId ?? loadingOrUnavailable;
  const evaluationIdDisplay =
    info?.evaluationId ??
    details?.relationships?.evaluation?.evaluationId ??
    loadingOrUnavailable;
  const backHref = (info?.miner_run_id ?? details?.agentRunId)
    ? `${routes.agent_run}/${encodeURIComponent(info?.miner_run_id ?? details?.agentRunId ?? "")}`
    : routes.agent_run;

  const pageTitle = "Evaluation Details";

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title={pageTitle}
        description={
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
            <a
              href="#evaluation"
              className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-indigo-400/60 hover:bg-indigo-500/10"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Evaluation
              </span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate flex-1 sm:flex-none sm:max-w-[420px]">
                {truncateMiddle(evaluationIdDisplay, 8)}
              </span>
              {info?.evaluationId && (
                <span className="ml-auto">
                  <IDCopyButton text={info.evaluationId} />
                </span>
              )}
            </a>
            <Link
              href={
                (info?.miner_run_id ?? details?.agentRunId)
                  ? `${routes.agent_run}/${encodeURIComponent(info?.miner_run_id ?? details?.agentRunId ?? "")}`
                  : "#"
              }
              className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-emerald-400/60 hover:bg-emerald-500/10"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Run
              </span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate flex-1 sm:flex-none sm:max-w-[420px]">
                {truncateMiddle(runIdDisplay, 8)}
              </span>
              {(info?.miner_run_id ?? details?.agentRunId) && (
                <span className="ml-auto">
                  <IDCopyButton text={info?.miner_run_id ?? details?.agentRunId ?? ""} />
                </span>
              )}
            </Link>
            <Link
              href={(info?.taskId ?? details?.taskId) ? `${routes.tasks}/${info?.taskId ?? details?.taskId}` : "#"}
              className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-cyan-400/60 hover:bg-cyan-500/10"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Task
              </span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate flex-1 sm:flex-none sm:max-w-[420px]">
                {truncateMiddle(taskId, 8)}
              </span>
              {(info?.taskId ?? details?.taskId) && (
                <span className="ml-auto">
                  <IDCopyButton text={info?.taskId ?? details?.taskId ?? ""} />
                </span>
              )}
            </Link>
            {details?.webVersion && (
              <div className="inline-flex w-full sm:w-auto sm:max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-transparent px-3 py-1.5 shadow-sm hover:border-purple-400/60 hover:bg-purple-500/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Web Version
                </span>
                <div className="h-3.5 w-px bg-slate-600/70" />
                <span className="font-mono text-sm font-semibold text-white/90 truncate flex-1 sm:flex-none sm:max-w-[420px]">
                  {details.webVersion}
                </span>
                <span className="ml-auto">
                  <IDCopyButton text={details.webVersion} />
                </span>
              </div>
            )}
          </div>
        }
        className="mt-2"
      >
        <Link
          href={backHref}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agent Run</span>
        </Link>
      </PageHeader>

      <TaskDetailsDynamic
        details={details}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        actionsTotal={evaluationData.actions.length}
        successCount={evaluationData.actions.filter((a: any) => a.success).length}
        failCount={evaluationData.actions.filter((a: any) => !a.success || a.error).length}
        info={info}
        evaluationZeroReason={(evaluationData?.result as Record<string, unknown> | undefined)?.zero_reason as string | undefined}
      />

      <div className="mb-10">
        <TaskResults
          taskId={idParam}
          evaluationData={{
            result: evaluationData.result,
            actions: evaluationData.actions,
            screenshots: evaluationData.screenshots,
            isLoading: evaluationData.isLoading,
            error: evaluationData.error,
          }}
        />
      </div>
    </div>
  );
}
// Small stat card used for "Agent Run" cards replicated from agent run detail
function RunStatCard({
  label,
  value,
  color = "blue",
  Icon,
}: Readonly<{
  label: string;
  value: string;
  color?: "blue" | "amber" | "emerald" | "rose";
  Icon: IconType;
}>) {
  const colorMap: Record<
    string,
    { bg: string; border: string; iconBg: string }
  > = {
    blue: {
      bg: "bg-blue-500/20",
      border: "border-blue-400/40",
      iconBg: "bg-blue-500/70",
    },
    amber: {
      bg: "bg-amber-500/20",
      border: "border-amber-400/40",
      iconBg: "bg-amber-500/70",
    },
    emerald: {
      bg: "bg-emerald-500/20",
      border: "border-emerald-400/40",
      iconBg: "bg-emerald-500/70",
    },
    rose: {
      bg: "bg-rose-500/20",
      border: "border-rose-400/40",
      iconBg: "bg-rose-500/70",
    },
  };
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg} text-white shadow-inner`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-extrabold text-white leading-tight truncate">
            {value}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
