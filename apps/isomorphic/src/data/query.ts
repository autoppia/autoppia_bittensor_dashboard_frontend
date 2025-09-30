import { sampleData, useCaseCatalogues } from "./sample-data";

export type UseCase = {
  id: number;
  name: string;
};

export type UseCaseScore = {
  useCaseId: number;
  name: string;
  successCount: number;
  total: number;
  successRate: number;
  avgSolutionTime: number;
};

export type WebData = {
  name: string;
  useCases: UseCase[];
  results: UseCaseScore[];
  overall: {
    successCount: number;
    total: number;
    successRate: number;
    avgSolutionTime: number;
  };
};

export function fetchAgentData(id: string) {
  const agentKey = id === "subnet36-top" ? "AutoppiaAgent" : id;
  return sampleData.agents[agentKey] || null;
}