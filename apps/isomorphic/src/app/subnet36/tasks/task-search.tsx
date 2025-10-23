"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tasksService } from "@/services/api/tasks.service";
import type { TaskData } from "@/services/api/types/tasks";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
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
          setAvailableWebsites(facets.websites.map((item) => item.name).sort());
          setAvailableUseCases(facets.useCases.map((item) => item.name).sort());
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
    setResults([]);

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
        router.push(`${routes.tasks}/${data.tasks[0].taskId}`);
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
    () =>
      availableWebsites.map((website) => ({
        value: website,
        label: formatLabel(website),
      })),
    [availableWebsites]
  );

  const formattedUseCases = useMemo(
    () =>
      availableUseCases.map((useCase) => ({
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
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
                    onClick={() =>
                      setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)
                    }
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
                    onClick={() =>
                      setIsUseCaseDropdownOpen(!isUseCaseDropdownOpen)
                    }
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

          <div className="flex gap-4 flex-col sm:flex-row items-center justify-center z-50">
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
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <div className="h-7 w-48 mx-auto rounded-full bg-purple-500/20 animate-pulse" />
            <div className="h-4 w-64 mx-auto mt-3 rounded-full bg-purple-500/10 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`task-skeleton-${index}`}
                className="bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-sky-500/20 rounded-xl p-4 shadow-lg backdrop-blur-md animate-pulse"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/30" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded-full bg-purple-500/30" />
                      <div className="h-2.5 w-32 rounded-full bg-purple-500/20" />
                    </div>
                  </div>
                  <div className="h-6 w-28 rounded-full bg-purple-500/20" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="h-6 w-24 rounded-full bg-blue-500/20" />
                  <div className="h-5 w-12 rounded-full bg-emerald-500/30" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full rounded-full bg-purple-500/15" />
                  <div className="h-3 w-full rounded-full bg-purple-500/15" />
                  <div className="h-3 w-5/6 rounded-full bg-purple-500/15" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-purple-100/70">
                  <div className="h-2.5 w-20 rounded-full bg-purple-500/20" />
                  <div className="h-2.5 w-20 rounded-full bg-purple-500/20" />
                </div>
              </div>
            ))}
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
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {results.length} {results.length === 1 ? "TASK" : "TASKS"} FOUND
            </h3>
            <p className="text-purple-200/80 text-sm">
              Showing tasks matching your criteria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((task) => {
              const useCaseLabel = formatLabel(task.useCase);
              const scorePercent = Math.round((task.score ?? 0) * 100);
              const isPassed = scorePercent === 100;

              // Extract URL from navigate action if available
              const navigateAction = task.actions?.find(
                (action) => action.type === "navigate"
              );
              const taskUrl =
                navigateAction?.value ||
                navigateAction?.metadata?.url ||
                task.website;

              // Extract port from URL to determine web project
              const getWebProject = (url: string) => {
                const portMatch = url.match(/:(\d+)/);
                if (portMatch) {
                  const port = portMatch[1];
                  const website = websitesData.find(
                    (w) => w.portValidator === port
                  );
                  return website
                    ? {
                        name: website.name,
                        color: website.color,
                        slug: website.slug,
                      }
                    : null;
                }
                return null;
              };

              const webProject = getWebProject(taskUrl);

              return (
                <div
                  key={task.taskId}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (webProject) {
                      params.set('websiteName', webProject.name);
                      params.set('websiteColor', webProject.color);
                    }
                    router.push(`${routes.tasks}/${task.taskId}?${params.toString()}`);
                  }}
                  className={`group relative rounded-xl border ${
                    isPassed
                      ? "border-emerald-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 hover:border-emerald-400/50 hover:shadow-emerald-500/20"
                      : "border-red-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 hover:border-red-400/50 hover:shadow-red-500/20"
                  } p-6 shadow-lg transition-all duration-300 backdrop-blur-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl flex flex-col`}
                >
                  {/* Main Content - Grows to fill space */}
                  <div className="flex-grow">
                    {/* Web Project */}
                    {webProject && (
                      <div className="mb-3">
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-bold"
                          style={{
                            backgroundColor: `${webProject.color}`,
                            color: "#FFFFFF",
                          }}
                        >
                          <PiGlobeDuotone className="w-5 h-5" />
                          {webProject.name}
                        </div>
                      </div>
                    )}

                    {/* Use Case */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-500 mb-1">
                        Use Case
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {useCaseLabel}
                      </div>
                    </div>

                    {/* Task ID */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-cyan-400 mb-1">
                        Task ID
                      </div>
                      <div className="text-sm font-mono text-cyan-200 truncate">
                        {task.taskId}
                      </div>
                    </div>

                    {/* Agent Run ID */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-violet-400 mb-1">
                        Agent Run
                      </div>
                      <div className="text-sm font-mono text-violet-200 truncate">
                        {task.agentRunId}
                      </div>
                    </div>

                    {/* URL */}
                    {taskUrl && (
                      <div className="mb-4">
                        <div className="text-xs font-medium text-slate-400 mb-1">
                          URL
                        </div>
                        <div className="p-2 rounded bg-slate-950/50 border border-slate-700/50">
                          <p className="text-xs text-cyan-300 truncate font-mono">
                            {taskUrl}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Prompt */}
                    <div className="mb-4">
                      <div className="text-xs font-medium text-slate-400 mb-1">
                        Prompt
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
                        {task.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats - Always at bottom */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">
                          Duration
                        </div>
                        <div className="text-sm font-bold text-amber-300">
                          {task.duration}s
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">
                          Actions
                        </div>
                        <div className="text-sm font-bold text-indigo-300">
                          {task.actions ? task.actions.length : 0}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                          isPassed
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {isPassed ? "SUCCESS" : "FAILED"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
