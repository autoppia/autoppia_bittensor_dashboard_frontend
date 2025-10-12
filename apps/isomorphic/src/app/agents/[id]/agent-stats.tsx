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
  LuAward,
  LuTarget,
  LuCoins,
} from "react-icons/lu";
import { useMinerDetails, useAgentPerformance } from "@/services/hooks/useAgents";
import { AgentStatsPlaceholder } from "@/components/placeholders/agent-placeholders";

export default function AgentStats() {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const { data: agentData, loading: agentLoading } = useMinerDetails(uid);
  const agent = agentData?.agent;
  const { data: performance, loading: performanceLoading } = useAgentPerformance(id as string, {
    timeRange: '7d'
  });

  const loading = agentLoading || performanceLoading;

  // Show loading placeholder
  if (loading) {
    return <AgentStatsPlaceholder />;
  }

  if (!agent) {
    return null;
  }

  const agentStats = [
    {
      title: "Current Rank",
      metric: `#${agent?.currentRank || 'N/A'}`,
      description: "Current ranking position",
      icon: LuAward,
      className:
        "relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-amber-600/25 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-amber-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-amber-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-amber-100/80",
    },
    {
      title: "Best Rank Ever",
      metric: `#${agent?.bestRankEver || 'N/A'}`,
      description: "Highest ranking achieved",
      icon: LuTrophy,
      className:
        "relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-yellow-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-yellow-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-yellow-100/80",
    },
    {
      title: "Current Score",
      metric: (agent?.currentScore ?? 0).toFixed(1) + '%',
      description: "Current performance score",
      icon: LuTarget,
      className:
        "relative overflow-hidden bg-gradient-to-br from-green-500/20 via-green-400/15 to-green-600/25 border border-green-500/30 hover:border-green-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-green-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-green-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-green-100/80",
    },
    {
      title: "Rounds Participated",
      metric: (agent.roundsParticipated || agent.totalRuns).toLocaleString(),
      description: "Total rounds participated in",
      icon: LuCircleCheckBig,
      className: "relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-blue-600/25 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-blue-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-blue-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-blue-100/80",
    },
    {
      title: "Alpha Won in Prizes",
      metric: (agent.alphaWonInPrizes || 0).toFixed(2) + ' α',
      description: "Total alpha tokens earned",
      icon: LuCoins,
      className: "relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-purple-600/25 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-purple-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-purple-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
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
          {agentStats.map((stat) => {
            const Icon = stat.icon;
            return (
            <div
              key={stat.title}
              className={cn(
                "relative p-4 rounded-xl min-w-[200px] cursor-pointer",
                stat.className
              )}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg",
                        stat.iconClassName
                      )}
                    >
                      <Icon className="w-6 h-6 group-hover:rotate-6 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <Text className="text-xs font-semibold text-gray-600/90 uppercase tracking-wider mb-1">
                        {stat.title}
                      </Text>
                      <Text
                        className={cn(
                          "font-black text-2xl leading-none",
                          stat.metricClassName
                        )}
                      >
                        {stat.metric}
                      </Text>
                    </div>
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
