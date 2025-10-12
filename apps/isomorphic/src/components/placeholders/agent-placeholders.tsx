/**
 * Loading placeholders for agent components
 * Provides skeleton loading states for all agent-related components
 */

import { Text } from "rizzui";
import cn from "@core/utils/class-names";

// ===== AGENT STATS PLACEHOLDER =====
export function AgentStatsPlaceholder() {
  const stats = [
    {
      title: "Current Rank",
      className: "bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30",
    },
    {
      title: "Best Rank Ever", 
      className: "bg-gradient-to-br from-gray-400/20 via-gray-300/15 to-gray-500/25 border border-gray-400/30",
    },
    {
      title: "Current Score",
      className: "bg-gradient-to-br from-green-500/20 via-green-400/15 to-green-600/25 border border-green-500/30",
    },
    {
      title: "Rounds Participated",
      className: "bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-blue-600/25 border border-blue-500/30",
    },
    {
      title: "Alpha Won in Prizes",
      className: "bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-purple-600/25 border border-purple-500/30",
    },
  ];

  return (
    <div className="relative flex w-auto items-center overflow-hidden">
      <div className="w-full overflow-hidden">
        <div className="grid grid-flow-col gap-5 overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className={cn(
                "relative p-6 rounded-2xl min-w-[280px] animate-pulse",
                stat.className
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-300/50 animate-pulse"></div>
                  <div className="text-right">
                    <div className="w-2 h-2 rounded-full bg-gray-300/50 mb-1 animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-300/50 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="h-3 w-24 bg-gray-300/50 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 w-16 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
                
                <div className="h-4 w-32 bg-gray-300/50 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== AGENT SCORE CHART PLACEHOLDER =====
export function AgentScoreChartPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-gray-300/50 rounded animate-pulse"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-12 bg-gray-300/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      <div className="h-[273px] w-full bg-gray-100/50 rounded-lg animate-pulse">
        <div className="flex items-end justify-between h-full p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-300/50 rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                width: '8%',
                animationDelay: `${i * 100}ms`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== AGENT SCORE ANALYTICS PLACEHOLDER =====
export function AgentScoreAnalyticsPlaceholder({ className }: { className?: string }) {
  const analytics = [
    {
      title: "Current Score",
      className: "bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/25 border border-emerald-500/30",
    },
    {
      title: "Last Round Best Score",
      className: "bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/25 border border-yellow-500/30",
    },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5 2xl:gap-6">
        {analytics.map((stat, index) => (
          <div key={stat.title}>
            <div
              className={cn(
                "relative p-6 rounded-2xl min-w-[260px] animate-pulse",
                stat.className
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-300/50 animate-pulse"></div>
                  <div className="text-right">
                    <div className="w-2 h-2 rounded-full bg-gray-300/50 mb-1 animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-300/50 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="h-3 w-24 bg-gray-300/50 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 w-16 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
                
                <div className="h-4 w-32 bg-gray-300/50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== AGENT VALIDATORS PLACEHOLDER =====
export function AgentValidatorsPlaceholder() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 bg-gray-300/50 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-300/50 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-44 bg-gray-300/50 rounded animate-pulse"></div>
      </div>

      {/* Common Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-gray-100/50 border border-gray-200 animate-pulse"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-300/50 animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-300/50 rounded ms-2 animate-pulse"></div>
            </div>
            <div className="h-8 w-12 bg-gray-300/50 rounded mb-1 animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-300/50 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-gray-50/80 border border-gray-200/50 rounded-2xl animate-pulse"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200/60 bg-gray-100/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gray-300/50 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-24 bg-gray-300/50 rounded mb-1 animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-300/50 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Agent Performance */}
              <div className="bg-gray-100/50 border border-gray-200/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-gray-300/50 animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-300/50 rounded animate-pulse"></div>
                  <div className="h-4 w-18 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="flex items-center justify-around gap-3 bg-gray-100/50 border border-gray-200 rounded-lg p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-300/50 animate-pulse"></div>
                    <div className="flex flex-col min-w-0">
                      <div className="h-3 w-12 bg-gray-300/50 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 w-8 bg-gray-300/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ===== AGENT HEADER PLACEHOLDER =====
export function AgentHeaderPlaceholder() {
  return (
    <div className="flex items-center justify-between mt-2 mb-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-full bg-gray-300/50 animate-pulse"></div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-32 bg-gray-300/50 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-300/50 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-300/50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-300/50 animate-pulse"></div>
        <div className="w-8 h-8 rounded-lg bg-gray-300/50 animate-pulse"></div>
      </div>
    </div>
  );
}

// ===== AGENT SIDEBAR PLACEHOLDER =====
export function AgentSidebarPlaceholder() {
  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className="h-full border rounded-xl bg-gray-50 pb-4">
        <div className="sticky top-0 px-6 py-4 border-b">
          <div className="h-8 w-24 bg-gray-300/50 rounded animate-pulse"></div>
        </div>
        <div className="h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2 mt-3">
          <div className="flex flex-col gap-1">
            <div className="mb-2">
              <div className="h-10 w-full bg-gray-300/50 rounded animate-pulse"></div>
            </div>
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100/50 transition-colors duration-200 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300/50 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-20 bg-gray-300/50 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
                <div className="w-6 h-6 bg-gray-300/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
