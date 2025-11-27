"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Text, Button } from "rizzui";
import {
  PiChartBar,
  PiClock,
  PiCaretDown,
  PiCaretRight,
  PiEyeDuotone,
} from "react-icons/pi";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import cn from "@core/utils/class-names";
import { formatWebsiteName, getProjectColors } from "@/utils/website-colors";
import { agentRunsRepository } from "@/repositories/agent-runs/agent-runs.repository";
import { tasksRepository } from "@/repositories/tasks/tasks.repository";
import type { AgentRunStats } from "@/repositories/agent-runs/agent-runs.types";
import type { TaskData } from "@/repositories/tasks/tasks.types";
import { routes } from "@/config/routes";
import Placeholder from "@/app/shared/placeholder";

interface AgentHistoricalAnalyticsProps {
  agentId: string | number;
  className?: string;
}

interface WebsiteStats {
  website: string; // Original website name for API calls
  displayName: string; // Formatted name for display
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  avgScore: number;
  avgTime: number;
}

interface UseCaseStats {
  useCase: string;
  website: string; // Original website name for API calls
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  avgScore: number;
  avgTime: number;
}

// Helper function to get color based on percentage
function getPercentageColor(percentage: number): string {
  if (percentage >= 75) return "#22C55E"; // green-500
  if (percentage >= 50) return "#EAB308"; // yellow-500
  if (percentage >= 25) return "#F97316"; // orange-500
  return "#EF4444"; // red-500
}

