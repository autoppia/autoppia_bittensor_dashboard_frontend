"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { validatorsData } from "@/data/validators-data";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

export default function RoundValidators({ className }: { className?: string }) {
  const [selectedValidatorId, setSelectedValidatorId] = useState<string | null>(
    "all" // All validators selected by default
  );

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  const autoppiaValidator = validatorsData.find(v => v.id === "autoppia");

  return (
    <div className={cn(className)}>
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
            className="custom-scrollbar grid grid-flow-col gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-0"
          >
            {/* All Validators Card */}
            <div
              key="validator-all"
              onClick={() => setSelectedValidatorId("all")}
              className="cursor-pointer"
            >
              <div
                className={cn(
                  "w-full min-w-[210px] rounded-xl px-5 py-5 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
                  selectedValidatorId === "all"
                    ? "bg-gradient-to-br from-blue-500/15 via-blue-500/15 to-blue-600/15 border-blue-500/40 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/25"
                    : "border-muted hover:border-blue-500 bg-gray-50 hover:bg-gray-100"
                )}
              >
                {/* Validator Content */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative aspect-square w-12 h-12 mb-3 transition-transform duration-300",
                      "group-hover:scale-110"
                    )}
                  >
                    <Image
                      src={autoppiaValidator?.icon || "/validators/Autoppia.png"}
                      alt="All Validators"
                      fill
                      sizes="(max-width: 768px) 100vw"
                      className={cn(
                        "h-full w-full rounded-full object-contain transition-all duration-300",
                        selectedValidatorId === "all" && "ring-2 ring-blue-400/50 ring-offset-2"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-base font-bold tracking-wide transition-colors duration-300 text-center",
                      selectedValidatorId === "all" ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    All Validators
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 text-xs font-medium tracking-wide transition-colors duration-300 truncate max-w-full",
                      selectedValidatorId === "all" ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    6 validators
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Validator Cards */}
            {validatorsData.map((validator) => {
              const isActive = selectedValidatorId === validator.id;

              return (
                <div
                  key={`validator-${validator.id}`}
                  onClick={() => setSelectedValidatorId(isActive ? "all" : validator.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-full min-w-[200px] rounded-xl px-5 py-5 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
                      isActive
                        ? "bg-gradient-to-br from-blue-500/15 via-blue-500/15 to-blue-600/15 border-blue-500/40 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/25"
                        : "border-muted hover:border-blue-500 bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    {/* Validator Content */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "relative aspect-square w-12 h-12 mb-3 transition-transform duration-300",
                          "group-hover:scale-110"
                        )}
                      >
                        <Image
                          src={validator.icon}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className={cn(
                            "h-full w-full rounded-full object-contain transition-all duration-300",
                            isActive && "ring-2 ring-blue-400/50 ring-offset-2"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-base font-bold tracking-wide transition-colors duration-300 text-center",
                          isActive ? "text-gray-900" : "text-gray-700"
                        )}
                      >
                        {validator.name}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 text-xs font-medium tracking-wide font-mono transition-colors duration-300 truncate max-w-full",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )}
                      >
                        {validator.hotkey.slice(0, 6)}...
                        {validator.hotkey.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
