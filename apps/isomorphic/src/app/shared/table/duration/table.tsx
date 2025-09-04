// src/app/shared/table/duration/table.tsx
"use client";

import { useEffect, useMemo } from "react";
import Table from "@core/components/table";
import TablePagination from "@core/components/table/pagination";
import Filters from "../filters";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import { TableDataType } from "@/app/shared/table/table-data";
import { buildMinerDurationColumns } from "./columns";

export default function MinerDurationTable({
  data,
}: {
  data: TableDataType[];
}) {
  const hasData = data.length > 0;
  const columns = useMemo(() => buildMinerDurationColumns(data), [data]);

  const { table, setData } = useTanStackTable<TableDataType>({
    tableData: data,
    columnConfig: columns,
    options: {
      initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
      enableColumnResizing: false,
    },
  });

  useEffect(() => setData(data), [data, setData]);

  /* nodo raíz estable */
  return (
    <div>
      {!hasData ? (
        <p className="py-8 text-center">Cargando métricas…</p>
      ) : (
        <>
          <Filters table={table} />
          <Table
            table={table}
            classNames={{
              container: "border border-muted rounded-md",
              rowClassName: "last:border-0",
              headerCellClassName: "subnet36-header-cell",
            }}
          />
          <TablePagination table={table} className="py-4" />
        </>
      )}
    </div>
  );
}
