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
} from "react-icons/pi";
import BannerText from "@/app/shared/banner-text";
import { Text } from "rizzui";
import MarqueeText from "@/app/shared/marquee-text";
import { useValidators, useCurrentRound } from "@/services/hooks/useOverview";

export default function OverviewValidators() {
  const { data: validatorsData, loading: validatorsLoading, error: validatorsError } = useValidators({ limit: 6 });
  const { data: currentRound, loading: roundLoading, error: roundError } = useCurrentRound();

  // Show loading state
  if (validatorsLoading || roundLoading) {
    return (
      <>
        <PageHeader title={"What's happening on the subnet"} className="mt-12">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Below are a list of validators currently running - click on any to see full details
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-600">Loading...</span>
            </div>
          </div>
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
        <PageHeader title={"What's happening on the subnet"} className="mt-12">
          <div className="text-sm text-gray-600 mt-2">
            Below are a list of validators currently running - click on any to see full details
          </div>
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
      <PageHeader title={"What's happening on the subnet"} className="mt-12">
        <div className="text-sm text-gray-600 mt-2">
          Below are a list of validators currently running - click on any to see full details
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {(validatorsData?.data?.validators || []).map((validator, index) => {
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

          return (
            <Link
              key={`validator-${validator.id}`}
              href={`/rounds/${currentRound?.id}/${validator.id}`}
            >
              <div className="bg-gray-50 border-2 border-muted hover:border-gray-700 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header - Validator Info & Status */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative aspect-square w-10 h-10">
                        <Image
                          src={validator.icon}
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
                      {validator.status !== "Sending Tasks" && 
                       validator.status !== "Evaluating" && 
                       validator.status !== "Waiting" && (
                        <PiSpinnerGapBold className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span className="relative">
                        {validator.status}
                        <span className="absolute inset-0 blur-sm opacity-50 group-hover/status:opacity-75 transition-opacity">
                          {validator.status}
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
                    <div className="bg-gray-900/5 border border-muted rounded-lg p-3">
                      <MarqueeText
                        text={validator.currentTask}
                        className="text-sm text-gray-900 font-medium"
                        containerClassName=""
                        speed={50}
                        pauseDuration={0.5}
                      />
                    </div>
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
          );
        })}
      </div>
    </>
  );
}
