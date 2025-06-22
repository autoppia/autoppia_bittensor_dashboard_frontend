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
export const getAgentDetailsData = (id: string) => {
  const agent = getAgentById(id);
  if (!agent) return null;
  return [
    { name: "Use case 1", value: agent.usecase1 },
    { name: "Use case 2", value: agent.usecase2 },
    { name: "Use case 3", value: agent.usecase3 },
  ];
};
