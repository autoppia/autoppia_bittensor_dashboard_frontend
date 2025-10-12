"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import TaskPersonasDynamic from "./task-personas-dynamic";
import TaskDetailsDynamic from "./task-details-dynamic";
import TaskResults from "./task-results";
import TaskLogsDynamic from "./task-logs-dynamic";
import TaskMetricsDynamic from "./task-metrics-dynamic";
import TaskTimelineDynamic from "./task-timeline-dynamic";
import { PiArrowLeftLight } from "react-icons/pi";
import { useTask } from "@/services/hooks/useTask";
import LoadingScreen from "@/app/shared/loading-screen";

export default function TaskDynamic() {
  const { id } = useParams();

  // Use the partial loading hook with progressive data fetching
  const { data, isLoading, error, isAnyLoading } = useTask(
    id as string,
    {
      includePersonas: true,
      includeDetails: true,
      includeResults: true,
      includeStatistics: true,
      autoRefresh: true, // Enable auto-refresh for real-time updates
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Show loading screen only if we're still loading the initial data
  if (isLoading && !data.personas && !data.details && !data.results) {
    return (
      <div className="w-full max-w-[1280px] mx-auto">
        <PageHeader
          title="Task Details"
          description={`Task ID: ${id}`}
          className="mt-4"
        >
          <Link
            href="/agent-run"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <PiArrowLeftLight className="w-4 h-4" />
            <span className="ms-1">Back to Agent Run</span>
          </Link>
        </PageHeader>
        <LoadingScreen 
          title="Loading Task Data" 
          subtitle="Fetching task details and results..."
          size="lg"
        />
      </div>
    );
  }

  // Show error state if there's a critical error
  if (error && !data.personas && !data.details && !data.results) {
    return (
      <div className="w-full max-w-[1280px] mx-auto">
        <PageHeader
          title="Task Details"
          description={`Task ID: ${id}`}
          className="mt-4"
        >
          <Link
            href="/agent-run"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <PiArrowLeftLight className="w-4 h-4" />
            <span className="ms-1">Back to Agent Run</span>
          </Link>
        </PageHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Task Data
          </div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
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
        title="Task Details"
        description={`Task ID: ${id}`}
        className="mt-4"
      >
        <Link
          href="/agent-run"
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <PiArrowLeftLight className="w-4 h-4" />
          <span className="ms-1">Back to Agent Run</span>
        </Link>
      </PageHeader>

      {/* Personas Section - Loads first */}
      <TaskPersonasDynamic />

      {/* Task Details Section - Loads independently */}
      <TaskDetailsDynamic />

      {/* Task Results Section - Loads independently */}
      <div className="mb-6">
        <TaskResults />
      </div>

      {/* Task Metrics Section - Loads independently */}
      <div className="mb-6">
        <TaskMetricsDynamic />
      </div>

      {/* Task Timeline Section - Loads independently */}
      <div className="mb-6">
        <TaskTimelineDynamic />
      </div>

      {/* Task Logs Section - Loads independently */}
      <div className="mb-6">
        <TaskLogsDynamic />
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
      {data.errors.details && (
        <div className="fixed top-16 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load details data</div>
        </div>
      )}
      {data.errors.results && (
        <div className="fixed top-28 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load results data</div>
        </div>
      )}
      {data.errors.statistics && (
        <div className="fixed top-40 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm">Failed to load statistics data</div>
        </div>
      )}
    </div>
  );
}
