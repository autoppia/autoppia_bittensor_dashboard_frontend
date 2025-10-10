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
  PiChartLineUpDuotone,
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
        {validatorsData.map((validator, index) => {
          // Mock data for agent evaluation - in production, this would come from API
          const agentRunId = "a7k2-9m4x";
          const score = 95 - index * 2; // Mock score

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
              key={`agent-run-${validator.id}`}
              href={`/agent-run/${agentRunId}`}
            >
              <div className="bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:scale-[1.02] transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header - Validator Info & Agent Run ID */}
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
                    <div className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0">
                      {agentRunId}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex items-center justify-around gap-3 bg-gray-900/5 border border-gray-200 rounded-lg p-3">
                    {secondaryStats.map((stat) => {
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

                  {/* Agent Performance */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 text-white">
                        <PiChartLineDuotone className="w-3.5 h-3.5" />
                      </div>
                      <Text className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Agent Performance
                      </Text>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PiChartLineUpDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">Score:</Text>
                          <Text className="text-base font-bold text-emerald-600">
                            {score}%
                          </Text>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PiListChecksDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">Tasks:</Text>
                          <Text className="text-sm font-bold text-gray-900">
                            {validator.total_tasks.toLocaleString()}
                          </Text>
                        </div>
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
