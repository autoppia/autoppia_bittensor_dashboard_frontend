"use client";

import PageHeader from "@/app/shared/page-header";
import { Text, Select, SelectOption } from "rizzui";
import RoundMinersScore from "./round-miners-score";
import RoundTopMiners from "./round-top-miners";

const validatorOptions = [
  { value: "all", label: "All Validators" },
  { value: "autoppia", label: "Autoppia" },
  { value: "tao5", label: "tao5" },
  { value: "roundtable21", label: "RoundTable21" },
  { value: "yuma", label: "Yuma" },
  { value: "kraken", label: "Kraken" },
  { value: "other", label: "Other" },
];

export default function RoundMiners({
  validator,
  setValidator,
}: {
  validator: string;
  setValidator: (validator: string) => void;
}) {
  return (
    <>
      <PageHeader title="Miners" className="mt-6">
        <Select
          options={validatorOptions}
          value={validatorOptions.find(
            (option) => option.value === validator
          )}
          onChange={(option: SelectOption) => {
            setValidator(option.value as string);
          }}
          className="w-44"
        />
      </PageHeader>
      <div className="flex flex-col xl:flex-row gap-6">
        <RoundMinersScore className="w-full xl:w-[calc(100%-400px)]" />
        <RoundTopMiners className="w-full xl:w-[400px]" />
      </div>
    </>
  );
}
