"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { LuBox, LuTrophy, LuCircleCheckBig } from "react-icons/lu";
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
                      "w-full min-w-[290px] rounded-lg border border-gray-300 hover:border-emerald-500 px-6 py-7 @container bg-gray-50",
                      isActive && "bg-emerald-500 border-emerald-500"
                    )}
                  >
                    <div className="mb-4 flex items-center gap-5">
                      <span
                        className={cn(
                          "flex rounded-md p-2.5 bg-emerald-500 text-white",
                          isActive && "bg-white text-emerald-500"
                        )}
                      >
                        <LuCircleCheckBig className="h-auto w-[30px]" />
                      </span>
                      <div className="space-y-1.5">
                        <p
                          className={cn(
                            "text-lg font-bold text-gray-700 2xl:text-[20px] 3xl:text-3xl",
                            isActive && "text-white"
                          )}
                        >
                          Round {round.id}
                        </p>
                        <p
                          className={cn(
                            "flex items-center space-x-0.5 font-medium text-gray-500",
                            isActive && "text-white"
                          )}
                        >
                          <LuBox />
                          <span>{round.startBlock}</span>
                          <span className="mx-1">-</span>
                          <LuBox />
                          <span>{round.endBlock}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "mr-2 px-2 py-1 rounded-full bg-emerald-500/70 text-white",
                          isActive && "bg-white text-emerald-500/70"
                        )}
                      >
                        <LuTrophy className="w-4 h-4" />
                      </span>
                      <span
                        className={cn(
                          "text-gray-700",
                          isActive && "text-white"
                        )}
                      >
                        Winner UID: 234
                      </span>
                    </div>
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
