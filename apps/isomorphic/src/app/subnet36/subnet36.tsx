/* ─────────────── src/app/subnet36/subnet36.tsx ─────────────── */
"use client";

import { useState } from "react";
import MinerScoreTable from "@/app/shared/table/score/table";
import MinerDurationTable from "@/app/shared/table/duration/table";
import TableLayout from "@/app/shared/table/table-layout";
import FilterBoard from "@/app/shared/filter-board";
import { TableDataType } from "@/app/shared/table/table-data";

const pageHeader = { title: "Subnet36" };

export default function Subnet36() {
  const [view, setView] = useState<"score" | "duration">("score");
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <TableLayout title={pageHeader.title} view={view} setView={setView}>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <FilterBoard
          classname="w-full md:w-[270px] border-box"
          setTableData={setTableData}
          setLoading={setLoading}
        />

        <div className="w-full md:w-[calc(100%-270px)]">
          {loading ? (
            <p className="py-8 text-center">Cargando métricas…</p>
          ) : view === "score" ? (
            <MinerScoreTable data={tableData} />
          ) : (
            <MinerDurationTable data={tableData} />
          )}
        </div>
      </div>
    </TableLayout>
  );
}
