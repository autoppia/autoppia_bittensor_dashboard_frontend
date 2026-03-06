"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Text } from "rizzui";
import type { IconType } from "react-icons";
import {
  PiChartBar,
  PiClock,
  PiClockCountdown,
  PiFileText,
  PiGauge,
  PiGlobe,
  PiIdentificationCard,
  PiLinkSimple,
  PiPlay,
  PiShieldCheck,
  PiTarget,
  PiTimer,
  PiUserCircle,
} from "react-icons/pi";
import { routes } from "@/config/routes";
import { useTask } from "@/services/hooks/useTask";

type StatCardConfig = {
  label: string;
  value: ReactNode;
  Icon: IconType;
  gradient: string;
  iconWrapper: string;
  iconColorClass?: string;
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

const formatPercent = (value?: number) => {
  if (typeof value !== "number") return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const formatDuration = (value?: number) => {
  if (typeof value !== "number") return "—";
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
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
  // For very small values (like stake), automatically use more decimal places
  if (value > 0 && value < 0.01 && digits === 2) {
    return value.toFixed(8);
  }
  return value.toFixed(digits);
};

const formatCost = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }
  return `$${value.toFixed(4)}`;
};

const formatTokens = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toLocaleString();
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

function QuickInfoTile({
  label,
  value,
  subValue,
  href,
  Icon,
  valueClassName,
  accentBarClass,
  iconWrapperClass,
  iconColorClass,
}: QuickInfoItem) {
  const baseClass = "mt-1 block text-sm font-semibold";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#2d3452]/70 bg-[#11162a]/95 p-4 text-slate-100 shadow-[0_14px_34px_rgba(5,8,20,0.65)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6b7cdf]/60">
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 ${accentBarClass}`}
      />
      <div className="relative flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconWrapperClass} shadow-inner transition-all duration-300 group-hover:scale-105`}
        >
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div className="flex-1">
          <span className="text-[11px] uppercase tracking-wide text-slate-200/80">
            {label}
          </span>
          {href ? (
            <Link
              href={href}
              className={`${baseClass} text-sky-200 transition-colors duration-200 hover:text-white ${valueClassName ?? ""}`}
            >
              {value}
            </Link>
          ) : (
            <span
              className={`${baseClass} text-white/90 ${valueClassName ?? ""}`}
            >
              {value}
            </span>
          )}
          {subValue ? (
            <span className="mt-0.5 block text-xs text-slate-200/70">
              {subValue}
            </span>
          ) : null}
        </div>
      </div>
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
    <div className="group relative overflow-hidden rounded-2xl border border-[#2d3452]/70 bg-[#0f1424]/95 p-5 text-slate-100 shadow-[0_20px_44px_rgba(4,8,20,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6b7cdf]/60">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`}
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#4b5ab5]/40 bg-[#1a2140]/85 text-sky-100 shadow-inner transition-colors duration-300 group-hover:border-[#8da0ff]/50 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-wide text-slate-200/80">
            {title}
          </span>
        </div>
        <div className="space-y-2 text-sm text-slate-100/85">{children}</div>
      </div>
    </div>
  );
}

const getStatusStyles = (status?: string) => {
  const base = {
    gradient: "from-slate-500/20 via-slate-600/10 to-transparent",
    iconWrapper: "border-slate-600/40 bg-slate-800/55",
    valueClassName: "text-slate-100",
    iconColorClass: "text-slate-200",
  };

  if (!status) {
    return base;
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("success") || normalized.includes("complete")) {
    return {
      gradient: "from-emerald-500/25 via-emerald-400/10 to-transparent",
      iconWrapper: "border-emerald-400/45 bg-emerald-500/20",
      valueClassName: "text-emerald-100",
      iconColorClass: "text-emerald-200",
    };
  }

  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient: "from-sky-500/25 via-cyan-400/10 to-transparent",
      iconWrapper: "border-sky-400/45 bg-sky-500/20",
      valueClassName: "text-sky-100",
      iconColorClass: "text-sky-200",
    };
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient: "from-rose-500/25 via-orange-400/10 to-transparent",
      iconWrapper: "border-rose-400/45 bg-rose-500/20",
      valueClassName: "text-rose-100",
      iconColorClass: "text-rose-200",
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
  iconColorClass,
  description,
  valueClassName,
}: StatCardConfig) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#2d3452]/70 bg-[#0f1423]/95 text-slate-100 shadow-[0_18px_44px_rgba(4,8,20,0.68)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6b7cdf]/60">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-55`}
      />
      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-slate-200/75">
              {label}
            </span>
            <div
              className={`mt-2 text-2xl font-semibold text-white ${valueClassName ?? ""}`}
            >
              {value}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10 ${iconWrapper}`}
          >
            <Icon className={`h-6 w-6 ${iconColorClass ?? "text-white"}`} />
          </div>
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-slate-200/75">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function TaskDetails() {
  const { id } = useParams();

  const { data, isLoading, error } = useTask(id as string, {
    includeDetails: true,
    includePersonas: false,
    includeResults: false,
    includeStatistics: false,
  });

  const taskData = data?.details;

  if (isLoading) {
    return (
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-950/60 p-6 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.8)]">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-indigo-500/10 opacity-80" />
        <div className="relative grid gap-6 animate-pulse lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="h-4 w-40 rounded-full bg-slate-800/70" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`task-loading-info-${index}`}
                  className="h-24 rounded-2xl border border-slate-800/70 bg-slate-900/60"
                />
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`task-loading-primary-${index}`}
                  className="h-32 rounded-2xl border border-slate-800/70 bg-slate-900/60"
                />
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`task-loading-meta-${index}`}
                  className="h-28 rounded-2xl border border-slate-800/70 bg-slate-900/60"
                />
              ))}
            </div>
            <div className="h-32 rounded-2xl border border-slate-800/70 bg-slate-900/60" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`task-loading-context-${index}`}
                className="h-36 rounded-2xl border border-slate-800/70 bg-slate-900/60"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="mb-6 rounded-3xl border border-rose-400/40 bg-rose-500/10 p-6 backdrop-blur">
        <div className="text-center">
          <div className="text-lg font-semibold text-rose-200">
            Failed to Load Task Data
          </div>
          <div className="mt-1 text-sm text-rose-100/80">
            {error || "Task not found"}
          </div>
        </div>
      </div>
    );
  }

  const statusStyles = getStatusStyles(taskData.status);
  const relationships = taskData.relationships;
  const roundInfo = relationships?.round;
  const validatorInfo = relationships?.validator;
  const minerInfo = relationships?.miner;
  const agentRunInfo = relationships?.agentRun;
  const evaluationInfo = relationships?.evaluation;
  const solutionInfo = relationships?.solution;
  const evaluationStyles = getStatusStyles(
    evaluationInfo?.status ?? taskData.status
  );
  const evaluationScore = evaluationInfo
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
  const agentRunLinkId = agentRunInfo?.agentRunId ?? taskData.agentRunId ?? "";
  const statusLabel = formatLabel(taskData.status);

  const quickInfoItems: QuickInfoItem[] = [
    {
      label: "Round",
      value:
        roundInfo?.roundNumber != null
          ? `#${roundInfo.roundNumber}`
          : roundInfo?.validatorRoundId
            ? truncateMiddle(roundInfo.validatorRoundId, 6)
            : "—",
      subValue: roundInfo?.status ? formatLabel(roundInfo.status) : undefined,
      href: ((): string | undefined => {
        const key =
          roundInfo?.roundNumber != null
            ? `round_${roundInfo.roundNumber}`
            : roundInfo?.validatorRoundId;
        return key ? `${routes.rounds}/${encodeURIComponent(key)}` : undefined;
      })(),
      Icon: PiClockCountdown,
      valueClassName: "font-mono text-base tracking-tight",
      accentBarClass:
        "bg-gradient-to-r from-amber-400/90 via-amber-500/60 to-transparent",
      iconWrapperClass: "border-amber-400/45 bg-[#2c2014]/80",
      iconColorClass: "text-amber-200",
    },
    {
      label: "Validator",
      value: validatorInfo?.name ?? truncateMiddle(validatorInfo?.hotkey),
      subValue: validatorInfo?.hotkey
        ? truncateMiddle(validatorInfo.hotkey)
        : undefined,
      Icon: PiShieldCheck,
      valueClassName: "text-base text-white",
      accentBarClass:
        "bg-gradient-to-r from-emerald-400/90 via-teal-500/60 to-transparent",
      iconWrapperClass: "border-emerald-400/45 bg-[#132820]/80",
      iconColorClass: "text-emerald-200",
    },
    {
      label: minerInfo?.isSota ? "SOTA Agent" : "Miner",
      value: minerInfo?.name ?? "—",
      subValue: minerInfo?.hotkey
        ? truncateMiddle(minerInfo.hotkey)
        : undefined,
      Icon: PiUserCircle,
      valueClassName: "text-base text-white",
      accentBarClass:
        "bg-gradient-to-r from-fuchsia-400/90 via-purple-500/60 to-transparent",
      iconWrapperClass: "border-fuchsia-400/45 bg-[#251632]/80",
      iconColorClass: "text-fuchsia-200",
    },
    {
      label: "Agent Run",
      value: truncateMiddle(agentRunLinkId, 6),
      subValue: agentRunInfo
        ? `${agentRunDuration} • ${agentRunInfo.taskCount ?? "—"} tasks`
        : agentRunDuration,
      href: agentRunLinkId
        ? `${routes.agent_run}/${agentRunLinkId}`
        : undefined,
      Icon: PiPlay,
      valueClassName: "font-mono text-base tracking-tight",
      accentBarClass:
        "bg-gradient-to-r from-sky-400/90 via-blue-500/60 to-transparent",
      iconWrapperClass: "border-sky-400/45 bg-[#14263a]/80",
      iconColorClass: "text-sky-200",
    },
    {
      label: "Evaluation",
      value: evaluationInfo?.evaluationId
        ? truncateMiddle(evaluationInfo.evaluationId, 6)
        : "—",
      subValue: evaluationInfo ? evaluationStatusLabel : undefined,
      Icon: PiIdentificationCard,
      valueClassName: "font-mono text-base tracking-tight",
      accentBarClass:
        "bg-gradient-to-r from-rose-400/90 via-amber-500/60 to-transparent",
      iconWrapperClass: "border-rose-400/45 bg-[#2a1b22]/80",
      iconColorClass: "text-rose-200",
    },
  ];

  const primaryCards: StatCardConfig[] = [
    {
      label: "Score",
      value: evaluationScore,
      Icon: PiChartBar,
      gradient: "from-emerald-500/18 via-emerald-400/8 to-transparent",
      iconWrapper: "border-emerald-400/40 bg-[#1a2f24]/80",
      iconColorClass: "text-emerald-200",
      description: evaluationInfo
        ? "Final evaluation issued by the validator for this task."
        : "Awaiting validator scoring for this task.",
      valueClassName: "text-emerald-100",
    },
    {
      label: "Status",
      value: statusLabel,
      Icon: PiGauge,
      gradient: statusStyles.gradient,
      iconWrapper: statusStyles.iconWrapper,
      iconColorClass: statusStyles.iconColorClass,
      description: "Live state of the agent execution and scoring pipeline.",
      valueClassName: statusStyles.valueClassName,
    },
    {
      label: "Duration",
      value: evaluationDuration,
      Icon: PiTimer,
      gradient: "from-indigo-500/18 via-indigo-400/8 to-transparent",
      iconWrapper: "border-indigo-400/40 bg-[#1a1f3a]/80",
      iconColorClass: "text-indigo-200",
      description: evaluationInfo
        ? "Measured evaluation time recorded by the validator."
        : "Elapsed time based on action execution.",
      valueClassName: "text-indigo-100",
    },
  ];

  const metaCards: StatCardConfig[] = [
    {
      label: "Website",
      value: formatLabel(taskData.website),
      Icon: PiGlobe,
      gradient: "from-sky-500/18 via-sky-400/8 to-transparent",
      iconWrapper: "border-sky-400/40 bg-[#14293b]/80",
      iconColorClass: "text-sky-200",
    },
    {
      label: "Use Case",
      value: formatLabel(taskData.useCase),
      Icon: PiTarget,
      gradient: "from-emerald-500/18 via-teal-400/8 to-transparent",
      iconWrapper: "border-emerald-400/40 bg-[#162b24]/80",
      iconColorClass: "text-emerald-200",
    },
    {
      label: "Success Rate",
      value: formatPercent(taskData.successRate),
      Icon: PiGauge,
      gradient: "from-lime-500/18 via-emerald-400/8 to-transparent",
      iconWrapper: "border-lime-400/40 bg-[#1c2f1b]/80",
      iconColorClass: "text-lime-200",
    },
  ];

  const timelineCards: StatCardConfig[] = [
    {
      label: "Started",
      value: formatDateTime(taskData.startTime),
      Icon: PiClock,
      gradient: "from-sky-500/18 via-slate-400/8 to-transparent",
      iconWrapper: "border-sky-400/40 bg-[#162738]/80",
      iconColorClass: "text-sky-200",
    },
    {
      label: "Finished",
      value: formatDateTime(taskData.endTime ?? taskData.updatedAt),
      Icon: PiClock,
      gradient: "from-indigo-500/18 via-slate-400/8 to-transparent",
      iconWrapper: "border-indigo-400/40 bg-[#1a2136]/80",
      iconColorClass: "text-indigo-200",
    },
  ];

  return (
    <div className="relative mb-10 overflow-hidden rounded-[28px] border border-[#262d49]/70 bg-[#04070f] shadow-[0_26px_80px_rgba(3,7,18,0.82)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f1a]/98 via-[#05070e]/96 to-[#020409]/96 opacity-95" />
      <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:py-8">
        <div className="space-y-8 lg:col-span-8">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aaeff]/70">
              Task Snapshot
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/80">
              <span
                className={`inline-flex items-center rounded-full border border-[#37406a]/55 bg-[#11182c]/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles.valueClassName ?? ""}`}
              >
                {statusLabel}
              </span>
              <span>Started {formatDateTime(taskData.startTime)}</span>
              <span className="opacity-50">•</span>
              <span>
                Updated {formatDateTime(taskData.updatedAt ?? taskData.endTime)}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickInfoItems.map((item) => (
              <QuickInfoTile key={item.label} {...item} />
            ))}
          </div>

          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#9aaeff]/70">
              Performance Metrics
            </span>
            <div className="grid gap-4 md:grid-cols-3">
              {primaryCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#9aaeff]/70">
              <b> Task Context</b>
            </span>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metaCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#9aaeff]/70">
              Timeline
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              {timelineCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#343d63]/55 bg-[#0b101d]/95 p-5 text-slate-100 shadow-[0_16px_44px_rgba(4,8,20,0.6)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/14 via-transparent to-emerald-500/12 opacity-60" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/45 bg-[#231b3b]/85 text-violet-200 shadow-inner">
                <PiFileText className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-2">
                <Text className="text-lg font-medium text-white">
                  Task Prompt
                </Text>
                <div className="rounded-xl border border-[#3a4266]/60 bg-[#070b15]/90 px-4 py-3 shadow-inner">
                  <Text className="font-mono text-sm leading-relaxed text-slate-100/85">
                    {taskData.prompt || "Prompt not provided for this task."}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aaeff]/70">
            Relationships
          </span>
          {relationships ? (
            <div className="space-y-4">
              <ContextCard
                title="Round"
                Icon={PiClockCountdown}
                gradient="from-sky-500/22 via-sky-400/8 to-transparent"
              >
                <div>
                  <div className="text-lg font-semibold text-white">
                    #
                    {roundInfo?.roundNumber ??
                      roundInfo?.validatorRoundId ??
                      "—"}
                  </div>
                  <div className="mt-1 inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                    {formatLabel(roundInfo?.status)}
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <InfoRow
                    label="Started"
                    value={formatDateTime(roundInfo?.startedAt)}
                  />
	                  <InfoRow
	                    label="Ended"
	                    value={formatDateTime(roundInfo?.endedAt ?? undefined)}
	                  />
                  <InfoRow
                    label="Epoch"
                    value={
                      roundInfo?.startEpoch !== undefined &&
                      roundInfo?.startEpoch !== null
                        ? `${roundInfo.startEpoch} → ${
                            roundInfo?.endEpoch ??
                            (roundInfo?.status &&
                            String(roundInfo.status).toLowerCase() === "active"
                              ? "Active"
                              : "—")
                          }`
                        : "—"
                    }
                  />
                </div>
              </ContextCard>

              <ContextCard
                title="Validator"
                Icon={PiShieldCheck}
                gradient="from-emerald-500/22 via-emerald-400/8 to-transparent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold text-white line-clamp-1">
                    {validatorInfo?.name ||
                      truncateMiddle(validatorInfo?.hotkey)}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    UID {validatorInfo?.uid ?? "—"}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <InfoRow
                    label="Hotkey"
                    value={truncateMiddle(validatorInfo?.hotkey)}
                    valueClassName="font-mono text-xs"
                  />
                  <InfoRow
                    label="Stake"
                    value={
                      validatorInfo?.stake !== undefined &&
                      validatorInfo?.stake !== null
                        ? `${formatNumber(validatorInfo.stake)} TAO`
                        : "—"
                    }
                  />
                  <InfoRow
                    label="vTrust"
                    value={
                      validatorInfo?.vtrust !== undefined &&
                      validatorInfo?.vtrust !== null
                        ? formatNumber(validatorInfo.vtrust)
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Version"
                    value={validatorInfo?.version ?? "—"}
                  />
                </div>
              </ContextCard>

              <ContextCard
                title={minerInfo?.isSota ? "SOTA Agent" : "Miner"}
                Icon={PiUserCircle}
                gradient="from-fuchsia-500/22 via-purple-400/8 to-transparent"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-white line-clamp-1">
                    {minerInfo?.name ?? "—"}
                  </span>
                  {minerInfo?.isSota ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      SOTA
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1.5 pt-2">
                  <InfoRow label="UID" value={minerInfo?.uid ?? "—"} />
                  <InfoRow
                    label="Hotkey"
                    value={truncateMiddle(minerInfo?.hotkey)}
                  />
                  <InfoRow
                    label="Provider"
                    value={minerInfo?.provider ?? "—"}
                  />
                  <InfoRow
                    label="GitHub"
                    value={
                      minerInfo?.github ? (
                        <a
                          href={minerInfo.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-end gap-1 text-emerald-200 transition-colors duration-200 hover:text-emerald-100"
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

              <ContextCard
                title="Agent Run"
                Icon={PiPlay}
                gradient="from-indigo-500/22 via-indigo-400/8 to-transparent"
              >
                <div className="flex items-center justify-between gap-2">
                  {agentRunLinkId ? (
                    <Link
                      href={`${routes.agent_run}/${agentRunLinkId}`}
                      className="font-mono text-sm text-white/90 transition-colors duration-200 hover:text-white"
                    >
                      {truncateMiddle(agentRunLinkId, 6)}
                    </Link>
                  ) : (
                    <span className="font-mono text-sm text-white/80">—</span>
                  )}
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    {agentRunInfo?.isSota ? "SOTA" : "Miner"}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <InfoRow label="Duration" value={agentRunDuration} />
                  <InfoRow
                    label="Tasks"
                    value={agentRunInfo?.taskCount ?? "—"}
                  />
                  <InfoRow
                    label="Finished"
                    value={agentRunInfo?.completedTasks ?? "—"}
                  />
                  <InfoRow
                    label="Failed"
                    value={agentRunInfo?.failedTasks ?? "—"}
                  />
                  <InfoRow label="Avg Score" value={agentRunAverageScore} />
                </div>
              </ContextCard>

              <ContextCard
                title="Evaluation"
                Icon={PiChartBar}
                gradient="from-amber-500/22 via-amber-400/8 to-transparent"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-white">
                    {evaluationScore}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${evaluationStyles.valueClassName ?? ""}`}
                  >
                    {evaluationStatusLabel}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <InfoRow
                    label="Evaluation ID"
                    value={truncateMiddle(evaluationInfo?.evaluationId)}
                    valueClassName="font-mono text-xs text-white/80"
                  />
                  <InfoRow label="Duration" value={evaluationDuration} />
                  <InfoRow
                    label="Web Agent"
                    value={
                      evaluationInfo?.webAgentId ??
                      solutionInfo?.webAgentId ??
                      "—"
                    }
                  />
                  <InfoRow label="Artifacts" value={artifactSummary} />
                  <InfoRow
                    label="Solution"
                    value={solutionSummary}
                    valueClassName="text-white/80"
                  />
                  {/* LLM Usage Tracking */}
                  {evaluationInfo?.llmProvider && (
                    <>
                      <div className="pt-2 border-t border-white/10" />
                      <InfoRow
                        label="LLM Provider"
                        value={evaluationInfo.llmProvider.toUpperCase()}
                        valueClassName="font-semibold text-sky-200"
                      />
                      {evaluationInfo.llmCost != null && (
                        <InfoRow
                          label="LLM Cost"
                          value={formatCost(evaluationInfo.llmCost)}
                          valueClassName="font-semibold text-emerald-200"
                        />
                      )}
                      {evaluationInfo.llmTokens != null && (
                        <InfoRow
                          label="LLM Tokens"
                          value={formatTokens(evaluationInfo.llmTokens)}
                          valueClassName="font-semibold text-amber-200"
                        />
                      )}
                    </>
                  )}
                </div>
              </ContextCard>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/45 bg-slate-900/60 p-5 text-sm text-white/70">
              Relationship data not available for this task.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
