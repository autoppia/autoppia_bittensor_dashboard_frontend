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

function truncateMiddle(value?: string, visible: number = 8) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
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
  const evaluationIdDisplay =
    details?.relationships?.evaluation?.evaluationId ??
    (isLoading ? "Loading…" : error ? "Unavailable" : "—");

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title="Task Details"
        description={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">
                {truncateMiddle(taskId, 8)}
              </span>
              <IDCopyButton text={taskId} />
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Run</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">
                {truncateMiddle(runIdDisplay as string, 8)}
              </span>
              {details?.agentRunId && <IDCopyButton text={details.agentRunId} />}
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation</span>
              <div className="h-3.5 w-px bg-slate-600/70" />
              <span className="font-mono text-sm font-semibold text-white/90 truncate max-w-[42vw] md:max-w-[420px]">
                {truncateMiddle(evaluationIdDisplay as string, 8)}
              </span>
              {details?.relationships?.evaluation?.evaluationId && (
                <IDCopyButton text={details.relationships.evaluation.evaluationId} />
              )}
            </div>
          </div>
        }
        className="mt-2"
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
