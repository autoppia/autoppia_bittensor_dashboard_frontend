"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useSeasonRank } from "@/services/hooks/useAgents";
import { routes } from "@/config/routes";
import {
  AgentHeaderPlaceholder,
  AgentScoreAnalyticsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentStatsPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";
import { PiInfoDuotone } from "react-icons/pi";

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

function RoundInProgressState() {
  return (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10 p-6 sm:p-8 shadow-lg backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-60" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-amber-300/60 bg-white/10 shadow-inner">
            <PiInfoDuotone className="h-8 w-8 text-amber-200" />
          </div>
          <div>
            <p className="mb-2 text-lg font-bold uppercase tracking-wide text-amber-100 sm:text-xl">
              Round in progress
            </p>
            <p className="mx-auto max-w-2xl text-sm font-medium text-white/80 sm:text-base">
              This round is in progress. Results and rankings will be available
              once evaluations are complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentsLanding() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const seasonParam = searchParams.get("season");
  const selectedSeason = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    return season !== undefined && Number.isFinite(season) ? season : undefined;
  }, [seasonParam]);

  // Check if we're on the landing page (no agent ID in URL path)
  // We redirect if we're on /subnet36/agents (without agent ID) and don't have agentParam.
  const isOnAgentsLanding =
    pathname === routes.agents || pathname === "/subnet36/agents";
  const needsRedirect = isOnAgentsLanding;

  const seasonRef = selectedSeason ?? "latest";
  const {
    data: seasonRankData,
    loading: seasonRankLoading,
    error: seasonRankError,
  } = useSeasonRank(seasonRef);
  const hasSeasonRankData =
    seasonRankData !== null && seasonRankData !== undefined;
  const latestSeason = seasonRankData?.latestSeason ?? undefined;
  const effectiveSeason = selectedSeason ?? latestSeason;

  // Get miners from roundsDataWithMiners.round_selected.miners
  const miners = useMemo(() => {
    const minersFromRounds = seasonRankData?.miners ?? [];
    return minersFromRounds.map((miner) => {
      const minerImage =
        (miner as { image?: string | null; imageUrl?: string | null }).image ??
        (miner as { image?: string | null; imageUrl?: string | null }).imageUrl;

      return {
        uid: miner.uid,
        name: miner.name,
        ranking: miner.post_consensus_rank,
        reward: miner.best_reward_in_season ?? miner.post_consensus_avg_reward,
        isSota: false, // TODO: Determine SOTA from miner data if available
        imageUrl: minerImage || `/miners/${Math.abs(miner.uid % 50)}.svg`,
      };
    });
  }, [seasonRankData?.miners]);
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
    if (seasonRankLoading || seasonRankError || !hasSeasonRankData) {
      return;
    }
    if (!hasMiners) {
      return;
    }

    // Find top miner (best ranking, excluding SOTA)
    const sortedMiners = [...miners].sort(
      (a, b) =>
        (a.ranking ?? Number.MAX_SAFE_INTEGER) -
        (b.ranking ?? Number.MAX_SAFE_INTEGER),
    );
    const topMiner =
      sortedMiners.find(
        (miner) => !miner.isSota && miner.uid !== undefined && miner.uid >= 0,
      ) ??
      sortedMiners.find((miner) => miner.uid !== undefined && miner.uid >= 0) ??
      sortedMiners[0];

    if (topMiner?.uid == null || topMiner.uid < 0) {
      return;
    }

    hasRedirectedRef.current = true;

    const params = new URLSearchParams();
    params.set("season", String(effectiveSeason));
    const targetPath = `${routes.agents}/${topMiner.uid}`;
    const targetUrl = `${targetPath}?${params.toString()}`;

    router.replace(targetUrl);
  }, [
    needsRedirect,
    effectiveSeason,
    hasMiners,
    miners,
    router,
    seasonRankError,
    hasSeasonRankData,
    seasonRankLoading,
  ]);

  if (!hasSeasonRankData || seasonRankLoading) {
    return <AgentsPageFallback />;
  }

  // Below this point, we're not on the landing page anymore
  // (we have an agent param in the URL)

  if (seasonRankError && !seasonRankLoading) {
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
            {seasonRankError}. Please try refreshing the page once the service
            is available again.
          </p>
        </div>
      </div>
    );
  }

  if (
    hasSeasonRankData &&
    !seasonRankLoading &&
    !seasonRankError &&
    !hasMiners &&
    !effectiveSeason
  ) {
    return <RoundInProgressState />;
  }

  if (
    hasSeasonRankData &&
    !seasonRankLoading &&
    !seasonRankError &&
    effectiveSeason &&
    !hasMiners
  ) {
    return <RoundInProgressState />;
  }

  if (needsRedirect) {
    return <AgentsPageFallback />;
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
