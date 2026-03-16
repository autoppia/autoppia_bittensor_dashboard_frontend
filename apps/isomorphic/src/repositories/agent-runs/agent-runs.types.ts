/**
 * TypeScript interfaces for Agent Runs API endpoints
 * These types define the structure of data for agent evaluation runs
 */

export interface PaginatedResult<T> {
  runs: T[];
  total: number;
  page: number;
  limit: number;
}


// ===== AGENT RUN DATA =====
export interface AgentRunData {
  runId: string;
  agentId: string;
  agentUid?: number | null;
  agentHotkey?: string | null;
  agentName?: string | null;
  agentImage?: string | null;
  roundId: number;
  validatorId: string;
  validatorName: string;
  validatorImage: string;
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed" | "timeout";
  totalTasks: number;
  completedTasks: number;
  successfulTasks: number;
  failedTasks: number;
  reward: number;
  ranking?: number;
  duration: number;
  overallReward: number;
  averageEvaluationTime?: number | null;
  /** Reason for score 0 when applicable (e.g. over_cost_limit, deploy_failed, all_tasks_failed) */
  zeroReason?: string | null;
  isReused?: boolean;
  reusedFromAgentRunId?: string | null;
  reusedFromRoundDisplay?: string | null;
  tasks?: AgentRunTaskData[];
  /** Optional per-website stats (from run details API) */
  websites?: Array<{
    website?: string;
    successful?: number;
    tasks?: number;
  }>;
  // metadata removed - validator info already in info
}

// ===== AGENT RUN LIST ITEM =====
export interface AgentRunListItem {
  runId: string;
  agentId: string;
  agentUid?: number | null;
  agentHotkey?: string | null;
  agentName?: string | null;
  agentImage?: string | null;
  roundId: number | string;
  validatorId: string;
  validatorName?: string;
  validatorImage?: string;
  status: "running" | "completed" | "failed" | "timeout";
  startTime: string;
  endTime?: string | null;
  totalTasks: number;
  completedTasks?: number;
  successfulTasks?: number;
  overallReward: number;
  successRate?: number | null;
  ranking?: number;
  averageEvaluationTime?: number | null;
  isReused?: boolean;
  reusedFromAgentRunId?: string | null;
  reusedFromRoundDisplay?: string | null;
}

// ===== AGENT RUN EVALUATION DATA =====
export interface AgentRunEvaluationData {
  evaluationId: string; // Primary identifier
  taskId: string; // Reference to task
  website: string;
  useCase: string;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  eval_score: number; // 0 or 1 (passed or failed)
  eval_time: number; // Evaluation time in seconds
  reward: number; // Combined reward (eval_score + time_score)
  startTime: string;
  endTime?: string;
  error?: string;
  // actions, screenshots, logs removed - not needed in simplified response
}

export interface AgentRunTaskData extends AgentRunEvaluationData {}

