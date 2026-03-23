"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAgentRunsList } from "@/services/hooks/useAgentRun";
import type {
  AgentRunData,
  AgentRunListItem,
  AgentRunsListQueryParams,
} from "@/repositories/agent-runs/agent-runs.types";
import { agentRunsRepository } from "@/repositories/agent-runs/agent-runs.repository";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiInfoDuotone,
} from "react-icons/pi";
import { LuSearch } from "react-icons/lu";
import { overviewRepository } from "@/repositories/overview/overview.repository";
import { resolveAssetUrl } from "@/services/utils/assets";
import { routes } from "@/config/routes";
import { useRoundsData, useSeasonRank } from "@/services/hooks/useAgents";

const DEFAULT_LIMIT = 50;
const LIMIT_OPTIONS = [25, 50, 100, 200];

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = globalThis.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      globalThis.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function parseSeasonRound(r: unknown): { season: number; round: number } | null {
  if (typeof r !== "string" || !r.includes("/")) return null;
  const parts = r.split("/");
  const season = Number.parseInt(parts[0], 10);
  const round = Number.parseInt(parts[1], 10);
  return Number.isFinite(season) && Number.isFinite(round) ? { season, round } : null;
}

function sanitizeRanking(value: number | undefined | null): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

function normalizePercentage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  const scaled = value > 1 ? value : value * 100;
  return Math.round(scaled * 10) / 10;
}

function formatPercentage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatRewardPercentage(value: number | null | undefined) {
  const normalized = normalizePercentage(value);
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Unknown start";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown start";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatValidatorLabel(
  validatorId: string,
  validatorName?: string | null
) {
  if (validatorName) {
    return validatorName;
  }

  if (!validatorId) {
    return "Unknown Validator";
  }

  const normalized = validatorId.replace(/^validator[_-]/i, "");
  const numericSuffix = normalized.replace(/^\D*/, "");
  if (numericSuffix) {
    return `Validator ${numericSuffix}`;
  }

  return validatorId;
}

function formatAgentLabel(run: AgentRunListItem): string {
  if (run.agentName) {
    return run.agentName;
  }
  if (run.agentHotkey) {
    return run.agentHotkey;
  }
  return run.agentId;
}

function extractUidNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.abs(value);
  }
  if (typeof value === "string") {
    const match = /\d+/.exec(value);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      if (!Number.isNaN(parsed)) {
        return Math.abs(parsed);
      }
    }
  }
  return null;
}

function resolveMinerImage(run: AgentRunListItem): string {
  const explicitImage =
    run.agentImage ||
    (run as any)?.agent_image ||
    (run as any)?.minerImage ||
    (run as any)?.image;

  if (explicitImage) {
    return resolveAssetUrl(explicitImage);
  }

  const uidCandidate =
    (typeof run.agentUid === "number" ? run.agentUid : null) ??
    extractUidNumber(run.agentId) ??
    extractUidNumber(run.agentHotkey);

  if (uidCandidate !== null) {
    const normalized = Math.abs(uidCandidate % 50);
    return resolveAssetUrl(`/miners/${normalized}.svg`);
  }

  return resolveAssetUrl("/images/autoppia-logo.png");
}

const normalizeListItemValues = (run: AgentRunListItem): AgentRunListItem => {
  const totalTasks = run.totalTasks ?? 0;
  const completed = run.successfulTasks ?? run.completedTasks ?? 0;
  const computedRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100 * 10) / 10 : 0;
  const successRate = run.successRate == null ? computedRate : normalizePercentage(run.successRate);

  return {
    ...run,
    overallReward: normalizePercentage(run.overallReward),
    successRate,
    successfulTasks: run.successfulTasks ?? completed,
    completedTasks: run.completedTasks ?? completed,
  };
};

