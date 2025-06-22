// src/app/shared/table/duration/columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { TableDataType } from "@/app/shared/table/table-data";

const column = createColumnHelper<TableDataType>();

export function buildMinerDurationColumns(data: TableDataType[]) {
  if (!data?.length) return [];

  /* 1) Descubre todos los validator_X presentes */
  const validatorIds = Array.from(
    new Set(
      data.flatMap((r) =>
        Object.keys(r.durations_per_validator ?? {}).map((k) =>
          Number(k.replace("validator_", ""))
        )
      )
    )
  ).sort((a, b) => a - b);

  /* 2) Columnas fijas */
  const fixed = [
    column.accessor("miner_uid", {
      id: "uid",
      header: "UID",
      size: 40,
      enableSorting: true,
    }),
    column.accessor("miner_hotkey", {
      id: "hotkey",
      header: "Hotkey",
      size: 120,
      enableSorting: false,
      cell: ({ getValue }) => <div className="w-32 truncate">{getValue()}</div>,
    }),
  ];

  /* 3) Una columna por validator_X */
  const dynamic = validatorIds.map((id) =>
    column.accessor((row) => row.durations_per_validator?.[`validator_${id}`], {
      id: `duration_${id}`,
      header: `Validator_${id}`,
      size: 60,
      enableSorting: true,
      cell: (info) =>
        info.getValue() != null ? info.getValue()!.toFixed(0) : "-",
    })
  );

  /* 4) Columna de promedio */
  const avg = column.accessor("duration_avg", {
    id: "duration_avg",
    header: "Average Duration",
    size: 80,
    enableSorting: true,
    cell: ({ getValue }) => (getValue() != null ? getValue()!.toFixed(0) : "-"),
  });

  return [...fixed, ...dynamic, avg];
}
