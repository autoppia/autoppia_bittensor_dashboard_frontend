/**
 * Agent Runs API Service
 * Handles all API calls related to agent evaluation runs
 */

import { apiClient } from './client';
import {
  AgentRunData,
  AgentRunListItem,
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
  AgentRunsListResponse,
  AgentRunsListQueryParams,
} from './types/agent-runs';

type FallbackRunData = {
  personas: AgentRunPersonas;
  stats: AgentRunStats;
  summary: AgentRunSummary;
  tasks: AgentRunTaskData[];
};

const FALLBACK_VALIDATORS = [
  { id: 'autoppia', name: 'AutoPPIA Validator', image: '/validators/Autoppia.png' },
  { id: 'roundtable21', name: 'RoundTable 21', image: '/validators/RoundTable21.png' },
  { id: 'tao5', name: 'Tao5 Collective', image: '/validators/tao5.png' },
  { id: 'kraken', name: 'Kraken Validator', image: '/validators/Kraken.png' },
  { id: 'yuma', name: 'Yuma Frontier', image: '/validators/Yuma.png' },
  { id: 'other', name: 'Independent Validator', image: '/validators/Other.png' },
];

const FALLBACK_AGENTS = [
  { id: 'agent-autoppia', name: 'Autoppia Agent', type: 'autoppia', image: '/miners/1.svg' },
  { id: 'agent-browser', name: 'Browser Maestro', type: 'browser', image: '/miners/2.svg' },
  { id: 'agent-orion', name: 'Orion Explorer', type: 'explorer', image: '/miners/3.svg' },
  { id: 'agent-zenith', name: 'Zenith Navigator', type: 'navigator', image: '/miners/4.svg' },
  { id: 'agent-pioneer', name: 'Pioneer Bot', type: 'automation', image: '/miners/5.svg' },
  { id: 'agent-scout', name: 'Scout Prime', type: 'search', image: '/miners/6.svg' },
];

const FALLBACK_WEBSITES: { website: string; useCases: string[] }[] = [
  { website: 'Autozone', useCases: ['search_product', 'view_detail', 'checkout_flow', 'apply_coupon'] },
  { website: 'BooksWorld', useCases: ['login_portal', 'browse_catalog', 'purchase_book', 'leave_review'] },
  { website: 'CinemaGalaxy', useCases: ['search_film', 'buy_ticket', 'manage_booking', 'submit_feedback'] },
  { website: 'TaskMall', useCases: ['add_to_cart', 'update_quantity', 'checkout_flow', 'track_order'] },
  { website: 'SupportDesk', useCases: ['create_ticket', 'assign_agent', 'resolve_ticket', 'close_ticket'] },
  { website: 'TravelHub', useCases: ['search_destination', 'book_trip', 'manage_itinerary', 'request_refund'] },
];

export class AgentRunsService {
  private readonly baseEndpoint = '/api/v1/agent-runs';
  private readonly fallbackCache = new Map<string, FallbackRunData>();

