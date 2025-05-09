'use client';

import { minerScoreData } from '@/data/miner-data';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Filters from '../filters';
import { minerTimeColumns } from './columns';
import TablePagination from '@core/components/table/pagination';

import TableFooter from '@core/components/table/footer';
export type MinerTimeTableDataType = (typeof minerScoreData)[number];

export default function MinerTimeTable() {
  const { table, setData } = useTanStackTable<MinerTimeTableDataType>({
    tableData: minerScoreData,
    columnConfig: minerTimeColumns,
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
    <>
      <Filters table={table} />
      <Table
        table={table}
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
