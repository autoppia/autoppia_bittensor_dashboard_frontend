"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRounds } from "@/services/hooks/useRounds";
import { useMinersList } from "@/services/hooks/useAgents";
import type { MinimalAgentsListQueryParams } from "@/services/api/types/agents";
import { AgentsPageFallback } from "./agents-fallback";

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

export default function AgentsLanding() {
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
  const [lastRedirectKey, setLastRedirectKey] = useState<string | null>(null);
  const attemptedRoundsRef = useRef<Set<number>>(new Set());

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

  useEffect(() => {
    const next = new Set<number>();
    attemptedRoundsRef.current.forEach((round) => {
      if (roundSequence.includes(round)) {
        next.add(round);
      }
    });
    if (isFiniteNumber(selectedRound)) {
      next.add(selectedRound);
    }
    attemptedRoundsRef.current = next;
  }, [roundSequence, selectedRound]);

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
    if (minersLoading || minersError) {
      return;
    }
    if (!roundSequence.length) {
      return;
    }
    if (!isFiniteNumber(resolvedRound)) {
      return;
    }
    const currentMiners = minersData?.miners ?? [];
    if (currentMiners.length > 0) {
      return;
    }

    const attempted = attemptedRoundsRef.current;
    attempted.add(resolvedRound);

    const currentIndex = roundSequence.indexOf(resolvedRound);
    const candidates =
      currentIndex >= 0
        ? roundSequence.slice(currentIndex + 1)
        : roundSequence;
    const nextRound = candidates.find(
      (candidate) => !attempted.has(candidate)
    );

    if (isFiniteNumber(nextRound)) {
      setSelectedRound(nextRound);
    }
  }, [minersData, minersError, minersLoading, resolvedRound, roundSequence]);

  useEffect(() => {
    if (!isFiniteNumber(resolvedRound)) {
      return;
    }
    if (minersLoading || minersError) {
      return;
    }

    const currentMiners = minersData?.miners ?? [];
    if (!currentMiners.length) {
      return;
    }

    const sortedMiners = [...currentMiners].sort(
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
    const targetAgentId = agentParam ?? fallbackAgentId;

    if (!targetAgentId) {
      return;
    }

    const redirectKey = `${resolvedRound}:${targetAgentId}`;
    if (lastRedirectKey === redirectKey) {
      return;
    }

    const params = new URLSearchParams();
    params.set("round", String(resolvedRound));
    params.set("agent", targetAgentId);

    setLastRedirectKey(redirectKey);
    router.replace(`/agents/${targetAgentId}?${params.toString()}`);
  }, [
    agentParam,
    lastRedirectKey,
    minersData,
    minersError,
    minersLoading,
    resolvedRound,
    router,
  ]);

  const readyForRedirect =
    isFiniteNumber(resolvedRound) &&
    !minersLoading &&
    !minersError &&
    lastRedirectKey !== null;

  if (!readyForRedirect) {
    return <AgentsPageFallback />;
  }

  return null;
}
