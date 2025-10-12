"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasksList } from "@/services/hooks/useTask";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiInfoDuotone,
  PiGlobeDuotone,
  PiCodeDuotone,
} from "react-icons/pi";

function formatWebsiteLabel(website: string) {
  return website
    ? website
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
    : website;
}

export default function TaskSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [agentRunInput, setAgentRunInput] = useState<string>("");
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [isWebsiteDropdownOpen, setIsWebsiteDropdownOpen] = useState(false);
  const [isUseCaseDropdownOpen, setIsUseCaseDropdownOpen] = useState(false);

  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const useCaseDropdownRef = useRef<HTMLDivElement>(null);

  // Use the API hook to get tasks data
  const { tasks, isLoading, error, refetch } = useTasksList({
    website: selectedWebsite || undefined,
    useCase: selectedUseCase || undefined,
    agentRunId: agentRunInput || undefined,
    limit: 50, // Get more tasks for filtering
  });

  // Get unique use cases from API data
  const uniqueUseCases = useMemo(() => {
    const useCases = Array.from(new Set(tasks.map(task => task.useCase)));
    return useCases.sort();
  }, [tasks]);

  // Get unique websites from API data
  const uniqueWebsites = useMemo(() => {
    const websites = Array.from(
      new Set(
        tasks
          .map((task) => task.website)
          .filter((website): website is string => Boolean(website))
      )
    );
    return websites.sort();
  }, [tasks]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        websiteDropdownRef.current &&
        !websiteDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWebsiteDropdownOpen(false);
      }
      if (
        useCaseDropdownRef.current &&
        !useCaseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUseCaseDropdownOpen(false);
      }
    };

    if (isWebsiteDropdownOpen || isUseCaseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWebsiteDropdownOpen, isUseCaseDropdownOpen]);

  // Filter tasks based on search criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.taskId.includes(searchTerm) ||
        task.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAgentRun =
        agentRunInput === "" || 
        task.agentRunId.includes(agentRunInput);
      
      const matchesWebsite =
        selectedWebsite === "" || task.website === selectedWebsite;
      
      const matchesUseCase =
        selectedUseCase === "" || task.useCase === selectedUseCase;

      return matchesSearch && matchesAgentRun && matchesWebsite && matchesUseCase;
    });
  }, [tasks, searchTerm, agentRunInput, selectedWebsite, selectedUseCase]);

  const handleSearch = () => {
    const results = filteredTasks.slice(0, 12); // Get recent 12 items

    if (results.length === 1) {
      router.push(`/tasks/${results[0].taskId}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAgentRunInput("");
    setSelectedWebsite("");
    setSelectedUseCase("");
    setIsWebsiteDropdownOpen(false);
    setIsUseCaseDropdownOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || agentRunInput !== "" || selectedWebsite !== "" || selectedUseCase !== "";

  return (
    <div className="w-full max-w-[1024px] mx-auto h-full py-8">
      {/* Main Search Card */}
      <div className="group relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 backdrop-blur-md z-50">
        {/* Glass-morphism Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative p-6 overflow-visible">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiMagnifyingGlassDuotone className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                TASK SEARCH
              </h2>
            </div>
            <p className="text-cyan-300 text-sm">
              Search by Task ID or filter by Agent Run, Website, and Use Case
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Task ID or Prompt (e.g., 3413)"
                className="w-full px-4 py-3 bg-cyan-500/20 border-2 border-cyan-500/20 rounded-xl text-cyan-300 placeholder-gray-400 focus:border-cyan-500 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <PiHashDuotone className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 overflow-visible z-100">
            <div className="flex items-center gap-2 mb-4">
              <PiFunnelDuotone className="w-5 h-5 text-purple-300" />
              <h3 className="text-sm font-medium text-purple-300">FILTERS</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
              {/* Agent Run Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-300">
                  AGENT RUN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentRunInput}
                    onChange={(e) => setAgentRunInput(e.target.value)}
                    placeholder="Enter Agent Run UID"
                    className="w-full px-3 py-2 bg-emerald-500/20 border-2 border-emerald-500/20 rounded-xl text-emerald-300 text-sm placeholder-gray-400 focus:border-emerald-500 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <PiRobotDuotone className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Website Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">
                  WEBSITE
                </label>
                <div className="relative" ref={websiteDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen);
                    }}
                    className="w-full px-3 py-2 bg-blue-500/20 border-2 border-blue-500/20 rounded-xl text-blue-300 focus:border-blue-500 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <span>
                      {selectedWebsite === ""
                        ? "All Websites"
                        : formatWebsiteLabel(selectedWebsite)}
                    </span>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${isWebsiteDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isWebsiteDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-blue-500/20 rounded-xl max-h-60 overflow-y-auto custom-scrollbar scroll-smooth backdrop-blur-md z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWebsite("");
                          setIsWebsiteDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20"
                      >
                        All Websites
                      </button>
                      {uniqueWebsites.map((website) => (
                        <button
                          key={website}
                          type="button"
                          onClick={() => {
                            setSelectedWebsite(website);
                            setIsWebsiteDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20 last:border-b-0"
                        >
                          {formatWebsiteLabel(website)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Use Case Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">
                  USE CASE
                </label>
                <div className="relative" ref={useCaseDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUseCaseDropdownOpen(!isUseCaseDropdownOpen);
                    }}
                    className="w-full px-3 py-2 bg-purple-500/20 border-2 border-purple-500/20 rounded-xl text-purple-300 focus:border-purple-500 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <span>
                      {selectedUseCase === ""
                        ? "All Use Cases"
                        : selectedUseCase.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${isUseCaseDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isUseCaseDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-purple-500/20 rounded-xl max-h-60 overflow-y-auto custom-scrollbar scroll-smooth backdrop-blur-md z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUseCase("");
                          setIsUseCaseDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-200 transition-colors duration-200 border-b border-purple-500/20"
                      >
                        All Use Cases
                      </button>
                      {uniqueUseCases.map((useCase) => (
                        <button
                          key={useCase}
                          type="button"
                          onClick={() => {
                            setSelectedUseCase(useCase);
                            setIsUseCaseDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-200 transition-colors duration-200 border-b border-purple-500/20 last:border-b-0"
                        >
                          {useCase.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center z-50">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/60 to-purple-500/60 border-2 border-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-md group hover:from-cyan-500 hover:to-purple-500 hover:border-cyan-500"
            >
              <PiMagnifyingGlassDuotone className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              SEARCH
            </button>

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 backdrop-blur-md ${
                hasActiveFilters
                  ? "bg-gradient-to-r from-red-500/60 to-orange-500/60 border-2 border-red-500/60 text-white hover:from-red-500 hover:to-orange-500 hover:border-red-500 cursor-pointer"
                  : "bg-gray-500/30 border-2 border-gray-500/30 text-gray-400 cursor-not-allowed"
              }`}
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>
      </div>

      {/* No Filters Message */}
      {!hasSearched && (
        <div className="mt-6 text-center relative z-0">
          <div className="relative bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 border-2 border-blue-500/40 hover:border-blue-400/60 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg mx-auto mb-4">
                <PiInfoDuotone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                READY TO SEARCH
              </h3>
              <p className="text-blue-200 text-sm">
                Enter a Task ID or use filters to find tasks
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6 text-center relative z-0">
          <div className="relative bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 border-2 border-blue-500/40 rounded-2xl p-6 shadow-lg backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                LOADING TASKS
              </h3>
              <p className="text-blue-200 text-sm">
                Fetching tasks from the API...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && filteredTasks.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {filteredTasks.length} TASKS FOUND
            </h3>
            <p className="text-purple-200 text-sm">
              Showing tasks matching your criteria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.slice(0, 12).map((task) => {
              return (
                <div
                  key={task.taskId}
                  onClick={() => router.push(`/tasks/${task.taskId}`)}
                  className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-300 shadow-lg group backdrop-blur-md cursor-pointer hover:shadow-2xl hover:scale-105"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg mb-3 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
                      <PiPlayDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-sm font-bold text-white mb-2">
                      TASK ID: {task.taskId}
                    </div>
                    <div className="text-xs text-purple-200 mb-2">
                      {task.prompt.length > 50 ? `${task.prompt.substring(0, 50)}...` : task.prompt}
                    </div>
                    <div className="text-xs text-purple-300">
                      {task.website} • {task.useCase.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span className="text-green-300">Score: {(task.score * 100).toFixed(0)}%</span>
                      <span className="text-blue-300">{task.duration}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!isLoading && filteredTasks.length === 0 && (
        <div className="mt-6 text-center relative z-0">
          <div className="relative bg-gradient-to-br from-red-500/5 via-orange-500/5 to-red-600/5 border-2 border-red-500/40 hover:border-red-400/60 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg mx-auto mb-4">
                <PiMagnifyingGlassDuotone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
                NO RESULTS FOUND
              </h3>
              <p className="text-red-200 text-sm">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
