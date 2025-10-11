/**
 * Rounds API Service
 * Handles all API calls related to the rounds section of the dashboard
 */

import { apiClient } from './client';
import {
  RoundsListResponse,
  RoundDetailsResponse,
  RoundStatisticsResponse,
  RoundMinersResponse,
  RoundValidatorsResponse,
  RoundActivityResponse,
  RoundProgressResponse,
  RoundsListQueryParams,
  RoundMinersQueryParams,
  RoundActivityQueryParams,
  RoundData,
  RoundStatistics,
  MinerPerformance,
  ValidatorPerformance,
  RoundActivity,
  RoundProgress,
} from './types/rounds';

export class RoundsService {
  private readonly baseEndpoint = '/api/v1/rounds';

  /**
   * Get list of all rounds with optional filtering and pagination
   */
  async getRounds(params?: RoundsListQueryParams): Promise<RoundsListResponse> {
    const response = await apiClient.get<RoundsListResponse>(
      this.baseEndpoint,
      params
    );
    return response.data;
  }

  /**
   * Get details for a specific round by ID
   */
  async getRound(id: number): Promise<RoundData> {
    const response = await apiClient.get<RoundDetailsResponse>(
      `${this.baseEndpoint}/${id}`
    );
    return response.data.data.round;
  }

  /**
   * Get current round information
   */
  async getCurrentRound(): Promise<RoundData> {
    const response = await apiClient.get<RoundDetailsResponse>(
      `${this.baseEndpoint}/current`
    );
    return response.data.data.round;
  }

  /**
   * Get round statistics and performance metrics
   */
  async getRoundStatistics(roundId: number): Promise<RoundStatistics> {
    const response = await apiClient.get<RoundStatisticsResponse>(
      `${this.baseEndpoint}/${roundId}/statistics`
    );
    return response.data.data.statistics;
  }

  /**
   * Get miners performance for a specific round
   */
  async getRoundMiners(roundId: number, params?: RoundMinersQueryParams): Promise<RoundMinersResponse> {
    const response = await apiClient.get<RoundMinersResponse>(
      `${this.baseEndpoint}/${roundId}/miners`,
      params
    );
    return response.data;
  }

  /**
   * Get validators performance for a specific round
   */
  async getRoundValidators(roundId: number): Promise<ValidatorPerformance[]> {
    const response = await apiClient.get<RoundValidatorsResponse>(
      `${this.baseEndpoint}/${roundId}/validators`
    );
    return response.data.data.validators;
  }

  /**
   * Get recent activity for a specific round
   */
  async getRoundActivity(roundId: number, params?: RoundActivityQueryParams): Promise<RoundActivity[]> {
    const response = await apiClient.get<RoundActivityResponse>(
      `${this.baseEndpoint}/${roundId}/activity`,
      params
    );
    return response.data.data.activities;
  }

  /**
   * Get round progress information
   */
  async getRoundProgress(roundId: number): Promise<RoundProgress> {
    const response = await apiClient.get<RoundProgressResponse>(
      `${this.baseEndpoint}/${roundId}/progress`
    );
    return response.data.data.progress;
  }

  /**
   * Get top performing miners for a round
   */
  async getTopMiners(roundId: number, limit: number = 10): Promise<MinerPerformance[]> {
    const response = await apiClient.get<RoundMinersResponse>(
      `${this.baseEndpoint}/${roundId}/miners/top`,
      { limit, sortBy: 'score', sortOrder: 'desc' }
    );
    return response.data.data.miners;
  }

  /**
   * Get miner details for a specific round
   */
  async getMinerPerformance(roundId: number, minerUid: number): Promise<MinerPerformance> {
    const response = await apiClient.get<{ data: { miner: MinerPerformance } }>(
      `${this.baseEndpoint}/${roundId}/miners/${minerUid}`
    );
    return response.data.data.miner;
  }

  /**
   * Get validator details for a specific round
   */
  async getValidatorPerformance(roundId: number, validatorId: string): Promise<ValidatorPerformance> {
    const response = await apiClient.get<{ data: { validator: ValidatorPerformance } }>(
      `${this.baseEndpoint}/${roundId}/validators/${validatorId}`
    );
    return response.data.data.validator;
  }

  /**
   * Get round comparison data (multiple rounds)
   */
  async getRoundComparison(roundIds: number[]): Promise<{
    rounds: Array<{
      roundId: number;
      statistics: RoundStatistics;
      topMiners: MinerPerformance[];
    }>;
  }> {
    const response = await apiClient.post<{
      data: {
        rounds: Array<{
          roundId: number;
          statistics: RoundStatistics;
          topMiners: MinerPerformance[];
        }>;
      };
    }>(`${this.baseEndpoint}/compare`, { roundIds });
    return response.data.data;
  }

  /**
   * Get round timeline (progress over time)
   */
  async getRoundTimeline(roundId: number): Promise<{
    timeline: Array<{
      timestamp: string;
      block: number;
      completedTasks: number;
      averageScore: number;
      activeMiners: number;
    }>;
  }> {
    const response = await apiClient.get<{
      data: {
        timeline: Array<{
          timestamp: string;
          block: number;
          completedTasks: number;
          averageScore: number;
          activeMiners: number;
        }>;
      };
    }>(`${this.baseEndpoint}/${roundId}/timeline`);
    return response.data.data;
  }

  /**
   * Get round summary (quick stats)
   */
  async getRoundSummary(roundId: number): Promise<{
    roundId: number;
    status: string;
    progress: number;
    totalMiners: number;
    averageScore: number;
    topScore: number;
    timeRemaining?: string;
  }> {
    const response = await apiClient.get<{
      data: {
        roundId: number;
        status: string;
        progress: number;
        totalMiners: number;
        averageScore: number;
        topScore: number;
        timeRemaining?: string;
      };
    }>(`${this.baseEndpoint}/${roundId}/summary`);
    return response.data.data;
  }
}

// Create a singleton instance
export const roundsService = new RoundsService();
