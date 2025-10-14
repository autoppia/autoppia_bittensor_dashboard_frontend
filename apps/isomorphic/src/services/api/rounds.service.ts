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
   * Normalize round payloads coming from the API into the RoundData shape expected by the UI.
   * Handles both camelCase and snake_case responses as well as string-based round identifiers.
   */
  private normalizeRoundData(rawRound: any, fallbackId?: number): RoundData {
    if (!rawRound || typeof rawRound !== 'object') {
      throw new Error('Round data not found in API response');
    }

    const extractNumericId = (): number => {
      if (typeof rawRound.id === 'number') {
        return rawRound.id;
      }
      if (typeof rawRound.roundId === 'number') {
        return rawRound.roundId;
      }
      if (typeof rawRound.round_id === 'number') {
        return rawRound.round_id;
      }
      if (typeof rawRound.round_id === 'string') {
        const match = rawRound.round_id.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
      }
      if (typeof fallbackId === 'number' && !Number.isNaN(fallbackId)) {
        return fallbackId;
      }
      throw new Error('Unable to determine round id from API response');
    };
    const id = extractNumericId();

    const validatorUid =
      rawRound.validatorUid ??
      rawRound.validator_uid ??
      rawRound.validatorId ??
      rawRound.validator_id ??
      rawRound.validator?.uid ??
      (typeof rawRound.validator === 'number' ? rawRound.validator : undefined);

    const validatorHotkey =
      rawRound.validatorHotkey ??
      rawRound.validator_hotkey ??
      rawRound.validator?.hotkey;

    const validatorName =
      rawRound.validatorName ??
      rawRound.validator_name ??
      rawRound.validator?.name;

    const startTimeValue =
      rawRound.startTime ??
      rawRound.started_at ??
      rawRound.start_time ??
      rawRound.startedAt ??
      rawRound.start_at ??
      '';

    const endTimeValue =
      rawRound.endTime ??
      rawRound.ended_at ??
      rawRound.end_time ??
      rawRound.endedAt ??
      rawRound.end_at;

    const rawRoundIdentifier =
      rawRound.roundKey ??
      rawRound.round_key ??
      rawRound.roundUid ??
      rawRound.round_uid ??
      rawRound.roundId ??
      rawRound.round_id ??
      rawRound.id;

    let roundKey: string | undefined;
    if (
      typeof rawRoundIdentifier === 'string' &&
      rawRoundIdentifier.trim() &&
      rawRoundIdentifier.trim() !== String(id)
    ) {
      roundKey = rawRoundIdentifier.trim();
    } else if (
      typeof rawRoundIdentifier === 'number' &&
      !Number.isNaN(rawRoundIdentifier) &&
      rawRoundIdentifier !== id
    ) {
      roundKey = String(rawRoundIdentifier);
    }

    if (!roundKey) {
      const uniqueDescriptors = [
        validatorUid !== undefined ? `uid:${validatorUid}` : null,
        validatorHotkey ? `hotkey:${validatorHotkey}` : null,
        validatorName ? `name:${validatorName}` : null,
        startTimeValue ? `start:${startTimeValue}` : null,
        endTimeValue ? `end:${endTimeValue}` : null,
        rawRound.averageScore !== undefined
          ? `avg:${rawRound.averageScore}`
          : null,
        rawRound.topScore !== undefined ? `top:${rawRound.topScore}` : null,
        rawRound.totalTasks !== undefined
          ? `tasks:${rawRound.totalTasks}`
          : null,
        rawRound.completedTasks !== undefined
          ? `completed:${rawRound.completedTasks}`
          : null,
      ]
        .filter((descriptor): descriptor is string => Boolean(descriptor))
        .join('|');

      const fingerprintSource =
        uniqueDescriptors ||
        (typeof rawRound === 'object' ? JSON.stringify(rawRound) : String(id));

      let hash = 0;
      for (let index = 0; index < fingerprintSource.length; index += 1) {
        const charCode = fingerprintSource.charCodeAt(index);
        hash = (hash << 5) - hash + charCode;
        hash |= 0;
      }
      const encodedHash = Math.abs(hash).toString(36);
      roundKey = `${id}-${encodedHash}`;
    }

    const startBlock = rawRound.startBlock ?? rawRound.start_block;
    const endBlock = rawRound.endBlock ?? rawRound.end_block;
    let currentBlock = rawRound.currentBlock ?? rawRound.current_block;
    const status = (rawRound.status ??
      (rawRound.current ? 'active' : 'completed')) as RoundData['status'];

    if (
      (currentBlock === undefined || currentBlock === null) &&
      status === 'completed' &&
      typeof endBlock === 'number'
    ) {
      currentBlock = endBlock;
    }

    const blocksRemaining =
      rawRound.blocksRemaining ??
      rawRound.blocks_remaining ??
      (typeof endBlock === 'number' && typeof currentBlock === 'number'
        ? Math.max(endBlock - currentBlock, 0)
        : undefined);

    const computedProgress =
      rawRound.progress ??
      rawRound.progress_percent ??
      (typeof startBlock === 'number' &&
        typeof endBlock === 'number' &&
        typeof currentBlock === 'number' &&
        endBlock !== startBlock
        ? Math.min(
            Math.max((currentBlock - startBlock) / (endBlock - startBlock), 0),
            1
          )
        : status === 'completed'
        ? 1
        : undefined);

    return {
      id,
      roundKey,
      startBlock: startBlock ?? 0,
      endBlock: endBlock ?? 0,
      current: rawRound.current ?? status === 'active',
      startTime: startTimeValue,
      endTime: endTimeValue,
      status,
      totalTasks:
        rawRound.totalTasks ?? rawRound.n_tasks ?? rawRound.tasks?.length ?? 0,
      completedTasks:
        rawRound.completedTasks ??
        rawRound.completed_tasks ??
        rawRound.tasks?.filter((task: any) => task?.status === 'completed')
          ?.length ??
        rawRound.n_winners ??
        0,
      averageScore: rawRound.averageScore ?? rawRound.average_score ?? 0,
      topScore: rawRound.topScore ?? rawRound.top_score ?? 0,
      currentBlock:
        currentBlock ??
        (status === 'completed' ? (endBlock ?? undefined) : undefined),
      blocksRemaining,
      progress: computedProgress,
      validatorUid,
      validatorHotkey,
      validatorName,
    };
  }

  /**
   * Get list of all rounds with optional filtering and pagination
   */
  async getRounds(params?: RoundsListQueryParams): Promise<RoundsListResponse> {
    const response = await apiClient.get<any>(
      this.baseEndpoint,
      params
    );
    const responseData = response.data?.data ?? response.data ?? {};

    const roundsArraySource =
      Array.isArray(responseData.rounds)
        ? responseData.rounds
        : Array.isArray(response.data?.rounds)
        ? response.data.rounds
        : [];

    const normalizedRounds = roundsArraySource.map((round: any) =>
      this.normalizeRoundData(round)
    );

    const uniqueRoundsMap = new Map<number, RoundData>();

    const getTimestamp = (value?: string): number => {
      if (!value) {
        return Number.NaN;
      }
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? Number.NaN : timestamp;
    };

    normalizedRounds.forEach((round) => {
      const existing = uniqueRoundsMap.get(round.id);
      if (!existing) {
        uniqueRoundsMap.set(round.id, round);
        return;
      }

      const existingTimestamp = getTimestamp(existing.startTime);
      const candidateTimestamp = getTimestamp(round.startTime);

      if (
        Number.isNaN(existingTimestamp) &&
        !Number.isNaN(candidateTimestamp)
      ) {
        uniqueRoundsMap.set(round.id, round);
        return;
      }

      if (
        !Number.isNaN(existingTimestamp) &&
        !Number.isNaN(candidateTimestamp) &&
        candidateTimestamp > existingTimestamp
      ) {
        uniqueRoundsMap.set(round.id, round);
      }
    });

    const uniqueRounds = Array.from(uniqueRoundsMap.values());

    const total =
      responseData.total ??
      response.data?.total ??
      uniqueRounds.length;
    const page =
      responseData.page ??
      response.data?.page ??
      params?.page ??
      1;
    const limit =
      responseData.limit ??
      response.data?.limit ??
      params?.limit ??
      uniqueRounds.length;

    return {
      data: {
        rounds: uniqueRounds,
        total,
        page,
        limit,
      },
    };
  }

  /**
   * Get details for a specific round by ID
   */
  async getRound(id: number): Promise<RoundData> {
    const response = await apiClient.get<any>(`${this.baseEndpoint}/${id}`);
    const raw = response.data;
    const payloadCandidates = [
      raw?.data?.round,
      raw?.round,
      Array.isArray(raw?.data?.rounds) ? raw.data.rounds[0] : undefined,
      Array.isArray(raw?.rounds) ? raw.rounds[0] : undefined,
      raw,
    ];

    const payload =
      payloadCandidates.find(
        (candidate) =>
          candidate &&
          typeof candidate === 'object' &&
          !Array.isArray(candidate)
      ) ?? {};

    return this.normalizeRoundData(payload, id);
  }

  /**
   * Get current round information
   */
  async getCurrentRound(): Promise<RoundData> {
    const response = await apiClient.get<any>(`${this.baseEndpoint}/current`);
    const raw = response.data;
    const payloadCandidates = [
      raw?.data?.round,
      raw?.round,
      Array.isArray(raw?.data?.rounds) ? raw.data.rounds[0] : undefined,
      Array.isArray(raw?.rounds) ? raw.rounds[0] : undefined,
      raw,
    ];

    const payload =
      payloadCandidates.find(
        (candidate) =>
          candidate &&
          typeof candidate === 'object' &&
          !Array.isArray(candidate)
      ) ?? {};

    return this.normalizeRoundData(payload);
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
