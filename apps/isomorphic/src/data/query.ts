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
  totalRequests: number; // Total requests received
  successes: number; // Number of successful requests
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
  books: [
    { id: 1, name: "Add Book" },
    { id: 2, name: "Add Comment Book" },
    { id: 3, name: "Book Detail" },
    { id: 4, name: "Contact Book" },
    { id: 5, name: "Delete Book" },
    { id: 6, name: "Edit Book" },
    { id: 7, name: "Edit User Book" },
    { id: 8, name: "Filter Book" },
    { id: 9, name: "Login Book" },
    { id: 10, name: "Logout Book" },
    { id: 11, name: "Purchase Book" },
    { id: 12, name: "Registration Book" },
  ],
  cinema: [
    { id: 1, name: "Add Comment" },
    { id: 2, name: "Add Film" },
    { id: 3, name: "Contact" },
    { id: 4, name: "Delete Film" },
    { id: 5, name: "Edit Film" },
    { id: 6, name: "Edit User" },
    { id: 7, name: "Film Detail" },
    { id: 8, name: "Filter Film" },
    { id: 9, name: "Login" },
    { id: 10, name: "Logout" },
    { id: 11, name: "Registration" },
    { id: 12, name: "Search Film" },
  ],
};

// Define the type for agent profiles
type AgentProfile = {
  [key: string]: number[];
};

const agentProfiles: Record<string, AgentProfile> = {
  "subnet36-top": {
    autozone: [75, 82, 88, 70, 85, 90, 78, 83, 92, 76, 87, 80],
    books: [80, 85, 91, 75, 88, 93, 82, 87, 95, 78, 90, 84],
    cinema: [77, 83, 89, 72, 86, 94, 79, 84, 96, 81, 88, 82],
  },
  "openai-cua": {
    autozone: [65, 78, 83, 71, 87, 89, 75, 80, 91, 73, 85, 79],
    books: [72, 84, 90, 68, 81, 92, 79, 86, 94, 76, 88, 82],
    cinema: [70, 77, 85, 74, 88, 90, 73, 82, 93, 78, 87, 80],
  },
  "browser-gpt-o3": {
    autozone: [81, 88, 92, 77, 90, 95, 84, 86, 98, 79, 91, 83],
    books: [85, 91, 96, 80, 93, 97, 87, 89, 99, 82, 94, 86],
    cinema: [83, 87, 94, 75, 89, 96, 80, 85, 95, 78, 92, 84],
  },
  "browser-sonnet4": {
    autozone: [70, 85, 89, 72, 86, 91, 77, 82, 93, 74, 88, 81],
    books: [75, 87, 92, 69, 83, 94, 80, 85, 96, 77, 89, 83],
    cinema: [73, 80, 87, 76, 90, 93, 78, 84, 95, 79, 91, 82],
  },
  "anthropic-cua": {
    autozone: [68, 80, 84, 73, 88, 90, 76, 81, 94, 75, 86, 78],
    books: [71, 83, 88, 70, 85, 91, 78, 87, 97, 74, 90, 80],
    cinema: [69, 79, 86, 75, 89, 92, 77, 83, 96, 76, 88, 81],
  },
};

// Function to generate unique results with distinct averages per agent
const generateUniqueResults = (id: string, webName: string): UseCaseScore[] => {
  console.log(`Processing agent ID: ${id} for website: ${webName}`);
  const baseScores =
    agentProfiles[id]?.[webName.toLowerCase()] ||
    agentProfiles["subnet36-top"][webName.toLowerCase()]; // Default to subnet36-top if ID not found

  if (!baseScores) {
    console.warn(
      `No profile found for agent ${id}, using subnet36-top as fallback`
    );
  }

  console.log(`Generating results for ${id} - ${webName}:`, baseScores);

  return baseScores.map((score: number, idx: number) => {
    const adjustedScore = Math.min(100, Math.max(0, score));
    const totalRequests = 50 + idx * 10; // Vary totalRequests from 50 to 170 (e.g., 50, 60, 70, ..., 170)
    const successes = Math.round((adjustedScore / 100) * totalRequests); // Adjust successes based on varied requests
    return {
      useCaseId: idx + 1,
      score: adjustedScore,
      totalRequests,
      successes,
    };
  });
};

export function getAgentExtendedData(id: string): AgentExtended {
  const agentSummary = agentsData.find((agent) => agent.id === id) || {
    successRate: 50,
  };

  console.log(
    `Fetching data for agent ID: ${id}, successRate: ${agentSummary.successRate}`
  );

  const websites: WebData[] = [
    {
      name: "Autozone",
      useCases: useCaseCatalogues.autozone,
      results: generateUniqueResults(id, "Autozone"),
    },
    {
      name: "Books",
      useCases: useCaseCatalogues.books,
      results: generateUniqueResults(id, "Books"),
    },
    {
      name: "Cinema",
      useCases: useCaseCatalogues.cinema,
      results: generateUniqueResults(id, "Cinema"),
    },
  ];

  return {
    id,
    successRate: agentSummary.successRate,
    websites,
  };
}