export default function AgentHistoricalAnalytics({
  agentId,
  className,
}: AgentHistoricalAnalyticsProps) {
  const router = useRouter();
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<{
    stats: AgentRunStats[];
    runIds: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expandable state
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [expandedUseCase, setExpandedUseCase] = useState<string | null>(null);

  // Task data state
  const [useCaseTasks, setUseCaseTasks] = useState<{
    [key: string]: {
      allTasks: TaskData[]; // All fetched tasks
      tasks: TaskData[]; // Current page tasks
      loading: boolean;
      total: number;
      page: number;
    };
  }>({});

  const TASKS_PER_PAGE = 10;

  // Fetch all agent runs and their stats for this agent
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const runsResponse = await agentRunsRepository.listAgentRuns({
          agentId: agentId.toString(),
          limit: 100,
          status: "completed",
          includeStats: true,
        });

        if (!isMounted) return;

        if (!runsResponse?.runs || runsResponse.runs.length === 0) {
          setAggregatedData({ stats: [], runIds: [] });
          setLoading(false);
          return;
        }

        // Extract run IDs for task filtering
        const runIds = runsResponse.runs.map((run) => run.runId);

        const validStats = runsResponse.runs
          .map((run) => run.stats)
          .filter((stats): stats is AgentRunStats => stats !== null && stats !== undefined);

        setAggregatedData({ stats: validStats, runIds });
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
          website, // Original lowercase name for API calls
          displayName: formatWebsiteName(website), // Formatted name for display
          totalTasks: 0,
          completedTasks: 0,
          successRate: 0,
          avgScore: 0,
          avgTime: 0,
        };

        const tasks = ws.tasks || 0;
        const completed = ws.successful || 0;
        const score = ws.averageScore || 0; // Already a percentage from backend
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
          const ucScore = uc.averageScore || 0; // Already a percentage from backend
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

  // Fetch tasks for a specific use case
  const fetchUseCaseTasks = useCallback(
    async (website: string, useCase: string, page: number = 1) => {
      const key = `${website}:${useCase}`;

      if (!aggregatedData?.runIds || aggregatedData.runIds.length === 0) {
        setUseCaseTasks((prev) => ({
          ...prev,
          [key]: {
            allTasks: [],
            tasks: [],
            loading: false,
            total: 0,
            page,
          },
        }));
        return;
      }

      // Check if we already have cached tasks - if so, just paginate
      setUseCaseTasks((prev) => {
        const cached = prev[key];
        if (cached?.allTasks && cached.allTasks.length > 0) {
          // Just paginate through cached results
          const startIndex = (page - 1) * TASKS_PER_PAGE;
          const endIndex = startIndex + TASKS_PER_PAGE;
          const paginatedTasks = cached.allTasks.slice(startIndex, endIndex);

          return {
            ...prev,
            [key]: {
              ...cached,
              tasks: paginatedTasks,
              page,
              loading: false,
            },
          };
        }

        // Not cached, set loading state
        return {
          ...prev,
          [key]: {
            ...prev[key],
            allTasks: [],
            tasks: [],
            loading: true,
            total: 0,
            page,
          },
        };
      });

      try {
        // Wait a tick to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Double-check if data was cached while we waited
        let shouldFetch = true;
        setUseCaseTasks((prev) => {
          if (prev[key]?.allTasks && prev[key].allTasks.length > 0) {
            shouldFetch = false;
          }
          return prev;
        });

        if (!shouldFetch) return;

        // Fetch tasks from all agent runs using the agent-runs endpoint
        // This endpoint supports website and useCase filtering
        const tasksPerRun = await Promise.all(
          aggregatedData.runIds.map((runId) =>
            agentRunsRepository
              .getAgentRunTasks(runId, {
                limit: 1000, // Get all tasks from this run
                website,
                useCase,
              })
              .then((res) => {
                const tasks = (res.tasks || []) as TaskData[];
                return tasks;
              })
              .catch((err) => {
                console.error(`Error fetching tasks from run ${runId}:`, err);
                return [];
              })
          )
        );

        // Flatten and sort all tasks by score
        const allTasks = tasksPerRun
          .flat()
          .sort((a, b) => (b.score || 0) - (a.score || 0));

        // Paginate client-side
        const startIndex = (page - 1) * TASKS_PER_PAGE;
        const endIndex = startIndex + TASKS_PER_PAGE;
        const paginatedTasks = allTasks.slice(startIndex, endIndex);

        setUseCaseTasks((prev) => ({
          ...prev,
          [key]: {
            allTasks, // Cache all tasks
            tasks: paginatedTasks,
            loading: false,
            total: allTasks.length,
            page,
          },
        }));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setUseCaseTasks((prev) => ({
          ...prev,
          [key]: {
            allTasks: [],
            tasks: [],
            loading: false,
            total: 0,
            page,
          },
        }));
      }
    },
    [aggregatedData?.runIds]
  );

  // Toggle use case expansion
  const toggleUseCase = useCallback(
    (website: string, useCase: string) => {
      const key = `${website}:${useCase}`;

      if (expandedUseCase === key) {
        setExpandedUseCase(null);
      } else {
        setExpandedUseCase(key);
        // Fetch tasks if not already loaded
        if (!useCaseTasks[key]) {
          fetchUseCaseTasks(website, useCase, 1);
        }
      }
    },
    [expandedUseCase, useCaseTasks, fetchUseCaseTasks]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (website: string, useCase: string, newPage: number) => {
      const key = `${website}:${useCase}`;
      const taskData = useCaseTasks[key];

      if (!taskData) {
        fetchUseCaseTasks(website, useCase, newPage);
        return;
      }

      // Since we fetch all tasks at once, we just need to re-slice for pagination
      fetchUseCaseTasks(website, useCase, newPage);
    },
    [fetchUseCaseTasks, useCaseTasks]
  );

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header Skeleton */}
        <div
          className="relative overflow-hidden rounded-xl border p-4 sm:p-6 backdrop-blur-md animate-pulse"
          style={{
            borderColor: "#10B98166",
            background:
              "linear-gradient(to bottom right, #10B98126, #10B9811A)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 w-10 h-10" />
              <div className="space-y-2">
                <div className="h-7 w-64 bg-white/10 rounded" />
                <div className="h-4 w-48 bg-white/10 rounded" />
              </div>
            </div>
            <div className="h-10 w-full sm:w-[180px] bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Pie Chart Skeleton */}
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm animate-pulse">
          <div className="mb-4">
            <div className="h-6 w-52 bg-white/10 rounded mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded" />
          </div>
          <div className="flex justify-center items-center h-[240px]">
            <div className="w-[200px] h-[200px] rounded-full border-8 border-white/10" />
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="w-3 h-3 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Website Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative rounded-xl border p-3 sm:p-5 animate-pulse"
              style={{
                borderColor: "rgba(100, 116, 139, 0.6)",
                background:
                  "linear-gradient(to bottom right, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.1))",
              }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="h-5 w-32 bg-white/10 rounded" />
                  <div className="h-4 w-16 bg-white/10 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <div className="h-5 w-16 bg-white/10 rounded ml-auto" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 w-16 bg-white/10 rounded ml-auto" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-white/10 rounded" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 sm:h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                <div className="absolute top-0 left-0 h-full w-2/3 rounded-full bg-white/20" />
              </div>

              {/* Use Cases Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-6 w-24 bg-white/10 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="rounded-lg p-2 sm:p-3 bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-white/10 rounded" />
                        <div className="h-3 w-12 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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

      {/* Performance Breakdown Pie Chart */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm"
        style={
          selectedWebsite && displayedWebsites[0]
            ? (() => {
                const projectColors = getProjectColors(
                  displayedWebsites[0].website
                );
                return {
                  borderColor: `${projectColors.mainColor}99`,
                  background: `linear-gradient(to bottom right, ${projectColors.mainColor}26, ${projectColors.mainColor}1A)`,
                };
              })()
            : {
                borderColor: "rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.05)",
              }
        }
      >
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {selectedWebsite && displayedWebsites[0] && (
              <div
                className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                style={{
                  backgroundColor: getProjectColors(
                    displayedWebsites[0].website
                  ).dotColor,
                }}
              />
            )}
            <h3 className="text-lg font-bold text-white">
              Performance Breakdown
            </h3>
          </div>
          <p className="text-xs text-white/60">
            {selectedWebsite
              ? "Success rate by use case"
              : "Success rate by website"}
          </p>
        </div>

        {(() => {
          // Calculate overall stats for pie chart
          const totalTasks = displayedWebsites.reduce(
            (sum, ws) => sum + ws.totalTasks,
            0
          );
          const totalCompleted = displayedWebsites.reduce(
            (sum, ws) => sum + ws.completedTasks,
            0
          );
          const overallSuccessRate =
            totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

          // Helper function to generate color variations
          const generateColorVariations = (
            baseColor: string,
            count: number
          ) => {
            // Convert hex to RGB
            const hex = baseColor.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            const colors: string[] = [];
            for (let i = 0; i < count; i++) {
              // Generate variations by adjusting brightness
              const factor = 0.6 + (i / Math.max(count - 1, 1)) * 0.7; // Range from 0.6 to 1.3
              const newR = Math.min(255, Math.round(r * factor));
              const newG = Math.min(255, Math.round(g * factor));
              const newB = Math.min(255, Math.round(b * factor));
              colors.push(
                `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
              );
            }
            return colors;
          };

          // Prepare donut data based on selection
          // If website is selected, show use cases; otherwise show websites
          const donutData = selectedWebsite
            ? // Show use cases for selected website with color variations
              (() => {
                const selectedWs = displayedWebsites[0];
                if (!selectedWs) return [];

                const projectColors = getProjectColors(selectedWs.website);
                const colorVariations = generateColorVariations(
                  projectColors.mainColor,
                  filteredUseCases.length
                );

                return filteredUseCases.map((uc, idx) => ({
                  name: uc.useCase,
                  value: uc.completedTasks,
                  fill: colorVariations[idx] || projectColors.mainColor,
                  stroke: colorVariations[idx] || projectColors.mainColor,
                  percentage:
                    totalTasks > 0 ? (uc.completedTasks / totalTasks) * 100 : 0,
                }));
              })()
            : // Show websites with their specific colors
              displayedWebsites.map((ws) => {
                const projectColors = getProjectColors(ws.website);
                return {
                  name: ws.displayName,
                  value: ws.completedTasks,
                  fill: projectColors.mainColor,
                  stroke: projectColors.mainColor,
                  percentage:
                    totalTasks > 0 ? (ws.completedTasks / totalTasks) * 100 : 0,
                };
              });

          // If no data or all values are 0, show a neutral empty state
          const hasData =
            donutData.length > 0 && donutData.some((d) => d.value > 0);
          const displayData = hasData
            ? donutData
            : [
                {
                  name: "No Data",
                  value: 1,
                  fill: "#64748B", // slate-500
                  stroke: "#64748B",
                  percentage: 0,
                },
              ];

          return (
            <div className="relative text-white/80">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayData}
                      innerRadius={85}
                      outerRadius={100}
                      paddingAngle={hasData && displayData.length > 1 ? 5 : 0}
                      cornerRadius={30}
                      dataKey="value"
                      isAnimationActive={true}
                    >
                      <Label
                        position="center"
                        content={(props) => (
                          <CenterLabel
                            value={overallSuccessRate.toFixed(0)}
                            totalRequests={totalTasks.toString()}
                            totalSuccesses={totalCompleted.toString()}
                            viewBox={props.viewBox}
                          />
                        )}
                      />
                      {displayData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.fill}
                          stroke={entry.stroke}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              {hasData && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {displayData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-white/60">
                          {item.value} tasks ({item.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!hasData && (
                <div className="mt-6 text-center text-white/40 text-sm"></div>
              )}
            </div>
          );
        })()}
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
                    {ws.displayName}
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
                    backgroundColor: projectColors.mainColor,
                    boxShadow: `0 0 12px ${projectColors.mainColor}66`,
                  }}
                />
              </div>

              {/* Use Cases Breakdown */}
              {filteredUseCases.filter((uc) => uc.website === ws.website)
                .length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Text className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                      Use Cases
                    </Text>
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => {
                        const newState =
                          expandedWebsite === ws.website ? null : ws.website;
                        setExpandedWebsite(newState);

                        // Auto-load tasks for all use cases when expanding
                        if (newState === ws.website) {
                          filteredUseCases
                            .filter((uc) => uc.website === ws.website)
                            .forEach((uc) => {
                              const key = `${uc.website}:${uc.useCase}`;
                              // Only fetch if not already loaded
                              if (!useCaseTasks[key]) {
                                fetchUseCaseTasks(uc.website, uc.useCase, 1);
                              }
                            });
                        }
                      }}
                      className="text-white/60 hover:text-white text-xs flex items-center gap-1"
                    >
                      {expandedWebsite === ws.website ? (
                        <>
                          <PiCaretDown className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <PiCaretRight className="w-4 h-4" />
                          Show Details
                        </>
                      )}
                    </Button>
                  </div>

                  {expandedWebsite === ws.website ? (
                    <div className="space-y-2">
                      {filteredUseCases
                        .filter((uc) => uc.website === ws.website)
                        .map((uc, ucIndex) => {
                          const key = `${uc.website}:${uc.useCase}`;
                          const taskData = useCaseTasks[key];

                          return (
                            <div
                              key={`${uc.useCase}-${ucIndex}`}
                              className="relative rounded-lg border border-white/10 bg-white/5 overflow-hidden"
                            >
                              {/* Use Case Header - Simplified */}
                              <div className="p-3 flex items-center justify-between bg-white/5">
                                <div className="flex-1">
                                  <Text className="text-xs sm:text-sm font-semibold text-white">
                                    {uc.useCase}
                                  </Text>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Text className="text-[10px] sm:text-xs text-white/60">
                                      {uc.completedTasks}/{uc.totalTasks} tasks
                                    </Text>
                                    <span
                                      className="text-[10px] sm:text-xs font-bold"
                                      style={{
                                        color: getPercentageColor(
                                          uc.successRate
                                        ),
                                      }}
                                    >
                                      {uc.successRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Task Table - Always show when website is expanded */}
                              <div className="border-t border-white/10 bg-black/20">
                                {taskData?.loading ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm table-fixed min-w-[700px]">
                                      <thead className="bg-white/5">
                                        <tr>
                                          <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[240px]">
                                            Task ID
                                          </th>
                                          <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">
                                            Prompt
                                          </th>
                                          <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[60px] sm:w-[80px]">
                                            Score
                                          </th>
                                          <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[70px] sm:w-[90px]">
                                            Duration
                                          </th>
                                          <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[80px] sm:w-[110px]">
                                            Action
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <tr
                                            key={i}
                                            className="border-t border-white/5 animate-pulse"
                                          >
                                            <td className="p-2 sm:p-3">
                                              <div
                                                className="h-4 rounded"
                                                style={{
                                                  backgroundColor: `${projectColors.mainColor}20`,
                                                }}
                                              />
                                            </td>
                                            <td className="p-2 sm:p-3">
                                              <div className="space-y-2">
                                                <div
                                                  className="h-3 rounded w-3/4"
                                                  style={{
                                                    backgroundColor: `${projectColors.mainColor}20`,
                                                  }}
                                                />
                                                <div
                                                  className="h-3 rounded w-1/2"
                                                  style={{
                                                    backgroundColor: `${projectColors.mainColor}20`,
                                                  }}
                                                />
                                              </div>
                                            </td>
                                            <td className="p-2 sm:p-3">
                                              <div className="flex justify-center">
                                                <div
                                                  className="h-6 w-12 rounded"
                                                  style={{
                                                    backgroundColor: `${projectColors.mainColor}20`,
                                                  }}
                                                />
                                              </div>
                                            </td>
                                            <td className="p-2 sm:p-3">
                                              <div className="flex justify-center">
                                                <div
                                                  className="h-4 w-10 rounded"
                                                  style={{
                                                    backgroundColor: `${projectColors.mainColor}20`,
                                                  }}
                                                />
                                              </div>
                                            </td>
                                            <td className="p-2 sm:p-3">
                                              <div className="flex justify-center">
                                                <div
                                                  className="h-6 w-16 rounded"
                                                  style={{
                                                    backgroundColor: `${projectColors.mainColor}20`,
                                                  }}
                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : taskData?.tasks?.length > 0 ? (
                                  <>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm table-fixed min-w-[700px]">
                                        <thead className="bg-white/5">
                                          <tr>
                                            <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[240px]">
                                              Task ID
                                            </th>
                                            <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">
                                              Prompt
                                            </th>
                                            <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[60px] sm:w-[80px]">
                                              Score
                                            </th>
                                            <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[70px] sm:w-[90px]">
                                              Duration
                                            </th>
                                            <th className="text-center p-2 sm:p-3 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider w-[80px] sm:w-[110px]">
                                              Action
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {taskData.tasks.map((task) => (
                                            <tr
                                              key={task.taskId}
                                              className="border-t border-white/5 hover:bg-white/5 transition-colors"
                                            >
                                              <td className="p-2 sm:p-3">
                                                <span className="font-mono text-[10px] sm:text-xs text-white/90 break-all">
                                                  {task.taskId}
                                                </span>
                                              </td>
                                              <td className="p-2 sm:p-3">
                                                <span className="text-[10px] sm:text-xs text-white/80 line-clamp-2">
                                                  {task.prompt || "—"}
                                                </span>
                                              </td>
                                              <td className="p-2 sm:p-3 text-center">
                                                <span
                                                  className={cn(
                                                    "inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold",
                                                    (task.score || 0) >= 0.8
                                                      ? "bg-emerald-500/20 text-emerald-300"
                                                      : (task.score || 0) >= 0.5
                                                        ? "bg-yellow-500/20 text-yellow-300"
                                                        : "bg-red-500/20 text-red-300"
                                                  )}
                                                >
                                                  {Math.round(
                                                    (task.score || 0) * 100
                                                  )}
                                                  %
                                                </span>
                                              </td>
                                              <td className="p-2 sm:p-3 text-center">
                                                <span className="text-[10px] sm:text-xs text-white/70">
                                                  {task.duration?.toFixed(1) ||
                                                    "—"}
                                                  s
                                                </span>
                                              </td>
                                              <td className="p-2 sm:p-3 text-center">
                                                <Button
                                                  size="sm"
                                                  variant="text"
                                                  onClick={() =>
                                                    router.push(
                                                      `${routes.tasks}/${task.taskId}`
                                                    )
                                                  }
                                                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs"
                                                >
                                                  <PiEyeDuotone className="w-3 h-3 sm:w-4 sm:h-4" />
                                                  <span className="hidden sm:inline">
                                                    Inspect
                                                  </span>
                                                  <span className="sm:hidden">
                                                    View
                                                  </span>
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Pagination */}
                                    {taskData.total > TASKS_PER_PAGE && (
                                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-white/10">
                                        <Text className="text-[10px] sm:text-xs text-white/60 text-center sm:text-left">
                                          Showing{" "}
                                          {(taskData.page - 1) *
                                            TASKS_PER_PAGE +
                                            1}{" "}
                                          to{" "}
                                          {Math.min(
                                            taskData.page * TASKS_PER_PAGE,
                                            taskData.total
                                          )}{" "}
                                          of {taskData.total} tasks
                                        </Text>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handlePageChange(
                                                uc.website,
                                                uc.useCase,
                                                taskData.page - 1
                                              )
                                            }
                                            disabled={taskData.page === 1}
                                            className="text-white/70 hover:text-white border-white/20 text-[10px] sm:text-xs px-2 sm:px-3"
                                          >
                                            Previous
                                          </Button>
                                          <span className="text-[10px] sm:text-xs text-white/70 whitespace-nowrap">
                                            Page {taskData.page} of{" "}
                                            {Math.ceil(
                                              taskData.total / TASKS_PER_PAGE
                                            )}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handlePageChange(
                                                uc.website,
                                                uc.useCase,
                                                taskData.page + 1
                                              )
                                            }
                                            disabled={
                                              taskData.page >=
                                              Math.ceil(
                                                taskData.total / TASKS_PER_PAGE
                                              )
                                            }
                                            className="text-white/70 hover:text-white border-white/20 text-[10px] sm:text-xs px-2 sm:px-3"
                                          >
                                            Next
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="p-4 text-center text-white/60 text-sm">
                                    No tasks found for this use case
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                      {filteredUseCases
                        .filter((uc) => uc.website === ws.website)
                        .map((uc, ucIndex) => (
                          <div
                            key={`${uc.useCase}-${ucIndex}`}
                            className="relative rounded-lg p-2 sm:p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Text className="text-xs sm:text-sm font-medium text-white truncate flex-1">
                                {uc.useCase}
                              </Text>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Text className="text-xs text-white/60">
                                  {uc.completedTasks}/{uc.totalTasks}
                                </Text>
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: getPercentageColor(uc.successRate),
                                  }}
                                >
                                  {uc.successRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Constants for pie chart
const HIGHLIGHT_COLOR = "#FDF5E6";
const PROGRESS_COLORS = [
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#84CC16", // lime-500
  "#22C55E", // green-500
  "#10B981", // emerald-500
  "#14B8A6", // teal-500
  "#06B6D4", // cyan-500
  "#0EA5E9", // sky-500
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#A855F7", // purple-500
  "#D946EF", // fuchsia-500
  "#EC4899", // pink-500
  "#F43F5E", // rose-500
];

// Center label component for pie chart
function CenterLabel({
  value,
  totalRequests,
  totalSuccesses,
  viewBox,
}: {
  value: string;
  totalRequests: string;
  totalSuccesses: string;
  viewBox: any;
}) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 20}
        fill={HIGHLIGHT_COLOR}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 12px 28px rgba(253, 245, 230, 0.35)",
        }}
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="14" fontWeight="600">
          Requests · {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#94A3B8"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="12" fontWeight="500">
          Success · {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
