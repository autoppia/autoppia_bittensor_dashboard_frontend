"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import {
  PiArrowRight,
  PiClock,
  PiKeyboard,
  PiCursorClick,
  PiScroll,
  PiCamera,
  PiWarning,
  PiCheckCircle,
  PiXCircle,
  PiPlay,
} from "react-icons/pi";
import { useTaskResults, useTaskActions, useTaskScreenshots } from "@/services/hooks/useTask";
import Placeholder, { TextPlaceholder, ListItemPlaceholder } from "@/app/shared/placeholder";
import { TaskAction } from "@/services/api/types/tasks";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";

const ACTION_TYPE_META: Record<
  TaskAction["type"],
  { label: string; icon: IconType; badgeBg: string; badgeText: string }
> = {
  navigate: {
    label: "Navigate",
    icon: PiArrowRight,
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
  },
  click: {
    label: "Click",
    icon: PiCursorClick,
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
  },
  type: {
    label: "Type",
    icon: PiKeyboard,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  },
  input: {
    label: "Input",
    icon: PiKeyboard,
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  },
  search: {
    label: "Search",
    icon: PiArrowRight,
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-300",
  },
  extract: {
    label: "Extract",
    icon: PiArrowRight,
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-300",
  },
  submit: {
    label: "Submit",
    icon: PiArrowRight,
    badgeBg: "bg-fuchsia-500/15",
    badgeText: "text-fuchsia-300",
  },
  open_tab: {
    label: "Open Tab",
    icon: PiArrowRight,
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
  },
  close_tab: {
    label: "Close Tab",
    icon: PiXCircle,
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
  },
  wait: {
    label: "Wait",
    icon: PiClock,
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
  },
  scroll: {
    label: "Scroll",
    icon: PiScroll,
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
  },
  screenshot: {
    label: "Screenshot",
    icon: PiCamera,
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-300",
  },
  other: {
    label: "Other",
    icon: PiPlay,
    badgeBg: "bg-slate-500/15",
    badgeText: "text-slate-200",
  },
};

const truncate = (value: string, max = 64) =>
  value.length > max ? `${value.slice(0, max).trim()}…` : value;

// Action status icons
const getStatusIcon = (success: boolean, error?: string) => {
  if (error) return <PiXCircle className="w-4 h-4 text-red-500" />;
  if (success) return <PiCheckCircle className="w-4 h-4 text-green-500" />;
  return <PiWarning className="w-4 h-4 text-yellow-500" />;
};

// Format action detail copy for display
const formatActionDetails = (action: TaskAction) => {
  const details: string[] = [];

  if (action.selector) {
    details.push(`Selector: ${truncate(action.selector, 80)}`);
  }

  if (action.value) {
    details.push(`Value: ${truncate(action.value, 80)}`);
  }

  if (action.error) {
    details.push(`Error: ${truncate(action.error, 80)}`);
  }

  if (details.length === 0) {
    return "No additional details";
  }

  return details.join(" • ");
};

