"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunStats from "./agent-run-stats";
import AgentRunChart from "./agent-run-chart";
import AgentRunSummary from "./agent-run-summary";

export default function AgentRun() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title={`Agent Run ${id}`} className="mt-4" />
      <AgentRunStats />
      <PageHeader title={"Agent Run Details"} className="mt-4" />
      <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-6">
        <div className="xl:col-span-3">
          <AgentRunChart /> 
        </div>
        <div className="xl:col-span-1">
          <AgentRunSummary />
        </div>
      </div>
    </>
  );
}
