"use client";

import Link from "next/link";
import MetricCard from "@core/components/cards/metric-card";
import cn from "@core/utils/class-names";
import { LuShield, LuPickaxe, LuGlobe, LuTrophy } from "react-icons/lu";
import { primaryColors } from "@/data/colors-data";

const metricsData = [
  {
    id: "score-to-win",
    title: "Score to Win",
    value: 0.95,
    icon: LuTrophy,
    color: primaryColors.yellow,
    bgColor: "bg-yellow-500/20",
  },
  {
    id: "total-validators",
    title: "Total Validators",
    value: 6,
    icon: LuShield,
    color: primaryColors.blue,
    bgColor: "bg-blue-500/20",
  },
  {
    id: "total-miners",
    title: "Total Miners",
    value: 24,
    icon: LuPickaxe,
    color: primaryColors.green,
    bgColor: "bg-emerald-500/20",
  },
  {
    id: "total-websites",
    title: "Total Websites",
    value: 11,
    icon: LuGlobe,
    color: primaryColors.pink,
    bgColor: "bg-primary-pink/20",
  },
];

export default function OverviewMetrics({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full grid grid-cols-1 sm:grid-cols-2 gap-6", className)}
    >
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const metricCard = (
          <MetricCard
            title={metric.title}
            metric={metric.value}
            icon={<Icon className="w-7 h-7" style={{ color: metric.color }} />}
            iconClassName={cn("bg-transparent w-11 h-11", metric.bgColor)}
            className={cn(
              "flex h-full items-center cursor-pointer bg-opacity-50 p-5 lg:p-5",
              metric.id === "score-to-win" &&
                "border-yellow-500 dark:bg-yellow-500/5 hover:dark:bg-yellow-500/10",
              metric.id === "total-websites" &&
                "hover:border-primary-pink"
            )}
          />
        );
        return metric.id === "total-websites" ? (
          <Link key={metric.title} href="/websites">
            {metricCard}
          </Link>
        ) : (
          <div key={metric.title} className="bg-gray-50">
            {metricCard}
          </div>
        );
      })}
    </div>
  );
}
