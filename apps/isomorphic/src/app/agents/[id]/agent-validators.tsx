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
      <div className="flex items-center justify-between mt-6 mb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => {
          const validatorStats = [
            {
              title: "Stake",
              metric: `${(validator.weight / 1000).toFixed(0)}K`,
              description: "Validator weight",
              icon: PiCurrencyDollarDuotone,
              metricClassName: "text-yellow-600",
              iconClassName: "bg-yellow-500 text-white",
            },
            {
              title: "VTrust",
              metric: validator.trust,
              description: "Trust score",
              icon: PiClockDuotone,
              metricClassName: "text-orange-600",
              iconClassName: "bg-orange-500 text-white",
            },
            {
              title: "Version",
              metric: validator.version,
              description: "Protocol version",
              icon: PiHashDuotone,
              metricClassName: "text-blue-600",
              iconClassName: "bg-blue-500 text-white",
            },
            {
              title: "Tasks",
              metric: validator.total_tasks.toLocaleString(),
              description: "Total evaluations",
              icon: PiListChecksDuotone,
              metricClassName: "text-emerald-600",
              iconClassName: "bg-emerald-500 text-white",
            },
          ];

          return (
            <Link
              key={`agent-run-${validator.id}`}
              href={`/agent-run/a7k2-9m4x`}
            >
              <div className="bg-gray-50 border border-gray-200 hover:border-gray-700 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header */}
                <div className="p-4">
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
                    <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                      a7k2-9m4x
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  {/* Score Display */}
                  <div className="flex justify-center mb-3">
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-gray-900 px-12 py-2 rounded-full shadow-lg">
                      <div className="flex items-center justify-center gap-3">
                        <Text className="text-md font-medium uppercase">
                          Score
                        </Text>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <Text className="text-xl font-bold">95%</Text>
                      </div>
                    </div>
                  </div>

                  {/* Stats Lines */}
                  <div className="space-y-2">
                    {validatorStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.title}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex items-center justify-center w-6 h-6 rounded",
                                stat.iconClassName
                              )}
                            >
                              <Icon className="w-3 h-3" />
                            </div>
                            <Text className="text-xs text-gray-600">
                              {stat.title}
                            </Text>
                          </div>
                          <Text
                            className={cn(
                              "font-semibold text-sm",
                              stat.metricClassName
                            )}
                          >
                            {stat.metric}
                          </Text>
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
