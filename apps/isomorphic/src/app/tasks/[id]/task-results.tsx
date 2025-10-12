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
  PiPause,
  PiStop,
} from "react-icons/pi";
import { useTaskResults, useTaskActions, useTaskScreenshots } from "@/services/hooks/useTask";
import Placeholder, { TextPlaceholder, ListItemPlaceholder } from "@/app/shared/placeholder";
import { TaskAction } from "@/services/api/types/tasks";
import { useState } from "react";

// Action type icons mapping
const getActionIcon = (type: string) => {
  switch (type) {
    case 'navigate':
      return <PiArrowRight className="w-4 h-4" />;
    case 'wait':
      return <PiClock className="w-4 h-4" />;
    case 'type':
      return <PiKeyboard className="w-4 h-4" />;
    case 'click':
      return <PiCursorClick className="w-4 h-4" />;
    case 'scroll':
      return <PiScroll className="w-4 h-4" />;
    case 'screenshot':
      return <PiCamera className="w-4 h-4" />;
    default:
      return <PiPlay className="w-4 h-4" />;
  }
};

// Action status icons
const getStatusIcon = (success: boolean, error?: string) => {
  if (error) return <PiXCircle className="w-4 h-4 text-red-500" />;
  if (success) return <PiCheckCircle className="w-4 h-4 text-green-500" />;
  return <PiWarning className="w-4 h-4 text-yellow-500" />;
};

// Format action content for display
const formatActionContent = (action: TaskAction) => {
  const { type, selector, value, duration, success, error } = action;
  
  let content = `${type.charAt(0).toUpperCase() + type.slice(1)}Action`;
  
  if (selector) {
    content += `(selector='${selector.length > 30 ? selector.substring(0, 30) + '...' : selector}'`;
  }
  
  if (value) {
    content += selector ? `, value='${value.length > 20 ? value.substring(0, 20) + '...' : value}'` : `(value='${value.length > 20 ? value.substring(0, 20) + '...' : value}'`;
  }
  
  if (duration) {
    content += `${selector || value ? ', ' : '('}duration=${duration}s`;
  }
  
  content += ')';
  
  if (error) {
    content += ` - Error: ${error}`;
  }
  
  return content;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const totalPages = Math.ceil(actionsTotal / pageSize);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Actions */}
      <div className="border border-muted rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-white text-lg font-medium">Actions</Text>
          {!actionsLoading && actionsTotal > 0 && (
            <Text className="text-gray-500 text-sm">
              {actionsTotal} total actions
            </Text>
          )}
        </div>
        
        <div className="space-y-2 border border-muted rounded-lg h-[350px] p-4 overflow-y-auto custom-scrollbar scroll-auto">
          {actionsLoading ? (
            // Loading state
            Array.from({ length: 5 }, (_, index) => (
              <ListItemPlaceholder key={`action-loading-${index}`} />
            ))
          ) : actionsError ? (
            // Error state
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <PiXCircle className="w-8 h-8 mx-auto mb-2" />
                <Text className="text-sm">Failed to load actions</Text>
              </div>
            </div>
          ) : actions.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <PiPlay className="w-8 h-8 mx-auto mb-2" />
                <Text className="text-sm">No actions found</Text>
              </div>
            </div>
          ) : (
            // Actions list
            actions.map((action, index) => (
              <div
                key={`action-item-${action.id || index}`}
                className="w-full flex items-center bg-gray-100 rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getActionIcon(action.type)}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Text className="font-medium text-sm truncate">
                      {formatActionContent(action)}
                    </Text>
                    {getStatusIcon(action.success, action.error)}
                  </div>
                </div>
                {action.duration && (
                  <Text className="text-xs text-gray-500 ml-2">
                    {action.duration}s
                  </Text>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!actionsLoading && actionsTotal > pageSize && (
          <div className="flex items-center justify-between mt-4">
            <Text className="text-gray-500 text-sm">
              Page {currentPage} of {totalPages}
            </Text>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Screenshots */}
      <div className="border border-muted rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-white text-lg font-medium">
            Screenshots
          </Text>
          {!screenshotsLoading && screenshots.length > 0 && (
            <Text className="text-gray-500 text-sm">
              {screenshots.length} screenshots
            </Text>
          )}
        </div>
        
        <div className="h-[350px] border border-muted rounded-lg overflow-y-auto custom-scrollbar">
          {screenshotsLoading ? (
            // Loading state
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`screenshot-loading-${index}`} className="space-y-2">
                  <Placeholder height="120px" className="rounded-lg" />
                  <TextPlaceholder lines={2} />
                </div>
              ))}
            </div>
          ) : screenshotsError ? (
            // Error state
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <PiXCircle className="w-8 h-8 mx-auto mb-2" />
                <Text className="text-sm">Failed to load screenshots</Text>
              </div>
            </div>
          ) : screenshots.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <PiCamera className="w-8 h-8 mx-auto mb-2" />
                <Text className="text-sm">No screenshots available</Text>
              </div>
            </div>
          ) : (
            // Screenshots grid
            <div className="p-4 space-y-4">
              {screenshots.map((screenshot, index) => (
                <div key={`screenshot-${screenshot.id || index}`} className="space-y-2">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={screenshot.url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PiCamera className="w-8 h-8 mx-auto mb-2" />
                        <Text className="text-sm">Image unavailable</Text>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">{screenshot.description || `Screenshot ${index + 1}`}</div>
                    <div className="text-gray-500">
                      {new Date(screenshot.timestamp).toLocaleString()}
                    </div>
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
