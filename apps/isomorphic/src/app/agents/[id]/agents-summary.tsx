"use client";

import { Flex, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import { useParams } from "next/navigation";
import { getAgentExtendedData, getAgentSummaryData } from "@/data/query";
import { agentsData } from "@/data/agents-data";

const BAR_COLORS = [
  "#FF7E5F", // bright coral (AutoZone)
  "#FDB36A", // apricot (Books)
  "#FFD166", // golden sand (Cinema)
  "#F9F871", // lemon
  "#C4F0C2", // soft mint
  "#A0CED9", // light teal
  "#84A9C0", // dusty blue
  "#9381FF", // soft purple
  "#B25D91", // plum
  "#F67280", // pinkish red
  "#C06C84", // rose
  "#6C5B7B", // muted violet
];

export type AgentsSummaryProps = {
  className?: string;
  selectedWebsite?: string | null;
};

type DisplayDataItem = {
  label: string;
  value: number;
  total: number;
  successCount: number;
  avgSolutionTime: number;
};

// Utility function to format use case names
function formatUseCaseName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AgentsSummary({
  className,
  selectedWebsite,
}: AgentsSummaryProps) {
  const { id } = useParams();
  const agentData = getAgentExtendedData(id as string);
  const { usecases, total } = getAgentSummaryData(id as string) || {};
  const agent = agentsData.find((agent) => agent.id === id);

  let successRate: number;
  let totalRequests: number;
  let totalSuccesses: number;
  let avgSolutionTime: number;

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      successRate = selectedWeb.overall.successRate;
      totalRequests = selectedWeb.overall.total;
      totalSuccesses = selectedWeb.overall.successCount;
      avgSolutionTime = selectedWeb.overall.avgSolutionTime;
    } else {
      successRate = 0;
      totalRequests = 0;
      totalSuccesses = 0;
      avgSolutionTime = 0;
    }
  } else {
    const websiteAverages = agentData.websites;
    successRate =
      websiteAverages.length > 0
        ? websiteAverages.reduce((sum, w) => sum + w.overall.successRate, 0) /
          websiteAverages.length
        : agent?.successRate || total || 0;
    totalRequests = websiteAverages.reduce(
      (sum, w) => sum + w.overall.total,
      0
    );
    totalSuccesses = websiteAverages.reduce(
      (sum, w) => sum + w.overall.successCount,
      0
    );
    avgSolutionTime =
      websiteAverages.length > 0
        ? websiteAverages.reduce(
            (sum, w) => sum + w.overall.avgSolutionTime,
            0
          ) / websiteAverages.length
        : 0;
  }

  let displayData: DisplayDataItem[];

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      displayData = selectedWeb.results.map((result, idx) => ({
        label: formatUseCaseName(
          selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)?.name ||
            `Use Case ${result.useCaseId}`
        ),
        value: result.successRate,
        total: result.total,
        successCount: result.successCount,
        avgSolutionTime: result.avgSolutionTime,
      }));
    } else {
      displayData = [];
    }
  } else {
    displayData = agentData.websites.map((web) => ({
      label: web.name,
      value: web.overall.successRate,
      total: web.overall.total,
      successCount: web.overall.successCount,
      avgSolutionTime: web.overall.avgSolutionTime,
    }));
  }

  const donutData = selectedWebsite
    ? (() => {
        const selectedWeb = agentData.websites.find(
          (web) => web.name === selectedWebsite
        );
        if (!selectedWeb) return [];

        const sortedResults = [...selectedWeb.results]
          .map((result) => {
            const useCase = selectedWeb.useCases.find(
              (uc) => uc.id === result.useCaseId
            );
            const label = formatUseCaseName(
              useCase?.name || `Use Case ${result.useCaseId}`
            );
            return {
              label,
              value: result.total,
              average: result.successRate,
              total: result.total,
              successCount: result.successCount,
              avgSolutionTime: result.avgSolutionTime,
            };
          })
          .sort((a, b) => b.average - a.average);

        return sortedResults.map((item, idx) => ({
          ...item,
          fill: BAR_COLORS[idx % BAR_COLORS.length],
          stroke: BAR_COLORS[idx % BAR_COLORS.length],
        }));
      })()
    : agentData.websites.map((web, idx) => ({
        label: web.name,
        value: web.overall.successCount,
        average: web.overall.successRate,
        total: web.overall.total,
        successCount: web.overall.successCount,
        avgSolutionTime: web.overall.avgSolutionTime,
        fill: BAR_COLORS[idx % BAR_COLORS.length],
        stroke: BAR_COLORS[idx % BAR_COLORS.length],
      }));

  return (
    <WidgetCard
      title="Job Summary"
      headerClassName="hidden"
      className={className}
    >
      <div className="h-[320px] w-full @sm:py-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 pb-2">
                    <Text className="label mb-0.5 block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
                      {data.label || "Unknown"}
                    </Text>
                    <div className="px-6 py-1 text-xs">
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: "#FF7E5F" }}
                        />
                        <Text>
                          <Text as="span" className="capitalize">
                            Average:
                          </Text>{" "}
                          <Text
                            as="span"
                            className="font-medium text-gray-900 dark:text-gray-700"
                          >
                            {data.average ? data.average.toFixed(1) : "0"}%
                          </Text>
                        </Text>
                      </div>
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: "#F9F871" }}
                        />
                        <Text className="text-gray-500">
                          Requests:{" "}
                          <span className="text-gray-900 dark:text-gray-700 font-medium">
                            {data.total ?? 0}
                          </span>
                        </Text>
                      </div>
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: "#FFD166" }}
                        />
                        <Text className="text-gray-500">
                          Successes:{" "}
                          <span className="text-gray-900 dark:text-gray-700 font-medium">
                            {data.successCount ?? 0}
                          </span>
                        </Text>
                      </div>
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: "#FDB36A" }}
                        />
                        <Text className="text-gray-500">
                          Avg Solution Time:{" "}
                          <span className="text-gray-900 dark:text-gray-700 font-medium">
                            {data.avgSolutionTime
                              ? data.avgSolutionTime.toFixed(2)
                              : "0"}
                            s
                          </span>
                        </Text>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={donutData}
              innerRadius={100}
              outerRadius={120}
              paddingAngle={5}
              cornerRadius={40}
              dataKey="value"
              stroke="rgba(0,0,0,0)"
            >
              <Label
                position="center"
                content={(props) => (
                  <CenterLabel
                    value={successRate.toFixed(0)}
                    totalRequests={totalRequests.toFixed(0)}
                    totalSuccesses={totalSuccesses.toFixed(0)}
                    viewBox={props.viewBox}
                  />
                )}
              />
              {donutData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.fill}
                  stroke={entry.stroke}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        {displayData.map((item, idx) => (
          <Flex
            key={item.label}
            direction="col"
            align="start"
            className="mb-4 gap-1 border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
          >
            <Flex align="center" className="w-full">
              <Flex align="center" className="gap-2">
                <span
                  className="me-2 size-2 rounded-full"
                  style={{
                    backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                  }}
                />
                <Text
                  as="span"
                  className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
                >
                  {item.label}
                </Text>
              </Flex>
              <Text
                as="span"
                className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
              >
                {item.value.toFixed(1)}%
              </Text>
            </Flex>
            <Text as="span" className="text-xs text-gray-500">
              Requests: {item.total}, Successes: {item.successCount}
              {selectedWebsite && (
                <>, Avg Time: {item.avgSolutionTime.toFixed(2)}s</>
              )}
            </Text>
          </Flex>
        ))}
      </div>
    </WidgetCard>
  );
}

function CenterLabel({
  value,
  totalRequests,
  totalSuccesses,
  viewBox,
}: {
  value: string;
  totalRequests: string;
  totalSuccesses: string;
  viewBox: any;
}) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 20}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontSize="36" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontSize="14" fontWeight="600">
          Requests: {totalRequests}
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 30}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontSize="14" fontWeight="600">
          Successes: {totalSuccesses}
        </tspan>
      </text>
    </>
  );
}
