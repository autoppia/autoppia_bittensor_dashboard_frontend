/**
 * TypeScript interfaces for Agents API endpoints
 * These types define the structure of data returned by the backend API
 */

// ===== AGENT DATA =====
export interface AgentData {
  id: string;
  name: string;
  type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom';
  imageUrl: string;
  description?: string;
  version?: string;
  status: 'active' | 'inactive' | 'maintenance';
  totalRuns: number;
  successfulRuns: number;
  averageScore: number;
  bestScore: number;
  successRate: number;
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// ===== AGENT PERFORMANCE METRICS =====
export interface AgentPerformanceMetrics {
  agentId: string;
  timeRange: {
    start: string;
    end: string;
  };
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  successRate: number;
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  scoreDistribution: {
    excellent: number; // 0.9-1.0
    good: number;      // 0.7-0.89
    average: number;   // 0.5-0.69
    poor: number;      // 0.0-0.49
  };
  performanceTrend: {
    period: string;
    score: number;
    successRate: number;
    duration: number;
  }[];
}

// ===== AGENT RUN DATA =====
export interface AgentRunData {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  totalTasks: number;
  completedTasks: number;
  score: number;
  duration: number;
  ranking?: number;
  tasks: {
    taskId: string;
    website: string;
    useCase: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    score: number;
    duration: number;
    startTime: string;
    endTime?: string;
    error?: string;
  }[];
  metadata: {
    environment: string;
    version: string;
    resources: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
}

// ===== AGENT COMPARISON =====
export interface AgentComparison {
  agents: {
    agentId: string;
    name: string;
    metrics: {
      averageScore: number;
      successRate: number;
      averageDuration: number;
      totalRuns: number;
      ranking: number;
    };
  }[];
  comparisonMetrics: {
    bestPerformer: string;
    mostReliable: string;
    fastest: string;
    mostActive: string;
  };
  timeRange: {
    start: string;
    end: string;
  };
}

// ===== AGENT STATISTICS =====
export interface AgentStatistics {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalRuns: number;
  successfulRuns: number;
  averageSuccessRate: number;
  averageScore: number;
  topPerformingAgent: {
    id: string;
    name: string;
    score: number;
  };
  mostActiveAgent: {
    id: string;
    name: string;
    runs: number;
  };
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  lastUpdated: string;
}

// ===== AGENT ACTIVITY =====
export interface AgentActivity {
  id: string;
  type: 'run_started' | 'run_completed' | 'run_failed' | 'agent_created' | 'agent_updated' | 'agent_deactivated';
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
  metadata: {
    runId?: string;
    roundId?: number;
    validatorId?: string;
    score?: number;
    duration?: number;
    error?: string;
  };
}

// ===== API RESPONSE TYPES =====
export interface AgentsListResponse {
  data: {
    agents: AgentData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AgentDetailsResponse {
  data: {
    agent: AgentData;
  };
}

export interface AgentPerformanceResponse {
  data: {
    metrics: AgentPerformanceMetrics;
  };
}

export interface AgentRunsResponse {
  data: {
    runs: AgentRunData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AgentRunDetailsResponse {
  data: {
    run: AgentRunData;
  };
}

export interface AgentComparisonResponse {
  data: {
    comparison: AgentComparison;
  };
}

export interface AgentStatisticsResponse {
  data: {
    statistics: AgentStatistics;
  };
}

export interface AgentActivityResponse {
  data: {
    activities: AgentActivity[];
    total: number;
  };
}

// ===== QUERY PARAMETERS =====
export interface AgentsListQueryParams {
  page?: number;
  limit?: number;
  type?: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom';
  status?: 'active' | 'inactive' | 'maintenance';
  sortBy?: 'name' | 'averageScore' | 'successRate' | 'totalRuns' | 'lastSeen';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AgentRunsQueryParams {
  page?: number;
  limit?: number;
  roundId?: number;
  validatorId?: string;
  status?: 'running' | 'completed' | 'failed' | 'timeout';
  sortBy?: 'startTime' | 'score' | 'duration' | 'ranking';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface AgentPerformanceQueryParams {
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface AgentActivityQueryParams {
  limit?: number;
  offset?: number;
  type?: string;
  since?: string;
  agentId?: string;
}

export interface AgentComparisonQueryParams {
  agentIds: string[];
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  startDate?: string;
  endDate?: string;
  metrics?: ('score' | 'successRate' | 'duration' | 'runs')[];
}
