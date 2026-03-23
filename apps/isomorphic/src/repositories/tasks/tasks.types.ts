/**
 * TypeScript interfaces for Tasks API endpoints
 * These types define the structure of data for task management
 */

// ===== TASK DATA =====
export interface TaskData {
  taskId: string;
  evaluationId?: string;
  agentRunId: string;
  website: string;
  seed?: string | null;
  useCase: string;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  score: number;
  successRate: number;
  duration: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
  actions: TaskAction[];
  screenshots?: string[];
  logs?: string[];
  metadata?: {
    environment: string;
    browser: string;
    viewport: {
      width: number;
      height: number;
    };
    userAgent: string;
  } | null;
  relationships?: TaskRelationships | null;
  /** Reason for score 0 at evaluation level (e.g. task_timeout, tests_failed) */
  zeroReason?: string | null;
  zero_reason?: string | null;
}

// ===== TASK ACTION =====
export interface TaskAction {
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
  screenshot?: string;
}

// ===== TASK DETAILS =====
export interface TaskDetails {
  taskId: string;
  agentRunId: string;
  website: string;
  seed?: string | null;
  webVersion?: string | null;
  useCase: string;
  prompt: string;
  status: string;
  score: number;
  successRate: number;
  duration: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
  actions: TaskAction[];
  screenshots: string[];
  logs: string[];
  relationships: TaskRelationships;
  performance: {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    averageActionDuration: number;
    totalWaitTime: number;
    totalNavigationTime: number;
  };
  metadata: {
    environment: string;
    browser: string;
    viewport: {
      width: number;
      height: number;
    };
    userAgent: string;
    resources: {
      cpu: number;
      memory: number;
      network: number;
    };
  };
}

export interface TaskRoundSummary {
  validatorRoundId: string;
  roundNumber?: number | null;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  startEpoch?: number | null;
  endEpoch?: number | null;
}

export interface TaskValidatorSummary {
  uid: number;
  hotkey: string;
  coldkey?: string | null;
  name?: string | null;
  image?: string | null;
  stake: number;
  vtrust: number;
  version?: string | null;
}

export interface TaskMinerSummary {
  uid?: number | null;
  hotkey?: string | null;
  name: string;
  github?: string | null;
  provider?: string | null;
  image?: string | null;
  isSota: boolean;
}

export interface TaskAgentRunSummary {
  agentRunId: string;
  validatorUid: number;
  minerUid?: number | null;
  isSota: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
  duration?: number | null;
  taskCount?: number | null;
  completedTasks?: number | null;
  failedTasks?: number | null;
  averageScore?: number | null;
}

export interface TaskEvaluationSummary {
  evaluationId: string;
  finalScore: number;
  rawScore: number;
  evaluationTime: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  validatorUid: number;
  minerUid?: number | null;
  webAgentId?: string | null;
  hasFeedback: boolean;
  hasRecording: boolean;
  reward?: number | null;
  llmModel?: string | null;
  // LLM usage tracking
  llmCost?: number | null;
  llmTokens?: number | null;
  llmProvider?: string | null;
  llmUsage?: {
    provider?: string | null;
    model?: string | null;
    tokens?: number | null;
    cost?: number | null;
  }[] | null;
}

export interface TaskSolutionSummary {
  solutionId: string;
  agentRunId: string;
  minerUid?: number | null;
  validatorUid: number;
  actionsCount: number;
  webAgentId?: string | null;
  hasRecording: boolean;
}

export interface TaskRelationships {
  round: TaskRoundSummary;
  validator: TaskValidatorSummary;
  miner: TaskMinerSummary;
  agentRun: TaskAgentRunSummary;
  evaluation?: TaskEvaluationSummary | null;
  solution?: TaskSolutionSummary | null;
}

