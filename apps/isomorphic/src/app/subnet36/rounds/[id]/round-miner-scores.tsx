"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useMedia } from "@core/hooks/use-media";
import WidgetCard from "@core/components/cards/widget-card";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { Skeleton } from "@core/ui/skeleton";
import { useRoundMiners } from "@/services/hooks/useRounds";
import { roundsService } from "@/services/api/rounds.service";
import { extractRoundIdentifier } from "./round-identifier";
import type { BenchmarkPerformance } from "@/services/api/types/rounds";
import { roundGlassBackgroundClass } from "./round-style.config";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BENCHMARK_COLORS: Record<string, string> = {
  openai: "#2563EB",
  anthropic: "#F97316",
  "browser-use": "#8B5CF6",
  browser_use: "#8B5CF6",
  browser: "#8B5CF6",
};

const DEFAULT_BENCHMARK_COLORS = ["#2563EB", "#F97316", "#8B5CF6", "#14B8A6", "#F472B6"];

const normalizeScore = (value?: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function RoundMinerScores({
  className,
  selectedValidatorId,
}: {
  className?: string;
  selectedValidatorId?: string;
}) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const cardClassName = React.useMemo(
    () =>
      cn(
        roundGlassBackgroundClass,
        "h-[520px] rounded-3xl text-white shadow-2xl backdrop-blur",
        className
      ),
    [className]
  );

  // Get miners data from API
  const { data: minersData, loading, error } = useRoundMiners(roundKey, {
    limit: 100,
    sortBy: "score",
    sortOrder: "desc",
  });
  const [expandedMinersData, setExpandedMinersData] = React.useState<typeof minersData | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const basePayload = minersData?.data;
    if (!basePayload) {
      if (isMounted) {
        setExpandedMinersData(null);
      }
      return () => {
        isMounted = false;
      };
    }

    if (!roundKey) {
      if (isMounted) {
        setExpandedMinersData(minersData);
      }
      return () => {
        isMounted = false;
      };
    }

    const baseMiners = Array.isArray(basePayload.miners) ? basePayload.miners : [];
    const total = typeof basePayload.total === "number" ? basePayload.total : baseMiners.length;
    const limit = basePayload.limit && basePayload.limit > 0 ? basePayload.limit : baseMiners.length || 100;

    if (total <= baseMiners.length) {
      if (isMounted) {
        setExpandedMinersData(minersData);
      }
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      const combinedMiners = [...baseMiners];
      const totalPages = Math.ceil(total / limit);
      for (let page = 2; page <= totalPages; page += 1) {
        try {
          const response = await roundsService.getRoundMiners(roundKey!, {
            limit,
            page,
            sortBy: "score",
            sortOrder: "desc",
          });
          const extra = Array.isArray(response.data?.miners) ? response.data!.miners : [];
          combinedMiners.push(...extra);
        } catch (fetchError) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[round-miner-scores] failed to expand miner list", fetchError);
          }
          break;
        }
      }

      if (!isMounted) {
        return;
      }

      setExpandedMinersData({
        ...minersData,
        data: {
          ...basePayload,
          miners: combinedMiners,
        },
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [minersData, roundKey]);

  const isSmallScreen = useMedia("(max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const barSize = isSmallScreen ? 16 : isMediumScreen ? 22 : 25;
  const minWidth = isSmallScreen ? 560 : isMediumScreen ? 640 : 840;

  const chartSource = expandedMinersData?.data ?? minersData?.data;

  const chartData = React.useMemo(() => {
    if (!chartSource?.miners) return [];

    const benchmarkColorCache = new Map<string, string>();
    let fallbackColorIndex = 0;

    const benchmarks: BenchmarkPerformance[] = chartSource.benchmarks || [];

    const filteredMiners = selectedValidatorId
      ? chartSource.miners.filter(
          (miner) => miner.validatorId === selectedValidatorId,
        )
      : chartSource.miners;

    const minerEntries = filteredMiners.map((miner) => {
        const score = normalizeScore(miner.score);
        const rawIsSota =
          miner.isSota ??
          miner.is_sota ??
          miner.isBenchmark ??
          miner.is_benchmark ??
          (typeof miner.type === "string" && miner.type.toLowerCase() === "benchmark");
        const isSota = Boolean(rawIsSota);
        const resolvedName = miner.name?.trim() || miner.provider?.trim() || "";
        const uidLabel = miner.uid !== undefined && miner.uid !== null ? String(miner.uid) : "";
        const label = isSota
          ? resolvedName || `Benchmark ${uidLabel || "unknown"}`
          : resolvedName
            ? `${resolvedName} · ${uidLabel || "unknown"}`
            : uidLabel
              ? `Miner ${uidLabel}`
              : "Miner";
        const slug = miner.provider ? slugify(miner.provider) : slugify(label);

        let color = "#10B981";
        if (isSota) {
          if (BENCHMARK_COLORS[slug]) {
            color = BENCHMARK_COLORS[slug];
          } else if (benchmarkColorCache.has(slug)) {
            color = benchmarkColorCache.get(slug)!;
          } else {
            color = DEFAULT_BENCHMARK_COLORS[fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length];
            benchmarkColorCache.set(slug, color);
            fallbackColorIndex += 1;
          }
        }

        return {
          name: label,
          score,
          isSota,
          uid: miner.uid,
          color,
          provider: miner.provider,
          xAxisLabel: isSota ? "" : uidLabel,
        };
      });

    const benchmarkEntries = benchmarks.map((benchmark) => {
      const score = normalizeScore(benchmark.score);
      const label = benchmark.name;
      const slug = benchmark.provider ? slugify(benchmark.provider) : slugify(label);
      let color = BENCHMARK_COLORS[slug];
      if (!color) {
        if (benchmarkColorCache.has(slug)) {
          color = benchmarkColorCache.get(slug)!;
        } else {
          color = DEFAULT_BENCHMARK_COLORS[fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length];
          benchmarkColorCache.set(slug, color);
          fallbackColorIndex += 1;
        }
      }

      return {
        name: label,
        score,
        isSota: true,
        uid: `benchmark-${benchmark.id}`,
        color,
        provider: benchmark.provider,
        xAxisLabel: "",
      };
    });

    return [...minerEntries, ...benchmarkEntries].sort((a, b) => b.score - a.score);
  }, [minersData, selectedValidatorId]);

  const legendItems = React.useMemo(() => {
    const sotaEntries = new Map<string, string>();
    chartData.forEach((entry) => {
      if (entry.isSota) {
        sotaEntries.set(entry.name, entry.color);
      }
    });
    return [
      { label: "Miners", color: "#10B981" },
      ...Array.from(sotaEntries.entries()).map(([label, color]) => ({ label, color })),
    ];
  }, [chartData]);

  // Show loading state
  if (loading) {
    return (
      <WidgetCard
        title="Miner Scores"
        className={cardClassName}
        headerClassName="text-white"
        titleClassName="text-white"
      >
        <div className="mt-5 w-full h-[350px] lg:mt-7">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </WidgetCard>
    );
  }

  // Show error state
  if (error) {
    return (
      <WidgetCard
        title="Miner Scores"
        className={cardClassName}
        headerClassName="text-white"
        titleClassName="text-white"
      >
        <div className="mt-5 flex h-[350px] w-full items-center justify-center lg:mt-7">
          <div className="text-center text-rose-200">
            <p className="text-lg font-semibold">Failed to load miner scores</p>
            <p className="mt-2 text-sm text-white/80">Please try again later</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (!chartData.length) {
    return (
      <WidgetCard
        title="Miner Scores"
        className={cardClassName}
        headerClassName="text-white"
        titleClassName="text-white"
      >
        <div className="mt-5 flex h-[350px] w-full items-center justify-center lg:mt-7">
          <div className="text-center text-white/70">
            <p className="text-lg font-semibold">No miners found</p>
            <p className="mt-2 text-sm">
              {selectedValidatorId
                ? "This validator has no miners evaluated in this round yet."
                : "No miner data is available for this round."}
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Miner Scores"
      className={cardClassName}
      headerClassName="text-white"
      titleClassName="text-white"
    >
      <div className="mt-5 h-[350px] w-full lg:mt-7 custom-scrollbar overflow-x-auto scroll-smooth">
        <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
          <ComposedChart
            data={chartData}
            margin={{
              left: -20,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis
              dataKey="xAxisLabel"
              tick={{
                fill: "rgba(226,232,240,0.86)",
                fontSize: isSmallScreen ? 10 : 12,
                fontFamily: "var(--font-inter)",
              }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.25)" }}
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              tick={{
                fill: "rgba(226,232,240,0.86)",
                fontSize: isSmallScreen ? 10 : 12,
                fontFamily: "var(--font-inter)",
              }}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
              tickLine={{ stroke: "rgba(148,163,184,0.25)" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Bar
              dataKey="score"
              fill="#10B981"
              strokeWidth={0}
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.uid}-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {legendItems.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{
                  backgroundColor: item.color,
                }}
              ></div>
              <Text className="text-white/80">{item.label}</Text>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export function CustomTooltip({ label, active, payload, className }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-white/15 bg-slate-900/95 text-white shadow-2xl backdrop-blur",
        className
      )}
    >
      <Text className="label mb-0.5 block bg-white/10 p-2 px-2.5 text-center font-inter text-xs font-semibold capitalize text-white">
        {payload[0]?.payload?.name}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload.map((item: any, index: number) => (
          <div key={item.dataKey + index} className="chart-tooltip-item flex items-center py-1.5">
            <span
              className="me-1.5 h-2 w-2 rounded-full"
              style={{
                backgroundColor: item.payload?.color || item.fill || "#10B981",
              }}
            />
            <Text>
              <Text as="span" className="capitalize text-white/80">
                Score:
              </Text>{" "}
              <Text as="span" className="font-medium text-white">
                {(Number(item.value) * 100).toFixed(2)}%
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
