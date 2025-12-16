"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Select } from "rizzui";
import Image from "next/image";
import { validatorsRepository } from "@/repositories/validators/validators.repository";
import type { ValidatorDetailsData, WebStats, UseCaseStats, TaskStats } from "@/repositories/validators/validators.types";
import PageHeader from "@/app/shared/page-header";
import Placeholder from "@/app/shared/placeholder";
import { Text } from "rizzui";
import {
  PiShieldCheck,
  PiChartBar,
  PiCheckCircle,
  PiXCircle,
  PiQuestion,
  PiWarning,
  PiCaretDown,
  PiCaretUp,
  PiTrendUp,
  PiTrendDown,
  PiTrophy,
} from "react-icons/pi";
import cn from "@core/utils/class-names";
import { getProjectColors } from "@/utils/website-colors";
import { resolveAssetUrl } from "@/services/utils/assets";

function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Capitalize first letter of web name
function capitalizeWebName(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Colors for pie chart segments
const CHART_COLORS = {
  success: "#10B981", // emerald-500
  zero: "#EF4444", // red-500
  null: "#EAB308", // yellow-500
  failed: "#F97316", // orange-500
};

const PROGRESS_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#EC4899",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
  "#EAB308",
  "#0EA5E9",
  "#D946EF",
  "#F43F5E",
];

const HIGHLIGHT_COLOR = "#FDF5E6";

// Prepare data for pie chart from stats (only success and zero)
function preparePieChartData(stats: { successCount: number; zeroCount: number; totalEvaluations: number }) {
  const data = [
    {
      name: "Success",
      value: stats.successCount,
      fill: CHART_COLORS.success,
      stroke: CHART_COLORS.success,
    },
    {
      name: "Zero",
      value: stats.zeroCount,
      fill: CHART_COLORS.zero,
      stroke: CHART_COLORS.zero,
    },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return [
      {
        name: "No Data",
        value: 1,
        fill: "#64748B",
        stroke: "#64748B",
      },
    ];
  }

  return data;
}

// Center label component for pie chart
function CenterLabel({
  value,
  total,
  viewBox,
}: {
  value: string;
  total: string;
  viewBox: any;
}) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 8}
        fill="#FDF5E6"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 8px 20px rgba(253, 245, 230, 0.35)",
        }}
      >
        <tspan fontSize="22" fontWeight="700">
          {value}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 12}
        fill="#E2E8F0"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <tspan fontSize="10" fontWeight="600">
          {total} total
        </tspan>
      </text>
    </>
  );
}

