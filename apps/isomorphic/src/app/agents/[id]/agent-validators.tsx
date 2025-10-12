"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import { useAgentRuns } from "@/services/hooks/useAgents";
import { AgentValidatorsPlaceholder } from "@/components/placeholders/agent-placeholders";
import cn from "@core/utils/class-names";

export default function AgentValidators() {
  const { id } = useParams();
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // Fetch agent runs data
  const { data: runsData, loading } = useAgentRuns(id as string, {
    limit: 50,
    sortBy: 'startTime',
    sortOrder: 'desc',
  });

  // Show loading placeholder
  if (loading) {
    return <AgentValidatorsPlaceholder />;
  }

  if (!runsData?.data?.runs) {
    return (
      <div className="mt-6">
        <div className="text-center py-12">
          <div className="text-gray-500">No validator runs found for this agent</div>
        </div>
      </div>
    );
  }

  // Group runs by validator
  const runsByValidator = runsData.data.runs.reduce((acc, run) => {
    if (!acc[run.validatorId]) {
      acc[run.validatorId] = [];
    }
    acc[run.validatorId].push(run);
    return acc;
  }, {} as Record<string, typeof runsData.data.runs>);

  // Get unique rounds for dropdown
  const uniqueRounds = Array.from(new Set(runsData.data.runs.map(run => run.roundId)))
    .sort((a, b) => b - a);
  
  const roundOptions: SelectOption[] = uniqueRounds.map((roundId) => ({
    label: `Round ${roundId}`,
    value: roundId,
  }));

  // Filter runs by selected round
  const filteredRuns = selectedRound 
    ? runsData.data.runs.filter(run => run.roundId === selectedRound)
    : runsData.data.runs;

  // Calculate average metrics
  const avgRank = filteredRuns.length > 0 
    ? (filteredRuns.reduce((sum, run) => sum + (run.ranking || 0), 0) / filteredRuns.length).toFixed(1)
    : '0';
  
  const avgScore = filteredRuns.length > 0
    ? (filteredRuns.reduce((sum, run) => sum + run.score, 0) / filteredRuns.length * 100).toFixed(1)
    : '0';
  
  const avgDuration = filteredRuns.length > 0
    ? (filteredRuns.reduce((sum, run) => sum + run.duration, 0) / filteredRuns.length / 60).toFixed(1)
    : '0';
  
  const avgTasks = filteredRuns.length > 0
    ? (filteredRuns.reduce((sum, run) => sum + run.completedTasks, 0) / filteredRuns.length).toFixed(1)
    : '0';

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-4">
        <div className="flex items-center gap-3">
          <Text className="text-2xl font-bold text-gray-900">
            Agent Evaluation Runs ({Object.keys(runsByValidator).length} validators)
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
          options={roundOptions}
          value={roundOptions.find((option) => option.value === selectedRound)}
          onChange={(option: SelectOption) => {
            setSelectedRound(option.value as number);
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
            metric: avgRank,
            description: "Across all validators",
            icon: PiTrophyDuotone,
            className: "bg-gradient-to-br from-yellow-500/15 via-yellow-400/15 to-yellow-600/15 border-2 border-yellow-500/40",
            metricClassName: "text-yellow-600",
            iconClassName: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
          },
          {
            title: "Average Score",
            metric: avgScore + '%',
            description: "Performance average",
            icon: PiTrendUpDuotone,
            className: "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-500/40",
            metricClassName: "text-emerald-600",
            iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
          },
          {
            title: "Average Execution Time",
            metric: avgDuration + 'm',
            description: "Response time",
            icon: PiTimerDuotone,
            className: "bg-gradient-to-br from-blue-500/15 via-blue-400/15 to-blue-600/15 border-2 border-blue-500/40",
            metricClassName: "text-blue-600",
            iconClassName: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
          },
          {
            title: "Average Tasks",
            metric: avgTasks,
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
        {Object.entries(runsByValidator).map(([validatorId, runs]) => {
          const latestRun = runs[0]; // Get the most recent run
          const score = (latestRun.score * 100).toFixed(1);
          const rank = latestRun.ranking || 0;
          const avgResponseTime = (latestRun.duration / 60).toFixed(1); // Convert to minutes
          const tasksCompleted = latestRun.completedTasks;

          const secondaryStats = [
            {
              title: "Round",
              metric: latestRun.roundId,
              icon: PiCurrencyDollarDuotone,
              iconClassName: "bg-gradient-to-br from-yellow-500 to-amber-600",
            },
            {
              title: "Duration",
              metric: `${(latestRun.duration / 60).toFixed(1)}m`,
              icon: PiClockDuotone,
              iconClassName: "bg-gradient-to-br from-blue-500 to-indigo-600",
            },
            {
              title: "Status",
              metric: latestRun.status,
              icon: PiHashDuotone,
              iconClassName: "bg-gradient-to-br from-purple-500 to-violet-600",
            },
          ];

          return (
            <Link
              key={`agent-run-${validatorId}`}
              href={`/agent-run/${latestRun.runId}`}
            >
              <div className="bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md rounded-lg cursor-pointer">
                {/* Header - Validator Info & Agent Run ID */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Text className="text-gray-600 font-bold text-sm">
                          {validatorId.slice(0, 2).toUpperCase()}
                        </Text>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-semibold text-gray-900 text-sm">
                          Validator {validatorId}
                        </Text>
                        <Text className="text-xs text-gray-500 font-mono truncate">
                          {validatorId.slice(0, 8)}...{validatorId.slice(-8)}
                        </Text>
                      </div>
                    </div>
                    <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                      {latestRun.runId.slice(0, 8)}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Agent Performance */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded text-emerald-600 flex items-center justify-center">
                        <PiChartLineDuotone className="w-4 h-4" />
                      </div>
                      <Text className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                        Performance
                      </Text>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <PiTrophyDuotone className="w-3 h-3 text-emerald-600" />
                        <Text className="text-gray-600">Rank:</Text>
                        <Text className="font-semibold text-gray-900">
                          #{rank}
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <PiChartLineUpDuotone className="w-3 h-3 text-emerald-600" />
                        <Text className="text-gray-600">Score:</Text>
                        <Text className="font-semibold text-emerald-600">
                          {score}%
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <PiClockDuotone className="w-3 h-3 text-emerald-600" />
                        <Text className="text-gray-600">Time:</Text>
                        <Text className="font-semibold text-gray-900">
                          {avgResponseTime}s
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <PiListChecksDuotone className="w-3 h-3 text-emerald-600" />
                        <Text className="text-gray-600">Tasks:</Text>
                        <Text className="font-semibold text-gray-900">
                          {tasksCompleted}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Stats - Compact Horizontal */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {secondaryStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.title} className="flex items-center gap-1">
                          <div className={cn(
                            "w-5 h-5 rounded text-white flex items-center justify-center flex-shrink-0",
                            stat.iconClassName
                          )}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Text className="text-gray-500 text-xs">
                              {stat.title}
                            </Text>
                            <Text className="font-semibold text-gray-900 text-xs truncate">
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
