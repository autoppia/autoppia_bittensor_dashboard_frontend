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
  RewardRoundDataPoint,
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
   * Get the latest round and top miner for initial redirect.
   * Backend returns season and round as separate numbers.
   * Returns null when no rounds are available (frontend should use rounds list fallback).
   */
  async getLatestRoundTopMiner(): Promise<{
    season: number;
    round: number | null;
    miner_uid: number;
    miner_hotkey: string | null;
  } | null> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          season: number;
          round: number;
          miner_uid: number;
          miner_hotkey: string | null;
        } | null;
      }>(`${this.baseEndpoint}/latest-round-top-miner`);
      return response.data.data;
    } catch (error) {
      console.error('[AgentsRepository] Error fetching latest round top miner:', error);
      throw error;
    }
  }

  /**
   * Legacy rounds endpoint retained for non-agents screens still depending on it.
   * Agents sidebar/landing no longer use this route.
   */
  async getRoundsData(options?: {
    roundIdentifier?: string | number;
    season?: number;
  }): Promise<{
    rounds: string[];
    round_selected: {
        round: string;
        season?: number;
        season_leader_uid?: number | null;
        season_leader_reward?: number | null;
        miners: Array<{
          uid: number;
          name: string;
          image: string | null;
          post_consensus_avg_reward: number;
          best_reward_in_season?: number;
          best_local_round_reward?: number;
          best_round_in_season?: number | null;
          post_consensus_rank: number;
          is_reigning_leader?: boolean;
        }>;
    } | null;
  }> {
    const params: Record<string, string | number> = {};
    if (options?.season !== undefined && options?.season !== null) {
      params.season = Number(options.season);
    }
    if (options?.roundIdentifier !== undefined && options?.roundIdentifier !== null) {
      if (typeof options.roundIdentifier === 'string' && options.roundIdentifier.includes('/')) {
        params.round_identifier = options.roundIdentifier;
      } else {
        params.round_number = Number(options.roundIdentifier);
      }
    }
    const response = await apiClient.get<{
      success: boolean;
      data: {
        rounds: string[];
        round_selected: {
          round: string;
          season?: number;
          season_leader_uid?: number | null;
          season_leader_reward?: number | null;
          miners: Array<{
            uid: number;
            name: string;
            image: string | null;
            post_consensus_avg_reward: number;
            best_reward_in_season?: number;
            best_local_round_reward?: number;
            best_round_in_season?: number | null;
            post_consensus_rank: number;
            is_reigning_leader?: boolean;
          }>;
        } | null;
      };
    }>(`${this.baseEndpoint}/rounds`, Object.keys(params).length ? params : undefined);
    return response.data.data;
  }

  async getSeasonRank(seasonRef?: number | "latest"): Promise<{
    season: number | null;
    latestSeason: number | null;
    availableSeasons: number[];
    season_leader_uid?: number | null;
    season_leader_reward?: number | null;
    miners: Array<{
      uid: number;
      name: string;
      image: string | null;
      post_consensus_avg_reward: number;
      best_reward_in_season?: number;
      best_local_round_reward?: number;
      best_round_in_season?: number | null;
      post_consensus_rank: number;
      is_reigning_leader?: boolean;
    }>;
  }> {
    const ref = seasonRef === undefined || seasonRef === null ? "latest" : String(seasonRef);
    const response = await apiClient.get<{
      success: boolean;
      data: {
        season: number | null;
        latestSeason: number | null;
        availableSeasons: number[];
        season_leader_uid?: number | null;
        season_leader_reward?: number | null;
        miners: Array<{
          uid: number;
          name: string;
          image: string | null;
          post_consensus_avg_reward: number;
          best_reward_in_season?: number;
          best_local_round_reward?: number;
          best_round_in_season?: number | null;
          post_consensus_rank: number;
          is_reigning_leader?: boolean;
        }>;
      };
    }>(`${this.baseEndpoint}/seasons/${ref}/rank`);
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
    const payload: any = response.data?.data;

    // Backward/compat shape: some backends return agent detail payload in this endpoint.
    // Normalize to MinerRoundDetailsResponse['data'] expected by the UI.
    if (payload && !payload.miner && payload.agent) {
      const agent = payload.agent ?? {};
      const roundMetrics = payload.roundMetrics ?? {};
      const parsedRound = (() => {
        const value = Number(round);
        if (Number.isFinite(value)) return value;
        const fromMetrics = Number(roundMetrics.roundId ?? 0);
        return Number.isFinite(fromMetrics) ? fromMetrics : 0;
      })();
      return {
        miner: {
          uid: Number(agent.uid ?? miner_uid),
          name: String(agent.name ?? `miner ${miner_uid}`),
          hotkey: agent.hotkey ?? null,
          image: agent.imageUrl ?? null,
          github_url: agent.githubUrl ?? null,
        },
        round: parsedRound,
        post_consensus_rank: Number(roundMetrics.rank ?? agent.currentRank ?? 0),
        post_consensus_avg_reward: Number(roundMetrics.reward ?? agent.currentReward ?? 0),
        post_consensus_avg_eval_score: 0,
        post_consensus_avg_eval_time: Number(roundMetrics.averageResponseTime ?? agent.averageResponseTime ?? 0),
        tasks_received: Number(roundMetrics.totalTasks ?? agent.totalTasks ?? 0),
        tasks_success: Number(roundMetrics.completedTasks ?? agent.completedTasks ?? 0),
        validators_count: Number(roundMetrics.totalValidators ?? 0),
        avg_tasks_per_validator: Number(
          roundMetrics.totalValidators
            ? (Number(roundMetrics.totalTasks ?? 0) / Number(roundMetrics.totalValidators))
            : 0
        ),
        performanceByWebsite:
          (Array.isArray(payload.performanceByWebsite) && payload.performanceByWebsite) ||
          (Array.isArray(roundMetrics.performanceByWebsite) && roundMetrics.performanceByWebsite) ||
          [],
        avg_cost_per_task:
          payload.avg_cost_per_task ??
          roundMetrics.avgCostPerTask ??
          null,
        task_timeout_seconds:
          payload.task_timeout_seconds ??
          roundMetrics.taskTimeoutSeconds ??
          undefined,
        max_task_cost_usd:
          payload.max_task_cost_usd ??
          roundMetrics.maxTaskCostUsd ??
          undefined,
        validators: Array.isArray(roundMetrics.validators)
          ? roundMetrics.validators.map((v: any) => ({
              validator_uid: Number(v.uid ?? 0),
              validator_name: v.name ?? (v.uid == null ? "Validator" : `Validator ${v.uid}`),
              validator_hotkey: v.hotkey ?? null,
              validator_image: null,
              local_rank: null,
              local_avg_reward: 0,
              local_avg_eval_score: 0,
              local_avg_eval_time: 0,
              local_tasks_received: 0,
              local_tasks_success: 0,
              local_miners_evaluated: 0,
              is_reused: payload.is_reused ?? roundMetrics.isReused ?? false,
              reused_from_agent_run_id:
                payload.reused_from_agent_run_id ??
                roundMetrics.reusedFromAgentRunId ??
                null,
              reused_from_round:
                payload.reused_from_round ??
                roundMetrics.reusedFromRound ??
                null,
            }))
          : [],
        post_consensus_summary:
          payload.post_consensus_summary ??
          roundMetrics.postConsensusSummary ??
          undefined,
        season_leadership:
          payload.season_leadership ??
          roundMetrics.seasonLeadership ??
          undefined,
        rewardRoundData: Array.isArray(payload.rewardRoundData) ? payload.rewardRoundData : [],
      } as MinerRoundDetailsResponse['data'];
    }

    return payload;
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
    params?: { round?: number; season?: number }
  ): Promise<{
    agent: AgentData;
    rewardRoundData: RewardRoundDataPoint[];
    availableRounds?: Array<number | string>;
    roundMetrics?: AgentRoundMetrics | null;
    performanceByWebsite?: MinerDetailsResponse["data"]["performanceByWebsite"];
    avg_cost_per_task?: number | null;
    is_reused?: boolean;
    reused_from_agent_run_id?: string | null;
    reused_from_round?: string | null;
    zero_reason?: string | null;
    season_leadership?: MinerDetailsResponse["data"]["season_leadership"];
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
    params?: { round?: number; season?: number }
  ): Promise<{
    agent: AgentData;
    rewardRoundData: RewardRoundDataPoint[];
    availableRounds?: Array<number | string>;
    roundMetrics?: AgentRoundMetrics | null;
    performanceByWebsite?: AgentDetailsResponse["data"]["performanceByWebsite"];
    avg_cost_per_task?: number | null;
    is_reused?: boolean;
    reused_from_agent_run_id?: string | null;
    reused_from_round?: string | null;
    zero_reason?: string | null;
    season_leadership?: AgentDetailsResponse["data"]["season_leadership"];
  }> {
    const response = await apiClient.get<AgentDetailsResponse>(
      `${this.baseEndpoint}/${id}`,
      params
    );
    return {
      agent: response.data.data.agent,
      rewardRoundData: response.data.data.rewardRoundData,
      availableRounds: response.data.data.availableRounds,
      roundMetrics: response.data.data.roundMetrics,
      performanceByWebsite: response.data.data.performanceByWebsite,
      avg_cost_per_task: response.data.data.avg_cost_per_task,
      is_reused: response.data.data.is_reused,
      reused_from_agent_run_id: response.data.data.reused_from_agent_run_id,
      reused_from_round: response.data.data.reused_from_round,
      zero_reason: response.data.data.zero_reason,
      season_leadership: response.data.data.season_leadership,
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
