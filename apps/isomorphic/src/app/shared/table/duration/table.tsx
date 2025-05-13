'use client';

import { useEffect } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Filters from '../filters';
import { minerTimeColumns } from './columns';
import TablePagination from '@core/components/table/pagination';
import { TableDataType } from '@/app/shared/table/table-data';

export default function MinerDurationTable({ data }: { data: TableDataType[] }) {
  const { table, setData } = useTanStackTable<TableDataType>({
    tableData: data,
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

  useEffect(() => {
    setData(data);
  }, [data, setData]);

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
      <TablePagination table={table} className="py-4" />
    </>
  );
}
