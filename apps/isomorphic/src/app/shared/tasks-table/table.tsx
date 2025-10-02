"use client";

import { taskColumns } from "@/app/shared/tasks-table/columns";
import { tasksData } from "@/data/tasks-data";
import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import TablePagination from "@core/components/table/pagination";
import Filters from "./filters";

export type TasksDataType = (typeof tasksData)[number];

export default function TasksTable() {
  const { table, setData } = useTanStackTable<TasksDataType>({
    tableData: tasksData,
    columnConfig: taskColumns,
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
    <div className="mt-4">
      <Filters table={table} />
      <Table
        table={table}
        variant="modern"
        classNames={{
          container:
            "border border-muted rounded-md border-t-0 bg-gray-0 dark:bg-gray-50",
          rowClassName: "last:border-0",
        }}
      />
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
