"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Title, Text, Button, Input } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { websitesData } from "@/data/websites-data";
import { useCaseCatalogues } from "@/data/sample-data";
import { CiCircleCheck } from "react-icons/ci";
import { GoXCircle } from "react-icons/go";
import { PiFlask, PiCaretDownDuotone } from "react-icons/pi";
import cn from "@core/utils/class-names";

type TestResult = {
  project: string;
  useCase: string;
  success: boolean;
  score: number;
  duration: number;
};

export default function TestAgent() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [numRuns, setNumRuns] = useState<number>(1);
  const [agentEndpoint, setAgentEndpoint] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const [isUseCasesDropdownOpen, setIsUseCasesDropdownOpen] = useState(false);
  const [projectsButtonRect, setProjectsButtonRect] = useState<DOMRect | null>(
    null
  );
  const [useCasesButtonRect, setUseCasesButtonRect] = useState<DOMRect | null>(
    null
  );

  const projectsButtonRef = useRef<HTMLButtonElement>(null);
  const useCasesButtonRef = useRef<HTMLButtonElement>(null);

  const availableProjects = websitesData
    .filter((w) => !w.isComingSoon)
    .map((w) => ({ value: w.name.toLowerCase(), label: w.name }));

  const getAvailableUseCases = () => {
    if (selectedProjects.length === 0) return [];

    const allUseCases: { value: string; label: string }[] = [];
    selectedProjects.forEach((project) => {
      const key =
        project === "autozone"
          ? "autozone"
          : project === "autobooks"
            ? "books"
            : project === "autocinema"
              ? "cinema"
              : "autozone";

      const cases = useCaseCatalogues[key] || [];
      cases.forEach((uc) => {
        if (!allUseCases.find((existing) => existing.value === uc.name)) {
          allUseCases.push({ value: uc.name, label: uc.name });
        }
      });
    });

    return allUseCases;
  };

  // Close dropdowns when clicking outside and update positions on scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isProjectsDropdownOpen &&
        projectsButtonRef.current &&
        !projectsButtonRef.current.contains(target) &&
        !document.querySelector('[data-dropdown="projects"]')?.contains(target)
      ) {
        setIsProjectsDropdownOpen(false);
      }

      if (
        isUseCasesDropdownOpen &&
        useCasesButtonRef.current &&
        !useCasesButtonRef.current.contains(target) &&
        !document.querySelector('[data-dropdown="usecases"]')?.contains(target)
      ) {
        setIsUseCasesDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (isProjectsDropdownOpen && projectsButtonRef.current) {
        setProjectsButtonRect(
          projectsButtonRef.current.getBoundingClientRect()
        );
      }

      if (isUseCasesDropdownOpen && useCasesButtonRef.current) {
        setUseCasesButtonRect(
          useCasesButtonRef.current.getBoundingClientRect()
        );
      }
    };

    const handleResize = () => {
      if (isProjectsDropdownOpen && projectsButtonRef.current) {
        setProjectsButtonRect(
          projectsButtonRef.current.getBoundingClientRect()
        );
      }

      if (isUseCasesDropdownOpen && useCasesButtonRef.current) {
        setUseCasesButtonRect(
          useCasesButtonRef.current.getBoundingClientRect()
        );
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isProjectsDropdownOpen, isUseCasesDropdownOpen]);

  const handleRunBenchmark = async () => {
    if (
      selectedProjects.length === 0 ||
      selectedUseCases.length === 0 ||
      !agentEndpoint
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Parse IP and port from endpoint
    let ip = "";
    let port = 0;

    try {
      const endpoint = agentEndpoint.trim();
      // Handle format: http://ip:port or ip:port
      const cleanEndpoint = endpoint.replace(/^https?:\/\//, "");
      const parts = cleanEndpoint.split(":");

      if (parts.length !== 2) {
        alert("Invalid endpoint format. Use format: ip:port or http://ip:port");
        return;
      }

      ip = parts[0];
      port = parseInt(parts[1]);

      if (isNaN(port) || port <= 0 || port > 65535) {
        alert("Invalid port number");
        return;
      }
    } catch (error) {
      alert("Failed to parse endpoint");
      return;
    }

    setIsRunning(true);
    setShowResults(false);

    try {
      const payload = {
        ip: ip,
        port: port,
        projects: selectedProjects,
        num_use_cases: selectedUseCases.length,
        use_cases: selectedUseCases.map((uc) =>
          uc.toUpperCase().replace(/\s+/g, "_")
        ),
        runs: numRuns,
        timeout: 120,
        id: Date.now().toString(),
        name: "TestAgent",
        should_record_gif: false,
        save_results_json: false,
        plot_results: false,
      };

      const response = await fetch(
        "http://84.247.180.192:5050/test-your-agent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to our TestResult format
      const transformedResults: TestResult[] = [];

      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result: any) => {
          transformedResults.push({
            project: result.project || result.website || "Unknown",
            useCase: result.use_case || result.useCase || "Unknown",
            success: result.success === true || result.status === "success",
            score: result.score || (result.success ? 100 : 0),
            duration: result.duration || result.time || 0,
          });
        });
      } else {
        // If API doesn't return expected format, create results from selected items
        selectedProjects.forEach((project) => {
          selectedUseCases.forEach((useCase) => {
            for (let i = 0; i < numRuns; i++) {
              transformedResults.push({
                project: project,
                useCase: useCase,
                success: data.success === true,
                score: data.score || 0,
                duration: data.duration || 0,
              });
            }
          });
        });
      }

      setResults(transformedResults);
      setShowResults(true);
    } catch (error) {
      console.error("Benchmark error:", error);
      alert(
        `Failed to run benchmark: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const calculateAggregateScore = () => {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    return (totalScore / results.length).toFixed(2);
  };

  const calculateSuccessRate = () => {
    if (results.length === 0) return 0;
    const successCount = results.filter((r) => r.success).length;
    return ((successCount / results.length) * 100).toFixed(1);
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "benchmark-results.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex flex-col w-full px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto">
      <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-3xl p-6 sm:p-12 mb-12 backdrop-blur-sm transition-all duration-300 shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <PiFlask className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div> */}
            <Title
              as="h1"
              className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Benchmark Your Agent
            </Title>
          </div>
          <Text className="text-base sm:text-lg md:text-xl text-cyan-500 max-w-4xl mx-auto leading-relaxed">
            Configure a custom benchmark run against{" "}
            <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">
              IWA&apos;s
            </span>{" "}
            synthetic websites. Select projects, choose specific use cases,
            define the number of runs, and provide your agent&apos;s endpoint.
          </Text>
        </div>
      </div>

      <div className="group relative mb-12 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400/50 transition-all duration-500 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg">
              <PiFlask className="w-6 h-6 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              Configuration
            </Title>
          </div>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]">
                Select Web Projects <span className="text-yellow-400">*</span>
              </label>
              <button
                type="button"
                ref={projectsButtonRef}
                onClick={() => {
                  if (projectsButtonRef.current) {
                    setProjectsButtonRect(
                      projectsButtonRef.current.getBoundingClientRect()
                    );
                  }
                  setIsProjectsDropdownOpen(!isProjectsDropdownOpen);
                }}
                className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-cyan-300 font-mono focus:border-cyan-400 focus:shadow-2xl focus:shadow-cyan-500/50 transition-all duration-300 outline-none hover:border-cyan-400/50 text-left flex items-center justify-between"
              >
                <span>
                  {selectedProjects.length === 0
                    ? "Select projects..."
                    : `${selectedProjects.length} project${selectedProjects.length > 1 ? "s" : ""} selected`}
                </span>
                <PiCaretDownDuotone
                  className={`w-5 h-5 text-cyan-400 transition-transform duration-200 ${isProjectsDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProjectsDropdownOpen &&
                projectsButtonRect &&
                createPortal(
                  <div
                    data-dropdown="projects"
                    className="fixed bg-black border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/30 z-[9999] max-h-60 overflow-y-auto custom-scrollbar scroll-smooth"
                    style={{
                      top: projectsButtonRect.bottom + 4,
                      left: projectsButtonRect.left,
                      width: projectsButtonRect.width,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {availableProjects.map((project) => (
                      <button
                        key={project.value}
                        type="button"
                        onClick={() => {
                          if (!selectedProjects.includes(project.value)) {
                            setSelectedProjects([
                              ...selectedProjects,
                              project.value,
                            ]);
                          }
                          setIsProjectsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-cyan-300 font-mono hover:bg-cyan-900/30 hover:text-cyan-200 transition-colors duration-200 border-b border-cyan-400/20 last:border-b-0"
                      >
                        {project.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}

              {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {selectedProjects.map((project) => (
                    <span
                      key={project}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                        "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50",
                        "hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
                      )}
                    >
                      {project}
                      <button
                        onClick={() =>
                          setSelectedProjects(
                            selectedProjects.filter((p) => p !== project)
                          )
                        }
                        className="hover:text-red-400 transition-colors text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]">
                Select Use Cases <span className="text-yellow-400">*</span>
              </label>
              <button
                type="button"
                ref={useCasesButtonRef}
                onClick={() => {
                  if (selectedProjects.length === 0) return;
                  if (useCasesButtonRef.current) {
                    setUseCasesButtonRect(
                      useCasesButtonRef.current.getBoundingClientRect()
                    );
                  }
                  setIsUseCasesDropdownOpen(!isUseCasesDropdownOpen);
                }}
                disabled={selectedProjects.length === 0}
                className={cn(
                  "w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-cyan-300 font-mono focus:border-cyan-400 focus:shadow-2xl focus:shadow-cyan-500/50 transition-all duration-300 outline-none hover:border-cyan-400/50 text-left flex items-center justify-between",
                  selectedProjects.length === 0 &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <span>
                  {selectedUseCases.length === 0
                    ? "Select use cases..."
                    : `${selectedUseCases.length} use case${selectedUseCases.length > 1 ? "s" : ""} selected`}
                </span>
                <PiCaretDownDuotone
                  className={`w-5 h-5 text-cyan-400 transition-transform duration-200 ${isUseCasesDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isUseCasesDropdownOpen &&
                useCasesButtonRect &&
                createPortal(
                  <div
                    data-dropdown="usecases"
                    className="fixed bg-black border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/30 z-[9999] max-h-60 overflow-y-auto custom-scrollbar scroll-smooth"
                    style={{
                      top: useCasesButtonRect.bottom + 4,
                      left: useCasesButtonRect.left,
                      width: useCasesButtonRect.width,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getAvailableUseCases().map((useCase) => (
                      <button
                        key={useCase.value}
                        type="button"
                        onClick={() => {
                          if (!selectedUseCases.includes(useCase.value)) {
                            setSelectedUseCases([
                              ...selectedUseCases,
                              useCase.value,
                            ]);
                          }
                          setIsUseCasesDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-cyan-300 font-mono hover:bg-cyan-900/30 hover:text-cyan-200 transition-colors duration-200 border-b border-cyan-400/20 last:border-b-0"
                      >
                        {useCase.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}

              {selectedUseCases.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {selectedUseCases.map((useCase) => (
                    <span
                      key={useCase}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                        "bg-yellow-600/20 text-yellow-400 border border-yellow-500/50",
                        "hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30"
                      )}
                    >
                      {useCase}
                      <button
                        onClick={() =>
                          setSelectedUseCases(
                            selectedUseCases.filter((uc) => uc !== useCase)
                          )
                        }
                        className="hover:text-red-400 transition-colors text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]">
                  Number of Runs <span className="text-yellow-400">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={numRuns}
                  onChange={(e) => setNumRuns(parseInt(e.target.value) || 1)}
                  placeholder="Enter number of runs (1-10)"
                  className="border-cyan-500/30 focus:border-cyan-400 bg-black/50 text-cyan-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]">
                  Agent Endpoint (IP:Port){" "}
                  <span className="text-yellow-400">*</span>
                </label>
                <Input
                  type="text"
                  value={agentEndpoint}
                  onChange={(e) => setAgentEndpoint(e.target.value)}
                  placeholder="84.247.180.192:6789 or http://84.247.180.192:6789"
                  className="border-cyan-500/30 focus:border-cyan-400 bg-black/50 text-cyan-300 px-4 py-3"
                />
                <Text className="text-xs text-gray-400 mt-2">
                  {`Enter your agent's IP address and port (e.g.,
                  84.247.180.192:6789)`}
                </Text>
              </div>
            </div>

            <div className="pt-4 border-t border-cyan-400/20">
              <Button
                size="xl"
                onClick={handleRunBenchmark}
                disabled={isRunning}
                className={cn(
                  "w-full font-bold py-4 text-lg transition-all duration-300 shadow-lg hover:shadow-2xl border-2",
                  "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 text-white hover:to-blue-600 border-cyan-400 hover:scale-[1.02]",
                  isRunning && "opacity-50 cursor-not-allowed hover:scale-100"
                )}
              >
                <PiFlask className="mr-2 inline text-xl" />
                {isRunning ? "Running Benchmark..." : "Run Benchmark"}
              </Button>
            </div>
          </div>
        </div>

        {showResults && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="relative text-center p-6 rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 backdrop-blur-sm group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                <div className="relative">
                  <Text className="text-sm text-cyan-300 mb-2 uppercase tracking-wide font-bold">
                    Success Rate
                  </Text>
                  <Title
                    as="h3"
                    className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    {calculateSuccessRate()}%
                  </Title>
                </div>
              </div>
              <div className="relative text-center p-6 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/30 backdrop-blur-sm group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                <div className="relative">
                  <Text className="text-sm text-yellow-300 mb-2 uppercase tracking-wide font-bold">
                    Average Score
                  </Text>
                  <Title
                    as="h3"
                    className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                  >
                    {calculateAggregateScore()}
                  </Title>
                </div>
              </div>
              <div className="relative text-center p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 backdrop-blur-sm group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                <div className="relative">
                  <Text className="text-sm text-purple-300 mb-2 uppercase tracking-wide font-bold">
                    Total Tests
                  </Text>
                  <Title
                    as="h3"
                    className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
                  >
                    {results.length}
                  </Title>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "relative mb-8 p-6 sm:p-8 rounded-lg bg-black overflow-hidden",
                "border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5",
                "hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/50"
              )}
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <Title
                  as="h2"
                  className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]"
                >
                  Detailed Results
                </Title>
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  className={cn(
                    "border-2 border-yellow-500/50 text-yellow-300 hover:text-white font-semibold",
                    "hover:border-yellow-400 hover:bg-yellow-500/20 transition-all duration-300",
                    "hover:shadow-lg hover:shadow-yellow-500/30"
                  )}
                >
                  Download Results (JSON)
                </Button>
              </div>
              <div className="relative overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-cyan-500/30">
                      <th className="text-left py-3 px-4 text-cyan-400 font-semibold font-mono drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 text-cyan-400 font-semibold font-mono drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                        Use Case
                      </th>
                      <th className="text-center py-3 px-4 text-cyan-400 font-semibold font-mono drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 text-cyan-400 font-semibold font-mono drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 text-cyan-400 font-semibold font-mono drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        className={cn(
                          "border-b border-cyan-500/20 hover:bg-cyan-500/10",
                          "transition-all duration-300"
                        )}
                      >
                        <td className="py-3 px-4 capitalize text-cyan-300 font-mono">
                          {result.project}
                        </td>
                        <td className="py-3 px-4 text-cyan-300 font-mono">
                          {result.useCase}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {result.success ? (
                            <CiCircleCheck className="inline h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]" />
                          ) : (
                            <GoXCircle className="inline h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-yellow-400 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                          {result.score}
                        </td>
                        <td className="py-3 px-4 text-center text-cyan-300 font-mono">
                          {result.duration.toFixed(2)}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
