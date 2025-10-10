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
  PiTrophyDuotone,
  PiUserDuotone,
  PiIdentificationCardDuotone,
  PiChartLineUpDuotone,
} from "react-icons/pi";
import BannerText from "@/app/shared/banner-text";
import { Text } from "rizzui";
import { primaryColors } from "@/data/colors-data";
import { roundsData } from "@/data/rounds-data";
import MarqueeText from "@/app/shared/marquee-text";

export default function OverviewValidators() {
  const currentRound = roundsData.find((round) => round.current);

  return (
    <>
      <PageHeader title={"Live Event Update"} className="mt-6">
        <BannerText
          color={primaryColors.green}
          text="Live Update"
          className="animate-pulse"
        />
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {validatorsData.map((validator, index) => {
          // Mock top miner data - in production, this would come from API
          const topMiner = {
            uid: 42 + index,
            hotkey: "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
            score: 0.98 - index * 0.01,
          };

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
              <div className="bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
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
                        "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm flex-shrink-0",
                        validator.status === "Sending Tasks"
                          ? "bg-emerald-500/20 text-emerald-600 ring-1 ring-emerald-500/30"
                          : validator.status === "Evaluating"
                            ? "bg-orange-500/20 text-orange-600 ring-1 ring-orange-500/30"
                            : validator.status === "Waiting"
                              ? "bg-blue-500/20 text-blue-600 ring-1 ring-blue-500/30"
                              : "bg-yellow-500/20 text-yellow-600 ring-1 ring-yellow-500/30"
                      )}
                    >
                      <span className="animate-spin text-sm">
                        <PiArrowClockwiseDuotone />
                      </span>
                      <span>{validator.status}</span>
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
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white">
                        <PiOpenAiLogoDuotone className="w-3.5 h-3.5" />
                      </div>
                      <Text className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Current Task
                      </Text>
                    </div>
                    <MarqueeText
                      text={validator.currentTask}
                      className="text-sm text-gray-900 font-medium"
                      containerClassName="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5"
                      speed={50}
                      pauseDuration={0.5}
                    />
                  </div>

                  {/* Top Miner - Compact */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 text-white">
                        <PiTrophyDuotone className="w-3.5 h-3.5" />
                      </div>
                      <Text className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Top Miner
                      </Text>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PiIdentificationCardDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">UID:</Text>
                          <Text className="text-sm font-bold text-gray-900">{topMiner.uid}</Text>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PiChartLineUpDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">Score:</Text>
                          <Text className="text-base font-bold text-emerald-600">
                            {topMiner.score.toFixed(2)}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PiUserDuotone className="w-3.5 h-3.5 text-emerald-600" />
                        <Text className="text-xs text-gray-700">Hotkey:</Text>
                        <Text className="text-xs font-mono text-gray-900 truncate">
                          {topMiner.hotkey.slice(0, 8)}...{topMiner.hotkey.slice(-8)}
                        </Text>
                      </div>
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
