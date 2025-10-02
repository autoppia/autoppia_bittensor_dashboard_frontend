"use client";

import Image from "next/image";
import Link from "next/link";
import { Text, Button } from "rizzui";
import { createColumnHelper } from "@tanstack/react-table";
import { AgentRunDataType } from "@/data/agent-run-data";
import { validatorsDataMap } from "@/data/validators-data";
import { LuArrowRight } from "react-icons/lu";

const columnHelper = createColumnHelper<AgentRunDataType>();

export const agentRunColumns = [
  columnHelper.display({
    id: "uid",
    size: 120,
    header: "Run UID",
    cell: ({ row }) => <>{row.original.runUid}</>,
  }),
  columnHelper.accessor("round", {
    id: "round",
    size: 80,
    header: "Round",
    cell: ({ row }) => <>{row.original.round}</>,
  }),
  columnHelper.accessor("validatorId", {
    id: "validatorId",
    size: 300,
    header: "Validator",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src={validatorsDataMap[row.original.validatorId].icon}
          alt="Validator"
          className="w-8 h-8 rounded-full"
          width={32}
          height={32}
        />
        <div className="flex flex-col">
          <Text className="text-md font-semibold">
            {validatorsDataMap[row.original.validatorId].name}
          </Text>
          <Text className="w-60 truncate text-sm text-gray-500">
            {validatorsDataMap[row.original.validatorId].hotkey}
          </Text>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("totalTasks", {
    id: "totalTasks",
    size: 120,
    header: "Total Tasks",
    cell: ({ row }) => <>{row.original.totalTasks}</>,
  }),
  columnHelper.accessor("score", {
    id: "score",
    size: 80,
    header: "Score",
    cell: ({ row }) => <>{row.original.score.toFixed(2)}</>,
  }),
  columnHelper.accessor("ranking", {
    id: "ranking",
    size: 80,
    header: "Ranking",
    cell: ({ row }) => <>{row.original.ranking}</>,
  }),
  columnHelper.display({
    id: "action",
    size: 150,
    header: "Action",
    cell: ({ row }) => (
      <Link href={`/agent-run/${row.original.runUid}`}>
        <Button variant="outline" size="sm">
          <span>View Details</span>{" "}
          <LuArrowRight strokeWidth="2" className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    ),
  }),
];
