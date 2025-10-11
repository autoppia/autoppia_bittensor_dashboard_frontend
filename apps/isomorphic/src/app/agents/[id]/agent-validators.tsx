"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { validatorsData } from "@/data/validators-data";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiChartLineDuotone,
  PiChartLineUpDuotone,
  PiTrophyDuotone,
  PiListChecksDuotone,
  PiTrendUpDuotone,
  PiTimerDuotone,
  PiInfoDuotone,
  PiCaretDownDuotone,
  PiCaretUpDuotone,
} from "react-icons/pi";
import { Text, Select, SelectOption } from "rizzui";
import { roundsData, RoundType } from "@/data/rounds-data";
import cn from "@core/utils/class-names";

export default function AgentValidators() {
  const [round, setRound] = useState<RoundType>(
    roundsData.find((round) => round.current)!
  );
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const roundOptions: SelectOption[] = roundsData.map((round) => ({
    label: round.current ? `Round ${round.id} (Latest)` : `Round ${round.id}`,
    value: round.id,
  }));

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-4">
        <div className="flex items-center gap-3">
          <Text className="text-2xl font-bold text-gray-900">
            Agent Evaluation Runs (6 validators)
          </Text>
          {/* Expandable Info Button */}
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
          >
            <PiInfoDuotone className="w-4 h-4" />
            <span>How it works</span>
            {isInfoExpanded ? (
              <PiCaretUpDuotone className="w-4 h-4" />
            ) : (
              <PiCaretDownDuotone className="w-4 h-4" />
            )}
          </button>
        </div>
        <Select
          options={roundOptions.slice().reverse()}
          value={roundOptions.find((option) => option.value === round?.id)}
          onChange={(option: SelectOption) => {
            setRound(roundsData.find((round) => round.id === option.value)!);
          }}
          className="w-44"
        />
      </div>

      {/* Expandable Info Card */}
      {isInfoExpanded && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3 text-sm text-gray-900">
            <p>
              <strong className="text-gray-900">Validators:</strong> Each validator runs independent evaluations of your agent across different tasks and scenarios.
            </p>
            <p>
              <strong className="text-gray-900">Scoring:</strong> Agents are scored based on task completion accuracy, response quality, and execution efficiency.
            </p>
            <p>
              <strong className="text-gray-900">Ranking:</strong> Your final rank is determined by your average performance across all validators in each round.
            </p>
            <p>
              <strong className="text-gray-900">Tasks:</strong> Each evaluation includes multiple tasks designed to test different capabilities of your agent.
            </p>
            <p>
              <strong className="text-gray-900">Execution Time:</strong> Faster response times with maintained quality result in higher scores.
            </p>
          </div>
        </div>
      )}
      
      {/* Common Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Average Rank",
            metric: "2.3",
            description: "Across all validators",
            icon: PiTrophyDuotone,
            className: "bg-gradient-to-br from-yellow-500/15 via-yellow-400/15 to-yellow-600/15 border-2 border-yellow-500/40",
            metricClassName: "text-yellow-600",
            iconClassName: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
          },
          {
            title: "Average Score",
            metric: "92.4%",
            description: "Performance average",
            icon: PiTrendUpDuotone,
            className: "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-500/40",
            metricClassName: "text-emerald-600",
            iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
          },
          {
            title: "Average Execution Time",
            metric: "2.8s",
            description: "Response time",
            icon: PiTimerDuotone,
            className: "bg-gradient-to-br from-blue-500/15 via-blue-400/15 to-blue-600/15 border-2 border-blue-500/40",
            metricClassName: "text-blue-600",
            iconClassName: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
          },
          {
            title: "Average Tasks",
            metric: "14.2",
            description: "Tasks completed",
            icon: PiListChecksDuotone,
            className: "bg-gradient-to-br from-purple-500/15 via-purple-400/15 to-purple-600/15 border-2 border-purple-500/40",
            metricClassName: "text-purple-600",
            iconClassName: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 hover:scale-105",
                stat.className
              )}
            >
              <div className="flex items-center mb-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    stat.iconClassName
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <Text className="text-xs font-medium ms-2 text-gray-700 uppercase tracking-wide">
                  {stat.title}
                </Text>
              </div>
              <div className="flex items-center h-8 mb-1">
                <Text
                  className={cn(
                    "font-bold text-2xl",
                    stat.metricClassName
                  )}
                >
                  {stat.metric}
                </Text>
              </div>
              <Text className="text-xs text-gray-600 font-medium">
                {stat.description}
              </Text>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {validatorsData.map((validator, index) => {
          // Mock data for agent evaluation - in production, this would come from API
          const agentRunId = "a7k2-9m4x";
          const score = 95 - index * 2; // Mock score
          const rank = index + 1; // Mock rank
          const avgResponseTime = (2.5 + index * 0.3).toFixed(1); // Mock avg response time in seconds
          const tasksCompleted = 12 + index * 2; // Mock tasks completed

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
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50/80 via-white/60 to-gray-100/80 border border-gray-200/50 hover:border-gray-300/70 hover:scale-[1.02] transition-all duration-500 shadow-lg group rounded-2xl cursor-pointer backdrop-blur-sm hover:shadow-xl hover:shadow-gray-500/10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                {/* Header - Validator Info & Agent Run ID */}
                <div className="relative p-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/90 to-white/80">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative aspect-square w-12 h-12 ring-2 ring-white/50 shadow-md">
                        <Image
                          src={validator.icon}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className="h-full w-full rounded-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-bold text-gray-900 text-sm">
                          {validator.name}
                        </Text>
                        <Text className="text-xs text-gray-500/80 tracking-wide font-mono truncate">
                          {validator.hotkey.slice(0, 8)}...{validator.hotkey.slice(-8)}
                        </Text>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 shadow-sm border border-gray-300/50">
                      {agentRunId}
                    </div>
                  </div>
                </div>

                <div className="relative p-5 space-y-4">
                  {/* Agent Performance */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-500 text-white shadow-md">
                        <PiChartLineDuotone className="w-4 h-4" />
                      </div>
                      <Text className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Agent Performance
                      </Text>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <PiTrophyDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">Rank:</Text>
                          <Text className="text-sm font-bold text-gray-900">
                            #{rank}
                          </Text>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PiChartLineUpDuotone className="w-3.5 h-3.5 text-emerald-600" />
                          <Text className="text-xs text-gray-700">Score:</Text>
                          <Text className="text-base font-bold text-emerald-600">
                            {score}%
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PiClockDuotone className="w-3.5 h-3.5 text-emerald-600" />
                        <Text className="text-xs text-gray-700">Avg Response Time:</Text>
                        <Text className="text-sm font-bold text-gray-900">
                          {avgResponseTime}s
                        </Text>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PiListChecksDuotone className="w-3.5 h-3.5 text-emerald-600" />
                        <Text className="text-xs text-gray-700">Tasks:</Text>
                        <Text className="text-sm font-bold text-gray-900">
                          {tasksCompleted}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex items-center justify-around gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
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
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
