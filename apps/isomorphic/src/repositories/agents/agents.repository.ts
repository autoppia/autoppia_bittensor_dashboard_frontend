/**
 * Agents API Service
 * Handles all API calls related to the agents section of the dashboard
 */

import { apiClient } from '../client';
import {
  AgentsListResponse,
  AgentDetailsResponse,
  AgentPerformanceResponse,
  AgentRunsResponse,
  AgentComparisonResponse,
  AgentStatisticsResponse,
  AgentActivityResponse,
  MinimalAgentsListResponse,
  MinerDetailsResponse,
  AgentsListQueryParams,
  MinimalAgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
  AgentActivityQueryParams,
  AgentComparisonQueryParams,
  AgentData,
  MinimalAgentData,
  AgentPerformanceMetrics,
  AgentRunOverview,
  AgentComparison,
  AgentStatistics,
  ScoreRoundDataPoint,
  AgentActivity,
  AgentRoundMetrics,
  MinerRoundDetailsResponse,
  MinerHistoricalResponse,
} from './agents.types';
import type {
  AgentRunData,
  AgentRunDetailsResponse,
} from '../agent-runs/agent-runs.types';

export class AgentsRepository {
  private readonly baseEndpoint = '/api/v1/agents';
  private readonly minerListEndpoint = '/api/v1/miner-list';

