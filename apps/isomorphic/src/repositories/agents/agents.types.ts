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
  eval_score?: number; // Post-consensus average eval score
  eval_time?: number; // Post-consensus average eval time
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

// ===== MINER ROUND DETAILS =====
// ===== MINER HISTORICAL DATA =====
export interface MinerHistoricalResponse {
  success: boolean;
  data: {
    miner: {
      uid: number;
      name: string;
      hotkey: string;
      image: string;
    };
    summary: {
      totalRounds: number;
      roundsWon: number;
      roundsLost: number;
      roundsParticipated: number;
      totalTasks: number;
      totalTasksSuccessful: number;
      totalTasksFailed: number;
      overallSuccessRate: number;
      averageDuration: number;
      bestScore: number;
      bestScoreRound: number | null;
      bestRank: number | null;
      bestRankRound: number | null;
      averageScore: number;
      totalAlphaEarned: number;
      totalTaoEarned: number;
    };
    performanceByWebsite: Array<{
      website: string;
      tasks: number;
      successful: number;
      failed: number;
      averageDuration: number;
      useCases: Array<{
        useCase: string;
        tasks: number;
        successful: number;
        failed: number;
        averageDuration: number;
      }>;
    }>;
    roundsHistory: Array<{
      round: number;
      post_consensus_rank: number | null;
      post_consensus_avg_reward: number;
      post_consensus_avg_eval_score: number;
      post_consensus_avg_eval_time: number;
      tasks_received: number;
      tasks_success: number;
      tasks_failed: number;
      is_winner: boolean;
      validators_count: number;
      subnet_price: number | null;
      weight: number;
    }>;
  };
}

export interface MinerRoundDetailsResponse {
  success: boolean;
  data: {
    miner: {
      uid: number;
      name: string;
      hotkey: string | null;
      image: string | null;
      github_url?: string | null;
    };
    round: number;
    post_consensus_rank: number;
    post_consensus_avg_reward: number;
    post_consensus_avg_eval_score: number;
    post_consensus_avg_eval_time: number;
    tasks_received: number;
    tasks_success: number;
    validators_count: number;
    avg_tasks_per_validator: number;
    performanceByWebsite: Array<{
      website: string;
      tasks_received: number;
      tasks_success: number;
      success_rate: number;
    }>;
    validators?: Array<{
      validator_uid: number;
      validator_name: string;
      validator_hotkey: string | null;
      validator_image: string | null;
      local_rank: number | null;
      local_avg_reward: number;
      local_avg_eval_score: number;
      local_avg_eval_time: number;
      local_tasks_received: number;
      local_tasks_success: number;
      local_miners_evaluated: number;
      agent_run_id?: string;
    }>;
    post_consensus_summary?: {
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
        avg_reward: number;
        avg_eval_score: number;
        avg_eval_time: number;
      } | null;
      miners_evaluated: number;
      tasks_evaluated: number;
    };
  };
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
    validators?: Array<{
      validator_uid: number;
      validator_name: string;
      validator_hotkey: string | null;
      local_avg_winner_score: number;
      topScore: number;
      local_avg_eval_time: number;
      local_miners_evaluated: number;
      local_tasks_evaluated: number;
      miners: Array<{
        uid: number;
        name: string;
        hotkey: string | null;
        image: string | null;
        local_rank: number | null;
        local_avg_reward: number;
        local_avg_eval_score: number;
        local_avg_eval_time: number;
      }>;
      winner?: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
      };
    }>;
    post_consensus_summary?: {
      winner: {
        uid: number;
        name: string;
        image: string | null;
        hotkey: string | null;
        avg_reward: number;
        avg_eval_score: number;
        avg_eval_time: number;
      } | null;
      miners_evaluated: number;
      tasks_evaluated: number;
    };
  };
  data: {
    runs: AgentRunOverview[];
    total: number;
    page: number;
    limit: number;
    availableRounds?: number[];
    selectedRound?: number | null;
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
