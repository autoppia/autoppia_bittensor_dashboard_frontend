"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { PiCubeDuotone, PiClockDuotone, PiHourglassSimpleDuotone } from "react-icons/pi";
import { useRoundProgress, useRound } from "@/services/hooks/useRounds";
import { roundsData } from "@/data/rounds-data";

export default function RoundProgress() {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Try to get progress data from API, fallback to static data
  const { data: progressData, loading: progressLoading, error: progressError } = useRoundProgress(roundId);
  const { data: roundData, loading: roundLoading, error: roundError } = useRound(roundId);
  
  // Use API data if available, otherwise fallback to static data
  const round = roundData || roundsData.find((round) => round.id === roundId);
  const progress = progressData;
  
  const loading = progressLoading || roundLoading;
  const isTinyScreen = useMedia("(max-width: 639px)", false);
  const isSmallScreen = useMedia("(min-width: 640px) and (max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const cellCount = isTinyScreen ? 30 : isSmallScreen ? 50 : isMediumScreen ? 75 : 100;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate time remaining based on round end block
  useEffect(() => {
    if (!round) return;
    
    const calculateTimeLeft = () => {
      // Use API progress data if available, otherwise calculate from static data
      if (progress?.estimatedTimeRemaining) {
        setTimeLeft(progress.estimatedTimeRemaining);
        return;
      }
      
      // Fallback calculation for static data
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
  }, [round?.endBlock, progress?.estimatedTimeRemaining]);

  // Use API data if available, otherwise fallback to static calculation
  const currentBlock = progress?.currentBlock || 6526300;
  const percentage = progress?.progress || (
    currentBlock > round.endBlock
      ? 1
      : (currentBlock - round.startBlock) / (round.endBlock - round.startBlock)
  );
  const cells = Array.from({ length: cellCount }, (_, index) => {
    return {
      isPassed: index < percentage * cellCount,
    };
  });

  // Show loading state
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            Round Progress
          </div>
          <div className="animate-pulse bg-gray-300 h-6 w-24 rounded"></div>
        </div>
        <div className="w-full flex items-center justify-between mb-4">
          {Array.from({ length: cellCount }, (_, index) => (
            <span
              key={index}
              className="w-[6px] h-10 rounded-full bg-gray-300 animate-pulse"
            />
          ))}
        </div>
        <div className="text-center text-gray-600">
          Loading progress data...
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if ((progressError || roundError) && !round) {
    return (
      <div className="w-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Progress Data Unavailable</p>
          <p className="text-sm mt-2">Using static data as fallback</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-500/10 via-gray-500/10 to-gray-500/10 border-2 border-gray-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold">Round Not Found</p>
        </div>
      </div>
    );
  }

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
