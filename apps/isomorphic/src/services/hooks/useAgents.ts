/**
 * React hooks for Agents API integration
 * Provides easy-to-use hooks for fetching and managing agents data
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { agentsRepository } from '@/repositories/agents/agents.repository';
import type {
  AgentData,
  MinimalAgentData,
  AgentPerformanceMetrics,
  AgentRunOverview,
  AgentComparison,
  AgentStatistics,
  AgentActivity,
  AgentRoundMetrics,
  ScoreRoundDataPoint,
  AgentsListQueryParams,
  MinimalAgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
  AgentActivityQueryParams,
  AgentComparisonQueryParams,
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
  const [loading, setLoading] = useState(true);
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
      }
    } catch (err: any) {
      // Only update error if not cancelled
      if (!cancelledRef.current) {
        setError(err.message || 'An error occurred');
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall]);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    
    const key = dependencyKey ?? '__default__';
    // Cancel previous fetch if dependency key changed
    if (lastDependencyKeyRef.current !== key && lastDependencyKeyRef.current !== undefined) {
      cancelledRef.current = true;
    }
    if (lastDependencyKeyRef.current === key && hasFetchedRef.current) {
      return;
    }
    lastDependencyKeyRef.current = key;
    hasFetchedRef.current = true;
    fetchData();
    
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchData, dependencyKey, enabled]);

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
export function useLatestRoundTopMiner() {
  const request = useCallback(
    () => agentsRepository.getLatestRoundTopMiner(),
    []
  );
  return useApiCall(request, 'latest-round-top-miner');
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

// Hook for minimal miners list (optimized for sidebar) - DEPRECATED
// Use useRoundsData instead
export function useMinersList(params?: MinimalAgentsListQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getMinersList(stableParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
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

// Hook for miner performance metrics by UID (optimized endpoint)
export function useMinerPerformance(
  uid: number,
  params?: { timeRange?: '7d' | '30d' | '90d'; granularity?: 'hour' | 'day' }
) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getMinerPerformance(uid, stableParams),
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

// Hook for agent activity
export function useAgentActivity(
  id: string,
  params?: AgentActivityQueryParams
) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getAgentActivity(id, stableParams),
    [id, stableParams]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for agent comparison
export function useAgentComparison(params: AgentComparisonQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.compareAgents(stableParams as AgentComparisonQueryParams),
    [stableParams]
  );
  return useApiCall(request, paramsKey);
}

// Hook for agent statistics
export function useAgentStatistics() {
  const request = useCallback(() => agentsRepository.getAgentStatistics(), []);
  return useApiCall(request, 'agent-statistics');
}

// Hook for all agent activity
export function useAllAgentActivity(params?: AgentActivityQueryParams) {
  const { paramsKey, stableParams } = useStableParams(params);
  const request = useCallback(
    () => agentsRepository.getAllAgentActivity(stableParams),
    [stableParams]
  );
  return useApiCall(request, `all-activity:${paramsKey}`);
}

// Hook for top performing agents
export function useTopAgents(limit: number = 10) {
  const request = useCallback(() => agentsRepository.getTopAgents(limit), [limit]);
  return useApiCall(request, `top-agents:${limit}`);
}

// Hook for most active agents
export function useMostActiveAgents(limit: number = 10) {
  const request = useCallback(() => agentsRepository.getMostActiveAgents(limit), [limit]);
  return useApiCall(request, `most-active:${limit}`);
}

// Hook for agents by type
export function useAgentsByType(
  type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom'
) {
  const request = useCallback(() => agentsRepository.getAgentsByType(type), [type]);
  return useApiCall(request, `agents-type:${type}`);
}

// Hook for agent search
export function useAgentSearch(query: string, limit: number = 20) {
  const request = useCallback(
    () => agentsRepository.searchAgents(query, limit),
    [query, limit]
  );
  return useApiCall(request, `agent-search:${query}:${limit}`);
}

// Hook for agent performance trends
export function useAgentPerformanceTrends(
  id: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
) {
  const request = useCallback(
    () => agentsRepository.getAgentPerformanceTrends(id, timeRange),
    [id, timeRange]
  );
  return useApiCall(request, `agent-trends:${id}:${timeRange}`);
}

// Hook for agent score distribution
export function useAgentScoreDistribution(id: string) {
  const request = useCallback(() => agentsRepository.getAgentScoreDistribution(id), [id]);
  return useApiCall(request, `agent-score-distribution:${id}`);
}

// Hook for agent run history
export function useAgentRunHistory(
  id: string,
  page: number = 1,
  limit: number = 20
) {
  const request = useCallback(
    () => agentsRepository.getAgentRunHistory(id, page, limit),
    [id, page, limit]
  );
  return useApiCall(request, `agent-run-history:${id}:${page}:${limit}`);
}

// Hook for comprehensive agent summary
export function useAgentSummary(id: string) {
  const request = useCallback(() => agentsRepository.getAgentSummary(id), [id]);
  return useApiCall(request, `agent-summary:${id}`);
}

// Hook for real-time agent data updates
export function useAgentRealtime(id: string, interval: number = 30000) {
  const [data, setData] = useState<{
    agent: AgentData | null;
    performance: AgentPerformanceMetrics | null;
    recentRuns: AgentRunOverview[];
    activity: AgentActivity[];
  }>({
    agent: null,
    performance: null,
    recentRuns: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealtimeData = useCallback(async () => {
    try {
      const summary = await agentsRepository.getAgentSummary(id);
      setData({
        agent: summary.agent,
        performance: summary.recentPerformance,
        recentRuns: summary.recentRuns,
        activity: summary.activity,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRealtimeData();
    
    const intervalId = setInterval(fetchRealtimeData, interval);
    return () => clearInterval(intervalId);
  }, [fetchRealtimeData, interval]);

  const refetch = useCallback(() => {
    fetchRealtimeData();
  }, [fetchRealtimeData]);

  return { data, loading, error, refetch };
}

// Hook for agent performance comparison over time
export function useAgentPerformanceComparison(
  agentIds: string[],
  timeRange: '7d' | '30d' | '90d' = '30d'
) {
  const [data, setData] = useState<{
    [agentId: string]: AgentPerformanceMetrics['performanceTrend'];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparisonData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const promises = agentIds.map(async (agentId) => {
        const trends = await agentsRepository.getAgentPerformanceTrends(agentId, timeRange);
        return { agentId, trends };
      });
      
      const results = await Promise.all(promises);
      const comparisonData: { [agentId: string]: AgentPerformanceMetrics['performanceTrend'] } = {};
      
      results.forEach(({ agentId, trends }) => {
        comparisonData[agentId] = trends;
      });
      
      setData(comparisonData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [agentIds, timeRange]);

  useEffect(() => {
    if (agentIds.length > 0) {
      fetchComparisonData();
    }
  }, [fetchComparisonData, agentIds.length]);

  const refetch = useCallback(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  return { data, loading, error, refetch };
}
