"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { PiArrowLeft } from "react-icons/pi";
import { useTaskDetails } from "@/services/hooks/useTask";
import TaskDetailsDynamic from "./task-details-dynamic";
import { routes } from "@/config/routes";
import TaskResults from "./task-results";

export default function TaskDynamic() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const taskId = Array.isArray(id) ? id[0] : id ?? "";
  
  const websiteNameParam = searchParams.get('websiteName');
  const websiteColorParam = searchParams.get('websiteColor');

  const { details, isLoading, error } = useTaskDetails(taskId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={routes.agent_run}
          className="group inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
        >
          <PiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Agent Runs</span>
        </Link>

        <TaskDetailsDynamic
          details={details}
          isLoading={isLoading}
          error={error}
          taskId={taskId}
          websiteNameParam={websiteNameParam}
          websiteColorParam={websiteColorParam}
        />

        <div className="mt-6">
          <TaskResults />
        </div>
      </div>
    </div>
  );
}
