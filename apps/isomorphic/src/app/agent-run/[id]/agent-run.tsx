"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunSidebar from "./agent-run-sidebar";
import AgentRunStats from "./agent-run-stats";
import AgentRunDetail from "./agent-run-detail";
import AgentRunSummary from "./agent-run-summary";
import TasksTable from "@/app/shared/tasks-table/table";
import { getAgentSummaryData } from "@/data/query";
import { agentRunData } from "@/data/agent-run-data";

export default function AgentRun() {
  const { id } = useParams();
  const agentRun = agentRunData.find((run) => run.runUid === id);

  const agentSummaryData = getAgentSummaryData(
    agentRun?.agentUid.toString() ?? ""
  );
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={`Agent Run ${id}`} className="mt-4" />
      <AgentRunStats />
      <PageHeader title={"Agent Run Details"} className="mt-4" />
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6">
        <AgentRunDetail
          className="xl:col-span-8"
          selectedWebsite={selectedWebsite}
          setSelectedWebsite={setSelectedWebsite}
          hoveredUseCase={hoveredUseCase}
          setHoveredUseCase={setHoveredUseCase}
          period={period}
          setPeriod={setPeriod}
        />
        <AgentRunSummary
          className="xl:col-span-4"
          {...agentSummaryData}
          selectedWebsite={selectedWebsite}
          setHoveredUseCase={setHoveredUseCase}
        />
      </div>
      <TasksTable />
    </>
  );
}
