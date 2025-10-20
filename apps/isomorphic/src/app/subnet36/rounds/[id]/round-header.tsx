"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import cn from "@core/utils/class-names";
import { routes } from "@/config/routes";
import { useRounds, useRound, useRoundProgress } from "@/services/hooks/useRounds";
import { extractRoundIdentifier, extractRoundNumber } from "./round-identifier";
import { roundGlassBackgroundClass } from "./round-style.config";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiClockDuotone,
  PiFlagCheckeredDuotone,
  PiPulseDuotone,
} from "react-icons/pi";

type MinimalRound = {
  roundKey?: string;
  roundNumber?: number;
  round?: number;
  id?: number;
};

const resolveRoundNumber = (round: MinimalRound | null | undefined) => {
  if (!round) return undefined;
  return (
    typeof round.roundNumber === "number"
      ? round.roundNumber
      : typeof round.round === "number"
      ? round.round
      : typeof round.id === "number"
      ? round.id
      : undefined
  );
};

const resolveRoundKey = (round: MinimalRound | null | undefined, fallbackNumber?: number) => {
  if (!round) return fallbackNumber ? `round_${fallbackNumber}` : undefined;
  if (round.roundKey) {
    return round.roundKey;
  }
  const number = resolveRoundNumber(round) ?? fallbackNumber;
  return typeof number === "number" ? `round_${number}` : undefined;
};

