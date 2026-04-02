"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import cn from "@core/utils/class-names";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiPaperPlaneRightFill,
  PiChartLineUpFill,
  PiHourglassMediumFill,
  PiGlobe,
  PiTarget,
} from "react-icons/pi";
import { Text } from "rizzui";
import MarqueeText from "@/app/shared/marquee-text";
import { useValidators } from "@/services/hooks/useOverview";
import { resolveAssetUrl } from "@/services/utils/assets";
import { tasksRepository } from "@/repositories/tasks/tasks.repository";

const DEFAULT_TASK_MESSAGES = new Set([
  "Awaiting round start",
  "Validator connected – awaiting task upload",
  "Distributing tasks to agent runs",
  "Evaluating miner submissions",
  "Waiting for consensus",
  "No activity detected recently",
  "Round completed",
]);

const statusColorClasses: Record<string, string> = {
  "Sending Tasks": "border-sky-400/50 bg-sky-500/20 text-sky-200",
  Evaluating: "border-amber-400/50 bg-amber-500/20 text-amber-200",
  Waiting: "border-cyan-400/50 bg-cyan-500/20 text-cyan-200",
  Inactive: "border-slate-500/50 bg-slate-500/20 text-slate-300",
  Finished: "border-emerald-400/50 bg-emerald-500/20 text-emerald-200",
  Starting: "border-violet-400/50 bg-violet-500/20 text-violet-200",
  "Not Started": "border-slate-500/50 bg-slate-500/20 text-slate-400",
  Offline: "border-red-400/50 bg-red-500/20 text-red-200",
  default: "border-slate-500/50 bg-slate-500/20 text-slate-300",
};

