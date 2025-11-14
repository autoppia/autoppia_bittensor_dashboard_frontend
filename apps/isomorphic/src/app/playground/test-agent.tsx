"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Title, Text, Button, Input } from "rizzui";
// import WidgetCard from "@core/components/cards/widget-card";
import toast from "react-hot-toast";
import { websitesData } from "@/data/websites-data";
import { useCaseCatalogues } from "@/data/sample-data";
import { CiCircleCheck } from "react-icons/ci";
import { GoXCircle } from "react-icons/go";
import {
  PiFlask,
  PiCaretDownDuotone,
  PiXBold,
  PiDownloadDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiSparkle,
} from "react-icons/pi";
import cn from "@core/utils/class-names";
import { playgroundRepository } from "@/repositories/playground/playground.repository";
import type { RunAgentBenchmarkPayload } from "@/repositories/playground/playground.types";

type TestResult = {
  project: string;
  useCase: string;
  success: boolean;
  score: number;
  duration: number;
  prompt?: string;
  actions?: any[];
  gif?: string | null;
};
export default function TestAgent() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [numRuns, setNumRuns] = useState<number>(1);
  const [agentEndpoint, setAgentEndpoint] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
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
    .map((w) => ({ value: w.slug.toLowerCase(), label: w.name }));

  const getAvailableUseCases = () => {
    if (selectedProjects.length === 0) return [];

    const allUseCases: { value: string; label: string }[] = [];
    selectedProjects.forEach((project) => {
      const key = project;

      // Prefer catalogue from sample-data if available
      const cases = useCaseCatalogues[key];
      if (Array.isArray(cases) && cases.length > 0) {
        cases.forEach((uc) => {
          if (!allUseCases.find((existing) => existing.value === uc.name)) {
            allUseCases.push({ value: uc.name, label: uc.name });
          }
        });
      } else {
        // Fallback: try to find use cases in websitesData (websites-data.ts)
        const website = websitesData.find(
          (w) => w.slug.toLowerCase() === key.toLowerCase()
        );
        if (website && Array.isArray(website.useCases)) {
          website.useCases.forEach((uc) => {
            const name =
              typeof uc.name === "string" ? uc.name : String(uc.name);
            if (!allUseCases.find((existing) => existing.value === name)) {
              allUseCases.push({ value: name, label: name });
            }
          });
        }
      }
    });

    return allUseCases;
  };

  // Return use cases grouped by project (keep project label from availableProjects)
  const getAvailableUseCasesByProject = () => {
    if (selectedProjects.length === 0) return [];

    return selectedProjects.map((project) => {
      const key = project;
      // find label for project (e.g., AutoCinema)
      const proj = availableProjects.find((p) => p.value === key);
      const projectLabel = proj ? proj.label : project;

      const casesArr: { value: string; label: string }[] = [];

      const cases = useCaseCatalogues[key];
      if (Array.isArray(cases) && cases.length > 0) {
        cases.forEach((uc) => {
          if (!casesArr.find((existing) => existing.value === uc.name)) {
            casesArr.push({ value: uc.name, label: uc.name });
          }
        });
      } else {
        const website = websitesData.find(
          (w) => w.slug.toLowerCase() === key.toLowerCase()
        );
        if (website && Array.isArray(website.useCases)) {
          website.useCases.forEach((uc) => {
            const name =
              typeof uc.name === "string" ? uc.name : String(uc.name);
            if (!casesArr.find((existing) => existing.value === name)) {
              casesArr.push({ value: name, label: name });
            }
          });
        }
      }

      return { project: key, label: projectLabel, cases: casesArr };
    });
  };

  const formatUseCaseLabel = (raw?: string) => {
    if (!raw) return "";
    return raw
      .toString()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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
      toast.error("Please fill in all fields");
      return;
    }

    // Parse IP and port from input like: 127.0.0.1:5000 or http://127.0.0.1:5000
    let ip = "";
    let port = 0;

    try {
      const endpoint = agentEndpoint.trim();
      const clean = endpoint.replace(/^https?:\/\//, "");
      const parts = clean.split(":");
      if (parts.length !== 2) throw new Error("Invalid endpoint");
      ip = parts[0];
      port = parseInt(parts[1], 10);
      if (!ip || isNaN(port) || port < 1 || port > 65535) {
        throw new Error("Invalid endpoint");
      }
    } catch {
      toast.error("Invalid endpoint format. Use: ip:port or http://ip:port");
      return;
    }

    setIsRunning(true);

    try {
      // ✅ payload exactly like your curl (but built from UI)
      const payload: RunAgentBenchmarkPayload = {
        ip, // "<your_public_ip_or_ngrok>"
        port, // e.g., 5000
        projects: selectedProjects, // e.g., ["autobooks"]
        // projects: ["autobooks"],
        num_use_cases: selectedUseCases.length,
        use_cases: selectedUseCases.map((uc) =>
          uc.toUpperCase().replace(/\s+/g, "_")
        ), // e.g., ["LOGIN_BOOK"]
        runs: numRuns, // e.g., 1
        timeout: 120,
        should_record_gif: false,
      };

      const data = await playgroundRepository.runAgentBenchmark(payload);
      setApiResponse(data);

      // Parse the nested structure: Project -> AgentRun -> use_cases -> UseCase -> TaskId -> details
      const parsedResults: any[] = [];

      Object.keys(data).forEach((projectName) => {
        const projectData = data[projectName];

        Object.keys(projectData).forEach((agentRunId) => {
          const runData = projectData[agentRunId];

          if (runData.use_cases) {
            Object.keys(runData.use_cases).forEach((useCaseName) => {
              const useCaseData = runData.use_cases[useCaseName];

              // Get all task IDs for this use case
              const taskIds = Object.keys(useCaseData);

              taskIds.forEach((taskId) => {
                const taskData = useCaseData[taskId];

                parsedResults.push({
                  project: projectName,
                  useCase: useCaseName,
                  success: taskData.success > 0,
                  score: Math.round(taskData.success * 100),
                  duration: taskData.time || 0,
                  prompt: taskData.prompt || "",
                  actions: taskData.actions || [],
                  gif: taskData.base64_gif || null,
                });
              });
            });
          }
        });
      });

      setResults(parsedResults);
      setShowResults(true);

      toast.success(
        <Text as="b" className="font-semibold">
          Benchmark completed! {parsedResults.length} test(s) executed.
        </Text>
      );
    } catch (err) {
      toast.error(
        `Failed to call benchmark API: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
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
                  {selectedProjects.map((project) => {
                    const proj = availableProjects.find(
                      (p) => p.value === project
                    );
                    const displayLabel = proj ? proj.label : project;

                    return (
                      <span
                        key={project}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                          "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50",
                          "hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
                        )}
                      >
                        {displayLabel}
                        <button
                          onClick={() => {
                            if (selectedProjects.length === 1) {
                              setSelectedUseCases([]);
                            }
                            setSelectedProjects(
                              selectedProjects.filter((p) => p !== project)
                            );
                          }}
                          className="hover:text-red-400 transition-colors text-lg"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
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
                    {getAvailableUseCasesByProject().map((group) => (
                      <div
                        key={group.project}
                        className="border-b border-cyan-400/10 last:border-b-0"
                      >
                        <div className="flex items-center justify-between px-3 py-2 bg-cyan-900/5">
                          <div className="text-cyan-200 font-bold text-sm">
                            {group.label}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              // select all use cases for this project
                              const allValues = group.cases.map((c) => c.value);
                              const next = Array.from(
                                new Set([...selectedUseCases, ...allValues])
                              );
                              setSelectedUseCases(next);
                              setIsUseCasesDropdownOpen(false);
                            }}
                            className="text-xs text-cyan-300 underline"
                          >
                            Select all
                          </button>
                        </div>

                        {group.cases.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-400">
                            No use cases
                          </div>
                        ) : (
                          group.cases.map((useCase) => (
                            <button
                              key={`${group.project}-${useCase.value}`}
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
                              className="w-full px-3 py-2 text-left text-cyan-300 font-mono hover:bg-cyan-900/30 hover:text-cyan-200 transition-colors duration-200 border-t border-cyan-400/20 last:border-b-0"
                            >
                              {formatUseCaseLabel(useCase.label)}
                            </button>
                          ))
                        )}
                      </div>
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
                      {formatUseCaseLabel(useCase)}
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
                  className="border-cyan-500/30 focus:border-cyan-400 bg-black/50 rounded-2xl text-cyan-300 px-4 py-3"
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
                  placeholder="127.0.0.1:5000 or http://127.0.0.1:5000"
                  className="border-cyan-500/30 focus:border-cyan-400 bg-black/50 rounded-2xl text-cyan-300 px-4 py-3"
                />
                <Text className="text-xs text-gray-400 mt-2">
                  {`Enter your agent's IP address and port (e.g., 127.0.0.1:5000)`}
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

        {showResults &&
          createPortal(
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in">
              <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl shadow-2xl animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

                {/* Modal Header */}
                <div className="relative flex items-center justify-between p-6 sm:p-8 border-b border-cyan-400/30">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
                      <PiSparkle className="h-6 w-6 text-white" />
                    </div>
                    <Title
                      as="h2"
                      className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent"
                    >
                      Benchmark Results
                    </Title>
                  </div>
                  <button
                    onClick={() => setShowResults(false)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300 group"
                  >
                    <PiXBold className="h-6 w-6 text-gray-400 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="relative overflow-y-auto max-h-[calc(90vh-180px)] p-6 sm:p-8">
                  {/* Stats Grid */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="relative text-center p-6 rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 backdrop-blur-sm group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                      <div className="relative">
                        <Text className="text-sm text-cyan-300 mb-2 uppercase tracking-wide font-bold">
                          Success Rate
                        </Text>
                        <Title
                          as="h3"
                          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
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
                          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
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
                          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
                        >
                          {results.length}
                        </Title>
                      </div>
                    </div>
                  </div> */}

                  {/* API Response */}
                  {apiResponse && (
                    <div className="mb-6 relative rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 overflow-hidden">
                      <div className="p-3 bg-purple-500/10 border-b border-purple-400/30">
                        <Text className="text-sm font-bold text-purple-300">
                          API Response
                        </Text>
                      </div>
                      <pre className="p-4 text-xs text-cyan-200 overflow-x-auto max-h-80 scrollbar-thin">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Results Per Use Case */}
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl border-2 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 overflow-hidden"
                        style={{
                          borderColor: result.success
                            ? "rgba(6,182,212,0.3)"
                            : "rgba(239,68,68,0.3)",
                        }}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                result.success
                                  ? "bg-gradient-to-br from-cyan-400 to-blue-500"
                                  : "bg-gradient-to-br from-red-400 to-orange-500"
                              )}
                            >
                              {result.success ? (
                                <PiCheckCircleDuotone className="h-5 w-5 text-white" />
                              ) : (
                                <PiXCircleDuotone className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Text className="font-bold text-white capitalize">
                                {result.project} - {result.useCase}
                              </Text>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-cyan-300 font-bold">
                                Prompt:
                              </span>{" "}
                              <span className="text-cyan-700">
                                {result.prompt || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-cyan-300 font-bold">
                                Success:
                              </span>{" "}
                              <span
                                className={
                                  result.success
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {result.success ? "True" : "False"}
                              </span>
                            </div>
                            <div>
                              <span className="text-cyan-300 font-bold">
                                Time:
                              </span>{" "}
                              <span className="text-yellow-300">
                                {result.duration.toFixed(2)}s
                              </span>
                            </div>
                            <div className="pt-2 border-t border-cyan-500/20">
                              <div className="text-cyan-300 font-bold mb-2">
                                Actions:
                              </div>
                              {result.actions && result.actions.length > 0 ? (
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {result.actions.map(
                                    (action: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="text-xs bg-cyan-500/10 border border-cyan-500/20 rounded p-2"
                                      >
                                        <div className="text-cyan-400 font-bold">
                                          {action.type}
                                        </div>
                                        {action.text && (
                                          <div className="text-gray-700 mt-1">
                                            Text: &quot;{action.text}&quot;
                                          </div>
                                        )}
                                        {action.url && (
                                          <div className="text-blue-400 mt-1 truncate">
                                            URL: {action.url}
                                          </div>
                                        )}
                                        {action.selector?.value && (
                                          <div className="text-gray-400 mt-1 text-xs truncate">
                                            Selector: {action.selector.value}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-600">
                                  No actions recorded
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-cyan-300 font-bold">
                                GIF:
                              </span>{" "}
                              <span className="text-gray-500 italic">
                                {result.gif ? "Available" : "Coming soon"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="relative flex flex-col sm:flex-row items-center justify-between px-4 py-2 gap-4 border-t border-cyan-400/30 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
                  <Text className="text-sm text-cyan-700">
                    Completed {results.length} test
                    {results.length !== 1 ? "s" : ""} • Success Rate:{" "}
                    {calculateSuccessRate()}%
                  </Text>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadResults}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500/60 to-orange-500/60 border-2 border-yellow-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-500 hover:scale-105 shadow-lg hover:shadow-yellow-500/30"
                    >
                      <PiDownloadDuotone className="h-5 w-5 group-hover:animate-bounce" />
                      DOWNLOAD
                    </button>
                    <button
                      onClick={() => setShowResults(false)}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600/60 to-gray-700/60 border-2 border-gray-600/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-gray-600 hover:to-gray-700 hover:border-gray-600 hover:scale-105"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
