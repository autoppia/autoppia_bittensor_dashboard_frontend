"use client";

import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { PiCubeDuotone, PiClockDuotone } from "react-icons/pi";
import { RoundType } from "@/data/rounds-data";

interface RunsTimerProps {
  round: RoundType;
}

export default function RoundProgress({ round }: RunsTimerProps) {
  const isTinyScreen = useMedia("(max-width: 479px)", false);
  const isSmallScreen = useMedia(
    "(min-width: 480px) and (max-width: 767px)",
    false
  );    
  const cellCount = isTinyScreen ? 30 : isSmallScreen ? 50 : 80;

  const currentBlock = 6526300;
  const percentage =
    currentBlock > round.endBlock
      ? 1
      : (currentBlock - round.startBlock) / (round.endBlock - round.startBlock);
  const cells = Array.from({ length: cellCount }, (_, index) => {
    return {
      isPassed: index < percentage * cellCount,
    };
  });

  return (
    <div className="w-full border border-muted rounded-lg mt-4 px-7 py-5 bg-gray-50">
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
              "w-[6px] h-10 rounded-full",
              cell.isPassed ? "bg-primary-green" : "bg-gray-300"
            )}
          />
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
  );
}
