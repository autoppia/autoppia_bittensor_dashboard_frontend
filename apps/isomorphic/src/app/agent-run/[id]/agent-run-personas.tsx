"use client";

import Image from "next/image";
import {
  PiArrowSquareOutDuotone,
  PiClock,
  PiGithubLogoDuotone,
} from "react-icons/pi";

interface AgentRunPersonasProps {
  personas?: any;
  summary?: any;
}

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

export default function AgentRunPersonas({ personas, summary }: AgentRunPersonasProps) {
  const roundData =
    personas?.round || {
      id: "—",
      status: "Active",
      startTime: null,
      totalValidators: personas?.validatorCount || 0,
    };
  const validatorData =
    personas?.validator || {
      name: "Autoppia Validator",
      image: "/validators/Autoppia.png",
      id: null,
      country: "—",
      track: "—",
    };
  const agentData =
    personas?.agent || {
      name: "Benchmark Agent",
      image: "/images/autoppia-logo.png",
      id: "—",
      provider: "—",
      github: null,
      successRate: null,
      avgDuration: null,
      websitesEvaluated: null,
    };

  const validatorHotkey = summary?.validatorId || validatorData.id || validatorData.name;
  const taoStatsUrl = validatorHotkey
    ? `https://taostats.io/validators/${validatorHotkey}`
    : null;

  const agentUid = agentData.id || summary?.agentId;
  const agentHotkey = summary?.agentId || agentData.id;

  const toEpochSeconds = (value?: string | null) => {
    if (!value) return null;
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return Math.floor(timestamp / 1000);
  };

  const epochStart = toEpochSeconds(roundData.startTime);
  const epochEnd = toEpochSeconds(roundData.endTime ?? summary?.endTime);
  const formatEpoch = (value: number | null) =>
    typeof value === "number" ? value.toString() : "—";

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Round Card */}
      <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <PiClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Round
              </p>
              <p className="text-3xl font-semibold text-white leading-tight">
                #{roundData.id ?? summary?.roundId ?? "—"}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
            {(roundData.status || "Active").replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </header>

        <div className="mt-4 rounded-lg border border-slate-700/20 bg-slate-800/20 px-3 py-2 text-xs text-slate-300">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Epoch
          </p>
          <p className="font-mono text-sm text-white">
            {formatEpoch(epochStart)} - {formatEpoch(epochEnd)}
          </p>
        </div>
      </section>

      {/* Validator Card */}
      <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/20 bg-slate-800/20">
              <Image
                alt={validatorData.name}
                src={resolveImageSrc(validatorData.image)}
                width={44}
                height={44}
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Validator</p>
              <p className="text-sm font-semibold text-white">{validatorData.name}</p>
            </div>
          </div>
          {taoStatsUrl ? (
            <a
              href={taoStatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/15 text-purple-200 transition hover:border-purple-300"
              title="Open TaoStats"
            >
              <PiArrowSquareOutDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <dl className="space-y-2 text-xs text-slate-300">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Hotkey
              </p>
              <p className="font-mono text-sm text-white">
                {truncateMiddle(validatorHotkey)}
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* Miner Card */}
      <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-5 shadow-xl">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/20 bg-slate-800/20">
              <Image
                alt={agentData.name}
                src={resolveImageSrc(agentData.image)}
                width={44}
                height={44}
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Miner</p>
              <p className="text-sm font-semibold text-white">{agentData.name}</p>
            </div>
          </div>
          {agentData.github ? (
            <a
              href={agentData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-200 transition hover:border-sky-300"
              title="Open GitHub"
            >
              <PiGithubLogoDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <dl className="flex flex-wrap items-start gap-6 text-xs text-slate-300">
            <div className="flex-1 min-w-[140px]">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                UID
              </p>
              <p className="font-mono text-sm text-white">
                {agentUid || "—"}
              </p>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Hotkey
              </p>
              <p className="font-mono text-sm text-white">
                {truncateMiddle(agentHotkey)}
              </p>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );

}
