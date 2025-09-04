/* ─────────────── src/app/shared/filter-board/index.tsx ─────────────── */
"use client";

import { useState, useEffect } from "react";
import cn from "@core/utils/class-names";
import { Title } from "rizzui/typography";
import { Radio, RadioGroup, Checkbox, CheckboxGroup } from "rizzui";
import { websitesData } from "@/data/websites-data";

type Props = {
  classname?: string;
  setTableData: (rows: any[]) => void;
  setLoading: (v: boolean) => void;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export default function FilterBoard({
  classname,
  setTableData,
  setLoading,
}: Props) {
  const [period, setPeriod] = useState<string>("all");
  const [ports, setPorts] = useState<string[]>(
    websitesData.filter((w) => !w.isComingSoon).map((w) => w.portValidator)
  );

  useEffect(() => {
    const qs = new URLSearchParams();
    if (period !== "all") qs.set("period", period);
    if (ports.length) qs.set("ports", ports.join(","));

    const enabledWebsitesCount = websitesData.filter((w) => !w.isComingSoon).length;
    const endpoint =
      period === "all" && ports.length === enabledWebsitesCount
        ? `${apiUrl}/metrics/`
        : `${apiUrl}/metrics/filtered/?${qs}`;

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const json = await res.json();
        setTableData(json);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [period, ports, setTableData, setLoading]);

  return (
    <div
      className={cn("flex flex-col rounded-lg border border-muted", classname)}
    >
      <Title className="px-6 py-3 text-xl font-bold border-b">Filters</Title>

      <div className="px-4 sm:px-8 py-4">
        <Title className="text-lg font-bold mb-4">Period</Title>
        <RadioGroup
          value={period}
          setValue={setPeriod}
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 ms-4"
        >
          <Radio label="All" value="all" />
          <Radio label="24 h" value="24h" />
          <Radio label="7 d" value="7d" />
          <Radio label="30 d" value="30d" />
        </RadioGroup>

        <Title className="text-lg font-bold mt-4 mb-4">Websites</Title>
        <CheckboxGroup
          values={ports}
          setValues={setPorts}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-4 ms-4"
        >
          {websitesData.filter((w) => !w.isComingSoon).map((w) => (
            <Checkbox
              key={w.portValidator}
              label={`${w.name} `}
              value={w.portValidator}
            />
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
}
