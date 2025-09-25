"use client";

import { PiCubeDuotone, PiClockDuotone } from "react-icons/pi";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import BannerText from "@/app/shared/banner-text";
import { RoundType } from "@/data/rounds-data";

interface RunsTimerProps {
  round: RoundType;
}

export default function RoundProgress({
  round,
}: RunsTimerProps) {
  const currentBlock = 6513300;
  const percentage = (currentBlock - round.startBlock) / (round.endBlock - round.startBlock);
  const cellCount = 100;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    return {
      isPassed: index < percentage * cellCount,
    };
  });
  return (
    <>
      <PageHeader title={"Round " + round.id} className="mt-4">
        <BannerText color="#10b981" text="Live Update" className="animate-pulse" />
      </PageHeader>
      <div className="w-full border border-muted rounded-lg p-8 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900 mb-4">
            Round Progress
          </div>
          <div className="flex items-center text-md text-[#10b981]">
            <PiClockDuotone />
            <span className="ms-1">12d 30m 20s</span>
          </div>
        </div>
        <div className="w-full flex items-center justify-between">
          {cells.map((cell, index) => (
            <span
              key={index}
              className={cn(
                "w-[7px] h-10 rounded-full bg-[#10b981]",
                !cell.isPassed && "bg-gray-300"
              )}
            ></span>
          ))}
        </div>
        <div className="w-full flex items-center justify-between mt-4">
          <div></div>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <PiCubeDuotone />
              <span className="ms-1">Start Block: {round.startBlock}</span>
            </div>
            <div className="flex items-center font-semibold text-gray-900">
              <PiCubeDuotone />
              <span className="ms-1">Current Block: {currentBlock}</span>
            </div>
            <div className="flex items-center">
              <PiCubeDuotone />
              <span className="ms-1">End Block: {round.endBlock}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
