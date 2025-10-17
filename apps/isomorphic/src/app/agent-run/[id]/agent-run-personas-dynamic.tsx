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

  // Debug: Log the data loading state
  console.log("AgentRunPersonasDynamic - id:", id);
  console.log("AgentRunPersonasDynamic - personas:", personas);
  console.log("AgentRunPersonasDynamic - isLoading:", isLoading);
  console.log("AgentRunPersonasDynamic - error:", error);
  console.log("AgentRunPersonasDynamic - summary:", summary);

  if (isLoading || error || !personas) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl"
          >
            <div className="flex min-h-[132px] items-center gap-4">
              <Placeholder
                variant="circular"
                width={48}
                height={48}
                className="bg-slate-700/30"
              />
              <div className="flex-1 space-y-2">
                <Placeholder height="1.1rem" width="55%" className="bg-slate-700/30" />
                <Placeholder height="0.85rem" width="38%" className="bg-slate-800/25" />
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
