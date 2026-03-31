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

  const handleCopy = async (event: ReactMouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    event.preventDefault();
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
    <span
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(e as any); } }}
      className="group/copy flex h-7 w-7 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 transition-all duration-200 hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-300 hover:scale-110 active:scale-95 cursor-pointer"
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
    </span>
  );
}

export default function TaskSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const [agentRunInput, setAgentRunInput] = useState<string>("");
  const [selectedAgentUid, setSelectedAgentUid] = useState<number | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [successMode, setSuccessMode] = useState<
    "all" | "successful" | "non_successful"
  >("all");
  const [isSuccessDropdownOpen, setIsSuccessDropdownOpen] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);
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
  const successDropdownRef = useRef<HTMLDivElement>(null);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);

  const { data: roundsData, loading: roundsLoading } = useRoundsData();
  const { data: seasonRankData } = useSeasonRank("latest");
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
    if (selectedSeason === undefined) return [];
    const rounds = roundsData?.rounds ?? [];
    return rounds
      .map((r) => parseSeasonRound(r))
      .filter(
        (r): r is { season: number; round: number } =>
          r !== null && r.season === selectedSeason
      )
      .map((r) => r.round)
      .sort((a, b) => b - a);
  }, [roundsData?.rounds, selectedSeason]);

  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 400);
  const debouncedFilters = useDebouncedValue(
    useMemo(
      () => ({
        season: selectedSeason,
        round: selectedRound,
        agentRun: agentRunInput.trim(),
        selectedAgentUid,
        website: selectedWebsite.trim(),
        useCase: selectedUseCase.trim(),
        successMode,
      }),
      [
        selectedSeason,
        selectedRound,
        agentRunInput,
        selectedAgentUid,
        selectedWebsite,
        selectedUseCase,
        successMode,
      ]
    ),
    400
  );

  const filteredResults = useMemo(() => {
    return results.filter((task) => {
      const season = (task as any).season;
      const roundNumber = (task as any).roundNumber;

      if (
        selectedSeason !== undefined &&
        (!Number.isFinite(season) || season !== selectedSeason)
      ) {
        return false;
      }

      if (
        selectedRound !== undefined &&
        (!Number.isFinite(roundNumber) || roundNumber !== selectedRound)
      ) {
        return false;
      }

      return true;
    });
  }, [results, selectedSeason, selectedRound]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(total / currentLimit));

  const startIndex =
    filteredResults.length === 0 ? 0 : (currentPage - 1) * currentLimit + 1;

  const endIndex =
    filteredResults.length === 0 ? 0 : startIndex + filteredResults.length - 1;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const limitOptions = useMemo(() => {
    const options = new Set<number>(LIMIT_OPTIONS);
    options.add(currentLimit);
    return Array.from(options).sort((a, b) => a - b);
  }, [currentLimit]);

  const headerCount = filteredResults.length;

  const applyFacetsToAvailability = (
    facets: { websites: { name: string }[]; useCases: { name: string }[] }
  ) => {
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
  };

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
            startDate:
              debouncedFilters.season !== undefined && debouncedFilters.round !== undefined
                ? undefined
                : undefined,
            agentRunId: debouncedFilters.agentRun || undefined,
            minerUid: debouncedFilters.selectedAgentUid ?? undefined,
            website: debouncedFilters.website || undefined,
            useCase: debouncedFilters.useCase || undefined,
            successMode: debouncedFilters.successMode,
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
  }, [debouncedSearchTerm, debouncedFilters, currentPage, currentLimit, selectedWebsite]);

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
        successDropdownRef.current &&
        !successDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSuccessDropdownOpen(false);
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
    };

    if (
      isWebsiteDropdownOpen ||
      isUseCaseDropdownOpen ||
      isAgentDropdownOpen ||
      isSuccessDropdownOpen ||
      isSeasonDropdownOpen ||
      isRoundDropdownOpen
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
    isSuccessDropdownOpen,
    isSeasonDropdownOpen,
    isRoundDropdownOpen,
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
    setSelectedSeason(undefined);
    setSelectedRound(undefined);
    setAgentRunInput("");
    setSelectedAgentUid(null);
    setSelectedAgentName("");
    setAgentSearchQuery("");
    setIsAgentDropdownOpen(false);
    setSelectedWebsite("");
    setSelectedUseCase("");
    setSuccessMode("all");
    setIsSuccessDropdownOpen(false);
    setIsSeasonDropdownOpen(false);
    setIsRoundDropdownOpen(false);
    setIsWebsiteDropdownOpen(false);
    setIsUseCaseDropdownOpen(false);
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
    selectedSeason !== undefined ||
    selectedRound !== undefined ||
    agentRunInput !== "" ||
    selectedAgentUid != null ||
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
    <div className="w-full max-w-[1440px] mx-auto h-full py-8 px-4">
      <div className="group relative mx-auto max-w-[1280px] overflow-visible rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(125deg,rgba(7,26,31,0.96)_0%,rgba(15,35,60,0.92)_52%,rgba(39,17,55,0.9)_100%)] shadow-[0_24px_90px_rgba(3,8,20,0.45)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/35 z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.12),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

        <div className="relative overflow-visible p-6 md:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 shadow-[0_16px_30px_rgba(14,165,233,0.28)]">
              <PiMagnifyingGlassDuotone className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-[2rem] font-black tracking-[0.04em] text-white">
                EVALUATION SEARCH
              </h2>
              <p className="text-sm leading-6 text-cyan-100/78">
                Search by evaluation ID or prompt, then narrow results by season, round, miner, agent run, website, use case, and success.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/88">
              EVALUATION QUERY
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Evaluation ID or prompt"
                className="min-h-[58px] w-full rounded-2xl border border-cyan-400/28 bg-cyan-500/10 px-5 py-3 pr-12 text-base text-cyan-50 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-cyan-100/35 focus:border-cyan-300/55 focus:bg-cyan-500/14"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <PiHashDuotone className="h-5 w-5 text-cyan-300/90" />
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-visible">
            <div className="rounded-[24px] border border-white/8 bg-slate-950/18 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-500/10">
                  <PiFunnelDuotone className="h-4 w-4 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-100">
                    Filters
                  </h3>
                  <p className="text-xs text-slate-300/55">
                    Refine the local result set without changing the main query.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 items-end gap-4 overflow-visible md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90" htmlFor="task-search-season-button">
                    SEASON
                  </label>
                  <div className="relative" ref={seasonDropdownRef}>
                    <button
                      id="task-search-season-button"
                      type="button"
                      onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-left text-emerald-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {roundsLoading && seasonOptions.length === 0 && "Loading seasons..."}
                        {!roundsLoading && selectedSeason === undefined && "All Seasons"}
                        {!roundsLoading && selectedSeason !== undefined && `Season ${selectedSeason}`}
                      </span>
                      <PiCaretDownDuotone
                        className={`h-4 w-4 text-emerald-400 transition-transform duration-200 ${isSeasonDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSeasonDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-emerald-300/25 bg-[linear-gradient(180deg,rgba(7,16,28,0.98),rgba(10,20,34,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSeason(undefined);
                            setSelectedRound(undefined);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className="w-full border-b border-emerald-400/10 bg-transparent px-3 py-2.5 text-left text-emerald-200 transition-colors duration-200 hover:bg-emerald-500/12 hover:text-emerald-100"
                        >
                          All Seasons
                        </button>
                        {seasonOptions.map((season) => (
                          <button
                            key={season}
                            type="button"
                            onClick={() => {
                              setSelectedSeason(season);
                              setSelectedRound(undefined);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className="w-full border-b border-emerald-400/10 bg-transparent px-3 py-2.5 text-left text-emerald-200 transition-colors duration-200 last:border-b-0 hover:bg-emerald-500/12 hover:text-emerald-100"
                          >
                            Season {season}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/90" htmlFor="task-search-round-button">
                    ROUND
                  </label>
                  <div className="relative" ref={roundDropdownRef}>
                    <button
                      id="task-search-round-button"
                      type="button"
                      onClick={() => {
                        if (selectedSeason === undefined) return;
                        setIsRoundDropdownOpen(!isRoundDropdownOpen);
                      }}
                      disabled={selectedSeason === undefined}
                      className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-purple-400/25 bg-purple-500/12 px-4 py-3 text-left text-purple-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0 ${selectedSeason === undefined ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span>
                        {selectedSeason === undefined && "Select season first"}
                        {selectedSeason !== undefined && selectedRound === undefined && "All Rounds"}
                        {selectedSeason !== undefined && selectedRound !== undefined && `Round ${selectedRound}`}
                      </span>
                      <PiCaretDownDuotone
                        className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${isRoundDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isRoundDropdownOpen && selectedSeason !== undefined && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-purple-300/25 bg-[linear-gradient(180deg,rgba(12,15,34,0.985),rgba(18,19,42,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRound(undefined);
                            setIsRoundDropdownOpen(false);
                          }}
                          className="w-full border-b border-purple-400/10 bg-transparent px-3 py-2.5 text-left text-purple-200 transition-colors duration-200 hover:bg-purple-500/12 hover:text-purple-100"
                        >
                          All Rounds
                        </button>
                        {roundOptions.map((round) => (
                          <button
                            key={round}
                            type="button"
                            onClick={() => {
                              setSelectedRound(round);
                              setIsRoundDropdownOpen(false);
                            }}
                            className="w-full border-b border-purple-400/10 bg-transparent px-3 py-2.5 text-left text-purple-200 transition-colors duration-200 last:border-b-0 hover:bg-purple-500/12 hover:text-purple-100"
                          >
                            Round {round}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90" htmlFor="task-search-agent-button">
                    MINER
                  </label>
                  <div className="relative" ref={agentDropdownRef}>
                    <button
                      id="task-search-agent-button"
                      type="button"
                      onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-emerald-400/25 bg-slate-950/60 px-4 py-3 text-left text-white transition-all duration-300 outline-none backdrop-blur-md focus:border-emerald-300/45 focus:ring-0"
                    >
                      <span className="truncate">
                        {selectedAgentUid != null && selectedAgentName
                          ? `${selectedAgentName} (${selectedAgentUid})`
                          : "All Miners"}
                      </span>
                      <PiCaretDownDuotone
                        className={`ml-2 h-4 w-4 shrink-0 text-emerald-400 transition-transform duration-200 ${isAgentDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isAgentDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-72 flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                        <div className="sticky top-0 border-b border-slate-700/80 bg-slate-950 p-2">
                          <div className="relative">
                            <LuSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
                            <input
                              type="text"
                              value={agentSearchQuery}
                              onChange={(e) => setAgentSearchQuery(e.target.value)}
                              placeholder="Search agents..."
                              className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400/70 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
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
                                className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${selectedAgentUid === agent.uid ? "bg-gradient-to-r from-emerald-500/35 to-emerald-400/20 text-white" : "bg-slate-950 text-slate-100 hover:bg-emerald-500/16 hover:text-white"}`}
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
                </div>

                <div className="space-y-2">
                  <label htmlFor="task-search-agent-run" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                    AGENT RUN
                  </label>
                  <div className="relative">
                    <input
                      id="task-search-agent-run"
                      type="text"
                      value={agentRunInput}
                      onChange={(e) => setAgentRunInput(e.target.value)}
                      placeholder="Run UID"
                      className="min-h-[52px] w-full rounded-2xl border border-cyan-400/25 bg-slate-950/60 px-4 py-3 pr-11 text-sm text-cyan-50 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-cyan-100/35 focus:border-cyan-300/50 focus:ring-0"
                    />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <PiRobotDuotone className="h-4 w-4 text-cyan-300/90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/90" htmlFor="task-search-website-button">
                    WEBSITE
                  </label>
                  <div className="relative" ref={websiteDropdownRef}>
                    <button
                      id="task-search-website-button"
                      type="button"
                      onClick={() => setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-blue-400/25 bg-blue-500/12 px-4 py-3 text-left text-blue-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {selectedWebsite === "" ? "All Websites" : formatLabel(selectedWebsite)}
                      </span>
                      <PiCaretDownDuotone
                        className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${isWebsiteDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isWebsiteDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-blue-300/25 bg-[linear-gradient(180deg,rgba(8,18,34,0.985),rgba(11,24,40,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWebsite("");
                            setIsWebsiteDropdownOpen(false);
                          }}
                          className="w-full border-b border-blue-400/10 bg-transparent px-3 py-2.5 text-left text-blue-200 transition-colors duration-200 hover:bg-blue-500/12 hover:text-blue-100"
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
                            className="w-full border-b border-blue-400/10 bg-transparent px-3 py-2.5 text-left text-blue-200 transition-colors duration-200 last:border-b-0 hover:bg-blue-500/12 hover:text-blue-100"
                          >
                            {website.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/90" htmlFor="task-search-use-case-button">
                    USE CASE
                  </label>
                  <div className="relative" ref={useCaseDropdownRef}>
                    <button
                      id="task-search-use-case-button"
                      type="button"
                      onClick={() => setIsUseCaseDropdownOpen(!isUseCaseDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-purple-400/25 bg-purple-500/12 px-4 py-3 text-left text-purple-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {selectedUseCase === "" ? "All Use Cases" : formatLabel(selectedUseCase)}
                      </span>
                      <PiCaretDownDuotone
                        className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${isUseCaseDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isUseCaseDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-purple-300/25 bg-[linear-gradient(180deg,rgba(14,13,34,0.985),rgba(21,18,45,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUseCase("");
                            setIsUseCaseDropdownOpen(false);
                          }}
                          className="w-full border-b border-purple-400/10 bg-transparent px-3 py-2.5 text-left text-purple-200 transition-colors duration-200 hover:bg-purple-500/12 hover:text-purple-100"
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
                            className="w-full border-b border-purple-400/10 bg-transparent px-3 py-2.5 text-left text-purple-200 transition-colors duration-200 last:border-b-0 hover:bg-purple-500/12 hover:text-purple-100"
                          >
                            {useCase.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90" htmlFor="task-search-success-button">
                    SUCCESS
                  </label>
                  <div className="relative" ref={successDropdownRef}>
                    <button
                      id="task-search-success-button"
                      type="button"
                      onClick={() => setIsSuccessDropdownOpen(!isSuccessDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-left text-emerald-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {successMode === "all" && "All Tasks"}
                        {successMode === "successful" && "Successful Tasks"}
                        {successMode === "non_successful" && "Non Successful Tasks"}
                      </span>
                      <PiCaretDownDuotone
                        className={`h-4 w-4 text-emerald-400 transition-transform duration-200 ${isSuccessDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSuccessDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-emerald-300/25 bg-[linear-gradient(180deg,rgba(8,18,24,0.985),rgba(10,24,26,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        {[
                          { value: "all", label: "All Tasks" },
                          { value: "successful", label: "Successful Tasks" },
                          { value: "non_successful", label: "Non Successful Tasks" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSuccessMode(option.value as "all" | "successful" | "non_successful");
                              setIsSuccessDropdownOpen(false);
                            }}
                            className={`w-full border-b border-emerald-400/10 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${successMode === option.value ? "bg-emerald-500/18 text-emerald-50" : "bg-transparent text-emerald-200 hover:bg-emerald-500/12 hover:text-emerald-100"}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="block h-[15px]" aria-hidden="true" />
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold tracking-[0.04em] transition-all duration-300 whitespace-nowrap ${hasActiveFilters ? "border border-orange-300/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.82),rgba(249,115,22,0.78))] text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(249,115,22,0.28)]" : "cursor-not-allowed border border-white/10 bg-white/6 text-slate-400"}`}
                >
                  CLEAR FILTERS
                </button>
                </div>
              </div>
            </div>
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

      {hasSearched && !isSearching && filteredResults.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {headerCount} {headerCount === 1 ? "EVALUATION" : "EVALUATIONS"}{" "}
              FOUND
            </h3>
            <p className="text-purple-200/80 text-sm">
              {`Showing ${startIndex}-${endIndex} of ${Number(
                filteredResults.length
              ).toLocaleString()} results`}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {filteredResults.map((task) => {
              const useCaseLabel = formatLabel(task.useCase);
              const scorePercent = Math.round((task.score ?? 0) * 100);

              const taskUrl = task.website;

              const getWebProject = (url: string) => {
                const portRegex = /:(\d+)/;
                const portMatch = portRegex.exec(url);
                if (portMatch) {
                  const port = portMatch[1];
                  const website = getProjectInfoByPort(port);
                  return website
                    ? { name: website.name, color: website.color, slug: website.slug }
                    : null;
                }
                return null;
              };

              const webProject = getWebProject(taskUrl);

              const websiteLabel = (() => {
                if (webProject) return webProject.name;
                if (!taskUrl) return formatLabel(task.website);
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

              const season = (task as any).season;
              const roundNumber = (task as any).roundNumber;
              const hasSeason = typeof season === "number" && Number.isFinite(season);
              const hasRound = typeof roundNumber === "number" && Number.isFinite(roundNumber);
              const seasonLabel = hasSeason ? `S${season}` : "";
              const roundLabel = hasRound ? `R${roundNumber}` : "";

              const evaluationCost = (task as any).llmCost ?? (task as any).llm_cost;

              const taskDetailUrl = task.evaluationId
                ? `${routes.evaluations}/${task.evaluationId}`
                : `${routes.evaluations}/${task.taskId}`;

              return (
                <button
                  type="button"
                  key={task.evaluationId || task.taskId}
                  onClick={() => router.push(taskDetailUrl)}
                  className="group relative w-full rounded-xl border border-slate-700/60 bg-slate-900/40 text-white transition-all duration-200 backdrop-blur-sm cursor-pointer overflow-hidden hover:border-cyan-500/60 hover:bg-slate-800/50 text-left"
                >
                  <div className="relative flex items-center gap-3 px-4 py-2.5 sm:px-5">
                    {/* Season/Round */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {seasonLabel && (
                        <span className="text-[10px] font-bold text-emerald-400 tracking-wide">
                          {seasonLabel}
                        </span>
                      )}
                      {roundLabel && (
                        <span className="text-[10px] font-bold text-purple-400 tracking-wide">
                          {roundLabel}
                        </span>
                      )}
                    </div>

                    <div className="h-8 w-px bg-slate-700/60 flex-shrink-0" />

                    {/* Validator */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-indigo-400/40 bg-slate-900 flex-shrink-0">
                        <Image
                          src={validatorImageSrc}
                          alt={validatorName}
                          width={24}
                          height={24}
                          sizes="24px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[80px]">
                        {validatorName}
                      </span>
                    </div>

                    {/* Miner */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-emerald-400/40 bg-slate-900 flex-shrink-0">
                        <Image
                          src={minerImageSrc}
                          alt={minerName}
                          width={24}
                          height={24}
                          sizes="24px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[80px]">
                        {minerName}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-700/60 flex-shrink-0" />

                    {/* Website + UseCase + Prompt */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white flex-shrink-0"
                        style={{
                          backgroundColor: webProject?.color ?? "rgba(51, 65, 85, 0.7)",
                        }}
                      >
                        <PiGlobeDuotone className="h-3 w-3" />
                        {websiteLabel}
                      </span>
                      {useCaseLabel && (
                        <span className="hidden sm:inline text-[10px] text-sky-400/70 font-medium flex-shrink-0 max-w-[140px] truncate">
                          {useCaseLabel}
                        </span>
                      )}
                      <p className="hidden lg:block text-[11px] leading-snug text-slate-500 line-clamp-1 min-w-0 flex-1">
                        {task.prompt}
                      </p>
                    </div>

                    <div className="h-8 w-px bg-slate-700/60 flex-shrink-0" />

                    {/* Stats: Score | Cost | Time */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-center min-w-[34px]">
                        <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">Score</div>
                        <div className={`text-xs font-bold ${scorePercent > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                          {Number.isFinite(scorePercent) ? `${scorePercent}%` : "—"}
                        </div>
                      </div>
                      <div className="text-center min-w-[34px]">
                        <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">Cost</div>
                        <div className="text-xs font-bold text-sky-400">
                          {formatCost(evaluationCost)}
                        </div>
                      </div>
                      <div className="text-center min-w-[34px]">
                        <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">Time</div>
                        <div className="text-xs font-bold text-violet-400">
                          {typeof task.duration === "number" && task.duration > 0
                            ? `${task.duration}s`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Zero reason badge */}
                    {(scorePercent === 0 || !Number.isFinite(scorePercent)) && task.zeroReason && (
                      <span className="hidden sm:inline flex-shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
                        {task.zeroReason
                          .split("_")
                          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                          .join(" ")}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredResults.length > 0 && (
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

      {hasSearched && !isSearching && filteredResults.length === 0 && !searchError && (
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
