"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import BannerText from "@/app/shared/banner-text";
import { tasksDataMap } from "@/data/tasks-data";
import TaskResponseStats from "./task-response-stats";
import TaskTopMiner from "./task-top-miner";
import TaskScoreChart from "./task-score-chart";
import TaskTimeChart from "./task-time-chart";

export default function TaskDetails() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title={`Task ${id as string}`} className="mt-4" />
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex flex-wrap gap-4">
          <BannerText
            color="#22C55E"
            text={`Created At: ${tasksDataMap[id as string].createdAt}`}
          />
          <BannerText
            color="#FF1A1A"
            text={`Website: ${tasksDataMap[id as string].website}`}
          />
          <BannerText
            color="#F5A623"
            text={`Use Case: ${tasksDataMap[id as string].use_case}`}
          />
          <BannerText
            color="#8B5CF6"
            text={`Score: ${(tasksDataMap[id as string].score * 100).toFixed(1)}%`}
          />
          <BannerText
            color="#06B6D4"
            text={`Solution Time: ${tasksDataMap[id as string].solutionTime}s`}
          />
        </div>
        <div>
          <BannerText
            color="#00CEC9"
            text={`Prompt: ${tasksDataMap[id as string].prompt}`}
          />
        </div>
      </div>
      <div>
        <TaskResponseStats />
      </div>
      <div className="mt-4">
        <TaskTopMiner />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <TaskScoreChart />
        <TaskTimeChart />
      </div>
    </>
  );
}
