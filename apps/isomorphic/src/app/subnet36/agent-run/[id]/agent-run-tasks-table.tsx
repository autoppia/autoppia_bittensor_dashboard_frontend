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
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">All Tasks</h2>
          <p className="text-sm text-slate-400">{tasksData.length} total tasks</p>
        </div>

        <div className="relative w-full sm:w-auto sm:max-w-xs">
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
            className="w-full"
            inputClassName="rounded-xl border border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-0"
          />
        </div>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/50">
        <Table
          table={table}
          variant="modern"
          classNames={{
            container:
              "custom-scrollbar scroll-smooth overflow-x-auto",
            headerClassName:
              "bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-700/50",
            rowClassName:
              "border-b border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/50 transition-all duration-200 text-slate-200",
          }}
        />
      </div>

      <TablePagination
        table={table}
        className="relative py-3 text-slate-400 border-t border-slate-700/30"
      />
    </div>
  );
}
