/**
 * TypeScript interfaces for Agent Runs API endpoints
 * These types define the structure of data for agent evaluation runs
 */

// ===== AGENT RUN DATA =====
export interface AgentRunData {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  validatorName: string;
  validatorImage: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  totalTasks: number;
  completedTasks: number;
  successfulTasks: number;
  failedTasks: number;
  score: number;
  ranking?: number;
  duration: number;
  overallScore: number;
  websites: {
    website: string;
    tasks: number;
    successful: number;
    failed: number;
    score: number;
  }[];
  tasks: AgentRunTaskData[];
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

// ===== AGENT RUN LIST ITEM =====
export interface AgentRunListItem {
  runId: string;
  agentId: string;
  agentName?: string;
  roundId: number;
  validatorId: string;
  validatorName?: string;
  validatorImage?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  startTime: string;
  endTime?: string | null;
  totalTasks: number;
  completedTasks?: number;
  successfulTasks?: number;
  overallScore: number;
  successRate?: number | null;
  ranking?: number;
}

// ===== AGENT RUN TASK DATA =====
export interface AgentRunTaskData {
  taskId: string;
  website: string;
  useCase: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  score: number;
  duration: number;
  startTime: string;
  endTime?: string;
  error?: string;
  actions: TaskAction[];
  screenshots?: string[];
  logs?: string[];
}

// ===== TASK ACTION =====
export interface TaskAction {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'wait' | 'scroll' | 'screenshot' | 'other';
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
  runId: string;
  overallScore: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  websites: number;
  averageTaskDuration: number;
  successRate: number;
  scoreDistribution: {
    excellent: number; // 0.9-1.0
    good: number;      // 0.7-0.89
    average: number;   // 0.5-0.69
    poor: number;      // 0.0-0.49
  };
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
}

// ===== AGENT RUN SUMMARY =====
export interface AgentRunSummary {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  startTime: string;
  endTime?: string;
  status: string;
  overallScore: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  duration: number;
  ranking?: number;
  topPerformingWebsite: {
    website: string;
    score: number;
    tasks: number;
  };
  topPerformingUseCase: {
    useCase: string;
    score: number;
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
    status: 'active' | 'completed' | 'upcoming';
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
}

// ===== API RESPONSE TYPES =====
export interface AgentRunDetailsResponse {
  data: {
    run: AgentRunData;
  };
}

export interface AgentRunStatsResponse {
  data: {
    stats: AgentRunStats;
  };
}

export interface AgentRunSummaryResponse {
  data: {
    summary: AgentRunSummary;
  };
}

export interface AgentRunPersonasResponse {
  data: {
    personas: AgentRunPersonas;
  };
}

export interface AgentRunTasksResponse {
  data: {
    tasks: AgentRunTaskData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AgentRunsListResponse {
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
  status?: 'pending' | 'running' | 'completed' | 'failed';
  sortBy?: 'startTime' | 'score' | 'duration' | 'ranking';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentRunTasksQueryParams {
  page?: number;
  limit?: number;
  website?: string;
  useCase?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  sortBy?: 'startTime' | 'score' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentRunsListQueryParams {
  query?: string;
  page?: number;
  limit?: number;
  roundId?: number;
  validatorId?: string;
  agentId?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  sortBy?: 'startTime' | 'score' | 'duration' | 'ranking';
  sortOrder?: 'asc' | 'desc';
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
