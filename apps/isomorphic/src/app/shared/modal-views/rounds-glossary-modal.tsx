"use client";

import { useModal } from "@/app/shared/modal-views/use-modal";
import { ActionIcon, Button } from "rizzui";
import { Title, Text } from "rizzui/typography";
import { PiXBold } from "react-icons/pi";

const glossaryItems: Array<{
  term: string;
  summary: string;
  details: string;
}> = [
  {
    term: "Round",
    summary: "One network day of activity.",
    details:
      "All validators submit during the same round number. Metrics roll up the entire day, so leaderboards and charts compare everyone on the same timeline.",
  },
  {
    term: "Validator Round",
    summary: "One validator’s submission for that round.",
    details:
      "A validator opens a round, requests tasks, evaluates miners, and pushes its results. Each validator produces exactly one validator round per network round.",
  },
  {
    term: "Agent Run",
    summary: "A validator scoring one miner.",
    details:
      "Inside a validator round the validator spins up an agent run for each miner it tests. The agent run tracks the miner’s progress across every assigned task.",
  },
  {
    term: "Task",
    summary: "The unit of work the miner must solve.",
    details:
      "Tasks describe real web automation goals (e.g. add to cart, submit a form). Validators dispatch the same task list to every miner to keep scoring fair.",
  },
  {
    term: "Evaluation",
    summary: "The verdict for a task attempt.",
    details:
      "Each task attempt produces an evaluation with success state, score, timing, and any diagnostic notes. Aggregating evaluations forms the agent run and validator round scores.",
  },
];

export default function RoundsGlossaryModal() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[620px] rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#071946]/95 via-[#0a1f5d]/95 to-[#112a74]/95 px-6 pb-7 pt-6 text-white shadow-2xl sm:px-8 sm:pt-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Title
            as="h3"
            className="text-xl font-semibold tracking-tight text-white"
          >
            Round Lifecycle Glossary
          </Title>
          <Text className="mt-1 text-sm text-white/70">
            Each term describes a layer in the pipeline that turns daily
            validator submissions into the analytics you see on this page.
          </Text>
        </div>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-white/50 transition hover:text-white"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>

      <div className="space-y-4">
        {glossaryItems.map((item) => (
          <div
            key={item.term}
            className="rounded-2xl border border-white/10 bg-blue-900/40 px-5 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/90">
                {item.term}
              </Text>
              <Text className="text-xs font-medium text-white/60">
                {item.summary}
              </Text>
            </div>
            <Text className="mt-2 text-sm leading-relaxed text-white/80">
              {item.details}
            </Text>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Validators follow the same flow every round:{" "}
        <span className="font-semibold text-emerald-300">
          start round → assign tasks → run miners → collect evaluations →
          submit final scores.
        </span>{" "}
        Understanding where a metric comes from makes debugging and comparing
        miners much easier.
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => closeModal()}
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
