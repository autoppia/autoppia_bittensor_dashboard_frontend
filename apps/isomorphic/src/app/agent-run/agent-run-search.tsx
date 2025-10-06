"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { agentRunData } from "@/data/agent-run-data";
import { validatorsData } from "@/data/validators-data";
import { roundsData } from "@/data/rounds-data";
import {
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiPlayDuotone,
  PiHashDuotone,
  PiRobotDuotone,
  PiCaretDownDuotone,
} from "react-icons/pi";

export default function AgentRunSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRound, setSelectedRound] = useState<number | "">("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [agentInput, setAgentInput] = useState<string>("");
  const [isRoundsDropdownOpen, setIsRoundsDropdownOpen] = useState(false);
  const [isValidatorDropdownOpen, setIsValidatorDropdownOpen] = useState(false);
  const [roundsButtonRect, setRoundsButtonRect] = useState<DOMRect | null>(
    null
  );
  const [validatorButtonRect, setValidatorButtonRect] =
    useState<DOMRect | null>(null);

  const roundsDropdownRef = useRef<HTMLDivElement>(null);
  const validatorDropdownRef = useRef<HTMLDivElement>(null);
  const roundsButtonRef = useRef<HTMLButtonElement>(null);
  const validatorButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns when clicking outside and update positions on scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside rounds dropdown
      if (
        isRoundsDropdownOpen &&
        roundsButtonRef.current &&
        !roundsButtonRef.current.contains(target) &&
        !document.querySelector('[data-dropdown="rounds"]')?.contains(target)
      ) {
        setIsRoundsDropdownOpen(false);
      }

      // Check if click is outside validator dropdown
      if (
        isValidatorDropdownOpen &&
        validatorButtonRef.current &&
        !validatorButtonRef.current.contains(target) &&
        !document.querySelector('[data-dropdown="validator"]')?.contains(target)
      ) {
        setIsValidatorDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      // Update rounds dropdown position
      if (isRoundsDropdownOpen && roundsButtonRef.current) {
        setRoundsButtonRect(roundsButtonRef.current.getBoundingClientRect());
      }

      // Update validator dropdown position
      if (isValidatorDropdownOpen && validatorButtonRef.current) {
        setValidatorButtonRect(
          validatorButtonRef.current.getBoundingClientRect()
        );
      }
    };

    const handleResize = () => {
      // Update dropdown positions on window resize
      if (isRoundsDropdownOpen && roundsButtonRef.current) {
        setRoundsButtonRect(roundsButtonRef.current.getBoundingClientRect());
      }

      if (isValidatorDropdownOpen && validatorButtonRef.current) {
        setValidatorButtonRect(
          validatorButtonRef.current.getBoundingClientRect()
        );
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // Use capture to catch all scroll events
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isRoundsDropdownOpen, isValidatorDropdownOpen]);

  // Filter agent runs based on search criteria
  const filteredRuns = useMemo(() => {
    return agentRunData.filter((run) => {
      const matchesSearch =
        searchTerm === "" ||
        run.runUid.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRound = selectedRound === "" || run.round === selectedRound;
      const matchesValidator =
        selectedValidator === "" || run.validatorId === selectedValidator;
      const matchesAgent =
        agentInput === "" ||
        run.agentUid.toString().includes(agentInput) ||
        run.runUid.toLowerCase().includes(agentInput.toLowerCase());

      return matchesSearch && matchesRound && matchesValidator && matchesAgent;
    });
  }, [searchTerm, selectedRound, selectedValidator, agentInput]);

  const handleSearch = () => {
    if (filteredRuns.length === 1) {
      router.push(`/agent-run/${filteredRuns[0].runUid}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRound("");
    setSelectedValidator("");
    setAgentInput("");
    setIsRoundsDropdownOpen(false);
    setIsValidatorDropdownOpen(false);
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-20 xl:px-36 2xl:px-48 py-8">
      {/* Main Search Card */}
      <div className="group relative bg-black border border-cyan-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500">
        {/* Cyberpunk Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative p-6 overflow-visible">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-cyan-400 shadow-2xl shadow-cyan-500/80">
                <PiMagnifyingGlassDuotone className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,1)]" />
              </div>
              <h2 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,1)]">
                AGENT RUN SEARCH
              </h2>
            </div>
            <p className="text-cyan-300 font-mono text-sm drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
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
                className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-cyan-300 placeholder-cyan-500/70 font-mono focus:border-cyan-400 focus:shadow-2xl focus:shadow-cyan-500/50 transition-all duration-300 outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <PiHashDuotone className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]" />
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 overflow-visible">
            <div className="flex items-center gap-2 mb-4">
              <PiFunnelDuotone className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,1)]" />
              <h3 className="text-lg font-bold text-purple-400 drop-shadow-[0_0_12px_rgba(147,51,234,1)]">
                FILTERS
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
              {/* Round Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-300 font-mono drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
                  ROUND (Recent {Math.min(roundsData.length, 10)})
                </label>
                <div className="relative" ref={roundsDropdownRef}>
                  <button
                    type="button"
                    ref={roundsButtonRef}
                    onClick={() => {
                      if (roundsButtonRef.current) {
                        setRoundsButtonRect(
                          roundsButtonRef.current.getBoundingClientRect()
                        );
                      }
                      setIsRoundsDropdownOpen(!isRoundsDropdownOpen);
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-emerald-400/30 rounded-lg text-emerald-300 font-mono focus:border-emerald-400 focus:shadow-2xl focus:shadow-emerald-500/50 transition-all duration-300 outline-none hover:border-emerald-400/50 text-left flex items-center justify-between"
                  >
                    <span>
                      {selectedRound === ""
                        ? "All Rounds"
                        : `Round ${selectedRound}${roundsData.find((r) => r.id === selectedRound)?.current ? " (Current)" : ""}`}
                    </span>
                    <PiCaretDownDuotone
                      className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${isRoundsDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isRoundsDropdownOpen &&
                    roundsButtonRect &&
                    createPortal(
                      <div
                        data-dropdown="rounds"
                        className="fixed bg-black border border-emerald-400/30 rounded-lg shadow-2xl shadow-emerald-500/30 z-[9999] max-h-60 overflow-y-auto custom-scrollbar scroll-smooth"
                        style={{
                          top: roundsButtonRect.bottom + 4,
                          left: roundsButtonRect.left,
                          width: roundsButtonRect.width,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRound("");
                            setIsRoundsDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-emerald-300 font-mono hover:bg-emerald-900/30 hover:text-emerald-200 transition-colors duration-200 border-b border-emerald-400/20"
                        >
                          All Rounds
                        </button>
                        {roundsData
                          .slice(-10)
                          .reverse()
                          .map((round) => (
                            <button
                              key={round.id}
                              type="button"
                              onClick={() => {
                                setSelectedRound(round.id);
                                setIsRoundsDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left text-emerald-300 font-mono hover:bg-emerald-900/30 hover:text-emerald-200 transition-colors duration-200 border-b border-emerald-400/20 last:border-b-0"
                            >
                              Round {round.id}{" "}
                              {round.current ? "(Current)" : ""}
                            </button>
                          ))}
                      </div>,
                      document.body
                    )}
                </div>
              </div>

              {/* Validator Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]">
                  VALIDATOR ({validatorsData.length} available)
                </label>
                <div className="relative" ref={validatorDropdownRef}>
                  <button
                    type="button"
                    ref={validatorButtonRef}
                    onClick={() => {
                      if (validatorButtonRef.current) {
                        setValidatorButtonRect(
                          validatorButtonRef.current.getBoundingClientRect()
                        );
                      }
                      setIsValidatorDropdownOpen(!isValidatorDropdownOpen);
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-blue-400/30 rounded-lg text-blue-300 font-mono focus:border-blue-400 focus:shadow-2xl focus:shadow-blue-500/50 transition-all duration-300 outline-none hover:border-blue-400/50 text-left flex items-center justify-between"
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

                  {isValidatorDropdownOpen &&
                    validatorButtonRect &&
                    createPortal(
                      <div
                        data-dropdown="validator"
                        className="fixed bg-black border border-blue-400/30 rounded-lg shadow-2xl shadow-blue-500/30 z-[9999] max-h-60 overflow-y-auto custom-scrollbar scroll-smooth"
                        style={{
                          top: validatorButtonRect.bottom + 4,
                          left: validatorButtonRect.left,
                          width: validatorButtonRect.width,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedValidator("");
                            setIsValidatorDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-blue-300 font-mono hover:bg-blue-900/30 hover:text-blue-200 transition-colors duration-200 border-b border-blue-400/20"
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
                            className="w-full px-3 py-2 text-left text-blue-300 font-mono hover:bg-blue-900/30 hover:text-blue-200 transition-colors duration-200 border-b border-blue-400/20 last:border-b-0"
                          >
                            {validator.name}
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                </div>
              </div>

              {/* Agent Filter - Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-300 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                  AGENT (UID/Hotkey)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Enter Agent UID or Hotkey"
                    className="w-full px-3 py-2 bg-black/50 border border-yellow-400/30 rounded-lg text-yellow-300 font-mono focus:border-yellow-400 focus:shadow-2xl focus:shadow-yellow-500/50 transition-all duration-300 outline-none placeholder-yellow-500/70 focus:ring-0 focus:ring-offset-0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <PiRobotDuotone className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSearch}
              disabled={filteredRuns.length !== 1}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 rounded-lg text-cyan-300 font-mono font-bold hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              <PiPlayDuotone className="w-4 h-4" />
              {filteredRuns.length === 1
                ? "VIEW RUN"
                : `${filteredRuns.length} RESULTS`}
            </button>

            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-lg text-red-300 font-mono font-bold hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>

        {/* Cyberpunk Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      </div>

      {/* Search Status */}
      {filteredRuns.length > 0 && (
        <div className="mt-6 text-center">
          <div className="relative bg-black border border-purple-400/30 rounded-lg p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-purple-400 shadow-2xl shadow-purple-500/50 mx-auto mb-3">
                <PiPlayDuotone className="w-6 h-6 text-purple-400 drop-shadow-[0_0_10px_rgba(147,51,234,1)]" />
              </div>
              <h3 className="text-lg font-bold text-purple-400 drop-shadow-[0_0_12px_rgba(147,51,234,1)] mb-2">
                {filteredRuns.length === 1
                  ? "EXACT MATCH FOUND"
                  : `${filteredRuns.length} MATCHES FOUND`}
              </h3>
              <p className="text-purple-300 font-mono text-sm drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]">
                {filteredRuns.length === 1
                  ? "Click 'VIEW RUN' to navigate to the agent run details"
                  : "Use filters to narrow down to a single result for direct navigation"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredRuns.length === 0 &&
        (searchTerm || selectedRound || selectedValidator || agentInput) && (
          <div className="mt-6 text-center">
            <div className="relative bg-black border border-red-400/30 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 via-transparent to-orange-900/5"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-red-400 shadow-2xl shadow-red-500/50 mx-auto mb-3">
                  <PiMagnifyingGlassDuotone className="w-6 h-6 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,1)]" />
                </div>
                <h3 className="text-lg font-bold text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] mb-2">
                  NO RESULTS FOUND
                </h3>
                <p className="text-red-300 font-mono text-sm drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
