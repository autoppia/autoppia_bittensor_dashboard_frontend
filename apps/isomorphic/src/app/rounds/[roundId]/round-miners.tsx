"use client";

import PageHeader from "@/app/shared/page-header";
import MinersScoreChart from "@/app/shared/miners/miners-score-chart";
import TopMinersCard from "@/app/shared/miners/top-miners-card";

export default function RoundMiners() {
  return (
    <div>
      <PageHeader title="Miners" className="mt-6" />
      <div className="flex flex-col lg:flex-row gap-6">
        <MinersScoreChart className="w-full lg:w-[calc(100%-360px)]"/>
        <TopMinersCard className="w-full lg:w-[360px]"/>
      </div>
    </div>
  );
}
