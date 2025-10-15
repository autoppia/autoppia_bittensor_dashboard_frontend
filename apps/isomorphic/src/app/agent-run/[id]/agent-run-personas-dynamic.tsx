"use client";

import { useParams } from "next/navigation";
import {
  useAgentRunPersonas,
  useAgentRunSummary,
} from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";
import AgentRunPersonas from "./agent-run-personas";

function resolveImageSrc(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
) {
  if (!src || typeof src !== "string") return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

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
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl"
          >
            <div className="flex min-h-[150px] items-center gap-5">
              <Placeholder
                variant="circular"
                width={56}
                height={56}
                className="bg-slate-700"
              />
              <div className="flex-1 space-y-2">
                <Placeholder height="1.25rem" width="60%" className="bg-slate-700" />
                <Placeholder height="0.9rem" width="40%" className="bg-slate-700" />
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
