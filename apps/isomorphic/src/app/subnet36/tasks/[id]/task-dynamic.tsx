"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import TaskResults from "./task-results";
import { PiArrowLeftLight } from "react-icons/pi";
import { useTaskDetails } from "@/services/hooks/useTask";
import TaskDetailsDynamic from "./task-details-dynamic";

export default function TaskDynamic() {
  const { id } = useParams();
  const taskId = Array.isArray(id) ? id[0] : id ?? "";

  const {
    details,
    isLoading,
    error,
  } = useTaskDetails(taskId);
  const runIdDisplay =
    details?.agentRunId ??
    (isLoading ? "Loading…" : error ? "Unavailable" : "—");

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title="Task Details"
        description={
          <span className="flex flex-col gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <span>Task ID:</span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-sm font-semibold text-emerald-200">
                {taskId}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span>Run ID:</span>
              <span className="inline-flex items-center rounded-md bg-slate-700/40 px-2 py-0.5 font-mono text-sm font-semibold text-slate-100">
                {runIdDisplay}
              </span>
            </span>
          </span>
        }
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

      <TaskDetailsDynamic
        details={details}
        isLoading={isLoading}
        error={error}
      />

      <div className="mb-10">
        <TaskResults />
      </div>
    </div>
  );
}
