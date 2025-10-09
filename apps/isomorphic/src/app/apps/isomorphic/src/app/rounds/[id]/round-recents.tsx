"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { LuBox, LuTrophy, LuClock } from "react-icons/lu";
import { RoundType, roundsData } from "@/data/rounds-data";

export default function RoundRecents() {
  const { id } = useParams();
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  return (
    <div className="relative flex w-auto items-center overflow-hidden">
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
          {roundsData
            .slice()
            .reverse()
            .map((round: RoundType, index: number) => {
              const isActive = round.id === parseInt(id as string);
              return (
                <Link key={`round-${index}`} href={`/rounds/${round.id}`}>
                  <div
                    className={cn(
                      "w-full min-w-[250px] rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group backdrop-blur-md",
                      isActive
                        ? "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-400/40 hover:border-emerald-400/60"
                        : "border border-muted hover:border-emerald-500 bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <span
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110",
                          "bg-gradient-to-br from-emerald-400 to-emerald-600 text-gray-900 group-hover:scale-110"
                        )}
                      >
                        <LuClock className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                      <span
                        className={cn(
                          "text-[20px] font-bold uppercase tracking-wide",
                          isActive ? "text-emerald-400" : "text-gray-700"
                        )}
                      >
                        Round {round.id}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "flex items-center space-x-0.5 text-xs font-medium uppercase tracking-wide",
                        isActive ? "text-emerald-200" : "text-gray-500"
                      )}
                    >
                      <LuBox className="w-3 h-3" />
                      <span>{round.startBlock}</span>
                      <span className="mx-1">-</span>
                      <LuBox className="w-3 h-3" />
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
    </div>
  );
}
