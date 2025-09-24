"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import RunsList from "./runs-list";
import RunsProgress from "./runs-progress";
import RunsValidator from "./runs-validator";
import RunsTask from "./runs-task";
import RunsMiner from "./runs-miner";
import { RunType, runsData } from "@/data/runs-data";

export default function Runs() {
  const { id } = useParams();
  const [selectedRun, setSelectedRun] = useState<RunType | null>(null);

  useEffect(() => {
    if (id === "current") {
      setSelectedRun(runsData[runsData.length - 1]);
    } else {
      const run = runsData.find((run) => run.id === parseInt(id as string));
      setSelectedRun(run || null);
    }
  }, [id]);

  return (
    <>
      <PageHeader title="Recent Runs" className="mt-4" />
      <RunsList />
      {selectedRun && (
        <>
          <RunsProgress run={selectedRun as RunType} />
          <RunsMiner /> 
          <RunsValidator />
          <RunsTask />
        </>
      )}
    </>
  );
}
