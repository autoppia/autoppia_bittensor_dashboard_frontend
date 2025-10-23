"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRounds } from "@/services/hooks/useRounds";
import { useMinersList } from "@/services/hooks/useAgents";
import type { MinimalAgentsListQueryParams } from "@/services/api/types/agents";
import { routes } from "@/config/routes";
import {
  AgentHeaderPlaceholder,
  AgentScoreAnalyticsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentStatsPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";

function AgentsPageFallback() {
  return (
    <div className="space-y-6">
      <AgentHeaderPlaceholder />
      <AgentStatsPlaceholder />
      <div className="flex flex-col xl:flex-row items-stretch gap-6">
        <AgentScoreChartPlaceholder className="w-full xl:w-[calc(100%-320px)]" />
        <AgentScoreAnalyticsPlaceholder className="w-full xl:w-[320px]" />
      </div>
      <AgentValidatorsPlaceholder />
    </div>
  );
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const extractRoundNumber = (round: any): number | undefined => {
  if (!round || typeof round !== "object") {
    return undefined;
  }
  const candidate =
    round.roundNumber ??
    round.round ??
    round.id ??
    round.roundId ??
    round.round_id ??
    round.validatorRoundId ??
    round.validator_round_id;

  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }
  if (typeof candidate === "string") {
    const parsed = Number.parseInt(candidate, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

function AgentsLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const agentParam = searchParams.get("agent");
  const roundParam = searchParams.get("round");

  const roundFromQuery = useMemo(() => {
    if (!roundParam) {
      return undefined;
    }
    const parsed = Number.parseInt(roundParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [roundParam]);

  const { data: roundsData } = useRounds({
    limit: 50,
    sortBy: "roundNumber",
    sortOrder: "desc",
  });

  const availableRounds = useMemo(() => {
    const rounds = roundsData?.data?.rounds ?? [];
    if (!rounds.length) {
      return [];
    }
    const completed = rounds
      .filter((round) => {
        const validatorCount =
          (round as any).validatorRoundCount ??
          (round as any).validator_round_count ??
          0;
        return round.status === "completed" && validatorCount > 0;
      })
      .sort(
        (a, b) =>
          (extractRoundNumber(b) ?? 0) - (extractRoundNumber(a) ?? 0)
      );
    if (completed.length) {
      return completed;
    }
    return rounds.sort(
      (a, b) =>
        (extractRoundNumber(b) ?? 0) - (extractRoundNumber(a) ?? 0)
    );
  }, [roundsData]);

  const roundSequence = useMemo(() => {
    const seen = new Set<number>();
    const sequence: number[] = [];
    availableRounds.forEach((round) => {
      const value = extractRoundNumber(round);
      if (isFiniteNumber(value) && !seen.has(value)) {
        seen.add(value);
        sequence.push(value);
      }
    });
    return sequence.sort((a, b) => b - a);
  }, [availableRounds]);

  const initialRound = useMemo(() => {
    if (isFiniteNumber(roundFromQuery)) {
      return roundFromQuery;
    }
    return roundSequence[0];
  }, [roundFromQuery, roundSequence]);

  const [selectedRound, setSelectedRound] = useState<number | undefined>(initialRound);

  useEffect(() => {
    if (!isFiniteNumber(roundFromQuery)) {
      return;
    }
    if (roundFromQuery !== selectedRound) {
      setSelectedRound(roundFromQuery);
    }
  }, [roundFromQuery, selectedRound]);

  useEffect(() => {
    if (selectedRound === undefined && isFiniteNumber(initialRound)) {
      setSelectedRound(initialRound);
    }
  }, [initialRound, selectedRound]);

  const roundReady = isFiniteNumber(selectedRound);

  const minersParams = useMemo(() => {
    if (roundReady && isFiniteNumber(selectedRound)) {
      return { limit: 100, round: selectedRound };
    }
    return { limit: 100 } as MinimalAgentsListQueryParams;
  }, [roundReady, selectedRound]);

  const {
    data: minersData,
    loading: minersLoading,
    error: minersError,
  } = useMinersList(minersParams);

  const resolvedRound = useMemo(() => {
    const backendRound = minersData?.round;
    if (isFiniteNumber(backendRound)) {
      return backendRound;
    }
    return selectedRound;
  }, [minersData?.round, selectedRound]);

  useEffect(() => {
    if (
      isFiniteNumber(resolvedRound) &&
      resolvedRound !== selectedRound
    ) {
      setSelectedRound(resolvedRound);
    }
  }, [resolvedRound, selectedRound]);

  useEffect(() => {
    if (roundReady || !roundSequence.length) {
      return;
    }
    const nextAvailableRound = roundSequence[0];
    if (isFiniteNumber(nextAvailableRound)) {
      setSelectedRound(nextAvailableRound);
    }
  }, [roundReady, roundSequence]);

  const miners = minersData?.miners ?? [];
  const hasMiners = miners.length > 0;
  const pathname = usePathname();
  const effectiveRound = resolvedRound ?? selectedRound;

  useEffect(() => {
    if (!isFiniteNumber(effectiveRound)) {
      return;
    }
    if (minersLoading || minersError) {
      return;
    }
    if (!hasMiners) {
      return;
    }

    const sortedMiners = [...miners].sort(
      (a, b) =>
        (a.ranking ?? Number.MAX_SAFE_INTEGER) -
        (b.ranking ?? Number.MAX_SAFE_INTEGER)
    );
    const topMiner =
      sortedMiners.find(
        (miner) => !miner.isSota && miner.uid !== undefined && miner.uid >= 0
      ) ??
      sortedMiners.find(
        (miner) => miner.uid !== undefined && miner.uid >= 0
      ) ??
      sortedMiners[0];

    if (!topMiner || topMiner.uid === undefined || topMiner.uid < 0) {
      return;
    }

    const fallbackAgentId = String(topMiner.uid);
    const agentFromQueryExists =
      typeof agentParam === "string" &&
      miners.some(
        (miner) => miner.uid !== undefined && String(miner.uid) === agentParam
      );
    const targetAgentId = agentFromQueryExists ? agentParam : fallbackAgentId;

    if (!targetAgentId) {
      return;
    }

    const targetPath = `${routes.agents}/${targetAgentId}`;
    if (pathname === targetPath) {
      return;
    }

    const params = new URLSearchParams();
    params.set("round", String(effectiveRound));
    params.set("agent", targetAgentId);

    router.replace(`${targetPath}?${params.toString()}`);
  }, [
    agentParam,
    effectiveRound,
    hasMiners,
    miners,
    minersError,
    minersLoading,
    pathname,
    router,
  ]);

  if (minersError) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center">
        <div className="rounded-2xl border-2 border-gray-200 bg-white/95 px-8 py-10 text-center shadow-lg backdrop-blur-xl"
        style={{
          boxShadow: `0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`
        }}>
          <h2 className="text-xl font-bold text-gray-900">Unable to load agents</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {minersError}. Please try refreshing the page once the service is available again.
          </p>
        </div>
      </div>
    );
  }

  if (!minersLoading && !minersError && isFiniteNumber(effectiveRound) && !hasMiners) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center">
        <div className="rounded-2xl border-2 border-gray-200 bg-white/95 px-8 py-10 text-center shadow-lg backdrop-blur-xl"
        style={{
          boxShadow: `0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`
        }}>
          <h2 className="text-xl font-bold text-gray-900">No agents found</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Recent rounds did not return any miners. Try selecting a different round or refreshing once new data is available.
          </p>
        </div>
      </div>
    );
  }

  // Keep showing the fallback skeleton while the redirect is in flight so the page never
  // flashes empty content before the target agent view loads.
  return <AgentsPageFallback />;
}

export default function Page() {
  return (
    <Suspense fallback={<AgentsPageFallback />}>
      <AgentsLanding />
    </Suspense>
  );
}
