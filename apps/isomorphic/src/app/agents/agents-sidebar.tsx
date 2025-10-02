"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Text, Input } from "rizzui";
import { LuSearch } from "react-icons/lu";
import { minersData, MinerDataType } from "@/data/miners-data";

export default function AgentsSidebar() {
  const { id } = useParams();
  const [query, setQuery] = useState<string>("");
  const [filteredMiners, setFilteredMiners] =
    useState<MinerDataType[]>(minersData);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
    setFilteredMiners(
      minersData.filter(
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
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto px-4 mt-3 scroll-smooth">
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
                  setFilteredMiners(minersData);
                }}
              />
            </div>
            {filteredMiners.map((miner) => {
              const isActive = miner.uid === parseInt(id as string);

              return (
                <Link
                  key={`agent-menu-${miner.uid}`}
                  href={`/agents/${miner.uid}`}
                >
                  <div
                    className={cn(
                      "flex items-center w-full px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100",
                      isActive &&
                        "bg-gradient-primary text-white hover:bg-gradient-primary"
                    )}
                  >
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100 @sm:h-12 @sm:w-12">
                      <Image
                        src={`/miners/${miner.uid % 50}.svg`}
                        alt={miner.uid.toString()}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col ms-3">
                      <span className="text-base font-medium">
                        Miner {miner.uid}
                      </span>
                      <span className="w-40 truncate text-xs">
                        {miner.hotkey}
                      </span>
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
