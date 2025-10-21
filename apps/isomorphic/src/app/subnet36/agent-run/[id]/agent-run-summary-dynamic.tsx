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
  const donutInner = (
    <div className="relative flex items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        <Placeholder
          variant="circular"
          width={200}
          height={200}
          className="border border-white/15 bg-white/10"
        />
        <div className="absolute flex flex-col items-center gap-2">
          <Placeholder
            height="2.25rem"
            width="4rem"
            className="rounded-lg bg-white/20"
          />
          <Placeholder
            height="0.9rem"
            width="7.5rem"
            className="rounded bg-white/15"
          />
          <Placeholder
            height="0.9rem"
            width="6.5rem"
            className="rounded bg-white/15"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div
        className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(245, 222, 179, 0.18)" }}
      />

      <div className="relative mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl border border-white/15 bg-white/10 p-2">
            <Placeholder
              variant="circular"
              width={24}
              height={24}
              className="bg-white/20"
            />
          </div>
          <Placeholder
            height="1.35rem"
            width="6rem"
            className="bg-white/20"
          />
        </div>
        <Placeholder
          height="0.75rem"
          width="10rem"
          className="bg-white/15"
        />
      </div>

      <div className="relative text-white/80">
        {donutInner}
        <div className="mt-6 flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`summary-placeholder-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-4"
            >
              <div className="flex items-center gap-2">
                <Placeholder
                  variant="circular"
                  width={12}
                  height={12}
                  className="bg-white/30"
                />
                <Placeholder
                  height="0.85rem"
                  width="7rem"
                  className="bg-white/20"
                />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder
                  height="1rem"
                  width="3.75rem"
                  className="bg-white/20"
                />
                <Placeholder
                  height="0.75rem"
                  width="8rem"
                  className="bg-white/15"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
