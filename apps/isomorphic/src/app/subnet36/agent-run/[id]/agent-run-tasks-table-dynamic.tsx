"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useAgentRunTasks } from "@/services/hooks/useAgentRun";
import { createColumnHelper } from "@tanstack/react-table";
import BannerText from "@/app/shared/banner-text";
import { PiEyeBold, PiMagnifyingGlassBold } from "react-icons/pi";
import { Button, Text, Input } from "rizzui";
import Link from "next/link";
import Table from "@core/components/table";
import { Table as RTable } from "rizzui";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
import Placeholder, { TableRowPlaceholder } from "@/app/shared/placeholder";
import { AgentRunTaskData } from "@/services/api/types/agent-runs";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { flexRender } from "@tanstack/react-table";

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
      <Text className="font-medium text-gray-700 break-words whitespace-pre-wrap max-w-[320px]">
        {row.original.prompt}
      </Text>
    ),
  }),
  columnHelper.accessor("website", {
    id: "website",
    size: 100,
    header: "Website",
    enableSorting: false,
    cell: ({ row }) => (
      <BannerText
        color="blue"
        text={row.original.website}
        textColor="#ffffff"
      />
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
        href={`${routes.tasks}/${row.original.taskId}`}
        className="flex items-center text-slate-200 transition-colors duration-200"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-600 text-white hover:border-slate-400 hover:bg-slate-700/60"
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
  const router = useRouter();
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
    limit: 10,
  });

  const { table, setData } = useTanStackTable<AgentRunTaskData>({
    tableData: tasks || [],
    columnConfig: agentRunTasksColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: page - 1,
          pageSize: limit,
        },
      },
      enableColumnResizing: false,
      manualPagination: true,
      pageCount: Math.ceil(total / limit),
    },
  });

  // Update table data when tasks change
  React.useEffect(() => {
    if (tasks) {
      setData(tasks);
    }
  }, [tasks, setData]);


  // Show loading state
  if (isLoading && !tasks) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 right-0 h-60 w-60 rounded-full bg-gradient-to-br from-violet-500/10 via-violet-400/5 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-4 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/15 via-emerald-500/5 to-transparent blur-[100px]" />
        <div className="relative mb-6 flex items-center justify-between">
          <Placeholder height="1.4rem" width="6rem" />
          <Placeholder height="2.3rem" width="15rem" />
        </div>
        <div className="relative mb-3">
          <div className="overflow-hidden rounded-2xl border border-slate-700/25">
            <table className="w-full">
              <thead className="bg-slate-800/20">
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
        <div className="relative flex items-center justify-between py-4">
          <Placeholder height="1rem" width="8rem" />
          <div className="flex items-center gap-2">
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
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-rose-500/15 via-rose-400/5 to-transparent blur-[110px]" />
        <div className="relative mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All Tasks</h2>
        </div>
        <div className="relative py-8 text-center">
          <div className="mb-2 text-lg font-semibold text-red-400">
            Failed to Load Tasks Data
          </div>
          <div className="mb-4 text-sm text-red-300">{error}</div>
          <button
            onClick={refetch}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl">
      <div className="pointer-events-none absolute -right-24 top-0 h-60 w-60 rounded-full bg-gradient-to-br from-sky-500/15 via-sky-400/5 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-60px] left-8 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/15 via-emerald-500/5 to-transparent blur-[100px]" />

      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">
          All Tasks
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-300">
              ({total} total)
            </span>
          )}
        </h2>

        <div className="relative w-full max-w-[240px]">
          <Input
            type="search"
            clearable={true}
            placeholder="Search task..."
            onClear={() => table.setGlobalFilter("")}
            value={table.getState().globalFilter ?? ""}
            prefix={
              <PiMagnifyingGlassBold className="size-4 text-slate-400" />
            }
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full xs:max-w-60"
          />
        </div>
      </div>

      <div className="relative mb-2">
        {tasks && tasks.length > 0 ? (
          <Table
            table={table}
            variant="modern"
            classNames={{
              container:
                "custom-scrollbar scroll-smooth overflow-x-auto rounded-2xl border border-slate-700/25 bg-slate-800/20",
              headerClassName:
                "bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 text-slate-200",
              rowClassName:
                "cursor-pointer border-b border-slate-700/25 transition-colors duration-150 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_22px_rgba(255,255,255,0.06)]",
            }}
            components={{
              bodyRow: ({ table }) => (
                <>
                  {table.getRowModel().rows.map((row) => {
                    const taskId = (row as any).original?.taskId;
                    const href = `${routes.tasks}/${taskId}`;
                    return (
                      <RTable.Row
                        key={row.id}
                        className="cursor-pointer border-b border-slate-700/25 transition-colors duration-150 hover:bg-white/10 hover:border-white/20"
                        onClick={() => router.push(href)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <RTable.Cell
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                            className="text-slate-200"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </RTable.Cell>
                        ))}
                      </RTable.Row>
                    );
                  })}
                </>
              ),
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-700/25 bg-slate-800/20 p-8 text-center">
            <div className="mb-2 text-lg font-medium text-slate-200">
              No Tasks Found
            </div>
            <div className="text-sm text-slate-400">
              No tasks are available for this agent run.
            </div>
          </div>
        )}
      </div>

      {tasks && tasks.length > 0 && (
        <TablePagination 
          table={table} 
          className="relative py-4 text-slate-300"
        />
      )}

      {isLoading && tasks && (
        <div className="relative flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
            <span className="text-sm">Loading more tasks...</span>
          </div>
        </div>
      )}
    </div>
  );
}
