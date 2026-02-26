/**
 * Tasks API Service
 * Handles all API calls related to task management
 */

import { apiClient } from '../client';
import {
  TaskData,
  TaskDetails,
  TaskResults,
  TaskPersonas,
  TaskStatistics,
  TaskDetailsResponse,
  TaskResultsResponse,
  TaskPersonasResponse,
  TaskStatisticsResponse,
  TasksListResponse,
  TaskQueryParams,
  TaskDetailQueryParams,
  TasksListQueryParams,
  TaskPartialData,
  TaskSearchParams,
  TaskSearchResponse,
} from './tasks.types';

export class TasksRepository {
  private readonly baseEndpoint = '/api/v1/tasks';

  /**
   * Get details for a specific task
   */
  async getTask(
    taskId: string,
    params?: TaskQueryParams
  ): Promise<TaskData> {
    const response = await apiClient.get<TaskDetailsResponse>(
      `${this.baseEndpoint}/${taskId}`,
      params
    );
    return response.data.data.task;
  }

  /**
   * Get all evaluation data in a single call (similar to get-round)
   */
  async getEvaluationComplete(evaluationId: string): Promise<{
    actions: any[];
    screenshots: any[];
    task_details: TaskDetails;
    result: {
      status: string;
      eval_score: number;
      eval_time: number;
      zero_reason?: string | null;
    };
    info: {
      evaluationId: string;
      taskId: string;
      miner_run_id: string;
      round: any;
      validator: any;
      miner: any;
      zeroReason?: string | null;
    };
  }> {
    const endpoint = `/api/v1/evaluations/${evaluationId}/get-evaluation`;
    const response = await apiClient.get<{
      success: boolean;
      data: {
        actions: any[];
        screenshots: any[];
        task_details: TaskDetails;
        result: {
          status: string;
          eval_score: number;
          eval_time: number;
          zero_reason?: string | null;
        };
        info: {
          evaluationId: string;
          taskId: string;
          miner_run_id: string;
          round: any;
          validator: any;
          miner: any;
          zeroReason?: string | null;
        };
      };
    }>(endpoint);
    return response.data.data;
  }

  /**
   * Helper function to check if an ID is an evaluation ID
   * UUIDs are treated as evaluation IDs (simplified format from URLs)
   */
  private isEvaluationId(id: string): boolean {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    return (
      id.startsWith("evaluation_") ||
      id.endsWith("_eval") ||
      (id.includes("round_") && id.includes("validator_")) ||
      isUUID // UUIDs are treated as evaluation IDs (simplified format)
    );
  }

