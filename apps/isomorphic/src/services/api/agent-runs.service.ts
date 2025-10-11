/**
 * Agent Runs API Service
 * Handles all API calls related to agent evaluation runs
 */

import { apiClient } from './client';
import {
  AgentRunData,
  AgentRunStats,
  AgentRunSummary,
  AgentRunPersonas,
  AgentRunTaskData,
  AgentRunDetailsResponse,
  AgentRunStatsResponse,
  AgentRunSummaryResponse,
  AgentRunPersonasResponse,
  AgentRunTasksResponse,
  AgentRunQueryParams,
  AgentRunTasksQueryParams,
  AgentRunPartialData,
} from './types/agent-runs';

export class AgentRunsService {
  private readonly baseEndpoint = '/api/v1/agent-runs';

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
    const response = await apiClient.get<AgentRunPersonasResponse>(
      `${this.baseEndpoint}/${runId}/personas`
    );
    return response.data.data.personas;
  }

  /**
   * Get statistics for an agent run
   */
  async getAgentRunStats(runId: string): Promise<AgentRunStats> {
    const response = await apiClient.get<AgentRunStatsResponse>(
      `${this.baseEndpoint}/${runId}/stats`
    );
    return response.data.data.stats;
  }

  /**
   * Get summary for an agent run
   */
  async getAgentRunSummary(runId: string): Promise<AgentRunSummary> {
    const response = await apiClient.get<AgentRunSummaryResponse>(
      `${this.baseEndpoint}/${runId}/summary`
    );
    return response.data.data.summary;
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
    const response = await apiClient.get<AgentRunTasksResponse>(
      `${this.baseEndpoint}/${runId}/tasks`,
      params
    );
    return {
      tasks: response.data.data.tasks,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
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
      sortOrder?: 'asc' | 'desc';
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
    }>(`/api/v1/agents/${agentId}/runs`, params);
    return response.data.data;
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
      sortOrder?: 'asc' | 'desc';
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
    }>(`/api/v1/rounds/${roundId}/agent-runs`, params);
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
      sortOrder?: 'asc' | 'desc';
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
    }>(`/api/v1/validators/${validatorId}/agent-runs`, params);
    return response.data.data;
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
  async compareAgentRuns(
    runIds: string[]
  ): Promise<{
    runs: AgentRunData[];
    comparison: {
      bestScore: string;
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
      type: 'task_started' | 'task_completed' | 'task_failed' | 'run_started' | 'run_completed';
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
      level?: 'info' | 'warn' | 'error' | 'debug';
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
}

// Create a singleton instance
export const agentRunsService = new AgentRunsService();
