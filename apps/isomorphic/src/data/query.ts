import { agentsData } from "./agents-data";
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

export type AgentExtended = {
  id: string;
  successRate: number;
  websites: WebData[];
};

export const getLeaderboardData = () =>
  [...agentsData].sort((a, b) => b.successRate - a.successRate);

export const getAgentById = (id: string) =>
  agentsData.find((a) => a.id === id) ?? null;

export function getAgentSummaryData(id: string) {
  const agent = getAgentExtendedData(id);
  const usecases = Array.from({ length: 12 }, (_, i) => {
    const useCaseId = i + 1;
    const scores = agent.websites
      .map(
        (web) =>
          web.results.find((r) => r.useCaseId === useCaseId)?.successRate || 0
      )
      .filter((score) => score > 0);
    return scores.length
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
  });

  return {
    usecases,
    total: agent.successRate,
  };
}

export function fetchAgentData(id: string) {
  const agentKey = id === "subnet36-top" ? "AutoppiaAgent" : id;
  return sampleData.agents[agentKey] || null;
}

export function getAgentExtendedData(id: string): AgentExtended {
  const agentSummary = agentsData.find((agent) => agent.id === id) || {
    successRate: 50,
  };

  const agentData = fetchAgentData(id);

  if (!agentData) {
    return {
      id,
      successRate: agentSummary.successRate,
      websites: [],
    };
  }

  const websites: WebData[] = [
    {
      name: "Autozone",
      useCases: useCaseCatalogues.autozone,
      results: Object.entries(
        agentData[id === "subnet36-top" ? "Autoppia AutoZone" : "Autozone"]
          .use_cases
      ).map(([name, data], idx) => ({
        useCaseId: idx + 1,
        name,
        successCount: data.success_count,
        total: data.total,
        successRate: data.success_rate * 100,
        avgSolutionTime: data.avg_solution_time,
      })),
      overall: {
        successCount:
          agentData[id === "subnet36-top" ? "Autoppia AutoZone" : "Autozone"]
            .overall.success_count,
        total:
          agentData[id === "subnet36-top" ? "Autoppia AutoZone" : "Autozone"]
            .overall.total,
        successRate:
          agentData[id === "subnet36-top" ? "Autoppia AutoZone" : "Autozone"]
            .overall.success_rate * 100,
        avgSolutionTime:
          agentData[id === "subnet36-top" ? "Autoppia AutoZone" : "Autozone"]
            .overall.avg_solution_time,
      },
    },
    {
      name: "Books",
      useCases: useCaseCatalogues.books,
      results: Object.entries(agentData.Books.use_cases).map(
        ([name, data], idx) => ({
          useCaseId: idx + 1,
          name,
          successCount: data.success_count,
          total: data.total,
          successRate: data.success_rate * 100,
          avgSolutionTime: data.avg_solution_time,
        })
      ),
      overall: {
        successCount: agentData.Books.overall.success_count,
        total: agentData.Books.overall.total,
        successRate: agentData.Books.overall.success_rate * 100,
        avgSolutionTime: agentData.Books.overall.avg_solution_time,
      },
    },
    {
      name: "Cinema",
      useCases: useCaseCatalogues.cinema,
      results: Object.entries(agentData.Cinema.use_cases).map(
        ([name, data], idx) => ({
          useCaseId: idx + 1,
          name,
          successCount: data.success_count,
          total: data.total,
          successRate: data.success_rate * 100,
          avgSolutionTime: data.avg_solution_time,
        })
      ),
      overall: {
        successCount: agentData.Cinema.overall.success_count,
        total: agentData.Cinema.overall.total,
        successRate: agentData.Cinema.overall.success_rate * 100,
        avgSolutionTime: agentData.Cinema.overall.avg_solution_time,
      },
    },
  ];

  return {
    id,
    successRate: agentSummary.successRate,
    websites,
  };
}