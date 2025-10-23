"use client";

// Core/Next
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

// UI & Utils
import PageHeader from "@/app/shared/page-header";
import { Button, Text } from "rizzui";
import { Text as RizzText } from "rizzui/typography";
import { Skeleton } from "@core/ui/skeleton";
import WidgetCard from "@core/components/cards/widget-card";
import { useMedia } from "@core/hooks/use-media";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import cn from "@core/utils/class-names";

// Icons
import { LuInfo } from "react-icons/lu";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiClockDuotone,
  PiFlagCheckeredDuotone,
  PiPulseDuotone,
  PiInfoDuotone,
  PiCrownDuotone,
  PiTrophyDuotone,
  PiUsersThreeDuotone,
  PiCheckCircleDuotone,
  PiListChecksDuotone,
  PiCrownFill,
} from "react-icons/pi";

// Services & helpers
import { routes } from "@/config/routes";
import { resolveAssetUrl } from "@/services/utils/assets";
import {
  useRound,
  useRounds,
  useRoundProgress,
  useRoundValidators,
  useTopMiners,
  useRoundStatistics,
  useRoundMiners,
} from "@/services/hooks/useRounds";
import { roundsService } from "@/services/api/rounds.service";
import type { ValidatorPerformance, MinerPerformance, BenchmarkPerformance } from "@/services/api/types/rounds";
import { extractRoundIdentifier, extractRoundNumber } from "./round-identifier";
import { roundGlassBackgroundClass } from "./round-style.config";

// Modals
import { useModal } from "@/app/shared/modal-views/use-modal";
import RoundsGlossaryModal from "@/app/shared/modal-views/rounds-glossary-modal";

// Charts
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Local helpers
const normalizeScore = (value?: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return value > 1 ? value / 100 : value;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const BENCHMARK_COLORS: Record<string, string> = {
  openai: "#2563EB",
  anthropic: "#F97316",
  "browser-use": "#8B5CF6",
  browser_use: "#8B5CF6",
  browser: "#8B5CF6",
};
const DEFAULT_BENCHMARK_COLORS = ["#2563EB", "#F97316", "#8B5CF6", "#14B8A6", "#F472B6"];

function CustomTooltip({ label, active, payload, className }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn("rounded-lg border border-white/15 bg-slate-900/95 text-white shadow-2xl backdrop-blur", className)}>
      <Text className="label mb-0.5 block bg-white/10 p-2 px-2.5 text-center font-inter text-xs font-semibold capitalize text-white">
        {payload[0]?.payload?.name}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload.map((item: any, index: number) => (
          <div key={item.dataKey + index} className="chart-tooltip-item flex items-center py-1.5">
            <span className="me-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: item.payload?.color || item.fill || "#10B981" }} />
            <Text>
              <Text as="span" className="capitalize text-white/80">Score:</Text>{" "}
              <Text as="span" className="font-medium text-white">{(Number(item.value) * 100).toFixed(2)}%</Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundHeaderInline() {
  const { id } = useParams();
  const router = useRouter();
  const roundKey = extractRoundIdentifier(id);
  const roundNumber = extractRoundNumber(roundKey);

  const { data: round } = useRound(roundKey);
  const { data: progressData } = useRoundProgress(roundKey);
  const { data: roundsData } = useRounds({ page: 1, limit: 30, sortBy: "startTime", sortOrder: "desc" });
  const rawRounds = roundsData?.data?.rounds;
  const rounds = React.useMemo(() => rawRounds ?? [], [rawRounds]);
  const currentRoundFromList = roundsData?.data?.currentRound;

  const resolveRoundNumber = (r: any) => (r?.roundNumber ?? r?.round ?? r?.id);
  const resolveRoundKey = (r: any, fallbackNumber?: number) => r?.roundKey ?? (resolveRoundNumber(r) ?? fallbackNumber ? `round_${resolveRoundNumber(r) ?? fallbackNumber}` : undefined);

  const normalizedCurrentNumber = typeof roundNumber === "number" && Number.isFinite(roundNumber) ? roundNumber : resolveRoundNumber(round);

  const neighborRounds = React.useMemo(() => {
    if (normalizedCurrentNumber === undefined) return { previous: null as any, next: null as any };
    let previous: any = null;
    let next: any = null;
    rounds.forEach((candidate: any) => {
      const candidateNumber = resolveRoundNumber(candidate);
      if (candidateNumber === undefined || candidateNumber === normalizedCurrentNumber) return;
      if (candidateNumber < normalizedCurrentNumber) {
        if (!previous || resolveRoundNumber(previous) < candidateNumber) previous = candidate;
      } else if (candidateNumber > normalizedCurrentNumber) {
        if (!next || resolveRoundNumber(next) > candidateNumber) next = candidate;
      }
    });
    return { previous, next };
  }, [normalizedCurrentNumber, rounds]);

  const goToRound = React.useCallback((targetKey?: string) => {
    if (!targetKey || targetKey === roundKey) return;
    router.push(`${routes.rounds}/${encodeURIComponent(targetKey)}`);
  }, [router, roundKey]);

  const status = (round?.status ?? (round?.current ? "active" : "completed")) as "active" | "completed" | "pending";
  const isActive = status === "active";
  const statusLabel = status === "completed" ? "Completed" : status === "pending" ? "Pending" : "In Progress";

  const progressPercentageRaw = typeof progressData?.progress === "number"
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
  const blocksRemaining = progressData?.blocksRemaining ?? (typeof endBlock === "number" && typeof currentBlock === "number" ? Math.max(endBlock - currentBlock, 0) : undefined);

  const lastUpdatedLabel = React.useMemo(() => {
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
                <h1 className="text-2xl font-semibold leading-none md:text-4xl">Round {normalizedCurrentNumber ?? "—"}</h1>
                <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  status === "pending" && "border-amber-200/70 bg-white/90 text-amber-400",
                  status === "completed" && "border-indigo-200/70 bg-white/90 text-indigo-500",
                  isActive && "border-white/80 bg-white text-emerald-500"
                )}>
                  <span className={cn("h-2 w-2 rounded-full", isActive && "bg-emerald-300", status === "completed" && "bg-indigo-300", status === "pending" && "bg-amber-300")} />
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <PiClockDuotone className="h-5 w-5 text-emerald-300" />
                  <span>{isActive ? "Waiting for updated timing" : "No remaining time"}</span>
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
                    <span className="text-xs uppercase tracking-wide text-white/60">Updated {lastUpdatedLabel}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => goToRound(previousKey)} disabled={!previousKey} className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    previousKey ? "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10" : "cursor-not-allowed border-white/10 bg-white/5 text-white/40")}
                >
                  <PiCaretLeftBold className="h-4 w-4" />
                  <span>{previousNumber ? `Round ${previousNumber}` : "Prev"}</span>
                </button>
                <button type="button" onClick={() => goToRound(nextKey)} disabled={!nextKey} className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    nextKey ? "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10" : "cursor-not-allowed border-white/10 bg-white/5 text-white/40")}
                >
                  <span>{nextNumber ? `Round ${nextNumber}` : "Next"}</span>
                  <PiCaretRightBold className="h-4 w-4" />
                </button>
              </div>
              {currentRoundKey && currentRoundKey !== roundKey && (
                <Link href={`${routes.rounds}/${encodeURIComponent(currentRoundKey)}`} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-400/25">
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
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-[width] duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
                <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white/80 bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.45)] transition-[left] duration-500 ease-out" style={{ left: `calc(${progressPercentage}% - 8px)` }} />
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

