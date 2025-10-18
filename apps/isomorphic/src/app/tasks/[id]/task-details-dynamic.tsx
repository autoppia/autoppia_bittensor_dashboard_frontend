"use client";

import { PiChartBar, PiClock, PiGlobe, PiTarget } from "react-icons/pi";
import type { TaskDetails } from "@/services/api/types/tasks";
import Placeholder from "@/app/shared/placeholder";

type TaskDetailsDynamicProps = {
  details?: TaskDetails | null;
  isLoading?: boolean;
  error?: string | null;
};

const toTitleCase = (value?: string | null) =>
  value
    ? value
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "—";

const formatScore = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }
  const normalized = value > 1 ? value : value * 100;
  const percentage = value > 1 ? value.toFixed(1) : normalized.toFixed(1);
  return `${percentage}%`;
};

const formatDuration = (seconds?: number | null) => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) {
    return "0s";
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
};

const formatWebsiteName = (value?: string | null) => {
  if (!value) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    const hostname = url.hostname.replace(/^www\./i, "");
    const base = hostname.split(".")[0];
    return toTitleCase(base || hostname);
  } catch {
    const sanitized = trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/\?.*$/, "")
      .replace(/\/.*$/, "");
    if (!sanitized) {
      return toTitleCase(trimmed);
    }
    const base = sanitized.split(".")[0];
    return toTitleCase(base || sanitized);
  }
};

export default function TaskDetailsDynamic({
  details,
  isLoading = false,
  error,
}: TaskDetailsDynamicProps) {
  if (isLoading && !details) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-2xl mb-8">
        <div className="pointer-events-none absolute -right-24 top-0 h-60 w-60 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-60px] left-8 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`task-overview-loading-${index}`}
              className="rounded-2xl border border-slate-700/25 bg-slate-900/40 p-4"
            >
              <Placeholder height="1.5rem" width="55%" className="mb-3" />
              <Placeholder height="0.9rem" width="40%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((error && !details) || !details) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-red-900/20 p-6 shadow-2xl mb-8">
        <div className="pointer-events-none absolute -right-12 top-6 h-56 w-56 rounded-full bg-red-400/20 blur-[120px]" />
        <div className="relative text-center">
          <div className="text-red-200 text-lg font-semibold mb-2">
            Failed to load task overview
          </div>
          <div className="text-sm text-red-100/80">
            {error || "An unexpected error occurred while fetching task data."}
          </div>
        </div>
      </div>
    );
  }

  const normalizedScore =
    typeof details.score === "number"
      ? details.score > 1
        ? details.score
        : details.score * 100
      : 0;
  const scorePercent = Number.isFinite(normalizedScore)
    ? Math.min(Math.max(Number(normalizedScore.toFixed(1)), 0), 100)
    : 0;
  const scoreDescriptor =
    scorePercent >= 90
      ? "Top tier execution"
      : scorePercent >= 70
        ? "Consistently strong"
        : scorePercent > 0
          ? "Needs improvement"
          : "Awaiting evaluation";
  const scoreRingStyle = {
    background: `conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.88) ${scorePercent}%, rgba(148,163,184,0.2) ${scorePercent}% 100%)`,
  };

  const formattedScore = formatScore(details.score);
  const formattedDuration = formatDuration(details.duration);
  const formattedWebsite = formatWebsiteName(details.website);
  const formattedUseCase = toTitleCase(details.useCase);

  return (
    <div className="mb-8 grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
      <article className="group relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/80 p-6 shadow-[0_18px_45px_rgba(16,185,129,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/30 sm:p-8">
        <div className="pointer-events-none absolute -right-10 top-6 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl transition group-hover:bg-emerald-400/30" />
        <div className="pointer-events-none absolute bottom-4 left-6 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl transition group-hover:bg-sky-400/25" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/90">
              <PiChartBar className="h-4 w-4" />
              Score
            </div>
            <h3 className="mt-4 text-4xl font-semibold text-white sm:text-[2.75rem]">
              {formattedScore}
            </h3>
            <p className="mt-3 text-sm text-slate-200/80">{scoreDescriptor}.</p>
          </div>
          <div className="relative flex items-center justify-center">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full border border-emerald-400/10 bg-slate-900/40 p-[0.35rem] shadow-inner after:absolute after:inset-2 after:rounded-full after:bg-slate-950/80"
              style={scoreRingStyle}
            >
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950/90">
                <span className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  Score
                </span>
                <span className="mt-1 text-3xl font-semibold text-white">
                  {formattedScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="space-y-5">
        <article className="relative overflow-hidden rounded-3xl border border-sky-400/10 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/30">
          <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-sky-400/10 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
              <PiClock className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Response Time
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {formattedDuration}
              </p>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-900/55 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25">
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
                <PiGlobe className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Website
                </p>
                <p className="mt-1 text-lg font-semibold text-white line-clamp-1">
                  {formattedWebsite || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-200">
                <PiTarget className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Use Case
                </p>
                <p className="mt-1 text-lg font-semibold text-white line-clamp-1">
                  {formattedUseCase || "—"}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
