"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Text, Input, Checkbox } from "rizzui";
import { LuSearch } from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { useMinersList } from "@/services/hooks/useAgents";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import type { MinimalAgentData } from "@/services/api/types/agents";

export default function AgentsSidebar() {
  const { id } = useParams();
  const [query, setQuery] = useState<string>("");
  const [includeSota, setIncludeSota] = useState<boolean>(false);
  const [filteredAgents, setFilteredAgents] = useState<MinimalAgentData[]>([]);

  // Fetch miners data using optimized endpoint
  const { data: minersData, loading, error } = useMinersList({
    limit: 100,
  });

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
  if (loading) {
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
        <Text className="sticky top-0 px-5 py-3 text-2xl font-bold text-gray-900 border-b">
          All Miners
        </Text>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto pl-3 pr-1.5 mt-2.5 pt-3 pb-3 scroll-smooth">
          <div className="flex flex-col gap-1">
            <div className="mb-2 space-y-2">
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
              <div className="flex">
                <Checkbox
                  id="show-sota-agents"
                  checked={includeSota}
                  onChange={(e) => setIncludeSota(e.target.checked)}
                  label="Show SOTA agents"
                  labelPlacement="right"
                  labelClassName="!text-xs !font-semibold !uppercase !tracking-wide !text-white !flex-1"
                  className={cn(
                    "!flex !w-full !flex-row !items-center !justify-between !gap-3 !rounded-lg !px-3 !py-2 !bg-black !bg-opacity-85 !border !border-black/40 !shadow-inner",
                    includeSota ? "!opacity-100" : "!opacity-70"
                  )}
                  inputClassName="!border !border-white !bg-transparent focus:!ring-white checked:!bg-white checked:!border-white"
                  iconClassName="!text-black"
                />
              </div>
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
                  href={`/agents/${miner.uid}`}
                >
                  <div
                    className={cn(
                      "relative flex items-center w-full pl-2.5 pr-2 py-2 rounded-lg transition-all duration-200 group overflow-visible",
                      isActive
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-white shadow-lg"
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
                              ? "text-white"
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
                                ? "ring-1 ring-emerald-300/60"
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
                            "text-xs font-medium",
                            isActive
                              ? "text-emerald-200"
                              : highlightTop
                                ? "text-orange-200"
                                : "text-gray-400 group-hover:text-gray-200"
                          )}
                        >
                          Score: {(miner.score * 100).toFixed(1)}%
                        </span>
                        <span
                          className={cn(
                            "text-xs font-mono",
                            isActive
                              ? "text-emerald-300"
                              : highlightTop
                                ? "text-orange-300"
                                : "text-gray-500 group-hover:text-gray-300"
                          )}
                        >
                          UID: {miner.uid}
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
