"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/config/routes";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold, PiCheckCircleFill } from "react-icons/pi";
import { LuCircleCheckBig, LuActivity } from "react-icons/lu";
import { useRounds } from "@/services/hooks/useRounds";
import { extractRoundIdentifier, extractRoundNumber } from "./round-identifier";
import { Skeleton } from "@core/ui/skeleton";

export default function RoundRecents() {
  const { id } = useParams();
  const currentRoundKey = extractRoundIdentifier(id);
  const currentRoundNumber = extractRoundNumber(currentRoundKey);
  
  // Get rounds data from API - ordered from higher to lower (descending)
  const { data: roundsData, loading, error } = useRounds({
    page: 1,
    limit: 10,
    sortBy: "startTime",
    sortOrder: "desc",
  });

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  // Show loading state
  if (loading) {
    return (
      <div className="relative flex w-auto items-center overflow-hidden mb-3">
        <div className="w-full overflow-hidden">
          <div className="grid grid-flow-col gap-5 overflow-x-auto scroll-smooth">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="w-full min-w-[320px] rounded-xl px-6 py-7 border-2 border-gray-200">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-0.5 w-8" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-3">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load recent rounds: {error}
          </p>
        </div>
      </div>
    );
  }

  const roundsSource = roundsData?.data?.rounds ?? [];
  const roundsList = roundsSource.slice(0, 10);

  if (roundsList.length === 0) {
    return (
      <div className="mb-3">
        <div className="rounded-lg border border-gray-200 px-6 py-5 text-sm text-gray-500">
          No recent rounds available.
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-4">
        {/* Left Arrow Button */}
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <PiCaretLeftBold className="h-6 w-6" />
        </Button>

        {/* Slider Container */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={sliderEl}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-0"
            style={{
              scrollbarWidth: 'none',
            }}
          >
            {roundsList.map((round, index: number) => {
              const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
              const baseNumber = round.roundNumber ?? round.id;
              const isActive =
                (currentRoundKey !== undefined && roundKey === currentRoundKey) ||
                (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
              const isCurrent = round.current;
              const RoundIcon = isCurrent ? LuActivity : LuCircleCheckBig;
              const isHighlighted = isActive || isCurrent;
              
              return (
              <Link 
                key={roundKey} 
                href={`${routes.rounds}/${encodeURIComponent(roundKey)}`}
                className="snap-start flex-shrink-0 w-[calc(33.333%-1rem)] min-w-[320px]"
              >
                  <div
                    className={cn(
                      "w-full h-full rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group backdrop-blur-md",
                      isHighlighted
                        ? "bg-[wheat] border-2 border-[#e2c48a] text-black shadow-amber-200/40 hover:border-[#d7b26d] hover:shadow-amber-300/60"
                        : "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white hover:shadow-xl hover:shadow-blue-500/30"
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span
                          className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 bg-white text-black"
                        >
                          <RoundIcon className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        </span>
                        <span
                          className={cn(
                            "text-[20px] font-bold uppercase tracking-wide",
                            isHighlighted ? "text-black" : "text-white"
                          )}
                        >
                          Round {baseNumber}
                        </span>
                      </div>
                      {!isCurrent && (
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                            isHighlighted 
                              ? "bg-green-500/20 text-green-700" 
                              : "bg-green-500/25 text-green-300"
                          )}
                        >
                          <PiCheckCircleFill className="w-3 h-3" />
                          Finished
                        </span>
                      )}
                    </div>
                    
                    {/* Epoch Range */}
                    <div className="space-y-1.5">
                      <div
                        className={cn(
                          "flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide",
                          isHighlighted ? "text-black/60" : "text-gray-400"
                        )}
                      >
                        <span>Start</span>
                        <span>End</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all",
                            isHighlighted 
                              ? "bg-black/10 text-black" 
                              : "bg-white/10 text-white group-hover:bg-white/15"
                          )}
                        >
                          {round.startBlock}
                        </div>
                        <div
                          className={cn(
                            "w-8 h-[2px] rounded-full",
                            isHighlighted ? "bg-black/20" : "bg-white/20"
                          )}
                        />
                        <div
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all",
                            isHighlighted 
                              ? "bg-black/10 text-black" 
                              : "bg-white/10 text-white group-hover:bg-white/15"
                          )}
                        >
                          {round.endBlock}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <PiCaretRightBold className="h-6 w-6" />
        </Button>
      </div>

      {/* Rounds Slider Separator */}
      <div className="mt-10 mb-8">
        <div className="h-[3px] bg-gradient-to-r from-transparent via-gray-400/70 to-transparent shadow-sm"></div>
      </div>
    </div>
  );
}
