"use client";

import Image from "next/image";
import { Button } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { validatorsData } from "@/data/validators-data";

export default function RoundValidators({
  validatorId,
  setValidatorId,
}: {
  validatorId: string;
  setValidatorId: (validatorId: string) => void;
}) {
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
          {validatorsData.map((validator) => {
            const isActive = validator.id === validatorId;

            return (
              <div
                key={`validator-${validator.id}`}
                onClick={() => setValidatorId(validator.id)}
                className={cn(
                  "min-w-[292px] box-border bg-gray-50 hover:bg-gray-100 px-5 py-6 rounded-lg border border-muted cursor-pointer",
                  isActive && "dark:bg-gray-100 border-gray-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={validator.icon}
                    alt={validator.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-contain"
                  />
                  <div>
                    <h3 className="text-gray-900 font-semibold text-base">
                      {validator.name}
                    </h3>
                    <p className="text-gray-700 text-sm mt-1">
                      {validator.total_tasks} tasks
                    </p>
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
  );
}
