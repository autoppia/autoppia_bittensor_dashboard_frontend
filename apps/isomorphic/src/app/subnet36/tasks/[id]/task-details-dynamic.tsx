"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Text } from "rizzui";
import type { IconType } from "react-icons";
import {
  PiChartBar,
  PiClockCountdown,
  PiCopy,
  PiFileText,
  PiGauge,
  PiIdentificationCard,
  PiLinkSimple,
  PiPlay,
  PiShieldCheck,
  PiTimer,
  PiUserCircle,
} from "react-icons/pi";
import type { TaskDetails } from "@/services/api/types/tasks";
import { resolveAssetUrl } from "@/services/utils/assets";
import { routes } from "@/config/routes";

type StatCardConfig = {
  label: string;
  value: ReactNode;
  Icon: IconType;
  gradient: string;
  iconWrapper: string;
  description?: ReactNode;
  valueClassName?: string;
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
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
};

const formatDuration = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  if (value < 60) {
    return `${Math.round(value)}s`;
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const truncateMiddle = (value?: string | null, visible: number = 6) => {
  if (!value) return "—";
  if (value.length <= visible * 2) {
    return value;
  }
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};

const formatNumber = (value?: number | null, digits: number = 2) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(digits);
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-lg bg-white/10 p-1.5 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-300">✓</span>
      ) : (
        <PiCopy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span
        className={`flex-1 text-right text-white font-semibold leading-snug ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
        className ?? ""
      }`}
    >
      <span className="text-white/85">{label}</span>
      <span className="font-mono text-white text-xs">{value}</span>
    </span>
  );
}

type ContextCardProps = {
  title: string;
  Icon: IconType;
  gradient: string;
  children: ReactNode;
  header?: ReactNode; // override header content
};

function ContextCard({
  title,
  Icon,
  gradient,
  children,
  header,
}: ContextCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-blue-400/40 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 p-6 text-white shadow-2xl backdrop-blur transition-shadow duration-300 hover:shadow-blue-500/20">
      <div className="relative flex flex-col gap-4">
        {header ? (
          <div>{header}</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white shadow-md">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 font-bold">
              {title}
            </span>
          </div>
        )}
        <div className="space-y-2.5 text-sm text-white">{children}</div>
      </div>
    </div>
  );
}

const getStatusStyles = (status?: string) => {
  const base = {
    gradient:
      "bg-gradient-to-br from-slate-900/50 via-slate-900/60 to-slate-950/80",
    iconWrapper: "bg-slate-900/60 border-slate-800/60",
    valueClassName: "text-slate-200",
  };

  if (!status) {
    return base;
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("success") || normalized.includes("complete")) {
    return {
      gradient:
        "bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-emerald-500/15 border-emerald-400/30",
      valueClassName: "text-emerald-100",
    };
  }

  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient:
        "bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-sky-500/15 border-sky-400/30",
      valueClassName: "text-blue-100",
    };
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient:
        "bg-gradient-to-br from-rose-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-rose-500/15 border-rose-400/30",
      valueClassName: "text-red-100",
    };
  }

  return base;
};

function StatCard({
  label,
  value,
  Icon,
  gradient,
  iconWrapper,
  description,
  valueClassName,
}: StatCardConfig) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-blue-400/40 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-2xl backdrop-blur transition-shadow duration-300 hover:shadow-blue-500/20">
      <div className="relative flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 font-bold">
              {label}
            </span>
            <div
              className={`mt-2 text-3xl font-bold text-white ${valueClassName ?? ""}`}
            >
              {value}
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white shadow-md">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-white/85">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

type TaskDetailsDynamicProps = {
  details?: TaskDetails | null;
  isLoading?: boolean;
  error?: string | null;
};

