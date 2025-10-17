"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { LuStar, LuCrown } from "react-icons/lu";
import { useMinerDetails, useAgentStatistics } from "@/services/hooks/useAgents";
import { AgentScoreAnalyticsPlaceholder } from "@/components/placeholders/agent-placeholders";

export default function AgentScoreAnalytics({
  className,
}: {
  className?: string;
}) {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const { data: agentData, loading: agentLoading } = useMinerDetails(uid);
  const agent = agentData?.agent;
  const { data: statistics, loading: statsLoading } = useAgentStatistics();

  const loading = agentLoading || statsLoading;

  // Show loading placeholder
  if (loading) {
    return <AgentScoreAnalyticsPlaceholder className={className} />;
  }

  if (!agent) {
    return null;
  }

  const agentStats = [
    {
      title: "Current Score",
      metric: `${((agent?.currentScore ?? 0) * 100).toFixed(1)}%`,
      description: "Miner Score in last round",
      icon: LuStar,
      className:
        "relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/25 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-emerald-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-emerald-100/80",
    },
    {
      title: "Current Top Score",
      metric: `${((agent?.currentTopScore ?? 0) * 100).toFixed(1)}%`,
      description: "Top Score in last round",
      icon: LuCrown,
      className:
        "relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 shadow-2xl group backdrop-blur-xl hover:shadow-3xl hover:shadow-yellow-500/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      metricClassName: "text-yellow-500 drop-shadow-sm",
      iconClassName: "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-xl",
      descriptionClassName: "text-yellow-100/80",
    },
  ];

  return (
    <div className={cn("flex flex-col min-h-[180px]", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5 2xl:gap-6 h-full">
        {agentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="h-full">
              <div
                className={cn(
                  "relative p-4 rounded-xl min-w-[200px] cursor-pointer h-full flex flex-col",
                  stat.className
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
                  <div className="mb-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-xl shadow-lg mx-auto",
                        stat.iconClassName
                      )}
                    >
                      <Icon className="w-7 h-7 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
                    <Text className="text-xs font-semibold text-gray-600/90 uppercase tracking-wider mb-2">
                      {stat.title}
                    </Text>
                    <Text
                      className={cn(
                        "font-black text-3xl leading-none mb-3",
                        stat.metricClassName
                      )}
                    >
                      {stat.metric}
                    </Text>
                    
                    <Text className={cn("text-xs font-medium leading-relaxed text-center", stat.descriptionClassName)}>
                      {stat.description}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
