"use client";

import Image from "next/image";
import type { ReactNode } from "react";
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
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-white/60 font-medium">{label}</span>
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
  gradient: string;
  children: ReactNode;
};

function ContextCard({ title, Icon, gradient, children }: ContextCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/30">
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center">
          <span className="text-[11px] uppercase tracking-[0.28em] text-white font-semibold">
            {title}
          </span>
        </div>
        <div className="space-y-2 text-sm text-white/90">{children}</div>
      </div>
    </div>
  );
}

const getStatusStyles = (status?: string) => {
  const base = {
    gradient: "bg-gradient-to-br from-slate-900/50 via-slate-900/60 to-slate-950/80",
    iconWrapper: "bg-slate-900/60 border-slate-800/60",
    valueClassName: "text-slate-200",
  };

  if (!status) {
    return base;
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("success") || normalized.includes("complete")) {
    return {
      gradient: "bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-emerald-500/15 border-emerald-400/30",
      valueClassName: "text-emerald-100",
    };
  }

  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient: "bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-sky-500/15 border-sky-400/30",
      valueClassName: "text-blue-100",
    };
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient: "bg-gradient-to-br from-rose-500/12 via-slate-900/55 to-slate-950/80",
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
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/30">
      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-white/70 font-semibold">
              {label}
            </span>
            <div
              className={`mt-2 text-2xl font-bold text-white ${valueClassName ?? ""}`}
            >
              {value}
            </div>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black shadow-lg transition-all duration-300"
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-white/80">{description}</p>
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
      <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-purple-400/30 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black p-6 backdrop-blur-lg shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-primary-${idx}`}
                className="animate-pulse rounded-2xl border-2 border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/15 to-pink-500/15 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-3 w-20 rounded-full bg-white/25" />
                    <div className="h-6 w-24 rounded-full bg-white/35" />
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20" />
                </div>
                <div className="mt-4 h-3 w-28 rounded-full bg-white/20" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`task-loading-secondary-${idx}`}
                className="animate-pulse rounded-2xl border-2 border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/15 to-pink-500/15 p-5"
              >
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded-full bg-white/25" />
                  <div className="h-6 w-20 rounded-full bg-white/35" />
                </div>
                <div className="mt-4 h-3 w-24 rounded-full bg-white/20" />
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
    validatorInfo?.hotkey && validatorInfo.hotkey.length > 0
      ? resolveAssetUrl(`/validators/${validatorInfo.hotkey}.png`, validatorDefaultImage)
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
  const evaluationStatusLabel = formatLabel(evaluationInfo?.status ?? taskData.status);
  const agentRunLinkId = agentRunInfo?.agentRunId ?? taskData.agentRunId;
  const evaluationStyles = getStatusStyles(evaluationInfo?.status ?? taskData.status);

  const identifierChips: Array<{
    label: string;
    value: ReactNode;
    fullValue: string;
    href?: string;
  }> = [
    {
      label: "Task",
      value: truncateMiddle(taskData.taskId, 8),
      fullValue: taskData.taskId,
    },
    {
      label: "Agent Run",
      value: agentRunLinkId ? truncateMiddle(agentRunLinkId, 8) : "—",
      fullValue: agentRunLinkId ?? "",
      href: agentRunLinkId ? `${routes.agent_run}/${agentRunLinkId}` : undefined,
    },
    {
      label: "Evaluation",
      value: evaluationInfo?.evaluationId
        ? truncateMiddle(evaluationInfo.evaluationId, 8)
        : "—",
      fullValue: evaluationInfo?.evaluationId ?? "",
    },
  ];

  const primaryCards: StatCardConfig[] = [
    {
      label: "Score",
      value: evaluationScore,
      Icon: PiChartBar,
      gradient: "bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80",
      iconWrapper: "bg-emerald-500/15 border-emerald-400/30",
      description: "Final evaluation score recorded for this task.",
    },
    {
      label: "Duration",
      value: evaluationDuration,
      Icon: PiTimer,
      gradient: "bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80",
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
    <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-purple-400/30 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black shadow-2xl backdrop-blur-lg transition-all duration-500 hover:border-purple-400/50 hover:shadow-[0_24px_64px_rgba(168,85,247,0.25)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_60%)]" />
      <div className="relative space-y-6 px-6 pb-6 pt-4 md:px-9 md:pb-9 md:pt-7">
        <div className="grid gap-3 md:grid-cols-3">
          {identifierChips.map((chip, index) => (
            <div
              key={chip.label}
              className="group relative overflow-hidden rounded-xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300/70">
                    {chip.label}
                  </span>
                  {chip.fullValue && (
                    <div className="opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                      <CopyButton text={chip.fullValue} />
                    </div>
                  )}
                </div>
                
                {chip.href ? (
                  <Link
                    href={chip.href}
                    className="block font-mono text-sm font-bold text-white transition-colors duration-200 hover:text-purple-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">{chip.value}</span>
                      <PiLinkSimple className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </div>
                  </Link>
                ) : (
                  <div className="font-mono text-sm font-bold text-white/90">
                    <span className="truncate">{chip.value}</span>
                  </div>
                )}
                
                <div className="h-px w-full bg-gradient-to-r from-purple-400/20 via-fuchsia-400/40 to-pink-400/20" />
              </div>
            </div>
          ))}
        </div>

        {relationships ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContextCard
                title="Round"
                Icon={PiClockCountdown}
                gradient="bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-lg">
                    <PiClockCountdown className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white">
                      #{roundInfo?.roundNumber ?? roundInfo?.validatorRoundId ?? "—"}
                    </div>
                    <div className="mt-1.5 inline-flex items-center rounded-full border-2 border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
                      {formatLabel(roundInfo?.status)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 pt-3">
                  <InfoRow
                    label="Round ID"
                    value={truncateMiddle(roundInfo?.validatorRoundId, 8)}
                  />
                  <InfoRow
                    label="Epoch"
                    value={
                      roundInfo?.startEpoch !== undefined && roundInfo?.startEpoch !== null
                        ? roundInfo.startEpoch
                        : "—"
                    }
                  />
                </div>
              </ContextCard>
              <ContextCard
                title="Validator"
                Icon={PiShieldCheck}
                gradient="bg-gradient-to-br from-sky-500/12 via-slate-900/55 to-slate-950/80"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-lg">
                    <Image
                      src={validatorImage}
                      alt={validatorInfo?.name || "Validator"}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-white line-clamp-1">
                      {validatorInfo?.name || truncateMiddle(validatorInfo?.hotkey)}
                    </p>
                    <p className="text-[11px] text-white/60 font-medium mt-0.5">
                      UID {validatorInfo?.uid ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-3">
                  <InfoRow label="Hotkey" value={truncateMiddle(validatorInfo?.hotkey)} />
                  <InfoRow
                    label="Stake"
                    value={
                      validatorInfo?.stake !== undefined && validatorInfo?.stake !== null
                        ? `${formatNumber(validatorInfo.stake)} TAO`
                        : "—"
                    }
                  />
                  <InfoRow
                    label="vTrust"
                    value={
                      validatorInfo?.vtrust !== undefined && validatorInfo?.vtrust !== null
                        ? formatNumber(validatorInfo.vtrust)
                        : "—"
                    }
                  />
                  <InfoRow label="Version" value={validatorInfo?.version ?? "—"} />
                </div>
              </ContextCard>
              <ContextCard
                title={minerInfo?.isSota ? "SOTA Agent" : "Miner"}
                Icon={PiUserCircle}
                gradient="bg-gradient-to-br from-purple-500/12 via-slate-900/55 to-slate-950/80"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-lg">
                    <Image
                      src={minerImage}
                      alt={minerInfo?.name ?? "Miner"}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-lg font-bold text-white line-clamp-1 flex-1">
                        {minerInfo?.name ?? "—"}
                      </p>
                      {minerInfo?.isSota ? (
                        <span className="rounded-full border-2 border-amber-400/50 bg-amber-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-100 shadow-lg shrink-0">
                          SOTA
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-white/60 font-medium mt-0.5">
                      {minerInfo?.isSota ? "SOTA Agent" : "Miner"} • UID {minerInfo?.uid ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-3">
                  <InfoRow label="Hotkey" value={truncateMiddle(minerInfo?.hotkey)} />
                  <InfoRow label="Provider" value={minerInfo?.provider ?? "—"} />
                  <InfoRow
                    label="GitHub"
                    value={
                      minerInfo?.github ? (
                        <a
                          href={minerInfo.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-end gap-1 text-purple-300 hover:text-purple-100 font-bold transition-colors duration-200"
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

        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-purple-400/50">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-lg">
              <PiFileText className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <Text className="text-lg font-semibold text-white">
                Task Prompt
              </Text>
              <Text className="text-sm leading-relaxed text-white/90">
                {taskData.prompt || "Prompt not provided for this task."}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
