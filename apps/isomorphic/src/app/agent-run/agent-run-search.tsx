"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentRunsList } from "@/services/hooks/useAgentRun";
import {
  AgentRunData,
  AgentRunListItem,
  AgentRunsListQueryParams,
} from "@/services/api/types/agent-runs";
import { agentRunsService } from "@/services/api/agent-runs.service";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiInfoDuotone,
} from "react-icons/pi";

const DEFAULT_LIMIT = 200;

function formatValidatorLabel(validatorId: string) {
  if (!validatorId) {
    return "Unknown Validator";
  }

  const parts = validatorId.split("-");
  if (parts.length > 1) {
    return `Validator ${parts[parts.length - 1]}`;
  }

  return validatorId;
}

function formatAgentLabel(agentId: string) {
  if (!agentId) {
    return "Unknown Agent";
  }

  const parts = agentId.split("-");
  if (parts.length > 1) {
    return `Agent ${parts[parts.length - 1]}`;
  }

  return agentId;
}

function formatScore(score: number) {
  if (Number.isNaN(score)) {
    return "N/A";
  }
  return `${Math.round(score)}%`;
}

export default function AgentRunSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roundInput, setRoundInput] = useState<string>("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [agentInput, setAgentInput] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isValidatorDropdownOpen, setIsValidatorDropdownOpen] =
    useState(false);
  const [manualResults, setManualResults] = useState<AgentRunListItem[] | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const validatorDropdownRef = useRef<HTMLDivElement>(null);

  const [queryParams, setQueryParams] = useState<AgentRunsListQueryParams>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const {
    runs,
    isLoading,
    error,
    refetch,
  } = useAgentRunsList(queryParams);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        validatorDropdownRef.current &&
        !validatorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsValidatorDropdownOpen(false);
      }
    };

    if (isValidatorDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isValidatorDropdownOpen]);

  const validatorOptions = useMemo(() => {
    const values = new Set<string>();
    const sourceRuns = manualResults ?? runs;

    sourceRuns.forEach((run) => {
      if (run.validatorId) {
        values.add(run.validatorId);
      }
    });

    if (selectedValidator && !values.has(selectedValidator)) {
      values.add(selectedValidator);
    }

    return Array.from(values).sort();
  }, [runs, selectedValidator, manualResults]);

  const displayedRuns = useMemo(() => {
    const activeRuns = manualResults ?? runs;
    return [...activeRuns]
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, 12);
  }, [manualResults, runs]);

  const effectiveLoading =
    manualResults !== null ? manualLoading : manualLoading || isLoading;
  const effectiveError = manualError || error;

  const mapRunDetailToListItem = (run: AgentRunData): AgentRunListItem => {
    const totalTasks = run.totalTasks ?? run.tasks?.length ?? 0;
    const completedTasks = run.completedTasks ?? run.successfulTasks ?? 0;
    const successfulTasks = run.successfulTasks ?? completedTasks;
    const baseScore =
      typeof run.overallScore === "number"
        ? run.overallScore
        : typeof run.score === "number"
        ? run.score <= 1
          ? run.score * 100
          : run.score
        : 0;
    const successRate =
      totalTasks > 0
        ? Math.round((successfulTasks / totalTasks) * 100)
        : 0;

    return {
      runId: run.runId,
      agentId: run.agentId,
      roundId: run.roundId,
      validatorId: run.validatorId,
      validatorName: run.validatorName,
      validatorImage: run.validatorImage,
      status: run.status,
      startTime: run.startTime,
      endTime: run.endTime ?? null,
      totalTasks,
      completedTasks,
      averageScore: baseScore,
      successRate,
      overallScore: Math.round(baseScore),
      ranking: run.ranking ?? 0,
      duration: run.duration ?? 0,
    };
  };

  const handleSearch = async () => {
    setHasSearched(true);

    const hasRunId = searchTerm.trim().length > 0;
    const roundIdParam = roundInput.trim()
      ? Number(roundInput.trim())
      : undefined;
    const validatorIdParam = selectedValidator || undefined;
    const agentIdParam = agentInput.trim() || undefined;

    if (hasRunId) {
      setManualLoading(true);
      setManualError(null);
      try {
        const run = await agentRunsService.getAgentRun(searchTerm.trim());
        setManualResults([mapRunDetailToListItem(run)]);
      } catch (err: any) {
        setManualResults([]);
        setManualError(
          err?.message ||
            `Agent run '${searchTerm.trim()}' not found. Please verify the ID.`
        );
      } finally {
        setManualLoading(false);
      }
      return;
    }

    setManualResults(null);
    setManualError(null);
    setManualLoading(false);

    setQueryParams({
      page: 1,
      limit: DEFAULT_LIMIT,
      roundId: Number.isFinite(roundIdParam) ? roundIdParam : undefined,
      validatorId: validatorIdParam,
      agentId: agentIdParam,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoundInput("");
    setSelectedValidator("");
    setAgentInput("");
    setHasSearched(false);
    setIsValidatorDropdownOpen(false);
    setManualResults(null);
    setManualError(null);
    setManualLoading(false);
    setQueryParams({
      page: 1,
      limit: DEFAULT_LIMIT,
    });
    refetch();
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    roundInput !== "" ||
    selectedValidator !== "" ||
    agentInput !== "";

  const handleRetry = () => {
    if (manualResults !== null || searchTerm.trim()) {
      void handleSearch();
    } else {
      refetch();
    }
  };

  return (
    <div className="w-full max-w-[1024px] mx-auto h-full py-8">
      {/* Main Search Card */}
      <div className="group relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 backdrop-blur-md z-50">
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
                AGENT RUN SEARCH
              </h2>
            </div>
            <p className="text-cyan-300 text-sm">
              Search by Run UID or filter by Round, Validator, and Agent
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Run UID (e.g., round_020_42_005)"
                className="w-full px-4 py-3 bg-cyan-500/20 border-2 border-cyan-500/20 rounded-xl text-cyan-300 placeholder-gray-400 focus:border-cyan-500 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <PiHashDuotone className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 overflow-visible">
            <div className="flex items-center gap-2 mb-4">
              <PiFunnelDuotone className="w-5 h-5 text-purple-300" />
              <h3 className="text-sm font-medium text-purple-300">FILTERS</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
              {/* Round Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-300">
                  ROUND
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={roundInput}
                    onChange={(e) => setRoundInput(e.target.value)}
                    placeholder="Enter Round Number"
                    className="w-full px-3 py-2 bg-emerald-500/20 border-2 border-emerald-500/20 rounded-xl text-emerald-300 text-sm placeholder-gray-400 focus:border-emerald-500 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <PiHashDuotone className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Validator Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">
                  VALIDATOR
                </label>
                <div className="relative" ref={validatorDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsValidatorDropdownOpen(!isValidatorDropdownOpen);
                    }}
                    className="w-full px-3 py-2 bg-blue-500/20 border-2 border-blue-500/20 rounded-xl text-blue-300 focus:border-blue-500 transition-all duration-300 outline-none text-left flex items-center justify-between backdrop-blur-md focus:ring-0"
                  >
                    <span>
                      {selectedValidator === ""
                        ? "All Validators"
                        : formatValidatorLabel(selectedValidator)}
                    </span>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                        isValidatorDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isValidatorDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-blue-500/20 rounded-xl max-h-60 overflow-y-auto custom-scrollbar scroll-smooth backdrop-blur-md z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedValidator("");
                          setIsValidatorDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20"
                      >
                        All Validators
                      </button>
                      {validatorOptions.map((validatorId) => (
                        <button
                          key={validatorId}
                          type="button"
                          onClick={() => {
                            setSelectedValidator(validatorId);
                            setIsValidatorDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20 last:border-b-0"
                        >
                          {formatValidatorLabel(validatorId)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">
                  AGENT
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Enter Agent UID or Run UID"
                    className="w-full px-3 py-2 bg-purple-500/20 border-2 border-purple-500/20 rounded-xl text-purple-300 text-sm placeholder-gray-400 focus:border-purple-500 transition-all duration-300 outline-none backdrop-blur-md focus:ring-0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <PiRobotDuotone className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500/80 to-blue-500/80 border-2 border-emerald-500/60 rounded-xl font-bold text-white hover:from-emerald-500 hover:to-blue-500 hover:border-emerald-400 transition-all duration-300 shadow-lg flex items-center gap-2 backdrop-blur-md"
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

      {/* Error State */}
      {effectiveError && (
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
              <p className="text-red-200 text-sm mb-4">
                {effectiveError}
              </p>
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
      {effectiveLoading && (
        <div className="mt-6 text-center relative z-0">
          <div className="relative bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 border-2 border-blue-500/40 rounded-2xl p-6 shadow-lg backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10"></div>
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

      {/* Search Results */}
      {hasSearched && displayedRuns.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
              {displayedRuns.length} RESULTS
            </h3>
            <p className="text-purple-200 text-sm">
              Showing recent agent runs matching your criteria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedRuns.map((run) => (
              <div
                key={run.runId}
                onClick={() => router.push(`/agent-run/${run.runId}`)}
                className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-300 shadow-lg group backdrop-blur-md cursor-pointer hover:shadow-2xl hover:scale-105"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg mb-3 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
                    <PiPlayDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="text-sm font-bold text-white mb-2">
                    RUN ID: {run.runId}
                  </div>
                  <div className="text-xs text-purple-200 mb-3">
                    Round {run.roundId} • {formatValidatorLabel(run.validatorId)} •{" "}
                    {formatAgentLabel(run.agentId)}
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-xs text-purple-200">
                  <span>
                    Score:{" "}
                    <span className="text-purple-100">
                      {formatScore(run.overallScore)}
                    </span>
                  </span>
                  <span>
                    Tasks:{" "}
                    <span className="text-purple-100">
                      {run.totalTasks}
                    </span>
                  </span>
                  <span>
                    Rank:{" "}
                    <span className="text-purple-100">{run.ranking}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && displayedRuns.length === 0 && !effectiveError && !effectiveLoading && (
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
