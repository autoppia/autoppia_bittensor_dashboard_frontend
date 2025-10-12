/**
 * TypeScript interfaces for Agents API endpoints
 * These types define the structure of data returned by the backend API
 */

// ===== MINIMAL AGENT DATA (for listing) =====
export interface MinimalAgentData {
  uid: number; // Miner UID
  name: string;
  ranking: number; // Current ranking based on average score
  score: number; // Average score (renamed from averageScore for consistency with API)
  isSota: boolean; // Whether this is a SOTA agent
  imageUrl: string;
}

// ===== FULL AGENT DATA (for details) =====
export interface AgentData {
  id: string; // Keep for backward compatibility, but now represents UID as string
  uid: number; // Miner UID
  name: string;
  hotkey: string; // Miner hotkey
  type: string; // Agent type (e.g., "autoppia")
  imageUrl: string;
  githubUrl?: string; // GitHub repository URL
  taostatsUrl: string; // TaoStats URL
  isSota: boolean; // Whether this is a SOTA agent
  status: 'active' | 'inactive' | 'maintenance';
  description?: string; // Miner description
  version?: string; // Agent version
  totalRuns: number;
  successfulRuns: number;
  currentScore: number; // RENAMED from averageScore
  currentTopScore: number; // RENAMED from bestScore
  currentRank: number; // NEW FIELD
  bestRankEver: number; // NEW FIELD
  roundsParticipated: number; // NEW FIELD
  alphaWonInPrizes: number; // NEW FIELD
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// ===== SCORE ROUND DATA =====
export interface ScoreRoundDataPoint {
  round_id: number;
  score: number;
  rank: number | null;
  reward: number;
  timestamp: string;
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
  currentScore: number; // RENAMED from averageScore
  currentTopScore: number; // RENAMED from bestScore
  worstScore: number;
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
    round: number;
    score: number;
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
      currentScore: number; // RENAMED from averageScore
      currentTopScore: number; // RENAMED from bestScore
      averageDuration: number;
      totalRuns: number;
      currentRank: number; // RENAMED from ranking
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
  averageCurrentScore: number; // RENAMED from averageScore
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
export interface MinimalAgentsListResponse {
  miners: MinimalAgentData[];
  total: number;
  page: number;
  limit: number;
}

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
    scoreRoundData: ScoreRoundDataPoint[];
  };
}

export interface MinerDetailsResponse {
  data: {
    agent: AgentData;
    scoreRoundData: ScoreRoundDataPoint[];
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
export interface MinimalAgentsListQueryParams {
  page?: number;
  limit?: number;
  isSota?: boolean; // Filter by SOTA status
  search?: string; // Search by miner name or UID
}

export interface AgentsListQueryParams {
  page?: number;
  limit?: number;
  isSota?: boolean; // Filter by SOTA status
  status?: 'active' | 'inactive' | 'maintenance';
  sortBy?: 'name' | 'uid' | 'currentScore' | 'currentTopScore' | 'currentRank' | 'totalRuns' | 'lastSeen';
  sortOrder?: 'asc' | 'desc';
  search?: string; // Search by name, UID, or hotkey
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
