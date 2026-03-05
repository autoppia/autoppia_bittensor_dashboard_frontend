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
  const { table } = useTanStackTable<TasksDataType>({
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
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl text-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-60 w-60 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-60px] left-8 h-64 w-64 rounded-full bg-blue-500/20 blur-[120px]" />
      <div
        className="pointer-events-none absolute right-6 bottom-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(253, 245, 230, 0.15)" }}
      />
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
              <PiMagnifyingGlassBold className="size-4 text-white/70" />
            }
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full xs:max-w-60"
            inputClassName="rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-[#FDF5E6]/60 focus:ring-0"
          />
        </div>
      </div>

      <div className="relative mb-2">
          <Table
            table={table}
            variant="modern"
            classNames={{
              container:
              "custom-scrollbar scroll-smooth overflow-x-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm",
              headerClassName:
              "bg-gradient-to-r from-white/10 via-white/5 to-white/10 text-white/80 uppercase tracking-[0.25em]",
              rowClassName:
              "cursor-pointer border-b border-white/10 bg-white/5 transition-colors duration-150 hover:bg-sky-500/15 hover:border-sky-400/40 hover:shadow-[0_10px_24px_rgba(56,189,248,0.16)] text-white/80",
              }}
          />
      </div>

      <TablePagination
        table={table}
        className="relative py-4 text-white/70"
      />
    </div>
  );
}
