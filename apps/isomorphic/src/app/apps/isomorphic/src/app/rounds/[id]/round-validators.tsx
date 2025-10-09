"use client";

import Image from "next/image";
import PageHeader from "@/app/shared/page-header";
import { validatorsData } from "@/data/validators-data";
import { minersData } from "@/data/miners-data";
import {
  PiListChecksDuotone,
  PiChartLineDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
} from "react-icons/pi";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";

// Helper function to get top miner and calculate average score
const getValidatorStats = (validatorId: string) => {
  const sortedMiners = minersData.sort((a, b) => b.score - a.score);
  const topMiner = sortedMiners[0];
  const averageScore =
    minersData.reduce((sum, m) => sum + m.score, 0) / minersData.length;

  return {
    topMiner: topMiner,
    averageScore: averageScore,
  };
};

export default function RoundValidators() {
  return (
    <>
      <PageHeader title={"Validators"} className="mt-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => {
          const stats = getValidatorStats(validator.id);

          const primaryStats = [
            {
              title: "Avg Score",
              metric: `${(stats.averageScore * 100).toFixed(1)}%`,
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
            <div key={`validator-${validator.id}`}>
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
                  <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-center items-center gap-2 sm:gap-4 lg:gap-6">
                      {secondaryStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={stat.title}
                            className="flex items-center gap-1 sm:gap-2"
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded",
                                stat.iconClassName
                              )}
                            >
                              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Text className="text-xs sm:text-xs text-gray-700">
                                {stat.title}
                              </Text>
                              <Text
                                className={cn(
                                  "font-semibold text-xs sm:text-sm truncate",
                                  stat.metricClassName
                                )}
                              >
                                {stat.metric}
                              </Text>
                            </div>
                            {index < secondaryStats.length - 1 && (
                              <div className="w-px h-6 sm:h-8 bg-gray-300 ml-1 sm:ml-2 lg:ml-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
