"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { agentRunData } from "@/data/agent-run-data";
import { validatorsData, validatorsDataMap } from "@/data/validators-data";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
  PiInfoDuotone,
} from "react-icons/pi";

export default function AgentRunSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roundInput, setRoundInput] = useState<string>("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [agentInput, setAgentInput] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isValidatorDropdownOpen, setIsValidatorDropdownOpen] = useState(false);

  const validatorDropdownRef = useRef<HTMLDivElement>(null);

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

  // Filter agent runs based on search criteria
  const filteredRuns = useMemo(() => {
    return agentRunData.filter((run) => {
      const matchesSearch =
        searchTerm === "" ||
        run.runUid.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRound =
        roundInput === "" || run.round.toString().includes(roundInput);
      const matchesValidator =
        selectedValidator === "" || run.validatorId === selectedValidator;
      const matchesAgent =
        agentInput === "" ||
        run.agentUid.toString().includes(agentInput) ||
        run.runUid.toLowerCase().includes(agentInput.toLowerCase());

      return matchesSearch && matchesRound && matchesValidator && matchesAgent;
    });
  }, [searchTerm, roundInput, selectedValidator, agentInput]);

  const handleSearch = () => {
    setHasSearched(true);
    const results = filteredRuns.slice(0, 12); // Get recent 12 items
    setSearchResults(results);

    if (results.length === 1) {
      router.push(`/agent-run/${results[0].runUid}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoundInput("");
    setSelectedValidator("");
    setAgentInput("");
    setHasSearched(false);
    setSearchResults([]);
    setIsValidatorDropdownOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || roundInput !== "" || selectedValidator !== "" || agentInput !== "";

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
                placeholder="Enter Run UID (e.g., m4v1-6w9x)"
                maxLength={9}
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
                        : validatorsData.find((v) => v.id === selectedValidator)
                            ?.name || selectedValidator}
                    </span>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${isValidatorDropdownOpen ? "rotate-180" : ""}`}
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
                      {validatorsData.map((validator) => (
                        <button
                          key={validator.id}
                          type="button"
                          onClick={() => {
                            setSelectedValidator(validator.id);
                            setIsValidatorDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-200 border-b border-blue-500/20 last:border-b-0"
                        >
                          {validator.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Filter - Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">
                  AGENT
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Enter Agent UID or Hotkey"
                    className="w-full px-3 py-2 bg-purple-500/20 border-2 border-purple-500/20 rounded-xl text-purple-300 text-sm focus:border-purple-500 transition-all duration-300 outline-none placeholder-gray-400 backdrop-blur-md focus:ring-0"
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
                Enter a Run UID or use filters to find agent runs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && searchResults.length > 0 && (
        <div className="mt-6 relative z-0">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
              RECENT {searchResults.length} RESULTS
            </h3>
            <p className="text-purple-200 text-sm">
              Showing recent agent runs matching your criteria
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchResults.map((run) => {
              const validator = validatorsDataMap[run.validatorId];
              return (
                <div
                  key={run.runUid}
                  onClick={() => router.push(`/agent-run/${run.runUid}`)}
                  className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-300 shadow-lg group backdrop-blur-md cursor-pointer hover:shadow-2xl hover:scale-105"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg mb-3 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
                      <PiPlayDuotone className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-sm font-bold text-white mb-2">
                      RUN UID: {run.runUid}
                    </div>
                    <div className="text-xs text-purple-200">
                      Round {run.round} • {validator?.name || run.validatorId} • Agent {run.agentUid}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && searchResults.length === 0 && (
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
