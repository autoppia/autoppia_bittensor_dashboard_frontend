"use client";

import { useEffect, useMemo } from "react";
import Table from "@core/components/table";
import TablePagination from "@core/components/table/pagination";
import Filters from "../filters";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import { TableDataType } from "@/app/shared/table/table-data";
import { buildMinerScoreColumns } from "./columns";

/* 👇 Si no hay datos, muestra un loader o nada */
export default function MinerScoreTable({ data }: { data: TableDataType[] }) {
  if (!data?.length) {
    return <p className="text-center py-8">Cargando métricas…</p>;
  }

  /* Ahora sí tenemos datos → generamos columnas */
  const columns = useMemo(() => buildMinerScoreColumns(data), [data]);

  const { table, setData } = useTanStackTable<TableDataType>({
    tableData: data,
    columnConfig: columns,
    options: {
      initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
      enableColumnResizing: false,
    },
  });

  /* Mantener datos reactivos */
  useEffect(() => {
    setData(data);
  }, [data, setData]);

  return (
    <>
      <Filters table={table} />
      <Table
        table={table}
        classNames={{
          container: "border border-muted rounded-md",
          rowClassName: "last:border-0",
        }}
      />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
