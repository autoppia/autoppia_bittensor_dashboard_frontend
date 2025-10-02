"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunSidebar from "./agent-run-sidebar";
import AgentRunStats from "./agent-run-stats";
import AgentRunDetail from "./agent-run-detail";
import AgentRunSummary from "./agent-run-summary";
import TasksTable from "@/app/shared/tasks-table/table";
import { getAgentSummaryData } from "@/data/query";

export default function AgentRun() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roundId, setRoundId] = useState<string>("");
  const [validatorId, setValidatorId] = useState<string>("");
  const [agentId, setAgentId] = useState<string>("");

  const agentSummaryData = getAgentSummaryData(agentId as string);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (Array.from(params.keys()).length > 0) {
      setRoundId(params.get("round") || "");
      setValidatorId(params.get("validator") || "");
      setAgentId(params.get("agent") || "");
    } else {
      const round = 5;
      const validator = "autoppia";
      const agent = 1;

      setRoundId(round.toString());
      setValidatorId(validator);
      setAgentId(agent.toString());

      params.set("round", round.toString());
      params.set("validator", validator);
      params.set("agent", agent.toString());
      router.push(`/agent-run?${params.toString()}`);
    }
  }, [searchParams, router]);

  return (
    <>
      <AgentRunSidebar
        roundId={roundId}
        setRoundId={setRoundId}
        validatorId={validatorId}
        setValidatorId={setValidatorId}
        agentId={agentId}
        setAgentId={setAgentId}
      />
      <div className="ml-0 lg:ml-[300px]">
        <PageHeader title={`Agent Run ${agentId}`} className="mt-4" />
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
      </div>
    </>
  );
}
