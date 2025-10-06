"use client";

import Link from "next/link";
import BannerText from "@/app/shared/banner-text";
import { createColumnHelper } from "@tanstack/react-table";
import { PiEyeBold } from "react-icons/pi";
import { Button, Text } from "rizzui";
import { TasksDataType } from "./agent-run-tasks-table";
import { websitesDataMap } from "@/data/websites-data";

const columnHelper = createColumnHelper<TasksDataType>();

export const agentRunTasksColumns = [
  columnHelper.display({
    id: "id",
    size: 80,
    header: "Task Id",
    cell: ({ row }) => <p className="ms-2 text-emerald-50 font-mono">#{row.original.id}</p>,
  }),
  columnHelper.accessor("prompt", {
    id: "prompt",
    header: "Prompt",
    size: 400,
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-emerald-50 font-mono">{row.original.prompt}</Text>
    ),
  }),
  columnHelper.accessor("website", {
    id: "website",
    size: 100,
    header: "Website",
    enableSorting: false,
    cell: ({ row }) => {
      const color = websitesDataMap[row.original.website].color;
      return <BannerText color={color} text={row.original.website} />;
    },
  }),
  columnHelper.accessor("use_case", {
    id: "use_case",
    size: 150,
    header: "Use Case",
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-emerald-50 font-mono">
        {row.original.use_case
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </Text>
    ),
  }),
  columnHelper.accessor("score", {
    id: "score",
    size: 100,
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score;
      let scoreColor = "text-emerald-50"; // Default color
      
      if (score >= 0.8) {
        scoreColor = "text-emerald-400"; // High performance - bright emerald
      } else if (score >= 0.6) {
        scoreColor = "text-yellow-400"; // Medium performance - yellow
      } else if (score >= 0.4) {
        scoreColor = "text-orange-400"; // Low performance - orange
      } else {
        scoreColor = "text-red-400"; // Poor performance - red
      }
      
      return (
        <Text className={`font-medium font-mono ${scoreColor}`}>
          {score.toFixed(2)}
        </Text>
      );
    },
  }),
  columnHelper.accessor("solutionTime", {
    id: "solutionTime",
    size: 100,
    header: "Solution Time",
    cell: ({ row }) => (
      <Text className="font-medium text-emerald-50 font-mono">
        {row.original.solutionTime}s
      </Text>
    ),
  }),
  columnHelper.display({
    id: "action",
    size: 100,
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`/tasks/${row.original.id}`}
        className="flex items-center text-emerald-300 hover:text-emerald-200 transition-colors duration-200"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="bg-black/50 border-emerald-400/30 text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-400 hover:shadow-emerald-500/50 font-mono"
        >
          <PiEyeBold className="me-1.5 size-4" />
          <span>Inspect</span>
        </Button>
      </Link>
    ),
  }),
];
