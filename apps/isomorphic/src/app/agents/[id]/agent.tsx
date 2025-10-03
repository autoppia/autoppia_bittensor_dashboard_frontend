"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import AgentStats from "./agent-stats";
import AgentScoreChart from "./agent-score-chart";
import AgentScoreAnalytics from "./agent-score-analytics";
import AgentValidators from "./agent-validators";
import { minersData } from "@/data/miners-data";

export default function Agent() {
  const { id } = useParams();
  const miner = minersData.find(
    (miner) => miner.uid === parseInt(id as string)
  );

  return (
    <>
      <div className="flex items-center justify-between mt-2 mb-4">
        <div className="flex items-center gap-4">
          <Image
            src={`/miners/${parseInt(id as string) % 50}.svg`}
            alt={id as string}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">Miner {id}</span>
            <span className="text-sm text-gray-700">Hotkey: {miner?.hotkey}</span>
          </div>
        </div>
      </div>
      <AgentStats />
      <div className="flex gap-8 items-start">
        <AgentScoreChart />
        <AgentScoreAnalytics className="w-[450px]" />
      </div>
      <AgentValidators />
    </>
  );
}
