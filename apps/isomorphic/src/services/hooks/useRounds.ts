/**
 * React hooks for Rounds API service
 * Provides easy-to-use hooks for fetching rounds data with loading states and error handling
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { roundsRepository } from "@/repositories/rounds/rounds.repository";
import type {
  RoundsListQueryParams,
  RoundMinersQueryParams,
  RoundActivityQueryParams,
} from "@/repositories/rounds/rounds.types";

// SerializableParams accepts any object that can be serialized to JSON
type SerializableParams = Record<string, unknown> | undefined;

function useStableParams<T extends SerializableParams>(params: T) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const paramsRef = useRef<{ key: string; value: T | undefined }>({
    key: "",
    value: undefined,
  });

  if (paramsRef.current.key !== paramsKey) {
    paramsRef.current = {
      key: paramsKey,
      value: params ? ({ ...params } as T) : undefined,
    };
  }

  return { paramsKey, stableParams: paramsRef.current.value };
}

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencyKey?: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const lastDependencyKeyRef = useRef<string | undefined>(undefined);
  const hasFetchedRef = useRef(false);

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
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (lastDependencyKeyRef.current !== undefined) {
        lastDependencyKeyRef.current = undefined;
      }
      hasFetchedRef.current = false;
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const key = dependencyKey ?? "__default__";
    if (lastDependencyKeyRef.current === key && hasFetchedRef.current) {
      return;
    }
    lastDependencyKeyRef.current = key;
    hasFetchedRef.current = true;
    fetchData();
  }, [fetchData, dependencyKey, enabled]);

  return { data, loading, error, refetch: fetchData };
}

type RoundIdentifier = number | string;

const isValidRoundIdentifier = (
  id?: RoundIdentifier
): id is RoundIdentifier => {
  if (typeof id === "number") {
    return Number.isFinite(id) && id > 0;
  }
  if (typeof id === "string") {
    return id.trim().length > 0;
  }
  return false;
};

const identifierKey = (id?: RoundIdentifier): string =>
  id === undefined ? "" : String(id);

// Hook for round IDs only (super fast, no nested data)
export function useRoundIds(params?: {
  limit?: number;
  status?: string;
  sortOrder?: string;
}) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => roundsRepository.getRoundIds(stableParams),
    [stableParams]
  );
  return useApiCall(request, `roundIds:${paramsKey}`);
}

// Hook for rounds list
export function useRounds(params?: RoundsListQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params as SerializableParams);
  const request = useCallback(
    () => roundsRepository.getRounds(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

export function useAvailableRoundSeasons() {
  const request = useCallback(() => roundsRepository.getAvailableSeasons(), []);
  return useApiCall(request, "round-seasons");
}

// Hook for basic round info (fast, without nested data)
export function useRoundBasic(id?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(id);
  const request = useCallback(
    () => roundsRepository.getRoundBasic(id as RoundIdentifier),
    [id]
  );
  return useApiCall(request, `${identifierKey(id)}-basic`, enabled);
}

// Hook for specific round details (SLOW - includes all nested data)
export function useRound(id?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(id);
  const request = useCallback(
    () => roundsRepository.getRound(id as RoundIdentifier),
    [id]
  );
  return useApiCall(request, identifierKey(id), enabled);
}

// Hook for current round
export function useCurrentRound() {
  const request = useCallback(() => roundsRepository.getCurrentRound(), []);
  return useApiCall(request);
}

// Hook for round statistics
export function useRoundStatistics(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  const request = useCallback(
    () => roundsRepository.getRoundStatistics(roundId as RoundIdentifier),
    [roundId]
  );
  return useApiCall(request, identifierKey(roundId), enabled);
}

// Hook for round miners
export function useRoundMiners(
  roundId?: RoundIdentifier,
  params?: RoundMinersQueryParams
) {
  const enabled = isValidRoundIdentifier(roundId);
  const { paramsKey, stableParams } = useStableParams(params as SerializableParams);
  const request = useCallback(
    () =>
      roundsRepository.getRoundMiners(roundId as RoundIdentifier, stableParams),
    [roundId, stableParams]
  );
  return useApiCall(request, `${identifierKey(roundId)}:${paramsKey}`, enabled);
}

// Hook for round validators
export function useRoundValidators(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  const request = useCallback(
    () => roundsRepository.getRoundValidators(roundId as RoundIdentifier),
    [roundId]
  );
  return useApiCall(request, identifierKey(roundId), enabled);
}

// Hook for round activity
export function useRoundActivity(
  roundId?: RoundIdentifier,
  params?: RoundActivityQueryParams
) {
  const enabled = isValidRoundIdentifier(roundId);
  const { paramsKey, stableParams } = useStableParams(params as SerializableParams);
  const request = useCallback(
    () =>
      roundsRepository.getRoundActivity(roundId as RoundIdentifier, stableParams),
    [roundId, stableParams]
  );
  return useApiCall(request, `${identifierKey(roundId)}:${paramsKey}`, enabled);
}

// Hook for round progress
export function useRoundProgress(roundId?: RoundIdentifier) {
  const enabled = isValidRoundIdentifier(roundId);
  const request = useCallback(
    () => roundsRepository.getRoundProgress(roundId as RoundIdentifier),
    [roundId]
  );
  return useApiCall(request, identifierKey(roundId), enabled);
}

export function useRoundStatusView(season?: number, roundInSeason?: number) {
  const enabled =
    typeof season === "number" &&
    Number.isFinite(season) &&
    season > 0 &&
    typeof roundInSeason === "number" &&
    Number.isFinite(roundInSeason) &&
    roundInSeason > 0;
  const request = useCallback(
    () => roundsRepository.getRoundStatusView(season as number, roundInSeason as number),
    [season, roundInSeason]
  );
  return useApiCall(request, `round-status-${season}-${roundInSeason}`, enabled);
}

export function useRoundSeasonSummaryView(season?: number, roundInSeason?: number) {
  const enabled =
    typeof season === "number" &&
    Number.isFinite(season) &&
    season > 0 &&
    typeof roundInSeason === "number" &&
    Number.isFinite(roundInSeason) &&
    roundInSeason > 0;
  const request = useCallback(
    () => roundsRepository.getRoundSeasonSummaryView(season as number, roundInSeason as number),
    [season, roundInSeason]
  );
  return useApiCall(request, `round-season-summary-${season}-${roundInSeason}`, enabled);
}

export function useRoundValidatorsView(season?: number, roundInSeason?: number) {
  const enabled =
    typeof season === "number" &&
    Number.isFinite(season) &&
    season > 0 &&
    typeof roundInSeason === "number" &&
    Number.isFinite(roundInSeason) &&
    roundInSeason > 0;
  const request = useCallback(
    () => roundsRepository.getRoundValidatorsView(season as number, roundInSeason as number),
    [season, roundInSeason]
  );
  return useApiCall(request, `round-validators-view-${season}-${roundInSeason}`, enabled);
}

// Hook for top miners
export function useTopMiners(roundId?: RoundIdentifier, limit: number = 10) {
  const enabled = isValidRoundIdentifier(roundId);
  const request = useCallback(
    () => roundsRepository.getTopMiners(roundId as RoundIdentifier, limit),
    [limit, roundId]
  );
  return useApiCall(request, `${identifierKey(roundId)}:${limit}`, enabled);
}

// Hook for specific miner performance
export function useMinerPerformance(
  roundId: RoundIdentifier,
  minerUid: number
) {
  const request = useCallback(
    () => roundsRepository.getMinerPerformance(roundId, minerUid),
    [minerUid, roundId]
  );
  return useApiCall(
    request,
    `${identifierKey(roundId)}:${minerUid}`,
    isValidRoundIdentifier(roundId)
  );
}

// Hook for specific validator performance
export function useValidatorPerformance(
  roundId: RoundIdentifier,
  validatorId: string
) {
  const request = useCallback(
    () => roundsRepository.getValidatorPerformance(roundId, validatorId),
    [roundId, validatorId]
  );
  return useApiCall(
    request,
    `${identifierKey(roundId)}:${validatorId}`,
    isValidRoundIdentifier(roundId)
  );
}

// Hook for round summary
export function useRoundSummary(roundId: RoundIdentifier) {
  const request = useCallback(
    () => roundsRepository.getRoundSummary(roundId),
    [roundId]
  );
  return useApiCall(
    request,
    identifierKey(roundId),
    isValidRoundIdentifier(roundId)
  );
}

// Combined hook for round page data
export function useRoundData(roundId: RoundIdentifier) {
  const round = useRound(roundId);
  const statistics = useRoundStatistics(roundId);
  const miners = useRoundMiners(roundId, {
    limit: 20,
    sortBy: "score",
    sortOrder: "desc",
  });
  const validators = useRoundValidators(roundId);
  const activity = useRoundActivity(roundId, { limit: 10 });
  const progress = useRoundProgress(roundId);
  const topMiners = useTopMiners(roundId, 10);

  const loading =
    round.loading ||
    statistics.loading ||
    miners.loading ||
    validators.loading ||
    activity.loading ||
    progress.loading ||
    topMiners.loading;

  const error =
    round.error ||
    statistics.error ||
    miners.error ||
    validators.error ||
    activity.error ||
    progress.error ||
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
  const rounds = useRounds({ limit: 20, sortBy: "id", sortOrder: "desc" });
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

// Hook for getting round with validators data (local and post-consensus)
export function useRoundWithValidators(
  season: number | undefined,
  roundInSeason: number | undefined
) {
  const enabled = season !== undefined && roundInSeason !== undefined;
  const request = useCallback(
    () => {
      if (!enabled || season === undefined || roundInSeason === undefined) {
        return Promise.resolve(null);
      }
      return roundsRepository.getRoundValidators(`${season}/${roundInSeason}`);
    },
    [season, roundInSeason, enabled]
  );
  return useApiCall(
    request,
    `round-with-validators:${season ?? 'none'}/${roundInSeason ?? 'none'}`,
    enabled
  );
}
