/* src/app/shared/leaderboard/Leaderboard.tsx */
"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Title, Text } from "rizzui/typography";
import { getLeaderboardData, getAgentById } from "@/data/query";

/* ───────────────────────────── custom label ────────────────────────── */
const CustomLabel = ({ x, y, width, height, value, data }: any) => {
  const agent = data.find((item: any) => item.name === value);
  if (!agent) return null;

  return (
    <g>
      <image
        href={agent.imageUrl}
        x={x + width + 15}
        y={y + height / 2 - 15}
        width={30}
        height={30}
      />
      <text
        x={x + width + 70}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {agent.successRate.toFixed(1)}%
      </text>
    </g>
  );
};

/* ─────────────────────────── custom tooltip ────────────────────────── */
const TooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { id } = payload[0].payload;
  const agent = getAgentById(id);
  if (!agent) return null;

  return (
    <div className="rounded-md bg-gray-800/90 p-3 text-xs">
      <p className="font-semibold text-white mb-1">{agent.name}</p>
      <p className="text-gray-300">Use case&nbsp;1 • {agent.usecase1}</p>
      <p className="text-gray-300">Use case&nbsp;2 • {agent.usecase2}</p>
      <p className="text-gray-300">Use case&nbsp;3 • {agent.usecase3}</p>
    </div>
  );
};

/* ──────────────────────────── component ────────────────────────────── */
export default function Leaderboard() {
  const router = useRouter();
  const leaderboardData = getLeaderboardData(); // ya viene ordenado

  return (
    <div className="flex flex-col w-full px-6 md:px-12 lg:px-24 xl:px-36 items-center">
      <Title className="text-5xl font-bold text-center leading-tight mt-10 mb-10">
        Infinite Web Arena Leaderboard
      </Title>

      <Text className="text-4xl font-bold text-white">IWA Score</Text>

      <div className="w-full min-w-[600px] h-[600px] text-white mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            margin={{ top: 20, bottom: -10, left: -50, right: 100 }}
            barCategoryGap={100}
            barSize={35}
            data={leaderboardData}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF7E5F" />
                <stop offset="100%" stopColor="#FEB47B" />
              </linearGradient>
            </defs>

            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={300}
              axisLine={true}
              tickLine={false}
              style={{ fontSize: 12, fontWeight: 500, fill: "#fff" }}
            />
            <CartesianGrid horizontal={false} />
            <Tooltip content={<TooltipContent />} />

            <Bar
              dataKey="successRate"
              fill="url(#barGradient)"
              onClick={({ href }) => router.push(href)}
              className="cursor-pointer"
            >
              <LabelList
                dataKey="name"
                content={<CustomLabel data={leaderboardData} />}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
