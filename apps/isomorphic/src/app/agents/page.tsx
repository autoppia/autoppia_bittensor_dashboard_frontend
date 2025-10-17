"use client";

import { useEffect, useState } from "react";
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
  const [redirecting, setRedirecting] = useState(false);
  const { data: minersData, loading } = useMinersList({
    limit: 100,
  });

  useEffect(() => {
    if (redirecting) {
      return;
    }

    const miners = minersData?.miners;
    if (!miners || miners.length === 0) {
      return;
    }

    const topMiner = miners.find((miner) => miner.ranking === 1) ?? miners[0];
    setRedirecting(true);
    try {
      router.push(`/agents/${topMiner.uid}`);
    } catch (error) {
      console.error("Failed to redirect to agent profile:", error);
      setRedirecting(false);
    }
  }, [minersData, redirecting, router]);

  if (loading || redirecting || !minersData?.miners?.length) {
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
