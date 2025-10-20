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
    summary: "Time frame for validator submissions.",
    details:
      "A round is the exact time frame in which validators are allowed to submit their validator rounds. Each round lasts 20 epochs—roughly one day—so everyone evaluates miners against the same clock.",
  },
  {
    term: "Validator Round",
    summary: "One validator's complete scoring pass.",
    details:
      "Within a network round the validator requests tasks, evaluates miners on each challenge, and sets weights from the results. Every validator publishes exactly one validator round per round.",
  },
  {
    term: "Task",
    summary: "Challenge miners must solve.",
    details:
      "Tasks define the goal that must be achieved in the website. Each validator distributes the same set of tasks so every miner is judged on identical challenges.",
  },
  {
    term: "Task Solution",
    summary: "Replayable steps that solve the task.",
    details:
      "A task solution captures the sequence of actions that, when executed in a browser, completes the task. Validators review these runs to confirm how the miner approached the challenge.",
  },
  {
    term: "Evaluation",
    summary: "Task + solution performance snapshot.",
    details:
      "An evaluation bundles the task, the submitted task solution, and the resulting metrics. It records the miner's score and response time, feeding into the validator's final weights.",
  },
];

export default function RoundsGlossaryModal() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[95vw] rounded-2xl border border-black/10 bg-white px-12 pb-9 pt-6 text-black lg:max-w-[1600px] sm:px-14 sm:pt-7">
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
              <div className="flex flex-wrap items-center gap-3">
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
          start round → request tasks → collect task solutions → run
          evaluations → publish weights.
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
