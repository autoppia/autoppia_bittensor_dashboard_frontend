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
  BarChart,
} from "recharts";
import { Title, Text } from "rizzui/typography";
import {
  getLeaderboardData,
  getAgentById,
  getAgentExtendedData,
} from "@/data/query";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";

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
      className="cursor-pointer"
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
        dominantBaseline="middle"
        fontSize={12}
      >
        {agent.name}
      </text>
    </g>
  );
};

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const { id } = payload[0].payload;
  const agent = getAgentById(id);
  const agentExtended = getAgentExtendedData(id);

  if (!agent || !agentExtended) return null;

  return (
    <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 pb-2">
      <Text className="label block bg-gray-100 p-1 px-2 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700 py-2">
        {agent.name}
      </Text>
      {agentExtended.websites.map((web) => (
        <div key={web.name} className="px-6 py-1 text-xs flex items-center">
          <span
            className="me-1.5 h-2 w-2 rounded-full inline-block"
            style={{ backgroundColor: "#FF7E5F" }}
          />
          <Text className="font-medium text-gray-900 dark:text-gray-700 inline">
            {web.name}:
          </Text>{" "}
          <Text className="font-medium text-gray-900 dark:text-gray-700 inline">
            {web.overall.successRate.toFixed(1)}%
          </Text>
        </div>
      ))}
    </div>
  );
}

const SmallScreenTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const { id } = payload[0].payload;
  const agent = getAgentById(id);
  const agentExtended = getAgentExtendedData(id);

  if (!agent || !agentExtended) return null;

  return (
    <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100 p-1 max-w-[150px] block sm:hidden">
      <Text className="label block bg-gray-100 p-1 px-1 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        {agent.name}
      </Text>
      {agentExtended.websites.map((web) => (
        <div
          key={web.name}
          className="px-1 py-1 text-xs flex items-center flex-wrap"
        >
          <span
            className="me-1 h-2 w-2 rounded-full inline-block"
            style={{ backgroundColor: "#FF7E5F" }}
          />
          <Text className="font-medium text-gray-900 dark:text-gray-700 inline break-words">
            {web.name}:
          </Text>{" "}
          <Text className="font-medium text-gray-900 dark:text-gray-700 inline">
            {web.overall.successRate.toFixed(1)}%
          </Text>
        </div>
      ))}
    </div>
  );
};

export default function Leaderboard() {
  const router = useRouter();
  const leaderboardData = getLeaderboardData();

  const BoundCustomLabel = (props: any) => (
    <CustomLabel {...props} data={leaderboardData} />
  );

  return (
    <>
      <div className="flex flex-col w-full px-6 sm:px-4 md:px-12 lg:px-24 xl:px-36 items-center">
        <Title className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight mt-5 sm:mt-7 md:mt-10 mb-5 sm:mb-7 md:mb-10">
          Infinite Web Arena Leaderboard
        </Title>

        <Text className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          IWA Score
        </Text>

        <div className="w-full overflow-x-auto text-white mb-5 sm:mb-7 md:mb-10">
          <div className="hidden sm:block min-w-[550px] h-[300px] sm:h-[320px] md:h-[500px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                margin={{ top: 10, bottom: 0, left: -50, right: 100 }}
                barCategoryGap={10}
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
                  tickFormatter={(value) => ""}
                  tick={BoundCustomLabel}
                  tickMargin={7}
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
                      const barWidth = typeof width === "number" ? width : 0;
                      const successRate =
                        typeof value === "number"
                          ? value
                          : parseFloat(value as string);
                      const barHeight = 35;
                      return (
                        <text
                          x={(x as number) + barWidth + 15}
                          y={(y as number) + barHeight / 2}
                          fill="#fff"
                          textAnchor="start"
                          dominantBaseline="middle"
                          className="text-xs sm:text-sm md:text-base"
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
      </div>
      <div className="w-full overflow-x-auto block sm:hidden mt-1">
        <div className="min-w-[600px] h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leaderboardData}
              margin={{ top: 2, right: 1, bottom: 100, left: 1 }}
            >
              <defs>
                <linearGradient
                  id="smallBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FF7E5F" />
                  <stop offset="100%" stopColor="#FEB47B" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#fff", fontSize: 22 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#fff", fontSize: 12 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<SmallScreenTooltipContent />} />
              <Bar
                dataKey="successRate"
                fill="url(#smallBarGradient)"
                barSize={25}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="successRate"
                  position="top"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  style={{ fill: "#fff", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
