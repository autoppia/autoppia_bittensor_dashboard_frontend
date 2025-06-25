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
import {
  getLeaderboardData,
  getAgentById,
  getAgentExtendedData,
} from "@/data/query";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";

/* ───────────────────────────── custom label ────────────────────────── */
const CustomLabel = ({ x, y, payload, data }: any) => {
  const router = useRouter();
  const agent = data.find((item: any) => item.name === payload.value);
  if (!agent) return null;

  const handleClick = () => {
    router.push(agent.href);
  };

  return (
    <g
      onClick={handleClick}
      className="cursor-pointer hidden sm:block"
      style={{ pointerEvents: "all" }}
    >
      <image
        href={agent.imageUrl}
        x={x - 155}
        y={y - 15}
        width={30}
        height={30}
      />
      <text
        x={x - 120}
        y={y}
        fill="#fff"
        // textAnchor="start"
        dominantBaseline="middle"
        fontSize={12}
      >
        {agent.name}
      </text>
    </g>
  );
};

/* ─────────────────────────── custom tooltip ────────────────────────── */
function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const { id } = payload[0].payload;
  const agent = getAgentById(id);
  const agentExtended = getAgentExtendedData(id);

  if (!agent || !agentExtended) return null;

  return (
    <div className="rounded-md bg-[#1e1e1e] min-w-[160px] shadow-md border border-[#2a2a2a] text-sm px-1">
      <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 mb-2">
        <Text className="label block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
          {agent.name}
        </Text>
      </div>
      {agentExtended.websites.map((web) => {
        const allScores = web.results.map((r) => r.score);
        const averageScore = allScores.length
          ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          : 0;
        return (
          <p
            key={web.name}
            className="font-medium text-gray-900 dark:text-gray-700 text-left mb-2"
          >
            {web.name}: {averageScore.toFixed(1)}%
          </p>
        );
      })}
    </div>
  );
}

/* ──────────────────────────── component ────────────────────────────── */
export default function Leaderboard() {
  const router = useRouter();
  const leaderboardData = getLeaderboardData(); // ya viene ordenado

  // Create a bound version of CustomLabel with leaderboardData
  const BoundCustomLabel = (props: any) => (
    <CustomLabel {...props} data={leaderboardData} />
  );

  return (
    <div className="flex flex-col w-full px-6  sm:px-4 md:px-12 lg:px-24 xl:px-36 items-center">
      <Title className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight mt-5 sm:mt-7 md:mt-10 mb-5 sm:mb-7 md:mb-10">
        Infinite Web Arena Leaderboard
      </Title>

      <Text className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
        IWA Score
      </Text>

      <div className="w-full min-w-[600px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] text-white mb-5 sm:mb-7 md:mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            margin={{
              top: 20,
              bottom: -10,
              left: -50,
              right: 100,
              sm: { top: 15, bottom: -5, left: -30, right: 75 },
              md: { top: 20, bottom: -10, left: -40, right: 100 },
              lg: { top: 20, bottom: -10, left: -50, right: 100 },
            }}
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
              className="sm:width-200 md:width-250 lg:width-300"
              className="sm:text-xs sm:font-medium md:text-sm md:font-semibold lg:text-base lg:font-medium" // Original fontSize=12 for lg+
              axisLine={true}
              tickLine={false}
              style={{ fontSize: 12, fontWeight: 500, fill: "#fff" }}
              tickFormatter={(value) => ""} // Hide default text
              tick={BoundCustomLabel} // Use the bound component
              tickMargin={7} // Add some margin for better spacing
              className="sm:tick-margin-6 md:tick-margin-7 lg:tick-margin-7" // Original 7 for lg+
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
                dataKey="successRate"
                content={({ x, y, width, value }) => {
                  // Ensure width is a number, default to 0 if undefined
                  const barWidth = typeof width === "number" ? width : 0;
                  // Assert value as number
                  const successRate =
                    typeof value === "number"
                      ? value
                      : parseFloat(value as string);
                  // Center the percentage vertically with the bar (barSize / 2)
                  const barHeight = 35; // Matches barSize
                  return (
                    <text
                      x={(x as number) + barWidth + 15}
                      y={(y as number) + barHeight / 2}
                      fill="#fff"
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="text-xs sm:text-sm md:text-base" // Original text-base for lg+
                    >
                      {successRate.toFixed(1)}%
                    </text>
                  );
                }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
