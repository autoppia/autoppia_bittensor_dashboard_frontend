"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
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
        "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15",
      metricClassName: "text-emerald-500",
      iconClassName: "bg-emerald-500/30 text-emerald-500",
    },
    {
      title: "Round Best Score",
      metric: sortedMinersData[0]?.score.toFixed(2),
      description: "Network-wide best this round",
      icon: LuCrown,
      className:
        "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/15",
      metricClassName: "text-yellow-500",
      iconClassName: "bg-yellow-500/30 text-yellow-500",
    },
  ];

  return (
    <div className={cn("flex flex-col mt-6", className)}>
      <PageHeader title="Score Analytics" />
      <div className="grid grid-cols-1 gap-4">
        {minerStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={cn(
                "border p-5 rounded-lg",
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
                <Text className="text-lg ms-3 text-gray-700">{stat.title}</Text>
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
  );
}
