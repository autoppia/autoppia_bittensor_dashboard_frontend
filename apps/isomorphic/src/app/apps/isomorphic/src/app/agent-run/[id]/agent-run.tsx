"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunPersonas from "./agent-run-personas";
import AgentRunStats from "./agent-run-stats";
import AgentRunDetail from "./agent-run-detail";
import AgentRunSummary from "./agent-run-summary";
import AgentRunTasksTable from "./agent-run-tasks-table";
import { PiArrowLeftLight } from "react-icons/pi";
import { getAgentSummaryData } from "@/data/query";
import { agentRunData } from "@/data/agent-run-data";

export default function AgentRun() {
  const { id } = useParams();
  const agentRun = agentRunData.find((run) => run.runUid === id);

  const agentSummaryData = getAgentSummaryData(
    agentRun?.agentUid.toString() ?? ""
  );
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title={`Agent Run Details`}
        description={`Agent Run ID: ${id}`}
        className="mt-4"
      >
        <Link
          href="/agents"
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agents</span>
        </Link>
      </PageHeader>
      <AgentRunPersonas />
      <AgentRunStats />
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        <AgentRunDetail
          className="xl:col-span-8"
          selectedWebsite={selectedWebsite}
          setSelectedWebsite={setSelectedWebsite}
          period={period}
          setPeriod={setPeriod}
        />
        <AgentRunSummary
          className="xl:col-span-4"
          {...agentSummaryData}
          selectedWebsite={selectedWebsite}
        />
      </div>
      <AgentRunTasksTable />
    </div>
  );
}
