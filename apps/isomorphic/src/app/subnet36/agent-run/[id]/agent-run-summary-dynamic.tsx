"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import Placeholder from "@/app/shared/placeholder";
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
import type {
  AgentRunDetailData,
  AgentRunSummaryChartData,
} from "./agent-run-types";

interface AgentRunSummaryDynamicProps {
  className?: string;
  selectedWebsite?: string | null;
}

export default function AgentRunSummaryDynamic({
  className,
  selectedWebsite,
}: AgentRunSummaryDynamicProps) {
  const { id } = useParams();

  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useAgentRunSummary(id as string);

  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useAgentRunStats(id as string);

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

  const shouldShowPlaceholder =
    (!summary && isSummaryLoading) || (!stats && isStatsLoading);

  if (shouldShowPlaceholder) {
    return <AgentRunSummaryPlaceholder className={className} />;
  }

  if ((summaryError && !summary) || (statsError && !stats)) {
    return <AgentRunSummaryPlaceholder className={className} />;
  }

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

function AgentRunSummaryPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl animate-pulse", className)}>
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-700/50 rounded" />
            <div className="h-4 w-48 bg-slate-700/30 rounded" />
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="h-[280px] w-full mb-6 flex items-center justify-center">
        <div className="relative">
          <div className="w-[220px] h-[220px] rounded-full border-[20px] border-slate-700/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-20 bg-slate-700/50 rounded" />
            <div className="h-3 w-24 bg-slate-700/30 rounded" />
            <div className="h-3 w-28 bg-slate-700/30 rounded" />
          </div>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`summary-placeholder-${index}`}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-3 w-3 rounded-full bg-slate-700/50" />
              <div className="h-4 w-32 bg-slate-700/50 rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-5 w-16 bg-slate-700/50 rounded" />
              <div className="h-3 w-24 bg-slate-700/30 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
