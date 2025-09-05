'use client';

import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { Progressbar, ActionIcon, Text, Badge } from 'rizzui';
import { TasksDataType } from './table';
import { validatorsDataMap } from '@/data/validators-data';
import { websitesDataMap } from '@/data/websites-data';

const columnHelper = createColumnHelper<TasksDataType>();

export const tasksColumns = (expanded: boolean = true) => {
  const columns = [
    columnHelper.display({
      id: 'id',
      size: 120,
      header: 'Task Id',
      cell: ({ row }) => <>#{row.original.id}</>,
    }),
    columnHelper.accessor('validator_uid', {
      id: 'validator',
      size: 200,
      header: 'Validator',
      enableSorting: false,
      cell: ({ row }) => (
        <TableAvatar
          src={validatorsDataMap[row.original.validator_uid].icon}
          name={validatorsDataMap[row.original.validator_uid].name}
          description={validatorsDataMap[row.original.validator_uid].hotkey.slice(0, 20) + '...'}
        />
      ),
    }),
    columnHelper.accessor('prompt', {
      id: 'prompt',
      size: 300,
      header: 'Prompt',
      enableSorting: false,
      cell: ({ row }) => (
        <Text className="font-medium text-gray-700">{row.original.prompt}</Text>
      ),
    }),
    columnHelper.display({
      id: 'website',
      size: 150,
      header: 'Website',
      cell: ({ row }) => {
        const color = websitesDataMap[row.original.website].color;
        return (
          <div className="flex items-center">
            <Badge 
              renderAsDot 
              style={{ backgroundColor: color }}
            />
            <Text 
              className="ms-2 font-medium" 
              style={{ color: color }}
            >
              {row.original.website}
            </Text>
          </div>
        )
      },
    }),
    columnHelper.accessor('use_case', {
      id: 'use_case',
      size: 150,
      header: 'Use Case',
      enableSorting: false,
      cell: ({ row }) => (
        <Text className="font-medium text-gray-700">
          {row.original.use_case.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </Text>
      ),
    }),
    columnHelper.accessor('success_rate', {
      id: 'success_rate',
      size: 140,
      header: 'Success Rate',
      enableSorting: false,
      cell: ({ row }) => (
        <>
          <Progressbar
            value={row.original.success_rate}
            color={
              row.original.success_rate >= 70 ? 'success' : row.original.success_rate >= 40 ? 'warning' : 'danger'
            }
            className="h-1.5 w-24"
          />
          <Text className="pt-1.5 text-[13px] text-gray-500">
            {row.original.success_rate.toFixed(0)}%
          </Text>
        </>
      ),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      size: 200,
      header: 'Created',
      cell: ({ row }) => <DateCell date={new Date(row.original.created_at)} />,
    }),
  ];

  return expanded ? [expandedOrdersColumns, ...columns] : columns;
};

const expandedOrdersColumns = columnHelper.display({
  id: 'expandedHandler',
  size: 60,
  cell: ({ row }) => (
    <>
      {row.getCanExpand() && (
        <ActionIcon
          size="sm"
          rounded="full"
          aria-label="Expand row"
          className="ms-2"
          variant={row.getIsExpanded() ? 'solid' : 'outline'}
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <PiCaretUpBold className="size-3.5" />
          ) : (
            <PiCaretDownBold className="size-3.5" />
          )}
        </ActionIcon>
      )}
    </>
  ),
});
