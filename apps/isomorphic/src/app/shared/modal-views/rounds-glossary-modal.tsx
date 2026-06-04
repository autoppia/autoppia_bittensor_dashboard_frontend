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
    summary: "Challenge harvesters receive.",
    details:
      "Tasks define the goal, start website, and evaluation criteria. During a season the same task set is reused so miners are compared against identical challenges.",
  },
  {
    term: "Trajectory",
    summary: "Replayable tools submitted by a harvester.",
    details:
      "A trajectory is the ordered list of browser tools the miner's harvester found for a task. The validator replays it and scores the final browser state.",
  },
  {
    term: "Evaluation",
    summary: "Task + trajectory replay result.",
    details:
      "An evaluation bundles the task, submitted trajectory, replay execution history, score, time, and cost. These metrics feed validator weights.",
  },
  {
    term: "KingOverfitLLMJudge",
    summary: "Genericity check for new leaders.",
    details:
      "When a new candidate would become king, an LLM reviews its repo for concrete evidence of benchmark overfitting. Generic browser automation patterns are valid; hardcoded demo-web solutions are not.",
  },
];

export default function RoundsGlossaryModal() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[95vw] overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#fcfcfd_0%,#f7f7f8_100%)] text-black shadow-[0_40px_120px_-36px_rgba(15,23,42,0.35)] lg:max-w-[1320px]">
      <div className="relative overflow-hidden border-b border-slate-200 px-5 pb-6 pt-6 sm:px-10 sm:pb-7 sm:pt-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.14),transparent_38%)]" />
        <div className="relative mb-6 flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Title
              as="h3"
              className="inline-flex rounded-full border border-slate-900 bg-slate-950 px-4 py-1.5 text-lg font-semibold tracking-tight text-white shadow-sm"
            >
              Round Lifecycle Glossary
            </Title>
            <Text className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Validators follow the same flow every round:{" "}
              <span className="font-semibold text-slate-950">
                start round → request tasks → collect trajectories → replay evaluations
                → publish weights.
              </span>{" "}
              Understanding where a metric comes from makes debugging and comparing
              miners much easier.
            </Text>
          </div>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="relative z-10 h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
        </div>
      </div>

      <div className="relative px-5 py-5 sm:px-10 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-2">
        {glossaryItems.map((item, index) => (
          <div
            key={item.term}
            className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-30px_rgba(15,23,42,0.32)]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0f172a,#0ea5e9,#f472b6)] opacity-70" />
            <div className="flex gap-4">
            <div className="flex w-9 flex-col items-center pt-0.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-900 bg-slate-950 text-[11px] font-semibold text-white shadow-sm">
                {index + 1}
              </span>
              {index < glossaryItems.length - 1 && (
                <span className="mt-2 hidden h-full w-px flex-1 bg-slate-200 lg:block" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Text className="rounded-full border border-slate-200 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm">
                  {item.term}
                </Text>
                <Text className="text-xs font-medium italic text-slate-500">
                  {item.summary}
                </Text>
              </div>
              <Text className="text-sm leading-7 text-slate-700">
                {item.details}
              </Text>
            </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 bg-white/70 px-5 py-4 sm:px-10">
        <Button
          onClick={() => closeModal()}
          className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black hover:shadow-md"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
