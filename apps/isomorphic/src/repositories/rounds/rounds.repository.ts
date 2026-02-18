/**
 * Rounds API Service
 * Handles all API calls related to the rounds section of the dashboard
 */

import { apiClient } from "../client";
import {
  RoundsListResponse,
  RoundMinersResponse,
  RoundValidatorsResponse,
  RoundsListQueryParams,
  RoundMinersQueryParams,
  RoundActivityQueryParams,
  RoundData,
  RoundStatistics,
  MinerPerformance,
  ValidatorPerformance,
  RoundActivity,
  RoundProgress,
  GetRoundResponse,
} from "./rounds.types";

export class RoundsRepository {
  private readonly baseEndpoint = "/api/v1/rounds";

  private buildRoundPath(identifier: string | number): {
    path: string;
    fallbackId?: number;
  } {
    const raw = String(identifier ?? "").trim();
    if (!raw) {
      throw new Error("Round identifier is required");
    }
    
    // Check if it's a season/round format (e.g., "1/1" or "8/3")
    const seasonRoundMatch = raw.match(/^(\d+)\/(\d+)$/);
    if (seasonRoundMatch) {
      const season = Number.parseInt(seasonRoundMatch[1], 10);
      const round = Number.parseInt(seasonRoundMatch[2], 10);
      return {
        path: `${season}/${round}`,
        fallbackId: season * 10000 + round, // For backward compatibility
      };
    }
    
    const match = raw.match(/\d+/);
    const parsed = match ? Number.parseInt(match[0], 10) : undefined;
    const fallbackId =
      typeof parsed === "number" && !Number.isNaN(parsed) ? parsed : undefined;
    return {
      path: encodeURIComponent(raw),
      fallbackId,
    };
  }

  /**
   * Extract round payload from API response, handling various response formats
   */
  private extractRoundPayload(raw: any): any {
    const payloadCandidates = [
      raw?.data?.round,
      raw?.round,
      Array.isArray(raw?.data?.rounds) ? raw.data.rounds[0] : undefined,
      Array.isArray(raw?.rounds) ? raw.rounds[0] : undefined,
      raw,
    ];

    return (
      payloadCandidates.find(
        (candidate) =>
          candidate &&
          typeof candidate === "object" &&
          !Array.isArray(candidate)
      ) ?? {}
    );
  }

