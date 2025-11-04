"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/app/shared/page-header";
import { routes } from "@/config/routes";
import cn from "@core/utils/class-names";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiFingerprintDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone,
  PiPaperPlaneRightFill,
  PiChartLineUpFill,
  PiHourglassMediumFill,
  PiSpinnerGapBold,
  PiCheckCircleFill,
  PiGlobe,
  PiTarget,
} from "react-icons/pi";
import BannerText from "@/app/shared/banner-text";
import { Text } from "rizzui";
import MarqueeText from "@/app/shared/marquee-text";
import { useValidators } from "@/services/hooks/useOverview";
import { resolveAssetUrl } from "@/services/utils/assets";

const DEFAULT_TASK_MESSAGES = new Set([
  "Awaiting round start",
  "Validator connected – awaiting task upload",
  "Distributing tasks to agent runs",
  "Evaluating miner submissions",
  "Waiting for consensus",
  "No activity detected recently",
  "Round completed",
]);

export default function OverviewValidators({
  currentRound,
}: { currentRound?: number | null } = {}) {
  const {
    data: validatorsData,
    loading: validatorsLoading,
    error: validatorsError,
    refetch,
  } = useValidators({ limit: 6 });

  // Auto-refresh validators every 20 seconds to show live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Use provided currentRound to avoid duplicate API call
  const roundNumber = currentRound ?? null;
  const roundLoading = false; // No longer loading round separately
  // Current round is always "active" (it's the one in progress)
  const isRoundActive = true;

  const headerTitle = "What's happening on the subnet";
  const headerDescription =
    "Below are a list of validators currently running - click on any to see full details";

  const statusColorClasses: Record<string, string> = {
    "Sending Tasks": "bg-blue-500/20 text-blue-500",
    Evaluating: "bg-amber-500/20 text-amber-400",
    Waiting: "bg-purple-500/20 text-purple-500",
    Finished: "bg-emerald-600/15 text-emerald-600",
    "Not Started": "bg-slate-500/20 text-slate-200",
    Starting: "bg-cyan-500/20 text-cyan-500",
    Offline: "bg-rose-500/20 text-rose-500",
    default: "bg-yellow-500/20 text-yellow-500",
  };

  const runningRoundBadge = roundLoading ? (
    <span
      className="inline-flex items-center gap-3 rounded-full border border-slate-500/40 bg-slate-900/60 px-3.5 py-1.5 text-sm md:text-base font-semibold text-slate-200 shadow-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <PiSpinnerGapBold className="h-5 w-5 animate-spin text-slate-100" />
      <span>Loading current round…</span>
    </span>
  ) : roundNumber ? (
    <span className="inline-flex items-center gap-3 rounded-full border border-slate-500/40 bg-slate-900/60 px-3.5 py-1.5 text-sm md:text-base font-semibold text-slate-200 shadow-sm">
      {isRoundActive ? (
        <PiArrowClockwiseDuotone className="h-5 w-5 animate-spin text-blue-300" />
      ) : (
        <PiCheckCircleFill className="h-5 w-5 text-emerald-300" />
      )}
      <span>{isRoundActive ? "Current round:" : "Last round:"}</span>
      <span className="font-extrabold text-white">{roundNumber}</span>
    </span>
  ) : null;

  // Show loading state
  if (validatorsLoading || roundLoading) {
    return (
      <>
        <PageHeader
          title={headerTitle}
          description={headerDescription}
          className="mt-12"
        >
          {runningRoundBadge}
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
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
      </>
    );
  }

  // Show error state - only show validator error if validators actually failed
  if (validatorsError) {
    return (
      <>
        <PageHeader
          title={headerTitle}
          description={headerDescription}
          className="mt-12"
        >
          {runningRoundBadge}
        </PageHeader>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
          <p className="text-red-400 font-medium">Error loading validators</p>
          <p className="text-red-300 text-sm mt-1">{validatorsError}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={headerTitle}
        description={headerDescription}
        className="mt-12"
      >
        {runningRoundBadge}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {(validatorsData?.data?.validators || []).map((validator, index) => {
          const iconSrc = resolveAssetUrl(
            validator.icon,
            resolveAssetUrl("/validators/Other.png")
          );
          const statusColorClass =
            statusColorClasses[validator.status] ?? statusColorClasses.default;
          const stakeMetric =
            typeof validator.weight === "number"
              ? `${(validator.weight / 1000).toFixed(0)}K`
              : "—";
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
              title: "UID",
              metric:
                validator.validatorUid != null ? validator.validatorUid : "—",
              icon: PiFingerprintDuotone,
              iconClassName: "bg-gradient-to-br from-emerald-500 to-teal-600",
            },
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

          const normalizedStatus =
            validator.status === "Evaluating"
              ? "Evaluating"
              : validator.status === "Finished"
                ? "Finished"
                : validator.status === "Not Started"
                  ? "Not Started"
                  : validator.status;

          const rawCurrentTask = validator.currentTask?.trim() ?? "";
          const showCurrentTask =
            rawCurrentTask.length > 0 &&
            !DEFAULT_TASK_MESSAGES.has(rawCurrentTask);

          const resolvedRoundNumber =
            typeof validator.roundNumber === "number"
              ? validator.roundNumber
              : typeof currentRound?.id === "number"
                ? currentRound.id
                : undefined;
          const validatorParam =
            validator.id ||
            (validator.validatorUid != null
              ? `validator-${validator.validatorUid}`
              : "");
          const roundKey =
            typeof resolvedRoundNumber === "number"
              ? `round_${resolvedRoundNumber}`
              : currentRound?.id != null
                ? `round_${currentRound.id}`
                : (validator.validatorRoundId ?? undefined);
          const roundsLink = roundKey
            ? `${routes.rounds}/${encodeURIComponent(roundKey)}${validatorParam ? `?validator=${encodeURIComponent(validatorParam)}` : ""}`
            : undefined;

          return roundsLink ? (
            <Link key={`validator-${validator.id}`} href={roundsLink}>
              <div className="bg-gray-50 border-2 border-muted hover:border-gray-700 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header - Validator Info & Status */}
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
                        "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg flex-shrink-0 transition-all duration-300 group/status",
                        "hover:scale-105 hover:shadow-xl",
                        statusColorClass
                      )}
                    >
                      {validator.status === "Sending Tasks" && (
                        <PiPaperPlaneRightFill className="w-3.5 h-3.5 animate-pulse" />
                      )}
                      {validator.status === "Evaluating" && (
                        <PiChartLineUpFill className="w-3.5 h-3.5 animate-bounce" />
                      )}
                      {validator.status === "Waiting" && (
                        <PiHourglassMediumFill className="w-3.5 h-3.5 animate-pulse" />
                      )}
                      {validator.status === "Finished" && (
                        <PiCheckCircleFill className="w-3.5 h-3.5" />
                      )}
                      {validator.status !== "Sending Tasks" &&
                        validator.status !== "Evaluating" &&
                        validator.status !== "Waiting" &&
                        validator.status !== "Finished" &&
                        validator.status !== "Not Started" && (
                          <PiSpinnerGapBold className="w-3.5 h-3.5 animate-spin" />
                        )}
                      {validator.status === "Not Started" && (
                        <PiArrowClockwiseDuotone className="w-3.5 h-3.5" />
                      )}
                      <span className="relative">
                        {normalizedStatus}
                        <span className="absolute inset-0 blur-sm opacity-50 group-hover/status:opacity-75 transition-opacity">
                          {normalizedStatus}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Current Task */}
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
                              showCurrentTask
                                ? "text-gray-800"
                                : "text-gray-500"
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
                    {showCurrentTask ? (
                      <div className="bg-gray-900/5 border border-muted rounded-lg p-3">
                        <MarqueeText
                          text={validator.currentTask}
                          className="text-sm text-gray-900 font-medium"
                          containerClassName=""
                          speed={50}
                          pauseDuration={0.5}
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-gray-900/5 border border-dashed border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-600 flex items-center justify-center gap-2 text-center"
                        aria-disabled="true"
                      >
                        <PiHourglassMediumFill className="w-4 h-4 text-gray-500" />
                        <span>
                          {normalizedStatus === "Finished"
                            ? "Round finished — no task prompt available"
                            : "No task prompt available yet"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 md:justify-around">
                    {secondaryStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.title}
                          className="flex items-center gap-2"
                        >
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
                    Last seen round{" "}
                    {resolvedRoundNumber != null
                      ? `#${resolvedRoundNumber}`
                      : "—"}
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
                  {showCurrentTask ? (
                    <div className="bg-gray-900/5 border border-muted rounded-lg p-3 text-sm font-medium text-gray-900">
                      {validator.currentTask}
                    </div>
                  ) : (
                    <div
                      className="bg-gray-900/5 border border-dashed border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-600 flex items-center justify-center gap-2 text-center"
                      aria-disabled="true"
                    >
                      <PiHourglassMediumFill className="w-4 h-4 text-gray-500" />
                      <span>
                        {normalizedStatus === "Finished"
                          ? "Round finished — no task prompt available"
                          : "No task prompt available yet"}
                      </span>
                    </div>
                  )}
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
                  Last seen round{" "}
                  {resolvedRoundNumber != null
                    ? `#${resolvedRoundNumber}`
                    : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