// Card component for validator details
function ValidatorDetailsCard({ data }: { data: ValidatorDetailsData }) {
  const validator = data.validator;
  const validatorImageSrc = data.validatorImage
    ? resolveAssetUrl(data.validatorImage)
    : resolveAssetUrl("/validators/Other.png");
  
  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 p-6 shadow-xl backdrop-blur-sm text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-md">
          <Image
            src={validatorImageSrc}
            alt="Validator"
            width={48}
            height={48}
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Validator Details
          </h3>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60 mb-1">UID</p>
          <p className="text-2xl font-bold text-white">{validator.uid}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Hotkey</p>
          <p className="text-sm font-mono text-white/90">{truncateMiddle(validator.hotkey, 8)}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Stake</p>
            <p className="text-lg font-semibold text-white">
              {validator.stake !== null ? `${formatNumber(validator.stake)} TAO` : "—"}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Last Round</p>
            <p className="text-lg font-semibold text-white">
              {validator.lastRoundEvaluated ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card component for last round winner
function LastRoundWinnerCard({ data }: { data: ValidatorDetailsData }) {
  const context = data.context;
  const fallbackMinerImage = context.lastRoundWinner !== null
    ? resolveAssetUrl(`/miners/${Math.abs(context.lastRoundWinner % 50)}.svg`)
    : resolveAssetUrl("/miners/0.svg");
  const minerImageSrc = context.lastRoundWinnerImage
    ? resolveAssetUrl(context.lastRoundWinnerImage)
    : fallbackMinerImage;
  
  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 p-6 shadow-xl backdrop-blur-sm text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-md">
          {context.lastRoundWinner !== null ? (
            <Image
              src={minerImageSrc}
              alt={context.lastRoundWinnerName || "Winner"}
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PiTrophy className="h-6 w-6 text-amber-300" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Last Round Winner
          </h3>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Miner</p>
          <p className="text-2xl font-bold text-white">
            {context.lastRoundWinnerName || (context.lastRoundWinner !== null ? `Miner ${context.lastRoundWinner}` : "—")}
          </p>
        </div>
        {context.lastRoundWinner !== null && (
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">UID</p>
            <p className="text-lg font-semibold text-white">{context.lastRoundWinner}</p>
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Reward</p>
            <p className="text-lg font-semibold text-white">
              {context.lastRoundWinnerReward !== null
                ? formatPercentage(context.lastRoundWinnerReward * 100)
                : "—"}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Weight</p>
            <p className="text-lg font-semibold text-white">
              {context.lastRoundWinnerWeight !== null
                ? formatNumber(context.lastRoundWinnerWeight)
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card component for global stats
function GlobalStatsCard({ data }: { data: ValidatorDetailsData }) {
  const stats = data.globalStats;
  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 p-6 shadow-xl backdrop-blur-sm text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <PiChartBar className="h-6 w-6 text-blue-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Global Stats
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Total Evaluations</p>
          <p className="text-2xl font-bold text-white">{formatNumber(stats.totalEvaluations)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/10 p-4 flex flex-col items-center justify-center min-h-[100px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PiCheckCircle className="h-4 w-4 text-emerald-300" />
              <p className="text-xs uppercase tracking-wide text-white/60">Success</p>
            </div>
            <p className="text-lg font-semibold text-emerald-300 text-center">
              {formatNumber(stats.successCount)} ({formatPercentage(stats.successPct)})
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 flex flex-col items-center justify-center min-h-[100px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PiXCircle className="h-4 w-4 text-red-300" />
              <p className="text-xs uppercase tracking-wide text-white/60">Zero</p>
            </div>
            <p className="text-lg font-semibold text-red-300 text-center">
              {formatNumber(stats.zeroCount)} ({formatPercentage(stats.zeroPct)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task row component
function TaskRow({ task }: { task: TaskStats }) {
  return (
    <div className="rounded-md bg-white/3 p-3 border border-white/5 ml-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/90 break-words whitespace-normal" title={task.taskPrompt}>
            {task.taskPrompt || task.taskId}
          </p>
          <p className="text-xs text-white/50 mt-1">Task ID: {task.taskId.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-3 text-xs sm:ml-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-emerald-300 font-semibold">{formatPercentage(task.successPct)}</p>
            <p className="text-white/50">Success</p>
          </div>
          <div className="text-center">
            <p className="text-red-300 font-semibold">{formatPercentage(task.zeroPct)}</p>
            <p className="text-white/50">Zero</p>
          </div>
          <div className="text-center ml-2">
            <p className="text-white font-semibold">{formatNumber(task.totalEvaluations)}</p>
            <p className="text-white/50">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use case row
function UseCaseRow({ useCase }: { useCase: UseCaseStats }) {
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  
  const getBadgeStatus = () => {
    if (useCase.successPct < 10 || useCase.zeroPct > 80) {
      return { type: "danger", text: "Critical" };
    }
    if (useCase.nullPct > 50) {
      return { type: "warning", text: "Warning" };
    }
    return null;
  };

  const badge = getBadgeStatus();
  const hasTasks = useCase.tasks && useCase.tasks.length > 0;
  const isHighPerformance = useCase.successPct >= 80;
  const isMediumPerformance = useCase.successPct >= 60 && useCase.successPct < 80;
  const projectColors = getProjectColors(useCase.useCaseName || useCase.useCaseId);

  return (
    <div
      className="group relative rounded-xl border p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl"
      style={{
        boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)",
        borderColor: `${projectColors.mainColor}99`,
        background: `linear-gradient(to bottom right, ${projectColors.mainColor}26, ${projectColors.mainColor}1A)`,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
            style={{ backgroundColor: projectColors.dotColor }}
          />
          <span className="text-base sm:text-lg font-semibold text-white">
            {useCase.useCaseName || useCase.useCaseId}
          </span>
          {isHighPerformance && (
            <div
              className="flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium border"
              style={{
                backgroundColor: "rgba(253, 245, 230, 0.2)",
                borderColor: "rgba(253, 245, 230, 0.45)",
                color: HIGHLIGHT_COLOR,
              }}
            >
              <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Excellent</span>
              <span className="sm:hidden">Top</span>
            </div>
          )}
          {isMediumPerformance && (
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-indigo-100 rounded-full text-[10px] sm:text-xs font-medium border border-indigo-400/30 bg-transparent">
              <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Good
            </div>
          )}
          {!isHighPerformance && !isMediumPerformance && (
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-red-200 rounded-full text-[10px] sm:text-xs font-medium border border-red-400/40 bg-transparent">
              <PiTrendDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Needs Improvement</span>
              <span className="sm:hidden">Low</span>
            </div>
          )}
          {badge && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                badge.type === "danger"
                  ? "bg-red-500/30 text-red-200 border border-red-400/50"
                  : "bg-yellow-500/30 text-yellow-200 border border-yellow-400/50"
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatPercentage(useCase.successPct)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">
            {useCase.totalEvaluations} requests • {useCase.successCount} successful
          </div>
        </div>
      </div>

      {useCase.successPct > 0 ? (
        <div className="relative">
          <div className="h-3 sm:h-4 w-full rounded-full bg-transparent overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${Math.max(0, Math.min(useCase.successPct, 100))}%`,
                background: `linear-gradient(90deg, ${projectColors.mainColor} 0%, rgba(253, 245, 230, 0.85) 100%)`,
                boxShadow: "0 8px 25px rgba(253, 245, 230, 0.25)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              <div
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm"
                style={{
                  backgroundColor: HIGHLIGHT_COLOR,
                  opacity: useCase.successPct > 5 ? 1 : 0,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/60">
            <span>0%</span>
            <span className="hidden sm:inline">25%</span>
            <span>50%</span>
            <span className="hidden sm:inline">75%</span>
            <span>100%</span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-white/70">No success rate to display</div>
      )}

      {/* Tasks list */}
      {hasTasks && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setIsTasksExpanded(!isTasksExpanded)}
            className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors"
          >
            {isTasksExpanded ? (
              <PiCaretUp className="h-3 w-3" />
            ) : (
              <PiCaretDown className="h-3 w-3" />
            )}
            <span>Tasks ({useCase.tasks.length})</span>
          </button>
          {isTasksExpanded && (
            <div className="mt-2 space-y-2">
              {useCase.tasks.map((task, idx) => (
                <TaskRow key={idx} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Performance Analytics section (left side)
function PerformanceAnalytics({
  data,
  selectedWeb,
  setSelectedWeb,
  selectedRound,
  setSelectedRound,
}: {
  data: ValidatorDetailsData;
  selectedWeb: string | null;
  setSelectedWeb: (web: string | null) => void;
  selectedRound: number | null;
  setSelectedRound: (round: number | null) => void;
}) {
  const websiteOptions = [
    { value: "__all__", label: "All Websites" },
    ...data.webs.map((web) => ({
      value: web.webId,
      label: capitalizeWebName(web.webName || web.webId),
    })),
  ];

  const roundOptions = [
    { value: "__all__", label: "All Rounds" },
    ...(data.availableRounds || []).map((round) => ({
      value: round.toString(),
      label: `Round ${round}`,
    })),
  ];

  const chartData = selectedWeb && selectedWeb !== "__all__"
    ? (() => {
        const selectedWebData = data.webs.find((w) => w.webId === selectedWeb);
        if (!selectedWebData) return [];
        return selectedWebData.useCases.map((uc, idx) => ({
          name: uc.useCaseName || uc.useCaseId,
          successPct: uc.successPct,
          total: uc.totalEvaluations,
          successCount: uc.successCount,
          colorIndex: idx,
        }));
      })()
    : data.webs.map((web, idx) => ({
        name: capitalizeWebName(web.webName || web.webId),
        successPct: web.successPct,
        total: web.totalEvaluations,
        successCount: web.successCount,
        colorIndex: idx,
      }));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-transparent p-6 text-white">
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
              <PiChartBar className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Performance Analytics
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70">
                Success rates and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Select
              options={roundOptions}
              value={roundOptions.find(
                (opt) => opt.value === (selectedRound !== null ? selectedRound.toString() : "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setSelectedRound(
                  option.value === "__all__" ? null : parseInt(option.value, 10)
                )
              }
              className="w-full sm:w-[140px] text-sm rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-100 focus:border-purple-400/60 focus:ring-0 hover:border-purple-400/50"
            />
            <Select
              options={websiteOptions}
              value={websiteOptions.find(
                (opt) => opt.value === (selectedWeb ?? "__all__")
              )}
              onChange={(option: { label: string; value: string }) =>
                setSelectedWeb(
                  option.value === "__all__" ? null : option.value
                )
              }
              className="w-full sm:w-[160px] text-sm rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-sky-600/20 text-blue-100 focus:border-blue-400/60 focus:ring-0 hover:border-blue-400/50"
            />
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="relative space-y-6">
          {chartData.map((item, index) => {
            const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
            const projectColors = getProjectColors(item.name);
            const isHighPerformance = item.successPct >= 80;
            const isMediumPerformance = item.successPct >= 60 && item.successPct < 80;

            // If showing use cases, render UseCaseRow
            if (selectedWeb && selectedWeb !== "__all__") {
              const selectedWebData = data.webs.find((w) => w.webId === selectedWeb);
              const useCase = selectedWebData?.useCases.find(
                (uc) => (uc.useCaseName || uc.useCaseId) === item.name
              );
              if (useCase) {
                return <UseCaseRow key={`${item.name}-${index}`} useCase={useCase} />;
              }
            }

            // Otherwise render web card
            return (
              <div
                key={`${item.name}-${index}`}
                className="group relative rounded-xl border p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: "0 20px 45px rgba(35, 43, 72, 0.25)",
                  borderColor: `${projectColors.mainColor}99`,
                  background: `linear-gradient(to bottom right, ${projectColors.mainColor}26, ${projectColors.mainColor}1A)`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: projectColors.dotColor }}
                    />
                    <span className="text-base sm:text-lg font-semibold text-white">
                      {capitalizeWebName(item.name)}
                    </span>
                    {isHighPerformance && (
                      <div
                        className="flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium border"
                        style={{
                          backgroundColor: "rgba(253, 245, 230, 0.2)",
                          borderColor: "rgba(253, 245, 230, 0.45)",
                          color: HIGHLIGHT_COLOR,
                        }}
                      >
                        <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Excellent</span>
                        <span className="sm:hidden">Top</span>
                      </div>
                    )}
                    {isMediumPerformance && (
                      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-indigo-100 rounded-full text-[10px] sm:text-xs font-medium border border-indigo-400/30 bg-transparent">
                        <PiTrendUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Good
                      </div>
                    )}
                    {!isHighPerformance && !isMediumPerformance && (
                      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-red-200 rounded-full text-[10px] sm:text-xs font-medium border border-red-400/40 bg-transparent">
                        <PiTrendDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Needs Improvement</span>
                        <span className="sm:hidden">Low</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      {item.successPct.toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {item.total} requests • {item.successCount} successful
                    </div>
                  </div>
                </div>

                {item.successPct > 0 ? (
                  <div className="relative">
                    <div className="h-3 sm:h-4 w-full rounded-full bg-transparent overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{
                          width: `${Math.max(0, Math.min(item.successPct, 100))}%`,
                          background: `linear-gradient(90deg, ${colorClass} 0%, rgba(253, 245, 230, 0.85) 100%)`,
                          boxShadow: "0 8px 25px rgba(253, 245, 230, 0.25)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        <div
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm"
                          style={{
                            backgroundColor: HIGHLIGHT_COLOR,
                            opacity: item.successPct > 5 ? 1 : 0,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/60">
                      <span>0%</span>
                      <span className="hidden sm:inline">25%</span>
                      <span>50%</span>
                      <span className="hidden sm:inline">75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-white/70">No success rate to display</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/60">No data available</p>
        </div>
      )}
    </div>
  );
}

// Summary section (right side) with pie chart
function SummarySection({
  data,
  selectedWeb,
  onWebClick,
}: {
  data: ValidatorDetailsData;
  selectedWeb: string | null;
  onWebClick: (webId: string | null) => void;
}) {
  const stats = selectedWeb && selectedWeb !== "__all__"
    ? (() => {
        const web = data.webs.find((w) => w.webId === selectedWeb);
        return web
          ? {
              successCount: web.successCount,
              zeroCount: web.zeroCount,
              totalEvaluations: web.totalEvaluations,
              successPct: web.successPct,
            }
          : data.globalStats;
      })()
    : data.globalStats;

  const pieData = preparePieChartData(stats);
  const displayData = selectedWeb && selectedWeb !== "__all__"
    ? (() => {
        const web = data.webs.find((w) => w.webId === selectedWeb);
        return web
          ? web.useCases.map((uc, idx) => ({
              label: uc.useCaseName || uc.useCaseId,
              value: uc.successPct,
              total: uc.totalEvaluations,
              successCount: uc.successCount,
              webId: web.webId, // Keep reference to web for navigation
            }))
          : [];
      })()
    : data.webs.map((web, idx) => ({
        label: capitalizeWebName(web.webName || web.webId),
        value: web.successPct,
        total: web.totalEvaluations,
        successCount: web.successCount,
        webId: web.webId, // Keep reference to web for navigation
      }));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/24 to-purple-500/25 p-6 shadow-2xl backdrop-blur-xl text-white">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div
        className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(253, 245, 230, 0.18)" }}
      />
      
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl border border-white/15 bg-white/10 p-2 shadow-lg shadow-blue-500/25">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
            Summary
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Performance Breakdown
        </p>
      </div>

      {/* Content */}
      <div className="relative text-white/80">
        <div className="h-[240px] w-full @sm:py-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={85}
                outerRadius={100}
                paddingAngle={5}
                cornerRadius={30}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                onClick={(clickedData, index) => {
                  // Handle click on pie chart segment
                  if (selectedWeb && selectedWeb !== "__all__") {
                    // If showing use cases, clicking on pie chart should reset to all websites
                    onWebClick(null);
                  }
                  // If showing all websites, the pie chart shows global stats (Success/Zero)
                  // so clicking on it doesn't select a specific web - use the list below instead
                }}
              >
                <Label
                  position="center"
                  content={(props) => (
                    <CenterLabel
                      value={formatPercentage(stats.successPct)}
                      total={formatNumber(stats.totalEvaluations)}
                      viewBox={props.viewBox}
                    />
                  )}
                />
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.fill}
                    stroke={entry.stroke}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {displayData.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            {displayData.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => {
                  if (selectedWeb && selectedWeb !== "__all__") {
                    // Already showing use cases, clicking on a use case should reset to all websites
                    // (or could navigate to use case detail in the future)
                    onWebClick(null);
                    return;
                  }
                  // Click on web, select it to show use cases
                  const web = data.webs.find((w) => {
                    const webName = capitalizeWebName(w.webName || w.webId);
                    return webName === item.label || w.webId === item.label || w.webId === item.webId;
                  });
                  if (web) {
                    onWebClick(web.webId);
                  }
                }}
                className={cn(
                  "flex items-center justify-between gap-3 py-3 px-2 last:border-b-0 hover:bg-white/10 transition-colors text-left cursor-pointer"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: PROGRESS_COLORS[idx % PROGRESS_COLORS.length],
                    }}
                  />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/70">
                    {Math.round(item.total)} requests •{" "}
                    {Math.round(item.successCount)} successes
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/70">
            Summary metrics are not available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidatorDetailsPage() {
  const { uid } = useParams();
  const validatorUid = Array.isArray(uid) ? uid[0] : (uid as string);
  const [data, setData] = useState<ValidatorDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeb, setSelectedWeb] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  useEffect(() => {
    if (!validatorUid) {
      setError("Validator UID is required");
      setLoading(false);
      return;
    }

    const uidNum = parseInt(validatorUid, 10);
    if (isNaN(uidNum)) {
      setError("Invalid validator UID");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await validatorsRepository.getValidatorDetails(uidNum, selectedRound);
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load validator details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [validatorUid, selectedRound]);

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto bg-transparent">
        <PageHeader title="Validator Details" />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Placeholder key={i} className="h-64" />
            ))}
          </div>
          <Placeholder className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-[1280px] mx-auto bg-transparent">
        <PageHeader title="Validator Details" />
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300 font-semibold">
            {error || "No data available for this validator"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-transparent">
      <PageHeader
        title={`Validator ${data.validator.uid} Details`}
        description="Evaluation diagnostics by web and use case"
      />

      {/* Three cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ValidatorDetailsCard data={data} />
        <GlobalStatsCard data={data} />
        <LastRoundWinnerCard data={data} />
      </div>

      {/* Main content: Performance Analytics and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left: Performance Analytics */}
        <PerformanceAnalytics
          data={data}
          selectedWeb={selectedWeb}
          setSelectedWeb={setSelectedWeb}
          selectedRound={selectedRound}
          setSelectedRound={setSelectedRound}
        />

        {/* Right: Summary with Pie Chart */}
        <SummarySection
          data={data}
          selectedWeb={selectedWeb}
          onWebClick={setSelectedWeb}
        />
      </div>

    </div>
  );
}
