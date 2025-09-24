"use client";

import MinerChart from "@/app/shared/miner-chart";
import PageHeader from "@/app/shared/page-header";
import { leaderboardData } from "@/data/leaderboard-data";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";

export default function Overview() {
  return (
    <>
      <PageHeader title={"Network Analytics"} className="mt-4" />
      <div className="flex gap-8">
        <div className="w-[calc(100%-500px)]">
          <MinerChart title="Top Miner" data={leaderboardData} />
        </div>
        <OverviewMetrics />
      </div>      
      <OverviewValidators />
    </>
  );
}