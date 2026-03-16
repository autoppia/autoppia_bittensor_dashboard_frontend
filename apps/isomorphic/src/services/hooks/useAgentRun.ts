/**
 * Custom hooks for Agent Run data management with partial loading
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { agentRunsRepository } from '@/repositories/agent-runs/agent-runs.repository';
import type {

  AgentRunStats,
  AgentRunSummary,
  AgentRunPersonas,
  AgentRunTaskData,
  AgentRunEvaluationData, // Added
  AgentRunPartialData,
  AgentRunListItem,
  AgentRunsListQueryParams,
  AgentRunsListResponse,
  AgentRunTasksQueryParams,
} from '@/repositories/agent-runs/agent-runs.types';

// Hook for listing agent runs with filters
export function useAgentRunsList(params?: AgentRunsListQueryParams) {
  const [runs, setRuns] = useState<AgentRunListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page ?? 1);
  const [limit, setLimit] = useState(params?.limit ?? 20);
  const [facets, setFacets] = useState<AgentRunsListResponse['data']['facets'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedParams = useMemo(
    () => JSON.stringify(params ?? {}),
    [params]
  );

  const stableParams = useMemo(
    () => JSON.parse(serializedParams) as AgentRunsListQueryParams,
    [serializedParams]
  );

  const fetchRuns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await agentRunsRepository.listAgentRuns(stableParams);
      setRuns(response.runs);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
      setFacets(response.facets ?? null);
    } catch (err) {
      setRuns([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch agent runs');
    } finally {
      setIsLoading(false);
    }
  }, [stableParams]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const refetch = useCallback(() => {
    fetchRuns();
  }, [fetchRuns]);

  return {
    runs,
    total,
    page,
    limit,
    facets,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting agent run data with complete endpoint
export function useAgentRunComplete(runId: string) {
  const [data, setData] = useState<{
    statistics: AgentRunStats | null;
    evaluations: AgentRunEvaluationData[]; // Changed from tasks to evaluations
    info: {
      agentRunId: string;
      round: any;
      validator: any;
      miner: any;
      zeroReason?: string | null;
      isReused?: boolean;
      reusedFromAgentRunId?: string | null;
      reusedFrom?: {
        agentRunId?: string | null;
        validatorRoundId?: string | null;
        roundNumber?: number | null;
        seasonNumber?: number | null;
      } | null;
    } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplete = useCallback(async () => {
    if (!runId) return;

    try {
      setIsLoading(true);
      setError(null);
      const completeData = await agentRunsRepository.getAgentRunComplete(runId);
      setData(completeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent run data');
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchComplete();
  }, [fetchComplete]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchComplete,
    // Convenience getters
    statistics: data?.statistics ?? null,
    evaluations: data?.evaluations ?? [], // Changed from tasks to evaluations
    info: data?.info ?? null,
  };
}

// Hook for getting agent run data with progressive loading (legacy)
export function useAgentRun(
  runId: string,
  options: {
    includePersonas?: boolean;
    includeStats?: boolean;
    includeSummary?: boolean;
    includeTasks?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const {
    includePersonas = true,
    includeStats = true,
    includeSummary = true,
    includeTasks = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [data, setData] = useState<AgentRunPartialData>({
    loading: {
      personas: includePersonas,
      stats: includeStats,
      summary: includeSummary,
      tasks: includeTasks,
    },
    errors: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!runId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await agentRunsRepository.getAgentRunPartialData(runId, {
        includePersonas,
        includeStats,
        includeSummary,
        includeTasks,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent run data');
    } finally {
      setIsLoading(false);
    }
  }, [runId, includePersonas, includeStats, includeSummary, includeTasks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !runId) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, runId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const isAnyLoading = Object.values(data.loading).some(Boolean);
  const hasAnyError = Object.keys(data.errors).length > 0;

  return {
    data,
    isLoading: isLoading || isAnyLoading,
    error: error || (hasAnyError ? 'Some data failed to load' : null),
    refetch,
    isAnyLoading,
    hasAnyError,
  };
}

// Hook for getting agent run personas only
export function useAgentRunPersonas(runId: string) {
  const [personas, setPersonas] = useState<AgentRunPersonas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await agentRunsRepository.getAgentRunPersonas(runId);
        setPersonas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch personas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, [runId]);

  return { personas, isLoading, error };
}

// Hook for getting agent run stats only
export function useAgentRunStats(runId: string) {
  const [stats, setStats] = useState<AgentRunStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await agentRunsRepository.getAgentRunStats(runId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [runId]);

  return { stats, isLoading, error };
}

// Hook for getting agent run summary only
export function useAgentRunSummary(runId: string) {
  const [summary, setSummary] = useState<AgentRunSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await agentRunsRepository.getAgentRunSummary(runId);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [runId]);

  return { summary, isLoading, error };
}

// Hook for getting agent run tasks with pagination
export function useAgentRunTasks(
  runId: string,
  params?: {
    page?: number;
    limit?: number;
    website?: string;
    useCase?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const [tasks, setTasks] = useState<AgentRunTaskData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [limit, setLimit] = useState(params?.limit || 20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedParams = useMemo(
    () => JSON.stringify(params ?? {}),
    [params]
  );

const stableParams = useMemo<AgentRunTasksQueryParams>(
  () => JSON.parse(serializedParams),
  [serializedParams]
);

  const fetchTasks = useCallback(async () => {
    if (!runId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await agentRunsRepository.getAgentRunTasks(runId, {
        ...stableParams,
        page,
        limit,
      });
      setTasks(result.tasks);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [runId, page, limit, stableParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    tasks,
    total,
    page,
    limit,
    isLoading,
    error,
    refetch,
    goToPage,
    changeLimit,
  };
}

// Hook for getting agent run timeline
export function useAgentRunTimeline(runId: string) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await agentRunsRepository.getAgentRunTimeline(runId);
        setTimeline(result.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [runId]);

  return { timeline, isLoading, error };
}

// Hook for getting agent run metrics
export function useAgentRunMetrics(runId: string) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await agentRunsRepository.getAgentRunMetrics(runId);
        setMetrics(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [runId]);

  return { metrics, isLoading, error };
}
