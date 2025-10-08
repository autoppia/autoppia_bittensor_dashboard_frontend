"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import TaskPersonas from "./task-personas";
import TaskDetails from "./task-details";
import TaskResults from "./task-results";
import { PiArrowLeftLight } from "react-icons/pi";

export default function Task() {
  const { id } = useParams();

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
      <TaskPersonas />
      <TaskDetails />
      <TaskResults />
    </div>
  );
}