export default function AgentRunSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [selectedMinerUid, setSelectedMinerUid] = useState<number | null>(null);
  const [selectedMinerName, setSelectedMinerName] = useState<string>("");
  const [minerSearchQuery, setMinerSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isValidatorDropdownOpen, setIsValidatorDropdownOpen] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);
  const [isMinerDropdownOpen, setIsMinerDropdownOpen] = useState(false);
  const [manualResults, setManualResults] = useState<AgentRunListItem[] | null>(
    null
  );
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [lastSearchedRunId, setLastSearchedRunId] = useState<string>("");

  const validatorDropdownRef = useRef<HTMLDivElement>(null);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);
  const minerDropdownRef = useRef<HTMLDivElement>(null);

  // Get available rounds
  const { data: roundsData, loading: roundsLoading } = useRoundsData();
  const { data: seasonRankData } = useSeasonRank("latest");
  const minerOptions = useMemo(() => {
    const miners = seasonRankData?.miners ?? [];
    return miners.map((miner) => ({ uid: miner.uid, name: miner.name }));
  }, [seasonRankData?.miners]);
  const filteredMinerOptions = useMemo(() => {
    const query = minerSearchQuery.trim().toLowerCase();
    if (!query) return minerOptions;
    return minerOptions.filter(
      (miner) =>
        miner.name.toLowerCase().includes(query) ||
        miner.uid.toString().includes(query)
    );
  }, [minerOptions, minerSearchQuery]);

  // Parse available rounds to extract seasons
  const seasonOptions = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    if (rounds.length === 0) return [];
    const parsed = rounds
      .map((r) => {
        if (typeof r !== "string" || !r.includes("/")) return null;
        const parts = r.split("/");
        const season = Number.parseInt(parts[0], 10);
        const round = Number.parseInt(parts[1], 10);
        return Number.isFinite(season) && Number.isFinite(round) ? { season, round } : null;
      })
      .filter((r): r is { season: number; round: number } => r !== null);
    return Array.from(new Set(parsed.map((r) => r.season))).sort((a, b) => b - a);
  }, [roundsData?.rounds]);

  // Get round options for selected season
  const roundOptions = useMemo(() => {
    const rounds = roundsData?.rounds ?? [];
    const currentSeason = selectedSeason;

    if (!currentSeason) {
      return [];
    }

    const parsed = rounds
      .map((r) => parseSeasonRound(r))
      .filter((r): r is { season: number; round: number } => r !== null && r.season === currentSeason)
      .map((r) => r.round)
      .sort((a, b) => b - a);

    return parsed;
  }, [roundsData?.rounds, selectedSeason]);
  const isRoundInProgress =
    selectedSeason !== undefined && !roundsLoading && roundOptions.length === 0;

  const debouncedFilters = useDebouncedValue(
    useMemo(
      () => ({
        season: selectedSeason,
        round: selectedRound,
        validator: selectedValidator.trim(),
        agent: selectedMinerUid != null ? `agent-${selectedMinerUid}` : "",
      }),
      [selectedSeason, selectedRound, selectedValidator, selectedMinerUid]
    ),
    400
  );

  const [queryParams, setQueryParams] = useState<AgentRunsListQueryParams>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const [validatorFilterOptions, setValidatorFilterOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [validatorLoading, setValidatorLoading] = useState(false);
  const [validatorError, setValidatorError] = useState<string | null>(null);

  console.log("Current queryParams:", queryParams);

  const {
    runs,
    total,
    page: currentPage,
    limit: currentLimit,
    facets,
    isLoading,
    error,
    refetch,
  } = useAgentRunsList(queryParams);

  const isManualSearchActive = manualResults !== null;
  const resolvedPage = currentPage ?? queryParams.page ?? 1;
  const resolvedLimit = currentLimit ?? queryParams.limit ?? DEFAULT_LIMIT;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        validatorDropdownRef.current &&
        !validatorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsValidatorDropdownOpen(false);
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
        minerDropdownRef.current &&
        !minerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMinerDropdownOpen(false);
      }
    };

    if (
      isValidatorDropdownOpen ||
      isSeasonDropdownOpen ||
      isRoundDropdownOpen ||
      isMinerDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isValidatorDropdownOpen,
    isSeasonDropdownOpen,
    isRoundDropdownOpen,
    isMinerDropdownOpen,
  ]);

  useEffect(() => {
    let isActive = true;
    setValidatorLoading(true);
    setValidatorError(null);

    overviewRepository
      .getValidatorFilters()
      .then((response) => {
        if (!isActive) return;
        const mapped = response.validators.map((validator) => ({
          id: validator.id,
          name: validator.name,
        }));
        setValidatorFilterOptions(mapped);
      })
      .catch((err) => {
        if (!isActive) return;
        setValidatorFilterOptions([]);
        setValidatorError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (isActive) {
          setValidatorLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const activeRuns = useMemo<AgentRunListItem[]>(() => {
    const source = manualResults ?? runs;
    console.log("activeRuns updated:", {
      hasManualResults: manualResults !== null,
      manualResultsCount: manualResults?.length ?? 0,
      runsCount: runs.length,
      sourceCount: source.length,
    });
    return source.map(normalizeListItemValues);
  }, [manualResults, runs]);

  const derivedValidatorOptions = useMemo<
    { id: string; label: string }[]
  >(() => {
    if (facets?.validators?.length) {
      return facets.validators
        .map((validator) => ({
          id: validator.id,
          label: formatValidatorLabel(validator.id, validator.name),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    const values = new Map<string, string>();
    activeRuns.forEach((run) => {
      if (run.validatorId) {
        values.set(
          run.validatorId,
          formatValidatorLabel(run.validatorId, run.validatorName)
        );
      }
    });

    return Array.from(values.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [facets, activeRuns]);

  const validatorOptions = useMemo<{ id: string; label: string }[]>(() => {
    const optionsMap = new Map<string, string>();

    if (validatorFilterOptions.length > 0) {
      validatorFilterOptions.forEach((validator) => {
        optionsMap.set(
          validator.id,
          formatValidatorLabel(validator.id, validator.name)
        );
      });
    } else {
      derivedValidatorOptions.forEach((option) => {
        optionsMap.set(option.id, option.label);
      });
    }

    if (selectedValidator && !optionsMap.has(selectedValidator)) {
      optionsMap.set(
        selectedValidator,
        formatValidatorLabel(selectedValidator)
      );
    }

    return Array.from(optionsMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [validatorFilterOptions, derivedValidatorOptions, selectedValidator]);

  const selectedValidatorLabel = useMemo(() => {
    if (!selectedValidator) {
      return null;
    }
    const match = validatorOptions.find(
      (option) => option.id === selectedValidator
    );
    return match?.label ?? formatValidatorLabel(selectedValidator);
  }, [selectedValidator, validatorOptions]);

  const displayedRuns = useMemo(() => {
    const getTime = (value: string | null | undefined) => {
      const parsed = value ? new Date(value).getTime() : Number.NaN;
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...activeRuns].sort(
      (a, b) => getTime(b.startTime) - getTime(a.startTime)
    );
  }, [activeRuns]);

  const totalPages = isManualSearchActive
    ? 1
    : Math.max(1, Math.ceil((total || 0) / resolvedLimit));

  const startIndex = (() => {
    if (displayedRuns.length === 0) return 0;
    if (isManualSearchActive) return 1;
    return (resolvedPage - 1) * resolvedLimit + 1;
  })();

  const endIndex = (() => {
    if (displayedRuns.length === 0) return 0;
    if (isManualSearchActive) return displayedRuns.length;
    return startIndex + displayedRuns.length - 1;
  })();

  const canGoPrev = !isManualSearchActive && resolvedPage > 1;
  const canGoNext = !isManualSearchActive && resolvedPage < totalPages;

  const limitValue = queryParams.limit ?? resolvedLimit;

  const limitOptions = useMemo(() => {
    const options = new Set<number>(LIMIT_OPTIONS);
    options.add(limitValue);
    return Array.from(options).sort((a, b) => a - b);
  }, [limitValue]);

  const headerCount = isManualSearchActive
    ? displayedRuns.length
    : total || displayedRuns.length;

  const effectiveLoading =
    manualLoading || (isManualSearchActive === false && isLoading);
  const effectiveError = manualError || (isManualSearchActive ? null : error);
  const effectiveNotFound =
    manualResults !== null && manualResults.length === 0 && !manualError;

  useEffect(() => {
    if (!searchTerm.trim() && isManualSearchActive && !manualLoading) {
      setManualResults(null);
      setManualError(null);
    }
  }, [searchTerm, isManualSearchActive, manualLoading]);

  // Auto-search when filters change (without clicking search button)
  useEffect(() => {
    const trimmedRunId = searchTerm.trim();

    // If there's a Run UID search term, handle it separately
    if (trimmedRunId !== "") {
      // Prevent searching for the same run ID repeatedly
      if (trimmedRunId === lastSearchedRunId) {
        return;
      }

      // Debounce is handled by debouncedFilters
      // We'll search for the run ID automatically
      const searchByRunId = async () => {
        setLastSearchedRunId(trimmedRunId);
        setHasSearched(true);
        setManualLoading(true);
        setManualError(null);
        try {
          console.log(`Auto-searching for agent run: ${trimmedRunId}`);
          const run = await agentRunsRepository.getAgentRun(trimmedRunId);
          setManualResults([mapRunDetailToListItem(run)]);
        } catch (err: any) {
          console.error("Agent run auto-search error:", err);
          setManualResults([]);

          const errorMessage = err?.message || String(err);
          if (
            errorMessage.includes("404") ||
            errorMessage.includes("Not Found")
          ) {
            setManualError(
              `Agent run '${trimmedRunId}' not found. The run ID might not exist or the format is incorrect. Try filtering by Round, Validator, or Agent instead.`
            );
          } else {
            setManualError(`Failed to load agent run: ${errorMessage}`);
          }
        } finally {
          setManualLoading(false);
        }
      };

      searchByRunId();
      return;
    }

    // When search term is empty, use filter-based search
    const resolvedLimit = queryParams.limit ?? DEFAULT_LIMIT;
    // Construct roundId from season and round (format: "season/round")
    const normalizedRound =
      debouncedFilters.season !== undefined && debouncedFilters.round !== undefined
        ? `${debouncedFilters.season}/${debouncedFilters.round}`
        : undefined;
    const normalizedValidator = debouncedFilters.validator || undefined;
    const normalizedAgent = debouncedFilters.agent || undefined;

    const filtersAreInSync =
      queryParams.roundId === normalizedRound &&
      queryParams.validatorId === normalizedValidator &&
      queryParams.agentId === normalizedAgent;

    // If filters haven't changed, don't re-run
    if (filtersAreInSync) {
      return;
    }

    // Filters have changed - build new query
    const nextQuery: AgentRunsListQueryParams = {
      page: 1,
      limit: resolvedLimit,
    };

    if (normalizedRound !== undefined) {
      nextQuery.roundId = normalizedRound;
    }
    if (normalizedValidator) {
      nextQuery.validatorId = normalizedValidator;
    }
    if (normalizedAgent) {
      nextQuery.agentId = normalizedAgent;
    }

    console.log("Applying filters:", nextQuery);

    // Clear manual search results when switching to filter mode
    setManualResults(null);
    setManualError(null);
    setManualLoading(false);
    setLastSearchedRunId("");
    setHasSearched(true);
    setQueryParams(nextQuery);
  }, [
    debouncedFilters,
    queryParams.agentId,
    queryParams.limit,
    queryParams.roundId,
    queryParams.validatorId,
    searchTerm,
    lastSearchedRunId,
  ]);

  useEffect(() => {
    if (hasSearched) {
      return;
    }
    if (!isLoading && (runs.length > 0 || error)) {
      setHasSearched(true);
    }
  }, [hasSearched, isLoading, runs, error]);

  const mapRunDetailToListItem = (run: AgentRunData): AgentRunListItem => {
    const totalTasks = run.totalTasks ?? 0;
    const completedTasks = run.completedTasks ?? run.successfulTasks ?? 0;
    const successfulTasks = run.successfulTasks ?? completedTasks;
    const baseReward = normalizePercentage(
      typeof run.overallReward === "number" ? run.overallReward : run.reward
    );
    const successRate =
      totalTasks > 0
        ? Math.round((successfulTasks / totalTasks) * 100 * 10) / 10
        : 0;

    return {
      runId: run.runId,
      agentId: run.agentId,
      agentUid: run.agentUid,
      agentHotkey: run.agentHotkey,
      agentName: run.agentName,
      agentImage: run.agentImage,
      roundId: run.roundId,
      validatorId: run.validatorId,
      validatorName: run.validatorName,
      validatorImage: run.validatorImage,
      status: run.status,
      startTime: run.startTime,
      endTime: run.endTime ?? null,
      totalTasks,
      completedTasks,
      successfulTasks,
      successRate,
      overallReward: baseReward,
      ranking: sanitizeRanking(run.ranking),
      isReused: Boolean(run.isReused ?? (run as unknown as Record<string, unknown>).is_reused ?? false),
      reusedFromAgentRunId: (run.reusedFromAgentRunId ?? (run as unknown as Record<string, unknown>).reusedFromAgentRunId ?? (run as unknown as Record<string, unknown>).reused_from_agent_run_id ?? null) as string | null,
      reusedFromRoundDisplay: (run.reusedFromRoundDisplay ?? (run as unknown as Record<string, unknown>).reusedFromRoundDisplay ?? (run as unknown as Record<string, unknown>).reused_from_round_display ?? null) as string | null,
    };
  };

  const handleSearch = async () => {
    const trimmedRunId = searchTerm.trim();
    const hasRunId = trimmedRunId.length > 0;
    const roundIdParam =
      selectedSeason !== undefined && selectedRound !== undefined
        ? `${selectedSeason}/${selectedRound}`
        : undefined;
    const validatorIdParam = selectedValidator || undefined;
    const agentIdParam =
      selectedMinerUid != null ? `agent-${selectedMinerUid}` : undefined;

    if (hasRunId) {
      setHasSearched(true);
      setManualLoading(true);
      setManualError(null);
      try {
        console.log(`Searching for agent run: ${trimmedRunId}`);
        console.log(`API endpoint: /api/v1/agent-runs/${trimmedRunId}`);

        const run = await agentRunsRepository.getAgentRun(trimmedRunId);
        setManualResults([mapRunDetailToListItem(run)]);
      } catch (err: any) {
        console.error("Agent run search error:", err);
        setManualResults([]);

        // Provide more helpful error message
        const errorMessage = err?.message || String(err);
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("Not Found")
        ) {
          setManualError(
            `Agent run '${trimmedRunId}' not found. The run ID might not exist or the format is incorrect. Try filtering by Round, Validator, or Agent instead.`
          );
        } else {
          setManualError(`Failed to load agent run: ${errorMessage}`);
        }
      } finally {
        setManualLoading(false);
      }
      return;
    }

    setHasSearched(true);
    setManualResults(null);
    setManualError(null);
    setManualLoading(false);

    const nextQuery: AgentRunsListQueryParams = {
      page: 1,
      limit: queryParams.limit ?? DEFAULT_LIMIT,
    };

    if (roundIdParam !== undefined) {
      nextQuery.roundId = roundIdParam;
    }
    if (validatorIdParam) {
      nextQuery.validatorId = validatorIdParam;
    }
    if (agentIdParam) {
      nextQuery.agentId = agentIdParam;
    }

    setQueryParams(nextQuery);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSeason(undefined);
    setSelectedRound(undefined);
    setSelectedValidator("");
    setSelectedMinerUid(null);
    setSelectedMinerName("");
    setMinerSearchQuery("");
    setIsValidatorDropdownOpen(false);
    setIsSeasonDropdownOpen(false);
    setIsRoundDropdownOpen(false);
    setIsMinerDropdownOpen(false);
    setManualResults(null);
    setManualError(null);
    setManualLoading(false);
    setLastSearchedRunId("");
    setQueryParams({
      page: 1,
      limit: queryParams.limit ?? DEFAULT_LIMIT,
    });
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedSeason !== undefined ||
    selectedRound !== undefined ||
    selectedValidator !== "" ||
    selectedMinerUid !== null;

  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage === resolvedPage ||
      (totalPages > 0 && nextPage > totalPages)
    ) {
      return;
    }

    setManualResults(null);
    setManualError(null);
    setManualLoading(false);
    setHasSearched(true);
    setQueryParams((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    if (!Number.isFinite(newLimit) || newLimit <= 0) {
      return;
    }

    setManualResults(null);
    setManualError(null);
    setManualLoading(false);
    setHasSearched(true);
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      limit: newLimit,
    }));
  };

  const handleRetry = () => {
    if (manualResults !== null || searchTerm.trim()) {
      void handleSearch();
    } else {
      refetch();
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto h-full py-8 px-4">
      <div className="w-full max-w-[1024px] mx-auto">
        {/* Main Search Card */}
        <div className="group relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl transition-all duration-300 backdrop-blur-md z-50">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative p-6 overflow-visible">
            {/* Header */}
            <div className="text-left mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 self-center sm:self-auto">
                  <PiMagnifyingGlassDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    AGENT RUN SEARCH
                  </h2>
                  <p className="text-cyan-300/90 text-xs mt-1">
                    Search by Run UID or filter by Round, Validator, and Agent
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter Run UID (e.g., round_020_42_005)"
                  className="w-full px-4 py-2.5 min-h-[48px] placeholder:text-sm bg-white/90 border border-white/60 rounded-xl text-slate-900 placeholder:text-slate-500 focus:border-cyan-300/80 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <PiHashDuotone className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6 overflow-visible">
              <div className="flex items-center gap-2 mb-3">
                <PiFunnelDuotone className="w-4 h-4 text-slate-300/90" />
                <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
              </div>

              <div className="flex w-full flex-wrap gap-2 items-end overflow-visible">
                {/* Season Filter */}
                <div className="flex-1 min-w-[160px] max-w-[230px]">
                  <label
                    id="filter-season-label"
                    htmlFor="filter-season-btn"
                    className="sr-only"
                  >
                    SEASON
                  </label>
                  <div className="relative" ref={seasonDropdownRef}>
                    <button
                      id="filter-season-btn"
                      type="button"
                      aria-labelledby="filter-season-label"
                      onClick={() => {
                        setIsSeasonDropdownOpen(!isSeasonDropdownOpen);
                      }}
                      className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:border-emerald-400/60 focus:ring-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex-shrink-0">
                          <PiHashDuotone className="w-3.5 h-3.5 text-emerald-300" />
                        </span>
                        <span className="truncate">
                          {roundsLoading && seasonOptions.length === 0 && "Loading seasons..."}
                          {!roundsLoading && selectedSeason === undefined && "All Seasons"}
                          {!roundsLoading && selectedSeason !== undefined && `Season ${selectedSeason}`}
                        </span>
                      </div>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                          isSeasonDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isSeasonDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 overflow-y-auto custom-scrollbar scroll-smooth rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSeason(undefined);
                            setSelectedRound(undefined);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className="w-full border-b border-slate-800/80 px-3 py-2.5 text-left text-slate-100 transition-colors duration-200 hover:bg-emerald-500/16 hover:text-white"
                        >
                          All Seasons
                        </button>
                        {seasonOptions.length > 0 &&
                          seasonOptions.map((season) => {
                            const isActive = selectedSeason === season;
                            return (
                              <button
                                key={season}
                                type="button"
                                onClick={() => {
                                  setSelectedSeason(season);
                                  setSelectedRound(undefined); // Reset round when season changes
                                  setIsSeasonDropdownOpen(false);
                                }}
                                className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                  isActive
                                    ? "bg-gradient-to-r from-emerald-500/35 to-emerald-400/20 text-white"
                                    : "bg-slate-950 text-slate-100 hover:bg-emerald-500/16 hover:text-white"
                                }`}
                              >
                                Season {season}
                              </button>
                            );
                          })}
                        {!roundsLoading && seasonOptions.length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            No seasons available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Round Filter */}
                <div className="flex-1 min-w-[160px] max-w-[230px]">
                  <label
                    id="filter-round-label"
                    htmlFor="filter-round-btn"
                    className="sr-only"
                  >
                    ROUND
                  </label>
                  <div className="relative" ref={roundDropdownRef}>
                    <button
                      id="filter-round-btn"
                      type="button"
                      aria-labelledby="filter-round-label"
                      onClick={() => {
                        if (selectedSeason === undefined || isRoundInProgress) {
                          return; // Don't open if no season selected
                        }
                        setIsRoundDropdownOpen(!isRoundDropdownOpen);
                      }}
                      disabled={selectedSeason === undefined || isRoundInProgress}
                      className={`flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0 focus:border-purple-400/60 ${
                        selectedSeason === undefined || isRoundInProgress
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-400/20 flex-shrink-0">
                          <PiInfoDuotone className="w-3.5 h-3.5 text-purple-300" />
                        </span>
                        <span className="truncate">
                          {selectedSeason === undefined && "Select season first"}
                          {selectedSeason !== undefined && roundOptions.length === 0 && "Round in progress"}
                          {selectedSeason !== undefined && roundOptions.length > 0 && selectedRound === undefined && "All Rounds"}
                          {selectedSeason !== undefined && roundOptions.length > 0 && selectedRound !== undefined && `Round ${selectedRound}`}
                        </span>
                      </div>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${
                          isRoundDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isRoundDropdownOpen && selectedSeason !== undefined && (
                      <div className="absolute top-full left-0 right-0 mt-2 overflow-y-auto custom-scrollbar scroll-smooth rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
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
                        {roundOptions.length > 0 &&
                          roundOptions.map((round) => {
                            const isActive = selectedRound === round;
                            return (
                              <button
                                key={round}
                                type="button"
                                onClick={() => {
                                  setSelectedRound(round);
                                  setIsRoundDropdownOpen(false);
                                }}
                                className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                  isActive
                                    ? "bg-gradient-to-r from-purple-500/35 to-purple-400/20 text-white"
                                    : "bg-slate-950 text-slate-100 hover:bg-purple-500/16 hover:text-white"
                                }`}
                              >
                                Round {round}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validator Filter */}
                <div className="flex-1 min-w-[160px] max-w-[230px]">
                  <label
                    id="filter-validator-label"
                    htmlFor="filter-validator-btn"
                    className="sr-only"
                  >
                    VALIDATOR
                  </label>
                  <div className="relative" ref={validatorDropdownRef}>
                    <button
                      id="filter-validator-btn"
                      type="button"
                      aria-labelledby="filter-validator-label"
                      onClick={() => {
                        setIsValidatorDropdownOpen(!isValidatorDropdownOpen);
                      }}
                      className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0 focus:border-blue-400/60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-400/20 flex-shrink-0">
                          <PiInfoDuotone className="w-3.5 h-3.5 text-blue-300" />
                        </span>
                        <span className="truncate">
                          {validatorLoading && validatorOptions.length === 0 && "Loading validators..."}
                          {(validatorLoading === false || validatorOptions.length > 0) && selectedValidator === "" && "All Validators"}
                          {(validatorLoading === false || validatorOptions.length > 0) && selectedValidator !== "" && (selectedValidatorLabel ?? formatValidatorLabel(selectedValidator))}
                        </span>
                      </div>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                          isValidatorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isValidatorDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 overflow-y-auto custom-scrollbar scroll-smooth rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] z-50 max-h-72 flex flex-col backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedValidator("");
                            setIsValidatorDropdownOpen(false);
                          }}
                          className="w-full border-b border-slate-800/80 px-3 py-2.5 text-left text-slate-100 transition-colors duration-200 hover:bg-blue-500/16 hover:text-white"
                        >
                          All Validators
                        </button>
                        {validatorLoading && validatorOptions.length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            Loading validators...
                          </div>
                        )}
                        {validatorOptions.length > 0 &&
                          validatorOptions.map((validator) => {
                            const isActive = selectedValidator === validator.id;
                            return (
                              <button
                                key={validator.id}
                                type="button"
                                onClick={() => {
                                  setSelectedValidator(validator.id);
                                  setIsValidatorDropdownOpen(false);
                                }}
                                className={`w-full border-b border-slate-800/80 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                  isActive
                                    ? "bg-gradient-to-r from-blue-500/35 to-blue-400/20 text-white"
                                    : "bg-slate-950 text-slate-100 hover:bg-blue-500/16 hover:text-white"
                                }`}
                              >
                                {validator.label}
                              </button>
                            );
                          })}
                        {!validatorLoading && validatorOptions.length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            {validatorError ?? "No validators available"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Miner Filter */}
                <div className="flex-1 min-w-[160px] max-w-[230px]">
                  <label
                    id="filter-agent-label"
                    htmlFor="filter-agent-button"
                    className="sr-only"
                  >
                    MINER
                  </label>
                  <div className="relative" ref={minerDropdownRef}>
                    <button
                      id="filter-agent-button"
                      type="button"
                      onClick={() => setIsMinerDropdownOpen(!isMinerDropdownOpen)}
                      className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-left text-slate-100 transition-all duration-300 outline-none backdrop-blur-md focus:border-emerald-400/60 focus:ring-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex-shrink-0">
                          <PiRobotDuotone className="w-3.5 h-3.5 text-emerald-300" />
                        </span>
                        <span className="truncate">
                          {selectedMinerUid != null && selectedMinerName
                            ? `${selectedMinerName} (UID ${selectedMinerUid})`
                            : "All Miners"}
                        </span>
                      </div>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-emerald-400 shrink-0 ml-2 transition-transform duration-200 ${isMinerDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isMinerDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col">
                        <div className="sticky top-0 border-b border-slate-700/80 bg-slate-950 p-2">
                          <div className="relative">
                            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                            <input
                              type="text"
                              value={minerSearchQuery}
                              onChange={(e) => setMinerSearchQuery(e.target.value)}
                              placeholder="Search miners..."
                              className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400/70 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMinerUid(null);
                              setSelectedMinerName("");
                              setMinerSearchQuery("");
                              setIsMinerDropdownOpen(false);
                            }}
                            className="w-full border-b border-slate-800/80 bg-slate-950 px-3 py-2 text-left text-slate-100 transition-colors duration-200 hover:bg-emerald-500/16 hover:text-white"
                          >
                            All Miners
                          </button>
                          {filteredMinerOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-slate-400">
                              No miners match your search
                            </div>
                          ) : (
                            filteredMinerOptions.map((miner) => (
                              <button
                                key={miner.uid}
                                type="button"
                                onClick={() => {
                                  setSelectedMinerUid(miner.uid);
                                  setSelectedMinerName(miner.name);
                                  setMinerSearchQuery("");
                                  setIsMinerDropdownOpen(false);
                                }}
                                className={`w-full border-b border-slate-800/80 px-3 py-2 text-left transition-colors duration-200 last:border-b-0 ${
                                  selectedMinerUid === miner.uid
                                    ? "bg-gradient-to-r from-emerald-500/35 to-emerald-400/20 text-white"
                                    : "bg-slate-950 text-slate-100 hover:bg-emerald-500/16 hover:text-white"
                                }`}
                              >
                                <span className="font-medium">{miner.name}</span>
                                <span className="ml-1 text-xs text-slate-400">
                                  (UID {miner.uid})
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row sm:justify-end items-stretch sm:items-center z-50">
              {/* <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500/80 to-blue-500/80 border-2 border-emerald-500/60 rounded-xl font-bold text-white hover:from-emerald-500 hover:to-blue-500 hover:border-emerald-400 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <PiMagnifyingGlassDuotone className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                SEARCH
              </button> */}

              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-md ${
                  hasActiveFilters
                    ? "bg-slate-900/40 border border-slate-700/70 text-slate-100 hover:bg-slate-900/60 hover:border-cyan-400/40 cursor-pointer"
                    : "bg-slate-900/20 border border-slate-700/40 text-slate-400 cursor-not-allowed"
                }`}
              >
                CLEAR FILTERS
              </button>
            </div>
          </div>
      </div>

      {!hasSearched && seasonOptions.length > 0 && (
        <div className="w-full max-w-[1024px] mx-auto">
          <div className="mt-6 text-center relative z-0">
            <div className="relative rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-6 shadow-lg backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-orange-900/10"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg mx-auto mb-4">
                  <PiInfoDuotone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-2">
                  ROUND IN PROGRESS
                </h3>
                <p className="text-amber-100/90 text-sm">
                  This round is in progress. Runs and rankings will be available once evaluations are complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasSearched && effectiveError && !effectiveNotFound && (
        <div className="mt-6 relative z-0">
            <div className="relative bg-gradient-to-br from-red-500/5 via-orange-500/5 to-red-600/5 border-2 border-red-500/40 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg mx-auto mb-4">
                  <PiMagnifyingGlassDuotone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  FAILED TO LOAD AGENT RUNS
                </h3>
                <p className="text-red-200 text-sm mb-4">{effectiveError}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-500/70 border border-red-500/40 text-white rounded-lg hover:bg-red-500 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {hasSearched && effectiveLoading && (
          <div className="mt-6 text-center relative z-0">
            <div className="relative bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 border-2 border-blue-500/40 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                  LOADING AGENT RUNS
                </h3>
                <p className="text-blue-200 text-sm">
                  Fetching runs from the validator network...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched &&
          !effectiveLoading &&
          (!effectiveError || effectiveNotFound) &&
          displayedRuns.length === 0 && (
            <div className="mt-6 text-center relative z-0">
              <div className={`relative rounded-2xl p-6 shadow-lg backdrop-blur-md border-2 ${
                isRoundInProgress
                  ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-400/40"
                  : "bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-600/5 border-purple-500/30"
              }`}>
                <div className={`absolute inset-0 ${
                  isRoundInProgress
                    ? "bg-gradient-to-br from-amber-900/10 via-transparent to-orange-900/10"
                    : "bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10"
                }`}></div>
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl shadow-lg mx-auto mb-4 ${
                    isRoundInProgress
                      ? "bg-gradient-to-br from-amber-400 to-orange-500"
                      : "bg-gradient-to-br from-purple-400 to-violet-500"
                  }`}>
                    {isRoundInProgress ? (
                      <PiInfoDuotone className="w-8 h-8 text-white" />
                    ) : (
                      <PiMagnifyingGlassDuotone className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className={`text-lg font-bold bg-clip-text text-transparent mb-2 ${
                    isRoundInProgress
                      ? "bg-gradient-to-r from-amber-300 to-orange-400"
                      : "bg-gradient-to-r from-purple-400 to-violet-500"
                  }`}>
                    {isRoundInProgress ? "ROUND IN PROGRESS" : "NO RESULTS FOUND"}
                  </h3>
                  <p className={`text-sm ${
                    isRoundInProgress ? "text-amber-100/90" : "text-purple-200"
                  }`}>
                    {isRoundInProgress
                      ? "This round is in progress. Runs and rankings will be available once evaluations are complete."
                      : "Try a different run ID or adjust your filters."}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Search Results */}
      {hasSearched && displayedRuns.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {headerCount} RESULT{headerCount === 1 ? "" : "S"}
            </h3>
            <p className="text-purple-200 text-sm">
              {isManualSearchActive
                ? "Showing exact match for the requested run"
                : `Showing ${startIndex}-${endIndex} of ${Number(
                    total ?? displayedRuns.length
                  ).toLocaleString()} results`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedRuns.map((run) => {
              const validatorLabel = formatValidatorLabel(
                run.validatorId,
                run.validatorName
              );
              const validatorImageSrc = resolveAssetUrl(
                run.validatorImage,
                resolveAssetUrl("/validators/Other.png")
              );
              const agentLabel = formatAgentLabel(run);
              const completedTasks =
                run.successfulTasks ?? run.completedTasks ?? 0;
              const totalTasks = run.totalTasks ?? 0;
              const rewardPercent = formatRewardPercentage(run.overallReward);
              const minerImageSrc = resolveMinerImage(run);

              return (
                <button
                  type="button"
                  key={run.runId}
                  onClick={() =>
                    router.push(`${routes.agent_run}/${run.runId}`)
                  }
                  className="group relative w-full rounded-xl border-2 border-slate-700/80 bg-transparent text-white shadow-xl transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col overflow-hidden hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20 text-left"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 pointer-events-none" />

                  {/* Content container */}
                  <div className="relative flex h-full flex-col p-5 gap-4">
                    {/* Season & Round Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const roundId = run.roundId;
                          // Parse "season/round" format
                          if (typeof roundId === "string" && roundId.includes("/")) {
                            const [season, round] = roundId.split("/");
                            return (
                              <>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-200 shadow-md">
                                  Season {season}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/60 bg-gradient-to-br from-purple-500/20 to-purple-600/10 px-3 py-1.5 text-sm font-bold text-purple-200 shadow-md">
                                  Round {round}
                                </span>
                              </>
                            );
                          }
                          // Decode numeric format: season * 10000 + round_in_season
                          if (typeof roundId === "number" && roundId > 0) {
                            const season = Math.floor(roundId / 10000);
                            const round = roundId % 10000;
                            return (
                              <>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-200 shadow-md">
                                  Season {season}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/60 bg-gradient-to-br from-purple-500/20 to-purple-600/10 px-3 py-1.5 text-sm font-bold text-purple-200 shadow-md">
                                  Round {round}
                                </span>
                              </>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/60 bg-gradient-to-br from-sky-500/20 to-sky-600/10 px-3 py-1.5 text-sm font-bold text-sky-200 shadow-md">
                              Round {roundId ?? "?"}
                            </span>
                          );
                        })()}
                      </div>
                      {typeof run.ranking === "number" && run.ranking > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-amber-500/70 bg-gradient-to-br from-amber-500/25 to-amber-600/15 px-3 py-1.5 text-sm font-bold text-amber-200 shadow-md">
                          🏆 #{run.ranking}
                        </span>
                      )}
                    </div>

                    {/* Validator */}
                    <div className="flex items-center gap-2.5 rounded-lg border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-2.5 shadow-md transition-all duration-200 group-hover:border-indigo-400/60 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-400/50 bg-slate-900 shadow-lg flex-shrink-0 ring-2 ring-indigo-500/20">
                        <Image
                          src={validatorImageSrc}
                          alt={validatorLabel}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-wider text-indigo-300 font-semibold mb-0.5">
                          Validator {extractUidNumber(run.validatorId) ?? "—"}
                        </div>
                        <div className="text-xs font-bold text-indigo-50 truncate">
                          {validatorLabel}
                        </div>
                      </div>
                    </div>

                    {/* Miner */}
                    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-2.5 shadow-md transition-all duration-200 group-hover:border-emerald-400/60 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-emerald-400/50 bg-slate-900 shadow-lg flex-shrink-0 ring-2 ring-emerald-500/20">
                        <Image
                          src={minerImageSrc}
                          alt={agentLabel}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold mb-0.5">
                          Miner{" "}
                          {run.agentUid ?? extractUidNumber(run.agentId) ?? "—"}
                        </div>
                        <div className="text-xs font-bold text-emerald-50 truncate">
                          {agentLabel}
                        </div>
                      </div>
                    </div>

                    {/* Run ID */}
                    <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-2.5 shadow-sm">
                      <div className="text-[9px] uppercase tracking-wider text-orange-300 font-semibold mb-1">
                        Run ID
                      </div>
                      <div className="text-xs font-mono font-bold text-orange-50 truncate">
                        {run.runId}
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-auto pt-3 border-t border-slate-600/60">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-emerald-300/70 font-semibold mb-1">
                            Reward
                          </div>
                          <div className="text-base font-bold text-emerald-400 drop-shadow-sm">
                            {rewardPercent}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] uppercase tracking-wider text-amber-300/70 font-semibold mb-1">
                            Tasks
                          </div>
                          <div className="text-base font-bold text-amber-300 drop-shadow-sm">
                            {completedTasks}/{totalTasks}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                        <svg
                          className="w-3.5 h-3.5 text-sky-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {new Date(run.startTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}{" "}
                          ·{" "}
                          {new Date(run.startTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {!isManualSearchActive && displayedRuns.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-sky-200 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="agent-run-results-per-page-bottom"
                  className="text-xs font-semibold uppercase tracking-wide text-cyan-300"
                >
                  Results per page
                </label>
                <div className="relative">
                  <select
                    id="agent-run-results-per-page-bottom"
                    value={limitValue}
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
                    onClick={() => handlePageChange(resolvedPage - 1)}
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
                    Page {resolvedPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(resolvedPage + 1)}
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

      {/* No Results Message */}
      {hasSearched &&
        displayedRuns.length === 0 &&
        (!effectiveError || effectiveNotFound) &&
        !effectiveLoading && (
          <div className="w-full max-w-[1024px] mx-auto">
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
          </div>
        )}
    </div>
  );
}
