export interface AgentRunUseCase {
  id: string | number;
  name: string;
}

export interface AgentRunResult {
  useCaseId: string | number;
  name: string;
  successRate: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
}

export interface AgentRunWebsite {
  name: string;
  useCases: AgentRunUseCase[];
  results: AgentRunResult[];
  overall: {
    successRate: number;
    total: number;
    successCount: number;
    avgSolutionTime: number;
  };
}

export interface AgentRunDetailData {
  websites: AgentRunWebsite[];
}

export interface AgentRunSummaryChartData {
  usecases: number[];
  total: number;
}
