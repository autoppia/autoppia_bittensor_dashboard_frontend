"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentDetail from "./agent-detail";
import AgentSummary from "./agent-summary";
import AgentRunTable from "./agent-run-table";
import { getAgentSummaryData } from "@/data/query";

export default function Agent() {
  const { id } = useParams();
  const agentSummaryData = getAgentSummaryData(id as string);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={`Agent ${id}`} className="mt-4" />
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6">
        <AgentDetail
          className="xl:col-span-8"
          selectedWebsite={selectedWebsite}
          setSelectedWebsite={setSelectedWebsite}
          hoveredUseCase={hoveredUseCase}
          setHoveredUseCase={setHoveredUseCase}
          period={period}
          setPeriod={setPeriod}
        />
        <AgentSummary
          className="xl:col-span-4"
          {...agentSummaryData}
          selectedWebsite={selectedWebsite}
          setHoveredUseCase={setHoveredUseCase}
        />
      </div>
      <AgentRunTable />
    </>
  );
}
