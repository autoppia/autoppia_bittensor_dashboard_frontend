"use client";

import { Flex, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { useParams } from "next/navigation";
import { getAgentExtendedData, getAgentSummaryData } from "@/data/query";
import { agentsData } from "@/data/agents-data";

const RADIAL_COLORS = ["#FF7E5F", "#FEDCBE"];

const BAR_COLORS = [
  "#FF7E5F",
  "#FFA173",
  "#FFBC89",
  "#FFD5A0",
  "#FFE9B6",
  "#E05A3B",
  "#C14F37",
  "#A44333",
  "#88392F",
  "#6C2E2B",
  "#6C2E2B",
  "#6C2E2B",
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

  const radialData = [
    { label: "success", value: successRate },
    { label: "failed", value: 100 - successRate },
  ];

  let displayData: DisplayDataItem[];

  if (selectedWebsite) {
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      displayData = selectedWeb.results.map((result) => ({
        label:
          selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)?.name ||
          `Use Case ${result.useCaseId}`,
        value: result.score,
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

  return (
    <WidgetCard
      title="Job Summary"
      headerClassName="hidden"
      className={className}
    >
      <div className="h-[320px] w-full @sm:py-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={radialData}
              innerRadius={100}
              outerRadius={120}
              paddingAngle={10}
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
              {radialData.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={RADIAL_COLORS[idx % RADIAL_COLORS.length]}
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
