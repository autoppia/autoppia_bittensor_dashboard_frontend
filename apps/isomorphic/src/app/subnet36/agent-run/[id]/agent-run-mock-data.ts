import type {
  AgentRunDetailData,
  AgentRunSummaryChartData,
  AgentRunWebsite,
  AgentRunResult,
} from "./agent-run-types";

function cloneWebsite(website: AgentRunWebsite): AgentRunWebsite {
  return {
    name: website.name,
    useCases: website.useCases.map((useCase) => ({
      id: useCase.id,
      name: useCase.name,
    })),
    results: website.results.map((result: AgentRunResult) => ({
      useCaseId: result.useCaseId,
      name: result.name,
      successRate: result.successRate,
      total: result.total,
      successCount: result.successCount,
      avgSolutionTime: result.avgSolutionTime,
    })),
    overall: { ...website.overall },
  };
}

const BASE_WEBSITES: AgentRunWebsite[] = [
  {
    name: "Autozone",
    useCases: [
      { id: "inventory_lookup", name: "INVENTORY_LOOKUP" },
      { id: "price_match", name: "PRICE_MATCH" },
      { id: "checkout_flow", name: "CHECKOUT_FLOW" },
    ],
    results: [
      {
        useCaseId: "inventory_lookup",
        name: "INVENTORY_LOOKUP",
        successRate: 93.4,
        total: 86,
        successCount: 80,
        avgSolutionTime: 11.2,
      },
      {
        useCaseId: "price_match",
        name: "PRICE_MATCH",
        successRate: 88.1,
        total: 74,
        successCount: 65,
        avgSolutionTime: 14.6,
      },
      {
        useCaseId: "checkout_flow",
        name: "CHECKOUT_FLOW",
        successRate: 91.2,
        total: 92,
        successCount: 84,
        avgSolutionTime: 18.4,
      },
    ],
    overall: {
      successRate: 90.9,
      total: 252,
      successCount: 229,
      avgSolutionTime: 14.7,
    },
  },
  {
    name: "Books & Co.",
    useCases: [
      { id: "find_title", name: "FIND_TITLE" },
      { id: "compare_reviews", name: "COMPARE_REVIEWS" },
      { id: "recommendations", name: "RECOMMENDATIONS" },
    ],
    results: [
      {
        useCaseId: "find_title",
        name: "FIND_TITLE",
        successRate: 89.6,
        total: 68,
        successCount: 61,
        avgSolutionTime: 9.8,
      },
      {
        useCaseId: "compare_reviews",
        name: "COMPARE_REVIEWS",
        successRate: 86.4,
        total: 72,
        successCount: 62,
        avgSolutionTime: 12.5,
      },
      {
        useCaseId: "recommendations",
        name: "RECOMMENDATIONS",
        successRate: 92.8,
        total: 80,
        successCount: 74,
        avgSolutionTime: 10.1,
      },
    ],
    overall: {
      successRate: 89.6,
      total: 220,
      successCount: 197,
      avgSolutionTime: 10.8,
    },
  },
  {
    name: "Cinema Club",
    useCases: [
      { id: "showtimes", name: "SHOWTIMES" },
      { id: "tickets", name: "TICKETS" },
      { id: "loyalty", name: "LOYALTY" },
    ],
    results: [
      {
        useCaseId: "showtimes",
        name: "SHOWTIMES",
        successRate: 95.1,
        total: 64,
        successCount: 61,
        avgSolutionTime: 7.5,
      },
      {
        useCaseId: "tickets",
        name: "TICKETS",
        successRate: 91.7,
        total: 70,
        successCount: 64,
        avgSolutionTime: 8.9,
      },
      {
        useCaseId: "loyalty",
        name: "LOYALTY",
        successRate: 87.3,
        total: 60,
        successCount: 52,
        avgSolutionTime: 9.6,
      },
    ],
    overall: {
      successRate: 91.4,
      total: 194,
      successCount: 177,
      avgSolutionTime: 8.7,
    },
  },
];

const BASE_DETAIL: AgentRunDetailData = {
  websites: BASE_WEBSITES,
};

const BASE_SUMMARY: AgentRunSummaryChartData = {
  usecases: [92.4, 88.1, 85.6, 90.2, 86.5, 83.4, 91.7, 87.2],
  total: 90.6,
};

export function getMockAgentRunDetailData(
  _agentId?: string
): AgentRunDetailData {
  return {
    websites: BASE_DETAIL.websites.map(cloneWebsite),
  };
}

export function getMockAgentRunSummaryData(
  _agentId?: string
): AgentRunSummaryChartData {
  return {
    usecases: [...BASE_SUMMARY.usecases],
    total: BASE_SUMMARY.total,
  };
}
