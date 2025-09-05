'use client';

import { tasksColumns } from '@/app/shared/tasks-table/columns';
import { tasksData } from '@/data/tasks-data';
import Table from '@core/components/table';
import { CustomExpandedComponent } from '@core/components/table/custom/expanded-row';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { TableVariantProps } from 'rizzui';

export type TasksDataType = (typeof tasksData)[number];

export default function OrderTable({
  className,
  variant = 'modern',
  hideFilters = false,
  hidePagination = false,
}: {
  className?: string;
  hideFilters?: boolean;
  hidePagination?: boolean;
  variant?: TableVariantProps;
}) {
  const { table, setData } = useTanStackTable<TasksDataType>({
    tableData: tasksData,
    columnConfig: tasksColumns(),
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
      },
      enableColumnResizing: false,
    },
  });

  return (
    <div className={className}>
      {!hideFilters && <Filters table={table} />}
      <Table
        table={table}
        variant={variant}
        classNames={{
          container: 'border border-muted rounded-md border-t-0 bg-gray-0 dark:bg-gray-50',
          rowClassName: 'last:border-0',
        }}
        // components={{
        //   expandedComponent: CustomExpandedComponent,
        // }}
      />
      {!hidePagination && <TablePagination table={table} className="py-4" />}
    </div>
  );
}
