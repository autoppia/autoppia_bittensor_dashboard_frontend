"use client";

import Table from "@core/components/table";
import { useTanStackTable } from "@core/components/table/custom/use-TanStack-Table";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { Flex, Input, Title } from "rizzui";
import TablePagination from "@core/components/table/pagination";
import { agentRunColumns } from "./agent-run-columns";
import WidgetCard from "@core/components/cards/widget-card";
import { agentRunData, AgentRunDataType } from "@/data/agent-run-data";

export default function AgentRunTable() {
  const { table, setData } = useTanStackTable<AgentRunDataType>({
    tableData: agentRunData.slice().reverse(),
    columnConfig: agentRunColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      enableColumnResizing: false,
    },
  });

  return (
    <WidgetCard className="mt-6">
      <Flex
        direction="col"
        justify="between"
        className="mb-4 xs:flex-row xs:items-center"
      >
        <Title as="h3" className="text-base font-semibold sm:text-lg">
          All Agent Runs
        </Title>
        <Input
          type="search"
          clearable={true}
          placeholder="Search agent run..."
          onClear={() => table.setGlobalFilter("")}
          value={table.getState().globalFilter ?? ""}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full xs:max-w-60"
        />
      </Flex>
      <Table
        table={table}
        variant="minimal"
        classNames={{
          rowClassName: "text-gray-900 border-b",
        }}
      />
      <TablePagination table={table} className="mt-4" />
    </WidgetCard>
  );
}
