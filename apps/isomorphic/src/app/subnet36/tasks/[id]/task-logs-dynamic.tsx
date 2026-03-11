"use client";

import { useParams } from "next/navigation";
import { Text } from "rizzui";
import {
  PiInfo,
  PiWarning,
  PiXCircle,
  PiBug,
  PiFunnel,
  PiArrowClockwise,
  PiCaretDown,
  PiCaretUp,
} from "react-icons/pi";
import { useTaskLogs } from "@/services/hooks/useTask";
import Placeholder, { TextPlaceholder } from "@/app/shared/placeholder";
import { useState } from "react";

// Log level icons and colors
const getLogLevelIcon = (level: string) => {
  switch (level) {
    case 'info':
      return <PiInfo className="w-4 h-4 text-blue-500" />;
    case 'warn':
      return <PiWarning className="w-4 h-4 text-yellow-500" />;
    case 'error':
      return <PiXCircle className="w-4 h-4 text-red-500" />;
    case 'debug':
      return <PiBug className="w-4 h-4 text-gray-500" />;
    default:
      return <PiInfo className="w-4 h-4 text-gray-500" />;
  }
};

const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warn':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'debug':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export default function TaskLogsDynamic() {
  const { id } = useParams();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [limit, setLimit] = useState(50);

  // Fetch task logs
  const {
    logs,
    total: logsTotal,
    isLoading,
    error
  } = useTaskLogs(id as string, {
    level: selectedLevel === 'all' ? undefined : selectedLevel as any,
    limit
  });

  const logLevels = ['all', 'info', 'warn', 'error', 'debug'];

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs || [];

  return (
    <div className="border border-muted rounded-lg p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Text className="text-white text-lg font-medium">Task Logs</Text>
        <div className="flex items-center gap-2">
          {!isLoading && logsTotal > 0 && (
            <Text className="text-gray-500 text-sm">
              {logsTotal} total logs
            </Text>
          )}
          <button
            onClick={() => globalThis.window.location.reload()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Refresh logs"
          >
            <PiArrowClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <PiFunnel className="w-4 h-4 text-gray-500" />
        <Text className="text-gray-600 text-sm">Filter by level:</Text>
        <div className="flex gap-1">
          {logLevels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedLevel === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Text className="text-gray-600 text-sm">Limit:</Text>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Logs Container */}
      <div className="border border-muted rounded-lg h-[400px] overflow-y-auto custom-scrollbar">
        {(() => {
          if (isLoading) {
            return (
              <div className="p-4 space-y-3">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={`log-loading-${index}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Placeholder variant="circular" width={16} height={16} />
                      <Placeholder height="0.75rem" width="20%" />
                      <Placeholder height="0.75rem" width="15%" />
                    </div>
                    <TextPlaceholder lines={1} />
                  </div>
                ))}
              </div>
            );
          }
          if (error) {
            return (
              <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                  <PiXCircle className="w-8 h-8 mx-auto mb-2" />
                  <Text className="text-sm">Failed to load logs</Text>
                  <button
                    onClick={() => globalThis.window.location.reload()}
                    className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            );
          }
          if (filteredLogs.length === 0) {
            return (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PiInfo className="w-8 h-8 mx-auto mb-2" />
                  <Text className="text-sm">No logs found</Text>
                  {selectedLevel !== 'all' && (
                    <Text className="text-xs mt-1">
                      Try changing the filter or check back later
                    </Text>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div className="p-4 space-y-3">
              {filteredLogs.map((log, index) => {
                const isExpanded = expandedLogs.has(index);
                const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
                const logKey = `log-${log.timestamp}-${log.level}-${String(log.message).slice(0, 80)}`;

                return (
                  <div
                    key={logKey}
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    getLogLevelColor(log.level)
                  }`}
                >
                  {/* Log Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getLogLevelIcon(log.level)}
                      <Text className="text-xs font-medium uppercase">
                        {log.level}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </Text>
                    </div>
                    {hasMetadata && (
                      <button
                        onClick={() => toggleLogExpansion(index)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand metadata"}
                      >
                        {isExpanded ? (
                          <PiCaretUp className="w-4 h-4" />
                        ) : (
                          <PiCaretDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Log Message */}
                  <div className="mt-2">
                    <Text className="text-sm font-mono break-words">
                      {log.message}
                    </Text>
                  </div>

                  {/* Expanded Metadata */}
                  {isExpanded && hasMetadata && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Text className="text-xs font-medium text-gray-600 mb-2">
                        Metadata:
                      </Text>
                      <div className="bg-gray-100 rounded p-2">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          );
        })()}
      </div>

      {/* Footer Info */}
      {!isLoading && filteredLogs.length > 0 && (
        <div className="mt-4 text-center">
          <Text className="text-xs text-gray-500">
            Showing {filteredLogs.length} of {logsTotal} logs
            {selectedLevel !== 'all' && ` (filtered by ${selectedLevel})`}
          </Text>
        </div>
      )}
    </div>
  );
}