// ===== TASK RESULTS =====
export interface TaskResults {
  taskId: string;
  status: string;
  score: number;
  duration: number;
  actions: TaskAction[];
  screenshots: string[];
  logs: string[];
  summary: {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    actionTypes: {
      navigate: number;
      click: number;
      type: number;
      input: number;
      search: number;
      extract: number;
      submit: number;
      open_tab: number;
      close_tab: number;
      wait: number;
      scroll: number;
      screenshot: number;
      other: number;
    };
  };
  timeline: {
    timestamp: string;
    action: string;
    duration: number;
    success: boolean;
  }[];
}

// ===== TASK PERSONAS =====
export interface TaskPersonas {
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
    name: string;
    type: string;
    image: string;
    description?: string;
  };
  task: {
    id: string;
    website: string;
    useCase: string;
    status: string;
    score: number;
  };
}

// ===== TASK STATISTICS =====
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  averageScore: number;
  averageDuration: number;
  successRate: number;
  performanceByWebsite: {
    website: string;
    tasks: number;
    successful: number;
    failed: number;
    averageScore: number;
    averageDuration: number;
  }[];
  performanceByUseCase: {
    useCase: string;
    tasks: number;
    successful: number;
    failed: number;
    averageScore: number;
    averageDuration: number;
  }[];
  recentActivity: {
    timestamp: string;
    action: string;
    details: string;
  }[];
}

// ===== API RESPONSE TYPES =====
export interface TaskDetailsResponse {
  success: boolean;
  data: {
    task: TaskData;
  };
}

export interface TaskResultsResponse {
  success: boolean;
  data: {
    results: TaskResults;
  };
}

export interface TaskPersonasResponse {
  success: boolean;
  data: {
    personas: TaskPersonas;
  };
}

export interface TaskStatisticsResponse {
  success: boolean;
  data: {
    statistics: TaskStatistics;
  };
}

export interface TasksListResponse {
  success: boolean;
  data: {
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
  };
}

// ===== QUERY PARAMETERS =====
export interface TaskQueryParams {
  includeActions?: boolean;
  includeScreenshots?: boolean;
  includeLogs?: boolean;
  includeMetadata?: boolean;
}

export interface TaskDetailQueryParams {
  includeActions?: boolean;
  includeScreenshots?: boolean;
  includeLogs?: boolean;
  includePerformance?: boolean;
  includeMetadata?: boolean;
}

export interface TasksListQueryParams {
  page?: number;
  limit?: number;
  agentRunId?: string;
  minerUid?: number;
  website?: string;
  useCase?: string;
  status?: "pending" | "running" | "completed" | "failed";
  sortBy?: "startTime" | "score" | "duration" | "createdAt";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

// ===== PARTIAL LOADING TYPES =====
export interface TaskPartialData {
  personas?: TaskPersonas;
  details?: TaskDetails;
  results?: TaskResults;
  statistics?: TaskStatistics;
  loading: {
    personas: boolean;
    details: boolean;
    results: boolean;
    statistics: boolean;
  };
  errors: {
    personas?: string;
    details?: string;
    results?: string;
    statistics?: string;
  };
}

// ===== TASK SEARCH =====
export interface TaskSearchParams {
  query?: string;
  website?: string;
  useCase?: string;
  /** Season number for evaluations (rounds expressed as season/round) */
  season?: number;
  /** Round number within the selected season */
  round?: number;
  status?: string;
  agentRunId?: string;
  minerUid?: number;
  minScore?: number;
  maxScore?: number;
  /** When true, filter to tasks with reward > 0 (success) */
  successOnly?: boolean;
  successMode?: "all" | "successful" | "non_successful";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeDetails?: boolean; // If false, omits actions/screenshots/logs (MUCH faster)
}

export interface TaskSearchResponse {
  success: boolean;
  data: {
    tasks: TaskData[];
    total: number;
    page: number;
    limit: number;
    facets: {
      websites: { name: string; count: number }[];
      useCases: { name: string; count: number }[];
      statuses: { name: string; count: number }[];
      scoreRanges: { range: string; count: number }[];
    };
  };
}
