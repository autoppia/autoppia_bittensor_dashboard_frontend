"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  PiArrowRight,
  PiCamera,
  PiCheckCircle,
  PiClock,
  PiCursorClick,
  PiKeyboard,
  PiPlay,
  PiScroll,
  PiWarning,
  PiXCircle,
  PiCaretLeft,
  PiCaretRight,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import {
  useTaskResults,
  useTaskActions,
  useTaskScreenshots,
} from "@/services/hooks/useTask";
import type { TaskAction } from "@/services/api/types/tasks";
import { useMemo } from "react";

const ACTION_TYPE_META: Record<
  TaskAction["type"],
  { label: string; icon: IconType; color: string }
> = {
  navigate: { label: "Navigate", icon: PiArrowRight, color: "cyan" },
  click: { label: "Click", icon: PiCursorClick, color: "purple" },
  type: { label: "Type", icon: PiKeyboard, color: "emerald" },
  input: { label: "Input", icon: PiKeyboard, color: "emerald" },
  search: { label: "Search", icon: PiArrowRight, color: "sky" },
  extract: { label: "Extract", icon: PiArrowRight, color: "indigo" },
  submit: { label: "Submit", icon: PiArrowRight, color: "fuchsia" },
  open_tab: { label: "Open Tab", icon: PiArrowRight, color: "blue" },
  close_tab: { label: "Close Tab", icon: PiXCircle, color: "rose" },
  wait: { label: "Wait", icon: PiClock, color: "amber" },
  scroll: { label: "Scroll", icon: PiScroll, color: "blue" },
  screenshot: { label: "Screenshot", icon: PiCamera, color: "pink" },
  other: { label: "Other", icon: PiPlay, color: "slate" },
};

const truncate = (value: string, max = 80) =>
  value.length > max ? `${value.slice(0, max).trim()}…` : value;

const getColorClasses = (color: string) => ({
  bg: `bg-${color}-500/10`,
  text: `text-${color}-400`,
  border: `border-${color}-500/30`,
});