export default function RoundHeader() {
  const { id } = useParams();
  const router = useRouter();
  const roundKey = extractRoundIdentifier(id);
  const roundNumber = extractRoundNumber(roundKey);

  const { data: round } = useRound(roundKey);
  const { data: progressData } = useRoundProgress(roundKey);

  const { data: roundsData } = useRounds({ page: 1, limit: 30, sortBy: "startTime", sortOrder: "desc" });
  const rawRounds = roundsData?.data?.rounds;
  const rounds = useMemo(() => rawRounds ?? [], [rawRounds]);
  const currentRoundFromList = roundsData?.data?.currentRound;

  const normalizedCurrentNumber = typeof roundNumber === "number" && Number.isFinite(roundNumber) ? roundNumber : resolveRoundNumber(round);

  const neighborRounds = useMemo(() => {
    if (normalizedCurrentNumber === undefined) {
      return { previous: null as MinimalRound | null, next: null as MinimalRound | null };
    }

    let previous: MinimalRound | null = null;
    let next: MinimalRound | null = null;

    rounds.forEach((candidate) => {
      const candidateNumber = resolveRoundNumber(candidate);
      if (candidateNumber === undefined || candidateNumber === normalizedCurrentNumber) {
        return;
      }
      if (candidateNumber < normalizedCurrentNumber) {
        if (!previous || (resolveRoundNumber(previous) ?? -Infinity) < candidateNumber) {
          previous = candidate;
        }
      } else if (candidateNumber > normalizedCurrentNumber) {
        if (!next || (resolveRoundNumber(next) ?? Infinity) > candidateNumber) {
          next = candidate;
        }
      }
    });

    return { previous, next };
  }, [normalizedCurrentNumber, rounds]);

  const goToRound = useCallback(
    (targetKey?: string) => {
      if (!targetKey || targetKey === roundKey) return;
      router.push(`${routes.rounds}/${encodeURIComponent(targetKey)}`);
    },
    [router, roundKey]
  );

  const status = (round?.status ?? (round?.current ? "active" : "completed")) as "active" | "completed" | "pending";
  const isActive = status === "active";
  const statusLabel = status === "completed" ? "Completed" : status === "pending" ? "Pending" : "In Progress";

  const progressPercentageRaw =
    typeof progressData?.progress === "number"
      ? progressData.progress * 100
      : typeof round?.progress === "number"
      ? round.progress * 100
      : isActive
      ? 0
      : 100;
  const progressPercentage = Math.max(0, Math.min(100, Math.round(progressPercentageRaw)));

  const startBlock = progressData?.startBlock ?? round?.startBlock ?? 0;
  const endBlock = progressData?.endBlock ?? round?.endBlock ?? 0;
  const currentBlock = progressData?.currentBlock ?? round?.currentBlock ?? startBlock;
  const blocksRemaining =
    progressData?.blocksRemaining ??
    (typeof endBlock === "number" && typeof currentBlock === "number" ? Math.max(endBlock - currentBlock, 0) : undefined);

  const formattedTimeRemaining = useMemo(() => {
    const time = progressData?.estimatedTimeRemaining;
    if (!time) return null;
    const parts: string[] = [];
    if (time.days) parts.push(`${time.days}d`);
    if (time.hours) parts.push(`${time.hours}h`);
    if (time.minutes) parts.push(`${time.minutes}m`);
    if (!parts.length && typeof time.seconds === "number") {
      parts.push(`${time.seconds}s`);
    }
    return parts.join(" ");
  }, [progressData?.estimatedTimeRemaining]);

  const lastUpdatedLabel = useMemo(() => {
    if (!progressData?.lastUpdated) return null;
    const timestamp = new Date(progressData.lastUpdated);
    if (Number.isNaN(timestamp.getTime())) return null;
    return timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [progressData?.lastUpdated]);

  const previousKey = resolveRoundKey(neighborRounds.previous);
  const nextKey = resolveRoundKey(neighborRounds.next);
  const previousNumber = resolveRoundNumber(neighborRounds.previous);
  const nextNumber = resolveRoundNumber(neighborRounds.next);
  const currentRoundKey = resolveRoundKey(currentRoundFromList);
  const currentRoundNumber = resolveRoundNumber(currentRoundFromList);

  return (
    <section className="mb-8">
      <div className={cn(roundGlassBackgroundClass, "rounded-3xl p-6 text-white shadow-2xl backdrop-blur")}>
        <div className="relative space-y-8">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold leading-none md:text-4xl">
                  Round {normalizedCurrentNumber ?? "—"}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    status === "pending" &&
                      "border-amber-200/70 bg-white/90 text-amber-400",
                    status === "completed" &&
                      "border-indigo-200/70 bg-white/90 text-indigo-500",
                    isActive && "border-white/80 bg-white text-emerald-500"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isActive && "bg-emerald-300",
                      status === "completed" && "bg-indigo-300",
                      status === "pending" && "bg-amber-300"
                    )}
                  />
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <PiClockDuotone className="h-5 w-5 text-emerald-300" />
                  <span>
                    {formattedTimeRemaining
                      ? `${formattedTimeRemaining} left`
                      : isActive
                      ? "Waiting for updated timing"
                      : "No remaining time"}
                  </span>
                </div>
                {typeof blocksRemaining === "number" && !Number.isNaN(blocksRemaining) && (
                  <div className="flex items-center gap-2">
                    <PiPulseDuotone className="h-5 w-5 text-sky-300" />
                    <span>{blocksRemaining.toLocaleString()} blocks remaining</span>
                  </div>
                )}
                {lastUpdatedLabel && (
                  <div className="flex items-center gap-2">
                    <PiClockDuotone className="h-5 w-5 text-white/60" />
                    <span className="text-xs uppercase tracking-wide text-white/60">
                      Updated {lastUpdatedLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToRound(previousKey)}
                  disabled={!previousKey}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    previousKey
                      ? "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                      : "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                  )}
                >
                  <PiCaretLeftBold className="h-4 w-4" />
                  <span>{previousNumber ? `Round ${previousNumber}` : "Prev"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToRound(nextKey)}
                  disabled={!nextKey}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    nextKey
                      ? "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                      : "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                  )}
                >
                  <span>{nextNumber ? `Round ${nextNumber}` : "Next"}</span>
                  <PiCaretRightBold className="h-4 w-4" />
                </button>
              </div>
              {currentRoundKey && currentRoundKey !== roundKey && (
                <Link
                  href={`${routes.rounds}/${encodeURIComponent(currentRoundKey)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-400/25"
                >
                  Current (Round {currentRoundNumber ?? "—"})
                </Link>
              )}
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Round progress</span>
                <span className="font-semibold text-white">{progressPercentage}%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white/80 bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.45)] transition-[left] duration-500 ease-out"
                  style={{ left: `calc(${progressPercentage}% - 8px)` }}
                />
              </div>
              <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <PiClockDuotone className="h-6 w-6 text-emerald-200" />
                  <div>
                    <span className="text-xs uppercase tracking-wide text-white/50">Start block</span>
                    <div className="text-base font-semibold text-white">{startBlock.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <PiPulseDuotone className="h-6 w-6 text-sky-200" />
                  <div>
                    <span className="text-xs uppercase tracking-wide text-white/50">Current block</span>
                    <div className="text-base font-semibold text-white">{currentBlock.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <PiFlagCheckeredDuotone className="h-6 w-6 text-indigo-200" />
                  <div>
                    <span className="text-xs uppercase tracking-wide text-white/50">End block</span>
                    <div className="text-base font-semibold text-white">{endBlock.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
