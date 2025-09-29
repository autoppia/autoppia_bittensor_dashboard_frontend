"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/app/shared/page-header";
import AgentRunSummary from "./agent-run-summary";
import { getAgentById, getAgentSummaryData } from "@/data/query";
import AgentRunChart from "./agent-run-chart";

// Helper function to derive a fallback name from the ID
const getFallbackName = (id: string): string => {
  if (!id) return "Agent Run";
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "); 
};

export default function AgentRun() {
  const { id } = useParams();
  const agentId = id as string || "temp";
  const selectedAgent = getAgentById(agentId);
  const agentSummaryData = getAgentSummaryData(agentId);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  // Use agent name if available, otherwise derive from ID
  const agentName = selectedAgent?.name || getFallbackName(agentId);

  return (
    <>
      <PageHeader title={agentName} className="mt-4" />
      <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-6">
        <AgentRunChart
          className="xl:col-span-3"
          selectedWebsite={selectedWebsite}
          setSelectedWebsite={setSelectedWebsite}
        />
        <AgentRunSummary
          className="xl:col-span-1"
          {...agentSummaryData}
          selectedWebsite={selectedWebsite}
        />
      </div>
    </>
  );
}
