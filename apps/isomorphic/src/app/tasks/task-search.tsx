"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tasksService } from "@/services/api/tasks.service";
import type { TaskData } from "@/services/api/types/tasks";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiGlobeDuotone,
  PiCodeDuotone,
} from "react-icons/pi";

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function TaskSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [agentRunInput, setAgentRunInput] = useState<string>("");
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [isWebsiteDropdownOpen, setIsWebsiteDropdownOpen] = useState(false);
  const [isUseCaseDropdownOpen, setIsUseCaseDropdownOpen] = useState(false);
  const [availableWebsites, setAvailableWebsites] = useState<string[]>([]);
  const [availableUseCases, setAvailableUseCases] = useState<string[]>([]);
  const [results, setResults] = useState<TaskData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const useCaseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    const loadFacets = async () => {
      try {
        const response = await tasksService.searchTasks({ limit: 1 });
        if (ignore) return;
        const facets = response.data?.facets;
        if (facets) {
          setAvailableWebsites(
            facets.websites.map((item) => item.name).sort()
          );
          setAvailableUseCases(
            facets.useCases.map((item) => item.name).sort()
          );
        }
      } catch (error) {
        // ignore metadata errors – filters will populate after first search
      }
    };

    loadFacets();

    return () => {
      ignore = true;
    };
  }, []);

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

  const handleSearch = async () => {
    setHasSearched(true);
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await tasksService.searchTasks({
        query: searchTerm || undefined,
        agentRunId: agentRunInput || undefined,
        website: selectedWebsite || undefined,
        useCase: selectedUseCase || undefined,
        limit: 50,
      });

      const data = response.data;
      setResults(data?.tasks ?? []);

      if (data?.facets) {
        setAvailableWebsites(
          data.facets.websites.map((item) => item.name).sort()
        );
        setAvailableUseCases(
          data.facets.useCases.map((item) => item.name).sort()
        );
      }

      if (data?.tasks?.length === 1) {
        router.push(`/tasks/${data.tasks[0].taskId}`);
      }
    } catch (error) {
      setResults([]);
      setSearchError(
        error instanceof Error ? error.message : "Failed to search tasks"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAgentRunInput("");
    setSelectedWebsite("");
    setSelectedUseCase("");
    setIsWebsiteDropdownOpen(false);
    setIsUseCaseDropdownOpen(false);
    setHasSearched(false);
    setSearchError(null);
    setResults([]);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    agentRunInput !== "" ||
    selectedWebsite !== "" ||
    selectedUseCase !== "";

  const formattedWebsites = useMemo(
    () => availableWebsites.map((website) => ({
      value: website,
      label: formatLabel(website),
    })),
    [availableWebsites]
  );

  const formattedUseCases = useMemo(
    () => availableUseCases.map((useCase) => ({
      value: useCase,
      label: formatLabel(useCase),
    })),
    [availableUseCases]
  );

  return (
    <div className="w-full max-w-[1024px] mx-auto h-full py-8">
      <div className="group relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 backdrop-blur-md z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative p-6 overflow-visible">
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

          <div className="mb-6 overflow-visible z-100">
            <div className="flex items-center gap-2 mb-4">
              <PiFunnelDuotone className="w-5 h-5 text-purple-300" />
              <h3 className="text-sm font-medium text-purple-300">FILTERS</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">
                  WEBSITE
                </label>
                <div className="relative" ref={websiteDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)}
                    className="w-full px-3 py-2 bg-blue-500/20 border-2 border-blue-500/20 rounded-xl text-blue-300 focus:border-blue-500 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <span>
                      {selectedWebsite === ""
                        ? "All Websites"
                        : formatLabel(selectedWebsite)}
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
                      {formattedWebsites.map((website) => (
                        <button
                          key={website.value}
                          type="button"
                          onClick={() => {
                            setSelectedWebsite(website.value);
                            setIsWebsiteDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20 last:border-b-0"
                        >
                          {website.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">
                  USE CASE
                </label>
                <div className="relative" ref={useCaseDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUseCaseDropdownOpen(!isUseCaseDropdownOpen)}
                    className="w-full px-3 py-2 bg-purple-500/20 border-2 border-purple-500/20 rounded-xl text-purple-300 focus:border-purple-500 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <span>
                      {selectedUseCase === ""
                        ? "All Use Cases"
                        : formatLabel(selectedUseCase)}
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
                      {formattedUseCases.map((useCase) => (
                        <button
                          key={useCase.value}
                          type="button"
                          onClick={() => {
                            setSelectedUseCase(useCase.value);
                            setIsUseCaseDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-200 transition-colors duration-200 border-b border-purple-500/20 last:border-b-0"
                        >
                          {useCase.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
              disabled={!hasActiveFilters && !hasSearched}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 backdrop-blur-md ${
                hasActiveFilters || hasSearched
                  ? "bg-gradient-to-r from-red-500/60 to-orange-500/60 border-2 border-red-500/60 text-white hover:from-red-500 hover:to-orange-500 hover:border-red-500 cursor-pointer"
                  : "bg-gray-500/30 border-2 border-gray-500/30 text-gray-400 cursor-not-allowed"
              }`}
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>
      </div>

      {hasSearched && isSearching && (
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

      {hasSearched && !isSearching && searchError && (
        <div className="mt-6 relative z-0">
          <div className="relative bg-gradient-to-br from-red-500/5 via-orange-500/5 to-red-600/5 border-2 border-red-500/40 hover:border-red-400/60 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg mx-auto mb-4">
                <PiPlayDuotone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
                FAILED TO LOAD TASKS
              </h3>
              <p className="text-red-200 text-sm">{searchError}</p>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !isSearching && results.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {results.length} TASKS FOUND
            </h3>
            <p className="text-purple-200 text-sm">
              Showing tasks matching your criteria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((task) => (
              <div
                key={task.taskId}
                onClick={() => router.push(`/tasks/${task.taskId}`)}
                className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-300 shadow-lg group backdrop-blur-md cursor-pointer hover:shadow-2xl hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg shadow-lg group-hover:shadow-xl">
                      <PiPlayDuotone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Task #{task.taskId}</div>
                      <div className="text-xs text-purple-200">Run ID: {task.agentRunId}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/40 rounded-full text-xs text-purple-100 bg-purple-500/20">
                    <PiCodeDuotone className="w-3.5 h-3.5" />
                    {formatLabel(task.useCase)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/40 rounded-full text-xs text-blue-100 bg-blue-500/20">
                    <PiGlobeDuotone className="w-3.5 h-3.5" />
                    {formatLabel(task.website)}
                  </span>
                  <span className="text-lg font-bold text-emerald-300">
                    {Math.round((task.score ?? 0) * 100)}%
                  </span>
                </div>

                <p className="text-xs text-purple-100/80 leading-relaxed mb-4 line-clamp-3">
                  {task.prompt}
                </p>

                <div className="flex items-center justify-between text-[11px] text-purple-100/70">
                  <span>Duration: {task.duration}s</span>
                  <span>Actions: {task.actions ? task.actions.length : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && !searchError && (
        <div className="mt-6 text-center relative z-0">
          <div className="relative bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-purple-600/5 border-2 border-purple-500/40 hover:border-purple-400/60 rounded-2xl p-6 shadow-lg backdrop-blur-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-lg mx-auto mb-4">
                <PiPlayDuotone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
                NO TASKS FOUND
              </h3>
              <p className="text-purple-200 text-sm">
                Try adjusting your filters or search query.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
