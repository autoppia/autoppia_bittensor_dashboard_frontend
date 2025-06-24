"use client";

import { Flex, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { useParams } from "next/navigation";
import { getAgentExtendedData, getAgentSummaryData } from "@/data/query";

const RADIAL_COLORS = ["#FEDCBE", "#FF7E5F"];
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
  "#6C2E2B", // Extended for 12 use cases
];

export type AgentsSummaryProps = {
  className?: string;
  selectedWebsite?: string | null;
  usecases?: number[];
  total?: number;
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

  const radialData = [
    { label: "failed", value: 100 - (total || summaryTotal || 0) },
    { label: "success", value: total || summaryTotal || 0 },
  ];

  let displayData;
  if (selectedWebsite) {
    // Per-website view: 12 use cases for the selected website
    const selectedWeb = agentData.websites.find(
      (web) => web.name === selectedWebsite
    );
    if (selectedWeb) {
      displayData = selectedWeb.results.map((result, idx) => ({
        label:
          selectedWeb.useCases.find((uc) => uc.id === result.useCaseId)?.name ||
          `Use Case ${result.useCaseId}`,
        value: result.score,
      }));
    } else {
      displayData = [];
    }
  } else {
    // General view: Total, Hard, Medium, Easy tasks
    const allScores = agentData.websites.flatMap((web) =>
      web.results.map((r) => r.score)
    );
    const totalAverage = allScores.length
      ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
      : 0;
    const easyAverage =
      agentData.websites
        .flatMap((web) =>
          web.results
            .filter((r) => r.useCaseId >= 1 && r.useCaseId <= 4)
            .map((r) => r.score)
        )
        .reduce((sum, s) => sum + s, 0) /
        (agentData.websites.length * 4) || 0;
    const mediumAverage =
      agentData.websites
        .flatMap((web) =>
          web.results
            .filter((r) => r.useCaseId >= 5 && r.useCaseId <= 8)
            .map((r) => r.score)
        )
        .reduce((sum, s) => sum + s, 0) /
        (agentData.websites.length * 4) || 0;
    const hardAverage =
      agentData.websites
        .flatMap((web) =>
          web.results
            .filter((r) => r.useCaseId >= 9 && r.useCaseId <= 12)
            .map((r) => r.score)
        )
        .reduce((sum, s) => sum + s, 0) /
        (agentData.websites.length * 4) || 0;

    displayData = [
      { label: "Total Tasks", value: totalAverage },
      { label: "Hard Tasks", value: hardAverage },
      { label: "Medium Tasks", value: mediumAverage },
      { label: "Easy Tasks", value: easyAverage },
    ];
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
                content={
                  <CenterLabel
                    value={(total || summaryTotal || 0).toFixed(0)}
                  />
                }
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
            align="center"
            justify="between"
            className="mb-4 gap-0 border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
          >
            <Flex align="center" className="gap-0">
              <span
                className="me-2 size-2 rounded-full"
                style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
              />
              <Text
                as="span"
                className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
              >
                {item.label}
              </Text>
            </Flex>
            <Text as="span">{item.value.toFixed(1)}%</Text>
          </Flex>
        ))}
        {selectedWebsite && displayData.length > 0 && (
          <Flex
            align="center"
            justify="between"
            className="mt-4 pt-2 border-t border-muted"
          >
            <Text
              as="span"
              className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
            >
              Average
            </Text>
            <Text as="span">
              {(
                displayData.reduce((sum, item) => sum + item.value, 0) /
                displayData.length
              ).toFixed(1)}
              %
            </Text>
          </Flex>
        )}
      </div>
    </WidgetCard>
  );
}

function CenterLabel({ value }: { value: string }) {
  return (
    <text textAnchor="middle" dominantBaseline="central" fill="#111">
      <tspan x="0" dy="-10" fontSize="36px" fontWeight="700">
        {value}%
      </tspan>
      <tspan x="0" dy="24" fontSize="14px" fill="#666">
        Total
      </tspan>
    </text>
  );
}
