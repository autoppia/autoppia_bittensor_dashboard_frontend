/**
 * Custom hooks for Task data management with partial loading
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { tasksRepository } from "@/repositories/tasks/tasks.repository";
import {
  TaskData,
  TaskDetails,
  TaskResults,
  TaskPersonas,
  TaskStatistics,
  TaskPartialData,
} from "@/repositories/tasks/tasks.types";

// Hook for getting task data with progressive loading
export function useTask(
  taskId: string,
  options: {
    includePersonas?: boolean;
    includeDetails?: boolean;
    includeResults?: boolean;
    includeStatistics?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const {
    includePersonas = true,
    includeDetails = true,
    includeResults = true,
    includeStatistics = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [data, setData] = useState<TaskPartialData>({
    loading: {
      personas: includePersonas,
      details: includeDetails,
      results: includeResults,
      statistics: includeStatistics,
    },
    errors: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await tasksRepository.getTaskPartialData(taskId, {
        includePersonas,
        includeDetails,
        includeResults,
        includeStatistics,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch task data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    taskId,
    includePersonas,
    includeDetails,
    includeResults,
    includeStatistics,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !taskId) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, taskId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const isAnyLoading = Object.values(data.loading).some((loading) => loading);
  const hasAnyError = Object.keys(data.errors).length > 0;

  return {
    data,
    isLoading: isLoading || isAnyLoading,
    error: error || (hasAnyError ? "Some data failed to load" : null),
    refetch,
    isAnyLoading,
    hasAnyError,
  };
}

// Hook for getting task personas only
export function useTaskPersonas(taskId: string) {
  const [personas, setPersonas] = useState<TaskPersonas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await tasksRepository.getTaskPersonas(taskId);
        setPersonas(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch personas"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, [taskId]);

  return { personas, isLoading, error };
}

// Hook for getting task details only
export function useTaskDetails(taskId: string) {
  const [details, setDetails] = useState<TaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await tasksRepository.getTaskDetails(taskId);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch details");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { details, isLoading, error, refetch: fetchDetails };
}

// Hook for getting task results only
export function useTaskResults(taskId: string) {
  const [results, setResults] = useState<TaskResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await tasksRepository.getTaskResults(taskId);
        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch results"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [taskId]);

  return { results, isLoading, error };
}

// Hook for getting task statistics only
export function useTaskStatistics(taskId: string) {
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await tasksRepository.getTaskStatistics(taskId);
        setStatistics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch statistics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [taskId]);

  return { statistics, isLoading, error };
}

// Hook for getting task actions with pagination
export function useTaskActions(
  taskId: string,
  params?: {
    page?: number;
    limit?: number;
    type?: string;
    sortBy?: "timestamp" | "duration";
    sortOrder?: "asc" | "desc";
  }
) {
  const [actions, setActions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [limit, setLimit] = useState(params?.limit || 20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedParams = useMemo(
    () => JSON.stringify(params ?? {}),
    [params]
  );

  const stableParams = useMemo(
    () => JSON.parse(serializedParams) as Record<string, unknown>,
    [serializedParams]
  );

  const desiredLimit = useMemo(() => {
    const raw = (stableParams as Record<string, unknown>).limit;
    return typeof raw === "number" ? raw : undefined;
  }, [stableParams]);

  const fetchActions = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await tasksRepository.getTaskActions(taskId, {
        ...stableParams,
        page,
        limit,
      });
      setActions(result.actions);
      setTotal(result.total);
      setSuccessCount(result.successCount ?? 0);
      setFailCount(result.failCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch actions");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, page, limit, stableParams]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const refetch = useCallback(() => {
    fetchActions();
  }, [fetchActions]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  useEffect(() => {
    if (desiredLimit && desiredLimit !== limit) {
      setLimit(desiredLimit);
      setPage(1);
    }
  }, [desiredLimit, limit]);

  return {
    actions,
    total,
    successCount,
    failCount,
    page,
    limit,
    isLoading,
    error,
    refetch,
    goToPage,
    changeLimit,
  };
}

// Hook for getting task screenshots
export function useTaskScreenshots(taskId: string) {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchScreenshots = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tasksRepository.getTaskScreenshots(taskId);
        setScreenshots(result.screenshots);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch screenshots"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenshots();
  }, [taskId]);

  return { screenshots, isLoading, error };
}

// Hook for getting task logs
export function useTaskLogs(
  taskId: string,
  params?: {
    level?: "info" | "warn" | "error" | "debug";
    limit?: number;
    offset?: number;
  }
) {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paramsKey = params ? JSON.stringify(params) : undefined;

  useEffect(() => {
    if (!taskId) return;

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tasksRepository.getTaskLogs(taskId, params);
        setLogs(result.logs);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [taskId, paramsKey, params]);

  return { logs, total, isLoading, error };
}

// Hook for getting task metrics
export function useTaskMetrics(taskId: string) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tasksRepository.getTaskMetrics(taskId);
        setMetrics(result.metrics);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch metrics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [taskId]);

  return { metrics, isLoading, error };
}

// Hook for getting task timeline
export function useTaskTimeline(taskId: string) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tasksRepository.getTaskTimeline(taskId);
        setTimeline(result.timeline);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch timeline"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [taskId]);

  return { timeline, isLoading, error };
}

// Hook for getting tasks list
export function useTasksList(
  params?: {
    page?: number;
    limit?: number;
    website?: string;
    useCase?: string;
    status?: string;
    agentRunId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } | null,
  options?: {
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled ?? true;
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [limit, setLimit] = useState(params?.limit || 20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedParams = useMemo(
    () => JSON.stringify(params ?? {}),
    [params]
  );

  const stableParams = useMemo(
    () => JSON.parse(serializedParams) as Record<string, unknown>,
    [serializedParams]
  );

  const desiredLimit = useMemo(() => {
    const raw = (stableParams as Record<string, unknown>).limit;
    return typeof raw === "number" ? raw : undefined;
  }, [stableParams]);

  const fetchTasks = useCallback(async () => {
    if (!enabled) {
      setTasks([]);
      setTotal(0);
      setError(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const result = await tasksRepository.getTasks({
        ...stableParams,
        page,
        limit,
      });
      setTasks(result.tasks);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, limit, page, stableParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refetch = useCallback(() => {
    if (!enabled) return;
    fetchTasks();
  }, [enabled, fetchTasks]);

  useEffect(() => {
    if (desiredLimit && desiredLimit !== limit) {
      setLimit(desiredLimit);
      setPage(1);
    }
  }, [desiredLimit, limit]);

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

// Hook for searching tasks
export function useTaskSearch(params: {
  query?: string;
  website?: string;
  useCase?: string;
  status?: string;
  agentRunId?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await tasksRepository.searchTasks(params);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search tasks");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  return {
    results,
    isLoading,
    error,
    search,
  };
}
