"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useRoundsData } from "@/services/hooks/useAgents";
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

function AgentsLanding() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const seasonParam = searchParams.get("season");
  const selectedSeason = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    return season !== undefined && Number.isFinite(season) ? season : undefined;
  }, [seasonParam]);

  // Check if we're on the landing page (no agent ID in URL path)
  // We redirect if we're on /subnet36/agents (without agent ID) and don't have agentParam.
  const isOnAgentsLanding = pathname === routes.agents || pathname === "/subnet36/agents";
  const needsRedirect = isOnAgentsLanding;

  // Get rounds list from useRoundsData (without selection to get all rounds)
  const {
    data: roundsListData,
    loading: roundsListLoading,
    error: roundsListError,
  } = useRoundsData(undefined);

  // Rounds are strings "season/round" (e.g. "83/20")
  const availableRoundKeys = useMemo(() => {
    const rounds = roundsListData?.rounds ?? [];
    if (!Array.isArray(rounds) || rounds.length === 0) return [];
    return rounds.filter((r): r is string => typeof r === "string" && r.includes("/"));
  }, [roundsListData?.rounds]);

  const latestSeason = useMemo(() => {
    const latestRoundKey = availableRoundKeys[0];
    if (!latestRoundKey) return undefined;
    const [seasonRaw] = latestRoundKey.split("/");
    const season = Number.parseInt(seasonRaw ?? "", 10);
    return Number.isFinite(season) ? season : undefined;
  }, [availableRoundKeys]);

  const effectiveSeason = selectedSeason ?? latestSeason;

  // Use useRoundsData with season-wide selection
  const {
    data: roundsDataWithMiners,
    loading: roundsDataLoading,
    error: roundsDataError,
  } = useRoundsData(effectiveSeason ? { season: effectiveSeason } : undefined);

  // Get miners from roundsDataWithMiners.round_selected.miners
  const miners = useMemo(() => {
    const minersFromRounds = roundsDataWithMiners?.round_selected?.miners ?? [];
    return minersFromRounds.map((miner) => ({
      uid: miner.uid,
      name: miner.name,
      ranking: miner.post_consensus_rank,
      reward: miner.best_reward_in_season ?? miner.post_consensus_avg_reward,
      isSota: false, // TODO: Determine SOTA from miner data if available
      imageUrl: miner.image || `/miners/${Math.abs(miner.uid % 50)}.svg`,
    }));
  }, [roundsDataWithMiners?.round_selected?.miners]);
  const hasMiners = miners.length > 0;

  // Ref para evitar loops infinitos en la redirección
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!needsRedirect) {
      hasRedirectedRef.current = false;
      return;
    }
    if (hasRedirectedRef.current) {
      return;
    }
    if (!effectiveSeason) {
      return;
    }
    if (roundsListLoading || roundsDataLoading || roundsListError || roundsDataError) {
      return;
    }
    if (!hasMiners) {
      return;
    }

    // Find top miner (best ranking, excluding SOTA)
    const sortedMiners = [...miners].sort(
      (a, b) =>
        (a.ranking ?? Number.MAX_SAFE_INTEGER) -
        (b.ranking ?? Number.MAX_SAFE_INTEGER)
    );
    const topMiner =
      sortedMiners.find(
        (miner) => !miner.isSota && miner.uid !== undefined && miner.uid >= 0
      ) ??
      sortedMiners.find((miner) => miner.uid !== undefined && miner.uid >= 0) ??
      sortedMiners[0];

    if (!topMiner || topMiner.uid === undefined || topMiner.uid < 0) {
      return;
    }

    hasRedirectedRef.current = true;

    const params = new URLSearchParams();
    params.set("season", String(effectiveSeason));
    const targetPath = `${routes.agents}/${topMiner.uid}`;
    const targetUrl = `${targetPath}?${params.toString()}`;

    window.location.href = targetUrl;
  }, [
    needsRedirect,
    effectiveSeason,
    hasMiners,
    miners,
    roundsListError,
    roundsListLoading,
    roundsDataError,
    roundsDataLoading,
  ]);

  // If we need redirect (on landing page), just show skeleton
  // Don't show "no miners" or other messages while waiting for redirect
  if (needsRedirect) {
    return <AgentsPageFallback />;
  }

  // Below this point, we're not on the landing page anymore
  // (we have an agent param in the URL)

    if (roundsDataError) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center">
        <div
          className="rounded-2xl border-2 border-gray-200 bg-white/95 px-8 py-10 text-center shadow-lg backdrop-blur-xl"
          style={{
            boxShadow: `0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
          }}
        >
          <h2 className="text-xl font-bold text-gray-900">
            Unable to load agents
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {roundsDataError}. Please try refreshing the page once the service is
            available again.
          </p>
        </div>
      </div>
    );
  }

  if (
    !roundsDataLoading &&
    !roundsDataError &&
    effectiveSeason &&
    !hasMiners
  ) {
    return (
      <div className="flex h-full min-h-[360px] w-full items-center justify-center">
        <div
          className="rounded-2xl border-2 border-gray-200 bg-white/95 px-8 py-10 text-center shadow-lg backdrop-blur-xl"
          style={{
            boxShadow: `0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
          }}
        >
          <h2 className="text-xl font-bold text-gray-900">No agents found</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            This season did not return any miners. Try selecting a different
            season or refreshing once new data is available.
          </p>
        </div>
      </div>
    );
  }

  return <AgentsPageFallback />;
}

export default function Page() {
  return (
    <Suspense fallback={<AgentsPageFallback />}>
      <AgentsLanding />
    </Suspense>
  );
}
