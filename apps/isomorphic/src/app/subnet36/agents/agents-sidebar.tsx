"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import NavLink from "@core/components/nav-link";
import Image from "next/image";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import cn from "@core/utils/class-names";
import {
  Text,
  Input,
  Checkbox,
  Select,
  Tooltip,
  type SelectOption,
} from "rizzui";
import { LuSearch } from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { BiInfoCircle } from "react-icons/bi";
import { useRoundsData } from "@/services/hooks/useAgents";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type {
  MinimalAgentData,
} from "@/repositories/agents/agents.types";
import { routes } from "@/config/routes";
import { GLASS_STYLES } from "@/config/theme-styles";
import { resolveAssetUrl } from "@/services/utils/assets";

export default function AgentsSidebar({ className }: { className?: string }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsString = searchParams.toString();
  const [query, setQuery] = useState<string>("");
  const [includeSota, setIncludeSota] = useState<boolean>(false);
  const [filteredAgents, setFilteredAgents] = useState<MinimalAgentData[]>([]);

  const SOTA_ALLOWED_NAMES = ["openai cua", "anthropic cua", "browser use"];

  const applySotaFilter = useCallback(
    (miners: MinimalAgentData[], includeSota: boolean) => {
      if (includeSota) {
        return miners.filter((m) =>
          SOTA_ALLOWED_NAMES.includes(m.name.toLowerCase())
        );
      }
      return miners.filter(
        (m) => !SOTA_ALLOWED_NAMES.includes(m.name.toLowerCase())
      );
    },
    []
  );

  // Parse season and round from separate URL parameters
  const seasonParam = searchParams.get("season");
  const roundParam = searchParams.get("round");

  const { selectedSeason, selectedRoundInSeason } = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    const round = roundParam ? Number.parseInt(roundParam, 10) : undefined;

    if (season !== undefined && Number.isFinite(season) && round !== undefined && Number.isFinite(round)) {
      return { selectedSeason: season, selectedRoundInSeason: round };
    }

    return { selectedSeason: undefined, selectedRoundInSeason: undefined };
  }, [seasonParam, roundParam]);

  const roundReady = selectedSeason !== undefined && selectedRoundInSeason !== undefined;

  // Use new unified endpoint to get rounds list (no round = list of rounds only)
  const { data: roundsData, loading: roundsLoading, error: roundsError } = useRoundsData(undefined);

  const loadingOption = useMemo<SelectOption>(
    () => ({
      label: "Loading...",
      value: "__loading__",
    }),
    []
  );

  // Parse available rounds to extract seasons and rounds
  const { seasonOptions, latestSeason, latestRoundInSeason } = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    if (rounds.length === 0) {
      return { seasonOptions: [], latestSeason: undefined, latestRoundInSeason: undefined };
    }

    // Parse rounds in format "season/round"
    const parsedRounds = rounds
      .map((r) => {
        if (typeof r === "string" && r.includes("/")) {
          const parts = r.split("/");
          return {
            season: Number.parseInt(parts[0], 10),
            round: Number.parseInt(parts[1], 10),
            full: r,
          };
        }
        return null;
      })
      .filter((r) => r !== null && Number.isFinite(r.season) && Number.isFinite(r.round)) as Array<{
        season: number;
        round: number;
        full: string;
      }>;

    // Get unique seasons, sorted descending (most recent first)
    const seasons = Array.from(new Set(parsedRounds.map((r) => r.season))).sort((a, b) => b - a);

    const seasonOpts = seasons.map((s) => ({
      label: `Season ${s}`,
      value: s,
    }));

    // Get latest round (highest season, highest round in that season)
    const latest = parsedRounds.length > 0 ? parsedRounds[0] : null;

    return {
      seasonOptions: seasonOpts,
      latestSeason: latest?.season,
      latestRoundInSeason: latest?.round,
    };
  }, [roundsData?.rounds]);

  // Get round options for selected season
  const roundInSeasonOptions = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    const currentSeason = selectedSeason ?? latestSeason;

    if (!currentSeason) {
      return [];
    }

    const roundsInSeason = rounds
      .map((r) => {
        if (typeof r === "string" && r.includes("/")) {
          const parts = r.split("/");
          const season = Number.parseInt(parts[0], 10);
          const round = Number.parseInt(parts[1], 10);
          if (season === currentSeason && Number.isFinite(round)) {
            return round;
          }
        }
        return null;
      })
      .filter((r) => r !== null) as number[];

    // Sort descending (most recent first)
    const sorted = [...new Set(roundsInSeason)].sort((a, b) => b - a);

    return sorted.map((r) => ({
      label: `Round ${r}`,
      value: r,
    }));
  }, [roundsData?.rounds, selectedSeason, latestSeason]);

  const effectiveSeason = selectedSeason ?? latestSeason;
  const effectiveRoundInSeason = selectedRoundInSeason ?? latestRoundInSeason;
  const effectiveRound = effectiveSeason && effectiveRoundInSeason
    ? `${effectiveSeason}/${effectiveRoundInSeason}`
    : undefined;

  // Fetch miners for the selected round (season/round from URL or latest)
  const { data: roundsDataWithMiners } = useRoundsData(effectiveRound);

  const [seasonSelectValue, setSeasonSelectValue] = useState<SelectOption>(
    seasonOptions.length > 0 ? seasonOptions[0] : loadingOption
  );
  const [roundSelectValue, setRoundSelectValue] = useState<SelectOption>(
    roundInSeasonOptions.length > 0 ? roundInSeasonOptions[0] : loadingOption
  );

  // Ref para evitar loops infinitos en la redirección
  const hasRedirectedRef = useRef(false);

  // Update season select value
  useEffect(() => {
    if (!seasonOptions.length) {
      setSeasonSelectValue(loadingOption);
      return;
    }

    const nextOption =
      seasonOptions.find((option) => option.value === effectiveSeason) ??
      seasonOptions[0];

    setSeasonSelectValue((current) =>
      current?.value === nextOption.value ? current : nextOption
    );
  }, [effectiveSeason, loadingOption, seasonOptions]);

  // Update round select value
  useEffect(() => {
    if (!roundInSeasonOptions.length) {
      setRoundSelectValue(loadingOption);
      return;
    }

    const nextOption =
      roundInSeasonOptions.find((option) => option.value === effectiveRoundInSeason) ??
      roundInSeasonOptions[0];

    setRoundSelectValue((current) =>
      current?.value === nextOption.value ? current : nextOption
    );
  }, [effectiveRoundInSeason, loadingOption, roundInSeasonOptions]);

  // Redirigir a la última round si no hay round en la URL
  useEffect(() => {
    // Si está cargando, esperar
    if (roundsLoading) {
      return;
    }

    // Si ya hay un round válido en la URL, resetear flag
    if (roundReady) {
      hasRedirectedRef.current = false;
      return;
    }

    // Si no hay última round disponible, esperar
    if (latestSeason === undefined || latestRoundInSeason === undefined) {
      return;
    }

    // Si ya redirigimos, no volver a redirigir
    if (hasRedirectedRef.current) {
      return;
    }

    // Marcar redirección
    hasRedirectedRef.current = true;

    // Redirigir a la última round con parámetros separados
    const params = new URLSearchParams();
    params.set("season", String(latestSeason));
    params.set("round", String(latestRoundInSeason));

    router.replace(`${pathname}?${params.toString()}`);
  }, [latestSeason, latestRoundInSeason, id, pathname, roundReady, router, roundsLoading, searchParams]);

  const handleSeasonChange = (option: SelectOption | null) => {
    if (!option || option.value === loadingOption.value) {
      return;
    }
    const season = typeof option.value === "number" ? option.value : Number.parseInt(String(option.value), 10);

    if (!Number.isFinite(season)) {
      return;
    }

    // When season changes, default to round 1 of that season
    const params = new URLSearchParams(searchParamsString);
    params.set("season", String(season));
    params.set("round", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRoundInSeasonChange = (option: SelectOption | null) => {
    if (!option || option.value === loadingOption.value) {
      return;
    }
    const round = typeof option.value === "number" ? option.value : Number.parseInt(String(option.value), 10);

    if (!Number.isFinite(round) || !effectiveSeason) {
      return;
    }

    // Update URL with separate season and round parameters
    const params = new URLSearchParams(searchParamsString);
    params.set("season", String(effectiveSeason));
    params.set("round", String(round));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Get miners for the selected round (from round-specific fetch when we have season/round)
  const minersFromApi = useMemo(
    () =>
      effectiveRound
        ? (roundsDataWithMiners?.round_selected?.miners ?? [])
        : (roundsData?.round_selected?.miners ?? []),
    [
      effectiveRound,
      roundsDataWithMiners?.round_selected?.miners,
      roundsData?.round_selected?.miners,
    ]
  );

  const minerScoreMetaByUid = useMemo(() => {
    const byUid = new Map<number, { round: number; effective: number; best: number }>();
    minersFromApi.forEach((miner: any) => {
      const uid = Number(miner?.uid);
      if (!Number.isFinite(uid)) return;
      const round = Number(miner?.round_score ?? miner?.post_consensus_avg_reward ?? 0);
      const best = Number(miner?.best_score_in_season ?? round);
      const effective = Number(miner?.effective_round_score ?? Math.max(round, best));
      byUid.set(uid, {
        round: Number.isFinite(round) ? round : 0,
        best: Number.isFinite(best) ? best : 0,
        effective: Number.isFinite(effective) ? effective : 0,
      });
    });
    return byUid;
  }, [minersFromApi]);

  // Map miners from API format to MinimalAgentData format
  // Use JSON.stringify to create a stable dependency key
  const minersFromApiKey = useMemo(() => {
    return JSON.stringify(minersFromApi.map(m => ({ uid: m.uid, name: m.name, rank: m.post_consensus_rank, score: m.post_consensus_avg_reward })));
  }, [minersFromApi]);

  const minersData = useMemo(() => {
    if (!minersFromApi.length) {
      return { miners: [] };
    }

    const miners: MinimalAgentData[] = minersFromApi.map((miner) => ({
      uid: miner.uid,
      name: miner.name,
      ranking: miner.post_consensus_rank,
      score: miner.post_consensus_avg_reward,
      isSota: false, // TODO: Determine SOTA from miner data if available
      imageUrl: miner.image || `/miners/${Math.abs(miner.uid % 50)}.svg`,
    }));

    return { miners };
  }, [minersFromApiKey, minersFromApi]);

  // Normalize displayed rank to the participating set (handshake miners shown in this round),
  // instead of keeping the global metagraph rank (e.g. 26, 234, ...).
  const normalizedRankByUid = useMemo(() => {
    const sorted = [...(minersData.miners ?? [])].sort((a, b) => {
      const ar = Number.isFinite(a.ranking) ? a.ranking : Number.MAX_SAFE_INTEGER;
      const br = Number.isFinite(b.ranking) ? b.ranking : Number.MAX_SAFE_INTEGER;
      if (ar !== br) return ar - br;
      return (b.score ?? 0) - (a.score ?? 0);
    });
    const map = new Map<number, number>();
    sorted.forEach((m, idx) => map.set(Number(m.uid), idx + 1));
    return map;
  }, [minersData.miners]);

  const loading = roundsLoading;
  const error = roundsError;

  // Update filtered agents when data / SOTA / query changes
  // Use a ref to track previous values and prevent unnecessary updates
  const prevFilterKeyRef = useRef<string>("");

  useEffect(() => {
    const filterKey = `${minersFromApiKey}-${includeSota}-${query}`;

    // Skip if nothing changed
    if (filterKey === prevFilterKeyRef.current) {
      return;
    }
    prevFilterKeyRef.current = filterKey;

    if (!minersData?.miners || minersData.miners.length === 0) {
      setFilteredAgents([]);
      return;
    }

    let filtered = applySotaFilter(minersData.miners, includeSota);

    // Apply search filter on top
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (miner) =>
          miner.name.toLowerCase().includes(q) ||
          miner.uid.toString().includes(q)
      );
    }

    setFilteredAgents(filtered);
  }, [minersData, includeSota, query, minersFromApiKey, applySotaFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (!minersData?.miners) return;

    let filtered = applySotaFilter(minersData.miners, includeSota);

    if (nextQuery.trim() !== "") {
      const q = nextQuery.toLowerCase();
      filtered = filtered.filter(
        (miner) =>
          miner.name.toLowerCase().includes(q) ||
          miner.uid.toString().includes(q)
      );
    }

    setFilteredAgents(filtered);
  };

  // Show loading placeholder
  if (loading || (!roundReady && seasonOptions.length === 0)) {
    return <AgentSidebarPlaceholder />;
  }

  // Show error state
  if (error) {
    return (
      <aside
        className={cn(
          "fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] pb-4 flex items-center justify-center backdrop-blur-xl rounded-r-xl border-r border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-gray-0/80 dark:bg-gray-50/50",
          className
        )}
      >
        <div className="text-center px-6">
          <div className="text-red-400 text-sm font-semibold">
            Error loading agents
          </div>
          <div className="text-white/70 text-xs mt-2">{error}</div>
        </div>
      </aside>
    );
  }

  // Check if this is in a drawer (mobile) vs fixed sidebar (desktop)
  const isInDrawer = className?.includes("static");

  return (
    <aside
      className={cn(
        "fixed top-0 start-0 z-50 h-screen w-[320px] flex flex-col overflow-hidden backdrop-blur-xl border-r border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-gray-0/80 dark:bg-gray-50/50",
        className
      )}
    >
      <div
        className={cn(
          "h-full flex flex-col overflow-hidden",
          !isInDrawer && "pt-[90px]"
        )}
      >
        <div className="sticky top-0 border-b border-white/20 backdrop-blur-xl agents-round-select z-10 bg-gray-0/80 dark:bg-gray-50/50">
          <div className="flex items-center gap-3 pl-4 pr-3 py-4">
            <div className="flex items-center gap-2">
              <Text className="text-xl font-bold text-white">All Miners</Text>
            </div>
            <div className="flex-1 flex justify-end">
              <Checkbox
                id="show-sota-agents"
                checked={includeSota}
                onChange={(e) => setIncludeSota(e.target.checked)}
                label={
                  <span className="flex items-center gap-1">
                    <Tooltip content="State of the art agents" placement="top">
                      <BiInfoCircle className="h-3.5 w-3.5 text-white/60 hover:text-white/90" />
                    </Tooltip>
                    SOTA
                  </span>
                }
                labelPlacement="left"
                labelClassName="!text-xs !font-semibold !uppercase !tracking-wide !text-white/90"
                className="!flex !flex-row !items-center !gap-2 !bg-transparent !border-0 transition-all duration-300"
                inputClassName="!border !border-white/40 !bg-transparent focus:!ring-emerald-500 checked:!bg-emerald-600 checked:!border-emerald-500 transition-all duration-300"
                iconClassName="!text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 mt-0.5 pt-6 pb-2 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar]:opacity-0 hover:[&::-webkit-scrollbar]:opacity-100 transition-opacity">
          <div className="flex flex-col gap-2">
            <div className="mb-1">
              <Select
                options={seasonOptions.length > 0 ? seasonOptions : [loadingOption]}
                value={seasonSelectValue}
                onChange={handleSeasonChange}
                disabled={!seasonOptions.length}
                placeholder="Select season"
                className="w-full !rounded-xl !border-2 !border-white/20 !bg-transparent !text-white hover:!border-emerald-400/60 focus:!border-emerald-500/70 !shadow-sm hover:!shadow-md transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            <div className="mb-1">
              <Select
                options={roundInSeasonOptions.length > 0 ? roundInSeasonOptions : [loadingOption]}
                value={roundSelectValue}
                onChange={handleRoundInSeasonChange}
                disabled={!roundInSeasonOptions.length}
                placeholder="Select round"
                className="w-full !rounded-xl !border-2 !border-white/20 !bg-transparent !text-white hover:!border-emerald-400/60 focus:!border-emerald-500/70 !shadow-sm hover:!shadow-md transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            <div className="mb-2">
              <Input
                prefix={<LuSearch className="w-4 text-white/60" />}
                placeholder="Search miners..."
                clearable={true}
                value={query}
                onChange={handleSearch}
                onClear={() => {
                  setQuery("");
                  if (minersData?.miners) {
                    const filtered = applySotaFilter(
                      minersData.miners,
                      includeSota
                    );
                    setFilteredAgents(filtered);
                  }
                }}
                className="!rounded-xl !border-2 !border-white/20 !bg-transparent !text-white placeholder:!text-white/50 hover:!border-emerald-400/60 focus:!border-emerald-500/70 !shadow-sm hover:!shadow-md transition-all duration-300 backdrop-blur-sm"
                inputClassName="!bg-transparent !text-white placeholder:!text-white/50"
              />
            </div>

            {filteredAgents.map((miner) => {
              const isActive = miner.uid.toString() === id;
              const firstNonSotaUid = filteredAgents.find(
                (agent) => !agent.isSota
              )?.uid;
              const normalizedRank = normalizedRankByUid.get(Number(miner.uid));
              const isTopRanked = normalizedRank === 1;
              const showCrown = includeSota
                ? isTopRanked
                : firstNonSotaUid === miner.uid;
              const highlightTop =
                (!includeSota && firstNonSotaUid === miner.uid) ||
                (includeSota && isTopRanked);
              const displayRank = normalizedRank !== undefined ? normalizedRank : undefined;
              const showRankBadge = typeof displayRank === "number";
              const scoreMeta = minerScoreMetaByUid.get(Number(miner.uid));
              const roundScore = scoreMeta?.round ?? Number(miner.score ?? 0);
              const bestScore = scoreMeta?.best ?? roundScore;
              const isBoostedBySeason = bestScore > roundScore;

              const rankBadgePalette = (() => {
                switch (displayRank) {
                  case 1:
                    // Oro
                    return "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 text-black shadow-sm";
                  case 2:
                    // Plata
                    return "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-black shadow-sm";
                  case 3:
                    // Bronce (sin amarillo)
                    return "bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 text-white shadow-sm";
                  default:
                    // #4+ (evitar look plata/gris): azul/cian
                    return "bg-gradient-to-r from-sky-700 via-cyan-700 to-blue-800 text-cyan-50 border border-cyan-300/40 shadow-sm";
                }
              })();

              return (
                  <NavLink
                    key={`miner-menu-${miner.uid}`}
                    href={
                      effectiveSeason && effectiveRoundInSeason
                        ? `${routes.agents}/${miner.uid}?season=${effectiveSeason}&round=${effectiveRoundInSeason}`
                        : `${routes.agents}/${miner.uid}`
                    }
                  >
                  <div
                    className={cn(
                      "relative flex items-center w-full p-2.5 rounded-xl transition-all duration-300 group overflow-visible backdrop-blur-sm",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25 text-white border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 scale-[1.02]"
                        : highlightTop
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/70 text-white shadow-lg hover:shadow-xl hover:border-amber-500/80 hover:scale-[1.02]"
                        : "text-white/90 hover:bg-white/15 hover:text-white border border-white/15 hover:border-white/30 hover:shadow-md hover:scale-[1.01]"
                    )}
                  >
                    {/* Animated gradient shimmer for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-pulse pointer-events-none" />
                    )}

                    {/* Crown for winner only */}
                    {showCrown && (
                      <div className="absolute -top-1 -right-1 rounded-full p-1.5 shadow-xl border-2 z-10 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 border-amber-300 animate-pulse">
                        <FaCrown className="w-3 h-3 text-white drop-shadow-lg" />
                        <div className="absolute inset-0 rounded-full bg-amber-400 blur-md opacity-60 animate-pulse pointer-events-none" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 mr-2.5 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110",
                        isActive
                          ? "ring-3 ring-emerald-400/70 shadow-lg shadow-emerald-500/50"
                          : highlightTop
                          ? "ring-2 ring-amber-400/50"
                          : "ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/30"
                      )}
                    >
                      <Image
                        src={resolveAssetUrl(
                          miner.imageUrl,
                          resolveAssetUrl(
                            `/miners/${Math.abs(miner.uid % 50)}.svg`
                          )
                        )}
                        alt={miner.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-bold truncate transition-all duration-300",
                            isActive
                              ? "text-white drop-shadow-sm"
                              : highlightTop
                              ? "text-amber-200 font-extrabold"
                              : "text-white/90 group-hover:text-white"
                          )}
                        >
                          {miner.name}
                        </span>

                        {miner.isSota && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm",
                              isActive
                                ? "bg-yellow-400/30 text-yellow-100 border-yellow-300/50"
                                : "bg-purple-500/30 text-purple-100 border-purple-400/60"
                            )}
                          >
                            SOTA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-nowrap min-w-0 overflow-x-auto overflow-y-hidden scrollbar-none">
                        {showRankBadge && displayRank !== 1 ? (
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 transition-all duration-300 shrink-0",
                              rankBadgePalette,
                              isActive
                                ? "ring-2 ring-white/40 shadow-md"
                                : highlightTop
                                ? "ring-1 ring-amber-400/50 shadow-sm"
                                : ""
                            )}
                          >
                            #{displayRank}
                          </span>
                        ) : null}

                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 transition-all duration-300 shrink-0",
                            "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 text-black shadow-sm",
                            isActive ? "ring-2 ring-white/40 shadow-md" : ""
                          )}
                        >
                          UID {miner.uid}
                        </span>

                        <span
                          className={cn(
                            "text-[10px] font-semibold transition-all duration-300 shrink-0 whitespace-nowrap",
                            isActive
                              ? "text-white/75"
                              : "text-white/60 group-hover:text-white/80"
                          )}
                          title="Reward achieved in this round"
                        >
                          Reward {(roundScore * 100).toFixed(2)}%
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold transition-all duration-300 shrink-0 whitespace-nowrap",
                            isBoostedBySeason
                              ? "text-amber-300"
                              : isActive
                              ? "text-emerald-200"
                              : highlightTop
                              ? "text-amber-300"
                              : "text-white/70 group-hover:text-white/90"
                          )}
                          title="Best reward achieved in this season"
                        >
                          Best {(bestScore * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
