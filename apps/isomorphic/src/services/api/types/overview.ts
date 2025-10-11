/**
 * TypeScript interfaces for Overview API endpoints
 * These types define the structure of data returned by the backend API
 */

// ===== OVERVIEW METRICS =====
export interface OverviewMetrics {
  topScore: number;
  totalWebsites: number;
  totalValidators: number;
  totalMiners: number;
  currentRound: number;
  subnetVersion: string;
  lastUpdated: string;
}

// ===== VALIDATOR DATA =====
export interface ValidatorData {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  currentTask: string;
  status: 'Sending Tasks' | 'Evaluating' | 'Waiting' | 'Offline';
  totalTasks: number;
  weight: number;
  trust: number;
  version: number;
  lastSeen: string;
  uptime: number; // percentage
  stake: number;
  emission: number;
}

// ===== ROUND DATA =====
export interface RoundData {
  id: number;
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
}

// ===== LEADERBOARD DATA =====
export interface LeaderboardData {
  round: number;
  subnet36: number;
  openai_cua: number;
  anthropic_cua: number;
  browser_use: number;
  timestamp: string;
}

// ===== MINER PERFORMANCE DATA =====
export interface MinerPerformanceData {
  round: number;
  score: number;
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
  data: {
    metrics: OverviewMetrics;
  };
}

export interface ValidatorsResponse {
  data: {
    validators: ValidatorData[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RoundsResponse {
  rounds: RoundData[];
  currentRound: RoundData;
  total: number;
}

export interface LeaderboardResponse {
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
  statistics: SubnetStatistics;
}

// ===== QUERY PARAMETERS =====
export interface ValidatorsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: 'weight' | 'trust' | 'totalTasks' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface LeaderboardQueryParams {
  timeRange?: '7D' | '15D' | '30D' | 'all';
  limit?: number;
  offset?: number;
}

export interface RoundsQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'pending';
  includeCurrent?: boolean;
}
