"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/app/shared/page-header";
import AgentsSidebar from "./agents-sidebar";
import AgentsSummary from "./agents-summary";
import { getAgentById, getAgentSummaryData } from "@/data/query";
import DetailsChart from "./agents-detail";

// Helper function to derive a fallback name from the ID
const getFallbackName = (id: string): string => {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Details() {
  const { id } = useParams();
  const selectedAgent = getAgentById(id as string);
  const agentSummaryData = getAgentSummaryData(id as string);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);

  // Use agent name if available, otherwise derive from ID
  const agentName = selectedAgent?.name || getFallbackName(id as string);

  return (
    <div className="flex justify-end w-full">
      <AgentsSidebar className="fixed hidden xl:block" />
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <PageHeader title={agentName} className="mt-4" />
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6">
          <DetailsChart
            className="xl:col-span-8"
            selectedWebsite={selectedWebsite}
            setSelectedWebsite={setSelectedWebsite}
            hoveredUseCase={hoveredUseCase}
            setHoveredUseCase={setHoveredUseCase}
          />
          <AgentsSummary
            className="xl:col-span-4"
            {...agentSummaryData}
            selectedWebsite={selectedWebsite}
            setHoveredUseCase={setHoveredUseCase}
          />
        </div>
      </div>
    </div>
  );
}