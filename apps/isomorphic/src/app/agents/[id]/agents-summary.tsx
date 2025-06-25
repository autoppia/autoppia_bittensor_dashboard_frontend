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
import { CustomTooltip } from "@core/components/charts/custom-tooltip";

const BAR_COLORS = [
  "#FF7E5F", // bright coral
  "#FDB36A", // apricot
  "#FFD166", // golden sand
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
  usecases?: number[];
  total?: number;
};

type DisplayDataItem = {
  label: string;
  value: number;
  totalRequests: number;
  successes: number;
};

export default function AgentsSummary({
  className,
  selectedWebsite,
  usecases,
  total,
}: AgentsSummaryProps) {
  const { id } = useParams();
  const agentData = getAgentExtendedData(id as string);
  const { usecases: summaryUsecases, total: summaryTotal } =
    getAgentSummaryData(id as string) || {};
  const agent = agentsData.find((agent) => agent.id === id);

  let successRate;
  let totalRequests = 0;
  let totalSuccesses = 0;

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      const allScores = selectedWeb.results.map((r) => r.score);
      const allRequests = selectedWeb.results.map((r) => r.totalRequests);
      const allSuccesses = selectedWeb.results.map((r) => r.successes);
      successRate = allScores.length
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : 0;
      totalRequests = allRequests.reduce((sum, r) => sum + r, 0);
      totalSuccesses = allSuccesses.reduce((sum, s) => sum + s, 0);
    } else {
      successRate = 0;
      totalRequests = 0;
      totalSuccesses = 0;
    }
  } else {
    const websiteAverages = agentData.websites.slice(0, 3).map((web) => {
      const allScores = web.results.map((r) => r.score);
      const allRequests = web.results.map((r) => r.totalRequests);
      const allSuccesses = web.results.map((r) => r.successes);
      return {
        avgScore: allScores.length
          ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          : 0,
        totalRequests: allRequests.reduce((sum, r) => sum + r, 0),
        totalSuccesses: allSuccesses.reduce((sum, s) => sum + s, 0),
      };
    });
    successRate =
      websiteAverages.length >= 3
        ? websiteAverages.reduce((sum, w) => sum + w.avgScore, 0) / 3
        : agent
          ? agent.successRate
          : total || summaryTotal || 0;
    totalRequests =
      websiteAverages.reduce((sum, w) => sum + w.totalRequests, 0) / 3;
    totalSuccesses =
      websiteAverages.reduce((sum, w) => sum + w.totalSuccesses, 0) / 3;
  }

  let displayData: DisplayDataItem[];

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      displayData = selectedWeb.results.map((result, idx) => ({
        label:
          selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)?.name ||
          `Use Case ${result.useCaseId}`,
        value: result.totalRequests,
        totalRequests: result.totalRequests,
        successes: result.successes,
      }));
    } else {
      displayData = [];
    }
  } else {
    displayData = agentData.websites.map((web) => {
      const allScores = web.results.map((r) => r.score);
      const allRequests = web.results.map((r) => r.totalRequests);
      const allSuccesses = web.results.map((r) => r.successes);
      const average = allScores.length
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : 0;
      return {
        label: web.name,
        value: average,
        totalRequests: allRequests.reduce((sum, r) => sum + r, 0),
        successes: allSuccesses.reduce((sum, s) => sum + s, 0),
      };
    });
  }

  // Prepare donut data with score as value and sorted colors
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
            const label = useCase?.name || `Use Case ${result.useCaseId}`;
            const successRate =
              result.totalRequests > 0
                ? (result.successes / result.totalRequests) * 100
                : 0;
            return {
              label,
              value: result.totalRequests,
              average: successRate,
              totalRequests: result.totalRequests,
              successes: result.successes,
            };
          })
          .sort((a, b) => b.average - a.average); // Rank by success rate

        return sortedResults.map((item, idx) => ({
          ...item,
          fill: BAR_COLORS[idx],
          stroke: BAR_COLORS[idx],
        }));
      })()
    : [
        {
          label: "success",
          value: successRate,
          average: successRate,
          totalRequests: totalRequests,
          successes: totalSuccesses,
          fill: BAR_COLORS[0],
          stroke: BAR_COLORS[0],
        },
        {
          label: "failed",
          value: 100 - successRate,
          average: 0,
          totalRequests: totalRequests,
          successes: 0,
          fill: BAR_COLORS[1],
          stroke: BAR_COLORS[1],
        },
      ];

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
              content={({ payload, label }) => {
                console.log({ payload, label }); // Debug payload and label
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload; // Access the full data object
                return (
                  <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 pb-2">
                    <Text className="label mb-0.5 block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
                      {data.label || "Unknown"}{" "}
                      {/* Fallback to payload label */}
                    </Text>
                    <div className="px-6 py-1 text-xs">
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full"
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
                          className="me-1.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: "#FF7E5F" }}
                        />

                        <Text className="text-gray-500">
                          Requests:{" "}
                          <span className="text-gray-900 dark:text-gray-700 font-medium">
                            {data.totalRequests ?? 0}
                          </span>
                        </Text>
                      </div>
                      <div className="chart-tooltip-item flex items-center p-1">
                        <span
                          className="me-1.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: "#FF7E5F" }}
                        />

                        <Text className="text-gray-500">
                          Successes:{" "}
                          <span className="text-gray-900 dark:text-gray-700 font-medium">
                            {data.successes ?? 0}
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
              Requests: {item.totalRequests}, Successes: {item.successes}
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