export default function TaskResults() {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Fetch task results data
  const { results, isLoading: resultsLoading, error: resultsError } = useTaskResults(id as string);
  
  // Fetch task actions with pagination
  const { 
    actions, 
    total: actionsTotal, 
    isLoading: actionsLoading, 
    error: actionsError,
    goToPage 
  } = useTaskActions(id as string, {
    page: currentPage,
    limit: pageSize,
    sortBy: 'timestamp',
    sortOrder: 'asc'
  });
  
  // Fetch task screenshots
  const { screenshots, isLoading: screenshotsLoading, error: screenshotsError } = useTaskScreenshots(id as string);

  const hasApiScreenshots = screenshots.length > 0;

  const fallbackScreenshots = useMemo(() => {
    if (hasApiScreenshots || !results?.screenshots?.length) {
      return [];
    }

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
  const isUsingFallbackMedia = !hasApiScreenshots && mediaItems.length > 0;

  const gifCount = mediaItems.length;

  const isMediaLoading =
    screenshotsLoading || (!hasApiScreenshots && resultsLoading);
  const showMediaError =
    !isMediaLoading && !!screenshotsError && !isUsingFallbackMedia && mediaItems.length === 0;
  const showMediaEmpty =
    !isMediaLoading && !showMediaError && mediaItems.length === 0;

  const formatTimestampLabel = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleString();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const totalPages = Math.ceil(actionsTotal / pageSize);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Side - Actions */}
      <section className="rounded-2xl border border-slate-700/25 bg-slate-900/45 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-white text-lg font-semibold">Actions</Text>
          {!actionsLoading && actionsTotal > 0 && (
            <Text className="text-slate-400 text-sm">
              {actionsTotal} total actions
            </Text>
          )}
        </div>
        
        <div className="space-y-2 rounded-xl border border-slate-700/25 h-[350px] p-4 overflow-y-auto custom-scrollbar scroll-auto bg-slate-900/60">
          {actionsLoading ? (
            // Loading state
            Array.from({ length: 5 }, (_, index) => (
              <ListItemPlaceholder key={`action-loading-${index}`} />
            ))
          ) : actionsError ? (
            // Error state
            <div className="flex items-center justify-center h-full text-red-300">
              <div className="text-center space-y-1">
                <PiXCircle className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-red-200">Failed to load actions</Text>
              </div>
            </div>
          ) : actions.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center space-y-1">
                <PiPlay className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-slate-300">No actions found</Text>
              </div>
            </div>
          ) : (
            // Actions list
            actions.map((action, index) => {
              const meta = ACTION_TYPE_META[action.type] ?? ACTION_TYPE_META.other;
              const ActionIcon = meta.icon;
              return (
                <div
                  key={`action-item-${action.id || index}`}
                  className="w-full flex items-start justify-between gap-3 rounded-lg px-3 py-3 text-slate-100 bg-slate-800/70 border border-slate-700/40 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${meta.badgeBg} ${meta.badgeText}`}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        {meta.label}
                        {getStatusIcon(action.success, action.error)}
                      </span>
                      <Text className="text-xs text-slate-300 leading-relaxed break-words">
                        {formatActionDetails(action)}
                      </Text>
                    </div>
                  </div>
                  {action.duration && (
                    <Text className="text-xs text-slate-400 whitespace-nowrap">
                      {action.duration}s
                    </Text>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination */}
        {!actionsLoading && actionsTotal > pageSize && (
          <div className="flex items-center justify-between mt-4">
            <Text className="text-slate-400 text-sm">
              Page {currentPage} of {totalPages}
            </Text>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded border border-sky-500/40 bg-slate-900/60 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-sky-400/60 hover:text-sky-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded border border-sky-500/40 bg-slate-900/60 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-sky-400/60 hover:text-sky-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Right Side - Screenshots */}
      <section className="rounded-2xl border border-slate-700/25 bg-slate-900/45 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <Text className="text-white text-lg font-semibold">
              GIF Replays
            </Text>
            {!isMediaLoading && isUsingFallbackMedia && (
              <span className="text-xs text-slate-400">
                Loaded from task results payload
              </span>
            )}
          </div>
          {!isMediaLoading && gifCount > 0 && (
            <Text className="text-slate-400 text-sm">
              {gifCount} GIF{gifCount === 1 ? "" : "s"}
            </Text>
          )}
        </div>
        
        <div className="h-[350px] border border-slate-700/25 rounded-xl overflow-y-auto custom-scrollbar bg-slate-900/60">
          {isMediaLoading ? (
            // Loading state
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`screenshot-loading-${index}`} className="space-y-2">
                  <Placeholder height="120px" className="rounded-lg" />
                  <TextPlaceholder lines={2} />
                </div>
              ))}
            </div>
          ) : showMediaError ? (
            // Error state
            <div className="flex items-center justify-center h-full text-red-300">
              <div className="text-center space-y-1">
                <PiXCircle className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-red-200">
                  {screenshotsError || resultsError || "Failed to load GIF replays"}
                </Text>
              </div>
            </div>
          ) : showMediaEmpty ? (
            // Empty state
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center space-y-1">
                <PiCamera className="w-8 h-8 mx-auto" />
                <Text className="text-sm text-slate-300">No GIF replays available</Text>
              </div>
            </div>
          ) : (
            // Screenshots grid
            <div className="p-4 space-y-4">
              {mediaItems.map((screenshot, index) => {
                const timestampLabel = formatTimestampLabel(screenshot.timestamp);
                return (
                  <div key={`gif-${screenshot.id || index}`} className="space-y-2">
                    <div className="relative bg-black/60 rounded-lg overflow-hidden border border-slate-700/40">
                      <img
                        src={screenshot.url}
                        alt={`GIF Replay ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-900/80">
                        <div className="text-center space-y-1">
                          <PiCamera className="w-8 h-8 mx-auto" />
                          <Text className="text-sm text-slate-300">GIF unavailable</Text>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-300">
                      <div className="font-medium text-slate-200">
                        {screenshot.description || `GIF Replay ${index + 1}`}
                      </div>
                      <div className="text-slate-400">
                        {timestampLabel ?? "Timestamp unavailable"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
