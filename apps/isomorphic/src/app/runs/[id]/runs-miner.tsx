"use client";

import PageHeader from "@/app/shared/page-header";
import RunsMinerScore from "./runs-miner-score";
import RunsMinerTime from "./runs-miner-time";

export default function RunsMiner() {
  return (
    <>
      <PageHeader title="Miners" className="mt-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RunsMinerScore />
        <RunsMinerTime />
      </div>
    </>
  );
}