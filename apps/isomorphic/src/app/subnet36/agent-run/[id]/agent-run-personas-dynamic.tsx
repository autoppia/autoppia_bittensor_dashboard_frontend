"use client";

import { useParams } from "next/navigation";
import {
  useAgentRunPersonas,
  useAgentRunSummary,
} from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";
import AgentRunPersonas from "./agent-run-personas";

export default function AgentRunPersonasDynamic() {
  const { id } = useParams();
  const { personas, isLoading, error } = useAgentRunPersonas(id as string);
  const { summary } = useAgentRunSummary(id as string);

  if (isLoading || error || !personas) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/22 to-purple-500/22 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 -bottom-16 h-48 w-48 rounded-full bg-purple-500/20 blur-[120px]" />
            <div className="flex min-h-[132px] items-center gap-4">
              <Placeholder
                variant="circular"
                width={48}
                height={48}
                className="bg-white/20"
              />
              <div className="flex-1 space-y-2">
                <Placeholder height="1.1rem" width="55%" className="bg-white/20" />
                <Placeholder height="0.85rem" width="38%" className="bg-white/15" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Pass the data to the redesigned static component
  return <AgentRunPersonas personas={personas} summary={summary} />;
}
