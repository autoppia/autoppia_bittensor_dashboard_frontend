'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { TableDataType } from '@/app/shared/table/table-data';

const columnHelper = createColumnHelper<TableDataType>();

export const minerScoreColumns = [
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
  columnHelper.accessor(row => row.scores[2], {
    id: 'score_2',
    size: 50,
    header: 'Validator_2',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[2] ? row.original.scores[2].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[3], {
    id: 'score_3',
    size: 50,
    header: 'Validator_3',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[3] ? row.original.scores[3].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[4], {
    id: 'score_4',
    size: 50,
    header: 'Validator_4',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[4] ? row.original.scores[4].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[8], {
    id: 'score_8',
    size: 50,
    header: 'Validator_8',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[8] ? row.original.scores[8].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[13], {
    id: 'score_13',
    size: 50,
    header: 'Validator_13',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[13] ? row.original.scores[13].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[71], {
    id: 'score_71',
    size: 50,
    header: 'Validator_71',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[71] ? row.original.scores[71].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[120], {
    id: 'score_120',
    size: 50,
    header: 'Validator_120',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[120] ? row.original.scores[120].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[181], {
    id: 'score_181',
    size: 50,
    header: 'Validator_181',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[181] ? row.original.scores[181].toFixed(3) : '-',
  }),
  columnHelper.accessor(row => row.scores[224], {
    id: 'score_224',
    size: 50,
    header: 'Validator_224',
    enableSorting: true,
    cell: ({ row }) => row.original.scores[224] ? row.original.scores[224].toFixed(3) : '-',
  }),
  columnHelper.accessor('score_avg', {
    id: 'score_avg',
    size: 250,
    header: 'Average Score',
    enableSorting: true,
    cell: ({ row }) => row.original.score_avg ? row.original.score_avg.toFixed(3) : '-',
  }),
];
