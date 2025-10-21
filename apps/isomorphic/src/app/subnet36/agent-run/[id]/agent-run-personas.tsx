"use client";

import Image from "next/image";
import {
  PiArrowSquareOutDuotone,
  PiClock,
  PiGithubLogoDuotone,
  PiCopySimple,
} from "react-icons/pi";
import { resolveAssetUrl } from "@/services/utils/assets";

const HIGHLIGHT_COLOR = "#F5DEB3";

interface AgentRunPersonasProps {
  personas?: any;
  summary?: any;
}

function truncateMiddle(value?: string | null, visible = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

function extractUidNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const match = value.match(/-?\d+/);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

export default function AgentRunPersonas({
  personas,
  summary,
}: AgentRunPersonasProps) {
  const roundData = personas?.round || {
    id: "—",
    status: "Active",
    startTime: null,
    totalValidators: personas?.validatorCount || 0,
  };
  const validatorData = personas?.validator || {
    name: "Autoppia Validator",
    image: "/validators/Autoppia.png",
    id: null,
    country: "—",
    track: "—",
  };
  const agentData = personas?.agent || {
    name: "Benchmark Agent",
    image: "/images/autoppia-logo.png",
    id: "—",
    uid: null,
    hotkey: null,
    provider: "—",
    github: null,
    successRate: null,
    avgDuration: null,
    websitesEvaluated: null,
  };

  const validatorHotkey =
    summary?.validatorId || validatorData.id || validatorData.name;
  const taoStatsUrl = validatorHotkey
    ? `https://taostats.io/validators/${validatorHotkey}`
    : null;

  const agentUid =
    (typeof agentData.uid === "number" ? agentData.uid : null) ??
    (typeof summary?.agentUid === "number" ? summary?.agentUid : null) ??
    extractUidNumber(agentData.id) ??
    extractUidNumber(summary?.agentId);
  const agentHotkey =
    agentData.hotkey ??
    summary?.agentHotkey ??
    agentData.id ??
    summary?.agentId;

  const fallbackMinerImage = (() => {
    const uidCandidate = agentUid ?? extractUidNumber(summary?.minerUid);
    if (uidCandidate === null) {
      return "/images/autoppia-logo.png";
    }
    const normalized = Math.abs(uidCandidate % 50);
    return `/miners/${normalized}.svg`;
  })();

  const minerImageSrc = agentData.image
    ? resolveAssetUrl(agentData.image)
    : resolveAssetUrl(fallbackMinerImage);
  const validatorImageSrc = validatorData.image
    ? resolveAssetUrl(validatorData.image)
    : resolveAssetUrl("/validators/Other.png");

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
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white transition-all duration-300">
        <header className="relative flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-black shadow-lg transition-all duration-300 group-hover:shadow-xl">
              <PiClock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-400 mb-1">
                Round
              </p>
              <p className="text-4xl font-bold leading-none text-white">
                #{roundData.id ?? summary?.roundId ?? "—"}
              </p>
            </div>
          </div>
          <span
            className="rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] shadow-md transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "rgba(245, 222, 179, 0.5)",
              backgroundColor: "rgba(245, 222, 179, 0.15)",
              color: HIGHLIGHT_COLOR,
            }}
          >
            {(roundData.status || "Active").replace(/^\w/, (c) =>
              c.toUpperCase()
            )}
          </span>
        </header>

        <div className="relative mt-5 rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-4 shadow-md transition-all duration-300 hover:bg-slate-900/70">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
              Epoch
            </span>
            <span className="font-mono text-base font-semibold text-white tabular-nums">
              {formatEpoch(epochStart)} - {formatEpoch(epochEnd)}
            </span>
          </div>
        </div>
      </section>

      <section className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white transition-all duration-300">
        <header className="relative flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                alt={validatorData.name}
                src={validatorImageSrc || "/placeholder.svg"}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-2xl border-2 border-slate-700/50 object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
              />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-400 mb-1">
                Validator
              </p>
              <p className="text-xl font-bold text-white leading-tight">
                {validatorData.name}
              </p>
            </div>
          </div>
          {taoStatsUrl ? (
            <a
              href={taoStatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 text-white shadow-md transition-all duration-300 hover:border-slate-600/70 hover:bg-slate-900/80 hover:text-[#F5DEB3] hover:scale-110 active:scale-95"
              title="Open TaoStats"
            >
              <PiArrowSquareOutDuotone className="h-5 w-5" />
            </a>
          ) : null}
        </header>

        <div className="relative mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3.5 shadow-md transition-all duration-300 hover:bg-slate-900/70">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                Hotkey
              </span>
              <span className="font-mono text-sm font-semibold text-white tabular-nums">
                {truncateMiddle(validatorHotkey)}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                validatorHotkey &&
                navigator.clipboard.writeText(validatorHotkey)
              }
              className="inline-flex items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/50 p-2 text-white shadow-md transition-all duration-300 hover:border-slate-600/70 hover:bg-slate-900/80 hover:text-[#F5DEB3] hover:scale-110 active:scale-95"
              aria-label="Copy validator hotkey"
            >
              <PiCopySimple className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6 shadow-xl text-white transition-all duration-300">
        <header className="relative flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                alt={agentData.name}
                src={minerImageSrc || "/placeholder.svg"}
                width={72}
                height={72}
                unoptimized
                className="h-18 w-18 rounded-full border-2 border-slate-700/50 object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
              />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-400 mb-1">
                Miner
              </p>
              <p className="text-xl font-bold text-white leading-tight">
                {agentData.name}
              </p>
            </div>
          </div>
          {agentData.github ? (
            <a
              href={agentData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 text-white shadow-md transition-all duration-300 hover:border-slate-600/70 hover:bg-slate-900/80 hover:text-[#F5DEB3] hover:scale-110 active:scale-95"
              title="Open GitHub"
            >
              <PiGithubLogoDuotone className="h-5 w-5" />
            </a>
          ) : null}
        </header>

        <div className="relative mt-5">
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3.5 shadow-md transition-all duration-300 hover:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                  UID
                </span>
                <span className="font-mono text-sm font-semibold text-white tabular-nums">
                  {agentUid ?? "—"}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-700/50" />
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Hotkey
                </span>
                <span className="font-mono text-sm font-semibold text-white tabular-nums">
                  {truncateMiddle(agentHotkey)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  agentHotkey && navigator.clipboard.writeText(agentHotkey)
                }
                className="inline-flex items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/50 p-2 text-white shadow-md transition-all duration-300 hover:border-slate-600/70 hover:bg-slate-900/80 hover:text-[#F5DEB3] hover:scale-110 active:scale-95"
                aria-label="Copy miner hotkey"
              >
                <PiCopySimple className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
