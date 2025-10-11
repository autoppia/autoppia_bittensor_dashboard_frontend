"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import AgentStats from "./agent-stats";
import AgentScoreChart from "./agent-score-chart";
import AgentScoreAnalytics from "./agent-score-analytics";
import AgentValidators from "./agent-validators";
import { Text } from "rizzui";
import { minersData } from "@/data/miners-data";
import { PiGithubLogoDuotone, PiHashDuotone, PiKeyDuotone, PiCopyDuotone } from "react-icons/pi";

export default function Agent() {
  const { id } = useParams();
  const miner = minersData.find(
    (miner) => miner.uid === parseInt(id as string)
  );

  return (
    <>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div className="flex items-center gap-6">
          <Image
            src={`/miners/${parseInt(id as string) % 50}.svg`}
            alt={id as string}
            width={56}
            height={56}
            className="rounded-full border-2 border-gray-200 shadow-sm"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">Miner {id}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <PiHashDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono">UID: {miner?.uid}</span>
              </div>
              <div className="flex items-center gap-2">
                <PiKeyDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono">
                  {miner?.hotkey.slice(0, 8)}...{miner?.hotkey.slice(-8)}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(miner?.hotkey || '')}
                  className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors duration-200 group"
                  title="Copy hotkey"
                >
                  <PiCopyDuotone className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* GitHub and Taostats icons on top right */}
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group">
            <PiGithubLogoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          </button>
          <a
            href={`https://taostats.io/subnets/36/metagraph?filter=${miner?.hotkey || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
            title="View on Taostats"
          >
            <Image
              src="https://taostats.io/favicon.ico"
              alt="Taostats"
              width={20}
              height={20}
              className="group-hover:scale-110 transition-transform duration-200"
            />
          </a>
        </div>
      </div>
      <AgentStats />
      <div className="flex flex-col xl:flex-row gap-6 items-start mt-6">
        <AgentScoreChart className="w-full xl:w-[calc(100%-320px)]" />
        <AgentScoreAnalytics className="w-full xl:w-[320px]" />
      </div>
      <AgentValidators />
    </>
  );
}
