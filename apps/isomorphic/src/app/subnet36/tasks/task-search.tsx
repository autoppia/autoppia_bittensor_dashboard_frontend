"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { tasksRepository } from "@/repositories/tasks/tasks.repository";
import type { TaskData } from "@/repositories/tasks/tasks.types";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { resolveAssetUrl } from "@/services/utils/assets";
import { getProjectInfoByPort } from "@/utils/website-colors";
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
import { LuSearch } from "react-icons/lu";
import { useRoundsData, useSeasonRank } from "@/services/hooks/useAgents";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [25, 50, 100, 200];

const WEBSITE_DEFINITIONS = websitesData;
const BASE_WEBSITE_SLUGS = Array.from(
  new Set(WEBSITE_DEFINITIONS.map((website) => website.slug))
).sort((a, b) => a.localeCompare(b));

const BASE_USE_CASES_BY_WEBSITE = WEBSITE_DEFINITIONS.reduce<
  Record<string, string[]>
>((acc, website) => {
  acc[website.slug] = website.useCases
    .map((useCase) => useCase.name)
    .sort((a, b) => a.localeCompare(b));
  return acc;
}, {});

const BASE_USE_CASES = Array.from(
  new Set(
    WEBSITE_DEFINITIONS.flatMap((website) =>
      website.useCases.map((useCase) => useCase.name)
    )
  )
).sort((a, b) => a.localeCompare(b));

const mergeAndSortUnique = (lists: Array<string[]>) =>
  Array.from(
    lists.reduce((set, list) => {
      list.forEach((item) => {
        if (item) {
          set.add(item);
        }
      });
      return set;
    }, new Set<string>())
  ).sort((a, b) => a.localeCompare(b));

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = globalThis.window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      globalThis.window.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .replaceAll(/\s+/g, " ")
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

