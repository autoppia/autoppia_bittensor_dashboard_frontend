/* src/app/shared/filter-board/index.tsx */
"use client";

import { useState, useEffect } from "react";
import cn from "@core/utils/class-names";
import { Title } from "rizzui/typography";
import { Radio, RadioGroup, Checkbox, CheckboxGroup } from "rizzui";
import { websitesData } from "@/data/websites-data";

type Props = {
  classname?: string;
  setTableData: (rows: any[]) => void;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export default function FilterBoard({ classname, setTableData }: Props) {
  const [period, setPeriod] = useState<"all" | "24h" | "7d" | "30d">("all");
  const [websites, setWebsites] = useState<string[]>(
    websitesData.map((w) => w.value)
  );

  useEffect(() => {
    /* 1) Construir la URL adecuada ---------------------------------- */
    let endpoint: string;

    if (period === "all") {
      endpoint = `${apiUrl}/metrics/`;
    } else {
      const qs = new URLSearchParams();
      qs.set("period", period);
      if (websites.length) qs.set("websites", websites.join(","));
      endpoint = `${apiUrl}/metrics/filtered/?${qs}`;
    }

    /* 2) Hacer la petición ------------------------------------------ */
    (async () => {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const json = await res.json();
        setTableData(json);
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    })();
  }, [period, websites, setTableData]);

  /* ----------------------------- UI ----------------------------- */
  return (
    <div
      className={cn("flex flex-col rounded-lg border border-muted", classname)}
    >
      <Title className="px-6 py-3 text-xl font-bold border-b">Filters</Title>

      <div className="px-4 sm:px-8 py-4">
        {/* Period */}
        <Title className="text-lg font-bold mb-4">Period</Title>
        <RadioGroup
          value={period}
          setValue={setPeriod}
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 ms-4"
        >
          <Radio label="All" value="all" />
          <Radio label="24 Hours" value="24h" />
          <Radio label="7 Days" value="7d" />
          <Radio label="30 Days" value="30d" />
        </RadioGroup>

        {/* Websites */}
        <Title className="text-lg font-bold mt-4 mb-4">Websites</Title>
        <CheckboxGroup
          values={websites}
          setValues={setWebsites}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-4 ms-4"
        >
          {websitesData.map((w) => (
            <Checkbox key={w.value} label={w.name} value={w.value} />
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
}
