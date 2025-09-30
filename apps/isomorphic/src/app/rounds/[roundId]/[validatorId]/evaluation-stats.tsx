"use client";

import { Button } from "rizzui";
import MetricCard from "@core/components/cards/metric-card";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { LuPickaxe, LuAtom, LuTrophy, LuChartColumnBig } from "react-icons/lu";
import { primaryColors } from "@/data/colors-data";

const statsData = [
  {
    title: "Total Miners",
    metric: 25,
    icon: LuPickaxe,
    color: primaryColors.green,
  },
  {
    title: "Total Tasks",
    metric: 3452,
    icon: LuAtom,
    color: primaryColors.blue,
  },
  {
    title: "Winning Score",
    metric: 0.95,
    icon: LuTrophy,
    color: primaryColors.yellow,
  },
  {
    title: "Averate Score",
    metric: 0.88,
    icon: LuChartColumnBig,
    color: primaryColors.pink,
  },
];

export default function EvaluationStats() {
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
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <MetricCard
                key={stat.title}
                title={stat.title}
                metric={stat.metric}
                icon={
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-lg text-gray-900"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                }
                iconClassName="bg-transparent w-11 h-11"
                className="min-w-[240px]"
              />
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
