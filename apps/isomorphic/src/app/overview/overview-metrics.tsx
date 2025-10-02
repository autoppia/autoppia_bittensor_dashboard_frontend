"use client";

import MetricCard from "@core/components/cards/metric-card";
import cn from "@core/utils/class-names";
import { LuShield, LuPickaxe, LuGlobe, LuTrophy } from "react-icons/lu";
import { primaryColors } from "@/data/colors-data";

const metricsData = [
  {
    title: "Total Validators",
    value: 6,
    icon: LuShield,
    color: primaryColors.blue,
    bgColor: "bg-primary-blue/10",
  },
  {
    title: "Total Miners",
    value: 24,
    icon: LuPickaxe,
    color: primaryColors.green,
    bgColor: "bg-primary-green/10",
  },
  {
    title: "Total Websites",
    value: 11,
    icon: LuGlobe,
    color: primaryColors.pink,
    bgColor: "bg-primary-pink/10",
  },
  {
    title: "Score to Win",
    value: 0.95,
    icon: LuTrophy,
    color: primaryColors.yellow,
    bgColor: "bg-primary-yellow/10",
  },
];

export default function OverviewMetrics({ className }: { className?: string }) {
  return (
    <div className={cn("w-full grid grid-cols-1 sm:grid-cols-2 gap-6", className)}>
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <MetricCard
            key={metric.title}
            title={metric.title}
            metric={metric.value}
            icon={
              <Icon
                className="w-7 h-7"
                style={{ color: metric.color }}
              />
            }
            iconClassName={cn("bg-transparent w-11 h-11", metric.bgColor)}
            className="flex items-center bg-opacity-50 p-5 lg:p-5"
          />
        );
      })}
    </div>
  );
}
