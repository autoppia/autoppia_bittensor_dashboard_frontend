"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentScoreChart from "./agent-score-chart";
import AgentRankingChart from "./agent-ranking-chart";
import { minersData } from "@/data/miners-data";
import { minersScoreData } from "@/data/miners-score-data";
import AgentRunTable from "./agent-run-table";


export default function Agent() {
  const { id } = useParams();
  const miner = minersData.find(
    (miner) => miner.uid.toString() === id || miner.hotkey === id
  );

  return (
    <>
      <PageHeader title={`Agent ${miner?.uid}`} className="mt-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentScoreChart title="Score History" data={minersScoreData} />
        <AgentRankingChart title="Ranking History" data={minersScoreData} />
      </div>
      <AgentRunTable />
    </>
  );
}
