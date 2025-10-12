"use client";

import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import { Select } from "rizzui";
import { useAgentRunStats } from "@/services/hooks/useAgentRun";
import Placeholder, { TextPlaceholder } from "@/app/shared/placeholder";

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

interface AgentRunDetailDynamicProps {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
  period: string | null;
  setPeriod: (value: string | null) => void;
}

export default function AgentRunDetailDynamic({
  className,
  selectedWebsite,
  setSelectedWebsite,
  period,
  setPeriod,
}: AgentRunDetailDynamicProps) {
  const { id } = useParams();
  const { stats, isLoading, error } = useAgentRunStats(id as string);

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
        <div className="flex items-center justify-between mb-6">
          <Placeholder height="1.5rem" width="8rem" />
          <div className="flex items-center space-x-2">
            <Placeholder height="2rem" width="5rem" />
            <Placeholder height="2rem" width="9rem" />
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <Placeholder height="1rem" width="40%" />
                <Placeholder height="1rem" width="3rem" />
              </div>
              <Placeholder height="1rem" width="100%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !stats) {
    return (
      <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
        <div className="text-center py-8">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Failed to Load Success Rate Data
          </div>
          <div className="text-red-500 text-sm mb-4">
            {error || "Unable to fetch success rate information"}
          </div>
          <div className="text-gray-500 text-xs">
            Please try refreshing the page or contact support if the issue persists.
          </div>
        </div>
      </div>
    );
  }

  // Generate website options from stats data
  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...(Array.isArray(stats.performanceByWebsite) ? stats.performanceByWebsite : []).map((website: any) => ({
      value: website.website,
      label: website.website,
    })),
  ];

  const periodOptions = [
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "__all__", label: "ALL" },
  ];

  // Generate chart data based on selected website
  const chartData = selectedWebsite && selectedWebsite !== "__all__"
    ? (() => {
        const websites = Array.isArray(stats.performanceByWebsite) ? stats.performanceByWebsite : [];
        const selectedWeb = websites.find(
          (web: any) => web.website === selectedWebsite
        );
        return selectedWeb ? [{
          website: selectedWeb.website,
          average: Number((selectedWeb.averageScore * 100).toFixed(1)),
          total: selectedWeb.tasks,
          successCount: selectedWeb.successful,
          avgSolutionTime: selectedWeb.averageDuration,
          colorIndex: 0,
        }] : [];
      })()
    : (Array.isArray(stats.performanceByWebsite) ? stats.performanceByWebsite : []).map((web: any, idx: number) => ({
        website: web.website,
        average: Number((web.averageScore * 100).toFixed(1)),
        total: web.tasks,
        successCount: web.successful,
        avgSolutionTime: web.averageDuration,
        colorIndex: idx,
      }));

  return (
    <div className={cn("bg-gray-50 border border-muted rounded-xl p-6", className)}>
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
        {chartData.length > 0 ? (
          chartData.map((item: any, index: number) => {
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
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">No Data Available</div>
            <div className="text-sm">
              No success rate data found for the selected criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
