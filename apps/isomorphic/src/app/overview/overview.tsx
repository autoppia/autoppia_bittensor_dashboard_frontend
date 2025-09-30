"use client";

import PageHeader from "@/app/shared/page-header";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";

export default function Overview() {
  return (
    <>
      <PageHeader title={"Network Analytics"} className="mt-4" />
      <div className="flex flex-col lg:flex-row gap-8">
        <OverviewMinerChart className="w-full lg:w-[calc(100%-480px)]" />
        <OverviewMetrics className="w-full lg:w-[480px]" />
      </div>
      <OverviewValidators />
    </>
  );
}