export default function TaskDetailsDynamic({
  details,
  isLoading = false,
  error,
}: TaskDetailsDynamicProps) {
  if (isLoading && !details) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
        <div className="relative space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-primary-${idx}`}
                className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-5"
              >
                <div className="space-y-3">
                  <div className="h-2.5 w-20 rounded bg-slate-700" />
                  <div className="h-6 w-32 rounded bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`task-loading-secondary-${idx}`}
                className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6"
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
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-red-900/20 p-6 shadow-2xl mb-8">
        <div className="pointer-events-none absolute -right-12 top-6 h-56 w-56 rounded-full bg-red-400/20 blur-[120px]" />
        <div className="relative text-center">
          <div className="text-red-200 text-lg font-semibold mb-2">
            Failed to load task overview
          </div>
          <div className="text-sm text-red-100/80">
            {error || "An unexpected error occurred while fetching task data."}
          </div>
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

  const evaluationScore =
    typeof evaluationInfo?.finalScore === "number"
      ? formatPercent(evaluationInfo.finalScore)
      : formatPercent(taskData.score);
  const evaluationDuration = evaluationInfo
    ? formatDuration(evaluationInfo.evaluationTime)
    : formatDuration(taskData.duration);
  const agentRunDuration = agentRunInfo?.duration
    ? formatDuration(agentRunInfo.duration)
    : formatDuration(taskData.duration);
  const agentRunAverageScore =
    typeof agentRunInfo?.averageScore === "number"
      ? formatPercent(agentRunInfo.averageScore)
      : "—";
  const validatorDefaultImage = resolveAssetUrl("/validators/Other.png");
  const validatorImage =
    validatorInfo?.image && validatorInfo.image.trim()
      ? resolveAssetUrl(validatorInfo.image, validatorDefaultImage)
      : validatorDefaultImage;

  const minerDefaultImage = resolveAssetUrl(
    minerInfo?.isSota ? "/validators/Other.png" : "/miners/0.svg"
  );
  const minerImage =
    minerInfo?.image && minerInfo.image.trim()
      ? resolveAssetUrl(minerInfo.image, minerDefaultImage)
      : minerDefaultImage;

  const artifactSummary = (() => {
    const parts: string[] = [];
    if (evaluationInfo?.hasRecording || solutionInfo?.hasRecording) {
      parts.push("Recording");
    }
    if (evaluationInfo?.hasFeedback) {
      parts.push("Feedback");
    }
    return parts.length ? parts.join(" • ") : "—";
  })();
  const solutionSummary = solutionInfo
    ? `${truncateMiddle(solutionInfo.solutionId, 5)} · ${solutionInfo.actionsCount} actions`
    : "—";
  const evaluationStatusLabel = formatLabel(
    evaluationInfo?.status ?? taskData.status
  );
  const agentRunLinkId = agentRunInfo?.agentRunId ?? taskData.agentRunId;
  const evaluationStyles = getStatusStyles(
    evaluationInfo?.status ?? taskData.status
  );

  // Removed identifier chips row in favor of compact header pills

  const primaryCards: StatCardConfig[] = [
    {
      label: "Score",
      value: evaluationScore,
      Icon: PiChartBar,
      gradient:
        "bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-emerald-500/15 border-emerald-400/30",
      description: "Final evaluation score recorded for this task.",
    },
    {
      label: "Duration",
      value: evaluationDuration,
      Icon: PiTimer,
      gradient:
        "bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-sky-500/15 border-sky-400/30",
      description: "Time taken from task submission to evaluation completion.",
    },
    {
      label: "Status",
      value: evaluationStatusLabel,
      Icon: PiGauge,
      gradient: evaluationStyles.gradient,
      iconWrapper: evaluationStyles.iconWrapper,
      valueClassName: evaluationStyles.valueClassName,
      description: "Overall status reported by the validator.",
    },
  ];

  const secondaryCards: StatCardConfig[] = [];

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60 shadow-2xl backdrop-blur-sm">
      <div className="relative space-y-6 p-8">
        {relationships ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContextCard
                title="Round"
                Icon={PiClockCountdown}
                gradient="bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80"
                header={
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 text-black shadow-lg ring-1 ring-amber-500/30">
                      <PiClockCountdown className="h-6 w-6" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        Round {roundInfo?.roundNumber ?? "—"}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mt-2 inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                      {formatLabel(roundInfo?.status)}
                    </div>
                  </div>
                </div>
                <div className="pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatPill
                      label="Round ID"
                      value={truncateMiddle(roundInfo?.validatorRoundId, 6)}
                      className="border-emerald-400/40 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 backdrop-blur-sm"
                    />
                    <StatPill
                      label="Epoch"
                      value={
                        roundInfo?.startEpoch !== undefined &&
                        roundInfo?.startEpoch !== null
                          ? roundInfo.startEpoch
                          : "—"
                      }
                      className="border-blue-400/40 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </ContextCard>
              <ContextCard
                title="Validator"
                Icon={PiShieldCheck}
                gradient="bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80"
                header={
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/30 shadow-md">
                      <Image
                        src={validatorImage}
                        alt={validatorInfo?.name || "Validator"}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-end gap-2 min-w-0">
                      <p className="text-xl font-semibold text-white truncate">
                        {validatorInfo?.name ||
                          truncateMiddle(validatorInfo?.hotkey)}
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                        Validator
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-medium">
                      UID {validatorInfo?.uid ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatPill
                      label="Stake"
                      value={
                        validatorInfo?.stake !== undefined &&
                        validatorInfo?.stake !== null
                          ? `${formatNumber(validatorInfo.stake)} TAO`
                          : "—"
                      }
                      className="border-emerald-400/50 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 backdrop-blur-sm"
                    />
                    <StatPill
                      label="vTrust"
                      value={
                        validatorInfo?.vtrust !== undefined &&
                        validatorInfo?.vtrust !== null
                          ? formatNumber(validatorInfo.vtrust)
                          : "—"
                      }
                      className="border-blue-400/40 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <InfoRow
                      label="Hotkey"
                      value={truncateMiddle(validatorInfo?.hotkey)}
                    />
                    <InfoRow
                      label="Version"
                      value={validatorInfo?.version ?? "—"}
                    />
                  </div>
                </div>
              </ContextCard>
              <ContextCard
                title={minerInfo?.isSota ? "SOTA Agent" : "Miner"}
                Icon={PiUserCircle}
                gradient="bg-gradient-to-br from-purple-500/12 via-slate-900/55 to-slate-950/80"
                header={
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/30 shadow-md">
                      <Image
                        src={minerImage}
                        alt={minerInfo?.name ?? "Miner"}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-xl font-semibold text-white truncate">
                        {minerInfo?.name ?? "—"}
                      </p>
                      {minerInfo?.isSota ? (
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400 shrink-0">
                          SOTA
                        </span>
                      ) : null}
                    </div>
                  </div>
                }
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-medium">
                      {minerInfo?.isSota ? "SOTA Agent" : "Miner"} • UID{" "}
                      {minerInfo?.uid ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-3">
                  <InfoRow
                    label="Hotkey"
                    value={truncateMiddle(minerInfo?.hotkey)}
                  />
                  <InfoRow
                    label="GitHub"
                    value={
                      minerInfo?.github ? (
                        <a
                          href={minerInfo.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-end gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors duration-200"
                        >
                          <PiLinkSimple className="h-3.5 w-3.5" />
                          Repo
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </ContextCard>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {primaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl border-2 border-blue-400/40 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 p-6 text-white shadow-2xl backdrop-blur">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white shadow-md">
              <PiFileText className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <Text className="text-[10px] uppercase tracking-[0.25em] text-white/80 font-bold">
                Task Prompt
              </Text>
              <Text className="text-sm leading-relaxed text-white">
                {taskData.prompt || "Prompt not provided for this task."}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
