"use client";

import RoundValidators from "./round-validators";
import RoundMinerScores from "./round-miner-scores";
import RoundTopMiners from "./round-top-miners";
import PageHeader from "@/app/shared/page-header";

export default function RoundResult() {
  return (
    <>
      <PageHeader title="Round Result" className="mt-6" />
      <RoundValidators />
      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScores className="w-full xl:w-[calc(100%-400px)]" />
        <RoundTopMiners className="w-full xl:w-[400px]" />
      </div>
    </>
  );
}
