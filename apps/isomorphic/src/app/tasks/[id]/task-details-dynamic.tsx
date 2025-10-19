"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { Text } from "rizzui";
import type { IconType } from "react-icons";
import {
  PiChartBar,
  PiClockCountdown,
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
      <span className="text-slate-400">{label}</span>
      <span
        className={`flex-1 text-right text-white/90 font-medium leading-snug ${valueClassName ?? ""}`}
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5 shadow-[0_12px_32px_rgba(7,12,28,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-500/40">
      <div className={`pointer-events-none absolute inset-0 ${gradient}`} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60 text-white shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.28em] text-slate-300">
            {title}
          </span>
        </div>
        <div className="space-y-2 text-sm text-white/80">{children}</div>
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/60 shadow-[0_14px_32px_rgba(7,12,28,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-500/40">
      <div className={`pointer-events-none absolute inset-0 ${gradient}`} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {label}
            </span>
            <div
              className={`mt-2 text-2xl font-semibold text-white ${valueClassName ?? ""}`}
            >
              {value}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/60 ${iconWrapper}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-slate-300">{description}</p>
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
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/65 via-slate-900/45 to-slate-900/25" />
        <div className="relative">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-primary-${idx}`}
                className="animate-pulse rounded-2xl border border-slate-800/50 bg-slate-900/50 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-3 w-20 rounded-full bg-white/20" />
                    <div className="h-6 w-24 rounded-full bg-white/30" />
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/10" />
                </div>
                <div className="mt-4 h-3 w-28 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`task-loading-secondary-${idx}`}
                className="animate-pulse rounded-2xl border border-slate-800/50 bg-slate-900/50 p-5"
              >
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded-full bg-white/20" />
                  <div className="h-6 w-20 rounded-full bg-white/30" />
                </div>
                <div className="mt-4 h-3 w-24 rounded-full bg-white/15" />
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
    href?: string;
  }> = [
    {
      label: "Task",
      value: truncateMiddle(taskData.taskId, 8),
    },
    {
      label: "Agent Run",
      value: agentRunLinkId ? truncateMiddle(agentRunLinkId, 8) : "—",
      href: agentRunLinkId ? `/agent-run/${agentRunLinkId}` : undefined,
    },
    {
      label: "Evaluation",
      value: evaluationInfo?.evaluationId
        ? truncateMiddle(evaluationInfo.evaluationId, 8)
        : "—",
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
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/75 shadow-[0_20px_48px_rgba(7,12,28,0.45)] transition-all duration-500 hover:border-slate-500/40 hover:shadow-[0_24px_56px_rgba(8,14,30,0.52)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/45 to-slate-900/25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_55%)]" />
      <div className="relative space-y-6 px-6 pb-6 pt-4 md:px-9 md:pb-9 md:pt-7">
        {relationships ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContextCard
                title="Round"
                Icon={PiClockCountdown}
                gradient="bg-gradient-to-br from-emerald-500/12 via-slate-900/55 to-slate-950/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      #{roundInfo?.roundNumber ?? roundInfo?.validatorRoundId ?? "—"}
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                      {formatLabel(roundInfo?.status)}
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 shadow-inner">
                    <PiClockCountdown className="h-5 w-5" />
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
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/60">
                    <Image
                      src={validatorImage}
                      alt={validatorInfo?.name || "Validator"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {validatorInfo?.name || truncateMiddle(validatorInfo?.hotkey)}
                    </p>
                    <p className="text-[11px] text-slate-400">
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
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/60">
                    <Image
                      src={minerImage}
                      alt={minerInfo?.name ?? "Miner"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {minerInfo?.name ?? "—"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {minerInfo?.isSota ? "SOTA Agent" : "Miner"} • UID {minerInfo?.uid ?? "—"}
                    </p>
                  </div>
                  {minerInfo?.isSota ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      SOTA
                    </span>
                  ) : null}
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
                          className="inline-flex items-center justify-end gap-1 text-emerald-200 hover:text-emerald-100"
                        >
                          <PiLinkSimple className="h-3 w-3" />
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

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 shadow-[0_12px_28px_rgba(7,12,28,0.35)]">
          {identifierChips.map((chip) =>
            chip.href ? (
              <Link
                key={chip.label}
                href={chip.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 shadow-sm transition-colors duration-200 hover:border-slate-500/40 hover:text-white"
              >
                <span className="text-slate-400">{chip.label}</span>
                <span className="font-mono text-white">{chip.value}</span>
              </Link>
            ) : (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 shadow-sm"
              >
                <span className="text-slate-400">{chip.label}</span>
                <span className="font-mono text-white/90">{chip.value}</span>
              </span>
            )
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {primaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5 shadow-[inset_0_0_30px_rgba(7,12,28,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/55 via-slate-900/40 to-slate-900/25 opacity-90" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60">
              <PiFileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <Text className="text-lg font-medium text-white">
                Task Prompt
              </Text>
              <Text className="text-sm leading-relaxed text-white/80">
                {taskData.prompt || "Prompt not provided for this task."}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