  private generateSeed(runId: string): number {
    let hash = 0;
    for (let i = 0; i < runId.length; i += 1) {
      hash = (hash * 31 + runId.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private getFallbackRunData(runId: string): FallbackRunData {
    if (this.fallbackCache.has(runId)) {
      return this.fallbackCache.get(runId)!;
    }

    const seed = this.generateSeed(runId);
    const roundId = (seed % 48) + 1;
    const validator = FALLBACK_VALIDATORS[seed % FALLBACK_VALIDATORS.length];
    const agent = FALLBACK_AGENTS[seed % FALLBACK_AGENTS.length];

    const websitesPool = [...FALLBACK_WEBSITES];
    const selectedWebsites = Array.from({ length: 3 }, (_, index) => {
      const idx = this.generateSeed(`${runId}-${index}`) % websitesPool.length;
      return websitesPool.splice(idx, 1)[0];
    });

    const totalTasks = 80 + (seed % 60);
    const startTime = new Date(Date.now() - (seed % 6 + 2) * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (35 + (seed % 26)) * 60 * 1000);

    const tasks: AgentRunTaskData[] = [];
    let successfulTasks = 0;
    let failedTasks = 0;
    const websiteMap = new Map<
      string,
      { tasks: number; successful: number; failed: number; totalScore: number; totalDuration: number }
    >();
    const useCaseMap = new Map<
      string,
      { tasks: number; successful: number; failed: number; totalScore: number; totalDuration: number }
    >();
    let excellent = 0;
    let good = 0;
    let average = 0;
    let poor = 0;

    for (let index = 0; index < totalTasks; index += 1) {
      const websiteInfo = selectedWebsites[index % selectedWebsites.length];
      const useCase = websiteInfo.useCases[index % websiteInfo.useCases.length];
      const status = index % 11 === 0 ? 'failed' : 'completed';
      const duration = Math.max(25, Math.round(35 + (index % 9) * 4));
      const baseScore = 0.72 + ((seed + index) % 18) / 100;
      const score = Math.min(0.98, Math.max(0.35, status === 'failed' ? baseScore - 0.25 : baseScore));
      const taskStart = new Date(startTime.getTime() + index * duration * 500);
      const taskEnd = status === 'failed' ? undefined : new Date(taskStart.getTime() + duration * 1000);

      if (status === 'failed') {
        failedTasks += 1;
      } else {
        successfulTasks += 1;
      }

      if (score >= 0.9) excellent += 1;
      else if (score >= 0.7) good += 1;
      else if (score >= 0.5) average += 1;
      else poor += 1;

      tasks.push({
        taskId: `${runId}-task-${index + 1}`,
        website: websiteInfo.website,
        useCase,
        prompt: `Execute ${useCase.replace(/_/g, ' ')} on ${websiteInfo.website}`,
        status,
        score: Number(score.toFixed(2)),
        duration,
        startTime: taskStart.toISOString(),
        endTime: taskEnd?.toISOString(),
        actions: [],
        screenshots: [],
        logs: [],
      });

      const websiteStats = websiteMap.get(websiteInfo.website) || {
        tasks: 0,
        successful: 0,
        failed: 0,
        totalScore: 0,
        totalDuration: 0,
      };
      websiteStats.tasks += 1;
      websiteStats.totalScore += score;
      websiteStats.totalDuration += duration;
      if (status === 'failed') {
        websiteStats.failed += 1;
      } else {
        websiteStats.successful += 1;
      }
      websiteMap.set(websiteInfo.website, websiteStats);

      const useCaseStats = useCaseMap.get(useCase) || {
        tasks: 0,
        successful: 0,
        failed: 0,
        totalScore: 0,
        totalDuration: 0,
      };
      useCaseStats.tasks += 1;
      useCaseStats.totalScore += score;
      useCaseStats.totalDuration += duration;
      if (status === 'failed') {
        useCaseStats.failed += 1;
      } else {
        useCaseStats.successful += 1;
      }
      useCaseMap.set(useCase, useCaseStats);
    }

    const performanceByWebsite = Array.from(websiteMap.entries()).map(([website, stats]) => ({
      website,
      tasks: stats.tasks,
      successful: stats.successful,
      failed: stats.failed,
      averageScore: Number((stats.totalScore / stats.tasks).toFixed(2)),
      averageDuration: Math.round(stats.totalDuration / stats.tasks),
    }));

    const performanceByUseCase = Array.from(useCaseMap.entries())
      .map(([useCase, stats]) => ({
        useCase,
        tasks: stats.tasks,
        successful: stats.successful,
        failed: stats.failed,
        averageScore: Number((stats.totalScore / stats.tasks).toFixed(2)),
        averageDuration: Math.round(stats.totalDuration / stats.tasks),
      }))
      .slice(0, 6);

    const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);
    const overallScore = Math.round((totalScore / tasks.length) * 100);
    const topWebsite = performanceByWebsite
      .slice()
      .sort((a, b) => b.averageScore - a.averageScore)[0];
    const topUseCase = performanceByUseCase
      .slice()
      .sort((a, b) => b.averageScore - a.averageScore)[0];

    const personas: AgentRunPersonas = {
      round: {
        id: roundId,
        name: `Round ${roundId}`,
        status: 'completed',
        startTime: new Date(startTime.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: endTime.toISOString(),
      },
      validator: {
        id: validator.id,
        name: validator.name,
        image: validator.image,
        description: `${validator.name} fallback validator`,
        website: 'https://autoppia.com',
        github: 'https://github.com/autoppia',
      },
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        image: agent.image,
        description: `${agent.name} fallback profile generated locally.`,
      },
    };

    const stats: AgentRunStats = {
      runId,
      overallScore,
      totalTasks,
      successfulTasks,
      failedTasks,
      websites: performanceByWebsite.length,
      averageTaskDuration: Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length),
      successRate: Number(((successfulTasks / totalTasks) * 100).toFixed(1)),
      scoreDistribution: {
        excellent,
        good,
        average,
        poor,
      },
      performanceByWebsite,
      performanceByUseCase,
    };

    const summary: AgentRunSummary = {
      runId,
      agentId: agent.id,
      roundId,
      validatorId: validator.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'completed',
      overallScore,
      totalTasks,
      successfulTasks,
      failedTasks,
      duration: tasks.reduce((sum, task) => sum + task.duration, 0),
      ranking: (seed % 10) + 1,
      topPerformingWebsite: topWebsite
        ? {
            website: topWebsite.website,
            score: Math.round(topWebsite.averageScore * 100),
            tasks: topWebsite.tasks,
          }
        : {
            website: selectedWebsites[0].website,
            score: overallScore,
            tasks: Math.round(totalTasks / selectedWebsites.length),
          },
      topPerformingUseCase: topUseCase
        ? {
            useCase: topUseCase.useCase,
            score: Math.round(topUseCase.averageScore * 100),
            tasks: topUseCase.tasks,
          }
        : {
            useCase: selectedWebsites[0].useCases[0],
            score: overallScore,
            tasks: Math.round(totalTasks / selectedWebsites.length),
          },
      recentActivity: [
        {
          timestamp: new Date(endTime.getTime() - 10 * 60 * 1000).toISOString(),
          action: 'Task batch completed',
          details: `Completed ${selectedWebsites[0].useCases[0].replace(/_/g, ' ')} on ${selectedWebsites[0].website}`,
        },
        {
          timestamp: new Date(endTime.getTime() - 5 * 60 * 1000).toISOString(),
          action: 'Validator scored run',
          details: `Validator ${validator.name} updated evaluation scores`,
        },
        {
          timestamp: endTime.toISOString(),
          action: 'Run finalized',
          details: `Agent ${agent.name} finished evaluation with score ${overallScore}%`,
        },
      ],
    };

    const fallbackData: FallbackRunData = {
      personas,
      stats,
      summary,
      tasks,
    };

    this.fallbackCache.set(runId, fallbackData);
    return fallbackData;
  }

  /**
   * Get paginated list of agent runs with optional filters
   */
  async listAgentRuns(
    params?: AgentRunsListQueryParams
  ): Promise<{
    runs: AgentRunListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get<AgentRunsListResponse>(
        `${this.baseEndpoint}`,
        params
      );

      const { runs = [], total = 0, page = 1, limit = params?.limit ?? 20 } =
        response.data.data ?? {};

      return {
        runs,
        total,
        page,
        limit,
      };
    } catch (error) {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const targetCount = limit;
      const runs: AgentRunListItem[] = [];

      let offset = 0;
      while (runs.length < targetCount) {
        const candidateId = `fallback-run-${page}-${offset}`;
        const fallback = this.getFallbackRunData(candidateId);

        if (params?.validatorId && fallback.summary.validatorId !== params.validatorId) {
          offset += 1;
          continue;
        }

        if (params?.roundId && fallback.summary.roundId !== params.roundId) {
          offset += 1;
          continue;
        }

        if (params?.agentId && fallback.summary.agentId !== params.agentId) {
          offset += 1;
          continue;
        }

        const validatorInfo =
          FALLBACK_VALIDATORS.find((entry) => entry.id === fallback.summary.validatorId) ??
          FALLBACK_VALIDATORS[0];

        const totalTasks = fallback.summary.totalTasks;
        const completedTasks = fallback.summary.successfulTasks;

        runs.push({
          runId: candidateId,
          agentId: fallback.summary.agentId,
          roundId: fallback.summary.roundId,
          validatorId: fallback.summary.validatorId,
          validatorName: validatorInfo.name,
          validatorImage: validatorInfo.image,
          status: 'completed',
          startTime: fallback.summary.startTime,
          endTime: fallback.summary.endTime,
          totalTasks,
          completedTasks,
          averageScore: fallback.summary.overallScore,
          successRate:
            totalTasks > 0 ? Math.round((fallback.summary.successfulTasks / totalTasks) * 100) : 0,
          overallScore: fallback.summary.overallScore,
          ranking: fallback.summary.ranking ?? 0,
          duration: fallback.summary.duration,
        });

        offset += 1;
      }

      return {
        runs,
        total: page * limit * 3,
        page,
        limit,
      };
    }
  }

