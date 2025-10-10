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
    bgColor:
      "bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-amber-400 to-orange-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName:
      "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent",
    descriptionClassName: "text-amber-200",
  },
  {
    id: "total-websites",
    title: "Websites",
    value: 11,
    icon: LuGlobe,
    color: primaryColors.pink,
    bgColor:
      "bg-gradient-to-br from-pink-500/15 via-rose-500/15 to-pink-600/15 border-2 border-pink-500/40 hover:border-pink-400/60 hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-pink-400 to-rose-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-pink-400",
    descriptionClassName: "text-pink-200",
  },
  {
    id: "total-validators",
    title: "Validators",
    value: 6,
    icon: LuShield,
    color: primaryColors.blue,
    bgColor:
      "bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-blue-600/15 border-2 border-blue-500/40 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-blue-400 to-indigo-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-blue-400",
    descriptionClassName: "text-blue-200",
  },
  {
    id: "total-miners",
    title: "Miners",
    value: 24,
    icon: LuPickaxe,
    color: primaryColors.green,
    bgColor:
      "bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-emerald-600/15 border-2 border-emerald-500/40 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md",
    iconClassName:
      "bg-gradient-to-br from-emerald-400 to-green-500 text-white group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300",
    metricClassName: "text-2xl font-bold text-emerald-400",
    descriptionClassName: "text-emerald-200",
  },
];

export default function OverviewMetrics({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full grid grid-cols-1 sm:grid-cols-2 gap-4", className)}
    >
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const metricCard = (
          <div className={cn("rounded-2xl p-5", metric.bgColor)}>
            <div className="flex space-x-4 mb-3">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg flex-shrink-0",
                  metric.iconClassName
                )}
              >
                 <Icon
                   className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                 />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide mb-1",
                    metric.descriptionClassName
                  )}
                >
                  {metric.title}
                </h3>
                <div className={cn("", metric.metricClassName)}>
                  {metric.value}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className={cn("text-xs", metric.descriptionClassName)}>
                {metric.id === "score-to-win" && "Current target score"}
                {metric.id === "total-validators" && "Active validators"}
                {metric.id === "total-miners" && "Registered miners"}
                {metric.id === "total-websites" && "Available websites"}
              </div>
            </div>
          </div>
        );
        return metric.id === "total-websites" ? (
          <Link key={metric.title} href="/websites" className="block">
            {metricCard}
          </Link>
        ) : (
          <div key={metric.title} className="block">
            {metricCard}
          </div>
        );
      })}
    </div>
  );
}
