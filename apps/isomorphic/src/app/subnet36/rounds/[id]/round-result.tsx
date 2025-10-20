"use client";

import React, { useMemo } from "react";
import RoundStats from "./round-stats";
import RoundValidators from "./round-validators";
import RoundMinerScores from "./round-miner-scores";
import RoundTopMiners from "./round-top-miners";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Text } from "rizzui";
import { PiInfoDuotone, PiCrownDuotone, PiTrophyDuotone, PiUsersThreeDuotone, PiCheckCircleDuotone, PiListChecksDuotone } from "react-icons/pi";
import { useRoundValidators, useTopMiners, useRoundStatistics, useRound } from "@/services/hooks/useRounds";
import { extractRoundIdentifier, extractRoundNumber } from "./round-identifier";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";
import type { ValidatorPerformance, MinerPerformance } from "@/services/api/types/rounds";
import cn from "@core/utils/class-names";

export default function RoundResult() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roundKey = extractRoundIdentifier(id);
  const requestedValidatorId = searchParams?.get("validator") ?? null;
  
  // Get data from API
  const { data: round, loading: roundLoading } = useRound(roundKey);
  const { data: validatorsData, loading: validatorsLoading } = useRoundValidators(roundKey);
  const { data: topMiners, loading: minersLoading } = useTopMiners(roundKey, 5);
  const { data: statistics, loading: statsLoading } = useRoundStatistics(roundKey);
  
  const loading = validatorsLoading || minersLoading || statsLoading || roundLoading;

  const [selectedValidator, setSelectedValidator] = React.useState<ValidatorPerformance | null>(null);

  const aggregatedTopMiner: MinerPerformance | null = useMemo(() => {
    if (!Array.isArray(topMiners) || topMiners.length === 0) {
      return null;
    }
    return topMiners[0] ?? null;
  }, [topMiners]);

  const selectedTopMiner: MinerPerformance | null = useMemo(() => {
    if (selectedValidator?.topMiner) {
      return selectedValidator.topMiner;
    }
    if (!Array.isArray(topMiners) || topMiners.length === 0) {
      return null;
    }
    if (!selectedValidator?.id) {
      return aggregatedTopMiner;
    }
    const filtered = topMiners.filter((miner) => miner.validatorId === selectedValidator.id);
    if (filtered.length > 0) {
      return filtered[0];
    }
    return aggregatedTopMiner;
  }, [topMiners, selectedValidator?.id, aggregatedTopMiner]);

  const winnerLabel = selectedTopMiner
    ? (selectedTopMiner.name && selectedTopMiner.name.trim().length > 0
        ? selectedTopMiner.name
        : `Miner ${selectedTopMiner.uid ?? "unknown"}`)
    : "No winner yet";

  const formatNumber = (value: number | undefined | null, digits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return "0";
    }
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const selectedValidatorCards = selectedValidator
    ? [
        {
          key: "winner",
          title: "Validator Winner",
          value: winnerLabel,
          helper: selectedValidator.name
            ? `${selectedValidator.name} latest champion`
            : "Champion for this validator",
          icon: PiCrownDuotone,
          gradient: "from-amber-500/22 via-orange-500/16 to-yellow-500/22",
          border: "border-amber-500/40",
          iconGradient: "from-amber-400 to-orange-500",
          valueClass: "text-2xl",
        },
        {
          key: "score",
          title: "Top Score",
          value: `${formatNumber(
            ((selectedValidator.topScore ?? selectedValidator.averageScore) ?? 0) * 100,
            1,
          )}%`,
          helper: "Best run recorded by this validator",
          icon: PiTrophyDuotone,
          gradient: "from-emerald-500/22 via-green-500/16 to-teal-500/22",
          border: "border-emerald-500/40",
          iconGradient: "from-emerald-400 to-teal-500",
          valueClass: "text-4xl",
        },
        {
          key: "miners",
          title: "Miners Evaluated",
          value: formatNumber(selectedValidator.totalMiners ?? 0),
          helper: "Unique miners assessed this round",
          icon: PiUsersThreeDuotone,
          gradient: "from-violet-500/22 via-purple-500/16 to-fuchsia-500/22",
          border: "border-violet-500/40",
          iconGradient: "from-violet-400 to-fuchsia-500",
          valueClass: "text-4xl",
        },
        {
          key: "tasks",
          title: "Tasks",
          value: formatNumber(selectedValidator.totalTasks ?? 0),
          helper: "Total tasks executed by this validator",
          icon: PiListChecksDuotone,
          gradient: "from-blue-500/22 via-indigo-500/16 to-cyan-500/22",
          border: "border-blue-500/40",
          iconGradient: "from-blue-400 to-indigo-500",
          valueClass: "text-4xl",
        },
      ]
    : [];

  const roundNumberFromData =
    typeof round?.roundNumber === "number"
      ? round.roundNumber
      : typeof round?.round === "number"
      ? round.round
      : typeof round?.id === "number"
      ? round.id
      : undefined;

  const roundNumberFromKey = React.useMemo(
    () => extractRoundNumber(roundKey),
    [roundKey]
  );

  const roundNumberForLinks = roundNumberFromData ?? roundNumberFromKey;
  const roundLabel = roundNumberForLinks ?? roundKey;

  const renderValidatorMetricCard = (card: (typeof selectedValidatorCards)[number]) => {
    const Icon = card.icon;
    return (
      <div
        key={card.key}
        className={cn(
          "group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
          "bg-slate-900/45",
          card.border,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100",
            "bg-gradient-to-br",
            card.gradient,
          )}
        />
        <div className="relative flex h-full flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1",
                "bg-gradient-to-br",
                card.iconGradient,
              )}
            >
              <Icon className="h-8 w-8 text-white drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]" />
              <div className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              {card.title}
            </span>
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
  
  // Handle validator selection
  const handleValidatorSelect = React.useCallback(
    (validator: ValidatorPerformance) => {
      setSelectedValidator((prev) => {
        if (prev?.id === validator.id) {
          return prev;
        }
        return validator;
      });

      if (!pathname) {
        return;
      }

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if ((requestedValidatorId ?? params.get("validator")) === validator.id) {
        return;
      }

      params.set("validator", validator.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, requestedValidatorId]
  );

  // Sync selection with query parameter or default to first validator
  React.useEffect(() => {
    if (!Array.isArray(validatorsData) || validatorsData.length === 0) {
      return;
    }

    if (requestedValidatorId) {
      const match = validatorsData.find((validator) => validator.id === requestedValidatorId);
      if (match && selectedValidator?.id !== match.id) {
        setSelectedValidator(match);
      }
      if (match) {
        return;
      }
    }

    if (!selectedValidator) {
      const fallback = validatorsData[0];
      setSelectedValidator(fallback);
      if (pathname) {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        if ((requestedValidatorId ?? params.get("validator")) !== fallback.id) {
          params.set("validator", fallback.id);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
    }
  }, [validatorsData, selectedValidator, requestedValidatorId, searchParams, pathname, router]);
  

  return (
    <>
      {/* Aggregated Summary Separator */}
      <div className="mt-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100/80 to-blue-50/80 rounded-2xl border-2 border-blue-300/60 shadow-lg backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-md"></div>
            <Text className="text-lg font-bold text-blue-700 tracking-wide">
              Round {roundLabel ?? ""}
            </Text>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
        </div>
      </div>

      {/* Aggregated Metrics Section */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20">
            <PiCheckCircleDuotone className="w-3 h-3 text-green-600" />
          </div>
          <Text className="text-sm font-medium text-gray-700">
            Aggregated Metrics
          </Text>
          <Text className="text-xs text-gray-500">
            Across all validators
          </Text>
        </div>
        <RoundStats selectedValidator={selectedValidator} />
      </div>

      {/* Validators Info Card */}
      <div className="mt-8 mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
            <PiUsersThreeDuotone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <Text className="text-sm font-medium text-gray-700">
              Multiple Validators
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Click on different validators below to see detailed information and metrics for each validator
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <Text className="text-xs text-blue-600 font-medium">
              Interactive
            </Text>
          </div>
        </div>
      </div>

      <RoundValidators
        onValidatorSelect={handleValidatorSelect}
        selectedValidatorId={selectedValidator?.id ?? null}
        requestedValidatorId={requestedValidatorId}
      />


      {/* Improved Metrics Cards - Matching Style */}
      {loading || !statistics || !Array.isArray(topMiners) || !validatorsData || !selectedValidator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {Array.from({ length: 4 }, (_, index) => (
            <StatsCardPlaceholder key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {selectedValidatorCards.map(renderValidatorMetricCard)}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScores
          className="w-full xl:w-[calc(100%-400px)]"
          selectedValidatorId={selectedValidator?.id}
        />
        <RoundTopMiners
          className="w-full xl:w-[400px]"
          selectedValidatorId={selectedValidator?.id}
          roundNumber={roundNumberForLinks}
        />
      </div>
    </>
  );
}
