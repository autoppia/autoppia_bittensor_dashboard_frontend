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
import { useAgent, useAgentPerformance } from "@/services/hooks/useAgents";
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
  const { data: agent, loading: agentLoading } = useAgent(id as string);
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
      title: "Current Score",
      metric: (agent.averageScore * 100).toFixed(1) + '%',
      description: "Average performance score",
      icon: LuChartNoAxesCombined,
      className:
        "relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-yellow-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-yellow-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-yellow-100/80",
    },
    {
      title: "Best Score",
      metric: (agent.bestScore * 100).toFixed(1) + '%',
      description: "Peak performance achieved",
      icon: LuTrophy,
      className:
        "relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-blue-600/25 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-blue-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-blue-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-blue-100/80",
    },
    {
      title: "Success Rate",
      metric: agent.successRate.toFixed(1) + '%',
      description: "Successful run percentage",
      icon: LuStar,
      className:
        "relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/25 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-emerald-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-emerald-100/80",
    },
    {
      title: "Total Runs",
      metric: agent.totalRuns.toLocaleString(),
      description: "All-time executions",
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
          {agentStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={cn(
                  "p-4 rounded-lg min-w-[200px] cursor-pointer shadow-sm",
                  stat.className
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg",
                      stat.iconClassName
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="mb-2">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {stat.title}
                  </Text>
                  <Text
                    className={cn(
                      "font-bold text-2xl leading-none",
                      stat.metricClassName
                    )}
                  >
                    {stat.metric}
                  </Text>
                </div>
                
                <Text className={cn("text-xs font-medium", stat.descriptionClassName)}>
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
