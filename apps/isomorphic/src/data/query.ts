/* src/data/query.ts */

import { agentsData } from "./agents-data";

/* ─────────────────────────────────────────────────────────────── */
/*  1. leaderboard → ordena por successRate (ya en agentsData)      */
/* ─────────────────────────────────────────────────────────────── */
export const getLeaderboardData = () =>
  [...agentsData].sort((a, b) => b.successRate - a.successRate);

/* ─────────────────────────────────────────────────────────────── */
/*  2. utilidades por agente                                        */
/* ─────────────────────────────────────────────────────────────── */
export const getAgentById = (id: string) =>
  agentsData.find((a) => a.id === id) ?? null;

/*
 * Devuelve porcentaje de cada use‑case respecto al total del agente.
 * Mantiene el nombre original usado en las páginas (<AgentPage/>)
 * para evitar romper imports: getAgentSummaryData(id)
 */
export const getAgentSummaryData = (id: string) => {
  const agent = getAgentById(id);
  if (!agent) return null;

  const total = agent.usecase1 + agent.usecase2 + agent.usecase3;
  if (total === 0) return { usecase1: 0, usecase2: 0, usecase3: 0, total: 0 };

  const pct = (v: number) => parseFloat(((100 * v) / total).toFixed(1));

  return {
    usecase1: pct(agent.usecase1),
    usecase2: pct(agent.usecase2),
    usecase3: pct(agent.usecase3),
    total: 100,
  };
};

/*
 * Devuelve valores absolutos para un breakdown sencillo.
 * Si tu UI no lo usa puedes omitirlo, pero lo exporto por si acaso.
 */
type UseCase = { id: number; name: string };
type UseCaseScore = { useCaseId: number; score: number };

type WebData = {
  name: string;
  useCases: UseCase[];
  results: UseCaseScore[];
};

type AgentExtended = {
  id: string;
  successRate: number;
  websites: WebData[];
};

export const getAgentExtendedData = (id: string): AgentExtended | null => {
  // Hard-coded data for demonstration
  const useCases: UseCase[] = [
    { id: 1, name: "Easy" },
    { id: 2, name: "Medium" },
    { id: 3, name: "Hard" },
  ];

  const hardCodedData: AgentExtended = {
    id,
    successRate: 85, // Example global success rate
    websites: [
      {
        name: "web1",
        useCases,
        results: [
          { useCaseId: 1, score: 90 }, // Easy
          { useCaseId: 2, score: 75 }, // Medium
          { useCaseId: 3, score: 60 }, // Hard
        ],
      },
      {
        name: "Web2",
        useCases,
        results: [
          { useCaseId: 1, score: 85 },
          { useCaseId: 2, score: 70 },
          { useCaseId: 3, score: 55 },
        ],
      },
      {
        name: "Web3",
        useCases,
        results: [
          { useCaseId: 1, score: 95 },
          { useCaseId: 2, score: 80 },
          { useCaseId: 3, score: 65 },
        ],
      },
    ],
  };

  // Simulate "agent not found" for invalid IDs
  if (!id || id === "invalid") {
    return null;
  }

  return hardCodedData;
};

// Transform data for the chart
export const getAgentDetailsData = (id: string) => {
  const agent = getAgentExtendedData(id);
  if (!agent) return [];

  return agent.websites.map((website) => ({
    website: website.name,
    easy: website.results.find((r) => r.useCaseId === 1)?.score ?? 0,
    medium: website.results.find((r) => r.useCaseId === 2)?.score ?? 0,
    hard: website.results.find((r) => r.useCaseId === 3)?.score ?? 0,
  }));
};
