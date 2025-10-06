"use client";

import { useState } from "react";
import { Title, Text, Button, Input, Select } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { websitesData } from "@/data/websites-data";
import { useCaseCatalogues } from "@/data/sample-data";
import { CiCircleCheck } from "react-icons/ci";
import { GoXCircle } from "react-icons/go";
import { PiFlask } from "react-icons/pi";
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

  const handleRunBenchmark = async () => {
    if (
      selectedProjects.length === 0 ||
      selectedUseCases.length === 0 ||
      !agentEndpoint
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsRunning(true);
    setShowResults(false);

    const mockResults: TestResult[] = [];
    for (let i = 0; i < numRuns; i++) {
      selectedProjects.forEach((project) => {
        selectedUseCases.forEach((useCase) => {
          mockResults.push({
            project: project,
            useCase: useCase,
            success: Math.random() > 0.3,
            score: Math.floor(Math.random() * 100),
            duration: Math.random() * 10 + 2,
          });
        });
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResults(mockResults);
    setShowResults(true);
    setIsRunning(false);
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
    <div className="flex flex-col w-full px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto">
      <div className="flex items-center gap-4 self-end mt-6 mb-8">
        <a
          href="https://github.com/autoppia"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400",
            "border-2 border-cyan-500/50 hover:border-cyan-400",
            "transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
          )}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </a>
      </div>

      <div className="mb-8 text-center">
        <Title as="h1" className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Benchmark Your Agent in Real Time
        </Title>
        <Text className="text-lg text-gray-300 max-w-4xl mx-auto">
          {`Configure a custom benchmark run against IWA's synthetic websites.
          Select projects, choose specific use cases and prompts, define the
          number of runs, and provide your agent's endpoint. `}<span className="text-yellow-400 font-semibold">IWA</span>{` will
          automatically evaluate its performance and return detailed scores.`}
        </Text>
      </div>

      <div className="mb-8 p-8 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/20">
        <Title as="h2" className="text-2xl font-bold mb-6 text-cyan-400">
          Configuration
        </Title>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Select Web Projects <span className="text-yellow-400">*</span>
            </label>
            <Select
              options={availableProjects}
              value={selectedProjects[0]}
              onChange={(value: any) => {
                if (!selectedProjects.includes(value.value)) {
                  setSelectedProjects([...selectedProjects, value.value]);
                }
              }}
              placeholder="Select projects..."
              className="border-cyan-500/30 focus:border-cyan-400"
            />
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedProjects.map((project) => (
                  <span
                    key={project}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
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
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Select Use Cases <span className="text-yellow-400">*</span>
            </label>
            <Select
              options={getAvailableUseCases()}
              value={selectedUseCases[0]}
              onChange={(value: any) => {
                if (!selectedUseCases.includes(value.value)) {
                  setSelectedUseCases([...selectedUseCases, value.value]);
                }
              }}
              placeholder="Select use cases..."
              disabled={selectedProjects.length === 0}
              className="border-cyan-500/30 focus:border-cyan-400"
            />
            {selectedUseCases.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedUseCases.map((useCase) => (
                  <span
                    key={useCase}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
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
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Number of Runs <span className="text-yellow-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={numRuns}
              onChange={(e) => setNumRuns(parseInt(e.target.value) || 1)}
              placeholder="Enter number of runs (1-10)"
              className="border-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Agent Endpoint (IP:Port) <span className="text-yellow-400">*</span>
            </label>
            <Input
              type="text"
              value={agentEndpoint}
              onChange={(e) => setAgentEndpoint(e.target.value)}
              placeholder="http://83.45.2.1:5005"
              className="border-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          <Button
            size="lg"
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className={cn(
              "w-full font-semibold",
              "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
              "shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300",
              "border border-cyan-400/50 hover:border-cyan-300 hover:scale-105",
              isRunning && "opacity-50 cursor-not-allowed"
            )}
          >
            <PiFlask className="mr-2 inline" />
            {isRunning ? "Running Benchmark..." : "Run Benchmark"}
          </Button>
        </div>
      </div>

      {showResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={cn(
              "text-center p-6 rounded-lg",
              "border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10",
              "hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/30"
            )}>
              <Text className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Success Rate</Text>
              <Title as="h3" className="text-4xl font-bold text-cyan-400">
                {calculateSuccessRate()}%
              </Title>
            </div>
            <div className={cn(
              "text-center p-6 rounded-lg",
              "border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
              "hover:border-yellow-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/30"
            )}>
              <Text className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Average Score</Text>
              <Title as="h3" className="text-4xl font-bold text-yellow-400">
                {calculateAggregateScore()}
              </Title>
            </div>
            <div className={cn(
              "text-center p-6 rounded-lg",
              "border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
              "hover:border-blue-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/30"
            )}>
              <Text className="text-sm text-gray-200 mb-2 uppercase tracking-wide font-semibold">Total Tests</Text>
              <Title as="h3" className="text-4xl font-bold text-blue-400">
                {results.length}
              </Title>
            </div>
          </div>

          <div className={cn(
            "mb-8 p-6 rounded-lg",
            "border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5",
            "hover:border-cyan-400/50 transition-all duration-500"
          )}>
            <div className="flex items-center justify-between mb-6">
              <Title as="h2" className="text-2xl font-bold text-cyan-400">
                Detailed Results
              </Title>
              <Button 
                onClick={downloadResults} 
                variant="outline"
                className={cn(
                  "border-2 border-yellow-500/50 text-yellow-400 hover:text-yellow-300",
                  "hover:border-yellow-400 hover:bg-yellow-500/10 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-yellow-500/30"
                )}
              >
                Download Results (JSON)
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cyan-500/30">
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Project</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Use Case</th>
                    <th className="text-center py-3 px-4 text-cyan-400 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 text-cyan-400 font-semibold">Score</th>
                    <th className="text-center py-3 px-4 text-cyan-400 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b border-cyan-500/20 hover:bg-cyan-500/5",
                        "transition-all duration-300"
                      )}
                    >
                      <td className="py-3 px-4 capitalize text-gray-300">{result.project}</td>
                      <td className="py-3 px-4 text-gray-300">{result.useCase}</td>
                      <td className="py-3 px-4 text-center">
                        {result.success ? (
                          <CiCircleCheck className="inline h-6 w-6 text-cyan-400" />
                        ) : (
                          <GoXCircle className="inline h-6 w-6 text-red-400" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-yellow-400">
                        {result.score}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-400">
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
  );
}
