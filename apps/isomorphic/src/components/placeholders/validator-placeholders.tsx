/**
 * Loading placeholders for validator components
 * Provides skeleton loading states for all validator-related components
 */

import cn from "@core/utils/class-names";

const PLACEHOLDER_SURFACE =
  "bg-[#111111] border border-[#1f1f1f] backdrop-blur-sm";
const PLACEHOLDER_PANEL =
  "bg-[#111111] border border-[#1f1f1f] backdrop-blur-sm";
const SKELETON_BASE = "bg-white/15 animate-pulse";
const SKELETON_SUBTLE = "bg-white/8 animate-pulse";

// ===== VALIDATORS SELECTOR PLACEHOLDER =====
export function ValidatorsSelectorPlaceholder() {
  return (
    <div className="mt-10 mb-6">
      <div className="flex items-center gap-4 mb-5">
        <div className={cn("w-10 h-10 rounded-xl", SKELETON_BASE)}></div>
        <div>
          <div className={cn("h-6 w-48 rounded mb-2", SKELETON_BASE)}></div>
          <div className={cn("h-4 w-64 rounded", SKELETON_BASE)}></div>
        </div>
      </div>
      <div className="relative flex w-auto items-center overflow-hidden">
        <div className="w-full overflow-hidden">
          <div className="grid grid-flow-col gap-8 overflow-x-auto scroll-smooth px-4 py-6">
            {(["validator-placeholder-1", "validator-placeholder-2", "validator-placeholder-3", "validator-placeholder-4"] as const).map((key) => (
              <div
                key={key}
                className={cn(
                  "relative w-full min-w-[200px] px-5 py-5 rounded-2xl",
                  PLACEHOLDER_PANEL
                )}
              >
                <div className="relative flex flex-col items-center text-white">
                  <div className={cn("w-16 h-16 rounded-full mb-4", SKELETON_BASE)}></div>
                  <div className={cn("h-5 w-24 rounded mb-2", SKELETON_BASE)}></div>
                  <div className={cn("h-6 w-32 rounded", SKELETON_BASE)}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== VALIDATOR CARDS PLACEHOLDER =====
export function ValidatorCardsPlaceholder() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {(["validator-card-placeholder-1", "validator-card-placeholder-2", "validator-card-placeholder-3"] as const).map((key) => (
        <div
          key={key}
          className={cn(
            "rounded-2xl border border-white/15 p-6 shadow-xl backdrop-blur-sm",
            PLACEHOLDER_PANEL
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("h-12 w-12 rounded-xl", SKELETON_BASE)}></div>
            <div>
              <div className={cn("h-4 w-32 rounded mb-2", SKELETON_BASE)}></div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className={cn("h-3 w-16 rounded mb-1", SKELETON_SUBTLE)}></div>
              <div className={cn("h-8 w-24 rounded", SKELETON_BASE)}></div>
            </div>
            <div>
              <div className={cn("h-3 w-20 rounded mb-1", SKELETON_SUBTLE)}></div>
              <div className={cn("h-5 w-40 rounded", SKELETON_BASE)}></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className={cn("h-3 w-16 rounded mb-1", SKELETON_SUBTLE)}></div>
                <div className={cn("h-6 w-20 rounded", SKELETON_BASE)}></div>
              </div>
              <div className="flex-1">
                <div className={cn("h-3 w-20 rounded mb-1", SKELETON_SUBTLE)}></div>
                <div className={cn("h-6 w-16 rounded", SKELETON_BASE)}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== PERFORMANCE ANALYTICS PLACEHOLDER =====
export function PerformanceAnalyticsPlaceholder() {
  return (
    <div className={cn("rounded-3xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl", PLACEHOLDER_PANEL)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className={cn("h-7 w-48 rounded mb-2", SKELETON_BASE)}></div>
          <div className={cn("h-4 w-64 rounded", SKELETON_SUBTLE)}></div>
        </div>
        <div className="flex gap-3">
          <div className={cn("h-10 w-32 rounded", SKELETON_BASE)}></div>
          <div className={cn("h-10 w-40 rounded", SKELETON_BASE)}></div>
        </div>
      </div>

      <div className="space-y-6">
        {(["validator-list-item-placeholder-1", "validator-list-item-placeholder-2", "validator-list-item-placeholder-3", "validator-list-item-placeholder-4", "validator-list-item-placeholder-5"] as const).map((key) => (
          <div
            key={key}
            className={cn(
              "rounded-xl border p-5",
              PLACEHOLDER_SURFACE
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", SKELETON_BASE)}></div>
                <div className={cn("h-5 w-32 rounded", SKELETON_BASE)}></div>
                <div className={cn("h-6 w-24 rounded-full", SKELETON_BASE)}></div>
              </div>
              <div className="text-right">
                <div className={cn("h-7 w-16 rounded mb-1", SKELETON_BASE)}></div>
                <div className={cn("h-4 w-40 rounded", SKELETON_SUBTLE)}></div>
              </div>
            </div>
            <div className="relative">
              <div className={cn("h-4 w-full rounded-full", SKELETON_SUBTLE)}></div>
              <div className="flex justify-between mt-2">
                <div className={cn("h-3 w-8 rounded", SKELETON_SUBTLE)}></div>
                <div className={cn("h-3 w-8 rounded", SKELETON_SUBTLE)}></div>
                <div className={cn("h-3 w-8 rounded", SKELETON_SUBTLE)}></div>
                <div className={cn("h-3 w-8 rounded", SKELETON_SUBTLE)}></div>
                <div className={cn("h-3 w-8 rounded", SKELETON_SUBTLE)}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SUMMARY PLACEHOLDER =====
export function SummaryPlaceholder() {
  return (
    <div className={cn("rounded-3xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl", PLACEHOLDER_PANEL)}>
      <div className={cn("h-7 w-32 rounded mb-6", SKELETON_BASE)}></div>

      <div className="flex flex-col items-center mb-6">
        <div className={cn("w-48 h-48 rounded-full mb-4", SKELETON_BASE)}></div>
        <div className={cn("h-5 w-24 rounded mb-2", SKELETON_BASE)}></div>
        <div className={cn("h-4 w-32 rounded", SKELETON_SUBTLE)}></div>
      </div>

      <div className="space-y-3">
        {(["validator-compact-item-placeholder-1", "validator-compact-item-placeholder-2", "validator-compact-item-placeholder-3", "validator-compact-item-placeholder-4"] as const).map((key) => (
          <div
            key={key}
            className={cn(
              "rounded-lg p-3 border",
              PLACEHOLDER_SURFACE
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded-full", SKELETON_BASE)}></div>
                <div className={cn("h-4 w-24 rounded", SKELETON_BASE)}></div>
              </div>
              <div className="text-right">
                <div className={cn("h-5 w-16 rounded mb-1", SKELETON_BASE)}></div>
                <div className={cn("h-3 w-32 rounded", SKELETON_SUBTLE)}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
