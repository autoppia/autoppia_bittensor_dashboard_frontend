/**
 * React hooks for Agents API integration
 * Provides easy-to-use hooks for fetching and managing agents data
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { agentsRepository } from '@/repositories/agents/agents.repository';
import type {
  AgentData,
  AgentPerformanceMetrics,
  AgentRunOverview,
  AgentRoundMetrics,
  RewardRoundDataPoint,
  AgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
} from '@/repositories/agents/agents.types';

type SerializableParams = Record<string, any> | undefined;

function useStableParams<T extends SerializableParams>(params: T) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const paramsRef = useRef<{ key: string; value: T | undefined }>({
    key: '',
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
  const [loading, setLoading] = useState(enabled); // Start with enabled state
  const [error, setError] = useState<string | null>(null);
  const lastDependencyKeyRef = useRef<string | undefined>(undefined);
  const hasFetchedRef = useRef(false);
  const cancelledRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Reset cancelled flag for new fetch
    cancelledRef.current = false;
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      // Only update state if not cancelled
      if (!cancelledRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[useApiCall] API call failed:', err);
      // Only update error if not cancelled
      if (!cancelledRef.current) {
        // Handle different error types
        let errorMessage = 'An error occurred';
        if (err?.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.cause?.message) {
          errorMessage = err.cause.message;
        } else if (err?.toString) {
          errorMessage = err.toString();
        }
        setError(errorMessage);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall]);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      // Reset fetch flag when disabled so it can fetch again when enabled
      hasFetchedRef.current = false;
      return;
    }

    const key = dependencyKey ?? '__default__';

    // Only skip if we've already fetched with the same key
    if (lastDependencyKeyRef.current === key && hasFetchedRef.current) {
      return;
    }

    // Cancel previous fetch if dependency key changed
    if (lastDependencyKeyRef.current !== key && lastDependencyKeyRef.current !== undefined) {
      cancelledRef.current = true;
      hasFetchedRef.current = false; // Reset when key changes
    }

    lastDependencyKeyRef.current = key;
    hasFetchedRef.current = true;

    // Don't cancel this new fetch
    cancelledRef.current = false;

    fetchData();
  }, [dependencyKey, enabled, fetchData]);

  const refetch = useCallback(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return { data, loading, error, refetch };
}

// Legacy rounds hook retained for screens outside the season-first agents UI.
export function useRoundsData(options?: {
  roundIdentifier?: string | number;
  season?: number;
}) {
  const request = useCallback(
    () => agentsRepository.getRoundsData(options),
    [options]
  );
  return useApiCall(request, `rounds-data:${JSON.stringify(options ?? null)}`);
}

export function useSeasonRank(seasonRef?: number | "latest") {
  const request = useCallback(
    () => agentsRepository.getSeasonRank(seasonRef),
    [seasonRef]
  );
  return useApiCall(request, `season-rank:${String(seasonRef ?? "latest")}`);
}

// Hook for latest round and top miner (for initial redirect)
export function useLatestRoundTopMiner(enabled: boolean = true) {
  const request = useCallback(
    () => agentsRepository.getLatestRoundTopMiner(),
    []
  );
  return useApiCall(request, 'latest-round-top-miner', enabled);
}

// Hook for miner round details
export function useMinerRoundDetails(round: string | number | undefined, miner_uid: number | undefined) {
  const request = useCallback(
    () => {
      if (!round || !miner_uid) {
        return Promise.resolve(null);
      }
      return agentsRepository.getMinerRoundDetails(round, miner_uid);
    },
    [round, miner_uid]
  );
  return useApiCall(request, `miner-round-details:${round ?? 'none'}:${miner_uid ?? 'none'}`);
}

export function useMinerHistorical(miner_uid: number | undefined, season?: number) {
  const request = useCallback(
    () => {
      if (!miner_uid) {
        return Promise.resolve(null);
      }
      return agentsRepository.getMinerHistorical(miner_uid, season);
    },
    [miner_uid, season]
  );
  return useApiCall(request, `miner-historical:${miner_uid ?? 'none'}:${season ?? 'all'}`);
}

// Hook for specific miner details by UID (optimized endpoint)
export function useMinerDetails(uid: number, params?: { round?: number; season?: number }) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getMinerDetails(uid, stableParams),
    [uid, stableParams]
  );
  return useApiCall(request, `${uid}:${paramsKey}`);
}

// Hook for agents list with filtering and pagination (legacy)
export function useAgents(params?: AgentsListQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getAgents(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

// Hook for specific agent details
type AgentDetailPayload = {
  agent: AgentData | null;
  rewardRoundData: RewardRoundDataPoint[];
  roundMetrics?: AgentRoundMetrics | null;
  performanceByWebsite?: Array<{
    website: string;
    tasks_received: number;
    tasks_success: number;
    success_rate: number;
  }>;
  avg_cost_per_task?: number | null;
  is_reused?: boolean;
  reused_from_agent_run_id?: string | null;
  reused_from_round?: string | null;
  zero_reason?: string | null;
  season_leadership?: any;
};

export function useAgent(id?: string | null, params?: { round?: number; season?: number }) {
  const { paramsKey, stableParams } = useStableParams(params);
  // If id is null/undefined, don't make any API calls
  const shouldFetch = !!id;

  const request = useCallback<() => Promise<AgentDetailPayload>>(() => {
    if (!id) {
      return Promise.resolve({ agent: null, rewardRoundData: [] });
    }
    return agentsRepository.getAgent(id, stableParams);
  }, [id, stableParams]);

  // Use a different dependency key when id is null to ensure the hook re-runs
  // but the key should be stable when id is null to avoid unnecessary re-fetches
  const dependencyKey = shouldFetch ? `${id}:${paramsKey}` : `agent:disabled:${paramsKey}`;

  // Pass enabled=false when id is null to prevent any API calls
  return useApiCall(request, dependencyKey, shouldFetch);
}

// Hook for agent performance metrics
export function useAgentPerformance(
  id: string,
  params?: AgentPerformanceQueryParams
) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getAgentPerformance(id, stableParams),
    [id, stableParams]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for agent runs
export function useAgentRuns(
  id: string,
  params?: AgentRunsQueryParams
) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getAgentRuns(id, stableParams),
    [id, stableParams]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for specific agent run
export function useAgentRun(agentId: string, runId: string) {
  const request = useCallback(
    () => agentsRepository.getAgentRun(agentId, runId),
    [agentId, runId]
  );
  return useApiCall(request, `${agentId}:${runId}`);
}
