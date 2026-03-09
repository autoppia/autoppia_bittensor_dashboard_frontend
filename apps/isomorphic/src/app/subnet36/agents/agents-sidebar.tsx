"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { useSeasonRank } from "@/services/hooks/useAgents";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type {
  MinimalAgentData,
} from "@/repositories/agents/agents.types";
import { routes } from "@/config/routes";
import { resolveAssetUrl } from "@/services/utils/assets";

function getMinerCardContainerClass(isActive: boolean, highlightTop: boolean): string {
  if (isActive) return "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25 text-white border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 scale-[1.02]";
  if (highlightTop) return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/70 text-white shadow-lg hover:shadow-xl hover:border-amber-500/80 hover:scale-[1.02]";
  return "text-white/90 hover:bg-white/15 hover:text-white border border-white/15 hover:border-white/30 hover:shadow-md hover:scale-[1.01]";
}

function getMinerAvatarRingClass(isActive: boolean, highlightTop: boolean): string {
  if (isActive) return "ring-3 ring-emerald-400/70 shadow-lg shadow-emerald-500/50";
  if (highlightTop) return "ring-2 ring-amber-400/50";
  return "ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/30";
}

function getMinerNameClass(isActive: boolean, highlightTop: boolean): string {
  if (isActive) return "text-white drop-shadow-sm";
  if (highlightTop) return "text-amber-200 font-extrabold";
  return "text-white/90 group-hover:text-white";
}

function getMinerSotaBadgeClass(isActive: boolean): string {
  return isActive ? "bg-yellow-400/30 text-yellow-100 border-yellow-300/50" : "bg-purple-500/30 text-purple-100 border-purple-400/60";
}

function getRankBadgeRingClass(isActive: boolean, highlightTop: boolean, displayRank: number | undefined): string {
  if (isActive && displayRank != null) return "ring-2 ring-white/40 shadow-md";
  if (highlightTop && displayRank != null) return "ring-1 ring-amber-400/50 shadow-sm";
  return "";
}

function getMinerMetaClass(isActive: boolean, highlightTop: boolean): string {
  if (isActive) return "text-emerald-200";
  if (highlightTop) return "text-amber-300";
  return "text-white/70 group-hover:text-white/90";
}

