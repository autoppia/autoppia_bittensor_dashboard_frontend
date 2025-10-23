"use client";

import Image from "next/image";
import {
  PiArrowSquareOut,
  PiClock,
  PiGithubLogo,
  PiCopy,
  PiShieldCheck,
  PiUser,
} from "react-icons/pi";
import { resolveAssetUrl } from "@/services/utils/assets";
import { useState } from "react";

interface AgentRunPersonasProps {
  personas?: any;
  summary?: any;
}

function truncateMiddle(value?: string | null, visible: number = 6) {
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center rounded-lg bg-slate-700/50 p-1.5 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
      aria-label="Copy"
    >
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-400">✓</span>
      ) : (
        <PiCopy className="h-3.5 w-3.5" />
      )}
    </button>
  );
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
      uid: null,
      hotkey: null,
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
    const uidCandidate =
      agentUid ??
      extractUidNumber(summary?.minerUid);
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
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Round Card */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <PiClock className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Round
              </p>
              <p className="text-3xl font-bold text-white">
                #{roundData.id ?? summary?.roundId ?? "—"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {(roundData.status || "Active").replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </header>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">
              Epoch
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {formatEpoch(epochStart)} - {formatEpoch(epochEnd)}
            </span>
          </div>
        </div>
      </section>

      {/* Validator Card */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-700/30 shadow-lg">
              <Image
                alt={validatorData.name}
                src={validatorImageSrc}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Validator
              </p>
              <p className="text-xl font-bold text-white truncate">
                {validatorData.name}
              </p>
            </div>
          </div>
          {taoStatsUrl ? (
            <a
              href={taoStatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/50 text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200"
              title="Open TaoStats"
            >
              <PiArrowSquareOut className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400 flex-shrink-0">
              Hotkey
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm font-semibold text-white truncate">
                {truncateMiddle(validatorHotkey)}
              </span>
              {validatorHotkey && <CopyButton text={validatorHotkey} />}
            </div>
          </div>
        </div>
      </section>

      {/* Miner Card */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-cyan-500/50 bg-slate-700/30 shadow-lg">
              <Image
                alt={agentData.name}
                src={minerImageSrc}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Miner
              </p>
              <p className="text-xl font-bold text-white truncate">
                {agentData.name}
              </p>
            </div>
          </div>
          {agentData.github ? (
            <a
              href={agentData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/50 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
              title="Open GitHub"
            >
              <PiGithubLogo className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">
                UID
              </span>
              <span className="font-mono text-sm font-semibold text-white">
                {agentUid ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400 flex-shrink-0">
                Hotkey
              </span>
              <span className="font-mono text-sm font-semibold text-white truncate">
                {truncateMiddle(agentHotkey)}
              </span>
              {agentHotkey && <CopyButton text={agentHotkey} />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