// ===== TASK ACTION =====
export interface AgentRunTaskAction {
  id: string;
  type:
    | "navigate"
    | "click"
    | "type"
    | "input"
    | "search"
    | "extract"
    | "submit"
    | "open_tab"
    | "close_tab"
    | "wait"
    | "scroll"
    | "screenshot"
    | "other";
  selector?: string;
  value?: string;
  timestamp: string;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// ===== AGENT RUN STATS =====
export interface AgentRunStats {
  runId?: string;
  overallReward?: number;
  /** Reason for zero reward when applicable (e.g. over_cost_limit, deploy_failed) */
  zeroReason?: string | null;
  totalTasks: number;
  websites: number;
  avg_reward: number;
  avg_time: number;
  successfulTasks: number;
  failedTasks: number;
  successRate?: number;
  averageTaskDuration?: number;
  scoreDistribution?: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  performanceByWebsite: {
    website: string;
    tasks: number;
    successful: number;
    failed: number;
    averageScore: number;
    averageDuration: number;
    useCases?: {
      useCase: string;
      tasks: number;
      successful: number;
      failed: number;
      averageScore: number;
      averageDuration: number;
    }[];
  }[];
  performanceByUseCase?: {
    useCase: string;
    tasks: number;
    successful: number;
    failed: number;
    averageScore: number;
    averageDuration: number;
  }[];
}

// ===== AGENT RUN SUMMARY =====
export interface AgentRunSummary {
  runId: string;
  agentId: string;
  agentUid?: number | null;
  agentHotkey?: string | null;
  agentName?: string | null;
  roundId: number;
  validatorId: string;
  startTime: string;
  endTime?: string;
  status: string;
  overallReward: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  duration: number;
  ranking?: number;
  topPerformingWebsite: {
    website: string;
    averageEvalScore: number;
    tasks: number;
  };
  topPerformingUseCase: {
    useCase: string;
    averageEvalScore: number;
    tasks: number;
  };
  recentActivity: {
    timestamp: string;
    action: string;
    details: string;
  }[];
}

// ===== AGENT RUN PERSONAS =====
export interface AgentRunPersonas {
  round: {
    id: number;
    name: string;
    status: "active" | "completed" | "upcoming";
    startTime: string;
    endTime?: string;
  };
  validator: {
    id: string;
    name: string;
    image: string;
    description?: string;
    website?: string;
    github?: string;
  };
  agent: {
    id: string;
    uid?: number | null;
    hotkey?: string | null;
    name: string;
    type: string;
    image: string;
    description?: string;
  };
}

// ===== API RESPONSE TYPES =====
export interface AgentRunDetailsResponse {
  success: boolean;
  data: {
    run: AgentRunData;
  };
}

export interface AgentRunStatsResponse {
  success: boolean;
  data: {
    stats: AgentRunStats;
  };
}

export interface AgentRunSummaryResponse {
  success: boolean;
  data: {
    summary: AgentRunSummary;
  };
}

export interface AgentRunPersonasResponse {
  success: boolean;
  data: {
    personas: AgentRunPersonas;
  };
}

export interface AgentRunTasksResponse {
  success: boolean;
  data: {
    tasks: AgentRunTaskData[];
    total: number;
    page?: number;
    limit?: number;
  };
}

export interface AgentRunsListResponse {
  success: boolean;
  data: {
    runs: AgentRunListItem[];
    total: number;
    page: number;
    limit: number;
    facets?: {
      validators: { id: string; name?: string; count: number }[];
      rounds: { id: number; count: number }[];
      agents: { id: string; name?: string; count: number }[];
      statuses: { name: string; count: number }[];
    };
  };
}

// ===== QUERY PARAMETERS =====
export interface AgentRunQueryParams {
  includeTasks?: boolean;
  includeStats?: boolean;
  includeSummary?: boolean;
  includePersonas?: boolean;
  website?: string;
  useCase?: string;
  status?: "pending" | "running" | "completed" | "failed";
  sortBy?: "startTime" | "reward" | "duration" | "ranking";
  sortOrder?: "asc" | "desc";
}

export interface AgentRunTasksQueryParams {
  page?: number;
  limit?: number;
  website?: string;
  useCase?: string;
  status?: "pending" | "running" | "completed" | "failed";
  sortBy?: "startTime" | "score" | "duration";
  sortOrder?: "asc" | "desc";
}

export interface AgentRunsListQueryParams {
  query?: string;
  page?: number;
  limit?: number;
  roundId?: number | string;
  validatorId?: string;
  agentId?: string;
  status?: "pending" | "running" | "completed" | "failed" | "timeout";
  sortBy?: "startTime" | "reward" | "duration" | "ranking";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

// ===== PARTIAL LOADING TYPES =====
export interface AgentRunPartialData {
  personas?: AgentRunPersonas;
  stats?: AgentRunStats;
  summary?: AgentRunSummary;
  tasks?: AgentRunTaskData[];
  loading: {
    personas: boolean;
    stats: boolean;
    summary: boolean;
    tasks: boolean;
  };
  errors: {
    personas?: string;
    stats?: string;
    summary?: string;
    tasks?: string;
  };
}
