"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button, Text } from "rizzui";
import cn from "@core/utils/class-names";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundValidators } from "@/services/hooks/useRounds";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold, PiShieldCheckFill, PiInfoDuotone } from "react-icons/pi";

export default function RoundValidators({ className }: { className?: string }) {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Get validators data from API
  const { data: validatorsData, loading, error } = useRoundValidators(roundId);
  
  const [selectedValidatorId, setSelectedValidatorId] = useState<string | null>(null);

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  // Set first validator as selected when data loads
  React.useEffect(() => {
    if (validatorsData && validatorsData.length > 0 && !selectedValidatorId) {
      setSelectedValidatorId(validatorsData[0].id);
    }
  }, [validatorsData, selectedValidatorId]);

  const selectedValidator = validatorsData?.find(v => v.id === selectedValidatorId);

  // Show loading state
  if (loading) {
    return (
      <div className={cn(className)}>
        <div className="relative flex w-auto items-center overflow-hidden">
          <div className="w-full overflow-hidden">
            <div className="grid grid-flow-col gap-4 overflow-x-auto scroll-smooth">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-full min-w-[220px] rounded-xl px-5 py-5 border-2 border-gray-200">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200/50">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn(className)}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            ⚠️ Failed to load validators: {error}
          </p>
        </div>
      </div>
    );
  }

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

            {/* Individual Validator Cards */}
            {validatorsData?.map((validator) => {
              const isActive = selectedValidatorId === validator.id;

              return (
                <div
                  key={`validator-${validator.id}`}
                  onClick={() => setSelectedValidatorId(validator.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-full min-w-[220px] rounded-xl px-5 py-5 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
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
                            isActive && "ring-2 ring-blue-400/50 ring-offset-2 shadow-lg shadow-blue-500/50"
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

      {/* Dynamic Content Separator */}
      <div className="mt-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200/50">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <Text className="text-xs text-blue-600 font-medium">
              {selectedValidator?.name || "Selected Validator"}
            </Text>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
