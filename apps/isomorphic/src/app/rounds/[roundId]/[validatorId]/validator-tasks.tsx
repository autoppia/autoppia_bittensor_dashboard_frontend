"use client";

import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import TrendingUpIcon from "@core/components/icons/trending-up";
import { formatNumber } from "@core/utils/format-number";
import { Title } from "rizzui";

const data = [
  {
    name: "Cinema",
    total: 530,
    fill: "#FF7E5F",
  },
  {
    name: "Books",
    total: 500,
    fill: "#FDB36A",
  },
  {
    name: "Autozone",
    total: 485,
    fill: "#FFD166",
  },
  {
    name: "AutoCRM",
    total: 345,
    fill: "#F9F871",
  },
  {
    name: "AutoConnect",
    total: 520,
    fill: "#C4F0C2",
  },
  {
    name: "AutoDelivery",
    total: 360,
    fill: "#A0CED9",
  },
  {
    name: "AutoLodge",
    total: 356,
    fill: "#84A9C0",
  },
  {
    name: "AutoMail",
    total: 456,
    fill: "#9381FF",
  },
  {
    name: "AutoWork",
    total: 530,
    fill: "#B25D91",
  },
  {
    name: "AutoDining",
    total: 600,
    fill: "#F67280",
  },
];

export default function ValidatorTasks() {
  return (
    <WidgetCard
      title="Total Tasks"
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
      headerClassName="items-center"
      className="min-h-[450px] @container"
    >
      <div className="mb-4 mt-1 flex items-center gap-2">
        <Title as="h2" className="font-inter font-bold">
          2834
        </Title>
        <span className="flex items-center gap-1 text-green-dark">
          <TrendingUpIcon className="h-auto w-5" />
          <span className="font-semibold leading-none"> +28.00%</span>
        </span>
      </div>
      <div className="custom-scrollbar -mb-3 overflow-x-auto pb-3">
        <div className="h-[360px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              barGap={8}
              data={data}
              margin={{
                left: -15,
                top: 20,
                bottom: 50,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={<CustomizedAxisTick />}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(name) => name}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar type="natural" dataKey="total" barSize={40} radius={10}>
                <LabelList dataKey="total" content={<CustomizedLabel />} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}

function CustomizedLabel(props: any) {
  const { x, y, width, height, value } = props;
  const radius = 8;

  return (
    <g>
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={20}
        rx={radius}
        fill="#ffffff"
      />
      <text
        x={x + width / 2}
        y={y + 14}
        fill="currentColor"
        className="text-xs font-medium text-gray-800 dark:text-gray-200"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {formatNumber(value)}
      </text>
    </g>
  );
}

const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;

    return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={8} textAnchor="end" fill="#666" transform="rotate(-35)">
            {payload.value}
          </text>
        </g>
      );
  };