  /**
   * Get the latest round number and top miner for initial redirect
   */
  async getLatestRoundTopMiner(): Promise<{
    round: number;
    miner_uid: number;
    miner_hotkey: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          round: number;
          miner_uid: number;
          miner_hotkey: string | null;
        };
      }>(`${this.baseEndpoint}/latest-round-top-miner`);
      return response.data.data;
    } catch (error) {
      console.error('[AgentsRepository] Error fetching latest round top miner:', error);
      throw error;
    }
  }

  /**
   * Get rounds data with optional miners for selected round (new unified endpoint)
   */
  async getRoundsData(roundNumber?: number): Promise<{
    rounds: number[];
    round_selected: {
      round: number;
      miners: Array<{
        uid: number;
        name: string;
        image: string | null;
        post_consensus_avg_reward: number;
        post_consensus_rank: number;
      }>;
    } | null;
  }> {
    const params = roundNumber ? { round_number: roundNumber } : {};
    const response = await apiClient.get<{
      success: boolean;
      data: {
        rounds: number[];
        round_selected: {
          round: number;
          miners: Array<{
            uid: number;
            name: string;
            image: string | null;
            post_consensus_avg_reward: number;
            post_consensus_rank: number;
          }>;
        } | null;
      };
    }>(`${this.baseEndpoint}/rounds`, params);
    return response.data.data;
  }

  /**
   * Get detailed information about a specific miner in a specific round
   */
  async getMinerRoundDetails(
    round: number,
    miner_uid: number
  ): Promise<MinerRoundDetailsResponse['data']> {
    const response = await apiClient.get<MinerRoundDetailsResponse>(
      `${this.baseEndpoint}/round-details`,
      { round, miner_uid }
    );
    return response.data.data;
  }

  /**
   * Get historical statistics for a miner across all rounds
   */
  async getMinerHistorical(
    minerUid: number
  ): Promise<MinerHistoricalResponse['data']> {
    const response = await apiClient.get<MinerHistoricalResponse>(
      `${this.baseEndpoint}/${minerUid}/historical`
    );
    return response.data.data;
  }

  /**
   * Get minimal list of miners for sidebar (optimized endpoint) - DEPRECATED
   * Use getRoundsData instead
   */
  async getMinersList(params?: MinimalAgentsListQueryParams): Promise<MinimalAgentsListResponse> {
    const response = await apiClient.get<MinimalAgentsListResponse>(
      this.minerListEndpoint,
      params
    );
    return response.data;
  }

  /**
   * Get details for a specific miner by UID (optimized endpoint)
   */
  async getMinerDetails(
    uid: number,
    params?: { round?: number }
  ): Promise<{
    agent: AgentData;
    scoreRoundData: ScoreRoundDataPoint[];
    availableRounds?: number[];
    roundMetrics?: AgentRoundMetrics | null;
  }> {
    const candidateIds = [`agent-${uid}`, String(uid)];

    for (const candidate of candidateIds) {
      try {
        const response = await apiClient.get<MinerDetailsResponse>(
          `${this.baseEndpoint}/${candidate}`,
          params
        );
        if (response.data?.data) {
          return response.data.data;
        }
      } catch (error: any) {
        if (error?.status && error.status !== 404) {
          throw error;
        }
        // Continue to next candidate when 404
      }
    }

    throw new Error(`Miner ${uid} not found in API response`);
  }

  /**
   * Get performance metrics for a specific miner by UID (optimized endpoint)
   * Falls back to generating data from rounds if the performance endpoint is not available
   */
  async getMinerPerformance(
    uid: number,
    params?: { timeRange?: '7d' | '30d' | '90d'; granularity?: 'hour' | 'day' }
  ): Promise<AgentPerformanceMetrics> {
    try {
      const response = await apiClient.get<{
        success?: boolean;
        data?: {
          uid: number;
          timeRange: { start: string; end: string };
          totalRuns: number;
          successfulRuns: number;
          failedRuns: number;
          averageScore: number;
          bestScore: number;
          worstScore: number;
          successRate: number;
          averageResponseTime: number;
          totalTasks: number;
          completedTasks: number;
          taskCompletionRate: number;
          scoreDistribution: {
            excellent: number;
            good: number;
            average: number;
            poor: number;
          };
          performanceTrend: Array<{
            period: string;
            score: number;
            successRate: number;
            responseTime: number;
          }>;
        };
      }>(
        `/api/v1/miners/${uid}/performance`,
        params
      );

      const payload = response.data?.data;
      if (payload) {
        const trendData = Array.isArray(payload.performanceTrend) ? payload.performanceTrend : [];
       return {
         agentId: uid.toString(),
         timeRange: payload.timeRange ?? { start: '', end: '' },
         totalRuns: payload.totalRuns ?? trendData.length,
         successfulRuns: payload.successfulRuns ?? 0,
         failedRuns: payload.failedRuns ?? Math.max((payload.totalRuns ?? 0) - (payload.successfulRuns ?? 0), 0),
          successRate: payload.successRate ?? 0,
          currentScore: payload.averageScore ?? 0,
          currentTopScore: payload.bestScore ?? 0,
          worstScore: payload.worstScore ?? 0,
          averageResponseTime: payload.averageResponseTime ?? 0,
          totalTasks: payload.totalTasks ?? 0,
          completedTasks: payload.completedTasks ?? 0,
          taskCompletionRate: payload.taskCompletionRate ?? 0,
          scoreDistribution: payload.scoreDistribution ?? {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0,
          },
          performanceTrend: trendData.map((item, index) => ({
            round: typeof (item as any).round === 'number' ? (item as any).round : index + 1,
            score: item.score ?? 0,
            responseTime: item.responseTime ?? 0,
            successRate: item.successRate ?? 0,
          })),
        };
      }

      return this.generateFallbackPerformanceData(uid, params);
    } catch (error) {
      return this.generateFallbackPerformanceData(uid, params);
    }
  }

  /**
   * Generate fallback performance data when the API doesn't provide historical data
   */
  private generateFallbackPerformanceData(
    uid: number,
    params?: { timeRange?: '7d' | '30d' | '90d'; granularity?: 'hour' | 'day' }
  ): AgentPerformanceMetrics {
    const timeRange = params?.timeRange ?? '7d';
    return {
      agentId: uid.toString(),
      timeRange: {
        start: '',
        end: '',
      },
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      successRate: 0,
      currentScore: 0,
      currentTopScore: 0,
      worstScore: 0,
      averageResponseTime: 0,
      totalTasks: 0,
      completedTasks: 0,
      taskCompletionRate: 0,
      scoreDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
      },
      performanceTrend: [],
    };
  }

  /**
   * Get list of all agents with optional filtering and pagination (legacy endpoint)
   */
  async getAgents(params?: AgentsListQueryParams): Promise<AgentsListResponse> {
    const response = await apiClient.get<AgentsListResponse>(
      this.baseEndpoint,
      params
    );
    return response.data;
  }

  /**
   * Get details for a specific agent by ID
   */
  async getAgent(
    id: string,
    params?: { round?: number }
  ): Promise<{
    agent: AgentData;
    scoreRoundData: ScoreRoundDataPoint[];
    availableRounds?: number[];
    roundMetrics?: AgentRoundMetrics | null;
  }> {
    const response = await apiClient.get<AgentDetailsResponse>(
      `${this.baseEndpoint}/${id}`,
      params
    );
    return {
      agent: response.data.data.agent,
      scoreRoundData: response.data.data.scoreRoundData,
      availableRounds: response.data.data.availableRounds,
      roundMetrics: response.data.data.roundMetrics,
    };
  }

  /**
   * Get performance metrics for a specific agent
   */
  async getAgentPerformance(
    id: string,
    params?: AgentPerformanceQueryParams
  ): Promise<AgentPerformanceMetrics> {
    const candidates = /^\d+$/.test(id)
      ? [`agent-${id}`, id]
      : [id, id.replace(/^agent-/, '')];

    let capturedError: any = null;
    for (const candidate of Array.from(new Set(candidates)).filter(Boolean)) {
      try {
        const response = await apiClient.get<AgentPerformanceResponse>(
          `${this.baseEndpoint}/${candidate}/performance`,
          params
        );
        const metrics = response.data?.data?.metrics;
        if (metrics) {
          return metrics;
        }
      } catch (error: any) {
        capturedError = error;
        if (!error?.status || error.status !== 404) {
          throw error;
        }
      }
    }

    if (capturedError) {
      throw capturedError;
    }

    throw new Error(`Agent performance metrics for ${id} not found`);
  }

  /**
   * Get runs for a specific agent with optional filtering
   */
  async getAgentRuns(
    id: string,
    params?: AgentRunsQueryParams
  ): Promise<AgentRunsResponse> {
    const response = await apiClient.get<AgentRunsResponse>(
      `/api/v1/agent-runs`,
      { ...params, agentId: id }
    );
    return response.data;
  }

  /**
   * Get details for a specific agent run
   */
  async getAgentRun(agentId: string, runId: string): Promise<AgentRunData> {
    const response = await apiClient.get<AgentRunDetailsResponse>(
      `/api/v1/agent-runs/${runId}`
    );
    return response.data.data.run;
  }

  /**
   * Get recent activity for a specific agent
   */
  async getAgentActivity(
    id: string,
    params?: AgentActivityQueryParams
  ): Promise<AgentActivityResponse> {
    const response = await apiClient.get<AgentActivityResponse>(
      `${this.baseEndpoint}/${id}/activity`,
      params
    );
    return response.data;
  }

  /**
   * Compare multiple agents
   */
  async compareAgents(
    params: AgentComparisonQueryParams
  ): Promise<AgentComparison> {
    const response = await apiClient.post<AgentComparisonResponse>(
      `${this.baseEndpoint}/compare`,
      params
    );
    return response.data.data.comparison;
  }

  /**
   * Get overall agent statistics
   */
  async getAgentStatistics(): Promise<AgentStatistics> {
    const response = await apiClient.get<AgentStatisticsResponse>(
      `${this.baseEndpoint}/statistics`
    );
    return response.data.data.statistics;
  }

  /**
   * Get all agent activity (across all agents)
   */
  async getAllAgentActivity(
    params?: AgentActivityQueryParams
  ): Promise<AgentActivityResponse> {
    const response = await apiClient.get<AgentActivityResponse>(
      `${this.baseEndpoint}/activity`,
      params
    );
    return response.data;
  }

  /**
   * Get top performing agents
   */
  async getTopAgents(limit: number = 10): Promise<AgentData[]> {
    const response = await this.getAgents({
      limit,
      sortBy: 'currentScore',
      sortOrder: 'desc',
    });
    return response.data.agents;
  }

  /**
   * Get most active agents
   */
  async getMostActiveAgents(limit: number = 10): Promise<AgentData[]> {
    const response = await this.getAgents({
      limit,
      sortBy: 'totalRuns',
      sortOrder: 'desc',
    });
    return response.data.agents;
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(
    type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom'
  ): Promise<AgentData[]> {
    const response = await this.getAgents({
      type,
      limit: 100, // Get all agents of this type
    });
    return response.data.agents;
  }

  /**
   * Search agents by name or description
   */
  async searchAgents(query: string, limit: number = 20): Promise<AgentData[]> {
    const response = await this.getAgents({
      search: query,
      limit,
    });
    return response.data.agents;
  }

  /**
   * Get agent performance trends over time
   */
  async getAgentPerformanceTrends(
    id: string,
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<AgentPerformanceMetrics['performanceTrend']> {
    const metrics = await this.getAgentPerformance(id, {
      timeRange,
      granularity: timeRange === '7d' ? 'hour' : 'day',
    });
    return metrics.performanceTrend;
  }

  /**
   * Get agent score distribution
   */
  async getAgentScoreDistribution(id: string): Promise<AgentPerformanceMetrics['scoreDistribution']> {
    const metrics = await this.getAgentPerformance(id);
    return metrics.scoreDistribution;
  }

  /**
   * Get agent run history with pagination
   */
  async getAgentRunHistory(
    id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    runs: AgentRunOverview[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.getAgentRuns(id, {
      page,
      limit,
      sortBy: 'startTime',
      sortOrder: 'desc',
    });
    return {
      runs: response.data.runs,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  }

  /**
   * Get agent performance summary for dashboard
   */
  async getAgentSummary(id: string): Promise<{
    agent: AgentData;
    recentPerformance: AgentPerformanceMetrics;
    recentRuns: AgentRunOverview[];
    activity: AgentActivity[];
  }> {
    const [agent, performance, runs, activity] = await Promise.all([
      this.getAgent(id),
      this.getAgentPerformance(id, { timeRange: '7d' }),
      this.getAgentRuns(id, { limit: 5, sortBy: 'startTime', sortOrder: 'desc' }),
      this.getAgentActivity(id, { limit: 10 }),
    ]);

    return {
      agent,
      recentPerformance: performance,
      recentRuns: runs.data.runs,
      activity: activity.data.activities,
    };
  }
}

// Create a singleton instance
export const agentsRepository = new AgentsRepository();
