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
  slug?: string;
  provider?: string;
}

// ===== FULL AGENT DATA (for details) =====
export interface AgentData {
  id: string; // Keep for backward compatibility, but now represents UID as string
  uid: number; // Miner UID
  name: string;
  slug?: string;
  hotkey?: string | null; // Miner hotkey (absent for SOTA benchmarks)
  type: string; // Agent type (e.g., "autoppia")
  imageUrl: string;
  githubUrl?: string; // GitHub repository URL
  taostatsUrl?: string | null; // TaoStats URL (not available for SOTA agents)
  provider?: string; // Provider / benchmark origin (e.g., openai, anthropic)
  category?: string; // Optional grouping/category label
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
  bestRankRoundId?: number; // NEW FIELD
  roundsParticipated: number; // NEW FIELD
  roundsWon?: number; // NEW FIELD
  alphaWonInPrizes: number; // NEW FIELD
  taoWonInPrizes?: number; // NEW FIELD (derived)
  bestRoundScore: number; // NEW FIELD
  bestRoundId?: number; // NEW FIELD
  averageResponseTime: number;
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
  topScore?: number; // Highest benchmark/miner score for the round
  benchmarks?: {
    name: string;
    score: number;
    provider?: string;
  }[];
}

export interface AgentRoundMetrics {
  roundId: number;
  score: number;
  topScore: number;
  rank?: number | null;
  totalRuns: number;
  totalValidators: number;
  validatorUids: number[];
  validators: Array<{
    uid: number | null;
    hotkey?: string | null;
    name?: string | null;
  }>;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageResponseTime: number;
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
  successRate: number;
  currentScore: number; // RENAMED from averageScore
  currentTopScore: number; // RENAMED from bestScore
  worstScore: number;
  averageResponseTime: number;
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
    responseTime?: number;
    successRate?: number;
  }[];
}

// ===== AGENT RUN DATA =====
export interface AgentRunData {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  validatorName: string;
  validatorImage: string;
  startTime: string;
  endTime?: string | null;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  totalTasks: number;
  completedTasks: number;
  successfulTasks: number;
  failedTasks: number;
  score: number;
  overallScore: number;
  duration: number;
  ranking?: number;
  averageEvaluationTime?: number | null;
  websites: {
    website: string;
    tasks: number;
    successful: number;
    failed: number;
    score: number;
  }[];
  tasks: AgentRunTaskData[];
  metadata: Record<string, any>;
}

export interface AgentRunOverview {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  validatorName: string;
  validatorImage: string;
  status: string;
  startTime: string | null;
  endTime?: string | null;
  totalTasks: number;
  completedTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageScore: number;
  score: number;
  successRate: number;
  overallScore: number;
  overallScoreRaw?: number;
  ranking: number;
  duration: number;
  averageEvaluationTime?: number | null;
  // Optional: number of unique websites involved in this run
  websitesCount?: number;
  // Optional legacy field present in some backends
  totalWebsites?: number;
}

// ===== AGENT COMPARISON =====
export interface AgentComparison {
  agents: {
    agentId: string;
    name: string;
    metrics: {
      currentScore: number; // RENAMED from averageScore
      currentTopScore: number; // RENAMED from bestScore
      successRate: number;
      averageResponseTime: number;
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
  round?: number;
}

export interface AgentsListResponse {
  success: boolean;
  data: {
    agents: AgentData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AgentDetailsResponse {
  success: boolean;
  data: {
    agent: AgentData;
    scoreRoundData: ScoreRoundDataPoint[];
    availableRounds?: number[];
    roundMetrics?: AgentRoundMetrics | null;
  };
}

export interface MinerDetailsResponse {
  success: boolean;
  data: {
    agent: AgentData;
    scoreRoundData: ScoreRoundDataPoint[];
    availableRounds?: number[];
    roundMetrics?: AgentRoundMetrics | null;
  };
}

export interface AgentPerformanceResponse {
  success: boolean;
  data: {
    metrics: AgentPerformanceMetrics;
  };
}

export interface AgentRunsResponse {
  success: boolean;
  data: {
    runs: AgentRunOverview[];
    total: number;
    page: number;
    limit: number;
    availableRounds?: number[];
    selectedRound?: number | null;
  };
}

export interface AgentRunDetailsResponse {
  success: boolean;
  data: {
    run: AgentRunData;
  };
}

export interface AgentComparisonResponse {
  success: boolean;
  data: {
    comparison: AgentComparison;
  };
}

export interface AgentStatisticsResponse {
  success: boolean;
  data: {
    statistics: AgentStatistics;
  };
}

export interface AgentActivityResponse {
  success: boolean;
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
  round?: number; // Filter results by round
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
  agentId?: string;
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
