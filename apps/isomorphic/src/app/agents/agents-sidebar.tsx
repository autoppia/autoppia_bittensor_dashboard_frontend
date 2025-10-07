"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Text, Input } from "rizzui";
import { LuSearch } from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { sortedMinersData, MinerDataType } from "@/data/miners-data";

export default function AgentsSidebar() {
  const { id } = useParams();
  const [query, setQuery] = useState<string>("");
  const [filteredMiners, setFilteredMiners] =
    useState<MinerDataType[]>(sortedMinersData);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
    setFilteredMiners(
      sortedMinersData.filter(
        (miner) =>
          miner.uid.toString().includes(query) || miner.hotkey.includes(query)
      )
    );
  };

  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className="h-full border rounded-xl bg-gray-50 pb-4">
        <Text className="sticky top-0 px-6 py-4 text-2xl font-bold text-gray-900 border-b">
          All Agents
        </Text>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2 mt-3 scroll-smooth">
          <div className="flex flex-col gap-1">
            <div className="mb-2">
              <Input
                prefix={<LuSearch className="w-4" />}
                placeholder="Enter UID or Hotkey..."
                clearable={true}
                value={query}
                onChange={handleSearch}
                onClear={() => {
                  setQuery("");
                  setFilteredMiners(sortedMinersData);
                }}
              />
            </div>
            {filteredMiners.map((miner) => {
              const isActive = miner.uid === parseInt(id as string);
              const isTopRanked = miner.ranking === 1;

              return (
                <Link
                  key={`agent-menu-${miner.uid}`}
                  href={`/agents/${miner.uid}`}
                >
                  <div
                    className={cn(
                      "relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                      isTopRanked &&
                        "bg-yellow-500/10 border border-yellow-400 text-gray-900 hover:bg-yellow-500/20",
                      isActive
                        ? "bg-emerald-500/50 text-gray-900"
                        : "hover:bg-emerald-500/20"
                    )}
                  >
                    {/* Crown badge for top miner - positioned at top-left corner */}
                    {isTopRanked && (
                      <div
                        className={cn(
                          "absolute -top-2 -left-2 rounded-full p-1 shadow-xl border-2 z-10",
                          isActive
                            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-yellow-900 border-yellow-300 animate-pulse"
                            : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-yellow-900 border-yellow-300"
                        )}
                      >
                        <FaCrown className="w-3 h-3 drop-shadow-sm" />
                      </div>
                    )}

                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 mr-3">
                      <Image
                        src={`/miners/${miner.uid % 50}.svg`}
                        alt={miner.uid.toString()}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate text-gray-900">
                        Miner {miner.uid}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {miner.hotkey.slice(0, 6)}...{miner.hotkey.slice(-6)}
                      </span>
                    </div>

                    {/* Ranking badge - adaptive width, positioned on the right */}
                    <div
                      className={cn(
                        "flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold shrink-0 ml-2",
                        isTopRanked
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 shadow-md"
                          : "bg-gray-200 text-gray-700"
                      )}
                    >
                      #{miner.ranking}
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
