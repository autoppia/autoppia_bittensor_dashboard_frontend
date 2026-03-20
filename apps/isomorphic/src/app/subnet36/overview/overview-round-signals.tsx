"use client";

import cn from "@core/utils/class-names";
import { PiGitCommitFill, PiSparkleFill, PiTrendUpFill } from "react-icons/pi";

function formatSignedPercent(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Pending";
  }
  const numeric = Number(value);
  const scaled = numeric <= 1 && numeric >= -1 ? numeric * 100 : numeric;
  const prefix = scaled > 0 ? "+" : "";
  return `${prefix}${scaled.toFixed(1)}%`;
}

function previousRoundRewardText(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  const numeric = Number(value);
  const scaled = numeric <= 1 ? numeric * 100 : numeric;
  return `${scaled.toFixed(1)}%`;
}

type OverviewRoundSignalsProps = Readonly<{
  className?: string;
  minerUpdatesThisRound?: number;
  newAgentsThisRound?: number;
  rewardDeltaFromPreviousRound?: number | null;
  previousRoundLeaderName?: string | null;
  previousRoundLeaderReward?: number | null;
  previousRoundLabel?: string | null;
}>;

export default function OverviewRoundSignals({
  className,
  minerUpdatesThisRound = 0,
  newAgentsThisRound = 0,
  rewardDeltaFromPreviousRound = null,
  previousRoundLeaderName = null,
  previousRoundLeaderReward = null,
  previousRoundLabel = null,
}: OverviewRoundSignalsProps) {
  const cards = [
    {
      key: "updates",
      label: "Repo updates",
      value: `${minerUpdatesThisRound}`,
      detail: "miners changed github URLs this round",
      icon: PiGitCommitFill,
      shell:
        "border-cyan-400/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] before:bg-cyan-300/70",
      iconShell: "border border-cyan-400/12 bg-cyan-400/10 text-cyan-200",
      valueTone: "text-cyan-100",
    },
    {
      key: "new",
      label: "New agents",
      value: `${newAgentsThisRound}`,
      detail: "first seen this season",
      icon: PiSparkleFill,
      shell:
        "border-emerald-400/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] before:bg-emerald-300/70",
      iconShell: "border border-emerald-400/12 bg-emerald-400/10 text-emerald-200",
      valueTone: "text-emerald-100",
    },
    {
      key: "delta",
      label: "Reward delta",
      value: formatSignedPercent(rewardDeltaFromPreviousRound),
      detail:
        previousRoundLeaderName && previousRoundRewardText(previousRoundLeaderReward)
          ? `vs ${previousRoundLeaderName} · ${previousRoundRewardText(previousRoundLeaderReward)}`
          : previousRoundLabel || "waiting for prior close",
      icon: PiTrendUpFill,
      shell:
        "border-amber-400/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] before:bg-amber-300/70",
      iconShell: "border border-amber-400/12 bg-amber-400/10 text-amber-200",
      valueTone: "text-amber-100",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,35,0.96),rgba(8,11,25,0.92))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.18)] backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4 border-b border-white/6 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Round signals
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-400">
            Current round movement against the latest finished consensus.
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-[20px] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] before:absolute before:bottom-4 before:left-0 before:top-4 before:w-px",
                card.shell
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl",
                    card.iconShell
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                    {card.label}
                  </div>
                  <div className="mt-1 text-sm leading-5 text-white/68">{card.detail}</div>
                </div>
                <div className="min-w-[92px] text-right">
                  <div
                    className={cn(
                      "text-[30px] font-black leading-none tracking-tight text-white",
                      card.valueTone
                    )}
                  >
                    {card.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
