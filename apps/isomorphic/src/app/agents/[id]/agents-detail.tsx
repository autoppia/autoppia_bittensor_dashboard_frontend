"use client";

import { useParams } from "next/navigation";
import WidgetCard from "@core/components/cards/widget-card";
import { CustomTooltip } from "@core/components/charts/custom-tooltip";
import { CustomYAxisTick } from "@core/components/charts/custom-yaxis-tick";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";
import { formatNumber } from "@core/utils/format-number";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAgentExtendedData } from "@/data/query";
import { Select } from "rizzui";

const BAR_COLORS = ["#FEDCBE", "#FF7E5F", "#BE3D2A"];

export default function DetailsChart({
  className,
  selectedWebsite,
  setSelectedWebsite,
}: {
  className?: string;
  selectedWebsite?: string | null;
  setSelectedWebsite: (value: string | null) => void;
}) {
  const { id } = useParams();
  const agentDetailsData = getAgentExtendedData(id as string);
  const isTab = useMedia("(max-width: 768px)", false);
  const barSize = isTab ? 16 : 20;

  // Derive dropdown options from websites
  const websiteOptions = agentDetailsData.websites.map((web) => ({
    value: web.name,
    label: web.name,
  }));

  // Transform data for the chart based on selected website
  const chartData = selectedWebsite
    ? [
        {
          website: selectedWebsite,
          easy:
            agentDetailsData.websites
              .find((web) => web.name === selectedWebsite)
              ?.results.filter((r) => r.useCaseId >= 1 && r.useCaseId <= 4)
              .map((r) => r.score)
              .reduce((sum, s) => sum + s, 0) / 4 || 0,
          medium:
            agentDetailsData.websites
              .find((web) => web.name === selectedWebsite)
              ?.results.filter((r) => r.useCaseId >= 5 && r.useCaseId <= 8)
              .map((r) => r.score)
              .reduce((sum, s) => sum + s, 0) / 4 || 0,
          hard:
            agentDetailsData.websites
              .find((web) => web.name === selectedWebsite)
              ?.results.filter((r) => r.useCaseId >= 9 && r.useCaseId <= 12)
              .map((r) => r.score)
              .reduce((sum, s) => sum + s, 0) / 4 || 0,
        },
      ]
    : agentDetailsData.websites.map((web) => {
        const easyScores = web.results
          .filter((r) => r.useCaseId >= 1 && r.useCaseId <= 4)
          .map((r) => r.score);
        const mediumScores = web.results
          .filter((r) => r.useCaseId >= 5 && r.useCaseId <= 8)
          .map((r) => r.score);
        const hardScores = web.results
          .filter((r) => r.useCaseId >= 9 && r.useCaseId <= 12)
          .map((r) => r.score);

        return {
          website: web.name,
          easy: easyScores.length
            ? easyScores.reduce((sum, s) => sum + s, 0) / easyScores.length
            : 0,
          medium: mediumScores.length
            ? mediumScores.reduce((sum, s) => sum + s, 0) / mediumScores.length
            : 0,
          hard: hardScores.length
            ? hardScores.reduce((sum, s) => sum + s, 0) / hardScores.length
            : 0,
        };
      });

  return (
    <WidgetCard
      title="Job Overview"
      className={cn("min-h-[28rem]", className)}
      titleClassName="font-normal text-sm sm:text-sm text-gray-500 mb-2.5 font-inter"
      action={
        <div className="flex items-center gap-2">
          <Select
            options={websiteOptions}
            value={websiteOptions.find((opt) => opt.value === selectedWebsite)}
            onChange={(option) => setSelectedWebsite(option.value)} // Use the prop function
            placeholder="Select Website"
            className="w-[200px]"
          />
          <Legend className="my-4 flex @md:justify-end @2xl:hidden" />
        </div>
      }
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="h-[450px] w-full pt-6">
          <ResponsiveContainer width="100%" height="100%" minWidth={700}>
            <ComposedChart
              data={chartData}
              margin={{ left: -6 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="website" axisLine={false} tickLine={false} />
              <YAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return <CustomYAxisTick payload={pl} postfix="%" {...rest} />;
                }}
              />
              <Tooltip
                content={<CustomTooltip postfix="%" formattedNumber />}
              />
              <Bar
                dataKey="easy"
                fill={BAR_COLORS[0]}
                stroke={BAR_COLORS[0]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="medium"
                fill={BAR_COLORS[1]}
                stroke={BAR_COLORS[1]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                type="natural"
                dataKey="hard"
                fill={BAR_COLORS[2]}
                stroke={BAR_COLORS[2]}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}

function Legend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 text-xs @3xl:text-sm lg:gap-4",
        className
      )}
    >
      {["Easy", "Medium", "Hard"].map((item, index) => (
        <div key={item} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: BAR_COLORS[index] }}
          />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