  /**
   * Generic helper to fetch data from round endpoints with nested data.data structure
   * Reduces duplication in methods that follow the pattern: buildPath -> get -> return data.data.XXX
   */
  private async fetchRoundEndpointData<T>(
    identifier: string | number,
    endpoint: string,
    dataKey: string,
    params?: any
  ): Promise<T> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<{ data: { [key: string]: T } }>(
      `${this.baseEndpoint}/${path}/${endpoint}`,
      params
    );
    return response.data.data[dataKey] as T;
  }

  /**
   * Normalize round payloads coming from the API into the RoundData shape expected by the UI.
   * Handles both camelCase and snake_case responses as well as string-based round identifiers.
   */
  private normalizeRoundData(rawRound: any, fallbackId?: number): RoundData {
    if (!rawRound || typeof rawRound !== "object") {
      throw new Error("Round data not found in API response");
    }

    const resolveNumber = (value: unknown): number | undefined => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string") {
        const match = value.match(/\d+/);
        if (match) {
          return Number.parseInt(match[0], 10);
        }
      }
      return undefined;
    };

    const id =
      resolveNumber(rawRound.round) ??
      resolveNumber(rawRound.roundNumber) ??
      resolveNumber(rawRound.id) ??
      resolveNumber(rawRound.roundId) ??
      resolveNumber(rawRound.round_id) ??
      (typeof fallbackId === "number" ? fallbackId : undefined);

    if (id === undefined) {
      throw new Error("Unable to determine round id from API response");
    }

    const startBlock = rawRound.startBlock ?? rawRound.start_block ?? 0;
    const endBlock = rawRound.endBlock ?? rawRound.end_block ?? startBlock;
    const currentBlock = rawRound.currentBlock ?? rawRound.current_block;

    // Normalize status from backend (handle both camelCase and snake_case)
    let status: RoundData["status"];
    const rawStatus = (rawRound.status ?? rawRound.Status)?.toLowerCase();
    if (
      rawStatus === "evaluating_finished" ||
      rawStatus === "evaluating-finished"
    ) {
      status = "evaluating_finished";
    } else if (rawStatus === "finished" || rawStatus === "completed") {
      status = "finished";
    } else if (rawStatus === "pending") {
      status = "pending";
    } else if (rawStatus === "active") {
      status = "active";
    } else {
      // Fallback based on current flag
      status = rawRound.current ? "active" : "finished";
    }

    const ensureIso = (value?: string | null): string | undefined => {
      if (!value) {
        return undefined;
      }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toISOString();
    };

    const validatorRounds: ValidatorRoundData[] = Array.isArray(
      rawRound.validatorRounds
    )
      ? rawRound.validatorRounds.map((validator: any) => ({
          validatorRoundId:
            validator.validatorRoundId ??
            validator.validator_round_id ??
            validator.roundKey ??
            validator.round_key ??
            validator.id,
          validatorUid:
            validator.validatorUid ?? validator.validator_uid ?? validator.uid,
          validatorName:
            validator.validatorName ??
            validator.validator_name ??
            validator.name,
          validatorHotkey:
            validator.validatorHotkey ??
            validator.validator_hotkey ??
            validator.hotkey,
          status: (() => {
            const vStatus = (
              validator.status ?? validator.Status
            )?.toLowerCase();
            if (
              vStatus === "evaluating_finished" ||
              vStatus === "evaluating-finished"
            ) {
              return "evaluating_finished" as const;
            } else if (vStatus === "finished" || vStatus === "completed") {
              return "finished" as const;
            } else if (vStatus === "pending") {
              return "pending" as const;
            } else if (vStatus === "active") {
              return "active" as const;
            }
            return (validator.current ? "active" : "finished") as const;
          })(),
          startTime:
            ensureIso(
              validator.startTime ??
                validator.started_at ??
                validator.start_time ??
                validator.startAt ??
                validator.start_at
            ) ?? "",
          endTime: ensureIso(
            validator.endTime ??
              validator.ended_at ??
              validator.end_time ??
              validator.endedAt ??
              validator.end_at
          ),
          averageScore:
            validator.averageScore ??
            validator.average_score ??
            validator.score ??
            0,
          topScore: validator.topScore ?? validator.top_score ?? 0,
          totalTasks:
            validator.totalTasks ??
            validator.total_tasks ??
            validator.tasks ??
            0,
          completedTasks:
            validator.completedTasks ??
            validator.completed_tasks ??
            validator.completed ??
            0,
          icon: validator.icon,
          agentEvaluationRuns: validator.agentEvaluationRuns ?? [],
          roundData: validator.roundData ?? validator,
        }))
      : [];

    const totalTasks =
      rawRound.totalTasks ??
      rawRound.n_tasks ??
      rawRound.tasks?.length ??
      validatorRounds.reduce(
        (sum, validator) => sum + (validator.totalTasks ?? 0),
        0
      );

    const completedTasks =
      rawRound.completedTasks ??
      rawRound.completed_tasks ??
      validatorRounds.reduce(
        (sum, validator) => sum + (validator.completedTasks ?? 0),
        0
      );

    let progress = rawRound.progress;
    if (
      progress === undefined &&
      typeof startBlock === "number" &&
      typeof endBlock === "number"
    ) {
    let effectiveCurrentBlock: number;
    if (currentBlock !== undefined) {
      effectiveCurrentBlock = currentBlock;
    } else if (status === "finished") {
      effectiveCurrentBlock = endBlock;
    } else {
      effectiveCurrentBlock = startBlock;
    }
    const range = endBlock - startBlock;
      progress =
        range > 0 ? (effectiveCurrentBlock - startBlock) / range : undefined;
    }

    return {
      id,
      round: rawRound.round ?? id,
      roundNumber: rawRound.roundNumber ?? rawRound.round ?? id,
      roundKey: rawRound.roundKey ?? `round_${id}`,
      season: rawRound.season ?? rawRound.Season ?? undefined,
      roundInSeason: rawRound.roundInSeason ?? rawRound.round_in_season ?? undefined,
      startBlock,
      endBlock,
      current: Boolean(rawRound.current ?? status === "active"),
      startTime:
        ensureIso(
          rawRound.startTime ??
            rawRound.started_at ??
            rawRound.start_time ??
            rawRound.startedAt ??
            rawRound.start_at
        ) ?? "",
      endTime: ensureIso(
        rawRound.endTime ??
          rawRound.ended_at ??
          rawRound.end_time ??
          rawRound.endedAt ??
          rawRound.end_at
      ),
      status,
      totalTasks,
      completedTasks,
      averageScore: rawRound.averageScore ?? rawRound.average_score ?? 0,
      topScore: rawRound.topScore ?? rawRound.top_score ?? 0,
      currentBlock:
        currentBlock ?? (status === "finished" ? endBlock : undefined),
      blocksRemaining:
        rawRound.blocksRemaining ??
        rawRound.blocks_remaining ??
        (typeof endBlock === "number" && typeof currentBlock === "number"
          ? Math.max(endBlock - currentBlock, 0)
          : undefined),
      progress,
      validatorRounds,
    };
  }

  /**
   * Get lightweight list of round IDs only (no nested data)
   * Much faster than getRounds() - use for dropdowns and initial lists
   */
  async getRoundIds(params?: {
    limit?: number;
    status?: string;
    sortOrder?: string;
  }): Promise<{ roundIds: number[]; total: number }> {
    const response = await apiClient.get<any>(
      `${this.baseEndpoint}/ids`,
      params
    );
    return {
      roundIds: response.data?.data?.roundIds ?? response.data?.roundIds ?? [],
      total: response.data?.data?.total ?? response.data?.total ?? 0,
    };
  }

  /**
   * Get list of all rounds with optional filtering and pagination
   */
  async getRounds(params?: RoundsListQueryParams): Promise<RoundsListResponse> {
    const response = await apiClient.get<any>(this.baseEndpoint, params);
    const responseData = response.data?.data ?? response.data ?? {};

    let roundsArraySource: any[];
    if (Array.isArray(responseData.rounds)) {
      roundsArraySource = responseData.rounds;
    } else if (Array.isArray(response.data?.rounds)) {
      roundsArraySource = response.data.rounds;
    } else {
      roundsArraySource = [];
    }

    const normalizedRounds = roundsArraySource.map((round: any) =>
      this.normalizeRoundData(round)
    );

    const total =
      responseData.total ?? response.data?.total ?? normalizedRounds.length;
    const page = responseData.page ?? response.data?.page ?? params?.page ?? 1;
    const limit =
      responseData.limit ??
      response.data?.limit ??
      params?.limit ??
      normalizedRounds.length;

    const currentRoundRaw =
      responseData.currentRound ?? response.data?.currentRound;

    const currentRound = currentRoundRaw
      ? this.normalizeRoundData(currentRoundRaw)
      : undefined;

    return {
      data: {
        rounds: normalizedRounds,
        total,
        page,
        limit,
        ...(currentRound ? { currentRound } : {}),
      },
    };
  }

  /**
   * Get basic round info (without nested tasks/solutions/evaluations)
   * Use this for round page header and status - much faster than getRound()
   */
  async getRoundBasic(identifier: string | number): Promise<RoundData> {
    const { path, fallbackId } = this.buildRoundPath(identifier);
    const response = await apiClient.get<any>(
      `${this.baseEndpoint}/${path}/basic`
    );
    const payload = this.extractRoundPayload(response.data);
    return this.normalizeRoundData(payload, fallbackId);
  }

  /**
   * Get full details for a specific round by ID (includes all nested data)
   * WARNING: This is SLOW (25+ seconds) - use getRoundBasic() when possible
   */
  async getRound(identifier: string | number): Promise<RoundData> {
    const { path, fallbackId } = this.buildRoundPath(identifier);
    const response = await apiClient.get<any>(`${this.baseEndpoint}/${path}`);
    const payload = this.extractRoundPayload(response.data);
    return this.normalizeRoundData(payload, fallbackId);
  }

  /**
   * Get current round information
   */
  async getCurrentRound(): Promise<RoundData> {
    const response = await apiClient.get<any>(`${this.baseEndpoint}/current`);
    const payload = this.extractRoundPayload(response.data);
    return this.normalizeRoundData(payload);
  }

  /**
   * Get round statistics and performance metrics
   */
  async getRoundStatistics(
    identifier: string | number
  ): Promise<RoundStatistics> {
    return this.fetchRoundEndpointData<RoundStatistics>(
      identifier,
      "statistics",
      "statistics"
    );
  }

  /**
   * Get miners performance for a specific round
   */
  async getRoundMiners(
    identifier: string | number,
    params?: RoundMinersQueryParams
  ): Promise<RoundMinersResponse> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<RoundMinersResponse>(
      `${this.baseEndpoint}/${path}/miners`,
      params
    );
    return response.data;
  }

  /**
   * Get validators performance for a specific round
   */
  async getRoundValidators(
    identifier: string | number
  ): Promise<ValidatorPerformance[]> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<RoundValidatorsResponse>(
      `${this.baseEndpoint}/${path}/validators`
    );
    return response.data.data.validators.map(
      (validator: ValidatorPerformance & { top_score?: number }) => ({
        ...validator,
        topScore:
          validator.topScore ??
          validator.top_score ??
          validator.averageScore ??
          0,
      })
    );
  }

  /**
   * Get recent activity for a specific round
   */
  async getRoundActivity(
    identifier: string | number,
    params?: RoundActivityQueryParams
  ): Promise<RoundActivity[]> {
    return this.fetchRoundEndpointData<RoundActivity[]>(
      identifier,
      "activity",
      "activities",
      params
    );
  }

  /**
   * Get round progress information
   */
  async getRoundProgress(identifier: string | number): Promise<RoundProgress> {
    return this.fetchRoundEndpointData<RoundProgress>(
      identifier,
      "progress",
      "progress"
    );
  }

  /**
   * Get aggregated metrics and validators data from the new simplified endpoint (DEPRECATED - use getRoundSimplified)
   */
  async getRoundOld(roundNumber: number): Promise<{
    round_number: number;
    aggregated: {
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
      } | null;
      avg_winner_score: number;
      avg_eval_time: number;
      miners_evaluated: number;
      tasks_evaluated: number;
    };
    validators: Array<{
      validator_uid: number;
      validator_name: string;
      validator_hotkey: string;
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
      } | null;
      local_avg_winner_score: number;
      local_avg_eval_time: number;
      local_miners_evaluated: number;
      local_tasks_evaluated: number;
    }>;
  }> {
    // DEPRECATED: This method uses the old API format
    throw new Error("getRoundOld is deprecated. Use getRoundSimplified with season and roundInSeason.");
  }
  
  /**
   * Get round details from simplified endpoint using season and round_in_season
   */
  async getRoundSimplified(season: number, roundInSeason: number): Promise<{
    round_number: number;
    season: number;
    round_in_season: number;
    post_consensus_summary: {
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
        avg_reward: number;
        avg_eval_score: number;
        avg_eval_time: number;
      } | null;
      miners_evaluated: number;
      tasks_evaluated: number;
    };
    validators: Array<{
      validator_uid: number;
      validator_name: string;
      validator_hotkey: string;
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
      } | null;
      local_avg_winner_score: number;
      local_avg_eval_time: number;
      local_miners_evaluated: number;
      local_tasks_evaluated: number;
      miners: Array<{
        uid: number;
        name: string;
        hotkey: string | null;
        image: string | null;
        local_rank: number | null;
        local_avg_reward: number;
        local_avg_eval_score: number;
        local_avg_eval_time: number;
      }>;
    }>;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        round_number: number;
        season: number;
        round_in_season: number;
        post_consensus_summary: {
          winner: {
            uid: number;
            name: string;
            image: string | null;
            hotkey: string | null;
            avg_reward: number;
            avg_eval_score: number;
            avg_eval_time: number;
          } | null;
          miners_evaluated: number;
          tasks_evaluated: number;
        };
        validators: Array<{
          validator_uid: number;
          validator_name: string;
          validator_hotkey: string;
          winner: {
            uid: number;
            name: string;
            image: string | null;
            hotkey: string | null;
          } | null;
          topScore: number;
          local_avg_winner_score: number;
          local_avg_eval_time: number;
          local_miners_evaluated: number;
          local_tasks_evaluated: number;
          miners: Array<{
            uid: number;
            name: string;
            hotkey: string | null;
            image: string | null;
            local_rank: number | null;
            local_avg_reward: number;
            local_avg_eval_score: number;
            local_avg_eval_time: number;
          }>;
        }>;
      };
    }>(`${this.baseEndpoint}/get-round`, { season, round_in_season: roundInSeason });
    return response.data.data;
  }

  /**
   * Get top performing miners for a round
   */
  async getTopMiners(
    identifier: string | number,
    limit: number = 10
  ): Promise<MinerPerformance[]> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<RoundMinersResponse>(
      `${this.baseEndpoint}/${path}/miners/top`,
      { limit, sortBy: "score", sortOrder: "desc" }
    );
    return response.data.data.miners;
  }

  /**
   * Get miner details for a specific round
   */
  async getMinerPerformance(
    identifier: string | number,
    minerUid: number
  ): Promise<MinerPerformance> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<{ data: { miner: MinerPerformance } }>(
      `${this.baseEndpoint}/${path}/miners/${minerUid}`
    );
    return response.data.data.miner;
  }

  /**
   * Get validator details for a specific round
   */
  async getValidatorPerformance(
    identifier: string | number,
    validatorId: string
  ): Promise<ValidatorPerformance> {
    const { path } = this.buildRoundPath(identifier);
    const response = await apiClient.get<{
      data: { validator: ValidatorPerformance };
    }>(`${this.baseEndpoint}/${path}/validators/${validatorId}`);
    return response.data.data.validator;
  }

  /**
   * Get round summary (quick stats)
   */
  async getRoundSummary(identifier: string | number): Promise<{
    roundId: number;
    status: string;
    progress: number;
    totalMiners: number;
    averageScore: number;
    topScore: number;
    timeRemaining?: string;
  }> {
    const { path } = this.buildRoundPath(identifier);
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
    }>(`${this.baseEndpoint}/${path}/summary`);
    return response.data.data;
  }

  /**
   * Get round details with validators local and post-consensus data
   */
  async getRoundWithValidators(
    season: number,
    roundInSeason: number
  ): Promise<GetRoundResponse> {
    const response = await apiClient.get<GetRoundResponse>(
      `${this.baseEndpoint}/get-round`,
      { season, round_in_season: roundInSeason }
    );
    return response.data;
  }
}

// Create a singleton instance
export const roundsRepository = new RoundsRepository();
