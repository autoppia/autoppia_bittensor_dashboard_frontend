"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentScoreChart from "./agent-score-chart";
import AgentRankingChart from "./agent-ranking-chart";
import { minersData } from "@/data/miners-data";
import { minersScoreData } from "@/data/miners-score-data";
import AgentRunTable from "./agent-run-table";
import { Button, Input } from "rizzui";
import { PiMagnifyingGlassBold } from "react-icons/pi";

export default function Agent() {
  const { id } = useParams();
  const [query, setQuery] = useState<string>("");
  const router = useRouter();

  const miner = minersData.find(
    (miner) => miner.uid.toString() === id || miner.hotkey === id
  );

  const handleSearch = () => {
    const miner = minersData.find(
      (miner) => miner.uid.toString() === query || miner.hotkey === query
    );
    if (miner) {
      router.push(`/agents/${miner.uid}`);
    }
  };

  return (
    <>
      <PageHeader title={`Agent ${miner?.uid}`} className="mt-4">
        <div className="flex items-start gap-2">
          <Input
            type="search"
            placeholder="Enter UID or hotkey..."
            prefix={<PiMagnifyingGlassBold className="size-4" />}
            inputClassName="text-gray-900 border-gray-900 placeholder-gray-700"
            errorClassName="text-md"
            className="w-[300px]"
            rounded="pill"
            clearable
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onClear={() => {
              setQuery("");
            }}
          />
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentScoreChart title="Score History" data={minersScoreData} />
        <AgentRankingChart title="Ranking History" data={minersScoreData} />
      </div>
      <AgentRunTable />
    </>
  );
}
