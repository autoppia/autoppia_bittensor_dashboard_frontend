"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select, Text } from "rizzui";
import { PiChartBar, PiClock } from "react-icons/pi";
import cn from "@core/utils/class-names";
import { formatWebsiteName, getProjectColors } from "@/utils/website-colors";
import { agentRunsService } from "@/services/api/agent-runs.service";
import type { AgentRunStats } from "@/services/api/types/agent-runs";
import Placeholder from "@/app/shared/placeholder";

interface AgentHistoricalAnalyticsProps {
  agentId: string | number;
  className?: string;
}

interface WebsiteStats {
  website: string;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  avgScore: number;
  avgTime: number;
}

interface UseCaseStats {
  useCase: string;
  website: string;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  avgScore: number;
  avgTime: number;
}

export default function AgentHistoricalAnalytics({
  agentId,
  className,
}: AgentHistoricalAnalyticsProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<{
    stats: AgentRunStats[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all agent runs and their stats for this agent
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // First, get list of runs for this agent
        const runsResponse = await agentRunsService.listAgentRuns({
          agentId: agentId.toString(),
          limit: 100, // Get recent 100 runs
          status: "completed",
        });

        if (!isMounted) return;

        if (!runsResponse?.runs || runsResponse.runs.length === 0) {
          setAggregatedData({ stats: [] });
          setLoading(false);
          return;
        }

        // Fetch stats for each run (in batches to avoid overwhelming the API)
        const statsPromises = runsResponse.runs.map((run) =>
          agentRunsService.getAgentRunStats(run.runId).catch(() => null)
        );

        const allStats = await Promise.all(statsPromises);

        if (!isMounted) return;

        // Filter out failed requests
        const validStats = allStats.filter(
          (stats): stats is NonNullable<typeof stats> => stats !== null
        );

        setAggregatedData({ stats: validStats });
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [agentId]);

  // Aggregate data by website and use case
  const { websiteStats, useCaseStats } = useMemo(() => {
    if (!aggregatedData?.stats || aggregatedData.stats.length === 0) {
      return { websiteStats: [], useCaseStats: [] };
    }

    const websiteMap = new Map<string, WebsiteStats>();
    const useCaseMap = new Map<string, UseCaseStats>();

    // Process each run's stats
    aggregatedData.stats.forEach((stats) => {
      const performanceByWebsite = stats.performanceByWebsite || [];

      // Process website-level stats
      performanceByWebsite.forEach((ws) => {
        const website = ws.website;
        if (!website) return;

        const existing = websiteMap.get(website) || {
          website,
          totalTasks: 0,
          completedTasks: 0,
          successRate: 0,
          avgScore: 0,
          avgTime: 0,
        };

        const tasks = ws.tasks || 0;
        const completed = ws.successful || 0;
        const score = (ws.averageScore || 0) * 100; // Convert to percentage
        const time = ws.averageDuration || 0;

        const prevTotal = existing.totalTasks;
        existing.totalTasks += tasks;
        existing.completedTasks += completed;

        // Weighted average for score and time
        if (existing.totalTasks > 0) {
          existing.avgScore =
            (existing.avgScore * prevTotal + score * tasks) /
            existing.totalTasks;
          existing.avgTime =
            (existing.avgTime * prevTotal + time * tasks) / existing.totalTasks;
          existing.successRate =
            (existing.completedTasks / existing.totalTasks) * 100;
        }

        websiteMap.set(website, existing);

        // Process use case stats
        const useCases = ws.useCases || [];
        useCases.forEach((uc) => {
          const useCase = uc.useCase;
          if (!useCase) return;

          const key = `${website}:${useCase}`;
          const existingUC = useCaseMap.get(key) || {
            useCase,
            website,
            totalTasks: 0,
            completedTasks: 0,
            successRate: 0,
            avgScore: 0,
            avgTime: 0,
          };

          const ucTasks = uc.tasks || 0;
          const ucCompleted = uc.successful || 0;
          const ucScore = (uc.averageScore || 0) * 100; // Convert to percentage
          const ucTime = uc.averageDuration || 0;

          const prevUCTotal = existingUC.totalTasks;
          existingUC.totalTasks += ucTasks;
          existingUC.completedTasks += ucCompleted;

          // Weighted average for score and time
          if (existingUC.totalTasks > 0) {
            existingUC.avgScore =
              (existingUC.avgScore * prevUCTotal + ucScore * ucTasks) /
              existingUC.totalTasks;
            existingUC.avgTime =
              (existingUC.avgTime * prevUCTotal + ucTime * ucTasks) /
              existingUC.totalTasks;
            existingUC.successRate =
              (existingUC.completedTasks / existingUC.totalTasks) * 100;
          }

          useCaseMap.set(key, existingUC);
        });
      });
    });

    return {
      websiteStats: Array.from(websiteMap.values()).sort(
        (a, b) => b.totalTasks - a.totalTasks
      ),
      useCaseStats: Array.from(useCaseMap.values()).sort(
        (a, b) => b.totalTasks - a.totalTasks
      ),
    };
  }, [aggregatedData]);

  // Filter use cases by selected website
  const filteredUseCases = useMemo(() => {
    if (!selectedWebsite) return useCaseStats;
    return useCaseStats.filter((uc) => uc.website === selectedWebsite);
  }, [useCaseStats, selectedWebsite]);

  // Filter website stats
  const displayedWebsites = useMemo(() => {
    if (!selectedWebsite) return websiteStats;
    return websiteStats.filter((ws) => ws.website === selectedWebsite);
  }, [websiteStats, selectedWebsite]);

  // Website options for dropdown
  const websiteOptions = useMemo(() => {
    const options = [{ label: "All Websites", value: "__all__" }];
    websiteStats.forEach((ws) => {
      options.push({
        label: formatWebsiteName(ws.website),
        value: ws.website,
      });
    });
    return options;
  }, [websiteStats]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Placeholder className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error || !websiteStats.length) {
    return null; // Don't show anything if no data
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-xl border p-4 sm:p-6 backdrop-blur-md"
        style={{
          borderColor: "#10B98166",
          background: "linear-gradient(to bottom right, #10B98126, #10B9811A)",
          boxShadow: "0 20px 45px rgba(16, 185, 129, 0.15)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
              <PiChartBar className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Historical Performance Analytics
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70">
                Accumulated results across all rounds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              options={websiteOptions}
              value={websiteOptions.find(
                (opt) => opt.value === (selectedWebsite ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setSelectedWebsite(
                  option.value === "__all__" ? null : option.value
                )
              }
              className="w-full sm:w-[180px] text-sm rounded-lg border border-emerald-500/40 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-100 focus:border-emerald-400/60 focus:ring-0 hover:border-emerald-400/50"
            />
          </div>
        </div>
      </div>

      {/* Website Performance Cards */}
      <div className="relative space-y-6">
        {displayedWebsites.map((ws, index) => {
          const projectColors = getProjectColors(ws.website);
          const isHighPerformance = ws.successRate >= 80;
          const isMediumPerformance =
            ws.successRate >= 60 && ws.successRate < 80;

          return (
            <div
              key={`${ws.website}-${index}`}
              className="group relative rounded-xl border p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl"
              style={{
                boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)",
                borderColor: `${projectColors.mainColor}99`,
                background: `linear-gradient(to bottom right, ${projectColors.mainColor}26, ${projectColors.mainColor}1A)`,
              }}
            >
              {/* Website Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: projectColors.dotColor }}
                  />
                  <span className="text-base sm:text-lg font-semibold text-white">
                    {formatWebsiteName(ws.website)}
                  </span>
                  <span className="text-xs sm:text-sm text-white/60 font-medium">
                    {ws.totalTasks} {ws.totalTasks === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-white">
                      {ws.successRate.toFixed(1)}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-white">
                      {ws.avgScore.toFixed(1)}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide">
                      Avg Score
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <PiClock className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium">
                      {ws.avgTime.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 sm:h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ws.successRate}%`,
                    background: isHighPerformance
                      ? "linear-gradient(to right, #10B981, #34D399)"
                      : isMediumPerformance
                        ? "linear-gradient(to right, #F59E0B, #FBBF24)"
                        : "linear-gradient(to right, #EF4444, #F87171)",
                    boxShadow: `0 0 12px ${
                      isHighPerformance
                        ? "#10B98166"
                        : isMediumPerformance
                          ? "#F59E0B66"
                          : "#EF444466"
                    }`,
                  }}
                />
              </div>

              {/* Use Cases Breakdown */}
              {filteredUseCases.filter((uc) => uc.website === ws.website)
                .length > 0 && (
                <div className="space-y-2">
                  <Text className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Use Cases
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {filteredUseCases
                      .filter((uc) => uc.website === ws.website)
                      .map((uc, ucIndex) => (
                        <div
                          key={`${uc.useCase}-${ucIndex}`}
                          className="relative rounded-lg p-2 sm:p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Text className="text-xs sm:text-sm font-medium text-white truncate flex-1">
                              {uc.useCase}
                            </Text>
                            <Text className="text-xs font-semibold text-white ml-2">
                              {uc.successRate.toFixed(0)}%
                            </Text>
                          </div>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/60">
                            <span>
                              {uc.completedTasks}/{uc.totalTasks} tasks
                            </span>
                            <span className="flex items-center gap-1">
                              <PiClock className="w-3 h-3" />
                              {uc.avgTime.toFixed(1)}s
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
