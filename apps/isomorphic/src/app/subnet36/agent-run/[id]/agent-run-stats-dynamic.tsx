"use client";

import { useParams } from "next/navigation";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";
import AgentRunStats from "./agent-run-stats";

export default function AgentRunStatsDynamic() {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  if (isLoading || error || !stats) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl mb-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-h-[180px] flex-col justify-between gap-4 rounded-3xl border border-slate-700/20 bg-slate-800/20 px-6 py-6">
            <Placeholder
              variant="circular"
              width={90}
              height={90}
              className="bg-slate-700/30"
            />
            <div className="flex-1 space-y-1.5">
              <Placeholder height="1.1rem" width="55%" className="bg-slate-700/30" />
              <Placeholder height="0.8rem" width="40%" className="bg-slate-700/30" />
            </div>
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex min-h-[140px] flex-col justify-between gap-3 rounded-3xl border border-slate-700/20 bg-slate-800/20 px-5 py-5"
            >
              <Placeholder height="0.9rem" width="45%" className="bg-slate-700/30" />
              <Placeholder height="0.8rem" width="35%" className="bg-slate-700/30" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pass the data to the redesigned static component
  return <AgentRunStats stats={stats} />;
}
