/**
 * TypeScript interfaces for Overview API endpoints
 * These types define the structure of data returned by the backend API
 */

// ===== OVERVIEW METRICS =====
export interface MinerSummary {
  uid: number;
  name?: string | null;
}

export interface OverviewLeader {
  minerUid?: number | null;
  minerHotkey?: string | null;
  minerImage?: string | null;
  minerGithubUrl?: string | null;
  minerName?: string | null;
  reward: number;
  cost?: number | null;
  score?: number | null;
  time?: number | null;
  validators: number;
  totalWebsitesEvaluated: number;
  tasksReceived: number;
  tasksSuccess: number;
}

export interface OverviewMetrics {
  leader?: OverviewLeader | null;
  /** Last FINISHED round's season number — used for metric cards and label */
  season?: number | null;
  /** Last FINISHED round's round number — used for metric cards and label */
  round?: number | null;
  /** Currently active round's season number */
  currentSeason?: number | null;
  /** Currently active round's round number */
  currentRound?: number | null;
  totalMiners: number;
  tasksPerValidator?: number | null;
  minerList?: MinerSummary[] | null;
  subnetVersion: string;
  lastUpdated: string;
}

// ===== VALIDATOR DATA =====
export interface ValidatorData {
  id: string;
  validatorUid?: number | null;
  name: string | null;
  hotkey: string | null;
  icon: string;
  currentTask: string;
  currentWebsite?: string | null;
  currentUseCase?: string | null;
  status:
    | "Sending Tasks"
    | "Evaluating"
    | "Waiting"
    | "Offline"
    | "Finished"
    | "Starting"
    | "Not Started";
  totalTasks: number;
  weight: number | null;
  trust: number | null;
  version: number | null;
  lastSeen: string;
  uptime: number; // percentage
  stake: number | null;
  emission: number | null;
  validatorRoundId?: string | null;
  roundNumber?: number | null;
  lastSeenSeason?: number | null;
  lastSeenRoundInSeason?: number | null;
}

export interface ValidatorFilterItem {
  id: string;
  name: string;
  hotkey?: string | null;
  icon?: string | null;
  status?: string | null;
}

// ===== ROUND DATA =====
export interface OverviewRoundData {
  id: number;
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
}

// ===== LEADERBOARD DATA =====
export interface LeaderboardData {
  round: number;
  season?: number | null; // season_number from backend
  subnet36: number; // Compatibility mirror of post_consensus_reward
  post_consensus_reward: number; // post_consensus_avg_reward
  reward: number; // post_consensus_avg_reward
  winnerUid?: number | null;
  winnerName?: string | null;
  openai_cua?: number | null;
  anthropic_cua?: number | null;
  browser_use?: number | null;
  timestamp: string;
  post_consensus_eval_score?: number | null; // post_consensus_avg_eval_score
  post_consensus_eval_time?: number | null; // post_consensus_avg_eval_time
  time?: number | null; // post_consensus_avg_eval_time (alias)
}

// ===== MINER PERFORMANCE DATA =====
export interface MinerPerformanceData {
  round: number;
  reward: number;
  rank: number;
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  timestamp: string;
}

// ===== SUBNET STATISTICS =====
export interface SubnetStatistics {
  totalStake: number;
  totalEmission: number;
  averageTrust: number;
  networkUptime: number;
  activeValidators: number;
  registeredMiners: number;
  totalTasksCompleted: number;
  averageTaskScore: number;
  lastUpdated: string;
}

// ===== API RESPONSE TYPES =====
export interface OverviewMetricsResponse {
  success: boolean;
  data: {
    metrics: OverviewMetrics;
  };
}

export interface ValidatorsResponse {
  success: boolean;
  data: {
    validators: ValidatorData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ValidatorFilterResponse {
  success: boolean;
  data: {
    validators: ValidatorFilterItem[];
  };
}

export interface RoundsResponse {
  success: boolean;
  data: {
    rounds: OverviewRoundData[];
    currentRound?: OverviewRoundData;
    total: number;
    page: number;
    limit: number;
  };
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardData[];
    total: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

export interface SubnetStatisticsResponse {
  success: boolean;
  data: {
    statistics: SubnetStatistics;
  };
}

export interface NetworkStatusData {
  status: "healthy" | "degraded" | "down" | string;
  message: string;
  lastChecked: string;
  activeValidators: number;
  networkLatency: number;
  season?: number | null;
  round?: number | null;
}

// ===== QUERY PARAMETERS =====
export interface ValidatorsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: "weight" | "trust" | "totalTasks" | "name" | "stake";
  sortOrder?: "asc" | "desc";
}

export interface LeaderboardQueryParams {
  timeRange?: "7R" | "15R" | "30R" | "all";
  limit?: number;
  offset?: number;
  season?: number | null;
}

export interface RoundsQueryParams {
  page?: number;
  limit?: number;
  status?: "active" | "finished" | "pending" | "evaluating_finished";
  includeCurrent?: boolean;
}
