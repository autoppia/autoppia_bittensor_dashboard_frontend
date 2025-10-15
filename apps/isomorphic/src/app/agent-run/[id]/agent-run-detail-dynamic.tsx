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
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/15 via-sky-400/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/10 via-emerald-500/5 to-transparent blur-[120px]" />

      <div className="relative mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
              <Placeholder
                variant="circular"
                width={28}
                height={28}
                className="bg-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Placeholder
                height="1.5rem"
                width="14rem"
                className="bg-slate-700/80"
              />
              <Placeholder
                height="1rem"
                width="18rem"
                className="bg-slate-800/80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Placeholder
              height="1rem"
              width="4rem"
              className="hidden rounded-full bg-slate-800/70 md:block"
            />
            <div className="flex items-center gap-2">
              <Placeholder
                height="2.25rem"
                width="5.5rem"
                className="rounded-lg bg-slate-800/70"
              />
              <Placeholder
                height="2.25rem"
                width="7.5rem"
                className="rounded-lg bg-slate-800/70"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-6">
        {progressWidths.map((progressWidth, index) => (
          <div
            key={`placeholder-card-${index}`}
            className="relative rounded-xl border border-slate-700/50 bg-slate-900/60 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Placeholder
                  variant="circular"
                  width={12}
                  height={12}
                  className="bg-slate-600"
                />
                <Placeholder
                  height="1.1rem"
                  width="8rem"
                  className="bg-slate-700/80"
                />
                <Placeholder
                  height="1.1rem"
                  width="5rem"
                  className="rounded-full bg-slate-800/60"
                />
              </div>
              <div className="space-y-2 text-right">
                <Placeholder
                  height="1.75rem"
                  width="3.5rem"
                  className="bg-slate-700/70"
                />
                <Placeholder
                  height="1rem"
                  width="10rem"
                  className="bg-slate-800/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800/80">
                <Placeholder
                  height="100%"
                  width={progressWidth}
                  className="bg-slate-700/80"
                />
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 5 }, (_, markerIndex) => (
                  <Placeholder
                    key={`marker-${markerIndex}`}
                    height="0.75rem"
                    width="2.25rem"
                    className="bg-slate-800/60"
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              {Array.from({ length: 2 }, (_, metricIndex) => (
                <div
                  key={`metric-${metricIndex}`}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
                >
                  <Placeholder
                    height="0.85rem"
                    width="70%"
                    className="mb-2 bg-slate-700/70"
                  />
                  <Placeholder
                    height="1.4rem"
                    width="50%"
                    className="bg-slate-600/70"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
