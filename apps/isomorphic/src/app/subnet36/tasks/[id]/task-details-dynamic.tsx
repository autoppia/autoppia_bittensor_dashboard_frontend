"use client";

import type React from "react";
import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  PiCheckCircle,
  PiClock,
  PiCopy,
  PiGithubLogo,
  PiHourglass,
  PiShieldCheck,
  PiTarget,
  PiTrendUp,
  PiUser,
  PiWarningCircle,
  PiXCircle,
  PiGlobe,
  PiLightbulb,
} from "react-icons/pi";
import type { TaskDetails } from "@/services/api/types/tasks";
import { resolveAssetUrl } from "@/services/utils/assets";
import { routes } from "@/config/routes";
import { websitesDataMap } from "@/data/websites-data";

const truncateMiddle = (value?: string | null, visible = 8) => {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
};

const formatPercent = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "0%";
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
};

const formatDuration = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (value < 60) return `${Math.round(value)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}m ${seconds}s`;
};

const formatNumber = (value?: number | null, digits = 2) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-xs font-semibold text-emerald-400">✓</span>
      ) : (
        <PiCopy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

type TaskDetailsDynamicProps = {
  details?: TaskDetails | null;
  isLoading?: boolean;
  error?: string | null;
  taskId: string;
  websiteNameParam?: string | null;
  websiteColorParam?: string | null;
};

export default function TaskDetailsDynamic({
  details,
  isLoading = false,
  error,
  taskId,
  websiteNameParam,
  websiteColorParam,
}: TaskDetailsDynamicProps) {
  if (isLoading && !details) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
          <div className="h-8 w-64 bg-slate-700/50 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-700/30 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if ((error && !details) || !details) {
    return (
      <div className="bg-red-950/30 backdrop-blur-sm rounded-2xl border border-red-600/50 p-8">
        <div className="flex items-center gap-3 text-red-400">
          <PiWarningCircle className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-semibold">
              Failed to load task details
            </h3>
            <p className="text-sm text-red-300 mt-1">
              {error || "An unexpected error occurred."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const relationships = details.relationships;
  const roundInfo = relationships?.round;
  const validatorInfo = relationships?.validator;
  const minerInfo = relationships?.miner;
  const evaluationInfo = relationships?.evaluation;

  const score =
    typeof evaluationInfo?.finalScore === "number"
      ? evaluationInfo.finalScore
      : details.score;
  const duration = evaluationInfo?.evaluationTime ?? details.duration;
  const status = evaluationInfo?.status ?? details.status;

  const getStatusConfig = (status?: string) => {
    if (!status || status === "null" || status === "undefined") {
      return {
        icon: PiClock,
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        label: "Unknown",
      };
    }
    const normalized = status.toLowerCase().trim();
    if (
      normalized.includes("success") ||
      normalized.includes("complete") ||
      normalized.includes("completed")
    ) {
      return {
        icon: PiCheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        label: "Success",
      };
    }
    if (
      normalized.includes("running") ||
      normalized.includes("pending") ||
      normalized.includes("in_progress")
    ) {
      return {
        icon: PiHourglass,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        label: "Running",
      };
    }
    if (normalized === "failed" || normalized === "error") {
      return {
        icon: PiXCircle,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        label: "Failed",
      };
    }
    // Default case for any other status
    return {
      icon: PiClock,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      label: status.charAt(0).toUpperCase() + status.slice(1),
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig?.icon;

  const validatorImage = validatorInfo?.hotkey
    ? resolveAssetUrl(
        `/validators/${validatorInfo.hotkey}.png`,
        resolveAssetUrl("/validators/Other.png")
      )
    : resolveAssetUrl("/validators/Other.png");

  const minerImage = minerInfo?.image
    ? resolveAssetUrl(
        minerInfo.image,
        resolveAssetUrl(
          minerInfo?.isSota
            ? "/validators/Other.png"
            : "/images/autoppia-logo.png"
        )
      )
    : resolveAssetUrl(
        minerInfo?.isSota
          ? "/validators/Other.png"
          : "/images/autoppia-logo.png"
      );

  const scoreValue = formatPercent(score);
  const scoreNumber =
    typeof score === "number" ? (score > 1 ? score : score * 100) : 0;

  const websiteData = details.website ? websitesDataMap[details.website] : null;
  const websiteName =
    websiteNameParam ||
    websiteData?.name ||
    details.website ||
    "Unknown Website";
  const websiteColor = websiteColorParam || websiteData?.color || "#9333EA";
  const websiteUrl = details.website || "";
  const useCaseName = details.useCase || "—";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-2">Task Details</h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <span className="text-xs text-slate-400">Task ID</span>
                <span className="text-xs font-mono text-white">
                  {truncateMiddle(taskId, 6)}
                </span>
                <CopyButton text={taskId} />
              </div>
              {details.agentRunId && (
                <Link
                  href={`${routes.agent_run}/${details.agentRunId}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                >
                  <span className="text-xs text-cyan-300">Run ID</span>
                  <span className="text-xs font-mono text-white">
                    {truncateMiddle(details.agentRunId, 6)}
                  </span>
                  <CopyButton text={details.agentRunId} />
                </Link>
              )}
              {evaluationInfo?.evaluationId && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50">
                  <span className="text-xs text-slate-400">Eval ID</span>
                  <span className="text-xs font-mono text-white">
                    {truncateMiddle(evaluationInfo.evaluationId, 6)}
                  </span>
                  <CopyButton text={evaluationInfo.evaluationId} />
                </div>
              )}
            </div>
          </div>
          {statusConfig && StatusIcon && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} border ${statusConfig.border}`}
            >
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              <span className={`text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-orange-500/30 p-4 hover:border-orange-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-orange-400/50 bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PiClock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-orange-300 uppercase tracking-wider">
                  Round
                </span>
                <h3 className="text-xl font-bold text-white">
                  #{roundInfo?.roundNumber ?? "—"}
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded whitespace-nowrap">
              Completed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">Round ID</span>
              <div className="flex items-center gap-1">
                <span className="text-white font-mono text-[11px]">
                  {truncateMiddle(roundInfo?.validatorRoundId, 4)}
                </span>
                {roundInfo?.validatorRoundId && (
                  <CopyButton text={roundInfo.validatorRoundId} />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">Epoch Start</span>
              <span className="text-orange-400 font-semibold">
                {roundInfo?.startEpoch ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-4 hover:border-emerald-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border-2 border-emerald-400/50 bg-slate-700/50 shadow-lg">
                <Image
                  src={"/validators/yuma.png"}
                  alt="Validator"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PiShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                    Validator
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white truncate">
                  {validatorInfo?.name || truncateMiddle(validatorInfo?.hotkey)}
                </h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                UID:{" "}
                <span className="text-white font-semibold">
                  {validatorInfo?.uid ?? "—"}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">
                  Hotkey:{" "}
                  <span className="text-white font-mono">
                    {truncateMiddle(validatorInfo?.hotkey, 3)}
                  </span>
                </span>
                {validatorInfo?.hotkey && (
                  <CopyButton text={validatorInfo.hotkey} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">Stake</span>
              <span className="text-emerald-400 font-semibold">
                {validatorInfo?.stake
                  ? `${formatNumber(validatorInfo.stake)} TAO`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">vTrust</span>
              <span className="text-cyan-400 font-semibold">
                {validatorInfo?.vtrust
                  ? formatNumber(validatorInfo.vtrust)
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-4 hover:border-cyan-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border-2 border-cyan-400/50 bg-slate-700/50 shadow-lg">
                <Image
                  src={"/validators/Other.png"}
                  alt="Miner"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PiUser className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">
                    {minerInfo?.isSota ? "SOTA Agent" : "Miner"}
                  </span>
                  {minerInfo?.isSota && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded">
                      SOTA
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white truncate">
                  {minerInfo?.name ?? "Unknown Miner"}
                </h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                UID:{" "}
                <span className="text-white font-semibold">
                  {minerInfo?.uid ?? "—"}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">
                  Hotkey:{" "}
                  <span className="text-white font-mono">
                    {truncateMiddle(minerInfo?.hotkey, 3)}
                  </span>
                </span>
                {minerInfo?.hotkey && <CopyButton text={minerInfo.hotkey} />}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">GitHub</span>
              {minerInfo?.github ? (
                <a
                  href={minerInfo.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 font-semibold transition-all"
                >
                  <PiGithubLogo className="w-3.5 h-3.5" />
                  <span className="text-[10px]">View Repo</span>
                </a>
              ) : (
                <span className="text-white">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="backdrop-blur-sm rounded-2xl p-5 shadow-xl transition-all"
          style={{
            background: `linear-gradient(135deg, ${websiteColor}15, rgb(30 41 59 / 0.9), rgb(15 23 42 / 0.9))`,
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: `${websiteColor}50`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${websiteColor}80`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${websiteColor}50`;
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${websiteColor}CC, ${websiteColor})`,
              }}
            >
              <PiGlobe className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Website
              </div>
              <div className="text-2xl font-bold text-white truncate">
                {websiteNameParam}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-700/30">
              <span className="text-slate-400">URL</span>
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold transition-colors truncate max-w-[180px]"
                  style={{ color: websiteColor }}
                  title={websiteUrl}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <span className="truncate">
                    {websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                  <PiGlobe className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-white">—</span>
              )}
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Use Case</span>
              <span
                className="font-semibold truncate max-w-[180px]"
                style={{ color: websiteColor }}
                title={useCaseName}
              >
                {useCaseName}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/30 shadow-xl hover:border-emerald-500/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <PiTarget className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Score
              </div>
              <div className="text-5xl font-bold text-white">{scoreValue}</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Final evaluation score.
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-5 border border-cyan-500/30 shadow-xl hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <PiClock className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Duration
              </div>
              <div className="text-5xl font-bold text-white">
                {formatDuration(duration)}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Time taken from task submission to evaluation completion.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <PiClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Task Prompt</h3>
            <p className="text-xs text-purple-300">
              Instructions provided for this task
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <PiTarget className="w-4 h-4 text-purple-400" />
            <span>Example Prompt:</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-5 border border-purple-500/20 backdrop-blur-sm">
            <p className="text-sm text-slate-200 leading-relaxed italic">
              &quot;{details.prompt || "No prompt provided for this task."}
              &quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
