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
        "relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/25 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-emerald-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-emerald-100/80",
    },
    {
      title: "Last Round Best Score",
      metric: sortedMinersData[0]?.score.toFixed(2),
      description: "Network-wide best this round",
      icon: LuCrown,
      className:
        "relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-yellow-500/25 hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-yellow-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-yellow-100/80",
    },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5 2xl:gap-6">
        {minerStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title}>
              <div
                className={cn(
                  "relative p-6 rounded-2xl min-w-[260px] cursor-pointer",
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
