"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Text } from "rizzui";
import { PiCaretLeftBold, PiCaretRightBold, PiUsersThreeDuotone } from "react-icons/pi";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import cn from "@core/utils/class-names";
import { resolveAssetUrl } from "@/services/utils/assets";

interface ValidatorPerformance {
  id: string;
  uid: number;
  name: string;
  icon: string;
  hotkey: string | null;
}

interface ValidatorsSelectorProps {
  validators: ValidatorPerformance[];
  selectedValidatorId?: string | null;
  onValidatorSelect?: (validator: ValidatorPerformance) => void;
  loading?: boolean;
  error?: string | null;
  showHeader?: boolean;
  linkToDetails?: boolean; // If true, clicking navigates to /validator/:uid, otherwise calls onValidatorSelect
}

export default function ValidatorsSelector({
  validators,
  selectedValidatorId = null,
  onValidatorSelect,
  loading = false,
  error = null,
  showHeader = true,
  linkToDetails = false,
}: ValidatorsSelectorProps) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  if (loading) {
    return (
      <div className="mt-10 mb-6">
        <div className="flex items-center gap-4 mb-5">
          {showHeader && (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 shadow-lg ring-2 ring-sky-400/20">
                <PiUsersThreeDuotone className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <Text className="text-xl font-black text-white">
                  Multiple Validators
                </Text>
                <Text className="text-xs text-white/60 font-semibold">
                  Select a validator to view detailed performance metrics
                </Text>
              </div>
            </>
          )}
        </div>
        <div className="relative flex w-auto items-center overflow-hidden">
          <div className="w-full overflow-hidden">
            <div className="grid grid-flow-col gap-4 overflow-x-auto scroll-smooth">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="w-full min-w-[200px] px-5 py-5 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-sky-500/20 via-cyan-500/15 to-blue-500/20"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 mb-4 animate-pulse" />
                    <div className="h-4 w-24 bg-white/10 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 mb-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            ⚠️ Failed to load validators: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!validators || validators.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 mb-6">
      {showHeader && (
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 shadow-lg ring-2 ring-sky-400/20">
            <PiUsersThreeDuotone className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <Text className="text-xl font-black text-white">
              Multiple Validators
            </Text>
            <Text className="text-xs text-white/60 font-semibold">
              Select a validator to view detailed performance metrics
            </Text>
          </div>
        </div>
      )}

      <div className="relative flex w-auto items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent px-0 ps-1 text-white/70 hover:text-white 3xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>

        <div className="w-full overflow-hidden">
          <div
            ref={sliderEl}
            className="custom-scrollbar grid grid-flow-col gap-8 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-0 px-4 py-6"
          >
            {validators.map((validator) => {
              const iconSrc = resolveAssetUrl(
                validator.icon,
                resolveAssetUrl("/validators/Other.png")
              );
              const isActive = selectedValidatorId === validator.id;

              const cardContent = (
                <div
                  className={cn(
                    "relative w-full min-w-[200px] px-5 py-5 transition-all duration-500 shadow-2xl group rounded-2xl",
                    "border-2",
                    isActive
                      ? "border-sky-400/70 bg-gradient-to-br from-sky-500/20 via-cyan-500/15 to-blue-500/20 ring-4 ring-sky-400/30"
                      : "border-white/20 bg-gradient-to-br from-sky-500/20 via-cyan-500/15 to-blue-500/20 hover:border-white/40 hover:bg-white/10 hover:scale-102 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <div className="relative flex flex-col items-center text-white">
                    <div
                      className={cn(
                        "relative aspect-square w-16 h-16 mb-4 transition-all duration-500",
                        "group-hover:scale-110 group-hover:rotate-3"
                      )}
                    >
                      <Image
                        src={iconSrc}
                        alt={validator.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className={cn(
                          "h-full w-full rounded-full object-contain transition-all duration-500 shadow-xl",
                          isActive
                            ? "ring-4 ring-sky-300/70 ring-offset-2 ring-offset-sky-500/20 shadow-[0_8px_30px_rgba(56,189,248,0.5)]"
                            : "ring-2 ring-white/20 group-hover:ring-4 group-hover:ring-white/40"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-lg font-black tracking-wide text-center transition-all duration-300",
                        isActive &&
                          "bg-gradient-to-r from-sky-200 via-white to-cyan-200 bg-clip-text text-transparent"
                      )}
                    >
                      {validator.name}
                    </span>
                    <span
                      className={cn(
                        "mt-2 text-xs font-bold tracking-wider font-inter truncate max-w-full px-3 py-1.5 rounded-full transition-all duration-300",
                        isActive
                          ? "text-sky-200 bg-sky-500/20 border border-sky-400/40"
                          : "text-white/60 group-hover:text-white/80 border border-transparent group-hover:border-white/20 group-hover:bg-white/10"
                      )}
                    >
                      {validator.hotkey
                        ? `${validator.hotkey.slice(0, 6)}...${validator.hotkey.slice(-6)}`
                        : "No hotkey"}
                    </span>
                  </div>
                </div>
              );

              if (linkToDetails) {
                return (
                  <Link
                    key={`validator-${validator.id}`}
                    href={`/validator/${validator.uid}`}
                    className="cursor-pointer"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={`validator-${validator.id}`}
                  onClick={() => {
                    if (validator.id === selectedValidatorId) return;
                    onValidatorSelect?.(validator);
                  }}
                  className="cursor-pointer"
                >
                  {cardContent}
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
          className="!absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-slate-900 via-slate-900/60 to-transparent px-0 pe-2 text-white/70 hover:text-white 3xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>

      {selectedValidatorId && (
        <div className="mt-10 mb-8">
          <div className="flex items-center gap-8">
            <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-lg"></div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 via-cyan-500/15 to-blue-500/20 border-2 border-sky-400/40 shadow-lg">
              <div className="relative">
                <div className="w-4 h-4 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.7)] ring-4 ring-amber-400/20"></div>
                <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <Text className="text-xl font-black tracking-wide bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                {validators.find((v) => v.id === selectedValidatorId)?.name || "Selected Validator"}
              </Text>
            </div>
            <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-lg"></div>
          </div>
        </div>
      )}
    </div>
  );
}
