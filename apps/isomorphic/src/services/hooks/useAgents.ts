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
  ScoreRoundDataPoint,
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
    console.log('[useApiCall] Starting fetch for:', dependencyKey);
    try {
      setLoading(true);
      setError(null);
      console.log('[useApiCall] Calling API...');
      const result = await apiCall();
      console.log('[useApiCall] API call successful, result:', result);
      // Only update state if not cancelled
      if (!cancelledRef.current) {
        setData(result);
        setLoading(false);
        console.log('[useApiCall] State updated with data');
      } else {
        console.warn('[useApiCall] ⚠️ Fetch was cancelled, not updating state');
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
        console.error('[useApiCall] Error message:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        console.log('[useApiCall] State updated with error');
      } else {
        console.warn('[useApiCall] ⚠️ Fetch was cancelled during error, not updating state');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall]);

  useEffect(() => {
    console.log('[useApiCall] Effect triggered for:', dependencyKey, 'enabled:', enabled, 'hasFetched:', hasFetchedRef.current);
    // Don't fetch if disabled
    if (!enabled) {
      console.log('[useApiCall] Fetch disabled, resetting state');
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
      console.log('[useApiCall] Already fetched for key:', key, ', skipping');
      return;
    }
    
    // Cancel previous fetch if dependency key changed
    if (lastDependencyKeyRef.current !== key && lastDependencyKeyRef.current !== undefined) {
      console.log('[useApiCall] Dependency key changed from', lastDependencyKeyRef.current, 'to', key);
      cancelledRef.current = true;
      hasFetchedRef.current = false; // Reset when key changes
    }
    
    console.log('[useApiCall] Starting new fetch for key:', key);
    lastDependencyKeyRef.current = key;
    hasFetchedRef.current = true;
    
    // Don't cancel this new fetch
    cancelledRef.current = false;
    
    fetchData();
    
    return () => {
      console.log('[useApiCall] Cleanup for key:', key);
      // Don't cancel on cleanup - let the fetch complete
      // cancelledRef.current = true;
    };
  }, [dependencyKey, enabled, fetchData]);

  const refetch = useCallback(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return { data, loading, error, refetch };
}

// Hook for rounds data with miners (new unified endpoint)
export function useRoundsData(roundNumber?: number) {
  const request = useCallback(
    () => agentsRepository.getRoundsData(roundNumber),
    [roundNumber]
  );
  return useApiCall(request, `rounds-data:${roundNumber ?? 'all'}`);
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
export function useMinerRoundDetails(round: number | undefined, miner_uid: number | undefined) {
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

export function useMinerHistorical(miner_uid: number | undefined) {
  const request = useCallback(
    () => {
      if (!miner_uid) {
        return Promise.resolve(null);
      }
      return agentsRepository.getMinerHistorical(miner_uid);
    },
    [miner_uid]
  );
  return useApiCall(request, `miner-historical:${miner_uid ?? 'none'}`);
}

// Hook for specific miner details by UID (optimized endpoint)
export function useMinerDetails(uid: number, params?: { round?: number }) {
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
  scoreRoundData: ScoreRoundDataPoint[];
  availableRounds?: number[];
  roundMetrics?: AgentRoundMetrics | null;
};

export function useAgent(id?: string | null, params?: { round?: number }) {
  const { paramsKey, stableParams } = useStableParams(params);
  // If id is null/undefined, don't make any API calls
  const shouldFetch = !!id;
  
  const request = useCallback<() => Promise<AgentDetailPayload>>(() => {
    if (!id) {
      return Promise.resolve({ agent: null, scoreRoundData: [] });
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

