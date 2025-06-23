"use client";

import { Flex, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { getAgentExtendedData } from "@/data/query";

/* -------- colores -------- */
const RADIAL_COLORS = ["#FEDCBE", "#FF7E5F"];
const BAR_COLORS = [
  "#FF7E5F",
  "#FFA173",
  "#FFBC89",
  "#FFD5DC",
  "#FFE9B6",
  "#E05A3D",
  "#C14F37",
  "#A44333",
  "#883B2F",
  "#6C2E2B",
  "#4F2527",
  "#FF9999", // Added for 12 use cases
];

/* -------- tipos -------- */
export type AgentsSummaryProps = {
  id: string;
  className?: string;
};

/* -------- componente -------- */
export default function AgentsSummary({ id, className }: AgentsSummaryProps) {
  const agent = getAgentExtendedData(id);

  if (!agent) {
    return (
      <WidgetCard
        title="Job Summary"
        headerClassName="hidden"
        className={className}
      >
        <div className="flex h-[320px] items-center justify-center">
          <p className="text-gray-500">No data available for this agent.</p>
        </div>
      </WidgetCard>
    );
  }

  /* radial chart: success vs failed */
  const radialData = [
    { label: "failed", value: 100 - agent.successRate },
    { label: "success", value: agent.successRate },
  ];

  /* listado horizontal de los 12 use-cases */
  const horizontalData = agent.websites[0].useCases.map((useCase, idx) => {
    // Calculate average score for this use case across all websites
    const scores = agent.websites
      .map(
        (website) =>
          website.results.find((r) => r.useCaseId === useCase.id)?.score ?? 0
      )
      .filter((score) => score > 0);
    const averageScore =
      scores.length > 0
        ? Number(
            (
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            ).toFixed(1)
          )
        : 0;

    return {
      label: useCase.name,
      value: averageScore,
    };
  });

  return (
    <WidgetCard
      title="Job Summary"
      headerClassName="hidden"
      className={className}
    >
      {/* ───── donut ───── */}
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
                    value={Number(agent.successRate)?.toFixed(0) || "0"}
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

      {/* ───── lista horizontal ───── */}
      <div>
        {horizontalData.map((item, idx) => (
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
      </div>
    </WidgetCard>
  );
}

/* -------- etiqueta central del donut -------- */
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
