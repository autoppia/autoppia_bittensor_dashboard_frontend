"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import { CHIP_STYLES } from "@/config/theme-styles";
import AgentRunStatsDynamic from "./agent-run-stats-dynamic";
import AgentRunDetailDynamic from "./agent-run-detail-dynamic";
import AgentRunSummaryDynamic from "./agent-run-summary-dynamic";
import AgentRunTasksTableDynamic from "./agent-run-tasks-table-dynamic";
import { PiArrowLeftLight } from "react-icons/pi";
import { useAgentRunComplete } from "@/services/hooks/useAgentRun";
import { routes } from "@/config/routes";

function getRoundLabel(info: { round?: { roundNumber?: unknown; validatorRoundId?: unknown } } | null): string {
  const roundId = info?.round?.roundNumber ?? info?.round?.validatorRoundId ?? "";
  if (typeof roundId === "number" || (typeof roundId === "string" && roundId !== "")) {
    return String(roundId);
  }
  return "—";
}

export default function AgentRun() {
  const { id } = useParams();
  const runId = Array.isArray(id) ? id[0] : (id ?? "");
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  const {
    isLoading,
    error,
    refetch,
    statistics,
    evaluations,
    info,
  } = useAgentRunComplete(runId);

  const pageHeaderDescription = useMemo(
    () => (
      <span className="flex flex-wrap items-center gap-2">
        <span>Validator Round ID:</span>
        <span className={`${CHIP_STYLES.base} ${CHIP_STYLES.active} !px-3 !py-1 font-mono`}>
          {getRoundLabel(info)}
        </span>
        <span className="ms-2">Agent Run ID:</span>
        <span className={`${CHIP_STYLES.base} ${CHIP_STYLES.completed} !px-3 !py-1 font-mono`}>
          {runId}
        </span>
      </span>
    ),
    [info, runId]
  );

  const summary = useMemo<Record<string, unknown> | null>(() => {
    if (!info) return null;
    const infoWithAgent = info as { miner?: { agentId?: string }; validator?: { agentId?: string } };
    const agentId = infoWithAgent.miner?.agentId ?? infoWithAgent.validator?.agentId;
    return agentId == null ? null : { agentId };
  }, [info]);

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title="Agent Run Details"
        description={pageHeaderDescription}
        className="mt-4"
      >
        <Link
          href={routes.agents}
          className="flex items-center text-white/70 transition-colors duration-200 hover:text-[#FDF5E6]"
        >
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agents</span>
        </Link>
      </PageHeader>

      {error && (
        <div className="mb-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
          Failed to refresh some sections. You can{" "}
          <button
            onClick={refetch}
            className="font-semibold text-[#FDF5E6] underline underline-offset-4 hover:text-white"
          >
            retry
          </button>{" "}
          or wait a moment while data loads.
        </div>
      )}


      {/* Stats Section */}
      <AgentRunStatsDynamic
        statistics={statistics}
        isLoading={isLoading}
        error={error}
      />

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        {/* Agent Run Detail - Left Column */}
        <div className="xl:col-span-8">
          <AgentRunDetailDynamic
            selectedWebsite={selectedWebsite}
            setSelectedWebsite={setSelectedWebsite}
            period={period}
            setPeriod={setPeriod}
            statistics={statistics}
            summary={null}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Agent Run Summary - Right Column */}
        <div className="xl:col-span-4">
          <AgentRunSummaryDynamic
            selectedWebsite={selectedWebsite}
            summary={null}
            statistics={statistics}
            tasks={evaluations}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="mb-6">
        <AgentRunTasksTableDynamic
          tasks={evaluations}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
        />
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading data...</span>
        </div>
      )}
    </div>
  );
}
