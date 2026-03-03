export type SubnetTimelineQueryParams = {
  rounds?: number;
  end_round?: number;
  seconds_back?: number;
  miners?: number;
};

export type ApiMinerRosterEntry = {
  miner_id: string;
  display_name: string;
  color_hex: string;
  avatar_url: string;
  order?: number;
};

export type ApiTimelineSnapshot = {
  miner_id: string;
  score: number;
  rank: number;
  rank_change?: number;
  score_change?: number;
  previous_rank?: number | null;
};

export type ApiTimelinePoint = {
  round: number;
  timestamp: string;
  snapshots: ApiTimelineSnapshot[];
};

export type SubnetTimelineMeta = {
  subnet_id: string;
  start_round: number;
  end_round: number;
  round_count: number;
  round_duration_seconds: number;
  generated_at: string;
  query: {
    rounds: number | null;
    end_round: number | null;
    seconds_back: number | null;
    miners: number | null;
  };
  inferred_round_count: number;
};

export type SubnetTimelineResponse = {
  subnet_id: string;
  roster: ApiMinerRosterEntry[];
  timeline: ApiTimelinePoint[];
  meta: SubnetTimelineMeta;
};
