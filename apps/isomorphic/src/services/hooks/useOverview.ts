/**
 * React hooks for Overview API service
 * Provides easy-to-use hooks for fetching overview data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { overviewService } from '../api/overview.service';
import type {
  OverviewMetrics,
  ValidatorData,
  RoundData,
  LeaderboardData,
  SubnetStatistics,
  ValidatorsQueryParams,
  LeaderboardQueryParams,
  RoundsQueryParams,
} from '../api/types/overview';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for overview metrics
export function useOverviewMetrics() {
  return useApiCall(() => overviewService.getMetrics());
}

// Hook for validators
export function useValidators(params?: ValidatorsQueryParams) {
  return useApiCall(
    () => overviewService.getValidators(params),
    [JSON.stringify(params)]
  );
}

// Hook for a specific validator
export function useValidator(id: string) {
  return useApiCall(
    () => overviewService.getValidator(id),
    [id]
  );
}

// Hook for current round
export function useCurrentRound() {
  return useApiCall(() => overviewService.getCurrentRound());
}

// Hook for rounds
export function useRounds(params?: RoundsQueryParams) {
  return useApiCall(
    () => overviewService.getRounds(params),
    [JSON.stringify(params)]
  );
}

// Hook for a specific round
export function useRound(id: number) {
  return useApiCall(
    () => overviewService.getRound(id),
    [id]
  );
}

// Hook for leaderboard
export function useLeaderboard(params?: LeaderboardQueryParams) {
  return useApiCall(
    () => overviewService.getLeaderboard(params),
    [JSON.stringify(params)]
  );
}

// Hook for subnet statistics
export function useSubnetStatistics() {
  return useApiCall(() => overviewService.getSubnetStatistics());
}

// Hook for network status
export function useNetworkStatus() {
  return useApiCall(() => overviewService.getNetworkStatus());
}

// Hook for recent activity
export function useRecentActivity(limit: number = 10) {
  return useApiCall(
    () => overviewService.getRecentActivity(limit),
    [limit]
  );
}

// Hook for performance trends
export function usePerformanceTrends(days: number = 7) {
  return useApiCall(
    () => overviewService.getPerformanceTrends(days),
    [days]
  );
}

// Combined hook for overview page data
export function useOverviewData() {
  const metrics = useOverviewMetrics();
  const validators = useValidators({ limit: 10 });
  const currentRound = useCurrentRound();
  const leaderboard = useLeaderboard({ timeRange: '7D' });
  const statistics = useSubnetStatistics();
  const networkStatus = useNetworkStatus();
  const recentActivity = useRecentActivity(5);

  const loading = metrics.loading || validators.loading || currentRound.loading || 
                  leaderboard.loading || statistics.loading || networkStatus.loading || 
                  recentActivity.loading;

  // Only consider critical endpoints as errors - currentRound is not critical for basic overview
  const error = metrics.error || validators.error || 
                leaderboard.error || statistics.error || networkStatus.error;

  const refetch = useCallback(() => {
    metrics.refetch();
    validators.refetch();
    currentRound.refetch();
    leaderboard.refetch();
    statistics.refetch();
    networkStatus.refetch();
    recentActivity.refetch();
  }, [metrics, validators, currentRound, leaderboard, statistics, networkStatus, recentActivity]);

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
    refetch,
  };
}