export default function TaskResults() {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedAction, setSelectedAction] = useState<TaskAction | null>(null);

  const {
    results,
    isLoading: resultsLoading,
    error: resultsError,
  } = useTaskResults(id as string);

  const {
    actions,
    total: actionsTotal,
    isLoading: actionsLoading,
    error: actionsError,
    goToPage,
  } = useTaskActions(id as string, {
    page: currentPage,
    limit: pageSize,
    sortBy: "timestamp",
    sortOrder: "asc",
  });

  const {
    screenshots,
    isLoading: screenshotsLoading,
    error: screenshotsError,
  } = useTaskScreenshots(id as string);

  const hasApiScreenshots = screenshots.length > 0;

  const fallbackScreenshots = useMemo(() => {
    if (hasApiScreenshots || !results?.screenshots?.length) return [];
    return results.screenshots.map((url, index) => {
      const timelineTimestamp = results.timeline?.[index]?.timestamp;
      const actionTimestamp = results.actions?.[index]?.timestamp;
      const fallbackTimestamp =
        timelineTimestamp ??
        actionTimestamp ??
        results.timeline?.[0]?.timestamp ??
        results.actions?.[0]?.timestamp ??
        new Date().toISOString();
      const actionType = results.actions?.[index]?.type;

      return {
        id: `results-gif-${index}`,
        url,
        timestamp: fallbackTimestamp,
        actionId: results.actions?.[index]?.id,
        description: actionType
          ? `GIF Replay • ${actionType}`
          : `GIF Replay ${index + 1}`,
      };
    });
  }, [hasApiScreenshots, results]);

  const mediaItems = hasApiScreenshots ? screenshots : fallbackScreenshots;
  const isMediaLoading =
    screenshotsLoading || (!hasApiScreenshots && resultsLoading);
  const showMediaError =
    !isMediaLoading && !!screenshotsError && !mediaItems.length;
  const showMediaEmpty =
    !isMediaLoading && !showMediaError && mediaItems.length === 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const totalPages = Math.ceil(actionsTotal / pageSize);
  const successCount = actions.filter((a) => a.success).length;
  const failCount = actions.filter((a) => a.error || !a.success).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Actions Timeline
            </h2>
            <p className="text-sm text-slate-400">
              {actionsTotal} total actions · {successCount} successful ·{" "}
              {failCount} failed
            </p>
          </div>
          {!actionsLoading && totalPages > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <PiCaretLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <PiCaretRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {actionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={`action-loading-${index}`}
                  className="animate-pulse bg-slate-700/30 rounded-xl p-4 h-24"
                />
              ))}
            </div>
          ) : actionsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
              <PiXCircle className="w-12 h-12 mb-3" />
              <p className="text-lg font-semibold">Failed to load actions</p>
              <p className="text-sm text-red-300 mt-1">{actionsError}</p>
            </div>
          ) : actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <PiPlay className="w-12 h-12 mb-3" />
              <p className="text-lg font-semibold">No actions recorded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {actions.map((action, index) => {
                const meta =
                  ACTION_TYPE_META[
                    action.type as keyof typeof ACTION_TYPE_META
                  ] ?? ACTION_TYPE_META.other;
                const ActionIcon = meta.icon;
                const isSelected = selectedAction?.id === action.id;

                return (
                  <button
                    key={`action-item-${action.id || index}`}
                    onClick={() =>
                      setSelectedAction(isSelected ? null : action)
                    }
                    className={`group relative bg-slate-900/50 hover:bg-slate-900/70 rounded-xl p-4 border transition-all text-left ${
                      isSelected
                        ? "border-blue-500/50 ring-2 ring-blue-500/20"
                        : "border-slate-700/50 hover:border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-${meta.color}-500/10 text-${meta.color}-400`}
                      >
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-semibold text-${meta.color}-400`}
                          >
                            {meta.label}
                          </span>
                          {action.success ? (
                            <PiCheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : action.error ? (
                            <PiXCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <PiWarning className="w-4 h-4 text-amber-400" />
                          )}
                          {action.duration && (
                            <span className="ml-auto text-xs text-slate-500 font-mono">
                              {action.duration}s
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {action.selector &&
                            `Selector: ${truncate(action.selector, 60)}`}
                          {action.value &&
                            ` • Value: ${truncate(action.value, 40)}`}
                          {!action.selector &&
                            !action.value &&
                            "No details available"}
                        </p>
                        {action.error && (
                          <p className="text-xs text-red-400 mt-1 line-clamp-1">
                            Error: {truncate(action.error, 60)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Screen Recordings
            </h2>
            <p className="text-sm text-slate-400">
              {mediaItems.length} GIF replay{mediaItems.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto pr-2">
          {isMediaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`screenshot-loading-${index}`}
                  className="animate-pulse bg-slate-700/30 rounded-xl h-48"
                />
              ))}
            </div>
          ) : showMediaError ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
              <PiXCircle className="w-12 h-12 mb-3" />
              <p className="text-lg font-semibold">Failed to load recordings</p>
              <p className="text-sm text-red-300 mt-1">
                {screenshotsError || resultsError}
              </p>
            </div>
          ) : showMediaEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <PiCamera className="w-12 h-12 mb-3" />
              <p className="text-lg font-semibold">No recordings available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaItems.map((screenshot, index) => (
                <div
                  key={`gif-${screenshot.id || index}`}
                  className="group bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  <div className="relative aspect-video bg-black/60">
                    <img
                      src={screenshot.url || "/placeholder.svg"}
                      alt={`GIF Replay ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const errorDiv =
                          target.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-slate-500">
                      <PiCamera className="w-12 h-12 mb-2" />
                      <p className="text-sm">Recording unavailable</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white mb-1">
                      {screenshot.description || `GIF Replay ${index + 1}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {screenshot.timestamp
                        ? new Date(screenshot.timestamp).toLocaleString()
                        : "No timestamp"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
