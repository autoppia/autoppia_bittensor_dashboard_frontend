export type UseCase = {
  id: number;
  name: string;
};

export type UseCaseScore = {
  useCaseId: number;
  score: number; // 0-100
};

export type WebData = {
  name: string;
  useCases: UseCase[];
  results: UseCaseScore[];
};

export type AgentExtended = {
  id: string;
  successRate: number;
  websites: WebData[];
};