function RoundRecentsInline() {
  const { id } = useParams();
  const currentRoundKey = extractRoundIdentifier(id);
  const currentRoundNumber = extractRoundNumber(currentRoundKey);
  const hasScrolledToActive = React.useRef(false);
  const { data: roundsData, loading, error } = useRounds({ page: 1, limit: 10, sortBy: "startTime", sortOrder: "desc" });
  const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } = useScrollableSlider();

  React.useEffect(() => {
    if (!roundsData || loading || !sliderEl.current || hasScrolledToActive.current) return;
    const roundsSource = roundsData?.data?.rounds ?? [];
    const roundsList = roundsSource.slice(0, 10);
    if (roundsList.length === 0) return;
    const activeIndex = roundsList.findIndex((round: any, index: number) => {
      const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
      const baseNumber = round.roundNumber ?? round.id;
      return (currentRoundKey !== undefined && roundKey === currentRoundKey) || (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
    });
    if (activeIndex !== -1) {
      setTimeout(() => {
        const roundCards = sliderEl.current?.querySelectorAll('a');
        if (roundCards && (roundCards as any)[activeIndex]) {
          (roundCards as any)[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          hasScrolledToActive.current = true;
        }
      }, 100);
    }
  }, [roundsData, loading, sliderEl, currentRoundKey, currentRoundNumber]);

  React.useEffect(() => { hasScrolledToActive.current = false; }, [currentRoundKey, currentRoundNumber]);

  if (loading) {
    return (
      <div className="relative flex w-auto items-center overflow-hidden mb-3">
        <div className="w-full overflow-hidden">
          <div className="grid grid-flow-col gap-5 overflow-x-auto scroll-smooth">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="w-full min-w-[320px] rounded-xl px-6 py-7 border-2 border-gray-200">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-0.5 w-8" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-3">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">⚠️ Failed to load recent rounds: {error}</p>
        </div>
      </div>
    );
  }

  const roundsSource = roundsData?.data?.rounds ?? [];
  const roundsList = roundsSource.slice(0, 10);
  if (roundsList.length === 0) {
    return (
      <div className="mb-3">
        <div className="rounded-lg border border-gray-200 px-6 py-5 text-sm text-gray-500">No recent rounds available.</div>
      </div>
    );
  }

  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-4">
        <Button title="Prev" variant="text" ref={sliderPrevBtn} onClick={() => scrollToTheLeft()} className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-110 hover:shadow-xl z-10">
          <PiCaretLeftBold className="h-6 w-6" />
        </Button>
        <div className="flex-1 overflow-hidden">
          <div ref={sliderEl} className="flex gap-6 overflow-x-scroll scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-0" style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
            {roundsList.map((round: any, index: number) => {
              const roundKey = round.roundKey ?? (typeof round.id === "number" ? `round_${round.id}` : `round_${index + 1}`);
              const baseNumber = round.roundNumber ?? round.id;
              const isActive = (currentRoundKey !== undefined && roundKey === currentRoundKey) || (currentRoundNumber !== undefined && baseNumber === currentRoundNumber);
              const isCurrent = round.current;
              const isSelected = isActive;
              return (
                <Link key={roundKey} href={`${routes.rounds}/${encodeURIComponent(roundKey)}`} className="snap-start flex-shrink-0 w-[calc(33.333%-1rem)] min-w-[320px] animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                  <div className={cn("w-full h-full rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group backdrop-blur-md transform hover:scale-[1.02]",
                    isSelected ? "bg-[#F8FAFC] border-2 border-[#E2E8F0] text-slate-900 shadow-[0_10px_24px_rgba(248,250,252,0.25)] hover:border-[#CBD5F5] hover:shadow-[0_16px_32px_rgba(248,250,252,0.35)]" : "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white hover:shadow-xl hover:shadow-blue-500/30")}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 bg-white text-black">
                          {(isCurrent ? <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/></svg> : <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                        </span>
                        <span className={cn("text-[20px] font-bold uppercase tracking-wide", isSelected ? "text-slate-900" : "text-white")}>Round {baseNumber}</span>
                      </div>
                      {!isCurrent && (
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                          isSelected ? "bg-green-500/20 text-green-700" : "bg-green-500/25 text-green-300")}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          Finished
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className={cn("flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide", isSelected ? "text-slate-700" : "text-gray-400")}> <span>Epoch Start</span> <span>Epoch End</span> </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all", isSelected ? "bg-black/10 text-slate-900" : "bg-white/10 text-white group-hover:bg-white/15")}>{round.startBlock}</div>
                        <div className={cn("w-8 h-[2px] rounded-full", isSelected ? "bg-black/20" : "bg-white/20")} />
                        <div className={cn("flex-1 px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all", isSelected ? "bg-black/10 text-slate-900" : "bg-white/10 text-white group-hover:bg-white/15")}>{round.endBlock}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <Button title="Next" variant="text" ref={sliderNextBtn} onClick={() => scrollToTheRight()} className="flex-shrink-0 !h-16 !w-16 !rounded-full !bg-white hover:!bg-gray-100 !border-2 !border-gray-300 !shadow-lg !flex !items-center !justify-center !text-black transition-all duration-300 hover:scale-110 hover:shadow-xl z-10">
          <PiCaretRightBold className="h-6 w-6" />
        </Button>
      </div>
      <div className="mt-10 mb-8"><div className="h-[3px] bg-gradient-to-r from-transparent via-gray-400/70 to-transparent shadow-sm"></div></div>
    </div>
  );
}

function RoundStatsInline({ selectedValidator }: { selectedValidator?: ValidatorPerformance | null }) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { data: statistics, loading: statsLoading, error: statsError } = useRoundStatistics(roundKey);
  const { data: topMiners, loading: minersLoading, error: minersError } = useTopMiners(roundKey, 10);
  const loading = statsLoading || minersLoading;
  const error = statsError || minersError;
  const winnerUid = statistics?.winnerMinerUid ?? null;

  const topMiner = React.useMemo(() => {
    if (selectedValidator?.topMiner) return selectedValidator.topMiner;
    if (!Array.isArray(topMiners) || topMiners.length === 0) return undefined;
    if (selectedValidator?.id) {
      const filtered = topMiners.filter((miner) => miner.validatorId === selectedValidator.id);
      if (filtered.length > 0) return filtered[0];
    }
    if (winnerUid !== null) {
      const winnerEntry = topMiners.find((miner) => miner.uid === winnerUid);
      if (winnerEntry) return winnerEntry;
    }
    return topMiners[0];
  }, [topMiners, selectedValidator, winnerUid]);

  if (loading || !statistics || !topMiners) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }, (_, index) => (<div key={index} className="h-36 rounded-xl border border-white/10 bg-white/5" />))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="mb-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">⚠️ Failed to load round statistics: {error}</p>
        </div>
      </div>
    );
  }

  const totalValidators = statistics.totalValidators || 0;
  const averageTasks = statistics.averageTasksPerValidator != null ? statistics.averageTasksPerValidator : totalValidators ? statistics.totalTasks / totalValidators : 0;
  const topMinerLabel = topMiner ? (topMiner.name && topMiner.name.trim().length > 0 ? topMiner.name : `Miner ${topMiner.uid ?? "pending"}`) : "Top miner pending";
  const formatNumber = (value: number | undefined | null, digits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "0";
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  };
  const winnerAverageScore = statistics?.winnerAverageScore ?? statistics?.averageScore ?? 0;

  const aggregatedCards = [
    { key: "winner", title: "Winner", value: topMinerLabel, uid: topMiner?.uid, helper: topMiner ? `UID ${topMiner?.uid ?? "—"}` : "Awaiting validator results", icon: PiCrownDuotone, gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/20", iconGradient: "from-amber-400 to-orange-500", valueClass: "text-2xl" },
    { key: "winnerAverageScore", title: "Winner Average Score", value: `${formatNumber(winnerAverageScore * 100, 1)}%`, helper: "Average score achieved by the winning miner across validators", icon: PiTrophyDuotone, gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/20", iconGradient: "from-emerald-400 to-teal-500", valueClass: "text-4xl" },
    { key: "miners", title: "Miners Evaluated", value: formatNumber(statistics.totalMiners ?? 0), helper: "Unique miners participating this round", icon: PiUsersThreeDuotone, gradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/20", iconGradient: "from-violet-400 to-fuchsia-500", valueClass: "text-4xl" },
    { key: "tasks", title: "Average Tasks", value: formatNumber(averageTasks, 1), helper: "Tasks completed per validator", icon: PiListChecksDuotone, gradient: "from-blue-500/20 via-indigo-500/15 to-cyan-500/20", iconGradient: "from-blue-400 to-indigo-500", valueClass: "text-4xl" },
  ];

  const renderMetricCard = (card: any) => {
    const Icon = card.icon;
    const isWinner = card.key === "winner" && typeof card.uid === "number";
    return (
      <div key={card.key} className={cn("group relative overflow-hidden rounded-2xl p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl",
        "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg hover:shadow-blue-500/30")}
      >
        <div className={cn("pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100","bg-gradient-to-br", card.gradient)} />
        <div className="relative flex h-full flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            {isWinner ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/15 shadow-xl">
                <Image src={`/miners/${(card.uid as number) % 50}.svg`} alt={`UID ${(card.uid as number)}`} fill sizes="(max-width: 768px) 100vw" className="object-cover" />
                <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-lg">
                  <PiCrownDuotone className="h-4 w-4 text-white" />
                </div>
              </div>
            ) : (
              <div className={cn("relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1","bg-gradient-to-br", card.iconGradient)}>
                <Icon className="h-8 w-8 text-white drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]" />
                <div className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
              </div>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">{card.title}</span>
          </div>
          <div className="mt-auto space-y-2">
            <div className={cn("font-black text-white", card.valueClass)}>{card.value}</div>
            {card.helper ? (
              <p className="text-sm font-medium text-white/70">{card.helper}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">{aggregatedCards.map(renderMetricCard)}</div>
  );
}

function RoundValidatorsInline({ className, onValidatorSelect, selectedValidatorId: externalSelectedId = null, requestedValidatorId = null, }: { className?: string; onValidatorSelect?: (v: ValidatorPerformance) => void; selectedValidatorId?: string | null; requestedValidatorId?: string | null; }) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { data: validatorsData, loading, error } = useRoundValidators(roundKey);
  const [selectedValidatorId, setSelectedValidatorId] = React.useState<string | null>(requestedValidatorId ?? externalSelectedId);
  const lastNotifiedValidator = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (requestedValidatorId && requestedValidatorId !== selectedValidatorId) { setSelectedValidatorId(requestedValidatorId); return; }
    if (externalSelectedId && externalSelectedId !== selectedValidatorId) { setSelectedValidatorId(externalSelectedId); }
  }, [externalSelectedId, requestedValidatorId, selectedValidatorId]);

  const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } = useScrollableSlider();

  React.useEffect(() => {
    if (!validatorsData || validatorsData.length === 0) return;
    const resolveValidatorById = (candidateId: string | null | undefined) => candidateId ? validatorsData.find((v) => v.id === candidateId) ?? null : null;
    const requested = resolveValidatorById(requestedValidatorId);
    const currentExternal = resolveValidatorById(externalSelectedId);
    const currentSelected = resolveValidatorById(selectedValidatorId);
    if (requestedValidatorId && !requested) return; // wait until exists
    const nextValidator = requested ?? currentExternal ?? currentSelected ?? validatorsData[0];
    if (!nextValidator) return;
    if (selectedValidatorId !== nextValidator.id) setSelectedValidatorId(nextValidator.id);
    if (onValidatorSelect && lastNotifiedValidator.current !== nextValidator.id) { onValidatorSelect(nextValidator); lastNotifiedValidator.current = nextValidator.id; }
  }, [validatorsData, selectedValidatorId, externalSelectedId, requestedValidatorId, onValidatorSelect]);

  const selectedValidator = validatorsData?.find(v => v.id === selectedValidatorId);

  if (loading) {
    return (
      <div className={cn(className)}>
        <div className="relative flex w-auto items-center overflow-hidden">
          <div className="w-full overflow-hidden">
            <div className="grid grid-flow-col gap-4 overflow-x-auto scroll-smooth">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-full min-w-[220px] rounded-xl px-5 py-5 border-2 border-gray-200">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/20 rounded-full border border-blue-700/50">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(className)}>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">⚠️ Failed to load validators: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div className="relative flex w-auto items-center overflow-hidden">
        <Button title="Prev" variant="text" ref={sliderPrevBtn} onClick={() => scrollToTheLeft()} className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden">
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>

        <div className="w-full overflow-hidden">
          <div ref={sliderEl} className="custom-scrollbar grid grid-flow-col gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-0">
            {validatorsData?.map((validator) => {
              const iconSrc = resolveAssetUrl(validator.icon, resolveAssetUrl("/validators/Other.png"));
              const isActive = selectedValidatorId === validator.id;
              return (
                <div key={`validator-${validator.id}`} onClick={() => { if (validator.id === selectedValidatorId) return; setSelectedValidatorId(validator.id); lastNotifiedValidator.current = validator.id; onValidatorSelect?.(validator); }} className="cursor-pointer">
                  <div className={cn("w-full min-w-[220px] rounded-xl px-5 py-5 transition-all duration-300 shadow-lg group backdrop-blur-md border-2",
                    isActive ? "bg-[#F8FAFC] border-[#E2E8F0] text-slate-900 shadow-[0_10px_24px_rgba(248,250,252,0.25)] hover:border-[#CBD5F5] hover:shadow-[0_16px_32px_rgba(248,250,252,0.35)]" : "bg-transparent border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl")}
                  >
                    <div className="flex flex-col items-center">
                      <div className={cn("relative aspect-square w-12 h-12 mb-3 transition-transform duration-300","group-hover:scale-110")}> 
                        <Image src={iconSrc} alt={validator.name} fill sizes="(max-width: 768px) 100vw" className={cn("h-full w-full rounded-full object-contain transition-all duration-300", isActive && "ring-2 ring-[#E2E8F0]/60 ring-offset-1 shadow-[0_8px_18px_rgba(248,250,252,0.25)]")} />
                      </div>
                      <span className={cn("text-base font-bold tracking-wide transition-colors duration-300 text-center", isActive ? "text-slate-900" : "text-white")}>{validator.name}</span>
                      <span className={cn("mt-1.5 text-xs font-medium tracking-wide font-inter transition-colors duration-300 truncate max-w-full", isActive ? "text-slate-700" : "text-gray-300")}>{validator.hotkey ? `${validator.hotkey.slice(0, 6)}...${validator.hotkey.slice(-6)}` : "No hotkey"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button title="Next" variant="text" ref={sliderNextBtn} onClick={() => scrollToTheRight()} className="dark: !absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 pe-2 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden">
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#F4E4C7]/60 to-transparent"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-[#F8FAFC]/85 rounded-full border-2 border-[#E2E8F0] shadow-[0_12px_28px_rgba(248,250,252,0.3)] backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-[#E3C697] to-[#D3AE72] rounded-full animate-pulse shadow-sm"></div>
            <RizzText className="text-lg text-[#3A3124] font-bold tracking-wide">{selectedValidator?.name || "Selected Validator"}</RizzText>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#F4E4C7]/60 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

function RoundMinerScoresInline({ className, selectedValidatorId, }: { className?: string; selectedValidatorId?: string; }) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const cardClassName = React.useMemo(() => cn("border border-transparent bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white",
    "h-[650px] rounded-xl px-6 py-7 shadow-lg group backdrop-blur-md transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300", className), [className]);

  const { data: minersData, loading, error } = useRoundMiners(roundKey, { limit: 100, sortBy: "score", sortOrder: "desc", minScore: 0 });
  const [expandedMinersData, setExpandedMinersData] = React.useState<typeof minersData | null>(null);
  React.useEffect(() => {
    let isMounted = true;
    const basePayload = minersData?.data;
    if (!basePayload) { if (isMounted) setExpandedMinersData(null); return () => { isMounted = false; }; }
    if (!roundKey) { if (isMounted) setExpandedMinersData(minersData); return () => { isMounted = false; }; }
    const baseMiners = Array.isArray(basePayload.miners) ? basePayload.miners : [];
    const total = typeof basePayload.total === "number" ? basePayload.total : baseMiners.length;
    const limit = basePayload.limit && basePayload.limit > 0 ? basePayload.limit : baseMiners.length || 100;
    if (total <= baseMiners.length) { if (isMounted) setExpandedMinersData(minersData); return () => { isMounted = false; }; }
    (async () => {
      const combinedMiners = [...baseMiners];
      const totalPages = Math.ceil(total / limit);
      for (let page = 2; page <= totalPages; page += 1) {
        try {
          const response = await roundsService.getRoundMiners(roundKey!, { limit, page, sortBy: "score", sortOrder: "desc" });
          const extra = Array.isArray(response.data?.miners) ? response.data!.miners : [];
          combinedMiners.push(...extra);
        } catch (fetchError) {
          if (process.env.NODE_ENV !== "production") console.error("[round-miner-scores] failed to expand miner list", fetchError);
          break;
        }
      }
      if (!isMounted) return;
      setExpandedMinersData({ ...minersData, data: { ...basePayload, miners: combinedMiners } });
    })();
    return () => { isMounted = false; };
  }, [minersData, roundKey]);

  const isSmallScreen = useMedia("(max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const barSize = isSmallScreen ? 16 : isMediumScreen ? 22 : 25;
  const minWidth = isSmallScreen ? 560 : isMediumScreen ? 640 : 840;
  const chartSource = expandedMinersData?.data ?? minersData?.data;

  const chartData = React.useMemo(() => {
    if (!chartSource?.miners) return [] as any[];
    const benchmarkColorCache = new Map<string, string>();
    let fallbackColorIndex = 0;
    const benchmarks: BenchmarkPerformance[] = chartSource.benchmarks || [];
    const filteredMiners = selectedValidatorId ? chartSource.miners.filter((miner) => miner.validatorId === selectedValidatorId) : chartSource.miners;
    const minerEntries = filteredMiners.map((miner) => {
      const score = normalizeScore(miner.score);
      const rawIsSota = miner.isSota ?? miner.is_sota ?? miner.isBenchmark ?? miner.is_benchmark ?? (typeof miner.type === "string" && miner.type.toLowerCase() === "benchmark");
      const isSota = Boolean(rawIsSota);
      const resolvedName = miner.name?.trim() || miner.provider?.trim() || "";
      const uidLabel = miner.uid !== undefined && miner.uid !== null ? String(miner.uid) : "";
      const label = isSota ? resolvedName || `Benchmark ${uidLabel || "unknown"}` : resolvedName ? `${resolvedName} · ${uidLabel || "unknown"}` : uidLabel ? `Miner ${uidLabel}` : "Miner";
      const slug = miner.provider ? slugify(miner.provider) : slugify(label);
      let color = "#06B6D4";
      if (isSota) {
        if (BENCHMARK_COLORS[slug]) color = BENCHMARK_COLORS[slug];
        else if (benchmarkColorCache.has(slug)) color = benchmarkColorCache.get(slug)!;
        else { color = DEFAULT_BENCHMARK_COLORS[fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length]; benchmarkColorCache.set(slug, color); fallbackColorIndex += 1; }
      }
      return { name: label, score, isSota, uid: miner.uid, color, provider: miner.provider, xAxisLabel: isSota ? "" : uidLabel };
    });
    const benchmarkEntries = benchmarks.map((benchmark) => {
      const score = normalizeScore(benchmark.score);
      const label = benchmark.name;
      const slug = benchmark.provider ? slugify(benchmark.provider) : slugify(label);
      let color = BENCHMARK_COLORS[slug];
      if (!color) { if (benchmarkColorCache.has(slug)) color = benchmarkColorCache.get(slug)!; else { color = DEFAULT_BENCHMARK_COLORS[fallbackColorIndex % DEFAULT_BENCHMARK_COLORS.length]; benchmarkColorCache.set(slug, color); fallbackColorIndex += 1; } }
      return { name: label, score, isSota: true, uid: `benchmark-${benchmark.id}`, color, provider: benchmark.provider, xAxisLabel: "" };
    });
    return [...minerEntries, ...benchmarkEntries].sort((a, b) => b.score - a.score);
  }, [minersData, selectedValidatorId]);

  const legendItems = React.useMemo(() => {
    const sotaEntries = new Map<string, string>();
    chartData.forEach((entry: any) => { if (entry.isSota) sotaEntries.set(entry.name, entry.color); });
    return [{ label: "Miners", color: "#06B6D4" }, ...Array.from(sotaEntries.entries()).map(([label, color]) => ({ label, color }))];
  }, [chartData]);

  if (loading) {
    return (
      <WidgetCard title={<div className="flex items-center justify-between w-full"><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-xl" /><Skeleton className="h-8 w-32" /></div><Skeleton className="h-5 w-24" /></div>} className={cardClassName} headerClassName="text-white pb-4" titleClassName="text-white">
        <div className="mt-6 w-full h-[420px]"><Skeleton className="h-full w-full rounded-lg" /></div>
        <div className="mt-3 flex justify-center gap-6"><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="h-8 w-28 rounded-full" /></div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title={<div className="flex items-center justify-between w-full"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z" /></svg></div><span className="text-2xl font-bold">Miner Scores</span></div><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer" disabled /><span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Show SOTA</span></label></div>} className={cardClassName} headerClassName="text-white pb-4" titleClassName="text-white">
        <div className="mt-6 flex h-[480px] w-full items-center justify-center"><div className="text-center text-rose-200"><p className="text-xl font-semibold">Failed to load miner scores</p><p className="mt-3 text-base text-white/80">Please try again later</p></div></div>
      </WidgetCard>
    );
  }

  if (!chartData.length) {
    return (
      <WidgetCard title={<div className="flex items-center justify-between w-full"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z" /></svg></div><span className="text-2xl font-bold">Miner Scores</span></div><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer" disabled /><span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Show SOTA</span></label></div>} className={cardClassName} headerClassName="text-white pb-4" titleClassName="text-white">
        <div className="mt-6 flex h-[480px] w-full items-center justify-center"><div className="text-center text-white/70"><p className="text-xl font-semibold">No miners found</p><p className="mt-3 text-base">No miner leaderboard data is available for this round.</p></div></div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={<div className="flex items-center justify-between w-full"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z" /></svg></div><span className="text-2xl font-bold">Miner Scores</span></div><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer" /><span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Show SOTA</span></label></div>} className={cardClassName} headerClassName="text-white pb-4" titleClassName="text-white">
      <div className="mt-6 h-[420px] w-full custom-scrollbar overflow-x-auto scroll-smooth">
        <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
          <ComposedChart data={chartData} margin={{ left: -20, top: 20, bottom: 10 }} className="[&_.recharts-cartesian-grid-vertical]:opacity-0">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />
            <XAxis dataKey="xAxisLabel" tick={{ fill: "rgba(226,232,240,0.9)", fontSize: isSmallScreen ? 11 : 13, fontFamily: "var(--font-inter)", fontWeight: 500 }} axisLine={{ stroke: "rgba(148,163,184,0.3)" }} tickLine={{ stroke: "rgba(148,163,184,0.3)" }} height={40} />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fill: "rgba(226,232,240,0.9)", fontSize: isSmallScreen ? 11 : 13, fontFamily: "var(--font-inter)", fontWeight: 500 }} axisLine={{ stroke: "rgba(148,163,184,0.3)" }} tickLine={{ stroke: "rgba(148,163,184,0.3)" }} width={50} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
            <Bar dataKey="score" fill="url(#barGradient)" strokeWidth={0} radius={[6, 6, 0, 0]} barSize={barSize}>
              {chartData.map((entry: any, index: number) => (<Cell key={`cell-${entry.uid}-${index}`} fill={entry.color} />))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {legendItems.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-6">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/10">
              <div className="h-4 w-4 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} />
              <Text className="text-white font-medium text-sm">{item.label}</Text>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function RoundTopMinersInline({ className, selectedValidatorId, roundNumber, }: { className?: string; selectedValidatorId?: string; roundNumber?: number; }) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const minersQuery = React.useMemo(() => ({ page: 1, limit: 100, sortBy: "score" as const, sortOrder: "desc" as const, minScore: 0 }), []);
  const { data: roundMinersData, loading, error } = useRoundMiners(roundKey, minersQuery);
  const topMinersList = React.useMemo(() => {
    const miners = roundMinersData?.data?.miners && Array.isArray(roundMinersData.data.miners) ? roundMinersData.data.miners : [];
    if (!selectedValidatorId) return miners.slice(0, 10);
    const filtered = miners.filter((miner) => miner.validatorId === selectedValidatorId);
    return filtered.length > 0 ? filtered : [];
  }, [roundMinersData, selectedValidatorId]);

  if (loading) {
    return (
      <WidgetCard title="Top Miners" className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl border border-transparent bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg group backdrop-blur-md transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300", className)} headerClassName="px-3 pb-2" titleClassName="text-white text-xl font-bold">
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3"><div className="flex flex-col gap-3">{Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex items-center w-full px-4 py-1.5"><Skeleton className="h-10 w-10 rounded-full me-3" /><div className="flex-1"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-3 w-32" /></div><Skeleton className="h-4 w-16" /></div>
        ))}</div></div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Top Miners" className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl border border-transparent bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg group backdrop-blur-md transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300", className)} headerClassName="px-3 pb-2" titleClassName="text-white text-xl font-bold">
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3 flex items-center justify-center"><div className="text-center text-red-400"><p className="text-lg font-semibold">Failed to load top miners</p><p className="text-sm mt-2">Please try again later</p></div></div>
      </WidgetCard>
    );
  }

  if (!topMinersList.length) {
    return (
      <WidgetCard title="Top Miners" className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl border border-transparent bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg group backdrop-blur-md transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300", className)} headerClassName="px-3 pb-2" titleClassName="text-white text-xl font-bold">
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3 flex items-center justify-center"><div className="text-center text-gray-300"><p className="text-lg font-semibold">No miners ranked yet</p><p className="text-sm mt-2">{selectedValidatorId ? "Select another validator or check back once evaluations complete." : "No miner leaderboard data is available for this round."}</p></div></div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Top Miners" className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl border border-transparent bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg group backdrop-blur-md transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300", className)} headerClassName="px-3 pb-2" titleClassName="text-white text-xl font-bold">
      <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3">
        <div className="flex flex-col">
          {topMinersList.map((miner: any, index: number) => {
            const agentHref = typeof roundNumber === "number" && Number.isFinite(roundNumber) ? `${routes.agents}/${miner.uid}?round=${roundNumber}&agent=${miner.uid}` : `${routes.agents}/${miner.uid}`;
            return (
              <Link key={`top-miner-${index}`} href={agentHref} title="Inspect Agent Run">
                <div className={cn("relative flex items-center w-full px-4 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-md cursor-pointer group border border-transparent hover:border-white/20", index === 0 && "bg-yellow-500/15 border border-yellow-400/60 hover:border-yellow-400 hover:bg-yellow-500/25")}> 
                  <div className="relative me-3 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 @sm:h-12 @sm:w-12">
                    <Image src={`/miners/${miner.uid % 50}.svg`} alt={miner.uid.toString()} fill sizes="(max-width: 768px) 100vw" className="object-cover" />
                  </div>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <RizzText className={cn("text-lg font-semibold text-white", index === 0 && "text-yellow-400")}>{miner.isSota && miner.name ? miner.name : `Miner ${miner.uid}`}</RizzText>
                        <div className="relative ms-2 text-xl">{index === 0 && (<><PiCrownFill className="animate-ping opacity-50 text-yellow-400" /><PiCrownFill className="absolute top-0 left-0 text-yellow-400" /></>)}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-white">
                        <span className="uppercase tracking-wide">UID {miner.uid}</span>
                        <span className="truncate max-w-[180px] text-[11px] font-normal uppercase tracking-wide text-white/90" title={miner.hotkey ?? "Hotkey unavailable"}>Hotkey {miner.hotkey ? `${miner.hotkey.slice(0, 6)}...${miner.hotkey.slice(-6)}` : "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <RizzText className="text-sm text-white font-medium">Score:</RizzText>
                        <div className={cn("text-lg font-semibold", index === 0 ? "text-yellow-400" : "text-cyan-400")}>{(miner.score * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-white transition-colors duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}

export default function Round() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { openModal } = useModal();
  const { data: round, error } = useRound(roundKey);

  const handleOpenGlossary = () =>
    openModal({ view: <RoundsGlossaryModal />, size: "lg", customSize: 1400 });

  // Selection state for validator-driven panels
  const [selectedValidator, setSelectedValidator] = React.useState<ValidatorPerformance | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedValidatorId = searchParams?.get("validator") ?? null;

  // Top/context labels
  const roundNumberFromData = typeof round?.roundNumber === "number" ? round.roundNumber : typeof round?.round === "number" ? round.round : typeof round?.id === "number" ? round.id : undefined;
  const roundNumberFromKey = React.useMemo(() => extractRoundNumber(roundKey), [roundKey]);
  const roundNumberForLinks = roundNumberFromData ?? roundNumberFromKey;
  const roundLabel = roundNumberForLinks ?? roundKey;

  const { data: topMiners, loading: minersLoading } = useTopMiners(roundKey, 5);
  const aggregatedTopMiner: MinerPerformance | null = React.useMemo(() => {
    if (!Array.isArray(topMiners) || topMiners.length === 0) return null;
    return topMiners[0] ?? null;
  }, [topMiners]);

  const winnerLabel = selectedValidator?.topMiner
    ? (selectedValidator.topMiner.name?.trim() || `Miner ${selectedValidator.topMiner.uid ?? "unknown"}`)
    : aggregatedTopMiner
    ? (aggregatedTopMiner.name?.trim() || `Miner ${aggregatedTopMiner.uid ?? "unknown"}`)
    : "No winner yet";
  const winnerUidVal = selectedValidator?.topMiner?.uid ?? aggregatedTopMiner?.uid;

  const formatNumber = (value: number | undefined | null, digits = 0) =>
    value === undefined || value === null || Number.isNaN(value)
      ? "0"
      : Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const selectedValidatorCards = selectedValidator
    ? [
        { key: "winner", title: "Validator Winner", value: winnerLabel, uid: winnerUidVal, helper: winnerUidVal != null ? `UID ${winnerUidVal}` : (selectedValidator.name ? `${selectedValidator.name} latest champion` : "Champion for this validator"), icon: PiCrownDuotone, gradient: "from-amber-500/22 via-orange-500/16 to-yellow-500/22", border: "border-amber-500/40", iconGradient: "from-amber-400 to-orange-500", valueClass: "text-2xl" },
        { key: "score", title: "Top Score", value: `${formatNumber(((selectedValidator.topScore ?? selectedValidator.averageScore) ?? 0) * 100, 1)}%`, helper: "Best run recorded by this validator", icon: PiTrophyDuotone, gradient: "from-emerald-500/22 via-green-500/16 to-teal-500/22", border: "border-emerald-500/40", iconGradient: "from-emerald-400 to-teal-500", valueClass: "text-4xl" },
        { key: "miners", title: "Miners Participated", value: formatNumber(selectedValidator.totalMiners ?? 0), helper: "Unique miners assessed this round", icon: PiUsersThreeDuotone, gradient: "from-violet-500/22 via-purple-500/16 to-fuchsia-500/22", border: "border-violet-500/40", iconGradient: "from-violet-400 to-fuchsia-500", valueClass: "text-4xl" },
        { key: "tasks", title: "Tasks", value: formatNumber(selectedValidator.totalTasks ?? 0), helper: "Total tasks executed by this validator", icon: PiListChecksDuotone, gradient: "from-blue-500/22 via-indigo-500/16 to-cyan-500/22", border: "border-blue-500/40", iconGradient: "from-blue-400 to-indigo-500", valueClass: "text-4xl" },
      ]
    : [];

  const handleValidatorSelect = React.useCallback((validator: ValidatorPerformance) => {
    setSelectedValidator((prev) => (prev?.id === validator.id ? prev : validator));
    if (!pathname) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if ((requestedValidatorId ?? params.get("validator")) === validator.id) return;
    params.set("validator", validator.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, requestedValidatorId]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <PageHeader title={""} className="mt-4" />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">⚠️ Failed to load round data: {error}</p>
        </div>
      )}

      {/* Header */}
      <RoundHeaderInline />

      {/* Recents */}
      <div className="mt-6">
        <RoundRecentsInline />
      </div>

      {/* Round Section Title */}
      <div className="mt-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100/80 to-blue-50/80 rounded-2xl border-2 border-blue-300/60 shadow-lg backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-md"></div>
            <Text className="text-lg font-bold text-blue-700 tracking-wide">Round {roundLabel ?? ""}</Text>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
        </div>
      </div>

      {/* Round Progress */}
      <RoundProgressInline />

      {/* Aggregated Metrics */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20"><PiCheckCircleDuotone className="w-3 h-3 text-green-600" /></div>
          <Text className="text-sm font-medium text-gray-700">Aggregated Metrics</Text>
          <Text className="text-xs text-gray-500">Across all validators</Text>
        </div>
        <RoundStatsInline selectedValidator={selectedValidator} />
      </div>

      {/* Validators selector */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20"><PiUsersThreeDuotone className="w-3 h-3 text-blue-600" /></div>
          <Text className="text-sm font-medium text-gray-700">Multiple Validators</Text>
          <Text className="text-xs text-gray-500">Click on different validators below to see detailed information and metrics for each validator</Text>
        </div>
      </div>

      <RoundValidatorsInline onValidatorSelect={handleValidatorSelect} selectedValidatorId={selectedValidator?.id ?? null} requestedValidatorId={requestedValidatorId} />

      {/* Selected validator metric cards */}
      {minersLoading || !selectedValidator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {Array.from({ length: 4 }, (_, index) => (<div key={index} className="h-36 rounded-xl border border-white/10 bg-white/5" />))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {selectedValidatorCards.map((card) => {
            const Icon = (card as any).icon;
            const isWinner = (card as any).key === "winner" && typeof (card as any).uid === "number";
            return (
              <div key={(card as any).key} className={cn("w-full h-full rounded-xl px-6 py-7 transition-all duration-300 shadow-lg group backdrop-blur-md transform hover:scale-[1.02]",
                "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white hover:shadow-xl hover:shadow-blue-500/30")}
              >
                <div className="flex h-full flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    {isWinner ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/15 shadow-xl">
                        <Image src={`/miners/${((card as any).uid as number) % 50}.svg`} alt={`UID ${((card as any).uid as number)}`} fill sizes="(max-width: 768px) 100vw" className="object-cover" />
                        <div className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-lg">
                          <PiCrownDuotone className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={cn("relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1","bg-gradient-to-br", (card as any).iconGradient)}>
                        <Icon className="h-8 w-8 text-white drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]" />
                        <div className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
                      </div>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">{(card as any).title}</span>
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className={cn("font-black text-white", (card as any).valueClass)}>{(card as any).value}</div>
                    {(card as any).helper ? (<p className="text-sm font-medium text-white/70">{(card as any).helper}</p>) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScoresInline className="w-full xl:w-[calc(100%-400px)]" selectedValidatorId={selectedValidator?.id} />
        <RoundTopMinersInline className="w-full xl:w-[400px]" selectedValidatorId={selectedValidator?.id} roundNumber={roundNumberForLinks} />
      </div>

      {/* Floating Glossary Button */}
      <button type="button" onClick={handleOpenGlossary} className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg backdrop-blur-sm transition hover:border-gray-400 hover:shadow-xl hover:scale-105">
        <LuInfo className="h-4 w-4" />
        Glossary
      </button>
    </div>
  );
}

function RoundProgressInline() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const { data: progressData, loading: progressLoading, error: progressError } = useRoundProgress(roundKey);
  const { data: roundData, loading: roundLoading, error: roundError } = useRound(roundKey);

  const round = roundData as any;
  const progress = progressData as any;
  const loading = progressLoading || roundLoading;
  const isTinyScreen = useMedia("(max-width: 639px)", false);
  const isSmallScreen = useMedia("(min-width: 640px) and (max-width: 767px)", false);
  const isMediumScreen = useMedia("(min-width: 768px) and (max-width: 1023px)", false);
  const cellCount = isTinyScreen ? 30 : isSmallScreen ? 50 : isMediumScreen ? 75 : 100;

  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  React.useEffect(() => {
    if (!round) return;
    const calculateTimeLeft = () => {
      if (progress?.estimatedTimeRemaining) {
        setTimeLeft(progress.estimatedTimeRemaining);
        return;
      }
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [round, progress?.estimatedTimeRemaining]);

  const currentBlock = progress?.currentBlock || 0;
  const percentage = progress?.progress || 0;
  const cells = React.useMemo(() => Array.from({ length: cellCount }, (_, index) => ({ isPassed: index < percentage * cellCount })), [cellCount, percentage]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="w-full flex items-center justify-between mb-4">
          {Array.from({ length: cellCount }, (_, index) => (
            <Skeleton key={index} className="w-[6px] h-10 rounded-full" />
          ))}
        </div>
        <div className="w-full flex items-center justify-between">
          <div></div>
          <div className="w-full flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (progressError || roundError) {
    return (
      <div className="w-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-red-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="text-center text-red-200">
          <p className="text-lg font-semibold">Progress data unavailable</p>
          <p className="text-sm mt-2">Failed to load round data</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-500/10 via-gray-500/10 to-gray-500/10 border-2 border-gray-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md">
        <div className="text-center text-gray-300">
          <p className="text-lg font-semibold">Round not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-2xl mt-4 px-7 py-5 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-white">Round Progress</div>
        <div className="flex items-center text-md text-white font-semibold">
          <span>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
            {timeLeft.seconds}s
          </span>
        </div>
      </div>
      <div className="w-full flex items-center justify-between mb-4">
        {cells.map((cell, index) => (
          <span key={index} className={cn("w-[6px] h-10 rounded-full transition-all duration-300 hover:scale-110", cell.isPassed ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30" : "bg-white/20 hover:bg-white/30")} />
        ))}
      </div>
      <div className="w-full flex items-center justify-between">
        <div></div>
        <div className="w-full flex items-center justify-between text-white">
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Epoch Start: </span>
            <span className="ms-1">{round.startBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Current Block: </span>
            <span className="ms-1">{currentBlock}</span>
          </div>
          <div className="flex items-center group text-sm font-medium">
            <span className="hidden sm:block">Epoch End: </span>
            <span className="ms-1">{round.endBlock}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
