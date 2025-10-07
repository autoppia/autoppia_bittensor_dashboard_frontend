"use client";

import { useParams } from "next/navigation";
import { Button, Text } from "rizzui";
import cn from "@core/utils/class-names";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import {
  LuChartNoAxesCombined,
  LuStar,
  LuCircleCheckBig,
  LuDollarSign,
} from "react-icons/lu";
import { sortedMinersData } from "@/data/miners-data";

export default function AgentStats() {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  const { id } = useParams();
  const miner = sortedMinersData.find(
    (miner) => miner.uid === parseInt(id as string)
  );

  const minerStats = [
    {
      title: "Current Rank",
      metric: `#${miner?.ranking}`,
      description: "Live leaderboard position",
      icon: LuChartNoAxesCombined,
      className:
        "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/15",
      metricClassName: "text-yellow-500",
      iconClassName: "bg-yellow-500/30 text-yellow-500",
    },
    {
      title: "All-Time Best Score",
      metric: miner?.score.toFixed(2),
      description: "Peak performance ever",
      icon: LuStar,
      className:
        "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15",
      metricClassName: "text-emerald-500",
      iconClassName: "bg-emerald-500/30 text-emerald-500",
    },
    {
      title: "Rounds Completed",
      metric: 20,
      description: "Total evaluations",
      icon: LuCircleCheckBig,
      className: "border-muted bg-gray-50",
      metricClassName: "text-violet-700",
      iconClassName: "bg-violet-700/30 text-violet-700",
    },
    {
      title: "Total Alpha Earned",
      metric: "Coming Soon",
      description: "TAO rewards",
      icon: LuDollarSign,
      className: "border-muted bg-gray-50",
      metricClassName: "text-blue-700 text-lg",
      iconClassName: "bg-blue-700/30 text-blue-700",
    },
  ];

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
          {minerStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={cn(
                  "border p-5 rounded-lg min-w-[240px]",
                  stat.className
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-11 h-11 bg-opacity-30 rounded-lg",
                      stat.iconClassName
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <Text className="text-lg ms-3 text-gray-700">
                    {stat.title}
                  </Text>
                </div>
                <div className="flex items-center h-11 ms-1 pt-2">
                  <Text
                    className={cn(
                      "font-lexend text-3xl font-semibold",
                      stat.metricClassName
                    )}
                  >
                    {stat.metric}
                  </Text>
                </div>
                <Text className="text-sm font-medium text-gray-500">
                  {stat.description}
                </Text>
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