export default function AgentsSidebar({ className }: Readonly<{ className?: string }>) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsString = searchParams.toString();
  const [query, setQuery] = useState<string>("");
  const [includeSota, setIncludeSota] = useState<boolean>(false);
  const [filteredAgents, setFilteredAgents] = useState<MinimalAgentData[]>([]);

  const SOTA_ALLOWED_NAMES = new Set(["openai cua", "anthropic cua", "browser use"]);

  const applySotaFilter = (
    miners: MinimalAgentData[],
    includeSota: boolean
  ) => {
    if (includeSota) {
      return miners.filter((m) => SOTA_ALLOWED_NAMES.has(m.name.toLowerCase()));
    }
    return miners.filter((m) => !SOTA_ALLOWED_NAMES.has(m.name.toLowerCase()));
  };

  const prioritizeReigningLeader = useCallback((miners: MinimalAgentData[]) => {
    const ordered = [...miners];
    ordered.sort((a, b) => {
      const aIsReigning = a.slug === "reigning-leader";
      const bIsReigning = b.slug === "reigning-leader";
      if (aIsReigning && !bIsReigning) return -1;
      if (!aIsReigning && bIsReigning) return 1;

      const aRank = Number.isFinite(a.ranking) ? a.ranking : Number.MAX_SAFE_INTEGER;
      const bRank = Number.isFinite(b.ranking) ? b.ranking : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;

      const bReward = Number.isFinite(b.reward) ? b.reward : 0;
      const aReward = Number.isFinite(a.reward) ? a.reward : 0;
      if (bReward !== aReward) return bReward - aReward;

      return a.uid - b.uid;
    });
    return ordered;
  }, []);

  // Parse season from URL. Round is ignored in the season ranking sidebar.
  const seasonParam = searchParams.get("season");

  const { selectedSeason } = useMemo(() => {
    const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
    if (season !== undefined && Number.isFinite(season)) {
      return { selectedSeason: season };
    }
    return { selectedSeason: undefined };
  }, [seasonParam]);

  const loadingOption = useMemo<SelectOption>(
    () => ({
      label: "Loading...",
      value: "__loading__",
    }),
    []
  );

  const seasonRef = selectedSeason ?? "latest";
  const {
    data: seasonRankData,
    loading,
    error,
  } = useSeasonRank(seasonRef);

  const { seasonOptions, latestSeason, effectiveSeason } = useMemo(() => {
    const seasons = seasonRankData?.availableSeasons ?? [];
    const seasonOpts = seasons.map((s) => ({
      label: `Season ${s}`,
      value: s,
    }));
    const latest = seasonRankData?.latestSeason ?? seasons[0];
    return {
      seasonOptions: seasonOpts,
      latestSeason: latest,
      effectiveSeason: selectedSeason ?? latest,
    };
  }, [seasonRankData?.availableSeasons, seasonRankData?.latestSeason, selectedSeason]);

  const [seasonSelectValue, setSeasonSelectValue] = useState<SelectOption>(
    seasonOptions.length > 0 ? seasonOptions[0] : loadingOption
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

  // Redirigir a la última season si no hay season en la URL
  useEffect(() => {
    if (selectedSeason !== undefined) {
      hasRedirectedRef.current = false;
      return;
    }

    if (latestSeason === undefined) {
      return;
    }

    if (hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;

    const params = new URLSearchParams();
    params.set("season", String(latestSeason));

    router.replace(`${pathname}?${params.toString()}`);
  }, [latestSeason, pathname, router, selectedSeason]);

  const handleSeasonChange = (option: SelectOption | null) => {
    if (!option || option.value === loadingOption.value) {
      return;
    }
    const season = typeof option.value === "number" ? option.value : Number.parseInt(String(option.value), 10);

    if (!Number.isFinite(season)) {
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    params.set("season", String(season));
    params.delete("round");
    router.push(`${pathname}?${params.toString()}`);
  };

  const minersFromApi = useMemo(
    () => seasonRankData?.miners ?? [],
    [seasonRankData?.miners]
  );

  const minerScoreMetaByUid = useMemo(() => {
    const byUid = new Map<number, { effective: number; best: number }>();
    minersFromApi.forEach((miner: Record<string, unknown>) => {
      const uid = Number(miner?.uid);
      if (!Number.isFinite(uid)) return;
      const best = Number(
        miner?.best_reward_in_season ?? miner?.post_consensus_avg_reward ?? 0
      );
      const effective = Number(
        miner?.best_local_round_reward ?? best
      );
      byUid.set(uid, {
        best: Number.isFinite(best) ? best : 0,
        effective: Number.isFinite(effective) ? effective : 0,
      });
    });
    return byUid;
  }, [minersFromApi]);

  // Map miners from API format to MinimalAgentData format
  // Use JSON.stringify to create a stable dependency key
  const minersFromApiKey = useMemo(() => {
    return JSON.stringify(minersFromApi.map(m => ({ uid: m.uid, name: m.name, rank: m.post_consensus_rank, reward: m.best_reward_in_season ?? m.post_consensus_avg_reward })));
  }, [minersFromApi]);

  const minersData = useMemo(() => {
    if (!minersFromApi.length) {
      return { miners: [] };
    }

    const miners: MinimalAgentData[] = minersFromApi.map((miner) => ({
      uid: miner.uid,
      name: miner.name,
      ranking: miner.post_consensus_rank,
      reward: miner.best_reward_in_season ?? miner.post_consensus_avg_reward,
      isSota: false, // TODO: Determine SOTA from miner data if available
      imageUrl: miner.image || `/miners/${Math.abs(miner.uid % 50)}.svg`,
      slug: miner.is_reigning_leader ? "reigning-leader" : undefined,
    }));

    return { miners };
  }, [minersFromApiKey, minersFromApi]);

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

    setFilteredAgents(prioritizeReigningLeader(filtered));
  }, [minersData, includeSota, query, minersFromApiKey, applySotaFilter, prioritizeReigningLeader]);

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

    setFilteredAgents(prioritizeReigningLeader(filtered));
  };

  // Show loading placeholder
  if (loading || (selectedSeason === undefined && seasonOptions.length === 0)) {
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
                options={
                  seasonOptions.length > 0
                    ? seasonOptions.map((option) => ({
                        label: option.label,
                        value: Number(option.value),
                      }))
                    : [{ label: loadingOption.label, value: -1 }]
                }
                value={seasonSelectValue}
                onChange={handleSeasonChange}
                disabled={!seasonOptions.length}
                placeholder="Select season"
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
                    setFilteredAgents(prioritizeReigningLeader(filtered));
                  }
                }}
                className="!rounded-xl !border-2 !border-white/20 !bg-transparent !text-white placeholder:!text-white/50 hover:!border-emerald-400/60 focus:!border-emerald-500/70 !shadow-sm hover:!shadow-md transition-all duration-300 backdrop-blur-sm"
                inputClassName="!bg-transparent !text-white placeholder:!text-white/50"
              />
            </div>

            <div className="mb-3 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/12 via-sky-500/10 to-transparent px-3 py-2.5 shadow-sm shadow-cyan-500/10">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/12">
                  <BiInfoCircle className="h-3.5 w-3.5 text-cyan-200" />
                </div>
                <p className="text-[11px] leading-5 text-cyan-50/90">
                  To dethrone the current season leader, a miner must beat its best reward by{" "}
                  <span className="font-bold text-white">5%</span>.
                </p>
              </div>
            </div>

            {filteredAgents.map((miner, index) => {
              const isActive = miner.uid.toString() === id;
              const displayRank = index + 1;
              const showCrown = displayRank === 1;
              const highlightTop = displayRank === 1;
              const scoreMeta = minerScoreMetaByUid.get(Number(miner.uid));
              const bestReward = scoreMeta?.best ?? Number(miner.reward ?? 0);

              const cornerBadgePalette = (() => {
                switch (displayRank) {
                  case 1:
                    return "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 text-white border-amber-300";
                  case 2:
                    return "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-black border-slate-100";
                  case 3:
                    return "bg-gradient-to-br from-amber-800 via-amber-700 to-orange-800 text-white border-amber-500/60";
                  default:
                    return "bg-gradient-to-br from-sky-700 via-cyan-700 to-blue-800 text-cyan-50 border-cyan-300/40";
                }
              })();

              return (
                  <NavLink
                    key={`miner-menu-${miner.uid}`}
                    href={
                      effectiveSeason
                        ? `${routes.agents}/${miner.uid}?season=${effectiveSeason}`
                        : `${routes.agents}/${miner.uid}`
                    }
                  >
                  <div
                    className={cn(
                      "relative flex items-center w-full p-2.5 rounded-xl transition-all duration-300 group overflow-visible backdrop-blur-sm",
                      highlightTop
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/70 text-white shadow-lg hover:shadow-xl hover:border-amber-500/80 hover:scale-[1.02]"
                        : "bg-gradient-to-r from-emerald-500/14 via-teal-500/10 to-cyan-500/14 text-white border border-emerald-400/35 shadow-md shadow-emerald-500/10 hover:border-emerald-300/55 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01]"
                    )}
                  >
                    {/* Animated gradient shimmer for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-pulse pointer-events-none" />
                    )}

                    <div
                      className={cn(
                        "absolute -top-1 -right-1 min-w-[28px] h-7 px-2 rounded-full flex items-center justify-center shadow-xl border z-10",
                        cornerBadgePalette,
                        showCrown && "animate-pulse"
                      )}
                    >
                      {showCrown ? (
                        <>
                          <FaCrown className="w-3 h-3 drop-shadow-lg" />
                          <div className="absolute inset-0 rounded-full bg-amber-400 blur-md opacity-60 animate-pulse pointer-events-none" />
                        </>
                      ) : (
                        <span className="text-[10px] font-black tracking-wide">
                          #{displayRank}
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 mr-2.5 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110",
                        getMinerAvatarRingClass(isActive, highlightTop)
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
                            getMinerNameClass(isActive, highlightTop)
                          )}
                        >
                          {miner.name}
                        </span>

                        {miner.isSota && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm",
                              getMinerSotaBadgeClass(isActive)
                            )}
                          >
                            SOTA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-nowrap min-w-0 overflow-x-auto overflow-y-hidden scrollbar-none">
                        <span
                          className={cn(
                            "text-[11px] font-mono font-medium transition-all duration-300",
                            getMinerMetaClass(isActive, highlightTop)
                          )}
                        >
                          UID: {miner.uid}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold transition-all duration-300 shrink-0 whitespace-nowrap",
                            isActive
                              ? "text-emerald-200"
                              : highlightTop
                              ? "text-amber-300"
                              : "text-white/70 group-hover:text-white/90"
                          )}
                          title="Best reward achieved in this season"
                        >
                          Best reward {(bestReward * 100).toFixed(2)}%
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
