"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  PiClockDuotone,
  PiInfoDuotone,
  PiHashDuotone,
  PiKeyDuotone,
} from "react-icons/pi";
import {
  useAgentRunPersonas,
  useAgentRunSummary,
} from "@/services/hooks/useAgentRun";
import Placeholder from "@/app/shared/placeholder";

function resolveImageSrc(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
) {
  if (!src || typeof src !== "string") return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

export default function AgentRunPersonasDynamic() {
  const { id } = useParams();
  const { personas, isLoading, error } = useAgentRunPersonas(id as string);
  const { summary } = useAgentRunSummary(id as string);

  if (isLoading || error || !personas) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-[150px] items-center gap-5 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-5 shadow"
          >
            <Placeholder
              variant="circular"
              width={56}
              height={56}
              className="bg-slate-700"
            />
            <div className="flex-1 space-y-2">
              <Placeholder height="1.25rem" width="60%" className="bg-slate-700" />
              <Placeholder height="0.9rem" width="40%" className="bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const roundStartLabel = personas.round.startTime
    ? new Date(personas.round.startTime).toLocaleString()
    : "—";

  const validatorHotkey =
    summary?.validatorId || personas.validator.id || personas.validator.name;
  const taoStatsUrl = validatorHotkey
    ? `https://taostats.io/validators/${validatorHotkey}`
    : personas.validator.website || null;

  const agentUid = personas.agent.id || summary?.agentId;
  const agentHotkey = summary?.agentId || personas.agent.id;

  return (
    <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex min-h-[150px] items-center gap-5 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 px-6 py-5 shadow">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
          <PiClockDuotone className="h-7 w-7" />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Round
          </p>
          <p className="text-2xl font-semibold text-amber-50">
            #{personas.round.id}
          </p>
          <p className="text-sm text-amber-100/80">
            {personas.round.status}
            {roundStartLabel !== "—" ? ` · ${roundStartLabel}` : null}
          </p>
        </div>
      </div>

      <div className="flex min-h-[150px] items-center gap-5 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-blue-500/20 px-6 py-5 shadow">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/40 bg-white/10 p-2 shadow-lg">
          <Image
            src={resolveImageSrc(personas.validator.image, "/validators/Other.png")}
            alt={personas.validator.name}
            fill
            sizes="80px"
            className="rounded-xl object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
            Validator
          </p>
          <p className="truncate text-xl font-semibold text-blue-50">
            {personas.validator.name}
          </p>
          <p className="text-sm text-blue-100/80">
            {truncateMiddle(validatorHotkey)}
          </p>
        </div>
        {taoStatsUrl && (
          <a
            href={taoStatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-blue-50 transition hover:bg-white/20"
          >
            <PiInfoDuotone className="h-5 w-5" />
          </a>
        )}
      </div>

      <div className="flex min-h-[150px] items-center gap-5 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 px-6 py-5 shadow">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/40 bg-white/10 p-2 shadow-lg">
          <Image
            src={resolveImageSrc(personas.agent.image)}
            alt={personas.agent.name}
            fill
            sizes="80px"
            className="rounded-xl object-contain"
          />
        </div>
        <div className="min-w-0 flex-1 text-emerald-50 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Agent
          </p>
          <p className="truncate text-xl font-semibold">{personas.agent.name}</p>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-emerald-100/80">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2 py-1">
              <PiHashDuotone className="h-3.5 w-3.5 text-emerald-200" />
              <span>{agentUid ?? "—"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2 py-1">
              <PiKeyDuotone className="h-3.5 w-3.5 text-emerald-200" />
              <span>{truncateMiddle(agentHotkey)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
