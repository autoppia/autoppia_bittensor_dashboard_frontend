"use client";

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/app/shared/page-header";
import cn from "@core/utils/class-names";
import {
  PiOpenAiLogoDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone,
  PiPaperPlaneRightFill,
  PiChartLineUpFill,
  PiHourglassMediumFill,
  PiSpinnerGapBold,
  PiCheckCircleFill,
} from "react-icons/pi";
import BannerText from "@/app/shared/banner-text";
import { Text } from "rizzui";
import MarqueeText from "@/app/shared/marquee-text";
import { useValidators, useCurrentRound } from "@/services/hooks/useOverview";
import { resolveAssetUrl } from "@/services/utils/assets";

export default function OverviewValidators() {
  const { data: validatorsData, loading: validatorsLoading, error: validatorsError } = useValidators({ limit: 6 });
  const { data: currentRound, loading: roundLoading, error: roundError } = useCurrentRound();
  const roundNumber = currentRound?.id ?? null;
  const isRoundActive =
    !!currentRound &&
    (currentRound.current ||
      currentRound.status === "active" ||
      currentRound.status === "pending");

  const headerTitle = "What's happening on the subnet";
  const headerDescription =
    "Below are a list of validators currently running - click on any to see full details";

  const runningRoundBadge = roundLoading ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200">
      <PiSpinnerGapBold className="h-3.5 w-3.5 animate-spin" />
      Loading round…
    </span>
  ) : roundNumber ? (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
        isRoundActive
          ? "border border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
          : "border border-slate-400/60 bg-slate-500/10 text-slate-200"
      )}
    >
      {isRoundActive ? (
        <PiSpinnerGapBold className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PiCheckCircleFill className="h-3.5 w-3.5 text-emerald-300" />
      )}
      <span className="flex items-center gap-1">
        {isRoundActive ? "Running" : "Last"} Round
        <span className="ml-1 font-semibold text-white">
          {roundNumber}
        </span>
      </span>
    </span>
  ) : null;

  // Show loading state
  if (validatorsLoading || roundLoading) {
    return (
      <>
        <PageHeader title={headerTitle} description={headerDescription} className="mt-12">
          {runningRoundBadge}
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden">
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
                <div className="flex items-center justify-around gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
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
        <PageHeader title={headerTitle} description={headerDescription} className="mt-12">
          {runningRoundBadge}
        </PageHeader>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
          <p className="text-red-400 font-medium">Error loading validators</p>
          <p className="text-red-300 text-sm mt-1">
            {validatorsError}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={headerTitle} description={headerDescription} className="mt-12">
        {runningRoundBadge}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {(validatorsData?.data?.validators || []).map((validator, index) => {
          const iconSrc = resolveAssetUrl(
            validator.icon,
            resolveAssetUrl("/validators/Other.png")
          );
          const secondaryStats = [
            {
              title: "Stake",
              metric: `${(validator.weight / 1000).toFixed(0)}K`,
              icon: PiCurrencyDollarDuotone,
              iconClassName: "bg-gradient-to-br from-yellow-500 to-amber-600",
            },
            {
              title: "VTrust",
              metric: validator.trust,
              icon: PiClockDuotone,
              iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600",
            },
            {
              title: "Version",
              metric: validator.version,
              icon: PiHashDuotone,
              iconClassName: "bg-gradient-to-br from-purple-500 to-violet-600",
            },
          ];

          const displayStatus =
            validator.status === "Evaluating"
              ? "Evaluating..."
              : validator.status === "Finished"
              ? "Finished"
              : validator.status;

          const showCurrentTask =
            validator.status !== "Finished" && validator.currentTask?.trim();

          const roundsLink = currentRound?.id
            ? `/rounds/${currentRound.id}?validator=${validator.id}`
            : undefined;

          return roundsLink ? (
            <Link
              key={`validator-${validator.id}`}
              href={roundsLink}
            >
              <div className="bg-gray-50 border-2 border-muted hover:border-gray-700 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header - Validator Info & Status */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative aspect-square w-10 h-10">
                        <Image
                          src={iconSrc}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className="h-full w-full rounded-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-bold text-gray-900">
                          {validator.name}
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
                          validator.status === "Sending Tasks"
                            ? "bg-emerald-500/20 text-emerald-500"
                          : validator.status === "Evaluating"
                            ? "bg-orange-500/20 text-orange-500"
                            : validator.status === "Waiting"
                              ? "bg-blue-500/20 text-blue-500"
                              : validator.status === "Finished"
                                ? "bg-emerald-600/15 text-emerald-600"
                                : "bg-yellow-500/20 text-yellow-500"
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
                       validator.status !== "Finished" && (
                        <PiSpinnerGapBold className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span className="relative">
                        {displayStatus}
                        <span className="absolute inset-0 blur-sm opacity-50 group-hover/status:opacity-75 transition-opacity">
                          {displayStatus}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Current Task */}
                  <div className="border border-muted rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 mb-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white">
                        <PiOpenAiLogoDuotone className="w-3.5 h-3.5" />
                      </div>
                      <Text className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Current Task
                      </Text>
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
                      <div className="bg-gray-900/5 border border-muted rounded-lg p-3 text-sm font-medium text-gray-600">
                        Round completed
                      </div>
                    )}
                  </div>

                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex items-center justify-around gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    {secondaryStats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.title} className="flex items-center gap-2">
                          <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg text-white flex-shrink-0",
                            stat.iconClassName
                          )}>
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
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={`validator-${validator.id}`}
              className="bg-gray-50 border-2 border-muted rounded-xl overflow-hidden cursor-default"
            >
              {/* Similar content without Link */}
              {/* Duplicate content but non-interactive */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative aspect-square w-10 h-10">
                      <Image
                        src={iconSrc}
                        alt={validator.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="h-full w-full rounded-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="font-bold text-gray-900">
                        {validator.name}
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
                      validator.status === "Sending Tasks"
                        ? "bg-emerald-500/20 text-emerald-500"
                      : validator.status === "Evaluating"
                        ? "bg-orange-500/20 text-orange-500"
                        : validator.status === "Waiting"
                          ? "bg-blue-500/20 text-blue-500"
                          : validator.status === "Finished"
                            ? "bg-emerald-600/15 text-emerald-600"
                            : "bg-yellow-500/20 text-yellow-500"
                    )}
                  >
                    {displayStatus}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-muted rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white">
                      <PiOpenAiLogoDuotone className="w-3.5 h-3.5" />
                    </div>
                    <Text className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Current Task
                    </Text>
                  </div>
                  <div className="bg-gray-900/5 border border-muted rounded-lg p-3 text-sm font-medium text-gray-600">
                    {showCurrentTask ? validator.currentTask : "Round completed"}
                  </div>
                </div>
                <div className="flex items-center justify-around gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {secondaryStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.title} className="flex items-center gap-2">
                        <div className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-lg text-white flex-shrink-0",
                          stat.iconClassName
                        )}>
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
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
