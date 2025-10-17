/**
 * TypeScript interfaces for Rounds API endpoints
 * These types define the structure of data returned by the backend API
 */

// ===== ROUND DATA =====
export interface ValidatorRoundData {
  validatorRoundId: string;
  validatorUid?: number;
  validatorName?: string;
  validatorHotkey?: string;
  status: 'active' | 'completed' | 'pending';
  startTime: string;
  endTime?: string;
  averageScore: number;
  topScore: number;
  totalTasks: number;
  completedTasks: number;
  icon?: string;
  agentEvaluationRuns?: any[];
  roundData?: any;
}

export interface RoundData {
  id: number;
  round?: number;
  roundNumber?: number;
  roundKey?: string;
  startBlock: number;
  endBlock: number;
  current: boolean;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'pending';
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  topScore: number;
  currentBlock?: number;
  blocksRemaining?: number;
  progress?: number;
  validatorRounds: ValidatorRoundData[];
}

// ===== ROUND STATISTICS =====
export interface RoundStatistics {
  roundId: number;
  totalMiners: number;
  activeMiners: number;
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  topScore: number;
  successRate: number;
  averageDuration: number;
  totalStake: number;
  totalEmission: number;
  lastUpdated: string;
}

// ===== MINER PERFORMANCE =====
export interface MinerPerformance {
  uid: number;
  name?: string;
  hotkey?: string | null;
  success: boolean;
  score: number;
  duration: number;
  ranking: number;
  tasksCompleted: number;
  tasksTotal: number;
  stake: number;
  emission: number;
  lastSeen: string;
  validatorId?: string;
  isSota?: boolean;
  provider?: string;
  imageUrl?: string;
}

export interface BenchmarkPerformance {
  id: string;
  name: string;
  score: number;
  provider?: string;
  imageUrl?: string;
}

// ===== VALIDATOR PERFORMANCE =====
export interface ValidatorPerformance {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  status: 'active' | 'inactive' | 'offline';
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  topScore: number;
  weight: number;
  trust: number;
  version: number;
  stake: number;
  emission: number;
  lastSeen: string;
  uptime: number;
}

// ===== ROUND RECENT ACTIVITY =====
export interface RoundActivity {
  id: string;
  type: 'task_completed' | 'miner_joined' | 'miner_left' | 'validator_joined' | 'validator_left' | 'round_started' | 'round_ended';
  message: string;
  timestamp: string;
  metadata: {
    minerUid?: number;
    validatorId?: string;
    taskId?: string;
    score?: number;
    duration?: number;
  };
}

// ===== ROUND PROGRESS =====
export interface RoundProgress {
  roundId: number;
  currentBlock: number;
  startBlock: number;
  endBlock: number;
  blocksRemaining: number;
  progress: number;
  estimatedTimeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  lastUpdated: string;
}

// ===== API RESPONSE TYPES =====
export interface RoundsListResponse {
  success: boolean;
  data: {
    rounds: RoundData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RoundDetailsResponse {
  success: boolean;
  data: {
    round: RoundData;
  };
}

export interface RoundStatisticsResponse {
  success: boolean;
  data: {
    statistics: RoundStatistics;
  };
}

export interface RoundMinersResponse {
  success: boolean;
  data: {
    miners: MinerPerformance[];
    benchmarks?: BenchmarkPerformance[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RoundValidatorsResponse {
  success: boolean;
  data: {
    validators: ValidatorPerformance[];
    total: number;
  };
}

export interface RoundActivityResponse {
  success: boolean;
  data: {
    activities: RoundActivity[];
    total: number;
  };
}

export interface RoundProgressResponse {
  success: boolean;
  data: {
    progress: RoundProgress;
  };
}

// ===== QUERY PARAMETERS =====
export interface RoundsListQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'pending';
  sortBy?: 'id' | 'startTime' | 'endTime' | 'totalTasks' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
}

export interface RoundMinersQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'duration' | 'ranking' | 'uid';
  sortOrder?: 'asc' | 'desc';
  success?: boolean;
  minScore?: number;
  maxScore?: number;
}

export interface RoundActivityQueryParams {
  limit?: number;
  offset?: number;
  type?: string;
  since?: string;
}
