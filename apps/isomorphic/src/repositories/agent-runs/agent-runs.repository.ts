/**
 * Agent Runs API Service
 * Handles all API calls related to agent evaluation runs
 */

import { apiClient } from "../client";
import type {
  AgentRunData,
  AgentRunStats,
  AgentRunSummary,
  AgentRunPersonas,
  AgentRunTaskData,
  AgentRunEvaluationData, // Added
  AgentRunDetailsResponse,
  AgentRunStatsResponse,
  AgentRunSummaryResponse,
  AgentRunPersonasResponse,
  AgentRunTasksResponse,
  AgentRunQueryParams,
  AgentRunTasksQueryParams,
  AgentRunPartialData,
  AgentRunListItem,
  AgentRunsListQueryParams,
  AgentRunsListResponse,
  PaginatedResult,
} from "./agent-runs.types";

export class AgentRunsRepository {
  private readonly baseEndpoint = "/api/v1/agent-runs";

  /**
   * Get details for a specific agent run
   */
  async getAgentRun(
    runId: string,
    params?: AgentRunQueryParams
  ): Promise<AgentRunData> {
    const response = await apiClient.get<AgentRunDetailsResponse>(
      `${this.baseEndpoint}/${runId}`,
      params
    );
    return response.data.data.run;
  }

