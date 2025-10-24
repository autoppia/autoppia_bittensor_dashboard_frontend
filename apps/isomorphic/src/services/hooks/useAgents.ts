/**
 * React hooks for Agents API integration
 * Provides easy-to-use hooks for fetching and managing agents data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { agentsService } from '../api/agents.service';
import type {
  AgentData,
  MinimalAgentData,
  AgentPerformanceMetrics,
  AgentRunOverview,
  AgentComparison,
  AgentStatistics,
  AgentActivity,
  AgentsListQueryParams,
  MinimalAgentsListQueryParams,
  AgentRunsQueryParams,
  AgentPerformanceQueryParams,
  AgentActivityQueryParams,
  AgentComparisonQueryParams,
} from '../api/types/agents';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencyKey?: string
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
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dependencyKey]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook for minimal miners list (optimized for sidebar)
export function useMinersList(params?: MinimalAgentsListQueryParams) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getMinersList(params),
    [params]
  );
  return useApiCall(request, paramsKey);
}

// Hook for specific miner details by UID (optimized endpoint)
export function useMinerDetails(uid: number, params?: { round?: number }) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getMinerDetails(uid, params),
    [uid, params]
  );
  return useApiCall(request, `${uid}:${paramsKey}`);
}

// Hook for miner performance metrics by UID (optimized endpoint)
export function useMinerPerformance(
  uid: number,
  params?: { timeRange?: '7d' | '30d' | '90d'; granularity?: 'hour' | 'day' }
) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getMinerPerformance(uid, params),
    [uid, params]
  );
  return useApiCall(request, `${uid}:${paramsKey}`);
}

// Hook for agents list with filtering and pagination (legacy)
export function useAgents(params?: AgentsListQueryParams) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getAgents(params),
    [params]
  );
  return useApiCall(request, paramsKey);
}

// Hook for specific agent details
export function useAgent(id?: string | null, params?: { round?: number }) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(() => {
    if (!id) {
      return Promise.resolve({ agent: null, scoreRoundData: [] });
    }
    return agentsService.getAgent(id, params);
  }, [id, params]);
  return useApiCall(request, id ? `${id}:${paramsKey}` : 'agent:none');
}

// Hook for agent performance metrics
export function useAgentPerformance(
  id: string,
  params?: AgentPerformanceQueryParams
) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getAgentPerformance(id, params),
    [id, params]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for agent runs
export function useAgentRuns(
  id: string,
  params?: AgentRunsQueryParams
) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getAgentRuns(id, params),
    [id, params]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for specific agent run
export function useAgentRun(agentId: string, runId: string) {
  const request = useCallback(
    () => agentsService.getAgentRun(agentId, runId),
    [agentId, runId]
  );
  return useApiCall(request, `${agentId}:${runId}`);
}

// Hook for agent activity
export function useAgentActivity(
  id: string,
  params?: AgentActivityQueryParams
) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getAgentActivity(id, params),
    [id, params]
  );
  return useApiCall(request, `${id}:${paramsKey}`);
}

// Hook for agent comparison
export function useAgentComparison(params: AgentComparisonQueryParams) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.compareAgents(params),
    [params]
  );
  return useApiCall(request, paramsKey);
}

// Hook for agent statistics
export function useAgentStatistics() {
  const request = useCallback(() => agentsService.getAgentStatistics(), []);
  return useApiCall(request, 'agent-statistics');
}

// Hook for all agent activity
export function useAllAgentActivity(params?: AgentActivityQueryParams) {
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);
  const request = useCallback(
    () => agentsService.getAllAgentActivity(params),
    [params]
  );
  return useApiCall(request, `all-activity:${paramsKey}`);
}

// Hook for top performing agents
export function useTopAgents(limit: number = 10) {
  const request = useCallback(() => agentsService.getTopAgents(limit), [limit]);
  return useApiCall(request, `top-agents:${limit}`);
}

// Hook for most active agents
export function useMostActiveAgents(limit: number = 10) {
  const request = useCallback(() => agentsService.getMostActiveAgents(limit), [limit]);
  return useApiCall(request, `most-active:${limit}`);
}

// Hook for agents by type
export function useAgentsByType(
  type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom'
) {
  const request = useCallback(() => agentsService.getAgentsByType(type), [type]);
  return useApiCall(request, `agents-type:${type}`);
}

// Hook for agent search
export function useAgentSearch(query: string, limit: number = 20) {
  const request = useCallback(
    () => agentsService.searchAgents(query, limit),
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
    () => agentsService.getAgentPerformanceTrends(id, timeRange),
    [id, timeRange]
  );
  return useApiCall(request, `agent-trends:${id}:${timeRange}`);
}

// Hook for agent score distribution
export function useAgentScoreDistribution(id: string) {
  const request = useCallback(() => agentsService.getAgentScoreDistribution(id), [id]);
  return useApiCall(request, `agent-score-distribution:${id}`);
}

// Hook for agent run history
export function useAgentRunHistory(
  id: string,
  page: number = 1,
  limit: number = 20
) {
  const request = useCallback(
    () => agentsService.getAgentRunHistory(id, page, limit),
    [id, page, limit]
  );
  return useApiCall(request, `agent-run-history:${id}:${page}:${limit}`);
}

// Hook for comprehensive agent summary
export function useAgentSummary(id: string) {
  const request = useCallback(() => agentsService.getAgentSummary(id), [id]);
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
      const summary = await agentsService.getAgentSummary(id);
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
        const trends = await agentsService.getAgentPerformanceTrends(agentId, timeRange);
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
