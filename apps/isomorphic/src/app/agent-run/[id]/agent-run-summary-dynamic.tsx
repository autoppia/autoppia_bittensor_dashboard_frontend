"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useAgentRunStats,
  useAgentRunSummary,
} from "@/services/hooks/useAgentRun";
import AgentRunSummary from "./agent-run-summary";
import {
  buildSummaryChartData,
  getFallbackDetailData,
  getFallbackSummaryData,
  transformStatsToDetailData,
} from "./agent-run-data.utils";
import type { AgentRunDetailData, AgentRunSummaryChartData } from "./agent-run-types";

interface AgentRunSummaryDynamicProps {
  className?: string;
  selectedWebsite?: string | null;
}

export default function AgentRunSummaryDynamic({
  className,
  selectedWebsite,
}: AgentRunSummaryDynamicProps) {
  const { id } = useParams();

  const { summary } = useAgentRunSummary(id as string);

  const { stats } = useAgentRunStats(id as string);

  const fallbackDetail = useMemo<AgentRunDetailData>(() => {
    return getFallbackDetailData(summary?.agentId);
  }, [summary?.agentId]);

  const fallbackSummary = useMemo<AgentRunSummaryChartData>(() => {
    return getFallbackSummaryData(summary?.agentId);
  }, [summary?.agentId]);

  const { data: detailData } = useMemo(() => {
    return transformStatsToDetailData(stats, fallbackDetail);
  }, [stats, fallbackDetail]);

  const summaryChartData = useMemo(() => {
    return buildSummaryChartData(summary, detailData, fallbackSummary);
  }, [summary, detailData, fallbackSummary]);

  return (
    <div className={className}>
      <AgentRunSummary
        className="h-full"
        selectedWebsite={selectedWebsite}
        data={detailData}
        summaryData={summaryChartData}
      />
    </div>
  );
}
