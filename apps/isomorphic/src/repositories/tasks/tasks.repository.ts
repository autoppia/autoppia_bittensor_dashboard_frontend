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
   * Get detailed information for a specific task
   */
  async getTaskDetails(
    taskId: string,
    params?: TaskDetailQueryParams
  ): Promise<TaskDetails> {
    const response = await apiClient.get<{
      data: {
        details: TaskDetails;
      };
    }>(`${this.baseEndpoint}/${taskId}/details`, params);
    return response.data.data.details;
  }

  /**
   * Get results for a specific task
   */
  async getTaskResults(taskId: string): Promise<TaskResults> {
    const response = await apiClient.get<TaskResultsResponse>(
      `${this.baseEndpoint}/${taskId}/results`
    );
    return response.data.data.results;
  }

  /**
   * Get personas data for a task (round, validator, agent, task info)
   */
  async getTaskPersonas(taskId: string): Promise<TaskPersonas> {
    const response = await apiClient.get<TaskPersonasResponse>(
      `${this.baseEndpoint}/${taskId}/personas`
    );
    return response.data.data.personas;
  }

  /**
   * Get statistics for a specific task
   */
  async getTaskStatistics(taskId: string): Promise<TaskStatistics> {
    const response = await apiClient.get<TaskStatisticsResponse>(
      `${this.baseEndpoint}/${taskId}/statistics`
    );
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
    taskId: string,
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
    const response = await apiClient.get<{
      data: {
        actions: any[];
        total: number;
        successCount?: number;
        failCount?: number;
        page: number;
        limit: number;
      };
    }>(`${this.baseEndpoint}/${taskId}/actions`, params);
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
   * Get task screenshots
   */
  async getTaskScreenshots(taskId: string): Promise<{
    screenshots: {
      id: string;
      url: string;
      timestamp: string;
      actionId?: string;
      description?: string;
    }[];
  }> {
    const response = await apiClient.get<{
      data: {
        screenshots: any[];
      };
    }>(`${this.baseEndpoint}/${taskId}/screenshots`);
    return response.data.data;
  }

  /**
   * Get task logs
   */
  async getTaskLogs(
    taskId: string,
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
    }>(`${this.baseEndpoint}/${taskId}/logs`, params);
    return response.data.data;
  }

  /**
   * Get task performance metrics
   */
  async getTaskMetrics(taskId: string): Promise<{
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
    const response = await apiClient.get<{
      data: {
        metrics: any;
      };
    }>(`${this.baseEndpoint}/${taskId}/metrics`);
    return response.data.data;
  }

  /**
   * Get task timeline
   */
  async getTaskTimeline(taskId: string): Promise<{
    timeline: {
      timestamp: string;
      action: string;
      duration: number;
      success: boolean;
      metadata?: Record<string, any>;
    }[];
  }> {
    const response = await apiClient.get<{
      data: {
        timeline: any[];
      };
    }>(`${this.baseEndpoint}/${taskId}/timeline`);
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
