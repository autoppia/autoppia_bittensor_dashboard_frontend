"use client";

import Link from "next/link";
import BannerText from "@/app/shared/banner-text";
import { createColumnHelper } from "@tanstack/react-table";
import { PiArrowRightBold } from "react-icons/pi";
import { Button, Progressbar, Text } from "rizzui";
import { TasksDataType } from "./table";
import { websitesDataMap } from "@/data/websites-data";
import { routes } from "@/config/routes";

const columnHelper = createColumnHelper<TasksDataType>();

export const taskColumns = [
  columnHelper.display({
    id: "id",
    size: 80,
    header: "Task Id",
    cell: ({ row }) => <p className="ms-2">#{row.original.id}</p>,
  }),
  columnHelper.accessor("prompt", {
    id: "prompt",
    header: "Prompt",
    size: 400,
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">{row.original.prompt}</Text>
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
      <Text className="font-medium text-gray-700">
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
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {row.original.score.toFixed(2)}
      </Text>
    ),
  }),
  columnHelper.accessor("solutionTime", {
    id: "solutionTime",
    size: 100,
    header: "Solution Time",
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {row.original.solutionTime}s
      </Text>
    ),
  }),
  columnHelper.display({
    id: "action",
    size: 150,
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`${routes.tasks}/${row.original.id}`}
        className="flex items-center text-white hover:text-gray-500"
      >
        <Button variant="outline" size="sm">
          <span>View Details</span>
          <PiArrowRightBold className="ms-0.5" />
        </Button>
      </Link>
    ),
  }),
];