  /**
   * Get personas data for an agent run (round, validator, agent info)
   */
  async getAgentRunPersonas(runId: string): Promise<AgentRunPersonas> {
    try {
      const response = await apiClient.get<AgentRunPersonasResponse>(
        `${this.baseEndpoint}/${runId}/personas`
      );
      return response.data.data.personas;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || "Failed to fetch agent run personas");
    }
  }

  /**
   * Get statistics for an agent run
   */
  async getAgentRunStats(runId: string): Promise<AgentRunStats> {
    try {
      const response = await apiClient.get<AgentRunStatsResponse>(
        `${this.baseEndpoint}/${runId}/stats`
      );
      const payload: any = response.data.data;
      const rawStats = payload?.stats ?? payload?.statistics;

      if (!rawStats) {
        throw new Error("Agent run statistics response was empty");
      }

      return this.normalizeStats(rawStats as AgentRunStats);
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || "Failed to fetch agent run statistics");
    }
  }

  /**
   * Get summary for an agent run
   */
  async getAgentRunSummary(runId: string): Promise<AgentRunSummary> {
    try {
      const response = await apiClient.get<AgentRunSummaryResponse>(
        `${this.baseEndpoint}/${runId}/summary`
      );
      return this.normalizeSummary(response.data.data.summary);
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || "Failed to fetch agent run summary");
    }
  }

  /**
   * Get tasks for an agent run with pagination
   */
  async getAgentRunTasks(
    runId: string,
    params?: AgentRunTasksQueryParams
  ): Promise<{
    tasks: AgentRunTaskData[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get<AgentRunTasksResponse>(
        `${this.baseEndpoint}/${runId}/tasks`,
        params
      );
      const payload = response.data.data;
      const tasks = payload.tasks ?? [];
      const total = payload.total ?? tasks.length;
      const page = payload.page ?? params?.page ?? 1;
      const limit = payload.limit ?? params?.limit ?? (tasks.length || 1);

      return {
        tasks,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || "Failed to fetch agent run tasks");
    }
  }

  /**
   * List agent runs with optional filtering
   */
  async listAgentRuns(params?: AgentRunsListQueryParams): Promise<{
    runs: AgentRunListItem[];
    total: number;
    page: number;
    limit: number;
    facets?: AgentRunsListResponse["data"]["facets"];
  }> {
    const response = await apiClient.get<AgentRunsListResponse>(
      this.baseEndpoint,
      params
    );
    return {
      runs: response.data.data.runs,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
      facets: response.data.data.facets,
    };
  }

  /**
   * Get all agent runs for a specific agent
   */
  async getAgentRuns(
    agentId: string,
    params?: {
      page?: number;
      limit?: number;
      roundId?: number;
      validatorId?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<PaginatedResult<AgentRunListItem>> {
    const response = await apiClient.get<AgentRunsListResponse>(
      this.baseEndpoint,
      { ...(params ?? {}), agentId }
    );
    return {
      runs: response.data.data.runs,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
    };
  }

  /**
   * Get agent runs by round
   */
  async getAgentRunsByRound(
    roundId: number,
    params?: {
      page?: number;
      limit?: number;
      validatorId?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{
    runs: AgentRunData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<{
      data: {
        runs: AgentRunData[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`${this.baseEndpoint}/rounds/${roundId}/agent-runs`, params);
    return response.data.data;
  }

  /**
   * Get agent runs by validator
   */
  async getAgentRunsByValidator(
    validatorId: string,
    params?: {
      page?: number;
      limit?: number;
      roundId?: number;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{
    runs: AgentRunData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<{
      data: {
        runs: AgentRunData[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`${this.baseEndpoint}/validators/${validatorId}/agent-runs`, params);
    return response.data.data;
  }

  /**
   * Get all agent run data in a single call
   */
  async getAgentRunComplete(runId: string): Promise<{
    statistics: AgentRunStats | null;
    evaluations: AgentRunEvaluationData[]; // Changed from tasks to evaluations
    info: {
      agentRunId: string;
      round: any;
      validator: any;
      miner: any;
      /** Reason for score 0 when applicable */
      zeroReason?: string | null;
      isReused?: boolean;
      reusedFromAgentRunId?: string | null;
      reusedFrom?: {
        agentRunId?: string | null;
        validatorRoundId?: string | null;
        roundNumber?: number | null;
        seasonNumber?: number | null;
      } | null;
    };
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          statistics: AgentRunStats | null;
          evaluations: AgentRunEvaluationData[]; // Changed from tasks to evaluations
          info: {
            agentRunId: string;
            round: any;
            validator: any;
            miner: any;
            zeroReason?: string | null;
            isReused?: boolean;
            reusedFromAgentRunId?: string | null;
            reusedFrom?: {
              agentRunId?: string | null;
              validatorRoundId?: string | null;
              roundNumber?: number | null;
              seasonNumber?: number | null;
            } | null;
          };
        };
      }>(`${this.baseEndpoint}/${runId}/get-agent-run`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || "Failed to fetch agent run complete data");
    }
  }

  /**
   * Get partial data for an agent run (for progressive loading)
   */
  async getAgentRunPartialData(
    runId: string,
    options: {
      includePersonas?: boolean;
      includeStats?: boolean;
      includeSummary?: boolean;
      includeTasks?: boolean;
    } = {}
  ): Promise<AgentRunPartialData> {
    const {
      includePersonas = true,
      includeStats = true,
      includeSummary = true,
      includeTasks = true,
    } = options;

    const result: AgentRunPartialData = {
      loading: {
        personas: includePersonas,
        stats: includeStats,
        summary: includeSummary,
        tasks: includeTasks,
      },
      errors: {},
    };

    // Execute all requests in parallel
    const promises: Promise<any>[] = [];

    if (includePersonas) {
      promises.push(
        this.getAgentRunPersonas(runId)
          .then((data) => {
            result.personas = data;
            result.loading.personas = false;
          })
          .catch((error) => {
            result.errors.personas = error.message;
            result.loading.personas = false;
          })
      );
    }

    if (includeStats) {
      promises.push(
        this.getAgentRunStats(runId)
          .then((data) => {
            result.stats = data;
            result.loading.stats = false;
          })
          .catch((error) => {
            result.errors.stats = error.message;
            result.loading.stats = false;
          })
      );
    }

    if (includeSummary) {
      promises.push(
        this.getAgentRunSummary(runId)
          .then((data) => {
            result.summary = data;
            result.loading.summary = false;
          })
          .catch((error) => {
            result.errors.summary = error.message;
            result.loading.summary = false;
          })
      );
    }

    if (includeTasks) {
      promises.push(
        this.getAgentRunTasks(runId, { limit: 20 })
          .then((data) => {
            result.tasks = data.tasks;
            result.loading.tasks = false;
          })
          .catch((error) => {
            result.errors.tasks = error.message;
            result.loading.tasks = false;
          })
      );
    }

    await Promise.allSettled(promises);
    return result;
  }

  /**
   * Get agent run performance comparison
   */
  async compareAgentRuns(runIds: string[]): Promise<{
    runs: AgentRunData[];
    comparison: {
      bestReward: string;
      fastest: string;
      mostTasks: string;
      bestSuccessRate: string;
    };
  }> {
    const response = await apiClient.post<{
      data: {
        runs: AgentRunData[];
        comparison: any;
      };
    }>(`${this.baseEndpoint}/compare`, { runIds });
    return response.data.data;
  }

  /**
   * Get agent run timeline
   */
  async getAgentRunTimeline(runId: string): Promise<{
    events: {
      timestamp: string;
      type:
        | "task_started"
        | "task_completed"
        | "task_failed"
        | "run_started"
        | "run_completed";
      taskId?: string;
      message: string;
      metadata?: Record<string, any>;
    }[];
  }> {
    const response = await apiClient.get<{
      data: {
        events: any[];
      };
    }>(`${this.baseEndpoint}/${runId}/timeline`);
    return response.data.data;
  }

  /**
   * Get agent run logs
   */
  async getAgentRunLogs(
    runId: string,
    params?: {
      level?: "info" | "warn" | "error" | "debug";
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    logs: {
      timestamp: string;
      level: string;
      message: string;
      metadata?: Record<string, any>;
    }[];
    total: number;
  }> {
    const response = await apiClient.get<{
      data: {
        logs: any[];
        total: number;
      };
    }>(`${this.baseEndpoint}/${runId}/logs`, params);
    return response.data.data;
  }

  /**
   * Get agent run metrics
   */
  async getAgentRunMetrics(runId: string): Promise<{
    metrics: {
      cpu: { timestamp: string; value: number }[];
      memory: { timestamp: string; value: number }[];
      network: { timestamp: string; value: number }[];
      duration: number;
      peakCpu: number;
      peakMemory: number;
      totalNetworkTraffic: number;
    };
  }> {
    const response = await apiClient.get<{
      data: {
        metrics: any;
      };
    }>(`${this.baseEndpoint}/${runId}/metrics`);
    return response.data.data;
  }

  private normalizePercentage(
    value: number | null | undefined,
    decimals: number = 1
  ): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return 0;
    }
    const scaled = value > 1 ? value : value * 100;
    const factor = Math.pow(10, decimals);
    return Math.round(scaled * factor) / factor;
  }

  private roundTo(
    value: number | null | undefined,
    decimals: number = 1
  ): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return 0;
    }
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  private getNumberWithFallback(
    source: Record<string, any>,
    keys: string[],
    defaultValue = 0
  ): number {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
      }
    }
    return defaultValue;
  }

  private normalizeStats(
    stats: AgentRunStats | Record<string, any>
  ): AgentRunStats {
    const raw = stats as Record<string, any>;
    const rawScoreDistribution =
      raw.scoreDistribution ?? raw.score_distribution ?? {};

    const performanceByWebsiteSource =
      raw.performanceByWebsite ?? raw.performance_by_website ?? [];
    const performanceByUseCaseSource =
      raw.performanceByUseCase ??
      raw.performance_by_use_case ??
      raw.use_case_performance ??
      [];

    const normalizedWebsites = Array.isArray(performanceByWebsiteSource)
      ? performanceByWebsiteSource.map((entry: Record<string, any>) => {
          // Normalize the useCases nested within each website
          const useCasesSource = entry.useCases ?? entry.use_cases ?? [];
          const normalizedUseCases = Array.isArray(useCasesSource)
            ? useCasesSource.map((uc: Record<string, any>) => ({
                useCase: uc.useCase ?? uc.use_case ?? uc.name ?? "",
                tasks: this.getNumberWithFallback(
                  uc,
                  ["tasks", "total_tasks", "total"],
                  0
                ),
                successful: this.getNumberWithFallback(
                  uc,
                  ["successful", "successful_tasks", "successes"],
                  0
                ),
                failed: this.getNumberWithFallback(
                  uc,
                  ["failed", "failed_tasks", "failures"],
                  0
                ),
                averageScore: this.normalizePercentage(
                  this.getNumberWithFallback(
                    uc,
                    ["averageScore", "average_score", "score", "success_rate"],
                    0
                  )
                ),
                averageDuration: this.roundTo(
                  this.getNumberWithFallback(
                    uc,
                    [
                      "averageDuration",
                      "average_duration",
                      "duration",
                      "avg_duration",
                    ],
                    1
                  ),
                  1
                ),
              }))
            : [];

          return {
            website: entry.website ?? entry.name ?? "",
            tasks: this.getNumberWithFallback(
              entry,
              ["tasks", "total_tasks", "total"],
              0
            ),
            successful: this.getNumberWithFallback(
              entry,
              ["successful", "successful_tasks", "successes"],
              0
            ),
            failed: this.getNumberWithFallback(
              entry,
              ["failed", "failed_tasks", "failures"],
              0
            ),
            averageScore: this.normalizePercentage(
              this.getNumberWithFallback(
                entry,
                ["averageScore", "average_score", "score", "success_rate"],
                0
              )
            ),
            averageDuration: this.roundTo(
              this.getNumberWithFallback(
                entry,
                [
                  "averageDuration",
                  "average_duration",
                  "duration",
                  "avg_duration",
                ],
                1
              ),
              1
            ),
            useCases: normalizedUseCases,
          };
        })
      : [];

    const normalizedUseCases = Array.isArray(performanceByUseCaseSource)
      ? performanceByUseCaseSource.map((entry: Record<string, any>) => ({
          useCase: entry.useCase ?? entry.use_case ?? entry.name ?? "",
          tasks: this.getNumberWithFallback(
            entry,
            ["tasks", "total_tasks", "total"],
            0
          ),
          successful: this.getNumberWithFallback(
            entry,
            ["successful", "successful_tasks", "successes"],
            0
          ),
          failed: this.getNumberWithFallback(
            entry,
            ["failed", "failed_tasks", "failures"],
            0
          ),
          averageScore: this.normalizePercentage(
            this.getNumberWithFallback(
              entry,
              ["averageScore", "average_score", "score", "success_rate"],
              0
            )
          ),
          averageDuration: this.roundTo(
            this.getNumberWithFallback(
              entry,
              [
                "averageDuration",
                "average_duration",
                "duration",
                "avg_duration",
              ],
              1
            ),
            1
          ),
        }))
      : [];

    const normalizedScoreDistribution = {
      excellent: this.getNumberWithFallback(
        rawScoreDistribution,
        ["excellent", "excellent_count"],
        0
      ),
      good: this.getNumberWithFallback(
        rawScoreDistribution,
        ["good", "good_count"],
        0
      ),
      average: this.getNumberWithFallback(
        rawScoreDistribution,
        ["average", "average_count"],
        0
      ),
      poor: this.getNumberWithFallback(
        rawScoreDistribution,
        ["poor", "poor_count"],
        0
      ),
    };

    return {
      runId: raw.runId ?? raw.run_id ?? "",
      overallReward: this.normalizePercentage(
        this.getNumberWithFallback(
          raw,
          ["overallReward", "overall_reward", "overallScore", "overall_score", "reward", "score"],
          0
        )
      ),
      totalTasks: this.getNumberWithFallback(
        raw,
        ["totalTasks", "total_tasks", "total"],
        0
      ),
      successfulTasks: this.getNumberWithFallback(
        raw,
        ["successfulTasks", "successful_tasks", "successes"],
        0
      ),
      failedTasks: this.getNumberWithFallback(
        raw,
        ["failedTasks", "failed_tasks", "failures"],
        0
      ),
      websites:
        this.getNumberWithFallback(
          raw,
          ["websites", "websiteCount", "website_count"],
          0
        ) || normalizedWebsites.length,
      avg_reward: this.normalizePercentage(
        this.getNumberWithFallback(raw, ["avg_reward", "averageReward", "average_reward"], 0)
      ),
      avg_time: this.roundTo(
        this.getNumberWithFallback(raw, ["avg_time", "averageTime", "average_time"], 0),
        1
      ),
      averageTaskDuration: this.roundTo(
        this.getNumberWithFallback(
          raw,
          ["averageTaskDuration", "average_task_duration", "avg_task_duration"],
          1
        ),
        1
      ),
      successRate: this.normalizePercentage(
        this.getNumberWithFallback(raw, ["successRate", "success_rate"], 0)
      ),
      scoreDistribution: normalizedScoreDistribution,
      performanceByWebsite: normalizedWebsites,
      performanceByUseCase: normalizedUseCases,
    };
  }

  private normalizeSummary(
    summary: AgentRunSummary | Record<string, any>
  ): AgentRunSummary {
    const raw = summary as Record<string, any>;
    const rawTopWebsite =
      raw.topPerformingWebsite ??
      raw.top_performing_website ??
      raw.best_website;
    const rawTopUseCase =
      raw.topPerformingUseCase ??
      raw.top_performing_use_case ??
      raw.best_use_case;

    const normalizedTopWebsite = rawTopWebsite
      ? {
          website: rawTopWebsite.website ?? rawTopWebsite.name ?? "",
          averageEvalScore: this.normalizePercentage(
            this.getNumberWithFallback(
              rawTopWebsite,
              ["averageEvalScore", "average_eval_score", "score", "success_rate", "averageScore", "average_score"],
              0
            )
          ),
          tasks: this.getNumberWithFallback(
            rawTopWebsite,
            ["tasks", "total_tasks", "total"],
            0
          ),
        }
      : {
          website: "",
          averageEvalScore: 0,
          tasks: 0,
        };

    const normalizedTopUseCase = rawTopUseCase
      ? {
          useCase:
            rawTopUseCase.useCase ??
            rawTopUseCase.use_case ??
            rawTopUseCase.name ??
            "",
          averageEvalScore: this.normalizePercentage(
            this.getNumberWithFallback(
              rawTopUseCase,
              ["averageEvalScore", "average_eval_score", "score", "success_rate", "averageScore", "average_score"],
              0
            )
          ),
          tasks: this.getNumberWithFallback(
            rawTopUseCase,
            ["tasks", "total_tasks", "total"],
            0
          ),
        }
      : {
          useCase: "",
          averageEvalScore: 0,
          tasks: 0,
        };

    const recentActivity = raw.recentActivity ?? raw.recent_activity;
    const rankingValue = this.getNumberWithFallback(
      raw,
      ["ranking", "rank"],
      Number.NaN
    );

    const baseSummary: AgentRunSummary = {
      runId: raw.runId ?? raw.run_id ?? "",
      agentId: raw.agentId ?? raw.agent_id ?? "",
      roundId: this.getNumberWithFallback(raw, ["roundId", "round_id"], 0),
      validatorId: raw.validatorId ?? raw.validator_id ?? "",
      startTime: raw.startTime ?? raw.start_time ?? "",
      endTime: raw.endTime ?? raw.end_time,
      status: raw.status ?? "",
      overallReward: this.normalizePercentage(
        this.getNumberWithFallback(
          raw,
          ["overallReward", "overall_reward", "overallScore", "overall_score", "reward", "score"],
          0
        )
      ),
      totalTasks: this.getNumberWithFallback(
        raw,
        ["totalTasks", "total_tasks", "total"],
        0
      ),
      successfulTasks: this.getNumberWithFallback(
        raw,
        ["successfulTasks", "successful_tasks", "successes"],
        0
      ),
      failedTasks: this.getNumberWithFallback(
        raw,
        ["failedTasks", "failed_tasks", "failures"],
        0
      ),
      duration: Math.max(
        this.getNumberWithFallback(
          raw,
          ["duration", "total_duration", "run_duration"],
          0
        ),
        0
      ),
      topPerformingWebsite: normalizedTopWebsite,
      topPerformingUseCase: normalizedTopUseCase,
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
    };

    if (!Number.isNaN(rankingValue)) {
      baseSummary.ranking = rankingValue;
    }

    return baseSummary;
  }
}

// Create a singleton instance
export const agentRunsRepository = new AgentRunsRepository();
