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
        "bg-gradient-to-br from-yellow-500/15 via-yellow-400/15 to-yellow-600/15 border-2 border-yellow-500/40 hover:border-yellow-400/60 transition-all duration-300 shadow-lg group backdrop-blur-sm",
      metricClassName: "text-yellow-500",
      iconClassName: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "text-yellow-200",
    },
    {
      title: "All-Time Best Score",
      metric: miner?.score.toFixed(2),
      description: "Peak performance ever",
      icon: LuStar,
      className:
        "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-500/40 hover:border-emerald-400/60 transition-all duration-300 shadow-lg group backdrop-blur-sm",
      metricClassName: "text-emerald-500",
      iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "text-emerald-200",
    },
    {
      title: "Rounds Completed",
      metric: 20,
      description: "Total evaluations",
      icon: LuCircleCheckBig,
      className: "border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-300 group",
      metricClassName: "text-violet-700",
      iconClassName: "bg-gradient-to-br from-violet-400 to-violet-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "",
    },
    {
      title: "Total Alpha Earned",
      metric: "Coming Soon",
      description: "TAO rewards",
      icon: LuDollarSign,
      className: "border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-300 group",
      metricClassName: "text-blue-700 text-lg",
      iconClassName: "bg-gradient-to-br from-blue-400 to-blue-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "",
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
                  "p-5 rounded-xl min-w-[240px]",
                  stat.className
                )}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg",
                      stat.iconClassName
                    )}
                  >
                    <Icon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <Text className="text-sm font-medium ms-3 text-gray-700 uppercase tracking-wide">
                    {stat.title}
                  </Text>
                </div>
                <div className="flex items-center h-12 mb-1">
                  <Text
                    className={cn(
                      "font-bold text-3xl",
                      stat.metricClassName
                    )}
                  >
                    {stat.metric}
                  </Text>
                </div>
                <Text className={cn("text-xs text-gray-600 font-medium", stat.descriptionClassName)}>
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
