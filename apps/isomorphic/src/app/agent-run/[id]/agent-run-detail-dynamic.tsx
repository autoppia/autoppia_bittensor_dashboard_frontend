"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useAgentRunStats,
  useAgentRunSummary,
} from "@/services/hooks/useAgentRun";
import AgentRunDetail from "./agent-run-detail";
import {
  getFallbackDetailData,
  transformStatsToDetailData,
} from "./agent-run-data.utils";
import type { AgentRunDetailData } from "./agent-run-types";

interface AgentRunDetailDynamicProps {
  className?: string;
  selectedWebsite: string | null;
  setSelectedWebsite: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
}

export default function AgentRunDetailDynamic({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
}: AgentRunDetailDynamicProps) {
  const { id } = useParams();
  const { stats } = useAgentRunStats(id as string);
  const { summary } = useAgentRunSummary(id as string);

  const fallbackDetail = useMemo<AgentRunDetailData>(() => {
    return getFallbackDetailData(summary?.agentId);
  }, [summary?.agentId]);

  const { data } = useMemo(() => {
    return transformStatsToDetailData(stats, fallbackDetail);
  }, [stats, fallbackDetail]);

  return (
    <div className={className}>
      <AgentRunDetail
        className="h-full"
        selectedWebsite={selectedWebsite}
        setSelectedWebsite={setSelectedWebsite}
        period={period}
        setPeriod={setPeriod}
        data={data}
      />
    </div>
  );
}
