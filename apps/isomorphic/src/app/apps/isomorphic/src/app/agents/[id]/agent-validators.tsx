"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { validatorsData } from "@/data/validators-data";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiListChecksDuotone,
  PiChartLineDuotone,
} from "react-icons/pi";
import { Text, Select, SelectOption } from "rizzui";
import { roundsData, RoundType } from "@/data/rounds-data";
import cn from "@core/utils/class-names";

export default function AgentValidators() {
  const [round, setRound] = useState<RoundType>(
    roundsData.find((round) => round.current)!
  );
  const roundOptions: SelectOption[] = roundsData.map((round) => ({
    label: round.current ? `Round ${round.id} (Latest)` : `Round ${round.id}`,
    value: round.id,
  }));

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-4">
        <Text className="text-2xl font-bold text-gray-900">
          Agent Evaluation Runs (6 validators)
        </Text>
        <Select
          options={roundOptions.slice().reverse()}
          value={roundOptions.find((option) => option.value === round?.id)}
          onChange={(option: SelectOption) => {
            setRound(roundsData.find((round) => round.id === option.value)!);
          }}
          className="w-44"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => {
          const primaryStats = [
            {
              title: "Score",
              metric: "95%",
              icon: PiChartLineDuotone,
              className:
                "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-500/40",
              metricClassName: "text-green-600",
              iconClassName: "bg-green-500 text-white",
            },
            {
              title: "Tasks",
              metric: validator.total_tasks.toLocaleString(),
              icon: PiListChecksDuotone,
              className:
                "bg-gradient-to-br from-blue-500/15 via-blue-400/15 to-blue-600/15 border-2 border-blue-500/40",
              metricClassName: "text-blue-600",
              iconClassName: "bg-blue-500 text-white",
            },
          ];

          const secondaryStats = [
            {
              title: "Stake",
              metric: `${(validator.weight / 1000).toFixed(0)}K`,
              icon: PiCurrencyDollarDuotone,
              metricClassName: "text-purple-500",
              iconClassName: "bg-gray-200/50 text-purple-500",
            },
            {
              title: "VTrust",
              metric: `${(validator.trust * 100).toFixed(1)}%`,
              icon: PiClockDuotone,
              metricClassName: "text-purple-500",
              iconClassName: "bg-gray-200/50 text-purple-500",
            },
            {
              title: "Version",
              metric: validator.version,
              icon: PiHashDuotone,
              metricClassName: "text-purple-500",
              iconClassName: "bg-gray-200/50 text-purple-500",
            },
          ];

          return (
            <Link
              key={`agent-run-${validator.id}`}
              href={`/agent-run/a7k2-9m4x`}
            >
              <div className="bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-square w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={validator.icon}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <Text className="font-bold text-gray-900">
                          {validator.name}
                        </Text>
                        <Text className="text-xs text-gray-600 tracking-wide">
                          {validator.hotkey.slice(0, 6)}...
                          {validator.hotkey.slice(-6)}
                        </Text>
                      </div>
                    </div>
                    <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                      a7k2-9m4x
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {/* Primary Stats - Tasks and Score (2 columns) */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {primaryStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.title}
                          className={cn("rounded-lg p-2", stat.className)}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-lg",
                                  stat.iconClassName
                                )}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <Text className="text-base font-semibold text-gray-900">
                                {stat.title}
                              </Text>
                            </div>
                            <Text
                              className={cn(
                                "font-bold text-lg",
                                stat.metricClassName
                              )}
                            >
                              {stat.metric}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Secondary Stats - Stake, VTrust, Version (responsive layout) */}
                  <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                    <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-3 xl:gap-4">
                      {secondaryStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={stat.title}
                            className="flex items-center gap-1 sm:gap-1.5 md:gap-2"
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded",
                                stat.iconClassName
                              )}
                            >
                              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Text className="text-xs text-gray-700">
                                {stat.title}
                              </Text>
                              <Text
                                className={cn(
                                  "font-semibold text-xs md:text-sm truncate",
                                  stat.metricClassName
                                )}
                              >
                                {stat.metric}
                              </Text>
                            </div>
                            {index < secondaryStats.length - 1 && (
                              <div className="w-px h-5 sm:h-6 md:h-7 bg-gray-300 ml-1 sm:ml-1.5 md:ml-2" />
                            )}
                          </div>
                        );
                      })}
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
