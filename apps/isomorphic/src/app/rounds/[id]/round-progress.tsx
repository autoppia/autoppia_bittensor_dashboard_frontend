"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { PiCubeDuotone, PiClockDuotone, PiHourglassSimpleDuotone } from "react-icons/pi";
import { useRoundProgress, useRound } from "@/services/hooks/useRounds";
import { Skeleton } from "@core/ui/skeleton";

export default function RoundProgress() {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Get data from API only
  const { data: progressData, loading: progressLoading, error: progressError } = useRoundProgress(roundId);
  const { data: roundData, loading: roundLoading, error: roundError } = useRound(roundId);
  
  const round = roundData;
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
      // Use API progress data only
      if (progress?.estimatedTimeRemaining) {
        setTimeLeft(progress.estimatedTimeRemaining);
        return;
      }
      
      // If no API data, set default values
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [round, progress?.estimatedTimeRemaining]);

  // Use API data only
  const currentBlock = progress?.currentBlock || 0;
  const percentage = progress?.progress || 0;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    return {
      isPassed: index < percentage * cellCount,
    };
  });

  // Show loading state with skeleton
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="w-full flex items-center justify-between mb-4">
          {Array.from({ length: cellCount }, (_, index) => (
            <Skeleton
              key={index}
              className="w-[6px] h-10 rounded-full"
            />
          ))}
        </div>
        <div className="w-full flex items-center justify-between">
          <div></div>
          <div className="w-full flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (progressError || roundError) {
    return (
      <div className="w-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Progress Data Unavailable</p>
          <p className="text-sm mt-2">Failed to load round data</p>
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
          <span>
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
