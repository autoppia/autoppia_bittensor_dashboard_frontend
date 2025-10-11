/**
 * Overview API Service
 * Handles all API calls related to the overview section of the dashboard
 */

import { apiClient } from './client';
import {
  OverviewMetricsResponse,
  ValidatorsResponse,
  RoundsResponse,
  LeaderboardResponse,
  SubnetStatisticsResponse,
  ValidatorsQueryParams,
  LeaderboardQueryParams,
  RoundsQueryParams,
  ValidatorData,
  RoundData,
  LeaderboardData,
  OverviewMetrics,
  SubnetStatistics,
} from './types/overview';

export class OverviewService {
  private readonly baseEndpoint = '/api/v1/overview';

  /**
   * Get overview metrics (top score, total websites, validators, miners, etc.)
   */
  async getMetrics(): Promise<OverviewMetrics> {
    const response = await apiClient.get<OverviewMetricsResponse>(
      `${this.baseEndpoint}/metrics`
    );
    return response.data.data.metrics;
  }

  /**
   * Get all validators with optional filtering and pagination
   */
  async getValidators(params?: ValidatorsQueryParams): Promise<ValidatorsResponse> {
    const response = await apiClient.get<ValidatorsResponse>(
      `${this.baseEndpoint}/validators`,
      params
    );
    return response.data;
  }

  /**
   * Get a specific validator by ID
   */
  async getValidator(id: string): Promise<ValidatorData> {
    const response = await apiClient.get<{ validator: ValidatorData }>(
      `${this.baseEndpoint}/validators/${id}`
    );
    return response.data.validator;
  }

  /**
   * Get current round information
   */
  async getCurrentRound(): Promise<RoundData> {
    const response = await apiClient.get<{ data: { round: RoundData } }>(
      `${this.baseEndpoint}/rounds/current`
    );
    return response.data.data.round;
  }

  /**
   * Get all rounds with optional filtering and pagination
   */
  async getRounds(params?: RoundsQueryParams): Promise<RoundsResponse> {
    const response = await apiClient.get<RoundsResponse>(
      `${this.baseEndpoint}/rounds`,
      params
    );
    return response.data;
  }

  /**
   * Get a specific round by ID
   */
  async getRound(id: number): Promise<RoundData> {
    const response = await apiClient.get<{ round: RoundData }>(
      `${this.baseEndpoint}/rounds/${id}`
    );
    return response.data.round;
  }

  /**
   * Get leaderboard data for performance comparison
   */
  async getLeaderboard(params?: LeaderboardQueryParams): Promise<LeaderboardResponse> {
    const response = await apiClient.get<LeaderboardResponse>(
      `${this.baseEndpoint}/leaderboard`,
      params
    );
    return response.data;
  }

  /**
   * Get subnet statistics and network health metrics
   */
  async getSubnetStatistics(): Promise<SubnetStatistics> {
    const response = await apiClient.get<SubnetStatisticsResponse>(
      `${this.baseEndpoint}/statistics`
    );
    return response.data.statistics;
  }

  /**
   * Get real-time network status
   */
  async getNetworkStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    message: string;
    lastChecked: string;
    activeValidators: number;
    networkLatency: number;
  }> {
    const response = await apiClient.get<{
      data: {
        status: 'healthy' | 'degraded' | 'down';
        message: string;
        lastChecked: string;
        activeValidators: number;
        networkLatency: number;
      };
    }>(`${this.baseEndpoint}/network-status`);
    return response.data.data;
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit: number = 10): Promise<{
    activities: Array<{
      id: string;
      type: 'task_completed' | 'validator_joined' | 'round_started' | 'round_ended' | 'miner_registered';
      message: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
    total: number;
  }> {
    const response = await apiClient.get<{
      activities: Array<{
        id: string;
        type: 'task_completed' | 'validator_joined' | 'round_started' | 'round_ended' | 'miner_registered';
        message: string;
        timestamp: string;
        metadata?: Record<string, any>;
      }>;
      total: number;
    }>(`${this.baseEndpoint}/recent-activity`, { limit });
    return response.data;
  }

  /**
   * Get performance trends for the last N days
   */
  async getPerformanceTrends(days: number = 7): Promise<{
    trends: Array<{
      date: string;
      averageScore: number;
      totalTasks: number;
      activeValidators: number;
      networkUptime: number;
    }>;
    period: string;
  }> {
    const response = await apiClient.get<{
      trends: Array<{
        date: string;
        averageScore: number;
        totalTasks: number;
        activeValidators: number;
        networkUptime: number;
      }>;
      period: string;
    }>(`${this.baseEndpoint}/performance-trends`, { days });
    return response.data;
  }
}

// Create a singleton instance
export const overviewService = new OverviewService();
