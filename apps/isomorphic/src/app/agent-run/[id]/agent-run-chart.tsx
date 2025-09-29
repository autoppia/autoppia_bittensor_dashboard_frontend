"use client";

import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import DropdownAction from "@core/components/charts/dropdown-action";
import TrendingUpIcon from "@core/components/icons/trending-up";
import cn from "@core/utils/class-names";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flex, Title } from "rizzui";

const data = [
  { website: "Cinema", success: 80, failed: 20 },
  { website: "Books", success: 70, failed: 30 },
  { website: "Autozone", success: 60, failed: 40 },
  { website: "AutoDining", success: 50, failed: 50 },
  { website: "AutoCRM", success: 60, failed: 40 },
  { website: "AutoMail", success: 55, failed: 70 },
  { website: "AutoDelivery", success: 40, failed: 60 },
  { website: "AutoLodge", success: 80, failed: 20 },
  { website: "AutoConnect", success: 30, failed: 70 },
  { website: "AutoWork", success: 80, failed: 20 },
];

export default function AgentRunChart() {
  return (
    <WidgetCard
      title="Total Tasks"
      titleClassName="text-gray-700 font-normal sm:text-sm font-inter"
      headerClassName="items-center"
      action={
        <Flex align="center" gap="5">
          <CustomLegend className="hidden @[28rem]:mt-0 @[28rem]:inline-flex" />
          {/* <DropdownAction
            className="rounded-md border"
            options={[]}
            onChange={() => {}}
            dropdownClassName="!z-0"
          /> */}
        </Flex>
      }
      className="min-h-[28rem] @container"
    >
      <StatisticsSummary />
      <CustomLegend className="mb-4 mt-0 inline-flex @[28rem]:hidden" />
      <ChartContainer />
    </WidgetCard>
  );
}

function StatisticsSummary() {
  return (
    <div className="mb-3 mt-1 flex items-center gap-2 @[28rem]:mb-4">
      <Title as="h2" className="font-semibold">
        28,345
      </Title>
      <span className="flex items-center gap-1 text-green-dark">
        <TrendingUpIcon className="h-auto w-5" />
        <span className="font-medium leading-none"> +28.00%</span>
      </span>
    </div>
  );
}

function ChartContainer() {
  return (
    <div className="custom-scrollbar overflow-x-auto scroll-smooth -mb-3 pb-3">
      <div className="h-[24rem] w-full pt-6 @lg:pt-8">
        <ResponsiveContainer width="100%" height="100%" minWidth={900}>
          <ComposedChart
            barGap={8}
            data={data}
            margin={{ left: -17, top: 20 }}
            className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
          >
            <CartesianGrid
              vertical={false}
              strokeOpacity={0.435}
              strokeDasharray="8 10"
            />
            <XAxis dataKey="website" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(label) => (label)}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="success"
              barSize={28}
              fill="#28D775"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="failed"
              barSize={28}
              fill="#273849"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-wrap items-start gap-3 lg:gap-7",
        className
      )}
    >
      {["success", "failed"].map((item) => (
        <div key={item} className="flex items-center gap-1.5">
          <span
            className={cn(
              "-mt-0.5 h-3 w-3 rounded-full",
              item === "success" ? "bg-[#28D775]" : "bg-[#273849]"
            )}
          />
          <span>{item === "success" ? "Success" : "Failed"}</span>
        </div>
      ))}
    </div>
  );
}
