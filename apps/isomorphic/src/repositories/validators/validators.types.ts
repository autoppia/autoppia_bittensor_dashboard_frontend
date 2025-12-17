/**
 * Validator Details API Types
 */

export interface ValidatorInfo {
  uid: number;
  hotkey: string | null;
  stake: number | null;
  weight: number | null;
  lastRoundEvaluated: number | null;
  image: string | null;
}

export interface GlobalStats {
  totalEvaluations: number;
  successCount: number;
  zeroCount: number;
  nullCount: number;
  failedCount: number;
  successPct: number;
  zeroPct: number;
  nullPct: number;
  failedPct: number;
}

export interface ContextInfo {
  lastRoundWinner: number | null;
  lastRoundWinnerReward: number | null;
  lastRoundWinnerWeight: number | null;
  lastRoundWinnerName: string | null;
  lastRoundWinnerImage: string | null;
  lastRoundWinnerHotkey: string | null;
}

export interface TaskStats {
  taskId: string;
  taskPrompt: string;
  totalEvaluations: number;
  successCount: number;
  zeroCount: number;
  nullCount: number;
  failedCount: number;
  successPct: number;
  zeroPct: number;
  nullPct: number;
  failedPct: number;
}

export interface UseCaseStats {
  useCaseName: string;
  useCaseId: string;
  totalEvaluations: number;
  successCount: number;
  zeroCount: number;
  nullCount: number;
  failedCount: number;
  successPct: number;
  zeroPct: number;
  nullPct: number;
  failedPct: number;
  tasks: TaskStats[];
}

export interface WebStats {
  webName: string;
  webId: string;
  totalEvaluations: number;
  successCount: number;
  zeroCount: number;
  nullCount: number;
  failedCount: number;
  successPct: number;
  zeroPct: number;
  nullPct: number;
  failedPct: number;
  useCases: UseCaseStats[];
}

export interface MinerData {
  uid: number;
  name: string | null;
  image: string | null;
  hotkey: string | null;
  score: number;
  reward: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface RoundDetails {
  minersParticipated: number;
  miners: MinerData[];
}

export interface ValidatorDetailsData {
  validator: ValidatorInfo;
  globalStats: GlobalStats;
  context: ContextInfo;
  webs: WebStats[];
  validatorImage: string | null;
  availableRounds: number[];
  roundDetails: RoundDetails;
}

export interface ValidatorDetailsResponse {
  success: boolean;
  data: ValidatorDetailsData;
}

