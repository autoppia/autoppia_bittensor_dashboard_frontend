"use client";

import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { getAgentExtendedData } from "@/data/query";
import { Select } from "rizzui";

// Define interfaces for data structures
interface UseCase {
  id: number;
  name: string;
}

interface Result {
  useCaseId: number;
  successRate: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
}

interface Website {
  name: string;
  useCases: UseCase[];
  results: Result[];
  overall: {
    successRate: number;
    total: number;
    successCount: number;
    avgSolutionTime: number;
  };
}

interface AgentExtendedData {
  websites: Website[];
}

// Rainbow colors starting with red using hex values
const PROGRESS_COLORS = [
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#84CC16", // lime-500
  "#22C55E", // green-500
  "#10B981", // emerald-500
  "#14B8A6", // teal-500
  "#06B6D4", // cyan-500
  "#0EA5E9", // sky-500
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#A855F7", // purple-500
  "#D946EF", // fuchsia-500
  "#EC4899", // pink-500
  "#F43F5E", // rose-500
];

// Utility function to format use case names
function formatUseCaseName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface AgentRunDetailProps {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
}

export default function AgentRunDetail({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
}: AgentRunDetailProps) {
  const { id } = useParams();
  const agentDetailsData: AgentExtendedData =
    getAgentExtendedData("openai-cua");

  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...agentDetailsData.websites.map((web) => ({
      value: web.name,
      label: web.name,
    })),
  ];

  const periodOptions = [
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "__all__", label: "ALL" },
  ];

  const chartData =
    selectedWebsite && selectedWebsite !== "__all__"
      ? (() => {
          const selectedWeb = agentDetailsData.websites.find(
            (web) => web.name === selectedWebsite
          );
          return (
            selectedWeb?.results.map((result, idx) => ({
              website: formatUseCaseName(
                selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)
                  ?.name || `Use Case ${result.useCaseId}`
              ),
              average: Number(result.successRate.toFixed(3)),
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
              colorIndex: idx,
            })) || []
          );
        })()
      : agentDetailsData.websites.map((web, idx) => ({
          website: web.name,
          average: Number(web.overall.successRate.toFixed(3)),
          total: web.overall.total,
          successCount: web.overall.successCount,
          avgSolutionTime: web.overall.avgSolutionTime,
          colorIndex: idx,
        }));

  return (
    <div
      className={cn("bg-gray-50 border border-muted hover:border-emerald-500 rounded-xl p-6", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Success Rate</h2>
        <div className="flex items-center space-x-2">
          <Select
            options={periodOptions}
            value={periodOptions.find(
              (opt) => opt.value === (period ?? "__all__")
            )}
            onChange={(option: { label: string; value: string }) =>
              setPeriod(option.value === "__all__" ? null : option.value)
            }
            className="w-[80px]"
          />
          <Select
            options={websiteOptions}
            value={websiteOptions.find(
              (opt) => opt.value === (selectedWebsite ?? "__all__")
            )}
            onChange={(option: { label: string; value: string }) =>
              setSelectedWebsite(
                option.value === "__all__" ? null : option.value
              )
            }
            className="w-[150px]"
          />
        </div>
      </div>

      <div className="space-y-6">
        {chartData.map((item, index) => {
          const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
          return (
            <div key={`${item.website}-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  {item.website}
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {item.average.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full flex justify-end"
                  style={{
                    width: `${item.average}%`,
                    backgroundColor: colorClass,
                  }}
                >
                  <span className="mt-1 mr-1 w-2 h-2 rounded-full bg-gray-900" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
