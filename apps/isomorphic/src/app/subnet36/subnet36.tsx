"use client";

import { useEffect, useState } from "react";
import MinerScoreTable from "@/app/shared/table/score/table";
import MinerDurationTable from "@/app/shared/table/duration/table";
import TableLayout from "@/app/shared/table/table-layout";
import FilterBoard from "@/app/shared/filter-board";

const pageHeader = {
  title: "Subnet36",
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Subnet36() {
  const [view, setView] = useState<string>("score");
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/metrics/`);
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <TableLayout title={pageHeader.title} view={view} setView={setView}>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <FilterBoard
          classname="w-full md:w-[270px] border-box"
          setTableData={setTableData}
        />
        <div className="w-full md:w-[calc(100%-270px)]">
          {view == "score" && <MinerScoreTable data={tableData} />}
          {view == "duration" && <MinerDurationTable data={tableData} />}
        </div>
      </div>
    </TableLayout>
  );
}
