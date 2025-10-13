"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Text } from "rizzui";
import {
  PiGlobe,
  PiTarget,
  PiChartBar,
  PiTimer,
  PiFileText,
  PiPlay,
  PiHash,
} from "react-icons/pi";
import { useTaskDetails } from "@/services/hooks/useTask";
import LoadingScreen from "@/app/shared/loading-screen";
import Placeholder, { TextPlaceholder } from "@/app/shared/placeholder";

const toTitleCase = (value?: string) =>
  value
    ? value
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "—";

export default function TaskDetailsDynamic() {
  const { id } = useParams();
  const { details, isLoading, error } = useTaskDetails(id as string);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="hidden md:flex flex-col space-y-6">
          <div className="grid grid-cols-6 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Placeholder variant="circular" width={16} height={16} />
                  <Placeholder height="1.25rem" width="60%" />
                </div>
                <Placeholder height="0.75rem" width="80%" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="md:hidden flex flex-col space-y-4">
          <div className="text-center">
            <Placeholder height="2rem" width="40%" className="mx-auto mb-2" />
            <Placeholder height="0.75rem" width="60%" className="mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="text-center">
                <Placeholder height="1.5rem" width="60%" className="mx-auto mb-1" />
                <Placeholder height="0.75rem" width="80%" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Task Details</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Website",
      value: toTitleCase(details.website),
      icon: <PiGlobe className="h-5 w-5" />,
      accent: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      label: "Use Case",
      value: toTitleCase(details.useCase),
      icon: <PiTarget className="h-5 w-5" />,
      accent: "bg-emerald-100 text-emerald-600 border-emerald-200",
    },
    {
      label: "Score",
      value: `${Math.round(details.score * 100)}%`,
      icon: <PiChartBar className="h-5 w-5" />,
      accent: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      label: "Duration",
      value: `${details.duration}s`,
      icon: <PiTimer className="h-5 w-5" />,
      accent: "bg-orange-100 text-orange-600 border-orange-200",
    },
    {
      label: "Actions",
      value: details.performance.totalActions,
      icon: <PiFileText className="h-5 w-5" />,
      accent: "bg-indigo-100 text-indigo-600 border-indigo-200",
    },
    {
      label: "Run ID",
      value: details.agentRunId ?? "—",
      icon: <PiHash className="h-5 w-5" />,
      accent: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      label: "Status",
      value: toTitleCase(details.status),
      icon: <PiPlay className="h-5 w-5" />,
      accent: "bg-teal-100 text-teal-600 border-teal-200",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="hidden md:flex flex-col space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className={`flex flex-col items-center gap-2 rounded-xl border ${metric.accent} px-3 py-4 text-center shadow-sm`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                {metric.icon}
              </div>
              <div className="text-base font-semibold text-gray-900">
                {metric.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Task Prompt */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Task Prompt</div>
          <div className="text-gray-800 text-sm leading-relaxed">
            {details.prompt}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {details.performance.successfulActions}
            </div>
            <div className="text-xs text-gray-600">Successful Actions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              {details.performance.failedActions}
            </div>
            <div className="text-xs text-gray-600">Failed Actions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {details.performance.averageActionDuration.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-600">Avg Action Duration</div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-4 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className={`flex flex-col items-center gap-1 rounded-lg border ${metric.accent} px-3 py-3 text-center shadow-sm`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
                {metric.icon}
              </div>
              <div className="text-sm font-semibold text-gray-900">{metric.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Task Prompt</div>
          <div className="text-gray-800 text-sm leading-relaxed">
            {details.prompt}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {details.performance.successfulActions}
            </div>
            <div className="text-xs text-gray-600">Successful</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              {details.performance.failedActions}
            </div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {details.performance.averageActionDuration.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-600">Avg Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
