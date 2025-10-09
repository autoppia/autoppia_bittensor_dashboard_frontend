"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import AgentStats from "./agent-stats";
import AgentScoreChart from "./agent-score-chart";
import AgentScoreAnalytics from "./agent-score-analytics";
import AgentValidators from "./agent-validators";
import { Text } from "rizzui";
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
            <span className="text-sm text-gray-600">
              Hotkey: {miner?.hotkey.slice(0, 6)}...{miner?.hotkey.slice(-6)}
            </span>
          </div>
        </div>
      </div>
      <AgentStats />
      <Text className="text-2xl font-bold text-gray-900 mt-6">
        Score Analytics
      </Text>
      <div className="flex flex-col xl:flex-row gap-6 items-start mt-4">
        <AgentScoreChart className="w-full xl:w-[calc(100%-320px)]" />
        <AgentScoreAnalytics className="w-full xl:w-[320px]" />
      </div>
      <AgentValidators />
    </>
  );
}
