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
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-6 -bottom-28 h-72 w-72 rounded-full bg-purple-500/25 blur-[140px]" />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(245, 222, 179, 0.18)" }}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-h-[180px] flex-col justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 px-6 py-6 backdrop-blur-sm">
            <Placeholder
              variant="circular"
              width={90}
              height={90}
              className="bg-white/20"
            />
            <div className="flex-1 space-y-1.5">
              <Placeholder height="1.1rem" width="55%" className="bg-white/20" />
              <Placeholder height="0.8rem" width="40%" className="bg-white/15" />
            </div>
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex min-h-[140px] flex-col justify-between gap-3 rounded-3xl border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm"
            >
              <Placeholder height="0.9rem" width="45%" className="bg-white/20" />
              <Placeholder height="0.8rem" width="35%" className="bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pass the data to the redesigned static component
  return <AgentRunStats stats={stats} />;
}
