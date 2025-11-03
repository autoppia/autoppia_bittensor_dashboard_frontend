"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { tasksService } from "@/services/api/tasks.service";
import type { TaskData, TaskRelationships } from "@/services/api/types/tasks";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { resolveAssetUrl } from "@/services/utils/assets";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiGlobeDuotone,
  PiCodeDuotone,
  PiCopySimpleDuotone,
} from "react-icons/pi";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [25, 50, 100, 200];

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function truncateMiddle(value?: string, visible: number = 8) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function extractRoundNumber(value?: string | null): number | null {
  if (!value) return null;
  const match = value.match(/round[-_\s]?(\d+)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group/copy flex h-7 w-7 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 transition-all duration-200 hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-300 hover:scale-110 active:scale-95"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 text-emerald-400 animate-in zoom-in duration-200"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/copy:scale-110"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

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
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [relationshipsMap, setRelationshipsMap] = useState<
    Record<string, TaskRelationships>
  >({});

  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const useCaseDropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 400);
  const debouncedFilters = useDebouncedValue(
    useMemo(
      () => ({
        agentRun: agentRunInput.trim(),
        website: selectedWebsite.trim(),
        useCase: selectedUseCase.trim(),
      }),
      [agentRunInput, selectedWebsite, selectedUseCase]
    ),
    400
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(total / currentLimit));

  const startIndex =
    results.length === 0 ? 0 : (currentPage - 1) * currentLimit + 1;

  const endIndex = results.length === 0 ? 0 : startIndex + results.length - 1;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const limitOptions = useMemo(() => {
    const options = new Set<number>(LIMIT_OPTIONS);
    options.add(currentLimit);
    return Array.from(options).sort((a, b) => a - b);
  }, [currentLimit]);

  const headerCount = total || results.length;

  // Auto-search when filters or search term changes
  useEffect(() => {
    let ignore = false;

    const performSearch = async () => {
      // If there's a Task ID search term, handle it separately
      if (debouncedSearchTerm !== "") {
        setHasSearched(true);
        setIsSearching(true);
        setSearchError(null);

        try {
          const task = await tasksService.getTask(debouncedSearchTerm);
          if (ignore) return;
          setResults([task]);
          setTotal(1);

          // Fetch facets for filter options
          const facetsResponse = await tasksService.searchTasks({ limit: 1 });
          const facets = facetsResponse.data?.facets;
          if (facets && !ignore) {
            setAvailableWebsites(
              facets.websites.map((item) => item.name).sort()
            );
            setAvailableUseCases(
              facets.useCases.map((item) => item.name).sort()
            );
          }
        } catch (err: any) {
          if (!ignore) {
            setResults([]);
            setTotal(0);
            const errorMessage = err?.message || String(err);
            if (
              errorMessage.includes("404") ||
              errorMessage.includes("Not Found")
            ) {
              setSearchError(
                `Task '${debouncedSearchTerm}' not found. The task ID might not exist or the format is incorrect. Try using filters instead.`
              );
            } else {
              setSearchError(errorMessage);
            }
          }
        } finally {
          if (!ignore) {
            setIsSearching(false);
          }
        }
        return;
      }

      // When search term is empty, use filter-based search or load all
      const hasFilters =
        debouncedFilters.agentRun ||
        debouncedFilters.website ||
        debouncedFilters.useCase;

      // Always load tasks (either filtered or all)
      setHasSearched(true);
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await tasksService.searchTasks({
          agentRunId: debouncedFilters.agentRun || undefined,
          website: debouncedFilters.website || undefined,
          useCase: debouncedFilters.useCase || undefined,
          page: currentPage,
          limit: currentLimit,
        });

        if (ignore) return;

        const data = response.data;
        setResults(data?.tasks ?? []);
        setTotal(data?.total ?? 0);

        if (data?.facets) {
          setAvailableWebsites(
            data.facets.websites.map((item) => item.name).sort()
          );
          setAvailableUseCases(
            data.facets.useCases.map((item) => item.name).sort()
          );
        }
      } catch (error) {
        if (!ignore) {
          setResults([]);
          setTotal(0);
          setSearchError(
            error instanceof Error ? error.message : "Failed to search tasks"
          );
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    return () => {
      ignore = true;
    };
  }, [debouncedSearchTerm, debouncedFilters, currentPage, currentLimit]);

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

  useEffect(() => {
    let cancelled = false;

    const missingTasks = results.filter(
      (task) => !task.relationships && !relationshipsMap[task.taskId]
    );

    if (missingTasks.length === 0) {
      return;
    }

    const fetchRelationships = async () => {
      const settled = await Promise.allSettled(
        missingTasks.map((task) =>
          tasksService.getTask(task.taskId).then((data) => ({
            taskId: task.taskId,
            relationships: data.relationships,
          }))
        )
      );

      if (cancelled) return;

      const updates: Record<string, TaskRelationships> = {};

      settled.forEach((result) => {
        if (result.status === "fulfilled" && result.value.relationships) {
          updates[result.value.taskId] = result.value.relationships;
        }
      });

      if (Object.keys(updates).length > 0) {
        setRelationshipsMap((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const [taskId, relationships] of Object.entries(updates)) {
            if (!next[taskId]) {
              next[taskId] = relationships;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    };

    fetchRelationships();

    return () => {
      cancelled = true;
    };
  }, [results, relationshipsMap]);

  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage === currentPage ||
      (totalPages > 0 && nextPage > totalPages)
    ) {
      return;
    }

    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    if (!Number.isFinite(newLimit) || newLimit <= 0) {
      return;
    }

    setCurrentLimit(newLimit);
    setCurrentPage(1); // Reset to page 1 when changing limit
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
    setTotal(0);
    setCurrentPage(1);
    setCurrentLimit(DEFAULT_LIMIT);
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
    <div className="w-full max-w-[1400px] mx-auto h-full py-8 px-4">
      <div className="group relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 backdrop-blur-md z-50 max-w-[1024px] mx-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-visible">
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

              {/* Results Per Page */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300">
                  RESULTS PER PAGE
                </label>
                <div className="relative">
                  <select
                    value={currentLimit}
                    onChange={(event) =>
                      handleLimitChange(Number(event.target.value))
                    }
                    className="w-full appearance-none px-3 py-2 bg-cyan-500/20 border-2 border-cyan-500/20 rounded-xl text-white text-sm focus:border-cyan-400 outline-none transition-all duration-300 backdrop-blur-md focus:ring-0"
                  >
                    {limitOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        style={{ color: "#000" }}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  <PiCaretDownDuotone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row items-center justify-center z-50">
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
              {headerCount} {headerCount === 1 ? "TASK" : "TASKS"} FOUND
            </h3>
            <p className="text-purple-200/80 text-sm">
              {`Showing ${startIndex}-${endIndex} of ${Number(
                total ?? results.length
              ).toLocaleString()} results`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((task) => {
              const useCaseLabel = formatLabel(task.useCase);
              const scorePercent = Math.round((task.score ?? 0) * 100);

              const relationships =
                task.relationships ?? relationshipsMap[task.taskId];

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

              const websiteLabel = (() => {
                if (webProject) {
                  return webProject.name;
                }
                if (!taskUrl) {
                  return formatLabel(task.website);
                }
                try {
                  const parsed = new URL(taskUrl);
                  return parsed.hostname.replace(/^www\./, "");
                } catch {
                  return taskUrl.replace(/^https?:\/\//, "");
                }
              })();

              const validatorIdMatch =
                task.agentRunId.match(/validator-(\d+)/i);
              const fallbackValidator = validatorIdMatch
                ? `Validator ${validatorIdMatch[1]}`
                : "Validator";

              const validatorName =
                relationships?.validator?.name ||
                relationships?.validator?.hotkey ||
                fallbackValidator;

              const minerName =
                relationships?.miner?.name ||
                relationships?.miner?.hotkey ||
                "Miner";

              const durationLabel =
                typeof task.duration === "number" && task.duration >= 0
                  ? `${Math.round(task.duration)}s`
                  : "—";

              const validatorImageSrc = resolveAssetUrl(
                (task as any).validatorImage || relationships?.validator?.image,
                "/validators/Other.png"
              );

              const minerImageSrc = resolveAssetUrl(
                relationships?.miner?.image,
                "/miners/30.svg "
              );

              const roundNumber =
                relationships?.round?.roundNumber ??
                extractRoundNumber(task.taskId) ??
                extractRoundNumber(task.agentRunId);

              const roundDisplay =
                typeof roundNumber === "number" && Number.isFinite(roundNumber)
                  ? `#${roundNumber}`
                  : "—";

              return (
                <div
                  key={task.taskId}
                  onClick={() => router.push(`${routes.tasks}/${task.taskId}`)}
                  className="group relative rounded-xl border-2 border-slate-700/80 bg-transparent text-white shadow-xl transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col overflow-hidden hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20"
                  style={{ cursor: "pointer" }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 pointer-events-none" />

                  {/* Content container */}
                  <div className="relative flex h-full flex-col p-5 gap-4">
                    {/* Task ID and Run ID - Same Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <CopyButton text={task.taskId} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-semibold mb-0.5">
                            Task ID
                          </div>
                          <div className="font-mono text-xs font-bold text-cyan-100 truncate">
                            {truncateMiddle(task.taskId, 6)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <CopyButton text={task.agentRunId} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] uppercase tracking-wider text-violet-400 font-semibold mb-0.5">
                            Run ID
                          </div>
                          <div className="font-mono text-xs font-bold text-violet-100 truncate">
                            {truncateMiddle(task.agentRunId, 6)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Validator & Miner */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 rounded-lg border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-2.5 shadow-md transition-all duration-200 group-hover:border-indigo-400/60 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-400/50 bg-slate-900 shadow-lg flex-shrink-0 ring-2 ring-indigo-500/20">
                          <Image
                            src={validatorImageSrc}
                            alt={validatorName}
                            width={40}
                            height={40}
                            sizes="40px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] uppercase tracking-wider text-indigo-300 font-semibold mb-0.5">
                            Validator
                          </div>
                          <div className="text-xs font-bold text-indigo-50 truncate">
                            {validatorName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-2.5 shadow-md transition-all duration-200 group-hover:border-emerald-400/60 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-emerald-400/50 bg-slate-900 shadow-lg flex-shrink-0 ring-2 ring-emerald-500/20">
                          <Image
                            src={minerImageSrc}
                            alt={minerName}
                            width={40}
                            height={40}
                            sizes="40px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold mb-0.5">
                            Miner
                          </div>
                          <div className="text-xs font-bold text-emerald-50 truncate">
                            {minerName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Website & Use Case */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="relative rounded-lg border p-2.5 shadow-md transition-all duration-200 group-hover:shadow-lg"
                        style={
                          webProject
                            ? {
                                backgroundColor: webProject.color,
                                borderColor: "rgba(255,255,255,0.4)",
                                boxShadow:
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              }
                            : {
                                backgroundColor: "rgba(51, 65, 85, 0.5)",
                                borderColor: "rgba(100, 116, 139, 0.4)",
                              }
                        }
                      >
                        <div className="flex items-center gap-2">
                          <PiGlobeDuotone className="h-3.5 w-3.5 flex-shrink-0 text-white drop-shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[8px] uppercase tracking-wider text-white/70 font-semibold mb-0.5">
                              Website
                            </div>
                            <div className="text-xs font-bold text-white truncate drop-shadow-sm">
                              {websiteLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative rounded-lg border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-2.5 shadow-md transition-all duration-200 group-hover:border-blue-400/60 group-hover:shadow-lg">
                        <div className="flex items-center gap-2">
                          <PiCodeDuotone className="h-3.5 w-3.5 flex-shrink-0 text-sky-300" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[8px] uppercase tracking-wider text-sky-300 font-semibold mb-0.5">
                              Use Case
                            </div>
                            <div className="text-xs font-bold text-sky-50 truncate">
                              {useCaseLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="rounded-lg border border-slate-600/60 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 shadow-inner backdrop-blur-sm">
                      <div className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                        Prompt
                      </div>
                      <p className="text-sm leading-relaxed text-slate-100 line-clamp-2">
                        {task.prompt}
                      </p>
                    </div>

                    {/* Stats - Round, Score, Duration */}
                    <div className="mt-auto pt-3 border-t border-slate-600/60">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-amber-300/70 font-semibold mb-1">
                            Round
                          </div>
                          <div className="text-base font-bold text-amber-300 drop-shadow-sm">
                            {roundDisplay}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-emerald-300/70 font-semibold mb-1">
                            Score
                          </div>
                          <div className="text-base font-bold text-emerald-400 drop-shadow-sm">
                            {Number.isFinite(scorePercent)
                              ? `${scorePercent}%`
                              : "—"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-sky-300/70 font-semibold mb-1">
                            Duration
                          </div>
                          <div className="text-base font-bold text-sky-300 drop-shadow-sm">
                            {durationLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && results.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-sky-200">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrev}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  canGoPrev
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30 hover:border-sky-400/70"
                    : "border-slate-600/40 bg-slate-700/40 text-slate-400 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <span className="text-sky-100">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  canGoNext
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30 hover:border-sky-400/70"
                    : "border-slate-600/40 bg-slate-700/40 text-slate-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          )}
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

      {hasSearched && isSearching && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <div className="h-7 w-48 mx-auto rounded-full bg-purple-500/20 animate-pulse" />
            <div className="h-4 w-64 mx-auto mt-3 rounded-full bg-purple-500/10 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
}
