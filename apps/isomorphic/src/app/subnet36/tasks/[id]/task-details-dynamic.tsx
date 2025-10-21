"use client";

import type React from "react";

import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  PiChartBar,
  PiClockCountdown,
  PiFileText,
  PiGauge,
  PiLinkSimple,
  PiShieldCheck,
  PiTimer,
  PiUserCircle,
  PiCopy,
} from "react-icons/pi";
import type { TaskDetails } from "@/services/api/types/tasks";
import { resolveAssetUrl } from "@/services/utils/assets";
import { routes } from "@/config/routes";
import { useState } from "react";

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

const truncateMiddle = (value?: string | null, visible = 6) => {
  if (!value) return "—";
  if (value.length <= visible * 2) {
    return value;
  }
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};

const formatNumber = (value?: number | null, digits = 2) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(digits);
};

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

type ContextCardProps = {
  title: string;
  Icon: IconType;
  children: ReactNode;
  header?: ReactNode;
};

function ContextCard({ title, Icon, children, header }: ContextCardProps) {
  return (
    <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm">
      {header ? (
        <div>{header}</div>
      ) : (
        <header className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/30 text-white">
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {title}
          </p>
        </header>
      )}
      <div className="space-y-2.5 text-sm text-slate-300">{children}</div>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  Icon: IconType;
  iconWrapper: string;
  description?: ReactNode;
  valueClassName?: string;
};

function StatCard({
  label,
  value,
  Icon,
  iconWrapper,
  description,
  valueClassName,
}: StatCardProps) {
  return (
    <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm">
      <header className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            {label}
          </p>
          <p
            className={`text-3xl font-semibold leading-tight ${valueClassName ?? "text-white"}`}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrapper}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </header>
      {description ? (
        <div className="mt-4 rounded-lg border border-slate-700/20 bg-slate-800/20 px-3 py-2 text-xs text-slate-300">
          {description}
        </div>
      ) : null}
    </section>
  );
}

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
      gradient: "bg-gradient-to-br from-emerald-500/10 to-zinc-950",
      iconWrapper: "bg-emerald-500/10 border-emerald-500/30",
      valueClassName: "text-emerald-400",
    };
  }

  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient: "bg-gradient-to-br from-blue-500/10 to-zinc-950",
      iconWrapper: "bg-blue-500/10 border-blue-500/30",
      valueClassName: "text-blue-400",
    };
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient: "bg-gradient-to-br from-red-500/10 to-zinc-950",
      iconWrapper: "bg-red-500/10 border-red-500/30",
      valueClassName: "text-red-400",
    };
  }

  return base;
};

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
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-8 shadow-xl">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
        <div className="relative">
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-primary-${idx}`}
                className="animate-pulse rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-3 w-20 rounded-full bg-slate-700/60" />
                    <div className="h-8 w-24 rounded-full bg-slate-600/60" />
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-slate-700/40" />
                </div>
                <div className="mt-4 h-3 w-32 rounded-full bg-slate-700/50" />
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-secondary-${idx}`}
                className="animate-pulse rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5"
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded-full bg-slate-700/60" />
                  <div className="h-6 w-20 rounded-full bg-slate-600/60" />
                </div>
                <div className="mt-4 h-3 w-28 rounded-full bg-slate-700/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if ((error && !details) || !details) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-600/40 bg-red-950/30 p-8 shadow-xl mb-8">
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
    validatorInfo?.hotkey && validatorInfo.hotkey.length > 0
      ? resolveAssetUrl(
          `/validators/${validatorInfo.hotkey}.png`,
          validatorDefaultImage
        )
      : validatorDefaultImage;

  const minerDefaultImage = resolveAssetUrl(
    minerInfo?.isSota ? "/validators/Other.png" : "/images/autoppia-logo.png"
  );
  const minerImage = minerInfo?.image
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

  const identifierChips: Array<{
    label: string;
    value: string;
    href?: string;
  }> = [
    {
      label: "Task",
      value: taskData.taskId,
    },
    {
      label: "Agent Run",
      value: agentRunLinkId || "—",
      href: agentRunLinkId
        ? `${routes.agent_run}/${agentRunLinkId}`
        : undefined,
    },
    {
      label: "Evaluation",
      value: evaluationInfo?.evaluationId || "—",
    },
  ];

  const primaryCards: StatCardConfig[] = [
    {
      label: "Score",
      value: evaluationScore,
      Icon: PiChartBar,
      gradient: "",
      iconWrapper: "bg-emerald-500/15 text-emerald-300",
      description: "Final evaluation score recorded for this task.",
    },
    {
      label: "Duration",
      value: evaluationDuration,
      Icon: PiTimer,
      gradient: "",
      iconWrapper: "bg-blue-500/15 text-blue-300",
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

  return (
    <div className="mb-6 space-y-5">
      {/* Context Cards */}
      {relationships ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ContextCard
            title="Round"
            Icon={PiClockCountdown}
            header={
              <div className="flex items-center gap-3 mb-4">
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
            header={
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/30 shadow-md">
                  <Image
                    src={validatorImage || "/placeholder.svg"}
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
            header={
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/30 shadow-md">
                  <Image
                    src={minerImage || "/placeholder.svg"}
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
      ) : null}

      {/* Primary Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {primaryCards.map((card, idx) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/30 bg-slate-800/30 px-5 py-4 shadow-xl backdrop-blur-sm">
        {identifierChips.map((chip) =>
          chip.href ? (
            <Link
              key={chip.label}
              href={chip.href}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-slate-700/40 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-200 transition-colors hover:border-sky-400/60 hover:bg-sky-500/10"
            >
              <span className="text-slate-400">{chip.label}</span>
              <span className="font-mono text-white">
                {truncateMiddle(chip.value, 8)}
              </span>
              <CopyButton text={chip.value} />
            </Link>
          ) : (
            <span
              key={chip.label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-700/40 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-200"
            >
              <span className="text-slate-400">{chip.label}</span>
              <span className="font-mono text-white/90">
                {truncateMiddle(chip.value, 8)}
              </span>
              <CopyButton text={chip.value} />
            </span>
          )
        )}
      </div>

      <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm">
        <header className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
            <PiFileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Task Prompt
            </p>
          </div>
        </header>
        <div className="rounded-lg border border-slate-700/20 bg-slate-800/20 px-3 py-2 text-sm leading-relaxed text-slate-300">
          {taskData.prompt || "Prompt not provided for this task."}
        </div>
      </section>
    </div>
  );
}
