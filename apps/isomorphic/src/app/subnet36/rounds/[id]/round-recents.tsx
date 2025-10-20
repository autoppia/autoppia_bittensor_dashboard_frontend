"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/config/routes";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
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
              <div key={index} className="w-full min-w-[250px] rounded-xl px-6 py-7 border-2 border-gray-200">
                <div className="mb-4 flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-3 w-20" />
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
    <div className="relative flex w-auto items-center overflow-hidden mb-3">
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar grid grid-flow-col gap-5 overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8 [&::-webkit-scrollbar]:h-0"
        >
          {roundsList.map((round, index: number) => {
            const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
            const baseNumber = round.roundNumber ?? round.id;
            const isActive =
              (currentRoundKey !== undefined && roundKey === currentRoundKey) ||
              (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
            const isCurrent = round.current;
            const RoundIcon = isCurrent ? LuActivity : LuCircleCheckBig;
            
            return (
              <Link key={roundKey} href={`${routes.rounds}/${encodeURIComponent(roundKey)}`}>
                <div
                  className={cn(
                    "w-full min-w-[250px] rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
                    // Current round always has yellow styling
                    isCurrent && "bg-gradient-to-br from-yellow-500/15 via-amber-400/15 to-yellow-600/15 border-yellow-400/40 hover:border-yellow-400/60",
                    // Selected style (enhanced highlight) when clicked
                    isActive && !isCurrent && "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-400/60 hover:border-blue-400/80 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30",
                    // Past rounds styling
                    !isCurrent && !isActive && "border-muted hover:border-green-500 bg-gradient-to-br from-green-500/10 via-emerald-400/10 to-green-600/10 hover:bg-gradient-to-br hover:from-green-500/15 hover:via-emerald-400/15 hover:to-green-600/15"
                  )}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <span
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110",
                        isCurrent 
                          ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-gray-900"
                          : isActive
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                      )}
                    >
                      <RoundIcon className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <span
                      className={cn(
                        "text-[20px] font-bold uppercase tracking-wide",
                        isCurrent ? "text-yellow-500" : isActive ? "text-blue-400" : "text-gray-700"
                      )}
                    >
                      Round {baseNumber}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "flex items-center space-x-1 text-xs font-medium uppercase tracking-wide",
                      isCurrent ? "text-yellow-600" : isActive ? "text-blue-200" : "text-gray-500"
                    )}
                  >
                    <span className="text-white">Epochs:</span>
                    <span>{round.startBlock}</span>
                    <span>-</span>
                    <span>{round.endBlock}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="dark: !absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 pe-2 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>

      {/* Rounds Slider Separator */}
      <div className="mt-10 mb-8">
        <div className="h-[3px] bg-gradient-to-r from-transparent via-gray-400/70 to-transparent shadow-sm"></div>
      </div>
    </div>
  );
}
