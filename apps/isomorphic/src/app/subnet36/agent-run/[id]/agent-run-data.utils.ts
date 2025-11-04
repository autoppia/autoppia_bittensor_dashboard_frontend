import { getAgentExtendedData, getAgentSummaryData } from "@/data/query";
import type {
  AgentRunDetailData,
  AgentRunWebsite,
  AgentRunSummaryChartData,
  AgentRunResult,
} from "./agent-run-types";
import type {
  AgentRunStats,
  AgentRunSummary,
} from "@/services/api/types/agent-runs";
import {
  getMockAgentRunDetailData,
  getMockAgentRunSummaryData,
} from "./agent-run-mock-data";

function normalizeLabel(label: string) {
  return label.toLowerCase().replace(/[\s:_-]+/g, "");
}

function cloneWebsite(website: AgentRunWebsite): AgentRunWebsite {
  return {
    name: website.name,
    useCases: website.useCases.map((useCase) => ({
      id: useCase.id,
      name: useCase.name,
    })),
    results: website.results.map((result) => ({
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

export function getFallbackDetailData(agentId?: string): AgentRunDetailData {
  const mock = getMockAgentRunDetailData(agentId);
  if (mock.websites.length) {
    return mock;
  }

  try {
    return getAgentExtendedData(agentId ?? "openai-cua");
  } catch {
    return { websites: [] };
  }
}

export function getFallbackSummaryData(
  agentId?: string
): AgentRunSummaryChartData {
  const mock = getMockAgentRunSummaryData(agentId);
  if (mock.usecases.length) {
    return mock;
  }

  try {
    return (
      getAgentSummaryData(agentId ?? "openai-cua") ?? {
        usecases: [],
        total: 0,
      }
    );
  } catch {
    return {
      usecases: [],
      total: 0,
    };
  }
}

function buildResultsFromStats(
  useCaseStats: AgentRunStats["performanceByUseCase"] | undefined
): AgentRunResult[] {
  if (!useCaseStats || !useCaseStats.length) {
    return [];
  }

  return useCaseStats.map((entry, index) => ({
    useCaseId: entry.useCase ?? `use-case-${index}`,
    name: entry.useCase ?? `Use Case ${index + 1}`,
    successRate:
      typeof entry.averageScore === "number" ? entry.averageScore : 0,
    total: entry.tasks ?? 0,
    successCount: entry.successful ?? 0,
    avgSolutionTime: entry.averageDuration ?? 0,
  }));
}

export function transformStatsToDetailData(
  stats: AgentRunStats | null | undefined,
  fallback: AgentRunDetailData
): { data: AgentRunDetailData; isMock: boolean } {
  if (!stats) {
    return {
      data: {
        websites: fallback.websites.map(cloneWebsite),
      },
      isMock: true,
    };
  }

  const fallbackByName = new Map(
    fallback.websites.map((site) => [site.name.toLowerCase(), cloneWebsite(site)])
  );
  const fallbackWebsites = fallback.websites.map(cloneWebsite);
  const useCaseStats = stats.performanceByUseCase ?? [];

  const websites = (stats.performanceByWebsite ?? []).map((site, index) => {
    const fallbackMatch =
      (site.website &&
        fallbackByName.get(site.website.toLowerCase())) ??
      fallbackWebsites[index];

    const fallbackResults = (fallbackMatch?.results ?? []).map((result) => ({
      ...result,
    }));
    const fallbackUseCases = (fallbackMatch?.useCases ?? []).map((useCase) => ({
      ...useCase,
    }));

    const fallbackResultLookup = new Map(
      fallbackResults.map((result) => [
        normalizeLabel(result.name),
        result,
      ])
    );

    const fallbackUseCaseLookup = new Map(
      fallbackUseCases.map((useCase) => [
        normalizeLabel(useCase.name),
        useCase,
      ])
    );

    const siteUseCases = site.useCases ?? [];

    const computedUseCases = siteUseCases.length
      ? siteUseCases.map((entry, idx) => {
          const normalized = normalizeLabel(
            entry.useCase ?? `use-case-${idx}`
          );
          const fallbackUseCase = fallbackUseCaseLookup.get(normalized);
          return {
            id:
              fallbackUseCase?.id ??
              entry.useCase ??
              `use-case-${idx}`,
            name:
              fallbackUseCase?.name ??
              entry.useCase ??
              `Use Case ${idx + 1}`,
          };
        })
      : fallbackUseCases.map((useCase) => ({ ...useCase }));

    let results: AgentRunResult[] = [];

    if (siteUseCases.length) {
      results = siteUseCases.map((entry, idx) => {
        const normalized = normalizeLabel(
          entry.useCase ?? `use-case-${idx}`
        );
        const fallbackResult = fallbackResultLookup.get(normalized);
        const meta =
          computedUseCases[idx] ?? {
            id: entry.useCase ?? `use-case-${idx}`,
            name: entry.useCase ?? `Use Case ${idx + 1}`,
          };

        return {
          useCaseId: meta.id,
          name: meta.name,
          successRate:
            typeof entry.averageScore === "number"
              ? entry.averageScore
              : fallbackResult?.successRate ?? 0,
          total: entry.tasks ?? fallbackResult?.total ?? 0,
          successCount:
            entry.successful ?? fallbackResult?.successCount ?? 0,
          avgSolutionTime:
            typeof entry.averageDuration === "number"
              ? entry.averageDuration
              : fallbackResult?.avgSolutionTime ?? 0,
        };
      });
    } else if (fallbackResults.length) {
      const statsLookup = new Map(
        useCaseStats.map((entry) => [
          normalizeLabel(
            entry.useCase ??
              `use-case-${entry.tasks}-${entry.successful}`
          ),
          entry,
        ])
      );

      results = fallbackResults.map((result) => {
        const matched =
          statsLookup.get(normalizeLabel(result.name)) ?? null;

        if (!matched) {
          return { ...result };
        }

        return {
          ...result,
          successRate:
            typeof matched.averageScore === "number"
              ? matched.averageScore
              : result.successRate,
          total: matched.tasks ?? result.total,
          successCount:
            matched.successful ?? result.successCount,
          avgSolutionTime:
            typeof matched.averageDuration === "number"
              ? matched.averageDuration
              : result.avgSolutionTime,
        };
      });
    } else {
      results = buildResultsFromStats(useCaseStats);
    }

    return {
      name: site.website || fallbackMatch?.name || `Website ${index + 1}`,
      useCases: computedUseCases,
      results,
      overall: {
        successRate:
          typeof site.averageScore === "number"
            ? site.averageScore
            : fallbackMatch?.overall.successRate ?? 0,
        total: site.tasks ?? fallbackMatch?.overall.total ?? 0,
        successCount: site.successful ?? fallbackMatch?.overall.successCount ?? 0,
        avgSolutionTime:
          typeof site.averageDuration === "number"
            ? site.averageDuration
            : fallbackMatch?.overall.avgSolutionTime ?? 0,
      },
    };
  });

  const hasWebsites = websites.length > 0;

  return {
    data: {
      websites: hasWebsites ? websites : fallbackWebsites,
    },
    isMock: !hasWebsites,
  };
}

export function buildSummaryChartData(
  summary: AgentRunSummary | null | undefined,
  detailData: AgentRunDetailData,
  fallbackSummary: AgentRunSummaryChartData
): AgentRunSummaryChartData {
  const useCaseAggregation = new Map<
    string,
    { total: number; count: number }
  >();

  detailData.websites.forEach((website) => {
    website.results.forEach((result) => {
      const key = normalizeLabel(result.name);
      const current = useCaseAggregation.get(key) ?? { total: 0, count: 0 };
      useCaseAggregation.set(key, {
        total: current.total + result.successRate,
        count: current.count + 1,
      });
    });
  });

  const aggregatedUsecases = Array.from(useCaseAggregation.values()).map(
    (entry) => (entry.count ? entry.total / entry.count : 0)
  );

  const computedTotal =
    summary && summary.totalTasks
      ? (summary.successfulTasks / summary.totalTasks) * 100
      : summary?.overallScore ?? fallbackSummary.total;

  return {
    usecases: aggregatedUsecases.length
      ? aggregatedUsecases
      : fallbackSummary.usecases,
    total: typeof computedTotal === "number" ? computedTotal : fallbackSummary.total,
  };
}
