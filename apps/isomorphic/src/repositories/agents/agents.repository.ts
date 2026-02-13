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
  MinerDetailsResponse,
  AgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
  AgentData,
  AgentPerformanceMetrics,
  AgentRunOverview,
  ScoreRoundDataPoint,
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
   * @param roundIdentifier - "season/round" (e.g. "83/20") or legacy round_number
   */
  async getRoundsData(roundIdentifier?: string | number): Promise<{
    rounds: string[];
    round_selected: {
      round: string;
      miners: Array<{
        uid: number;
        name: string;
        image: string | null;
        post_consensus_avg_reward: number;
        post_consensus_rank: number;
      }>;
    } | null;
  }> {
    const params: Record<string, string | number> = {};
    if (roundIdentifier !== undefined && roundIdentifier !== null) {
      if (typeof roundIdentifier === 'string' && roundIdentifier.includes('/')) {
        params.round_identifier = roundIdentifier;
      } else {
        params.round_number = Number(roundIdentifier);
      }
    }
    const response = await apiClient.get<{
      success: boolean;
      data: {
        rounds: string[];
        round_selected: {
          round: string;
          miners: Array<{
            uid: number;
            name: string;
            image: string | null;
            post_consensus_avg_reward: number;
            post_consensus_rank: number;
          }>;
        } | null;
      };
    }>(`${this.baseEndpoint}/rounds`, Object.keys(params).length ? params : undefined);
    return response.data.data;
  }

  /**
   * Get detailed information about a specific miner in a specific round
   * @param round - Round identifier in format "season/round" (e.g., "1/1") or legacy number
   */
  async getMinerRoundDetails(
    round: string | number,
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
    minerUid: number,
    season?: number
  ): Promise<MinerHistoricalResponse['data']> {
    const params: Record<string, string> = {};
    if (season !== undefined) {
      params.season = String(season);
    }
    const response = await apiClient.get<MinerHistoricalResponse>(
      `${this.baseEndpoint}/${minerUid}/historical`,
      params
    );
    return response.data.data;
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

}

// Create a singleton instance
export const agentsRepository = new AgentsRepository();
