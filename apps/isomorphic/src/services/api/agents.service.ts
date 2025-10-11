/**
 * Agents API Service
 * Handles all API calls related to the agents section of the dashboard
 */

import { apiClient } from './client';
import {
  AgentsListResponse,
  AgentDetailsResponse,
  AgentPerformanceResponse,
  AgentRunsResponse,
  AgentRunDetailsResponse,
  AgentComparisonResponse,
  AgentStatisticsResponse,
  AgentActivityResponse,
  AgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
  AgentActivityQueryParams,
  AgentComparisonQueryParams,
  AgentData,
  AgentPerformanceMetrics,
  AgentRunData,
  AgentComparison,
  AgentStatistics,
  AgentActivity,
} from './types/agents';

export class AgentsService {
  private readonly baseEndpoint = '/api/v1/agents';

  /**
   * Get list of all agents with optional filtering and pagination
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
  async getAgent(id: string): Promise<AgentData> {
    const response = await apiClient.get<AgentDetailsResponse>(
      `${this.baseEndpoint}/${id}`
    );
    return response.data.data.agent;
  }

  /**
   * Get performance metrics for a specific agent
   */
  async getAgentPerformance(
    id: string,
    params?: AgentPerformanceQueryParams
  ): Promise<AgentPerformanceMetrics> {
    const response = await apiClient.get<AgentPerformanceResponse>(
      `${this.baseEndpoint}/${id}/performance`,
      params
    );
    return response.data.data.metrics;
  }

  /**
   * Get runs for a specific agent with optional filtering
   */
  async getAgentRuns(
    id: string,
    params?: AgentRunsQueryParams
  ): Promise<AgentRunsResponse> {
    const response = await apiClient.get<AgentRunsResponse>(
      `${this.baseEndpoint}/${id}/runs`,
      params
    );
    return response.data;
  }

  /**
   * Get details for a specific agent run
   */
  async getAgentRun(agentId: string, runId: string): Promise<AgentRunData> {
    const response = await apiClient.get<AgentRunDetailsResponse>(
      `${this.baseEndpoint}/${agentId}/runs/${runId}`
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
      sortBy: 'averageScore',
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
    runs: AgentRunData[];
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
    recentRuns: AgentRunData[];
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
export const agentsService = new AgentsService();
