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
  LuTrophy,
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
      description: "Last network position",
      icon: LuChartNoAxesCombined,
      className:
        "relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-yellow-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-yellow-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-yellow-100/80",
    },
    {
      title: "All-Time Best Rank",
      metric: `#${miner?.ranking || 1}`,
      description: "Best ranking achieved",
      icon: LuTrophy,
      className:
        "relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-blue-600/25 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-blue-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-blue-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-blue-100/80",
    },
    {
      title: "All-Time Best Score",
      metric: miner?.score.toFixed(2),
      description: "Peak performance ever",
      icon: LuStar,
      className:
        "relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/25 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-emerald-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-emerald-100/80",
    },
    {
      title: "Rounds Participated",
      metric: 20,
      description: "Total evaluations",
      icon: LuCircleCheckBig,
      className: "relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-purple-600/25 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-purple-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-purple-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-purple-100/80",
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
                  "relative p-6 rounded-2xl min-w-[280px] cursor-pointer",
                  stat.className
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl",
                        stat.iconClassName
                      )}
                    >
                      <Icon className="w-7 h-7 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-2 rounded-full bg-current opacity-60 mb-1"></div>
                      <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Text className="text-xs font-semibold text-gray-600/90 uppercase tracking-wider mb-1">
                      {stat.title}
                    </Text>
                    <Text
                      className={cn(
                        "font-black text-4xl leading-none",
                        stat.metricClassName
                      )}
                    >
                      {stat.metric}
                    </Text>
                  </div>
                  
                  <Text className={cn("text-sm font-medium leading-relaxed", stat.descriptionClassName)}>
                    {stat.description}
                  </Text>
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
