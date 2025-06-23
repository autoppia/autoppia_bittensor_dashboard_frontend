/* src/app/shared/agents/AgentsSummary.tsx */
"use client";

import { Flex, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

/* -------- colores -------- */
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
];

/* -------- tipos -------- */
export type AgentsSummaryProps = {
  /** array de diez porcentajes (0‑100) para los diez casos de uso */
  usecases: number[]; // longitud 10
  /** porcentaje global de éxito (0‑100) */
  total: number;
  className?: string;
};

/* -------- componente -------- */
export default function AgentsSummary({
  usecases,
  total,
  className,
}: AgentsSummaryProps) {
  /* radial chart: success vs failed */
  const radialData = [
    { label: "failed", value: 100 - total },
    { label: "success", value: total },
  ];

  /* listado horizontal de los 10 use-cases */
  const horizontalData = Array.from({ length: 10 }, (_, i) => ({
    label: `Use case ${i + 1}`,
    value: usecases[i] ?? 0,
  }));

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
                  <CenterLabel value={Number(total)?.toFixed(0) || "0"} />
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
                style={{ backgroundColor: BAR_COLORS[idx] }}
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
