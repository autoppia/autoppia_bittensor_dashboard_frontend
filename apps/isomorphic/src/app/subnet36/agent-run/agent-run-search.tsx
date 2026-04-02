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
  const [successOnly, setSuccessOnly] = useState(false);
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

    const sortedRuns = [...activeRuns].sort(
      (a, b) => getTime(b.startTime) - getTime(a.startTime)
    );

    if (!successOnly) {
      return sortedRuns;
    }

    return sortedRuns.filter((run) => (run.overallReward ?? 0) > 0);
  }, [activeRuns, successOnly]);

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

  const headerCount =
    successOnly || isManualSearchActive
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
    setSuccessOnly(false);
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
    selectedMinerUid !== null ||
    successOnly;

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
                AGENT RUN SEARCH
              </h2>
              <p className="text-sm leading-6 text-cyan-100/78">
                Find a run by UID or narrow the list with season, round, validator, miner, and success filters.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/88">
              RUN UID
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Run UID"
                className="min-h-[58px] w-full rounded-2xl border border-cyan-400/28 bg-cyan-500/10 px-5 py-3 pr-12 text-base text-cyan-50 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-cyan-100/35 focus:border-cyan-300/55 focus:bg-cyan-500/14"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <PiHashDuotone className="h-5 w-5 text-cyan-300/90" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Exact lookup only. Leave empty to browse runs with filters.
            </p>
          </div>

          <div className="mb-6 overflow-visible">
            <div className="rounded-[24px] border border-white/8 bg-slate-950/18 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-500/10">
                  <PiFunnelDuotone className="h-4 w-4 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-100">Filters</h3>
                  <p className="text-xs text-slate-300/55">
                    Refine the run list without changing the main query.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 overflow-visible md:grid-cols-2 xl:grid-cols-6 xl:gap-4">
                {/* Season Filter */}
                <div className="space-y-2 xl:col-span-1">
                  <label id="filter-season-label" htmlFor="filter-season-btn" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90">
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
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-left text-emerald-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {roundsLoading && seasonOptions.length === 0 && "Loading seasons..."}
                        {!roundsLoading && selectedSeason === undefined && "All Seasons"}
                        {!roundsLoading && selectedSeason !== undefined && `Season ${selectedSeason}`}
                      </span>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                          isSeasonDropdownOpen ? "rotate-180" : ""
                        }`}
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
                                className={`w-full border-b border-emerald-400/10 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                  isActive
                                    ? "bg-emerald-500/20 text-emerald-50"
                                    : "bg-transparent text-emerald-200 hover:bg-emerald-500/12 hover:text-emerald-100"
                                }`}
                              >
                                Season {season}
                              </button>
                            );
                          })}
                        {!roundsLoading && seasonOptions.length === 0 && (
                          <div className="px-3 py-2 text-emerald-300 text-sm">
                            No seasons available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Round Filter */}
                <div className="space-y-2 xl:col-span-1">
                  <label id="filter-round-label" htmlFor="filter-round-btn" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/90">
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
                      className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-purple-400/25 bg-purple-500/12 px-4 py-3 text-left text-purple-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0 ${
                        selectedSeason === undefined || isRoundInProgress
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <span>
                        {selectedSeason === undefined && "Select season first"}
                        {selectedSeason !== undefined && roundOptions.length === 0 && "Round in progress"}
                        {selectedSeason !== undefined && roundOptions.length > 0 && selectedRound === undefined && "All Rounds"}
                        {selectedSeason !== undefined && roundOptions.length > 0 && selectedRound !== undefined && `Round ${selectedRound}`}
                      </span>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${
                          isRoundDropdownOpen ? "rotate-180" : ""
                        }`}
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
                                className={`w-full border-b border-purple-400/10 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${isActive ? "bg-purple-500/20 text-purple-50" : "bg-transparent text-purple-200 hover:bg-purple-500/12 hover:text-purple-100"}`}
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
                <div className="space-y-2 xl:col-span-1">
                  <label id="filter-validator-label" htmlFor="filter-validator-btn" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/90">
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
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-blue-400/25 bg-blue-500/12 px-4 py-3 text-left text-blue-100 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                    >
                      <span>
                        {validatorLoading && validatorOptions.length === 0 && "Loading validators..."}
                        {(validatorLoading === false || validatorOptions.length > 0) && selectedValidator === "" && "All Validators"}
                        {(validatorLoading === false || validatorOptions.length > 0) && selectedValidator !== "" && (selectedValidatorLabel ?? formatValidatorLabel(selectedValidator))}
                      </span>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                          isValidatorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isValidatorDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-blue-300/25 bg-[linear-gradient(180deg,rgba(8,18,34,0.985),rgba(11,24,40,0.985))] shadow-[0_24px_70px_rgba(2,6,23,0.72)] backdrop-blur-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedValidator("");
                            setIsValidatorDropdownOpen(false);
                          }}
                          className="w-full border-b border-blue-400/10 bg-transparent px-3 py-2.5 text-left text-blue-200 transition-colors duration-200 hover:bg-blue-500/12 hover:text-blue-100"
                        >
                          All Validators
                        </button>
                        {validatorLoading && validatorOptions.length === 0 && (
                          <div className="px-3 py-2 text-blue-300 text-sm">
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
                                className={`w-full border-b border-blue-400/10 px-3 py-2.5 text-left transition-colors duration-200 last:border-b-0 ${
                                  isActive
                                    ? "bg-blue-500/20 text-blue-50"
                                    : "bg-transparent text-blue-200 hover:bg-blue-500/12 hover:text-blue-100"
                                }`}
                              >
                                {validator.label}
                              </button>
                            );
                          })}
                        {!validatorLoading && validatorOptions.length === 0 && (
                          <div className="px-3 py-2 text-blue-300 text-sm">
                            {validatorError ?? "No validators available"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Miner Filter */}
                <div className="space-y-2 xl:col-span-1">
                  <label id="filter-agent-label" htmlFor="filter-agent-button" className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/90">
                    MINER
                  </label>
                  <div className="relative" ref={minerDropdownRef}>
                    <button
                      id="filter-agent-button"
                      type="button"
                      onClick={() => setIsMinerDropdownOpen(!isMinerDropdownOpen)}
                      className="flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-purple-400/25 bg-slate-950/60 px-4 py-3 text-left text-white transition-all duration-300 outline-none backdrop-blur-md focus:border-purple-300/45 focus:ring-0"
                    >
                      <span className="truncate">
                        {selectedMinerUid != null && selectedMinerName
                          ? `${selectedMinerName} (UID ${selectedMinerUid})`
                          : "All Miners"}
                      </span>
                      <PiCaretDownDuotone
                        className={`w-4 h-4 text-purple-400 shrink-0 ml-2 transition-transform duration-200 ${isMinerDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isMinerDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-72 flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                        <div className="sticky top-0 border-b border-slate-700/80 bg-slate-950 p-2">
                          <div className="relative">
                            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                            <input
                              type="text"
                              value={minerSearchQuery}
                              onChange={(e) => setMinerSearchQuery(e.target.value)}
                              placeholder="Search miners..."
                              className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-purple-400/70 focus:outline-none"
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
                            className="w-full border-b border-slate-800/80 bg-slate-950 px-3 py-2 text-left text-slate-100 transition-colors duration-200 hover:bg-purple-500/16 hover:text-white"
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
                                    ? "bg-gradient-to-r from-purple-500/35 to-fuchsia-500/20 text-white"
                                    : "bg-slate-950 text-slate-100 hover:bg-purple-500/16 hover:text-white"
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

                <div className="space-y-2 xl:col-span-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90">
                    SUCCESS
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuccessOnly((prev) => !prev)}
                    className={`inline-flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                      successOnly
                        ? "border-emerald-400/40 bg-emerald-500/14 text-emerald-100 shadow-[0_12px_30px_rgba(16,185,129,0.16)]"
                        : "border-emerald-400/25 bg-slate-950/60 text-slate-300 hover:border-emerald-300/40 hover:text-emerald-100"
                    }`}
                  >
                    <span>{successOnly ? "Successful Runs" : "All Runs"}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        successOnly ? "bg-emerald-300" : "bg-slate-500"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2 xl:col-span-1">
                  <div className="block h-[15px]" aria-hidden="true" />
                  <button
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold tracking-[0.04em] transition-all duration-300 whitespace-nowrap ${
                      hasActiveFilters
                        ? "border border-orange-300/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.82),rgba(249,115,22,0.78))] text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(249,115,22,0.28)]"
                        : "cursor-not-allowed border border-white/10 bg-white/6 text-slate-400"
                    }`}
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!hasSearched && seasonOptions.length > 0 && (
        <div className="w-full max-w-[1280px] mx-auto">
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

          <div className="flex flex-col gap-3">
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
              const rewardValue = normalizePercentage(run.overallReward);
              const minerImageSrc = resolveMinerImage(run);

              const roundId = run.roundId;
              let seasonLabel = "";
              let roundLabel = "";
              if (typeof roundId === "string" && roundId.includes("/")) {
                const [s, r] = roundId.split("/");
                seasonLabel = `S${s}`;
                roundLabel = `R${r}`;
              } else if (typeof roundId === "number" && roundId > 0) {
                seasonLabel = `S${Math.floor(roundId / 10000)}`;
                roundLabel = `R${roundId % 10000}`;
              } else {
                roundLabel = `R${roundId ?? "?"}`;
              }

              return (
                <button
                  type="button"
                  key={run.runId}
                  onClick={() =>
                    router.push(`${routes.agent_run}/${run.runId}`)
                  }
                  className="group relative w-full rounded-xl border border-slate-700/60 bg-slate-900/40 text-white transition-all duration-200 backdrop-blur-sm cursor-pointer overflow-hidden hover:border-cyan-500/60 hover:bg-slate-800/50 text-left"
                >
                  <div className="relative flex items-center gap-4 px-4 py-3 sm:px-5 sm:py-3.5">
                    {/* Season/Round compact badge */}
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[52px]">
                      {seasonLabel && (
                        <span className="text-[10px] font-bold text-emerald-400 tracking-wide">
                          {seasonLabel}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-purple-400 tracking-wide">
                        {roundLabel}
                      </span>
                      {typeof run.ranking === "number" && run.ranking > 0 && (
                        <span className="mt-0.5 text-[10px] font-bold text-amber-400">
                          #{run.ranking}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-10 w-px bg-slate-700/60 flex-shrink-0" />

                    {/* Validator */}
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0 w-[140px] sm:w-[170px]">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-indigo-400/40 bg-slate-900 flex-shrink-0">
                        <Image
                          src={validatorImageSrc}
                          alt={validatorLabel}
                          width={32}
                          height={32}
                          sizes="32px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-wider text-indigo-300/70 font-semibold">
                          Val {extractUidNumber(run.validatorId) ?? "—"}
                        </div>
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {validatorLabel}
                        </div>
                      </div>
                    </div>

                    {/* Miner */}
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0 w-[140px] sm:w-[170px]">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-emerald-400/40 bg-slate-900 flex-shrink-0">
                        <Image
                          src={minerImageSrc}
                          alt={agentLabel}
                          width={32}
                          height={32}
                          sizes="32px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-wider text-emerald-300/70 font-semibold">
                          Miner {run.agentUid ?? extractUidNumber(run.agentId) ?? "—"}
                        </div>
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {agentLabel}
                        </div>
                      </div>
                    </div>

                    {/* Run ID - hidden on small screens */}
                    <div className="hidden lg:block min-w-0 flex-1">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                        Run ID
                      </div>
                      <div className="text-xs font-mono text-slate-300 truncate">
                        {run.runId}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 ml-auto">
                      <div className="text-center min-w-[50px]">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                          Reward
                        </div>
                        <div className={`text-sm font-bold ${rewardValue > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                          {rewardPercent}
                        </div>
                      </div>
                      <div className="text-center min-w-[44px]">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                          Tasks
                        </div>
                        <div className={`text-sm font-bold ${completedTasks > 0 ? "text-amber-400" : "text-slate-500"}`}>
                          {completedTasks}/{totalTasks}
                        </div>
                      </div>
                      <div className="hidden sm:block text-right min-w-[70px]">
                        <div className="text-[10px] text-slate-400">
                          {new Date(run.startTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(run.startTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
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
