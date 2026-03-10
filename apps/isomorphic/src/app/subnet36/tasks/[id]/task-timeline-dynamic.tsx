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
  PiCheckCircle,
  PiXCircle,
  PiPlay,
  PiArrowClockwise,
} from "react-icons/pi";
import { useTaskTimeline } from "@/services/hooks/useTask";
import Placeholder, { TextPlaceholder } from "@/app/shared/placeholder";

// Action type icons mapping
const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('navigate')) return <PiArrowRight className="w-4 h-4" />;
  if (actionLower.includes('wait')) return <PiClock className="w-4 h-4" />;
  if (actionLower.includes('type')) return <PiKeyboard className="w-4 h-4" />;
  if (actionLower.includes('click')) return <PiCursorClick className="w-4 h-4" />;
  if (actionLower.includes('scroll')) return <PiScroll className="w-4 h-4" />;
  if (actionLower.includes('screenshot')) return <PiCamera className="w-4 h-4" />;
  return <PiPlay className="w-4 h-4" />;
};

// Status icons
const getStatusIcon = (success: boolean) => {
  if (success) return <PiCheckCircle className="w-4 h-4 text-green-500" />;
  return <PiXCircle className="w-4 h-4 text-red-500" />;
};

// Format duration
const formatDuration = (duration: number) => {
  if (duration < 1) {
    return `${(duration * 1000).toFixed(0)}ms`;
  }
  return `${duration.toFixed(1)}s`;
};

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

// Get relative time from start
const getRelativeTime = (timestamp: string, startTime: string) => {
  const start = new Date(startTime).getTime();
  const current = new Date(timestamp).getTime();
  const diff = (current - start) / 1000;
  return formatDuration(diff);
};

export default function TaskTimelineDynamic() {
  const { id } = useParams();
  const { timeline, isLoading, error } = useTaskTimeline(id as string);

  if (isLoading) {
    return (
      <div className="border border-muted rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-white text-lg font-medium">Task Timeline</Text>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`timeline-loading-${index}`} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Placeholder variant="circular" width={32} height={32} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Placeholder height="1rem" width="40%" />
                  <Placeholder height="1rem" width="20%" />
                </div>
                <TextPlaceholder lines={1} />
                <div className="flex items-center gap-2">
                  <Placeholder height="0.75rem" width="15%" />
                  <Placeholder height="0.75rem" width="10%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiXCircle className="w-5 h-5 text-red-500" />
            <Text className="text-red-700 font-medium">Failed to load timeline</Text>
          </div>
          <button
            onClick={() => globalThis.window.location.reload()}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Retry loading timeline"
          >
            <PiArrowClockwise className="w-4 h-4" />
          </button>
        </div>
        <Text className="text-red-600 text-sm mt-2">
          {error || 'Unable to fetch timeline data for this task'}
        </Text>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="border border-muted rounded-lg p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <PiPlay className="w-8 h-8 mx-auto mb-2" />
          <Text className="text-sm">No timeline data available</Text>
        </div>
      </div>
    );
  }

  const startTime = timeline[0]?.timestamp;
  const lastEvent = timeline.at(-1);
  const totalDuration = timeline.length > 0 && lastEvent
    ? (new Date(lastEvent.timestamp).getTime() - new Date(startTime).getTime()) / 1000
    : 0;

  return (
    <div className="border border-muted rounded-lg p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Text className="text-white text-lg font-medium">Task Timeline</Text>
        <div className="flex items-center gap-2">
          <Text className="text-gray-500 text-sm">
            {timeline.length} events
          </Text>
          <button
            onClick={() => globalThis.window.location.reload()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh timeline"
          >
            <PiArrowClockwise className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-4">
          {timeline.map((event) => {
            const relativeTime = getRelativeTime(event.timestamp, startTime);
            const eventKey = `timeline-event-${event.timestamp}-${event.action}-${event.duration}`;

            return (
              <div key={eventKey} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  event.success 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-red-100 border-red-500'
                }`}>
                  {getActionIcon(event.action)}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    {/* Event header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Text className="font-medium text-gray-900">
                          {event.action}
                        </Text>
                        {getStatusIcon(event.success)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span>•</span>
                        <span>+{relativeTime}</span>
                      </div>
                    </div>
                    
                    {/* Event details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <PiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Duration: {formatDuration(event.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.success 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {event.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metadata if available */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Text className="text-xs font-medium text-gray-600 mb-2">
                            Details:
                          </Text>
                          <div className="bg-gray-50 rounded p-2">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <Text className="text-2xl font-bold text-blue-600">
              {formatDuration(totalDuration)}
            </Text>
            <Text className="text-sm text-gray-600">Total Duration</Text>
          </div>
          <div>
            <Text className="text-2xl font-bold text-green-600">
              {timeline.filter(e => e.success).length}
            </Text>
            <Text className="text-sm text-gray-600">Successful Events</Text>
          </div>
          <div>
            <Text className="text-2xl font-bold text-red-600">
              {timeline.filter(e => !e.success).length}
            </Text>
            <Text className="text-sm text-gray-600">Failed Events</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
