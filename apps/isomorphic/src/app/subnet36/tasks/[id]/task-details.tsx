"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Text } from "rizzui";
import { routes } from "@/config/routes";
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
import { useTask } from "@/services/hooks/useTask";

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
      <span className="text-white/60">{label}</span>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-wide text-white/70">{title}</span>
        </div>
        <div className="space-y-2 text-sm text-white/80">{children}</div>
      </div>
    </div>
  );
}

const getStatusStyles = (status?: string) => {
  const base = {
    gradient: "from-gray-500/10 via-gray-500/10 to-gray-500/20",
    iconWrapper: "bg-gray-500/20 border-gray-500/30",
    valueClassName: "text-gray-100",
  };

  if (!status) {
    return base;
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("success") || normalized.includes("complete")) {
    return {
      gradient: "from-emerald-500/20 via-emerald-500/10 to-emerald-400/20",
      iconWrapper: "bg-emerald-500/25 border-emerald-400/40",
      valueClassName: "text-emerald-100",
    };
  }

  if (normalized.includes("running") || normalized.includes("pending")) {
    return {
      gradient: "from-blue-500/20 via-blue-500/10 to-cyan-400/20",
      iconWrapper: "bg-blue-500/25 border-blue-400/40",
      valueClassName: "text-blue-100",
    };
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      gradient: "from-red-500/20 via-red-500/10 to-orange-500/20",
      iconWrapper: "bg-red-500/25 border-red-400/40",
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-white/60">
              {label}
            </span>
            <div
              className={`mt-2 text-2xl font-semibold text-white ${valueClassName ?? ""}`}
            >
              {value}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${iconWrapper}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-white/70">{description}</p>
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

  const taskData = data.details;

  if (isLoading) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`task-loading-primary-${idx}`}
                className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-5"
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
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`task-loading-meta-${idx}`}
                className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-12 rounded-full bg-white/20" />
                    <div className="h-4 w-full rounded-full bg-white/25" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 animate-pulse rounded-2xl border border-white/5 bg-white/5 p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-32 rounded-full bg-white/20" />
                <div className="h-4 w-full rounded-full bg-white/25" />
                <div className="h-4 w-5/6 rounded-full bg-white/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="mb-6 rounded-3xl border border-red-400/40 bg-red-500/10 p-6 backdrop-blur">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-200">
            Failed to Load Task Data
          </div>
          <div className="mt-1 text-sm text-red-100/80">
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
  const evaluationStyles = getStatusStyles(evaluationInfo?.status ?? taskData.status);
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
    typeof agentRunInfo?.averageScore === "number" ? formatPercent(agentRunInfo.averageScore) : "—";
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
  const quickInfoItems = [
    {
      label: "Round",
      value:
        roundInfo?.roundNumber != null
          ? `#${roundInfo.roundNumber}`
          : roundInfo?.validatorRoundId
          ? truncateMiddle(roundInfo.validatorRoundId, 6)
          : "—",
      href: ((): string | undefined => {
        const key =
          roundInfo?.roundNumber != null
            ? `round_${roundInfo.roundNumber}`
            : roundInfo?.validatorRoundId;
        return key ? `${routes.rounds}/${encodeURIComponent(key)}` : undefined;
      })(),
    },
    {
      label: "Validator",
      value: validatorInfo?.name ?? truncateMiddle(validatorInfo?.hotkey),
      subValue: validatorInfo?.hotkey ? truncateMiddle(validatorInfo.hotkey) : undefined,
    },
    {
      label: minerInfo?.isSota ? "SOTA Agent" : "Miner",
      value: minerInfo?.name ?? "—",
      subValue: minerInfo?.hotkey ? truncateMiddle(minerInfo.hotkey) : undefined,
    },
    {
      label: "Evaluation",
      value: evaluationInfo?.evaluationId
        ? truncateMiddle(evaluationInfo.evaluationId, 6)
        : "—",
    },
  ];

  const primaryCards: StatCardConfig[] = [
    {
      label: "Score",
      value: evaluationScore,
      Icon: PiChartBar,
      gradient: "from-emerald-500/20 via-emerald-500/10 to-emerald-400/20",
      iconWrapper: "bg-emerald-500/30 border-emerald-400/40",
      description: evaluationInfo
        ? "Final evaluation issued by the validator for this task."
        : "Awaiting validator scoring for this task.",
      valueClassName: "text-emerald-100",
    },
    {
      label: "Status",
      value: formatLabel(taskData.status),
      Icon: PiGauge,
      gradient: statusStyles.gradient,
      iconWrapper: statusStyles.iconWrapper,
      description: "Live state of the agent execution and scoring pipeline.",
      valueClassName: statusStyles.valueClassName,
    },
    {
      label: "Duration",
      value: evaluationDuration,
      Icon: PiTimer,
      gradient: "from-purple-500/20 via-purple-500/10 to-indigo-400/20",
      iconWrapper: "bg-purple-500/30 border-purple-400/40",
      description: evaluationInfo
        ? "Measured evaluation time recorded by the validator."
        : "Elapsed time based on action execution.",
      valueClassName: "text-purple-100",
    },
  ];

  const secondaryCards: StatCardConfig[] = [
    {
      label: "Website",
      value: formatLabel(taskData.website),
      Icon: PiGlobe,
      gradient: "from-blue-500/15 via-blue-500/10 to-indigo-500/20",
      iconWrapper: "bg-blue-500/25 border-blue-400/40",
    },
    {
      label: "Use Case",
      value: formatLabel(taskData.useCase),
      Icon: PiTarget,
      gradient: "from-cyan-500/15 via-cyan-500/10 to-emerald-500/20",
      iconWrapper: "bg-cyan-500/25 border-cyan-400/40",
    },
    {
      label: "Success Rate",
      value: formatPercent(taskData.successRate),
      Icon: PiGauge,
      gradient: "from-emerald-500/15 via-emerald-500/10 to-green-500/20",
      iconWrapper: "bg-emerald-500/25 border-emerald-400/40",
    },
    {
      label: "Agent Run",
      value: truncateMiddle(agentRunLinkId, 6),
      Icon: PiPlay,
      gradient: "from-purple-500/15 via-purple-500/10 to-pink-500/20",
      iconWrapper: "bg-purple-500/25 border-purple-400/40",
      valueClassName: "text-purple-50 font-mono text-base",
      description: (
        <>
          <span className="block text-xs text-white/60">
            {agentRunDuration} • {agentRunInfo?.taskCount ?? "—"} tasks • Avg {agentRunAverageScore}
          </span>
          <Link
            href={`${routes.agent_run}/${agentRunLinkId}`}
            className="mt-1 inline-flex items-center gap-1 text-xs text-purple-100 transition-colors duration-200 hover:text-white"
          >
            View agent run
            <PiPlay className="h-3 w-3" />
          </Link>
        </>
      ),
    },
    {
      label: "Evaluation ID",
      value: truncateMiddle(evaluationInfo?.evaluationId ?? undefined, 6),
      Icon: PiIdentificationCard,
      gradient: "from-amber-500/15 via-amber-500/10 to-orange-500/20",
      iconWrapper: "bg-amber-500/25 border-amber-400/40",
      valueClassName: "text-amber-50 font-mono text-base",
      description: evaluationInfo ? (
        <span className="text-xs text-white/60">
          {evaluationDuration} • {artifactSummary}
        </span>
      ) : (
        <span className="text-xs text-white/60">Awaiting validator evaluation.</span>
      ),
    },
  ];

  const timelineCards: StatCardConfig[] = [
    {
      label: "Started",
      value: formatDateTime(taskData.startTime),
      Icon: PiClock,
      gradient: "from-blue-500/15 via-blue-500/5 to-blue-500/15",
      iconWrapper: "bg-blue-500/25 border-blue-400/40",
    },
    {
      label: "Finished",
      value: formatDateTime(taskData.endTime ?? taskData.updatedAt),
      Icon: PiClock,
      gradient: "from-indigo-500/15 via-indigo-500/5 to-indigo-500/15",
      iconWrapper: "bg-indigo-500/25 border-indigo-400/40",
    },
  ];

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 opacity-90" />
      <div className="relative space-y-6 px-6 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6">
        {relationships ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContextCard
                title="Round"
                Icon={PiClockCountdown}
                gradient="from-emerald-500/15 via-emerald-500/10 to-teal-500/20"
              >
                <div>
                  <div className="text-lg font-semibold text-white">
                    #{roundInfo?.roundNumber ?? roundInfo?.validatorRoundId ?? "—"}
                  </div>
                  <div className="mt-1 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                    {formatLabel(roundInfo?.status)}
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <InfoRow label="Started" value={formatDateTime(roundInfo?.startedAt)} />
                  <InfoRow label="Ended" value={formatDateTime(roundInfo?.endedAt)} />
                  <InfoRow
                    label="Epoch"
                    value={
                      roundInfo?.startEpoch !== undefined && roundInfo?.startEpoch !== null
                        ? `${roundInfo.startEpoch} → ${roundInfo.endEpoch ?? "—"}`
                        : "—"
                    }
                  />
                </div>
              </ContextCard>
              <ContextCard
                title="Validator"
                Icon={PiShieldCheck}
                gradient="from-blue-500/15 via-blue-500/10 to-indigo-500/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold text-white line-clamp-1">
                    {validatorInfo?.name || truncateMiddle(validatorInfo?.hotkey)}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    UID {validatorInfo?.uid ?? "—"}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
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
                gradient="from-purple-500/15 via-purple-500/10 to-pink-500/20"
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
                <div className="space-y-1.5 pt-1">
                  <InfoRow label="UID" value={minerInfo?.uid ?? "—"} />
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
            <div className="grid gap-4 md:grid-cols-2">
              <ContextCard
                title="Agent Run"
                Icon={PiPlay}
                gradient="from-cyan-500/15 via-cyan-500/10 to-sky-500/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`${routes.agent_run}/${agentRunLinkId}`}
                    className="font-mono text-sm text-white/90 transition-colors duration-200 hover:text-white"
                  >
                    {truncateMiddle(agentRunLinkId, 6)}
                  </Link>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    {agentRunInfo?.isSota ? "SOTA" : "Miner"}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <InfoRow label="Duration" value={agentRunDuration} />
                  <InfoRow label="Tasks" value={agentRunInfo?.taskCount ?? "—"} />
                  <InfoRow label="Completed" value={agentRunInfo?.completedTasks ?? "—"} />
                  <InfoRow label="Failed" value={agentRunInfo?.failedTasks ?? "—"} />
                  <InfoRow label="Avg Score" value={agentRunAverageScore} />
                </div>
              </ContextCard>
              <ContextCard
                title="Evaluation"
                Icon={PiChartBar}
                gradient="from-amber-500/15 via-amber-500/10 to-orange-500/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-white">{evaluationScore}</span>
                  <span
                    className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${evaluationStyles.valueClassName ?? ""}`}
                  >
                    {evaluationStatusLabel}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <InfoRow
                    label="Evaluation ID"
                    value={truncateMiddle(evaluationInfo?.evaluationId)}
                    valueClassName="font-mono text-xs text-white/80"
                  />
                  <InfoRow label="Duration" value={evaluationDuration} />
                  <InfoRow
                    label="Web Agent"
                    value={evaluationInfo?.webAgentId ?? solutionInfo?.webAgentId ?? "—"}
                  />
                  <InfoRow label="Artifacts" value={artifactSummary} />
                  <InfoRow label="Solution" value={solutionSummary} valueClassName="text-white/80" />
                </div>
              </ContextCard>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickInfoItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 shadow-md"
            >
              <span className="text-[11px] uppercase tracking-wide text-white/60">
                {item.label}
              </span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-1 block font-mono text-sm font-semibold text-sky-200 hover:text-sky-100"
                >
                  {item.value}
                </Link>
              ) : (
                <span className="mt-1 block font-mono text-sm font-semibold text-white">
                  {item.value}
                </span>
              )}
              {item.subValue ? (
                <span className="block text-xs text-white/60">{item.subValue}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {primaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {secondaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {timelineCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-indigo-500/10 opacity-90" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/25">
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
import { routes } from "@/config/routes";
