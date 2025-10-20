"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  PiArrowSquareOutDuotone,
  PiClock,
  PiCopyDuotone,
  PiGithubLogoDuotone,
  PiHash,
  PiKey,
  PiTarget,
} from "react-icons/pi";
import { useTaskPersonas } from "@/services/hooks/useTask";
import { useAgent } from "@/services/hooks/useAgents";
import Placeholder, { StatsCardPlaceholder } from "@/app/shared/placeholder";
import { CardLoadingSkeleton } from "@/app/shared/loading-screen";
import { resolveAssetUrl } from "@/services/utils/assets";

function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) {
    return "—";
  }
  if (value.length <= visible * 2) {
    return value;
  }
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function formatStatus(value: string) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

function formatUseCase(value?: string | null) {
  if (!value) return "Unknown use case";
  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function TaskPersonasDynamic() {
  const { id } = useParams();
  const taskId = Array.isArray(id) ? id[0] : id ?? "";
  const { personas, isLoading, error } = useTaskPersonas(taskId);

  // Fetch full agent data to get UID and hotkey (when available)
  const { data: agentDetail } = useAgent(personas?.agent.id);
  const agentData = agentDetail?.agent;
  const canCopyHotkey =
    typeof navigator !== "undefined" && typeof navigator.clipboard !== "undefined";

  if (isLoading) {
    return <CardLoadingSkeleton count={4} className="mb-6" />;
  }

  if (error || !personas) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }, (_, index) => (
          <StatsCardPlaceholder key={index} />
        ))}
      </div>
    );
  }

  const roundStatusLabel = formatStatus(personas.round.status);
  const validatorImage = personas.validator.image
    ? resolveAssetUrl(personas.validator.image)
    : resolveAssetUrl("/validators/Other.png");
  const agentImage = personas.agent.image
    ? resolveAssetUrl(personas.agent.image)
    : "/images/autoppia-logo.png";
  const agentUid = agentData?.uid != null ? `UID ${agentData.uid}` : "UID unavailable";
  const agentHotkey = agentData?.hotkey;
  const taskUseCase = formatUseCase(personas.task.useCase);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-6">
      {/* Round Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <div className="pointer-events-none absolute -left-10 top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
        <header className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <PiClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Round</p>
              <p className="text-3xl font-semibold text-white leading-tight">
                #{personas.round.id}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200 capitalize">
            {roundStatusLabel}
          </span>
        </header>
        <dl className="relative mt-4 space-y-2 text-xs text-slate-300">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Starts</p>
            <p className="font-mono text-sm text-white">
              {personas.round.startTime ? new Date(personas.round.startTime).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Ends</p>
            <p className="font-mono text-sm text-white">
              {personas.round.endTime ? new Date(personas.round.endTime).toLocaleString() : "—"}
            </p>
          </div>
        </dl>
      </section>

      {/* Validator Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-500/10 blur-[110px]" />
        <header className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-700/20 bg-slate-800/20">
            <Image
              src={validatorImage}
              alt={personas.validator.name}
              width={48}
              height={48}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-400">Validator</p>
            <p className="text-sm font-semibold text-white truncate">
              {personas.validator.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {truncateMiddle(personas.validator.id)}
            </p>
          </div>
          {(personas.validator.website || personas.validator.github) && (
            <div className="ml-auto flex items-center gap-2">
              {personas.validator.website && (
                <a
                  href={personas.validator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-200 transition hover:border-sky-300"
                  title="Open website"
                >
                  <PiArrowSquareOutDuotone className="h-4 w-4" />
                </a>
              )}
              {personas.validator.github && (
                <a
                  href={personas.validator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-200 transition hover:border-indigo-300"
                  title="Open GitHub"
                >
                  <PiGithubLogoDuotone className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </header>
      </section>

      {/* Agent Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <div className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <header className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-700/20 bg-slate-800/20">
            <Image
              src={agentImage}
              alt={personas.agent.name}
              width={48}
              height={48}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-400 capitalize">
              {personas.agent.type} agent
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {personas.agent.name}
            </p>
            <p className="text-[11px] text-slate-400">{agentUid}</p>
          </div>
        </header>
        <div className="relative mt-4 rounded-lg border border-slate-700/20 bg-slate-800/30 px-3 py-2 text-xs text-slate-300">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <PiKey className="h-3.5 w-3.5" />
              Hotkey
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white">
                {truncateMiddle(agentHotkey)}
              </span>
              {agentHotkey && canCopyHotkey && (
                <button
                  onClick={() => navigator.clipboard.writeText(agentHotkey)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 transition hover:border-emerald-300"
                  title="Copy hotkey"
                  type="button"
                >
                  <PiCopyDuotone className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Task Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
        <header className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
            <PiTarget className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-400">Task</p>
            <p className="text-sm font-semibold text-white truncate">
              {personas.task.website || "Unknown website"}
            </p>
            <p className="text-[11px] text-slate-400">
              {truncateMiddle(personas.task.id)}
            </p>
          </div>
        </header>
        <dl className="relative mt-4 space-y-2 text-xs text-slate-300">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Use Case
            </p>
            <p className="text-sm font-medium text-white">
              {taskUseCase}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Score
            </p>
            <p className="text-sm font-semibold text-emerald-300">
              {(personas.task.score * 100).toFixed(1)}%
            </p>
          </div>
        </dl>
      </section>
    </div>
  );
}
