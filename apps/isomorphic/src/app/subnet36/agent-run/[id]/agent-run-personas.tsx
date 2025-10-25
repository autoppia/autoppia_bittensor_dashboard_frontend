"use client";

import Image from "next/image";
import {
  PiArrowSquareOutDuotone,
  PiClock,
  PiGithubLogoDuotone,
  PiCopySimple,
} from "react-icons/pi";
import { resolveAssetUrl } from "@/services/utils/assets";
import { CHIP_STYLES } from "@/config/theme-styles";

const HIGHLIGHT_COLOR = "#FDF5E6";

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
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Round Card */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/22 to-purple-500/22 p-5 shadow-2xl backdrop-blur-xl text-white">
        <div className="pointer-events-none absolute -left-16 -top-10 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-purple-500/15 blur-[120px]" />
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/40">
              <PiClock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Round
              </p>
              <p className="text-3xl font-semibold leading-tight text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
                #{roundData.id ?? summary?.roundId ?? "—"}
              </p>
            </div>
          </div>
          {(() => {
            const status = String(roundData.status || "Active").toLowerCase();
            const colorClass =
              status === "completed"
                ? CHIP_STYLES.completed
                : status === "pending"
                ? CHIP_STYLES.pending
                : CHIP_STYLES.active;
            return (
              <span className={`${CHIP_STYLES.base} ${colorClass} !px-3 !py-1`}>
                {(roundData.status || "Active").replace(/^\w/, (c: string) => c.toUpperCase())}
              </span>
            );
          })()}
        </header>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 font-mono text-base text-white">
              <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                Epoch:
              </span>
            <span className="whitespace-nowrap">
              {formatEpoch(epochStart)} - {formatEpoch(epochEnd)}
            </span>
          </div>
        </div>
      </section>

      {/* Validator Card */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/22 to-purple-500/22 p-5 shadow-2xl backdrop-blur-xl text-white">
        <div className="pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full bg-purple-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-blue-400/15 blur-[120px]" />
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              alt={validatorData.name}
              src={validatorImageSrc}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-purple-500/30"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Validator</p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                {validatorData.name}
              </p>
            </div>
          </div>
          {taoStatsUrl ? (
            <a
              href={taoStatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]"
              title="Open TaoStats"
            >
              <PiArrowSquareOutDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                Hotkey:
              </span>
              <span className="font-mono text-sm text-white">
                {truncateMiddle(validatorHotkey)}
              </span>
              <button
                type="button"
                onClick={() =>
                  validatorHotkey && navigator.clipboard.writeText(validatorHotkey)
                }
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-1 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]"
                aria-label="Copy validator hotkey"
              >
                <PiCopySimple className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Miner Card */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-300/35 via-blue-500/22 to-purple-500/22 p-5 shadow-2xl backdrop-blur-xl text-white">
        <div className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-blue-500/20 blur-[120px]" />
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              alt={agentData.name}
              src={minerImageSrc}
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 rounded-full border border-white/15 object-cover shadow-lg shadow-blue-900/40"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Miner</p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
                {agentData.name}
              </p>
            </div>
          </div>
          {agentData.github ? (
            <a
              href={agentData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]"
              title="Open GitHub"
            >
              <PiGithubLogoDuotone className="h-4 w-4" />
            </a>
          ) : null}
        </header>

        <div className="mt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                  UID:
                </span>
                <span className="font-mono text-sm text-white">
                  {agentUid ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.3em] text-xs text-white/60">
                  Hotkey:
                </span>
                <span className="font-mono text-sm text-white">
                  {truncateMiddle(agentHotkey)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    agentHotkey && navigator.clipboard.writeText(agentHotkey)
                  }
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-1 text-white transition hover:border-[#FDF5E6]/60 hover:text-[#FDF5E6]"
                  aria-label="Copy miner hotkey"
                >
                  <PiCopySimple className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

}
