export type RunAgentBenchmarkPayload = {
  ip: string;
  port: number;
  projects: string[];
  num_use_cases: number;
  use_cases: string[];
  runs: number;
  timeout?: number;
  should_record_gif?: boolean;
};

export type RunAgentBenchmarkResponse = Record<string, unknown>;
