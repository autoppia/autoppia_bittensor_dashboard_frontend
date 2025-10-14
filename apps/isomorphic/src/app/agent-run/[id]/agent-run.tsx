"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunPersonasDynamic from "./agent-run-personas-dynamic";
import AgentRunStatsDynamic from "./agent-run-stats-dynamic";
import AgentRunDetailDynamic from "./agent-run-detail-dynamic";
import AgentRunSummaryDynamic from "./agent-run-summary-dynamic";
import AgentRunTasksTableDynamic from "./agent-run-tasks-table-dynamic";
import { PiArrowLeftLight } from "react-icons/pi";
import { useAgentRun } from "@/services/hooks/useAgentRun";
export default function AgentRun() {
  const { id } = useParams();

  // Use the partial loading hook with progressive data fetching
  const { data, error, refetch, isAnyLoading } = useAgentRun(
    id as string,
    {
      includePersonas: true,
      includeStats: true,
      includeSummary: true,
      includeTasks: true,
      autoRefresh: true, // Enable auto-refresh for real-time updates
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title="Agent Run Details"
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

      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Failed to refresh some sections. You can{" "}
          <button
            onClick={refetch}
            className="font-semibold underline underline-offset-2 hover:text-yellow-900"
          >
            retry
          </button>{" "}
          or wait a moment while data loads.
        </div>
      )}

      {/* Personas Section - Loads first */}
      <AgentRunPersonasDynamic />

      {/* Stats Section - Loads independently */}
      <AgentRunStatsDynamic />

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        {/* Agent Run Detail - Left Column */}
        <div className="xl:col-span-8">
          <AgentRunDetailDynamic />
        </div>

        {/* Agent Run Summary - Right Column */}
        <div className="xl:col-span-4">
          <AgentRunSummaryDynamic />
        </div>
      </div>

      {/* Tasks Table - Loads last */}
      <div className="mb-6">
        <AgentRunTasksTableDynamic />
      </div>

      {/* Loading Indicator for Partial Updates */}
      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Updating data...</span>
        </div>
      )}

      {/* Error Indicators for Individual Sections */}
      {data.errors.personas && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load personas data</div>
        </div>
      )}
      {data.errors.stats && (
        <div className="fixed top-16 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load stats data</div>
        </div>
      )}
      {data.errors.summary && (
        <div className="fixed top-28 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load summary data</div>
        </div>
      )}
      {data.errors.tasks && (
        <div className="fixed top-40 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load tasks data</div>
        </div>
      )}
    </div>
  );
}
