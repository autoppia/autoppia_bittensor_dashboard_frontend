"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button, Text } from "rizzui";
import cn from "@core/utils/class-names";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundValidators } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold, PiInfoDuotone } from "react-icons/pi";
import type { ValidatorPerformance } from "@/services/api/types/rounds";
import { resolveAssetUrl } from "@/services/utils/assets";

export default function RoundValidators({
  className,
  onValidatorSelect,
  selectedValidatorId: externalSelectedId = null,
  requestedValidatorId = null,
}: {
  className?: string;
  onValidatorSelect?: (validator: ValidatorPerformance) => void;
  selectedValidatorId?: string | null;
  requestedValidatorId?: string | null;
}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  
  // Get validators data from API
  const { data: validatorsData, loading, error } = useRoundValidators(roundKey);
  
  const [selectedValidatorId, setSelectedValidatorId] = useState<string | null>(
    requestedValidatorId ?? externalSelectedId
  );
  const lastNotifiedValidator = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (requestedValidatorId && requestedValidatorId !== selectedValidatorId) {
      setSelectedValidatorId(requestedValidatorId);
      return;
    }
    if (externalSelectedId && externalSelectedId !== selectedValidatorId) {
      setSelectedValidatorId(externalSelectedId);
    }
  }, [externalSelectedId, requestedValidatorId, selectedValidatorId]);

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  // Set first validator as selected when data loads and notify parent
  React.useEffect(() => {
    if (!validatorsData || validatorsData.length === 0) {
      return;
    }

    const resolveValidatorById = (candidateId: string | null | undefined) =>
      candidateId
        ? validatorsData.find((validator) => validator.id === candidateId) ?? null
        : null;

    const requested = resolveValidatorById(requestedValidatorId);
    const currentExternal = resolveValidatorById(externalSelectedId);
    const currentSelected = resolveValidatorById(selectedValidatorId);

    if (requestedValidatorId && !requested) {
      // Wait for the requested validator to show up in the dataset.
      return;
    }

    const nextValidator = requested ?? currentExternal ?? currentSelected ?? validatorsData[0];
    if (!nextValidator) {
      return;
    }

    if (selectedValidatorId !== nextValidator.id) {
      setSelectedValidatorId(nextValidator.id);
    }

    if (onValidatorSelect && lastNotifiedValidator.current !== nextValidator.id) {
      onValidatorSelect(nextValidator);
      lastNotifiedValidator.current = nextValidator.id;
    }
  }, [validatorsData, selectedValidatorId, externalSelectedId, requestedValidatorId, onValidatorSelect]);

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
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/20 rounded-full border border-blue-700/50">
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
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
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
              const iconSrc = resolveAssetUrl(
                validator.icon,
                resolveAssetUrl("/validators/Other.png")
              );
              const isActive = selectedValidatorId === validator.id;

              return (
                <div
                  key={`validator-${validator.id}`}
                  onClick={() => {
                    if (validator.id === selectedValidatorId) {
                      return;
                    }
                    setSelectedValidatorId(validator.id);
                    lastNotifiedValidator.current = validator.id;
                    onValidatorSelect?.(validator);
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-full min-w-[220px] rounded-xl px-5 py-5 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
                      isActive
                        ? "bg-[wheat] border-[#e2c48a] hover:border-[#d7b26d] shadow-amber-200/40 hover:shadow-amber-300/60"
                        : "bg-transparent border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
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
                          src={iconSrc}
                          alt={validator.name}
                          fill
                          sizes="(max-width: 768px) 100vw"
                          className={cn(
                            "h-full w-full rounded-full object-contain transition-all duration-300",
                            isActive && "ring-2 ring-amber-300/60 ring-offset-2 shadow-lg shadow-amber-500/40"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-base font-bold tracking-wide transition-colors duration-300 text-center",
                          isActive ? "text-black" : "text-white"
                        )}
                      >
                        {validator.name}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 text-xs font-medium tracking-wide font-inter transition-colors duration-300 truncate max-w-full",
                          isActive ? "text-black/70" : "text-gray-300"
                        )}
                      >
                        {validator.hotkey
                          ? `${validator.hotkey.slice(0, 6)}...${validator.hotkey.slice(-6)}`
                          : "No hotkey"}
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
      <div className="mt-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-amber-100/80 rounded-full border-2 border-amber-300/60 shadow-lg backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full animate-pulse shadow-md"></div>
            <Text className="text-lg text-amber-800 font-bold tracking-wide">
              {selectedValidator?.name || "Selected Validator"}
            </Text>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
