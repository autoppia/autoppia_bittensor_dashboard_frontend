"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useMinersList } from "@/services/hooks/useAgents";
import { useRoundIds } from "@/services/hooks/useRounds";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type {
  MinimalAgentData,
  MinimalAgentsListQueryParams,
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

  const roundParam = searchParams.get("round");
  const selectedRound = useMemo(() => {
    if (!roundParam) return undefined;
    const parsed = Number.parseInt(roundParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [roundParam]);
  const roundReady =
    typeof selectedRound === "number" && Number.isFinite(selectedRound);

  // Use lightweight endpoint to get only round IDs (not full data)
  const { data: roundIdsData } = useRoundIds({
    limit: 500,
    sortOrder: "desc",
  });

  const loadingRoundOption = useMemo<SelectOption>(
    () => ({
      label: "Loading rounds...",
      value: "__loading__",
    }),
    []
  );

  const roundOptions: SelectOption[] = useMemo(() => {
    const roundIds = roundIdsData?.roundIds ?? [];
    if (roundIds.length === 0) {
      return [];
    }

    return roundIds.map((value) => ({
      label: `Round ${value}`,
      value,
    }));
  }, [roundIdsData]);

  const defaultRound = roundOptions[0]?.value;
  const effectiveRound = selectedRound ?? defaultRound;
  const selectOptions =
    roundOptions.length > 0 ? roundOptions : [loadingRoundOption];
  const [roundSelectValue, setRoundSelectValue] = useState<SelectOption>(
    selectOptions[0]
  );

  useEffect(() => {
    if (!roundOptions.length) {
      setRoundSelectValue(loadingRoundOption);
      return;
    }

    const nextOption =
      roundOptions.find((option) => option.value === effectiveRound) ??
      roundOptions[0];

    setRoundSelectValue((current) =>
      current?.value === nextOption.value ? current : nextOption
    );
  }, [effectiveRound, loadingRoundOption, roundOptions]);

  useEffect(() => {
    if (roundReady || defaultRound === undefined) {
      return;
    }
    const params = new URLSearchParams(searchParamsString);
    params.set("round", String(defaultRound));
    if (!params.get("agent") && id) {
      params.set("agent", String(id));
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [defaultRound, id, pathname, roundReady, router, searchParamsString]);

  const handleRoundChange = (option: SelectOption | null) => {
    if (!option || option.value === loadingRoundOption.value) {
      return;
    }
    const value =
      typeof option.value === "number"
        ? option.value
        : Number.parseInt(String(option.value), 10);

    if (!Number.isFinite(value) || value === selectedRound) {
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    params.set("round", String(value));
    const agentParam =
      searchParams.get("agent") ?? (id ? String(id) : undefined);
    if (agentParam) {
      params.set("agent", agentParam);
    }
    setRoundSelectValue(option);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Fetch miners data using optimized endpoint
  const minersParams = useMemo(() => {
    const params: MinimalAgentsListQueryParams = { limit: 100 };
    if (typeof effectiveRound === "number" && Number.isFinite(effectiveRound)) {
      params.round = effectiveRound;
    }
    return params;
  }, [effectiveRound]);

  const { data: minersData, loading, error } = useMinersList(minersParams);

  // Update filtered agents when data changes
  useEffect(() => {
    if (minersData?.miners) {
      let filtered = minersData.miners;

      // Only exclude "Browser Use" agent when SOTA is toggled off
      if (!includeSota) {
        filtered = filtered.filter((miner) => 
          miner.name.toLowerCase() !== "browser use"
        );
      }

      setFilteredAgents(filtered);
    }
  }, [minersData, includeSota]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);

    if (!minersData?.miners) return;

    let filtered = minersData.miners;

    // Only exclude "Browser Use" agent when SOTA is toggled off
    if (!includeSota) {
      filtered = filtered.filter((miner) => 
        miner.name.toLowerCase() !== "browser use"
      );
    }

    // Then apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (miner) =>
          miner.name.toLowerCase().includes(query.toLowerCase()) ||
          miner.uid.toString().includes(query.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  };

  // Show loading placeholder
  if (loading || (!roundReady && roundOptions.length === 0)) {
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
                options={selectOptions}
                value={roundSelectValue}
                onChange={handleRoundChange}
                disabled={!roundOptions.length}
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
                    let filtered = minersData.miners;
                    // Optionally exclude SOTA benchmarks when toggled off
                    if (!includeSota) {
                      filtered = filtered.filter((miner) => !miner.isSota);
                    }
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
              const isTopRanked = miner.ranking === 1;
              const showCrown = includeSota
                ? isTopRanked
                : firstNonSotaUid === miner.uid;
              const highlightTop =
                (!includeSota && firstNonSotaUid === miner.uid) ||
                (includeSota && isTopRanked);
              const displayRank = Number.isFinite(miner.ranking)
                ? miner.ranking
                : undefined;
              const showRankBadge = typeof displayRank === "number";
              const rankBadgePalette = (() => {
                switch (displayRank) {
                  case 1:
                    return "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 text-black shadow-sm";
                  case 2:
                    return "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-black shadow-sm";
                  case 3:
                    return "bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 text-black shadow-sm";
                  default:
                    return "bg-white/10 text-white border border-white/20";
                }
              })();

              return (
                <NavLink
                  key={`miner-menu-${miner.uid}`}
                  href={
                    typeof effectiveRound === "number"
                      ? `${routes.agents}/${miner.uid}?round=${effectiveRound}&agent=${miner.uid}`
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
                      <>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-pulse pointer-events-none" />
                      </>
                    )}

                    {/* Crown badge for top agent */}
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
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {showRankBadge && (
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 transition-all duration-300",
                              rankBadgePalette,
                              isActive && displayRank
                                ? "ring-2 ring-white/40 shadow-md"
                                : highlightTop && displayRank
                                  ? "ring-1 ring-amber-400/50 shadow-sm"
                                  : ""
                            )}
                          >
                            #{displayRank}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[11px] font-mono font-medium transition-all duration-300",
                            isActive
                              ? "text-emerald-200"
                              : highlightTop
                                ? "text-amber-300"
                                : "text-white/70 group-hover:text-white/90"
                          )}
                        >
                          UID: {miner.uid}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] font-semibold transition-all duration-300",
                            isActive
                              ? "text-emerald-200"
                              : highlightTop
                                ? "text-amber-300"
                                : "text-white/70 group-hover:text-white/90"
                          )}
                        >
                          {(miner.score * 100).toFixed(1)}%
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
