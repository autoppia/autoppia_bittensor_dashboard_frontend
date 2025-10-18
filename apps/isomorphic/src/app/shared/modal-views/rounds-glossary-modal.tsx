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
    <div className="m-auto w-full max-w-[1320px] rounded-2xl border border-black/10 bg-white px-12 pb-9 pt-6 text-black sm:px-14 sm:pt-7">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <Title
            as="h3"
            className="inline-block rounded-full border border-black/10 bg-black px-3 py-1 text-lg font-semibold tracking-tight text-white"
          >
            Round Lifecycle Glossary
          </Title>
        </div>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-400 transition hover:text-gray-700"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>

      <div className="relative">
        {glossaryItems.map((item, index) => (
          <div key={item.term} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex w-7 flex-col items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-black bg-black text-[10px] font-semibold text-white">
                {index + 1}
              </span>
              {index < glossaryItems.length - 1 && (
                <span className="mt-1 h-full w-px flex-1 bg-black/15" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Text className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-black">
                  {item.term}
                </Text>
                <Text className="text-xs font-medium italic text-black">
                  {item.summary}
                </Text>
              </div>
              <Text className="text-sm leading-relaxed text-black">
                {item.details}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-black/10 pt-4 text-sm text-black">
        Validators follow the same flow every round:{" "}
        <span className="font-semibold text-black">
          start round → assign tasks → collect solutions → run evaluations →
          submit final scores.
        </span>{" "}
        Understanding where a metric comes from makes debugging and comparing
        miners much easier.
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => closeModal()}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 hover:shadow-md"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
