'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { MinerTimeTableDataType } from './table';

const columnHelper = createColumnHelper<MinerTimeTableDataType>();

export const minerTimeColumns = [
  columnHelper.accessor('uid', {
    id: 'uid',
    size: 40,
    header: 'UID',
    enableSorting: true,
    cell: ({ row }) => row.original.uid,
  }),
  columnHelper.accessor('hotkey', {
    id: 'hotkey',
    size: 100,
    header: 'Hotkey',
    enableSorting: false,
    cell: ({ row }) => (<div className='w-32 truncate'>{row.original.hotkey}</div>),
  }),
  columnHelper.accessor(row => row.scores[2], {
    id: 'score_2',
    size: 50,
    header: 'Validator_2',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[2]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[3], {
    id: 'score_3',
    size: 50,
    header: 'Validator_3',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[3]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[4], {
    id: 'score_4',
    size: 50,
    header: 'Validator_4',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[4]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[8], {
    id: 'score_8',
    size: 50,
    header: 'Validator_8',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[8]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[13], {
    id: 'score_13',
    size: 50,
    header: 'Validator_13',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[13]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[71], {
    id: 'score_71',
    size: 50,
    header: 'Validator_71',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[71]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[120], {
    id: 'score_120',
    size: 50,
    header: 'Validator_120',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[120]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[181], {
    id: 'score_181',
    size: 50,
    header: 'Validator_181',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[181]?.toFixed(3),
  }),
  columnHelper.accessor(row => row.scores[224], {
    id: 'score_224',
    size: 50,
    header: 'Validator_224',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[224]?.toFixed(3),
  }),
  columnHelper.accessor('average', {
    id: 'score_avg',
    size: 150,
    header: 'Average Score',
    enableSorting: true,
    cell: ({ row }) => row.original.average?.toFixed(3),
  }),
];
