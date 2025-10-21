"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import TaskResults from "./task-results";
import { PiArrowLeftLight, PiCopy } from "react-icons/pi";
import { useTaskDetails } from "@/services/hooks/useTask";
import TaskDetailsDynamic from "./task-details-dynamic";
import { routes } from "@/config/routes";
import { useState } from "react";

function IDCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md bg-white/10 p-1 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-300">✓</span>
      ) : (
        <PiCopy className="h-3 w-3" />
      )}
    </button>
  );
}

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
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-3 rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70">Task ID</span>
              <div className="h-4 w-px bg-gradient-to-b from-transparent via-purple-400/50 to-transparent" />
              <span className="font-mono text-sm font-bold text-white">
                {taskId}
              </span>
              <IDCopyButton text={taskId} />
            </div>
            <div className="inline-flex items-center gap-3 rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70">Run ID</span>
              <div className="h-4 w-px bg-gradient-to-b from-transparent via-purple-400/50 to-transparent" />
              <span className="font-mono text-sm font-bold text-white">
                {runIdDisplay}
              </span>
              {details?.agentRunId && <IDCopyButton text={details.agentRunId} />}
            </div>
          </div>
        }
        className="mt-4"
      >
        <Link
          href={routes.agent_run}
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
