"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { PiCubeDuotone, PiClockDuotone, PiHourglassSimpleDuotone } from "react-icons/pi";
import { roundsData } from "@/data/rounds-data";

export default function RoundProgress() {
  const { id } = useParams();
  const round = roundsData.find((round) => round.id === parseInt(id as string))!;
  const isTinyScreen = useMedia("(max-width: 639px)", false);
  const isSmallScreen = useMedia("(min-width: 640px) and (max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const cellCount = isTinyScreen ? 30 : isSmallScreen ? 50 : isMediumScreen ? 75 : 100;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate time remaining based on round end block
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Assuming each block takes ~12 seconds (Bittensor standard)
      const blocksPerSecond = 1 / 12;
      const currentBlock = 6526300;
      const blocksRemaining = Math.max(0, round.endBlock - currentBlock);
      const secondsRemaining = blocksRemaining / blocksPerSecond;

      const days = Math.floor(secondsRemaining / (24 * 60 * 60));
      const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
      const seconds = Math.floor(secondsRemaining % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [round.endBlock]);

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
    <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-gray-900">
          Round Progress
        </div>
        <div className="flex items-center text-md text-white font-semibold">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 shadow-lg">
            <PiHourglassSimpleDuotone className="w-3 h-3" />
          </div>
          <span className="ms-1">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
            {timeLeft.seconds}s
          </span>
        </div>
      </div>
      
      <div className="w-full flex items-center justify-between mb-4">
        {cells.map((cell, index) => (
          <span
            key={index}
            className={cn(
              "w-[6px] h-10 rounded-full transition-all duration-300 hover:scale-110",
              cell.isPassed 
                ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30" 
                : "bg-gray-300/50 hover:bg-gray-400/70"
            )}
          />
        ))}
      </div>
      
      <div className="w-full flex items-center justify-between">
        <div></div>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Start Block: </span>
            <span className="ms-1 text-gray-900">{round.startBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block text-gray-900">Current Block: </span>
            <span className="ms-1 text-gray-900">{currentBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">End Block: </span>
            <span className="ms-1 text-gray-900">{round.endBlock}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
