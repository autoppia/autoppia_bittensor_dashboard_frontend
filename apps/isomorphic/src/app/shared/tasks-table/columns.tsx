'use client';

import Link from 'next/link';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import BannerText from '@/app/shared/banner-text';
import { createColumnHelper } from '@tanstack/react-table';
import { PiArrowRightBold } from 'react-icons/pi';
import { Progressbar, Text } from 'rizzui';
import { TasksDataType } from './table';
import { validatorsDataMap } from '@/data/validators-data';
import { websitesDataMap } from '@/data/websites-data';

const columnHelper = createColumnHelper<TasksDataType>();

export const taskColumns = [
  columnHelper.display({
    id: 'id',
    size: 80,
    header: 'Task Id',
    cell: ({ row }) => <p className='ms-2'>#{row.original.id}</p>,
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
    header: 'Prompt',
    size: 400,
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">{row.original.prompt}</Text>
    ),
  }),
  columnHelper.accessor('website', {
    id: 'website',
    size: 100,
    header: 'Website',
    enableSorting: false,
    cell: ({ row }) => {
      const color = websitesDataMap[row.original.website].color;
      return (
        <BannerText
          color={color}
          text={row.original.website}
        />
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
    size: 100,
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
    size: 120,
    header: 'Created',
    cell: ({ row }) => <DateCell date={new Date(row.original.created_at)} />,
  }),
  columnHelper.display({
    id: 'action',
    size: 130,
    header: 'Action',
    cell: ({ row }) => (
      <Link
        href={`/tasks/${row.original.id}`}
        className='flex items-center text-white hover:text-gray-500'
      >
        <span className='underline'>View Details</span>
        <PiArrowRightBold className="ms-0.5" />
      </Link>
    ),
  }),
];