  /**
   * Get detailed information for a specific task
   */
  async getTaskDetails(
    taskIdOrEvaluationId: string,
    params?: TaskDetailQueryParams
  ): Promise<TaskDetails> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);

    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/task-details`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/details`;

    const response = await apiClient.get<{
      data: {
        details: TaskDetails;
      };
    }>(endpoint, params);
    return response.data.data.details;
  }

  /**
   * Get results for a specific task or evaluation
   */
  async getTaskResults(taskIdOrEvaluationId: string): Promise<TaskResults> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/results`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/results`;

    const response = await apiClient.get<TaskResultsResponse>(endpoint);
    return response.data.data.results;
  }

  /**
   * Get personas data for a task or evaluation
   */
  async getTaskPersonas(taskIdOrEvaluationId: string): Promise<TaskPersonas> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/personas`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/personas`;

    const response = await apiClient.get<TaskPersonasResponse>(endpoint);
    return response.data.data.personas;
  }

  /**
   * Get statistics for a specific task or evaluation
   */
  async getTaskStatistics(taskIdOrEvaluationId: string): Promise<TaskStatistics> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/statistics`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/statistics`;

    const response = await apiClient.get<TaskStatisticsResponse>(endpoint);
    return response.data.data.statistics;
  }

  /**
   * Get list of tasks with filtering and pagination
   */
  async getTasks(params?: TasksListQueryParams): Promise<{
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<TasksListResponse>(
      this.baseEndpoint,
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
   * Get tasks for a specific agent run
   */
  async getTasksByAgentRun(
    agentRunId: string,
    params?: Omit<TasksListQueryParams, 'agentRunId'>
  ): Promise<{
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<TasksListResponse>(
      `${this.baseEndpoint}`,
      { ...params, agentRunId }
    );
    return {
      tasks: response.data.data.tasks,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
    };
  }

  /**
   * Get tasks by website
   */
  async getTasksByWebsite(
    website: string,
    params?: Omit<TasksListQueryParams, 'website'>
  ): Promise<{
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<TasksListResponse>(
      `${this.baseEndpoint}`,
      { ...params, website }
    );
    return {
      tasks: response.data.data.tasks,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
    };
  }

  /**
   * Get tasks by use case
   */
  async getTasksByUseCase(
    useCase: string,
    params?: Omit<TasksListQueryParams, 'useCase'>
  ): Promise<{
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<TasksListResponse>(
      `${this.baseEndpoint}`,
      { ...params, useCase }
    );
    return {
      tasks: response.data.data.tasks,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
    };
  }

  /**
   * Search tasks with advanced filtering
   */
  async searchTasks(params: TaskSearchParams): Promise<TaskSearchResponse> {
    const response = await apiClient.get<TaskSearchResponse>(
      `${this.baseEndpoint}/search`,
      params
    );
    return response.data;
  }

  /**
   * Get partial data for a task (for progressive loading)
   */
  async getTaskPartialData(
    taskId: string,
    options: {
      includePersonas?: boolean;
      includeDetails?: boolean;
      includeResults?: boolean;
      includeStatistics?: boolean;
    } = {}
  ): Promise<TaskPartialData> {
    const {
      includePersonas = true,
      includeDetails = true,
      includeResults = true,
      includeStatistics = true,
    } = options;

    const result: TaskPartialData = {
      loading: {
        personas: includePersonas,
        details: includeDetails,
        results: includeResults,
        statistics: includeStatistics,
      },
      errors: {},
    };

    // Execute all requests in parallel
    const promises: Promise<any>[] = [];

    if (includePersonas) {
      promises.push(
        this.getTaskPersonas(taskId)
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

    if (includeDetails) {
      promises.push(
        this.getTaskDetails(taskId)
          .then((data) => {
            result.details = data;
            result.loading.details = false;
          })
          .catch((error) => {
            result.errors.details = error.message;
            result.loading.details = false;
          })
      );
    }

    if (includeResults) {
      promises.push(
        this.getTaskResults(taskId)
          .then((data) => {
            result.results = data;
            result.loading.results = false;
          })
          .catch((error) => {
            result.errors.results = error.message;
            result.loading.results = false;
          })
      );
    }

    if (includeStatistics) {
      promises.push(
        this.getTaskStatistics(taskId)
          .then((data) => {
            result.statistics = data;
            result.loading.statistics = false;
          })
          .catch((error) => {
            result.errors.statistics = error.message;
            result.loading.statistics = false;
          })
      );
    }

    await Promise.allSettled(promises);
    return result;
  }

  /**
   * Get task actions with pagination
   */
  async getTaskActions(
    taskIdOrEvaluationId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      sortBy?: 'timestamp' | 'duration';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    actions: any[];
    total: number;
    successCount: number;
    failCount: number;
    page: number;
    limit: number;
  }> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/actions`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/actions`;

    const response = await apiClient.get<{
      data: {
        actions: any[];
        total: number;
        successCount?: number;
        failCount?: number;
        page: number;
        limit: number;
      };
    }>(endpoint, params);
    const data = response.data.data;
    return {
      actions: data.actions,
      total: data.total,
      successCount: data.successCount ?? 0,
      failCount: data.failCount ?? 0,
      page: data.page,
      limit: data.limit,
    };
  }

  /**
   * Get task or evaluation screenshots
   */
  async getTaskScreenshots(taskIdOrEvaluationId: string): Promise<{
    screenshots: {
      id: string;
      url: string;
      timestamp: string;
      actionId?: string;
      description?: string;
    }[];
  }> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/screenshots`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/screenshots`;

    const response = await apiClient.get<{
      data: {
        screenshots: any[];
      };
    }>(endpoint);
    return response.data.data;
  }

  /**
   * Get task or evaluation logs
   */
  async getTaskLogs(
    taskIdOrEvaluationId: string,
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
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/logs`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/logs`;

    const response = await apiClient.get<{
      data: {
        logs: any[];
        total: number;
      };
    }>(endpoint, params);
    return response.data.data;
  }

  /**
   * Get task or evaluation performance metrics
   */
  async getTaskMetrics(taskIdOrEvaluationId: string): Promise<{
    metrics: {
      duration: number;
      actionsPerSecond: number;
      averageActionDuration: number;
      totalWaitTime: number;
      totalNavigationTime: number;
      memoryUsage: { timestamp: string; value: number }[];
      cpuUsage: { timestamp: string; value: number }[];
    };
  }> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/metrics`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/metrics`;

    const response = await apiClient.get<{
      data: {
        metrics: any;
      };
    }>(endpoint);
    return response.data.data;
  }

  /**
   * Get task or evaluation timeline
   */
  async getTaskTimeline(taskIdOrEvaluationId: string): Promise<{
    timeline: {
      timestamp: string;
      action: string;
      duration: number;
      success: boolean;
      metadata?: Record<string, any>;
    }[];
  }> {
    const isEvaluationId = this.isEvaluationId(taskIdOrEvaluationId);
    const endpoint = isEvaluationId
      ? `/api/v1/evaluations/${taskIdOrEvaluationId}/timeline`
      : `${this.baseEndpoint}/${taskIdOrEvaluationId}/timeline`;

    const response = await apiClient.get<{
      data: {
        timeline: any[];
      };
    }>(endpoint);
    return response.data.data;
  }

  /**
   * Get task comparison
   */
  async compareTasks(taskIds: string[]): Promise<{
    tasks: TaskData[];
    comparison: {
      bestScore: string;
      fastest: string;
      mostActions: string;
      bestSuccessRate: string;
    };
  }> {
    const response = await apiClient.post<{
      data: {
        tasks: TaskData[];
        comparison: any;
      };
    }>(`${this.baseEndpoint}/compare`, { taskIds });
    return response.data.data;
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(params?: {
    timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
    website?: string;
    useCase?: string;
    agentRunId?: string;
  }): Promise<{
    analytics: {
      totalTasks: number;
      completedTasks: number;
      failedTasks: number;
      averageScore: number;
      averageDuration: number;
      successRate: number;
      performanceByWebsite: any[];
      performanceByUseCase: any[];
      performanceOverTime: any[];
    };
  }> {
    const response = await apiClient.get<{
      data: {
        analytics: any;
      };
    }>(`${this.baseEndpoint}/analytics`, params);
    return response.data.data;
  }
}

// Create a singleton instance
export const tasksRepository = new TasksRepository();
