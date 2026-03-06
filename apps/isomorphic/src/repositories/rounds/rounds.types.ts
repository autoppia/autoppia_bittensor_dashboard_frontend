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
  status: "active" | "finished" | "pending" | "evaluating_finished";
  startTime: string;
  endTime?: string;
  averageReward: number;
  topReward: number;
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
  season?: number;
  roundInSeason?: number;
  startBlock: number;
  endBlock: number;
  current: boolean;
  startTime: string;
  endTime?: string;
  status: "active" | "finished" | "pending" | "evaluating_finished";
  totalTasks: number;
  completedTasks: number;
  averageReward: number;
  topReward: number;
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
  totalValidators: number;
  averageTasksPerValidator: number;
  averageReward: number;
  winnerAverageReward?: number;
  winnerMinerUid?: number;
  validatorAverageTopReward?: number;
  topReward: number;
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
  image?: string | null;
  success: boolean;
  reward: number;
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
  githubUrl?: string | null;
  github_url?: string | null;
  /** Reason for reward 0 when applicable (from agent run) */
  zeroReason?: string | null;
}

export interface BenchmarkPerformance {
  id: string;
  name: string;
  reward: number;
  provider?: string;
  imageUrl?: string;
}

// ===== VALIDATOR PERFORMANCE =====
export interface ValidatorPerformance {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  status: "active" | "inactive" | "offline";
  totalTasks: number;
  completedTasks: number;
  totalMiners: number;
  activeMiners: number;
  averageReward: number;
  topReward: number;
  weight: number;
  trust: number;
  version: number;
  stake: number;
  emission: number;
  lastSeen: string;
  uptime: number;
  topMiner?: MinerPerformance;
}

// ===== ROUND RECENT ACTIVITY =====
export interface RoundActivity {
  id: string;
  type:
    | "task_completed"
    | "miner_joined"
    | "miner_left"
    | "validator_joined"
    | "validator_left"
    | "round_started"
    | "round_ended";
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
  status: string; // active, finished, pending, evaluating_finished
  nextRound: number | null; // Número del siguiente round
  previousRound: number | null; // Número del round anterior
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
  status?: "active" | "finished" | "pending" | "evaluating_finished";
  sortBy?: "id" | "startTime" | "endTime" | "totalTasks" | "averageReward";
  sortOrder?: "asc" | "desc";
}

export interface RoundMinersQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "reward" | "score" | "duration" | "ranking" | "uid";
  sortOrder?: "asc" | "desc";
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

// ===== GET ROUND RESPONSE (with validators local and post-consensus) =====
export interface ValidatorMinerData {
  uid: number;
  name: string;
  hotkey: string | null;
  image: string | null;
  local_rank: number | null;
  local_avg_reward: number;
  local_avg_eval_score: number;
  local_avg_eval_time: number;
}

export interface ValidatorWinnerData {
  uid: number;
  name: string;
  image: string | null;
  hotkey: string | null;
}

export interface ValidatorRoundData {
  validator_uid: number;
  validator_name: string;
  validator_hotkey: string | null;
  local_avg_winner_reward: number;
  topReward: number;
  local_avg_eval_time: number;
  local_miners_evaluated: number;
  local_tasks_evaluated: number;
  miners: ValidatorMinerData[];
  winner?: ValidatorWinnerData;
}

export interface PostConsensusSummary {
  winner: {
    uid: number;
    name: string;
    image: string | null;
    hotkey: string | null;
    github_url?: string | null;
    avg_reward: number;
    avg_eval_score: number;
    avg_eval_time: number;
  } | null;
  miners_evaluated: number;
  tasks_evaluated: number;
}

export interface GetRoundResponse {
  success: boolean;
  data: {
    round_number: number;
    post_consensus_summary: PostConsensusSummary;
    validators: ValidatorRoundData[];
  };
}
