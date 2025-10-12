"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useAgentRunTasks } from "@/services/hooks/useAgentRun";
import { createColumnHelper } from "@tanstack/react-table";
import { PiEyeBold, PiMagnifyingGlassBold } from "react-icons/pi";
import { Button, Text, Input } from "rizzui";
import Link from "next/link";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
import Placeholder, { TableRowPlaceholder } from "@/app/shared/placeholder";
import { AgentRunTaskData } from "@/services/api/types/agent-runs";

const columnHelper = createColumnHelper<AgentRunTaskData>();

const agentRunTasksColumns = [
  columnHelper.display({
    id: "taskId",
    size: 80,
    header: "Task Id",
    cell: ({ row }) => <p className="ms-2 text-gray-600">#{row.original.taskId}</p>,
  }),
  columnHelper.accessor("prompt", {
    id: "prompt",
    header: "Prompt",
    size: 400,
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">{row.original.prompt}</Text>
    ),
  }),
  columnHelper.accessor("website", {
    id: "website",
    size: 100,
    header: "Website",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        {row.original.website}
      </span>
    ),
  }),
  columnHelper.accessor("useCase", {
    id: "useCase",
    size: 150,
    header: "Use Case",
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-gray-600">
        {row.original.useCase
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </Text>
    ),
  }),
  columnHelper.accessor("score", {
    id: "score",
    size: 100,
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score;
      let scoreColor = "text-gray-600"; // Default color
      
      if (score >= 0.8) {
        scoreColor = "text-green-500"; // High performance - green
      } else if (score >= 0.6) {
        scoreColor = "text-yellow-500"; // Medium performance - yellow
      } else if (score >= 0.4) {
        scoreColor = "text-orange-500"; // Low performance - orange
      } else {
        scoreColor = "text-red-500"; // Poor performance - red
      }
      
      return (
        <Text className={`font-medium ${scoreColor}`}>
          {score.toFixed(2)}
        </Text>
      );
    },
  }),
  columnHelper.accessor("duration", {
    id: "duration",
    size: 100,
    header: "Duration",
    cell: ({ row }) => (
      <Text className="font-medium text-gray-600">
        {row.original.duration}s
      </Text>
    ),
  }),
  columnHelper.display({
    id: "action",
    size: 100,
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`/tasks/${row.original.taskId}`}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-700 text-gray-700 hover:bg-white hover:text-black"
        >
          <PiEyeBold className="me-1.5 size-4" />
          <span>Inspect</span>
        </Button>
      </Link>
    ),
  }),
];

export default function AgentRunTasksTableDynamic() {
  const { id } = useParams();
  const { 
    tasks, 
    total, 
    page, 
    limit, 
    isLoading, 
    error, 
    refetch, 
    goToPage, 
    changeLimit 
  } = useAgentRunTasks(id as string, {
    page: 1,
    limit: 20,
  });

  const { table, setData } = useTanStackTable<AgentRunTaskData>({
    tableData: tasks || [],
    columnConfig: agentRunTasksColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: (page || 1) - 1,
          pageSize: limit || 20,
        },
      },
      enableColumnResizing: false,
      manualPagination: true,
      pageCount: Math.ceil((total || 0) / (limit || 20)),
    },
  });

  // Update table data when tasks change
  React.useEffect(() => {
    if (tasks) {
      setData(tasks);
    }
  }, [tasks, setData]);

  // Update pagination when page/limit change
  React.useEffect(() => {
    if (page && limit) {
      table.setPageIndex(page - 1);
      table.setPageSize(limit);
    }
  }, [page, limit, table]);


  // Show loading state
  if (isLoading && !tasks) {
    return (
      <div className="bg-gray-50 border border-muted rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Placeholder height="1.5rem" width="6rem" />
          <Placeholder height="2.5rem" width="15rem" />
        </div>
        <div className="mb-2">
          <div className="border border-muted rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {Array.from({ length: 6 }, (_, index) => (
                    <th key={index} className="px-4 py-3 text-left">
                      <Placeholder height="1rem" width="4rem" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }, (_, index) => (
                  <TableRowPlaceholder key={index} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between py-4">
          <Placeholder height="1rem" width="8rem" />
          <div className="flex items-center space-x-2">
            <Placeholder height="2rem" width="6rem" />
            <Placeholder height="2rem" width="4rem" />
            <Placeholder height="2rem" width="6rem" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !tasks) {
    return (
      <div className="bg-gray-50 border border-muted rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">All Tasks</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Tasks Data
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
    <div className="bg-gray-50 border border-muted rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          All Tasks
          {total > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({total} total)
            </span>
          )}
        </h2>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="search"
            clearable={true}
            placeholder="Search task..."
            onClear={() => table.setGlobalFilter("")}
            value={table.getState().globalFilter ?? ""}
            prefix={
              <PiMagnifyingGlassBold className="size-4 text-gray-500" />
            }
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full xs:max-w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mb-2">
        {tasks && tasks.length > 0 ? (
          <Table
            table={table}
            variant="modern"
            classNames={{
              container:
                "border border-muted rounded-lg overflow-x-auto custom-scrollbar scroll-smooth",
            }}
          />
        ) : (
          <div className="border border-muted rounded-lg p-8 text-center">
            <div className="text-gray-500 text-lg font-medium mb-2">
              No Tasks Found
            </div>
            <div className="text-gray-400 text-sm">
              No tasks are available for this agent run.
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {tasks && tasks.length > 0 && (
        <TablePagination 
          table={table} 
          className="py-4"
        />
      )}

      {/* Loading indicator for pagination */}
      {isLoading && tasks && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading more tasks...</span>
          </div>
        </div>
      )}
    </div>
  );
}
