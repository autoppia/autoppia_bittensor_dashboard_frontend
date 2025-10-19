"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Text, Input, Checkbox, Select, Tooltip, type SelectOption } from "rizzui";
import { LuSearch } from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { BiInfoCircle } from "react-icons/bi";
import { useMinersList } from "@/services/hooks/useAgents";
import { useRounds } from "@/services/hooks/useRounds";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type { MinimalAgentData, MinimalAgentsListQueryParams } from "@/services/api/types/agents";

export default function AgentsSidebar() {
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
  const roundReady = typeof selectedRound === "number" && Number.isFinite(selectedRound);

  const { data: roundsData } = useRounds({
    limit: 50,
    sortBy: "roundNumber",
    sortOrder: "desc",
  });

  const roundOptions: SelectOption[] = useMemo(() => {
    const numbers = new Set<number>();
    const rounds = roundsData?.data?.rounds ?? [];
    rounds.forEach((round) => {
      if (!round) {
        return;
      }
      const candidate =
        (round as any).roundNumber ??
        (round as any).round ??
        (round as any).id;
      const validatorCount =
        (round as any).validatorRoundCount ??
        (round as any).validator_round_count ??
        undefined;

      const hasCompletedValidator = (() => {
        if (typeof validatorCount === "number" && validatorCount > 0) {
          return true;
        }
        const validatorRounds = (round as any).validatorRounds ?? (round as any).validator_rounds;
        if (Array.isArray(validatorRounds)) {
          return validatorRounds.some((entry: any) => {
            const status = (entry?.status ?? entry?.roundStatus ?? "").toString().toLowerCase();
            return status === "completed";
          });
        }
        return false;
      })();

      if (typeof candidate === "number" && Number.isFinite(candidate) && hasCompletedValidator) {
        numbers.add(candidate);
      }
    });
    const values = Array.from(numbers).sort((a, b) => b - a);
    return values.map((value) => ({
      label: `Round ${value}`,
      value,
    }));
  }, [roundsData]);

  const defaultRound = roundOptions[0]?.value;
  const effectiveRound = selectedRound ?? defaultRound;
  const roundSelectValue = roundOptions.find((option) => option.value === effectiveRound);

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

  const handleRoundChange = (option: SelectOption) => {
    const value = typeof option.value === "number"
      ? option.value
      : Number.parseInt(String(option.value), 10);

    if (!Number.isFinite(value) || value === selectedRound) {
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    params.set("round", String(value));
    const agentParam = searchParams.get("agent") ?? (id ? String(id) : undefined);
    if (agentParam) {
      params.set("agent", agentParam);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Fetch miners data using optimized endpoint
  const minersParams = useMemo(() => {
    if (roundReady && typeof selectedRound === "number") {
      return { limit: 100, round: selectedRound };
    }
    return { limit: 100 } as MinimalAgentsListQueryParams;
  }, [roundReady, selectedRound]);

  const { data: minersData, loading, error } = useMinersList(minersParams);

  // Update filtered agents when data changes
  useEffect(() => {
    if (minersData?.miners) {
      let filtered = minersData.miners;
      
      // Optionally exclude SOTA benchmarks when toggled off
      if (!includeSota) {
        filtered = filtered.filter((miner) => !miner.isSota);
      }
      
      setFilteredAgents(filtered);
    }
  }, [minersData, includeSota]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);

    if (!minersData?.miners) return;

    let filtered = minersData.miners;
    
    // Optionally exclude SOTA benchmarks when toggled off
    if (!includeSota) {
      filtered = filtered.filter((miner) => !miner.isSota);
    }
    
    // Then apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter((miner) =>
        miner.name.toLowerCase().includes(query.toLowerCase()) ||
        miner.uid.toString().includes(query.toLowerCase())
      );
    }
    
    setFilteredAgents(filtered);
  };

  const nonSotaRankByUid = useMemo(() => {
    const rankMap = new Map<number, number>();
    let rank = 1;
    filteredAgents.forEach((agent) => {
      if (!agent.isSota) {
        rankMap.set(agent.uid, rank);
        rank += 1;
      }
    });
    return rankMap;
  }, [filteredAgents]);

  // Show loading placeholder
  if (loading || (!roundReady && roundOptions.length === 0)) {
    return <AgentSidebarPlaceholder />;
  }

  // Show error state
  if (error) {
    return (
      <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-4">
        <div className="h-full border rounded-xl bg-gray-50 pb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-sm">Error loading agents</div>
            <div className="text-gray-500 text-xs mt-1">{error}</div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-4">
      <div className="h-full border rounded-xl bg-gray-50 pb-3">
        <div className="sticky top-0 border-b bg-gray-50 agents-round-select">
          <Select
            options={roundOptions}
            value={roundSelectValue}
            onChange={handleRoundChange}
            disabled={!roundOptions.length}
            placeholder="Select round"
            className="w-full !rounded-none !border-none !shadow-none !px-4 !py-4 !text-lg"
          />
        </div>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto pl-3 pr-1.5 mt-0.5 pt-3 pb-3 scroll-smooth">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-2">
              <Text className="text-2xl font-bold text-gray-900">
                All Miners
              </Text>
              <div className="flex-1 flex justify-end">
                <Checkbox
                  id="show-sota-agents"
                  checked={includeSota}
                  onChange={(e) => setIncludeSota(e.target.checked)}
                  label={
                    <span className="flex items-center gap-1">
                      <Tooltip content="State of the art agents" placement="top">
                        <BiInfoCircle className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                      </Tooltip>
                      SOTA
                    </span>
                  }
                  labelPlacement="left"
                  labelClassName="!text-xs !font-semibold !uppercase !tracking-wide !text-white"
                  className={cn(
                    "!flex !flex-row !items-center !gap-2 !rounded-lg !px-3 !py-2 !bg-black !bg-opacity-85 !border !border-black/40 !shadow-inner",
                    includeSota ? "!opacity-100" : "!opacity-70"
                  )}
                  inputClassName="!border !border-white !bg-transparent focus:!ring-white checked:!bg-white checked:!border-white"
                  iconClassName="!text-black"
                />
              </div>
            </div>
            <div className="mb-2 mt-0.5 space-y-2 px-1">
              <Input
                prefix={<LuSearch className="w-4" />}
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
              />
            </div>
            {filteredAgents.map((miner) => {
              const isActive = miner.uid.toString() === id;
              const firstNonSotaUid = filteredAgents.find((agent) => !agent.isSota)?.uid;
              const isTopRanked = miner.ranking === 1;
              const showCrown = includeSota
                ? isTopRanked
                : firstNonSotaUid === miner.uid;
              const highlightTop =
                (!includeSota && firstNonSotaUid === miner.uid) ||
                (includeSota && isTopRanked);
              const displayRank = nonSotaRankByUid.get(miner.uid);
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
                    return "bg-white/80 text-black border border-gray-200";
                }
              })();

              return (
                <Link
                  key={`miner-menu-${miner.uid}`}
                  href={
                    typeof effectiveRound === "number"
                      ? `/agents/${miner.uid}?round=${effectiveRound}&agent=${miner.uid}`
                      : `/agents/${miner.uid}`
                  }
                >
                  <div
                    className={cn(
                      "relative flex items-center w-full pl-2.5 pr-2 py-2 rounded-lg transition-all duration-200 group overflow-visible",
                      isActive
                        ? "bg-white text-black border border-white/70 shadow-lg"
                        : highlightTop
                        ? "bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-500/40 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    )}
                  >
                    {/* Crown badge for top agent - positioned at top-left corner */}
                    {showCrown && (
                      <div className="absolute -top-2 -right-2 rounded-full p-1.5 shadow-xl border-2 z-10 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 border-orange-300">
                        <FaCrown className="w-3 h-3 text-white drop-shadow-sm" />
                      </div>
                    )}

                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 mr-3 flex items-center justify-center">
                      <Image
                        src={`/miners/${miner.uid % 50}.svg`}
                        alt={miner.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold truncate",
                            isActive
                              ? "text-black"
                              : highlightTop
                                ? "text-white"
                                : "text-gray-300 group-hover:text-white"
                          )}
                        >
                          {miner.name}
                        </span>
                        {miner.isSota && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">
                            (SOTA)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {showRankBadge && (
                          <span
                            className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5",
                            rankBadgePalette,
                            isActive && displayRank
                                ? "ring-1 ring-gray-300/80"
                                : highlightTop && displayRank
                                  ? "ring-1 ring-orange-300/60"
                                  : ""
                          )}
                          >
                            #{displayRank}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-xs font-mono",
                            isActive
                              ? "text-black"
                              : highlightTop
                                ? "text-orange-300"
                                : "text-gray-500 group-hover:text-gray-300"
                          )}
                        >
                          UID: {miner.uid}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isActive
                              ? "text-black"
                              : highlightTop
                                ? "text-orange-200"
                                : "text-gray-400 group-hover:text-gray-200"
                          )}
                        >
                          Score: {(miner.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
