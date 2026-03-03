"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRoundsData, useLatestRoundTopMiner } from "@/services/hooks/useAgents";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const seasonParam = searchParams.get("season");
  const roundParam = searchParams.get("round");

  // Build round key "season/round" from URL (e.g. "83/20")
  const roundKeyFromQuery = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    const round = roundParam ? Number.parseInt(roundParam, 10) : undefined;
    if (season !== undefined && Number.isFinite(season) && round !== undefined && Number.isFinite(round)) {
      return `${season}/${round}`;
    }
    return undefined;
  }, [seasonParam, roundParam]);

  // Check if we're on the landing page (no agent ID in URL path)
  // We redirect if we're on /subnet36/agents (without agent ID) and don't have agentParam
  // roundParam doesn't prevent redirect - we always go to latest round with top miner
  const isOnAgentsLanding = pathname === routes.agents || pathname === "/subnet36/agents";
  const needsRedirect = isOnAgentsLanding;

  // Get latest round and top miner for initial redirect (only if we need to redirect)
  const {
    data: latestRoundTopMiner,
    loading: latestRoundLoading,
    error: latestRoundError,
  } = useLatestRoundTopMiner(needsRedirect);

  // Get rounds list from useRoundsData (without round to get all rounds)
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

  // selectedRoundKey: "season/round" - URL is source of truth
  const selectedRoundKey = roundKeyFromQuery ?? availableRoundKeys[0];

  // Use useRoundsData with selected round (only when we have a valid key to avoid redundant calls)
  const {
    data: roundsDataWithMiners,
    loading: roundsDataLoading,
    error: roundsDataError,
  } = useRoundsData(selectedRoundKey);

  // Get miners from roundsDataWithMiners.round_selected.miners
  const miners = useMemo(() => {
    const minersFromRounds = roundsDataWithMiners?.round_selected?.miners ?? [];
    return minersFromRounds.map((miner) => ({
      uid: miner.uid,
      name: miner.name,
      ranking: miner.post_consensus_rank,
      score: miner.post_consensus_avg_reward,
      isSota: false, // TODO: Determine SOTA from miner data if available
      imageUrl: miner.image || `/miners/${Math.abs(miner.uid % 50)}.svg`,
    }));
  }, [roundsDataWithMiners?.round_selected?.miners]);
  const hasMiners = miners.length > 0;
  const effectiveRoundKey = selectedRoundKey;

  // Ref para evitar loops infinitos en la redirección
  const hasRedirectedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect using latest round and top miner from API (fast path)
  // This is the primary redirect mechanism - instant redirect when data is available
  useEffect(() => {
    // Only redirect if we need to (on landing page, no agent param)
    if (!needsRedirect) {
      hasRedirectedRef.current = false;
      // Clear timeout if redirect is not needed
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
      return;
    }

    // If already redirected, don't do it again
    if (hasRedirectedRef.current) {
      return;
    }

    // Wait for data to load (but don't wait if there's an error - use fallback)
    if (latestRoundLoading) {
      return;
    }

    // Clear timeout if loading finished
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    // If no data, wait for fallback
    if (!latestRoundTopMiner) {
      return;
    }

    // Validate data structure (backend returns season and round as numbers)
    const { season, round: roundInSeason, miner_uid: minerUid } = latestRoundTopMiner;
    if (season == null || roundInSeason == null || minerUid == null) {
      console.error('[AgentsLanding] Invalid data structure:', latestRoundTopMiner);
      return;
    }

    // Mark that we're about to redirect BEFORE doing it
    hasRedirectedRef.current = true;

    // Build the target URL: /subnet36/agents/{miner_uid}?season=X&round=Y
    const targetPath = `${routes.agents}/${minerUid}`;
    const params = new URLSearchParams();
    params.set("season", String(season));
    params.set("round", String(roundInSeason));

    const targetUrl = `${targetPath}?${params.toString()}`;
    console.log(`[AgentsLanding] ✅ Redirecting from ${pathname} to: ${targetUrl}`);

    // Redirect immediately to the normal URL format with full page reload
    // Using window.location.href instead of router.replace to force a full page reload
    window.location.href = targetUrl;

    // Cleanup function
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [
    needsRedirect,
    pathname,
    latestRoundLoading,
    latestRoundError,
    latestRoundTopMiner,
    router,
  ]);

  // Fallback redirect using roundsData (slower path, only if latestRoundTopMiner fails)
  useEffect(() => {
    // Only use fallback if we need redirect, latestRoundTopMiner failed or is not available
    if (!needsRedirect || latestRoundTopMiner) {
      return;
    }

    // If already redirected, don't do it again
    if (hasRedirectedRef.current) {
      return;
    }

    // If no round available, wait
    if (!effectiveRoundKey) {
      return;
    }
    // If loading or error, wait
    if (roundsDataLoading || roundsDataError) {
      return;
    }
    // If no miners, wait
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

    // Mark that we're about to redirect
    hasRedirectedRef.current = true;

    // Redirect to top miner with latest round (use season/round in URL)
    const [s, r] = effectiveRoundKey.includes("/") ? effectiveRoundKey.split("/") : [undefined, effectiveRoundKey];
    const params = new URLSearchParams();
    if (s) params.set("season", s);
    if (r) params.set("round", r);
    // Build the target URL: /subnet36/agents/{miner_uid}?season=X&round=Y
    const targetPath = `${routes.agents}/${topMiner.uid}`;
    const targetUrl = `${targetPath}?${params.toString()}`;

    // Redirect with full page reload
    window.location.href = targetUrl;
  }, [
    needsRedirect,
    latestRoundTopMiner,
    effectiveRoundKey,
    hasMiners,
    miners,
    roundsDataError,
    roundsDataLoading,
    router,
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
    effectiveRoundKey &&
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
            Recent rounds did not return any miners. Try selecting a different
            round or refreshing once new data is available.
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
