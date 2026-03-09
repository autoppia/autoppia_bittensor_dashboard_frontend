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
    currentRound?: RoundData;
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
    avg_eval_time: number | null;
    avg_eval_cost?: number | null;
  } | null;
  miners_evaluated: number;
  tasks_evaluated: number;
  leadership_rule?: {
    required_improvement_pct: number;
    reigning_uid: number | null;
    reigning_name: string | null;
    reigning_reward?: number | null;
    reigning_score: number | null;
    challenger_uid: number | null;
    challenger_name: string | null;
    challenger_reward?: number | null;
    challenger_score: number | null;
    dethroned: boolean;
    season_leader_uid: number | null;
  } | null;
}

export interface GetRoundResponse {
  success: boolean;
  data: {
    round_number: number;
    post_consensus_json: PostConsensusSummary;
    validators: ValidatorRoundData[];
  };
}

export interface RoundStatusView {
  round_id: number;
  round_key: string;
  season: number;
  round_in_season: number;
  status: "active" | "finished" | "pending" | "evaluating_finished";
  start_block: number;
  current_block: number;
  end_block: number;
  blocks_remaining: number;
  progress: number;
  started_at?: string | null;
  ended_at?: string | null;
  validators_count: number;
  tasks_total: number;
  completed_tasks: number;
  previous_round?: string | null;
  next_round?: string | null;
}

export interface SeasonRoundMinerSummary {
  uid: number;
  name: string;
  hotkey?: string | null;
  github_url?: string | null;
  image?: string | null;
  reward: number;
}

export interface RoundSeasonSummaryView {
  round_id: number;
  round_key: string;
  season: number;
  round_in_season: number;
  available: boolean;
  summary: {
    leader_before: SeasonRoundMinerSummary | null;
    candidate: SeasonRoundMinerSummary | null;
    leader_after: SeasonRoundMinerSummary | null;
    required_improvement_pct: number;
    required_reward_to_dethrone?: number | null;
    dethroned: boolean;
    validators_count: number;
    miners_evaluated: number;
    tasks_evaluated: number;
    tasks_success: number;
    avg_reward: number;
    avg_eval_score: number;
    avg_eval_time: number;
    avg_eval_cost?: number | null;
    post_consensus_json?: unknown;
  } | null;
}

export interface RoundValidatorCompetitionMiner {
  uid: number;
  name: string;
  hotkey?: string | null;
  github_url?: string | null;
  image?: string | null;
  competition_rank?: number | null;
  local_avg_reward?: number | null;
  local_avg_eval_score?: number | null;
  local_avg_eval_time?: number | null;
  local_avg_eval_cost?: number | null;
  best_local_reward: number;
  best_local_eval_score: number;
  best_local_eval_time: number;
  best_local_eval_cost?: number | null;
  is_reused: boolean;
}

export interface RoundValidatorView {
  validator_uid: number;
  validator_name: string;
  validator_hotkey?: string | null;
  validator_image?: string | null;
  version?: string;
  stake?: number;
  vtrust?: number;
  started_at?: string | null;
  finished_at?: string | null;
  tasks_total: number;
  competition_basis: "best_local";
  competition_state: {
    winner: RoundValidatorCompetitionMiner | null;
    top_reward: number;
    miners_participated: number;
    tasks_evaluated: number;
    miners: RoundValidatorCompetitionMiner[];
  };
  ipfs: {
    uploaded?: unknown;
    downloaded?: unknown;
  };
  consensus: {
    pre_consensus?: unknown;
    post_consensus?: unknown;
  };
}

export interface RoundValidatorsViewResponse {
  round_id: number;
  round_key: string;
  season: number;
  round_in_season: number;
  validators: RoundValidatorView[];
}
