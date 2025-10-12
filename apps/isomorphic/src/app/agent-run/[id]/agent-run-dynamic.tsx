"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import AgentRunPersonasDynamic from "./agent-run-personas-dynamic";
import AgentRunStatsDynamic from "./agent-run-stats-dynamic";
import AgentRunDetail from "./agent-run-detail";
import AgentRunSummary from "./agent-run-summary";
import AgentRunTasksTable from "./agent-run-tasks-table";
import { PiArrowLeftLight } from "react-icons/pi";
import { useAgentRun } from "@/services/hooks/useAgentRun";
import LoadingScreen from "@/app/shared/loading-screen";
import Placeholder from "@/app/shared/placeholder";

export default function AgentRunDynamic() {
  const { id } = useParams();
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  // Use the partial loading hook with progressive data fetching
  const { data, isLoading, error, refetch, isAnyLoading } = useAgentRun(
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

  // Show loading screen only if we're still loading the initial data
  if (isLoading && !data.personas && !data.stats && !data.summary) {
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
        <LoadingScreen 
          title="Loading Agent Run Data" 
          subtitle="Fetching evaluation run details..."
          size="lg"
        />
      </div>
    );
  }

  // Show error state if there's a critical error
  if (error && !data.personas && !data.stats && !data.summary) {
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Agent Run Data
          </div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

      {/* Personas Section - Loads first */}
      <AgentRunPersonasDynamic />

      {/* Stats Section - Loads independently */}
      <AgentRunStatsDynamic />

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 mb-6">
        {/* Agent Run Detail - Left Column */}
        <div className="xl:col-span-8">
          <AgentRunDetail
            selectedWebsite={selectedWebsite}
            setSelectedWebsite={setSelectedWebsite}
            period={period}
            setPeriod={setPeriod}
          />
        </div>

        {/* Agent Run Summary - Right Column */}
        <div className="xl:col-span-4">
          {data.summary ? (
            <AgentRunSummary
              className="xl:col-span-4"
              {...data.summary}
              selectedWebsite={selectedWebsite}
            />
          ) : (
            <div className="bg-white/10 rounded-2xl p-6 border border-gray-200/20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-600 text-sm">Loading summary...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Table - Loads last */}
      <div className="mb-6">
        {data.tasks ? (
          <AgentRunTasksTable />
        ) : (
          <div className="bg-white/10 rounded-2xl p-6 border border-gray-200/20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-600 text-sm">Loading tasks...</div>
            </div>
          </div>
        )}
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
