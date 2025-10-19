"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRounds } from "@/services/hooks/useRounds";
import { useMinersList } from "@/services/hooks/useAgents";
import type { MinimalAgentsListQueryParams } from "@/services/api/types/agents";
import { AgentsPageFallback } from "./agents-fallback";

export default function AgentsLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);

  const roundParam = searchParams.get("round");
  const agentParam = searchParams.get("agent");

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
      .sort((a, b) => (b.roundNumber ?? b.round ?? 0) - (a.roundNumber ?? a.round ?? 0));
    if (completed.length) {
      return completed;
    }
    return rounds.sort((a, b) => (b.roundNumber ?? b.round ?? 0) - (a.roundNumber ?? a.round ?? 0));
  }, [roundsData]);

  const roundFromQuery = useMemo(() => {
    if (!roundParam) {
      return undefined;
    }
    const parsed = Number.parseInt(roundParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [roundParam]);

  const defaultRound = availableRounds[0]?.roundNumber ?? availableRounds[0]?.round;
  const selectedRound = roundFromQuery ?? defaultRound;
  const roundReady = typeof selectedRound === "number" && Number.isFinite(selectedRound);

  const minersParams = useMemo(() => {
    if (roundReady && typeof selectedRound === "number") {
      return { limit: 100, round: selectedRound };
    }
    return { limit: 100 } as MinimalAgentsListQueryParams;
  }, [roundReady, selectedRound]);

  const {
    data: minersData,
    loading: minersLoading,
    error: minersError,
  } = useMinersList(minersParams);

  useEffect(() => {
    if (hasRedirected) {
      return;
    }
    if (!roundReady) {
      return;
    }
    if (minersLoading) {
      return;
    }
    if (minersError) {
      return;
    }
    const currentMiners = minersData?.miners ?? [];
    if (!currentMiners.length) {
      return;
    }
    const sortedMiners = [...currentMiners].sort(
      (a, b) => (a.ranking ?? Number.MAX_SAFE_INTEGER) - (b.ranking ?? Number.MAX_SAFE_INTEGER)
    );
    const topMiner =
      sortedMiners.find((miner) => !miner.isSota) ??
      sortedMiners.find((miner) => miner.ranking === 1) ??
      sortedMiners[0];

    const fallbackAgentId = topMiner ? String(topMiner.uid) : undefined;
    const targetAgentId = agentParam ?? fallbackAgentId;

    if (!targetAgentId) {
      return;
    }

    const params = new URLSearchParams();
    params.set("round", String(selectedRound));
    params.set("agent", targetAgentId);

    setHasRedirected(true);
    router.replace(`/agents/${targetAgentId}?${params.toString()}`);
  }, [
    agentParam,
    hasRedirected,
    minersData,
    minersError,
    minersLoading,
    router,
    roundReady,
    selectedRound,
  ]);

  if (!roundReady || minersLoading || !hasRedirected) {
    return <AgentsPageFallback />;
  }

  return null;
}