function formatCost(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

function extractRoundNumber(value?: string | null): number | null {
  if (!value) return null;
  const roundRegex = /round[-_\s]?(\d+)/i;
  const match = roundRegex.exec(value);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSeasonRound(r: unknown): { season: number; round: number } | null {
  if (typeof r !== "string" || !r.includes("/")) return null;
  const parts = r.split("/");
  const season = Number.parseInt(parts[0], 10);
  const round = Number.parseInt(parts[1], 10);
  return Number.isFinite(season) && Number.isFinite(round) ? { season, round } : null;
}

function CopyButton({ text }: Readonly<{ text: string }>) {
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
  const [selectedAgentUid, setSelectedAgentUid] = useState<number | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const [successMode, setSuccessMode] = useState<
    "all" | "successful" | "non_successful"
  >("all");
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);
  const [isSuccessDropdownOpen, setIsSuccessDropdownOpen] = useState(false);
  const [isWebsiteDropdownOpen, setIsWebsiteDropdownOpen] = useState(false);
  const [isUseCaseDropdownOpen, setIsUseCaseDropdownOpen] = useState(false);
  const [availableWebsites, setAvailableWebsites] =
    useState<string[]>(BASE_WEBSITE_SLUGS);
  const [availableUseCases, setAvailableUseCases] =
    useState<string[]>(BASE_USE_CASES);
  const [results, setResults] = useState<TaskData[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const useCaseDropdownRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);
  const successDropdownRef = useRef<HTMLDivElement>(null);

  const { data: seasonRankData } = useSeasonRank("latest");
  const { data: roundsData, loading: roundsLoading } = useRoundsData();
  const agentsList = useMemo(() => {
    const miners = seasonRankData?.miners ?? [];
    return miners.map((m) => ({ uid: m.uid, name: m.name }));
  }, [seasonRankData?.miners]);
  const filteredAgentsForDropdown = useMemo(() => {
    const q = agentSearchQuery.trim().toLowerCase();
    if (!q) return agentsList;
    return agentsList.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.uid.toString().includes(q)
    );
  }, [agentsList, agentSearchQuery]);

  const seasonOptions = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    if (rounds.length === 0) return [];

    const parsed = rounds
      .map((r) => parseSeasonRound(r))
      .filter((r): r is { season: number; round: number } => r !== null);

    return Array.from(new Set(parsed.map((r) => r.season))).sort((a, b) => b - a);
  }, [roundsData?.rounds]);

  const roundOptions = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    if (selectedSeason === undefined) return [];

    const parsed = rounds
      .map((r) => parseSeasonRound(r))
      .filter(
        (r): r is { season: number; round: number } =>
          r !== null && r.season === selectedSeason
      )
      .map((r) => r.round)
      .sort((a, b) => b - a);

    return parsed;
  }, [roundsData?.rounds, selectedSeason]);

  const isRoundInProgress =
    selectedSeason !== undefined && !roundsLoading && roundOptions.length === 0;

  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 400);
  const debouncedFilters = useDebouncedValue(
    useMemo(
      () => ({
        agentRun: agentRunInput.trim(),
        selectedAgentUid,
        website: selectedWebsite.trim(),
        useCase: selectedUseCase.trim(),
        successMode,
          season: selectedSeason,
          round: selectedRound,
      }),
        [
          agentRunInput,
          selectedAgentUid,
          selectedWebsite,
          selectedUseCase,
          successMode,
          selectedSeason,
          selectedRound,
        ]
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

  const applyFacetsToAvailability = useCallback(
    (facets: { websites: { name: string }[]; useCases: { name: string }[] }) => {
      setAvailableWebsites((prev) =>
        mergeAndSortUnique([
          prev,
          BASE_WEBSITE_SLUGS,
          facets.websites.map((item) => item.name),
        ])
      );
      setAvailableUseCases((prev) =>
        mergeAndSortUnique([
          prev,
          selectedWebsite
            ? (BASE_USE_CASES_BY_WEBSITE[selectedWebsite] ?? [])
            : BASE_USE_CASES,
          facets.useCases.map((item) => item.name),
        ])
      );
    },
    [selectedWebsite]
  );

  // Auto-search when filters or search term changes
  useEffect(() => {
    let ignore = false;

    const performSearch = async () => {
      // If there's a search term, use text-based search instead of ID lookup
      if (debouncedSearchTerm !== "") {
        setHasSearched(true);
        setIsSearching(true);
        setSearchError(null);

        try {
          const response = await tasksRepository.searchTasks({
            query: debouncedSearchTerm,
            agentRunId: debouncedFilters.agentRun || undefined,
            minerUid: debouncedFilters.selectedAgentUid ?? undefined,
            website: debouncedFilters.website || undefined,
            useCase: debouncedFilters.useCase || undefined,
            successMode: debouncedFilters.successMode,
            season: debouncedFilters.season ?? undefined,
            round: debouncedFilters.round ?? undefined,
            page: currentPage,
            limit: currentLimit,
            includeDetails: false,
          });

          if (ignore) return;

          const tasks = response.data?.tasks ?? [];
          const facets = response.data?.facets;

          setResults(tasks);
          setTotal(response.data?.total ?? tasks.length);

          if (facets && !ignore) {
            applyFacetsToAvailability(facets);
          }
        } catch (err: any) {
          if (!ignore) {
            setResults([]);
            setTotal(0);
            const errorMessage = err?.message || String(err);
            setSearchError(
              errorMessage || `Failed to search for '${debouncedSearchTerm}'`
            );
          }
        } finally {
          if (!ignore) {
            setIsSearching(false);
          }
        }
        return;
      }

      setHasSearched(true);
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await tasksRepository.searchTasks({
          agentRunId: debouncedFilters.agentRun || undefined,
          minerUid: debouncedFilters.selectedAgentUid ?? undefined,
          website: debouncedFilters.website || undefined,
          useCase: debouncedFilters.useCase || undefined,
          successMode: debouncedFilters.successMode,
          season: debouncedFilters.season ?? undefined,
          round: debouncedFilters.round ?? undefined,
          page: currentPage,
          limit: currentLimit,
          includeDetails: false,
        });

        if (ignore) return;

        const data = response.data;
        setResults(data?.tasks ?? []);
        setTotal(data?.total ?? 0);

        if (data?.facets && !ignore) {
          applyFacetsToAvailability(data.facets);
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
  }, [debouncedSearchTerm, debouncedFilters, currentPage, currentLimit, selectedWebsite, applyFacetsToAvailability]);

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
      if (
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAgentDropdownOpen(false);
      }
      if (
        seasonDropdownRef.current &&
        !seasonDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSeasonDropdownOpen(false);
      }
      if (
        roundDropdownRef.current &&
        !roundDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoundDropdownOpen(false);
      }
      if (
        successDropdownRef.current &&
        !successDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSuccessDropdownOpen(false);
      }
    };

    if (
      isWebsiteDropdownOpen ||
      isUseCaseDropdownOpen ||
      isAgentDropdownOpen ||
      isSeasonDropdownOpen ||
      isRoundDropdownOpen ||
      isSuccessDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isWebsiteDropdownOpen,
    isUseCaseDropdownOpen,
    isAgentDropdownOpen,
    isSeasonDropdownOpen,
    isRoundDropdownOpen,
    isSuccessDropdownOpen,
  ]);

  useEffect(() => {
    const baseUseCases = selectedWebsite
      ? (BASE_USE_CASES_BY_WEBSITE[selectedWebsite] ?? [])
      : BASE_USE_CASES;

    setAvailableUseCases(baseUseCases);

    if (selectedUseCase && !baseUseCases.includes(selectedUseCase)) {
      setSelectedUseCase("");
    }
  }, [selectedWebsite, selectedUseCase]);

  // Note: Removed fetchRelationships useEffect - now using validatorName/minerName directly from search response

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
    setSelectedAgentUid(null);
    setSelectedAgentName("");
    setAgentSearchQuery("");
    setIsAgentDropdownOpen(false);
    setSelectedWebsite("");
    setSelectedUseCase("");
    setSelectedSeason(undefined);
    setSelectedRound(undefined);
    setSuccessMode("all");
    setIsSuccessDropdownOpen(false);
    setIsWebsiteDropdownOpen(false);
    setIsUseCaseDropdownOpen(false);
    setIsSeasonDropdownOpen(false);
    setIsRoundDropdownOpen(false);
    setHasSearched(false);
    setSearchError(null);
    setResults([]);
    setTotal(0);
    setCurrentPage(1);
    setCurrentLimit(DEFAULT_LIMIT);
    setAvailableWebsites(BASE_WEBSITE_SLUGS);
    setAvailableUseCases(BASE_USE_CASES);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    agentRunInput !== "" ||
    selectedAgentUid != null ||
    selectedSeason !== undefined ||
    selectedRound !== undefined ||
    selectedWebsite !== "" ||
    selectedUseCase !== "" ||
    successMode !== "all";

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
      <div className="group relative w-full max-w-[1024px] mx-auto bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl transition-all duration-300 backdrop-blur-md z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative p-6 overflow-visible">
          <div className="text-left mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 self-center sm:self-auto">
                <PiMagnifyingGlassDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  EVALUATION SEARCH
                </h2>
                <p className="text-cyan-300/90 text-xs mt-1">
                  Search by Evaluation ID or prompt, then filter by Season, Round, Miner, Agent Run, Website, Use Case, and Outcome
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Evaluation ID or Prompt (e.g., 3413)"
                    className="w-full px-4 py-2.5 min-h-[48px] placeholder:text-sm bg-white/90 border border-white/60 rounded-xl text-slate-900 placeholder:text-slate-500 focus:border-cyan-300/80 transition-all duration-300 outline-none focus:ring-0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <PiHashDuotone className="w-4 h-4 text-cyan-400/90" />
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-visible z-10">
            <div className="flex items-center gap-2 mb-3">
              <PiFunnelDuotone className="w-4 h-4 text-slate-300/90" />
              <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
            </div>

            <div className="flex w-full flex-wrap gap-2 items-end">
              {/* Season Filter */}
              <div
                className="relative flex-1 min-w-[160px] max-w-[230px]"
                ref={seasonDropdownRef}
              >
                <button
                  id="task-search-season-button"
                  type="button"
                  onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                  className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:border-emerald-400/60 focus:ring-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex-shrink-0">
                      <PiHashDuotone className="w-3.5 h-3.5 text-emerald-300" />
                    </span>
                    <span className="truncate">
                      {selectedSeason === undefined
                        ? "All seasons"
                        : `Season ${selectedSeason}`}
                    </span>
                  </div>
                  <PiCaretDownDuotone
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isSeasonDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSeasonDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
                    <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSeason(undefined);
                          setSelectedRound(undefined);
                          setIsSeasonDropdownOpen(false);
                          setIsRoundDropdownOpen(false);
                        }}
                        className="w-full border-b border-slate-800/80 px-3 py-2.5 text-left text-slate-100 transition-colors duration-200 hover:bg-emerald-500/16 hover:text-white"
                      >
                        All Seasons
                      </button>

                      {roundsLoading && seasonOptions.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          Loading seasons...
                        </div>
                      ) : seasonOptions.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          No seasons available
                        </div>
                      ) : (
                        seasonOptions.map((season) => (
                          <button
                            key={season}
                            type="button"
                            onClick={() => {
                              setSelectedSeason(season);
                              setSelectedRound(undefined);
                              setIsSeasonDropdownOpen(false);
                              setIsRoundDropdownOpen(false);
                            }}
                            className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                              selectedSeason === season
                                ? "bg-gradient-to-r from-emerald-500/35 to-emerald-400/20 text-white"
                                : "bg-slate-950 text-slate-100 hover:bg-emerald-500/16 hover:text-white"
                            }`}
                          >
                            <span className="font-medium">
                              Season {season}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Round Filter */}
              <div className="relative flex-1 min-w-[160px] max-w-[230px]">
                <div className="relative" ref={roundDropdownRef}>
                  <button
                    id="task-search-round-button"
                    type="button"
                    aria-labelledby="task-search-round-label"
                    onClick={() => {
                      if (selectedSeason === undefined || isRoundInProgress)
                        return;
                      setIsRoundDropdownOpen(!isRoundDropdownOpen);
                    }}
                    disabled={selectedSeason === undefined || isRoundInProgress}
                    className={`w-full min-h-[40px] px-3 py-2 bg-slate-950/55 border border-slate-700/60 rounded-xl text-slate-100 focus:ring-0 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:border-purple-400/60 ${
                      selectedSeason === undefined || isRoundInProgress
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span className="sr-only" id="task-search-round-label">
                      ROUND
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-400/20 flex-shrink-0">
                        <PiInfoDuotone className="w-3.5 h-3.5 text-purple-300" />
                      </span>
                      <span className="truncate">
                        {selectedSeason === undefined
                          ? "Round"
                          : roundsLoading && roundOptions.length === 0
                            ? "Loading rounds..."
                            : isRoundInProgress
                              ? "Round in progress"
                              : selectedRound === undefined
                                ? "All rounds"
                                : `Round ${selectedRound}`}
                      </span>
                    </div>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-purple-400 shrink-0 transition-transform duration-200 ${
                        isRoundDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isRoundDropdownOpen && selectedSeason !== undefined && (
                    <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
                      <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRound(undefined);
                            setIsRoundDropdownOpen(false);
                          }}
                          className="w-full border-b border-slate-800/80 px-3 py-2.5 text-left text-slate-100 transition-colors duration-200 hover:bg-purple-500/16 hover:text-white"
                        >
                          All Rounds
                        </button>

                        {roundOptions.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            Round in progress
                          </div>
                        ) : (
                          roundOptions.map((round) => (
                            <button
                              key={round}
                              type="button"
                              onClick={() => {
                                setSelectedRound(round);
                                setIsRoundDropdownOpen(false);
                              }}
                              className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                selectedRound === round
                                  ? "bg-gradient-to-r from-purple-500/35 to-purple-400/20 text-white"
                                  : "bg-slate-950 text-slate-100 hover:bg-purple-500/16 hover:text-white"
                              }`}
                            >
                              <span className="font-medium">
                                Round {round}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="relative flex-1 min-w-[160px] max-w-[230px]"
                ref={agentDropdownRef}
              >
                  <button
                    id="task-search-agent-button"
                    type="button"
                    onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                    className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:border-emerald-400/60 focus:ring-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex-shrink-0">
                        <PiRobotDuotone className="w-3.5 h-3.5 text-emerald-300" />
                      </span>
                      <span className="truncate">
                        {selectedAgentUid != null && selectedAgentName
                          ? `${selectedAgentName} (${selectedAgentUid})`
                          : "All miners"}
                      </span>
                    </div>
                    <PiCaretDownDuotone className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${isAgentDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isAgentDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
                      <div className="sticky top-0 border-b border-slate-700/80 bg-slate-950 p-2">
                        <div className="relative">
                          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                          <input
                            type="text"
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                            placeholder="Search agents..."
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400/70 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAgentUid(null);
                            setSelectedAgentName("");
                            setIsAgentDropdownOpen(false);
                            setAgentSearchQuery("");
                          }}
                          className="w-full border-b border-slate-800/80 bg-slate-950 px-3 py-2.5 text-left text-slate-100 transition-colors duration-200 hover:bg-emerald-500/16 hover:text-white"
                        >
                          All Miners
                        </button>
                        {filteredAgentsForDropdown.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            No miners match your search
                          </div>
                        ) : (
                          filteredAgentsForDropdown.map((agent) => (
                            <button
                              key={agent.uid}
                              type="button"
                              onClick={() => {
                                setSelectedAgentUid(agent.uid);
                                setSelectedAgentName(agent.name);
                                setIsAgentDropdownOpen(false);
                                setAgentSearchQuery("");
                              }}
                              className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                selectedAgentUid === agent.uid
                                  ? "bg-gradient-to-r from-emerald-500/35 to-emerald-400/20 text-white"
                                  : "bg-slate-950 text-slate-100 hover:bg-emerald-500/16 hover:text-white"
                              }`}
                            >
                              <span className="font-medium">{agent.name}</span>
                              <span className="ml-1 text-xs text-slate-400">(UID {agent.uid})</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex-1 min-w-[160px] max-w-[230px]">
                <div className="relative">
                  <input
                    id="task-search-agent-run"
                    type="text"
                    value={agentRunInput}
                    onChange={(e) => setAgentRunInput(e.target.value)}
                    placeholder="Run UID (optional)"
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-950/55 border border-slate-700/60 rounded-xl text-slate-100 text-sm placeholder:text-slate-400 focus:border-emerald-400/60 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <PiRobotDuotone className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[160px] max-w-[230px]">
                <div className="relative" ref={websiteDropdownRef}>
                  <button
                    id="task-search-website-button"
                    type="button"
                    onClick={() =>
                      setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)
                    }
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-950/55 border border-slate-700/60 rounded-xl text-slate-100 focus:border-blue-400/60 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-400/20 flex-shrink-0">
                        <PiGlobeDuotone className="w-3.5 h-3.5 text-blue-300" />
                      </span>
                      <span className="truncate">
                        {selectedWebsite === ""
                          ? "All websites"
                          : formatLabel(selectedWebsite)}
                      </span>
                    </div>
                    <PiCaretDownDuotone className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${isWebsiteDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isWebsiteDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-blue-400/25 rounded-xl max-h-60 overflow-y-auto custom-scrollbar scroll-smooth backdrop-blur-xl z-50 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWebsite("");
                          setIsWebsiteDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-blue-200 bg-transparent hover:bg-blue-500/12 hover:text-blue-100 transition-colors duration-200 border-b border-blue-400/10"
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
                          className="w-full px-3 py-2.5 text-left text-blue-200 bg-transparent hover:bg-blue-500/12 hover:text-blue-100 transition-colors duration-200 border-b border-blue-400/10 last:border-b-0"
                        >
                          {website.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[160px] max-w-[230px]">
                <div className="relative" ref={useCaseDropdownRef}>
                  <button
                    id="task-search-use-case-button"
                    type="button"
                    onClick={() =>
                      setIsUseCaseDropdownOpen(!isUseCaseDropdownOpen)
                    }
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-950/55 border border-slate-700/60 rounded-xl text-slate-100 focus:border-purple-400/60 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-400/20 flex-shrink-0">
                        <PiCodeDuotone className="w-3.5 h-3.5 text-purple-300" />
                      </span>
                      <span className="truncate">
                        {selectedUseCase === ""
                          ? "All use cases"
                          : formatLabel(selectedUseCase)}
                      </span>
                    </div>
                    <PiCaretDownDuotone className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${isUseCaseDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isUseCaseDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-purple-400/25 rounded-xl max-h-60 overflow-y-auto custom-scrollbar scroll-smooth backdrop-blur-xl z-50 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUseCase("");
                          setIsUseCaseDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-purple-200 bg-transparent hover:bg-purple-500/12 hover:text-purple-100 transition-colors duration-200 border-b border-purple-400/10"
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
                          className="w-full px-3 py-2.5 text-left text-purple-200 bg-transparent hover:bg-purple-500/12 hover:text-purple-100 transition-colors duration-200 border-b border-purple-400/10 last:border-b-0"
                        >
                          {useCase.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[160px] max-w-[230px]">
                <div className="relative" ref={successDropdownRef}>
                  <button
                    id="task-search-success-button"
                    type="button"
                    onClick={() => setIsSuccessDropdownOpen(!isSuccessDropdownOpen)}
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-950/55 border border-slate-700/60 rounded-xl text-slate-100 focus:border-emerald-400/60 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex-shrink-0">
                        <PiFunnelDuotone className="w-3.5 h-3.5 text-emerald-300" />
                      </span>
                      <span className="truncate">
                        {successMode === "all" && "All Tasks"}
                        {successMode === "successful" && "Successful Tasks"}
                        {successMode === "non_successful" && "Non Successful Tasks"}
                      </span>
                    </div>
                    <PiCaretDownDuotone className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${isSuccessDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isSuccessDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-emerald-400/25 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)] z-50 backdrop-blur-xl">
                      {[
                        { value: "all", label: "All Tasks" },
                        { value: "successful", label: "Successful Tasks" },
                        { value: "non_successful", label: "Non Successful Tasks" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSuccessMode(
                              option.value as "all" | "successful" | "non_successful"
                            );
                            setIsSuccessDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left transition-colors duration-200 border-b border-emerald-400/10 last:border-b-0 ${
                            successMode === option.value
                              ? "bg-emerald-500/18 text-emerald-50"
                              : "text-emerald-200 bg-transparent hover:bg-emerald-500/12 hover:text-emerald-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row sm:justify-end items-stretch sm:items-center z-50">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters && !hasSearched}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-md ${
                hasActiveFilters || hasSearched
                  ? "bg-slate-900/40 border border-slate-700/70 text-slate-100 hover:bg-slate-900/60 hover:border-cyan-400/40 cursor-pointer"
                  : "bg-slate-900/20 border border-slate-700/40 text-slate-400 cursor-not-allowed"
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
                FAILED TO LOAD EVALUATIONS
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
              {headerCount} {headerCount === 1 ? "EVALUATION" : "EVALUATIONS"}{" "}
              FOUND
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

              // Use task.website directly (actions are empty with includeDetails=false)
              const taskUrl = task.website;

              // Extract port from URL to determine web project
              const getWebProject = (url: string) => {
                const portRegex = /:(\d+)/;
                const portMatch = portRegex.exec(url);
                if (portMatch) {
                  const port = portMatch[1];
                  const website = getProjectInfoByPort(port);
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

              const validatorIdRegex = /validator-(\d+)/i;
              const validatorIdMatch = validatorIdRegex.exec(task.agentRunId);
              const fallbackValidator = validatorIdMatch
                ? `Validator ${validatorIdMatch[1]}`
                : "Validator";

              // Use data directly from task (no need for relationships fetch)
              const validatorName =
                (task as any).validatorName || fallbackValidator;

              const minerName = (task as any).minerName || "Miner";

              const validatorImageSrc = resolveAssetUrl(
                (task as any).validatorImage,
                "/validators/Other.png"
              );

              const minerImageSrc = resolveAssetUrl(
                (task as any).minerImage,
                "/miners/30.svg "
              );

              // Season and round from backend for "Season-Round" display
              const season = (task as any).season;
              const roundNumber = (task as any).roundNumber;
              const hasSeason = typeof season === "number" && Number.isFinite(season);
              const hasRound = typeof roundNumber === "number" && Number.isFinite(roundNumber);
              let seasonRoundDisplay: string;
              if (hasSeason && hasRound) {
                seasonRoundDisplay = `${season}/${roundNumber}`;
              } else if (hasRound) {
                seasonRoundDisplay = `—/${roundNumber}`;
              } else if (hasSeason) {
                seasonRoundDisplay = `${season}/—`;
              } else {
                seasonRoundDisplay = "—";
              }

              // Evaluation cost in USD (from backend llmCost; support both camelCase and snake_case)
              const evaluationCost = (task as any).llmCost ?? (task as any).llm_cost;

              const taskDetailUrl = task.evaluationId
                ? `${routes.evaluations}/${task.evaluationId}`
                : `${routes.evaluations}/${task.taskId}`;

              return (
                <button
                  type="button"
                  key={task.evaluationId || task.taskId}
                  onClick={() => router.push(taskDetailUrl)}
                  className="group relative w-full rounded-xl border-2 border-slate-700/80 bg-transparent text-white shadow-xl transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col overflow-hidden hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20 text-left"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 pointer-events-none" />

                  {/* Content container */}
                  <div className="relative flex h-full flex-col p-5 gap-4">
                    {/* Evaluation ID and Run ID - Same Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <CopyButton text={task.taskId} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-semibold mb-0.5">
                            Evaluation ID
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

                    {/* Stats - Season-Round, Score, Cost; Reason (when score 0) */}
                    <div className="mt-auto pt-3 border-t border-slate-600/60">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-amber-300/70 font-semibold mb-1">
                            Season-Round
                          </div>
                          <div className="text-base font-bold text-amber-300 drop-shadow-sm">
                            {seasonRoundDisplay}
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
                            Cost
                          </div>
                          <div className="text-base font-bold text-sky-300 drop-shadow-sm">
                            {formatCost(evaluationCost)}
                          </div>
                        </div>
                      </div>
                      {(scorePercent === 0 || !Number.isFinite(scorePercent)) && task.zeroReason && (
                        <div className="mt-2 pt-2 border-t border-slate-600/40 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-amber-400/80 font-semibold mb-0.5">
                            Reason
                          </div>
                          <div className="text-xs font-medium text-amber-300/90">
                            {task.zeroReason
                              .split("_")
                              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                              .join(" ")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {results.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-sky-200 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="task-search-results-per-page-bottom"
                  className="text-xs font-semibold uppercase tracking-wide text-cyan-300"
                >
                  Results per page
                </label>
                <div className="relative">
                  <select
                    id="task-search-results-per-page-bottom"
                    value={currentLimit}
                    onChange={(event) =>
                      handleLimitChange(Number(event.target.value))
                    }
                    className="appearance-none rounded-xl border-2 border-cyan-500/20 bg-cyan-500/20 px-3 py-2 pr-9 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-0"
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
                  <PiCaretDownDuotone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300" />
                </div>
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-center gap-4">
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
              ) : (
                <div className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Page 1 of 1
                </div>
              )}
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
                NO EVALUATIONS FOUND
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
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-violet-500 bg-clip-text text-transparent mb-3 animate-pulse">
              Loading tasks...
            </h3>
            <div className="h-4 w-64 mx-auto mt-3 rounded-full bg-purple-500/10 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {["task-skeleton-a", "task-skeleton-b", "task-skeleton-c", "task-skeleton-d", "task-skeleton-e", "task-skeleton-f"].map((key) => (
              <div
                key={key}
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
