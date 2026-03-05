/**
 * Loading placeholders for agent components
 * Provides skeleton loading states for all agent-related components
 */

import cn from "@core/utils/class-names";

const BAR_SKELETON_HEIGHTS = [
  52,
  28,
  38,
  31,
  42,
  48,
  35,
  62,
  30,
  57,
];

const PLACEHOLDER_SURFACE =
  "bg-[#111111] border border-[#1f1f1f] backdrop-blur-sm";
const PLACEHOLDER_PANEL =
  "bg-[#111111] border border-[#1f1f1f] backdrop-blur-sm";
const PLACEHOLDER_SECTION =
  "bg-[#111111] border border-[#1f1f1f] backdrop-blur-sm";
const SKELETON_BASE = "bg-white/15";
const SKELETON_SUBTLE = "bg-white/8";

// ===== AGENT STATS PLACEHOLDER =====
export function AgentStatsPlaceholder() {
  const stats = [
    { title: "Current Rank" },
    { title: "Best Rank Ever" },
    { title: "Current Score" },
    { title: "Rounds Participated" },
    { title: "Alpha Won in Prizes" },
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
                PLACEHOLDER_SURFACE
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-14 h-14 rounded-2xl animate-pulse", SKELETON_BASE)}></div>
                  <div className="text-right">
                    <div className={cn("w-2 h-2 rounded-full mb-1 animate-pulse", SKELETON_SUBTLE)}></div>
                    <div className={cn("w-1 h-1 rounded-full animate-pulse", SKELETON_SUBTLE)}></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className={cn("h-3 w-24 rounded mb-2 animate-pulse", SKELETON_BASE)}></div>
                  <div className={cn("h-10 w-16 rounded animate-pulse", SKELETON_BASE)}></div>
                </div>
                
                <div className={cn("h-4 w-32 rounded animate-pulse", SKELETON_BASE)}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CHART_CTRL_KEYS = ["chart-ctrl-1", "chart-ctrl-2", "chart-ctrl-3"] as const;
const BAR_KEYS = ["bar-1", "bar-2", "bar-3", "bar-4", "bar-5", "bar-6", "bar-7", "bar-8", "bar-9", "bar-10"] as const;

// ===== AGENT SCORE CHART PLACEHOLDER =====
export function AgentScoreChartPlaceholder(props: Readonly<{ className?: string }>) {
  const { className } = props;
  return (
    <div className={cn(PLACEHOLDER_PANEL, "rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className={cn("h-6 w-32 rounded animate-pulse", SKELETON_BASE)}></div>
        <div className="flex gap-2">
          {CHART_CTRL_KEYS.map((key) => (
            <div key={key} className={cn("h-8 w-12 rounded animate-pulse", SKELETON_BASE)}></div>
          ))}
        </div>
      </div>
      
      <div className={cn("h-[273px] w-full rounded-lg animate-pulse p-4", PLACEHOLDER_SECTION)}>
        <div className="flex items-end justify-between h-full">
          {BAR_KEYS.map((key, i) => {
            const height = BAR_SKELETON_HEIGHTS[i % BAR_SKELETON_HEIGHTS.length];
            return (
              <div
                key={key}
                className={cn("rounded-t animate-pulse", SKELETON_BASE)}
                style={{
                  height: `${height}%`,
                  width: "8%",
                  animationDelay: `${i * 100}ms`,
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== AGENT SCORE ANALYTICS PLACEHOLDER =====
export function AgentScoreAnalyticsPlaceholder(props: Readonly<{ className?: string }>) {
  const { className } = props;
  const analytics = [
    {
      title: "Current Score",
    },
    {
      title: "Last Round Best Score",
    },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5 2xl:gap-6">
        {analytics.map((stat) => (
          <div key={stat.title}>
            <div
              className={cn(
                "relative p-6 rounded-2xl min-w-[260px] animate-pulse",
                PLACEHOLDER_SURFACE
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-14 h-14 rounded-2xl animate-pulse", SKELETON_BASE)}></div>
                  <div className="text-right">
                    <div className={cn("w-2 h-2 rounded-full mb-1 animate-pulse", SKELETON_SUBTLE)}></div>
                    <div className={cn("w-1 h-1 rounded-full animate-pulse", SKELETON_SUBTLE)}></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className={cn("h-3 w-24 rounded mb-2 animate-pulse", SKELETON_BASE)}></div>
                  <div className={cn("h-10 w-16 rounded animate-pulse", SKELETON_BASE)}></div>
                </div>
                
                <div className={cn("h-4 w-32 rounded animate-pulse", SKELETON_BASE)}></div>
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
          <div className={cn("h-8 w-48 rounded animate-pulse", SKELETON_BASE)}></div>
          <div className={cn("h-8 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
        </div>
        <div className={cn("h-10 w-44 rounded animate-pulse", SKELETON_BASE)}></div>
      </div>

      {/* Common Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(["metric-card-1", "metric-card-2", "metric-card-3", "metric-card-4"] as const).map((key) => (
          <div
            key={key}
            className={cn("p-4 rounded-xl animate-pulse", PLACEHOLDER_PANEL)}
          >
            <div className="flex items-center mb-2">
              <div className={cn("w-10 h-10 rounded-lg animate-pulse", SKELETON_BASE)}></div>
              <div className={cn("h-3 w-20 rounded ms-2 animate-pulse", SKELETON_BASE)}></div>
            </div>
            <div className={cn("h-8 w-12 rounded mb-1 animate-pulse", SKELETON_BASE)}></div>
            <div className={cn("h-3 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {(["validator-card-1", "validator-card-2", "validator-card-3", "validator-card-4", "validator-card-5", "validator-card-6"] as const).map((key) => (
          <div
            key={key}
            className={cn("relative overflow-hidden rounded-2xl animate-pulse", PLACEHOLDER_PANEL)}
          >
            {/* Header */}
            <div className={cn("p-5 border-b", PLACEHOLDER_SECTION)}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("w-12 h-12 rounded-full animate-pulse", SKELETON_BASE)}></div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("h-4 w-24 rounded mb-1 animate-pulse", SKELETON_BASE)}></div>
                    <div className={cn("h-3 w-32 rounded animate-pulse", SKELETON_BASE)}></div>
                  </div>
                </div>
                <div className={cn("h-6 w-16 rounded animate-pulse", SKELETON_BASE)}></div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Agent Performance */}
              <div className={cn("rounded-xl p-4", PLACEHOLDER_SECTION)}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={cn("w-7 h-7 rounded-xl animate-pulse", SKELETON_BASE)}></div>
                  <div className={cn("h-3 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className={cn("h-4 w-16 rounded animate-pulse", SKELETON_BASE)}></div>
                    <div className={cn("h-4 w-12 rounded animate-pulse", SKELETON_BASE)}></div>
                  </div>
                  <div className={cn("h-4 w-20 rounded animate-pulse", SKELETON_BASE)}></div>
                  <div className={cn("h-4 w-18 rounded animate-pulse", SKELETON_BASE)}></div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className={cn("flex items-center justify-around gap-3 rounded-lg p-3", PLACEHOLDER_SECTION)}>
                {(["secondary-stat-1", "secondary-stat-2", "secondary-stat-3"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-lg animate-pulse", SKELETON_BASE)}></div>
                    <div className="flex flex-col min-w-0">
                      <div className={cn("h-3 w-12 rounded mb-1 animate-pulse", SKELETON_BASE)}></div>
                      <div className={cn("h-4 w-8 rounded animate-pulse", SKELETON_BASE)}></div>
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
        <div className={cn("w-14 h-14 rounded-full animate-pulse", SKELETON_BASE)}></div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={cn("h-8 w-32 rounded animate-pulse", SKELETON_BASE)}></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded animate-pulse", SKELETON_BASE)}></div>
              <div className={cn("h-4 w-16 rounded animate-pulse", SKELETON_BASE)}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded animate-pulse", SKELETON_BASE)}></div>
              <div className={cn("h-4 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
              <div className={cn("w-6 h-6 rounded animate-pulse", SKELETON_BASE)}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-lg animate-pulse", SKELETON_BASE)}></div>
        <div className={cn("w-8 h-8 rounded-lg animate-pulse", SKELETON_BASE)}></div>
      </div>
    </div>
  );
}

// ===== AGENT SIDEBAR PLACEHOLDER =====
export function AgentSidebarPlaceholder() {
  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className={cn("h-full rounded-xl pb-4", PLACEHOLDER_PANEL)}>
        <div className={cn("sticky top-0 px-6 py-4 border-b", PLACEHOLDER_SECTION)}>
          <div className={cn("h-8 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
        </div>
        <div className="h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2 mt-3">
          <div className="flex flex-col gap-1">
            <div className="mb-2">
              <div className={cn("h-10 w-full rounded animate-pulse", SKELETON_BASE)}></div>
            </div>
            {(["sidebar-item-1", "sidebar-item-2", "sidebar-item-3", "sidebar-item-4", "sidebar-item-5", "sidebar-item-6", "sidebar-item-7", "sidebar-item-8", "sidebar-item-9", "sidebar-item-10"] as const).map((key) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 animate-pulse",
                  PLACEHOLDER_SECTION,
                  "hover:bg-white/5"
                )}
              >
                <div className={cn("w-10 h-10 rounded-full animate-pulse", SKELETON_BASE)}></div>
                <div className="flex-1 min-w-0">
                  <div className={cn("h-4 w-20 rounded mb-1 animate-pulse", SKELETON_BASE)}></div>
                  <div className={cn("h-3 w-24 rounded animate-pulse", SKELETON_BASE)}></div>
                </div>
                <div className={cn("w-6 h-6 rounded animate-pulse", SKELETON_BASE)}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
