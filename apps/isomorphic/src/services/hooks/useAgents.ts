/**
 * React hooks for Agents API integration
 * Provides easy-to-use hooks for fetching and managing agents data
 */

import { useState, useEffect, useCallback } from 'react';
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

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook for minimal miners list (optimized for sidebar)
export function useMinersList(params?: MinimalAgentsListQueryParams) {
  return useApiCall(
    () => agentsService.getMinersList(params),
    [JSON.stringify(params)]
  );
}

// Hook for specific miner details by UID (optimized endpoint)
export function useMinerDetails(uid: number, params?: { round?: number }) {
  return useApiCall(
    () => agentsService.getMinerDetails(uid, params),
    [uid, JSON.stringify(params)]
  );
}

// Hook for miner performance metrics by UID (optimized endpoint)
export function useMinerPerformance(
  uid: number,
  params?: { timeRange?: '7d' | '30d' | '90d'; granularity?: 'hour' | 'day' }
) {
  return useApiCall(
    () => agentsService.getMinerPerformance(uid, params),
    [uid, JSON.stringify(params)]
  );
}

// Hook for agents list with filtering and pagination (legacy)
export function useAgents(params?: AgentsListQueryParams) {
  return useApiCall(
    () => agentsService.getAgents(params),
    [JSON.stringify(params)]
  );
}

// Hook for specific agent details
export function useAgent(id?: string | null, params?: { round?: number }) {
  return useApiCall<{ agent: AgentData | null; scoreRoundData: ScoreRoundDataPoint[] }>(
    () => {
      if (!id) {
        return Promise.resolve({ agent: null, scoreRoundData: [] });
      }
      return agentsService.getAgent(id, params);
    },
    [id, JSON.stringify(params)]
  );
}

// Hook for agent performance metrics
export function useAgentPerformance(
  id: string,
  params?: AgentPerformanceQueryParams
) {
  return useApiCall(
    () => agentsService.getAgentPerformance(id, params),
    [id, JSON.stringify(params)]
  );
}

// Hook for agent runs
export function useAgentRuns(
  id: string,
  params?: AgentRunsQueryParams
) {
  return useApiCall(
    () => agentsService.getAgentRuns(id, params),
    [id, JSON.stringify(params)]
  );
}

// Hook for specific agent run
export function useAgentRun(agentId: string, runId: string) {
  return useApiCall(
    () => agentsService.getAgentRun(agentId, runId),
    [agentId, runId]
  );
}

// Hook for agent activity
export function useAgentActivity(
  id: string,
  params?: AgentActivityQueryParams
) {
  return useApiCall(
    () => agentsService.getAgentActivity(id, params),
    [id, JSON.stringify(params)]
  );
}

// Hook for agent comparison
export function useAgentComparison(params: AgentComparisonQueryParams) {
  return useApiCall(
    () => agentsService.compareAgents(params),
    [JSON.stringify(params)]
  );
}

// Hook for agent statistics
export function useAgentStatistics() {
  return useApiCall(() => agentsService.getAgentStatistics());
}

// Hook for all agent activity
export function useAllAgentActivity(params?: AgentActivityQueryParams) {
  return useApiCall(
    () => agentsService.getAllAgentActivity(params),
    [JSON.stringify(params)]
  );
}

// Hook for top performing agents
export function useTopAgents(limit: number = 10) {
  return useApiCall(
    () => agentsService.getTopAgents(limit),
    [limit]
  );
}

// Hook for most active agents
export function useMostActiveAgents(limit: number = 10) {
  return useApiCall(
    () => agentsService.getMostActiveAgents(limit),
    [limit]
  );
}

// Hook for agents by type
export function useAgentsByType(
  type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom'
) {
  return useApiCall(
    () => agentsService.getAgentsByType(type),
    [type]
  );
}

// Hook for agent search
export function useAgentSearch(query: string, limit: number = 20) {
  return useApiCall(
    () => agentsService.searchAgents(query, limit),
    [query, limit]
  );
}

// Hook for agent performance trends
export function useAgentPerformanceTrends(
  id: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
) {
  return useApiCall(
    () => agentsService.getAgentPerformanceTrends(id, timeRange),
    [id, timeRange]
  );
}

// Hook for agent score distribution
export function useAgentScoreDistribution(id: string) {
  return useApiCall(
    () => agentsService.getAgentScoreDistribution(id),
    [id]
  );
}

// Hook for agent run history
export function useAgentRunHistory(
  id: string,
  page: number = 1,
  limit: number = 20
) {
  return useApiCall(
    () => agentsService.getAgentRunHistory(id, page, limit),
    [id, page, limit]
  );
}

// Hook for comprehensive agent summary
export function useAgentSummary(id: string) {
  return useApiCall(
    () => agentsService.getAgentSummary(id),
    [id]
  );
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
  }, [fetchComparisonData]);

  const refetch = useCallback(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  return { data, loading, error, refetch };
}
