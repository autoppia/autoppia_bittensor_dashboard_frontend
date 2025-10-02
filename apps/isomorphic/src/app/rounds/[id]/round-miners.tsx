"use client";

import PageHeader from "@/app/shared/page-header";
import RoundMinersScore from "./round-miners-score";
import RoundTopMiners from "./round-top-miners";

export default function RoundMiners() {
  return (
    <div>
      <PageHeader title="Miners" className="mt-4" />
      <div className="flex flex-col xl:flex-row gap-6">
        <RoundMinersScore className="w-full xl:w-[calc(100%-360px)]"/>
        <RoundTopMiners className="w-full xl:w-[360px]"/>
      </div>
    </div>
  );
}
