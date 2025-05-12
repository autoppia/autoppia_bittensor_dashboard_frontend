'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { TableDataType } from '@/app/shared/table/table-data'

const columnHelper = createColumnHelper<TableDataType>();

export const minerTimeColumns = [
  columnHelper.accessor('miner_uid', {
    id: 'uid',
    size: 40,
    header: 'UID',
    enableSorting: true,
    cell: ({ row }) => row.original.miner_uid,
  }),
  columnHelper.accessor('miner_hotkey', {
    id: 'hotkey',
    size: 100,
    header: 'Hotkey',
    enableSorting: false,
    cell: ({ row }) => (<div className='w-32 truncate'>{row.original.miner_hotkey}</div>),
  }),
  columnHelper.accessor(row => row.durations[2], {
    id: 'duration_2',
    size: 50,
    header: 'Validator_2',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[2] ? row.original.durations[2].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[3], {
    id: 'duration_3',
    size: 50,
    header: 'Validator_3',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[3] ? row.original.durations[3].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[4], {
    id: 'duration_4',
    size: 50,
    header: 'Validator_4',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[4] ? row.original.durations[4].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[8], {
    id: 'duration_8',
    size: 50,
    header: 'Validator_8',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[8] ? row.original.durations[8].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[13], {
    id: 'duration_13',
    size: 50,
    header: 'Validator_13',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[13] ? row.original.durations[13].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[71], {
    id: 'duration_71',
    size: 50,
    header: 'Validator_71',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[71] ? row.original.durations[71].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[120], {
    id: 'duration_120',
    size: 50,
    header: 'Validator_120',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[120] ? row.original.durations[120].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[181], {
    id: 'duration_181',
    size: 50,
    header: 'Validator_181',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[181] ? row.original.durations[181].toFixed(0) : '-',
  }),
  columnHelper.accessor(row => row.durations[224], {
    id: 'duration_224',
    size: 50,
    header: 'Validator_224',
    enableSorting: true,
    cell: ({ row }) => row.original.durations[224] ? row.original.durations[224].toFixed(0) : '-',
  }),
  columnHelper.accessor('duration_avg', {
    id: 'duration_avg',
    size: 150,
    header: 'Average duration',
    enableSorting: true,
    cell: ({ row }) => row.original.duration_avg ? row.original.duration_avg.toFixed(0) : '-',
  }),
];
