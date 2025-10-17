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
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl">
      <div className="pointer-events-none absolute -right-24 top-0 h-60 w-60 rounded-full bg-gradient-to-br from-sky-500/15 via-sky-400/5 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-60px] left-8 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/15 via-emerald-500/5 to-transparent blur-[100px]" />

      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">All Tasks</h2>

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
        <Table
          table={table}
          variant="modern"
          classNames={{
            container:
              "custom-scrollbar scroll-smooth overflow-x-auto rounded-2xl border border-slate-700/25 bg-slate-800/20",
            headerClassName:
              "bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 text-slate-200",
            rowClassName:
              "border-b border-slate-700/25 transition-colors duration-200 hover:bg-slate-900/40",
            }}
        />
      </div>

      <TablePagination table={table} className="relative py-4 text-slate-300" />
    </div>
  );
}
