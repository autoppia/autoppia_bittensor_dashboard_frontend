"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMinersList } from "@/services/hooks/useAgents";
import {
  AgentHeaderPlaceholder,
  AgentStatsPlaceholder,
  AgentScoreChartPlaceholder,
  AgentScoreAnalyticsPlaceholder,
  AgentValidatorsPlaceholder,
} from "@/components/placeholders/agent-placeholders";

export default function Page() {
  const router = useRouter();
  const { data: minersData, loading } = useMinersList({
    limit: 100,
  });

  useEffect(() => {
    if (minersData?.miners && minersData.miners.length > 0) {
      const topMiner = minersData.miners.find((miner) => miner.ranking === 1);

      if (topMiner) {
        router.push(`/agents/${topMiner.uid}`);
      } else {
        router.push(`/agents/${minersData.miners[0].uid}`);
      }
    }
  }, [minersData, router]);

  if (loading || !minersData?.miners?.length) {
    return (
      <div className="space-y-6">
        <AgentHeaderPlaceholder />
        <AgentStatsPlaceholder />
        <div className="flex flex-col xl:flex-row items-stretch gap-6">
          <AgentScoreChartPlaceholder className="w-full xl:w-[calc(100%-320px)]" />
          <AgentScoreAnalyticsPlaceholder className="w-full xl:w-[320px]" />
        </div>
        <AgentValidatorsPlaceholder />
      </div>
    );
  }

  return null;
}
