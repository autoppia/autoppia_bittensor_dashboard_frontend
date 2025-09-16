"use client";

import Image from "next/image";
import { Title, Text, Button } from "rizzui";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import MetricCard from "@core/components/cards/metric-card";
import cn from "@core/utils/class-names";
import { validatorsData } from "@/data/validators-data";

interface TasksStatProps {
  className?: string;
}

// @md:grid-cols-2 @2xl:grid-cols-3 @3xl:grid-cols-4 @7xl:grid-cols-5
export default function TasksStat({ className }: TasksStatProps) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  return (
    <div
      className={cn(
        "relative flex w-auto items-center overflow-hidden",
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute left-0 top-0 z-10 !h-full w-8 !justify-start rounded-none bg-gradient-to-r from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar grid grid-flow-col gap-5 overflow-x-auto scroll-smooth"
        >
          {validatorsData.map((val: any) => {
            return (
              <MetricCard
                key={`validator-${val.uid}`}
                title=""
                metric=""
                className="min-w-[292px] max-w-full flex-row-reverse"
              >
                <div className="flex items-center justify-start gap-5">
                  <div className="w-14 h-14">
                    <Image 
                    src={val.icon} 
                    className="rounded-full" 
                    alt="validator" 
                    width={24} 
                    height={24} 
                    />
                  </div>
                  <div className="">
                    <Text className="mb-1 text-sm font-medium text-gray-500">
                      {val.name}
                    </Text>
                    <Title
                      as="h4"
                      className="mb-1 text-xl font-semibold text-gray-900"
                    >
                      {val.total_tasks} tasks
                    </Title>
                  </div>
                </div>
              </MetricCard>
            );
          })}
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute right-0 top-0 z-10 !h-full w-8 !justify-end rounded-none bg-gradient-to-l from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}
