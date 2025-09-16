"use client";

import { useEffect, useMemo } from "react";
import Table from "@core/components/table";
import TablePagination from "@core/components/table/pagination";
import Filters from "../filters";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import { TableDataType } from "@/app/shared/table/table-data";
import { buildMinerScoreColumns } from "./columns";

export default function MinerScoreTable({ data }: { data: TableDataType[] }) {
  // ✅ Always call hooks first
  const columns = useMemo(() => buildMinerScoreColumns(data), [data]);

  const { table, setData } = useTanStackTable<TableDataType>({
    tableData: data,
    columnConfig: columns,
    options: {
      initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    setData(data);
  }, [data, setData]);

  return (
    <>
      <Filters table={table} />
      <Table
        table={table}
        classNames={{
          container: "border border-muted rounded-md bg-gray-0 dark:bg-gray-50",
          rowClassName: "last:border-0",
          headerCellClassName: "subnet36-header-cell",
        }}
      />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
