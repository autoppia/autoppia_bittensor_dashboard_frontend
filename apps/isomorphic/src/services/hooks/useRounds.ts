/**
 * React hooks for Rounds API service
 * Provides easy-to-use hooks for fetching rounds data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { roundsService } from '../api/rounds.service';
import type {
  RoundData,
  RoundStatistics,
  MinerPerformance,
  ValidatorPerformance,
  RoundActivity,
  RoundProgress,
  RoundsListQueryParams,
  RoundMinersQueryParams,
  RoundActivityQueryParams,
} from '../api/types/rounds';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [...dependencies, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

type RoundIdentifier = number | string;

const isValidRoundIdentifier = (id?: RoundIdentifier): id is RoundIdentifier => {
  if (typeof id === 'number') {
    return Number.isFinite(id) && id > 0;
  }
  if (typeof id === 'string') {
    return id.trim().length > 0;
  }
  return false;
};

const identifierKey = (id?: RoundIdentifier): string =>
  id === undefined ? '' : String(id);

// Hook for rounds list
export function useRounds(params?: RoundsListQueryParams) {
  return useApiCall(
    () => roundsService.getRounds(params),
    [JSON.stringify(params)]
  );
}

// Hook for specific round details
export function useRound(id?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(id);
  return useApiCall(
    () => roundsService.getRound(id as RoundIdentifier),
    [identifierKey(id)],
    enabled
  );
}

// Hook for current round
export function useCurrentRound() {
  return useApiCall(() => roundsService.getCurrentRound());
}

// Hook for round statistics
export function useRoundStatistics(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getRoundStatistics(roundId as RoundIdentifier),
    [identifierKey(roundId)],
    enabled
  );
}

// Hook for round miners
export function useRoundMiners(roundId?: RoundIdentifier, params?: RoundMinersQueryParams) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getRoundMiners(roundId as RoundIdentifier, params),
    [identifierKey(roundId), JSON.stringify(params)],
    enabled
  );
}

// Hook for round validators
export function useRoundValidators(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getRoundValidators(roundId as RoundIdentifier),
    [identifierKey(roundId)],
    enabled
  );
}

// Hook for round activity
export function useRoundActivity(roundId?: RoundIdentifier, params?: RoundActivityQueryParams) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getRoundActivity(roundId as RoundIdentifier, params),
    [identifierKey(roundId), JSON.stringify(params)],
    enabled
  );
}

// Hook for round progress
export function useRoundProgress(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getRoundProgress(roundId as RoundIdentifier),
    [identifierKey(roundId)],
    enabled
  );
}

// Hook for top miners
export function useTopMiners(roundId?: RoundIdentifier, limit: number = 10) {
  const enabled = isValidRoundIdentifier(roundId);
  return useApiCall(
    () => roundsService.getTopMiners(roundId as RoundIdentifier, limit),
    [identifierKey(roundId), limit],
    enabled
  );
}

// Hook for specific miner performance
export function useMinerPerformance(roundId: RoundIdentifier, minerUid: number) {
  return useApiCall(
    () => roundsService.getMinerPerformance(roundId, minerUid),
    [identifierKey(roundId), minerUid],
    isValidRoundIdentifier(roundId)
  );
}

// Hook for specific validator performance
export function useValidatorPerformance(roundId: RoundIdentifier, validatorId: string) {
  return useApiCall(
    () => roundsService.getValidatorPerformance(roundId, validatorId),
    [identifierKey(roundId), validatorId],
    isValidRoundIdentifier(roundId)
  );
}

// Hook for round summary
export function useRoundSummary(roundId: RoundIdentifier) {
  return useApiCall(
    () => roundsService.getRoundSummary(roundId),
    [identifierKey(roundId)],
    isValidRoundIdentifier(roundId)
  );
}

// Combined hook for round page data
export function useRoundData(roundId: RoundIdentifier) {
  const round = useRound(roundId);
  const statistics = useRoundStatistics(roundId);
  const miners = useRoundMiners(roundId, { limit: 20, sortBy: 'score', sortOrder: 'desc' });
  const validators = useRoundValidators(roundId);
  const activity = useRoundActivity(roundId, { limit: 10 });
  const progress = useRoundProgress(roundId);
  const topMiners = useTopMiners(roundId, 10);

  const loading = round.loading || statistics.loading || miners.loading || 
                  validators.loading || activity.loading || progress.loading || 
                  topMiners.loading;

  const error = round.error || statistics.error || miners.error || 
                validators.error || activity.error || progress.error || 
                topMiners.error;

  const refetch = useCallback(() => {
    round.refetch();
    statistics.refetch();
    miners.refetch();
    validators.refetch();
    activity.refetch();
    progress.refetch();
    topMiners.refetch();
  }, [round, statistics, miners, validators, activity, progress, topMiners]);

  return {
    data: {
      round: round.data,
      statistics: statistics.data,
      miners: miners.data,
      validators: validators.data,
      activity: activity.data,
      progress: progress.data,
      topMiners: topMiners.data,
    },
    loading,
    error,
    refetch,
  };
}

// Hook for rounds list page
export function useRoundsList() {
  const rounds = useRounds({ limit: 20, sortBy: 'id', sortOrder: 'desc' });
  const currentRound = useCurrentRound();

  const loading = rounds.loading || currentRound.loading;
  const error = rounds.error || currentRound.error;

  const refetch = useCallback(() => {
    rounds.refetch();
    currentRound.refetch();
  }, [rounds, currentRound]);

  return {
    data: {
      rounds: rounds.data,
      currentRound: currentRound.data,
    },
    loading,
    error,
    refetch,
  };
}
