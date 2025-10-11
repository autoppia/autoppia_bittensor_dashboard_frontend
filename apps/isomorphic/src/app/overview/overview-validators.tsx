"use client";

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/app/shared/page-header";
import cn from "@core/utils/class-names";
import { validatorsData } from "@/data/validators-data";
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
import { roundsData } from "@/data/rounds-data";
import MarqueeText from "@/app/shared/marquee-text";

export default function OverviewValidators() {
  const currentRound = roundsData.find((round) => round.current);

  return (
    <>
      <PageHeader title={"Live Event Update"} className="mt-6">
        <BannerText
          color="#10B981"
          text="Live Update"
          className="animate-pulse"
        />
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {validatorsData.map((validator, index) => {
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
                        <Text className="text-xs text-gray-500 tracking-wide font-mono truncate">
                          {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
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
                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex items-center justify-around gap-3 bg-gray-900/5 border border-gray-200 rounded-lg p-3">
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
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
