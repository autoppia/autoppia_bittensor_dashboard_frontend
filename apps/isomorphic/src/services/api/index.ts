/**
 * API Services Index
 * Central export point for all API services and types
 */

// Base client
export { apiClient, ApiClient } from './client';
export type { ApiResponse, ApiError } from './client';

// Overview service
export { overviewService, OverviewService } from './overview.service';

// Rounds service
export { roundsService, RoundsService } from './rounds.service';

// Types
export type {
  // Overview types
  OverviewMetrics,
  ValidatorData,
  OverviewRoundData,
  LeaderboardData,
  SubnetStatistics,
  OverviewMetricsResponse,
  ValidatorsResponse,
  ValidatorFilterResponse,
  RoundsResponse,
  LeaderboardResponse,
  SubnetStatisticsResponse,
  ValidatorsQueryParams,
  LeaderboardQueryParams,
  RoundsQueryParams,
  ValidatorFilterItem,
} from './types/overview';

// Rounds types
export type {
  RoundData,
  RoundStatistics,
  MinerPerformance,
  ValidatorPerformance,
  RoundActivity,
  RoundProgress,
  RoundsListResponse,
  RoundDetailsResponse,
  RoundStatisticsResponse,
  RoundMinersResponse,
  RoundValidatorsResponse,
  RoundActivityResponse,
  RoundProgressResponse,
  RoundsListQueryParams,
  RoundMinersQueryParams,
  RoundActivityQueryParams,
} from './types/rounds';

// Re-export all services for easy access
export const services = {
  overview: overviewService,
  rounds: roundsService,
} as const;
