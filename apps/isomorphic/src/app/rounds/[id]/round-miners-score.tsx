"use client";

import { useMedia } from "@core/hooks/use-media";
import WidgetCard from "@core/components/cards/widget-card";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data: any[] = [];
for (let i = 0; i < 25; i++) {
  data.push({
    name: Math.floor(Math.random() * 256).toString(),
    score: (0.5 + Math.random() * 0.5).toFixed(2),
  });
}

export default function RoundMinersScore({
  className,
}: {
  className?: string;
}) {
  const isMobile = useMedia("(max-width: 767px)", false);
  const barSize = isMobile ? 16 : 20;
  const minWidth = isMobile ? 560 : 720;

  return (
    <WidgetCard title="Scores" className={cn("h-[455px]", className)}>
      <div className="mt-5 w-full h-[350px] lg:mt-7 custom-scrollbar overflow-x-auto scroll-smooth">
        <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
          <ComposedChart
            data={data}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <defs>
              <linearGradient
                id="score"
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#FF7E5F" />
                <stop offset="1" stopColor="#FEB47B" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              fill="url(#score)"
              stroke="#FF7E5F"
              strokeWidth={0}
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

export function CustomTooltip({ label, active, payload, className }: any) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100",
        className
      )}
    >
      <Text className="label mb-0.5 block bg-gray-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        Round {label}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload?.map((item: any, index: number) => (
          <div
            key={item.dataKey + index}
            className="chart-tooltip-item flex items-center py-1.5"
          >
            <span
              className="me-1.5 h-2 w-2 rounded-full"
              style={{
                backgroundColor: "#FF7E5F",
              }}
            />
            <Text>
              <Text as="span" className="capitalize">
                Score:
              </Text>{" "}
              <Text
                as="span"
                className="font-medium text-gray-900 dark:text-gray-700"
              >
                {item.value}
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
