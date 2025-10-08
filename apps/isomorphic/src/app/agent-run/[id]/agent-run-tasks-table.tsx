"use client";

import { agentRunTasksColumns } from "./agent-run-tasks-columns";
import { tasksData } from "@/data/tasks-data";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
import { Input } from "rizzui";
import { PiMagnifyingGlassBold } from "react-icons/pi";

export type TasksDataType = (typeof tasksData)[number];

export default function AgentRunTasksTable() {
  const { table, setData } = useTanStackTable<TasksDataType>({
    tableData: tasksData,
    columnConfig: agentRunTasksColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      enableColumnResizing: false,
    },
  });

  return (
    <div className="bg-gray-50 border border-muted rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-700">All Tasks</h2>

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
        <Table
          table={table}
          variant="modern"
          classNames={{
            container:
              "border border-muted rounded-lg overflow-x-auto custom-scrollbar scroll-smooth",
          }}
        />
      </div>

      {/* Pagination */}
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
