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
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiSpinnerGapBold,
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

  // Get unique rounds for dropdown
  const uniqueRounds = Array.from(new Set(runsData.data.runs.map(run => run.roundId)))
    .sort((a, b) => b - a);
  
  const roundOptions: SelectOption[] = uniqueRounds.map((roundId) => ({
    label: `Round ${roundId}`,
    value: roundId,
  }));

  // Auto-select the last (highest) round if no round is selected
  const currentRound = selectedRound || uniqueRounds[0];

  // Filter runs by selected round
  const filteredRuns = currentRound 
    ? runsData.data.runs.filter(run => run.roundId === currentRound)
    : runsData.data.runs;

  // Group filtered runs by validator
  const runsByValidator = filteredRuns.reduce((acc, run) => {
    if (!acc[run.validatorId]) {
      acc[run.validatorId] = [];
    }
    acc[run.validatorId].push(run);
    return acc;
  }, {} as Record<string, typeof filteredRuns>);

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
            className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-black bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <PiInfoDuotone className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span>How it works</span>
            <div className="ml-1 transition-transform duration-300 group-hover:scale-110">
              {isInfoExpanded ? (
                <PiCaretUpDuotone className="w-4 h-4 text-gray-500 group-hover:text-black" />
              ) : (
                <PiCaretDownDuotone className="w-4 h-4 text-gray-500 group-hover:text-black" />
              )}
            </div>
          </button>
        </div>
        <Select
          options={roundOptions}
          value={roundOptions.find((option) => option.value === currentRound)}
          onChange={(option: SelectOption) => {
            setSelectedRound(option.value as number);
          }}
          className="w-44"
        />
      </div>

      {/* Expandable Info Card */}
      {isInfoExpanded && (
        <div className="mb-6 relative overflow-hidden bg-gray-900 border border-gray-700 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-500 shadow-2xl" style={{ backgroundColor: '#111827', color: '#ffffff' }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl"></div>
          </div>
          
          {/* Header */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <PiInfoDuotone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ color: '#ffffff' }}>How Agent Evaluation Works</h3>
              <p className="text-sm text-gray-300" style={{ color: '#d1d5db' }}>Understanding the validation process</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-sm hover:bg-gray-700 transition-colors duration-200" style={{ backgroundColor: '#1f2937' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <PiTrophyDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white" style={{ color: '#ffffff' }}>Validators</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed" style={{ color: '#d1d5db' }}>
                  Each validator runs independent evaluations of your agent across different tasks and scenarios to ensure fair and comprehensive testing.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-sm hover:bg-gray-700 transition-colors duration-200" style={{ backgroundColor: '#1f2937' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <PiChartLineUpDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white" style={{ color: '#ffffff' }}>Scoring</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed" style={{ color: '#d1d5db' }}>
                  Agents are scored based on task completion accuracy, response quality, and execution efficiency across multiple evaluation criteria.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-sm hover:bg-gray-700 transition-colors duration-200" style={{ backgroundColor: '#1f2937' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <PiListChecksDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white" style={{ color: '#ffffff' }}>Ranking</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed" style={{ color: '#d1d5db' }}>
                  Your final rank is determined by your average performance across all validators in each round, providing a comprehensive ranking system.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-sm hover:bg-gray-700 transition-colors duration-200" style={{ backgroundColor: '#1f2937' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <PiTimerDuotone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white" style={{ color: '#ffffff' }}>Execution Time</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed" style={{ color: '#d1d5db' }}>
                  Faster response times with maintained quality result in higher scores, balancing speed and accuracy in the evaluation process.
                </p>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-4 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl" style={{ backgroundColor: 'rgba(31, 41, 55, 0.6)' }}>
              <div className="flex items-center gap-2 mb-2">
                <PiHashDuotone className="w-4 h-4 text-gray-400" style={{ color: '#9ca3af' }} />
                <span className="text-sm font-semibold text-white" style={{ color: '#ffffff' }}>Tasks</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed" style={{ color: '#d1d5db' }}>
                Each evaluation includes multiple tasks designed to test different capabilities of your agent, from simple interactions to complex multi-step processes.
              </p>
            </div>
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
            title: "Total Tasks",
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
              title: "Score",
              metric: `${(latestRun.score * 100).toFixed(1)}%`,
              icon: PiChartLineUpDuotone,
              iconClassName: "bg-gradient-to-br from-emerald-500 to-green-600",
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
              <div className="bg-gray-50 border-2 border-muted hover:border-gray-700 transition-all duration-300 group rounded-xl overflow-hidden cursor-pointer">
                {/* Header - Validator Info & Status */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative aspect-square w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Text className="text-gray-600 font-bold text-sm">
                          {validatorId.slice(0, 2).toUpperCase()}
                        </Text>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-bold text-gray-900">
                          Validator {validatorId}
                        </Text>
                        <Text className="text-xs text-gray-500 tracking-wide font-mono truncate">
                          {validatorId.slice(0, 8)}...{validatorId.slice(-8)}
                        </Text>
                      </div>
                    </div>
                    <div className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg flex-shrink-0 transition-all duration-300 hover:shadow-xl">
                      <PiHashDuotone className="w-3.5 h-3.5" />
                      <span className="font-mono">
                        {latestRun.runId.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
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