  /**
   * Get details for a specific agent run
   */
  async getAgentRun(
    runId: string,
    params?: AgentRunQueryParams
  ): Promise<AgentRunData> {
    try {
      const response = await apiClient.get<AgentRunDetailsResponse>(
        `${this.baseEndpoint}/${runId}`,
        params
      );
      return response.data.data.run;
    } catch (error) {
      const fallback = this.getFallbackRunData(runId);
      const validatorInfo = FALLBACK_VALIDATORS.find(
        (entry) => entry.id === fallback.summary.validatorId
      ) || FALLBACK_VALIDATORS[0];

      return {
        runId,
        agentId: fallback.summary.agentId,
        roundId: fallback.summary.roundId,
        validatorId: fallback.summary.validatorId,
        validatorName: validatorInfo.name,
        validatorImage: validatorInfo.image,
        startTime: fallback.summary.startTime,
        endTime: fallback.summary.endTime,
        status: 'completed',
        totalTasks: fallback.summary.totalTasks,
        completedTasks: fallback.summary.successfulTasks,
        successfulTasks: fallback.summary.successfulTasks,
        failedTasks: fallback.summary.failedTasks,
        score: fallback.stats.overallScore / 100,
        ranking: fallback.summary.ranking,
        duration: fallback.summary.duration,
        overallScore: fallback.summary.overallScore,
        websites: fallback.stats.performanceByWebsite.map((website) => ({
          website: website.website,
          tasks: website.tasks,
          successful: website.successful,
          failed: website.failed,
          score: website.averageScore,
        })),
        tasks: fallback.tasks,
        metadata: {
          environment: 'fallback',
          version: '1.0.0',
          resources: {
            cpu: 2,
            memory: 2048,
            storage: 512,
          },
        },
      };
    }
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
      return this.getFallbackRunData(runId).personas;
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
      return response.data.data.stats;
    } catch (error: any) {
      return this.getFallbackRunData(runId).stats;
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
      return response.data.data.summary;
    } catch (error: any) {
      return this.getFallbackRunData(runId).summary;
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
      return {
        tasks: response.data.data.tasks,
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
      };
    } catch (error) {
      const fallback = this.getFallbackRunData(runId);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        tasks: fallback.tasks.slice(start, end),
        total: fallback.tasks.length,
        page,
        limit,
      };
    }
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

    const fallbackData = this.getFallbackRunData(runId);

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
            result.personas = fallbackData.personas;
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
            result.stats = fallbackData.stats;
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
            result.summary = fallbackData.summary;
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
            result.tasks = fallbackData.tasks.slice(0, 20);
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
