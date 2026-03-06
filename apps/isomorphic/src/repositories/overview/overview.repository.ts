/**
 * Overview API Service
 * Handles all API calls related to the overview section of the dashboard
 */

import { apiClient } from '../client';
import {
  OverviewMetricsResponse,
  ValidatorsResponse,
  RoundsResponse,
  LeaderboardResponse,
  SubnetStatisticsResponse,
  ValidatorFilterResponse,
  ValidatorsQueryParams,
  LeaderboardQueryParams,
  RoundsQueryParams,
  ValidatorData,
  ValidatorFilterItem,
  OverviewRoundData,
  OverviewMetrics,
  SubnetStatistics,
} from './overview.types';

/** Network status value from API */
type NetworkStatus = 'healthy' | 'degraded' | 'down';

/** Activity type in recent activity feed */
type RecentActivityType =
  | 'task_completed'
  | 'validator_joined'
  | 'round_started'
  | 'round_ended'
  | 'miner_registered';

export class OverviewRepository {
  private readonly baseEndpoint = '/api/v1/overview';
  private readonly validatorsFilterEndpoint = `${this.baseEndpoint}/validators/filter`;

  /**
   * Get overview metrics (top score, total websites, validators, miners, etc.)
   */
  async getMetrics(): Promise<OverviewMetrics> {
    try {
      type MetricsPayload = OverviewMetricsResponse & {
        data?: { metrics?: OverviewMetrics };
        metrics?: OverviewMetrics;
      };
      const response = await apiClient.get<MetricsPayload>(
        `${this.baseEndpoint}/metrics`
      );

      // Ensure response.data is an object before accessing properties
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response data format');
      }

      // Handle both nested and flat response structures
      if (response.data?.data?.metrics) {
        return response.data.data.metrics;
      }
      if (response.data?.metrics) {
        return response.data.metrics;
      }
      return response.data as unknown as OverviewMetrics;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch overview metrics: ${message}`);
    }
  }

  /**
   * Get all validators with optional filtering and pagination
   */
  async getValidators(params?: ValidatorsQueryParams): Promise<ValidatorsResponse> {
    try {
      const response = await apiClient.get<ValidatorsResponse>(
        `${this.baseEndpoint}/validators`,
        params
      );

      // Ensure response.data is an object before accessing properties
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response data format');
      }

      // Handle both nested and flat response structures
      if (response.data?.data) {
        return response.data;
      }
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch validators: ${message}`);
    }
  }

  /**
   * Get a specific validator by ID
   */
  async getValidator(id: string): Promise<ValidatorData> {
    const response = await apiClient.get<{
      success?: boolean;
      data?: { validator: ValidatorData };
      validator?: ValidatorData;
    }>(
      `${this.baseEndpoint}/validators/${id}`
    );
    if (response.data?.data?.validator) {
      return response.data.data.validator;
    }
    if (response.data?.validator) {
      return response.data.validator;
    }
    throw new Error(`Validator ${id} not found in API response`);
  }

  /**
   * Get lightweight validator list for filters
   */
  async getValidatorFilters(): Promise<{ validators: ValidatorFilterItem[] }> {
    try {
      const response = await apiClient.get<ValidatorFilterResponse>(
        this.validatorsFilterEndpoint
      );

      if (response.data?.data?.validators) {
        return { validators: response.data.data.validators };
      }

      if (Array.isArray((response.data as any)?.validators)) {
        return { validators: (response.data as any).validators as ValidatorFilterItem[] };
      }

      return { validators: [] };
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err?.status === 404) {
        // Endpoint not available yet – fall back to empty list
        return { validators: [] };
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(err?.message ?? 'Failed to fetch validator filter options');
    }
  }

  /**
   * Get current round information
   */
  async getCurrentRound(): Promise<OverviewRoundData> {
    type RoundPayload =
      | { data: { round: OverviewRoundData }; round?: OverviewRoundData }
      | { data?: { round?: OverviewRoundData }; round?: OverviewRoundData };
    const response = await apiClient.get<RoundPayload>(
      `${this.baseEndpoint}/rounds/current`
    );
    if (response.data?.data?.round) {
      return response.data.data.round;
    }
    if (response.data?.round) {
      return response.data.round;
    }
    return response.data as unknown as OverviewRoundData;
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
  async getRound(id: number): Promise<OverviewRoundData> {
    const response = await apiClient.get<{ round: OverviewRoundData }>(
      `${this.baseEndpoint}/rounds/${id}`
    );
    return response.data.round;
  }

  /**
   * Get leaderboard data for performance comparison
   */
  async getLeaderboard(params?: LeaderboardQueryParams): Promise<LeaderboardResponse> {
    try {
      const response = await apiClient.get<LeaderboardResponse>(
        `${this.baseEndpoint}/leaderboard`,
        params
      );

      // Ensure response.data is an object before accessing properties
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response data format');
      }

      // Handle both nested and flat response structures
      if (response.data?.data) {
        return response.data;
      }
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch leaderboard: ${message}`);
    }
  }

  /**
   * Get subnet statistics and network health metrics
   */
  async getSubnetStatistics(): Promise<SubnetStatistics> {
    const response = await apiClient.get<SubnetStatisticsResponse>(
      `${this.baseEndpoint}/statistics`
    );
    if (response.data?.data?.statistics) {
      return response.data.data.statistics;
    }
    if ((response.data as any)?.statistics) {
      return (response.data as any).statistics as SubnetStatistics;
    }
    throw new Error('Subnet statistics not found in API response');
  }

  /**
   * Get real-time network status
   */
  async getNetworkStatus(): Promise<{
    status: NetworkStatus;
    message: string;
    lastChecked: string;
    activeValidators: number;
    networkLatency: number;
  }> {
    type NetworkStatusPayload = {
      data?: {
        status: NetworkStatus;
        message: string;
        lastChecked: string;
        activeValidators: number;
        networkLatency: number;
      };
      status?: NetworkStatus;
      message?: string;
      lastChecked?: string;
      activeValidators?: number;
      networkLatency?: number;
    };
    const response = await apiClient.get<NetworkStatusPayload>(
      `${this.baseEndpoint}/network-status`
    );
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data as unknown as {
      status: NetworkStatus;
      message: string;
      lastChecked: string;
      activeValidators: number;
      networkLatency: number;
    };
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit: number = 10): Promise<{
    activities: Array<{
      id: string;
      type: RecentActivityType;
      message: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }>;
    total: number;
  }> {
    type ActivityItem = {
      id: string;
      type: RecentActivityType;
      message: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    };
    const response = await apiClient.get<{
      success?: boolean;
      data?: { activities: ActivityItem[]; total: number };
      activities?: ActivityItem[];
      total?: number;
    }>(`${this.baseEndpoint}/recent-activity`, { limit });

    if (response.data?.data) {
      return response.data.data;
    }

    if (Array.isArray(response.data?.activities)) {
      return {
        activities: response.data.activities,
        total: response.data.total ?? response.data.activities.length,
      };
    }

    return { activities: [], total: 0 };
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
      success?: boolean;
      data?: {
        trends: Array<{
          date: string;
          averageScore: number;
          totalTasks: number;
          activeValidators: number;
          networkUptime: number;
        }>;
        period: string;
      };
      trends?: Array<{
        date: string;
        averageScore: number;
        totalTasks: number;
        activeValidators: number;
        networkUptime: number;
      }>;
      period?: string;
    }>(`${this.baseEndpoint}/performance-trends`, { days });

    if (response.data?.data) {
      return response.data.data;
    }

    if (Array.isArray(response.data?.trends)) {
      return {
        trends: response.data.trends,
        period: response.data.period ?? `${days} days`,
      };
    }

    return { trends: [], period: `${days} days` };
  }
}

// Create a singleton instance
export const overviewRepository = new OverviewRepository();
