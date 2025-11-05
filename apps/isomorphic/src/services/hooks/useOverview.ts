/**
 * React hooks for Overview API service
 * Provides easy-to-use hooks for fetching overview data with loading states and error handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { overviewService } from "../api/overview.service";
import type {
  OverviewMetrics,
  ValidatorData,
  RoundData,
  LeaderboardData,
  SubnetStatistics,
  ValidatorsQueryParams,
  LeaderboardQueryParams,
  RoundsQueryParams,
} from "../api/types/overview";

type SerializableParams = Record<string, any> | undefined;

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
type UseApiCallOptions = {
  pollIntervalMs?: number;
};

function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencyKey?: string,
  options?: UseApiCallOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalMs = options?.pollIntervalMs;
  const initialFetchRef = useRef(true);
  const serializedDataRef = useRef<string | null>(null);
  const lastDependencyKeyRef = useRef<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      if (initialFetchRef.current) {
        setLoading(true);
      }
      setError(null);
      const result = await apiCall();
      const serialized = JSON.stringify(result);
      if (serializedDataRef.current !== serialized) {
        serializedDataRef.current = serialized;
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      if (initialFetchRef.current) {
        initialFetchRef.current = false;
        setLoading(false);
      }
    }
  }, [apiCall]);

  useEffect(() => {
    const key = dependencyKey ?? "__default__";
    if (lastDependencyKeyRef.current === key && !initialFetchRef.current) {
      return;
    }
    lastDependencyKeyRef.current = key;
    fetchData();
  }, [fetchData, dependencyKey]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const intervalId = window.setInterval(() => {
      fetchData();
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [fetchData, pollIntervalMs]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for overview metrics
export function useOverviewMetrics(options?: UseApiCallOptions) {
  const { stableParams: stableOptions } = useStableParams(options);
  const request = useCallback(() => overviewService.getMetrics(), []);
  return useApiCall(request, "metrics", stableOptions);
}

// Hook for validators
export function useValidators(params?: ValidatorsQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => overviewService.getValidators(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

// Hook for a specific validator
export function useValidator(id: string) {
  const request = useCallback(() => overviewService.getValidator(id), [id]);
  return useApiCall(request, id);
}

// Hook for validator filter options
export function useValidatorFilterOptions() {
  const request = useCallback(() => overviewService.getValidatorFilters(), []);
  const { data, loading, error, refetch } = useApiCall(request);

  return {
    validators: data?.validators ?? [],
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for current round
export function useCurrentRound() {
  const request = useCallback(() => overviewService.getCurrentRound(), []);
  return useApiCall(request, "current-round");
}

// Hook for rounds
export function useRounds(params?: RoundsQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => overviewService.getRounds(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

// Hook for a specific round
export function useRound(id: number) {
  const request = useCallback(() => overviewService.getRound(id), [id]);
  return useApiCall(request, String(id));
}

// Hook for leaderboard
export function useLeaderboard(params?: LeaderboardQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => overviewService.getLeaderboard(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

// Hook for subnet statistics
export function useSubnetStatistics() {
  const request = useCallback(() => overviewService.getSubnetStatistics(), []);
  return useApiCall(request, "subnet-stats");
}

// Hook for network status
export function useNetworkStatus() {
  const request = useCallback(() => overviewService.getNetworkStatus(), []);
  return useApiCall(request, "network-status");
}

// Hook for recent activity
export function useRecentActivity(limit: number = 10) {
  const request = useCallback(
    () => overviewService.getRecentActivity(limit),
    [limit]
  );
  return useApiCall(request, `recent-activity:${limit}`);
}

// Hook for performance trends
export function usePerformanceTrends(days: number = 7) {
  const request = useCallback(
    () => overviewService.getPerformanceTrends(days),
    [days]
  );
  return useApiCall(request, `performance-trends:${days}`);
}

// Combined hook for overview page data
export function useOverviewData() {
  const metrics = useOverviewMetrics();
  const validators = useValidators({ limit: 10 });
  const currentRound = useCurrentRound();
  const leaderboard = useLeaderboard({ timeRange: "7R" });
  const statistics = useSubnetStatistics();
  const networkStatus = useNetworkStatus();
  const recentActivity = useRecentActivity(5);

  const loading =
    metrics.loading ||
    validators.loading ||
    currentRound.loading ||
    leaderboard.loading ||
    statistics.loading ||
    networkStatus.loading ||
    recentActivity.loading;

  // Only mark core overview endpoints as critical failures
  const error = metrics.error || validators.error || leaderboard.error;
  const optionalErrors = [
    currentRound.error,
    statistics.error,
    networkStatus.error,
    recentActivity.error,
  ].filter(
    (message): message is string =>
      typeof message === "string" && message.length > 0
  );

  const optionalErrorsSignature = optionalErrors.join(" | ");

  useEffect(() => {
    if (!optionalErrorsSignature) {
      return;
    }
    console.warn(
      `[Overview] Non-critical data fetch failed: ${optionalErrorsSignature}`
    );
  }, [optionalErrorsSignature]);

  const refetch = useCallback(() => {
    metrics.refetch();
    validators.refetch();
    currentRound.refetch();
    leaderboard.refetch();
    statistics.refetch();
    networkStatus.refetch();
    recentActivity.refetch();
  }, [
    metrics,
    validators,
    currentRound,
    leaderboard,
    statistics,
    networkStatus,
    recentActivity,
  ]);

  return {
    data: {
      metrics: metrics.data,
      validators: validators.data,
      currentRound: currentRound.data,
      leaderboard: leaderboard.data,
      statistics: statistics.data,
      networkStatus: networkStatus.data,
      recentActivity: recentActivity.data,
    },
    loading,
    error,
    warnings: optionalErrors,
    refetch,
  };
}
