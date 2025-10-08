"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { LuStar, LuCrown } from "react-icons/lu";
import { sortedMinersData } from "@/data/miners-data";

export default function AgentScoreAnalytics({
  className,
}: {
  className?: string;
}) {
  const { id } = useParams();
  const miner = sortedMinersData.find(
    (miner) => miner.uid === parseInt(id as string)
  );

  const minerStats = [
    {
      title: "Current Score",
      metric: miner?.score.toFixed(2),
      description: "Latest round performance",
      icon: LuStar,
      className:
        "bg-gradient-to-br from-emerald-500/15 via-emerald-400/15 to-emerald-600/15 border-2 border-emerald-500/40 hover:border-emerald-400/60 transition-all duration-300 shadow-lg group backdrop-blur-sm",
      metricClassName: "text-emerald-500",
      iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "text-emerald-200",
    },
    {
      title: "Round Best Score",
      metric: sortedMinersData[0]?.score.toFixed(2),
      description: "Network-wide best this round",
      icon: LuCrown,
      className:
        "bg-gradient-to-br from-yellow-500/15 via-yellow-400/15 to-yellow-600/15 border-2 border-yellow-500/40 hover:border-yellow-400/60 transition-all duration-300 shadow-lg group backdrop-blur-sm",
      metricClassName: "text-yellow-500",
      iconClassName: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 group-hover:scale-110 transition-all duration-300",
      descriptionClassName: "text-yellow-200",
    },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-1 gap-5 2xl:gap-6">
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
              <div className="flex items-center mb-3">
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
  );
}
