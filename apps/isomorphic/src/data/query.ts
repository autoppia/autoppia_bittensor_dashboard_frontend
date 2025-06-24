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
// export const getAgentSummaryData = (id: string) => {
//   const agent = getAgentById(id);
//   if (!agent) return null;

//   const total = agent.usecase1 + agent.usecase2 + agent.usecase3;
//   if (total === 0) return { usecase1: 0, usecase2: 0, usecase3: 0, total: 0 };

//   const pct = (v: number) => parseFloat(((100 * v) / total).toFixed(1));

//   return {
//     usecase1: pct(agent.usecase1),
//     usecase2: pct(agent.usecase2),
//     usecase3: pct(agent.usecase3),
//     total: 100,
//   };
// };

/*
 * Devuelve valores absolutos para un breakdown sencillo.
 * Si tu UI no lo usa puedes omitirlo, pero lo exporto por si acaso.
 */
export const getAgentDetailsData = (id: string) => {
  const agent = getAgentById(id);
  if (!agent) return null;
  return [
    { name: "Use case 1", value: agent.usecase1 },
    { name: "Use case 2", value: agent.usecase2 },
    { name: "Use case 3", value: agent.usecase3 },
  ];
};

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

const useCaseCatalogues = {
  autozone: [
    { id: 1, name: "Scroll Carousel" },
    { id: 2, name: "Search Product" },
    { id: 3, name: "View Detail" },
    { id: 4, name: "Add to Cart" },
    { id: 5, name: "Checkout Started" },
    { id: 6, name: "View Cart" },
    { id: 7, name: "Quantity Changed" },
    { id: 8, name: "Proceed to Checkout" },
    { id: 9, name: "Order Completed" },
    { id: 10, name: "Filter Products" },
    { id: 11, name: "View Promotions" },
    { id: 12, name: "Apply Coupon" },
  ],
  autodining: [
    { id: 1, name: "Search Restaurant" },
    { id: 2, name: "Time Dropdown Opened" },
    { id: 3, name: "Date Dropdown Opened" },
    { id: 4, name: "People Dropdown Opened" },
    { id: 5, name: "Scroll View" },
    { id: 6, name: "View Restaurant" },
    { id: 7, name: "Book Restaurant" },
    { id: 8, name: "Country Selected" },
    { id: 9, name: "Occasion Selected" },
    { id: 10, name: "Reservation Complete" },
    { id: 11, name: "View Full Menu" },
    { id: 12, name: "Collapse Menu" },
  ],
  autocrm: [
    { id: 1, name: "Dashboard Sidebar Clicked" },
    { id: 2, name: "Matters Sidebar Clicked" },
    { id: 3, name: "Clients Sidebar Clicked" },
    { id: 4, name: "Documents Sidebar Clicked" },
    { id: 5, name: "Calendar Sidebar Clicked" },
    { id: 6, name: "Time and Billing Sidebar Clicked" },
    { id: 7, name: "Settings Sidebar Clicked" },
    { id: 8, name: "Add New Matter" },
    { id: 9, name: "Delete Matter" },
    { id: 10, name: "Archive Matter" },
    { id: 11, name: "View Matter Details" },
    { id: 12, name: "Search Client" },
  ],
};

export function getAgentExtendedData(id: string): AgentExtended {
  const agentSummary = agentsData.find((agent) => agent.id === id) || {
    successRate: 50,
  };

  const websites: WebData[] = [
    {
      name: "Autozone",
      useCases: useCaseCatalogues.autozone,
      results: [
        { useCaseId: 1, score: 85 },
        { useCaseId: 2, score: 90 },
        { useCaseId: 3, score: 78 },
        { useCaseId: 4, score: 82 },
        { useCaseId: 5, score: 75 },
        { useCaseId: 6, score: 88 },
        { useCaseId: 7, score: 80 },
        { useCaseId: 8, score: 83 },
        { useCaseId: 9, score: 70 },
        { useCaseId: 10, score: 87 },
        { useCaseId: 11, score: 92 },
        { useCaseId: 12, score: 79 },
      ],
    },
    {
      name: "Autodining",
      useCases: useCaseCatalogues.autodining,
      results: [
        { useCaseId: 1, score: 88 },
        { useCaseId: 2, score: 76 },
        { useCaseId: 3, score: 82 },
        { useCaseId: 4, score: 79 },
        { useCaseId: 5, score: 85 },
        { useCaseId: 6, score: 90 },
        { useCaseId: 7, score: 73 },
        { useCaseId: 8, score: 81 },
        { useCaseId: 9, score: 77 },
        { useCaseId: 10, score: 84 },
        { useCaseId: 11, score: 89 },
        { useCaseId: 12, score: 80 },
      ],
    },
    {
      name: "Autocrm",
      useCases: useCaseCatalogues.autocrm,
      results: [
        { useCaseId: 1, score: 83 },
        { useCaseId: 2, score: 79 },
        { useCaseId: 3, score: 86 },
        { useCaseId: 4, score: 81 },
        { useCaseId: 5, score: 77 },
        { useCaseId: 6, score: 84 },
        { useCaseId: 7, score: 80 },
        { useCaseId: 8, score: 88 },
        { useCaseId: 9, score: 74 },
        { useCaseId: 10, score: 82 },
        { useCaseId: 11, score: 90 },
        { useCaseId: 12, score: 85 },
      ],
    },
  ];

  return {
    id,
    successRate: agentSummary.successRate,
    websites,
  };
}

export function getAgentSummaryData(id: string) {
  const agent = getAgentExtendedData(id);
  const usecases = Array.from({ length: 10 }, (_, i) => {
    const useCaseId = i + 1;
    const scores = agent.websites
      .map(
        (web) => web.results.find((r) => r.useCaseId === useCaseId)?.score || 0
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