function formatStakeValue(stake: number | null | undefined): string {
  if (stake === null || stake === undefined || Number.isNaN(stake)) {
    return "—";
  }
  const value = Number(stake);
  if (value <= 0) {
    return "0";
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export default function OverviewValidators({
  currentRound,
  currentSeason,
  className,
}: {
  currentRound?: number | null;
  currentSeason?: number | null;
  className?: string;
} = {}) {
  const {
    data: validatorsData,
    loading: validatorsLoading,
    error: validatorsError,
    refetch,
  } = useValidators({ limit: 50, sortBy: "stake", sortOrder: "desc" });

  // Fetch latest evaluation prompts per validator
  const [latestPrompts, setLatestPrompts] = useState<Record<string, string>>({});
  const promptsFetched = useRef(false);
  useEffect(() => {
    if (promptsFetched.current) return;
    promptsFetched.current = true;
    tasksRepository.searchTasks({ limit: 50, includeDetails: false }).then((res) => {
      const tasks = res.data?.tasks ?? [];
      const map: Record<string, string> = {};
      for (const t of tasks) {
        const vName = (t as any).validatorName;
        if (vName && !map[vName] && t.prompt) {
          map[vName] = t.prompt;
        }
      }
      setLatestPrompts(map);
    }).catch(() => {});
  }, []);

  // Auto-refresh validators every 20 seconds to show live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      // Also refresh prompts
      tasksRepository.searchTasks({ limit: 50, includeDetails: false }).then((res) => {
        const tasks = res.data?.tasks ?? [];
        const map: Record<string, string> = {};
        for (const t of tasks) {
          const vName = (t as any).validatorName;
          if (vName && !map[vName] && t.prompt) {
            map[vName] = t.prompt;
          }
        }
        setLatestPrompts(map);
      }).catch(() => {});
    }, 20000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Use provided currentRound to avoid duplicate API call
  const roundLoading = false; // No longer loading round separately

  // Show loading state
  if (validatorsLoading || roundLoading) {
    return (
      <div className={cn("grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2", className)}>
          {Array.from({ length: 6 }, (_, i) => `validator-skeleton-${i}`).map((skeletonId) => (
            <div
              key={skeletonId}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-muted rounded-lg p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 md:justify-around">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                    <div className="flex flex-col min-w-0">
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                    <div className="flex flex-col min-w-0">
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                    <div className="flex flex-col min-w-0">
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    );
  }

  // Show error state - only show validator error if validators actually failed
  if (validatorsError) {
    return (
      <div className={cn("bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center", className)}>
        <p className="text-red-400 font-medium">Error loading validators</p>
        <p className="text-red-300 text-sm mt-1">{validatorsError}</p>
      </div>
    );
  }

  return (
      <div className={cn("grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2", className)}>
        {(validatorsData?.data?.validators || []).map((validator, index) => {
          const iconSrc = resolveAssetUrl(
            validator.icon,
            resolveAssetUrl("/validators/Other.png")
          );
          const statusColorClass =
            statusColorClasses[validator.status] ?? statusColorClasses.default;
          const stakeMetric = formatStakeValue(validator.stake);
          const trustMetric =
            typeof validator.trust === "number"
              ? validator.trust.toFixed(2)
              : "—";
          const versionMetric = (() => {
            if (validator.version == null) return "—";
            const version = String(validator.version);
            // If it's just a number like "10", format as "10.0.0"
            if (/^\d+$/.test(version)) {
              return `${version}.0.0`;
            }
            // Otherwise return as is
            return version;
          })();
          const secondaryStats = [
            {
              title: "Stake",
              metric: stakeMetric,
              icon: PiCurrencyDollarDuotone,
              iconClassName: "bg-gradient-to-br from-yellow-500 to-amber-600",
            },
            {
              title: "VTrust",
              metric: trustMetric,
              icon: PiClockDuotone,
              iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600",
            },
            {
              title: "Version",
              metric: versionMetric,
              icon: PiHashDuotone,
              iconClassName: "bg-gradient-to-br from-purple-500 to-violet-600",
            },
          ];

          const normalizedStatus = (() => {
            switch (validator.status) {
              case "Evaluating":
                return "Evaluating";
              case "Finished":
                return "Finished";
              case "Not Started":
                return "Not Started";
              default:
                return validator.status;
            }
          })();

          const rawCurrentTask = validator.currentTask?.trim() ?? "";
          const showCurrentTask =
            rawCurrentTask.length > 0 &&
            !DEFAULT_TASK_MESSAGES.has(rawCurrentTask);

          const resolvedRoundNumber = (() => {
            if (typeof validator.roundNumber === "number") return validator.roundNumber;
            if (typeof currentRound === "number") return currentRound;
            return undefined;
          })();

          const lastSeenSeason = validator.lastSeenSeason ?? undefined;
          const lastSeenRoundInSeason = validator.lastSeenRoundInSeason ?? undefined;
          const lastSeenLabel = (() => {
            const hasSeasonAndRound = lastSeenSeason != null && (lastSeenRoundInSeason != null || resolvedRoundNumber != null);
            if (hasSeasonAndRound) {
              return `Last seen season ${lastSeenSeason}, round #${lastSeenRoundInSeason ?? resolvedRoundNumber}`;
            }
            if (resolvedRoundNumber != null) {
              return `Last seen round #${resolvedRoundNumber}`;
            }
            return "—";
          })();

          // Build validator details link using validator UID
          const validatorUid = validator.validatorUid;
          const validatorLink = validatorUid == null ? undefined : `/validator/${validatorUid}`;

          return validatorLink ? (
            <Link key={`validator-${validator.id}`} href={validatorLink}>
              <div className="group relative flex h-full min-h-[360px] sm:min-h-[420px] flex-col overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/10 dark:bg-gray-50/50 shadow-[0_18px_55px_rgba(2,6,23,0.34)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/35 cursor-pointer">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-70" />
                {/* Header - Validator Info & Status */}
                <div className="border-b border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative aspect-square w-10 h-10">
                        <Image
                          src={iconSrc}
                          alt={validator.name ?? "Validator avatar"}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className="h-full w-full rounded-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-bold text-white">
                          {validator.name ?? "—"}
                        </Text>
                        <Text className="truncate text-xs font-mono tracking-wide text-slate-400">
                          {validator.hotkey
                            ? `${validator.hotkey.slice(0, 8)}...${validator.hotkey.slice(-8)}`
                            : "No hotkey"}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">{lastSeenLabel}</span>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-100/90 shadow-[0_12px_28px_-20px_rgba(16,185,129,0.85)]">
                        <span className="uppercase tracking-[0.18em] text-emerald-100/55">
                          UID
                        </span>
                        <span className="text-white">
                          {validator.validatorUid ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-1 flex-col rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4">
                    {(() => {
                      const hasLiveMeta =
                        validator.currentWebsite || validator.currentUseCase;
                      const websiteText =
                        hasLiveMeta && validator.currentWebsite
                          ? validator.currentWebsite
                          : "__";
                      const useCaseText =
                        hasLiveMeta && validator.currentUseCase
                          ? validator.currentUseCase
                          : "__";

                      const isRoundLabel = /^round\s+\d+$/i.test(rawCurrentTask);
                      const validatorPrompt = latestPrompts[validator.name] ?? null;
                      const liveText = showCurrentTask && !isRoundLabel
                        ? validator.currentTask
                        : validatorPrompt
                          ? validatorPrompt
                          : normalizedStatus === "Finished"
                            ? "Round finished"
                            : normalizedStatus === "Waiting"
                              ? "Idle"
                              : "Preparing";

                      return (
                        <>
                          <div className="rounded-[20px] dark:bg-gray-50/30 px-3.5 py-3.5">
                            <div className="grid grid-cols-1 gap-2 border-b border-white/8 pb-3">
                              <div className="inline-flex min-w-0 items-center gap-2 rounded-full bg-fuchsia-400/[0.07] px-3 py-1.5">
                                <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-fuchsia-100/55">
                                  <PiTarget className="h-3 w-3" />
                                  <span>Use case</span>
                                </div>
                                <div className="truncate text-[12px] font-semibold text-white">
                                  {useCaseText}
                                </div>
                              </div>

                              <div className="inline-flex min-w-0 items-center gap-2 rounded-full bg-cyan-400/[0.07] px-3 py-1.5">
                                <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
                                  <PiGlobe className="h-3 w-3" />
                                  <span>Website</span>
                                </div>
                                <div className="truncate text-[12px] font-semibold text-white">
                                  {websiteText}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 rounded-[18px] bg-[linear-gradient(90deg,rgba(45,212,191,0.08),rgba(14,20,36,0.04)_28%,rgba(255,255,255,0.01))] px-4 py-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="inline-flex items-center gap-2">
                                  <span className="relative inline-flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                                  </span>
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                                    Live state
                                  </span>
                                </div>
                                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  {normalizedStatus}
                                </span>
                              </div>
                              <div className="mt-2 min-h-[24px] text-sm font-medium text-slate-100">
                                {(showCurrentTask && !isRoundLabel) || validatorPrompt ? (
                                  <MarqueeText
                                    text={liveText}
                                    className="text-sm font-medium text-slate-100"
                                    containerClassName=""
                                    speed={50}
                                    pauseDuration={0.5}
                                  />
                                ) : (
                                  <span className="inline-flex min-h-[24px] items-center text-slate-200">
                                    {liveText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {secondaryStats.map((stat) => {
                              const Icon = stat.icon;
                              return (
                                <div
                                  key={stat.title}
                                  className="inline-flex min-h-[44px] sm:min-h-[50px] min-w-[80px] sm:min-w-[98px] flex-1 items-center gap-1.5 sm:gap-2 rounded-full bg-white/[0.05] px-2.5 sm:px-3 py-2"
                                >
                                  <div
                                    className={cn(
                                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.75)]",
                                      stat.iconClassName
                                    )}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <div className="min-w-0">
                                    <Text className="text-[8px] uppercase tracking-[0.18em] text-slate-500">
                                      {stat.title}
                                    </Text>
                                    <Text className="mt-0.5 truncate text-[15px] font-bold leading-none text-white">
                                      {stat.metric}
                                    </Text>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={`validator-${validator.id}`}
              className="bg-gray-50 border-2 border-muted rounded-xl overflow-hidden cursor-default"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative aspect-square w-10 h-10">
                      <Image
                        src={iconSrc}
                        alt={validator.name ?? "Validator avatar"}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="h-full w-full rounded-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="font-bold text-gray-900">
                        {validator.name ?? "—"}
                      </Text>
                      <Text className="text-xs font-mono tracking-wide text-gray-500 truncate">
                        {validator.hotkey
                          ? `${validator.hotkey.slice(0, 8)}...${validator.hotkey.slice(-8)}`
                          : "No hotkey"}
                      </Text>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg flex-shrink-0 transition-all duration-300",
                      statusColorClass
                    )}
                  >
                    {normalizedStatus}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2.5">
                    {(() => {
                      // Show website/use case whenever they exist, regardless of status
                      const hasLiveMeta =
                        validator.currentWebsite || validator.currentUseCase;
                      const websiteText =
                        hasLiveMeta && validator.currentWebsite
                          ? validator.currentWebsite
                          : "__";
                      const useCaseText =
                        hasLiveMeta && validator.currentUseCase
                          ? validator.currentUseCase
                          : "__";
                      return (
                        <div
                          className={cn(
                            "flex items-center justify-center gap-4 flex-wrap text-xs font-bold uppercase tracking-wide",
                            showCurrentTask ? "text-gray-800" : "text-gray-500"
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <PiGlobe className="w-3.5 h-3.5" />
                            <span className="text-gray-700">Website:</span>
                            <span className="font-semibold text-gray-900 normal-case">
                              {websiteText}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <PiTarget className="w-3.5 h-3.5" />
                            <span className="text-gray-700">Use Case:</span>
                            <span className="font-semibold text-gray-900 normal-case">
                              {useCaseText}
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  {(() => {
                    const isRoundLbl = /^round\s+\d+$/i.test(rawCurrentTask);
                    const vPrompt = latestPrompts[validator.name] ?? null;
                    const text = showCurrentTask && !isRoundLbl
                      ? validator.currentTask
                      : vPrompt
                        ? vPrompt
                        : normalizedStatus === "Finished"
                          ? "Round finished — no task prompt available"
                          : "No task prompt available yet";
                    const hasPrompt = (showCurrentTask && !isRoundLbl) || !!vPrompt;
                    return hasPrompt ? (
                      <div className="bg-gray-900/5 border border-muted rounded-lg p-3 text-sm font-medium text-gray-900 truncate">
                        {text}
                      </div>
                    ) : (
                      <div
                        className="bg-gray-900/5 border border-dashed border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-600 flex items-center justify-center gap-2 text-center"
                        aria-disabled="true"
                      >
                        <PiHourglassMediumFill className="w-4 h-4 text-gray-500" />
                        <span>{text}</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 md:justify-around">
                  {secondaryStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.title} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg text-white flex-shrink-0",
                            stat.iconClassName
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Text className="text-xs text-gray-600">
                            {stat.title}
                          </Text>
                          <Text className="font-bold text-sm text-gray-900 truncate">
                            {stat.metric}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-right text-[11px] text-gray-400">
                  {lastSeenLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
  );
}
