"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import TaskPersonas from "./task-personas";
import TaskDetails from "./task-details";
import TaskResults from "./task-results";
import { PiArrowLeftLight } from "react-icons/pi";
import { routes } from "@/config/routes";

export default function Task() {
  const { id } = useParams();
  const taskId = Array.isArray(id) ? id[0] : id ?? "";

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader
        title="Task Details"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>Task ID:</span>
            <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-sm font-semibold text-emerald-200">
              {taskId}
            </span>
          </span>
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
      <TaskPersonas />
      <TaskDetails />
      <TaskResults />
    </div>
  );
}
