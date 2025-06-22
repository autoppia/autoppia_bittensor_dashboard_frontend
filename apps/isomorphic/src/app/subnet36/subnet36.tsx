"use client";

import { useEffect, useState } from "react";
import MinerScoreTable from "@/app/shared/table/score/table";
import MinerDurationTable from "@/app/shared/table/duration/table";
import TableLayout from "@/app/shared/table/table-layout";
import FilterBoard from "@/app/shared/filter-board";
import { TableDataType } from "@/app/shared/table/table-data";

const pageHeader = { title: "Subnet36" };
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Subnet36() {
  const [view, setView] = useState<"score" | "duration">("score");
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const loading = tableData.length === 0;

  /* ---------- fetch una sola vez al montar ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/metrics/`, { cache: "no-store" });
        const json = await res.json();
        setTableData(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    })();
  }, []);

  return (
    <TableLayout title={pageHeader.title} view={view} setView={setView}>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <FilterBoard
          classname="w-full md:w-[270px] border-box"
          setTableData={setTableData}
        />

        {/* raíz estable: SIEMPRE el mismo <div> */}
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
