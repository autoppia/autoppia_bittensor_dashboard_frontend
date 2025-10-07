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
    <div className="group relative bg-black border border-emerald-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/50 hover:border-emerald-400 transition-all duration-500">
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-transparent to-cyan-900/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]"></div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-emerald-400 shadow-2xl shadow-emerald-500/80">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-sm"></div>
              </div>
              {/* Enhanced Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse opacity-100"></div>
              <div className="absolute inset-0 rounded-full border border-emerald-300 animate-ping opacity-30"></div>
            </div>
            <h2 className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,1)] font-mono">
              ALL TASKS
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              type="search"
              clearable={true}
              placeholder="Search task..."
              onClear={() => table.setGlobalFilter("")}
              value={table.getState().globalFilter ?? ""}
              prefix={
                <PiMagnifyingGlassBold className="size-4 text-emerald-400" />
              }
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="w-full xs:max-w-60 [&_.rizzui-input]:bg-black/50 [&_.rizzui-input]:border-emerald-400/30 [&_.rizzui-input]:text-emerald-300 [&_.rizzui-input]:font-mono [&_.rizzui-input]:focus:border-emerald-400 [&_.rizzui-input]:focus:shadow-2xl [&_.rizzui-input]:focus:shadow-emerald-500/50 [&_.rizzui-input]:placeholder-emerald-500/70"
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
                "border border-emerald-400/30 rounded-lg bg-black/50 overflow-hidden",
              rowClassName:
                "last:border-0 border-b border-emerald-400/20 hover:bg-emerald-900/10",
              headerClassName:
                "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-400/30",
              cellClassName: "font-mono text-sm",
            }}
          />
        </div>

        {/* Pagination */}
        <TablePagination table={table} className="py-4" />
      </div>

      {/* Cyberpunk Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
    </div>
  );
}
