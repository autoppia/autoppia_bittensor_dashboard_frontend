"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import Placeholder from "@/app/shared/placeholder";
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
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useAgentRunStats(id as string);
  const {
    summary,
    isLoading: isSummaryLoading,
  } = useAgentRunSummary(id as string);

  const fallbackDetail = useMemo<AgentRunDetailData>(() => {
    return getFallbackDetailData(summary?.agentId);
  }, [summary?.agentId]);

  const { data } = useMemo(() => {
    return transformStatsToDetailData(stats, fallbackDetail);
  }, [stats, fallbackDetail]);

  const shouldShowPlaceholder =
    (!stats && isStatsLoading) || (!summary && isSummaryLoading);

  if (shouldShowPlaceholder) {
    return <AgentRunDetailPlaceholder className={className} />;
  }

  if (statsError && !stats) {
    return <AgentRunDetailPlaceholder className={className} />;
  }

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

function AgentRunDetailPlaceholder({ className }: { className?: string }) {
  const progressWidths = ["68%", "52%", "78%"];

  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      {/* Header Card Skeleton */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-700/50 rounded" />
              <div className="h-4 w-64 bg-slate-700/30 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-slate-700/30 rounded hidden md:block" />
            <div className="h-9 w-28 bg-slate-700/50 rounded-lg" />
            <div className="h-9 w-40 bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Performance Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6">
        {progressWidths.map((progressWidth, index) => (
          <div
            key={`placeholder-card-${index}`}
            className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-700/50" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-32 bg-slate-700/50 rounded" />
                    <div className="h-6 w-20 bg-slate-700/30 rounded-full" />
                  </div>
                  <div className="h-4 w-40 bg-slate-700/30 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-700/30 rounded ml-auto" />
                <div className="h-12 w-24 bg-slate-700/50 rounded" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-5 w-full rounded-full bg-slate-900/50 border border-slate-700/50 overflow-hidden">
                <div
                  className="h-full bg-slate-700/50 rounded-full"
                  style={{ width: progressWidth }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {Array.from({ length: 5 }, (_, markerIndex) => (
                  <div
                    key={`marker-${markerIndex}`}
                    className="h-3 w-8 bg-slate-700/30 rounded"
                  />
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, metricIndex) => (
                <div
                  key={`metric-${metricIndex}`}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-3 w-24 bg-slate-700/30 rounded" />
                    <div className="w-4 h-4 bg-slate-700/30 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-slate-700/50 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
