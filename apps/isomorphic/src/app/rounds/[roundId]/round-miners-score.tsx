"use client";

import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
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

const barSize = 25;

export default function RoundMinersScore() {
  return (
    <WidgetCard title="Scores" className="w-full h-[455px]">
      <div className="mt-5 aspect-[1060/660] w-full h-[350px] lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
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
